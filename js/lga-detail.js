// ============================================
// LGA DETAIL PAGE - COMPLETE
// ============================================

import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHeader, updateHeaderStats } from './components/header.js';
import { renderFooter, updateFooter, initFooter } from './components/footer.js';
import { BAUCHI_DATA, getWardsByLGA, getPollingUnitsByWard, getAllPollingUnitsByLGA } from './bauchi-data.js';

// ===== STATE =====
let lgaData = null;
let lgaId = null;
let chart = null;
let chartMode = 'normal';
let activityInterval = null;

// ===== GET LGA ID FROM URL =====
function getLGAId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'BAU001';
}

// ===== RENDER COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    lgaId = getLGAId();
    
    document.getElementById('navbar-container').innerHTML = renderNavbar('lga');
    document.getElementById('header-container').innerHTML = renderHeader('LGA Details', 'Complete breakdown of LGA results');
    document.getElementById('footer-container').innerHTML = renderFooter();

    initNavbar();
    initFooter();
    loadLGAData();
    setupRealtimeUpdates();
});

// ===== LOAD LGA DATA =====
async function loadLGAData() {
    try {
        const data = await getLGAData(lgaId);
        lgaData = data;
        renderLGAData(data);
        
        updateHeaderStats({
            totalVotes: data.votes || 0,
            completedLGAs: 0,
            totalLGAs: 20,
            totalAgents: data.agents || 0
        });
        updateFooter({
            totalLGAs: 20,
            totalPUs: 2984,
            totalAgents: data.agents || 0
        });
        
    } catch (error) {
        console.error('Error loading LGA data:', error);
        showToast('Error loading LGA data', 'error');
    }
}

// ===== GET LGA DATA =====
async function getLGAData(id) {
    const lga = BAUCHI_DATA.lgAs.find(l => l.id === id);
    if (!lga) {
        const fallback = BAUCHI_DATA.lgAs[0];
        return generateMockLGAData(fallback);
    }
    return generateMockLGAData(lga);
}

// ===== GENERATE MOCK LGA DATA =====
function generateMockLGAData(lga) {
    const statuses = ['completed', 'counting', 'pending', 'incident'];
    const status = statuses[Math.floor(Math.random() * 4)];
    const votes = Math.floor(Math.random() * 30000) + 5000;
    const turnout = Math.floor(Math.random() * 80) + 15;
    const agents = Math.floor(Math.random() * 25) + 5;
    
    const wards = lga.wards.map(ward => ({
        name: ward.name,
        pollingUnits: ward.pollingUnits.map(pu => ({
            id: pu,
            reported: Math.random() > 0.3,
            votes: Math.floor(Math.random() * 500) + 50,
            agents: Math.floor(Math.random() * 3) + 1,
            status: Math.random() > 0.4 ? 'reported' : 'pending'
        })),
        status: Math.random() > 0.4 ? 'reported' : 'pending',
        votes: Math.floor(Math.random() * 2000) + 200
    }));
    
    const partyResults = {
        APC: Math.floor(Math.random() * 10000) + 2000,
        PDP: Math.floor(Math.random() * 8000) + 1000,
        NNPP: Math.floor(Math.random() * 4000) + 500,
        APGA: Math.floor(Math.random() * 2000) + 200,
        Others: Math.floor(Math.random() * 1000) + 100
    };
    
    const activities = [
        { agent: 'Musa Bello', action: 'submitted results', time: '5 min ago' },
        { agent: 'Fatima Umar', action: 'verified votes', time: '12 min ago' },
        { agent: 'Ahmed Adamu', action: 'reported incident', time: '25 min ago' },
        { agent: 'Zainab Ali', action: 'updated counts', time: '45 min ago' },
        { agent: 'Ibrahim Musa', action: 'submitted results', time: '1 hour ago' }
    ];
    
    const incidents = [
        { title: 'Ballot Box Snatching', description: 'Incident at polling unit PU003', severity: 'HIGH', time: '15 min ago' },
        { title: 'Voter Intimidation', description: 'Voters being intimidated at PU007', severity: 'MEDIUM', time: '45 min ago' },
        { title: 'Logistics Issue', description: 'Late arrival of materials at PU012', severity: 'LOW', time: '2 hours ago' }
    ];
    
    return {
        ...lga,
        status,
        votes,
        turnout,
        agents,
        wards,
        partyResults,
        activities,
        incidents,
        totalWards: lga.wards.length,
        totalPollingUnits: lga.wards.reduce((sum, w) => sum + w.pollingUnits.length, 0),
        reportedPUs: Math.floor(Math.random() * 30) + 10,
        lastUpdate: new Date().toLocaleTimeString(),
        performanceScore: Math.floor(Math.random() * 30) + 70,
        riskLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        fraudRisk: (Math.random() * 5).toFixed(1),
        errorRisk: (Math.random() * 4).toFixed(1),
        completionTime: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`
    };
}

// ===== RENDER LGA DATA =====
function renderLGAData(data) {
    // Overview
    const codeEl = document.getElementById('lgaCode');
    const statusEl = document.getElementById('lgaStatus');
    const riskEl = document.getElementById('lgaAIRisk');
    const nameEl = document.getElementById('lgaName');
    const hqEl = document.getElementById('lgaHeadquarters');
    const wardsEl = document.getElementById('lgaWards');
    const pusEl = document.getElementById('lgaPUs');
    const agentsEl = document.getElementById('lgaAgents');
    const scoreEl = document.getElementById('lgaAIScore');
    const votesEl = document.getElementById('lgaTotalVotes');
    const turnoutEl = document.getElementById('lgaTurnout');
    const predEl = document.getElementById('lgaAIPrediction');
    const perfEl = document.getElementById('performanceScore');
    const riskIndicatorEl = document.getElementById('riskIndicator');
    const fraudEl = document.getElementById('fraudRisk');
    const errorEl = document.getElementById('errorRisk');
    const turnoutPredEl = document.getElementById('turnoutPrediction');
    const completionEl = document.getElementById('completionTime');
    const aiStatusEl = document.getElementById('lgaAIStatus');
    const aiConfidenceEl = document.getElementById('lgaAIConfidence');
    const riskLevelEl = document.getElementById('lgaRiskLevel');
    const dataPointsEl = document.getElementById('lgaDataPoints');
    
    if (codeEl) codeEl.textContent = data.code || '---';
    if (statusEl) {
        statusEl.textContent = data.status.toUpperCase();
        statusEl.className = `lga-status ${data.status}`;
    }
    if (riskEl) {
        riskEl.textContent = `AI: ${data.riskLevel || 'Low'} Risk`;
        riskEl.className = `lga-ai-risk ${(data.riskLevel || 'low').toLowerCase()}`;
    }
    if (nameEl) nameEl.textContent = data.name;
    if (hqEl) hqEl.textContent = data.headquarters || '---';
    if (wardsEl) wardsEl.textContent = data.totalWards || 0;
    if (pusEl) pusEl.textContent = data.totalPollingUnits || 0;
    if (agentsEl) agentsEl.textContent = data.agents || 0;
    if (scoreEl) scoreEl.textContent = `AI Score: ${data.performanceScore || 0}`;
    if (votesEl) votesEl.textContent = data.votes.toLocaleString();
    if (turnoutEl) turnoutEl.textContent = `${data.turnout}%`;
    if (predEl) predEl.textContent = `${data.performanceScore || 0}%`;
    if (perfEl) perfEl.textContent = data.performanceScore || 0;
    if (riskIndicatorEl) riskIndicatorEl.textContent = data.riskLevel || 'Low';
    if (fraudEl) fraudEl.textContent = `${data.fraudRisk || 0}%`;
    if (errorEl) errorEl.textContent = `${data.errorRisk || 0}%`;
    if (turnoutPredEl) turnoutPredEl.textContent = `${data.turnout || 0}%`;
    if (completionEl) completionEl.textContent = data.completionTime || '--';
    if (aiStatusEl) aiStatusEl.textContent = 'Active';
    if (aiConfidenceEl) aiConfidenceEl.textContent = '96.3%';
    if (riskLevelEl) riskLevelEl.textContent = data.riskLevel || 'Low';
    if (dataPointsEl) dataPointsEl.textContent = '1,247';
    
    renderPartyResults(data.partyResults);
    renderChart(data.partyResults);
    renderWards(data.wards);
    renderActivities(data.activities);
    renderIncidents(data.incidents);
    
    const countEl = document.getElementById('activityCount');
    if (countEl) countEl.textContent = `${data.activities.length} active`;
}

// ===== RENDER PARTY RESULTS =====
function renderPartyResults(partyResults) {
    const container = document.getElementById('partyResultsList');
    if (!container) return;
    
    const total = Object.values(partyResults).reduce((sum, v) => sum + v, 0);
    const partyColors = {
        APC: '#00C49F',
        PDP: '#0088FE',
        NNPP: '#FFBB28',
        APGA: '#FF8042',
        Others: '#8884D8'
    };
    
    container.innerHTML = Object.entries(partyResults)
        .sort((a, b) => b[1] - a[1])
        .map(([party, votes]) => {
            const percent = total > 0 ? (votes / total * 100) : 0;
            return `
                <div class="party-result-item">
                    <div class="party-color" style="background: ${partyColors[party] || '#8884D8'}"></div>
                    <span class="party-name">${party}</span>
                    <div class="party-bar">
                        <div class="fill" style="width: ${percent}%; background: ${partyColors[party] || '#8884D8'}"></div>
                    </div>
                    <span class="party-votes">${votes.toLocaleString()}</span>
                    <span class="party-percent">${percent.toFixed(1)}%</span>
                </div>
            `;
        }).join('');
}

// ===== RENDER CHART =====
function renderChart(partyResults) {
    const ctx = document.getElementById('lgaChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    if (chart) chart.destroy();
    
    const partyColors = {
        APC: '#00C49F',
        PDP: '#0088FE',
        NNPP: '#FFBB28',
        APGA: '#FF8042',
        Others: '#8884D8'
    };
    
    const labels = Object.keys(partyResults);
    const data = Object.values(partyResults);
    const colors = labels.map(label => partyColors[label] || '#8884D8');
    
    chart = new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Votes',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c + '33'),
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toLocaleString()} votes`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94A3B8', callback: v => v.toLocaleString() },
                    grid: { color: '#1E293B' }
                },
                x: {
                    ticks: { color: '#94A3B8' },
                    grid: { display: false }
                }
            }
        }
    });
}

// ===== TOGGLE CHART MODE =====
window.toggleChartMode = function() {
    if (!chart || !lgaData) return;
    
    chartMode = chartMode === 'normal' ? 'ai' : 'normal';
    const btn = document.querySelector('.btn-toggle');
    
    if (chartMode === 'ai') {
        btn.innerHTML = '<i class="fas fa-exchange-alt"></i> Normal View';
        // Add AI overlay to chart
        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(c => c + '44');
        chart.update();
        showToast('AI analysis mode enabled');
    } else {
        btn.innerHTML = '<i class="fas fa-exchange-alt"></i> AI View';
        chart.data.datasets[0].backgroundColor = chart.data.datasets[0].backgroundColor.map(c => c.replace('44', ''));
        chart.update();
        showToast('Normal view mode enabled');
    }
};

// ===== RENDER WARDS =====
function renderWards(wards) {
    const container = document.getElementById('wardsGrid');
    if (!container) return;
    
    container.innerHTML = wards.map(ward => {
        const reported = ward.pollingUnits.filter(pu => pu.reported).length;
        const total = ward.pollingUnits.length;
        const status = reported === total ? 'reported' : 'pending';
        const aiFlagged = Math.random() > 0.8 ? 'ai-flagged' : '';
        
        return `
            <div class="ward-card ${aiFlagged}">
                <div class="ward-header">
                    <span class="ward-name">${ward.name}</span>
                    <span class="ward-status ${status}">${status.toUpperCase()}</span>
                    ${aiFlagged ? '<span class="ai-flag"><i class="fas fa-robot"></i> AI</span>' : ''}
                </div>
                <div class="ward-pus">
                    ${ward.pollutingUnits ? ward.pollutingUnits.map(pu => `
                        <span class="pu-tag ${pu.reported ? 'reported' : 'pending'}">
                            ${pu.id}
                            ${pu.reported ? '✓' : '⏳'}
                        </span>
                    `).join('') : ''}
                </div>
                <div class="ward-stats">
                    <span><i class="fas fa-vote-yea"></i> ${ward.votes.toLocaleString()} votes</span>
                    <span><i class="fas fa-check-circle"></i> ${reported}/${total} reported</span>
                    <span><i class="fas fa-users"></i> ${ward.pollutingUnits ? ward.pollutingUnits.reduce((sum, pu) => sum + pu.agents, 0) : 0} agents</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== ANALYZE WARDS =====
window.analyzeWards = function() {
    const btn = document.querySelector('.btn-ai-analyze');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        btn.disabled = true;
    }
    
    setTimeout(() => {
        document.querySelectorAll('.ward-card').forEach((card, index) => {
            if (index % 3 === 0) {
                card.style.borderColor = 'var(--brand-warning)';
                card.style.background = 'rgba(234, 179, 8, 0.05)';
            }
        });
        if (btn) {
            btn.innerHTML = '<i class="fas fa-robot"></i> AI Analyze';
            btn.disabled = false;
        }
        showToast('AI analysis complete');
    }, 2000);
};

// ===== RENDER ACTIVITIES =====
function renderActivities(activities) {
    const container = document.getElementById('activityTimeline');
    if (!container) return;
    
    const icons = {
        'submitted results': 'fa-check-circle',
        'verified votes': 'fa-check-double',
        'reported incident': 'fa-exclamation-circle',
        'updated counts': 'fa-sync-alt'
    };
    
    container.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${icons[activity.action] || 'fa-user-check'}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-agent">${activity.agent}</div>
                <div class="activity-action">
                    <span>${activity.action}</span> for ${lgaData?.name || 'LGA'}
                </div>
            </div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `).join('');
}

// ===== RENDER INCIDENTS =====
function renderIncidents(incidents) {
    const container = document.getElementById('incidentsList');
    if (!container) return;
    
    if (incidents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No incidents reported</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = incidents.map(incident => `
        <div class="incident-item" style="border-color: ${incident.severity === 'HIGH' ? 'var(--brand-danger)' : incident.severity === 'MEDIUM' ? 'var(--brand-warning)' : 'var(--brand-primary-light)'}">
            <div class="incident-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="incident-content">
                <div class="incident-title">${incident.title}</div>
                <div class="incident-desc">${incident.description}</div>
                <div class="incident-meta">
                    <span>${incident.time}</span>
                    <span class="incident-severity ${incident.severity}">${incident.severity}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== FILTER WARDS =====
window.filterWards = function() {
    const search = document.getElementById('wardSearch');
    const puFilter = document.getElementById('puFilter');
    if (!search || !puFilter) return;
    
    const query = search.value.toLowerCase();
    const filter = puFilter.value;
    
    const wardCards = document.querySelectorAll('.ward-card');
    wardCards.forEach(card => {
        const name = card.querySelector('.ward-name')?.textContent.toLowerCase() || '';
        const pus = card.querySelectorAll('.pu-tag');
        let show = name.includes(query);
        
        if (show && filter !== 'all') {
            const hasMatch = Array.from(pus).some(pu => 
                filter === 'reported' ? pu.classList.contains('reported') :
                filter === 'pending' ? pu.classList.contains('pending') :
                filter === 'ai_flagged' ? card.classList.contains('ai-flagged') : false
            );
            show = hasMatch;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
};

// ===== REPORT INCIDENT =====
window.reportIncident = function() {
    const modal = document.getElementById('incidentModal');
    if (modal) modal.classList.add('active');
};

window.closeIncidentModal = function() {
    const modal = document.getElementById('incidentModal');
    if (modal) modal.classList.remove('active');
    const form = document.getElementById('incidentForm');
    if (form) form.reset();
};

window.submitIncident = function(event) {
    event.preventDefault();
    const type = document.getElementById('incidentType');
    const description = document.getElementById('incidentDescription');
    const severity = document.getElementById('incidentSeverity');
    
    if (!type || !description || !severity) return;
    
    const newIncident = {
        title: type.value,
        description: description.value,
        severity: severity.value,
        time: 'Just now'
    };
    
    const container = document.getElementById('incidentsList');
    if (!container) return;
    
    const incidentHTML = `
        <div class="incident-item" style="border-color: ${newIncident.severity === 'HIGH' ? 'var(--brand-danger)' : newIncident.severity === 'MEDIUM' ? 'var(--brand-warning)' : 'var(--brand-primary-light)'}">
            <div class="incident-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="incident-content">
                <div class="incident-title">${newIncident.title}</div>
                <div class="incident-desc">${newIncident.description}</div>
                <div class="incident-meta">
                    <span>${newIncident.time}</span>
                    <span class="incident-severity ${newIncident.severity}">${newIncident.severity}</span>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', incidentHTML);
    closeIncidentModal();
    showToast('Incident reported successfully!');
};

// ===== REFRESH LGA DATA =====
window.refreshLGAData = function() {
    const btn = document.querySelector('.btn-refresh i');
    if (btn) {
        btn.classList.add('fa-spin');
        setTimeout(() => btn.classList.remove('fa-spin'), 1000);
    }
    loadLGAData();
    showToast('Data refreshed!');
};

// ===== SETUP REALTIME UPDATES =====
function setupRealtimeUpdates() {
    if (activityInterval) clearInterval(activityInterval);
    
    activityInterval = setInterval(() => {
        if (!lgaData) return;
        
        const agents = ['Musa Bello', 'Fatima Umar', 'Ahmed Adamu', 'Zainab Ali', 'Ibrahim Musa'];
        const actions = ['submitted results', 'verified votes', 'reported incident', 'updated counts'];
        
        const newActivity = {
            agent: agents[Math.floor(Math.random() * agents.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            time: 'Just now'
        };
        
        const container = document.getElementById('activityTimeline');
        if (!container) return;
        
        const activityHTML = `
            <div class="activity-item" style="border-color: var(--brand-primary);">
                <div class="activity-icon">
                    <i class="fas fa-user-check"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-agent">${newActivity.agent}</div>
                    <div class="activity-action">
                        <span>${newActivity.action}</span> for ${lgaData?.name || 'LGA'}
                    </div>
                </div>
                <div class="activity-time">${newActivity.time}</div>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', activityHTML);
        
        const items = container.querySelectorAll('.activity-item');
        if (items.length > 10) {
            items.forEach((item, index) => {
                if (index >= 10) item.remove();
            });
        }
        
        const count = container.querySelectorAll('.activity-item').length;
        const countEl = document.getElementById('activityCount');
        if (countEl) countEl.textContent = `${count} active`;
        
    }, 30000);
}

// ===== TOAST =====
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `ai-toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// ===== EXPOSE GLOBAL =====
window.toggleChartMode = toggleChartMode;
window.filterWards = filterWards;
window.analyzeWards = analyzeWards;
window.reportIncident = reportIncident;
window.closeIncidentModal = closeIncidentModal;
window.submitIncident = submitIncident;
window.refreshLGAData = refreshLGAData;
