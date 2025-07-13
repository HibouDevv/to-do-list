// This file contains JavaScript code for client-side functionality related to the To-Do List application.

document.addEventListener('DOMContentLoaded', () => {
    const listsUl = document.getElementById('lists-ul');
    const newListName = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const currentListTitle = document.getElementById('current-list-title');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');

    let lists = JSON.parse(localStorage.getItem('lists')) || {};
    let currentList = localStorage.getItem('currentList') || null;

    function saveLists() {
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('currentList', currentList);
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

    function renderTasks() {
        taskList.innerHTML = '';
        if (!currentList || !lists[currentList]) return;
        currentListTitle.textContent = currentList;
        lists[currentList].forEach((task, idx) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            
            const span = document.createElement('span');
            span.textContent = task.text;
            span.style.flex = '1';
            span.style.cursor = 'pointer';

            // Toggle complete on click
            span.addEventListener('click', () => {
                task.completed = !task.completed;
                saveLists();
                renderTasks();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                lists[currentList].splice(idx, 1);
                saveLists();
                renderTasks();
            });

            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
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

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentList) return;
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        lists[currentList].push({ text: taskText, completed: false });
        taskInput.value = '';
        saveLists();
        renderTasks();
    });

    // Sidebar open/close for mobile
    openSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // Initialize
    if (Object.keys(lists).length === 0) {
        lists['Default'] = [];
        currentList = 'Default';
        saveLists();
    }
    renderLists();
    renderTasks();
});