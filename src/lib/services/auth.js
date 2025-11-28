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
 * Helper function to clear Supabase auth data from localStorage
 * This is especially important for Safari which may not clear reliably
 */
function clearSupabaseStorage() {
  try {
    const keysToRemove = [];

    // Find all Supabase auth keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
        keysToRemove.push(key);
      }
    }

    // Remove all found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    if (keysToRemove.length > 0) {
      console.log('Cleared Supabase auth keys:', keysToRemove);
    }
  } catch (error) {
    console.error('Error clearing Supabase storage:', error);
  }
}

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

        // Defensively clear storage on sign out events
        // This handles cases where signOut() may not have been called directly
        if (event === 'SIGNED_OUT') {
          clearSupabaseStorage();
        }
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
    // Check if there's a session to sign out from
    const { data: { session } } = await supabase.auth.getSession();

    // If no session exists, treat as successful sign out (already signed out)
    if (!session) {
      currentUser = null;
      // Defensively clear any lingering Supabase auth data
      clearSupabaseStorage();
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();

    // Treat "auth session missing" errors as success (already signed out)
    if (error && error.message && error.message.toLowerCase().includes('session')) {
      currentUser = null;
      clearSupabaseStorage();
      return { error: null };
    }

    if (error) {
      return { error };
    }

    currentUser = null;

    // Explicitly clear Supabase auth data from localStorage
    // This is especially important for Safari which may not clear reliably
    clearSupabaseStorage();

    // Verify session is actually cleared
    const { data: { session: verifySession } } = await supabase.auth.getSession();
    if (verifySession) {
      console.warn('Session still exists after signOut, forcing clear');
      clearSupabaseStorage();
    }

    return { error: null };
  } catch (error) {
    // If it's a session-related error, treat as success
    if (error.message && error.message.toLowerCase().includes('session')) {
      currentUser = null;
      clearSupabaseStorage();
      return { error: null };
    }
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
