import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { Profile, JobType } from '../types'

import { INDUSTRIES, POSITIONS } from '../data/options'

const ANY = '不限'

const GRADES = [ANY, '大一', '大二', '大三', '大四', '研一', '研二', '研三', '博士']
const TYPES: Array<JobType | '不限'> = [ANY, '暑期实习', '日常实习', '校招', '兼职']

// 城市：名称 / 全拼 / 首字母
const CITIES: [string, string, string][] = [
  ['北京', 'beijing', 'bj'], ['上海', 'shanghai', 'sh'], ['广州', 'guangzhou', 'gz'], ['深圳', 'shenzhen', 'sz'],
  ['杭州', 'hangzhou', 'hz'], ['成都', 'chengdu', 'cd'], ['南京', 'nanjing', 'nj'], ['武汉', 'wuhan', 'wh'],
  ['西安', 'xian', 'xa'], ['苏州', 'suzhou', 'sz'], ['长沙', 'changsha', 'cs'], ['重庆', 'chongqing', 'cq'],
  ['天津', 'tianjin', 'tj'], ['合肥', 'hefei', 'hf'], ['厦门', 'xiamen', 'xm'], ['青岛', 'qingdao', 'qd'],
  ['大连', 'dalian', 'dl'], ['济南', 'jinan', 'jn'], ['无锡', 'wuxi', 'wx'], ['佛山', 'foshan', 'fs'],
  ['东莞', 'dongguan', 'dg'], ['珠海', 'zhuhai', 'zh'], ['福州', 'fuzhou', 'fz'], ['郑州', 'zhengzhou', 'zz'],
  ['昆明', 'kunming', 'km'], ['沈阳', 'shenyang', 'sy'], ['哈尔滨', 'haerbin', 'heb'], ['长春', 'changchun', 'cc'],
  ['石家庄', 'shijiazhuang', 'sjz'], ['太原', 'taiyuan', 'ty'], ['南昌', 'nanchang', 'nc'], ['贵阳', 'guiyang', 'gy'],
  ['南宁', 'nanning', 'nn'], ['兰州', 'lanzhou', 'lz'], ['乌鲁木齐', 'wulumuqi', 'wlmq'], ['宁波', 'ningbo', 'nb'],
  ['温州', 'wenzhou', 'wz'], ['常州', 'changzhou', 'cz'], ['惠州', 'huizhou', 'hz'], ['中山', 'zhongshan', 'zs'],
  ['香港', 'xianggang', 'xg'], ['澳门', 'aomen', 'am'], ['台北', 'taibei', 'tb'],
]

const HOT_CITIES = ['不限', '北京', '上海', '广州', '深圳', '南京', '杭州', '武汉', '西安', '苏州']

function matchCity(q: string): string[] {
  const s = q.trim().toLowerCase()
  if (!s) return CITIES.map((c) => c[0])
  return CITIES
    .filter(([name, py, ini]) => name.includes(s) || py.includes(s) || ini === s || ini.startsWith(s) || py.startsWith(s))
    .map((c) => c[0])
}

/** 热门城市 chips + 展开按拼音首字母分组排序的完整列表 */
function CityPicker({ selected, onToggle, onAdd }: { selected: string[]; onToggle: (v: string) => void; onAdd: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [q, setQ] = useState('')

  // 按拼音首字母分组排序
  const groups = useMemo(() => {
    const matched = matchCity(q)
    const map = new Map<string, string[]>()
    const all = [...CITIES.map((c) => c[0]), ...selected.filter((s) => s !== '不限' && !CITIES.some((c) => c[0] === s))]
    for (const name of all) {
      if (q.trim() && !matched.includes(name) && !name.includes(q.trim())) continue
      const py = CITIES.find((c) => c[0] === name)?.[1] || name.toLowerCase()
      const letter = py[0].toUpperCase()
      if (!map.has(letter)) map.set(letter, [])
      map.get(letter)!.push(name)
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], 'en'))
  }, [q, selected])

  const Chip = ({ name }: { name: string }) => {
    const on = selected.includes(name)
    return (
      <button onClick={() => onToggle(name)}
        className={`tag !px-3 !py-1.5 border ${on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
        {on ? '✓ ' : ''}{name}
      </button>
    )
  }

  return (
    <div className="mb-5">
      <div className="text-sm font-medium text-gray-700 mb-2">
        目标城市（多选）{selected.length > 0 && <span className="text-blue-600 ml-1">已选 {selected.length} 项</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {HOT_CITIES.map((c) => <Chip key={c} name={c} />)}
        {/* 已选但不在热门列表的城市也展示出来 */}
        {selected.filter((c) => !HOT_CITIES.includes(c)).map((c) => <Chip key={c} name={c} />)}
        <button onClick={() => setExpanded(!expanded)}
          className="tag !px-3 !py-1.5 border border-dashed border-gray-400 text-gray-500">
          {expanded ? '收起 ▲' : '更多城市 ▼'}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 border border-gray-200 rounded-xl p-3 bg-white">
          <div className="relative mb-3">
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="搜索：中文 / 全拼 / 首字母，如 hz" className="input" />
            {q.trim() && !CITIES.some((c) => c[0] === q.trim()) && (
              <button onClick={() => { onAdd(q.trim()); setQ('') }}
                className="absolute right-2 top-2 text-xs text-blue-600">+ 添加「{q.trim()}」</button>
            )}
          </div>
          {groups.map(([letter, names]) => (
            <div key={letter} className="flex items-start mb-2">
              <span className="w-6 shrink-0 text-xs font-bold text-gray-400 pt-1.5">{letter}</span>
              <div className="flex flex-wrap gap-1.5">
                {names.map((n) => <Chip key={n} name={n} />)}
              </div>
            </div>
          ))}
          {!groups.length && <div className="text-xs text-gray-400">没有匹配城市，可直接添加</div>}
        </div>
      )}
    </div>
  )
}

/** 搜索 + 多选 chip 选择器 */
function SearchPicker({
  label, options, selected, onToggle, onAdd, placeholder, filter,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
  onAdd?: (v: string) => void
  placeholder: string
  filter?: (q: string) => string[]
}) {
  const [q, setQ] = useState('')
  const list = useMemo(() => {
    const base = filter ? filter(q) : options.filter((o) => o.includes(q.trim()))
    // 自定义/额外选项始终参与名称匹配
    const extras = filter ? options.filter((o) => !base.includes(o) && o.includes(q.trim())) : []
    return [...base, ...extras].slice(0, 40)
  }, [options, q, filter])

  return (
    <div className="mb-5">
      <div className="text-sm font-medium text-gray-700 mb-2">
        {label}
        {selected.length > 0 && <span className="text-blue-600 ml-1">已选 {selected.length} 项</span>}
      </div>
      <div className="relative">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="input mb-2" />
        {q.trim() && onAdd && !options.includes(q.trim()) && (
          <button onClick={() => { onAdd(q.trim()); setQ('') }}
            className="absolute right-2 top-2 text-xs text-blue-600">
            + 添加「{q.trim()}」
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((o) => {
          const on = selected.includes(o)
          return (
            <button key={o} onClick={() => onToggle(o)}
              className={`tag !px-3 !py-1.5 border ${on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {on ? '✓ ' : ''}{o}
            </button>
          )
        })}
        {!list.length && <span className="text-xs text-gray-400">没有匹配项{onAdd ? '，可手动添加' : ''}</span>}
      </div>
    </div>
  )
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [, setProfile] = useStore<Profile | null>('profile', null)
  const [form, setForm] = useState<Profile>({ grade: '不限', industry: ['不限'], position: ['不限'], city: ['不限'], jobType: '不限' })

  const toggle = (key: 'industry' | 'position' | 'city') => (v: string) => {
    const cur = form[key]
    if (v === ANY) {
      setForm({ ...form, [key]: cur.includes(ANY) ? [] : [ANY] })
    } else {
      const rest = cur.filter((x) => x !== ANY)
      setForm({ ...form, [key]: rest.includes(v) ? rest.filter((x) => x !== v) : [...rest, v] })
    }
  }

  const ok = form.grade && form.industry.length && form.position.length && form.city.length

  return (
    <div className="min-h-screen bg-gray-50 p-5 pt-12 pb-10">
      <h1 className="text-2xl font-bold mb-1">求职无忧</h1>
      <p className="text-sm text-gray-500 mb-8">花 1 分钟填写求职画像（均支持多选），为你生成专属求职时间线（仅存本地，无需登录）</p>

      <div className="mb-5">
        <div className="text-sm font-medium text-gray-700 mb-2">年级</div>
        <div className="flex flex-wrap gap-2">
          {GRADES.map((g) => (
            <button key={g} onClick={() => setForm({ ...form, grade: g })}
              className={`tag !px-3 !py-1.5 border ${form.grade === g ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>

      <SearchPicker label="目标行业（多选）" options={INDUSTRIES} selected={form.industry}
        onToggle={toggle('industry')} placeholder="搜索行业，如：金融、芯片" />

      <SearchPicker label="目标岗位（多选）" options={POSITIONS} selected={form.position}
        onToggle={toggle('position')} placeholder="搜索岗位，如：产品、算法" />

      <CityPicker selected={form.city} onToggle={toggle('city')}
        onAdd={(v) => toggle('city')(v)} />

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">求职类型</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setForm({ ...form, jobType: t })}
              className={`tag !px-3 !py-1.5 border ${form.jobType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <button disabled={!ok} onClick={() => { setProfile(form); onDone() }}
        className={`w-full py-3 rounded-xl font-medium text-white ${ok ? 'bg-blue-600 active:scale-95 transition-transform' : 'bg-gray-300'}`}>
        {ok ? '开始求职 →' : '行业/岗位/城市需至少一项（可选不限）'}
      </button>
    </div>
  )
}
