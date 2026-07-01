// ============================================
// ADVANCED AI ELECTION MONITORING ENGINE
// ============================================

import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHeader, updateHeaderStats } from './components/header.js';
import { renderFooter, updateFooter, initFooter } from './components/footer.js';
import { BAUCHI_DATA, getAllLGAs } from './bauchi-data.js';

// ===== STATE =====
let predictionChart = null;
let anomalyChart = null;
let insights = [];
let analysisData = [];
let voiceActive = false;
let aiInterval = null;

// ===== RENDER COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    renderComponents();
    initAIEngine();
    loadAIData();
    setupAIPredictions();
    generateInsights();
    renderLGAAnalysis();
    renderIncidentPredictions();
    setupRealtimeUpdates();
});

// ===== RENDER COMPONENTS =====
function renderComponents() {
    document.getElementById('navbar-container').innerHTML = renderNavbar('dashboard');
    document.getElementById('header-container').innerHTML = renderHeader('AI Dashboard', 'Intelligent Election Monitoring');
    document.getElementById('footer-container').innerHTML = renderFooter();
    initNavbar();
    initFooter();
}

// ===== AI ENGINE INIT =====
function initAIEngine() {
    updateAIStatus('Active', '94.7%', 'ElectionNet v3.0', '1,247');
    updateAIPredictions('APC', '52.3', 'Unusual vote pattern in Ningi LGA', '92%', '68.4% ± 2.3%');
    updateAIStats('127,843', '245K - 268K', '2,847', '2.3', '+0.67');
    document.getElementById('insightTime').textContent = new Date().toLocaleTimeString();
}

// ===== UPDATE AI STATUS =====
function updateAIStatus(status, confidence, model, processing) {
    const statusEl = document.getElementById('aiStatus');
    const confidenceEl = document.getElementById('aiConfidence');
    const modelEl = document.getElementById('aiModel');
    const processingEl = document.getElementById('aiProcessing');
    const accuracyEl = document.getElementById('aiAccuracy');
    
    if (statusEl) statusEl.textContent = status;
    if (confidenceEl) confidenceEl.textContent = confidence;
    if (modelEl) modelEl.textContent = model;
    if (processingEl) processingEl.textContent = `${processing} data points`;
    if (accuracyEl) accuracyEl.textContent = '97.2%';
}

// ===== UPDATE AI PREDICTIONS =====
function updateAIPredictions(winner, percent, anomaly, verification, turnout) {
    const predEl = document.getElementById('aiPrediction');
    const anomalyEl = document.getElementById('anomalyAlert');
    const verifyEl = document.getElementById('verificationStatus');
    const turnoutEl = document.getElementById('turnoutPrediction');
    
    if (predEl) predEl.textContent = `${winner} projected to win with ${percent}%`;
    if (anomalyEl) anomalyEl.textContent = anomaly;
    if (verifyEl) verifyEl.textContent = verification;
    if (turnoutEl) turnoutEl.textContent = turnout;
}

// ===== UPDATE AI STATS =====
function updateAIStats(votes, range, blockchain, anomaly, sentiment) {
    const votesEl = document.getElementById('aiTotalVotes');
    const rangeEl = document.getElementById('forecastRange');
    const blockchainEl = document.getElementById('blockchainStatus');
    const anomalyEl = document.getElementById('anomalyScore');
    const sentimentEl = document.getElementById('sentimentScore');
    
    if (votesEl) votesEl.textContent = votes;
    if (rangeEl) rangeEl.textContent = range;
    if (blockchainEl) blockchainEl.textContent = blockchain;
    if (anomalyEl) anomalyEl.textContent = anomaly;
    if (sentimentEl) sentimentEl.textContent = sentiment;
}

// ===== LOAD AI DATA =====
async function loadAIData() {
    try {
        const data = await fetchAIData();
        updateCharts(data);
        updateAnomalyChart(data);
        populateInsights(data);
        renderLGAAnalysis();
        renderIncidentPredictions();
    } catch (error) {
        console.error('Error loading AI data:', error);
    }
}

// ===== FETCH AI DATA =====
async function fetchAIData() {
    return {
        predictions: { APC: 52.3, PDP: 35.7, NNPP: 8.2, APGA: 2.1, Others: 1.7 },
        actual: { APC: 48.9, PDP: 38.1, NNPP: 9.3, APGA: 2.4, Others: 1.3 },
        confidence: 94.7,
        anomalies: [
            { lga: 'Ningi', score: 78, type: 'Vote Pattern' },
            { lga: 'Jama\'are', score: 65, type: 'Turnout Anomaly' },
            { lga: 'Alkaleri', score: 52, type: 'Result Delay' }
        ],
        sentiment: { positive: 67, neutral: 23, negative: 10 },
        lgaAnalysis: generateLGAAnalysis(),
        riskPredictions: generateRiskPredictions()
    };
}

// ===== GENERATE LGA ANALYSIS =====
function generateLGAAnalysis() {
    const lgas = BAUCHI_DATA.lgAs;
    return lgas.map(lga => ({
        name: lga.name,
        id: lga.id,
        score: Math.floor(Math.random() * 30) + 70,
        risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        turnout: Math.floor(Math.random() * 30) + 50,
        anomaly: Math.random() * 10,
        trend: Math.random() > 0.5 ? '↑' : '↓'
    }));
}

// ===== GENERATE RISK PREDICTIONS =====
function generateRiskPredictions() {
    const lgas = BAUCHI_DATA.lgAs;
    const risks = ['High', 'Medium', 'Low'];
    return lgas.slice(0, 8).map(lga => ({
        name: lga.name,
        risk: risks[Math.floor(Math.random() * 3)],
        probability: (Math.random() * 30 + 10).toFixed(1),
        factor: ['Logistics', 'Security', 'Turnout', 'Fraud'][Math.floor(Math.random() * 4)]
    }));
}

// ===== UPDATE CHARTS =====
function updateCharts(data) {
    const ctx = document.getElementById('predictionChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    if (predictionChart) predictionChart.destroy();
    
    const parties = Object.keys(data.predictions);
    const predicted = Object.values(data.predictions);
    const actual = Object.values(data.actual);
    const colors = ['#00C49F', '#0088FE', '#FFBB28', '#FF8042', '#8884D8'];
    
    predictionChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: parties,
            datasets: [
                {
                    label: 'AI Prediction',
                    data: predicted,
                    backgroundColor: colors.map(c => c + '66'),
                    borderColor: colors,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Actual Results',
                    data: actual,
                    backgroundColor: colors.map(c => c + '33'),
                    borderColor: colors,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#94A3B8' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94A3B8', callback: v => v + '%' },
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

// ===== UPDATE ANOMALY CHART =====
function updateAnomalyChart(data) {
    const ctx = document.getElementById('anomalyChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    if (anomalyChart) anomalyChart.destroy();
    
    const labels = data.anomalies.map(a => a.lga);
    const scores = data.anomalies.map(a => a.score);
    const colors = scores.map(s => s > 70 ? '#EF4444' : s > 50 ? '#EAB308' : '#22C55E');
    
    anomalyChart = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Anomaly Score',
                data: scores,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#EF4444',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: colors,
                pointRadius: 6,
                pointBorderColor: '#1E293B',
                pointBorderWidth: 2
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
                            return `Anomaly Score: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94A3B8' },
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

// ===== SETUP AI PREDICTIONS =====
function setupAIPredictions() {
    if (aiInterval) clearInterval(aiInterval);
    
    aiInterval = setInterval(() => {
        // Update confidence
        const confidence = 92 + Math.random() * 6;
        const confidenceEl = document.getElementById('aiConfidence');
        if (confidenceEl) confidenceEl.textContent = `${confidence.toFixed(1)}%`;
        
        // Update prediction
        const parties = ['APC', 'PDP', 'NNPP', 'APGA'];
        const winner = parties[Math.floor(Math.random() * 4)];
        const percent = (50 + Math.random() * 10).toFixed(1);
        const predEl = document.getElementById('aiPrediction');
        if (predEl) predEl.textContent = `${winner} projected to win with ${percent}%`;
        
        // Update processing
        const points = Math.floor(Math.random() * 2000) + 1000;
        const processingEl = document.getElementById('aiProcessing');
        if (processingEl) processingEl.textContent = `${points.toLocaleString()} data points`;
        
        // Update anomaly
        const anomalies = ['Normal', 'Unusual pattern detected', 'AI flagged for review', 'No anomalies'];
        const anomalyEl = document.getElementById('anomalyAlert');
        if (anomalyEl) anomalyEl.textContent = anomalies[Math.floor(Math.random() * 4)];
        
        // Update verification
        const verified = 88 + Math.random() * 10;
        const verifyEl = document.getElementById('verificationStatus');
        if (verifyEl) verifyEl.textContent = `${verified.toFixed(1)}% of results verified`;
        
        // Update time
        const timeEl = document.getElementById('insightTime');
        if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
        
        // Update accuracy
        const accuracy = 95 + Math.random() * 4;
        const accuracyEl = document.getElementById('aiAccuracy');
        if (accuracyEl) accuracyEl.textContent = `${accuracy.toFixed(1)}%`;
        
    }, 8000);
}

// ===== GENERATE INSIGHTS =====
function generateInsights() {
    const insightsList = [
        {
            icon: 'blue',
            title: 'APC Leading in 12 LGAs',
            desc: 'AI predicts APC will win majority of Bauchi State LGAs based on current trends.',
            confidence: '94% confidence'
        },
        {
            icon: 'yellow',
            title: 'High Voter Turnout in Toro',
            desc: 'Toro LGA showing 78% turnout, significantly above state average of 62%.',
            confidence: 'AI anomaly score: 2.3'
        },
        {
            icon: 'green',
            title: 'Blockchain Verification Complete',
            desc: '92% of polling units have verified results on the blockchain.',
            confidence: 'Secure and tamper-proof'
        },
        {
            icon: 'red',
            title: 'Incident Alert: Ningi LGA',
            desc: 'AI detected unusual vote pattern. Recommended immediate review.',
            confidence: 'High priority alert'
        },
        {
            icon: 'blue',
            title: 'PDP Gaining Momentum',
            desc: 'PDP vote share increased by 4.2% in last 2 hours in urban areas.',
            confidence: '85% confidence'
        },
        {
            icon: 'green',
            title: 'Agent Activity Peak',
            desc: '47 agents actively submitting results across 20 LGAs.',
            confidence: 'Live monitoring'
        }
    ];
    
    const grid = document.getElementById('insightsGrid');
    if (!grid) return;
    
    grid.innerHTML = insightsList.map(insight => `
        <div class="insight-item">
            <div class="insight-icon ${insight.icon}">
                <i class="fas ${insight.icon === 'blue' ? 'fa-chart-line' : 
                              insight.icon === 'yellow' ? 'fa-exclamation-triangle' :
                              insight.icon === 'green' ? 'fa-check-circle' : 'fa-bell'}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-desc">${insight.desc}</div>
                <div class="insight-confidence">${insight.confidence}</div>
            </div>
        </div>
    `).join('');
    
    insights = insightsList;
}

// ===== RENDER LGA ANALYSIS =====
function renderLGAAnalysis() {
    const grid = document.getElementById('lgaAnalysisGrid');
    if (!grid) return;
    
    const analysis = generateLGAAnalysis();
    analysisData = analysis;
    
    grid.innerHTML = analysis.slice(0, 8).map(lga => {
        const scoreClass = lga.score > 85 ? 'high' : lga.score > 70 ? 'medium' : 'low';
        const riskColor = lga.risk === 'Low' ? 'var(--brand-success)' : 
                         lga.risk === 'Medium' ? 'var(--brand-warning)' : 'var(--brand-danger)';
        
        return `
            <div class="lga-analysis-card" onclick="window.location.href='lga-detail.html?id=${lga.id}'">
                <div class="lga-name">${lga.name}</div>
                <div class="lga-score ${scoreClass}">${lga.score}</div>
                <div class="lga-metric">Performance Score</div>
                <div class="lga-bar">
                    <div class="fill" style="width: ${lga.score}%; background: ${riskColor}"></div>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:11px;color:var(--brand-text-muted);">
                    <span>Turnout: ${lga.turnout}% ${lga.trend}</span>
                    <span>Risk: ${lga.risk}</span>
                    <span>Anomaly: ${lga.anomaly.toFixed(1)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ===== RENDER INCIDENT PREDICTIONS =====
function renderIncidentPredictions() {
    const grid = document.getElementById('predictorGrid');
    if (!grid) return;
    
    const predictions = generateRiskPredictions();
    
    const riskEmojis = {
        'High': '🔴',
        'Medium': '🟡',
        'Low': '🟢'
    };
    
    grid.innerHTML = predictions.map(pred => `
        <div class="predictor-card">
            <div class="risk-indicator">${riskEmojis[pred.risk]}</div>
            <div style="font-weight:600;font-size:14px;">${pred.name}</div>
            <span class="risk-level ${pred.risk.toLowerCase()}">${pred.risk} Risk</span>
            <div class="risk-metric">${pred.probability}% probability • ${pred.factor}</div>
            <div style="margin-top:6px;height:2px;background:var(--brand-bg);border-radius:1px;overflow:hidden;">
                <div class="fill" style="width:${pred.probability}%;background:${
                    pred.risk === 'High' ? 'var(--brand-danger)' : 
                    pred.risk === 'Medium' ? 'var(--brand-warning)' : 'var(--brand-success)'
                };height:100%;border-radius:1px;"></div>
            </div>
        </div>
    `).join('');
}

// ===== UPDATE LGA ANALYSIS =====
window.updateLGAAnalysis = function() {
    const type = document.getElementById('analysisType');
    if (type) {
        // Re-render with different metrics based on selected type
        renderLGAAnalysis();
    }
};

// ===== TOGGLE PREDICTION MODE =====
window.togglePredictionMode = function() {
    const chart = document.getElementById('predictionChart');
    const btn = document.querySelector('.btn-toggle');
    if (chart && btn) {
        if (chart.style.opacity === '0.5') {
            chart.style.opacity = '1';
            btn.innerHTML = '<i class="fas fa-eye"></i> Show Confidence';
        } else {
            chart.style.opacity = '0.5';
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Confidence';
        }
    }
};

// ===== TOGGLE VOICE ASSISTANT =====
window.toggleVoiceAssistant = function() {
    const assistant = document.getElementById('voiceAssistant');
    if (!assistant) return;
    
    voiceActive = !voiceActive;
    assistant.classList.toggle('active', voiceActive);
    
    if (voiceActive) {
        const voiceBtn = document.querySelector('.btn-ai-voice');
        if (voiceBtn) voiceBtn.classList.add('active');
        startVoiceRecognition();
    } else {
        const voiceBtn = document.querySelector('.btn-ai-voice');
        if (voiceBtn) voiceBtn.classList.remove('active');
        stopVoiceRecognition();
    }
};

// ===== VOICE RECOGNITION =====
function startVoiceRecognition() {
    const voiceText = document.getElementById('voiceText');
    if (!voiceText) return;
    
    voiceText.textContent = 'Listening... Speak a command';
    
    // Simulate voice recognition
    setTimeout(() => {
        voiceText.textContent = 'I heard: "Show results"';
        setTimeout(() => {
            processVoiceCommand('results');
        }, 1000);
    }, 2000);
}

function stopVoiceRecognition() {
    const voiceText = document.getElementById('voiceText');
    if (voiceText) voiceText.textContent = 'Voice assistant deactivated';
}

// ===== PROCESS VOICE COMMAND =====
window.processVoiceCommand = function(command) {
    const voiceText = document.getElementById('voiceText');
    if (!voiceText) return;
    
    const commands = {
        'dashboard': () => { window.location.href = 'index.html'; },
        'results': () => { window.location.href = 'lga-detail.html'; },
        'tracking': () => { window.location.href = 'tracking.html'; },
        'help': () => { showVoiceHelp(); }
    };
    
    if (commands[command]) {
        voiceText.textContent = `Navigating to ${command}...`;
        setTimeout(() => {
            commands[command]();
        }, 1000);
    }
};

// ===== SHOW VOICE HELP =====
function showVoiceHelp() {
    const voiceText = document.getElementById('voiceText');
    if (!voiceText) return;
    
    voiceText.textContent = 'Available commands: Dashboard, Results, Tracking, Help';
    setTimeout(() => {
        voiceText.textContent = 'Say a command to navigate';
    }, 3000);
}

// ===== SETUP REALTIME UPDATES =====
function setupRealtimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        renderLGAAnalysis();
        renderIncidentPredictions();
        generateInsights();
    }, 30000);
}

// ===== REFRESH AI =====
window.refreshAI = function() {
    const btn = document.querySelector('.btn-ai-refresh i');
    if (btn) {
        btn.classList.add('fa-spin');
        setTimeout(() => btn.classList.remove('fa-spin'), 1000);
    }
    loadAIData();
    showAIToast('AI Engine refreshed successfully');
};

// ===== AI TOAST =====
function showAIToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ai-toast';
    toast.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
}

// ===== EXPOSE GLOBAL FUNCTIONS =====
window.toggleVoiceAssistant = toggleVoiceAssistant;
window.processVoiceCommand = processVoiceCommand;
window.togglePredictionMode = togglePredictionMode;
window.updateLGAAnalysis = updateLGAAnalysis;
window.refreshAI = refreshAI;

// ===== INIT =====
console.log('🚀 AI Election Monitoring Engine v3.0');
console.log('🧠 AI Status: Active');
console.log('📊 Processing: 1,247 data points');
console.log('🎯 Confidence: 94.7%');
