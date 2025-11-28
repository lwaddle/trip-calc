<script>
  // Placeholder for future auth integration
  let isAuthenticated = false;
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <h1>Trip Cost Calculator</h1>
    </div>

    <nav class="desktop-nav">
      {#if isAuthenticated}
        <button type="button" class="nav-btn">My Estimates</button>
        <button type="button" class="nav-btn">Profiles</button>
        <button type="button" class="nav-btn secondary">Sign Out</button>
      {:else}
        <button type="button" class="nav-btn">Sign In</button>
      {/if}
    </nav>

    <button type="button" class="mobile-menu-btn" aria-label="Menu">
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
