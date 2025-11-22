/**
 * Authentication Module
 * Handles user authentication, session management, and auth state
 */

import { supabase } from './supabase.js';

/**
 * Current user state
 * @type {import('@supabase/supabase-js').User | null}
 */
let currentUser = null;

/**
 * Auth state change callbacks
 * @type {Array<Function>}
 */
const authStateCallbacks = [];

/**
 * Initialize authentication
 * Sets up auth state listener and checks for existing session
 */
export async function initAuth() {
  try {
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    if (session) {
      currentUser = session.user;
      notifyAuthStateChange(currentUser);
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (session) {
        currentUser = session.user;
      } else {
        currentUser = null;
      }

      notifyAuthStateChange(currentUser, event);
    });

    return currentUser;
  } catch (error) {
    console.error('Error initializing auth:', error);
    return null;
  }
}

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: import('@supabase/supabase-js').User | null, error: Error | null}>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { user: null, error };
    }

    currentUser = data.user;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error | null}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    currentUser = null;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<{error: Error | null}>}
 */
export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Update user password (called after clicking reset link)
 * @param {string} newPassword
 * @returns {Promise<{error: Error | null}>}
 */
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Get the current user
 * @returns {import('@supabase/supabase-js').User | null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Register a callback for auth state changes
 * @param {Function} callback - Called with user object (or null if signed out) and event type
 */
export function onAuthStateChange(callback) {
  authStateCallbacks.push(callback);
}

/**
 * Notify all registered callbacks of auth state change
 * @param {import('@supabase/supabase-js').User | null} user
 * @param {string} event - The auth event type (e.g., 'SIGNED_IN', 'PASSWORD_RECOVERY')
 */
function notifyAuthStateChange(user, event = null) {
  authStateCallbacks.forEach(callback => {
    try {
      callback(user, event);
    } catch (error) {
      console.error('Error in auth state callback:', error);
    }
  });
}

/**
 * Get user email
 * @returns {string | null}
 */
export function getUserEmail() {
  return currentUser?.email || null;
}

/**
 * Get user ID
 * @returns {string | null}
 */
export function getUserId() {
  return currentUser?.id || null;
}
