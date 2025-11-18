/* script.js - Advanced ToDo with drag/drop, edit, theme, persistence */
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const doneList = document.getElementById('doneList');
const counts = document.getElementById('counts');
const clearCompleted = document.getElementById('clearCompleted');
const clearAll = document.getElementById('clearAll');
const themeToggle = document.getElementById('themeToggle');

let tasks = [];    // active tasks
let done = [];     // completed tasks
let dragSrcEl = null;

const LS_KEYS = { tasks: 'jc_tasks_v1', done: 'jc_done_v1', theme: 'jc_theme_v1' };

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', initApp);

function initApp(){
  loadFromStorage();
  renderAll();
  bindEvents();
  applyTheme(loadTheme());
}

/* ---------- Storage ---------- */
function saveToStorage(){
  localStorage.setItem(LS_KEYS.tasks, JSON.stringify(tasks));
  localStorage.setItem(LS_KEYS.done, JSON.stringify(done));
}
function loadFromStorage(){
  tasks = JSON.parse(localStorage.getItem(LS_KEYS.tasks) || '[]');
  done  = JSON.parse(localStorage.getItem(LS_KEYS.done) || '[]');
}
function saveTheme(theme){
  localStorage.setItem(LS_KEYS.theme, theme);
}
function loadTheme(){
  return localStorage.getItem(LS_KEYS.theme) || 'dark';
}

/* ---------- UI rendering ---------- */
function renderAll(){
  taskList.innerHTML = '';
  doneList.innerHTML = '';

  tasks.forEach((t, i) => {
    const el = createTaskEl(t, i);
    taskList.appendChild(el);
  });

  done.forEach((d, i) => {
    const el = createTaskEl(d, i, true);
    doneList.appendChild(el);
  });

  updateCounts();
}

function createTaskEl(taskObj, index, isDone = false){
  const li = document.createElement('li');
  li.className = 'task-item';
  li.draggable = !isDone;
  li.dataset.index = index;

  // drag handle
  const handle = document.createElement('div');
  handle.className = 'handle';
  handle.innerHTML = '☰';
  li.appendChild(handle);

  // text (editable)
  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = taskObj.text;
  text.tabIndex = 0;
  text.title = 'Double-click to edit';
  li.appendChild(text);

  // actions
  const actions = document.createElement('div');
  actions.className = 'actions';

  // complete button or move back
  const completeBtn = document.createElement('button');
  completeBtn.className = 'complete-btn';
  completeBtn.title = isDone ? 'Move back to tasks' : 'Mark as done';
  completeBtn.innerHTML = isDone ? '↺' : '✓';
  actions.appendChild(completeBtn);

  // delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerText = 'Delete';
  actions.appendChild(delBtn);

  li.appendChild(actions);

  // Completed style if done
  if (isDone) li.classList.add('completed');

  // Event bindings
  // Edit (double click => contenteditable)
  text.addEventListener('dblclick', () => enableEdit(text, taskObj, isDone));
  text.addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){ e.preventDefault(); text.blur(); }
    if (e.key === 'Escape'){ text.textContent = taskObj.text; text.blur(); }
  });

  // Click outside to save
  text.addEventListener('blur', () => {
    if (text.isContentEditable) {
      disableEdit(text);
      const newText = text.textContent.trim();
      if (!newText) {
        // restore old
        text.textContent = taskObj.text;
        return;
      }
      taskObj.text = newText;
      persistAndRender();
    }
  });

  // Complete / Move back
  completeBtn.addEventListener('click', () => {
    if (isDone) {
      // move back to tasks front
      const moved = done.splice(index,1)[0];
      tasks.unshift(moved);
    } else {
      const moved = tasks.splice(index,1)[0];
      done.unshift(moved);
    }
    persistAndRender();
  });

  // Delete
  delBtn.addEventListener('click', () => {
    // animate then remove
    li.style.transition = 'transform .22s ease, opacity .22s';
    li.style.transform = 'translateX(20px) scale(.98)';
    li.style.opacity = '0';
    setTimeout(() => {
      if (isDone) done.splice(index,1); else tasks.splice(index,1);
      persistAndRender();
    },220);
  });

  // Drag events (only for active tasks)
  if (!isDone) {
    li.addEventListener('dragstart', (e) => {
      dragSrcEl = li;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', index); } catch(_) {}
    });
    li.addEventListener('dragend', () => {
      li.classList.remove('dragging');
    });

    li.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    li.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragSrcEl || dragSrcEl === li) return;
      const srcIndex = Number(dragSrcEl.dataset.index);
      const dstIndex = Number(li.dataset.index);
      // reorder array
      const [m] = tasks.splice(srcIndex, 1);
      tasks.splice(dstIndex, 0, m);
      persistAndRender();
    });
  }

  return li;
}

/* ---------- helpers ---------- */
function enableEdit(el, taskObj, isDone){
  el.contentEditable = 'true';
  el.focus();
  // place cursor end
  document.execCommand('selectAll',false,null);
  document.getSelection().collapseToEnd();
}
function disableEdit(el){ el.contentEditable = 'false'; }

/* ---------- events ---------- */
function bindEvents(){
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = taskInput.value.trim();
    if(!txt) return;
    tasks.unshift({ text: txt, created: Date.now() });
    taskInput.value = '';
    persistAndRender();
  });

  clearCompleted.addEventListener('click', () => {
    if (!done.length) return alert('No completed tasks to clear.');
    if (!confirm('Clear all completed tasks?')) return;
    done = [];
    persistAndRender();
  });

  clearAll.addEventListener('click', () => {
    if (!tasks.length && !done.length) return;
    if (!confirm('Clear all tasks permanently?')) return;
    tasks = []; done = [];
    persistAndRender();
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  });
}

/* ---------- persistence + render ---------- */
function persistAndRender(){
  saveToStorage();
  renderAll();
}

/* ---------- counts & UI ---------- */
function updateCounts(){
  const total = tasks.length + done.length;
  const s = tasks.length === 1 ? 'task' : 'tasks';
  counts.textContent = `${tasks.length} ${s} • ${done.length} done • ${total} total`;
}

/* ---------- theme ---------- */
function applyTheme(theme){
  // theme: 'dark' or 'light'
  document.documentElement.setAttribute('data-theme', theme);
  // update toggle icon
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

/* ---------- init done ---------- */
