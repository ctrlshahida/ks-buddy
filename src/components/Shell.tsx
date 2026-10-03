'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { signOut } from '@/app/login/actions'
import { Buddy } from './Buddy'
import { Icon, type IconName } from './ui'
import { useWorkspace } from './WorkspaceProvider'

const NAV: [string, string, IconName][] = [
  ['/', 'Talk to Buddy', 'spark'],
  ['/log', 'Daily log', 'log'],
  ['/progress', 'Progress & gaps', 'progress'],
  ['/report', 'Reports', 'report'],
  ['/import', 'Import data', 'file'],
]

const CRUMBS: Record<string, string> = {
  '': 'Talk to Buddy',
  log: 'Daily log',
  analysis: 'AI analysis',
  progress: 'Progress & gaps',
  report: 'Reports',
  ksb: 'KSB detail',
  history: 'Activity record',
  import: 'Import data',
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('') || '?'

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, preview } = useWorkspace()
  const view = pathname.split('/')[1] ?? ''

  return (
    <>
      <aside className="sidebar">
        <Link className="brand" href="/"><span className="brandmark"><Buddy size={34} mood="wave" face /></span>ks-buddy</Link>
        <div className="workspace">
          <span className="workspace-icon">DA</span>
          <div>My apprenticeship<small>Data analyst · Level 4</small></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {NAV.map(([href, label, icon]) => {
            const route = href.slice(1)
            const active = view === route || (route === '' && ['ksb', 'history'].includes(view))
            return (
              <Link key={href} href={href} className={active ? 'active' : ''}>
                <Icon name={icon} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="side-bottom">
          <div className="demo-label">✧ Your learning companion</div>
          <p>Talk it through.<br />Evidence it later.</p>
          <div className="profile">
            <span className="avatar">{initials(user.name || user.email)}</span>
            <div>
              {user.name || 'Apprentice'}
              <small>{user.email}</small>
              {!preview && <form action={signOut}><button className="signout" type="submit">Sign out</button></form>}
            </div>
          </div>
        </div>
      </aside>
      <div className="shell">
        <header>
          <div id="breadcrumb">Workspace <span>/</span> {CRUMBS[view] ?? 'Overview'}</div>
          <span className="top-label">Your workspace <span className="badge">Sample standard</span></span>
        </header>
        <main id="app">{children}</main>
        <footer>
          <div>Evidence coverage, not a prediction of passing. Buddy’s mappings are suggestions for you to review.</div>
          <div className="attribution">Contains public sector information licensed under the Open Government Licence v3.0. KSB data from Skills England, ST0411.</div>
        </footer>
      </div>
    </>
  )
}
