// ============================================
// CENTRALIZED HEADER COMPONENT
// ============================================

export function renderHeader(title = 'Dashboard', subtitle = '') {
    const headerHTML = `
        <header class="page-header">
            <div class="header-content">
                <div class="header-left">
                    <h1 class="page-title">
                        <i class="fas fa-${getTitleIcon(title)}"></i>
                        ${title}
                    </h1>
                    ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
                </div>
                <div class="header-right">
                    <div class="header-stats" id="headerStats">
                        <div class="header-stat">
                            <span class="stat-label">Total LGAs</span>
                            <span class="stat-value">20</span>
                        </div>
                        <div class="header-stat">
                            <span class="stat-label">Completed</span>
                            <span class="stat-value" id="headerCompleted">0/20</span>
                        </div>
                        <div class="header-stat">
                            <span class="stat-label">Total Votes</span>
                            <span class="stat-value" id="headerVotes">0</span>
                        </div>
                        <div class="header-stat">
                            <span class="stat-label">Agents</span>
                            <span class="stat-value" id="headerAgents">0</span>
                        </div>
                    </div>
                    <button class="btn-refresh-header" onclick="window.refreshPageData()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="header-breadcrumb">
                <span><i class="fas fa-home"></i> Home</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${title}</span>
            </div>
        </header>
    `;

    return headerHTML;
}

// ===== HELPER FUNCTIONS =====
function getTitleIcon(title) {
    const icons = {
        'Dashboard': 'home',
        'Tracking': 'map-marked-alt',
        'LGAs': 'map-pin',
        'Register Agent': 'user-plus',
        'Agents': 'user-check',
        'Live Stream': 'broadcast',
        'Results': 'chart-bar',
        'Settings': 'cog',
        'LGA Details': 'info-circle'
    };
    return icons[title] || 'file';
}

// ===== UPDATE HEADER STATS =====
export function updateHeaderStats(data) {
    const completed = document.getElementById('headerCompleted');
    const votes = document.getElementById('headerVotes');
    const agents = document.getElementById('headerAgents');

    if (completed) completed.textContent = `${data.completedLGAs || 0}/${data.totalLGAs || 20}`;
    if (votes) votes.textContent = (data.totalVotes || 0).toLocaleString();
    if (agents) agents.textContent = data.totalAgents || 0;
}

// ===== REFRESH FUNCTION =====
window.refreshPageData = function() {
    const btn = document.querySelector('.btn-refresh-header i');
    if (btn) {
        btn.classList.add('fa-spin');
        setTimeout(() => btn.classList.remove('fa-spin'), 1000);
    }
    // Trigger page refresh
    if (window.loadDashboardData) {
        window.loadDashboardData();
    } else if (window.loadTrackingData) {
        window.loadTrackingData();
    } else if (window.loadLGAData) {
        window.loadLGAData();
    } else {
        location.reload();
    }
};
