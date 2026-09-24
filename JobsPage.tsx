import { useMemo, useRef, useState, useEffect } from 'react'
import { JOBS } from '../data/jobs'
import { INDUSTRIES } from '../data/options'
import type { Job, Profile, Application } from '../types'
import { useStore, daysBetween, today, uid } from '../store'
import { buildTimeline } from '../utils/timeline'

const STATUS_STYLE = {
  soon: 'bg-red-50 border-red-300 text-red-600',
  ongoing: 'bg-blue-50 border-blue-200 text-blue-600',
  past: 'bg-gray-50 border-gray-200 text-gray-400',
} as const

/** 多选下拉（含「不限」= 全部） */
function MultiSelect({ label, options, selected, onChange }: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (v: string) => {
    if (v === '不限') onChange(selected.includes('不限') ? [] : ['不限'])
    else {
      const rest = selected.filter((x) => x !== '不限')
      onChange(rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v])
    }
  }

  const text = !selected.length || selected.includes('不限') ? label : selected.join('/')

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="text-xs rounded-lg border border-gray-300 px-2 py-1.5 bg-white max-w-32 truncate">
        {label}：{text}{selected.length > 1 ? `(${selected.length})` : ''} ▾
      </button>
      {open && (
        <div className="absolute top-9 left-0 z-40 w-64 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <div className="flex flex-wrap gap-1.5">
            {options.map((o) => {
              const on = selected.includes(o)
              return (
                <button key={o} onClick={() => toggle(o)}
                  className={`tag !px-2.5 !py-1 border ${on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
                  {on ? '✓ ' : ''}{o}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobsPage({ profile, onDiagnose }: { profile: Profile; onDiagnose: (jd: Job) => void }) {
  const [industries, setIndustries] = useState<string[]>(['不限'])
  const [city, setCity] = useState('不限')
  const [type, setType] = useState('不限')
  const [q, setQ] = useState('')

  const [favJobs, setFavJobs] = useStore<string[]>('favJobs', [])
  const [calJobs, setCalJobs] = useStore<string[]>('calJobs', [])
  const [hiddenJobs, setHiddenJobs] = useStore<string[]>('hiddenJobs', [])
  const [apps, setApps] = useStore<Application[]>('apps', [])
  const [profileV] = useStore<Profile | null>('profile', profile)

  const timeline = useMemo(() => buildTimeline(profileV || profile), [profileV, profile])

  const filtered = JOBS.filter(
    (j) =>
      !hiddenJobs.includes(j.id) &&
      (!industries.length || industries.includes('不限') || industries.includes(j.track)) &&
      (city === '不限' || j.city === city) &&
      (type === '不限' || j.type === type) &&
      (!q || (j.company + j.title + j.tags.join()).includes(q)),
  )

  const appliedIds = new Set(apps.map((a) => a.jobId).filter(Boolean))

  const Sel = ({ label, options, cur, on }: { label: string; options: string[]; cur: string; on: (v: string) => void }) => (
    <select value={cur} onChange={(e) => on(e.target.value)} className="text-xs rounded-lg border-gray-300 border px-2 py-1.5 bg-white">
      <option value="不限">{label}·不限</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  )

  const markApplied = (j: Job) => {
    if (appliedIds.has(j.id)) return
    const app: Application = {
      id: uid(), jobId: j.id, company: j.company, title: j.title,
      status: '已投递', appliedAt: today(), deadline: j.deadline,
    }
    setApps([...apps, app])
  }

  return (
    <div className="pb-4">
      {/* DDL 时间线 */}
      <section className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="font-bold mb-2">未来 3 个月求职时间线</h2>
        <p className="text-xs text-gray-400 mb-3">红=7天内截止 蓝=进行中 灰=已过</p>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 min-w-max">
            {timeline.map((n, i) => (
              <div key={i} className={`w-44 shrink-0 rounded-xl border p-3 ${STATUS_STYLE[n.status]}`}>
                <div className="text-xs opacity-70">{n.date} · {n.status === 'past' ? '已过' : n.status === 'soon' ? '7天内' : '进行中'}</div>
                <div className="font-medium text-sm mt-1">{n.name}</div>
                <div className="text-xs mt-1 leading-4 opacity-80">{n.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 筛选栏 */}
      <section className="flex gap-2 px-4 py-3 items-center bg-white sticky top-0 z-30 border-b border-gray-100">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索公司/岗位" className="input !py-1.5 flex-1" />
        <MultiSelect label="行业" options={INDUSTRIES} selected={industries} onChange={setIndustries} />
        <Sel label="城市" options={['北京', '上海', '深圳', '广州', '杭州', '南京']} cur={city} on={setCity} />
        <Sel label="类型" options={['暑期实习', '日常实习', '校招', '兼职']} cur={type} on={setType} />
      </section>

      {/* 岗位卡片流 */}
      <section className="p-4 space-y-3">
        {filtered.map((j) => {
          const d = daysBetween(today(), j.deadline)
          const color = d < 0 ? 'text-gray-400' : d <= 7 ? 'text-red-600 font-medium' : 'text-blue-600'
          const applied = appliedIds.has(j.id)
          const fav = favJobs.includes(j.id)
          return (
            <div key={j.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{j.company} · {j.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {j.track} · {j.city} · {j.type} · <span className="text-orange-600 font-medium">{j.salary}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    ID {j.id} · {j.platform} · 发布 {j.publishDate} · <span className={color}>{d < 0 ? '已截止' : `截止 ${j.deadline}（${d}天）`}</span>
                  </div>
                </div>
                <button onClick={() => setFavJobs(fav ? favJobs.filter((x) => x !== j.id) : [...favJobs, j.id])}>
                  {fav ? '⭐' : '☆'}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-5"><b>岗位要求：</b>{j.requirement}</p>
              <p className="text-xs text-gray-600 mt-1 leading-5"><b>应聘流程：</b>{j.process}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {j.tags.map((t) => <span key={t} className="tag bg-blue-50 text-blue-600">{t}</span>)}
                {j.referral && <span className="tag bg-green-50 text-green-700">内推码 {j.referral}</span>}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                <a href={j.link} target="_blank" rel="noreferrer" className="btn-primary">去投递</a>
                <button onClick={() => markApplied(j)} disabled={applied}
                  className={applied ? 'btn-ghost !text-green-600' : 'btn-ghost'}>
                  {applied ? '✓ 已进看板' : '标记已投'}
                </button>
                <button onClick={() => onDiagnose(j)} className="btn-ghost">用这份JD诊断</button>
                <button onClick={() => setCalJobs(calJobs.includes(j.id) ? calJobs.filter((x) => x !== j.id) : [...calJobs, j.id])} className="btn-ghost">
                  {calJobs.includes(j.id) ? '✓ 已加日历' : '加入日历'}
                </button>
                <button onClick={() => setHiddenJobs([...hiddenJobs, j.id])} className="btn-ghost !text-gray-400">隐藏</button>
              </div>
            </div>
          )
        })}
        {!filtered.length && <div className="text-center text-sm text-gray-400 py-10">没有符合条件的岗位，换个筛选试试</div>}
      </section>
    </div>
  )
}
