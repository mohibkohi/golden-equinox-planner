```javascript
import { auth } from './auth.js';
import { utils } from './utils.js';

class Store {
    constructor() {
        this.state = {
            tasks: [],
            theme: localStorage.getItem('ge_theme') || 'day',
            user: null
        };
        this.listeners = [];

        // Listen for Auth Changes to sync data
        auth.subscribe(user => {
            this.state.user = user;
            if (user) {
                this.loadTasks(user.id);
            } else {
                this.state.tasks = [];
                this.notify();
            }
        });
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // Local Data Sync
    loadTasks(userId) {
        const key = `ge_tasks_${ userId } `;
        this.state.tasks = JSON.parse(localStorage.getItem(key)) || [];
        this.notify();
    }

    save() {
        if (!this.state.user) return;
        const key = `ge_tasks_${ this.state.user.id } `;
        localStorage.setItem(key, JSON.stringify(this.state.tasks));
        
        // Also save theme globally
        localStorage.setItem('ge_theme', this.state.theme);
        this.notify();
    }

    // Actions
    addTask(text) {
        if (!this.state.user) return;

        const newTask = {
            id: utils.generateId(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.state.tasks = [newTask, ...this.state.tasks];
        this.save();
    }

    toggleTask(id) {
        if (!this.state.user) return;
        
        this.state.tasks = this.state.tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        this.save();
    }

    updateTask(id, updates) {
        if (!this.state.user) return;

        this.state.tasks = this.state.tasks.map(t =>
            t.id === id ? { ...t, ...updates } : t
        );
        this.save();
    }

    deleteTask(id) {
        if (!this.state.user) return;

        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
    }

    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ge_theme', theme);
    }
}

export const store = new Store();
```
