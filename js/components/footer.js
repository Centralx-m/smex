// ============================================
// CENTRALIZED FOOTER COMPONENT
// ============================================

export function renderFooter() {
    const footerHTML = `
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <div class="footer-brand">
                        <i class="fas fa-cloud"></i>
                        <span>WebHotel<span>.Cloud</span></span>
                    </div>
                    <span class="footer-divider">|</span>
                    <span>Bauchi Election Monitoring System</span>
                    <span class="footer-divider">|</span>
                    <span class="status-online">
                        <span class="dot"></span> System Online
                    </span>
                </div>
                <div class="footer-center">
                    <span id="footerLgas">20 LGAs</span>
                    <span class="footer-divider">•</span>
                    <span id="footerPus">2,984 PUs</span>
                    <span class="footer-divider">•</span>
                    <span id="footerAgents">0 Agents</span>
                    <span class="footer-divider">•</span>
                    <span id="footerAIStatus">AI Active</span>
                </div>
                <div class="footer-right">
                    <span id="lastUpdate">Updated: --:--:--</span>
                    <span class="footer-divider">|</span>
                    <a href="#" onclick="window.openPrivacyPolicy()" class="footer-link">Privacy</a>
                    <span class="footer-divider">|</span>
                    <a href="#" onclick="window.openTerms()" class="footer-link">Terms</a>
                    <span class="footer-divider">|</span>
                    <span class="version">v3.0.0</span>
                </div>
            </div>
        </footer>
    `;

    return footerHTML;
}

// ===== UPDATE FOOTER DATA =====
export function updateFooter(data) {
    const lgasEl = document.getElementById('footerLgas');
    const pusEl = document.getElementById('footerPus');
    const agentsEl = document.getElementById('footerAgents');
    const updateEl = document.getElementById('lastUpdate');

    if (lgasEl) lgasEl.textContent = `${data.totalLGAs || 20} LGAs`;
    if (pusEl) pusEl.textContent = `${data.totalPUs || 2984} PUs`;
    if (agentsEl) agentsEl.textContent = `${data.totalAgents || 0} Agents`;
    if (updateEl) {
        const now = new Date();
        updateEl.textContent = `Updated: ${now.toLocaleTimeString('en-US', { hour12: false })}`;
    }
}

// ===== FOOTER FUNCTIONS =====
window.openPrivacyPolicy = function() {
    alert('Privacy Policy: All data is encrypted and secured. Data is used only for election monitoring purposes.');
};

window.openTerms = function() {
    alert('Terms of Service: This system is for official election monitoring purposes only. All agents must follow the code of conduct.');
};

// Auto-update footer time
export function initFooter() {
    updateFooterTime();
    setInterval(updateFooterTime, 30000);
}

function updateFooterTime() {
    const updateEl = document.getElementById('lastUpdate');
    if (updateEl) {
        const now = new Date();
        updateEl.textContent = `Updated: ${now.toLocaleTimeString('en-US', { hour12: false })}`;
    }
}
