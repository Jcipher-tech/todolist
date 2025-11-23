const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const themeBtn = document.getElementById("themeBtn");
const voiceBtn = document.getElementById("voiceBtn");

// Load tasks on start
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
renderTasks();

// Add task
addBtn.onclick = () => {
    if (input.value.trim() !== "") {
        tasks.push({ text: input.value, completed: false });
        save();
        renderTasks();
        input.value = "";
    }
};

// Voice input
voiceBtn.onclick = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice not supported");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.start();

    recognition.onresult = (e) => {
        input.value = e.results[0][0].transcript;
    };
};

// Render task list
function renderTasks() {
    list.innerHTML = "";
    tasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.className = "task";
        if (task.completed) li.classList.add("complete");

        li.draggable = true;

        li.innerHTML = `
            <span onclick="toggle(${index})">${task.text}</span>
            <button onclick="edit(${index})">Edit</button>
            <button onclick="removeTask(${index})">Delete</button>
        `;

        // Drag events
        li.addEventListener("dragstart", () => li.classList.add("dragging"));
        li.addEventListener("dragend", () => li.classList.remove("dragging"));

        list.appendChild(li);
    });

    enableDragDrop();
}

// Drag & Drop
function enableDragDrop() {
    list.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const after = getAfterElement(e.clientY);
        if (after == null) {
            list.appendChild(dragging);
        } else {
            list.insertBefore(dragging, after);
        }
    });

    function getAfterElement(y) {
        const draggableElements = [...list.querySelectorAll(".task:not(.dragging)")];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// Toggle complete
function toggle(index) {
    tasks[index].completed = !tasks[index].completed;
    save();
    renderTasks();
}

// Edit task
function edit(index) {
    let newText = prompt("Edit task:", tasks[index].text);
    if (newText) {
        tasks[index].text = newText;
        save();
        renderTasks();
    }
}

// Delete task
function removeTask(index) {
    tasks.splice(index, 1);
    save();
    renderTasks();
}

// Save to localStorage
function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Theme toggle
themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
};
