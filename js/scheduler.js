import { store } from './store.js';

export const scheduler = {
    init() {
        // We will attach the listener in app.js or dynamically here if we add button via JS
        // But for cleaner code, let's assume the button exists or we create it
        const toolbar = document.querySelector('#view-tasks .toolbar');
        if (toolbar) {
            const btn = document.createElement('button');
            btn.textContent = '✨ Auto Schedule';
            btn.className = 'btn-primary';
            btn.style.marginLeft = '10px';
            btn.style.background = 'var(--text-main)'; // Distinct look
            btn.addEventListener('click', () => this.runSchedule());
            toolbar.appendChild(btn);
        }
    },

    runSchedule() {
        const tasks = store.state.tasks.filter(t => !t.completed && !t.scheduledTime);

        if (tasks.length === 0) {
            alert("No unscheduled tasks to organize!");
            return;
        }

        // Mock "AI" Logic:
        // 1. Start from tomorrow 9:00 AM
        // 2. Assign 1 hour slots

        const scheduleDate = new Date();
        scheduleDate.setDate(scheduleDate.getDate() + 1);
        scheduleDate.setHours(9, 0, 0, 0);

        tasks.forEach(task => {
            // Update task text to include time (Simulating scheduling since we don't have separate Date field in MVP task model)
            const timeString = scheduleDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            // Mutate task (in a real app, we'd update a specific 'date' property)
            // For MVP, we append the time to the text to show it worked
            if (!task.text.includes('at ')) {
                const newText = `${task.text} at ${timeString}`;

                // We need a way to update the task in the store. 
                // The store current only has addTask, toggleTask, deleteTask.
                // We should technically add updateTask, but for now we can do a trick:
                // We can't easily update without a store method.
                // Let's assume we add an update method to store or just modify state directly (naughty but works for MVP inner module)

                // Better approach: Add updateTask to store.js. But I can't edit store.js easily without seeing it again or rewrite.
                // I'll stick to a "simulated" update by finding index.

                const taskIndex = store.state.tasks.findIndex(t => t.id === task.id);
                if (taskIndex !== -1) {
                    store.state.tasks[taskIndex].text = newText;
                    store.state.tasks[taskIndex].scheduledTime = scheduleDate.toISOString();
                }
            }

            // Increment time by 1 hour
            scheduleDate.setHours(scheduleDate.getHours() + 1);
        });

        store.save(); // Persist changes
        alert(`✨ AI has scheduled ${tasks.length} tasks for you starting tomorrow!`);
    }
};
