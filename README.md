# Trip Cost Calculator

A comprehensive web application for calculating private aviation trip costs with features for flight legs, crew expenses, fuel costs, and more.

## Features

- **Flight Leg Management**: Add multiple flight legs with fuel burn calculations
- **Crew Management**: Track pilots and flight attendants with daily rates
- **Comprehensive Cost Tracking**: Fuel, operations, hourly programs, airport fees, and miscellaneous expenses
- **User Authentication**: Secure sign-in with Supabase (email/password)
- **Estimate Management**: Save, load, and delete trip estimates
- **Estimate Sharing**: Generate shareable links for estimates
- **User Defaults**: Save personalized default values
- **PDF Export**: Generate professional PDF summaries
- **Anonymous Access**: Full calculator functionality without sign-in (no save/load)

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules)
- **Build Tool**: Vite (for environment variables and bundling)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Cloudflare Pages
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Cloudflare account (for deployment)

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd trip-calc
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

#### Run the Database Schema

1. Open the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL to create all tables and policies

#### Get Your Supabase Credentials

1. Go to Project Settings > API
2. Copy your project URL
3. Copy your `anon` public key

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6. Create User Accounts

Since there's no public sign-up, you'll need to create users directly in Supabase:

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User"
3. Enter email and password
4. Send them their credentials

## Deployment to Cloudflare Pages

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Connect Your Repository**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your GitHub/GitLab account
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty)

3. **Add Environment Variables**
   - In the build configuration, add:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your app
   - Future pushes to `main` will auto-deploy

### Option 2: Deploy via Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy dist
```

### Post-Deployment

1. Configure your custom domain (optional) in Cloudflare Pages settings
2. Test authentication and database connectivity
3. Create user accounts in Supabase
4. Share credentials with trusted users

## Database Schema

The application uses three main tables:

### `user_defaults`
Stores per-user default values for calculator inputs (fuel price, crew rates, etc.)

### `estimates`
Stores saved trip estimates with complete state (legs, crew, form data)

### `estimate_shares`
Enables sharing estimates via unique UUID tokens

All tables have Row Level Security (RLS) policies to ensure users can only access their own data.

## Usage

### Anonymous Users
- Access full calculator functionality
- Cannot save or load estimates
- No authentication required

### Authenticated Users
- Sign in via the menu
- Save estimates to database
- Load previously saved estimates
- Delete estimates
- Share estimates with others
- Set personal default values

### Sharing Estimates
1. Sign in and load an estimate
2. Click "Share" button
3. Copy the generated link
4. Share with anyone (they can view and copy to their account)

## Development

### Project Structure

```
trip-calc/
├── assets/
│   ├── css/
│   │   └── styles.css          # All application styles
│   ├── js/
│   │   ├── app.js              # Main application logic
│   │   ├── auth.js             # Authentication module
│   │   ├── database.js         # Supabase database operations
│   │   └── supabase.js         # Supabase client initialization
│   └── img/
│       └── logo.svg            # Company logo
├── index.html                   # Main HTML file
├── supabase-schema.sql         # Database schema
├── vite.config.js              # Vite configuration
├── wrangler.toml               # Cloudflare Pages config
├── _redirects                  # Cloudflare SPA routing
├── package.json                # Dependencies
└── README.md                   # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Adding New Features

The codebase is organized into logical modules:

- **Authentication**: See `assets/js/auth.js`
- **Database Operations**: See `assets/js/database.js`
- **UI Components**: See `assets/js/app.js`
- **Styling**: See `assets/css/styles.css`

## Security

- Environment variables are never committed to git
- Row Level Security (RLS) ensures data isolation
- Password reset functionality via Supabase
- Secure session management with auto-refresh
- HTTPS enforced on Cloudflare Pages

## Troubleshooting

### Build Errors

**"Missing Supabase environment variables"**
- Ensure `.env` file exists and contains valid credentials
- For Cloudflare, check environment variables in dashboard

**Module import errors**
- Make sure you've run `npm install`
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Authentication Issues

**Can't sign in**
- Verify user exists in Supabase dashboard
- Check that environment variables match your Supabase project
- Check browser console for errors

**Session not persisting**
- Check browser storage settings
- Ensure cookies are enabled

### Database Issues

**Can't save estimates**
- Verify you're signed in
- Check Supabase RLS policies are correctly set up
- Inspect browser console and Supabase logs

## Contributing

This is a private project for a few trusted users. If you have access:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues or questions, please contact the project administrator.
