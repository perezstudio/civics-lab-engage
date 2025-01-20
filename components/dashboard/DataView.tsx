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
  const [records, setRecords] = useState<any[]>([])
  const supabase = createClientComponentClient()
  
  // Fetch records for the current record type
  useEffect(() => {
    async function fetchRecords() {
      console.log('Fetching records for:', {
        workspaceId: workspace.id,
        recordTypeId: recordType.id,
        recordTypeSlug: recordType.slug
      })

      // Start with the records table and join all related data
      const { data: records, error } = await supabase
        .from('records')
        .select(`
          id,
          created_at,
          updated_at,
          contact_records!inner (
            record_id,
            first_name,
            middle_name,
            last_name,
            race,
            gender,
            pronouns
          ),
          record_emails (
            id,
            email,
            type,
            is_primary
          ),
          record_phones (
            id,
            phone,
            type,
            is_primary
          ),
          record_addresses (
            id,
            street_1,
            street_2,
            city,
            state,
            postal_code,
            type,
            is_primary
          ),
          record_social_media (
            id,
            platform,
            username,
            url
          )
        `)
        .eq('workspace_id', workspace.id)
        .eq('record_type_id', recordType.id)

      if (error) {
        console.error('Error fetching records:', error)
        return
      }

      console.log('Raw records structure:', JSON.stringify(records, null, 2))

      // Transform the data into the format we need
      const transformedRecords = (records || []).map(record => {
        const contactRecord = record.contact_records
        console.log('Contact record for', record.id, ':', contactRecord)
        
        return {
          id: record.id,
          created_at: record.created_at,
          updated_at: record.updated_at,
          first_name: contactRecord?.first_name || '',
          middle_name: contactRecord?.middle_name || '',
          last_name: contactRecord?.last_name || '',
          race: contactRecord?.race || '',
          gender: contactRecord?.gender || '',
          pronouns: contactRecord?.pronouns || '',
          emails: record.record_emails || [],
          phones: record.record_phones || [],
          addresses: record.record_addresses || [],
          social_media: record.record_social_media || []
        }
      })

      console.log('Setting records:', transformedRecords)
      setRecords(transformedRecords)
    }

    if (workspace.id && recordType.id) {
      fetchRecords()
    }
  }, [workspace.id, recordType.id, recordType.slug])

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

  // Set default view
  useEffect(() => {
    if (!selectedView && fields.length > 0) {
      const defaultView = {
        id: 'default',
        name: 'Default View',
        settings: {
          visible_fields: fields.map(f => f.key)
        }
      };
      setSelectedView(defaultView);
      setViews([defaultView]);
    }
  }, [fields, selectedView]);

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

  // Create columns from visible fields with null checks
  const columns = selectedView?.settings?.visible_fields?.map(fieldKey => {
    const field = fields.find(f => f.key === fieldKey)
    if (!field) return null

    return {
      field: fieldKey,
      header: field.name,
      sortable: true,
      render: (value: any) => {
        if (!value) return ''
        
        if (field.is_multiple) {
          switch (fieldKey) {
            case 'emails':
              return value?.map((e: any) => e.email).join(', ')
            case 'phones':
              return value?.map((p: any) => p.phone).join(', ')
            case 'addresses':
              return value?.map((a: any) => 
                `${a.street_1}${a.street_2 ? `, ${a.street_2}` : ''}, ${a.city}, ${a.state} ${a.postal_code}`
              ).join('; ')
            case 'social_media':
              return value?.map((s: any) => `${s.platform}: ${s.username}`).join(', ')
            default:
              return Array.isArray(value) ? value.join(', ') : value
          }
        }
        return value
      }
    }
  }).filter(Boolean) || []

  console.log('Columns:', columns)
  console.log('Records:', records)

  return (
    <div className="flex flex-col h-full">
      <DataHeader
        views={views}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        onViewCreated={(view) => {
          setViews(prev => [...prev, view])
          setSelectedView(view)
        }}
        onViewSettingsChange={(settings) => {
          if (selectedView) {
            const updatedView = { ...selectedView, settings }
            setSelectedView(updatedView)
            setViews(prev => prev.map(v => v.id === selectedView.id ? updatedView : v))
          }
        }}
      />
      {columns.length > 0 ? (
        <DataSheet 
          columns={columns} 
          data={records}
          onRowClick={() => {}}
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          No columns configured for this view
        </div>
      )}
    </div>
  )
}