# Svelte Migration - Detailed Task List

## Current Sprint: Phase 4 - Estimates

### ✅ Recently Completed
- [x] **Phase 1: Calculator Core** - All calculator components built and working
- [x] **Phase 2: Auth System** - Complete authentication flow with sign-in, sign-out, password reset
- [x] **Phase 3: Profiles** - Complete profile management system with CRUD operations

### 🔄 In Progress
- [ ] **Phase 4: Estimates** - Estimates management system

### 📋 Next Up
- [ ] Create estimates store
- [ ] Build EstimatesView component
- [ ] Build save/load/delete functionality

---

## Phase 1: Calculator Core (Week 1-2) ✅ COMPLETE

### Goal
Build the core calculator functionality with legs, crew, and calculations working.

### Setup Tasks
- [x] Initialize Svelte + Vite project
  - [x] Install Svelte dependencies
  - [x] Configure Vite for Svelte
  - [x] Set up path aliases (`$lib`)
  - [x] Create base file structure

- [x] Copy reusable files
  - [x] Copy `auth.js` to `src/lib/services/`
  - [x] Copy `database.js` to `src/lib/services/`
  - [x] Copy `supabase.js` to `src/lib/services/`
  - [x] Copy `.env` variables

- [x] Extract utilities from app.js
  - [x] Create `calculations.js` - extract calculation logic
  - [x] Create `formatters.js` - extract formatCurrency, formatNumber
  - [x] Create `constants.js` - STANDARD_PROFILES, DEFAULT_PROFILE_ID

### Store Creation
- [x] `stores/calculator.js`
  - [x] Create `legs` writable store
  - [x] Create `crew` writable store
  - [x] Create `fuelPrice`, `fuelDensity`, `hotelRate`, `mealsRate`, `maintenanceRate` stores
  - [x] Create `includeAPU` store
  - [x] Create `totalEstimate` derived store (runs calculations automatically)
  - [x] Helper functions: `addLeg()`, `removeLeg()`, `updateLeg()`
  - [x] Helper functions: `addCrew()`, `removeCrew()`, `updateCrew()`

- [x] `stores/ui.js`
  - [x] Create `activeModal` store
  - [x] Create `toastMessage` and `toastType` stores
  - [x] Helper functions: `openModal()`, `closeModal()`, `showToast()`

### Component Development
- [x] Layout Components
  - [x] `Header.svelte`
    - [x] Logo
    - [x] Desktop navigation
    - [x] Mobile menu button
  - [x] `Footer.svelte`
    - [x] Action buttons (Share, Save - placeholders)
  - [x] `MobileMenu.svelte` (completed in Phase 2)
    - [x] Menu overlay
    - [x] Navigation items

- [x] Calculator Components
  - [x] `CalculatorForm.svelte`
    - [x] Form container
    - [x] Settings inputs (fuel price, density, etc.)
    - [x] Render FlightLegsList
    - [x] Render CrewList
    - [x] Render EstimateSummary

  - [x] `FlightLeg.svelte`
    - [x] Origin/destination inputs
    - [x] Distance, fuel, flight time inputs
    - [x] Ground time inputs
    - [x] Remove button
    - [x] Two-way binding to store

  - [x] `FlightLegsList.svelte`
    - [x] Render list of FlightLeg components
    - [x] "Add Leg" button
    - [x] Handle leg addition/removal

  - [x] `CrewMember.svelte`
    - [x] Role and rate inputs
    - [x] Remove button
    - [x] Two-way binding to store

  - [x] `CrewList.svelte`
    - [x] Render list of CrewMember components
    - [x] "Add Crew" button
    - [x] Handle crew addition/removal

  - [x] `EstimateSummary.svelte`
    - [x] Display calculated totals
    - [x] Fuel costs
    - [x] Crew costs
    - [x] Hotel/meals costs
    - [x] Maintenance costs
    - [x] Grand total

- [x] UI Components
  - [x] `Toast.svelte` (completed in Phase 2)
    - [x] Success/error/info styling
    - [x] Auto-dismiss after timeout
    - [x] Close button

### Calculations
- [x] `utils/calculations.js`
  - [x] Extract `calculateEstimate()` from app.js
  - [x] Extract calculation helper functions
  - [x] Ensure all calculations are pure functions
  - [x] Add comments explaining calculation logic

- [x] `utils/formatters.js`
  - [x] `formatCurrency(amount)` function
  - [x] `formatNumber(number, decimals)` function

- [x] `utils/constants.js`
  - [x] STANDARD_PROFILES array
  - [x] DEFAULT_PROFILE_ID constant

### Testing
- [x] Test leg addition/removal
- [x] Test crew addition/removal
- [x] Test input updates trigger recalculations
- [x] Test calculations match vanilla JS version
- [x] Test on mobile viewport

### Milestone
✅ **Calculator MVP Working** - Can add legs/crew and see calculated totals (guest mode only)

---

## Phase 2: Authentication (Week 2-3) ✅ COMPLETE

### Goal
Complete authentication system with sign-in, sign-out, and password reset.

### Store Creation
- [x] `stores/auth.js`
  - [x] Create `user` writable store
  - [x] Create `isAuthenticated` derived store
  - [x] Initialize auth listener on app load
  - [x] Helper functions: `signIn()`, `signOut()`, `resetPassword()`

### Component Development
- [x] `auth/SignInView.svelte`
  - [x] Sign-in form (email/password)
  - [x] "Continue as Guest" button
  - [x] "Forgot Password" link
  - [x] Error message display
  - [x] Form validation

- [x] `auth/SignInModal.svelte`
  - [x] Modal version of sign-in (for when already in app)
  - [x] Same fields as SignInView
  - [x] Close button

- [x] `auth/PasswordResetModal.svelte`
  - [x] Email input for reset request
  - [x] Success/error messages
  - [x] Send reset email functionality

- [x] `auth/UpdatePasswordModal.svelte`
  - [x] New password input
  - [x] Confirm password input
  - [x] Password validation
  - [x] Update password functionality

### Integration
- [x] Update Header to show/hide auth buttons
- [x] Update MobileMenu with auth items
- [x] Add desktop user dropdown (email display, sign out)
- [x] Handle auth state changes (show/hide UI elements)
- [x] Redirect logic after sign-in
- [x] Integrated into App.svelte with modal management
- [x] Toast notification system

### Testing
- [x] Test sign-in flow
- [x] Test sign-out flow
- [x] Test password reset request
- [x] Test password update
- [x] Test "Continue as Guest"
- [x] Test auth state persistence (page reload)

### Milestone
✅ **Auth System Complete** - Can sign in, sign out, and reset password

---

## Phase 3: Profiles (Week 3-4) ✅ COMPLETE

### Goal
Complete profile management (create, edit, delete, set default).

### Store Creation
- [x] `stores/profiles.js`
  - [x] Create `userProfiles` writable store
  - [x] Create `selectedProfileId` writable store
  - [x] Create `allProfiles` derived store (user + standard profiles)
  - [x] Load user profiles from database on auth
  - [x] Helper functions: `loadProfiles()`, `selectProfile()`, `applyProfile()`

### Component Development
- [x] `profiles/ProfileSelector.svelte`
  - [x] Dropdown with all profiles
  - [x] Visual indicator for custom vs standard
  - [x] "New Profile" button (auth required)
  - [x] Apply profile on selection

- [x] `profiles/ProfilesView.svelte`
  - [x] Full-screen view for managing profiles
  - [x] Header with "Back" and "+" buttons
  - [x] Render ProfilesList
  - [x] Handle view open/close

- [x] `profiles/ProfilesList.svelte`
  - [x] Render list of ProfileCard components
  - [x] Empty state message
  - [x] Grid or list layout

- [x] `profiles/ProfileCard.svelte`
  - [x] Profile image
  - [x] Profile name
  - [x] Key details (pilots, fuel price, etc.)
  - [x] "Default" badge if applicable
  - [x] Action buttons: Edit, Duplicate, Export, Delete

- [x] `profiles/ProfileEditor.svelte`
  - [x] Form for creating/editing profiles
  - [x] All profile fields (fuel, crew, rates, etc.)
  - [x] Image upload with preview
  - [x] Image placeholder support
  - [x] "Set as Default" checkbox
  - [x] Save/Cancel buttons
  - [x] Form validation

### Features
- [x] Create profile
- [x] Edit profile
- [x] Delete profile (with confirmation)
- [x] Duplicate profile
- [x] Export profile to JSON
- [x] Set default profile
- [x] Profile image upload support (base64 data URL for now)
- [x] Auto-apply profile settings to calculator
- [x] Integrated into App.svelte with modal management

### Testing
- [x] Test profile creation
- [x] Test profile editing
- [x] Test profile deletion
- [x] Test setting default profile
- [x] Test profile selection updates calculator
- [x] Test export functionality

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
- **Date:** 2025-01-27 (Phase 3 Complete)
- **Current Phase:** Phase 4 - Estimates
- **Completed:** Phase 1 (Calculator Core), Phase 2 (Authentication), Phase 3 (Profiles)
- **Next Session:** Begin Phase 4 - Estimates management system
