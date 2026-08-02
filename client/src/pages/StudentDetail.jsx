import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api.js'
import Avatar, { getGenderStyle } from '../components/Avatar.jsx'

export default function StudentDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [constants, setConstants] = useState({ ptReactions: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [showCreateWorkout, setShowCreateWorkout] = useState(false)
  const [workoutForm, setWorkoutForm] = useState({ title: '', date: new Date().toISOString().split('T')[0], tasks: [''] })
  const [reactionForm, setReactionForm] = useState({})

  const load = useCallback(async () => {
    try {
      const [detail, constData] = await Promise.all([
        api.getStudentDetail(id),
        api.getConstants(),
      ])
      setData(detail)
      setConstants(constData)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleCreateWorkout(e) {
    e.preventDefault()
    setError('')
    const tasks = workoutForm.tasks.filter(t => t.trim())
    if (!workoutForm.title || tasks.length === 0) {
      setError('Vui lòng điền tên buổi tập và ít nhất 1 bài tập')
      return
    }
    try {
      await api.createWorkout({
        studentId: parseInt(id),
        title: workoutForm.title,
        date: workoutForm.date,
        tasks,
      })
      setWorkoutForm({ title: '', date: new Date().toISOString().split('T')[0], tasks: [''] })
      setShowCreateWorkout(false)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReaction(checkinId) {
    const r = reactionForm[checkinId]
    if (!r) return
    try {
      await api.ptReaction({
        checkinId,
        reaction: r.reaction,
        reactionEmoji: r.emoji,
        comment: r.comment || '',
      })
      setReactionForm(prev => ({ ...prev, [checkinId]: undefined }))
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Đang tải... ⏳</div>
  if (error && !data) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>

  const { student, workouts, badges, checkins } = data

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto pb-20">
      <Link to="/pt" className="text-gray-400 hover:text-primary text-sm mb-4 inline-block">← Quay lại danh sách</Link>

      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} avatar={student.avatar} gender={student.gender} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-700">{student.name}</h1>
              {(() => { const gs = getGenderStyle(student.gender); return gs.label && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${gs.badge}`}>{gs.icon} {gs.label}</span> })()}
            </div>
            {student.nickname && <p className="text-sm text-accent">"{student.nickname}"</p>}
            {student.notes && <p className="text-xs text-gray-400 mt-1">{student.notes}</p>}
            {student.age && <p className="text-xs text-gray-400 mt-1">🎂 {student.age} tuổi{student.weight ? ` • ⚖️ ${student.weight}kg` : ''}{student.height ? ` • 📏 ${student.height}cm` : ''}</p>}
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <span className="bg-soft px-3 py-1 rounded-full text-sm text-primary font-semibold">🔥 {student.total_points} điểm</span>
          <span className="bg-mint px-3 py-1 rounded-full text-sm text-secondary font-semibold">⚡ {student.streak || 0} ngày</span>
          <span className="bg-lavender px-3 py-1 rounded-full text-sm text-accent font-semibold">📅 {checkins.length} buổi</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">⚔️ Buổi tập</h2>
        <button onClick={() => setShowCreateWorkout(!showCreateWorkout)} className="btn-primary text-sm py-2 px-4">
          {showCreateWorkout ? 'Đóng' : '+ Tạo buổi tập 🎯'}
        </button>
      </div>

      {showCreateWorkout && (
        <form onSubmit={handleCreateWorkout} className="card mb-4 space-y-3 animate-pop">
          <input type="text" placeholder="Tên buổi tập (vd: Leg Day, Cardio...)" value={workoutForm.title}
            onChange={e => setWorkoutForm({ ...workoutForm, title: e.target.value })} className="input-field" required />
          <input type="date" value={workoutForm.date}
            onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })} className="input-field" required />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Các bài tập:</label>
            {workoutForm.tasks.map((task, i) => (
              <div key={i} className="flex gap-2">
                <input type="text" placeholder={`Bài tập ${i + 1}`} value={task}
                  onChange={e => setWorkoutForm(prev => ({ ...prev, tasks: prev.tasks.map((t, idx) => idx === i ? e.target.value : t) }))}
                  className="input-field flex-1" />
                {workoutForm.tasks.length > 1 && (
                  <button type="button" onClick={() => setWorkoutForm(prev => ({ ...prev, tasks: prev.tasks.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setWorkoutForm(prev => ({ ...prev, tasks: [...prev.tasks, ''] }))}
              className="text-secondary font-semibold text-sm">+ Thêm bài tập</button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-secondary w-full">Tạo buổi tập 🎯</button>
        </form>
      )}

      {workouts.length === 0 ? (
        <div className="card text-center py-8 mb-4 bg-gradient-to-br from-soft to-lavender">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-500 text-sm">Chưa có buổi tập nào. Tạo buổi tập đầu tiên cho học viên!</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {workouts.map(w => (
            <div key={w.id} className="card py-3 px-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-700">{w.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  w.status === 'completed' ? 'bg-mint text-secondary' :
                  w.status === 'partial' ? 'bg-soft text-primary' : 'bg-gray-100 text-gray-400'
                }`}>
                  {w.status === 'completed' ? 'Hoàn thành ✅' : w.status === 'partial' ? 'Một phần 🔄' : 'Chưa tập ⏳'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-2">{w.date}</p>
              <div className="text-sm text-gray-500">
                {w.tasks.map((t, i) => <span key={i} className="inline-block bg-gray-50 px-2 py-0.5 rounded mr-1 mb-1">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {badges.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold text-gray-700 mb-3">🏆 Huy hiệu của học viên</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <div key={b.id} className="bg-lavender px-3 py-2 rounded-2xl text-sm font-semibold text-accent">
                {b.badge_emoji} {b.badge_name}
              </div>
            ))}
          </div>
        </div>
      )}

      {checkins.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mb-2">📅 Lịch sử check-in</h3>
          <div className="space-y-3">
            {checkins.map(c => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.mood_emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-700 text-sm">{c.workout_title}</p>
                      <p className="text-xs text-gray-400">{c.workout_date}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-soft text-primary px-2 py-0.5 rounded-full font-semibold">+{c.points_earned} 🔥</span>
                </div>

                {c.post_workout_feeling && (
                  <p className="text-sm text-gray-500 mb-2">
                    Cảm nhận: {(() => {
                      const f = constants.postFeelings?.find(x => x.key === c.post_workout_feeling)
                      return f ? `${f.emoji} ${f.label}` : c.post_workout_feeling
                    })()}
                  </p>
                )}

                {c.pt_reaction ? (
                  <div className="bg-lavender rounded-xl p-3">
                    <p className="text-sm font-semibold text-accent">{c.pt_reaction_emoji} {c.pt_reaction}</p>
                    {c.pt_comment && <p className="text-gray-600 text-sm mt-1">"{c.pt_comment}"</p>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Chưa có phản hồi từ PT</p>
                    <div className="flex flex-wrap gap-1">
                      {constants.ptReactions?.map(r => (
                        <button
                          key={r.key}
                          onClick={() => setReactionForm(prev => ({ ...prev, [c.id]: { ...prev[c.id], reaction: r.key, emoji: r.emoji } }))}
                          className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                            reactionForm[c.id]?.reaction === r.key ? 'bg-accent text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                          }`}
                        >{r.emoji} {r.label}</button>
                      ))}
                    </div>
                    {reactionForm[c.id]?.reaction && (
                      <div className="flex gap-2 animate-pop">
                        <input
                          type="text"
                          placeholder="Lời nhắn (tùy chọn)"
                          value={reactionForm[c.id]?.comment || ''}
                          onChange={e => setReactionForm(prev => ({ ...prev, [c.id]: { ...prev[c.id], comment: e.target.value } }))}
                          className="input-field flex-1 text-sm py-2"
                        />
                        <button onClick={() => handleReaction(c.id)} className="btn-accent text-sm py-2 px-4">Gửi 📨</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
    </div>
  )
}
