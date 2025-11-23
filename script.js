/*
 Advanced animations integrated.
 - Particles & confetti (canvas)
 - Morphing blobs (SVG)
 - Floating icons & bubbles (CSS)
 - Waves (SVG) 
 Animations are ENABLED only when body/data-theme === "light"
*/

const LS_THEME = 'jc_theme_v2';
const themeToggle = document.getElementById('themeToggle');
const bodyEl = document.body;
const animLayer = document.getElementById('anim-layer');
const canvas = document.getElementById('particles-canvas');
const blobA = document.getElementById('blobA');
const blobB = document.getElementById('blobB');
const wave1 = document.getElementById('wave1');
const wave2 = document.getElementById('wave2');

let theme = localStorage.getItem(LS_THEME) || 'light';
document.documentElement.setAttribute('data-theme', theme);
bodyEl.setAttribute('data-theme', theme);
updateThemeIcon();

// ---------- Theme Toggle ----------
themeToggle.addEventListener('click', () => {
  theme = (theme === 'light') ? 'dark' : 'light';
  localStorage.setItem(LS_THEME, theme);
  document.documentElement.setAttribute('data-theme', theme);
  bodyEl.setAttribute('data-theme', theme);
  updateThemeIcon();
  // Start/stop animations based on theme
  if (theme === 'light') startAnimations(); else stopAnimations();
});
function updateThemeIcon(){ themeToggle.textContent = theme === 'light' ? '☀️' : '🌙' }

// ---------- Animation control ----------
let particlesEngine = null;
function startAnimations(){
  animLayer.style.opacity = '1';
  if (!particlesEngine) particlesEngine = new ParticlesEngine(canvas);
  particlesEngine.start();
  startBlobMorph();
  startWaves();
}
function stopAnimations(){
  animLayer.style.opacity = '0';
  if (particlesEngine){ particlesEngine.stop(); particlesEngine = null; }
  stopBlobMorph();
  stopWaves();
}

// ---------- initial start if light ----------
if (theme === 'light') startAnimations();

// ------------------ Particles & Confetti Engine (canvas) ------------------
class ParticlesEngine {
  constructor(canvasEl){
    this.canvas = canvasEl;
    this.ctx = this.canvas.getContext('2d');
    this.w = 0; this.h = 0; this.particles = []; this.running = false;
    this.confettiPieces = [];
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.last = 0; this.raf = null;
  }
  resize(){
    const ratio = window.devicePixelRatio || 1;
    this.w = this.canvas.width = Math.floor(this.canvas.clientWidth * ratio);
    this.h = this.canvas.height = Math.floor(this.canvas.clientHeight * ratio);
    this.ctx.scale(ratio, ratio);
  }
  start(){
    if (this.running) return;
    this.running = true;
    this.spawnBackgroundParticles();
    this.raf = requestAnimationFrame((t)=>this.loop(t));
  }
  stop(){
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.particles = []; this.confettiPieces = [];
  }
  spawnBackgroundParticles(){
    this.particles = [];
    for(let i=0;i<30;i++){
      this.particles.push(this._createParticle());
    }
  }
  _createParticle(){
    return {
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      r: 1 + Math.random()*3,
      vx: (Math.random()-0.5)*0.3,
      vy: -0.15 - Math.random()*0.3,
      alpha: 0.15 + Math.random()*0.25,
      hue: 180 + Math.random()*80
    }
  }
  loop(t){
    if (!this.running) return;
    const dt = (t - (this.last||t))/16;
    this.last = t;
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    // particles
    for(let p of this.particles){
      p.x += p.vx*dt;
      p.y += p.vy*dt;
      if (p.y < -20) { p.y = window.innerHeight + 20; p.x = Math.random()*window.innerWidth; }
      this.ctx.beginPath();
      this.ctx.fillStyle = `hsla(${p.hue},70%,65%,${p.alpha})`;
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fill();
    }
    // confetti pieces
    for (let i = this.confettiPieces.length-1;i>=0;i--){
      const c = this.confettiPieces[i];
      c.x += c.vx*dt; c.y += c.vy*dt; c.vy += 0.02*dt;
      c.rot += c.spin*dt;
      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate(c.rot);
      this.ctx.fillStyle = c.color;
      this.ctx.fillRect(-c.w/2, -c.h/2, c.w, c.h);
      this.ctx.restore();
      if (c.y > window.innerHeight + 40) this.confettiPieces.splice(i,1);
    }

    this.raf = requestAnimationFrame((tt)=>this.loop(tt));
  }

  // small confetti burst (called when adding task)
  burst(x, y){
    for(let i=0;i<25;i++){
      this.confettiPieces.push({
        x: x + (Math.random()-0.5)*30,
        y: y + (Math.random()-0.5)*10,
        vx: (Math.random()-0.5)*6,
        vy: -6 - Math.random()*6,
        w: 6 + Math.random()*8,
        h: 4 + Math.random()*6,
        rot: Math.random()*6,
        spin: (Math.random()-0.5)*0.2,
        color: ['#FF7EB3','#65D6FF','#FFD86B','#A0FFB4','#A78BFA'][Math.floor(Math.random()*5)]
      });
    }
  }
}

// ------------------- Blob Morph (simple) -------------------
let blobTimer = null;
function startBlobMorph(){
  // precompute simple morphing by changing path with sin waves
  let t0 = 0;
  function tick(){
    t0 += 0.012;
    const w = 800, h = 600;
    const m = (a,b,c) => (a + Math.sin(t0*b + c)*30);
    // create two pseudo-random blob paths (not perfect morphing but smooth)
    blobA.setAttribute('d', blobPath(w*0.4, h*0.35, 220 + Math.sin(t0)*18, t0*0.9));
    blobB.setAttribute('d', blobPath(w*0.7, h*0.55, 160 + Math.cos(t0*1.1)*16, t0*1.2));
    blobTimer = requestAnimationFrame(tick);
  }
  tick();
}
function stopBlobMorph(){ cancelAnimationFrame(blobTimer); }
function blobPath(cx, cy, r, t){
  // build an organic 8-point path
  const pts = [];
  for (let i=0;i<8;i++){
    const ang = (i/8)*Math.PI*2;
    const rr = r + Math.sin(t + i)*22 + Math.cos(t*1.3 + i*0.7)*12;
    const x = cx + Math.cos(ang)*rr;
    const y = cy + Math.sin(ang)*rr*0.76;
    pts.push([x,y]);
  }
  // simple smooth path using bezier approximations
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i=0;i<pts.length;i++){
    const p1 = pts[i];
    const p2 = pts[(i+1)%pts.length];
    const cx1 = p1[0] + (p2[0]-pts[(i-1+pts.length)%pts.length][0])*0.25;
    const cy1 = p1[1] + (p2[1]-pts[(i-1+pts.length)%pts.length][1])*0.25;
    const cx2 = p2[0] - (pts[(i+2)%pts.length][0]-p1[0])*0.25;
    const cy2 = p2[1] - (pts[(i+2)%pts.length][1]-p1[1])*0.25;
    d += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// ------------------- Waves (subtle) -------------------
let wavesTimer = null;
function startWaves(){
  let t = 0;
  function tick(){
    t += 0.03;
    const w = window.innerWidth;
    const h1 = 40 + Math.sin(t)*6;
    const h2 = 24 + Math.cos(t*1.2)*5;
    wave1.setAttribute('d', wavePath(w, 120, h1, 0.3));
    wave2.setAttribute('d', wavePath(w, 80, h2, 0.6));
    wavesTimer = requestAnimationFrame(tick);
  }
  tick();
}
function stopWaves(){ cancelAnimationFrame(wavesTimer); }
function wavePath(width, baseY, amp, phase){
  const hw = width;
  let d = `M 0 ${baseY}`;
  const segments = 6;
  for (let i=0;i<=segments;i++){
    const x = (i/segments)*hw;
    const y = baseY + Math.sin((i/segments + phase)*Math.PI*2)*amp;
    d += ` L ${x} ${y}`;
  }
  d += ` L ${hw} 250 L 0 250 Z`;
  return d;
}

// ---------- small helpers for confetti on add ----------
function triggerConfettiAtCenter(){
  if (particlesEngine) {
    const rect = document.getElementById('addBtn').getBoundingClientRect();
    particlesEngine.burst(rect.left + rect.width/2, rect.top + rect.height/2);
  }
}

// --------------------------- App logic (tasks) ---------------------------
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const doneList = document.getElementById('doneList');
const counts = document.getElementById('counts');
const clearCompleted = document.getElementById('clearCompleted');
const clearAll = document.getElementById('clearAll');
const addBtn = document.getElementById('addBtn');
const voiceBtn = document.getElementById('voiceBtn');

const LS_KEYS = { tasks: 'jc_tasks_v2', done: 'jc_done_v2' };
let tasks = []; let done = [];
let dragSrcEl = null;

document.addEventListener('DOMContentLoaded', initApp);
function initApp(){
  loadFromStorage();
  renderAll();
  bindEvents();
}

// Storage
function saveToStorage(){ localStorage.setItem(LS_KEYS.tasks, JSON.stringify(tasks)); localStorage.setItem(LS_KEYS.done, JSON.stringify(done)); }
function loadFromStorage(){ tasks = JSON.parse(localStorage.getItem(LS_KEYS.tasks) || '[]'); done = JSON.parse(localStorage.getItem(LS_KEYS.done) || '[]'); }

// UI rendering
function renderAll(){
  taskList.innerHTML = ''; doneList.innerHTML = '';
  tasks.forEach((t,i)=> taskList.appendChild(createTaskEl(t,i,false)));
  done.forEach((d,i)=> doneList.appendChild(createTaskEl(d,i,true)));
  updateCounts();
}
function createTaskEl(taskObj,index,isDone=false){
  const li = document.createElement('li');
  li.className = 'task-item';
  li.draggable = !isDone;
  li.dataset.index = index;

  const handle = document.createElement('div'); handle.className='handle'; handle.innerHTML='☰';
  const text = document.createElement('div'); text.className='task-text'; text.textContent = taskObj.text; text.tabIndex=0;
  const actions = document.createElement('div'); actions.className='actions';
  const completeBtn = document.createElement('button'); completeBtn.className='complete-btn text-btn'; completeBtn.innerText = isDone ? '↺' : '✓';
  const delBtn = document.createElement('button'); delBtn.className='text-btn danger'; delBtn.innerText='Delete';
  const editBtn = document.createElement('button'); editBtn.className='text-btn'; editBtn.innerText='Edit';

  actions.appendChild(completeBtn); actions.appendChild(editBtn); actions.appendChild(delBtn);
  li.appendChild(handle); li.appendChild(text); li.appendChild(actions);
  if (isDone) li.classList.add('completed');

  // edit
  editBtn.addEventListener('click', ()=> {
    const newText = prompt('Edit task', taskObj.text);
    if (newText && newText.trim()){ taskObj.text = newText.trim(); persistAndRender(); }
  });

  // complete / move back
  completeBtn.addEventListener('click', ()=> {
    if (isDone){ const moved = done.splice(index,1)[0]; tasks.unshift(moved); } 
    else { const moved = tasks.splice(index,1)[0]; done.unshift(moved); }
    persistAndRender();
  });

  // delete
  delBtn.addEventListener('click', ()=> {
    li.style.transition='transform .22s ease, opacity .22s';
    li.style.transform='translateX(18px) scale(.98)'; li.style.opacity='0';
    setTimeout(()=>{ if (isDone) done.splice(index,1); else tasks.splice(index,1); persistAndRender(); },220);
  });

  // drag (active tasks only)
  if (!isDone){
    li.addEventListener('dragstart', (e)=>{ dragSrcEl = li; li.classList.add('dragging'); try{ e.dataTransfer.setData('text/plain', index);}catch(e){} });
    li.addEventListener('dragend', ()=>{ li.classList.remove('dragging'); });
    li.addEventListener('dragover', (e)=>{ e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    li.addEventListener('drop', (e)=>{ e.preventDefault(); if (!dragSrcEl || dragSrcEl===li) return; const src = Number(dragSrcEl.dataset.index); const dst = Number(li.dataset.index); const [m] = tasks.splice(src,1); tasks.splice(dst,0,m); persistAndRender(); });
  }

  return li;
}

function bindEvents(){
  taskForm.addEventListener('submit',(e)=>{ e.preventDefault(); const txt = taskInput.value.trim(); if(!txt) return; tasks.unshift({text:txt,created:Date.now()}); taskInput.value=''; persistAndRender(); triggerConfettiAtCenter(); });
  clearCompleted.addEventListener('click', ()=>{ if(!done.length) return alert('No completed tasks.'); if(!confirm('Clear all completed?')) return; done=[]; persistAndRender(); });
  clearAll.addEventListener('click', ()=>{ if(!tasks.length && !done.length) return; if(!confirm('Clear everything?')) return; tasks=[]; done=[]; persistAndRender(); });
  // voice
  voiceBtn.addEventListener('click', ()=> {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return alert('Speech recognition not supported in this browser.');
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new Rec(); r.lang = 'en-IN'; r.interimResults = false; r.maxAlternatives = 1;
    r.start();
    r.onresult = (ev)=>{ const t = ev.results[0][0].transcript; taskInput.value = t; };
    r.onerror = ()=>{};
  });
}

// persistence + render
function persistAndRender(){ saveToStorage(); renderAll(); updateCounts(); }
function updateCounts(){ const total = tasks.length + done.length; counts.textContent = `${tasks.length} tasks • ${done.length} done • ${total} total`; }

// -------------------- wire confetti on programmatic add (helper) --------------------
// if particlesEngine already created, burst is called in triggerConfettiAtCenter()

// -------------------- ensure animations resize properly --------------------
window.addEventListener('resize', ()=> {
  if (particlesEngine) particlesEngine.resize();
});

// that's it for animations + app
