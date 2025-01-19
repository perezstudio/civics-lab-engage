'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FilterIcon, PlusIcon, XIcon } from 'lucide-react'

type Operator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'

interface Filter {
  id: string
  field: string
  operator: Operator
  value: string
}

interface FilterBarProps {
  columns: { field: string; header: string }[]
  onFiltersChange: (filters: Filter[]) => void
}

export function FilterBar({ columns, onFiltersChange }: FilterBarProps) {
  const [filters, setFilters] = useState<Filter[]>([])

  const operators: { value: Operator; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' },
  ]

  const addFilter = () => {
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      field: columns[0].field,
      operator: 'equals',
      value: '',
    }
    const updatedFilters = [...filters, newFilter]
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const removeFilter = (id: string) => {
    const updatedFilters = filters.filter(f => f.id !== id)
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const updateFilter = (id: string, updates: Partial<Filter>) => {
    const updatedFilters = filters.map(filter => 
      filter.id === id ? { ...filter, ...updates } : filter
    )
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            Filters {filters.length > 0 && `(${filters.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={addFilter}
                className="flex items-center gap-1"
              >
                <PlusIcon className="h-4 w-4" />
                Add Filter
              </Button>
            </div>
            
            <div className="space-y-2">
              {filters.map((filter) => (
                <div 
                  key={filter.id} 
                  className="flex items-center gap-2 bg-muted/50 p-2 rounded-md"
                >
                  <Select
                    value={filter.field}
                    onValueChange={(value) => updateFilter(filter.id, { field: value })}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.field} value={column.field}>
                          {column.header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) => 
                      updateFilter(filter.id, { operator: value as Operator })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
                    <Input
                      value={filter.value}
                      onChange={(e) => 
                        updateFilter(filter.id, { value: e.target.value })
                      }
                      className="h-8"
                      placeholder="Value"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(filter.id)}
                    className="p-1 h-8 w-8"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 