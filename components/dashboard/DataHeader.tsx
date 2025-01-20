'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover'
import { Plus, Settings } from 'lucide-react'
import { CreateViewDialog } from './CreateViewDialog'
import { CreateRecordSheet } from './CreateRecordSheet'

interface ViewSettings {
  visible_fields: string[]
}

interface View {
  id: string
  name: string
  settings: ViewSettings
}

interface FieldDefinition {
  id: string
  name: string
  key: string
  type: string
  is_multiple: boolean
}

interface DataHeaderProps {
  title?: string;
  subtitle?: string;
  recordType?: string;
  workspaceId?: string;
  fields?: any[];
  views?: View[];
  selectedView?: View | null;
  onViewChange?: (view: View) => void;
  onViewCreated?: (view: View) => void;
  onViewSettingsChange?: (settings: ViewSettings) => void;
}

export function DataHeader({ 
  title = '',
  subtitle,
  recordType = '',
  workspaceId = '',
  fields = [],
  views = [],
  selectedView,
  onViewChange,
  onViewCreated,
  onViewSettingsChange,
}: DataHeaderProps) {
  const [createViewOpen, setCreateViewOpen] = useState(false)
  const [createRecordOpen, setCreateRecordOpen] = useState(false)

  const handleFieldVisibilityChange = (fieldKey: string, checked: boolean) => {
    if (!selectedView?.settings?.visible_fields) return;

    const newVisibleFields = checked
      ? [...selectedView.settings.visible_fields, fieldKey]
      : selectedView.settings.visible_fields.filter(f => f !== fieldKey);

    onViewSettingsChange?.({
      ...selectedView.settings,
      visible_fields: newVisibleFields
    });
  }

  // Debug logging
  console.log('DataHeader props:', { 
    views, 
    selectedView,
    visibleFields: selectedView?.settings?.visible_fields 
  });
  
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-2">
        <Button onClick={() => setCreateRecordOpen(true)}>
          <Plus className="mr-2" size={16} />
          Add New
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {selectedView?.name || 'Default View'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            {views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                onSelect={() => onViewChange?.(view)}
              >
                {view.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setCreateViewOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium leading-none">Visible Fields</h5>
                {Array.isArray(fields) && fields.map(field => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedView?.settings?.visible_fields?.includes(field.key) ?? false}
                      onCheckedChange={(checked) => 
                        handleFieldVisibilityChange(field.key, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={field.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {field.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <CreateViewDialog
          open={createViewOpen}
          onOpenChange={setCreateViewOpen}
          workspaceId={workspaceId}
          recordType={recordType}
          fields={fields}
          onViewCreated={(view) => {
            onViewCreated?.(view);
            setCreateViewOpen(false);
          }}
        />

        <CreateRecordSheet
          open={createRecordOpen}
          onOpenChange={setCreateRecordOpen}
          recordType={{
            id: recordType || '',
            name: title || '',
            slug: recordType || ''
          }}
          workspaceId={workspaceId}
          fields={fields}
          onRecordCreated={() => {
            setCreateRecordOpen(false);
          }}
        />
      </div>
    </div>
  )
} 