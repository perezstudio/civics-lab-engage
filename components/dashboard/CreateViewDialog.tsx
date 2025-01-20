'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FieldDefinition {
  id: string
  name: string
  key: string
  type: string
  is_multiple: boolean
}

interface CreateViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: string
  recordType: string
  fields: FieldDefinition[]
  onViewCreated: (view: any) => void
}

export function CreateViewDialog({
  open,
  onOpenChange,
  workspaceId,
  recordType,
  fields,
  onViewCreated
}: CreateViewDialogProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('views')
        .insert({
          name,
          workspace_id: workspaceId,
          type: recordType,
          settings: {
            visible_fields: fields.map(field => field.key),
            filters: [],
            sorts: []
          }
        })
        .select()
        .single()

      if (error) throw error

      onViewCreated(data)
      onOpenChange(false)
      setName('')
    } catch (error) {
      console.error('Error creating view:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New View</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">View Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter view name..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create View'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 