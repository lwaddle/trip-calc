# Quick Start Guide

This guide will get you up and running in under 10 minutes.

## Step 1: Install Dependencies (1 minute)

```bash
npm install
```

## Step 2: Set Up Supabase (3-5 minutes)

### Create Project
1. Visit [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project name and database password
4. Wait for provisioning (~2 minutes)

### Run Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Open `supabase-schema.sql` from this project
3. Copy entire contents
4. Paste into SQL Editor and click "Run"

### Get Credentials
1. Go to Settings > API
2. Copy "Project URL"
3. Copy "anon public" key

## Step 3: Configure Environment (1 minute)

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## Step 4: Start Development Server (30 seconds)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 5: Create Your First User (1 minute)

Since there's no public sign-up:

1. In Supabase dashboard, go to Authentication > Users
2. Click "Add User"
3. Enter:
   - Email: your-email@example.com
   - Password: (create a strong password)
   - Auto-confirm user: ✓ (check this box)
4. Click "Add User"

## Step 6: Sign In & Test (1 minute)

1. In the app, click the hamburger menu (top right)
2. Click "Sign In"
3. Enter your credentials
4. You should now see:
   - Your email in the menu
   - "Save Estimate" and "Load Estimate" buttons visible
   - "Estimates" option in menu
   - "Sign Out" option in menu

## Next Steps

### Test Core Features
1. **Save an estimate**: Enter some flight data and click "Save Estimate"
2. **Load estimates**: Click "Load Estimate" to see your saved estimates
3. **Share an estimate**: Click "Share" on a saved estimate to get a shareable link
4. **Set defaults**: Click "Defaults" to customize your default values

### Deploy to Production

See [README.md](README.md#deployment-to-cloudflare-pages) for detailed deployment instructions.

**Quick deploy via Cloudflare Dashboard:**
1. Push code to GitHub
2. Go to Cloudflare Pages
3. Connect repository
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variables (same as `.env`)
7. Deploy!

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists and has correct values
- Restart dev server after creating `.env`

### Can't sign in
- Verify user was created in Supabase
- Check "Auto-confirm user" was checked
- Try password reset if needed

### Estimates not saving
- Ensure you're signed in (email shows in menu)
- Check browser console for errors
- Verify database schema was run successfully

## Common Tasks

### Add Another User
Supabase Dashboard > Authentication > Users > Add User

### Reset Password (Self-Service)
1. App menu > Sign In
2. Click "Forgot Password?"
3. Enter email
4. Check inbox for reset link

### View Database
Supabase Dashboard > Table Editor

### View Logs
Supabase Dashboard > Logs

## Support

- **Documentation**: See [README.md](README.md)
- **Database Schema**: See [supabase-schema.sql](supabase-schema.sql)
- **Project Structure**: All source in `assets/js/`

That's it! You're ready to go. 🚀
