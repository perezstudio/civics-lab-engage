'use client'

import { useState } from 'react'
import { DataGrid } from './DataGrid'
import { FilterBar } from './FilterBar'

interface Column {
  field: string
  header: string
  sortable?: boolean
  render?: (value: any) => React.ReactNode
}

interface DataSheetProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

export function DataSheet({ columns, data, onRowClick, onEdit, onDelete }: DataSheetProps) {
  const [filters, setFilters] = useState<any[]>([])

  const handleFiltersChange = (newFilters: any[]) => {
    setFilters(newFilters)
  }

  // Apply filters to data
  const filteredData = data.filter(row => {
    if (filters.length === 0) return true
    return filters.every(filter => {
      const value = row[filter.field]
      if (value == null) return false
      
      switch (filter.operator) {
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
        case 'equals':
          return String(value) === String(filter.value)
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filter.value).toLowerCase())
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filter.value).toLowerCase())
        default:
          return true
      }
    })
  })

  console.log('DataSheet received:', { columns, data, filteredData })

  return (
    <div className="flex flex-col gap-4">
      <FilterBar 
        columns={columns} 
        onFiltersChange={handleFiltersChange} 
      />
      <DataGrid
        columns={columns}
        data={filteredData}
        onRowClick={onRowClick}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  )
} 