# Svelte Migration - Detailed Task List

## Current Sprint: Project Setup

### 🔄 In Progress
- [ ] Create initial migration documentation
  - [x] MIGRATION.md
  - [x] ARCHITECTURE.md
  - [x] TODO.md (this file)
  - [ ] Update README.md

### 📋 Next Up
- [ ] Initial Svelte project setup
- [ ] Create base file structure
- [ ] Start Phase 1: Calculator Core

---

## Phase 1: Calculator Core (Week 1-2)

### Goal
Build the core calculator functionality with legs, crew, and calculations working.

### Setup Tasks
- [ ] Initialize Svelte + Vite project
  - [ ] Install Svelte dependencies
  - [ ] Configure Vite for Svelte
  - [ ] Set up path aliases (`$lib`)
  - [ ] Create base file structure

- [ ] Copy reusable files
  - [ ] Copy `auth.js` to `src/lib/services/`
  - [ ] Copy `database.js` to `src/lib/services/`
  - [ ] Copy `supabase.js` to `src/lib/services/`
  - [ ] Copy `.env` variables

- [ ] Extract utilities from app.js
  - [ ] Create `calculations.js` - extract calculation logic
  - [ ] Create `formatters.js` - extract formatCurrency, formatNumber
  - [ ] Create `constants.js` - STANDARD_PROFILES, DEFAULT_PROFILE_ID

### Store Creation
- [ ] `stores/calculator.js`
  - [ ] Create `legs` writable store
  - [ ] Create `crew` writable store
  - [ ] Create `fuelPrice`, `fuelDensity`, `hotelRate`, `mealsRate`, `maintenanceRate` stores
  - [ ] Create `includeAPU` store
  - [ ] Create `totalEstimate` derived store (runs calculations automatically)
  - [ ] Helper functions: `addLeg()`, `removeLeg()`, `updateLeg()`
  - [ ] Helper functions: `addCrew()`, `removeCrew()`, `updateCrew()`

- [ ] `stores/ui.js`
  - [ ] Create `activeModal` store
  - [ ] Create `toastMessage` and `toastType` stores
  - [ ] Helper functions: `openModal()`, `closeModal()`, `showToast()`

### Component Development
- [ ] Layout Components
  - [ ] `Header.svelte`
    - [ ] Logo
    - [ ] Desktop navigation (placeholder for now)
    - [ ] Mobile menu button
  - [ ] `Footer.svelte`
    - [ ] Action buttons (Share, Save - placeholders)
  - [ ] `MobileMenu.svelte`
    - [ ] Menu overlay
    - [ ] Navigation items (placeholders)

- [ ] Calculator Components
  - [ ] `CalculatorForm.svelte`
    - [ ] Form container
    - [ ] Settings inputs (fuel price, density, etc.)
    - [ ] Render FlightLegsList
    - [ ] Render CrewList
    - [ ] Render EstimateSummary

  - [ ] `FlightLeg.svelte`
    - [ ] Origin/destination inputs
    - [ ] Distance, fuel, flight time inputs
    - [ ] Ground time inputs
    - [ ] Remove button
    - [ ] Two-way binding to store

  - [ ] `FlightLegsList.svelte`
    - [ ] Render list of FlightLeg components
    - [ ] "Add Leg" button
    - [ ] Handle leg addition/removal

  - [ ] `CrewMember.svelte`
    - [ ] Role and rate inputs
    - [ ] Remove button
    - [ ] Two-way binding to store

  - [ ] `CrewList.svelte`
    - [ ] Render list of CrewMember components
    - [ ] "Add Crew" button
    - [ ] Handle crew addition/removal

  - [ ] `EstimateSummary.svelte`
    - [ ] Display calculated totals
    - [ ] Fuel costs
    - [ ] Crew costs
    - [ ] Hotel/meals costs
    - [ ] Maintenance costs
    - [ ] Grand total

- [ ] UI Components
  - [ ] `Modal.svelte`
    - [ ] Reusable modal container
    - [ ] Close button
    - [ ] Backdrop click to close
    - [ ] Slot for content

  - [ ] `Toast.svelte`
    - [ ] Success/error/info styling
    - [ ] Auto-dismiss after timeout
    - [ ] Close button

  - [ ] `Button.svelte` (optional, for consistency)
    - [ ] Primary/secondary/danger variants
    - [ ] Loading state
    - [ ] Disabled state

### Calculations
- [ ] `utils/calculations.js`
  - [ ] Extract `calculateEstimate()` from app.js
  - [ ] Extract calculation helper functions
  - [ ] Ensure all calculations are pure functions
  - [ ] Add comments explaining calculation logic

- [ ] `utils/formatters.js`
  - [ ] `formatCurrency(amount)` function
  - [ ] `formatNumber(number, decimals)` function

- [ ] `utils/constants.js`
  - [ ] STANDARD_PROFILES array
  - [ ] DEFAULT_PROFILE_ID constant

### Testing
- [ ] Test leg addition/removal
- [ ] Test crew addition/removal
- [ ] Test input updates trigger recalculations
- [ ] Test calculations match vanilla JS version
- [ ] Test on mobile viewport

### Milestone
✅ **Calculator MVP Working** - Can add legs/crew and see calculated totals (guest mode only)

---

## Phase 2: Authentication (Week 2-3)

### Goal
Complete authentication system with sign-in, sign-out, and password reset.

### Store Creation
- [ ] `stores/auth.js`
  - [ ] Create `user` writable store
  - [ ] Create `isAuthenticated` derived store
  - [ ] Initialize auth listener on app load
  - [ ] Helper functions: `signIn()`, `signOut()`, `resetPassword()`

### Component Development
- [ ] `auth/SignInView.svelte`
  - [ ] Sign-in form (email/password)
  - [ ] "Continue as Guest" button
  - [ ] "Forgot Password" link
  - [ ] Error message display
  - [ ] Form validation

- [ ] `auth/SignInModal.svelte`
  - [ ] Modal version of sign-in (for when already in app)
  - [ ] Same fields as SignInView
  - [ ] Close button

- [ ] `auth/PasswordResetModal.svelte`
  - [ ] Email input for reset request
  - [ ] Success/error messages
  - [ ] Send reset email functionality

- [ ] `auth/UpdatePasswordModal.svelte`
  - [ ] New password input
  - [ ] Confirm password input
  - [ ] Password strength indicator (optional)
  - [ ] Update password functionality

### Integration
- [ ] Update Header to show/hide auth buttons
- [ ] Update MobileMenu with auth items
- [ ] Add desktop user dropdown (email display, sign out)
- [ ] Handle auth state changes (show/hide UI elements)
- [ ] Redirect logic after sign-in

### Testing
- [ ] Test sign-in flow
- [ ] Test sign-out flow
- [ ] Test password reset request
- [ ] Test password update
- [ ] Test "Continue as Guest"
- [ ] Test auth state persistence (page reload)

### Milestone
✅ **Auth System Complete** - Can sign in, sign out, and reset password

---

## Phase 3: Profiles (Week 3-4)

### Goal
Complete profile management (create, edit, delete, set default).

### Store Creation
- [ ] `stores/profiles.js`
  - [ ] Create `userProfiles` writable store
  - [ ] Create `selectedProfileId` writable store
  - [ ] Create `allProfiles` derived store (user + standard profiles)
  - [ ] Load user profiles from database on auth
  - [ ] Helper functions: `loadProfiles()`, `selectProfile()`, `applyProfile()`

### Component Development
- [ ] `profiles/ProfileSelector.svelte`
  - [ ] Dropdown with all profiles
  - [ ] Visual indicator for custom vs standard
  - [ ] "New Profile" button (auth required)
  - [ ] Apply profile on selection

- [ ] `profiles/ProfilesView.svelte`
  - [ ] Full-screen view for managing profiles
  - [ ] Header with "Back" and "+" buttons
  - [ ] Render ProfilesList
  - [ ] Handle view open/close

- [ ] `profiles/ProfilesList.svelte`
  - [ ] Render list of ProfileCard components
  - [ ] Empty state message
  - [ ] Grid or list layout

- [ ] `profiles/ProfileCard.svelte`
  - [ ] Profile image
  - [ ] Profile name
  - [ ] Key details (pilots, fuel price, etc.)
  - [ ] "Default" badge if applicable
  - [ ] Action buttons: Edit, Duplicate, Export, Delete

- [ ] `profiles/ProfileEditor.svelte`
  - [ ] Form for creating/editing profiles
  - [ ] All profile fields (fuel, crew, rates, etc.)
  - [ ] Image upload with preview
  - [ ] Image cropping to 4:3
  - [ ] Image compression
  - [ ] "Set as Default" checkbox
  - [ ] Save/Cancel buttons
  - [ ] Form validation

### Features
- [ ] Create profile
- [ ] Edit profile
- [ ] Delete profile (with confirmation)
- [ ] Duplicate profile
- [ ] Export profile to JSON
- [ ] Import profile from JSON
- [ ] Set default profile
- [ ] Profile image upload/crop/compress

### Testing
- [ ] Test profile creation
- [ ] Test profile editing
- [ ] Test profile deletion
- [ ] Test setting default profile
- [ ] Test profile selection updates calculator
- [ ] Test image upload and compression
- [ ] Test export/import functionality

### Milestone
✅ **Profiles Complete** - Can create, edit, delete, and use custom profiles

---

## Phase 4: Estimates (Week 4-5)

### Goal
Complete estimates management (save, load, delete, rename).

### Store Creation
- [ ] `stores/estimates.js`
  - [ ] Create `estimates` writable store (list of saved estimates)
  - [ ] Create `currentEstimateId` writable store
  - [ ] Create `currentEstimateName` writable store
  - [ ] Create `hasUnsavedChanges` derived store
  - [ ] Helper functions: `loadEstimates()`, `saveEstimate()`, `deleteEstimate()`

### Component Development
- [ ] `estimates/EmptyState.svelte`
  - [ ] Friendly message for no estimate loaded
  - [ ] "Create New Estimate" button
  - [ ] "My Estimates" button

- [ ] `estimates/EstimatesView.svelte`
  - [ ] Full-screen view for estimates
  - [ ] Header with "Back" and "+" buttons
  - [ ] Render EstimatesList
  - [ ] Handle view open/close

- [ ] `estimates/EstimatesList.svelte`
  - [ ] Render list of EstimateCard components
  - [ ] Empty state if no estimates
  - [ ] Sort options (date, name)

- [ ] `estimates/EstimateCard.svelte`
  - [ ] Estimate name
  - [ ] Created/updated date
  - [ ] Total cost preview
  - [ ] Action buttons: Load, Delete

### Features
- [ ] Save new estimate
  - [ ] Modal to enter estimate name
  - [ ] Validation (name required)
  - [ ] Save to database
- [ ] Update existing estimate
  - [ ] Update modal with current name
  - [ ] Update in database
- [ ] Load estimate
  - [ ] Warn if unsaved changes
  - [ ] Load data into calculator
- [ ] Delete estimate
  - [ ] Confirmation modal
  - [ ] Delete from database
- [ ] Rename estimate
  - [ ] Modal with current name
  - [ ] Update in database
- [ ] Discard changes
  - [ ] Reload last saved state
  - [ ] Clear unsaved changes flag
- [ ] New estimate
  - [ ] Warn if unsaved changes
  - [ ] Clear calculator to fresh state

### UI Updates
- [ ] Show/hide save button based on auth
- [ ] Show/hide "My Estimates" based on auth
- [ ] Update page title with estimate name
- [ ] Show rename icon next to title when estimate loaded
- [ ] Show "Discard Changes" button when unsaved changes exist
- [ ] Visual indicator on save button when changes pending

### Testing
- [ ] Test saving new estimate
- [ ] Test updating existing estimate
- [ ] Test loading estimate
- [ ] Test deleting estimate
- [ ] Test unsaved changes warning
- [ ] Test discard changes
- [ ] Test new estimate action

### Milestone
✅ **Estimates Complete** - Can save, load, delete, and manage estimates

---

## Phase 5: Sharing & Export (Week 5-6)

### Goal
Complete sharing functionality and PDF export.

### Component Development
- [ ] `share/ShareModal.svelte`
  - [ ] Share options (Email, Native Share, Copy Link)
  - [ ] Email-specific options (include PDF, text-only)
  - [ ] Preview of share link
  - [ ] Success/error feedback

- [ ] `share/ShareView.svelte`
  - [ ] Public view for shared estimates
  - [ ] Read-only calculator display
  - [ ] "Import to My Account" button (if authenticated)
  - [ ] Branding/logo

- [ ] `share/ShareOptions.svelte` (optional sub-component)
  - [ ] Individual share method buttons
  - [ ] Icons for each method

### Features
- [ ] Generate share link
  - [ ] Create share token in database
  - [ ] Generate public URL
- [ ] Share via email
  - [ ] Optional: Include PDF attachment
  - [ ] Text-only estimate summary
  - [ ] Mailto link or server-side email
- [ ] Share via native share API
  - [ ] Detect mobile device
  - [ ] Use Web Share API
  - [ ] Fallback to copy link
- [ ] Copy share link
  - [ ] Copy to clipboard
  - [ ] Success toast
- [ ] Load shared estimate
  - [ ] Parse share token from URL
  - [ ] Fetch estimate data
  - [ ] Display in ShareView
  - [ ] Prevent editing
- [ ] Import shared estimate
  - [ ] Copy shared estimate to user's account
  - [ ] Redirect to calculator with loaded data

### PDF Export
- [ ] `utils/pdfExport.js`
  - [ ] Extract PDF generation logic from app.js
  - [ ] Keep PDFKit integration
  - [ ] Generate PDF from estimate data
  - [ ] Return blob for download/email

- [ ] PDF preview modal
  - [ ] Display generated PDF
  - [ ] Download button
  - [ ] Close button

- [ ] Export to PDF button
  - [ ] Generate PDF
  - [ ] Show preview or auto-download
  - [ ] Handle errors

### Testing
- [ ] Test share link generation
- [ ] Test email sharing (with and without PDF)
- [ ] Test native share on mobile
- [ ] Test copy link to clipboard
- [ ] Test loading shared estimate
- [ ] Test importing shared estimate
- [ ] Test PDF generation
- [ ] Test PDF preview
- [ ] Test PDF download

### Milestone
✅ **Sharing & Export Complete** - Can share estimates and export to PDF

---

## Phase 6: Polish & Testing (Week 6-7)

### Goal
Final polish, bug fixes, and production readiness.

### Polish Tasks
- [ ] Mobile responsiveness review
  - [ ] Test all components on mobile
  - [ ] Fix any layout issues
  - [ ] Ensure touch targets are large enough
  - [ ] Test on iOS Safari
  - [ ] Test on Android Chrome

- [ ] Accessibility improvements
  - [ ] Add ARIA labels where needed
  - [ ] Ensure keyboard navigation works
  - [ ] Test with screen reader (basic check)
  - [ ] Proper heading hierarchy

- [ ] Performance optimization
  - [ ] Review bundle size
  - [ ] Lazy load components if needed
  - [ ] Optimize images
  - [ ] Check for unnecessary re-renders

- [ ] Error handling
  - [ ] Ensure all errors show user-friendly messages
  - [ ] Add error boundaries where appropriate
  - [ ] Log errors for debugging

- [ ] Loading states
  - [ ] Add loading indicators for async operations
  - [ ] Skeleton screens for data loading
  - [ ] Disable buttons during submission

- [ ] Visual polish
  - [ ] Consistent spacing and typography
  - [ ] Smooth transitions and animations
  - [ ] Hover states on interactive elements
  - [ ] Focus states for accessibility

### Testing
- [ ] Cross-browser testing
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] Feature testing (complete walkthrough)
  - [ ] Guest mode flow
  - [ ] Sign-in flow
  - [ ] Create estimate
  - [ ] Save estimate
  - [ ] Load estimate
  - [ ] Create profile
  - [ ] Use profile
  - [ ] Share estimate
  - [ ] Export PDF

- [ ] Edge cases
  - [ ] Empty states
  - [ ] Very long inputs
  - [ ] Special characters in names
  - [ ] Network errors
  - [ ] Auth session expiry

### Documentation
- [ ] Update README.md
  - [ ] Project description
  - [ ] Tech stack
  - [ ] Setup instructions
  - [ ] Development workflow
  - [ ] Deployment info

- [ ] Code comments
  - [ ] Add comments for complex logic
  - [ ] JSDoc for utility functions
  - [ ] Component prop documentation

- [ ] Update MIGRATION.md
  - [ ] Mark all tasks complete
  - [ ] Document final architecture
  - [ ] Add lessons learned
  - [ ] Performance metrics (bundle size, etc.)

### Final Steps
- [ ] Remove old vanilla JS files (or move to archive folder)
- [ ] Clean up unused dependencies
- [ ] Final commit on svelte-migration branch
- [ ] Merge to main (or make svelte-migration the new main)
- [ ] Deploy to production
- [ ] Celebrate! 🎉

### Milestone
✅ **Production Ready** - Svelte app is complete and deployed

---

## Future Enhancements (Post-Migration)

### Nice-to-Have Features
- [ ] Dark mode toggle
- [ ] Keyboard shortcuts
- [ ] Estimate templates
- [ ] Bulk operations (delete multiple estimates)
- [ ] Search/filter estimates
- [ ] Export estimates to CSV/Excel
- [ ] Print-friendly view
- [ ] Collaborative editing (share with edit permissions)
- [ ] Estimate comparison view
- [ ] Chart visualizations (cost breakdown)

### Technical Improvements
- [ ] Add unit tests (Vitest)
- [ ] Add component tests (Svelte Testing Library)
- [ ] Add E2E tests (Playwright)
- [ ] Set up CI/CD pipeline
- [ ] Add ESLint and Prettier
- [ ] TypeScript migration (optional)
- [ ] PWA support (offline mode)
- [ ] Server-side rendering with SvelteKit

---

## Notes

### How to Use This File
1. Check off tasks as you complete them
2. Add new tasks as you discover them
3. Update estimates if tasks take longer/shorter than expected
4. Add notes for tricky implementations

### Task Symbols
- `[ ]` - Not started
- `[x]` - Completed
- `[~]` - In progress (optional, or use "🔄 In Progress" section)

### Priorities
- **P0** - Critical for MVP
- **P1** - Important, but can wait
- **P2** - Nice to have
- **P3** - Future enhancement

---

## Last Updated
- **Date:** 2025-01-XX (Initial creation)
- **Current Phase:** Project Setup
- **Next Session:** Initial Svelte setup and file structure
