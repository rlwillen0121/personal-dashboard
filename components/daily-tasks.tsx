"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        setTasks(data || []);
      } catch (e) {
        console.error("Failed to fetch tasks", e);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1 shadow-sm border-border min-h-[300px]">
        <CardContent className="flex items-center justify-center pt-6 h-[300px]">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 shadow-sm border-border flex flex-col min-h-[300px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Focus for Today</CardTitle>
        <Plus className="h-4 w-4 text-primary cursor-pointer hover:scale-110 transition-transform" />
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-4 pb-0">
        <div className="flex-1 overflow-y-auto max-h-[200px] custom-scrollbar pr-1">
          <div className="grid gap-2 mb-4">
            {tasks.map((task) => (
              <div key={task.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-all border border-transparent hover:border-border/50">
                <div className="flex items-center space-x-3 min-w-0">
                  <Checkbox 
                    id={task.id} 
                    checked={task.completed} 
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium leading-none cursor-pointer select-none transition-colors truncate max-w-[140px] ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {task.title}
                  </label>
                </div>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer hover:text-destructive transition-all shrink-0" />
              </div>
            ))}
            {tasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground italic text-xs border border-dashed border-border rounded-lg bg-muted/20">
                    No active tasks.<br/>Enjoy your day!
                </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
