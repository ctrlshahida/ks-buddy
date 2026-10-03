'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Code, Icon, LinkButton, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import type { Activity } from '@/lib/types'

export default function AnalysisPage() {
  const router = useRouter()
  const w = useWorkspace()
  const { draft, suggestions, ksbs } = w
  const [editing, setEditing] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  if (!draft) {
    return (
      <div className="empty-state">
        <h2>Start with your daily log</h2>
        <LinkButton href="/log" primary>Capture your work</LinkButton>
      </div>
    )
  }

  const patchSuggestion = (i: number, patch: Partial<(typeof suggestions)[number]>) =>
    w.setSuggestions(suggestions.map((s, j) => (j === i ? { ...s, ...patch } : s)))

  async function save() {
    if (!draft) return
    const accepted = suggestions.filter(s => s.accepted)
    const record: Activity = {
      id: crypto.randomUUID(),
      date: draft.date,
      title: draft.title ?? '',
      work: draft.summary ?? draft.work,
      learn: draft.learn ?? '',
      hours: draft.hours,
      otj: draft.otj,
      project: draft.project,
      files: draft.files,
      codes: accepted.map(s => s.id),
      mappingReasons: accepted.map(s => ({ code: s.id, reason: s.reason })),
    }
    setSaving(true)
    try {
      await w.saveRecords([record])
      w.resetCapture()
      router.push('/')
      w.toast('Saved to your record. Your trackers and report are up to date.')
    } catch {
      setSaving(false)
      w.toast('Couldn’t save just now. Your entry is still here — please try again.')
    }
  }

  const evidenceIdeas = /report|power bi/i.test(draft.work)
    ? ['Power BI report', 'Meeting notes', 'Screenshot of analysis']
    : ['Work output', 'Reflection notes', 'Feedback from your manager']

  return (
    <div className="narrow">
      <PageHead title="Your work has a story to tell." sub="Review these suggestions before adding them to your record." actions={<LinkButton href="/log">Edit daily log</LinkButton>} eyebrow="AI ANALYSIS · SIMULATED" />
      <div className="notice">These are suggested mappings, not proof that a KSB has been achieved. Review each explanation, adjust it, and accept the ones that fit.</div>
      <div className="summary-grid">
        <section className="card">
          <h2>What you did</h2>
          <p contentEditable suppressContentEditableWarning role="textbox" aria-label="Edit activity summary" onBlur={e => w.setDraft({ ...draft, summary: e.currentTarget.textContent ?? '' })}>{draft.summary}</p>
          <small>Click the summary to edit</small>
        </section>
        <section className="card">
          <h2>What you learned</h2>
          <p contentEditable suppressContentEditableWarning role="textbox" aria-label="Edit learning summary" onBlur={e => w.setDraft({ ...draft, learn: e.currentTarget.textContent ?? '' })}>{draft.learn}</p>
          <small>Click the learning to edit</small>
        </section>
      </div>
      <div className="card-head">
        <div>
          <h2>KSBs identified</h2>
          <p>{suggestions.length} suggestions · you decide what belongs in your record</p>
        </div>
        <button className="text-link" onClick={() => w.setSuggestions(suggestions.map(s => ({ ...s, accepted: true })))}>Accept all</button>
      </div>
      {suggestions.map((s, i) => {
        const k = ksbs.find(k => k.code === s.id)
        return (
          <div key={s.id} className={`mapping ${s.accepted ? 'accepted' : ''}`}>
            <div className="row-top"><Code code={s.id} /><span className="ksb-title">{k?.title}</span><span className="confidence">{s.confidence}</span></div>
            {editing === i ? (
              <textarea className="editbox" aria-label="Edit mapping reason" autoFocus value={s.reason} onChange={e => patchSuggestion(i, { reason: e.target.value })} />
            ) : (
              <p>{s.reason}</p>
            )}
            <div className="mapping-controls">
              <button className={`btn ${s.accepted ? '' : 'primary'}`} onClick={() => patchSuggestion(i, { accepted: !s.accepted })}>{s.accepted ? '✓ Accepted' : 'Accept mapping'}</button>
              <button className="text-link" onClick={() => setEditing(editing === i ? null : i)}>{editing === i ? 'Save explanation' : 'Edit'}</button>
              <button className="text-link muted" onClick={() => { w.setSuggestions(suggestions.filter((_, j) => j !== i)); setEditing(null) }}>Remove</button>
            </div>
          </div>
        )
      })}
      <section className="card section-space">
        <h2>Suggested evidence</h2>
        <p className="subtitle">Add supporting material to make your activity easier to review.</p>
        <div className="evidence-list">{evidenceIdeas.map(f => <span key={f} className="evidence-pill">{f}</span>)}</div>
        {draft.files.length > 0 && <p className="hint">Attached: {draft.files.join(', ')}</p>}
        <input
          type="file"
          multiple
          aria-label="Attach supporting evidence"
          onChange={e => {
            const names = [...(e.target.files ?? [])].map(f => f.name)
            w.setDraft({ ...draft, files: [...new Set([...draft.files, ...names])] })
            w.toast('Evidence file references added.')
          }}
        />
      </section>
      <div className="form-bottom section-space">
        <span className="hint">{suggestions.filter(s => s.accepted).length} mappings accepted · {draft.hours} hours logged</span>
        <button className="btn primary" disabled={saving} onClick={save}><Icon name="check" /> Add to my apprenticeship record</button>
      </div>
      <p className="hint" style={{ marginTop: 14 }}>You can save an activity without KSB mappings and review it later.</p>
    </div>
  )
}
