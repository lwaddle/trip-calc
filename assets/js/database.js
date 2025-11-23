/**
 * Database Module
 * Handles all Supabase database operations for user defaults and estimates
 */

import { supabase } from './supabase.js';
import { getUserId, getUserEmail } from './auth.js';

// ============================================================================
// USER DEFAULTS
// ============================================================================

/**
 * Load user defaults from Supabase
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function loadUserDefaults() {
  try {
    const userId = getUserId();
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('user_defaults')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Save user defaults to Supabase
 * @param {object} defaults - User defaults object
 * @returns {Promise<{error: Error | null}>}
 */
export async function saveUserDefaults(defaults) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { error: new Error('User not authenticated') };
    }

    // Upsert (insert or update) defaults
    const { error } = await supabase
      .from('user_defaults')
      .upsert({
        user_id: userId,
        fuel_price: parseFloat(defaults.fuelPrice),
        fuel_density: parseFloat(defaults.fuelDensity),
        pilot_rate: parseFloat(defaults.pilotRate),
        attendant_rate: parseFloat(defaults.attendantRate),
        hotel_rate: parseFloat(defaults.hotelRate),
        meals_rate: parseFloat(defaults.mealsRate),
        maintenance_rate: parseFloat(defaults.maintenanceRate),
        apu_burn: parseFloat(defaults.apuBurn),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

// ============================================================================
// ESTIMATES
// ============================================================================

/**
 * Save estimate to Supabase
 * @param {string} name - Estimate name
 * @param {object} estimateData - Complete estimate data
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function saveEstimate(name, estimateData) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const userEmail = getUserEmail();

    const { data, error } = await supabase
      .from('estimates')
      .insert({
        user_id: userId,
        name,
        estimate_data: estimateData,
        creator_email: userEmail
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Load all estimates for current user from Supabase
 * @returns {Promise<{data: Array | null, error: Error | null}>}
 */
export async function loadEstimates() {
  try {
    const userId = getUserId();
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Load a single estimate by ID
 * @param {string} estimateId - UUID of the estimate
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function loadEstimate(estimateId) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update an existing estimate
 * @param {string} estimateId - UUID of the estimate
 * @param {string} name - Estimate name
 * @param {object} estimateData - Complete estimate data
 * @returns {Promise<{error: Error | null}>}
 */
export async function updateEstimate(estimateId, name, estimateData) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('estimates')
      .update({
        name,
        estimate_data: estimateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', estimateId)
      .eq('user_id', userId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Delete an estimate
 * @param {string} estimateId - UUID of the estimate
 * @returns {Promise<{error: Error | null}>}
 */
export async function deleteEstimate(estimateId) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('estimates')
      .delete()
      .eq('id', estimateId)
      .eq('user_id', userId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

// ============================================================================
// ESTIMATE SHARING
// ============================================================================

/**
 * Create a share link for an estimate
 * @param {string} estimateId - UUID of the estimate
 * @param {string} estimateName - Name of the estimate (cached for display)
 * @returns {Promise<{shareToken: string | null, error: Error | null}>}
 */
export async function createEstimateShare(estimateId, estimateName) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { shareToken: null, error: new Error('User not authenticated') };
    }

    // Check if share already exists
    const { data: existingShare } = await supabase
      .from('estimate_shares')
      .select('share_token')
      .eq('estimate_id', estimateId)
      .eq('user_id', userId)
      .single();

    if (existingShare) {
      return { shareToken: existingShare.share_token, error: null };
    }

    // Create new share
    const { data, error } = await supabase
      .from('estimate_shares')
      .insert({
        estimate_id: estimateId,
        user_id: userId,
        share_name: estimateName
      })
      .select('share_token')
      .single();

    if (error) {
      return { shareToken: null, error };
    }

    return { shareToken: data.share_token, error: null };
  } catch (error) {
    return { shareToken: null, error };
  }
}

/**
 * Load an estimate by share token (public access)
 * @param {string} shareToken - UUID share token
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function loadSharedEstimate(shareToken) {
  try {
    // Get the estimate via the share
    const { data: shareData, error: shareError } = await supabase
      .from('estimate_shares')
      .select(`
        estimate_id,
        share_name,
        estimates (
          id,
          name,
          estimate_data,
          created_at,
          updated_at,
          user_id,
          creator_email
        )
      `)
      .eq('share_token', shareToken)
      .single();

    if (shareError) {
      return { data: null, error: shareError };
    }

    if (!shareData || !shareData.estimates) {
      return { data: null, error: new Error('Shared estimate not found') };
    }

    const estimate = shareData.estimates;

    // Try to fetch the creator's email using Supabase auth admin
    // Note: This requires the user_id to email mapping
    // Since we can't query auth.users directly due to RLS,
    // we'll use the RPC function or store email in estimates table
    // For now, we'll rely on the email being available through other means

    return { data: estimate, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Copy a shared estimate to the current user's account
 * @param {string} shareToken - UUID share token
 * @param {string} newName - Optional new name for the copied estimate
 * @returns {Promise<{data: object | null, error: Error | null}>}
 */
export async function copySharedEstimate(shareToken, newName = null) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Load the shared estimate
    const { data: sharedEstimate, error: loadError } = await loadSharedEstimate(shareToken);

    if (loadError || !sharedEstimate) {
      return { data: null, error: loadError || new Error('Failed to load shared estimate') };
    }

    // Create a copy in the current user's account
    const estimateName = newName || `${sharedEstimate.name} (Copy)`;
    const { data, error } = await saveEstimate(estimateName, sharedEstimate.estimate_data);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Delete a share link
 * @param {string} estimateId - UUID of the estimate
 * @returns {Promise<{error: Error | null}>}
 */
export async function deleteEstimateShare(estimateId) {
  try {
    const userId = getUserId();
    if (!userId) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('estimate_shares')
      .delete()
      .eq('estimate_id', estimateId)
      .eq('user_id', userId);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}
