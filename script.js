// This file contains JavaScript code for client-side functionality related to the To-Do List application.

document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const listSelect = document.getElementById('list-select');
    const newListName = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const currentListTitle = document.getElementById('current-list-title');
    const deleteListBtn = document.getElementById('delete-list-btn');

    let lists = JSON.parse(localStorage.getItem('lists')) || {};
    let currentList = localStorage.getItem('currentList') || null;

    function saveLists() {
        localStorage.setItem('lists', JSON.stringify(lists));
        localStorage.setItem('currentList', currentList);
    }

    function renderListOptions() {
        listSelect.innerHTML = '';
        Object.keys(lists).forEach(listName => {
            const option = document.createElement('option');
            option.value = listName;
            option.textContent = listName;
            if (listName === currentList) option.selected = true;
            listSelect.appendChild(option);
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

    function switchList(listName) {
        currentList = listName;
        saveLists();
        renderListOptions();
        renderTasks();
    }

    createListBtn.addEventListener('click', () => {
        const name = newListName.value.trim();
        if (!name || lists[name]) return;
        lists[name] = [];
        currentList = name;
        newListName.value = '';
        saveLists();
        renderListOptions();
        renderTasks();
    });

    listSelect.addEventListener('change', (e) => {
        switchList(e.target.value);
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

    deleteListBtn.addEventListener('click', () => {
        if (!currentList) return;
        if (Object.keys(lists).length === 1) {
            alert("You must have at least one list.");
            return;
        }
        if (confirm(`Delete the list "${currentList}" and all its tasks?`)) {
            delete lists[currentList];
            // Switch to another list if possible
            currentList = Object.keys(lists)[0];
            saveLists();
            renderListOptions();
            renderTasks();
        }
    });

    // Initialize
    if (Object.keys(lists).length === 0) {
        lists['Default'] = [];
        currentList = 'Default';
        saveLists();
    }
    renderListOptions();
    renderTasks();
});