import { store } from './store.js';
import { utils } from './utils.js';
import { calendar } from './calendar.js';
import { commandBar } from './commandBar.js';
import { focusMode } from './focusMode.js';
import { scheduler } from './scheduler.js';
import { analytics } from './analytics.js';

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    viewButtons: document.querySelectorAll('[data-view]'),
    views: document.querySelectorAll('.view'),
    taskList: document.getElementById('task-list'),
    addTaskBtn: document.getElementById('add-task-btn'),
    cmdDialog: document.getElementById('command-bar'),
    cmdInput: document.getElementById('cmd-input')
};

// Initialization
function init() {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', store.state.theme);

    // Subscribe to state changes
    store.subscribe((state) => {
        renderTasks(state.tasks);
    });

    // Initial Render
    renderTasks(store.state.tasks);
    calendar.init();
    commandBar.init();
    focusMode.init();
    scheduler.init();
    analytics.init();
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // Theme Toggle
    elements.themeToggle.addEventListener('click', () => {
        const themes = ['day', 'sunset', 'night'];
        const currentIdx = themes.indexOf(store.state.theme);
        const nextTheme = themes[(currentIdx + 1) % themes.length];
        store.setTheme(nextTheme);
    });

    // Navigation
    elements.viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            switchView(viewName);
        });
    });

    // Add Task (Simple prompt for MVP)
    elements.addTaskBtn.addEventListener('click', () => {
        const text = prompt("What needs to be done?");
        if (text) store.addTask(text);
    });

    // Note: Command Bar logic is now handled in commandBar.js
}

// Render Logic
function renderTasks(tasks) {
    elements.taskList.innerHTML = '';

    if (tasks.length === 0) {
        elements.taskList.innerHTML = '<div class="empty-state">No tasks yet.</div>';
        return;
    }

    tasks.forEach(task => {
        const el = document.createElement('div');
        el.className = `task-item ${task.completed ? 'completed' : ''}`;
        el.style.padding = '1rem';
        el.style.borderBottom = '1px solid var(--border-subtle)';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.gap = '1rem';

        el.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span style="flex:1; text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.text}</span>
            <input type="date" class="task-date-picker" value="${task.scheduledTime ? task.scheduledTime.split('T')[0] : ''}" style="border: 1px solid var(--border-subtle); padding: 4px; border-radius: 4px; font-family: inherit; color: var(--text-muted);">
            <button class="delete-btn" style="color:red; border:none; background:none; cursor:pointer;">&times;</button>
        `;

        // Checkbox listener
        const checkbox = el.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => store.toggleTask(task.id));

        // Date Picker listener
        const datePicker = el.querySelector('.task-date-picker');
        datePicker.addEventListener('change', (e) => {
            if (e.target.value) {
                // Set time to 9am local to avoid timezone issues for now/simplicity
                const date = new Date(e.target.value);
                date.setHours(9, 0, 0, 0);
                store.updateTask(task.id, { scheduledTime: date.toISOString() });
            } else {
                store.updateTask(task.id, { scheduledTime: null });
            }
        });

        // Delete listener
        const deleteBtn = el.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => store.deleteTask(task.id));

        elements.taskList.appendChild(el);
    });
}

function switchView(viewName) {
    // Update Tabs
    elements.viewButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update Views
    elements.views.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden'); // Helper to ensure hiding
    });

    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
        activeView.classList.remove('hidden');
        activeView.classList.add('active');
    }
}

// Start App
init();
