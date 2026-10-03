'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp, type AuthState } from './actions'

export function AuthForm({ initialError }: { initialError?: string }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === 'signin' ? signIn : signUp, {
    error: initialError,
  })

  return (
    <>
      <h1 style={{ fontSize: 24 }}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
      <p className="subtitle">Your apprenticeship record is private to you.</p>
      <form action={action}>
        {mode === 'signup' && (
          <div>
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" autoComplete="name" required />
          </div>
        )}
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required />
        </div>
        {state.error && <p className="error" role="alert">{state.error}</p>}
        {state.message && <p className="notice" role="status">{state.message}</p>}
        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <p className="auth-switch">
        {mode === 'signin' ? 'New here?' : 'Already have an account?'}{' '}
        <button type="button" className="text-link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          {mode === 'signin' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </>
  )
}
