<script>
  import { isAuthenticated, userEmail, signOut } from '$lib/stores/auth.js';
  import { openModal, showToast } from '$lib/stores/ui.js';

  // Props
  export let onMobileMenuToggle = () => {};

  // Local state
  let showUserDropdown = false;

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      showToast('Failed to sign out: ' + error.message, 'error');
      return;
    }

    showToast('Signed out successfully', 'success');
    showUserDropdown = false;
  }

  function handleSignIn() {
    openModal('sign-in');
  }

  function handleMyEstimates() {
    // TODO: Navigate to estimates view
    console.log('Navigate to My Estimates');
  }

  function handleProfiles() {
    // TODO: Navigate to profiles view
    console.log('Navigate to Profiles');
  }

  function toggleUserDropdown() {
    showUserDropdown = !showUserDropdown;
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event) {
    if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
      showUserDropdown = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="header">
  <div class="header-content">
    <div class="logo">
      <h1>Trip Cost Calculator</h1>
    </div>

    <nav class="desktop-nav">
      {#if $isAuthenticated}
        <button type="button" class="nav-btn" on:click={handleMyEstimates}>
          My Estimates
        </button>
        <button type="button" class="nav-btn" on:click={handleProfiles}>
          Profiles
        </button>

        <div class="user-dropdown-container">
          <button
            type="button"
            class="user-btn"
            on:click|stopPropagation={toggleUserDropdown}
            aria-label="User menu"
          >
            <span class="user-email">{$userEmail}</span>
            <span class="dropdown-arrow">{showUserDropdown ? '▲' : '▼'}</span>
          </button>

          {#if showUserDropdown}
            <div class="user-dropdown">
              <button type="button" class="dropdown-item" on:click={handleSignOut}>
                Sign Out
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <button type="button" class="nav-btn" on:click={handleSignIn}>
          Sign In
        </button>
      {/if}
    </nav>

    <button
      type="button"
      class="mobile-menu-btn"
      on:click={onMobileMenuToggle}
      aria-label="Menu"
    >
      ☰
    </button>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .desktop-nav {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  .nav-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .nav-btn.secondary {
    background: transparent;
    border: none;
  }

  .user-dropdown-container {
    position: relative;
  }

  .user-btn {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .user-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .user-email {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dropdown-arrow {
    font-size: 0.75rem;
  }

  .user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 150px;
    overflow: hidden;
    z-index: 100;
  }

  .dropdown-item {
    width: 100%;
    background: white;
    color: #374151;
    border: none;
    padding: 0.75rem 1rem;
    text-align: left;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background: #f3f4f6;
  }

  .mobile-menu-btn {
    display: none;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
  }

  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }

    .mobile-menu-btn {
      display: block;
    }

    .logo h1 {
      font-size: 1.25rem;
    }
  }
</style>
