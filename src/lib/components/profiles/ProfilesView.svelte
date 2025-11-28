<script>
  import ProfilesList from './ProfilesList.svelte';
  import { closeModal, openModal } from '$lib/stores/ui';
  import { userProfiles } from '$lib/stores/profiles';

  function handleBack() {
    closeModal();
  }

  function handleNewProfile() {
    openModal('profileEditor');
  }
</script>

<div class="profiles-view">
  <div class="profiles-header">
    <button
      type="button"
      class="btn-back"
      on:click={handleBack}
      aria-label="Back to calculator"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Back</span>
    </button>

    <h1>My Profiles</h1>

    <button
      type="button"
      class="btn-new"
      on:click={handleNewProfile}
      aria-label="Create new profile"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>New Profile</span>
    </button>
  </div>

  <div class="profiles-content">
    {#if $userProfiles.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 16V48M16 32H48" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
        <h2>No Custom Profiles</h2>
        <p>Create custom aircraft profiles to save time on future estimates.</p>
        <button
          type="button"
          class="btn-primary"
          on:click={handleNewProfile}
        >
          Create Your First Profile
        </button>
      </div>
    {:else}
      <ProfilesList />
    {/if}
  </div>
</div>

<style>
  .profiles-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f9fafb;
    z-index: 1000;
    overflow-y: auto;
  }

  .profiles-header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  h1 {
    flex: 1;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
  }

  .btn-back,
  .btn-new {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    border-radius: 6px;
    transition: all 0.15s;
  }

  .btn-back:hover,
  .btn-new:hover {
    background: #f3f4f6;
  }

  .btn-new {
    color: #2563eb;
  }

  .btn-new:hover {
    background: #eff6ff;
  }

  .profiles-content {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .empty-icon {
    width: 80px;
    height: 80px;
    background: #eff6ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    color: #2563eb;
  }

  .empty-state h2 {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .empty-state p {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    max-width: 400px;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  @media (max-width: 768px) {
    .profiles-header {
      padding: 1rem;
    }

    h1 {
      font-size: 1.25rem;
    }

    .btn-back span,
    .btn-new span {
      display: none;
    }

    .profiles-content {
      padding: 1rem;
    }

    .empty-state {
      padding: 3rem 1rem;
    }
  }
</style>
