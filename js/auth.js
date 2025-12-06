/**
 * Authentication Module
 * Handles local user management using localStorage
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
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    signup(email, password, name) {
        const users = JSON.parse(localStorage.getItem('ge_users')) || [];

        if (users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'user_' + Date.now(),
            email,
            password, // In a real app, never store plain text passwords!
            name,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('ge_users', JSON.stringify(users));

        // Auto login
        this.login(email, password);
        return newUser;
    },

    /**
     * Log in a user
     * @param {string} email 
     * @param {string} password 
     */
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('ge_users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Create session user (exclude password)
        const sessionUser = { ...user };
        delete sessionUser.password;

        this.state.currentUser = sessionUser;
        localStorage.setItem('ge_user', JSON.stringify(sessionUser));
        this.notify();
        return sessionUser;
    },

    /**
     * Log out current user
     */
    logout() {
        this.state.currentUser = null;
        localStorage.removeItem('ge_user');
        this.notify();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.state.currentUser;
    }
};
