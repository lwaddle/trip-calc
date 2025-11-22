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

  // Explicitly tell Vite to include VITE_ prefixed environment variables
  envPrefix: 'VITE_'
});
