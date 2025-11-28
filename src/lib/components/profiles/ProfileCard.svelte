<script>
  import { removeProfile, makeDefaultProfile, duplicateProfile, exportProfileToJSON } from '$lib/stores/profiles';
  import { openModal, showToast } from '$lib/stores/ui';
  import { formatCurrency } from '$lib/utils/formatters';
  import DeleteProfileConfirmModal from './DeleteProfileConfirmModal.svelte';

  export let profile;

  let showMenu = false;
  let isDeleting = false;
  let showDeleteConfirm = false;

  function toggleMenu() {
    showMenu = !showMenu;
  }

  function closeMenu() {
    showMenu = false;
  }

  function handleEdit() {
    closeMenu();
    openModal('profileEditor', { profile });
  }

  async function handleSetDefault() {
    closeMenu();
    const { error } = await makeDefaultProfile(profile.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(`${profile.name} set as default profile`, 'success');
    }
  }

  async function handleDuplicate() {
    closeMenu();
    const { data, error } = await duplicateProfile(profile.id);

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(`${profile.name} duplicated successfully`, 'success');
    }
  }

  function handleExport() {
    closeMenu();
    const jsonString = exportProfileToJSON(profile.id);

    if (!jsonString) {
      showToast('Failed to export profile', 'error');
      return;
    }

    // Download as JSON file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Profile exported successfully', 'success');
  }

  function handleDelete() {
    closeMenu();
    showDeleteConfirm = true;
  }

  async function confirmDelete() {
    isDeleting = true;
    const { error } = await removeProfile(profile.id);
    isDeleting = false;

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(`${profile.name} deleted successfully`, 'success');
    }

    showDeleteConfirm = false;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
  }

  // Close menu when clicking outside
  function handleClickOutside(event) {
    if (showMenu && !event.target.closest('.profile-card')) {
      closeMenu();
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="profile-card" class:deleting={isDeleting}>
  {#if profile.isDefault}
    <div class="default-badge">Default</div>
  {/if}

  <div class="card-header">
    {#if profile.profileImageUrl}
      <div class="profile-image">
        <img src={profile.profileImageUrl} alt={profile.name} />
      </div>
    {:else}
      <div class="profile-placeholder">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 20L32 14M20 20L8 14M20 20V32" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    {/if}

    <button
      type="button"
      class="menu-button"
      on:click|stopPropagation={toggleMenu}
      aria-label="Profile menu"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="5" r="1.5" fill="currentColor"/>
        <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
        <circle cx="10" cy="15" r="1.5" fill="currentColor"/>
      </svg>
    </button>

    {#if showMenu}
      <div class="dropdown-menu">
        <button type="button" on:click={handleEdit}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11.333 2L14 4.667L5.333 13.333H2.667V10.667L11.333 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Edit
        </button>

        {#if !profile.isDefault}
          <button type="button" on:click={handleSetDefault}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L10 6L14 6.5L11 9.5L11.5 14L8 12L4.5 14L5 9.5L2 6.5L6 6L8 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Set as Default
          </button>
        {/if}

        <button type="button" on:click={handleDuplicate}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 14H14V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Duplicate
        </button>

        <button type="button" on:click={handleExport}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Export
        </button>

        <hr />

        <button type="button" class="danger" on:click={handleDelete}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4H14M6 4V2H10V4M5 4V14H11V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    {/if}
  </div>

  <div class="card-content">
    <h3>{profile.name}</h3>

    <div class="profile-details">
      <div class="detail-row">
        <span class="label">Fuel Price:</span>
        <span class="value">{formatCurrency(profile.fuelPrice)}/gal</span>
      </div>

      <div class="detail-row">
        <span class="label">Pilots:</span>
        <span class="value">{profile.pilotsRequired} @ {formatCurrency(profile.pilotRate)}</span>
      </div>

      {#if profile.attendantsRequired > 0}
        <div class="detail-row">
          <span class="label">Attendants:</span>
          <span class="value">{profile.attendantsRequired} @ {formatCurrency(profile.attendantRate)}</span>
        </div>
      {/if}

      <div class="detail-row">
        <span class="label">Hotel:</span>
        <span class="value">{formatCurrency(profile.hotelRate)}/night</span>
      </div>

      <div class="detail-row">
        <span class="label">Meals:</span>
        <span class="value">{formatCurrency(profile.mealsRate)}/day</span>
      </div>

      <div class="detail-row">
        <span class="label">Maintenance:</span>
        <span class="value">{formatCurrency(profile.maintenanceRate)}/hr</span>
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
<DeleteProfileConfirmModal
  isOpen={showDeleteConfirm}
  profileName={profile.name}
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
  isDeleting={isDeleting}
/>

<style>
  .profile-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.15s;
    position: relative;
  }

  .profile-card:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .profile-card.deleting {
    opacity: 0.5;
    pointer-events: none;
  }

  .default-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    background: #2563eb;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    z-index: 2;
  }

  .card-header {
    position: relative;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-image,
  .profile-placeholder {
    width: 80px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .profile-placeholder {
    color: #2563eb;
  }

  .menu-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.15s;
  }

  .menu-button:hover {
    background: #f9fafb;
    color: #1f2937;
  }

  .dropdown-menu {
    position: absolute;
    top: 3rem;
    right: 0.75rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 10;
    min-width: 180px;
    padding: 0.5rem 0;
  }

  .dropdown-menu button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
    text-align: left;
    transition: background 0.15s;
  }

  .dropdown-menu button:hover {
    background: #f9fafb;
  }

  .dropdown-menu button.danger {
    color: #dc2626;
  }

  .dropdown-menu button.danger:hover {
    background: #fef2f2;
  }

  .dropdown-menu hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0.5rem 0;
  }

  .card-content {
    padding: 1.5rem;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
  }

  .profile-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
  }

  .label {
    color: #6b7280;
  }

  .value {
    color: #1f2937;
    font-weight: 500;
  }
</style>
