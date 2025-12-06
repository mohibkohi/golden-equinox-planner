/**
 * Authentication Module (Local)
 * Handles user management using localStorage
 */

export const auth = {
    state: {
        currentUser: JSON.parse(localStorage.getItem('ge_user')) || null
    },

    listeners: [],

    /**
     * Subscribe to auth changes
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.listeners.push(callback);
    },

    /**
     * Notify listeners of state change
     */
    notify() {
        this.listeners.forEach(cb => cb(this.state.currentUser));
    },

    /**
     * Initialize (Mock for consistency with Firebase interface)
     */
    init() {
        // No-op for local
        this.notify();
    },

    /**
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    async signup(email, password, name) {
        // Simulate async
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('ge_users')) || [];

            if (users.find(u => u.email === email)) {
                reject(new Error('User already exists'));
                return;
            }

            const newUser = {
                id: 'user_' + Date.now(),
                email,
                password, // Mock: In real app use encryption
                name,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('ge_users', JSON.stringify(users));

            // Auto login
            this.login(email, password).then(resolve).catch(reject);
        });
    },

    /**
     * Log in a user
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        return new Promise((resolve, reject) => {
            const users = JSON.parse(localStorage.getItem('ge_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                reject(new Error('Invalid credentials'));
                return;
            }

            // Create session user
            const sessionUser = { ...user };
            delete sessionUser.password;

            this.state.currentUser = sessionUser;
            localStorage.setItem('ge_user', JSON.stringify(sessionUser));
            this.notify();
            resolve(sessionUser);
        });
    },

    /**
     * Log out current user
     */
    async logout() {
        this.state.currentUser = null;
        localStorage.removeItem('ge_user');
        this.notify();
        return Promise.resolve();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.state.currentUser;
    }
};

// Initialize listener immediately
auth.init();
