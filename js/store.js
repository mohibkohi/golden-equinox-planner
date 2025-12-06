import { db } from './firebaseConfig.js';
import { auth } from './auth.js';

class Store {
    constructor() {
        this.state = {
            tasks: [],
            theme: localStorage.getItem('ge_theme') || 'day',
            user: null
        };
        this.listeners = [];
        this.unsubscribe = null;

        // Listen for Auth Changes to sync data
        auth.subscribe(user => {
            this.state.user = user;
            if (user) {
                this.initDataSync(user.id);
            } else {
                this.clearData();
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

    // Real-time Data Sync
    initDataSync(userId) {
        if (!db) return; // Guard if SDK not loaded

        if (this.unsubscribe) {
            this.unsubscribe();
        }

        // Subscribe to tasks collection
        this.unsubscribe = db.collection('users').doc(userId).collection('tasks')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const tasks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.state.tasks = tasks;
                this.notify();
            }, error => {
                console.error("Data Sync Error:", error);
            });
    }

    clearData() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        this.state.tasks = [];
        this.notify();
    }

    // Actions
    async addTask(text) {
        if (!this.state.user || !db) return;

        const newTask = {
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        try {
            await db.collection('users').doc(this.state.user.id).collection('tasks').add(newTask);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    }

    async toggleTask(id) {
        if (!this.state.user || !db) return;

        const task = this.state.tasks.find(t => t.id === id);
        if (!task) return;

        try {
            await db.collection('users').doc(this.state.user.id).collection('tasks').doc(id).update({
                completed: !task.completed
            });
        } catch (error) {
            console.error("Error toggling task:", error);
        }
    }

    async updateTask(id, updates) {
        if (!this.state.user || !db) return;

        try {
            await db.collection('users').doc(this.state.user.id).collection('tasks').doc(id).update(updates);
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }

    async deleteTask(id) {
        if (!this.state.user || !db) return;

        try {
            await db.collection('users').doc(this.state.user.id).collection('tasks').doc(id).delete();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    }

    setTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ge_theme', theme); // Keep theme local for now
    }
}

export const store = new Store();
