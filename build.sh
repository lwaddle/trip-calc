#!/bin/sh

# Export Cloudflare Pages environment variables for Vite build
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY}"

# Run the build
npm run build
