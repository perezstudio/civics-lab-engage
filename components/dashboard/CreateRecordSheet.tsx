'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FieldDefinition {
  id: string
  name: string
  key: string
  type: string
  is_multiple: boolean
  linked_record_type?: string
}

interface CreateRecordSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordType: {
    id: string
    name: string
    slug: string
  }
  workspaceId: string
  fields: FieldDefinition[]
  onRecordCreated?: () => void
}

export function CreateRecordSheet({
  open,
  onOpenChange,
  recordType,
  workspaceId,
  fields,
  onRecordCreated
}: CreateRecordSheetProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [linkedRecords, setLinkedRecords] = useState<Record<string, any[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const fetchLinkedRecords = async (recordType: string) => {
    const { data, error } = await supabase
      .from('records')
      .select(`
        id,
        ${recordType}_records (*)
      `)
      .eq('workspace_id', workspaceId)
      .eq('record_type_id', recordType)

    if (error) {
      console.error('Error fetching linked records:', error)
      return []
    }

    return data || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: record, error: recordError } = await supabase
        .from('records')
        .insert({
          workspace_id: workspaceId,
          record_type_id: recordType.id
        })
        .select()
        .single()

      if (recordError) throw recordError

      const specificTableName = `${recordType.slug}_records`
      const regularData: Record<string, any> = {}
      const multipleFieldsData: Record<string, any[]> = {}

      Object.entries(formData).forEach(([key, value]) => {
        const field = fields.find(f => f.key === key)
        if (field?.is_multiple) {
          multipleFieldsData[key] = Array.isArray(value) ? value : [value]
        } else {
          regularData[key] = value
        }
      })

      const { error: specificError } = await supabase
        .from(specificTableName)
        .insert({
          record_id: record.id,
          ...regularData
        })

      if (specificError) throw specificError

      for (const [key, values] of Object.entries(multipleFieldsData)) {
        const field = fields.find(f => f.key === key)
        if (!field) continue

        const junctionTableName = `${recordType.slug}_${key}`
        const multipleRecords = values.map(value => ({
          record_id: record.id,
          ...value
        }))

        const { error: multipleError } = await supabase
          .from(junctionTableName)
          .insert(multipleRecords)

        if (multipleError) throw multipleError
      }

      onOpenChange(false)
      setFormData({})
      onRecordCreated?.()
    } catch (error) {
      console.error('Error creating record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderField = (field: FieldDefinition) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.name}</Label>
            <Input
              id={field.key}
              value={formData[field.key] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                [field.key]: e.target.value
              }))}
            />
          </div>
        )
      
      case 'donation_status':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.name}</Label>
            <Select
              value={formData[field.key] || ''}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                [field.key]: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promise">Promise</SelectItem>
                <SelectItem value="donated">Donated</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'email':
      case 'phone':
      case 'social_media':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.name}</Label>
            <div className="space-y-2">
              {(formData[field.key] || ['']).map((item: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item.value || ''}
                    onChange={(e) => {
                      const newValues = [...(formData[field.key] || [])]
                      newValues[index] = {
                        ...newValues[index],
                        value: e.target.value
                      }
                      setFormData(prev => ({
                        ...prev,
                        [field.key]: newValues
                      }))
                    }}
                    placeholder={`Enter ${field.name.toLowerCase()}`}
                  />
                  <Select
                    value={item.type || ''}
                    onValueChange={(value) => {
                      const newValues = [...(formData[field.key] || [])]
                      newValues[index] = {
                        ...newValues[index],
                        type: value
                      }
                      setFormData(prev => ({
                        ...prev,
                        [field.key]: newValues
                      }))
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.type === 'email' && (
                        <>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                      {field.type === 'phone' && (
                        <>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                      {field.type === 'social_media' && (
                        <>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <Select
                    value={item.status || ''}
                    onValueChange={(value) => {
                      const newValues = [...(formData[field.key] || [])]
                      newValues[index] = {
                        ...newValues[index],
                        status: value
                      }
                      setFormData(prev => ({
                        ...prev,
                        [field.key]: newValues
                      }))
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newValues = [...(formData[field.key] || [])]
                      newValues.splice(index, 1)
                      setFormData(prev => ({
                        ...prev,
                        [field.key]: newValues
                      }))
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    [field.key]: [...(prev[field.key] || []), { value: '', type: '', status: '' }]
                  }))
                }}
              >
                Add {field.name}
              </Button>
            </div>
          </div>
        )

      case 'linked_record':
        if (!field.linked_record_type) return null
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.name}</Label>
            <Select
              value={formData[field.key] || ''}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                [field.key]: value
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.name}`} />
              </SelectTrigger>
              <SelectContent>
                {linkedRecords[field.linked_record_type]?.map((record: any) => (
                  <SelectItem key={record.id} value={record.id}>
                    {record[`${field.linked_record_type}_records`]?.name || record.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] flex flex-col h-full overflow-hidden">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>New {recordType.name}</SheetTitle>
          <SheetDescription>
            Add a new {recordType.name.toLowerCase()} record to your workspace.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 py-6">
            {fields.map(renderField)}
          </div>

          <SheetFooter className="flex-shrink-0 border-t pt-4">
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
} 