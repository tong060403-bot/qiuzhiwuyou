export type Tab = 'jobs' | 'resume' | 'board' | 'interview'

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'jobs', label: '机会', icon: '🎯' },
  { key: 'resume', label: '简历', icon: '📄' },
  { key: 'board', label: '投递', icon: '📋' },
  { key: 'interview', label: '面经', icon: '💬' },
]

export default function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {TABS.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`flex-1 flex flex-col items-center py-2 text-xs ${tab === t.key ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          <span className="text-xl leading-6">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
