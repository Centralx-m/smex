// ============================================
// ADVANCED REAL-TIME TRACKING SYSTEM
// ============================================

import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHeader, updateHeaderStats } from './components/header.js';
import { renderFooter, updateFooter, initFooter } from './components/footer.js';
import { BAUCHI_DATA, getAllLGAs, getWardsByLGA, getAllPollingUnitsByLGA } from './bauchi-data.js';

// ===== STATE =====
let map = null;
let markerCluster = null;
let markers = [];
let heatmapLayer = null;
let liveTracking = true;
let currentView = 'map';
let selectedFilters = {
    lga: 'all',
    ward: 'all',
    pu: 'all',
    status: 'all'
};
let allLocations = [];
let filteredLocations = [];
let updateInterval = null;
let infoPanelOpen = false;

// ===== RENDER COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar-container').innerHTML = renderNavbar('tracking');
    document.getElementById('header-container').innerHTML = renderHeader('Real-Time Tracking', 'Live tracking by LGA, Ward, and Polling Unit');
    document.getElementById('footer-container').innerHTML = renderFooter();
    
    initNavbar();
    initFooter();
    initTracking();
});

// ===== INIT TRACKING =====
function initTracking() {
    // Generate all locations
    generateAllLocations();
    
    // Initialize map
    initMap();
    
    // Populate filters
    populateFilters();
    
    // Render hierarchy
    renderHierarchy();
    
    // Start live updates
    startLiveUpdates();
    
    // Update stats
    updateStats();
}

// ===== GENERATE ALL LOCATIONS =====
function generateAllLocations() {
    allLocations = [];
    const lgas = BAUCHI_DATA.lgAs;
    
    lgas.forEach((lga, lgaIndex) => {
        lga.wards.forEach((ward, wardIndex) => {
            ward.pollingUnits.forEach((pu, puIndex) => {
                // Generate realistic coordinates within Bauchi State
                const lat = 10.0 + (lgaIndex * 0.05) + (wardIndex * 0.01) + (Math.random() - 0.5) * 0.02;
                const lng = 9.8 + (lgaIndex * 0.04) + (wardIndex * 0.008) + (Math.random() - 0.5) * 0.02;
                
                const statuses = ['completed', 'counting', 'pending', 'incident'];
                const status = statuses[Math.floor(Math.random() * 4)];
                const votes = Math.floor(Math.random() * 800) + 50;
                const turnout = Math.floor(Math.random() * 85) + 10;
                const agents = Math.floor(Math.random() * 4) + 1;
                const hasIncident = status === 'incident' || Math.random() > 0.85;
                
                allLocations.push({
                    id: pu,
                    lga: lga.name,
                    lgaId: lga.id,
                    ward: ward.name,
                    pollingUnit: pu,
                    status: status,
                    votes: votes,
                    turnout: turnout,
                    agents: agents,
                    coordinates: [lat, lng],
                    hasIncident: hasIncident,
                    lastUpdate: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
                    partyResults: {
                        APC: Math.floor(Math.random() * 300) + 50,
                        PDP: Math.floor(Math.random() * 250) + 30,
                        NNPP: Math.floor(Math.random() * 150) + 20,
                        Others: Math.floor(Math.random() * 100) + 10
                    }
                });
            });
        });
    });
    
    filteredLocations = [...allLocations];
}

// ===== INIT MAP =====
function initMap() {
    // Create map centered on Bauchi State
    map = L.map('electionMap', {
        center: [10.5, 9.8],
        zoom: 8,
        zoomControl: false,
        fadeAnimation: true,
        zoomAnimation: true
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Create marker cluster group
    markerCluster = L.markerClusterGroup({
        maxClusterRadius: 50,
        iconCreateFunction: createClusterIcon,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false
    });

    // Add markers to cluster
    addMarkersToMap(filteredLocations);
    
    // Add cluster to map
    map.addLayer(markerCluster);

    // Handle map click to close info panel
    map.on('click', () => {
        if (infoPanelOpen) closeInfoPanel();
    });

    // Handle zoom end
    map.on('zoomend', () => {
        updateVisibleMarkers();
    });

    // Add scale control
    L.control.scale({ position: 'bottomright' }).addTo(map);
}

// ===== CREATE CLUSTER ICON =====
function createClusterIcon(cluster) {
    const count = cluster.getChildCount();
    const size = count > 100 ? 50 : count > 50 ? 40 : count > 20 ? 35 : 30;
    
    // Determine cluster status based on children
    const children = cluster.getAllChildMarkers();
    let hasIncident = false;
    let completed = 0;
    let total = children.length;
    
    children.forEach(marker => {
        if (marker.options.status === 'incident') hasIncident = true;
        if (marker.options.status === 'completed') completed++;
    });
    
    let color = '#3B82F6';
    if (hasIncident) color = '#EF4444';
    else if (completed === total) color = '#22C55E';
    else if (completed > total * 0.5) color = '#EAB308';
    
    return L.divIcon({
        html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:${size > 30 ? 14 : 11}px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${count}</div>`,
        className: 'custom-cluster',
        iconSize: [size, size]
    });
}

// ===== ADD MARKERS TO MAP =====
function addMarkersToMap(locations) {
    // Clear existing markers
    markers = [];
    markerCluster.clearLayers();
    
    locations.forEach(location => {
        const marker = createMarker(location);
        markerCluster.addLayer(marker);
        markers.push(marker);
    });
}

// ===== CREATE MARKER =====
function createMarker(location) {
    const statusColors = {
        completed: '#22C55E',
        counting: '#EAB308',
        pending: '#6B7280',
        incident: '#EF4444'
    };
    
    const color = statusColors[location.status] || '#6B7280';
    const size = location.hasIncident ? 16 : 12;
    
    const icon = L.divIcon({
        html: `
            <div style="
                width:${size}px;
                height:${size}px;
                background:${color};
                border-radius:50%;
                border:2px solid white;
                box-shadow:0 2px 8px rgba(0,0,0,0.3);
                ${location.hasIncident ? 'animation: pulse 1.5s ease-in-out infinite;' : ''}
                cursor:pointer;
            ">
                ${location.hasIncident ? '<div style="width:100%;height:100%;background:radial-gradient(circle,rgba(239,68,68,0.4),transparent);border-radius:50%;animation:pulse 1.5s ease-in-out infinite;"></div>' : ''}
            </div>
        `,
        className: 'custom-marker',
        iconSize: [size, size]
    });
    
    const marker = L.marker(location.coordinates, {
        icon: icon,
        status: location.status,
        location: location
    });
    
    marker.on('click', () => {
        showLocationInfo(location);
    });
    
    // Add hover effect
    marker.on('mouseover', () => {
        marker.setOpacity(0.8);
    });
    
    marker.on('mouseout', () => {
        marker.setOpacity(1);
    });
    
    return marker;
}

// ===== SHOW LOCATION INFO =====
function showLocationInfo(location) {
    const panel = document.getElementById('infoPanel');
    const title = document.getElementById('infoTitle');
    const body = document.getElementById('infoBody');
    
    title.textContent = `${location.pollingUnit} - ${location.ward}`;
    
    const totalVotes = Object.values(location.partyResults).reduce((a, b) => a + b, 0);
    const statusColor = {
        completed: 'var(--brand-success)',
        counting: 'var(--brand-warning)',
        pending: 'var(--brand-text-muted)',
        incident: 'var(--brand-danger)'
    }[location.status] || 'var(--brand-text-muted)';
    
    body.innerHTML = `
        <div class="info-row">
            <span class="info-label">LGA</span>
            <span class="info-value"><strong>${location.lga}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Ward</span>
            <span class="info-value">${location.ward}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Polling Unit</span>
            <span class="info-value">${location.pollingUnit}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value status-badge" style="color:${statusColor}">${location.status.toUpperCase()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Votes</span>
            <span class="info-value"><strong>${totalVotes.toLocaleString()}</strong></span>
        </div>
        <div class="info-row">
            <span class="info-label">Turnout</span>
            <span class="info-value">${location.turnout}%</span>
        </div>
        <div class="info-row">
            <span class="info-label">Agents</span>
            <span class="info-value">${location.agents}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Last Update</span>
            <span class="info-value">${location.lastUpdate}</span>
        </div>
        <div class="info-divider"></div>
        <div class="info-party-results">
            ${Object.entries(location.partyResults).map(([party, votes]) => `
                <div class="party-result">
                    <span class="party-name">${party}</span>
                    <div class="party-bar">
                        <div class="fill" style="width:${(votes/totalVotes)*100}%;background:${
                            party === 'APC' ? '#00C49F' :
                            party === 'PDP' ? '#0088FE' :
                            party === 'NNPP' ? '#FFBB28' : '#8884D8'
                        }"></div>
                    </div>
                    <span class="party-votes">${votes}</span>
                </div>
            `).join('')}
        </div>
        ${location.hasIncident ? `
            <div class="info-incident">
                <i class="fas fa-exclamation-triangle"></i>
                <span>⚠ Incident reported at this location</span>
            </div>
        ` : ''}
        <div class="info-actions">
            <button onclick="zoomToLocation(${location.coordinates[0]},${location.coordinates[1]})">
                <i class="fas fa-search-plus"></i> Zoom
            </button>
            <button onclick="navigateToLocation(${location.coordinates[0]},${location.coordinates[1]})">
                <i class="fas fa-directions"></i> Navigate
            </button>
        </div>
    `;
    
    panel.classList.add('active');
    infoPanelOpen = true;
}

// ===== ZOOM TO LOCATION =====
window.zoomToLocation = function(lat, lng) {
    map.setView([lat, lng], 18);
    closeInfoPanel();
};

// ===== NAVIGATE TO LOCATION =====
window.navigateToLocation = function(lat, lng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const url = `https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${lat},${lng}`;
            window.open(url, '_blank');
        }, () => {
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(url, '_blank');
        });
    } else {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }
    closeInfoPanel();
};

// ===== CLOSE INFO PANEL =====
window.closeInfoPanel = function() {
    document.getElementById('infoPanel').classList.remove('active');
    infoPanelOpen = false;
};

// ===== FILTER FUNCTIONS =====
window.filterByLGA = function() {
    selectedFilters.lga = document.getElementById('lgaFilterTrack').value;
    applyFilters();
};

window.filterByWard = function() {
    selectedFilters.ward = document.getElementById('wardFilterTrack').value;
    applyFilters();
};

window.filterByPU = function() {
    selectedFilters.pu = document.getElementById('puFilterTrack').value;
    applyFilters();
};

window.filterByStatus = function() {
    selectedFilters.status = document.getElementById('statusFilterTrack').value;
    applyFilters();
};

function applyFilters() {
    filteredLocations = allLocations.filter(loc => {
        const matchLGA = selectedFilters.lga === 'all' || loc.lga === selectedFilters.lga;
        const matchWard = selectedFilters.ward === 'all' || loc.ward === selectedFilters.ward;
        const matchPU = selectedFilters.pu === 'all' || loc.pollingUnit === selectedFilters.pu;
        const matchStatus = selectedFilters.status === 'all' || loc.status === selectedFilters.status;
        return matchLGA && matchWard && matchPU && matchStatus;
    });
    
    // Update map
    addMarkersToMap(filteredLocations);
    updateStats();
    updateHierarchy();
}

// ===== SEARCH LOCATION =====
window.searchLocation = function() {
    const query = document.getElementById('searchLocation').value.toLowerCase().trim();
    if (!query) {
        filteredLocations = [...allLocations];
    } else {
        filteredLocations = allLocations.filter(loc => 
            loc.lga.toLowerCase().includes(query) ||
            loc.ward.toLowerCase().includes(query) ||
            loc.pollingUnit.toLowerCase().includes(query)
        );
    }
    addMarkersToMap(filteredLocations);
    updateStats();
    updateHierarchy();
};

// ===== POPULATE FILTERS =====
function populateFilters() {
    const lgaSelect = document.getElementById('lgaFilterTrack');
    const wardSelect = document.getElementById('wardFilterTrack');
    const puSelect = document.getElementById('puFilterTrack');
    
    // LGAs
    const lgas = getAllLGAs();
    lgas.forEach(lga => {
        const option = document.createElement('option');
        option.value = lga.name;
        option.textContent = lga.name;
        lgaSelect.appendChild(option);
    });
    
    // Wards
    const allWards = [...new Set(allLocations.map(l => l.ward))];
    allWards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        wardSelect.appendChild(option);
    });
    
    // Polling Units
    const allPUs = [...new Set(allLocations.map(l => l.pollingUnit))];
    allPUs.forEach(pu => {
        const option = document.createElement('option');
        option.value = pu;
        option.textContent = pu;
        puSelect.appendChild(option);
    });
}

// ===== RENDER HIERARCHY =====
function renderHierarchy() {
    const container = document.getElementById('hierarchyBody');
    const lgas = getAllLGAs();
    
    container.innerHTML = lgas.map(lga => {
        const wards = getWardsByLGA(lga.name);
        const locations = allLocations.filter(l => l.lga === lga.name);
        const completed = locations.filter(l => l.status === 'completed').length;
        const total = locations.length;
        
        return `
            <div class="hierarchy-item lga" onclick="zoomToLGA('${lga.name}')">
                <div class="hierarchy-toggle" onclick="event.stopPropagation();toggleHierarchyItem(this)">
                    <i class="fas fa-chevron-right"></i>
                </div>
                <div class="hierarchy-icon">
                    <i class="fas fa-map-pin"></i>
                </div>
                <div class="hierarchy-info">
                    <span class="hierarchy-name">${lga.name}</span>
                    <span class="hierarchy-count">${completed}/${total}</span>
                </div>
                <div class="hierarchy-progress">
                    <div class="progress-bar">
                        <div class="fill" style="width:${(completed/total)*100}%"></div>
                    </div>
                </div>
            </div>
            <div class="hierarchy-children" style="display:none;">
                ${wards.map(ward => {
                    const wardLocations = locations.filter(l => l.ward === ward);
                    const wardCompleted = wardLocations.filter(l => l.status === 'completed').length;
                    const wardTotal = wardLocations.length;
                    
                    return `
                        <div class="hierarchy-item ward" onclick="zoomToWard('${lga.name}','${ward}')">
                            <div class="hierarchy-toggle" onclick="event.stopPropagation();toggleHierarchyItem(this)">
                                <i class="fas fa-chevron-right"></i>
                            </div>
                            <div class="hierarchy-icon">
                                <i class="fas fa-layer-group"></i>
                            </div>
                            <div class="hierarchy-info">
                                <span class="hierarchy-name">${ward}</span>
                                <span class="hierarchy-count">${wardCompleted}/${wardTotal}</span>
                            </div>
                            <div class="hierarchy-progress">
                                <div class="progress-bar">
                                    <div class="fill" style="width:${(wardCompleted/wardTotal)*100}%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="hierarchy-children" style="display:none;">
                            ${wardLocations.map(loc => `
                                <div class="hierarchy-item pu" onclick="zoomToPU('${loc.lga}','${loc.ward}','${loc.pollingUnit}')">
                                    <div class="hierarchy-icon">
                                        <i class="fas fa-flag"></i>
                                    </div>
                                    <div class="hierarchy-info">
                                        <span class="hierarchy-name">${loc.pollingUnit}</span>
                                        <span class="hierarchy-status status-${loc.status}">${loc.status.toUpperCase()}</span>
                                    </div>
                                    <div class="hierarchy-votes">
                                        ${Object.values(loc.partyResults).reduce((a,b) => a+b, 0)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

// ===== TOGGLE HIERARCHY ITEM =====
window.toggleHierarchyItem = function(element) {
    const parent = element.closest('.hierarchy-item');
    const children = parent.nextElementSibling;
    if (children && children.classList.contains('hierarchy-children')) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            element.querySelector('i').style.transform = 'rotate(90deg)';
        } else {
            children.style.display = 'none';
            element.querySelector('i').style.transform = 'rotate(0deg)';
        }
    }
};

// ===== TOGGLE HIERARCHY =====
window.toggleHierarchy = function() {
    const body = document.getElementById('hierarchyBody');
    const btn = document.querySelector('.btn-collapse i');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.className = 'fas fa-chevron-up';
    } else {
        body.style.display = 'none';
        btn.className = 'fas fa-chevron-down';
    }
};

// ===== ZOOM FUNCTIONS =====
window.zoomToLGA = function(lgaName) {
    const locations = allLocations.filter(l => l.lga === lgaName);
    if (locations.length === 0) return;
    
    const center = getCenter(locations);
    map.setView(center, 12);
    closeInfoPanel();
};

window.zoomToWard = function(lgaName, wardName) {
    const locations = allLocations.filter(l => l.lga === lgaName && l.ward === wardName);
    if (locations.length === 0) return;
    
    const center = getCenter(locations);
    map.setView(center, 15);
    closeInfoPanel();
};

window.zoomToPU = function(lgaName, wardName, puName) {
    const location = allLocations.find(l => l.lga === lgaName && l.ward === wardName && l.pollingUnit === puName);
    if (!location) return;
    
    map.setView(location.coordinates, 18);
    showLocationInfo(location);
};

function getCenter(locations) {
    const lats = locations.map(l => l.coordinates[0]);
    const lngs = locations.map(l => l.coordinates[1]);
    return [
        lats.reduce((a,b) => a+b, 0) / lats.length,
        lngs.reduce((a,b) => a+b, 0) / lngs.length
    ];
}

// ===== UPDATE HIERARCHY =====
function updateHierarchy() {
    // Re-render hierarchy with filtered data
    renderHierarchy();
}

// ===== UPDATE STATS =====
function updateStats() {
    const total = filteredLocations.length;
    const completed = filteredLocations.filter(l => l.status === 'completed').length;
    const pending = filteredLocations.filter(l => l.status === 'pending').length;
    const incidents = filteredLocations.filter(l => l.status === 'incident' || l.hasIncident).length;
    const totalVotes = filteredLocations.reduce((sum, l) => sum + Object.values(l.partyResults).reduce((a,b) => a+b, 0), 0);
    
    document.getElementById('miniReported').textContent = completed;
    document.getElementById('miniPending').textContent = pending;
    document.getElementById('miniIncidents').textContent = incidents;
    document.getElementById('miniTotalPUs').textContent = total;
    
    // Update feed count
    document.getElementById('feedCount').textContent = `${filteredLocations.length} locations`;
}

// ===== LIVE UPDATES =====
function startLiveUpdates() {
    if (updateInterval) clearInterval(updateInterval);
    
    updateInterval = setInterval(() => {
        if (!liveTracking) return;
        
        // Simulate live updates
        const randomIndex = Math.floor(Math.random() * filteredLocations.length);
        if (filteredLocations[randomIndex]) {
            const loc = filteredLocations[randomIndex];
            const statuses = ['completed', 'counting', 'pending', 'incident'];
            const newStatus = statuses[Math.floor(Math.random() * 4)];
            loc.status = newStatus;
            loc.lastUpdate = new Date().toLocaleTimeString();
            loc.votes += Math.floor(Math.random() * 10);
            
            // Update marker
            addMarkersToMap(filteredLocations);
            
            // Add to feed
            addToFeed(loc);
            
            // Update stats
            updateStats();
            
            // Update time
            document.getElementById('updateTime').textContent = new Date().toLocaleTimeString();
        }
    }, 3000);
}

// ===== ADD TO FEED =====
function addToFeed(location) {
    const feed = document.getElementById('feedBody');
    const statusIcon = {
        completed: '✅',
        counting: '⏳',
        pending: '⏰',
        incident: '⚠️'
    }[location.status] || '📍';
    
    const entry = document.createElement('div');
    entry.className = 'feed-entry';
    entry.innerHTML = `
        <span class="feed-icon">${statusIcon}</span>
        <div class="feed-content">
            <div class="feed-location">${location.pollingUnit} - ${location.ward}</div>
            <div class="feed-status">${location.status.toUpperCase()} • ${location.votes} votes</div>
        </div>
        <span class="feed-time">${location.lastUpdate}</span>
    `;
    
    feed.insertBefore(entry, feed.firstChild);
    
    // Keep only last 50 entries
    while (feed.children.length > 50) {
        feed.removeChild(feed.lastChild);
    }
}

// ===== TOGGLE LIVE TRACKING =====
window.toggleLiveTracking = function() {
    liveTracking = !liveTracking;
    const btn = document.querySelector('.btn-control:last-child');
    if (liveTracking) {
        btn.innerHTML = '<i class="fas fa-play-circle"></i> Live';
        btn.classList.add('active');
        document.getElementById('liveIndicator').style.display = 'flex';
        startLiveUpdates();
    } else {
        btn.innerHTML = '<i class="fas fa-pause-circle"></i> Paused';
        btn.classList.remove('active');
        document.getElementById('liveIndicator').style.display = 'none';
        if (updateInterval) clearInterval(updateInterval);
    }
};

// ===== SET VIEW MODE =====
window.setViewMode = function(mode) {
    currentView = mode;
    
    document.querySelectorAll('.btn-control').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const btns = document.querySelectorAll('.btn-control');
    const index = ['map', 'satellite', '3d', 'heatmap', 'live'].indexOf(mode);
    if (btns[index]) btns[index].classList.add('active');
    
    // Change map tile layer
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';
    
    if (mode === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = '&copy; Esri';
    } else if (mode === '3d') {
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = '&copy; OpenTopoMap';
    }
    
    // Remove existing tile layers
    map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) {
            map.removeLayer(layer);
        }
    });
    
    L.tileLayer(tileUrl, {
        attribution: attribution,
        maxZoom: 19
    }).addTo(map);
    
    // Handle heatmap
    if (mode === 'heatmap') {
        showHeatmap();
    } else {
        hideHeatmap();
    }
};

// ===== HEATMAP =====
function showHeatmap() {
    if (heatmapLayer) {
        map.addLayer(heatmapLayer);
        return;
    }
    
    // Create heatmap data
    const heatData = filteredLocations.map(loc => [
        loc.coordinates[0],
        loc.coordinates[1],
        Object.values(loc.partyResults).reduce((a,b) => a+b, 0) / 100
    ]);
    
    // Simple heatmap implementation using canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = map.getSize().x;
    canvas.height = map.getSize().y;
    
    // This is a simplified heatmap - in production, use a proper library
    heatmapLayer = L.canvasLayer().delegate('draw', function() {
        const bounds = this._map.getBounds();
        const topLeft = this._map.latLngToLayerPoint(bounds.getNorthWest());
        const bottomRight = this._map.latLngToLayerPoint(bounds.getSouthEast());
        const width = bottomRight.x - topLeft.x;
        const height = bottomRight.y - topLeft.y;
        
        this._canvas.width = width;
        this._canvas.height = height;
        const ctx = this._canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        
        heatData.forEach(([lat, lng, intensity]) => {
            const point = this._map.latLngToLayerPoint([lat, lng]);
            const x = point.x - topLeft.x;
            const y = point.y - topLeft.y;
            
            const radius = 20 + intensity * 10;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(239, 68, 68, ${0.3 + intensity * 0.2})`);
            gradient.addColorStop(0.5, `rgba(234, 179, 8, ${0.2 + intensity * 0.1})`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    });
    
    map.addLayer(heatmapLayer);
}

function hideHeatmap() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
}

// ===== ZOOM CONTROLS =====
window.zoomIn = function() {
    map.zoomIn();
};

window.zoomOut = function() {
    map.zoomOut();
};

window.resetView = function() {
    map.setView([10.5, 9.8], 8);
    closeInfoPanel();
};

// ===== LOCATE USER =====
window.locateUser = function() {
    if (navigator.geolocation) {
        document.querySelector('.btn-locate i').className = 'fas fa-spinner fa-spin';
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.setView([pos.coords.latitude, pos.coords.longitude], 15);
                document.querySelector('.btn-locate i').className = 'fas fa-location-arrow';
                
                // Add user location marker
                const userIcon = L.divIcon({
                    html: '<div style="background:#3B82F6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 20px rgba(59,130,246,0.6);"></div>',
                    className: 'user-location',
                    iconSize: [16, 16]
                });
                
                L.marker([pos.coords.latitude, pos.coords.longitude], {
                    icon: userIcon,
                    zIndexOffset: 1000
                }).addTo(map);
            },
            () => {
                alert('Unable to get your location. Please enable GPS.');
                document.querySelector('.btn-locate i').className = 'fas fa-location-arrow';
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};

// ===== UPDATE VISIBLE MARKERS =====
function updateVisibleMarkers() {
    // Update marker visibility based on zoom level
    const zoom = map.getZoom();
    const markers = document.querySelectorAll('.custom-marker');
    // This is handled automatically by Leaflet
}

// ===== REFRESH TRACKING =====
window.refreshTracking = function() {
    const btn = document.querySelector('.btn-refresh i');
    if (btn) {
        btn.classList.add('fa-spin');
        setTimeout(() => btn.classList.remove('fa-spin'), 1000);
    }
    
    // Reset to all locations
    filteredLocations = [...allLocations];
    addMarkersToMap(filteredLocations);
    updateStats();
    updateHierarchy();
    
    // Show toast
    showToast('Tracking data refreshed');
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

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeInfoPanel();
    if (e.key === 'r' || e.key === 'R') refreshTracking();
    if (e.key === 'l' || e.key === 'L') toggleLiveTracking();
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-') zoomOut();
});

// ===== EXPOSE GLOBAL =====
window.filterByLGA = filterByLGA;
window.filterByWard = filterByWard;
window.filterByPU = filterByPU;
window.filterByStatus = filterByStatus;
window.searchLocation = searchLocation;
window.zoomToLGA = zoomToLGA;
window.zoomToWard = zoomToWard;
window.zoomToPU = zoomToPU;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetView = resetView;
window.locateUser = locateUser;
window.refreshTracking = refreshTracking;
window.setViewMode = setViewMode;
window.toggleLiveTracking = toggleLiveTracking;
window.closeInfoPanel = closeInfoPanel;
window.zoomToLocation = zoomToLocation;
window.navigateToLocation = navigateToLocation;
window.toggleHierarchyItem = toggleHierarchyItem;
window.toggleHierarchy = toggleHierarchy;
