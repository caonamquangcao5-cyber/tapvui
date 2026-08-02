import db from '../config/db.js'
import { BADGES, POINT_RULES } from '../config/constants.js'

function awardBadge(studentId, badgeKey) {
  const badge = BADGES.find(b => b.key === badgeKey)
  if (!badge) return

  const existing = db.find('badges', b => b.student_id === studentId && b.badge_key === badgeKey)
  if (existing) return

  db.insert('badges', {
    student_id: studentId,
    badge_key: badge.key,
    badge_name: badge.name,
    badge_emoji: badge.emoji,
  })
}

function updateStreak(studentId) {
  const student = db.find('students', s => s.id === studentId)
  if (!student) return 0

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let newStreak = 1
  if (student.last_checkin === yesterday) {
    newStreak = (student.streak || 0) + 1
  } else if (student.last_checkin === today) {
    newStreak = student.streak || 1
  }

  db.update('students', s => s.id === studentId, {
    streak: newStreak,
    last_checkin: today,
  })

  if (newStreak >= 3) awardBadge(studentId, 'streak_3')
  if (newStreak >= 7) awardBadge(studentId, 'streak_7')
  if (newStreak >= 15) awardBadge(studentId, 'streak_15')
  if (newStreak >= 30) awardBadge(studentId, 'streak_30')

  return newStreak
}

export function checkin(req, res) {
  const { workoutId, mood, moodEmoji, completedTasks, postWorkoutFeeling } = req.body

  if (!workoutId || !mood) {
    return res.status(400).json({ error: 'Thiếu thông tin check-in' })
  }

  const workout = db.find('workouts', w => w.id === workoutId)
  if (!workout) {
    return res.status(404).json({ error: 'Không tìm thấy buổi tập' })
  }

  if (req.user.role === 'student') {
    const student = db.find('students', s => s.id === workout.student_id && s.user_id === req.user.id)
    if (!student) {
      return res.status(403).json({ error: 'Không có quyền' })
    }
  }

  const existing = db.find('checkins', c => c.workout_id === workoutId)
  if (existing) {
    return res.status(409).json({ error: 'Bạn đã check-in buổi tập này rồi' })
  }

  const tasks = workout.tasks
  const completed = Array.isArray(completedTasks) ? completedTasks : []
  const completedCount = completed.filter(t => t).length
  const allDone = completedCount === tasks.length

  let points = POINT_RULES.checkin
  points += completedCount * POINT_RULES.complete_task
  if (allDone) points += POINT_RULES.complete_all
  if (mood === 'chay') points += POINT_RULES.good_mood

  const newStreak = updateStreak(workout.student_id)
  if (newStreak === 3 || newStreak === 7 || newStreak === 15 || newStreak === 30) {
    points += POINT_RULES.streak_bonus
  }

  const result = db.insert('checkins', {
    workout_id: workoutId,
    student_id: workout.student_id,
    mood,
    mood_emoji: moodEmoji || '',
    completed_tasks: completed,
    points_earned: points,
    post_workout_feeling: postWorkoutFeeling || null,
    pt_reaction: null,
    pt_reaction_emoji: null,
    pt_comment: null,
  })

  const student = db.find('students', s => s.id === workout.student_id)
  db.update('students', s => s.id === workout.student_id, {
    total_points: (student.total_points || 0) + points,
  })

  db.update('workouts', w => w.id === workoutId, {
    status: allDone ? 'completed' : 'partial',
  })

  awardBadge(workout.student_id, 'first_workout')

  if (allDone) {
    const totalCompleted = db.count('checkins', c => c.student_id === workout.student_id && c.completed_tasks.some(t => t))
    if (totalCompleted >= 10) {
      awardBadge(workout.student_id, 'no_quit')
    }
  }

  if (mood === 'chay') {
    const chayCount = db.count('checkins', c => c.student_id === workout.student_id && c.mood === 'chay')
    if (chayCount >= 5) {
      awardBadge(workout.student_id, 'energy')
    }
  }

  const checkin = db.find('checkins', c => c.id === result.lastInsertRowid)
  const newBadges = db.findAll('badges', b => b.student_id === workout.student_id)
    .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))
    .slice(0, 5)

  res.json({ checkin, pointsEarned: points, newStreak, newBadges })
}

export function getCheckins(req, res) {
  const studentId = parseInt(req.params.studentId)

  const checkins = db.findAll('checkins', c => c.student_id === studentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(c => {
      const w = db.find('workouts', wo => wo.id === c.workout_id)
      return { ...c, workout_title: w?.title, workout_date: w?.date }
    })

  res.json({ checkins })
}

export function ptReaction(req, res) {
  const { checkinId, reaction, reactionEmoji, comment } = req.body

  if (!reaction) {
    return res.status(400).json({ error: 'Vui lòng chọn reaction' })
  }

  const checkin = db.find('checkins', c => c.id === checkinId)
  if (!checkin) {
    return res.status(404).json({ error: 'Không tìm thấy check-in' })
  }

  db.update('checkins', c => c.id === checkinId, {
    pt_reaction: reaction,
    pt_reaction_emoji: reactionEmoji || '',
    pt_comment: comment || '',
  })

  res.json({ success: true })
}
