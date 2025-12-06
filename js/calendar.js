import { utils } from './utils.js';
import { store } from './store.js';

export const calendar = {
    currentDate: new Date(),

    init() {
        this.render();
        this.setupListeners();

        // Re-render when tasks change to show dots/indicators
        store.subscribe(() => this.render());
    },

    setupListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });
    },

    render() {
        const grid = document.getElementById('calendar-grid');
        const title = document.getElementById('calendar-title');

        // Update Title
        title.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);

        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        grid.style.gap = '10px';

        // Headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const header = document.createElement('div');
            header.textContent = day;
            header.style.textAlign = 'center';
            header.style.fontWeight = 'bold';
            header.style.color = 'var(--text-muted)';
            header.style.padding = '0.5rem';
            grid.appendChild(header);
        });

        // Days calculation
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty slots for start of month
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            grid.appendChild(empty);
        }

        // Days
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = d;
            dayEl.style.border = '1px solid var(--border-subtle)';
            dayEl.style.padding = '0.5rem';
            dayEl.style.minHeight = '80px';
            dayEl.style.borderRadius = '8px';
            dayEl.style.backgroundColor = 'var(--bg-panel)';
            dayEl.style.position = 'relative';

            if (isCurrentMonth && d === today.getDate()) {
                dayEl.style.border = '2px solid var(--accent-primary)';
                dayEl.style.fontWeight = 'bold';
            }

            // Render Dots for Tasks
            const tasksFoDay = store.state.tasks.filter(t => {
                if (!t.scheduledTime) return false;
                const taskDate = new Date(t.scheduledTime);
                return taskDate.getDate() === d &&
                    taskDate.getMonth() === month &&
                    taskDate.getFullYear() === year;
            });

            if (tasksFoDay.length > 0) {
                const dots = document.createElement('div');
                dots.style.display = 'flex';
                dots.style.gap = '4px';
                dots.style.marginTop = '4px';
                dots.style.flexWrap = 'wrap';

                tasksFoDay.forEach(t => {
                    const dot = document.createElement('div');
                    dot.style.width = '6px';
                    dot.style.height = '6px';
                    dot.style.borderRadius = '50%';
                    dot.style.backgroundColor = t.completed ? 'var(--text-muted)' : 'var(--accent-primary)';
                    dot.title = t.text;
                    dots.appendChild(dot);
                });
                dayEl.appendChild(dots);
            }

            grid.appendChild(dayEl);
        }
    }
};
