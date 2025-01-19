import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { WorkspaceSetup } from '@/components/dashboard/WorkspaceSetup'
import { DataView } from '@/components/dashboard/DataView'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/sign-in')
  }

  // Get user's workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .single()

  // If no workspace exists, show workspace setup
  if (!workspace) {
    return <WorkspaceSetup />
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DataView />
      </main>
    </div>
  )
}
