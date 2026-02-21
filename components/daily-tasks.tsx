"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const tasks = [
  { id: "1", title: "Review morning logs", completed: true },
  { id: "2", title: "Update dashboard components", completed: false },
  { id: "3", title: "System health check", completed: false },
  { id: "4", title: "Commit new features", completed: true },
];

export function DailyTasks() {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Daily Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <Checkbox id={task.id} checked={task.completed} />
              <label
                htmlFor={task.id}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.completed ? 'line-through text-muted-foreground' : ''}`}
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
