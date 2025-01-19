import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/sign-in')
  }

  // Get user's workspaces
  const { data: workspaceUsers } = await supabase
    .from('workspace_users')
    .select('workspace_id')
    .eq('user_id', session.user.id)

  const workspaceIds = workspaceUsers?.map(wu => wu.workspace_id) || []

  // Get workspace details
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', workspaceIds)

  // Get user's selected workspace
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_workspace_id')
    .eq('user_id', session.user.id)
    .single()

  const currentWorkspace = workspaces?.find(w => w.id === userSettings?.selected_workspace_id)

  return (
    <div className="h-screen flex">
      <Sidebar 
        workspaces={workspaces || []}
        currentWorkspace={currentWorkspace}
        user={session.user}
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
} 