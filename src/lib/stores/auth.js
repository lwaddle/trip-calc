import { writable, derived } from 'svelte/store';
import {
  initAuth,
  signIn as authSignIn,
  signOut as authSignOut,
  resetPassword as authResetPassword,
  updatePassword as authUpdatePassword,
  onAuthStateChange as onAuthChange,
  getCurrentUser,
  getUserEmail,
  getUserId
} from '$lib/services/auth.js';

// ===========================
// User State
// ===========================

export const user = writable(null);
export const authInitialized = writable(false);
export const authLoading = writable(false);

// ===========================
// Derived State
// ===========================

export const isAuthenticated = derived(
  user,
  ($user) => $user !== null
);

export const userEmail = derived(
  user,
  ($user) => $user?.email || null
);

export const userId = derived(
  user,
  ($user) => $user?.id || null
);

// ===========================
// Auth Initialization
// ===========================

/**
 * Initialize authentication system
 * Should be called once on app startup
 */
export async function initialize() {
  try {
    authLoading.set(true);

    // Set up auth state change listener
    onAuthChange((newUser, event) => {
      user.set(newUser);

      // Log auth events for debugging
      if (event) {
        console.log('Auth event:', event, newUser ? 'Signed in' : 'Signed out');
      }
    });

    // Get initial session
    const currentUser = await initAuth();
    user.set(currentUser);

    authInitialized.set(true);
    authLoading.set(false);

    return currentUser;
  } catch (error) {
    console.error('Error initializing auth:', error);
    authInitialized.set(true);
    authLoading.set(false);
    return null;
  }
}

// ===========================
// Auth Actions
// ===========================

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user: object | null, error: Error | null}>}
 */
export async function signIn(email, password) {
  try {
    authLoading.set(true);
    const result = await authSignIn(email, password);

    if (result.error) {
      return { user: null, error: result.error };
    }

    user.set(result.user);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Sign out the current user
 * @returns {Promise<{error: Error | null}>}
 */
export async function signOut() {
  try {
    authLoading.set(true);
    const result = await authSignOut();

    if (result.error) {
      return { error: result.error };
    }

    user.set(null);
    return { error: null };
  } catch (error) {
    return { error };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Send password reset email
 * @param {string} email
 * @returns {Promise<{error: Error | null}>}
 */
export async function resetPassword(email) {
  try {
    authLoading.set(true);
    const result = await authResetPassword(email);
    return result;
  } catch (error) {
    return { error };
  } finally {
    authLoading.set(false);
  }
}

/**
 * Update user password
 * @param {string} newPassword
 * @returns {Promise<{error: Error | null}>}
 */
export async function updatePassword(newPassword) {
  try {
    authLoading.set(true);
    const result = await authUpdatePassword(newPassword);
    return result;
  } catch (error) {
    return { error };
  } finally {
    authLoading.set(false);
  }
}

// ===========================
// Utility Functions
// ===========================

/**
 * Check if password recovery is in progress
 * (user clicked reset link and needs to set new password)
 */
export function isPasswordRecovery() {
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  return hashParams.get('type') === 'recovery';
}
