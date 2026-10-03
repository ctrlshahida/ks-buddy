import type { Activity, Ksb, ProgressState } from './types'

export const SEED_KSBS: Ksb[] = (
  [
    ['K1', 'Understanding business processes', 80],
    ['K2', 'Data quality and validation', 75],
    ['K3', 'Data protection and ethics', 45],
    ['K4', 'Statistical principles', 0],
    ['S1', 'Collect and organise data', 85],
    ['S3', 'Analyse and interpret data', 60],
    ['S6', 'Present information to stakeholders', 25],
    ['S8', 'Apply statistical techniques', 0],
    ['B1', 'Collaborates with others', 70],
    ['B2', 'Takes responsibility for own work', 90],
  ] as const
).map(([code, title, base]) => ({ code, title, base }))

export const KSB_CODES = SEED_KSBS.map(k => k.code)

export const PROJECTS = ['Reporting', 'Data quality', 'Business processes', 'Communication', 'Training', 'Other']

export const progress = (k: Ksb, logs: Activity[]) =>
  Math.min(100, k.base + logs.filter(l => !l.demo && l.codes.includes(k.code)).length * 5)

export const stateOf = (k: Ksb, logs: Activity[]): ProgressState => {
  const p = progress(k, logs)
  return p >= 75 ? 'strong' : p >= 40 ? 'progressing' : p > 0 ? 'attention' : 'empty'
}

export const STATE_TEXT: Record<ProgressState, string> = {
  strong: 'Strong evidence',
  progressing: 'Progressing',
  attention: 'Needs attention',
  empty: 'No evidence yet',
}

export const kindOf = (code: string) =>
  code.startsWith('K') ? 'Knowledge' : code.startsWith('S') ? 'Skill' : 'Behaviour'

export const averageProgress = (ksbs: Ksb[], logs: Activity[]) =>
  Math.round(ksbs.reduce((s, k) => s + progress(k, logs), 0) / ksbs.length)

export const totalOtjHours = (logs: Activity[]) => logs.filter(l => l.otj).reduce((s, l) => s + l.hours, 0)

export const mappedActivities = (k: Ksb, logs: Activity[]) => logs.filter(l => l.codes.includes(k.code))

export const formatDate = (d: string) =>
  new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const pad = (n: number) => String(n).padStart(2, '0')
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const today = () => isoDate(new Date())
export const firstOfPreviousMonth = () => {
  const d = new Date()
  return isoDate(new Date(d.getFullYear(), d.getMonth() - 1, 1))
}
