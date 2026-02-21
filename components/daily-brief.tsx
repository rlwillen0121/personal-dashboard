import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Mail } from "lucide-react"

export default function DailyBrief() {
  // Mock data representing what will be fetched from Gmail/Calendar via ryanwillenai@gmail.com
  const events = [
    { id: 1, time: "09:00 AM", title: "Project Sync", icon: Calendar },
    { id: 2, time: "01:30 PM", title: "Human Feedback Session", icon: Calendar },
  ]

  const emails = [
    { id: 1, from: "Google Cloud", subject: "Usage Alert: dashboard-v2", time: "2h ago" },
    { id: 2, from: "GitHub", subject: "[Action Required] Push to main", time: "4h ago" },
  ]

  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-indigo-900 line-clamp-1">Daily Brief</CardTitle>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
          ryanwillenai@gmail.com
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2 mt-2">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" /> Upcoming Events
          </h3>
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event.id} className="flex flex-col border-l-2 border-indigo-400 pl-3">
                <span className="text-xs font-medium text-indigo-600">{event.time}</span>
                <span className="text-sm text-slate-800 line-clamp-1">{event.title}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4" /> Recent Emails
          </h3>
          <ul className="space-y-3">
            {emails.map((email) => (
              <li key={email.id} className="flex flex-col group">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {email.from}
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{email.time}</span>
                </div>
                <span className="text-xs text-slate-500 line-clamp-1">{email.subject}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
