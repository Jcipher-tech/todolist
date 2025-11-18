```jsx
import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'


export function Chart({ tasks }){
const completed = tasks.filter(t=> computePercent(t)===100).length
const pending = tasks.length - completed
const data = [{name:'Completed', value:completed},{name:'Pending', value:pending}]
return (
<div style={{width:'100%',height:240}}>
<ResponsiveContainer>
<PieChart>
<Pie data={data} dataKey="value" innerRadius={50} outerRadius={80} fill="#8884d8">
{data.map((entry, index)=>(<Cell key={index} fill={index===0? '#10b981':'#ef4444'} />))}
</Pie>
<Tooltip />
</PieChart>
</ResponsiveContainer>
</div>
)
}


function computePercent(task){ const subs = task.subtasks||[]; if(!subs.length) return task.manualPercent||0; const done = subs.filter(s=>s.done).length; return Math.round((done/subs.length)*100) }
```