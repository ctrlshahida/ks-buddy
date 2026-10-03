import { redirect } from 'next/navigation'
import { Shell } from '@/components/Shell'
import { WorkspaceProvider } from '@/components/WorkspaceProvider'
import { supabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) {
    return (
      <WorkspaceProvider user={{ name: 'Alex Johnson', email: 'Preview mode' }} preview>
        <Shell>{children}</Shell>
      </WorkspaceProvider>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) redirect('/login')

  const email = data.user.email ?? ''
  const name = String(data.user.user_metadata?.full_name ?? '').trim()

  return (
    <WorkspaceProvider user={{ name, email }}>
      <Shell>{children}</Shell>
    </WorkspaceProvider>
  )
}
