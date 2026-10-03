import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatDate, progress, stateOf, STATE_TEXT } from '@/lib/ksb'
import type { Activity, Ksb } from '@/lib/types'

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  log: <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M15 3l6 6M9 15l3-1 9-9-3-3-9 9z" />,
  progress: <path d="M4 20V10m8 10V4m8 16v-7" />,
  report: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  spark: <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  file: <path d="M14 2H6v20h14V8zM14 2v6h6M8 13h8M8 17h5" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  alert: <path d="m12 3 10 18H2zM12 9v5M12 17h.01" />,
}

export type IconName = keyof typeof ICONS

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name] ?? ICONS.file}
    </svg>
  )
}

export function LinkButton({ href, primary, icon, children }: { href: string; primary?: boolean; icon?: IconName; children: ReactNode }) {
  return (
    <Link className={`btn ${primary ? 'primary' : ''}`} href={href}>
      {icon && <Icon name={icon} />}
      {children}
    </Link>
  )
}

export function PageHead({ title, sub, actions, eyebrow }: { title: ReactNode; sub: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p className="subtitle">{sub}</p>
      </div>
      <div className="buttons">{actions}</div>
    </div>
  )
}

export function Code({ code }: { code: string }) {
  return <span className={`code ${code.startsWith('S') ? 'skill' : code.startsWith('B') ? 'behaviour' : ''}`}>{code}</span>
}

export function Bar({ k, logs }: { k: Ksb; logs: Activity[] }) {
  const p = progress(k, logs)
  return (
    <div className="bar-row">
      <div className="bar" role="progressbar" aria-label={`${k.code} evidence coverage`} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className={`fill ${stateOf(k, logs)}`} style={{ width: `${p}%` }} />
      </div>
      <span className="percent">{p}%</span>
    </div>
  )
}

export function KsbRow({ k, logs }: { k: Ksb; logs: Activity[] }) {
  const s = stateOf(k, logs)
  return (
    <Link href={`/ksb/${k.code}`} className="ksb-row">
      <div className="row-top">
        <Code code={k.code} />
        <span className="ksb-title">{k.title}</span>
        <span className={`status ${s}`}>{STATE_TEXT[s]}</span>
      </div>
      <Bar k={k} logs={logs} />
    </Link>
  )
}

export function ActivityItem({ l }: { l: Activity }) {
  return (
    <div className="activity">
      <div className="activity-icon"><Icon name="file" /></div>
      <div className="activity-info">
        <div className="activity-title">{l.title}</div>
        <div className="activity-meta">
          {formatDate(l.date)} · {l.project} · {l.files.length} evidence reference{l.files.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="chips">{l.codes.slice(0, 3).map(c => <Code key={c} code={c} />)}</div>
      <span className="hour">{l.hours}h</span>
    </div>
  )
}
