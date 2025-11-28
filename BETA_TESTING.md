# Beta Testing & Feature Parity TODO

**Created:** 2025-11-28
**Status:** Active Beta Testing Phase
**Tag:** v2.0-beta-1 (restore point)

---

## Overview

This document tracks the remaining work to achieve feature parity with the vanilla JS version (v1.0-vanilla-js) and prepare the Svelte migration for production deployment.

**Current Assessment:** ~30-40% of UX features and polish from vanilla version are missing or incomplete.

**Estimated Time to Completion:** 2-3 weeks

---

## 🔴 CRITICAL ISSUES (Must Fix Before Beta)

### 1. Unsaved Changes Tracking System ✅ COMPLETE
**Priority:** P0 - CRITICAL
**Risk:** Data loss without warning

- [x] Implement unsaved changes detection system
  - [x] Track when estimate data differs from last saved state
  - [x] Monitor all form inputs (legs, crew, settings, notes)
  - [x] Create `hasUnsavedChanges` derived store
  - [x] Persist tracking across all calculator inputs

**Reference:**
- Vanilla: `assets/js/app.js` lines 175-264
- Svelte: Update `src/lib/stores/calculator.js` and `src/lib/stores/estimates.js`

---

### 2. "Discard Changes" Button ✅ COMPLETE
**Priority:** P0 - CRITICAL
**Dependencies:** #1 (Unsaved Changes Tracking)

- [x] Add "Discard Changes" button to Footer component
- [x] Show only when `hasUnsavedChanges === true`
- [x] Add confirmation modal before discarding
- [x] Reset calculator to last saved state or empty state
- [x] Add visual indicator (pulsing dot) on Save button when changes exist

**Reference:**
- Vanilla: Multiple references in `app.js`
- Svelte: Update `src/lib/components/layout/Footer.svelte`

---

### 3. Rename Estimate Functionality ✅ COMPLETE
**Priority:** P0 - CRITICAL
**Impact:** No way to rename saved estimates

- [x] Add rename button/icon next to estimate title in calculator view
- [x] Create `RenameEstimateModal.svelte` component
- [x] Implement rename logic in estimates store
- [x] Update estimate in database
- [x] Show only when estimate is loaded and user is authenticated
- [x] Update estimate name in UI after successful rename

**Reference:**
- Vanilla: `index.html` lines 86-90
- Svelte: New component `src/lib/components/estimates/RenameEstimateModal.svelte`

---

### 4. "New Estimate" Button & Confirmation ✅ COMPLETE
**Priority:** P0 - CRITICAL
**Impact:** No clear way to start fresh estimate

- [x] Add "New Estimate" button to Footer component
- [x] Create `NewEstimateConfirmModal.svelte` component (inline in Footer.svelte)
- [x] List what will be cleared (legs, crew, notes, settings)
- [x] Warn about unsaved changes if applicable
- [x] Clear calculator state on confirmation
- [x] Clear `currentEstimateId` and `currentEstimateName`

**Reference:**
- Vanilla: `index.html` lines 750-772 (modal), line 414 (button)
- Svelte: New component + update Footer

---

### 5. Missing Modals - Complete Implementation

#### 5a. Enhanced Share Modal Options ⚠️ PARTIAL
**Priority:** P0 - CRITICAL

- [x] Add "Copy to Clipboard" option (text-only estimate copy)
- [x] Differentiate "Copy Link" vs "Copy Shareable Link" labeling
- [ ] Add proper email options with text vs PDF toggle (currently text only)
- [x] Show different options for authenticated vs guest users
- [x] Implement text-only clipboard copy (formatted estimate)

**Reference:**
- Vanilla: `index.html` lines 865-917
- Svelte: Update `src/lib/components/share/ShareModal.svelte`

---

#### 5b. Client Share Modal (for Share View) ✅ COMPLETE
**Priority:** P0 - CRITICAL

- [x] Create separate share modal for share view context
- [x] Component: `ClientShareModal.svelte`
- [x] Different button IDs and behavior than main share modal
- [x] Share options: Email, Copy, Share via device
- [ ] Integrate with ShareView component

**Reference:**
- Vanilla: `index.html` lines 919-962
- Svelte: New component `src/lib/components/share/ClientShareModal.svelte`

---

#### 5c. Email Unsaved Changes Warning Modal ✅ COMPLETE
**Priority:** P0 - CRITICAL
**Dependencies:** #1 (Unsaved Changes Tracking)

- [x] Create `EmailUnsavedChangesModal.svelte` component
- [x] Show when user tries to email/share estimate with unsaved changes
- [x] Three options:
  - Cancel
  - Email Current Version (ignore changes)
  - Save Changes & Email
- [x] Prevent sharing stale data
- [ ] Integrate with ShareModal component

**Reference:**
- Vanilla: `index.html` lines 792-810
- Svelte: New component `src/lib/components/share/EmailUnsavedChangesModal.svelte`

---

#### 5d. Delete Estimate Confirmation Modal ✅ COMPLETE
**Priority:** P1 - HIGH

- [x] Create dedicated `DeleteEstimateConfirmModal.svelte`
- [x] Show estimate name in confirmation
- [x] Separate from delete profile modal
- [x] Integrate with EstimatesView component

**Reference:**
- Vanilla: `index.html` lines 812-828
- Svelte: New component `src/lib/components/estimates/DeleteEstimateConfirmModal.svelte`

---

#### 5e. Delete Profile Confirmation Modal ✅ COMPLETE
**Priority:** P1 - HIGH

- [x] Create dedicated `DeleteProfileConfirmModal.svelte`
- [x] Show profile name in confirmation
- [x] Separate from delete estimate modal
- [x] Integrate with ProfileCard component

**Reference:**
- Vanilla: `index.html` lines 830-846
- Svelte: New component `src/lib/components/profiles/DeleteProfileConfirmModal.svelte`

---

#### 5f. Import Profile Modal ✅ COMPLETE
**Priority:** P1 - HIGH

- [x] Create `ImportProfileModal.svelte` component
- [x] File picker for .json profile files
- [x] Validate JSON structure
- [x] Error handling display
- [x] Success feedback
- [x] Integrate with ProfilesView component (added Import button)

**Reference:**
- Vanilla: `index.html` lines 579-596
- Svelte: New component `src/lib/components/profiles/ImportProfileModal.svelte`

---

## 🟡 HIGH PRIORITY ISSUES (Important UX/Features)

### 6. Page Loader / Initial Loading State
**Priority:** P1 - HIGH
**Impact:** Poor perceived performance, FOUC

- [ ] Create `PageLoader.svelte` component
- [ ] Show spinner while app initializes
- [ ] Prevent flash of unstyled content
- [ ] Add to App.svelte with initial loading state
- [ ] Hide after auth state determined and data loaded

**Reference:**
- Vanilla: `index.html` lines 34-38, CSS lines 3117-3162
- Svelte: New component `src/lib/components/ui/PageLoader.svelte`

---

### 7. Empty State for Authenticated Users
**Priority:** P1 - HIGH
**Impact:** Confusion for new users

- [ ] Verify EmptyState component integration
- [ ] Show when authenticated user has no estimate loaded
- [ ] Two CTAs: "Create New Estimate", "My Estimates"
- [ ] Wire up in App.svelte view logic
- [ ] Test show/hide conditions

**Reference:**
- Vanilla: `index.html` lines 93-103
- Svelte: Verify `src/lib/components/estimates/EmptyState.svelte`

---

### 8. Auth Tip for Guest Users
**Priority:** P1 - HIGH
**Impact:** Reduced sign-in conversions

- [ ] Create auth tip component or add to EstimateSummary
- [ ] Message: "Tip: Sign in to save and load estimates across devices"
- [ ] Show only for unauthenticated users
- [ ] Position below estimate summary
- [ ] Style with light bulb icon and subtle background

**Reference:**
- Vanilla: `index.html` lines 400-406, CSS lines 813-841
- Svelte: Update `src/lib/components/calculator/EstimateSummary.svelte`

---

### 9. Profile Section Visibility Logic
**Priority:** P1 - HIGH
**Impact:** Confusing UI

- [ ] Hide profile selector when editing saved estimate
- [ ] Show profile selector only for new/unsaved estimates
- [ ] Implement `updateProfileSectionVisibility()` logic
- [ ] Test with loaded vs new estimates

**Reference:**
- Vanilla: Function in `app.js`
- Svelte: Update `src/lib/components/calculator/CalculatorForm.svelte`

---

### 10. Share View: Beautiful Estimate Display
**Priority:** P1 - HIGH
**Impact:** Poor public sharing UX

- [ ] Verify ShareView has complete estimate formatting
- [ ] Sections: legs, crew, costs, totals
- [ ] Match vanilla styling (clean, professional layout)
- [ ] Responsive design for mobile
- [ ] CSS classes: `share-estimate-beautiful`, `estimate-section`, etc.

**Reference:**
- Vanilla: `index.html` line 170, CSS lines 1883-2142
- Svelte: Verify `src/lib/components/share/ShareView.svelte`

---

### 11. Share View: Error State
**Priority:** P1 - HIGH
**Impact:** Poor error UX for invalid links

- [ ] Add error state to ShareView
- [ ] Show when share token is invalid/deleted
- [ ] Display friendly error message
- [ ] CTA to create own estimate
- [ ] Warning icon with explanation

**Reference:**
- Vanilla: `index.html` lines 144-160
- Svelte: Update `src/lib/components/share/ShareView.svelte`

---

### 12. Share View: Sign-In CTA Section
**Priority:** P1 - HIGH
**Impact:** Reduced conversions

- [ ] Add sign-in CTA to ShareView
- [ ] Message: "Want to save or modify this estimate?"
- [ ] Button: "Sign in to save estimate"
- [ ] Show for unauthenticated users viewing shared estimate

**Reference:**
- Vanilla: `index.html` lines 188-192
- Svelte: Update `src/lib/components/share/ShareView.svelte`

---

### 13. Share View: Footer Link
**Priority:** P1 - HIGH

- [ ] Add footer link in ShareView
- [ ] Message: "Want to create your own estimate? Start here"
- [ ] Link to main calculator
- [ ] Styled footer section

**Reference:**
- Vanilla: `index.html` lines 200-202
- Svelte: Update `src/lib/components/share/ShareView.svelte`

---

## 🟢 MEDIUM PRIORITY ISSUES (Polish & Refinements)

### 14. Fix Footer Color Scheme
**Priority:** P2 - MEDIUM
**Impact:** Brand inconsistency

- [ ] Change footer background from gray to brand colors
- [ ] Match header color scheme
- [ ] Update primary button from blue to brand red (#bc282e)
- [ ] Verify all button states (hover, active, disabled)
- [ ] Test contrast ratios for accessibility

**Reference:**
- Vanilla: CSS variables in `styles.css`
- Svelte: Update `src/lib/components/layout/Footer.svelte` lines 227-282

---

### 15. Hover Effects on Sections
**Priority:** P2 - MEDIUM

- [ ] Add hover effect to section cards
- [ ] Elevate shadow on hover
- [ ] Smooth transition
- [ ] Apply to all sections (legs, crew, settings, summary)

**Reference:**
- Vanilla: `.section:hover` CSS
- Svelte: Update component styles

---

### 16. Form Input Animations
**Priority:** P2 - MEDIUM

- [ ] Add lift effect on input focus
- [ ] `transform: translateY(-1px)`
- [ ] Smooth transitions
- [ ] Apply to all inputs

**Reference:**
- Vanilla: Input focus CSS
- Svelte: Update global styles or component styles

---

### 17. Estimate Name in Browser Title
**Priority:** P2 - MEDIUM

- [ ] Update `document.title` when estimate is loaded
- [ ] Format: "{EstimateName} - Trip Cost Calculator"
- [ ] Default: "Trip Cost Calculator" when no estimate
- [ ] Update on estimate name change

**Reference:**
- Vanilla: `updateMainHeading()` function
- Svelte: Update in App.svelte or estimates store

---

### 18. Logo Click Handler
**Priority:** P2 - MEDIUM

- [ ] Make logo clickable
- [ ] Return to calculator view (or refresh current view)
- [ ] Test behavior from all views

**Reference:**
- Vanilla: `index.html` lines 43-46, element ID `logoLink`
- Svelte: Update `src/lib/components/layout/Header.svelte`

---

### 19. Profiles View: Header Icon Button
**Priority:** P2 - MEDIUM

- [ ] Add "+" icon button in ProfilesView header
- [ ] Duplicate functionality of bottom "New Profile" button
- [ ] Consistent with vanilla UX

**Reference:**
- Vanilla: `index.html` lines 430-434
- Svelte: Update `src/lib/components/profiles/ProfilesView.svelte`

---

### 20. Estimates View: Header Icon Button
**Priority:** P2 - MEDIUM

- [ ] Add "+" icon button in EstimatesView header
- [ ] Creates new estimate from Estimates view
- [ ] Consistent with vanilla UX

**Reference:**
- Vanilla: `index.html` lines 464-468
- Svelte: Update `src/lib/components/estimates/EstimatesView.svelte`

---

### 21. Profile Editor: Image Upload UX
**Priority:** P2 - MEDIUM

- [ ] Verify custom styled file input button
- [ ] Camera icon button
- [ ] Hidden native file input
- [ ] Preview with remove button overlay
- [ ] Match vanilla styling

**Reference:**
- Vanilla: `.profile-image-button` CSS
- Svelte: Verify `src/lib/components/profiles/ProfileEditor.svelte`

---

### 22. Profile Editor: "Make Default" Checkbox
**Priority:** P2 - MEDIUM

- [ ] Special styling for default profile option
- [ ] Gradient background
- [ ] Border and shadow
- [ ] Match vanilla styling

**Reference:**
- Vanilla: `.default-profile-option` CSS
- Svelte: Verify ProfileEditor component

---

## 🔵 LOW PRIORITY ISSUES (Nice-to-Have)

### 23. Accessibility Audit
**Priority:** P3 - LOW

- [ ] Comprehensive ARIA label review
- [ ] Focus management verification
- [ ] Keyboard navigation testing
- [ ] Screen reader testing (basic)
- [ ] Proper heading hierarchy
- [ ] Color contrast verification (WCAG AA)

---

### 24. Mobile Optimizations
**Priority:** P3 - LOW

- [ ] Verify touch target sizes (min 44px)
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify mobile-specific layouts
- [ ] Test landscape orientation
- [ ] Remove hover effects on touch devices

---

### 25. Loading State Indicators
**Priority:** P3 - LOW

- [ ] Button text changes during operations
- [ ] "Saving..." on save button
- [ ] "Loading..." states
- [ ] Disable buttons during async operations
- [ ] Spinner or progress indicator

---

### 26. Toast Notification Positioning
**Priority:** P3 - LOW

- [ ] Verify toast position below header on mobile
- [ ] CSS: `calc(var(--header-height) + var(--spacing-md))`
- [ ] Test on different screen sizes

**Reference:**
- Svelte: Verify `src/lib/components/ui/Toast.svelte`

---

### 27. Reduced Motion Support
**Priority:** P3 - LOW

- [ ] Add `prefers-reduced-motion` media query
- [ ] Reduce/disable animations for users with motion sensitivity
- [ ] Test with system settings

---

### 28. High Contrast Mode Support
**Priority:** P3 - LOW

- [ ] Add `prefers-contrast: high` media query
- [ ] Enhanced borders for high contrast
- [ ] Test with system settings

---

## 🧪 TESTING CHECKLIST

### Critical Path Testing

**Authentication:**
- [ ] Sign in with email/password
- [ ] Sign out
- [ ] Password reset request
- [ ] Password update
- [ ] Session persistence (page reload)
- [ ] Continue as guest

**Calculator Core:**
- [ ] Add flight leg
- [ ] Remove flight leg
- [ ] Edit leg values
- [ ] Add crew member
- [ ] Remove crew member
- [ ] Edit crew values
- [ ] Calculations update in real-time
- [ ] Profile selector updates calculator settings

**Estimates Management:**
- [ ] Create new estimate
- [ ] Save new estimate
- [ ] Load saved estimate
- [ ] Rename saved estimate (NEW)
- [ ] Delete estimate with confirmation
- [ ] Track unsaved changes (NEW)
- [ ] Discard changes button (NEW)
- [ ] New estimate with confirmation (NEW)
- [ ] Empty state for new users

**Profiles Management:**
- [ ] Create new profile
- [ ] Edit profile
- [ ] Delete profile with confirmation
- [ ] Set default profile
- [ ] Duplicate profile
- [ ] Export profile to JSON
- [ ] Import profile from JSON (NEW)
- [ ] Apply profile to calculator

**Sharing & Export:**
- [ ] Share estimate (authenticated) - all options
- [ ] Share estimate (guest) - limited options
- [ ] Email estimate (text-only)
- [ ] Email estimate (with PDF)
- [ ] Copy shareable link
- [ ] Copy text-only estimate (NEW)
- [ ] Share via device menu (mobile)
- [ ] View shared estimate (public)
- [ ] Import shared estimate to account
- [ ] Share from share view (NEW)
- [ ] Unsaved changes warning when sharing (NEW)
- [ ] Export to PDF
- [ ] PDF preview (desktop)
- [ ] PDF download (mobile)

**Share View:**
- [ ] View shared estimate (valid link)
- [ ] Error state (invalid link)
- [ ] Sign-in CTA visible for guests
- [ ] Import to account (authenticated)
- [ ] Share options from share view
- [ ] Beautiful estimate display
- [ ] Footer link to create own estimate

**Error Handling:**
- [ ] Network error during save
- [ ] Invalid share link
- [ ] Deleted estimate load attempt
- [ ] Auth session expiry
- [ ] Form validation errors

---

### Visual Regression Testing

**Layout & Design:**
- [ ] Header styling matches brand
- [ ] Footer styling matches brand (color fix)
- [ ] Section cards with hover effects
- [ ] Modal designs match vanilla
- [ ] Button states (normal, hover, active, disabled)
- [ ] Form input styling and animations
- [ ] Profile card layouts
- [ ] Estimate card layouts
- [ ] Share view layout

**Responsive Testing:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet portrait (768x1024)
- [ ] Tablet landscape (1024x768)
- [ ] Mobile portrait (375x667)
- [ ] Mobile landscape (667x375)

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] iOS Safari
- [ ] Android Chrome

---

## 📊 PROGRESS TRACKING

**Total Items:** 60+

**By Priority:**
- P0 (Critical): 5 items + 6 modals = 11 items
- P1 (High): 8 items
- P2 (Medium): 9 items
- P3 (Low): 6 items
- Testing: 26+ test scenarios

**Completion Status:**
- [x] Critical (P0): 8/11 complete (73%) - Items #1-4 ✅ + all 5 modals created ✅ (need integration)
- [ ] High (P1): 1/8 complete (12%) - EmptyState exists
- [ ] Medium (P2): 0/9 complete (0%)
- [ ] Low (P3): 0/6 complete (0%)

**Note:** Modal components (#5b-5f) are created but need to be integrated into their respective parent components.

---

## 📝 NOTES

### Restore Point
- **Tag:** v2.0-beta-1
- **Created:** 2025-11-28
- **To restore:** `git checkout v2.0-beta-1`

### Comparison Reference
- **Vanilla JS:** `git checkout v1.0-vanilla-js`
- **Svelte Branch:** `git checkout svelte-migration`

### Development Workflow
1. Pick an item from this list (start with P0/Critical)
2. Implement the feature/fix
3. Test thoroughly
4. Check off item in this document
5. Commit with descriptive message
6. Update progress percentage

### Commit Convention
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code restructuring
- `style:` - Visual/CSS updates
- `test:` - Testing updates
- `docs:` - Documentation

---

## 🎯 RECOMMENDED WORK ORDER

### Week 1: Critical Fixes
1. Unsaved changes tracking (#1)
2. Discard changes button (#2)
3. New estimate button & confirmation (#4)
4. Rename estimate functionality (#3)
5. Enhanced share modal options (#5a)

### Week 2: Missing Modals & High Priority
6. All remaining modals (#5b-5f)
7. Page loader (#6)
8. Empty state integration (#7)
9. Share view completion (#10-13)
10. Auth tip for guests (#8)

### Week 3: Polish & Testing
11. Footer color scheme (#14)
12. Profile section visibility (#9)
13. Remaining medium priority items
14. Complete testing checklist
15. Visual regression testing
16. Cross-browser testing

---

## Last Updated
- **Date:** 2025-11-28
- **By:** Beta testing analysis
- **Next Review:** After completing P0 items
