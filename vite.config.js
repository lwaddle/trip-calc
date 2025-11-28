import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { copyFileSync } from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],

  // Serve files from root directory
  root: './',

  // Public directory for static assets
  publicDir: 'public',

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

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '$lib': path.resolve('./src/lib')
    }
  },

  // Server configuration for development
  server: {
    port: 3000,
    open: true
  },

  // Explicitly tell Vite to include VITE_ prefixed environment variables
  envPrefix: 'VITE_'
});
