"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import DailyBrief from "@/components/daily-brief"
import { AgentStatus } from "@/components/agent-status"
import { PolymarketPrices } from "@/components/polymarket-prices"
import { DailyTasks } from "@/components/daily-tasks"
import { useState } from "react"

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("")

  const renderContent = () => {
    switch (activeSection) {
      case "brief":
        return <div className="w-full"><DailyBrief /></div>
      case "agents":
        return <div className="w-full"><AgentStatus /></div>
      case "polymarket":
        return <div className="w-full"><PolymarketPrices /></div>
      case "tasks":
        return <div className="w-full"><DailyTasks /></div>
      default:
        // Return to the original grid layout the user liked (non-scrolling main view)
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DailyBrief />
            <AgentStatus />
            <PolymarketPrices />
            <DailyTasks />
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar onNavigate={setActiveSection} activeSection={activeSection} />
        <main className="flex-1 p-8 bg-background overflow-hidden h-screen">
          <div className="max-w-7xl mx-auto space-y-8 h-full flex flex-col">
            <header className="flex justify-between items-center shrink-0">
              <h1 className="text-3xl font-bold tracking-tight text-foreground line-clamp-1">
                {activeSection === "" ? "Dashboard Overview" : "Section Detail"}
              </h1>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </header>

            <div className="flex-1 min-h-0">
                {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
