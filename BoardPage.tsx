import { useState } from 'react'
import type { Application, AppStatus } from '../types'
import { APP_STATUSES, migrateStatus } from '../types'
import { useStore, uid, today } from '../store'

const STATUS_COLOR: Record<AppStatus, string> = {
  待投递: 'bg-gray-100 text-gray-600', 已投递: 'bg-blue-100 text-blue-700',
  待测评: 'bg-purple-100 text-purple-700', 已测评: 'bg-purple-50 text-purple-600',
  待AI面: 'bg-cyan-100 text-cyan-700', 待面试: 'bg-amber-100 text-amber-700',
  待Offer: 'bg-orange-100 text-orange-700', 已Offer: 'bg-green-100 text-green-700',
  已拒: 'bg-red-100 text-red-600', 流程结束: 'bg-gray-200 text-gray-500',
}

export default function BoardPage() {
  const [appsRaw, setApps] = useStore<Application[]>('apps', [])
  // 旧六态状态自动迁移为新十态
  const apps = appsRaw.map((a) => ({ ...a, status: migrateStatus(a.status) }))
  const [view, setView] = useState<'list' | 'board'>('list')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ company: '', title: '', appliedAt: today(), nextStep: '', nextStepDate: '', note: '', resumeVersion: '' })

  const update = (id: string, patch: Partial<Application>) =>
    setApps(apps.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const cycleStatus = (a: Application) => {
    const i = APP_STATUSES.indexOf(a.status)
    return APP_STATUSES[(i + 1) % APP_STATUSES.length]
  }

  const add = () => {
    if (!form.company || !form.title) return alert('公司和岗位必填')
    setApps([...apps, { id: uid(), status: '已投递', ...form }])
    setAdding(false)
    setForm({ company: '', title: '', appliedAt: today(), nextStep: '', nextStepDate: '', note: '', resumeVersion: '' })
  }

  const Card = ({ a }: { a: Application }) => (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-sm">{a.company} · {a.title}</div>
          <div className="text-xs text-gray-500 mt-0.5">投递：{a.appliedAt}{a.deadline ? ` · 截止 ${a.deadline}` : ''}</div>
          {a.nextStep && <div className="text-xs text-gray-500">下一步：{a.nextStep}{a.nextStepDate ? `（${a.nextStepDate}）` : ''}</div>}
          {a.resumeVersion && <div className="text-xs text-gray-500">简历版本：{a.resumeVersion}</div>}
        </div>
        <button onClick={() => update(a.id, { status: cycleStatus(a) })}
          className={`tag ${STATUS_COLOR[a.status]}`}>{a.status} ⇄</button>
      </div>
      {a.note && <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2">备注：{a.note}</p>}
      {a.review && <p className="text-xs text-gray-600 mt-1 bg-amber-50 rounded p-2">复盘：{a.review}</p>}
      <div className="flex gap-2 mt-3 flex-wrap">
        <button className="btn-ghost !py-1 text-xs" onClick={() => {
          const ns = prompt('下一步是什么？（如：一面 / 笔试）', a.nextStep || '')
          if (ns !== null) {
            const nd = prompt('下一步日期（yyyy-MM-dd，可留空）', a.nextStepDate || '') || ''
            update(a.id, { nextStep: ns, nextStepDate: nd })
          }
        }}>设下一步</button>
        <button className="btn-ghost !py-1 text-xs" onClick={() => {
          const r = prompt('写复盘：这次流程学到/踩坑了什么？', a.review || '')
          if (r !== null) update(a.id, { review: r })
        }}>写复盘</button>
        <button className="btn-ghost !py-1 text-xs" onClick={() => {
          const n = prompt('备注', a.note || '')
          if (n !== null) update(a.id, { note: n })
        }}>备注</button>
        <button className="btn-ghost !py-1 text-xs !text-red-500" onClick={() => {
          if (confirm('删除这条投递记录？')) setApps(apps.filter((x) => x.id !== a.id))
        }}>删除</button>
      </div>
    </div>
  )

  return (
    <div className="p-4 pb-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">投递看板（{apps.length}）</h2>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`tag !px-3 !py-1 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>列表</button>
          <button onClick={() => setView('board')} className={`tag !px-3 !py-1 ${view === 'board' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>看板</button>
        </div>
      </div>

      <button onClick={() => setAdding(!adding)} className="btn-primary w-full mb-3">+ 手动添加记录</button>

      {adding && (
        <div className="card space-y-2 mb-4">
          <input className="input" placeholder="公司 *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <input className="input" placeholder="岗位 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" type="date" value={form.appliedAt} onChange={(e) => setForm({ ...form, appliedAt: e.target.value })} />
          <input className="input" placeholder="下一步（如 一面）" value={form.nextStep} onChange={(e) => setForm({ ...form, nextStep: e.target.value })} />
          <input className="input" type="date" value={form.nextStepDate} onChange={(e) => setForm({ ...form, nextStepDate: e.target.value })} />
          <input className="input" placeholder="使用的简历版本（如 v2-前端向）" value={form.resumeVersion} onChange={(e) => setForm({ ...form, resumeVersion: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={add}>保存</button>
            <button className="btn-ghost flex-1" onClick={() => setAdding(false)}>取消</button>
          </div>
        </div>
      )}

      {!apps.length && <div className="text-center text-sm text-gray-400 py-10">还没有记录，去「机会」页标记已投，或手动添加</div>}

      {view === 'list' ? (
        <div className="space-y-3">{apps.map((a) => <Card key={a.id} a={a} />)}</div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 min-w-max">
            {APP_STATUSES.map((s) => (
              <div key={s} className="w-48 shrink-0">
                <div className={`tag ${STATUS_COLOR[s]} mb-2 !px-3`}>{s}（{apps.filter((a) => a.status === s).length}）</div>
                <div className="space-y-3">
                  {apps.filter((a) => a.status === s).map((a) => (
                    <div key={a.id} className="card !p-3">
                      <div className="font-medium text-sm">{a.company}</div>
                      <div className="text-xs text-gray-500">{a.title}</div>
                      <button onClick={() => update(a.id, { status: cycleStatus(a) })} className="text-xs text-blue-600 mt-2">切换状态 →</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
