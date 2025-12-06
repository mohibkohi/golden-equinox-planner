/**
 * Authentication Module (Custom Backend)
 * Handles user management via /api endpoints
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
     * Initialize 
     */
    init() {
        this.notify();
    },

    /**
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    async signup(email, password, name) {
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // Auto-login logic included in backend response if needed, 
            // but for now we follow up with immediate login or just use the user object
            this.state.currentUser = data.user;
            localStorage.setItem('ge_user', JSON.stringify(data.user));
            this.notify();
            return data.user;
        } catch (error) {
            console.error("Signup Error:", error);
            throw error;
        }
    },

    /**
     * Log in a user
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            this.state.currentUser = data.user;
            localStorage.setItem('ge_user', JSON.stringify(data.user));
            this.notify();
            return data.user;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
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
