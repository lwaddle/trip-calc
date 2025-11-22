/**
 * Supabase Client Configuration
 * Initializes and exports the Supabase client for use throughout the application
 */

import { createClient } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug logging (temporary - will remove after confirming deployment works)
console.log('Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING');
console.log('Supabase Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey);
  throw new Error('Supabase configuration is incomplete. See console for details.');
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage
    storage: window.localStorage,
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session across page reloads
    persistSession: true,
    // Detect session from URL (for magic links, etc.)
    detectSessionInUrl: true
  }
});

// Export helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
