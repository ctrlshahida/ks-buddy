'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error?: string; message?: string }

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  })
  if (error) return { error: error.message }
  redirect('/')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '')
  if (password.length < 8) return { error: 'Use a password of at least 8 characters.' }

  const origin = (await headers()).get('origin') ?? ''
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get('email') ?? '').trim(),
    password,
    options: {
      data: { full_name: String(formData.get('name') ?? '').trim() },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
  // With email confirmation on, there is no session yet.
  if (!data.session) return { message: 'Check your email for a confirmation link, then sign in.' }
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
