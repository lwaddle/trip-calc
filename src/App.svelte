<script>
  import { onMount } from 'svelte';
  import { initialize as initAuth, isPasswordRecovery } from '$lib/stores/auth.js';
  import { activeModal, openModal } from '$lib/stores/ui.js';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import MobileMenu from '$lib/components/layout/MobileMenu.svelte';
  import CalculatorForm from '$lib/components/calculator/CalculatorForm.svelte';
  import SignInView from '$lib/components/auth/SignInView.svelte';
  import SignInModal from '$lib/components/auth/SignInModal.svelte';
  import PasswordResetModal from '$lib/components/auth/PasswordResetModal.svelte';
  import UpdatePasswordModal from '$lib/components/auth/UpdatePasswordModal.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';

  let isReady = false;
  let showSignInView = true; // Show sign-in by default
  let mobileMenuOpen = false;

  onMount(async () => {
    console.log('Trip Cost Calculator (Svelte) - Initialized');

    // Initialize auth system
    const user = await initAuth();

    // If user is already signed in, skip sign-in view
    if (user) {
      showSignInView = false;
    }

    // Check if this is a password recovery flow
    if (isPasswordRecovery()) {
      showSignInView = false;
      openModal('update-password');
    }

    isReady = true;
  });

  function handleContinueAsGuest() {
    showSignInView = false;
  }

  function handleSignInSuccess() {
    showSignInView = false;
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<div class="app">
  {#if isReady}
    {#if showSignInView}
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
          <CalculatorForm />
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
