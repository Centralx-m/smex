// ============================================
// SMART REGISTRATION - COMPLETE
// ============================================

import { renderNavbar, initNavbar } from './components/navbar.js';
import { renderHeader, updateHeaderStats } from './components/header.js';
import { renderFooter, updateFooter, initFooter } from './components/footer.js';
import { BAUCHI_DATA, getAllLGAs, getWardsByLGA, getPollingUnitsByWard } from './bauchi-data.js';

// ===== STATE =====
let currentStep = 1;
let formData = {};

// ===== RENDER COMPONENTS =====
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar-container').innerHTML = renderNavbar('register');
    document.getElementById('header-container').innerHTML = renderHeader('Smart Registration', 'AI-powered agent registration');
    document.getElementById('footer-container').innerHTML = renderFooter();
    
    initNavbar();
    initFooter();
    populateLGAs();
    updateAISuggestion();
});

// ===== POPULATE LGAS =====
function populateLGAs() {
    const select = document.getElementById('lgaSelect');
    const lgas = getAllLGAs();
    lgas.forEach(lga => {
        const option = document.createElement('option');
        option.value = lga.name;
        option.textContent = `${lga.name} (${lga.code})`;
        select.appendChild(option);
    });
}

// ===== UPDATE WARDS =====
window.updateWards = function() {
    const lga = document.getElementById('lgaSelect').value;
    const select = document.getElementById('wardSelect');
    select.innerHTML = '<option value="">Select Ward...</option>';
    document.getElementById('puSelect').innerHTML = '<option value="">Select Polling Unit...</option>';
    
    if (!lga) return;
    
    const wards = getWardsByLGA(lga);
    wards.forEach(ward => {
        const option = document.createElement('option');
        option.value = ward;
        option.textContent = ward;
        select.appendChild(option);
    });
    
    updateAISuggestion();
};

// ===== UPDATE POLLING UNITS =====
window.updatePollingUnits = function() {
    const lga = document.getElementById('lgaSelect').value;
    const ward = document.getElementById('wardSelect').value;
    const select = document.getElementById('puSelect');
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

// ===== UPDATE AI SUGGESTION =====
window.updateAISuggestion = function() {
    const lga = document.getElementById('lgaSelect').value;
    const text = document.getElementById('aiSuggestionText');
    const score = document.getElementById('lgaMatchScore');
    
    if (lga) {
        text.innerHTML = `Based on your selection, we recommend <strong>${lga} LGA</strong>`;
        score.textContent = `${Math.floor(Math.random() * 10 + 90)}%`;
    } else {
        text.innerHTML = 'Select an LGA for AI recommendations';
        score.textContent = '--';
    }
};

// ===== VALIDATION FUNCTIONS =====
window.validateName = function() {
    const input = document.getElementById('fullName');
    const validation = document.getElementById('nameValidation');
    if (input.value.length >= 3) {
        validation.innerHTML = '<i class="fas fa-check-circle"></i> Valid';
        validation.className = 'validation-status valid';
        return true;
    } else {
        validation.innerHTML = '<i class="fas fa-exclamation-circle"></i> Min 3 characters';
        validation.className = 'validation-status invalid';
        return false;
    }
};

window.validatePhone = function() {
    const input = document.getElementById('phone');
    const validation = document.getElementById('phoneValidation');
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (phoneRegex.test(input.value)) {
        validation.innerHTML = '<i class="fas fa-check-circle"></i> Valid Nigerian number';
        validation.className = 'validation-status valid';
        return true;
    } else {
        validation.innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter valid number';
        validation.className = 'validation-status invalid';
        return false;
    }
};

window.validateEmail = function() {
    const input = document.getElementById('email');
    const validation = document.getElementById('emailValidation');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input.value)) {
        validation.innerHTML = '<i class="fas fa-check-circle"></i> Valid email';
        validation.className = 'validation-status valid';
        return true;
    } else {
        validation.innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter valid email';
        validation.className = 'validation-status invalid';
        return false;
    }
};

window.validatePassword = function() {
    const input = document.getElementById('password');
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    
    const strength = calculatePasswordStrength(input.value);
    fill.style.width = `${strength}%`;
    
    if (strength < 30) {
        fill.style.background = 'var(--brand-danger)';
        text.textContent = 'Weak password';
        text.style.color = 'var(--brand-danger)';
        return false;
    } else if (strength < 60) {
        fill.style.background = 'var(--brand-warning)';
        text.textContent = 'Medium password';
        text.style.color = 'var(--brand-warning)';
        return false;
    } else {
        fill.style.background = 'var(--brand-success)';
        text.textContent = 'Strong password';
        text.style.color = 'var(--brand-success)';
        return true;
    }
};

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 15;
    if (password.match(/[A-Z]/)) strength += 15;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
}

window.validateNIN = function() {
    const input = document.getElementById('nin');
    const validation = document.getElementById('ninValidation');
    if (input.value.length === 11) {
        validation.innerHTML = '<i class="fas fa-check-circle"></i> Valid NIN';
        validation.className = 'validation-status valid';
        return true;
    } else {
        validation.innerHTML = '<i class="fas fa-exclamation-circle"></i> Enter 11-digit NIN';
        validation.className = 'validation-status invalid';
        return false;
    }
};

// ===== STEP NAVIGATION =====
window.nextStep = function(step) {
    // Validate current step
    if (currentStep === 1) {
        if (!validateName() || !validatePhone() || !validateEmail() || !validatePassword()) {
            showToast('Please fill all fields correctly', 'error');
            return;
        }
        // Save data
        formData.name = document.getElementById('fullName').value;
        formData.phone = document.getElementById('phone').value;
        formData.email = document.getElementById('email').value;
        formData.password = document.getElementById('password').value;
    }
    
    if (currentStep === 2) {
        const lga = document.getElementById('lgaSelect').value;
        const ward = document.getElementById('wardSelect').value;
        const pu = document.getElementById('puSelect').value;
        if (!lga || !ward || !pu) {
            showToast('Please select LGA, Ward, and Polling Unit', 'error');
            return;
        }
        formData.lga = lga;
        formData.ward = ward;
        formData.pu = pu;
    }
    
    if (currentStep === 3) {
        const party = document.getElementById('partySelect').value;
        const role = document.getElementById('roleSelect').value;
        if (!party || !role) {
            showToast('Please select party and role', 'error');
            return;
        }
        formData.party = party;
        formData.role = role;
        
        // Update summary
        document.getElementById('summaryName').textContent = formData.name;
        document.getElementById('summaryEmail').textContent = formData.email;
        document.getElementById('summaryLGA').textContent = formData.lga;
        document.getElementById('summaryWard').textContent = formData.ward;
        document.getElementById('summaryPU').textContent = formData.pu;
        document.getElementById('summaryParty').textContent = formData.party;
        document.getElementById('summaryRole').textContent = formData.role.replace('_', ' ');
    }
    
    currentStep = step;
    updateSteps();
};

window.prevStep = function(step) {
    currentStep = step;
    updateSteps();
};

function updateSteps() {
    // Update step indicators
    document.querySelectorAll('.step').forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.toggle('active', stepNum === currentStep);
        el.classList.toggle('completed', stepNum < currentStep);
    });
    
    // Update form steps
    document.querySelectorAll('.form-step').forEach(el => {
        const stepNum = parseInt(el.dataset.step);
        el.classList.toggle('active', stepNum === currentStep);
    });
    
    // Update submit button text
    const submitBtn = document.getElementById('submitBtn');
    if (currentStep === 4) {
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Agent';
    } else {
        submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Next';
    }
}

// ===== REGISTER AGENT =====
window.registerAgent = function(event) {
    event.preventDefault();
    
    if (!document.getElementById('terms').checked) {
        showToast('Please accept the terms and conditions', 'error');
        return;
    }
    
    const btn = document.getElementById('submitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    btn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const details = document.getElementById('agentDetails');
        details.innerHTML = `
            <div class="detail-row">
                <span class="label">Name</span>
                <span class="value">${formData.name}</span>
            </div>
            <div class="detail-row">
                <span class="label">Email</span>
                <span class="value">${formData.email}</span>
            </div>
            <div class="detail-row">
                <span class="label">LGA</span>
                <span class="value">${formData.lga}</span>
            </div>
            <div class="detail-row">
                <span class="label">Ward</span>
                <span class="value">${formData.ward}</span>
            </div>
            <div class="detail-row">
                <span class="label">Polling Unit</span>
                <span class="value">${formData.pu}</span>
            </div>
            <div class="detail-row">
                <span class="label">Party</span>
                <span class="value">${formData.party}</span>
            </div>
            <div class="detail-row">
                <span class="label">Role</span>
                <span class="value">${formData.role.replace('_', ' ')}</span>
            </div>
            <div class="detail-row success">
                <span class="label">AI Verification</span>
                <span class="value">✅ Passed</span>
            </div>
        `;
        
        document.getElementById('successModal').classList.add('active');
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Register Agent';
        btn.disabled = false;
        
        showToast('Agent registered successfully!', 'success');
    }, 2000);
};

// ===== CLOSE MODAL =====
window.closeModal = function() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = 'agents.html';
};

// ===== REGISTER ANOTHER =====
window.registerAnother = function() {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('registerForm').reset();
    currentStep = 1;
    updateSteps();
    populateLGAs();
};

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
