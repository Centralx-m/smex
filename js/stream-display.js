// ============================================
// STREAM DISPLAY - METER/CLOCK STYLE
// ============================================

import { BAUCHI_DATA, getAllLGAs, PARTY_COLORS, PARTIES } from './bauchi-data.js';

// ===== STATE =====
let currentData = null;
let updateInterval = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateStreamClock();
    setInterval(updateStreamClock, 1000);
    
    // Load data
    loadStreamData();
    
    // Start real-time updates
    startStreamUpdates();
});

// ===== CLOCK =====
function updateStreamClock() {
    const now = new Date();
    document.getElementById('streamLocalTime').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('streamUTCTime').textContent = now.toUTCString().split(' ')[4];
}

// ===== LOAD STREAM DATA =====
async function loadStreamData() {
    try {
        const data = await fetchStreamData();
        currentData = data;
        renderStream(data);
    } catch (error) {
        console.error('Error loading stream data:', error);
        currentData = generateMockStreamData();
        renderStream(currentData);
    }
}

// ===== FETCH STREAM DATA =====
async function fetchStreamData() {
    return generateMockStreamData();
}

// ===== GENERATE MOCK STREAM DATA =====
function generateMockStreamData() {
    const lgas = getAllLGAs();
    const statuses = ['completed', 'counting', 'pending', 'incident'];
    const partyKeys = Object.keys(PARTY_COLORS);
    
    const lgaResults = lgas.map((lga, index) => {
        const status = statuses[Math.floor(Math.random() * 4)];
        const votes = Math.floor(Math.random() * 30000) + 5000;
        const turnout = Math.floor(Math.random() * 80) + 15;
        const agents = Math.floor(Math.random() * 25) + 5;
        
        const partyResults = {};
        let remainingVotes = votes;
        partyKeys.forEach((party, i) => {
            if (i === partyKeys.length - 1) {
                partyResults[party] = remainingVotes;
            } else {
                const pVotes = Math.floor(remainingVotes * (0.1 + Math.random() * 0.3));
                partyResults[party] = pVotes;
                remainingVotes -= pVotes;
            }
        });
        
        return {
            ...lga,
            status,
            votes,
            turnout,
            agents,
            partyResults,
            totalPUs: 150,
            reportedPUs: Math.floor(Math.random() * 100) + 50
        };
    });
    
    let totalVotes = 0;
    let completed = 0;
    const partyTotals = {};
    let totalAgents = 0;
    let totalReportedPUs = 0;
    let totalPUs = 0;
    
    lgaResults.forEach(lga => {
        totalVotes += lga.votes;
        if (lga.status === 'completed') completed++;
        totalAgents += lga.agents;
        totalReportedPUs += lga.reportedPUs || 0;
        totalPUs += lga.totalPUs || 150;
        
        Object.entries(lga.partyResults).forEach(([party, votes]) => {
            partyTotals[party] = (partyTotals[party] || 0) + votes;
        });
    });
    
    let leadingParty = 'APC';
    let maxVotes = 0;
    Object.entries(partyTotals).forEach(([party, votes]) => {
        if (votes > maxVotes) {
            maxVotes = votes;
            leadingParty = party;
        }
    });
    
    return {
        lgas: lgaResults,
        totalVotes,
        completed,
        partyTotals,
        leadingParty,
        totalAgents,
        totalReportedPUs,
        totalPUs,
        turnout: Math.round((totalVotes / (lgas.length * 15000)) * 100)
    };
}

// ===== RENDER STREAM =====
function renderStream(data) {
    // Update stats
    document.getElementById('streamTotalVotes').textContent = data.totalVotes.toLocaleString();
    document.getElementById('progressCount').textContent = `${data.completed}/${data.lgas.length}`;
    document.getElementById('streamTurnout').textContent = `${data.turnout}%`;
    document.getElementById('streamLeading').textContent = data.leadingParty;
    document.getElementById('streamPUs').textContent = `${data.totalReportedPUs.toLocaleString()}/${data.totalPUs.toLocaleString()}`;
    document.getElementById('streamAgents').textContent = data.totalAgents;
    document.getElementById('streamConfidence').textContent = `${(92 + Math.random() * 6).toFixed(1)}%`;
    
    document.getElementById('footerVotes').textContent = data.totalVotes.toLocaleString();
    document.getElementById('footerTurnout').textContent = `${data.turnout}%`;
    document.getElementById('footerLeading').textContent = data.leadingParty;
    document.getElementById('footerPUs').textContent = `${data.totalReportedPUs.toLocaleString()}/${data.totalPUs.toLocaleString()}`;
    
    // Render meters
    renderMeters(data.partyTotals);
    
    // Render LGA progress
    renderLGAProgress(data.lgas);
}

// ===== RENDER METERS =====
function renderMeters(partyTotals) {
    const container = document.getElementById('partyMeters');
    const total = Object.values(partyTotals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(partyTotals).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sorted.map(([party, votes]) => {
        const percent = total > 0 ? (votes / total * 100) : 0;
        const color = PARTY_COLORS[party] || '#8884D8';
        const circumference = 2 * Math.PI * 40;
        const offset = circumference - (percent / 100) * circumference;
        
        return `
            <div class="meter-item">
                <div class="party-name" style="color: ${color}">${party}</div>
                <div class="meter-circle">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle class="bg" cx="50" cy="50" r="40" />
                        <circle class="progress" cx="50" cy="50" r="40" 
                            stroke="${color}"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"
                        />
                    </svg>
                    <div class="meter-value">${percent.toFixed(1)}%</div>
                </div>
                <div class="meter-votes">${votes.toLocaleString()} votes</div>
            </div>
        `;
    }).join('');
}

// ===== RENDER LGA PROGRESS =====
function renderLGAProgress(lgas) {
    const container = document.getElementById('lgaProgress');
    
    // Sort by status
    const sorted = [...lgas].sort((a, b) => {
        const order = { completed: 0, counting: 1, incident: 2, pending: 3 };
        return (order[a.status] || 3) - (order[b.status] || 3);
    });
    
    container.innerHTML = sorted.map(lga => {
        const progress = lga.status === 'completed' ? 100 : 
                        lga.status === 'counting' ? Math.floor(Math.random() * 50) + 30 :
                        lga.status === 'incident' ? Math.floor(Math.random() * 20) + 5 : 0;
        
        const color = lga.status === 'completed' ? '#22C55E' :
                     lga.status === 'counting' ? '#EAB308' :
                     lga.status === 'incident' ? '#EF4444' : '#6B7280';
        
        return `
            <div class="progress-item">
                <span class="lga-name">${lga.name}</span>
                <div class="progress-track">
                    <div class="fill" style="width: ${progress}%; background: ${color}"></div>
                </div>
                <span class="progress-label">${progress}%</span>
            </div>
        `;
    }).join('');
}

// ===== START STREAM UPDATES =====
function startStreamUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        if (currentData) {
            // Update confidence
            document.getElementById('streamConfidence').textContent = `${(92 + Math.random() * 6).toFixed(1)}%`;
            
            // Update footer
            document.getElementById('footerUpdate').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        }
    }, 3000);
}
