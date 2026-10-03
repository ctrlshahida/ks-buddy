'use client'

import Link from 'next/link'
import { Code, KsbRow, LinkButton, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { stateOf } from '@/lib/ksb'
import type { Ksb, ProgressState } from '@/lib/types'

const OPPORTUNITIES: [string, string, string][] = [
  ['S6', 'Share your findings with your team', 'You have limited evidence for presenting information to stakeholders. If you present your current analysis to your team, log it afterwards and it may contribute towards S6.'],
  ['K4', 'Explore the numbers behind a trend', 'Ask a colleague to walk through averages, variation and outliers in your latest sales dataset. Capture the principles you learned and the assumptions you checked.'],
  ['S8', 'Try a statistical technique in context', 'Compare two regions using a simple statistical method, with guidance from your manager. Save your method, interpretation and limitations.'],
  ['K3', 'Apply your privacy learning', 'Review a report before sharing it. Explain which personal fields you removed, why, and how you checked the intended audience.'],
]

const GROUPS: [string, string, ProgressState[]][] = [
  ['Going well', 'A useful range of evidence to build on.', ['strong']],
  ['Needs more evidence', 'Keep developing depth and variety.', ['progressing', 'attention']],
  ['Not covered yet', 'A starting point for your next opportunity.', ['empty']],
]

export default function ProgressPage() {
  const { ksbs, logs, setDraft, toast } = useWorkspace()
  const inGroup = (states: ProgressState[]): Ksb[] => ksbs.filter(k => states.includes(stateOf(k, logs)))

  return (
    <>
      <PageHead title="A little direction for your next step." sub="See what’s going well and where a new experience could strengthen your evidence." actions={<LinkButton href="/log" primary icon="plus">Log an activity</LinkButton>} eyebrow="PROGRESS & GAPS" />
      <div className="gap-grid">
        {GROUPS.map(([title, sub, states]) => (
          <section key={title} className="card">
            <h2>{title} <span className="badge">{inGroup(states).length}</span></h2>
            <p className="subtitle">{sub}</p>
            {inGroup(states).map(k => <KsbRow key={k.code} k={k} logs={logs} />)}
          </section>
        ))}
      </div>
      <div className="section-space">
        <h2>Suggested opportunities</h2>
        <p className="subtitle" style={{ marginBottom: 20 }}>Practical ways to turn your next piece of work into useful learning.</p>
        <div className="opportunities">
          {OPPORTUNITIES.map(([id, title, text]) => (
            <section key={id} className="card">
              <div className="row-top"><Code code={id} /><span className="hint">Suggested learning opportunity</span></div>
              <h3>{title}</h3>
              <p className="subtitle" style={{ lineHeight: 1.8, marginBottom: 18 }}>{text}</p>
              <Link className="btn" href={`/ksb/${id}`}>View requirement</Link>{' '}
              <Link
                className="text-link"
                style={{ marginLeft: 15 }}
                href="/log"
                onClick={() => {
                  setDraft({ work: '', project: id === 'S6' ? 'Communication' : 'Training', hours: 1.5, date: '', otj: true, files: [] })
                  toast('Capture what you did and learned for ' + id + '.')
                }}
              >
                Log this opportunity
              </Link>
            </section>
          ))}
        </div>
      </div>
    </>
  )
}
