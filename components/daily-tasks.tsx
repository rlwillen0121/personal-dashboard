"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

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

  useEffect(() => {
    fetchTasks();
  }, []);

  async function toggleTask(task: Task) {
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, completed: !task.completed }),
      });
    } catch (e) {
      console.error("Failed to update task", e);
      fetchTasks(); // Revert on error
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, priority: 'medium' }),
      });
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setIsAdding(false);
    } catch (e) {
      console.error("Failed to add task", e);
    }
  }

  async function deleteTask(id: string) {
    // Optimistic UI update
    setTasks(tasks.filter(t => t.id !== id));
    
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error("Failed to delete task", e);
      fetchTasks(); // Revert on error
    }
  }

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
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden pt-2 pb-0">
        {isAdding && (
          <form onSubmit={addTask} className="mb-4 flex gap-2">
            <Input 
              autoFocus
              placeholder="New task..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="h-8 text-xs bg-muted/50 border-border"
            />
            <Button type="submit" size="sm" className="h-8 px-3 text-xs bg-primary text-primary-foreground">Add</Button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
          <div className="grid gap-2 mb-4">
            {tasks.map((task) => (
              <div key={task.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-all border border-transparent hover:border-border/50">
                <div className="flex items-center space-x-3 min-w-0">
                  <Checkbox 
                    id={task.id} 
                    checked={task.completed} 
                    onCheckedChange={() => toggleTask(task)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label
                    htmlFor={task.id}
                    className={`text-sm font-medium leading-none cursor-pointer select-none transition-colors truncate max-w-[140px] ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  >
                    {task.title}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} title={`${task.priority} priority`} />
                    <Trash2 
                        className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer hover:text-destructive transition-all shrink-0" 
                        onClick={() => deleteTask(task.id)}
                    />
                </div>
              </div>
            ))}
            {tasks.length === 0 && !isAdding && (
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
