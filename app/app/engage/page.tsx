import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DataView } from '@/components/dashboard/DataView'

export default async function EngagePage() {
  const supabase = createServerComponentClient({ cookies })

  // Get user's selected workspace
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_workspace_id')
    .single()

  // Get workspace details
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', userSettings?.selected_workspace_id)
    .single()

  if (!workspace) {
    redirect('/workspace-setup')
  }

  return <DataView workspace={workspace} />
} 