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

export function DataSheet({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
}: DataSheetProps) {
  const [filteredData, setFilteredData] = useState(data)

  const handleFiltersChange = (filters: any[]) => {
    if (filters.length === 0) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.field]
        const filterValue = filter.value.toLowerCase()

        switch (filter.operator) {
          case 'equals':
            return value?.toLowerCase() === filterValue
          case 'contains':
            return value?.toLowerCase().includes(filterValue)
          case 'startsWith':
            return value?.toLowerCase().startsWith(filterValue)
          case 'endsWith':
            return value?.toLowerCase().endsWith(filterValue)
          case 'isEmpty':
            return !value || value.length === 0
          case 'isNotEmpty':
            return value && value.length > 0
          default:
            return true
        }
      })
    })

    setFilteredData(filtered)
  }

  return (
    <div className="space-y-4">
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