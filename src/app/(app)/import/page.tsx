'use client'

import { useRouter } from 'next/navigation'
import { useState, type ChangeEvent } from 'react'
import { Code, PageHead } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { IMPORT_TEMPLATE_CSV, normaliseImport, parseCSV } from '@/lib/importers'
import { formatDate } from '@/lib/ksb'
import type { Activity } from '@/lib/types'

export default function ImportPage() {
  const router = useRouter()
  const { saveRecords, toast } = useWorkspace()
  const [items, setItems] = useState<Activity[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [problem, setProblem] = useState('')
  const [saving, setSaving] = useState(false)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      if (f.size > 2_000_000) throw Error('Please use a file smaller than 2 MB.')
      const text = await f.text()
      const parsed = f.name.toLowerCase().endsWith('.json') ? JSON.parse(text) : parseCSV(text)
      const rows = normaliseImport(Array.isArray(parsed) ? parsed : parsed.activities || parsed.records)
      setItems(rows)
      setSelected(new Set(rows.map(r => r.id)))
      setProblem('')
    } catch (err) {
      setItems([])
      setProblem(err instanceof Error ? err.message : 'Could not read that file.')
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([IMPORT_TEMPLATE_CSV], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ks-buddy-import-example.csv'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  async function save() {
    const chosen = items.filter(i => selected.has(i.id))
    if (!chosen.length) return toast('Choose at least one activity to import.')
    setSaving(true)
    try {
      const count = await saveRecords(chosen)
      router.push('/')
      toast(`${count} imported activities saved. Your trackers are updated.`)
    } catch (err) {
      const done = (err as { savedCount?: number }).savedCount ?? 0
      const savedIds = new Set(chosen.slice(0, done).map(i => i.id))
      setItems(items.filter(i => !savedIds.has(i.id)))
      setProblem(`${done} activities saved. The remaining rows are still available; try saving again.`)
      setSaving(false)
    }
  }

  return (
    <div className="narrow">
      <PageHead title="Bring your work into Buddy." sub="Import activities from another tool, then review what belongs in your record." eyebrow="IMPORT DATA" />
      <section className="import-surface">
        <h2>Choose a CSV or JSON export</h2>
        <p className="muted">Use an export from the app you’re working in. Buddy can read activity descriptions, learning, dates, hours, KSB codes and evidence references.</p>
        <label htmlFor="import-file">Activity data file</label>
        <input id="import-file" type="file" accept=".csv,.json,text/csv,application/json" onChange={onFile} />
        <p className="hint">Required: date and work (or description). Optional: learning, hours, project, otj, codes, evidence. Dates: YYYY-MM-DD. Codes: K1;S3. Evidence: filenames or references, not uploaded files.</p>
        <button className="text-link" onClick={downloadTemplate}>Download an example CSV</button>
        {problem && <p className="error" role="alert">{problem}</p>}
      </section>
      {items.length > 0 && (
        <section className="section-space">
          <h2>Review {items.length} imported activities</h2>
          <p className="subtitle">Only checked rows will be saved. Imported KSB mappings remain suggestions for provider review.</p>
          {items.map(r => (
            <div key={r.id} className="import-row">
              <label className="checkline">
                <input
                  type="checkbox"
                  checked={selected.has(r.id)}
                  onChange={e => setSelected(prev => {
                    const next = new Set(prev)
                    if (e.target.checked) next.add(r.id)
                    else next.delete(r.id)
                    return next
                  })}
                />
                <b>{r.title}</b>
              </label>
              <p className="hint">{formatDate(r.date)} · {r.hours}h · {r.project}{r.otj ? ' · off-the-job learning' : ''}</p>
              <p>{r.work}</p>
              <p className="hint">Learning: {r.learn}</p>
              <div className="chips">{r.codes.length ? r.codes.map(c => <Code key={c} code={c} />) : <span className="hint">No KSB mappings supplied</span>}</div>
            </div>
          ))}
          <button className="btn primary" disabled={saving} onClick={save}>Save selected activities</button>
        </section>
      )}
      <div className="notice section-space">This import reads a file you choose. A direct live connection needs the name of the source app and the data you want to sync.</div>
    </div>
  )
}
