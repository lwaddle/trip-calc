import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode (development, production, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
    // This ensures they're properly embedded even in Cloudflare Pages
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    }
  };
});
