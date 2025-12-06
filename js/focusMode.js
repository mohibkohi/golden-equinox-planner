import { store } from './store.js';

export const focusMode = {
    isActive: false,
    timerInterval: null,
    timeLeft: 25 * 60, // 25 minutes
    overlay: null,

    init() {
        const startBtn = document.getElementById('start-focus');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
    },

    start() {
        if (this.isActive) return;
        this.isActive = true;

        // Pick the first uncompleted task or default
        const currentTask = store.state.tasks.find(t => !t.completed) || { text: "Focus on your work" };

        this.createOverlay(currentTask.text);
        this.startTimer();
    },

    stop() {
        this.isActive = false;
        clearInterval(this.timerInterval);
        this.timeLeft = 25 * 60;
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    },

    createOverlay(taskText) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'focus-overlay';
        this.overlay.style.position = 'fixed';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100vw';
        this.overlay.style.height = '100vh';
        this.overlay.style.backgroundColor = 'var(--bg-app)';
        this.overlay.style.zIndex = '1000';
        this.overlay.style.display = 'flex';
        this.overlay.style.flexDirection = 'column';
        this.overlay.style.justifyContent = 'center';
        this.overlay.style.alignItems = 'center';
        this.overlay.style.transition = 'all 0.5s ease';

        this.overlay.innerHTML = `
            <h1 style="font-size: 3rem; margin-bottom: 2rem;">${taskText}</h1>
            <div id="focus-timer" style="font-size: 6rem; font-family: monospace; font-weight: bold; margin-bottom: 3rem; color: var(--accent-primary);">25:00</div>
            <button id="stop-focus" class="btn-primary" style="background: transparent; border: 2px solid var(--text-main); color: var(--text-main);">Stop Focus</button>
        `;

        document.body.appendChild(this.overlay);

        document.getElementById('stop-focus').addEventListener('click', () => this.stop());
    },

    startTimer() {
        const timerDisplay = document.getElementById('focus-timer');

        this.timerInterval = setInterval(() => {
            this.timeLeft--;

            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (this.timeLeft <= 0) {
                this.stop();
                alert("Focus session complete!");
            }
        }, 1000);
    }
};
