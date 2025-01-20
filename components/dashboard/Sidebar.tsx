'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Users, Building2, PiggyBank, Menu, 
  ChevronLeft, Sun, Moon, ChevronDown,
  LogOut, Settings, User, Plus
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { selectWorkspaceAction, signOutAction } from '@/app/actions'
import { supabase } from '@/lib/supabase/client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const menuItems = [
  { name: 'Contacts', icon: Users, href: '/app/contacts' },
  { name: 'Businesses', icon: Building2, href: '/app/businesses' },
  { name: 'Donations', icon: PiggyBank, href: '/app/donations' },
]

interface RecordType {
  id: string
  name: string
  slug: string
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  workspaces?: Array<{
    id: string
    name: string
  }>
  currentWorkspace?: {
    id: string
    name: string
  }
  recordTypes?: RecordType[]
  selectedRecordType?: RecordType
  user?: {
    email: string
    name?: string
  }
}

export function Sidebar({ 
  className, 
  workspaces = [], 
  currentWorkspace,
  recordTypes = [],
  selectedRecordType,
  user,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  console.log('Sidebar Props:', {
    workspaces,
    currentWorkspace,
    recordTypes,
    selectedRecordType,
    user
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleWorkspaceSelect = async (workspaceId: string) => {
    await selectWorkspaceAction(workspaceId)
  }

  const handleRecordTypeSelect = async (recordTypeId: string) => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user?.id,
        selected_record_type_id: recordTypeId,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating record type:', error)
      return
    }

    // Refresh the page to show the new record type
    router.refresh()
  }

  return (
    <div className={cn(
      "border-r flex flex-col h-screen",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="px-3 py-2 border-b">
        {!collapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="truncate">{currentWorkspace?.name || 'Select Workspace'}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((workspace) => (
                <DropdownMenuItem 
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace.id)}
                >
                  {workspace.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/workspace-setup" className="w-full cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
          >
            <Menu size={20} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {recordTypes.map((recordType) => (
              <Button
                key={recordType.id}
                variant={selectedRecordType?.id === recordType.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  collapsed && "justify-center px-2"
                )}
                onClick={() => handleRecordTypeSelect(recordType.id)}
              >
                <RecordTypeIcon type={recordType.slug} className={cn(
                  "h-4 w-4",
                  collapsed ? "mr-0" : "mr-2"
                )} />
                {!collapsed && <span>{recordType.name}</span>}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-3 py-2 border-t">
        {!collapsed && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-5 w-5 mr-2">
                  <AvatarImage src={null} />
                  <AvatarFallback>{user?.name?.[0] || user?.email?.[0]}</AvatarFallback>
                </Avatar>
                <span className="truncate">{user?.name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {mounted && (
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOutAction()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

function RecordTypeIcon({ type, className }: { type: string, className?: string }) {
  switch (type) {
    case 'contacts':
      return <Users className={className} />
    case 'businesses':
      return <Building2 className={className} />
    case 'donations':
      return <PiggyBank className={className} />
    default:
      return null
  }
} 