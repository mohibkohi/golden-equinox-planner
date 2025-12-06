import { utils } from './utils.js';

class Store {
    constructor() {
        this.state = {
            tasks: JSON.parse(localStorage.getItem('ge_tasks')) || [],
            theme: localStorage.getItem('ge_theme') || 'day',
            user: { name: 'Creator' }
        };
        this.listeners = [];
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

    // Actions
    addTask(text) {
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
        this.state.tasks = this.state.tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        this.save();
    }

    updateTask(id, updates) {
        this.state.tasks = this.state.tasks.map(t =>
            t.id === id ? { ...t, ...updates } : t
        );
        this.save();
    }

    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
    }

    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.save();
    }

    save() {
        localStorage.setItem('ge_tasks', JSON.stringify(this.state.tasks));
        localStorage.setItem('ge_theme', this.state.theme);
        this.notify();
    }
}

export const store = new Store();
