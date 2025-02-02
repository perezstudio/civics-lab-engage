'use client'

import {useCallback, useEffect, useState} from 'react'
import {DataGrid} from './DataGrid'
import {FilterBar} from './FilterBar'

interface Column {
  field: string
  header: string
  sortable?: boolean
  render?: (value: any) => React.ReactNode
}

type Operator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'

interface Filter {
  id: string
  field: string
  operator: Operator
  value: string
}

interface DataSheetProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

export function DataSheet({
                            columns,
                            data,
                            onRowClick,
                            onEdit,
                            onDelete,
                          }: DataSheetProps) {
  const [filteredData, setFilteredData] = useState(data)
  const [filters, setFilters] = useState<Filter[]>([])  // Add this line

  const handleFiltersChange = useCallback((newFilters: Filter[]) => {
    setFilters(newFilters)  // Add this line

    // If there are no filters, show all data
    if (!newFilters || newFilters.length === 0) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(row => {
      return newFilters.every(filter => {
        // Skip empty filters
        if (!filter.field || (!filter.value && !['isEmpty', 'isNotEmpty'].includes(filter.operator))) {
          return true
        }

        const getValue = (obj: any, field: string) => {
          if (['first_name', 'middle_name', 'last_name', 'race', 'gender', 'pronouns'].includes(field)) {
            return obj.contact_records?.[field]
          }
          if (field === 'phone_numbers') {
            return (obj.record_phones || [])
                .filter((p: any) => p.is_primary)
                .map((p: any) => p.phone)
                .join(', ')
          }
          if (field === 'emails') {
            return (obj.record_emails || [])
                .filter((e: any) => e.is_primary)
                .map((e: any) => e.email)
                .join(', ')
          }
          return obj[field]
        }

        const value = getValue(row, filter.field)
        if (value === null || value === undefined) {
          // For isEmpty/isNotEmpty operators, null/undefined should be treated as empty
          if (filter.operator === 'isEmpty') return true
          if (filter.operator === 'isNotEmpty') return false
          return false
        }

        const stringValue = String(value).toLowerCase()
        const filterValue = filter.value?.toLowerCase() || ''

        switch (filter.operator) {
          case 'contains':
            return stringValue.includes(filterValue)
          case 'equals':
            return stringValue === filterValue
          case 'startsWith':
            return stringValue.startsWith(filterValue)
          case 'endsWith':
            return stringValue.endsWith(filterValue)
          case 'isEmpty':
            return !stringValue
          case 'isNotEmpty':
            return !!stringValue
          default:
            return true
        }
      })
    })

    setFilteredData(filtered)
  }, [data])

  // Update filteredData when data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  return (
      <div className="flex flex-col gap-4">
        <FilterBar
            columns={columns}
            filters={filters}  // Pass filters state here
            onFiltersChange={handleFiltersChange}
        />
        <div className="flex-1 overflow-auto">
          <DataGrid
              columns={columns}
              data={filteredData}
              onRowClick={onRowClick}
              onEdit={onEdit}
              onDelete={onDelete}
          />
        </div>
      </div>
  )
}