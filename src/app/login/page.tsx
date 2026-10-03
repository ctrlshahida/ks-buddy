import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { supabaseConfigured } from '@/lib/supabase/config'
import { AuthForm } from './AuthForm'

export const metadata: Metadata = { title: 'Sign in — ks-buddy' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!supabaseConfigured) redirect('/')
  const { error } = await searchParams
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="brand"><span className="brandmark">k</span>ks-buddy</div>
        <AuthForm initialError={error === 'confirm' ? 'That confirmation link has expired. Try signing in, or sign up again.' : undefined} />
      </div>
    </div>
  )
}
