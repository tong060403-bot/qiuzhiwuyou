import { useStore, daysBetween, today } from '../store'
import { migrateStatus } from '../types'
import { JOBS } from '../data/jobs'

export default function ReminderBar() {
  const [appsRaw] = useStore<any[]>('apps', [])
  const apps = appsRaw.map((a) => ({ ...a, status: migrateStatus(a.status) }))
  const [favJobs] = useStore<string[]>('favJobs', [])
  const [hiddenRemind] = useStore<string[]>('hiddenReminders', [])
  const tips: string[] = []
  const t = today()

  for (const a of apps) {
    if (a.nextStepDate) {
      const d = daysBetween(t, a.nextStepDate)
      if (d === 1 && a.status === '待面试') tips.push(`【明天面试】${a.company}·${a.title}，记得准备复盘`)
      if (d === 0 && (a.status === '待测评' || a.status === '待AI面')) tips.push(`【今天测评】${a.company}·${a.title}，提前调试设备`)
    }
    if (a.status === '已投递' && daysBetween(a.appliedAt, t) >= 7) {
      tips.push(`【7天无反馈】${a.company}·${a.title}，可发邮件跟进或并行投递其他机会`)
    }
  }
  for (const id of favJobs) {
    const j = JOBS.find((x) => x.id === id)
    if (!j) continue
    const d = daysBetween(t, j.deadline)
    if (d === 0) tips.push(`【今天截止】${j.company}·${j.title}，抓紧投递！`)
    else if (d > 0 && d <= 3) tips.push(`【${d}天后截止】${j.company}·${j.title}`)
  }

  const visible = tips.filter((_, i) => !hiddenRemind.includes(String(i)))

  if (!visible.length) return null
  const dismiss = () => {
    // 简化：提醒按当天重算，刷新后仍会显示；隐藏全部当天提醒
    const until = today()
    const cur: any[] = loadDismissed()
    if (!cur.includes(until)) localStorage.setItem('qzw_remindDismiss', JSON.stringify([...cur, until]))
    window.dispatchEvent(new Event('store-change'))
  }
  const loadDismissed = (): string[] => {
    try { return JSON.parse(localStorage.getItem('qzw_remindDismiss') || '[]') } catch { return [] }
  }
  if (loadDismissed().includes(t)) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-amber-800 leading-5">
          <span className="font-bold">今日提醒</span>
          {visible.map((tip, i) => <div key={i}>· {tip}</div>)}
        </div>
        <button onClick={dismiss} className="text-xs text-amber-600 shrink-0 pt-0.5">今日不再提示</button>
      </div>
    </div>
  )
}
