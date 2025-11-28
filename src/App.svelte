<script>
  import { onMount } from 'svelte';
  import { initialize as initAuth, isPasswordRecovery, user, isAuthenticated } from '$lib/stores/auth.js';
  import { activeModal, openModal } from '$lib/stores/ui.js';
  import { loadUserProfiles } from '$lib/stores/profiles.js';
  import { initEstimates, currentEstimateId, currentEstimateName, newEstimate } from '$lib/stores/estimates.js';
  import { isShareView } from '$lib/stores/share.js';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import MobileMenu from '$lib/components/layout/MobileMenu.svelte';
  import CalculatorForm from '$lib/components/calculator/CalculatorForm.svelte';
  import SignInView from '$lib/components/auth/SignInView.svelte';
  import SignInModal from '$lib/components/auth/SignInModal.svelte';
  import PasswordResetModal from '$lib/components/auth/PasswordResetModal.svelte';
  import UpdatePasswordModal from '$lib/components/auth/UpdatePasswordModal.svelte';
  import ProfilesView from '$lib/components/profiles/ProfilesView.svelte';
  import ProfileEditor from '$lib/components/profiles/ProfileEditor.svelte';
  import EstimatesView from '$lib/components/estimates/EstimatesView.svelte';
  import RenameEstimateModal from '$lib/components/estimates/RenameEstimateModal.svelte';
  import ShareView from '$lib/components/share/ShareView.svelte';
  import EmptyState from '$lib/components/estimates/EmptyState.svelte';
  import PageLoader from '$lib/components/ui/PageLoader.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';

  let isReady = false;
  let showSignInView = true; // Show sign-in by default
  let mobileMenuOpen = false;
  let shareToken = null;
  let showRenameModal = false;
  let userHasInteracted = false; // Track if user clicked "New Estimate"

  // Compute page title based on estimate name
  $: pageTitle = $currentEstimateName || 'Trip Cost Calculator';

  // Update browser title when estimate name changes
  $: if (typeof document !== 'undefined') {
    document.title = $currentEstimateName
      ? `${$currentEstimateName} - Trip Cost Calculator`
      : 'Trip Cost Calculator';
  }

  onMount(async () => {
    console.log('Trip Cost Calculator (Svelte) - Initialized');

    // Check for share token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('share');

    if (shareParam) {
      // Share view mode - load shared estimate
      shareToken = shareParam;
      showSignInView = false;
    } else {
      // Normal flow
      // Initialize auth system
      const currentUser = await initAuth();

      // If user is already signed in, skip sign-in view and load profiles + estimates
      if (currentUser) {
        showSignInView = false;
        await loadUserProfiles();
        initEstimates();
      }

      // Check if this is a password recovery flow
      if (isPasswordRecovery()) {
        showSignInView = false;
        openModal('update-password');
      }
    }

    isReady = true;
  });

  // Watch for user changes to load/unload profiles and estimates
  $: if ($user) {
    loadUserProfiles();
    initEstimates();
  }

  function handleContinueAsGuest() {
    showSignInView = false;
  }

  async function handleSignInSuccess() {
    showSignInView = false;
    await loadUserProfiles();
    initEstimates();
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function handleRenameClick() {
    showRenameModal = true;
  }

  function handleNewEstimateFromEmpty() {
    console.log('handleNewEstimateFromEmpty called');
    // Start a new estimate (clears calculator and current estimate tracking)
    userHasInteracted = true; // Mark that user wants to use the calculator
    console.log('userHasInteracted set to:', userHasInteracted);
    newEstimate();
    console.log('newEstimate() called');
  }

  function handleViewEstimatesFromEmpty() {
    openModal('estimates');
  }

  // Determine if we should show empty state
  // Show empty state only if: authenticated, no estimate loaded, not on sign-in view, and user hasn't clicked "New Estimate"
  $: showEmptyState = $isAuthenticated && !$currentEstimateId && !showSignInView && !userHasInteracted;
</script>

<PageLoader isLoading={!isReady} />

<div class="app">
  {#if isReady}
    {#if shareToken && $isShareView}
      <!-- Share view mode (public shared estimate) -->
      <ShareView {shareToken} />
    {:else if showSignInView}
      <!-- Sign-in view for unauthenticated users -->
      <SignInView
        onContinueAsGuest={handleContinueAsGuest}
        onSignInSuccess={handleSignInSuccess}
      />
    {:else}
      <!-- Main app view -->
      <Header onMobileMenuToggle={toggleMobileMenu} />

      <main class="main-content">
        <div class="container">
          <!-- Page heading with optional rename button -->
          <div class="heading-container">
            <h1 class="main-heading">{pageTitle}</h1>
            {#if $isAuthenticated && $currentEstimateId}
              <button
                class="btn-icon rename-icon"
                on:click={handleRenameClick}
                title="Rename estimate"
                aria-label="Rename estimate"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" fill="currentColor">
                  <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"/>
                </svg>
              </button>
            {/if}
          </div>

          {#if showEmptyState}
            <EmptyState
              onNewEstimate={handleNewEstimateFromEmpty}
              onViewEstimates={handleViewEstimatesFromEmpty}
            />
          {:else}
            <CalculatorForm />
          {/if}
        </div>
      </main>

      <Footer />

      <!-- Mobile menu -->
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

      <!-- Modals -->
      {#if $activeModal === 'sign-in'}
        <SignInModal />
      {/if}

      {#if $activeModal === 'password-reset'}
        <PasswordResetModal />
      {/if}

      {#if $activeModal === 'update-password'}
        <UpdatePasswordModal />
      {/if}

      {#if $activeModal === 'profiles'}
        <ProfilesView />
      {/if}

      {#if $activeModal === 'profileEditor'}
        <ProfileEditor />
      {/if}

      {#if $activeModal === 'estimates'}
        <EstimatesView />
      {/if}

      <!-- Rename Estimate Modal -->
      <RenameEstimateModal
        isOpen={showRenameModal}
        onClose={() => showRenameModal = false}
      />
    {/if}

    <!-- Toast notifications (always available) -->
    <Toast />
  {:else}
    <div class="loading">
      <p>Loading...</p>
    </div>
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f3f4f6;
  }

  .main-content {
    flex: 1;
    padding: 2rem 1.5rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .heading-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  .main-heading {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .btn-icon {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-icon:hover {
    background: #f1f5f9;
    color: #2563eb;
  }

  .rename-icon svg {
    width: 20px;
    height: 20px;
  }

  .loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading p {
    font-size: 1.25rem;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .main-content {
      padding: 1rem;
    }
  }
</style>
