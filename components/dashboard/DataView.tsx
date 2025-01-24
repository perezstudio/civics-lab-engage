'use client'

import {useEffect, useState} from 'react'
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs'
import {DataHeader} from './DataHeader'
import {DataSheet} from './DataSheet'
import {SelectedViewProvider} from '../../contexts/SelectedViewContext'

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
  const [columns, setColumns] = useState<any[]>([])
  const supabase = createClientComponentClient()
  
  // Fetch records for the current record type
  useEffect(() => {
    async function fetchRecords() {
      if (!workspace.id || !recordType.id) return;

      const { data: records, error } = await supabase
        .from('records')
        .select(`
          id,
          created_at,
          updated_at,
          contact_records!inner (
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
        .eq('record_type_id', recordType.id);

      if (error) {
        console.error('Error fetching records:', error);
        return;
      }

      setRecords(records || []);
    }

    fetchRecords();
  }, [workspace.id, recordType.id]);

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
      updateColumns(fieldDefs || [], selectedView?.settings?.visible_fields)
    }

    fetchFields()
  }, [recordType.id, selectedView])

  // Fetch views
  useEffect(() => {
    async function fetchViews() {
      const { data: viewsData, error } = await supabase
        .from('views')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('type', recordType.slug)
      
      if (error) {
        console.error('Error fetching views:', error)
        return
      }

      setViews(viewsData || [])
      if (viewsData?.length > 0 && !selectedView) {
        setSelectedView(viewsData[0])
      }
    }

    fetchViews()
  }, [workspace.id, recordType.slug, selectedView])

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

  // Update columns when fields or view settings change
  const updateColumns = (fields: any[], visibleFields?: string[]) => {
    const newColumns = fields
      .filter(field => !visibleFields || visibleFields.includes(field.key))
      .map(field => ({
        field: field.key,
        header: field.name,
        sortable: true,
        render: (rowData: any) => {
          console.log('Rendering field:', field.key, 'with data:', rowData);
          // Add null check for rowData
          if (!rowData) return '';

          // Handle contact record fields
          if (['first_name', 'middle_name', 'last_name', 'race', 'gender', 'pronouns'].includes(field.key)) {
            return rowData.contact_records?.[field.key] || '';
          }

          // Handle phone numbers
          if (field.key === 'phone_numbers') {
            return (rowData.record_phones || [])
              .filter((p: any) => p.is_primary)
              .map((p: any) => p.phone)
              .join(', ') || '';
          }

          // Handle emails
          if (field.key === 'emails') {
            return (rowData.record_emails || [])
              .filter((e: any) => e.is_primary)
              .map((e: any) => e.email)
              .join(', ') || '';
          }

          // Handle addresses
          if (field.key === 'addresses') {
            const primaryAddress = (rowData.record_addresses || []).find((a: any) => a.is_primary);
            if (primaryAddress) {
              return `${primaryAddress.street_1}${primaryAddress.street_2 ? `, ${primaryAddress.street_2}` : ''}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.postal_code}`;
            }
            return '';
          }

          // Handle social media
          if (field.key === 'social_media') {
            return (rowData.record_social_media || [])
              .map((s: any) => `${s.platform}: ${s.username}`)
              .join(', ') || '';
          }

          // Default fallback
          return rowData[field.key] || '';
        }
      }));

    console.log('Updated columns:', newColumns);
    setColumns(newColumns);
  };

  // Handle view changes
  const handleViewChange = (view: View) => {
    setSelectedView(view)
      // Apply the view's filters
      if (view.settings?.filters) {
          handleFiltersChange(view.settings.filters)
      } else {
          handleFiltersChange([]) // Clear filters if none exist
      }
  }

    // Handle filter changes
    const handleFiltersChange = async (filters: Filter[]) => {
        if (!selectedView) return

        // Update the view settings
        const {error} = await supabase
            .from('views')
            .update({
                settings: {
                    ...selectedView.settings,
                    filters
                }
            })
            .eq('id', selectedView.id)

        if (error) {
            console.error('Error updating view filters:', error)
            return
        }

        // Update local state
        setSelectedView(prev => prev ? {
            ...prev,
            settings: {
                ...prev.settings,
                filters
            }
        } : null)
  }

  const handleViewCreated = (newView: View) => {
    setViews(currentViews => [...currentViews, newView])
    setSelectedView(newView)
  }

  // Handle view settings changes
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
    updateColumns(fields, settings.visible_fields)
    setViews(currentViews => 
      currentViews.map(view => 
        view.id === selectedView.id 
          ? { ...view, settings } 
          : view
      )
    )
  }

  console.log('Columns:', columns)
  console.log('Records:', records)

  return (
      <SelectedViewProvider initialView={selectedView}>
          <div className="flex flex-col h-full">
              <DataHeader
                  title={recordType.name}
                  recordType={recordType.slug}
                  workspaceId={workspace.id}
                  fields={fields}
                  views={views}
                  selectedView={selectedView}
                  onViewChange={handleViewChange}
                  onViewCreated={(view) => {
                      setViews(prev => [...prev, view])
                      setSelectedView(view)
                  }}
                  onViewSettingsChange={handleViewSettingsChange}
              />
              <div className="flex-1 overflow-auto">
                  <DataSheet
                      columns={columns}
                      data={records}
                      selectedView={selectedView}
                      onFiltersChange={handleFiltersChange}
                  />
              </div>
          </div>
      </SelectedViewProvider>
  )
}