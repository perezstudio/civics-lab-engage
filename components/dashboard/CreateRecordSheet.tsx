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
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First create the base record
      const { data: record, error: recordError } = await supabase
        .from('records')
        .insert({
          workspace_id: workspaceId,
          record_type_id: recordType.id
        })
        .select()
        .single()

      if (recordError) throw recordError

      // Then create the specific record type entry
      const specificTableName = `${recordType.slug}_records`
      const specificData = {
        record_id: record.id,
        ...formData
      }

      const { error: specificError } = await supabase
        .from(specificTableName)
        .insert(specificData)

      if (specificError) throw specificError

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

      // Add more field types as needed
      default:
        return null
    }
  }

  const getBaseFields = () => {
    switch (recordType.slug) {
      case 'contacts':
        return ['first_name', 'middle_name', 'last_name', 'race', 'gender', 'pronouns']
      case 'businesses':
        return ['business_name']
      case 'donations':
        return ['amount', 'status']
      default:
        return []
    }
  }

  const baseFields = fields.filter(field => getBaseFields().includes(field.key))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px]">
        <SheetHeader>
          <SheetTitle>New {recordType.name}</SheetTitle>
          <SheetDescription>
            Add a new {recordType.name.toLowerCase()} record to your workspace.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="space-y-4">
            {baseFields.map(renderField)}
          </div>

          <SheetFooter>
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