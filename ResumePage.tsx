import { useEffect, useRef, useState } from 'react'
import { SAMPLE_RESUME } from '../data/sampleResume'
import { SAMPLE_JDS } from '../data/sampleJD'
import type { DiagReport, Job } from '../types'
import { useStore, today } from '../store'
import { apiDiagnose } from '../utils/diagnose'

export default function ResumePage({ presetJD }: { presetJD?: Job | null }) {
  const [resumeText, setResumeText] = useStore<string>('resumeText', '')
  const [jdText, setJdText] = useState('')
  const [report, setReport] = useState<DiagReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [diagDate, setDiagDate] = useStore<string>('diagDate', '')
  const [diagCount, setDiagCount] = useStore<number>('diagCount', 0)

  const freeUsed = diagDate === today() && diagCount >= 1

  useEffect(() => {
    if (presetJD) {
      setJdText(`${presetJD.company} - ${presetJD.title}\n${presetJD.requirement}`)
      setReport(null)
    }
  }, [presetJD])

  const run = async () => {
    if (!resumeText.trim() || !jdText.trim()) return alert('请先填写简历和 JD')
    if (freeUsed) return alert('今日免费次数已用完，可解锁不限次诊断')
    setLoading(true); setReport(null); setFeedback('')
    const r = await apiDiagnose(resumeText, jdText)
    setReport(r); setLoading(false)
    if (diagDate !== today()) { setDiagDate(today()); setDiagCount(1) } else setDiagCount(diagCount + 1)
  }

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text)
    alert('已复制')
  }

  // 点击 / 拖拽上传简历文件
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const readFile = (file: File) => {
    const name = file.name.toLowerCase()
    const reader = new FileReader()
    if (/\.(txt|md|markdown|text)$/.test(name)) {
      reader.onload = () => {
        setResumeText(String(reader.result || ''))
        setReport(null)
      }
      reader.readAsText(file)
    } else if (/\.html?$/.test(name)) {
      // HTML 简历：抽取正文文字
      reader.onload = () => {
        const doc = new DOMParser().parseFromString(String(reader.result || ''), 'text/html')
        doc.querySelectorAll('script,style').forEach((el) => el.remove())
        const text = (doc.body?.innerText || doc.body?.textContent || '')
          .split('\n').map((s) => s.trim()).filter(Boolean).join('\n')
        if (!text) return alert('未能从 HTML 中解析出文字，请直接粘贴')
        setResumeText(text)
        setReport(null)
      }
      reader.readAsText(file)
    } else {
      alert('暂只支持 .txt / .md / .html 文本文件，PDF/Word 请先复制文字粘贴')
    }
  }

  // 将原简历应用改写建议后导出为 Word 兼容文档
  const downloadDoc = () => {
    if (!report) return
    let text = resumeText
    for (const r of report.rewrites) text = text.replace(r.from, r.to)
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>优化后简历</title></head>
<body style="font-family:'PingFang SC',sans-serif;line-height:1.8;max-width:680px;margin:24px auto;padding:0 16px;color:#222">
<h2 style="text-align:center;border-bottom:2px solid #2563eb;padding-bottom:8px">优化后简历</h2>
<pre style="white-space:pre-wrap;font-family:inherit;font-size:14px">${text.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))}</pre>
<hr style="border:none;border-top:1px solid #ddd;margin:20px 0">
<div style="font-size:12px;color:#666">
<p><b>诊断摘要：</b>匹配分 ${report.score}/100，缺失关键词：${report.missing.join('、') || '无'}</p>
<p><b>下一步建议：</b>${report.nextStep}</p>
<p>由「求职无忧」AI 简历诊断生成 · ${new Date().toLocaleString('zh-CN')}</p>
</div></body></html>`
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `优化后简历_${today()}.doc`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="p-4 pb-6 space-y-4">
      <h2 className="font-bold text-lg">AI 简历诊断</h2>

      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">1. 上传 / 粘贴简历</span>
          <div className="flex gap-2 text-xs">
            <button className="text-blue-600" onClick={() => fileRef.current?.click()}>上传文件</button>
            <button className="text-blue-600" onClick={() => setResumeText(SAMPLE_RESUME)}>填入示例</button>
            {resumeText && <button className="text-red-500" onClick={() => { setResumeText(''); setReport(null) }}>删除</button>}
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".txt,.md,.markdown,.text,.html,.htm" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); e.target.value = '' }} />
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) readFile(f) }}>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            rows={8} placeholder="点击上方「上传文件」，或把 .txt/.md/.html 简历拖到这里，也可直接粘贴全文…"
            className={`input ${dragOver ? '!border-blue-500 !ring-2 !ring-blue-300' : ''}`} />
        </div>
        {dragOver && <p className="text-xs text-blue-600 mt-1">松开即可导入简历文件</p>}
        <p className="text-xs text-gray-400 mt-1">支持 .txt / .md / .html（自动提取正文），PDF/Word 请粘贴文字 · 简历仅保存在本机浏览器</p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">2. 目标 JD</span>
          <div className="flex gap-3 text-xs">
            {SAMPLE_JDS.map((jd, i) => (
              <button key={jd.id} className="text-blue-600" onClick={() => setJdText(jd.text)}>示例JD{i + 1}</button>
            ))}
          </div>
        </div>
        <textarea value={jdText} onChange={(e) => setJdText(e.target.value)}
          rows={6} placeholder="粘贴目标岗位 JD（可从机会页一键带入）" className="input" />
      </div>

      <button onClick={run} disabled={loading || freeUsed}
        className={`w-full py-3 rounded-xl font-medium text-white ${loading || freeUsed ? 'bg-gray-300' : 'bg-blue-600 active:scale-95 transition-transform'}`}>
        {loading ? '诊断中…' : freeUsed ? '今日免费次数已用完' : '开始诊断（免费 1 次/天）'}
      </button>
      <button onClick={() => alert('付费功能开发中，敬请期待 💎')} className="w-full py-2 rounded-xl border border-amber-400 text-amber-600 text-sm font-medium">
        💎 解锁不限次诊断（¥9.9/月）
      </button>

      {loading && <div className="text-center text-sm text-gray-400">AI 正在分析关键词与经历…（约 10 秒内）</div>}

      {report && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className={`text-3xl font-bold ${report.score >= 70 ? 'text-green-600' : report.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
              {report.score}
            </div>
            <div className="text-sm text-gray-500">JD 匹配分<br />关键词命中 {report.matched.length}/{report.matched.length + report.missing.length}</div>
          </div>

          {report.matched.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">✅ 已覆盖关键词</div>
              <div className="flex flex-wrap gap-1.5">{report.matched.map((k) => <span key={k} className="tag bg-green-50 text-green-700">{k}</span>)}</div>
            </div>
          )}
          {report.missing.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">❌ 关键词缺失</div>
              <div className="flex flex-wrap gap-1.5">{report.missing.map((k) => <span key={k} className="tag bg-red-50 text-red-600">{k}</span>)}</div>
            </div>
          )}
          {report.rewrites.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">✍️ 经历改写建议</div>
              <div className="space-y-2">
                {report.rewrites.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs leading-5">
                    <div className="text-gray-400 line-through">{r.from}</div>
                    <div className="text-gray-800 mt-1">↓ {r.to}</div>
                    <button className="text-blue-600 mt-1" onClick={() => copy(r.to)}>复制建议</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {report.risks.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1">⚠️ 风险提示</div>
              <ul className="text-xs text-gray-700 list-disc pl-4 space-y-1">{report.risks.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            <b>下一步：</b>{report.nextStep}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary flex-1" onClick={downloadDoc}>⬇ 生成优化简历文档</button>
            <button className="btn-ghost flex-1" onClick={run}>重新诊断</button>
            <button className="btn-ghost flex-1" onClick={() => { setFeedback('有用'); alert('感谢反馈！') }} disabled={!!feedback}>
              {feedback === '有用' ? '✓ 已反馈' : '👍 有用'}
            </button>
            <button className="btn-ghost flex-1" onClick={() => { setFeedback('没用'); alert('我们会继续优化') }} disabled={!!feedback}>
              {feedback === '没用' ? '✓ 已反馈' : '👎 没用'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
