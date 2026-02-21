"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const tasks = [
  { id: "1", title: "Review morning logs", completed: true },
  { id: "2", title: "Update dashboard UI", completed: true },
  { id: "3", title: "Identity governance sync", completed: false },
  { id: "4", title: "Commit new features", completed: false },
];

export function DailyTasks() {
  return (
    <Card className="col-span-1 shadow-sm border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Focus for Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 mt-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/30 transition-all border border-transparent hover:border-border/50">
              <Checkbox 
                id={task.id} 
                checked={task.completed} 
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label
                htmlFor={task.id}
                className={`text-sm font-medium leading-none cursor-pointer select-none transition-colors ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {task.title}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
