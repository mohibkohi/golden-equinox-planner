import { store } from './store.js';

export const analytics = {
    init() {
        this.render();
        store.subscribe(() => this.render());
    },

    render() {
        const dashboard = document.getElementById('analytics-dashboard');
        if (!dashboard) return;

        const tasks = store.state.tasks;
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        if (total === 0) {
            dashboard.innerHTML = '<p class="empty-state">No data to analyze yet.</p>';
            return;
        }

        const completionRate = Math.round((completed / total) * 100);

        dashboard.innerHTML = `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card" style="background: var(--bg-panel); padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-soft);">
                    <h3 style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Completion Rate</h3>
                    <div style="font-size: 2.5rem; font-weight: bold; color: var(--accent-primary);">${completionRate}%</div>
                </div>
                <div class="stat-card" style="background: var(--bg-panel); padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-soft);">
                    <h3 style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Tasks Completed</h3>
                    <div style="font-size: 2.5rem; font-weight: bold;">${completed}/${total}</div>
                </div>
            </div>

            <div class="chart-container" style="background: var(--bg-panel); padding: 2rem; border-radius: 12px; box-shadow: var(--shadow-soft);">
                <h3 style="margin-bottom: 1.5rem;">Productivity Breakdown</h3>
                <div class="bar-chart" style="display: flex; height: 20px; border-radius: 10px; overflow: hidden; background: #eee;">
                    <div style="width: ${completionRate}%; background: var(--accent-primary); transition: width 0.5s;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                    <span>Completed</span>
                    <span>Pending</span>
                </div>
            </div>
        `;
    }
};
