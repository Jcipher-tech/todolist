/* Neon Futuristic ToDo
   - Animated grid canvas (moving perspective grid)
   - Particle float + confetti
   - Tasks: add/edit/delete/drag & drop
   - LocalStorage persistence
   - Mini-mode (reduced motion)
*/

/* ---------- Canvas background: grid + particles ---------- */
const gridCanvas = document.getElementById('gridCanvas');
const particleCanvas = document.getElementById('particleCanvas');
const gc = gridCanvas.getContext('2d');
const pc = particleCanvas.getContext('2d');

let DPR = Math.max(1, window.devicePixelRatio || 1);

function resizeCanvases(){
  DPR = Math.max(1, window.devicePixelRatio || 1);
  [gridCanvas, particleCanvas].forEach(c=>{
    c.width = Math.floor(c.clientWidth * DPR);
    c.height = Math.floor(c.clientHeight * DPR);
    c.style.width = c.clientWidth + 'px';
    c.style.height = c.clientHeight + 'px';
  });
  gc.setTransform(DPR,0,0,DPR,0,0);
  pc.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

/* grid animation */
let gridT = 0;
function drawGrid(t){
  gc.clearRect(0,0,gridCanvas.width/DPR, gridCanvas.height/DPR);
  const w = gridCanvas.width/DPR, h = gridCanvas.height/DPR;
  gridT += 0.0025;
  const offset = Math.sin(gridT)*24;
  const step = 48;
  gc.save();
  gc.translate(0, h*0.06);
  // vertical lines
  gc.lineWidth = 1;
  for(let x = -step*4; x < w + step*4; x += step){
    const x2 = x + (Math.sin((x*0.02)+gridT*4) * 6) + offset*0.2;
    gc.beginPath();
    gc.strokeStyle = 'rgba(120,120,255,0.03)';
    gc.moveTo(x2, 0);
    gc.lineTo(x2, h);
    gc.stroke();
  }
  // horizontal perspective lines (curved)
  for(let i=0;i<14;i++){
    const y = h - i*40 + Math.sin(gridT + i*0.6)*8;
    const alpha = 0.08 * (1 - i/14);
    gc.beginPath();
    gc.strokeStyle = `rgba(120,140,255,${alpha})`;
    gc.moveTo(-40, y);
    gc.quadraticCurveTo(w/2 + Math.sin(i+gridT)*40, y - 24 - i*2, w+40, y);
    gc.stroke();
  }
  gc.restore();
}
// CHATBOT OPEN/CLOSE
document.getElementById("chatbot-btn").onclick = () => {
    document.getElementById("chatbot-window").style.display = "flex";
};

document.getElementById("chatbot-close").onclick = () => {
    document.getElementById("chatbot-window").style.display = "none";
};

// SEND MESSAGE
document.getElementById("chatbot-send").onclick = sendMessage;
document.getElementById("chatbot-input").addEventListener("keypress", function(e){
    if(e.key === "Enter") sendMessage();
});

function sendMessage() {
    let input = document.getElementById("chatbot-input");
    let msg = input.value.trim();
    if (!msg) return;

    addMessage(msg, "user-msg");
    input.value = "";

    setTimeout(() => {
        botReply(msg.toLowerCase());
    }, 500);
}

function addMessage(text, type) {
    let box = document.getElementById("chatbot-messages");
    let div = document.createElement("div");
    div.className = type;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

// BOT REPLIES (CUSTOM FAQ)
function botReply(question) {
    let reply = "I didn’t understand that. Try asking: add task, delete task, reset login.";

    if (question.includes("add task"))
        reply = "To add a task, type in the task box and press ADD.";
    else if (question.includes("delete"))
        reply = "Click the delete (🗑️) icon next to any task.";
    else if (question.includes("edit"))
        reply = "You can edit tasks by clicking the ✏️ icon.";
    else if (question.includes("logout"))
        reply = "Go to profile → Logout to exit your session.";
    else if (question.includes("profile"))
        reply = "Open the top-right profile icon to update your avatar and name.";
    else if (question.includes("task completed"))
        reply = "Click the checkbox to mark any task as done ✔️.";
    else if (question.includes("clear all"))
        reply = "Go to settings → Clear All Tasks.";
    else if (question.includes("help"))
        reply = "You can ask me: add task, delete task, edit, logout, profile, clear.";

    addMessage(reply, "bot-msg");
}

/* particles (glowing motes) */
let motes = [];
function spawnMotes(){
  motes = [];
  const count = Math.max(18, Math.floor((gridCanvas.width/DPR)/60));
  for(let i=0;i<count;i++){
    motes.push({
      x: Math.random()*gridCanvas.width/DPR,
      y: Math.random()*gridCanvas.height/DPR,
      r: 0.8 + Math.random()*2.4,
      vx: (Math.random()-0.5)*0.3,
      vy: (Math.random()-0.5)*0.2,
      hue: 170 + Math.random()*160,
      alpha: 0.08 + Math.random()*0.18
    });
  }
}

/* confetti pieces */
let confetti = [];

/* animation loop */
let animRunning = true;
let lastTS = 0;
function loop(ts){
  if (!animRunning) return;
  const dt = (ts - lastTS) / 16.666; lastTS = ts;
  // grid
  drawGrid(ts);
  // motes
  pc.clearRect(0,0,particleCanvas.width/DPR, particleCanvas.height/DPR);
  for(let m of motes){
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    if (m.x < -20) m.x = particleCanvas.width/DPR + 20;
    if (m.x > particleCanvas.width/DPR + 20) m.x = -20;
    if (m.y < -20) m.y = particleCanvas.height/DPR + 20;
    if (m.y > particleCanvas.height/DPR + 20) m.y = -20;
    const g = pc.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r*8);
    g.addColorStop(0, `hsla(${m.hue}, 90%, 70%, ${m.alpha*1.1})`);
    g.addColorStop(1, `rgba(0,0,0,0)`);
    pc.beginPath();
    pc.fillStyle = g;
    pc.arc(m.x, m.y, m.r*8, 0, Math.PI*2);
    pc.fill();
  }
  // confetti physics
  for(let i=confetti.length-1;i>=0;i--){
    const c = confetti[i];
    c.x += c.vx * dt; c.y += c.vy * dt; c.vy += 0.12 * dt; c.rot += c.spin * dt;
    pc.save();
    pc.translate(c.x, c.y); pc.rotate(c.rot);
    pc.fillStyle = c.color;
    pc.fillRect(-c.w/2, -c.h/2, c.w, c.h);
    pc.restore();
    if (c.y > particleCanvas.height/DPR + 60) confetti.splice(i,1);
  }
  requestAnimationFrame(loop);
}

/* start background anim */
spawnMotes();
requestAnimationFrame(loop);

/* confetti burst */
function confettiBurst(x,y){
  for(let i=0;i<28;i++){
    confetti.push({
      x: x + (Math.random()-0.5)*30,
      y: y + (Math.random()-0.5)*10,
      vx: (Math.random()-0.5)*6,
      vy: -6 - Math.random()*6,
      w: 6 + Math.random()*8,
      h: 4 + Math.random()*6,
      rot: Math.random()*6,
      spin: (Math.random()-0.5)*0.2,
      color: ['#00ffd2','#7a00ff','#ff4d6d','#66e0ff','#a78bfa'][Math.floor(Math.random()*5)]
    });
  }
}

/* Toggle mini-mode (reduced motion) */
let miniMode = false;
const miniModeBtn = document.getElementById('miniModeBtn');
miniModeBtn.addEventListener('click', ()=> {
  miniMode = !miniMode;
  if (miniMode){
    motes = []; confetti = []; animRunning = false; pc.clearRect(0,0,particleCanvas.width, particleCanvas.height); gc.clearRect(0,0,gridCanvas.width, gridCanvas.height);
    miniModeBtn.style.opacity = '0.6';
  } else {
    spawnMotes(); animRunning = true; lastTS = performance.now(); requestAnimationFrame(loop); miniModeBtn.style.opacity = '1';
  }
});

/* ---------- App logic (tasks) ---------- */
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const doneList = document.getElementById('doneList');
const counts = document.getElementById('counts');
const clearCompleted = document.getElementById('clearCompleted');
const clearAll = document.getElementById('clearAll');
const addBtn = document.getElementById('addBtn');
const floatAdd = document.getElementById('floatAdd');

const LS_TASKS = 'jc_neon_tasks_v1';
const LS_DONE = 'jc_neon_done_v1';

let tasks = JSON.parse(localStorage.getItem(LS_TASKS) || '[]');
let done = JSON.parse(localStorage.getItem(LS_DONE) || '[]');

function saveAll(){ localStorage.setItem(LS_TASKS, JSON.stringify(tasks)); localStorage.setItem(LS_DONE, JSON.stringify(done)); }
function loadAll(){ tasks = JSON.parse(localStorage.getItem(LS_TASKS) || '[]'); done = JSON.parse(localStorage.getItem(LS_DONE) || '[]'); }

function renderAll(){
  taskList.innerHTML = ''; doneList.innerHTML = '';
  tasks.forEach((t,i)=> taskList.appendChild(createTaskEl(t,i,false)));
  done.forEach((d,i)=> doneList.appendChild(createTaskEl(d,i,true)));
  updateCounts();
}
function createTaskEl(taskObj, index, isDone=false){
  const li = document.createElement('li');
  li.className = 'task-item';
  li.draggable = !isDone;
  li.dataset.index = index;

  const handle = document.createElement('div'); handle.className='handle'; handle.textContent = '≡';
  const txt = document.createElement('div'); txt.className='task-text'; txt.textContent = taskObj.text;
  const actions = document.createElement('div'); actions.className='task-actions';
  const btnDone = document.createElement('button'); btnDone.className='text-btn'; btnDone.textContent = isDone ? '↺' : '✓';
  const btnEdit = document.createElement('button'); btnEdit.className='text-btn'; btnEdit.textContent='Edit';
  const btnDel  = document.createElement('button'); btnDel.className='text-btn danger'; btnDel.textContent='Delete';

  actions.appendChild(btnDone); actions.appendChild(btnEdit); actions.appendChild(btnDel);
  li.appendChild(handle); li.appendChild(txt); li.appendChild(actions);
  if (isDone) li.classList.add('completed');

  // edit
  btnEdit.addEventListener('click', ()=> {
    const val = prompt('Edit task', taskObj.text);
    if (val && val.trim()){ taskObj.text = val.trim(); saveAll(); renderAll(); }
  });

  // done / move back
  btnDone.addEventListener('click', ()=> {
    if (isDone){ const moved = done.splice(index,1)[0]; tasks.unshift(moved); } 
    else { const moved = tasks.splice(index,1)[0]; done.unshift(moved); }
    saveAll(); renderAll();
  });

  // delete
  btnDel.addEventListener('click', ()=> {
    li.style.transition = 'transform .22s ease, opacity .22s';
    li.style.transform = 'translateX(20px) scale(.98)';
    li.style.opacity = '0';
    setTimeout(()=> {
      if (isDone) done.splice(index,1); else tasks.splice(index,1);
      saveAll(); renderAll();
    },220);
  });

  // drag events for active tasks
  if (!isDone){
    li.addEventListener('dragstart', (e)=> { dragSrc = li; li.classList.add('dragging'); try{ e.dataTransfer.setData('text/plain', index);}catch(e){} });
    li.addEventListener('dragend', ()=> { li.classList.remove('dragging'); });
    li.addEventListener('dragover', (e)=> { e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    li.addEventListener('drop', (e)=> { e.preventDefault(); if (!dragSrc || dragSrc===li) return; const src = Number(dragSrc.dataset.index), dst = Number(li.dataset.index); const [m] = tasks.splice(src,1); tasks.splice(dst,0,m); saveAll(); renderAll(); });
  }

  return li;
}

let dragSrc = null;

/* events */
taskForm.addEventListener('submit', (e)=> {
  e.preventDefault();
  const txt = taskInput.value.trim();
  if (!txt) return;
  tasks.unshift({ text: txt, created: Date.now() });
  taskInput.value = '';
  saveAll(); renderAll();
  // confetti at add button location
  const r = addBtn.getBoundingClientRect();
  confettiBurst(r.left + r.width/2, r.top + r.height/2);
});

floatAdd.addEventListener('click', ()=> { taskInput.focus(); taskInput.classList.add('pulse-focus'); setTimeout(()=>taskInput.classList.remove('pulse-focus'),800); });

clearCompleted.addEventListener('click', ()=> {
  if (!done.length) return alert('No completed tasks to clear.');
  if (!confirm('Clear all completed tasks?')) return;
  done = []; saveAll(); renderAll();
});
clearAll.addEventListener('click', ()=> {
  if (!tasks.length && !done.length) return;
  if (!confirm('Clear all tasks?')) return;
  tasks = []; done = []; saveAll(); renderAll();
});

/* counts */
function updateCounts(){
  const total = tasks.length + done.length;
  counts.textContent = `${tasks.length} tasks • ${done.length} done • ${total} total`;
}

/* load & init */
loadAll();
renderAll();

/* confetti helper available globally */
window.confettiBurst = confettiBurst;

/* ---------- Theme toggle (neon/dim) ---------- */
const themeToggle = document.getElementById('themeToggle');
const LS_THEME = 'jc_neon_theme_v1';
let theme = localStorage.getItem(LS_THEME) || 'neon';
function applyTheme(t){
  theme = t;
  localStorage.setItem(LS_THEME, theme);
  if (theme === 'neon'){
    document.documentElement.setAttribute('data-theme', 'neon');
    document.body.setAttribute('data-theme', 'neon');
    // ensure animations running
    if (!miniMode) { spawnMotes(); animRunning = true; requestAnimationFrame(loop); }
  } else {
    document.documentElement.setAttribute('data-theme', 'dim');
    document.body.setAttribute('data-theme', 'dim');
    // pause heavy animations
    motes = []; confetti = []; animRunning = false; pc.clearRect(0,0,particleCanvas.width,particleCanvas.height); gc.clearRect(0,0,gridCanvas.width,gridCanvas.height);
  }
}
applyTheme(localStorage.getItem(LS_THEME) || 'neon');
themeToggle.addEventListener('click', ()=> {
  applyTheme(theme === 'neon' ? 'dim' : 'neon');
});

/* accessibility: stop animations on tab navigation */
window.addEventListener('keydown', (e)=> { if (e.key === 'Tab') { /* optional: reduce motion */ } });

/* ensure canvases sized to viewport every load */
resizeCanvases();
spawnMotes();
requestAnimationFrame(loop);

