'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  width?: number
}

interface DataGridProps {
  columns: Column[]
  data: any[]
  onRowClick?: (row: any) => void
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
}

type SortDirection = 'asc' | 'desc' | null

const MIN_COLUMN_WIDTH = 100
const DEFAULT_COLUMN_WIDTH = 200

export function DataGrid({
  columns,
  data,
  onRowClick,
  onEdit,
  onDelete,
}: DataGridProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const resizingColumn = useRef<{ field: string; startX: number; startWidth: number } | null>(null)
  const isResizing = useRef(false)

  // Load saved column widths from localStorage only once on mount
  useEffect(() => {
    const savedWidths = localStorage.getItem('columnWidths')
    if (savedWidths) {
      try {
        setColumnWidths(JSON.parse(savedWidths))
      } catch (e) {
        console.error('Error loading column widths:', e)
      }
    }
  }, [])

  // Save column widths to localStorage when they change
  useEffect(() => {
    if (Object.keys(columnWidths).length > 0 && !isResizing.current) {
      localStorage.setItem('columnWidths', JSON.stringify(columnWidths))
    }
  }, [columnWidths])

  const handleResizeStart = useCallback((e: React.MouseEvent, field: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    isResizing.current = true
    const currentWidth = columnWidths[field] || DEFAULT_COLUMN_WIDTH
    resizingColumn.current = {
      field,
      startX: e.clientX,
      startWidth: currentWidth,
    }

    const handleResizeMove = (e: MouseEvent) => {
      if (!resizingColumn.current) return

      const diff = e.clientX - resizingColumn.current.startX
      const newWidth = Math.max(MIN_COLUMN_WIDTH, resizingColumn.current.startWidth + diff)
      
      requestAnimationFrame(() => {
        setColumnWidths(prev => ({
          ...prev,
          [resizingColumn.current.field]: newWidth,
        }))
      })
    }

    const handleResizeEnd = () => {
      isResizing.current = false
      resizingColumn.current = null
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
    }

    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
  }, [columnWidths])

  const handleSort = useCallback((field: string, e: React.MouseEvent) => {
    if (resizingColumn.current) return

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
  }, [sortField, sortDirection])

  const sortedData = [...data].sort((a, b) => {
    if (!sortField || !sortDirection) return 0
    
    // Get values considering nested structure
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

    const aValue = getValue(a, sortField) || ''
    const bValue = getValue(b, sortField) || ''
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : 1
    } else {
      return aValue > bValue ? -1 : 1
    }
  })

  return (
    <div className="rounded-md border">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.field}
                  className="relative"
                  style={{ 
                    width: columnWidths[column.field] || DEFAULT_COLUMN_WIDTH,
                    minWidth: columnWidths[column.field] || DEFAULT_COLUMN_WIDTH,
                  }}
                >
                  <div 
                    className={`flex items-center gap-2 ${column.sortable ? 'cursor-pointer' : ''}`}
                    onClick={(e) => column.sortable && handleSort(column.field, e)}
                  >
                    {column.header}
                    {column.sortable && sortField === column.field && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : sortDirection === 'desc' ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : null
                    )}
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-muted-foreground/50"
                    onMouseDown={(e) => handleResizeStart(e, column.field)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableHead>
              ))}
              <TableHead style={{ width: '50px', minWidth: '50px' }} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, index) => (
              <TableRow
                key={row.id || index}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <TableCell 
                    key={column.field}
                    style={{ 
                      width: columnWidths[column.field] || DEFAULT_COLUMN_WIDTH,
                      minWidth: columnWidths[column.field] || DEFAULT_COLUMN_WIDTH,
                    }}
                  >
                    {column.render ? column.render(row) : row[column.field]}
                  </TableCell>
                ))}
                <TableCell style={{ width: '50px', minWidth: '50px' }}>
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
    </div>
  )
} 