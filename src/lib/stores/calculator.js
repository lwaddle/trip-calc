import { writable, derived } from 'svelte/store';
import { calculateEstimate } from '$lib/utils/calculations';

// ===========================
// Writable Stores (Mutable State)
// ===========================

// Flight legs
export const legs = writable([]);

// Crew members
export const crew = writable([]);

// Settings
export const fuelPrice = writable(6.00);
export const fuelDensity = writable(6.7);
export const includeAPU = writable(false);
export const apuBurn = writable(100); // Set by selected profile

// Trip details
export const tripDays = writable(0);
export const hotelStays = writable(0);
export const hotelRate = writable(0);
export const mealsRate = writable(0);
export const otherRate = writable(0);
export const rentalCar = writable(0);
export const airfare = writable(0);
export const mileage = writable(0);

// Hourly programs
export const maintenanceRate = writable(0);
export const consumablesRate = writable(0);
export const additionalRate = writable(0);

// Airport & Ground fees
export const landingFees = writable(0);
export const catering = writable(0);
export const handling = writable(0);
export const passengerTransport = writable(0);
export const facilityFees = writable(0);
export const specialEventFees = writable(0);
export const rampParking = writable(0);
export const customs = writable(0);
export const hangar = writable(0);
export const otherAirport = writable(0);

// Miscellaneous
export const tripCoordinationFee = writable(0);
export const otherMisc = writable(0);
export const tripNotes = writable('');

// ===========================
// Derived Stores (Computed Values)
// ===========================

/**
 * Automatically calculate estimate whenever any input changes
 * This is the magic of Svelte reactivity!
 */
export const estimate = derived(
    [
        legs, crew, fuelDensity, fuelPrice, includeAPU, apuBurn,
        tripDays, hotelStays, hotelRate, mealsRate, otherRate,
        rentalCar, airfare, mileage,
        maintenanceRate, consumablesRate, additionalRate,
        landingFees, catering, handling, passengerTransport,
        facilityFees, specialEventFees, rampParking, customs,
        hangar, otherAirport,
        tripCoordinationFee, otherMisc, tripNotes
    ],
    ([
        $legs, $crew, $fuelDensity, $fuelPrice, $includeAPU, $apuBurn,
        $tripDays, $hotelStays, $hotelRate, $mealsRate, $otherRate,
        $rentalCar, $airfare, $mileage,
        $maintenanceRate, $consumablesRate, $additionalRate,
        $landingFees, $catering, $handling, $passengerTransport,
        $facilityFees, $specialEventFees, $rampParking, $customs,
        $hangar, $otherAirport,
        $tripCoordinationFee, $otherMisc, $tripNotes
    ]) => {
        return calculateEstimate({
            legs: $legs,
            crew: $crew,
            fuelDensity: $fuelDensity,
            fuelPrice: $fuelPrice,
            includeAPU: $includeAPU,
            apuBurn: $apuBurn,
            tripDays: $tripDays,
            hotelStays: $hotelStays,
            hotelRate: $hotelRate,
            mealsRate: $mealsRate,
            otherRate: $otherRate,
            rentalCar: $rentalCar,
            airfare: $airfare,
            mileage: $mileage,
            maintenanceRate: $maintenanceRate,
            consumablesRate: $consumablesRate,
            additionalRate: $additionalRate,
            landingFees: $landingFees,
            catering: $catering,
            handling: $handling,
            passengerTransport: $passengerTransport,
            facilityFees: $facilityFees,
            specialEventFees: $specialEventFees,
            rampParking: $rampParking,
            customs: $customs,
            hangar: $hangar,
            otherAirport: $otherAirport,
            tripCoordinationFee: $tripCoordinationFee,
            otherMisc: $otherMisc,
            tripNotes: $tripNotes
        });
    }
);

// ===========================
// Helper Functions for Managing State
// ===========================

let nextLegId = 1;
let nextCrewId = 1;

/**
 * Add a new flight leg
 * @param {Object} leg - Leg data (optional, creates empty leg if not provided)
 */
export function addLeg(leg = {}) {
    legs.update(l => [...l, {
        id: nextLegId++,
        from: leg.from || '',
        to: leg.to || '',
        hours: leg.hours || 0,
        minutes: leg.minutes || 0,
        fuelBurn: leg.fuelBurn || 0,
        distance: leg.distance || 0,
        groundHours: leg.groundHours || 0,
        groundMinutes: leg.groundMinutes || 0
    }]);
}

/**
 * Update a specific field in a leg
 * @param {number} id - Leg ID
 * @param {string} field - Field name to update
 * @param {any} value - New value
 */
export function updateLeg(id, field, value) {
    legs.update(l => l.map(leg =>
        leg.id === id ? { ...leg, [field]: value } : leg
    ));
}

/**
 * Remove a leg by ID
 * @param {number} id - Leg ID
 */
export function removeLeg(id) {
    legs.update(l => l.filter(leg => leg.id !== id));
}

/**
 * Clear all legs
 */
export function clearLegs() {
    legs.set([]);
    nextLegId = 1;
}

/**
 * Add a new crew member
 * @param {string} role - Crew role (e.g., "Pilot", "Flight Attendant")
 * @param {number} rate - Daily rate
 */
export function addCrew(role = 'Pilot', rate = 0) {
    crew.update(c => [...c, {
        id: nextCrewId++,
        role,
        rate
    }]);
}

/**
 * Update a specific field in a crew member
 * @param {number} id - Crew ID
 * @param {string} field - Field name to update
 * @param {any} value - New value
 */
export function updateCrew(id, field, value) {
    crew.update(c => c.map(member =>
        member.id === id ? { ...member, [field]: value } : member
    ));
}

/**
 * Remove a crew member by ID
 * @param {number} id - Crew ID
 */
export function removeCrew(id) {
    crew.update(c => c.filter(member => member.id !== id));
}

/**
 * Clear all crew members
 */
export function clearCrew() {
    crew.set([]);
    nextCrewId = 1;
}

/**
 * Reset all calculator inputs to default values
 */
export function resetCalculator() {
    clearLegs();
    clearCrew();

    // Reset all settings to defaults
    fuelPrice.set(6.00);
    fuelDensity.set(6.7);
    includeAPU.set(false);
    apuBurn.set(100);

    tripDays.set(0);
    hotelStays.set(0);
    hotelRate.set(0);
    mealsRate.set(0);
    otherRate.set(0);
    rentalCar.set(0);
    airfare.set(0);
    mileage.set(0);

    maintenanceRate.set(0);
    consumablesRate.set(0);
    additionalRate.set(0);

    landingFees.set(0);
    catering.set(0);
    handling.set(0);
    passengerTransport.set(0);
    facilityFees.set(0);
    specialEventFees.set(0);
    rampParking.set(0);
    customs.set(0);
    hangar.set(0);
    otherAirport.set(0);

    tripCoordinationFee.set(0);
    otherMisc.set(0);
    tripNotes.set('');
}

/**
 * Load calculator state from saved estimate data
 * @param {Object} data - Saved estimate data
 */
export function loadCalculatorState(data) {
    // Load legs
    if (data.legs && Array.isArray(data.legs)) {
        legs.set(data.legs.map((leg, index) => ({
            id: index + 1,
            ...leg
        })));
        nextLegId = data.legs.length + 1;
    }

    // Load crew
    if (data.crew && Array.isArray(data.crew)) {
        crew.set(data.crew.map((member, index) => ({
            id: index + 1,
            ...member
        })));
        nextCrewId = data.crew.length + 1;
    }

    // Load all other settings
    if (data.fuelPrice !== undefined) fuelPrice.set(data.fuelPrice);
    if (data.fuelDensity !== undefined) fuelDensity.set(data.fuelDensity);
    if (data.includeAPU !== undefined) includeAPU.set(data.includeAPU);
    if (data.apuBurn !== undefined) apuBurn.set(data.apuBurn);

    if (data.tripDays !== undefined) tripDays.set(data.tripDays);
    if (data.hotelStays !== undefined) hotelStays.set(data.hotelStays);
    if (data.hotelRate !== undefined) hotelRate.set(data.hotelRate);
    if (data.mealsRate !== undefined) mealsRate.set(data.mealsRate);
    if (data.otherRate !== undefined) otherRate.set(data.otherRate);
    if (data.rentalCar !== undefined) rentalCar.set(data.rentalCar);
    if (data.airfare !== undefined) airfare.set(data.airfare);
    if (data.mileage !== undefined) mileage.set(data.mileage);

    if (data.maintenanceRate !== undefined) maintenanceRate.set(data.maintenanceRate);
    if (data.consumablesRate !== undefined) consumablesRate.set(data.consumablesRate);
    if (data.additionalRate !== undefined) additionalRate.set(data.additionalRate);

    if (data.landingFees !== undefined) landingFees.set(data.landingFees);
    if (data.catering !== undefined) catering.set(data.catering);
    if (data.handling !== undefined) handling.set(data.handling);
    if (data.passengerTransport !== undefined) passengerTransport.set(data.passengerTransport);
    if (data.facilityFees !== undefined) facilityFees.set(data.facilityFees);
    if (data.specialEventFees !== undefined) specialEventFees.set(data.specialEventFees);
    if (data.rampParking !== undefined) rampParking.set(data.rampParking);
    if (data.customs !== undefined) customs.set(data.customs);
    if (data.hangar !== undefined) hangar.set(data.hangar);
    if (data.otherAirport !== undefined) otherAirport.set(data.otherAirport);

    if (data.tripCoordinationFee !== undefined) tripCoordinationFee.set(data.tripCoordinationFee);
    if (data.otherMisc !== undefined) otherMisc.set(data.otherMisc);
    if (data.tripNotes !== undefined) tripNotes.set(data.tripNotes);
}

/**
 * Get current calculator state for saving
 * @returns {Object} Current calculator state
 */
export function getCalculatorState() {
    let state = {};

    // Subscribe to get current values (will auto-unsubscribe)
    const unsubscribers = [];

    unsubscribers.push(legs.subscribe(v => state.legs = v)());
    unsubscribers.push(crew.subscribe(v => state.crew = v)());
    unsubscribers.push(fuelPrice.subscribe(v => state.fuelPrice = v)());
    unsubscribers.push(fuelDensity.subscribe(v => state.fuelDensity = v)());
    unsubscribers.push(includeAPU.subscribe(v => state.includeAPU = v)());
    unsubscribers.push(apuBurn.subscribe(v => state.apuBurn = v)());
    unsubscribers.push(tripDays.subscribe(v => state.tripDays = v)());
    unsubscribers.push(hotelStays.subscribe(v => state.hotelStays = v)());
    unsubscribers.push(hotelRate.subscribe(v => state.hotelRate = v)());
    unsubscribers.push(mealsRate.subscribe(v => state.mealsRate = v)());
    unsubscribers.push(otherRate.subscribe(v => state.otherRate = v)());
    unsubscribers.push(rentalCar.subscribe(v => state.rentalCar = v)());
    unsubscribers.push(airfare.subscribe(v => state.airfare = v)());
    unsubscribers.push(mileage.subscribe(v => state.mileage = v)());
    unsubscribers.push(maintenanceRate.subscribe(v => state.maintenanceRate = v)());
    unsubscribers.push(consumablesRate.subscribe(v => state.consumablesRate = v)());
    unsubscribers.push(additionalRate.subscribe(v => state.additionalRate = v)());
    unsubscribers.push(landingFees.subscribe(v => state.landingFees = v)());
    unsubscribers.push(catering.subscribe(v => state.catering = v)());
    unsubscribers.push(handling.subscribe(v => state.handling = v)());
    unsubscribers.push(passengerTransport.subscribe(v => state.passengerTransport = v)());
    unsubscribers.push(facilityFees.subscribe(v => state.facilityFees = v)());
    unsubscribers.push(specialEventFees.subscribe(v => state.specialEventFees = v)());
    unsubscribers.push(rampParking.subscribe(v => state.rampParking = v)());
    unsubscribers.push(customs.subscribe(v => state.customs = v)());
    unsubscribers.push(hangar.subscribe(v => state.hangar = v)());
    unsubscribers.push(otherAirport.subscribe(v => state.otherAirport = v)());
    unsubscribers.push(tripCoordinationFee.subscribe(v => state.tripCoordinationFee = v)());
    unsubscribers.push(otherMisc.subscribe(v => state.otherMisc = v)());
    unsubscribers.push(tripNotes.subscribe(v => state.tripNotes = v)());

    return state;
}
