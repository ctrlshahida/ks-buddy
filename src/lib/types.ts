export type Activity = {
  id: string
  date: string
  title: string
  work: string
  learn: string
  hours: number
  otj: boolean
  project: string
  codes: string[]
  files: string[]
  mappingReasons?: { code: string; reason: string }[]
  source?: string
  /** Sample activity shown only when "Show example data" is on; never saved. */
  demo?: boolean
}

export type Ksb = { code: string; title: string; base: number }

export type Draft = {
  work: string
  date: string
  hours: number
  project: string
  otj: boolean
  files: string[]
  title?: string
  summary?: string
  learn?: string
}

export type Suggestion = {
  id: string
  reason: string
  accepted: boolean
  confidence: string
}

export type ChatMessage = { who: 'you' | 'buddy'; text: string }

export type ProgressState = 'strong' | 'progressing' | 'attention' | 'empty'
