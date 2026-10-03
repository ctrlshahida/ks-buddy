'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icon, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { PROJECTS, today } from '@/lib/ksb'
import { makeSuggestions } from '@/lib/suggest'

const EXAMPLE =
  'I updated our weekly Power BI report, investigated why the sales figures didn’t match the finance report and spoke to my manager about how the reporting process works.'

export default function LogPage() {
  const router = useRouter()
  const w = useWorkspace()
  const { draft } = w
  const [work, setWork] = useState(draft?.work ?? '')
  const [analysing, setAnalysing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const field = (id: string) => form.elements.namedItem(id) as HTMLInputElement
    const files = [...(field('files').files ?? [])].map(f => f.name)
    const next = {
      work: work.trim(),
      date: field('date').value,
      hours: Number(field('hours').value),
      project: field('project').value,
      otj: field('otj').checked,
      files: files.length ? files : draft?.files ?? [],
    }
    if (next.work.length < 20) return
    w.setDraft(next)
    setAnalysing(true)
    timer.current = setTimeout(() => {
      const result = makeSuggestions(next)
      w.setDraft(result.draft)
      w.setSuggestions(result.suggestions)
      router.push('/analysis')
    }, 1500)
  }

  if (analysing) {
    return (
      <div className="loading">
        <div className="spinner" />
        <h1>Finding the learning in your day.</h1>
        <p className="muted">Organising your work into suggestions you can review.</p>
        <div className="steps"><span>Capture ✓</span><span>Analyse your activity</span><span>Suggest KSB mappings</span></div>
        <p className="hint section-space">Simulated analysis · no AI service is called</p>
      </div>
    )
  }

  return (
    <div className="narrow">
      <PageHead title="Capture today. Build your evidence." sub="A few sentences is all it takes. We’ll help organise the rest." eyebrow="DAILY LOG" />
      <form className="card capture-card" onSubmit={onSubmit}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>What did you work on today?</h2>
        <p className="subtitle" style={{ marginBottom: 20 }}>Include what you did, anything new you learned, and who you worked with.</p>
        <label htmlFor="work" className="hint">Your day, in your own words</label>
        <textarea id="work" required minLength={20} placeholder={`For example: ${EXAMPLE}`} value={work} onChange={e => setWork(e.target.value)} />
        <div className="buttons" style={{ marginTop: 10, justifyContent: 'flex-start' }}>
          <button type="button" className="text-link" onClick={() => setWork(EXAMPLE)}>Use the Power BI example</button>
          <span className="hint" style={{ marginLeft: 'auto' }}>Usually less than a minute</span>
        </div>
        <div className="form-grid">
          <div><label htmlFor="date">Date</label><input type="date" id="date" required defaultValue={draft?.date || today()} max={today()} /></div>
          <div><label htmlFor="hours">Time spent (hours)</label><input type="number" id="hours" min={0.25} max={24} step={0.25} defaultValue={draft?.hours || 1.5} required /></div>
          <div>
            <label htmlFor="project">Project / category</label>
            <select id="project" defaultValue={draft?.project}>
              {PROJECTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <label className="checkline"><input type="checkbox" id="otj" defaultChecked={draft?.otj !== false} /> This included off-the-job learning</label>
        <p className="hint" style={{ margin: '8px 0' }}>Count learning time agreed with your provider, rather than routine work alone.</p>
        <div className="upload">
          <div>
            <label htmlFor="files" style={{ marginBottom: 0 }}>Attach evidence <span className="muted">(optional)</span></label>
            <p>Reports, screenshots or meeting notes. File references are saved with your activity.</p>
          </div>
          <input type="file" id="files" multiple />
        </div>
        <div className="form-bottom">
          <span className="hint"><Icon name="spark" /> AI suggestions are always yours to review.</span>
          <button type="submit" className="btn primary"><Icon name="spark" /> Analyse my work</button>
        </div>
      </form>
      <div className="notice" style={{ marginTop: 20 }}>
        Demo mode: analysis is simulated using example KSBs. Your reviewed entries are saved to your private workspace. Attachments currently save filenames only.
      </div>
    </div>
  )
}
