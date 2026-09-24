import type { Job } from '../types'
import { toLocalDate } from '../store'

function offsetDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

// _d: 截止日期相对今天的天数；_p: 发布日期相对今天的天数
const raw: Array<Omit<Job, 'deadline' | 'publishDate'> & { _d: number; _p: number }> = [
  {
    id: 'POSITION-2026-0001', company: '字节跳动', title: '后端开发实习生（暑期）', track: '互联网', city: '北京',
    salary: '300-400元/天', platform: '字节校招官网', type: '暑期实习',
    link: 'https://jobs.bytedance.com/campus/position', referral: 'NB7Z8A2',
    requirement: '本科及以上，熟悉 Java/Go，了解 MySQL、Redis、消息队列，有项目经验优先',
    process: '网申 → 简历筛选 → 2轮技术面 → HR面 → Offer',
    tags: ['Java', '实习', '大厂'], _d: 5, _p: -12,
  },
  {
    id: 'POSITION-2026-0002', company: '腾讯', title: '前端开发工程师（校招正式批）', track: '互联网', city: '深圳',
    salary: '25-35K/月·16薪', platform: '腾讯招聘官网', type: '校招',
    link: 'https://join.qq.com', referral: 'TX2026',
    requirement: '本科及以上，掌握 JavaScript/TypeScript、React/Vue，了解网络原理与浏览器原理',
    process: '网申 → 笔试（行测+技术） → 技术一面 → 技术二面 → HR面 → Offer',
    tags: ['前端', '校招', 'React'], _d: 12, _p: -8,
  },
  {
    id: 'POSITION-2026-0003', company: '美团', title: '数据分析实习生（日常）', track: '互联网', city: '北京',
    salary: '200-260元/天', platform: '美团校招公众号', type: '日常实习',
    link: 'https://zhaopin.meituan.com', referral: 'MT6688',
    requirement: '一周实习 4 天以上，SQL 熟练，掌握 Python 分析，了解 A/B 实验',
    process: '投递 → 简历筛选 → 面试（1-2轮） → 实习 Offer',
    tags: ['SQL', '数据分析', '日常实习'], _d: 25, _p: -5,
  },
  {
    id: 'POSITION-2026-0004', company: '中金公司', title: '投行部暑期实习生', track: '金融', city: '上海',
    salary: '400元/天', platform: '中金招聘官网', type: '暑期实习',
    link: 'https://cicc.hotjob.cn', referral: '',
    requirement: '研究生优先，财务建模扎实，通过 CPA/CFA 部分科目优先，抗压能力强',
    process: '网申 → 笔试（行测+估值） → 群面 → 经理面 → Partner面 → Offer',
    tags: ['投行', '暑期实习', '金融'], _d: -3, _p: -20,
  },
  {
    id: 'POSITION-2026-0005', company: '招商银行', title: '金融科技校招（提前批）', track: '金融', city: '深圳',
    salary: '20-30K/月', platform: '招银云创/校招官网', type: '校招',
    link: 'https://career.cmbchina.com', referral: 'CMB25',
    requirement: '计算机、数学相关专业，掌握 Java 或 Python，了解数据库与数据结构',
    process: '网申 → 在线测评 → 两轮技术面 → HR面 → Offer',
    tags: ['银行', '提前批', '金融科技'], _d: 2, _p: -6,
  },
  {
    id: 'POSITION-2026-0006', company: '易方达基金', title: '行业研究员实习生', track: '金融', city: '广州',
    salary: '150-200元/天', platform: '易方达官网/实习僧', type: '日常实习',
    link: 'https://www.efunds.com.cn', referral: '',
    requirement: '金融/理工背景，搭建过财务模型，文字功底好，能写深度报告',
    process: '邮箱投递 → 简历筛选 → 面试 → 实习 Offer',
    tags: ['行研', '基金', '日常实习'], _d: 18, _p: -2,
  },
  {
    id: 'POSITION-2026-0007', company: '宝洁', title: '品牌管理部（校招）', track: '快消', city: '广州',
    salary: '18-25K/月·14薪', platform: '宝洁校招官网', type: '校招',
    link: 'https://www.pgcareers.com', referral: '',
    requirement: '本科及以上，领导力经历突出，英语流利，接受轮岗',
    process: '网申 → 在线测评 → 一面（结构化） → 二面（英文案例） → Offer',
    tags: ['快消', '管培生', '校招'], _d: 40, _p: -15,
  },
  {
    id: 'POSITION-2026-0008', company: '联合利华', title: '市场部暑期实习生（UFLP）', track: '快消', city: '上海',
    salary: '180元/天', platform: '联合利华校招官网', type: '暑期实习',
    link: 'https://careers.unilever.com', referral: '',
    requirement: '本科及以上，对品牌营销有热情，数据分析能力，英语六级',
    process: '网申 → AI 视频面试 → 数字测评 → 终面 → Offer',
    tags: ['快消', '市场', '暑期实习'], _d: 8, _p: -10,
  },
  {
    id: 'POSITION-2026-0009', company: '阿里巴巴', title: '算法工程师（校招正式批）', track: '互联网', city: '杭州',
    salary: '30-45K/月·16薪', platform: '阿里校招官网', type: '校招',
    link: 'https://talent.alibaba.com', referral: 'ALI0926',
    requirement: '硕士优先，熟悉机器学习/深度学习，有论文或竞赛获奖优先，Python 工程能力',
    process: '网申 → 简历评估 → 笔试 → 3轮技术面 → HR面 → Offer',
    tags: ['算法', '校招', '大厂'], _d: 15, _p: -4,
  },
  {
    id: 'POSITION-2026-0010', company: '京东', title: '产品经理实习生（日常）', track: '互联网', city: '北京',
    salary: '180-230元/天', platform: '京东校招/BOSS直聘', type: '日常实习',
    link: 'https://campus.jd.com', referral: 'JDPM01',
    requirement: '本科及以上，逻辑清晰，会写 PRD，了解电商业务，一周 4 天',
    process: '投递 → 简历筛选 → 2轮业务面 → 实习 Offer',
    tags: ['产品', '日常实习', '电商'], _d: 30, _p: -1,
  },
  {
    id: 'POSITION-2026-0011', company: '华泰证券', title: '金融科技岗（校招）', track: '金融', city: '南京',
    salary: '20-28K/月', platform: '华泰招聘官网', type: '校招',
    link: 'https://job.htsc.com.cn', referral: '',
    requirement: '计算机相关专业，掌握 C++/Java，了解量化交易系统优先',
    process: '网申 → 在线笔试 → 技术面 ×2 → HR面 → Offer',
    tags: ['券商', '金融科技', '校招'], _d: 22, _p: -7,
  },
  {
    id: 'POSITION-2026-0012', company: '网易', title: '游戏策划实习生', track: '互联网', city: '杭州',
    salary: '150-200元/天', platform: '网易校招官网', type: '日常实习',
    link: 'https://campus.163.com', referral: '',
    requirement: '热爱游戏，有游戏拆解分析能力，Excel 熟练，一周 3 天以上',
    process: '投递 → 策划笔试 → 面试 ×2 → 实习 Offer',
    tags: ['游戏', '策划', '日常实习'], _d: 10, _p: -3,
  },
  {
    id: 'POSITION-2026-0013', company: '欧莱雅', title: '数字营销暑期实习生', track: '快消', city: '上海',
    salary: '170元/天', platform: '欧莱雅校招官网/公众号', type: '暑期实习',
    link: 'https://www.careers.loreal.com', referral: '',
    requirement: '本科及以上，熟悉社交媒体运营，美妆爱好者优先，英语流利',
    process: '网申 → AI 面试 → 群面 → 终面 → Offer',
    tags: ['快消', '营销', '暑期实习'], _d: 6, _p: -9,
  },
  {
    id: 'POSITION-2026-0014', company: '小红书', title: '前端开发实习生（日常）', track: '互联网', city: '上海',
    salary: '220-280元/天', platform: '小红书招聘官网', type: '日常实习',
    link: 'https://job.xiaohongshu.com', referral: 'XHS3344',
    requirement: '本科及以上，掌握 React/TypeScript，有个人项目或开源经历优先',
    process: '投递 → 简历筛选 → 技术面 ×2 → 实习 Offer',
    tags: ['前端', '日常实习', 'React'], _d: 20, _p: -2,
  },
  {
    id: 'POSITION-2026-0015', company: '中信证券', title: '营业部实习生（日常）', track: '金融', city: '北京',
    salary: '120元/天', platform: '中信证券官网/实习僧', type: '日常实习',
    link: 'https://job.citics.com', referral: '',
    requirement: '金融相关专业，踏实细心，一周 3 天，实习 3 个月以上',
    process: '投递 → 简历筛选 → 面试 → 实习 Offer',
    tags: ['券商', '日常实习', '金融'], _d: 35, _p: -11,
  },
]

export const JOBS: Job[] = raw.map(({ _d, _p, ...j }) => ({
  ...j,
  deadline: offsetDate(_d),
  publishDate: offsetDate(_p),
}))
