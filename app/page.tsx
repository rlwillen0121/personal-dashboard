"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import DailyBrief from "@/components/daily-brief"
import { AgentStatus } from "@/components/agent-status"
import { AgentActivity } from "@/components/agent-activity"
import { ArbTracking } from "@/components/arb-tracking"
import { ArbDetailedView } from "@/components/arb-detailed-view"
import { DailyTasks } from "@/components/daily-tasks"
import Office8Bit from "@/components/office-8bit"
import ReefOfficeCanvas from "@/components/reef-office-canvas"
import { useState } from "react"

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("")

  const renderContent = () => {
    switch (activeSection) {
      case "brief":
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><DailyBrief /></div>
      case "agents":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AgentStatus />
            <AgentActivity />
          </div>
        )
      case "arb":
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Arbitrage Dashboard</h2>
            <ArbTracking />
          </div>
        )
      case "tasks":
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><DailyTasks /></div>
      case "office":
        return (
          <div className="w-full">
            <ReefOfficeCanvas />
          </div>
        )
      default:
        // Return to the original grid layout the user liked (non-scrolling main view)
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DailyBrief />
            <AgentStatus />
            <ArbTracking />
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
