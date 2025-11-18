
<div className="flex gap-2 mb-4">
<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task title" className="flex-1 p-2 rounded" />
<select value={priority} onChange={e=>setPriority(e.target.value)} className="p-2 rounded ghost">
<option value="low">Low</option>
<option value="medium">Medium</option>
<option value="high">High</option>
</select>
<button className="btn" onClick={handleAdd}>Add</button>
</div>


<motion.div layout className="grid gap-3">
<AnimatePresence>
{tasks.map(t=> (
<motion.div key={t.id} layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} className="card">
<div className="flex items-start gap-3">
<div style={{width:56}}>
<div className="rounded-full bg-gradient-to-r from-primary to-accent w-14 h-14 grid place-items-center">{computePercent(t)}%</div>
</div>
<div className="flex-1">
<div className="font-semibold">{t.title}</div>
<div className="text-sm text-muted">{t.notes}</div>
<div className="mt-2 flex gap-2">
<button className="ghost" onClick={()=> onUpdate(t.id, { starred: !t.starred })}>Star</button>
<button className="ghost" onClick={()=> onDelete(t.id)}>Delete</button>
</div>
</div>
</div>
</motion.div>
))}
</AnimatePresence>
</motion.div>


<div className="mt-4 flex gap-2">
<button className="ghost" onClick={onExport}>Export JSON</button>
<input id="fileInput" type="file" accept="application/json" onChange={e=> onImport(e.target.files[0])} />
</div>
</div>
)
}


function computePercent(task){ const subs = task.subtasks||[]; if(!subs.length) return task.manualPercent||0; const done = subs.filter(s=>s.done).length; return Math.round((done/subs.length)*100) }
