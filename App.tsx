import { useState } from 'react'
import { useStore } from './store'
import type { Profile, Job } from './types'
import { migrateProfile } from './types'
import Onboarding from './components/Onboarding'
import TabBar, { Tab } from './components/TabBar'
import ReminderBar from './components/ReminderBar'
import JobsPage from './pages/JobsPage'
import ResumePage from './pages/ResumePage'
import BoardPage from './pages/BoardPage'
import InterviewPage from './pages/InterviewPage'

export default function App() {
  const [rawProfile, setProfile] = useStore<Profile | null>('profile', null)
  const profile = migrateProfile(rawProfile) // 兼容旧版单选画像
  const [tab, setTab] = useState<Tab>('jobs')
  const [presetJD, setPresetJD] = useState<Job | null>(null)

  if (!profile) return <Onboarding onDone={() => {}} />

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 relative">
      <header className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="font-bold">求职无忧</h1>
          <p className="text-xs text-gray-400">
            {profile.grade} · {profile.industry.join('/')} · {profile.position.join('/')} · {profile.city.join('/')} · {profile.jobType}
          </p>
        </div>
        <button className="text-xs text-blue-600" onClick={() => {
          if (confirm('重新填写画像？（不影响已存简历与投递记录）')) setProfile(null)
        }}>编辑画像</button>
      </header>

      <ReminderBar />

      <main className="pb-20">
        {tab === 'jobs' && (
          <JobsPage profile={profile} onDiagnose={(j) => { setPresetJD(j); setTab('resume') }} />
        )}
        {tab === 'resume' && <ResumePage presetJD={presetJD} />}
        {tab === 'board' && <BoardPage />}
        {tab === 'interview' && <InterviewPage />}
      </main>

      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
