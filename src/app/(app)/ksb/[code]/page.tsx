'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'
import { Bar, Code, Icon, LinkButton, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { formatDate, kindOf, mappedActivities, progress, stateOf, STATE_TEXT } from '@/lib/ksb'

export default function KsbDetail({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { ksbs, logs } = useWorkspace()
  const k = ksbs.find(k => k.code === code)
  if (!k) notFound()

  const ls = mappedActivities(k, logs)
  const s = stateOf(k, logs)
  const nextStep =
    progress(k, logs) === 0
      ? 'Try a small activity with your manager that lets you practise this requirement, then capture what you learned.'
      : s === 'strong'
        ? 'You have a useful range of evidence. Keep adding your reflections and specific outcomes to support a review.'
        : 'You’ve mentioned this skill, but most of your evidence is similar. Try demonstrating it in a different context.'

  return (
    <>
      <PageHead title={k.title} sub={`${code} · ${kindOf(code)} · Data analyst apprenticeship`} actions={<LinkButton href="/">Back to dashboard</LinkButton>} eyebrow="KSB DETAIL" />
      <div className="details-top">
        <section className="card">
          <div className="row-top"><Code code={k.code} /><span className={`status ${s}`}>{STATE_TEXT[s]}</span></div>
          <h2>Your evidence for {k.code}</h2>
          <p>Demonstrate {k.title.toLowerCase()} through practical activities, reflection and supporting evidence across different contexts.</p>
          <div className="detail-bar"><Bar k={k} logs={logs} /></div>
          <div className="detail-meta">
            <span><b>{ls.length}</b> mapped activities</span>
            <span>Latest evidence: <b>{ls.length ? formatDate(ls[0].date) : 'Not captured yet'}</b></span>
          </div>
        </section>
        <section className="opportunity">
          <div className="icon-line"><Icon name="spark" /><h3 style={{ margin: 0 }}>A useful next step</h3></div>
          <p>{nextStep}</p>
          <LinkButton href="/log">Log a new activity</LinkButton>
        </section>
      </div>
      <section className="card">
        <div className="card-head">
          <div>
            <h2>Evidence timeline</h2>
            <p>Activities you have reviewed and mapped to this requirement.</p>
          </div>
          <span className="badge">{ls.length} activities</span>
        </div>
        {ls.length ? (
          <div className="timeline">
            {ls.map(l => (
              <article key={l.id} className="timeline-item">
                <div className="timeline-date">{formatDate(l.date)} · {l.hours}h {l.otj ? 'learning' : ''}</div>
                <h3>{l.title}</h3>
                <b>What you did</b>
                <p>{l.work}</p>
                <b>What you learned</b>
                <p>{l.learn}</p>
                <div className="evidence-list">
                  {l.files.length ? l.files.map(f => <span key={f} className="evidence-pill">{f}</span>) : <span className="hint">No files attached — add work outputs when available.</span>}
                </div>
                <span className="status progressing">{l.demo ? 'Contributes to current coverage' : '+5 coverage points'}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Your first piece of evidence starts here.</h3>
            <p>There’s no activity mapped yet. Your next learning opportunity can change that.</p>
            <LinkButton href="/log" primary>Capture an activity</LinkButton>
          </div>
        )}
      </section>
    </>
  )
}
