'use client'

import { ActivityItem, LinkButton, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'

export default function HistoryPage() {
  const { logs } = useWorkspace()
  return (
    <>
      <PageHead title="Your everyday work, all in one place." sub="Activities you’ve captured and reviewed with Buddy." actions={<LinkButton href="/log" primary icon="plus">Log today’s work</LinkButton>} eyebrow="ACTIVITY RECORD" />
      <section className="card">
        {logs.length === 0 && <p className="muted">No activities yet. Tell Buddy about your day to add your first one.</p>}
        {logs.map(l => (
          <div key={l.id} style={{ padding: '10px 0' }}>
            <ActivityItem l={l} />
            <p className="subtitle" style={{ margin: '10px 0 14px 52px' }}>{l.learn}</p>
            <div className="evidence-list" style={{ marginLeft: 52 }}>
              {l.files.map(f => <span key={f} className="evidence-pill">{f}</span>)}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
