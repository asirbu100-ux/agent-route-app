import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get all agent stats with profiles
  const { data: stats } = await supabase
    .from('agent_stats')
    .select('agent_id, total_visits, total_sold, total_refused, streak_days, best_streak, points, profiles!inner(full_name)')
    .order('points', { ascending: false })

  const leaderboard = (stats ?? []).map((s, i) => {
    const profile = (Array.isArray(s.profiles) ? s.profiles[0] : s.profiles) as { full_name: string } | null
    return {
      rank: i + 1,
      name: profile?.full_name ?? '—',
      points: s.points,
      visits: s.total_visits,
      sold: s.total_sold,
      streak: s.streak_days,
      bestStreak: s.best_streak,
      isMe: s.agent_id === user.id,
    }
  })

  const me = leaderboard.find(l => l.isMe)

  // Badges
  const badges = []
  if (me) {
    if (me.streak >= 5) badges.push({ emoji: '🔥', label: `${me.streak} дней подряд` })
    if (me.sold >= 100) badges.push({ emoji: '💎', label: '100+ продаж' })
    if (me.sold >= 50) badges.push({ emoji: '⭐', label: '50+ продаж' })
    if (me.visits >= 50) badges.push({ emoji: '🏃', label: '50+ визитов' })
    if (me.bestStreak >= 10) badges.push({ emoji: '🏆', label: `Рекорд: ${me.bestStreak} дней` })
    if (badges.length === 0) badges.push({ emoji: '🌱', label: 'Новичок' })
  }

  return (
    <div className="p-4">
      <Link href="/tasks" className="text-sm font-bold text-blue-600 mb-3 inline-block">&larr; Назад</Link>

      {/* My stats */}
      {me && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 mb-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold uppercase opacity-70">Мой рейтинг</p>
              <p className="text-4xl font-black">#{me.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black">{me.points}</p>
              <p className="text-xs font-bold uppercase opacity-70">очков</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span>{me.visits} визитов</span>
            <span>{me.sold} продаж</span>
            <span>🔥 {me.streak} дней</span>
          </div>
        </div>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Достижения</p>
          <div className="flex gap-2 flex-wrap">
            {badges.map((b, i) => (
              <span key={i} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl px-3 py-1.5 text-sm font-bold">
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Рейтинг агентов</p>
      <div className="space-y-2">
        {leaderboard.map(agent => (
          <div key={agent.rank} className={`flex items-center gap-3 rounded-2xl border-2 p-3 ${
            agent.isMe ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
              agent.rank === 1 ? 'bg-yellow-400 text-yellow-900'
              : agent.rank === 2 ? 'bg-gray-300 text-gray-700'
              : agent.rank === 3 ? 'bg-orange-300 text-orange-800'
              : 'bg-gray-100 text-gray-500'
            }`}>
              {agent.rank <= 3 ? ['🥇', '🥈', '🥉'][agent.rank - 1] : agent.rank}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{agent.name} {agent.isMe && <span className="text-xs text-blue-600">(вы)</span>}</p>
              <p className="text-xs text-gray-500">{agent.visits} виз. · {agent.sold} прод. · 🔥{agent.streak}</p>
            </div>
            <span className="font-black text-lg text-gray-900">{agent.points}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
