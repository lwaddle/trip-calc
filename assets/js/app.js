// ===========================
// Imports
// ===========================
import { initAuth, signIn, signOut, resetPassword, updatePassword, onAuthStateChange, isAuthenticated, getUserEmail } from './auth.js';
import { loadUserDefaults, saveUserDefaults, loadEstimates, saveEstimate, updateEstimate as updateEstimateInDB, deleteEstimate, createEstimateShare, loadSharedEstimate, copySharedEstimate } from './database.js';

// ===========================
// Early Password Recovery Detection
// ===========================
// Detect password recovery BEFORE Supabase processes and clears the hash
// This must run immediately, before DOMContentLoaded and before Supabase's detectSessionInUrl
if (window.location.hash.includes('type=recovery')) {
    sessionStorage.setItem('pendingPasswordRecovery', 'true');
    // Set localStorage flag IMMEDIATELY so all tabs suppress signed-in UI from first auth state change
    localStorage.setItem('passwordRecoveryInProgress', 'true');
    // Try to get focus immediately (may not work due to browser restrictions, but worth trying)
    window.focus();
    // Try multiple times with delays to fight for focus
    setTimeout(() => window.focus(), 50);
    setTimeout(() => window.focus(), 200);
    setTimeout(() => window.focus(), 500);
}

// ===========================
// App State
// ===========================
const state = {
    legs: [],
    crew: [],
    nextLegId: 1,
    nextCrewId: 1,
    currentEstimateId: null,
    currentEstimateName: null
};

// PDF Preview State
let currentPdfDoc = null;
let currentPdfBlob = null;
let currentPdfFilename = null;

// Password Recovery State (using localStorage to sync across tabs)
// Check: localStorage.getItem('passwordRecoveryInProgress') === 'true'
// Set: localStorage.setItem('passwordRecoveryInProgress', 'true')
// Clear: localStorage.removeItem('passwordRecoveryInProgress')

// ===========================
// Helper Functions
// ===========================
function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ===========================
// Auth UI Management
// ===========================
function updateUIForAuthState(user) {
    // During password recovery, show signed-out UI even though user is authenticated
    // This prevents confusing "signed in" state before password is actually reset
    // Using localStorage so this state is shared across all tabs
    if (localStorage.getItem('passwordRecoveryInProgress') === 'true') {
        user = null; // Force signed-out UI during recovery
    }

    const isAuth = user !== null;

    // Mobile menu items
    const menuUser = document.getElementById('menuUser');
    const menuSignIn = document.getElementById('menuSignIn');
    const menuEstimates = document.getElementById('menuEstimates');
    const menuSignOut = document.getElementById('menuSignOut');

    // Footer buttons
    const saveEstimateButton = document.getElementById('saveEstimateButton');
    const loadEstimateButton = document.getElementById('loadEstimateButton');
    const authTip = document.getElementById('authTip');

    if (isAuth) {
        // Show authenticated UI (mobile)
        menuUser.textContent = getUserEmail();
        menuUser.style.display = 'block';
        menuSignIn.style.display = 'none';
        menuEstimates.style.display = 'block';
        menuSignOut.style.display = 'block';

        // Show save/load buttons
        if (saveEstimateButton) saveEstimateButton.style.display = 'inline-block';
        if (loadEstimateButton) loadEstimateButton.style.display = 'inline-block';

        // Hide auth tip for authenticated users
        if (authTip) authTip.style.display = 'none';
    } else {
        // Show anonymous UI (mobile)
        menuUser.style.display = 'none';
        menuSignIn.style.display = 'block';
        menuEstimates.style.display = 'none';
        menuSignOut.style.display = 'none';

        // Hide save/load buttons for anonymous users
        if (saveEstimateButton) saveEstimateButton.style.display = 'none';
        if (loadEstimateButton) loadEstimateButton.style.display = 'none';

        // Show auth tip for anonymous users
        if (authTip) authTip.style.display = 'flex';
    }

    // Update desktop nav as well
    updateDesktopNavForAuthState(user);
}

// ===========================
// Desktop Nav UI Management
// ===========================
function updateDesktopNavForAuthState(user) {
    const isAuth = user !== null;

    // Desktop nav elements
    const desktopDefaults = document.getElementById('desktopDefaults');
    const desktopEstimates = document.getElementById('desktopEstimates');
    const desktopSignIn = document.getElementById('desktopSignIn');
    const desktopUserDropdown = document.getElementById('desktopUserDropdown');
    const desktopUserEmail = document.getElementById('desktopUserEmail');

    if (isAuth) {
        // Show authenticated desktop UI
        if (desktopEstimates) desktopEstimates.style.display = 'block';
        if (desktopSignIn) desktopSignIn.style.display = 'none';
        if (desktopUserDropdown) desktopUserDropdown.style.display = 'block';
        if (desktopUserEmail) desktopUserEmail.textContent = getUserEmail();
    } else {
        // Show anonymous desktop UI
        if (desktopEstimates) desktopEstimates.style.display = 'none';
        if (desktopSignIn) desktopSignIn.style.display = 'block';
        if (desktopUserDropdown) desktopUserDropdown.style.display = 'none';
    }
}

// ===========================
// Initialization
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Initialize authentication
    await initAuth();

    // Check if password recovery was detected before Supabase cleared the hash
    if (sessionStorage.getItem('pendingPasswordRecovery') === 'true') {
        sessionStorage.removeItem('pendingPasswordRecovery');
        localStorage.setItem('passwordRecoveryInProgress', 'true');
        // Open the password reset modal
        openModal('updatePasswordModal');

        // Aggressive focus strategy - try everything to bring this tab forward
        window.focus(); // Try immediately
        setTimeout(() => {
            window.focus();
            document.getElementById('newPassword')?.focus();
        }, 50);
        setTimeout(() => {
            window.focus();
            document.getElementById('newPassword')?.focus();
        }, 150);
        setTimeout(() => {
            window.focus();
            document.getElementById('newPassword')?.focus();
        }, 300);
        setTimeout(() => {
            document.getElementById('newPassword')?.focus();
            window.focus(); // Try window focus AFTER input focus
        }, 500);
    }

    // Set up auth state listener
    onAuthStateChange((user, event) => {
        updateUIForAuthState(user);

        // Handle password recovery event (backup in case event does fire)
        if (event === 'PASSWORD_RECOVERY') {
            // PASSWORD_RECOVERY event should only fire in the tab that has the recovery URL
            // However, as a safety measure, only open the modal if this tab detected the recovery hash
            // This prevents the modal from opening in other tabs if Supabase syncs the event
            if (sessionStorage.getItem('pendingPasswordRecovery') === 'true') {
                sessionStorage.removeItem('pendingPasswordRecovery');
                localStorage.setItem('passwordRecoveryInProgress', 'true');
                // Open the password reset modal
                openModal('updatePasswordModal');

                // Aggressive focus strategy - try everything to bring this tab forward
                window.focus();
                setTimeout(() => {
                    window.focus();
                    document.getElementById('newPassword')?.focus();
                }, 50);
                setTimeout(() => {
                    window.focus();
                    document.getElementById('newPassword')?.focus();
                }, 150);
                setTimeout(() => {
                    document.getElementById('newPassword')?.focus();
                    window.focus();
                }, 300);
            } else {
                // This tab received PASSWORD_RECOVERY but wasn't the tab with the hash
                // Just set the flag to suppress signed-in UI, but don't open the modal
                localStorage.setItem('passwordRecoveryInProgress', 'true');
            }
        }
    });

    // Load defaults (will use Supabase if authenticated, localStorage otherwise)
    await loadDefaultsFromSource();

    addInitialLeg();
    addInitialCrew();
    addInitialCrew();
    attachEventListeners();
    updateEstimate();

    // Check for shared estimate in URL
    await checkForSharedEstimate();
}

// ===========================
// Defaults Management
// ===========================
async function loadDefaultsFromSource() {
    let defaults = getDefaults();

    // Try to load from Supabase if authenticated
    if (isAuthenticated()) {
        const { data, error } = await loadUserDefaults();
        if (!error && data) {
            defaults = {
                fuelPrice: data.fuel_price,
                fuelDensity: data.fuel_density,
                pilotRate: data.pilot_rate,
                attendantRate: data.attendant_rate,
                hotelRate: data.hotel_rate,
                mealsRate: data.meals_rate,
                maintenanceRate: data.maintenance_rate,
                apuBurn: data.apu_burn
            };
        }
    } else {
        // Load from localStorage for anonymous users
        const stored = localStorage.getItem('tripCalcDefaults');
        if (stored) {
            defaults = JSON.parse(stored);
        }
    }

    applyDefaults(defaults);
}

function applyDefaults(defaults) {
    document.getElementById('fuelPrice').value = defaults.fuelPrice;
    document.getElementById('fuelDensity').value = defaults.fuelDensity;
    document.getElementById('hotelRate').value = defaults.hotelRate;
    document.getElementById('mealsRate').value = defaults.mealsRate;
    document.getElementById('maintenancePrograms').value = defaults.maintenanceRate;

    // Set defaults in modal
    document.getElementById('defaultFuelPrice').value = defaults.fuelPrice;
    document.getElementById('defaultFuelDensity').value = defaults.fuelDensity;
    document.getElementById('defaultPilotRate').value = defaults.pilotRate;
    document.getElementById('defaultAttendantRate').value = defaults.attendantRate;
    document.getElementById('defaultHotelRate').value = defaults.hotelRate;
    document.getElementById('defaultMealsRate').value = defaults.mealsRate;
    document.getElementById('defaultMaintenanceRate').value = defaults.maintenanceRate;
    document.getElementById('defaultAPUBurn').value = defaults.apuBurn;
}

function getDefaults() {
    return {
        fuelPrice: 5.93,
        fuelDensity: 6.7,
        pilotRate: 1500,
        attendantRate: 800,
        hotelRate: 200,
        mealsRate: 100,
        maintenanceRate: 1048.42,
        apuBurn: 100
    };
}

async function saveDefaultsAction() {
    const defaults = {
        fuelPrice: parseFloat(document.getElementById('defaultFuelPrice').value) || 5.93,
        fuelDensity: parseFloat(document.getElementById('defaultFuelDensity').value) || 6.7,
        pilotRate: parseFloat(document.getElementById('defaultPilotRate').value) || 1500,
        attendantRate: parseFloat(document.getElementById('defaultAttendantRate').value) || 800,
        hotelRate: parseFloat(document.getElementById('defaultHotelRate').value) || 200,
        mealsRate: parseFloat(document.getElementById('defaultMealsRate').value) || 100,
        maintenanceRate: parseFloat(document.getElementById('defaultMaintenanceRate').value) || 1048.42,
        apuBurn: parseFloat(document.getElementById('defaultAPUBurn').value) || 100
    };

    // Save to Supabase if authenticated, otherwise localStorage
    if (isAuthenticated()) {
        const { error } = await saveUserDefaults(defaults);
        if (error) {
            showToast('Failed to save defaults: ' + error.message, 'error');
            return;
        }
        showToast('Defaults saved successfully', 'success');
    } else {
        localStorage.setItem('tripCalcDefaults', JSON.stringify(defaults));
        showToast('Defaults saved locally', 'success');
    }

    // Update main form with new defaults
    document.getElementById('fuelPrice').value = defaults.fuelPrice;
    document.getElementById('fuelDensity').value = defaults.fuelDensity;
    document.getElementById('hotelRate').value = defaults.hotelRate;
    document.getElementById('mealsRate').value = defaults.mealsRate;
    document.getElementById('maintenancePrograms').value = defaults.maintenanceRate;

    updateEstimate();
    closeModal('defaultsModal');
}

// ===========================
// Authentication Handlers
// ===========================
async function handleSignIn(e) {
    e.preventDefault();

    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;
    const errorDiv = document.getElementById('signInError');

    // Hide previous error
    errorDiv.style.display = 'none';

    // Validate inputs
    if (!email || !password) {
        errorDiv.textContent = 'Please enter both email and password';
        errorDiv.style.display = 'block';
        return;
    }

    // Attempt sign in
    const { user, error } = await signIn(email, password);

    if (error) {
        errorDiv.textContent = error.message || 'Failed to sign in';
        errorDiv.style.display = 'block';
        return;
    }

    // Success
    closeModal('signInModal');
    document.getElementById('signInForm').reset();
    showToast('Signed in successfully', 'success');

    // Reload defaults from Supabase
    await loadDefaultsFromSource();
}

async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
        showToast('Failed to sign out: ' + error.message, 'error');
        return;
    }

    showToast('Signed out successfully', 'success');

    // Reload defaults from localStorage
    await loadDefaultsFromSource();
}

async function handlePasswordReset(e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();
    const errorDiv = document.getElementById('resetError');
    const successDiv = document.getElementById('resetSuccess');

    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validate email
    if (!email) {
        errorDiv.textContent = 'Please enter your email address';
        errorDiv.style.display = 'block';
        return;
    }

    // Send reset email
    const { error } = await resetPassword(email);

    if (error) {
        errorDiv.textContent = error.message || 'Failed to send reset email';
        errorDiv.style.display = 'block';
        return;
    }

    // Success
    successDiv.textContent = 'Password reset email sent! Please check your inbox.';
    successDiv.style.display = 'block';
    document.getElementById('passwordResetForm').reset();

    // Close modal after 2 seconds
    setTimeout(() => {
        closeModal('passwordResetModal');
        successDiv.style.display = 'none';
    }, 2000);
}

async function handlePasswordUpdate(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('updatePasswordError');
    const successDiv = document.getElementById('updatePasswordSuccess');

    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters';
        errorDiv.style.display = 'block';
        return;
    }

    // Update password
    const { error } = await updatePassword(newPassword);

    if (error) {
        errorDiv.textContent = error.message || 'Failed to update password';
        errorDiv.style.display = 'block';
        return;
    }

    // Success - sign out and require re-authentication for security
    successDiv.textContent = 'Password updated successfully! Please sign in with your new password.';
    successDiv.style.display = 'block';
    document.getElementById('updatePasswordForm').reset();

    // Sign out after successful password update and open sign-in modal
    setTimeout(async () => {
        closeModal('updatePasswordModal');
        successDiv.style.display = 'none';
        localStorage.removeItem('passwordRecoveryInProgress');

        // Sign out to clear the recovery session
        await signOut();

        // Open sign-in modal for user to authenticate with new password
        openModal('signInModal');
    }, 2000);
}

// ===========================
// Event Listeners
// ===========================
function attachEventListeners() {
    // Mobile menu
    document.getElementById('menuButton').addEventListener('click', toggleMenu);
    document.getElementById('menuSignIn').addEventListener('click', () => openModal('signInModal'));
    document.getElementById('menuEstimates').addEventListener('click', () => openModal('loadEstimateModal'));
    document.getElementById('menuDefaults').addEventListener('click', () => openModal('defaultsModal'));
    document.getElementById('menuSignOut').addEventListener('click', handleSignOut);

    // Auth tip sign-in link
    const authTipSignIn = document.getElementById('authTipSignIn');
    if (authTipSignIn) {
        authTipSignIn.addEventListener('click', () => openModal('signInModal'));
    }

    // Desktop nav
    const desktopDefaults = document.getElementById('desktopDefaults');
    const desktopEstimates = document.getElementById('desktopEstimates');
    const desktopSignIn = document.getElementById('desktopSignIn');
    const desktopUserButton = document.getElementById('desktopUserButton');
    const desktopSignOut = document.getElementById('desktopSignOut');

    if (desktopDefaults) {
        desktopDefaults.addEventListener('click', () => openModal('defaultsModal'));
    }
    if (desktopEstimates) {
        desktopEstimates.addEventListener('click', () => openModal('loadEstimateModal'));
    }
    if (desktopSignIn) {
        desktopSignIn.addEventListener('click', () => openModal('signInModal'));
    }
    if (desktopUserButton) {
        desktopUserButton.addEventListener('click', toggleDesktopUserDropdown);
    }
    if (desktopSignOut) {
        desktopSignOut.addEventListener('click', () => {
            closeDesktopUserDropdown();
            handleSignOut();
        });
    }

    // Flight Legs
    document.getElementById('addLegButton').addEventListener('click', addLeg);

    // Crew
    document.getElementById('addCrewButton').addEventListener('click', addCrew);

    // All form inputs
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', updateEstimate);
    });

    // APU checkbox change event
    document.getElementById('includeAPU').addEventListener('change', updateEstimate);

    // Prevent negative values and invalid characters in number inputs
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function(e) {
            // Remove any non-numeric characters except decimal point
            this.value = this.value.replace(/[^0-9.]/g, '');
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            // Cap minutes field at 59
            if (this.closest('.time-input-wrapper--minutes') && parseFloat(this.value) > 59) {
                this.value = '59';
            }
        });
        // Prevent paste of invalid content
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            const cleanedText = pastedText.replace(/[^0-9.]/g, '');
            document.execCommand('insertText', false, cleanedText);
        });
        // Also cap on blur to catch any edge cases
        input.addEventListener('blur', function(e) {
            if (this.closest('.time-input-wrapper--minutes') && parseFloat(this.value) > 59) {
                this.value = '59';
            }
        });
    });

    // Auto-select input contents on click for static fields
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
        input.addEventListener('click', function() {
            this.select();
        });
    });

    // Auto-select input contents on click for dynamic fields (event delegation)
    document.getElementById('flightLegsContainer').addEventListener('click', function(e) {
        if (e.target.matches('input[type="text"], input[type="number"]')) {
            e.target.select();
        }
    });

    document.getElementById('crewContainer').addEventListener('click', function(e) {
        if (e.target.matches('input[type="number"]')) {
            e.target.select();
        }
    });

    // Footer buttons
    document.getElementById('shareButton').addEventListener('click', openEnhancedShareModal);
    document.getElementById('saveEstimateButton').addEventListener('click', saveEstimateAction);
    document.getElementById('loadEstimateButton').addEventListener('click', () => openModal('loadEstimateModal'));
    document.getElementById('resetButton').addEventListener('click', resetForm);

    // Defaults modal
    document.getElementById('closeDefaultsModal').addEventListener('click', () => closeModal('defaultsModal'));
    document.getElementById('cancelDefaultsButton').addEventListener('click', () => closeModal('defaultsModal'));
    document.getElementById('saveDefaultsButton').addEventListener('click', saveDefaultsAction);

    // Load estimate modal
    document.getElementById('closeLoadEstimateModal').addEventListener('click', () => closeModal('loadEstimateModal'));
    document.getElementById('cancelLoadButton').addEventListener('click', () => closeModal('loadEstimateModal'));

    // Sign in modal
    document.getElementById('closeSignInModal').addEventListener('click', () => closeModal('signInModal'));
    document.getElementById('cancelSignInButton').addEventListener('click', () => closeModal('signInModal'));
    document.getElementById('signInForm').addEventListener('submit', handleSignIn);
    document.getElementById('forgotPasswordLink').addEventListener('click', () => {
        closeModal('signInModal');
        openModal('passwordResetModal');
    });

    // Password reset modal
    document.getElementById('closePasswordResetModal').addEventListener('click', () => closeModal('passwordResetModal'));
    document.getElementById('cancelPasswordResetButton').addEventListener('click', () => closeModal('passwordResetModal'));
    document.getElementById('passwordResetForm').addEventListener('submit', handlePasswordReset);

    // Update password modal
    document.getElementById('closeUpdatePasswordModal').addEventListener('click', () => {
        closeModal('updatePasswordModal');
        localStorage.removeItem('passwordRecoveryInProgress');
    });
    document.getElementById('cancelUpdatePasswordButton').addEventListener('click', () => {
        closeModal('updatePasswordModal');
        localStorage.removeItem('passwordRecoveryInProgress');
    });
    document.getElementById('updatePasswordForm').addEventListener('submit', handlePasswordUpdate);

    // Save estimate modal
    document.getElementById('closeSaveEstimateModal').addEventListener('click', () => closeModal('saveEstimateModal'));
    document.getElementById('cancelSaveEstimateButton').addEventListener('click', () => closeModal('saveEstimateModal'));
    document.getElementById('confirmUpdateEstimateButton').addEventListener('click', confirmUpdateEstimate);
    document.getElementById('saveEstimateForm').addEventListener('submit', confirmSaveEstimate);

    // Share estimate modal
    document.getElementById('closeShareEstimateModal').addEventListener('click', () => closeModal('shareEstimateModal'));
    document.getElementById('closeShareModalButton').addEventListener('click', () => closeModal('shareEstimateModal'));
    document.getElementById('copyShareLinkButton').addEventListener('click', copyShareLink);

    // Reset confirmation modal
    document.getElementById('closeResetConfirmModal').addEventListener('click', () => closeModal('resetConfirmModal'));
    document.getElementById('cancelResetButton').addEventListener('click', () => closeModal('resetConfirmModal'));
    document.getElementById('confirmResetButton').addEventListener('click', confirmReset);

    // PDF preview modal
    document.getElementById('closePdfPreviewModal').addEventListener('click', closePdfPreview);
    document.getElementById('closePdfPreviewButton').addEventListener('click', closePdfPreview);
    document.getElementById('downloadPdfButton').addEventListener('click', downloadCurrentPDF);

    // Enhanced share modal
    document.getElementById('closeEnhancedShareModal').addEventListener('click', () => closeModal('enhancedShareModal'));
    document.getElementById('closeEnhancedShareButton').addEventListener('click', () => closeModal('enhancedShareModal'));
    document.getElementById('shareViaEmailBtn').addEventListener('click', shareViaEmail);
    document.getElementById('shareViaCopyBtn').addEventListener('click', copyToClipboard);
    document.getElementById('shareViaLinkBtn').addEventListener('click', copyShareableLink);
    document.getElementById('shareViaQRBtn').addEventListener('click', generateShareQR);
    document.getElementById('shareViaPDFBtn').addEventListener('click', exportToPDFFromShare);
    document.getElementById('shareViaNativeBtn').addEventListener('click', shareViaNative);
    document.getElementById('hideQRBtn').addEventListener('click', hideQRCode);

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                // Special handling for PDF preview modal to cleanup resources
                if (modal.id === 'pdfPreviewModal') {
                    closePdfPreview();
                } else {
                    modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                }
            }
        });
    });

    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        // Close mobile menu
        const menu = document.getElementById('dropdownMenu');
        const button = document.getElementById('menuButton');
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.classList.remove('active');
            button.classList.remove('active');
        }

        // Close desktop user dropdown
        const userDropdown = document.getElementById('desktopUserDropdown');
        const userMenu = document.getElementById('desktopUserMenu');
        if (userDropdown && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
            if (userMenu) userMenu.classList.remove('active');
        }
    });
}

// ===========================
// Toast Notifications
// ===========================
function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ===========================
// Menu Functions
// ===========================
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    const button = document.getElementById('menuButton');
    menu.classList.toggle('active');
    button.classList.toggle('active');
}

function toggleDesktopUserDropdown() {
    const dropdown = document.getElementById('desktopUserDropdown');
    const menu = document.getElementById('desktopUserMenu');
    dropdown.classList.toggle('active');
    menu.classList.toggle('active');
}

function closeDesktopUserDropdown() {
    const dropdown = document.getElementById('desktopUserDropdown');
    const menu = document.getElementById('desktopUserMenu');
    dropdown.classList.remove('active');
    menu.classList.remove('active');
}

function openModal(modalId) {
    if (modalId === 'loadEstimateModal') {
        populateLoadEstimateModal();
    }
    if (modalId === 'updatePasswordModal') {
        // Populate email field for password managers to associate username with password
        const emailField = document.getElementById('resetUserEmail');
        if (emailField && isAuthenticated()) {
            emailField.value = getUserEmail();
        }
    }
    document.getElementById(modalId).classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.classList.remove('modal-open');
}

// ===========================
// Flight Legs
// ===========================
function addInitialLeg() {
    addLeg();
}

function addLeg() {
    const id = state.nextLegId++;
    const leg = {
        id,
        from: '',
        to: '',
        hours: 0,
        minutes: 0,
        fuelBurn: 0
    };
    state.legs.push(leg);
    renderLeg(leg);
    updateEstimate();

    // Auto-focus the "From" field in the newly created leg
    // Skip auto-focus during password recovery to prevent stealing focus from modal
    if (localStorage.getItem('passwordRecoveryInProgress') !== 'true') {
        const legRow = document.querySelector(`[data-leg-id="${leg.id}"]`);
        const fromInput = legRow?.querySelector('.leg-fields input[type="text"]');
        fromInput?.focus();
    }
}

function renderLeg(leg) {
    const container = document.getElementById('flightLegsContainer');
    const legIndex = state.legs.findIndex(l => l.id === leg.id);

    const legRow = document.createElement('div');
    legRow.className = 'leg-row';
    legRow.dataset.legId = leg.id;

    legRow.innerHTML = `
        <div class="leg-header">
            <span class="leg-label">Leg ${legIndex + 1}</span>
            <button class="btn-danger" onclick="removeLeg(${leg.id})">Delete Leg</button>
        </div>
        <div class="leg-fields">
            <div class="form-field">
                <label>From</label>
                <input type="text" value="${leg.from}" oninput="updateLegField(${leg.id}, 'from', this.value)">
            </div>
            <div class="form-field">
                <label>To</label>
                <input type="text" value="${leg.to}" oninput="updateLegField(${leg.id}, 'to', this.value)">
            </div>
            <div class="form-field">
                <label>Flight Time</label>
                <div class="time-input">
                    <div class="time-input-wrapper">
                        <input type="number" placeholder="HH" min="0" value="${leg.hours}" oninput="updateLegField(${leg.id}, 'hours', this.value)" inputmode="numeric">
                    </div>
                    <span class="time-separator">:</span>
                    <div class="time-input-wrapper time-input-wrapper--minutes">
                        <input type="number" placeholder="MM" min="0" max="59" value="${leg.minutes}" oninput="updateLegField(${leg.id}, 'minutes', this.value)" inputmode="numeric">
                    </div>
                </div>
            </div>
            <div class="form-field">
                <label>Fuel Burn (lbs)</label>
                <input type="number" min="0" value="${leg.fuelBurn}" oninput="updateLegField(${leg.id}, 'fuelBurn', this.value)" inputmode="numeric">
            </div>
        </div>
    `;

    container.appendChild(legRow);
}

function updateLegField(legId, field, value) {
    const leg = state.legs.find(l => l.id === legId);
    if (leg) {
        if (field === 'hours' || field === 'minutes' || field === 'fuelBurn') {
            leg[field] = parseFloat(value) || 0;
        } else {
            leg[field] = value;
        }
        updateEstimate();
    }
}

function removeLeg(legId) {
    state.legs = state.legs.filter(l => l.id !== legId);
    const legRow = document.querySelector(`[data-leg-id="${legId}"]`);
    if (legRow) {
        legRow.remove();
    }
    reindexLegs();
    updateEstimate();
}

function reindexLegs() {
    const container = document.getElementById('flightLegsContainer');
    const legRows = container.querySelectorAll('.leg-row');
    legRows.forEach((row, index) => {
        const label = row.querySelector('.leg-label');
        label.textContent = `Leg ${index + 1}`;
    });
}

// ===========================
// Crew
// ===========================
function addInitialCrew() {
    addCrew();
}

function addCrew() {
    const defaults = getDefaults();
    const id = state.nextCrewId++;
    const crewIndex = state.crew.length;

    const crew = {
        id,
        role: 'Pilot',
        rate: crewIndex === 0 || crewIndex === 1 ? defaults.pilotRate : defaults.pilotRate
    };
    state.crew.push(crew);
    renderCrew(crew);
    updateEstimate();
}

function renderCrew(crew) {
    const container = document.getElementById('crewContainer');
    const crewIndex = state.crew.findIndex(c => c.id === crew.id);

    const crewRow = document.createElement('div');
    crewRow.className = 'crew-row';
    crewRow.dataset.crewId = crew.id;

    const defaults = getDefaults();

    crewRow.innerHTML = `
        <div class="crew-header">
            <span class="crew-label">Crew Member ${crewIndex + 1}</span>
            <button class="btn-danger" onclick="removeCrew(${crew.id})">Delete</button>
        </div>
        <div class="crew-fields">
            <div class="form-field">
                <label>Role</label>
                <select onchange="updateCrewField(${crew.id}, 'role', this.value); updateCrewRate(${crew.id}, this.value)">
                    <option value="Pilot" ${crew.role === 'Pilot' ? 'selected' : ''}>Pilot</option>
                    <option value="Flight Attendant" ${crew.role === 'Flight Attendant' ? 'selected' : ''}>Flight Attendant</option>
                </select>
            </div>
            <div class="form-field">
                <label>Daily Rate ($)</label>
                <input type="number" step="0.01" min="0" value="${crew.rate}" oninput="updateCrewField(${crew.id}, 'rate', this.value)" inputmode="decimal">
            </div>
        </div>
    `;

    container.appendChild(crewRow);
}

function updateCrewRate(crewId, role) {
    const defaults = getDefaults();
    const crew = state.crew.find(c => c.id === crewId);
    if (crew) {
        const newRate = role === 'Pilot' ? defaults.pilotRate : defaults.attendantRate;
        crew.rate = newRate;

        // Update the input field
        const crewRow = document.querySelector(`[data-crew-id="${crewId}"]`);
        const rateInput = crewRow.querySelector('input[type="number"]');
        rateInput.value = newRate;

        updateEstimate();
    }
}

function updateCrewField(crewId, field, value) {
    const crew = state.crew.find(c => c.id === crewId);
    if (crew) {
        if (field === 'rate') {
            crew[field] = parseFloat(value) || 0;
        } else {
            crew[field] = value;
        }
        updateEstimate();
    }
}

function removeCrew(crewId) {
    state.crew = state.crew.filter(c => c.id !== crewId);
    const crewRow = document.querySelector(`[data-crew-id="${crewId}"]`);
    if (crewRow) {
        crewRow.remove();
    }
    reindexCrew();
    updateEstimate();
}

function reindexCrew() {
    const container = document.getElementById('crewContainer');
    const crewRows = container.querySelectorAll('.crew-row');
    crewRows.forEach((row, index) => {
        const label = row.querySelector('.crew-label');
        label.textContent = `Crew Member ${index + 1}`;
    });
}

// ===========================
// Expose Functions to Window Scope for Inline Event Handlers
// Required because ES6 modules have their own scope
// ===========================
window.removeLeg = removeLeg;
window.updateLegField = updateLegField;
window.removeCrew = removeCrew;
window.updateCrewField = updateCrewField;
window.updateCrewRate = updateCrewRate;

// ===========================
// Calculation Engine
// ===========================
function updateEstimate() {
    const estimate = calculateEstimate();
    document.getElementById('tripEstimate').textContent = formatEstimate(estimate);
}

function calculateEstimate() {
    // Flight legs
    const fuelDensity = parseFloat(document.getElementById('fuelDensity').value) || 6.7;
    const fuelPrice = parseFloat(document.getElementById('fuelPrice').value) || 5.93;
    const includeAPU = document.getElementById('includeAPU').checked;
    const defaults = getDefaults();
    const apuBurn = defaults.apuBurn;

    let totalMinutes = 0;
    let totalFuelLbs = 0;
    let totalAPUFuel = 0;
    let activeLegsCount = 0;
    const legsSummary = [];

    state.legs.forEach((leg, index) => {
        const hours = leg.hours || 0;
        const minutes = leg.minutes || 0;
        const fuelBurn = leg.fuelBurn || 0;

        totalMinutes += (hours * 60) + minutes;

        // Determine if leg is active (has flight time AND fuel burn)
        const isActiveLeg = ((hours > 0 || minutes > 0) && fuelBurn > 0);

        // Add base fuel burn
        let legFuelTotal = fuelBurn;

        // Add APU burn if checkbox is checked and leg is active
        if (includeAPU && isActiveLeg) {
            legFuelTotal += apuBurn;
            totalAPUFuel += apuBurn;
            activeLegsCount++;
        }

        totalFuelLbs += legFuelTotal;

        const gallons = legFuelTotal / fuelDensity;
        legsSummary.push({
            index: index + 1,
            from: leg.from || '(empty)',
            to: leg.to || '(empty)',
            hours,
            minutes,
            gallons,
            apuIncluded: includeAPU && isActiveLeg
        });
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    const totalFuelGallons = totalFuelLbs / fuelDensity;
    const totalFlightHours = totalMinutes / 60;

    // Crew
    const tripDays = parseInt(document.getElementById('tripDays').value) || 0;
    const hotelStays = parseInt(document.getElementById('hotelStays').value) || 0;
    const hotelRate = parseFloat(document.getElementById('hotelRate').value) || 0;
    const mealsRate = parseFloat(document.getElementById('mealsRate').value) || 0;
    const otherRate = parseFloat(document.getElementById('otherRate').value) || 0;

    const crewCount = state.crew.length;
    let crewDayTotal = 0;
    const crewDetails = [];

    state.crew.forEach(crew => {
        const total = crew.rate * tripDays;
        crewDayTotal += total;
        crewDetails.push({
            role: crew.role,
            days: tripDays,
            rate: crew.rate,
            total
        });
    });

    const hotelTotal = crewCount * hotelStays * hotelRate;
    const mealsTotal = crewCount * tripDays * mealsRate;
    const otherTotal = crewCount * tripDays * otherRate;
    const rentalCar = parseFloat(document.getElementById('rentalCar').value) || 0;
    const airfare = parseFloat(document.getElementById('airfare').value) || 0;
    const mileage = parseFloat(document.getElementById('mileage').value) || 0;

    const crewExpensesTotal = hotelTotal + mealsTotal + otherTotal + rentalCar + airfare + mileage;
    const crewSubtotal = crewDayTotal + crewExpensesTotal;

    // Hourly programs
    const maintenanceRate = parseFloat(document.getElementById('maintenancePrograms').value) || 0;
    const consumablesRate = parseFloat(document.getElementById('otherConsumables').value) || 0;
    const additionalRate = parseFloat(document.getElementById('additionalHourly').value) || 0;

    const maintenanceTotal = totalFlightHours * maintenanceRate;
    const consumablesTotal = totalFlightHours * consumablesRate;
    const additionalTotal = totalFlightHours * additionalRate;
    const hourlySubtotal = maintenanceTotal + consumablesTotal + additionalTotal;

    // Fuel
    const fuelSubtotal = totalFuelGallons * fuelPrice;

    // Airport & Ground
    const landingFees = parseFloat(document.getElementById('landingFees').value) || 0;
    const catering = parseFloat(document.getElementById('catering').value) || 0;
    const handling = parseFloat(document.getElementById('handling').value) || 0;
    const passengerTransport = parseFloat(document.getElementById('passengerTransport').value) || 0;
    const facilityFees = parseFloat(document.getElementById('facilityFees').value) || 0;
    const specialEventFees = parseFloat(document.getElementById('specialEventFees').value) || 0;
    const rampParking = parseFloat(document.getElementById('rampParking').value) || 0;
    const customs = parseFloat(document.getElementById('customs').value) || 0;
    const hangar = parseFloat(document.getElementById('hangar').value) || 0;
    const otherAirport = parseFloat(document.getElementById('otherAirport').value) || 0;

    const airportSubtotal = landingFees + catering + handling + passengerTransport +
                           facilityFees + specialEventFees + rampParking + customs +
                           hangar + otherAirport;

    // Miscellaneous
    const tripCoordinationFee = parseFloat(document.getElementById('tripCoordinationFee').value) || 0;
    const otherMisc = parseFloat(document.getElementById('otherMisc').value) || 0;
    const miscSubtotal = tripCoordinationFee + otherMisc;

    // Total
    const estimatedTotal = crewSubtotal + hourlySubtotal + fuelSubtotal + airportSubtotal + miscSubtotal;

    // Trip notes
    const tripNotes = document.getElementById('tripNotes').value.trim();

    return {
        legsSummary,
        totalHours,
        remainingMinutes,
        totalFuelGallons,
        totalFlightHours,
        crewDetails,
        crewDayTotal,
        tripDays,
        hotelTotal,
        mealsTotal,
        otherTotal,
        rentalCar,
        airfare,
        mileage,
        crewCount,
        hotelStays,
        hotelRate,
        mealsRate,
        crewExpensesTotal,
        crewSubtotal,
        maintenanceTotal,
        maintenanceRate,
        consumablesTotal,
        consumablesRate,
        additionalTotal,
        additionalRate,
        hourlySubtotal,
        fuelSubtotal,
        fuelPrice,
        landingFees,
        catering,
        handling,
        passengerTransport,
        facilityFees,
        specialEventFees,
        rampParking,
        customs,
        hangar,
        otherAirport,
        airportSubtotal,
        tripCoordinationFee,
        otherMisc,
        miscSubtotal,
        estimatedTotal,
        tripNotes,
        includeAPU,
        apuBurn,
        totalAPUFuel,
        activeLegsCount
    };
}

function formatEstimate(estimate) {
    if (state.legs.length === 0) {
        return 'Add flight legs to see estimate...';
    }

    let output = 'Trip Cost Estimate\n\nLEGS SUMMARY\n';

    estimate.legsSummary.forEach(leg => {
        output += `Leg ${leg.index}: ${leg.from} - ${leg.to} ${leg.hours}h ${leg.minutes}m (${leg.gallons.toFixed(0)} gallons)\n`;
    });

    output += `\nTotal Flight Time: ${estimate.totalHours}h ${estimate.remainingMinutes}m\n`;
    output += `Total Fuel Used: ${estimate.totalFuelGallons.toFixed(0)} gallons\n`;
    if (estimate.includeAPU && estimate.activeLegsCount > 0) {
        output += `  (Includes ${estimate.totalAPUFuel.toFixed(0)} lbs APU burn for ${estimate.activeLegsCount} active leg${estimate.activeLegsCount > 1 ? 's' : ''})\n`;
    }

    output += '\n\nESTIMATE\n';

    // Crew day rates
    estimate.crewDetails.forEach(crew => {
        output += `${crew.role} ${crew.days} day(s) @ $${formatCurrency(crew.rate)}\n`;
    });
    output += `Crew Day Rate Subtotal: $${formatCurrency(estimate.crewDayTotal)}\n`;

    // Crew expenses
    if (estimate.crewExpensesTotal > 0) {
        output += 'Crew Expenses:\n';
        if (estimate.hotelTotal > 0) {
            output += `  Hotel: $${formatCurrency(estimate.hotelTotal)} (${estimate.crewCount} crew x ${estimate.hotelStays} night(s) x $${formatCurrency(estimate.hotelRate)})\n`;
        }
        if (estimate.mealsTotal > 0) {
            output += `  Meals: $${formatCurrency(estimate.mealsTotal)} (${estimate.crewCount} crew x ${estimate.tripDays} day(s) x $${formatCurrency(estimate.mealsRate)})\n`;
        }
        if (estimate.otherTotal > 0) {
            output += `  Other: $${formatCurrency(estimate.otherTotal)}\n`;
        }
        if (estimate.rentalCar > 0) {
            output += `  Rental Car: $${formatCurrency(estimate.rentalCar)}\n`;
        }
        if (estimate.airfare > 0) {
            output += `  Airfare: $${formatCurrency(estimate.airfare)}\n`;
        }
        if (estimate.mileage > 0) {
            output += `  Mileage: $${formatCurrency(estimate.mileage)}\n`;
        }
    }
    output += `Crew Subtotal: $${formatCurrency(estimate.crewSubtotal)}\n\n`;

    // Hourly programs
    if (estimate.hourlySubtotal > 0) {
        output += `Hourly Subtotal (Programs & Reserves): $${formatCurrency(estimate.hourlySubtotal)}\n`;
        if (estimate.maintenanceTotal > 0) {
            output += `  Maintenance Programs: $${formatCurrency(estimate.maintenanceTotal)} (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.maintenanceRate)})\n`;
        }
        if (estimate.consumablesTotal > 0) {
            output += `  Other Consumables: $${formatCurrency(estimate.consumablesTotal)} (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.consumablesRate)})\n`;
        }
        if (estimate.additionalTotal > 0) {
            output += `  Additional: $${formatCurrency(estimate.additionalTotal)} (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.additionalRate)})\n`;
        }
    }

    // Fuel
    output += `Fuel Subtotal: $${formatCurrency(estimate.fuelSubtotal)}\n`;
    output += `  (${estimate.totalFuelGallons.toFixed(0)} gallons @ $${formatCurrency(estimate.fuelPrice)})\n`;

    // Airport & Ground
    if (estimate.airportSubtotal > 0) {
        output += `Airport & Ground Subtotal: $${formatCurrency(estimate.airportSubtotal)}\n`;
        if (estimate.landingFees > 0) output += `  Landing Fees: $${formatCurrency(estimate.landingFees)}\n`;
        if (estimate.catering > 0) output += `  Catering: $${formatCurrency(estimate.catering)}\n`;
        if (estimate.handling > 0) output += `  Handling: $${formatCurrency(estimate.handling)}\n`;
        if (estimate.passengerTransport > 0) output += `  Passenger Ground Transport: $${formatCurrency(estimate.passengerTransport)}\n`;
        if (estimate.facilityFees > 0) output += `  Facility Fees: $${formatCurrency(estimate.facilityFees)}\n`;
        if (estimate.specialEventFees > 0) output += `  Special Event Fees: $${formatCurrency(estimate.specialEventFees)}\n`;
        if (estimate.rampParking > 0) output += `  Ramp/Parking: $${formatCurrency(estimate.rampParking)}\n`;
        if (estimate.customs > 0) output += `  Customs: $${formatCurrency(estimate.customs)}\n`;
        if (estimate.hangar > 0) output += `  Hangar: $${formatCurrency(estimate.hangar)}\n`;
        if (estimate.otherAirport > 0) output += `  Other: $${formatCurrency(estimate.otherAirport)}\n`;
    }

    // Miscellaneous
    if (estimate.miscSubtotal > 0) {
        output += `Miscellaneous Subtotal: $${formatCurrency(estimate.miscSubtotal)}\n`;
        if (estimate.tripCoordinationFee > 0) output += `  Trip Coordination Fee: $${formatCurrency(estimate.tripCoordinationFee)}\n`;
        if (estimate.otherMisc > 0) output += `  Other: $${formatCurrency(estimate.otherMisc)}\n`;
    }

    output += `\nEstimated Total: $${formatCurrency(estimate.estimatedTotal)}\n`;

    if (estimate.tripNotes) {
        output += `\nTrip Notes:\n${estimate.tripNotes}\n`;
    }

    return output;
}

// ===========================
// Copy to Clipboard
// ===========================
function copyToClipboard() {
    const estimateText = document.getElementById('tripEstimate').textContent;
    navigator.clipboard.writeText(estimateText).then(() => {
        showToast('Estimate copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy to clipboard', 'error');
    });
}

// ===========================
// Enhanced Share Functions
// ===========================

// Open the enhanced share modal
function openEnhancedShareModal() {
    // Check if user is authenticated to show link/QR options
    const userAuthenticated = isAuthenticated();

    // Show/hide authenticated-only options
    const linkBtn = document.getElementById('shareViaLinkBtn');
    const qrBtn = document.getElementById('shareViaQRBtn');

    // Show shareable link and QR options for all authenticated users
    // The individual functions will handle the "save first" prompt if needed
    if (linkBtn) linkBtn.style.display = userAuthenticated ? 'flex' : 'none';
    if (qrBtn) qrBtn.style.display = userAuthenticated ? 'flex' : 'none';

    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
        const nativeBtn = document.getElementById('shareViaNativeBtn');
        if (nativeBtn) nativeBtn.style.display = 'flex';
    }

    // Hide QR code container if it was previously shown
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) qrContainer.style.display = 'none';

    openModal('enhancedShareModal');
}

// Share via email (mailto:)
function shareViaEmail() {
    const estimateText = document.getElementById('tripEstimate').textContent;
    const subject = encodeURIComponent('Trip Cost Estimate');
    const body = encodeURIComponent(estimateText);

    // Open default email client with pre-filled content
    window.location.href = `mailto:?subject=${subject}&body=${body}`;

    showToast('Opening email client...', 'success');
}

// Share via Web Share API (native mobile sharing)
async function shareViaNative() {
    const estimateText = document.getElementById('tripEstimate').textContent;

    if (!navigator.share) {
        showToast('Native sharing not supported on this device', 'error');
        return;
    }

    try {
        await navigator.share({
            title: 'Trip Cost Estimate',
            text: estimateText
        });
        showToast('Shared successfully!', 'success');
    } catch (err) {
        // User cancelled or sharing failed
        if (err.name !== 'AbortError') {
            console.error('Share failed:', err);
            showToast('Failed to share', 'error');
        }
    }
}

// Generate QR code for shareable link
async function generateShareQR() {
    if (!state.currentEstimateId) {
        showToast('Please save the estimate first', 'error');
        return;
    }

    try {
        // Create or get share link
        const { shareToken, error } = await createEstimateShare(state.currentEstimateId, state.currentEstimateName);

        if (error) {
            showToast('Failed to create share link: ' + error.message, 'error');
            return;
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareToken}`;

        // Show QR container
        const qrContainer = document.getElementById('qrCodeContainer');
        const qrCodeDiv = document.getElementById('qrCode');

        // Clear previous QR code
        qrCodeDiv.innerHTML = '';

        // Generate QR code
        new QRCode(qrCodeDiv, {
            text: shareUrl,
            width: 256,
            height: 256,
            colorDark: '#0f172a',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        qrContainer.style.display = 'block';
        showToast('QR code generated!', 'success');
    } catch (err) {
        console.error('Failed to generate QR code:', err);
        showToast('Failed to generate QR code', 'error');
    }
}

// Hide QR code
function hideQRCode() {
    const qrContainer = document.getElementById('qrCodeContainer');
    if (qrContainer) qrContainer.style.display = 'none';
}

// Copy shareable link to clipboard
async function copyShareableLink() {
    if (!state.currentEstimateId) {
        showToast('Please save the estimate first', 'error');
        return;
    }

    try {
        const { shareToken, error } = await createEstimateShare(state.currentEstimateId, state.currentEstimateName);

        if (error) {
            showToast('Failed to create share link: ' + error.message, 'error');
            return;
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareToken}`;

        await navigator.clipboard.writeText(shareUrl);
        showToast('Shareable link copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy link:', err);
        showToast('Failed to copy link', 'error');
    }
}

// Export to PDF from share modal (closes share modal first)
function exportToPDFFromShare() {
    closeModal('enhancedShareModal');
    // Small delay to allow modal close animation to start
    setTimeout(() => {
        exportToPDF();
    }, 100);
}

// ===========================
// PDF Export
// ===========================
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = 20;

    // Add logo at top left (SVG as base64)
    const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" id="b" width="2677.78" height="1278.16" viewBox="0 0 2677.78 1278.16">
  <g id="c">
    <g>
      <path d="m352.43,1275.09l-10.58-34.67h-135.24l-24.5,34.67h-71.17l149.58-204.62h96.74l65.88,204.62h-70.71Zm-23.42-79.46l-23.84-77.62h-12.42l-55,77.62h91.27Zm160.17-125.17h68.46l43.8,153.39h11.66l104.68-153.39h68l-140.84,204.62h-95.77l-60-204.62h0Zm374.34,0h65.34l-41.08,204.62h-65.34l41.08-204.62h0Zm342.3,204.62l-10.58-34.67h-135.24l-24.5,34.67h-71.17l149.58-204.62h96.74l65.88,204.62h-70.71Zm-23.42-79.46l-23.84-77.62h-12.42l-55,77.62h91.27Zm170.04-125.17h247.57l-10.47,52.15h-91.12l-30.61,152.47h-65.34l30.61-152.47h-91.12l10.47-52.15h0Zm329.24,0h65.34l-41.08,204.62h-65.34l41.08-204.62h0Zm298.19-2.76c44.12,0,74.28,1.07,90.41,3.27,23.23,3.22,35.58,14.58,37.09,34,.99,13.4-1.71,36-8.1,67.85-6.41,31.96-12.81,54.66-19.18,68.05-9.32,19.43-26.22,30.78-50.75,34-17.01,2.2-47.39,3.27-91.11,3.27s-74.9-1.07-91.02-3.27c-23.23-3.22-35.58-14.57-37.09-34-.99-13.39,1.8-36.45,8.38-69.23,6.25-31.14,12.56-53.38,18.91-66.67,9.32-19.43,26.22-30.78,50.75-34,16.9-2.2,47.49-3.27,91.72-3.27h0Zm-10.5,53.07c-33.08,0-53.15.87-60.18,2.55-8.07,2-14.04,6.49-17.84,13.45-3.8,6.95-7.75,20.76-11.91,41.47-2.52,12.53-3.67,21.58-3.51,27.15.41,10.43,6.74,16.36,19.06,17.9,9.02,1.17,26.94,1.79,53.74,1.79,25.05,0,41.87-.46,50.32-1.33,8.47-.92,15.01-2.92,19.62-6.03,4.19-2.81,7.42-6.9,9.85-12.37,2.38-5.47,4.83-14.37,7.32-26.79,2.96-14.73,4.61-25.51,5.02-32.41.36-6.9-.38-12.12-2.29-15.59-2.39-4.4-7.31-7.16-14.67-8.18-7.4-1.07-25.55-1.59-54.54-1.59h0Zm242.5-50.31h109.21l76.49,152.77h6.44l29.14-152.77h63.4l-41.08,204.62h-108.34l-76.91-152.77h-6.75l-29.29,152.77h-63.4l41.08-204.62Z" fill="#bc282e" fill-rule="evenodd"></path>
      <path d="m287.06,741.03C-283.18,506.16-5.34,211.1,1133.97,137.49,247.54,305.95-79.28,481.79,287.06,741.03Z" fill="#bc282e" fill-rule="evenodd"></path>
      <path d="m450.76,331.77l-69.31,345.23c-6.32,31.49-11.99,53.4-17.14,65.52-5.11,11.95-12.29,21.54-21.89,28.78-22.46,16.29-72.79,24.44-151.34,24.44l-37.71,187.85,16.1.04c101,0,175.33-5.07,222.98-15.21,47.43-9.96,85.93-28.6,114.95-55.93,22.71-21.18,40.58-47.97,53.53-80.01,12.98-32.22,26.35-82.54,40.05-150.78l84.64-421.55c-78.86,20.65-158.22,43.73-234.85,71.61Z" fill="#626365" fill-rule="evenodd"></path>
      <polygon points="804.6 248.37 659.16 972.78 1196.41 972.78 1164 788.15 927.57 788.15 1035.94 248.37 804.6 248.37" fill="#626365" fill-rule="evenodd"></polygon>
      <polygon points="1152.57 248.37 1279.73 972.78 1621.3 972.78 1871.4 442.05 1910.2 972.78 2250.68 972.78 2677.78 248.37 2443.91 248.37 2139.75 791.41 2098.3 791.41 2042.43 248.37 1776.16 248.37 1503.32 791.41 1462.41 791.41 1377.39 248.37 1152.57 248.37" fill="#626365" fill-rule="evenodd"></polygon>
      <path d="m1169.21,103.25c-12.36-17.24-25.37-56.87-60.33-50.95l23.99,73.26-4.72,13.05,177.22-18.34,32.19,35.03c56.46-26.02,64.74-35.75,99.61-42.58,28.02-5.49,55.96-6.82,84.16-11.92,24.61-4.44,50.21-11.44,70.61-24.28,22.98-14.47,18.41-15.72-.46-21.84-9.24-3-19.14-4.73-29.97-5.89-21.57-2.3-40.05-2.1-62.82.62-24.37,2.91-45.74,7.73-67.61,12.6-22.75,5.06-22.89,6.82-42.65,0-26.06-9-47.87-20.46-68.93-31.84-16.37-8.85-34.37-19.7-51.91-26.42-16.07-6.16-23.38-3.72-36.44.4l37.94,80.96-99.87,18.16Z" fill="#bc282e" fill-rule="evenodd"></path>
    </g>
  </g>
</svg>`;

    // Convert SVG to canvas and then to image (simplified approach - embed as data URI)
    const logoWidth = 20;
    const logoHeight = (logoWidth * 1278.16) / 2677.78; // maintain aspect ratio

    // Create a temporary canvas to render SVG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgBlob = new Blob([logoSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function() {
        canvas.width = 400;
        canvas.height = (400 * 1278.16) / 2677.78;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = canvas.toDataURL('image/png');

        // Add logo
        doc.addImage(imgData, 'PNG', margin, yPos, logoWidth, logoHeight);
        URL.revokeObjectURL(url);

        // Continue with PDF generation
        generatePDFContent(doc, pageWidth, margin, yPos + logoHeight + 10);
    };

    img.src = url;
}

function generatePDFContent(doc, pageWidth, margin, startY) {
    let yPos = startY;
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 20;

    // Prepare footer data
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const userEmail = isAuthenticated() ? getUserEmail() : 'Guest';
    const footerText = `Created: ${dateStr} - by ${userEmail}`;

    // Helper function to add footer to current page
    const addFooter = () => {
        const footerY = pageHeight - 10;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        const footerWidth = doc.getTextWidth(footerText);
        doc.text(footerText, (pageWidth - footerWidth) / 2, footerY);
    };

    // Helper function to check if we need a new page
    const checkPageBreak = (neededSpace) => {
        if (yPos + neededSpace > pageHeight - bottomMargin) {
            addFooter();
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    // Add centered title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    const title = 'Trip Cost Estimate';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPos);
    yPos += 15;

    // Get estimate data
    const estimate = calculateEstimate();

    // Section: Flight Summary
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Flight Summary', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    if (state.legs.length === 0) {
        checkPageBreak(6);
        doc.text('No flight legs added', margin + 5, yPos);
        yPos += 6;
    } else {
        estimate.legsSummary.forEach(leg => {
            checkPageBreak(6);
            const legText = `Leg ${leg.index}: ${leg.from} - ${leg.to}`;
            const legDetails = `${leg.hours}h ${leg.minutes}m (${leg.gallons.toFixed(0)} gallons)`;
            doc.text(legText, margin + 5, yPos);
            doc.text(legDetails, pageWidth - margin - doc.getTextWidth(legDetails), yPos);
            yPos += 6;
        });

        yPos += 2;
        checkPageBreak(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Flight Time: ${estimate.totalHours}h ${estimate.remainingMinutes}m`, margin + 5, yPos);
        yPos += 6;
        doc.text(`Total Fuel: ${estimate.totalFuelGallons.toFixed(0)} gallons`, margin + 5, yPos);
        yPos += 6;

        if (estimate.includeAPU && estimate.activeLegsCount > 0) {
            checkPageBreak(6);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.text(`(Includes ${estimate.totalAPUFuel.toFixed(0)} lbs APU burn for ${estimate.activeLegsCount} active leg${estimate.activeLegsCount > 1 ? 's' : ''})`, margin + 10, yPos);
            yPos += 6;
        }
    }

    yPos += 5;

    // Section: Cost Breakdown
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Cost Breakdown', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Crew Day Rates
    if (estimate.crewDetails.length > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Crew Day Rates', margin + 5, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        estimate.crewDetails.forEach(crew => {
            checkPageBreak(5);
            const crewText = `${crew.role} - ${crew.days} day(s) @ $${formatCurrency(crew.rate)}`;
            const crewCost = `$${formatCurrency(crew.days * crew.rate)}`;
            doc.text(crewText, margin + 10, yPos);
            doc.text(crewCost, pageWidth - margin - doc.getTextWidth(crewCost), yPos);
            yPos += 5;
        });

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        const crewDayTotal = `$${formatCurrency(estimate.crewDayTotal)}`;
        doc.text('Crew Day Rate Subtotal:', margin + 10, yPos);
        doc.text(crewDayTotal, pageWidth - margin - doc.getTextWidth(crewDayTotal), yPos);
        yPos += 8;
    }

    // Crew Expenses
    if (estimate.crewExpensesTotal > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Crew Expenses', margin + 5, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        if (estimate.hotelTotal > 0) {
            checkPageBreak(5);
            const hotelText = `Hotel (${estimate.crewCount} crew x ${estimate.hotelStays} night(s) x $${formatCurrency(estimate.hotelRate)})`;
            const hotelCost = `$${formatCurrency(estimate.hotelTotal)}`;
            doc.text(hotelText, margin + 10, yPos);
            doc.text(hotelCost, pageWidth - margin - doc.getTextWidth(hotelCost), yPos);
            yPos += 5;
        }
        if (estimate.mealsTotal > 0) {
            checkPageBreak(5);
            const mealsText = `Meals (${estimate.crewCount} crew x ${estimate.tripDays} day(s) x $${formatCurrency(estimate.mealsRate)})`;
            const mealsCost = `$${formatCurrency(estimate.mealsTotal)}`;
            doc.text(mealsText, margin + 10, yPos);
            doc.text(mealsCost, pageWidth - margin - doc.getTextWidth(mealsCost), yPos);
            yPos += 5;
        }
        if (estimate.otherTotal > 0) {
            checkPageBreak(5);
            doc.text('Other Expenses', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.otherTotal)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.otherTotal)}`), yPos);
            yPos += 5;
        }
        if (estimate.rentalCar > 0) {
            checkPageBreak(5);
            doc.text('Rental Car', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.rentalCar)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.rentalCar)}`), yPos);
            yPos += 5;
        }
        if (estimate.airfare > 0) {
            checkPageBreak(5);
            doc.text('Airfare', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.airfare)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.airfare)}`), yPos);
            yPos += 5;
        }
        if (estimate.mileage > 0) {
            checkPageBreak(5);
            doc.text('Mileage', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.mileage)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.mileage)}`), yPos);
            yPos += 5;
        }

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        const crewSubtotal = `$${formatCurrency(estimate.crewSubtotal)}`;
        doc.text('Crew Subtotal:', margin + 10, yPos);
        doc.text(crewSubtotal, pageWidth - margin - doc.getTextWidth(crewSubtotal), yPos);
        yPos += 8;
    }

    // Hourly Programs
    if (estimate.hourlySubtotal > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Hourly Programs & Reserves', margin + 5, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        if (estimate.maintenanceTotal > 0) {
            checkPageBreak(5);
            const maintText = `Maintenance Programs (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.maintenanceRate)})`;
            const maintCost = `$${formatCurrency(estimate.maintenanceTotal)}`;
            doc.text(maintText, margin + 10, yPos);
            doc.text(maintCost, pageWidth - margin - doc.getTextWidth(maintCost), yPos);
            yPos += 5;
        }
        if (estimate.consumablesTotal > 0) {
            checkPageBreak(5);
            const consText = `Other Consumables (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.consumablesRate)})`;
            const consCost = `$${formatCurrency(estimate.consumablesTotal)}`;
            doc.text(consText, margin + 10, yPos);
            doc.text(consCost, pageWidth - margin - doc.getTextWidth(consCost), yPos);
            yPos += 5;
        }
        if (estimate.additionalTotal > 0) {
            checkPageBreak(5);
            const addText = `Additional (${estimate.totalFlightHours.toFixed(2)} hrs @ $${formatCurrency(estimate.additionalRate)})`;
            const addCost = `$${formatCurrency(estimate.additionalTotal)}`;
            doc.text(addText, margin + 10, yPos);
            doc.text(addCost, pageWidth - margin - doc.getTextWidth(addCost), yPos);
            yPos += 5;
        }

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        const hourlySubtotal = `$${formatCurrency(estimate.hourlySubtotal)}`;
        doc.text('Hourly Subtotal:', margin + 10, yPos);
        doc.text(hourlySubtotal, pageWidth - margin - doc.getTextWidth(hourlySubtotal), yPos);
        yPos += 8;
    }

    // Fuel
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Fuel', margin + 5, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    const fuelText = `${estimate.totalFuelGallons.toFixed(0)} gallons @ $${formatCurrency(estimate.fuelPrice)}`;
    const fuelCost = `$${formatCurrency(estimate.fuelSubtotal)}`;
    doc.text(fuelText, margin + 10, yPos);
    doc.text(fuelCost, pageWidth - margin - doc.getTextWidth(fuelCost), yPos);
    yPos += 8;

    // Airport & Ground
    if (estimate.airportSubtotal > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Airport & Ground Services', margin + 5, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        if (estimate.landingFees > 0) {
            checkPageBreak(5);
            doc.text('Landing Fees', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.landingFees)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.landingFees)}`), yPos);
            yPos += 5;
        }
        if (estimate.catering > 0) {
            checkPageBreak(5);
            doc.text('Catering', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.catering)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.catering)}`), yPos);
            yPos += 5;
        }
        if (estimate.handling > 0) {
            checkPageBreak(5);
            doc.text('Handling', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.handling)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.handling)}`), yPos);
            yPos += 5;
        }
        if (estimate.passengerTransport > 0) {
            checkPageBreak(5);
            doc.text('Passenger Ground Transport', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.passengerTransport)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.passengerTransport)}`), yPos);
            yPos += 5;
        }
        if (estimate.facilityFees > 0) {
            checkPageBreak(5);
            doc.text('Facility Fees', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.facilityFees)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.facilityFees)}`), yPos);
            yPos += 5;
        }
        if (estimate.specialEventFees > 0) {
            checkPageBreak(5);
            doc.text('Special Event Fees', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.specialEventFees)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.specialEventFees)}`), yPos);
            yPos += 5;
        }
        if (estimate.rampParking > 0) {
            checkPageBreak(5);
            doc.text('Ramp/Parking', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.rampParking)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.rampParking)}`), yPos);
            yPos += 5;
        }
        if (estimate.customs > 0) {
            checkPageBreak(5);
            doc.text('Customs', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.customs)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.customs)}`), yPos);
            yPos += 5;
        }
        if (estimate.hangar > 0) {
            checkPageBreak(5);
            doc.text('Hangar', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.hangar)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.hangar)}`), yPos);
            yPos += 5;
        }
        if (estimate.otherAirport > 0) {
            checkPageBreak(5);
            doc.text('Other', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.otherAirport)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.otherAirport)}`), yPos);
            yPos += 5;
        }

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        const airportSubtotal = `$${formatCurrency(estimate.airportSubtotal)}`;
        doc.text('Airport & Ground Subtotal:', margin + 10, yPos);
        doc.text(airportSubtotal, pageWidth - margin - doc.getTextWidth(airportSubtotal), yPos);
        yPos += 8;
    }

    // Miscellaneous
    if (estimate.miscSubtotal > 0) {
        checkPageBreak(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Miscellaneous', margin + 5, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        if (estimate.tripCoordinationFee > 0) {
            checkPageBreak(5);
            doc.text('Trip Coordination Fee', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.tripCoordinationFee)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.tripCoordinationFee)}`), yPos);
            yPos += 5;
        }
        if (estimate.otherMisc > 0) {
            checkPageBreak(5);
            doc.text('Other', margin + 10, yPos);
            doc.text(`$${formatCurrency(estimate.otherMisc)}`, pageWidth - margin - doc.getTextWidth(`$${formatCurrency(estimate.otherMisc)}`), yPos);
            yPos += 5;
        }

        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        const miscSubtotal = `$${formatCurrency(estimate.miscSubtotal)}`;
        doc.text('Miscellaneous Subtotal:', margin + 10, yPos);
        doc.text(miscSubtotal, pageWidth - margin - doc.getTextWidth(miscSubtotal), yPos);
        yPos += 8;
    }

    // Total
    checkPageBreak(20);
    yPos += 5;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const totalLabel = 'Estimated Total:';
    const totalAmount = `$${formatCurrency(estimate.estimatedTotal)}`;
    doc.text(totalLabel, margin + 5, yPos);
    doc.text(totalAmount, pageWidth - margin - doc.getTextWidth(totalAmount), yPos);
    yPos += 10;

    // Trip Notes
    if (estimate.tripNotes) {
        checkPageBreak(15);
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Trip Notes', margin, yPos);
        yPos += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const notesLines = doc.splitTextToSize(estimate.tripNotes, pageWidth - (margin * 2));
        // Check if notes will fit, if not add page break
        const notesHeight = notesLines.length * 6;
        checkPageBreak(notesHeight);
        doc.text(notesLines, margin + 5, yPos);
    }

    // Add footer to the last page
    addFooter();

    // Generate filename
    const now = new Date();
    const filename = `trip-estimate-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;

    // Show preview instead of immediately downloading
    showPDFPreview(doc, filename);
}

// ===========================
// PDF Preview Functions
// ===========================
function showPDFPreview(doc, filename) {
    // Store PDF document and filename for download
    currentPdfDoc = doc;
    currentPdfFilename = filename;

    // Convert PDF to blob
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Store blob URL for cleanup
    currentPdfBlob = pdfUrl;

    // Set iframe source to display PDF
    document.getElementById('pdfPreviewFrame').src = pdfUrl;

    // Open the modal
    openModal('pdfPreviewModal');
}

function downloadCurrentPDF() {
    if (currentPdfDoc && currentPdfFilename) {
        currentPdfDoc.save(currentPdfFilename);
    }
}

function closePdfPreview() {
    // Revoke blob URL to free memory
    if (currentPdfBlob) {
        URL.revokeObjectURL(currentPdfBlob);
        currentPdfBlob = null;
    }

    // Clear PDF state
    currentPdfDoc = null;
    currentPdfFilename = null;

    // Clear iframe
    document.getElementById('pdfPreviewFrame').src = '';

    // Close the modal
    closeModal('pdfPreviewModal');
}

// ===========================
// Save/Load Estimates
// ===========================
function saveEstimateAction() {
    // Check authentication first
    if (!isAuthenticated()) {
        showToast('You must be signed in to save estimates', 'error');
        return;
    }

    const updateButton = document.getElementById('confirmUpdateEstimateButton');
    const saveButton = document.getElementById('confirmSaveEstimateButton');
    const modalTitle = document.getElementById('saveEstimateModalTitle');
    const nameInput = document.getElementById('estimateName');

    // Clear errors
    document.getElementById('saveEstimateError').style.display = 'none';

    // Check if we're editing an existing estimate
    if (state.currentEstimateId) {
        // Editing mode: show both Update and Save as New
        nameInput.value = state.currentEstimateName;
        updateButton.style.display = 'inline-block';
        saveButton.textContent = 'Save as New';
        modalTitle.textContent = 'Update Estimate';
    } else {
        // New estimate mode: only show Save
        nameInput.value = '';
        updateButton.style.display = 'none';
        saveButton.textContent = 'Save';
        modalTitle.textContent = 'Save Estimate';
    }

    // Open the modal
    openModal('saveEstimateModal');
}

async function confirmSaveEstimate(e) {
    e.preventDefault();

    const nameInput = document.getElementById('estimateName');
    const name = nameInput.value.trim();
    const errorDiv = document.getElementById('saveEstimateError');

    // Hide previous errors
    errorDiv.style.display = 'none';

    if (!name) {
        errorDiv.textContent = 'Please enter a name for this estimate';
        errorDiv.style.display = 'block';
        return;
    }

    const estimateData = {
        legs: state.legs,
        crew: state.crew,
        formData: getFormData()
    };

    // Save to Supabase as new estimate
    const { data, error } = await saveEstimate(name, estimateData);

    if (error) {
        errorDiv.textContent = 'Failed to save: ' + error.message;
        errorDiv.style.display = 'block';
        return;
    }

    // Clear current estimate tracking (we just created a new one)
    state.currentEstimateId = data.id;
    state.currentEstimateName = data.name;

    // Success!
    closeModal('saveEstimateModal');
    showToast('Estimate saved successfully!', 'success');
}

async function confirmUpdateEstimate(e) {
    e.preventDefault();

    const nameInput = document.getElementById('estimateName');
    const name = nameInput.value.trim();
    const errorDiv = document.getElementById('saveEstimateError');

    // Hide previous errors
    errorDiv.style.display = 'none';

    if (!name) {
        errorDiv.textContent = 'Please enter a name for this estimate';
        errorDiv.style.display = 'block';
        return;
    }

    if (!state.currentEstimateId) {
        errorDiv.textContent = 'No estimate loaded to update';
        errorDiv.style.display = 'block';
        return;
    }

    const estimateData = {
        legs: state.legs,
        crew: state.crew,
        formData: getFormData()
    };

    // Update existing estimate in Supabase
    const { error } = await updateEstimateInDB(state.currentEstimateId, name, estimateData);

    if (error) {
        errorDiv.textContent = 'Failed to update: ' + error.message;
        errorDiv.style.display = 'block';
        return;
    }

    // Update the name in state
    state.currentEstimateName = name;

    // Success!
    closeModal('saveEstimateModal');
    showToast('Estimate updated successfully!', 'success');
}

async function getSavedEstimatesFromSource() {
    // Only load from Supabase if authenticated
    if (!isAuthenticated()) {
        return [];
    }

    const { data, error } = await loadEstimates();

    if (error) {
        console.error('Failed to load estimates:', error);
        showToast('Failed to load estimates: ' + error.message, 'error');
        return [];
    }

    return data || [];
}

async function populateLoadEstimateModal() {
    const container = document.getElementById('savedEstimatesList');
    container.innerHTML = '<div class="empty-state">Loading...</div>';

    const saved = await getSavedEstimatesFromSource();

    if (saved.length === 0) {
        container.innerHTML = '<div class="empty-state">No saved estimates</div>';
        return;
    }

    container.innerHTML = '';
    saved.forEach((estimate, index) => {
        // For Supabase estimates, use created_at; for localStorage, use date
        const date = new Date(estimate.created_at || estimate.date);
        const dateStr = date.toLocaleString();

        const item = document.createElement('div');
        item.className = 'saved-estimate-item';
        item.innerHTML = `
            <div class="saved-estimate-info">
                <div class="saved-estimate-name">${estimate.name}</div>
                <div class="saved-estimate-date">${dateStr}</div>
            </div>
            <div class="saved-estimate-actions">
                <button class="btn-primary" data-estimate-id="${estimate.id || index}">Load</button>
                <button class="btn-danger" data-estimate-id="${estimate.id || index}">Delete</button>
                ${estimate.id ? `<button class="btn-secondary" data-estimate-id="${estimate.id}">Share</button>` : ''}
            </div>
        `;

        // Add event listeners
        const loadBtn = item.querySelector('.btn-primary');
        const deleteBtn = item.querySelector('.btn-danger');
        const shareBtn = item.querySelector('.btn-secondary');

        loadBtn.addEventListener('click', () => loadEstimateAction(estimate));
        deleteBtn.addEventListener('click', () => deleteEstimateAction(estimate));
        if (shareBtn) {
            shareBtn.addEventListener('click', () => shareEstimateAction(estimate));
        }

        container.appendChild(item);
    });
}

function loadEstimateAction(estimate) {
    // Clear existing
    state.legs = [];
    state.crew = [];
    document.getElementById('flightLegsContainer').innerHTML = '';
    document.getElementById('crewContainer').innerHTML = '';

    // Track the loaded estimate for updates
    state.currentEstimateId = estimate.id;
    state.currentEstimateName = estimate.name;

    // Get estimate data (handle both Supabase and localStorage formats)
    const estimateData = estimate.estimate_data || estimate.data;

    // Load legs
    estimateData.legs.forEach(leg => {
        state.legs.push({ ...leg });
        renderLeg(leg);
    });
    state.nextLegId = Math.max(...state.legs.map(l => l.id), 0) + 1;

    // Load crew
    estimateData.crew.forEach(crew => {
        state.crew.push({ ...crew });
        renderCrew(crew);
    });
    state.nextCrewId = Math.max(...state.crew.map(c => c.id), 0) + 1;

    // Load form data
    setFormData(estimateData.formData);

    closeModal('loadEstimateModal');
    updateEstimate();
    showToast('Estimate loaded successfully', 'success');
}

async function deleteEstimateAction(estimate) {
    if (!confirm('Are you sure you want to delete this estimate?')) return;

    // Delete from Supabase if it has an ID
    if (estimate.id) {
        const { error } = await deleteEstimate(estimate.id);
        if (error) {
            showToast('Failed to delete estimate: ' + error.message, 'error');
            return;
        }
        showToast('Estimate deleted successfully', 'success');
    }

    // Refresh the list
    await populateLoadEstimateModal();
}

// ===========================
// Estimate Sharing
// ===========================
async function shareEstimateAction(estimate) {
    if (!estimate.id) {
        showToast('Cannot share this estimate', 'error');
        return;
    }

    // Create share link
    const { shareToken, error } = await createEstimateShare(estimate.id, estimate.name);

    if (error) {
        showToast('Failed to create share link: ' + error.message, 'error');
        return;
    }

    // Display share link in modal
    const shareLink = `${window.location.origin}?share=${shareToken}`;
    document.getElementById('shareLink').value = shareLink;

    // Show success message
    const successDiv = document.getElementById('shareSuccess');
    successDiv.textContent = 'Share link created! Anyone with this link can view and copy this estimate.';
    successDiv.style.display = 'block';

    // Hide error message
    document.getElementById('shareError').style.display = 'none';

    // Open share modal
    closeModal('loadEstimateModal');
    openModal('shareEstimateModal');
}

function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    navigator.clipboard.writeText(shareLinkInput.value)
        .then(() => {
            showToast('Share link copied to clipboard!', 'success');
        })
        .catch(() => {
            showToast('Failed to copy link', 'error');
        });
}

// Check for shared estimate on page load
async function checkForSharedEstimate() {
    const urlParams = new URLSearchParams(window.location.search);
    const shareToken = urlParams.get('share');

    if (!shareToken) return;

    // Load the shared estimate
    const { data, error } = await loadSharedEstimate(shareToken);

    if (error) {
        showToast('Failed to load shared estimate: ' + error.message, 'error');
        return;
    }

    // Ask user if they want to load it or copy it
    if (isAuthenticated()) {
        const action = confirm('Would you like to save this shared estimate to your account?\n\nOK = Save to account\nCancel = Just view it');

        if (action) {
            // Copy to user's account
            const { error: copyError } = await copySharedEstimate(shareToken);
            if (copyError) {
                showToast('Failed to save estimate: ' + copyError.message, 'error');
                return;
            }
            showToast('Shared estimate saved to your account!', 'success');
        } else {
            // Just load it for viewing
            loadEstimateAction(data);
        }
    } else {
        // Anonymous user - just load it
        loadEstimateAction(data);
        showToast('Viewing shared estimate. Sign in to save it to your account.', 'info');
    }

    // Remove share token from URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

function getFormData() {
    return {
        fuelPrice: document.getElementById('fuelPrice').value,
        fuelDensity: document.getElementById('fuelDensity').value,
        tripDays: document.getElementById('tripDays').value,
        hotelStays: document.getElementById('hotelStays').value,
        hotelRate: document.getElementById('hotelRate').value,
        mealsRate: document.getElementById('mealsRate').value,
        otherRate: document.getElementById('otherRate').value,
        rentalCar: document.getElementById('rentalCar').value,
        airfare: document.getElementById('airfare').value,
        mileage: document.getElementById('mileage').value,
        maintenancePrograms: document.getElementById('maintenancePrograms').value,
        otherConsumables: document.getElementById('otherConsumables').value,
        additionalHourly: document.getElementById('additionalHourly').value,
        landingFees: document.getElementById('landingFees').value,
        catering: document.getElementById('catering').value,
        handling: document.getElementById('handling').value,
        passengerTransport: document.getElementById('passengerTransport').value,
        facilityFees: document.getElementById('facilityFees').value,
        specialEventFees: document.getElementById('specialEventFees').value,
        rampParking: document.getElementById('rampParking').value,
        customs: document.getElementById('customs').value,
        hangar: document.getElementById('hangar').value,
        otherAirport: document.getElementById('otherAirport').value,
        tripCoordinationFee: document.getElementById('tripCoordinationFee').value,
        otherMisc: document.getElementById('otherMisc').value,
        tripNotes: document.getElementById('tripNotes').value,
        includeAPU: document.getElementById('includeAPU').checked
    };
}

function setFormData(data) {
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
            } else {
                element.value = data[key];
            }
        }
    });
}

// ===========================
// Reset Form
// ===========================
function resetForm() {
    // Open confirmation modal instead of system dialog
    openModal('resetConfirmModal');
}

function confirmReset() {
    // Clear state
    state.legs = [];
    state.crew = [];
    state.nextLegId = 1;
    state.nextCrewId = 1;
    state.currentEstimateId = null;
    state.currentEstimateName = null;

    // Clear containers
    document.getElementById('flightLegsContainer').innerHTML = '';
    document.getElementById('crewContainer').innerHTML = '';

    // Reset form fields
    document.querySelectorAll('input[type="number"], input[type="text"], textarea').forEach(input => {
        if (input.id === 'fuelPrice' || input.id === 'fuelDensity' ||
            input.id === 'hotelRate' || input.id === 'mealsRate' ||
            input.id === 'maintenancePrograms') {
            // Don't reset defaults
        } else {
            input.value = input.type === 'number' ? '0' : '';
        }
    });

    // Re-initialize
    addInitialLeg();
    addInitialCrew();
    addInitialCrew();
    updateEstimate();

    // Close modal and show success message
    closeModal('resetConfirmModal');
    showToast('Form reset successfully', 'success');
}
