'use client'

import {createContext, ReactNode, useContext, useState} from 'react'

interface ViewSettings {
    visible_fields: string[]
    filters: Array<{
        id: string
        field: string
        operator: string
        value: string
    }>
    sorts: Array<{
        field: string
        direction: 'asc' | 'desc'
    }>
}

interface View {
    id: string
    name: string
    type: string
    settings: ViewSettings
}

interface SelectedViewContextType {
    selectedView: View | null
    setSelectedView: (view: View | null) => void
}

const SelectedViewContext = createContext<SelectedViewContextType | undefined>(undefined)

export function SelectedViewProvider({
                                         children,
                                         initialView = null
                                     }: {
    children: ReactNode
    initialView?: View | null
}) {
    const [selectedView, setSelectedView] = useState<View | null>(initialView)

    return (
        <SelectedViewContext.Provider value={{selectedView, setSelectedView}}>
            {children}
        </SelectedViewContext.Provider>
    )
}

export function useSelectedView() {
    const context = useContext(SelectedViewContext)
    if (context === undefined) {
        throw new Error('useSelectedView must be used within a SelectedViewProvider')
    }
    return context.selectedView
}

export function useSetSelectedView() {
    const context = useContext(SelectedViewContext)
    if (context === undefined) {
        throw new Error('useSetSelectedView must be used within a SelectedViewProvider')
    }
    return context.setSelectedView
} 