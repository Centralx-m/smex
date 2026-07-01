// ============================================
// MAIN DISPLAY PAGE - PUBLIC DASHBOARD
// ============================================

import { BAUCHI_DATA, getAllLGAs, PARTY_COLORS, PARTIES } from './bauchi-data.js';

// ===== STATE =====
let map = null;
let markers = [];
let currentData = null;
let miniChart = null;
let updateInterval = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Load data
    loadDisplayData();
    
    // Initialize map
    initMap();
    
    // Start real-time updates
    startRealtimeUpdates();
});

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    
    // Local time
    document.getElementById('localTime').textContent = now.toLocaleTimeString('en-US', { hour12: false });
    document.getElementById('localDate').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
    
    // UTC
    document.getElementById('utcTime').textContent = now.toUTCString().split(' ')[4];
    
    // Update viewer count (simulate)
    const viewers = Math.floor(Math.random() * 500) + 1000;
    document.getElementById('viewerCount').textContent = viewers.toLocaleString();
    document.getElementById('tickerViewers').textContent = viewers.toLocaleString();
}

// ===== LOAD DISPLAY DATA =====
async function loadDisplayData() {
    try {
        const data = await fetchDisplayData();
        currentData = data;
        renderDisplay(data);
    } catch (error) {
        console.error('Error loading display data:', error);
        // Use mock data
        currentData = generateMockData();
        renderDisplay(currentData);
    }
}

// ===== FETCH DISPLAY DATA =====
async function fetchDisplayData() {
    // In production, fetch from Firebase
    return generateMockData();
}

// ===== GENERATE MOCK DATA =====
function generateMockData() {
    const lgas = getAllLGAs();
    const statuses = ['completed', 'counting', 'pending', 'incident'];
    const partyKeys = Object.keys(PARTY_COLORS);
    
    const lgaResults = lgas.map((lga, index) => {
        const status = statuses[Math.floor(Math.random() * 4)];
        const votes = Math.floor(Math.random() * 30000) + 5000;
        const turnout = Math.floor(Math.random() * 80) + 15;
        const agents = Math.floor(Math.random() * 25) + 5;
        const reportedPUs = Math.floor(Math.random() * 100) + 50;
        const totalPUs = 150;
        
        // Generate party results for this LGA
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
            reportedPUs,
            totalPUs,
            partyResults,
            lastUpdate: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
            coordinates: lga.coordinates || [10 + Math.random() * 1.5, 9 + Math.random() * 1.5]
        };
    });
    
    // Calculate totals
    let totalVotes = 0;
    let completed = 0;
    let incidents = 0;
    const partyTotals = {};
    
    lgaResults.forEach(lga => {
        totalVotes += lga.votes;
        if (lga.status === 'completed') completed++;
        if (lga.status === 'incident') incidents++;
        
        Object.entries(lga.partyResults).forEach(([party, votes]) => {
            partyTotals[party] = (partyTotals[party] || 0) + votes;
        });
    });
    
    // Find leading party
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
        incidents,
        partyTotals,
        leadingParty,
        totalAgents: lgaResults.reduce((sum, l) => sum + l.agents, 0),
        turnout: Math.round((totalVotes / (lgas.length * 15000)) * 100)
    };
}

// ===== RENDER DISPLAY =====
function renderDisplay(data) {
    // Update stats
    document.getElementById('totalVotes').textContent = data.totalVotes.toLocaleString();
    document.getElementById('completedLGAs').textContent = `${data.completed}/${data.lgas.length}`;
    document.getElementById('turnout').textContent = `${data.turnout}%`;
    document.getElementById('leadingParty').textContent = data.leadingParty;
    document.getElementById('incidentCount').textContent = data.incidents;
    document.getElementById('activeAgents').textContent = data.totalAgents;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
    
    // Update ticker
    document.getElementById('tickerLGAs').textContent = `${data.completed}/${data.lgas.length}`;
    document.getElementById('tickerTurnout').textContent = `${data.turnout}%`;
    document.getElementById('tickerLeading').textContent = data.leadingParty;
    
    // Render party results
    renderPartyResults(data.partyTotals);
    
    // Render LGA results
    renderLGAResults(data.lgas);
    
    // Render mini chart
    renderMiniChart(data.partyTotals);
    
    // Update map markers
    updateMapMarkers(data.lgas);
}

// ===== RENDER PARTY RESULTS =====
function renderPartyResults(partyTotals) {
    const container = document.getElementById('partyResults');
    const total = Object.values(partyTotals).reduce((a, b) => a + b, 0);
    
    document.getElementById('partyTotal').textContent = `${total.toLocaleString()} votes`;
    
    // Sort parties by votes
    const sorted = Object.entries(partyTotals).sort((a, b) => b[1] - a[1]);
    const maxVotes = sorted.length > 0 ? sorted[0][1] : 1;
    
    container.innerHTML = sorted.map(([party, votes]) => {
        const percent = total > 0 ? (votes / total * 100) : 0;
        const width = maxVotes > 0 ? (votes / maxVotes * 100) : 0;
        const color = PARTY_COLORS[party] || '#8884D8';
        
        return `
            <div class="party-item">
                <div class="party-color" style="background: ${color}"></div>
                <span class="party-name">${party}</span>
                <div class="party-bar">
                    <div class="fill" style="width: ${width}%; background: ${color}"></div>
                </div>
                <span class="party-votes">${votes.toLocaleString()}</span>
                <span class="party-percent">${percent.toFixed(1)}%</span>
            </div>
        `;
    }).join('');
}

// ===== RENDER LGA RESULTS =====
function renderLGAResults(lgas) {
    const container = document.getElementById('lgaResults');
    document.getElementById('lgaCount').textContent = `${lgas.filter(l => l.status === 'completed').length}/${lgas.length}`;
    
    // Sort by status (completed first)
    const sorted = [...lgas].sort((a, b) => {
        const order = { completed: 0, counting: 1, incident: 2, pending: 3 };
        return (order[a.status] || 3) - (order[b.status] || 3);
    });
    
    container.innerHTML = sorted.slice(0, 10).map(lga => `
        <div class="lga-item">
            <span class="lga-name">${lga.name}</span>
            <span class="lga-status ${lga.status}">${lga.status.toUpperCase()}</span>
            <span class="lga-votes">${lga.votes.toLocaleString()}</span>
        </div>
    `).join('');
}

// ===== RENDER MINI CHART =====
function renderMiniChart(partyTotals) {
    const ctx = document.getElementById('miniPieChart');
    if (!ctx) return;
    
    if (miniChart) miniChart.destroy();
    
    const labels = Object.keys(partyTotals);
    const data = Object.values(partyTotals);
    const colors = labels.map(label => PARTY_COLORS[label] || '#8884D8');
    
    miniChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: '#1E293B',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94A3B8',
                        font: { size: 10 },
                        padding: 8
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// ===== INIT MAP =====
function initMap() {
    if (typeof L === 'undefined') return;
    
    const mapContainer = document.getElementById('electionMap');
    if (!mapContainer) return;
    
    map = L.map('electionMap', {
        center: [10.5, 9.8],
        zoom: 8,
        zoomControl: false
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // Initial markers
    if (currentData) {
        updateMapMarkers(currentData.lgas);
    }
}

// ===== UPDATE MAP MARKERS =====
function updateMapMarkers(lgas) {
    if (!map) return;
    
    // Remove existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    const statusColors = {
        completed: '#22C55E',
        counting: '#EAB308',
        pending: '#6B7280',
        incident: '#EF4444'
    };
    
    lgas.forEach(lga => {
        const coords = lga.coordinates || [10 + Math.random() * 1.5, 9 + Math.random() * 1.5];
        const color = statusColors[lga.status] || '#6B7280';
        
        const icon = L.divIcon({
            html: `
                <div style="
                    width: 14px;
                    height: 14px;
                    background: ${color};
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ${lga.status === 'incident' ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
                ">
                    ${lga.status === 'incident' ? '<div style="width:100%;height:100%;background:radial-gradient(circle,rgba(239,68,68,0.4),transparent);border-radius:50%;animation:pulse 1.5s ease-in-out infinite;"></div>' : ''}
                </div>
            `,
            className: 'map-marker',
            iconSize: [14, 14]
        });
        
        const marker = L.marker(coords, { icon })
            .bindPopup(`
                <div style="min-width:200px;">
                    <h4 style="margin:0 0 4px;font-weight:600;">${lga.name}</h4>
                    <div style="font-size:12px;color:#94A3B8;">
                        <div>Status: <strong style="color:${color}">${lga.status.toUpperCase()}</strong></div>
                        <div>Votes: <strong>${lga.votes.toLocaleString()}</strong></div>
                        <div>Turnout: <strong>${lga.turnout}%</strong></div>
                        <div>Agents: <strong>${lga.agents}</strong></div>
                    </div>
                </div>
            `);
        
        marker.addTo(map);
        markers.push(marker);
    });
}

// ===== ZOOM CONTROLS =====
window.zoomIn = function() {
    if (map) map.zoomIn();
};

window.zoomOut = function() {
    if (map) map.zoomOut();
};

window.resetView = function() {
    if (map) map.setView([10.5, 9.8], 8);
};

// ===== START REALTIME UPDATES =====
function startRealtimeUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        // Simulate real-time updates
        if (currentData) {
            // Update viewer count
            const viewers = Math.floor(Math.random() * 500) + 1000;
            document.getElementById('viewerCount').textContent = viewers.toLocaleString();
            document.getElementById('tickerViewers').textContent = viewers.toLocaleString();
            
            // Update last update time
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
            document.getElementById('footerUpdate').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        }
    }, 5000);
}

// ===== EXPOSE GLOBAL =====
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;
