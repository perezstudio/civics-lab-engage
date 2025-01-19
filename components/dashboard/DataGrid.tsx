'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'

interface Column {
  field: string
  header: string
  sortable?: boolean
  render?: (value: any) => React.ReactNode
}

interface DataGridProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

type SortDirection = 'asc' | 'desc' | null

export function DataGrid({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
}: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: string) => {
    const column = columns.find(col => col.field === field)
    if (!column?.sortable) return

    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc')
      else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortDirection) return 0
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue === bValue) return 0
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.field}
                className={column.sortable ? 'cursor-pointer select-none' : ''}
                onClick={() => handleSort(column.field)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortField === column.field && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : sortDirection === 'desc' ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : null
                  )}
                </div>
              </TableHead>
            ))}
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow
              key={index}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.field}>
                  {column.render
                    ? column.render(row[column.field])
                    : row[column.field]}
                </TableCell>
              ))}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(row)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(row)
                        }}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 