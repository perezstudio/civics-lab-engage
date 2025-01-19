'use client'

import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover'
import { Plus, Settings } from 'lucide-react'

export function DataHeader({ selectedView, onViewChange }) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold">Contacts</h1>
      
      <div className="flex items-center gap-2">
        <Button>
          <Plus className="mr-2" size={16} />
          Add New
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedView?.name || 'Default View'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* View options will go here */}
            <DropdownMenuItem>Create New View...</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {/* View settings will go here */}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 