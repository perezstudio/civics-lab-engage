'use client'

import { useState } from 'react'
import { DataHeader } from './DataHeader'
import { FilterBar } from './FilterBar'
import { DataSheet } from './DataSheet'

interface Workspace {
  id: string
  name: string
  type: 'state_party' | 'county_party' | 'campaign'
  state: string
  county?: string
  race?: string
}

interface DataViewProps {
  workspace: Workspace
}

export function DataView({ workspace }: DataViewProps) {
  const [selectedView, setSelectedView] = useState(null)
  
  const columns = [
    { field: 'name', header: 'Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone', sortable: true },
  ]

  return (
    <div className="h-full w-full flex flex-col">
      <DataHeader 
        title={workspace.name}
        subtitle={workspace.type === 'campaign' ? workspace.race :
                 workspace.type === 'county_party' ? `${workspace.county} County` :
                 workspace.state}
        selectedView={selectedView}
        onViewChange={setSelectedView}
      />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <FilterBar />
        <DataSheet 
          columns={columns}
          data={[]} // You can populate this with actual data
        />
      </div>
    </div>
  )
} 