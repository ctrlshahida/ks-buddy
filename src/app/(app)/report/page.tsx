'use client'

import { useRef, useState, type FormEvent } from 'react'
import { Icon, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { formatDate, progress, stateOf } from '@/lib/ksb'

export default function ReportPage() {
  const { logs, ksbs, user, reportStart, reportEnd, setReportPeriod, toast } = useWorkspace()
  const [start, setStart] = useState(reportStart)
  const [end, setEnd] = useState(reportEnd)
  const reportRef = useRef<HTMLElement>(null)

  const ls = logs.filter(l => l.date >= reportStart && l.date <= reportEnd)
  const otj = ls.filter(l => l.otj)
  const hours = otj.reduce((s, l) => s + l.hours, 0)
  const ids = [...new Set(ls.flatMap(l => l.codes))]
  const projects = [...new Set(ls.map(l => l.project.toLowerCase()))]
  const strong = ksbs.filter(k => stateOf(k, logs) === 'strong')
  const needsWork = ksbs.filter(k => ['attention', 'empty'].includes(stateOf(k, logs)))
  const describe = (list: typeof ksbs) => list.map(k => `${k.code} (${k.title.toLowerCase()})`).join('; ')
  const who = user.name || 'The apprentice'

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (start > end) return toast('Choose an end date after the start date.')
    setReportPeriod(start, end)
    toast('Progress report generated for your selected period.')
  }

  function download() {
    const blob = new Blob([reportRef.current?.innerText ?? ''], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ks-buddy-progress-report-${reportStart}-to-${reportEnd}.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    toast('Your progress report has been downloaded.')
  }

  return (
    <>
      <PageHead
        title="Your progress report, ready to review."
        sub="Your activity and learning, brought together without starting from scratch."
        eyebrow="GENERATED REPORT"
        actions={
          <>
            <button className="btn" onClick={download}><Icon name="file" /> Download report</button>
            <button className="btn primary" onClick={() => window.print()}><Icon name="report" /> Print / save PDF</button>
          </>
        }
      />
      <div className="card" style={{ marginBottom: 22 }}>
        <form className="buttons" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }} onSubmit={onSubmit}>
          <div><label htmlFor="period-start">Reporting from</label><input id="period-start" type="date" value={start} onChange={e => setStart(e.target.value)} required /></div>
          <div><label htmlFor="period-end">Reporting to</label><input id="period-end" type="date" value={end} onChange={e => setEnd(e.target.value)} required /></div>
          <button className="btn" type="submit" style={{ alignSelf: 'flex-end' }}>Generate progress report</button>
        </form>
      </div>
      <article className="report" ref={reportRef}>
        <div className="report-head">
          <div>
            <div className="eyebrow">KS-BUDDY · APPRENTICESHIP RECORD</div>
            <h1>Apprenticeship progress report</h1>
            <p style={{ margin: 0 }}>{user.name || user.email} · Data analyst, Level 4<br />{formatDate(reportStart)} – {formatDate(reportEnd)}</p>
          </div>
          <span className="badge" style={{ alignSelf: 'start' }}>Draft for review</span>
        </div>
        <div className="report-summary">
          <div><b>{ls.length}</b>learning activities</div>
          <div><b>{hours}h</b>off-the-job learning recorded</div>
          <div><b>{ids.length} / 10</b>KSBs with mapped activity</div>
        </div>
        <h2>Summary of work completed</h2>
        {ls.length ? (
          <>
            <p>During this reporting period, {who} recorded {ls.length} activities across {projects.join(', ')}. The activities below provide a record of practical work, reflection and suggested evidence against apprenticeship requirements.</p>
            <ul>{ls.map(l => <li key={l.id}><b>{l.title}</b> ({formatDate(l.date)}): {l.work}</li>)}</ul>
          </>
        ) : (
          <p>No activities are recorded in this period. Choose dates that include your learning.</p>
        )}
        <h2>Key learning</h2>
        <ul>{ls.length ? ls.map(l => <li key={l.id}>{l.learn}</li>) : <li>No learning recorded in this period.</li>}</ul>
        <h2>KSBs evidenced</h2>
        <p>Reviewed activity mappings indicate suggested evidence for the following requirements; they do not confirm achievement.</p>
        <table>
          <thead><tr><th>KSB</th><th>Requirement</th><th>Activities in period</th><th>Overall coverage</th></tr></thead>
          <tbody>
            {ids.map(id => {
              const k = ksbs.find(k => k.code === id)!
              return <tr key={id}><td>{id}</td><td>{k.title}</td><td>{ls.filter(l => l.codes.includes(id)).length}</td><td>{progress(k, logs)}%</td></tr>
            })}
          </tbody>
        </table>
        <h2>Off-the-job learning activities</h2>
        <p>{hours} hours were marked as off-the-job learning. This is a record for provider review.</p>
        <ul>{otj.length ? otj.map(l => <li key={l.id}>{formatDate(l.date)} · {l.title} · {l.hours} hours</li>) : <li>No off-the-job learning in this period.</li>}</ul>
        <h2>Strongest areas</h2>
        <p>{strong.length ? `${describe(strong)} have the strongest overall evidence coverage in the record.` : 'No requirements have strong evidence coverage yet.'}</p>
        <h2>Development areas</h2>
        <p>{describe(needsWork)} would benefit from additional evidence. Present findings to the team and explore statistical methods with a colleague to broaden your learning.</p>
        <h2>Evidence references</h2>
        <ul>
          {ls.some(l => l.files.length)
            ? ls.flatMap((l, i) => l.files.map((f, j) => <li key={`${l.id}-${j}`}>REF-{String(i + 1).padStart(2, '0')}.{j + 1} · {f} · {formatDate(l.date)} · {l.codes.join(', ')}</li>))
            : <li>No evidence files referenced in this period.</li>}
        </ul>
        <div className="notice section-space">Generated from your recorded activities. Review wording, off-the-job learning eligibility and evidence references with your provider. Sample KSB descriptions are illustrative.</div>
      </article>
    </>
  )
}
