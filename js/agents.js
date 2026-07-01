// ============================================
// AGENTS MANAGEMENT - COMPLETE
// ============================================

import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHeader, updateHeaderStats } from './components/header.js';
import { renderFooter, updateFooter, initFooter } from './components/footer.js';
import { BAUCHI_DATA, getAllLGAs, getWardsByLGA, getPollingUnitsByWard } from './bauchi-data.js';

// ===== STATE =====
let agents = [];
let filteredAgents = [];

// ===== RENDER COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar-container').innerHTML = renderNavbar('agents');
    document.getElementById('header-container').innerHTML = renderHeader('Agents Management', 'AI-powered agent monitoring');
    document.getElementById('footer-container').innerHTML = renderFooter();
    
    initNavbar();
    initFooter();
    loadAgents();
    populateLGAFilter();
    generateAgentInsights();
});

// ===== LOAD AGENTS =====
async function loadAgents() {
    // Mock agents data
    agents = generateMockAgents();
    filteredAgents = agents;
    renderAgents();
    updateStats();
}

// ===== GENERATE MOCK AGENTS =====
function generateMockAgents() {
    const lgas = BAUCHI_DATA.lgAs;
    const names = ['Musa Bello', 'Fatima Umar', 'Ahmed Adamu', 'Zainab Ali', 'Ibrahim Musa', 
                   'Aisha Mohammed', 'Usman Abubakar', 'Halima Ibrahim', 'Sani Abdullahi', 
                   'Rukaiya Bello', 'Aliyu Usman', 'Maryam Sani'];
    
    return lgas.slice(0, 15).map((lga, index) => {
        const statuses = ['active', 'active', 'active', 'pending', 'flagged'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const performance = 70 + Math.random() * 28;
        
        return {
            id: `AGT${String(index + 1).padStart(4, '0')}`,
            name: names[index % names.length],
            email: `agent${index + 1}@example.com`,
            phone: `080${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
            lga: lga.name,
            lgaId: lga.id,
            ward: lga.wards[Math.floor(Math.random() * lga.wards.length)].name,
            pollingUnit: `PU${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
            party: ['APC', 'PDP', 'NNPP', 'APGA'][Math.floor(Math.random() * 4)],
            role: ['LGA_AGENT', 'PU_AGENT', 'COLLATION_OFFICER'][Math.floor(Math.random() * 3)],
            status: status,
            performance: performance,
            tasksCompleted: Math.floor(Math.random() * 30) + 5,
            lastActive: new Date(Date.now() - Math.random() * 86400000).toLocaleTimeString(),
            verified: status !== 'pending'
        };
    });
}

// ===== RENDER AGENTS =====
function renderAgents() {
    const grid = document.getElementById('agentsGrid');
    
    grid.innerHTML = filteredAgents.map(agent => {
        const statusClass = agent.status === 'active' ? 'active' : 
                           agent.status === 'pending' ? 'pending' : 'flagged';
        const statusIcon = agent.status === 'active' ? 'fa-check-circle' :
                          agent.status === 'pending' ? 'fa-clock' : 'fa-exclamation-circle';
        const statusColor = agent.status === 'active' ? 'var(--brand-success)' :
                           agent.status === 'pending' ? 'var(--brand-warning)' : 'var(--brand-danger)';
        
        return `
            <div class="agent-card" onclick="showAgentDetails('${agent.id}')">
                <div class="agent-header">
                    <div class="agent-avatar">
                        <span>${agent.name.split(' ').map(n => n[0]).join('')}</span>
                        <span class="agent-status ${statusClass}"></span>
                    </div>
                    <div class="agent-info">
                        <h4>${agent.name}</h4>
                        <span class="agent-email">${agent.email}</span>
                    </div>
                    <span class="agent-performance">${agent.performance.toFixed(0)}%</span>
                </div>
                <div class="agent-details">
                    <div class="agent-detail">
                        <i class="fas fa-map-pin"></i>
                        <span>${agent.lga}</span>
                    </div>
                    <div class="agent-detail">
                        <i class="fas fa-layer-group"></i>
                        <span>${agent.ward}</span>
                    </div>
                    <div class="agent-detail">
                        <i class="fas fa-flag"></i>
                        <span>${agent.pollingUnit}</span>
                    </div>
                    <div class="agent-detail">
                        <i class="fas fa-tag"></i>
                        <span>${agent.party}</span>
                    </div>
                </div>
                <div class="agent-footer">
                    <span class="agent-status-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${agent.status.toUpperCase()}
                    </span>
                    <span class="agent-tasks"><i class="fas fa-tasks"></i> ${agent.tasksCompleted} tasks</span>
                    <span class="agent-last"><i class="fas fa-clock"></i> ${agent.lastActive}</span>
                </div>
                <div class="agent-progress">
                    <div class="progress-bar">
                        <div class="fill" style="width: ${agent.performance}%; background: ${statusColor}"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== UPDATE STATS =====
function updateStats() {
    const total = agents.length;
    const active = agents.filter(a => a.status === 'active').length;
    const pending = agents.filter(a => a.status === 'pending').length;
    const flagged = agents.filter(a => a.status === 'flagged').length;
    const top = agents.filter(a => a.performance > 90).length;
    const avgPerformance = agents.reduce((sum, a) => sum + a.performance, 0) / total;
    
    document.getElementById('totalAgents').textContent = total;
    document.getElementById('activeAgents').textContent = active;
    document.getElementById('pendingAgents').textContent = pending;
    document.getElementById('flaggedAgents').textContent = flagged;
    document.getElementById('topAgents').textContent = top;
    document.getElementById('agentPerformance').textContent = `${avgPerformance.toFixed(0)}%`;
    document.getElementById('agentStatus').textContent = `${active} Online`;
    document.getElementById('verifiedAgents').textContent = agents.filter(a => a.verified).length;
}

// ===== GENERATE AGENT INSIGHTS =====
function generateAgentInsights() {
    const insights = [
        {
            icon: 'green',
            title: 'Top Performer: Musa Bello',
            desc: 'Completed 28 tasks with 97% accuracy rating.',
            confidence: 'AI Recommendation: Promote'
        },
        {
            icon: 'yellow',
            title: 'Training Needed: 3 Agents',
            desc: 'AI flagged low performance in Alkaleri LGA.',
            confidence: 'Recommended: Refresher training'
        },
        {
            icon: 'blue',
            title: 'Coverage Gap Detected',
            desc: '2 polling units in Toro LGA have no assigned agent.',
            confidence: 'AI Suggestion: Reassign agents'
        },
        {
            icon: 'green',
            title: 'Team Efficiency Up 12%',
            desc: 'AI analysis shows improved agent performance this week.',
            confidence: 'Positive trend'
        }
    ];
    
    const grid = document.getElementById('agentInsights');
    grid.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <div class="insight-icon ${insight.icon}">
                <i class="fas ${insight.icon === 'green' ? 'fa-check-circle' : 
                              insight.icon === 'yellow' ? 'fa-exclamation-triangle' : 
                              insight.icon === 'blue' ? 'fa-info-circle' : 'fa-bell'}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-desc">${insight.desc}</div>
                <div class="insight-confidence">${insight.confidence}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('agentInsightTime').textContent = new Date().toLocaleTimeString();
}

// ===== POPULATE LGA FILTER =====
function populateLGAFilter() {
    const select = document.getElementById('lgaFilterAgents');
    const lgas = getAllLGAs();
    lgas.forEach(lga => {
        const option = document.createElement('option');
        option.value = lga.name;
        option.textContent = lga.name;
        select.appendChild(option);
    });
}

// ===== FILTER AGENTS =====
window.filterAgents = function() {
    const search = document.getElementById('agentSearch').value.toLowerCase();
    const statusFilter = document.getElementById('agentFilter').value;
    const lgaFilter = document.getElementById('lgaFilterAgents').value;
    
    filteredAgents = agents.filter(agent => {
        const matchSearch = agent.name.toLowerCase().includes(search) || 
                           agent.email.toLowerCase().includes(search) ||
                           agent.phone.includes(search);
        const matchStatus = statusFilter === 'all' || agent.status === statusFilter ||
                           (statusFilter === 'top' && agent.performance > 90);
        const matchLGA = lgaFilter === 'all' || agent.lga === lgaFilter;
        
        return matchSearch && matchStatus && matchLGA;
    });
    
    renderAgents();
};

// ===== EXPORT AGENTS =====
window.exportAgents = function() {
    const data = JSON.stringify(agents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Agents exported successfully');
};

// ===== RUN AI ANALYSIS =====
window.runAIAnalysis = function() {
    const btn = document.querySelector('.btn-ai-analyze');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    btn.disabled = true;
    
    setTimeout(() => {
        generateAgentInsights();
        btn.innerHTML = '<i class="fas fa-robot"></i> AI Analyze';
        btn.disabled = false;
        showToast('AI analysis complete');
    }, 2000);
};

// ===== SHOW ADD AGENT =====
window.showAddAgent = function() {
    document.getElementById('addAgentModal').classList.add('active');
    populateAgentLGAs();
};

window.closeAddAgent = function() {
    document.getElementById('addAgentModal').classList.remove('active');
    document.getElementById('addAgentForm').reset();
};

// ===== POPULATE AGENT LGAS =====
function populateAgentLGAs() {
    const select = document.getElementById('agentLGA');
    const lgas = getAllLGAs();
    select.innerHTML = '<option value="">Select LGA...</option>';
    lgas.forEach(lga => {
        const option = document.createElement('option');
        option.value = lga.name;
        option.textContent = lga.name;
        select.appendChild(option);
    });
}

// ===== UPDATE AGENT WARDS =====
window.updateAgentWards = function() {
    const lga = document.getElementById('agentLGA').value;
    const select = document.getElementById('agentWard');
    select.innerHTML = '<option value="">Select Ward...</option>';
    document.getElementById('agentPU').innerHTML = '<option value="">Select Polling Unit...</option>';
    
    if (!lga) return;
    
    const wards = getWardsByLGA(lga);
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        select.appendChild(option);
    });
};

// ===== UPDATE AGENT PUS =====
window.updateAgentPUs = function() {
    const lga = document.getElementById('agentLGA').value;
    const ward = document.getElementById('agentWard').value;
    const select = document.getElementById('agentPU');
    select.innerHTML = '<option value="">Select Polling Unit...</option>';
    
    if (!lga || !ward) return;
    
    const pus = getPollingUnitsByWard(lga, ward);
    pus.forEach(pu => {
        const option = document.createElement('option');
        option.value = pu;
        option.textContent = `PU ${pu}`;
        select.appendChild(option);
    });
};

// ===== SUBMIT AGENT =====
window.submitAgent = function(event) {
    event.preventDefault();
    const btn = document.querySelector('#addAgentModal .btn-primary');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    btn.disabled = true;
    
    setTimeout(() => {
        const newAgent = {
            id: `AGT${String(agents.length + 1).padStart(4, '0')}`,
            name: document.getElementById('agentFullName').value,
            email: document.getElementById('agentEmail').value,
            phone: document.getElementById('agentPhone').value,
            lga: document.getElementById('agentLGA').value,
            ward: document.getElementById('agentWard').value,
            pollingUnit: document.getElementById('agentPU').value,
            party: document.getElementById('agentParty').value,
            role: document.querySelector('input[name="agentRole"]:checked').value,
            status: 'active',
            performance: 85 + Math.random() * 10,
            tasksCompleted: 0,
            lastActive: 'Just now',
            verified: true
        };
        
        agents.push(newAgent);
        filteredAgents = agents;
        renderAgents();
        updateStats();
        closeAddAgent();
        showToast('Agent registered successfully!');
        
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Register Agent';
        btn.disabled = false;
    }, 1500);
};

// ===== SHOW AGENT DETAILS =====
window.showAgentDetails = function(id) {
    const agent = agents.find(a => a.id === id);
    if (!agent) return;
    
    alert(`
        Agent: ${agent.name}
        Email: ${agent.email}
        LGA: ${agent.lga}
        Ward: ${agent.ward}
        PU: ${agent.pollingUnit}
        Party: ${agent.party}
        Role: ${agent.role}
        Performance: ${agent.performance.toFixed(0)}%
        Tasks: ${agent.tasksCompleted}
    `);
};

// ===== TOAST =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ai-toast';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
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
window.filterAgents = filterAgents;
window.showAddAgent = showAddAgent;
window.closeAddAgent = closeAddAgent;
window.updateAgentWards = updateAgentWards;
window.updateAgentPUs = updateAgentPUs;
window.submitAgent = submitAgent;
window.showAgentDetails = showAgentDetails;
window.exportAgents = exportAgents;
window.runAIAnalysis = runAIAnalysis;
