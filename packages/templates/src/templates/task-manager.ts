/**
 * Task Manager template - React 18 + Vite + TypeScript + Tailwind CSS
 */

import type { Template } from "../types.js";

export const taskManagerTemplate: Template = {
  id: "task-manager",
  name: "Task Manager",
  slug: "task-manager",
  description:
    "Project and task management app with boards, priorities, due dates, filtering, and drag-and-drop style interactions.",
  category: "app",
  frameworks: ["react"],
  version: "1.0.0",
  author: "MagicAppDev",
  tags: ["tasks", "productivity", "project", "react", "tailwind"],
  free: true,
  variables: [
    {
      name: "name",
      description: "Project name",
      type: "string",
      default: "task-manager",
    },
    {
      name: "appName",
      description: "App name",
      type: "string",
      default: "Task Manager",
    },
  ],
  dependencies: {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.469.0",
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    typescript: "^5.6.3",
    vite: "^6.0.3",
    tailwindcss: "^3.4.16",
    autoprefixer: "^10.4.20",
    postcss: "^8.4.49",
  },
  files: [
    {
      path: "package.json",
      content: `{
  "name": "{{kebabCase name}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.469.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.16",
    "typescript": "^5.6.3",
    "vite": "^6.0.3"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build"
  }
}`,
    },
    {
      path: "vite.config.ts",
      content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
    },
    {
      path: "index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{appName}}</title>
  </head>
  <body class="bg-slate-50 text-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "src/main.tsx",
      content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    },
    {
      path: "src/index.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`,
    },
    {
      path: "src/App.tsx",
      content: `import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Design onboarding flow', priority: 'high', done: false },
  { id: '2', title: 'Fix mobile nav bug', priority: 'medium', done: false },
  { id: '3', title: 'Write API docs', priority: 'low', done: true },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');

  const addTask = () => {
    if (!title.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), title: title.trim(), priority, done: false }]);
    setTitle('');
  };

  const toggle = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const counts = {
    all: tasks.length,
    active: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">{{appName}}</h1>
        <span className="text-xs text-slate-500">{counts.active} active</span>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 space-y-4">
        <div className="flex gap-2">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Add a new task..." className="flex-1 border rounded-lg px-3 py-2 bg-white" />
          <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} className="border rounded-lg px-3 py-2 bg-white">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button onClick={addTask} className="px-4 py-2 bg-slate-900 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className={"bg-white border rounded-xl p-3 flex items-center gap-3 " + (task.done ? 'opacity-60' : '')}>
              <button onClick={() => toggle(task.id)} className="text-slate-400 hover:text-slate-600">
                {task.done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5" />}
              </button>
              <div className="flex-1">
                <p className={"text-sm font-medium " + (task.done ? 'line-through text-slate-500' : '')}>{task.title}</p>
                <p className="text-[11px] text-slate-500 capitalize">{task.priority}</p>
              </div>
              <button onClick={() => remove(task.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
`,
    },
  ],
};
