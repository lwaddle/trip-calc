<script>
  import ProfilesList from './ProfilesList.svelte';
  import ImportProfileModal from './ImportProfileModal.svelte';
  import { closeModal, openModal, showToast } from '$lib/stores/ui';
  import { userProfiles, saveProfile } from '$lib/stores/profiles';

  let showImportModal = false;

  function handleBack() {
    closeModal();
  }

  function handleNewProfile() {
    openModal('profileEditor');
  }

  function handleImportClick() {
    showImportModal = true;
  }

  async function handleImport(profileData) {
    // The modal already validated the profile data
    const { data, error } = await saveProfile(profileData);

    if (error) {
      showToast(error.message || 'Failed to import profile', 'error');
    }
    // Success toast is shown by the modal itself
  }

  function closeImportModal() {
    showImportModal = false;
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

    <div class="header-actions">
      <button
        type="button"
        class="btn-import"
        on:click={handleImportClick}
        aria-label="Import profile"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 14V6M10 6L7 9M10 6L13 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 12V13C3 14.6569 4.34315 16 6 16H14C15.6569 16 17 14.6569 17 13V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>Import</span>
      </button>

      <button
        type="button"
        class="btn-new"
        on:click={handleNewProfile}
        aria-label="Create new profile"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 5V15M5 10H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>New</span>
      </button>
    </div>
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

<!-- Import Profile Modal -->
<ImportProfileModal
  isOpen={showImportModal}
  onClose={closeImportModal}
  onImport={handleImport}
/>

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

  .btn-back {
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

  .btn-back:hover {
    background: #f3f4f6;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-import,
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
    border-radius: 6px;
    transition: all 0.15s;
  }

  .btn-import {
    color: #374151;
  }

  .btn-import:hover {
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
    .btn-import span,
    .btn-new span {
      display: none;
    }

    .header-actions {
      gap: 0.25rem;
    }

    .profiles-content {
      padding: 1rem;
    }

    .empty-state {
      padding: 3rem 1rem;
    }
  }
</style>
