import { store } from './store.js';

export const commandBar = {
    dialog: null,
    input: null,

    init() {
        this.dialog = document.getElementById('command-bar');
        this.input = document.getElementById('cmd-input');

        if (!this.dialog || !this.input) return;

        this.setupListeners();
    },

    setupListeners() {
        // Global Toggle
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close on backdrop click
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) this.close();
        });

        // Handle Input
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.input.value.trim()) {
                this.processCommand(this.input.value.trim());
                this.input.value = '';
                this.close();
            }
            if (e.key === 'Escape') {
                this.close();
            }
        });
    },

    toggle() {
        if (this.dialog.open) {
            this.close();
        } else {
            this.dialog.showModal();
        }
    },

    close() {
        this.dialog.close();
    },

    processCommand(text) {
        // Simple NLP: Check for special keywords
        // "Buy milk tomorrow" -> Task: Buy milk, Date: Tomorrow (Mocked for now)
        // "Theme night" -> Helper to switch theme

        const lower = text.toLowerCase();

        // 1. Theme Commands
        if (lower.startsWith('theme ')) {
            const theme = lower.replace('theme ', '').trim();
            if (['day', 'sunset', 'night'].includes(theme)) {
                store.setTheme(theme);
                return;
            }
        }

        // 2. Task Creation (Default)
        // Check for time keywords (very basic)
        let cleanText = text;
        let isUrgent = false;

        if (lower.includes('!urgent')) {
            isUrgent = true;
            cleanText = cleanText.replace(/!urgent/i, '').trim();
        }

        store.addTask(cleanText); // We need to update addTask to handle metadata later

        console.log(`Command Processed: ${text} -> Task Created`);
    }
};
