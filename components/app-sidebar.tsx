"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  CheckSquare,
  Activity,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  onNavigate?: (sectionId: string) => void
  activeSection?: string
}

const items = [
  {
    title: "Dashboard",
    section: "",
    icon: LayoutDashboard,
  },
  {
    title: "Daily Brief",
    section: "brief",
    icon: Calendar,
  },
  {
    title: "Agent Status",
    section: "agents",
    icon: Activity,
  },
  {
    title: "Polymarket",
    section: "polymarket",
    icon: Wallet,
  },
  {
    title: "Tasks",
    section: "tasks",
    icon: CheckSquare,
  },
]

export function AppSidebar({ onNavigate, activeSection }: AppSidebarProps) {
  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    }
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6 border-b border-border">
        <h2 className="text-xl font-black italic text-primary flex items-center gap-2 tracking-tighter">
          CLAW <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/20 px-1.5 py-0.5 rounded not-italic">v2.1</span>
        </h2>
      </SidebarHeader>
      <SidebarContent className="p-2 pt-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-4">Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => handleNavigate(item.section)}
                    className={`hover:bg-primary/10 hover:text-primary transition-all duration-200 py-6 px-4 rounded-lg group ${
                      activeSection === item.section ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm tracking-tight">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
