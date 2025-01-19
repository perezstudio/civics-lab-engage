'use client'

import { createWorkspaceAction } from '@/app/actions'
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
import { FormMessage } from '@/components/form-message'
import { SubmitButton } from '@/components/submit-button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  // ... add all states
]

export function WorkspaceSetup() {
  const [type, setType] = useState<string>('campaign')
  const [message, setMessage] = useState<{ error?: string }>({})
  const router = useRouter()
  
  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createWorkspaceAction(formData)
      if (result.error) {
        setMessage({ error: result.error })
      } else if (result.success) {
        // Use router.push for client-side navigation
        router.push('/app/engage')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setMessage({ error: 'An unexpected error occurred' })
    }
  }
  
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Set Up Your Workspace</h1>
      
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Workspace Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter workspace name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select name="type" value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select workspace type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="state_party">State Party</SelectItem>
              <SelectItem value="county_party">County Party</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Select name="state" required>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === 'county_party' && (
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Input
              id="county"
              name="county"
              placeholder="Enter county name"
              required
            />
          </div>
        )}

        {type === 'campaign' && (
          <div className="space-y-2">
            <Label htmlFor="race">Race</Label>
            <Input
              id="race"
              name="race"
              placeholder="e.g., State Senate District 1"
              required
            />
          </div>
        )}

        <SubmitButton>Create Workspace</SubmitButton>
        <FormMessage message={message} />
      </form>
    </div>
  )
} 