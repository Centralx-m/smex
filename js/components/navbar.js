// ============================================
// CENTRALIZED NAVBAR COMPONENT
// ============================================

export function renderNavbar(currentPage = 'dashboard') {
    const navbarHTML = `
        <nav class="navbar">
            <div class="nav-container">
                <!-- Brand Section -->
                <div class="nav-brand">
                    <div class="brand-logo">
                        <i class="fas fa-cloud"></i>
                        <span class="brand-name">WebHotel<span class="highlight">.Cloud</span></span>
                    </div>
                    <div class="brand-divider"></div>
                    <div class="election-brand">
                        <i class="fas fa-vote-yea"></i>
                        <span>Bauchi Election Monitor</span>
                    </div>
                </div>

                <!-- Navigation Links -->
                <div class="nav-links" id="navLinks">
                    <a href="index.html" class="${currentPage === 'dashboard' ? 'active' : ''}">
                        <i class="fas fa-home"></i> Dashboard
                    </a>
                    <a href="tracking.html" class="${currentPage === 'tracking' ? 'active' : ''}">
                        <i class="fas fa-map-marked-alt"></i> Tracking
                    </a>
                    <a href="lga-detail.html" class="${currentPage === 'lga' ? 'active' : ''}">
                        <i class="fas fa-map-pin"></i> LGAs
                    </a>
                    <a href="register-agent.html" class="${currentPage === 'register' ? 'active' : ''}">
                        <i class="fas fa-user-plus"></i> Register
                    </a>
                    <a href="agents.html" class="${currentPage === 'agents' ? 'active' : ''}">
                        <i class="fas fa-user-check"></i> Agents
                    </a>
                    <a href="stream.html" class="${currentPage === 'stream' ? 'active' : ''}">
                        <i class="fas fa-broadcast"></i> Live Stream
                    </a>
                </div>

                <!-- Right Section -->
                <div class="nav-right">
                    <!-- Theme Toggle -->
                    <label class="theme-toggle">
                        <input type="checkbox" id="themeToggle" onchange="toggleTheme()" />
                        <span class="toggle-slider">
                            <i class="fas fa-moon"></i>
                            <i class="fas fa-sun"></i>
                        </span>
                    </label>

                    <div class="time-display" id="navTime">
                        <span>--:--:--</span>
                    </div>
                    <div class="user-profile" id="userProfile">
                        <div class="avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <span id="userName">Loading...</span>
                        <button onclick="window.logoutUser()" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                    <button class="mobile-menu-btn" onclick="window.toggleMobileMenu()">
                        <i class="fas fa-bars"></i>
                    </button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div class="mobile-menu" id="mobileMenu">
                <a href="index.html" class="${currentPage === 'dashboard' ? 'active' : ''}">
                    <i class="fas fa-home"></i> Dashboard
                </a>
                <a href="tracking.html" class="${currentPage === 'tracking' ? 'active' : ''}">
                    <i class="fas fa-map-marked-alt"></i> Tracking
                </a>
                <a href="lga-detail.html" class="${currentPage === 'lga' ? 'active' : ''}">
                    <i class="fas fa-map-pin"></i> LGAs
                </a>
                <a href="register-agent.html" class="${currentPage === 'register' ? 'active' : ''}">
                    <i class="fas fa-user-plus"></i> Register
                </a>
                <a href="agents.html" class="${currentPage === 'agents' ? 'active' : ''}">
                    <i class="fas fa-user-check"></i> Agents
                </a>
                <a href="stream.html" class="${currentPage === 'stream' ? 'active' : ''}">
                    <i class="fas fa-broadcast"></i> Live Stream
                </a>
                <div class="mobile-user">
                    <div class="avatar"><i class="fas fa-user"></i></div>
                    <span id="mobileUserName">Loading...</span>
                    <button onclick="window.logoutUser()" class="logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </nav>
    `;

    return navbarHTML;
}

// ===== NAVBAR FUNCTIONS =====
export function initNavbar() {
    // Start clock
    updateNavClock();
    setInterval(updateNavClock, 1000);

    // Setup theme
    setupTheme();

    // Setup mobile menu
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        menu.classList.toggle('active');
    };

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('mobileMenu');
        const toggle = document.querySelector('.mobile-menu-btn');
        if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
        }
    });

    // Update user info
    updateUserInfo();
}

function updateNavClock() {
    const now = new Date();
    const timeEl = document.getElementById('navTime');
    if (timeEl) {
        timeEl.innerHTML = `<span>${now.toLocaleTimeString('en-US', { hour12: false })}</span>`;
    }
}

function updateUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userName = document.getElementById('userName');
    const mobileUserName = document.getElementById('mobileUserName');
    
    if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Agent';
        if (userName) userName.textContent = name;
        if (mobileUserName) mobileUserName.textContent = name;
    } else {
        if (userName) userName.textContent = 'Guest';
        if (mobileUserName) mobileUserName.textContent = 'Guest';
    }
}

// ===== THEME FUNCTIONS =====
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.checked = savedTheme === 'dark';
    }
}

window.toggleTheme = function() {
    const toggle = document.getElementById('themeToggle');
    const theme = toggle.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

// ===== LOGOUT =====
window.logoutUser = function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
};
