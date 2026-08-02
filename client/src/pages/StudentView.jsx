import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Avatar, { getGenderStyle } from '../components/Avatar.jsx'

export default function StudentView() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [pt, setPt] = useState(null)
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [existingCheckin, setExistingCheckin] = useState(null)
  const [constants, setConstants] = useState({ moods: [], postFeelings: [], postWorkoutLabels: [], badges: [] })
  const [checkins, setCheckins] = useState([])
  const [badges, setBadges] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [selectedMood, setSelectedMood] = useState(null)
  const [completedTasks, setCompletedTasks] = useState([])
  const [postFeeling, setPostFeeling] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [checkinResult, setCheckinResult] = useState(null)

  const loadData = useCallback(async () => {
    try {
      const [profileData, constData] = await Promise.all([
        api.getMyProfile(),
        api.getConstants(),
      ])
      setProfile(profileData.student)
      setPt(profileData.pt)
      setConstants(constData)

      if (profileData.student) {
        const [todayData, checkinData] = await Promise.all([
          api.getTodayWorkout(profileData.student.id),
          api.getCheckins(profileData.student.id),
        ])
        setTodayWorkout(todayData.workout)
        setExistingCheckin(todayData.checkin)
        setCheckins(checkinData.checkins)

        if (todayData.workout) {
          setCompletedTasks(new Array(todayData.workout.tasks.length).fill(false))
        }
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  async function handleCheckin() {
    setError('')
    try {
      const data = await api.checkin({
        workoutId: todayWorkout.id,
        mood: selectedMood.key,
        moodEmoji: selectedMood.emoji,
        completedTasks,
        postWorkoutFeeling: postFeeling?.key,
      })
      setCheckinResult(data)
      setShowCelebration(true)
      setExistingCheckin(data.checkin)
      setTimeout(() => setShowCelebration(false), 4000)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Đang tải... ⏳</div>

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-3">🤔</div>
          <p className="text-gray-600 mb-4">Bạn chưa được PT thêm vào danh sách. Hãy liên hệ PT để được thêm nhé!</p>
          <button onClick={logout} className="btn-primary">Đăng xuất</button>
        </div>
      </div>
    )
  }

  const allDone = completedTasks.length > 0 && completedTasks.every(t => t)
  const canCheckin = selectedMood && todayWorkout && !existingCheckin

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-pop">
          <div className="card text-center max-w-sm mx-4 animate-pop">
            <div className="text-7xl mb-3 animate-bounce-slow">🎉</div>
            <h2 className="text-2xl font-extrabold text-primary mb-2">Check-in thành công!</h2>
            <p className="text-lg text-secondary font-bold">+{checkinResult?.pointsEarned} điểm cháy 🔥</p>
            {checkinResult?.newStreak > 1 && <p className="text-accent font-semibold mt-1">Streak {checkinResult.newStreak} ngày! ⚡</p>}
            {checkinResult?.newBadges?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Badge mới!</p>
                {checkinResult.newBadges.slice(0, 3).map(b => (
                  <div key={b.id} className="inline-block mx-1 bg-lavender px-3 py-1 rounded-full text-sm font-semibold text-accent">
                    {b.badge_emoji} {b.badge_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={profile.name || user?.name} avatar={profile.avatar} gender={profile.gender} size="lg" />
          <div>
            <h1 className="text-xl font-extrabold text-gray-700">{profile.name || user?.name}</h1>
            {pt ? (
              <div className="flex items-center gap-2 mt-1.5 bg-gray-50 rounded-xl px-2 py-1.5">
                <Avatar name={pt.name} avatar={pt.avatar} gender="neutral" size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-600">PT {pt.name}</p>
                  <p className="text-xs text-gray-400">{pt.phone}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-1">Chưa có PT</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/settings" className="text-gray-400 hover:text-primary font-medium text-sm">⚙️ Cài đặt</Link>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 font-medium text-sm">Đăng xuất</button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="stat-card">
          <p className="text-2xl font-extrabold text-primary">{profile.total_points}</p>
          <p className="text-xs text-gray-400 mt-0.5">Điểm cháy 🔥</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-extrabold text-secondary">{profile.streak || 0}</p>
          <p className="text-xs text-gray-400 mt-0.5">Streak ⚡</p>
        </div>
        <div className="stat-card">
          <p className="text-2xl font-extrabold text-accent">{checkins.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">Buổi tập 📅</p>
        </div>
      </div>

      {!todayWorkout ? (
        <div className="card text-center py-12 mb-4 bg-gradient-to-br from-soft to-lavender">
          <div className="text-6xl mb-3 animate-float">🌴</div>
          <p className="text-gray-600 font-medium">Hôm nay chưa có bài tập!</p>
          <p className="text-gray-400 text-sm mt-1">Nghỉ ngơi cũng là tập! Mai lại cháy nhé 😴💤</p>
        </div>
      ) : existingCheckin ? (
        <div className="card mb-4 bg-gradient-to-br from-mint to-white">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl animate-bounce-slow">{existingCheckin.mood_emoji}</span>
            <div>
              <h2 className="font-bold text-gray-700 text-lg">⚔️ {todayWorkout.title}</h2>
              <p className="text-sm text-secondary font-medium">Đã check-in rồi! Quá giỏi 👏</p>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {todayWorkout.tasks.map((task, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-xl ${existingCheckin.completed_tasks?.[i] ? 'bg-mint' : 'bg-gray-50'}`}>
                <span className="text-lg">{existingCheckin.completed_tasks?.[i] ? '✅' : '⬜'}</span>
                <span className="text-gray-600">{task}</span>
              </div>
            ))}
          </div>

          {existingCheckin.pt_reaction && (
            <div className="bg-lavender rounded-2xl p-4 mt-3 border-2 border-accent/20">
              <p className="text-sm text-accent font-bold mb-1">💬 PT nói gì về bạn:</p>
              <p className="text-lg font-medium">{existingCheckin.pt_reaction_emoji} {existingCheckin.pt_reaction}</p>
              {existingCheckin.pt_comment && <p className="text-gray-600 mt-1 italic">"{existingCheckin.pt_comment}"</p>}
            </div>
          )}
        </div>
      ) : (
        <div className="card mb-4">
          <h2 className="font-bold text-lg text-gray-700 mb-1">⚔️ Nhiệm vụ: {todayWorkout.title}</h2>
          <p className="text-sm text-gray-400 mb-4">Chọn tâm trạng hôm nay nào! 🎭</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {constants.moods?.map(mood => (
              <button
                key={mood.key}
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-2xl text-left transition-all ${selectedMood?.key === mood.key ? 'bg-primary text-white shadow-lg scale-105' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <span className="text-2xl block mb-1">{mood.emoji}</span>
                <span className="text-sm font-semibold block">{mood.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="bg-soft rounded-2xl p-3 mb-4 text-center animate-pop">
              <p className="text-primary font-medium">{selectedMood.message}</p>
            </div>
          )}

          <h3 className="font-semibold text-gray-600 mb-2">🎯 Nhiệm vụ hôm nay:</h3>
          <div className="space-y-2 mb-4">
            {todayWorkout.tasks.map((task, i) => (
              <button
                key={i}
                onClick={() => setCompletedTasks(prev => prev.map((v, idx) => idx === i ? !v : v))}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${completedTasks[i] ? 'bg-mint border-2 border-secondary' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'}`}
              >
                <span className="text-xl">{completedTasks[i] ? '✅' : '⬜'}</span>
                <span className={`text-left ${completedTasks[i] ? 'text-secondary font-semibold' : 'text-gray-600'}`}>{task}</span>
              </button>
            ))}
          </div>

          <h3 className="font-semibold text-gray-600 mb-2">🤗 Sau buổi tập, bạn cảm thấy:</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {constants.postFeelings?.map(f => (
              <button
                key={f.key}
                onClick={() => setPostFeeling(f)}
                className={`p-2 rounded-xl text-sm font-medium transition-all ${postFeeling?.key === f.key ? 'bg-accent text-white shadow' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
          <button
            onClick={handleCheckin}
            disabled={!canCheckin}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${canCheckin ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            {allDone ? '🎉 Hoàn thành tất cả! Check-in!' : '🚀 Check-in ngay!'}
          </button>
        </div>
      )}

      {badges.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-3">🏆 Bộ sưu tập huy hiệu</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <div key={b.id} className="bg-lavender px-3 py-2 rounded-2xl text-sm font-semibold text-accent animate-wiggle-hover">
                {b.badge_emoji} {b.badge_name}
              </div>
            ))}
          </div>
        </div>
      )}

      {checkins.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">📅 Hành trình tập luyện</h3>
          <div className="space-y-2">
            {checkins.slice(0, 10).map(c => (
              <div key={c.id} className="card py-3 px-4 hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.mood_emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">⚔️ {c.workout_title}</p>
                      <p className="text-xs text-gray-400">{c.workout_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="fun-badge bg-soft text-primary">+{c.points_earned} 🔥</span>
                    {c.pt_reaction_emoji && <span className="text-xl animate-bounce-slow">{c.pt_reaction_emoji}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
