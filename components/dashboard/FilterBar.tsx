'use client'

import {useCallback, useEffect, useState} from 'react'
import {Button} from '@/components/ui/button'
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {Input} from '@/components/ui/input'
import {FilterIcon, PlusIcon, XIcon} from 'lucide-react'
import {useSelectedView} from '@/contexts/SelectedViewContext'
import {createClientComponentClient} from '@supabase/auth-helpers-nextjs'

type Operator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'

interface Filter {
  id: string
  field: string
  operator: Operator
  value: string
}

interface Column {
  field: string
  header: string
  sortable?: boolean
}

interface FilterBarProps {
  columns: Column[]
  onFiltersChange: (filters: Filter[]) => void
}

export function FilterBar({ columns, onFiltersChange }: FilterBarProps) {
    const [isInitialized, setIsInitialized] = useState(false)

    const selectedView = useSelectedView()
    const supabase = createClientComponentClient()

    useEffect(() => {
        if (!selectedView || isInitialized) return

        if (selectedView.settings?.filters) {
            onFiltersChange(selectedView.settings.filters)
        }
        setIsInitialized(true)
    }, [selectedView, isInitialized, onFiltersChange])

    const addFilter = async () => {
        if (!selectedView) return

        const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: columns[0]?.field || '',
            operator: 'contains' as Operator,
      value: ''
    }

        const newFilters = [...(selectedView.settings?.filters || []), newFilter]

        const {error} = await supabase
            .from('views')
            .update({
                settings: {
                    ...selectedView.settings,
                    filters: newFilters
                }
            })
            .eq('id', selectedView.id)

        if (error) {
            console.error('Error updating view filters:', error)
            return
        }

    onFiltersChange(newFilters)
  }

    const removeFilter = async (id: string) => {
        if (!selectedView) return

        const newFilters = (selectedView.settings?.filters || []).filter(f => f.id !== id)

        const {error} = await supabase
            .from('views')
            .update({
                settings: {
                    ...selectedView.settings,
                    filters: newFilters
                }
            })
            .eq('id', selectedView.id)

        if (error) {
            console.error('Error updating view filters:', error)
            return
        }

        onFiltersChange(newFilters)
    }

    const updateFilter = useCallback(async (id: string, updates: Partial<Filter>) => {
        if (!selectedView) return

        const newFilters = (selectedView.settings?.filters || []).map(filter => {
      if (filter.id === id) {
        return { ...filter, ...updates }
      }
      return filter
    })

        const {error} = await supabase
            .from('views')
            .update({
                settings: {
                    ...selectedView.settings,
                    filters: newFilters
                }
            })
            .eq('id', selectedView.id)

        if (error) {
            console.error('Error updating view filters:', error)
            return
        }

    onFiltersChange(newFilters)
    }, [selectedView, onFiltersChange])

  const getOperators = (): { value: Operator; label: string }[] => [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'isEmpty', label: 'Is empty' },
    { value: 'isNotEmpty', label: 'Is not empty' }
  ]

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="h-4 w-4" />
            Filters
              {selectedView?.settings?.filters.length > 0 && (
              <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                {selectedView.settings.filters.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="start">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Filters</h4>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={addFilter}
              >
                <PlusIcon className="h-4 w-4" />
                Add Filter
              </Button>
            </div>
            <div className="space-y-4">
                {selectedView?.settings?.filters.map((filter) => (
                <div key={filter.id} className="flex gap-2 items-start">
                  <Select
                    value={filter.field}
                    onValueChange={(value) => updateFilter(filter.id, { field: value })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select field" />
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
                    onValueChange={(value) => updateFilter(filter.id, { operator: value as Operator })}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperators().map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!['isEmpty', 'isNotEmpty'].includes(filter.operator) && (
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
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