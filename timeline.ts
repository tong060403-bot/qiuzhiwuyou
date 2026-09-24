import type { Profile } from '../types'
import { daysBetween, today, toLocalDate } from '../store'

export interface TimelineNode {
  name: string
  date: string // yyyy-MM-dd
  desc: string
  status: 'past' | 'soon' | 'ongoing'
}

function offset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

const BASE_NODES: Array<Omit<TimelineNode, 'status'>> = [
  { name: '暑期实习网申高峰', date: offset(-20), desc: '大厂暑期实习集中开放，越早投递越好' },
  { name: '秋招提前批', date: offset(-5), desc: '提前批不占正式批机会，务必投' },
  { name: '日常实习（滚动）', date: offset(2), desc: '日常实习全年滚动招聘，随时可投' },
  { name: '秋招正式批开启', date: offset(14), desc: '正式批网申+笔试高峰期' },
  { name: '秋招笔试/面试季', date: offset(45), desc: '多线程跟进各家流程' },
  { name: '春招补充批', date: offset(88), desc: '秋招失利的补录机会' },
]

export function buildTimeline(profile: Profile): TimelineNode[] {
  const t = today()
  const pick = (arr: string[], fallback: string) => arr.find((x) => x !== '不限') || fallback
  const industry = pick(profile.industry, '目标行业')
  const position = pick(profile.position, '目标岗位')
  const city = pick(profile.city, '目标城市')
  const nodes = [...BASE_NODES]
  if (profile.jobType === '暑期实习') {
    nodes.splice(1, 0, { name: `${industry}暑期实习批`, date: offset(6), desc: `面向${profile.grade}的${industry}暑期实习` })
  }
  if (profile.jobType === '校招') {
    nodes.splice(2, 0, { name: `${position}校招专场`, date: offset(20), desc: `${city}地区${position}岗位集中网申` })
  }
  return nodes
    .map((n) => {
      const d = daysBetween(t, n.date)
      return { ...n, status: d < 0 ? 'past' : d <= 7 ? 'soon' : 'ongoing' } as TimelineNode
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}
