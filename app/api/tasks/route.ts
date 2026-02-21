import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'lib/tasks.json');

async function getTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTasks(tasks: any[]) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, priority } = body;
  
  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const tasks = await getTasks();
  const newTask = {
    id: crypto.randomUUID(),
    title,
    completed: false,
    priority: priority || 'medium',
    created_at: new Date().toISOString(),
  };

  tasks.push(newTask);
  await saveTasks(tasks);

  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, title, completed, priority } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const tasks = await getTasks();
  const index = tasks.findIndex((t: any) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  if (title !== undefined) tasks[index].title = title;
  if (completed !== undefined) tasks[index].completed = completed;
  if (priority !== undefined) tasks[index].priority = priority;

  await saveTasks(tasks);

  return NextResponse.json(tasks[index]);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const tasks = await getTasks();
  const filteredTasks = tasks.filter((t: any) => t.id !== id);
  
  if (tasks.length === filteredTasks.length) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  await saveTasks(filteredTasks);

  return NextResponse.json({ success: true });
}
