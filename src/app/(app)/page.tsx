'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Buddy } from '@/components/Buddy'
import { ActivityItem, Bar, Code, Icon, LinkButton } from '@/components/ui'
import { useWorkspace } from '@/components/WorkspaceProvider'
import { averageProgress, mappedActivities, progress, today, totalOtjHours } from '@/lib/ksb'
import { useSpeech } from '@/lib/speech'
import { makeSuggestions } from '@/lib/suggest'
import type { Draft } from '@/lib/types'

const FOLLOW_UPS = [
  'Nice. What did you learn from that, or what would you do differently next time?',
  'Thanks, that helps. What clicked for you today, or what are you still figuring out?',
  'Got it. Is there anything you understand better now than you did this morning?',
]

const GROUPS = [
  ['K', 'Knowledge'],
  ['S', 'Skills'],
  ['B', 'Behaviours'],
] as const

export default function TalkToBuddy() {
  const w = useWorkspace()
  const { logs, ksbs, draft, suggestions, buddyMessages, buddyBusy, demoMode, storageError } = w
  const [text, setText] = useState(draft?.work ?? '')
  const [typing, setTyping] = useState(false)
  const [stage, setStage] = useState<'tell' | 'followup'>('tell')
  const [pending, setPending] = useState<Draft | null>(null)
  const own = logs.filter(l => !l.demo)
  const avg = averageProgress(ksbs, logs)
  const firstName = w.user.name.split(/\s+/)[0]
  const speech = useSpeech(heard => setText(t => (t ? `${t.trimEnd()} ${heard}` : heard)))
  const minLength = stage === 'tell' ? 20 : 1
  const mood = speech.listening ? 'listening' : buddyBusy ? 'thinking' : 'wave'

  function analyse(base: Draft, reflection: string) {
    w.setBuddyBusy(true)
    setTimeout(() => {
      const result = makeSuggestions(base)
      w.setDraft(reflection ? { ...result.draft, learn: reflection } : result.draft)
      w.setSuggestions(result.suggestions)
      w.setBuddyBusy(false)
      w.setBuddyMessages(m => [
        ...m,
        { who: 'buddy', text: `Thanks. I’ve picked out ${result.suggestions.length} possible KSB connections. Have a look and change anything that doesn’t fit.` },
      ])
      setStage('tell')
      setPending(null)
    }, 900)
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    speech.stop()
    const form = e.currentTarget
    const said = text.trim()
    if (said.length < minLength || buddyBusy) return

    if (stage === 'tell') {
      const field = (id: string) => form.elements.namedItem(id) as HTMLInputElement
      const next: Draft = {
        work: said,
        date: field('buddy-date').value,
        hours: Number(field('buddy-hours').value),
        otj: field('buddy-otj').checked,
        project: field('buddy-project').value,
        files: [...(field('buddy-files').files ?? [])].map(f => f.name),
      }
      w.setDraft(next)
      setPending(next)
      w.setBuddyMessages(m => [
        ...m,
        { who: 'you', text: said },
        { who: 'buddy', text: FOLLOW_UPS[said.length % FOLLOW_UPS.length] },
      ])
      setText('')
      setStage('followup')
    } else if (pending) {
      w.setBuddyMessages(m => [...m, { who: 'you', text: said }])
      setText('')
      analyse(pending, said)
    }
  }

  function skipFollowUp() {
    speech.stop()
    if (!pending) return
    w.setBuddyMessages(m => [...m, { who: 'you', text: 'Skip, nothing to add.' }])
    setText('')
    analyse(pending, '')
  }

  return (
    <section className="buddy-home">
      <div className="buddy-welcome">
        <Buddy size={132} mood={mood} />
        <div>
          <div className="eyebrow">YOUR DAY. YOUR LEARNING.</div>
          <h1>{firstName ? `Hey ${firstName}. ` : 'Hey. '}Talk to Buddy about your day.</h1>
          <p>Say it out loud, or type it. Buddy will find the learning with you.</p>
        </div>
      </div>
      <div className="buddy-layout">
        <div className="buddy-conversation">
          <div className="buddy-greeting">
            <div>
              <b>Buddy</b>
              <p>What have you been working on today? Tell me the messy version: what you tried, what clicked, or what you’re still figuring out.</p>
            </div>
          </div>
          <div id="messages">
            {buddyMessages.map((m, i) => (
              <div key={i} className={`chat-message ${m.who}`}>
                <span>{m.who === 'you' ? 'You' : 'Buddy'}</span>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          {buddyBusy && <div className="buddy-thinking">Buddy is finding the learning…</div>}
          <form id="buddy-form" onSubmit={onSubmit}>
            <div className="voice-row">
              {speech.supported ? (
                <button
                  type="button"
                  className={`mic ${speech.listening ? 'on' : ''}`}
                  onClick={speech.listening ? speech.stop : speech.start}
                  aria-pressed={speech.listening}
                  disabled={buddyBusy}
                >
                  <Icon name="mic" />
                  {speech.listening ? 'Listening… tap to stop' : stage === 'tell' ? 'Tap and talk to Buddy' : 'Tap and answer'}
                </button>
              ) : (
                <span className="hint">Voice isn’t available in this browser, so type below.</span>
              )}
              {!typing && stage === 'tell' && <button type="button" className="text-link" onClick={() => setTyping(true)}>Prefer to type?</button>}
            </div>
            {speech.error && <div className="error voice-error">{speech.error}</div>}
            {(typing || text || stage === 'followup' || !speech.supported) && (
              <>
                <label className="sr-only" htmlFor="buddy-text">{stage === 'tell' ? 'Tell Buddy about your day' : 'Answer Buddy’s question'}</label>
                <textarea
                  id="buddy-text"
                  placeholder={stage === 'tell' ? 'Today I worked on…' : 'What I learned was…'}
                  rows={4}
                  value={speech.interim ? `${text} ${speech.interim}`.trim() : text}
                  onChange={e => setText(e.target.value)}
                />
              </>
            )}
            <div className="composer-bottom">
              <span>{stage === 'tell' ? 'A few sentences is plenty.' : 'One line is plenty, or skip it.'}</span>
              <div className="buttons">
                {stage === 'followup' && <button type="button" className="btn" onClick={skipFollowUp} disabled={buddyBusy}>Skip</button>}
                <button className="btn primary" type="submit" disabled={buddyBusy || text.trim().length < minLength}>
                  {stage === 'tell' ? 'Send to Buddy' : 'Answer'} <Icon name="spark" />
                </button>
              </div>
            </div>
            <details className="capture-extras" hidden={stage === 'followup'}>
              <summary>Add time, date or an evidence reference</summary>
              <div className="form-grid">
                <div><label htmlFor="buddy-hours">Learning time (hours)</label><input id="buddy-hours" type="number" min={0.25} max={24} step={0.25} defaultValue={1} /></div>
                <div><label htmlFor="buddy-date">Date</label><input id="buddy-date" type="date" defaultValue={today()} max={today()} /></div>
                <div>
                  <label htmlFor="buddy-project">Category</label>
                  <select id="buddy-project">
                    <option>Reporting</option><option>Training</option><option>Communication</option><option>Other</option>
                  </select>
                </div>
              </div>
              <label className="checkline"><input id="buddy-otj" type="checkbox" />This was off-the-job learning</label>
              <label htmlFor="buddy-files" style={{ marginTop: 18 }}>Evidence files (filename references only)</label>
              <input id="buddy-files" type="file" multiple />
            </details>
          </form>
          <div className="conversation-note"><Icon name="spark" /> Buddy’s suggestions are simulated for this demo. You review every mapping. Voice may be processed by your browser’s speech service.</div>
          {storageError && <div className="notice">{storageError}</div>}
          {draft?.summary && stage === 'tell' && (
            <div className="buddy-review">
              <h3>I’ve found {suggestions.length} possible connections.</h3>
              <p>Let’s check the learning and KSB suggestions before saving anything.</p>
              <LinkButton href="/analysis" primary>Review with Buddy</LinkButton>
            </div>
          )}
        </div>
        <aside className="buddy-trackers">
          <div className="trackers-head">
            <h2>Your learning, taking shape</h2>
            <span>{demoMode ? 'Includes sample activities' : 'Your saved activities'}</span>
          </div>
          <div className="simple-metrics">
            <div><b>{own.length}</b><span>activities captured</span></div>
            <div><b>{totalOtjHours(own)}<em>h</em></b><span>off-the-job learning</span></div>
          </div>
          <div className="coverage-inline">
            <div><span>Evidence coverage</span><b>{avg}%</b></div>
            <div className="bar"><div className="fill" style={{ width: `${avg}%` }} /></div>
            <small>{ksbs.filter(k => progress(k, logs) > 0).length} of {ksbs.length} requirements have some evidence</small>
          </div>
          <div className="compact-ksbs">
            {GROUPS.map(([letter, label]) => {
              const group = ksbs.filter(k => k.code.startsWith(letter))
              if (!group.length) return null
              return (
                <div key={letter} className="tracker-group">
                  <h3>{label}</h3>
                  {group.map(k => {
                    const mapped = mappedActivities(k, logs)
                    const refs = mapped.reduce((n, l) => n + l.files.length, 0)
                    return (
                      <Link key={k.code} href={`/ksb/${k.code}`}>
                        <div><Code code={k.code} /><span>{k.title}</span></div>
                        <Bar k={k} logs={logs} />
                        <small>{mapped.length} {mapped.length === 1 ? 'activity' : 'activities'} · {refs} evidence {refs === 1 ? 'reference' : 'references'}</small>
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
          <Link className="text-link" href="/progress">Explore all requirements &amp; gaps</Link>
          <div className="tracker-guidance">
            <h3>{own.length ? 'Keep the story growing.' : 'Your first chat starts your record.'}</h3>
            <p>{own.length ? 'A new context or a reflection can add depth to your evidence.' : 'Once you review and save a conversation, your trackers will update here.'}</p>
          </div>
          <label className="checkline demo-switch">
            <input id="demo-switch" type="checkbox" checked={demoMode} onChange={e => w.setDemoMode(e.target.checked)} /> Show example data
          </label>
          <small>Sample activities stay separate from what you create.</small>
        </aside>
      </div>
      <section className="buddy-recent">
        <div className="card-head">
          <h2>What you’ve been learning</h2>
          <Link className="text-link" href="/history">Your activity record</Link>
        </div>
        {own.length ? own.slice(0, 3).map(l => <ActivityItem key={l.id} l={l} />) : <p className="muted">Your saved conversations will appear here. Tell Buddy about today to begin.</p>}
      </section>
    </section>
  )
}
