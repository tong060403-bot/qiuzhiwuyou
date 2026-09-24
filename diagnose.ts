import type { DiagReport } from '../types'

// 关键词词典：JD 中出现即认为重要
const KEYWORDS = [
  'JavaScript', 'TypeScript', 'HTML', 'CSS', 'React', 'Vue', 'Node', 'Webpack', 'Vite',
  'SQL', 'Python', 'pandas', 'numpy', 'Excel', 'PowerPoint', 'Wind', 'Tableau', 'Power BI',
  'CPA', 'CFA', '司法考试', '财务建模', '估值', '尽职调查', '行业研究',
  'A/B 实验', 'A/B测试', '数据分析', '统计分析', '组件化', '工程化', '性能优化',
  '浏览器原理', 'HTTP', 'Git', '算法', '机器学习', '深度学习',
  '沟通能力', '团队协作', '抗压能力', '英语', '开源', '实习经历',
  '本科', '研究生', '计算机', '金融', '统计', '数学',
]

const WEAK_PATTERNS: { re: RegExp; verb: string }[] = [
  { re: /负责/, verb: '主导' },
  { re: /参与/, verb: '深度参与' },
]

function hit(text: string, kw: string): boolean {
  const t = text.toLowerCase()
  const k = kw.toLowerCase()
  return t.includes(k) || (k.includes('AB') && t.includes(k.replace('A/B', 'ab')))
}

export function diagnose(resume: string, jd: string): DiagReport {
  const jdKeywords = KEYWORDS.filter((k) => hit(jd, k))
  const matched = jdKeywords.filter((k) => hit(resume, k))
  const missing = jdKeywords.filter((k) => !hit(resume, k))
  const score = jdKeywords.length
    ? Math.round((matched.length / jdKeywords.length) * 100)
    : 60

  // 改写建议：找出弱动词句，套 STAR 模板
  const lines = resume.split('\n').map((s) => s.trim()).filter(Boolean)
  const rewrites: { from: string; to: string }[] = []
  const useQuantify = !/\d+%|\d+万|\d+次|\d+个/.test(resume)
  for (const line of lines) {
    if (rewrites.length >= 3) break
    const p = WEAK_PATTERNS.find((w) => w.re.test(line))
    if (!p) continue
    const kwHint = matched.slice(0, 2).join('、') || jdKeywords.slice(0, 2).join('、') || '核心技能'
    let to = line
      .replace(p.re, `【${p.verb}】`)
      .replace(/。?$/, '')
    to += `，运用${kwHint}完成关键模块，并通过量化的结果（如效率提升 X%、覆盖 X 用户）体现个人贡献`
    if (useQuantify) to += '（原句缺少数字，请补充）'
    rewrites.push({ from: line, to })
  }

  // 风险提示
  const risks: string[] = []
  const years = [...resume.matchAll(/20\d{2}[./-](\d{1,2})/g)].map((m) => {
    const y = Number(m[0].slice(0, 4)); const mo = Number(m[1]); return y + mo / 12
  })
  if (years.length >= 2) {
    years.sort((a, b) => a - b)
    const gap = Math.round((years[years.length - 1] - years[0]) * 12)
    if (gap >= 12) risks.push(`经历跨度过长（约 ${gap} 个月），中间可能存在时间断档，建议补充或说明`)
  }
  if (useQuantify) risks.push('全文缺少量化数据（百分比/规模/次数），说服力不足')
  if (/\b精通\b|精通/.test(resume)) risks.push('出现"精通"字样，面试易被深挖，建议改为"熟练掌握/深入理解"')
  if (resume.split('\n').some((l) => l.length > 80)) risks.push('存在超长段落，HR 扫读困难，建议每条经历 1-2 行分点')
  if (resume.length < 200) risks.push('简历内容过短，建议补充项目细节与技术栈')

  const nextStep = missing.length
    ? `优先补齐 JD 高频关键词：${missing.slice(0, 3).join('、')}，把它们自然写进最近的实习/项目描述里`
    : '关键词覆盖良好，重点润色经历的量化结果与 STAR 结构'

  return { score, matched, missing, rewrites, risks, nextStep }
}

/** 真实 API 占位：接入后端时替换此函数即可 */
export async function apiDiagnose(resume: string, jd: string): Promise<DiagReport> {
  // return fetch('/api/diagnose', {method:'POST', body: JSON.stringify({resume, jd})}).then(r=>r.json())
  await new Promise((r) => setTimeout(r, 1200)) // 模拟延迟
  return diagnose(resume, jd)
}
