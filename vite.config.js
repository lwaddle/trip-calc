import { defineConfig } from 'vite';

export default defineConfig({
  // Serve files from root directory
  root: './',

  // Build output directory
  build: {
    outDir: 'dist',
    // Don't empty the output directory (preserves any existing files)
    emptyOutDir: true,
    // Generate sourcemaps for debugging
    sourcemap: true
  },

  // Public base path
  base: './',

  // Server configuration for development
  server: {
    port: 3000,
    open: true
  },

  // Explicitly define environment variables for the build
  // Uses process.env which Cloudflare Pages populates during build
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || '')
  }
});
