/**
 * Profiles Store
 * Manages user profiles and standard profiles
 */

import { writable, derived, get } from 'svelte/store';
import { STANDARD_PROFILES, DEFAULT_PROFILE_ID } from '$lib/utils/constants.js';
import { getUserProfiles, createProfile, updateProfile, deleteProfile, setDefaultProfile } from '$lib/services/database.js';
import { isAuthenticated } from './auth.js';
import { fuelPrice, fuelDensity, hotelRate, mealsRate, maintenanceRate, apuBurn, crew, clearCrew, addCrew } from './calculator.js';

// ============================================================================
// Stores
// ============================================================================

// User's custom profiles (from database)
export const userProfiles = writable([]);

// Currently selected profile ID
export const selectedProfileId = writable(DEFAULT_PROFILE_ID);

// All available profiles (standard + user custom)
export const allProfiles = derived(
  [userProfiles],
  ([$userProfiles]) => {
    // Combine standard profiles with user profiles
    return [...STANDARD_PROFILES, ...$userProfiles];
  }
);

// Currently selected profile object
export const selectedProfile = derived(
  [allProfiles, selectedProfileId],
  ([$allProfiles, $selectedProfileId]) => {
    return $allProfiles.find(p => p.id === $selectedProfileId) || STANDARD_PROFILES.find(p => p.id === DEFAULT_PROFILE_ID);
  }
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load user profiles from database
 * Called when user signs in
 */
export async function loadUserProfiles() {
  if (!get(isAuthenticated)) {
    userProfiles.set([]);
    return { error: null };
  }

  const { data, error } = await getUserProfiles();

  if (error) {
    console.error('Error loading profiles:', error);
    return { error };
  }

  // Transform database format to app format
  const profiles = (data || []).map(transformDatabaseProfile);
  userProfiles.set(profiles);

  // Check if there's a default profile
  const defaultProfile = profiles.find(p => p.isDefault);
  if (defaultProfile) {
    selectProfile(defaultProfile.id);
  }

  return { error: null };
}

/**
 * Select a profile and apply its settings to the calculator
 * @param {string} profileId - Profile ID to select
 */
export function selectProfile(profileId) {
  const profiles = get(allProfiles);
  const profile = profiles.find(p => p.id === profileId);

  if (!profile) {
    console.error('Profile not found:', profileId);
    return;
  }

  selectedProfileId.set(profileId);
  applyProfileToCalculator(profile);
}

/**
 * Apply profile settings to the calculator stores
 * @param {object} profile - Profile object
 */
export function applyProfileToCalculator(profile) {
  // Update calculator settings
  fuelPrice.set(profile.fuelPrice || 6.00);
  fuelDensity.set(profile.fuelDensity || 6.7);
  hotelRate.set(profile.hotelRate || 0);
  mealsRate.set(profile.mealsRate || 0);
  maintenanceRate.set(profile.maintenanceRate || 0);
  apuBurn.set(profile.apuBurn || 0);

  // Update crew based on profile
  clearCrew();

  // Add pilots
  const pilotsRequired = profile.pilotsRequired || 0;
  const pilotRate = profile.pilotRate || 0;
  for (let i = 0; i < pilotsRequired; i++) {
    addCrew('Pilot', pilotRate);
  }

  // Add flight attendants
  const attendantsRequired = profile.attendantsRequired || 0;
  const attendantRate = profile.attendantRate || 0;
  for (let i = 0; i < attendantsRequired; i++) {
    addCrew('Flight Attendant', attendantRate);
  }
}

/**
 * Create a new profile
 * @param {object} profileData - Profile data
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function saveProfile(profileData) {
  if (!get(isAuthenticated)) {
    return { data: null, error: new Error('Must be signed in to create profiles') };
  }

  const { data, error } = await createProfile(profileData);

  if (error) {
    console.error('Error creating profile:', error);
    return { data: null, error };
  }

  // Transform and add to store
  const newProfile = transformDatabaseProfile(data);
  userProfiles.update(profiles => [...profiles, newProfile]);

  // If it was set as default, apply it
  if (newProfile.isDefault) {
    selectProfile(newProfile.id);
  }

  return { data: newProfile, error: null };
}

/**
 * Update an existing profile
 * @param {string} profileId - Profile ID
 * @param {object} profileData - Updated profile data
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function editProfile(profileId, profileData) {
  if (!get(isAuthenticated)) {
    return { data: null, error: new Error('Must be signed in to edit profiles') };
  }

  const { data, error } = await updateProfile(profileId, profileData);

  if (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }

  // Transform and update in store
  const updatedProfile = transformDatabaseProfile(data);
  userProfiles.update(profiles =>
    profiles.map(p => p.id === profileId ? updatedProfile :
      // If this profile became default, unset others
      updatedProfile.isDefault ? { ...p, isDefault: false } : p
    )
  );

  // If it's the selected profile or became default, re-apply it
  if (get(selectedProfileId) === profileId || updatedProfile.isDefault) {
    selectProfile(profileId);
  }

  return { data: updatedProfile, error: null };
}

/**
 * Delete a profile
 * @param {string} profileId - Profile ID to delete
 * @returns {Promise<{error: Error | null}>}
 */
export async function removeProfile(profileId) {
  if (!get(isAuthenticated)) {
    return { error: new Error('Must be signed in to delete profiles') };
  }

  const { error, wasDefault } = await deleteProfile(profileId);

  if (error) {
    console.error('Error deleting profile:', error);
    return { error };
  }

  // Remove from store
  userProfiles.update(profiles => profiles.filter(p => p.id !== profileId));

  // If this was the selected profile, switch to default
  if (get(selectedProfileId) === profileId) {
    selectProfile(DEFAULT_PROFILE_ID);
  }

  return { error: null };
}

/**
 * Set a profile as default
 * @param {string} profileId - Profile ID
 * @returns {Promise<{error: Error | null}>}
 */
export async function makeDefaultProfile(profileId) {
  if (!get(isAuthenticated)) {
    return { error: new Error('Must be signed in to set default profile') };
  }

  const { error } = await setDefaultProfile(profileId);

  if (error) {
    console.error('Error setting default profile:', error);
    return { error };
  }

  // Update store - unset all defaults, then set the new one
  userProfiles.update(profiles =>
    profiles.map(p => ({
      ...p,
      isDefault: p.id === profileId
    }))
  );

  selectProfile(profileId);

  return { error: null };
}

/**
 * Duplicate a profile
 * @param {string} profileId - Profile ID to duplicate
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function duplicateProfile(profileId) {
  const profiles = get(allProfiles);
  const profile = profiles.find(p => p.id === profileId);

  if (!profile) {
    return { data: null, error: new Error('Profile not found') };
  }

  // Create a copy with a new name
  const newProfileData = {
    ...profile,
    name: `${profile.name} (Copy)`,
    isDefault: false,
    profileImageUrl: profile.profileImageUrl || null
  };

  // Remove the id so it gets a new one
  delete newProfileData.id;
  delete newProfileData.isStandard;

  return await saveProfile(newProfileData);
}

/**
 * Export profile to JSON
 * @param {string} profileId - Profile ID to export
 * @returns {string | null} JSON string
 */
export function exportProfileToJSON(profileId) {
  const profiles = get(allProfiles);
  const profile = profiles.find(p => p.id === profileId);

  if (!profile) {
    return null;
  }

  // Create export object without internal fields
  const exportData = {
    name: profile.name,
    fuelPrice: profile.fuelPrice,
    fuelDensity: profile.fuelDensity,
    pilotsRequired: profile.pilotsRequired,
    pilotRate: profile.pilotRate,
    attendantsRequired: profile.attendantsRequired,
    attendantRate: profile.attendantRate,
    hotelRate: profile.hotelRate,
    mealsRate: profile.mealsRate,
    maintenanceRate: profile.maintenanceRate,
    apuBurn: profile.apuBurn
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import profile from JSON
 * @param {string} jsonString - JSON string
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function importProfileFromJSON(jsonString) {
  try {
    const profileData = JSON.parse(jsonString);

    // Validate required fields
    if (!profileData.name) {
      return { data: null, error: new Error('Profile must have a name') };
    }

    // Save the imported profile
    return await saveProfile(profileData);
  } catch (error) {
    console.error('Error importing profile:', error);
    return { data: null, error: new Error('Invalid profile JSON') };
  }
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform database profile format to app format
 * @param {object} dbProfile - Database profile object
 * @returns {object} App profile object
 */
function transformDatabaseProfile(dbProfile) {
  return {
    id: dbProfile.id,
    name: dbProfile.name,
    fuelPrice: parseFloat(dbProfile.fuel_price) || 0,
    fuelDensity: parseFloat(dbProfile.fuel_density) || 6.7,
    pilotsRequired: parseInt(dbProfile.pilots_required) || 0,
    pilotRate: parseFloat(dbProfile.pilot_rate) || 0,
    attendantsRequired: parseInt(dbProfile.attendants_required) || 0,
    attendantRate: parseFloat(dbProfile.attendant_rate) || 0,
    hotelRate: parseFloat(dbProfile.hotel_rate) || 0,
    mealsRate: parseFloat(dbProfile.meals_rate) || 0,
    maintenanceRate: parseFloat(dbProfile.maintenance_rate) || 0,
    apuBurn: parseInt(dbProfile.apu_burn) || 0,
    profileImageUrl: dbProfile.profile_image_url || null,
    isDefault: dbProfile.is_default || false,
    isStandard: false
  };
}
