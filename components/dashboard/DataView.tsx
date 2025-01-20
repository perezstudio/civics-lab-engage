'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DataHeader } from './DataHeader'
import { DataSheet } from './DataSheet'

interface ViewSettings {
  visible_fields: string[]
  filters: Array<{
    field: string
    operator: string
    value: any
  }>
  sorts: Array<{
    field: string
    direction: 'asc' | 'desc'
  }>
}

interface View {
  id: string
  name: string
  type: string
  settings: ViewSettings
}

interface Workspace {
  id: string
  name: string
}

interface RecordType {
  id: string
  name: string
  slug: string
}

interface FieldDefinition {
  id: string
  name: string
  key: string
  type: string
  is_multiple: boolean
}

interface DataViewProps {
  workspace: Workspace
  recordType: RecordType
}

export function DataView({ workspace, recordType }: DataViewProps) {
  const [views, setViews] = useState<View[]>([])
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const supabase = createClientComponentClient()
  
  // Fetch field definitions
  useEffect(() => {
    async function fetchFields() {
      const { data: fieldDefs, error } = await supabase
        .from('field_definitions')
        .select('*')
        .eq('record_type_id', recordType.id)
      
      if (error) {
        console.error('Error fetching fields:', error)
        return
      }

      setFields(fieldDefs || [])
    }

    fetchFields()
  }, [recordType.id])

  // Fetch views
  useEffect(() => {
    async function fetchViews() {
      const { data: views, error } = await supabase
        .from('views')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('type', recordType.slug)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching views:', error)
        return
      }

      setViews(views || [])
      setSelectedView(views && views.length > 0 ? views[0] : null)
    }

    fetchViews()
  }, [workspace.id, recordType.slug])

  const handleViewChange = (view: View) => {
    setSelectedView(view)
  }

  const handleViewCreated = (newView: View) => {
    setViews(currentViews => [...currentViews, newView])
    setSelectedView(newView)
  }

  const handleViewSettingsChange = async (settings: ViewSettings) => {
    if (!selectedView) return

    const { error } = await supabase
      .from('views')
      .update({ settings })
      .eq('id', selectedView.id)

    if (error) {
      console.error('Error updating view settings:', error)
      return
    }

    setSelectedView({ ...selectedView, settings })
    setViews(currentViews => 
      currentViews.map(view => 
        view.id === selectedView.id 
          ? { ...view, settings } 
          : view
      )
    )
  }

  // Create columns from visible fields
  const columns = selectedView?.settings.visible_fields.map(fieldKey => {
    const field = fields.find(f => f.key === fieldKey)
    return field ? {
      field: fieldKey,
      header: field.name,
      sortable: true,
      visible: true
    } : null
  }).filter(Boolean) || []

  return (
    <div className="h-full flex flex-col">
      <DataHeader 
        title={recordType.name}
        subtitle={workspace.name}
        views={views}
        selectedView={selectedView}
        onViewChange={handleViewChange}
        onViewCreated={handleViewCreated}
        onViewSettingsChange={handleViewSettingsChange}
        workspaceId={workspace.id}
        recordType={recordType.slug}
        fields={fields}
      />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <DataSheet 
          columns={columns}
          data={[]} // You can populate this with actual data
        />
      </div>
    </div>
  )
} 