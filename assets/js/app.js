// ===========================
// Imports
// ===========================
import { initAuth, signIn, signOut, resetPassword, onAuthStateChange, isAuthenticated, getUserEmail } from './auth.js';
import { loadUserDefaults, saveUserDefaults, loadEstimates, saveEstimate, deleteEstimate, createEstimateShare, loadSharedEstimate, copySharedEstimate } from './database.js';

// ===========================
// App State
// ===========================
const state = {
    legs: [],
    crew: [],
    nextLegId: 1,
    nextCrewId: 1
};

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
    const isAuth = user !== null;

    // Menu items
    const menuUser = document.getElementById('menuUser');
    const menuSignIn = document.getElementById('menuSignIn');
    const menuEstimates = document.getElementById('menuEstimates');
    const menuSignOut = document.getElementById('menuSignOut');

    // Footer buttons
    const saveEstimateButton = document.getElementById('saveEstimateButton');
    const loadEstimateButton = document.getElementById('loadEstimateButton');

    if (isAuth) {
        // Show authenticated UI
        menuUser.textContent = getUserEmail();
        menuUser.style.display = 'block';
        menuSignIn.style.display = 'none';
        menuEstimates.style.display = 'block';
        menuSignOut.style.display = 'block';

        // Show save/load buttons
        if (saveEstimateButton) saveEstimateButton.style.display = 'inline-block';
        if (loadEstimateButton) loadEstimateButton.style.display = 'inline-block';
    } else {
        // Show anonymous UI
        menuUser.style.display = 'none';
        menuSignIn.style.display = 'block';
        menuEstimates.style.display = 'none';
        menuSignOut.style.display = 'none';

        // Hide save/load buttons for anonymous users
        if (saveEstimateButton) saveEstimateButton.style.display = 'none';
        if (loadEstimateButton) loadEstimateButton.style.display = 'none';
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

    // Set up auth state listener
    onAuthStateChange((user) => {
        updateUIForAuthState(user);
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
        attendantRate: 1200,
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
        attendantRate: parseFloat(document.getElementById('defaultAttendantRate').value) || 1200,
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
}

// ===========================
// Event Listeners
// ===========================
function attachEventListeners() {
    // Menu
    document.getElementById('menuButton').addEventListener('click', toggleMenu);
    document.getElementById('menuSignIn').addEventListener('click', () => openModal('signInModal'));
    document.getElementById('menuEstimates').addEventListener('click', () => openModal('loadEstimateModal'));
    document.getElementById('menuDefaults').addEventListener('click', () => openModal('defaultsModal'));
    document.getElementById('menuSignOut').addEventListener('click', handleSignOut);

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
    document.getElementById('copyButton').addEventListener('click', copyToClipboard);
    document.getElementById('exportPdfButton').addEventListener('click', exportToPDF);
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

    // Save estimate modal
    document.getElementById('closeSaveEstimateModal').addEventListener('click', () => closeModal('saveEstimateModal'));
    document.getElementById('cancelSaveEstimateButton').addEventListener('click', () => closeModal('saveEstimateModal'));
    document.getElementById('saveEstimateForm').addEventListener('submit', confirmSaveEstimate);

    // Share estimate modal
    document.getElementById('closeShareEstimateModal').addEventListener('click', () => closeModal('shareEstimateModal'));
    document.getElementById('closeShareModalButton').addEventListener('click', () => closeModal('shareEstimateModal'));
    document.getElementById('copyShareLinkButton').addEventListener('click', copyShareLink);

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const menu = document.getElementById('dropdownMenu');
        const button = document.getElementById('menuButton');
        if (!menu.contains(e.target) && !button.contains(e.target)) {
            menu.classList.remove('active');
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
    menu.classList.toggle('active');
}

function openModal(modalId) {
    if (modalId === 'loadEstimateModal') {
        populateLoadEstimateModal();
    }
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
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
                <input type="number" step="0.01" min="0" value="${crew.rate}" oninput="updateCrewField(${crew.id}, 'rate', this.value)">
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

    let output = 'LEGS SUMMARY\n';

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
            output += `  Hotel: $${formatCurrency(estimate.hotelTotal)} (${estimate.crewCount} crew � ${estimate.hotelStays} night(s) � $${formatCurrency(estimate.hotelRate)})\n`;
        }
        if (estimate.mealsTotal > 0) {
            output += `  Meals: $${formatCurrency(estimate.mealsTotal)} (${estimate.crewCount} crew � ${estimate.tripDays} day(s) � $${formatCurrency(estimate.mealsRate)})\n`;
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
// PDF Export
// ===========================
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const estimateText = document.getElementById('tripEstimate').textContent;
    const lines = doc.splitTextToSize(estimateText, 180);

    doc.setFont('courier');
    doc.setFontSize(10);
    doc.text(lines, 15, 15);

    const now = new Date();
    const filename = `trip-estimate-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;

    doc.save(filename);
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

    // Clear previous values and errors
    document.getElementById('estimateName').value = '';
    document.getElementById('saveEstimateError').style.display = 'none';

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

    // Save to Supabase
    const { data, error } = await saveEstimate(name, estimateData);

    if (error) {
        errorDiv.textContent = 'Failed to save: ' + error.message;
        errorDiv.style.display = 'block';
        return;
    }

    // Success!
    closeModal('saveEstimateModal');
    showToast('Estimate saved successfully!', 'success');
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
    if (!confirm('Are you sure you want to reset the form? This will clear all data.')) return;

    // Clear state
    state.legs = [];
    state.crew = [];
    state.nextLegId = 1;
    state.nextCrewId = 1;

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
}
