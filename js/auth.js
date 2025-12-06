/**
 * Authentication Module (Firebase)
 * Handles user management using Firebase Auth
 */

import { auth as firebaseAuth } from './firebaseConfig.js';

export const auth = {
    state: {
        currentUser: null
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
     * Initialize Auth Listener
     */
    init() {
        if (!firebaseAuth) return;

        firebaseAuth.onAuthStateChanged(user => {
            if (user) {
                this.state.currentUser = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || user.email.split('@')[0]
                };
            } else {
                this.state.currentUser = null;
            }
            this.notify();
        });
    },

    /**
     * Register a new user
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    async signup(email, password, name) {
        if (!firebaseAuth) throw new Error("Firebase not initialized. Check config.");

        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            // Update profile with name
            await userCredential.user.updateProfile({
                displayName: name
            });
            return userCredential.user;
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
        if (!firebaseAuth) throw new Error("Firebase not initialized. Check config.");

        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Login Error:", error);
            throw error;
        }
    },

    /**
     * Log out current user
     */
    async logout() {
        if (!firebaseAuth) return;
        try {
            await firebaseAuth.signOut();
        } catch (error) {
            console.error("Logout Error:", error);
        }
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
