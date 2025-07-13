// This file contains JavaScript code for client-side functionality related to the To-Do List application.

document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode ---
    const darkToggle = document.getElementById('dark-toggle');
    darkToggle.onclick = () => {
        document.body.classList.toggle('dark');
        darkToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    };

    // --- Sidebar open/close for mobile ---
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    openSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // --- List Management ---
    const listsUl = document.getElementById('lists-ul');
    const newListName = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const currentListTitle = document.getElementById('current-list-title');
    let lists = JSON.parse(localStorage.getItem('lists2')) || { "Default": [] };
    let currentList = localStorage.getItem('currentList2') || "Default";

    function saveLists() {
        localStorage.setItem('lists2', JSON.stringify(lists));
        localStorage.setItem('currentList2', currentList);
    }

    function renderLists() {
        listsUl.innerHTML = '';
        Object.keys(lists).forEach(listName => {
            const li = document.createElement('li');
            li.textContent = listName;
            if (listName === currentList) li.classList.add('active');
            li.addEventListener('click', () => {
                currentList = listName;
                saveLists();
                renderLists();
                renderTasks();
                if (window.innerWidth <= 700) sidebar.classList.remove('open');
            });

            // Delete button with icon
            const delBtn = document.createElement('button');
            delBtn.className = 'list-delete-btn';
            delBtn.title = `Delete "${listName}"`;
            const delIcon = document.createElement('img');
            delIcon.src = 'Images/delete black.svg';
            delIcon.alt = 'Delete';
            delBtn.appendChild(delIcon);

            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (Object.keys(lists).length === 1) {
                    alert("You must have at least one list.");
                    return;
                }
                if (confirm(`Delete the list "${listName}" and all its tasks?`)) {
                    delete lists[listName];
                    // Switch to another list if possible
                    const keys = Object.keys(lists);
                    currentList = keys.length ? keys[0] : null;
                    saveLists();
                    renderLists();
                    renderTasks();
                }
            });

            li.appendChild(delBtn);
            listsUl.appendChild(li);
        });
    }

    createListBtn.addEventListener('click', () => {
        const name = newListName.value.trim();
        if (!name || lists[name]) return;
        lists[name] = [];
        currentList = name;
        newListName.value = '';
        saveLists();
        renderLists();
        renderTasks();
    });

    // --- Task Management ---
    function getTasks() {
        return lists[currentList] || [];
    }
    function setTasks(tasks) {
        lists[currentList] = tasks;
        saveLists();
    }

    // --- Render Tasks ---
    function renderTasks() {
        const tasks = getTasks();
        const list = document.getElementById('task-list');
        const empty = document.getElementById('empty-state');
        currentListTitle.textContent = currentList;
        list.innerHTML = '';
        if (tasks.length === 0) {
            empty.style.display = '';
            return;
        }
        empty.style.display = 'none';
        tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');
            // Main task text
            const main = document.createElement('div');
            main.className = 'task-main';
            const span = document.createElement('span');
            span.textContent = task.text;
            span.tabIndex = 0;
            span.setAttribute('role', 'button');
            span.setAttribute('aria-label', task.completed ? 'Mark as incomplete' : 'Mark as complete');
            span.onclick = () => {
                task.completed = !task.completed;
                setTasks(tasks);
                renderTasks();
            };
            span.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') span.onclick(); };
            // Edit on double click
            span.ondblclick = () => startEditTask(idx);
            main.appendChild(span);

            // Meta info
            const meta = document.createElement('div');
            meta.className = 'task-meta';
            if (task.due) {
                const due = document.createElement('span');
                due.textContent = 'Due: ' + task.due;
                if (new Date(task.due) < new Date() && !task.completed) due.style.color = '#d93636';
                meta.appendChild(due);
            }
            if (task.priority) {
                const prio = document.createElement('span');
                prio.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
                prio.className = 'priority-' + task.priority;
                meta.appendChild(prio);
            }
            if (meta.childNodes.length) main.appendChild(meta);

            li.appendChild(main);

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.title = 'Edit';
            editBtn.innerHTML = '✏️';
            editBtn.onclick = () => startEditTask(idx);
            li.appendChild(editBtn);

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.title = 'Delete';
            delBtn.innerHTML = '🗑️';
            delBtn.onclick = () => {
                if (confirm('Delete this task?')) {
                    tasks.splice(idx, 1);
                    setTasks(tasks);
                    renderTasks();
                }
            };
            li.appendChild(delBtn);

            list.appendChild(li);
        });
    }

    // --- Add/Edit Task ---
    const form = document.getElementById('task-form');
    let editIdx = null;
    function startEditTask(idx) {
        const tasks = getTasks();
        const task = tasks[idx];
        document.getElementById('task-input').value = task.text;
        document.getElementById('task-date').value = task.due || '';
        document.getElementById('task-priority').value = task.priority || 'low';
        editIdx = idx;
        form.querySelector('button[type="submit"]').textContent = 'Update';
    }
    form.onsubmit = e => {
        e.preventDefault();
        const tasks = getTasks();
        const text = document.getElementById('task-input').value.trim();
        const due = document.getElementById('task-date').value;
        const priority = document.getElementById('task-priority').value;
        if (!text) return;
        if (editIdx !== null) {
            tasks[editIdx] = { ...tasks[editIdx], text, due, priority };
            editIdx = null;
            form.querySelector('button[type="submit"]').textContent = 'Add';
        } else {
            tasks.push({ text, due, priority, completed: false });
        }
        form.reset();
        setTasks(tasks);
        renderTasks();
    };

    // --- Export/Import ---
    document.getElementById('export-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(lists, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lists.json';
        a.click();
        URL.revokeObjectURL(url);
    };
    document.getElementById('import-form').onsubmit = e => {
        e.preventDefault();
        const file = document.getElementById('import-file').files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            try {
                const imported = JSON.parse(evt.target.result);
                if (typeof imported === "object" && imported !== null) {
                    if (confirm('Replace all current lists and tasks with imported data?')) {
                        lists = imported;
                        currentList = Object.keys(lists)[0] || "Default";
                        saveLists();
                        renderLists();
                        renderTasks();
                    }
                }
            } catch {}
        };
        reader.readAsText(file);
    };

    // --- PWA Install Prompt (basic) ---
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const btn = document.createElement('button');
        btn.textContent = 'Install as App';
        btn.className = 'export-btn';
        btn.onclick = () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => btn.remove());
        };
        document.querySelector('.container').appendChild(btn);
    });

    // --- Initial Render ---
    renderLists();
    renderTasks();
});