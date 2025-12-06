import { store } from './store.js';
import { utils } from './utils.js';
import { calendar } from './calendar.js';
import { commandBar } from './commandBar.js';
import { focusMode } from './focusMode.js';
import { scheduler } from './scheduler.js';
import { analytics } from './analytics.js';
import { auth } from './auth.js';

// DOM Elements
const elements = {
    viewButtons: document.querySelectorAll('[data-view]'),
    views: document.querySelectorAll('.view'),
    taskList: document.getElementById('task-list'),
    addTaskBtn: document.getElementById('add-task-btn'),
    cmdDialog: document.getElementById('command-bar'),
    cmdInput: document.getElementById('cmd-input'),
    authView: document.getElementById('view-auth'),
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    showSignupBtn: document.getElementById('show-signup'),
    showLoginBtn: document.getElementById('show-login'),
    settingsBtn: document.getElementById('settings-btn'),
    settingsModal: document.getElementById('settings-modal'),
    settingsOverlay: document.getElementById('settings-overlay'),
    closeSettingsBtn: document.getElementById('close-settings'),
    themeBtns: document.querySelectorAll('[data-set-theme]'),
    logoutBtnSettings: document.getElementById('logout-btn-settings')
};

// Initialization
function init() {
    // Set initial theme
    const savedTheme = localStorage.getItem('ge_theme') || 'day';
    document.documentElement.setAttribute('data-theme', savedTheme);
    store.setTheme(savedTheme); // Ensure store is synced
    updateActiveThemeBtn(savedTheme);

    // Subscribe to state changes
    store.subscribe((state) => {
        renderTasks(state.tasks);
        // Update active theme button if state changes elsewhere
        if (state.theme) updateActiveThemeBtn(state.theme);
    });

    // Check Auth Status
    if (auth.isAuthenticated()) {
        elements.authView.classList.add('hidden');
        initializeAppContent();
    } else {
        elements.authView.classList.remove('hidden');
    }

    setupAuthListeners();
    setupEventListeners();
}

function initializeAppContent() {
    renderTasks(store.state.tasks);
    calendar.init();
    commandBar.init();
    focusMode.init();
    scheduler.init();
    analytics.init();
}

// Event Listeners
function setupAuthListeners() {
    // Toggle Forms
    elements.showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.loginForm.classList.add('hidden');
        elements.signupForm.classList.remove('hidden');
    });

    elements.showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        elements.signupForm.classList.add('hidden');
        elements.loginForm.classList.remove('hidden');
    });

    // Login Submit
    elements.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            await auth.login(email, password);
            elements.authView.classList.add('hidden');
            initializeAppContent();
        } catch (err) {
            alert(err.message);
        }
    });

    // Signup Submit
    elements.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            await auth.signup(email, password, name);
            elements.authView.classList.add('hidden');
            initializeAppContent();
            alert('Welcome ' + name + '!');
        } catch (err) {
            alert(err.message);
        }
    });
}

function setupEventListeners() {
    // Settings Logic
    function toggleSettings(show) {
        if (show) {
            elements.settingsModal.classList.remove('hidden');
            elements.settingsOverlay.classList.remove('hidden');
        } else {
            elements.settingsModal.classList.add('hidden');
            elements.settingsOverlay.classList.add('hidden');
        }
    }

    elements.settingsBtn.addEventListener('click', () => toggleSettings(true));
    elements.closeSettingsBtn.addEventListener('click', () => toggleSettings(false));
    elements.settingsOverlay.addEventListener('click', () => toggleSettings(false));

    // Theme Selection
    elements.themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.setTheme;
            store.setTheme(theme);
            updateActiveThemeBtn(theme);
        });
    });

    // Logout from Settings
    elements.logoutBtnSettings.addEventListener('click', async () => {
        if (confirm('Are you sure you want to log out?')) {
            await auth.logout();
            toggleSettings(false);
            elements.authView.classList.remove('hidden');
            window.location.reload();
        }
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

function updateActiveThemeBtn(theme) {
    elements.themeBtns.forEach(btn => {
        if (btn.dataset.setTheme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Start App
init();
