export type JobType = '暑期实习' | '日常实习' | '校招' | '兼职'

export interface Profile {
  grade: string
  industry: string[]
  position: string[]
  city: string[]
  jobType: JobType | '不限'
}

/** 兼容旧版单选画像（string 字段）迁移为多选数组 */
export function migrateProfile(p: any): Profile | null {
  if (!p) return null
  return {
    grade: p.grade ?? '不限',
    industry: Array.isArray(p.industry) ? p.industry : p.industry ? [p.industry] : ['不限'],
    position: Array.isArray(p.position) ? p.position : p.position ? [p.position] : ['不限'],
    city: Array.isArray(p.city) ? p.city : p.city ? [p.city] : ['不限'],
    jobType: p.jobType ?? '不限',
  }
}

export interface Job {
  id: string                 // 职位 ID
  company: string            // 公司名称
  title: string              // 岗位名称
  track: string              // 赛道分类（互联网/金融/快消…）
  city: string               // 工作地点
  salary: string             // 薪资
  publishDate: string        // 发布日期
  deadline: string           // 截止日期
  platform: string           // 发布平台
  type: JobType
  link: string
  referral?: string
  requirement: string        // 岗位要求
  process: string            // 应聘流程
  tags: string[]
}

export type AppStatus =
  | '待投递' | '已投递' | '待测评' | '已测评' | '待AI面'
  | '待面试' | '待Offer' | '已Offer' | '已拒' | '流程结束'

export const APP_STATUSES: AppStatus[] = [
  '待投递', '已投递', '待测评', '已测评', '待AI面',
  '待面试', '待Offer', '已Offer', '已拒', '流程结束',
]

/** 旧六态 -> 新十态迁移 */
const STATUS_MIGRATE: Record<string, AppStatus> = {
  待投: '待投递', 已投: '已投递', 笔试: '待测评', 面试: '待面试',
  Offer: '已Offer', 拒绝: '已拒',
}

export function migrateStatus(s: string): AppStatus {
  return STATUS_MIGRATE[s] ?? (APP_STATUSES.includes(s as AppStatus) ? (s as AppStatus) : '待投递')
}

export interface Application {
  id: string
  jobId?: string
  company: string
  title: string
  status: AppStatus
  appliedAt: string // yyyy-MM-dd
  nextStep?: string
  nextStepDate?: string // 面试/笔试等下一步日期
  deadline?: string
  note?: string
  resumeVersion?: string
  review?: string
}

export interface DiagReport {
  score: number
  matched: string[]
  missing: string[]
  rewrites: { from: string; to: string }[]
  risks: string[]
  nextStep: string
}

export interface InterviewExp {
  id: string
  company: string
  position: string
  round: string       // 轮次：一面/二面/HR面/测评…
  type: JobType
  date: string        // 发布时间
  source: string      // 来源平台
  content: string
  tags: string[]
}
