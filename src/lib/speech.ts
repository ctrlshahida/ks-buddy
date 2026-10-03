'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** The Web Speech API isn't in TypeScript's DOM lib, so describe the bits we use. */
type Recognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type RecognitionCtor = new () => Recognition

function getCtor(): RecognitionCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

/**
 * Browser speech-to-text. `onText` receives each finished phrase; `interim` is the live partial.
 * Audio may be processed by the browser's speech provider.
 */
export function useSpeech(onText: (text: string) => void) {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')
  const rec = useRef<Recognition | null>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText

  useEffect(() => {
    setSupported(!!getCtor())
    return () => rec.current?.stop()
  }, [])

  const stop = useCallback(() => rec.current?.stop(), [])

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return
    setError('')
    const r = new Ctor()
    r.continuous = true
    r.interimResults = true
    r.lang = 'en-GB'
    r.onresult = e => {
      let partial = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) onTextRef.current(res[0].transcript.trim())
        else partial += res[0].transcript
      }
      setInterim(partial)
    }
    r.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setError('Microphone access was blocked. You can type instead.')
      else if (e.error !== 'no-speech' && e.error !== 'aborted') setError('Voice stopped working. You can type instead.')
    }
    r.onend = () => {
      setListening(false)
      setInterim('')
    }
    rec.current = r
    try {
      r.start()
      setListening(true)
    } catch {
      setError('Voice couldn’t start. You can type instead.')
    }
  }, [])

  return { supported, listening, interim, error, start, stop }
}
