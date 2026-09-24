import { useMemo, useState } from 'react'
import { INTERVIEW_EXPS } from '../data/interviews'
import type { InterviewExp } from '../types'

// 真实「全网搜索」API 占位：接入后端后替换此函数
async function apiSearchInterviews(q: string): Promise<InterviewExp[]> {
  // return fetch(`/api/interviews?q=${encodeURIComponent(q)}`).then(r => r.json())
  await new Promise((r) => setTimeout(r, 1000))
  return INTERVIEW_EXPS
}

export default function InterviewPage() {
  const [q, setQ] = useState('')
  const [company, setCompany] = useState('全部')
  const [type, setType] = useState('不限')
  const [searching, setSearching] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const companies = useMemo(() => ['全部', ...new Set(INTERVIEW_EXPS.map((e) => e.company))], [])

  const list = INTERVIEW_EXPS.filter(
    (e) =>
      (company === '全部' || e.company === company) &&
      (type === '不限' || e.type === type) &&
      (!q.trim() || (e.company + e.position + e.round + e.content + e.tags.join()).includes(q.trim())),
  )

  const search = async () => {
    setSearching(true)
    await apiSearchInterviews(q)
    setSearching(false)
  }

  return (
    <div className="p-4 pb-6">
      <div className="flex justify-between items-center mb-1">
        <h2 className="font-bold text-lg">面试经验</h2>
        <span className="text-xs text-gray-400">共 {list.length} 条 · 数据来源公开社区</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">看目标公司过来人的真实面经，少走弯路</p>

      <div className="flex gap-2 mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索公司/岗位/轮次，如：群面、SQL"
          className="input !py-2 flex-1" />
        <button onClick={search} disabled={searching} className="btn-primary shrink-0">
          {searching ? '搜索中…' : '全网搜索'}
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {companies.map((c) => (
          <button key={c} onClick={() => setCompany(c)}
            className={`tag !px-3 !py-1.5 shrink-0 border ${company === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
            {c}
          </button>
        ))}
        <select value={type} onChange={(e) => setType(e.target.value)}
          className="text-xs rounded-lg border border-gray-300 px-2 bg-white shrink-0">
          {['不限', '暑期实习', '日常实习', '校招'].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {list.map((e) => (
          <div key={e.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-sm">{e.company} · {e.position}</div>
                <div className="text-xs text-gray-500 mt-0.5">{e.round} · {e.type} · {e.date} · 来自{e.source}</div>
              </div>
              <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                className="text-xs text-blue-600 shrink-0">{expanded === e.id ? '收起' : '展开'}</button>
            </div>
            <p className={`text-xs text-gray-600 mt-2 leading-5 ${expanded === e.id ? '' : 'line-clamp-2'}`}>{e.content}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {e.tags.map((t) => <span key={t} className="tag bg-blue-50 text-blue-600">{t}</span>)}
            </div>
          </div>
        ))}
        {!list.length && (
          <div className="text-center text-sm text-gray-400 py-10">
            没有匹配的面经，换个关键词试试<br />
            <span className="text-xs">（全网搜索接入真实数据源后可覆盖更多公司）</span>
          </div>
        )}
      </div>
    </div>
  )
}
