import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';

export default defineConfig({
  // Serve files from root directory
  root: './',

  // Build output directory
  build: {
    outDir: 'dist',
    // Don't empty the output directory (preserves any existing files)
    emptyOutDir: true,
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Copy static files
    rollupOptions: {
      output: {
        // Copy _headers and _redirects after build
        plugins: [{
          name: 'copy-static-files',
          writeBundle() {
            copyFileSync('_headers', 'dist/_headers');
            copyFileSync('_redirects', 'dist/_redirects');
            copyFileSync('_routes.json', 'dist/_routes.json');
          }
        }]
      }
    }
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
