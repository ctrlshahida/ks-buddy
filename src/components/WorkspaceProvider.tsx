'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchRecords, insertRecord } from '@/lib/records'
import { SEED_KSBS, firstOfPreviousMonth, today } from '@/lib/ksb'
import { SEED_LOGS } from '@/lib/seed'
import type { Activity, ChatMessage, Draft, Ksb, Suggestion } from '@/lib/types'

export type User = { name: string; email: string }

type Workspace = {
  user: User
  /** No Supabase configured: records live in this browser's localStorage. */
  preview: boolean
  logs: Activity[]
  ksbs: Ksb[]
  demoMode: boolean
  setDemoMode: (v: boolean) => void
  storageError: string
  draft: Draft | null
  setDraft: (d: Draft | null) => void
  suggestions: Suggestion[]
  setSuggestions: (s: Suggestion[]) => void
  buddyMessages: ChatMessage[]
  setBuddyMessages: (updater: (m: ChatMessage[]) => ChatMessage[]) => void
  buddyBusy: boolean
  setBuddyBusy: (b: boolean) => void
  reportStart: string
  reportEnd: string
  setReportPeriod: (start: string, end: string) => void
  /** Saves activities to Supabase; throws if any insert fails. Returns how many were saved. */
  saveRecords: (items: Activity[]) => Promise<number>
  /** Clears the in-progress conversation after a successful save. */
  resetCapture: () => void
  toast: (message: string) => void
}

const Ctx = createContext<Workspace | null>(null)

export function useWorkspace() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}

const PREVIEW_KEY = 'ks-buddy-preview-records'

export function WorkspaceProvider({ user, preview = false, children }: { user: User; preview?: boolean; children: ReactNode }) {
  const supabase = useMemo(() => (preview ? null : createClient()), [preview])
  const [saved, setSaved] = useState<Activity[]>([])
  const [demoMode, setDemoMode] = useState(false)
  const [storageError, setStorageError] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [buddyMessages, setBuddyMessages] = useState<ChatMessage[]>([])
  const [buddyBusy, setBuddyBusy] = useState(false)
  const [period, setPeriod] = useState({ start: firstOfPreviousMonth(), end: today() })
  const [toastText, setToastText] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const toast = useCallback((message: string) => {
    setToastText(message)
    setToastVisible(true)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastVisible(false), 3200)
  }, [])

  useEffect(() => {
    if (!supabase) {
      try {
        setSaved(JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? '[]'))
      } catch {}
      return
    }
    let cancelled = false
    fetchRecords(supabase)
      .then(rows => {
        if (cancelled) return
        setSaved(rows)
        setStorageError('')
      })
      .catch(() => {
        if (!cancelled) setStorageError('Your saved record is unavailable. You can still write your day; saving will be available when the connection is restored.')
      })
    return () => {
      cancelled = true
    }
  }, [supabase])

  const saveRecords = useCallback(
    async (items: Activity[]) => {
      let count = 0
      try {
        for (const item of items) {
          if (supabase) await insertRecord(supabase, item)
          count++
          setSaved(prev => [item, ...prev])
        }
        if (!supabase) {
          try {
            const all = [...items].reverse().concat(JSON.parse(localStorage.getItem(PREVIEW_KEY) ?? '[]'))
            localStorage.setItem(PREVIEW_KEY, JSON.stringify(all))
          } catch {}
        }
      } catch (err) {
        throw Object.assign(err instanceof Error ? err : Error('Could not save'), { savedCount: count })
      }
      return count
    },
    [supabase],
  )

  const resetCapture = useCallback(() => {
    setDraft(null)
    setSuggestions([])
    setBuddyMessages(() => [])
  }, [])

  const logs = useMemo(() => (demoMode ? [...saved, ...SEED_LOGS] : saved), [demoMode, saved])
  const ksbs = useMemo(() => SEED_KSBS.map(k => ({ ...k, base: demoMode ? k.base : 0 })), [demoMode])

  const value: Workspace = {
    user,
    preview,
    logs,
    ksbs,
    demoMode,
    setDemoMode,
    storageError,
    draft,
    setDraft,
    suggestions,
    setSuggestions,
    buddyMessages,
    setBuddyMessages,
    buddyBusy,
    setBuddyBusy,
    reportStart: period.start,
    reportEnd: period.end,
    setReportPeriod: (start, end) => setPeriod({ start, end }),
    saveRecords,
    resetCapture,
    toast,
  }

  return (
    <Ctx.Provider value={value}>
      {children}
      <div id="toast" role="status" className={toastVisible ? 'show' : ''}>{toastText}</div>
    </Ctx.Provider>
  )
}
