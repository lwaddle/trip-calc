import { writable, derived, get } from 'svelte/store';
import { user } from './auth.js';
import {
  legs, crew, fuelPrice, fuelDensity, hotelRate, mealsRate, maintenanceRate, includeAPU,
  apuBurn, tripDays, hotelStays, otherRate, rentalCar, airfare, mileage,
  consumablesRate, additionalRate, landingFees, catering, handling,
  passengerTransport, facilityFees, specialEventFees, rampParking, customs,
  hangar, otherAirport, tripCoordinationFee, otherMisc, tripNotes
} from './calculator.js';
import { loadEstimates as loadEstimatesFromDb, saveEstimate as saveEstimateToDb, deleteEstimate as deleteEstimateFromDb, updateEstimate as updateEstimateInDb } from '../services/database.js';

// ============================================================================
// Estimates Store
// ============================================================================
// Manages saved estimates (save, load, delete, rename)

// List of user's saved estimates
export const estimates = writable([]);

// Current estimate ID (null if new/unsaved estimate)
export const currentEstimateId = writable(null);

// Current estimate name
export const currentEstimateName = writable('');

// Snapshot of last saved state (for detecting unsaved changes)
const lastSavedState = writable(null);

// ============================================================================
// Derived Stores
// ============================================================================

// Check if there are unsaved changes (tracks ALL calculator fields)
export const hasUnsavedChanges = derived(
  [
    legs, crew, fuelPrice, fuelDensity, hotelRate, mealsRate, maintenanceRate, includeAPU,
    apuBurn, tripDays, hotelStays, otherRate, rentalCar, airfare, mileage,
    consumablesRate, additionalRate, landingFees, catering, handling,
    passengerTransport, facilityFees, specialEventFees, rampParking, customs,
    hangar, otherAirport, tripCoordinationFee, otherMisc, tripNotes,
    lastSavedState, currentEstimateId
  ],
  ([
    $legs, $crew, $fuelPrice, $fuelDensity, $hotelRate, $mealsRate, $maintenanceRate, $includeAPU,
    $apuBurn, $tripDays, $hotelStays, $otherRate, $rentalCar, $airfare, $mileage,
    $consumablesRate, $additionalRate, $landingFees, $catering, $handling,
    $passengerTransport, $facilityFees, $specialEventFees, $rampParking, $customs,
    $hangar, $otherAirport, $tripCoordinationFee, $otherMisc, $tripNotes,
    $lastSavedState, $currentEstimateId
  ]) => {
    // Only track changes if we have a loaded estimate
    if (!$lastSavedState || !$currentEstimateId) return false;

    const currentState = {
      legs: $legs,
      crew: $crew,
      fuelPrice: $fuelPrice,
      fuelDensity: $fuelDensity,
      hotelRate: $hotelRate,
      mealsRate: $mealsRate,
      maintenanceRate: $maintenanceRate,
      includeAPU: $includeAPU,
      apuBurn: $apuBurn,
      tripDays: $tripDays,
      hotelStays: $hotelStays,
      otherRate: $otherRate,
      rentalCar: $rentalCar,
      airfare: $airfare,
      mileage: $mileage,
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
    };

    return JSON.stringify(currentState) !== JSON.stringify($lastSavedState);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load all estimates for the current user
 */
export async function loadEstimates() {
  const currentUser = get(user);
  if (!currentUser) {
    estimates.set([]);
    return { data: [], error: null };
  }

  const { data, error } = await loadEstimatesFromDb();

  if (error) {
    console.error('Error loading estimates:', error);
    return { data: null, error };
  }

  estimates.set(data || []);
  return { data, error: null };
}

/**
 * Create a snapshot of the current calculator state (ALL fields)
 */
function captureCurrentState() {
  return {
    legs: get(legs),
    crew: get(crew),
    fuelPrice: get(fuelPrice),
    fuelDensity: get(fuelDensity),
    hotelRate: get(hotelRate),
    mealsRate: get(mealsRate),
    maintenanceRate: get(maintenanceRate),
    includeAPU: get(includeAPU),
    apuBurn: get(apuBurn),
    tripDays: get(tripDays),
    hotelStays: get(hotelStays),
    otherRate: get(otherRate),
    rentalCar: get(rentalCar),
    airfare: get(airfare),
    mileage: get(mileage),
    consumablesRate: get(consumablesRate),
    additionalRate: get(additionalRate),
    landingFees: get(landingFees),
    catering: get(catering),
    handling: get(handling),
    passengerTransport: get(passengerTransport),
    facilityFees: get(facilityFees),
    specialEventFees: get(specialEventFees),
    rampParking: get(rampParking),
    customs: get(customs),
    hangar: get(hangar),
    otherAirport: get(otherAirport),
    tripCoordinationFee: get(tripCoordinationFee),
    otherMisc: get(otherMisc),
    tripNotes: get(tripNotes)
  };
}

/**
 * Apply an estimate's data to the calculator (ALL fields)
 */
function applyEstimateData(estimateData) {
  legs.set(estimateData.legs || []);
  crew.set(estimateData.crew || []);
  fuelPrice.set(estimateData.fuelPrice !== undefined ? estimateData.fuelPrice : 6.0);
  fuelDensity.set(estimateData.fuelDensity !== undefined ? estimateData.fuelDensity : 6.7);
  hotelRate.set(estimateData.hotelRate !== undefined ? estimateData.hotelRate : 150);
  mealsRate.set(estimateData.mealsRate !== undefined ? estimateData.mealsRate : 75);
  maintenanceRate.set(estimateData.maintenanceRate !== undefined ? estimateData.maintenanceRate : 350);
  includeAPU.set(estimateData.includeAPU !== undefined ? estimateData.includeAPU : false);
  apuBurn.set(estimateData.apuBurn !== undefined ? estimateData.apuBurn : 100);
  tripDays.set(estimateData.tripDays !== undefined ? estimateData.tripDays : 0);
  hotelStays.set(estimateData.hotelStays !== undefined ? estimateData.hotelStays : 0);
  otherRate.set(estimateData.otherRate !== undefined ? estimateData.otherRate : 0);
  rentalCar.set(estimateData.rentalCar !== undefined ? estimateData.rentalCar : 0);
  airfare.set(estimateData.airfare !== undefined ? estimateData.airfare : 0);
  mileage.set(estimateData.mileage !== undefined ? estimateData.mileage : 0);
  consumablesRate.set(estimateData.consumablesRate !== undefined ? estimateData.consumablesRate : 0);
  additionalRate.set(estimateData.additionalRate !== undefined ? estimateData.additionalRate : 0);
  landingFees.set(estimateData.landingFees !== undefined ? estimateData.landingFees : 0);
  catering.set(estimateData.catering !== undefined ? estimateData.catering : 0);
  handling.set(estimateData.handling !== undefined ? estimateData.handling : 0);
  passengerTransport.set(estimateData.passengerTransport !== undefined ? estimateData.passengerTransport : 0);
  facilityFees.set(estimateData.facilityFees !== undefined ? estimateData.facilityFees : 0);
  specialEventFees.set(estimateData.specialEventFees !== undefined ? estimateData.specialEventFees : 0);
  rampParking.set(estimateData.rampParking !== undefined ? estimateData.rampParking : 0);
  customs.set(estimateData.customs !== undefined ? estimateData.customs : 0);
  hangar.set(estimateData.hangar !== undefined ? estimateData.hangar : 0);
  otherAirport.set(estimateData.otherAirport !== undefined ? estimateData.otherAirport : 0);
  tripCoordinationFee.set(estimateData.tripCoordinationFee !== undefined ? estimateData.tripCoordinationFee : 0);
  otherMisc.set(estimateData.otherMisc !== undefined ? estimateData.otherMisc : 0);
  tripNotes.set(estimateData.tripNotes !== undefined ? estimateData.tripNotes : '');
}

/**
 * Save a new estimate or update existing one
 */
export async function saveEstimate(name, totalCost) {
  const currentUser = get(user);
  if (!currentUser) {
    return { data: null, error: 'Must be signed in to save estimates' };
  }

  const estimateData = {
    ...captureCurrentState(),
    totalCost
  };
  const estimateId = get(currentEstimateId);

  let result;
  if (estimateId) {
    // Update existing estimate
    result = await updateEstimateInDb(estimateId, name, estimateData);
    result = { data: { id: estimateId }, error: result.error };
  } else {
    // Create new estimate
    result = await saveEstimateToDb(name, estimateData);

    if (result.data) {
      currentEstimateId.set(result.data.id);
    }
  }

  if (!result.error) {
    currentEstimateName.set(name);
    lastSavedState.set(captureCurrentState());
    await loadEstimates(); // Refresh the list
  }

  return result;
}

/**
 * Load an estimate into the calculator
 */
export async function loadEstimate(estimate) {
  currentEstimateId.set(estimate.id);
  currentEstimateName.set(estimate.name);

  // The database stores estimate data in the estimate_data field
  const data = estimate.estimate_data || estimate;

  const estimateData = {
    legs: data.legs || [],
    crew: data.crew || [],
    fuelPrice: data.fuelPrice || 6.0,
    fuelDensity: data.fuelDensity || 6.7,
    hotelRate: data.hotelRate || 150,
    mealsRate: data.mealsRate || 75,
    maintenanceRate: data.maintenanceRate || 350,
    includeAPU: data.includeAPU || false
  };

  applyEstimateData(estimateData);
  lastSavedState.set(estimateData);
}

/**
 * Delete an estimate
 */
export async function deleteEstimate(estimateId) {
  const result = await deleteEstimateFromDb(estimateId);

  if (!result.error) {
    // If we deleted the currently loaded estimate, clear it
    if (get(currentEstimateId) === estimateId) {
      clearCurrentEstimate();
    }
    await loadEstimates(); // Refresh the list
  }

  return result;
}

/**
 * Rename the current estimate
 */
export async function renameEstimate(newName) {
  const estimateId = get(currentEstimateId);
  if (!estimateId) {
    return { data: null, error: 'No estimate loaded to rename' };
  }

  // Get the current estimate data to pass to update
  const currentState = {
    ...captureCurrentState(),
    totalCost: get(estimates).find(e => e.id === estimateId)?.estimate_data?.totalCost || 0
  };

  const result = await updateEstimateInDb(estimateId, newName, currentState);

  if (!result.error) {
    currentEstimateName.set(newName);
    await loadEstimates(); // Refresh the list
  }

  return result;
}

/**
 * Start a new estimate (clear calculator)
 */
export function newEstimate() {
  clearCurrentEstimate();
  legs.set([]);
  crew.set([]);
  fuelPrice.set(6.0);
  fuelDensity.set(6.7);
  hotelRate.set(150);
  mealsRate.set(75);
  maintenanceRate.set(350);
  includeAPU.set(false);
}

/**
 * Clear current estimate metadata (but don't clear calculator)
 */
export function clearCurrentEstimate() {
  currentEstimateId.set(null);
  currentEstimateName.set('');
  lastSavedState.set(null);
}

/**
 * Discard unsaved changes and reload last saved state
 */
export function discardChanges() {
  const saved = get(lastSavedState);
  if (saved) {
    applyEstimateData(saved);
  }
}

/**
 * Initialize estimates when user signs in
 */
export function initEstimates() {
  const currentUser = get(user);
  if (currentUser) {
    loadEstimates();
  } else {
    estimates.set([]);
    clearCurrentEstimate();
  }
}
