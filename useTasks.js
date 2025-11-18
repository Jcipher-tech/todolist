
import { Auth } from './components/Auth'
import { useTasks } from './hooks/useTasks'


export default function App(){
const [theme, setTheme] = useState('dark')
const { tasks, addTask, updateTask, deleteTask, importTasks, exportTasks } = useTasks()


useEffect(()=>{
document.body.setAttribute('data-theme', theme)
},[theme])


return (
<div className="container">
<header className="flex items-center gap-4 mb-4">
<h1 className="text-2xl">Advanced React To-Do</h1>
<div className="ml-auto flex items-center gap-2">
<button className="ghost px-3 py-1" onClick={()=>setTheme(t=> t==='dark'?'light':'dark')}>Toggle Theme</button>
<Auth />
</div>
</header>


<main className="grid lg:grid-cols-3 gap-6">
<section className="lg:col-span-2 card">
<TaskList tasks={tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onExport={exportTasks} onImport={importTasks} />
</section>


<section className="card">
<h3 className="mb-3">Progress</h3>
<Chart tasks={tasks} />
</section>
</main>


<footer className="mt-6 text-sm text-gray-400">Built with ❤️ — React, Tailwind, Framer Motion, Firebase</footer>
</div>
)
}

