import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

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

  // Simplified query to get record types with more debugging
  const { data: recordTypes, error: recordTypesError } = await supabase
    .from('record_types')
    .select('*')
    .eq('is_system', true)

  console.log('Auth Session:', session)
  console.log('Record Types Query:', { recordTypes, error: recordTypesError })
  console.log('Current Workspace:', currentWorkspace)

  // Get user's selected record type
  const { data: userSettingsRecordType, error: userSettingsError } = await supabase
    .from('user_settings')
    .select('selected_record_type_id')
    .eq('user_id', session.user.id)
    .single()

  console.log('User Settings:', { userSettings: userSettingsRecordType, error: userSettingsError })

  const selectedRecordType = recordTypes?.find(rt => rt.id === userSettingsRecordType?.selected_record_type_id)
  console.log('Selected Record Type:', selectedRecordType)

  return (
    <div className="h-screen flex">
      <Sidebar 
        workspaces={workspaces || []}
        currentWorkspace={currentWorkspace}
        recordTypes={recordTypes || []}
        selectedRecordType={selectedRecordType}
        user={session.user}
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
} 