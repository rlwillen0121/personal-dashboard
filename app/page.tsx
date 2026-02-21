import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DailyBrief from "@/components/daily-brief"

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-8 bg-slate-50 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 line-clamp-1">Dashboard Overview</h1>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <DailyBrief />
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Agent Status</CardTitle>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground italic">
                  Loading status...
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Stock Market</CardTitle>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground italic">
                  Fetching tickers...
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Tasks</CardTitle>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center text-muted-foreground italic">
                  Syncing to-do list...
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
