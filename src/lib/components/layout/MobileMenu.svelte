<script>
  import { isAuthenticated, userEmail, signOut } from '$lib/stores/auth.js';
  import { openModal, showToast } from '$lib/stores/ui.js';

  // Props
  export let isOpen = false;
  export let onClose = () => {};

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      showToast('Failed to sign out: ' + error.message, 'error');
      return;
    }

    showToast('Signed out successfully', 'success');
    onClose();
  }

  function handleSignIn() {
    openModal('sign-in');
    onClose();
  }

  function handleMyEstimates() {
    // TODO: Navigate to estimates view
    console.log('Navigate to My Estimates');
    onClose();
  }

  function handleProfiles() {
    // TODO: Navigate to profiles view
    console.log('Navigate to Profiles');
    onClose();
  }

  function handleOverlayClick() {
    onClose();
  }
</script>

{#if isOpen}
  <div class="mobile-menu-overlay" on:click={handleOverlayClick}>
    <div class="mobile-menu" on:click|stopPropagation>
      <div class="menu-header">
        <h2>Menu</h2>
        <button
          type="button"
          class="close-btn"
          on:click={onClose}
          aria-label="Close menu"
        >
          ×
        </button>
      </div>

      <nav class="menu-nav">
        {#if $isAuthenticated}
          <div class="user-info">
            <span class="user-email">{$userEmail}</span>
          </div>

          <button type="button" class="menu-item" on:click={handleMyEstimates}>
            My Estimates
          </button>

          <button type="button" class="menu-item" on:click={handleProfiles}>
            Profiles
          </button>

          <div class="menu-divider"></div>

          <button type="button" class="menu-item sign-out" on:click={handleSignOut}>
            Sign Out
          </button>
        {:else}
          <button type="button" class="menu-item primary" on:click={handleSignIn}>
            Sign In
          </button>
        {/if}
      </nav>
    </div>
  </div>
{/if}

<style>
  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    animation: fadeIn 0.2s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .mobile-menu {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 80%;
    max-width: 320px;
    background: white;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.2s ease-in-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
  }

  .menu-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-nav {
    padding: 1rem 0;
  }

  .user-info {
    padding: 1rem 1.5rem;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 0.5rem;
  }

  .user-email {
    font-size: 0.875rem;
    color: #374151;
    font-weight: 500;
    word-break: break-all;
  }

  .menu-item {
    width: 100%;
    background: white;
    color: #374151;
    border: none;
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: block;
  }

  .menu-item:hover {
    background: #f3f4f6;
  }

  .menu-item.primary {
    color: #2563eb;
  }

  .menu-item.sign-out {
    color: #dc2626;
  }

  .menu-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 0.5rem 0;
  }
</style>
