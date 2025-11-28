<script>
  import { allProfiles, selectedProfileId, selectProfile } from '$lib/stores/profiles';
  import { isAuthenticated } from '$lib/stores/auth';
  import { openModal } from '$lib/stores/ui';

  function handleProfileChange(event) {
    const profileId = event.target.value;
    selectProfile(profileId);
  }

  function handleManageProfiles() {
    openModal('profiles');
  }

  function handleNewProfile() {
    openModal('profileEditor');
  }

  // Separate profiles into standard and custom
  $: standardProfiles = $allProfiles.filter(p => p.isStandard);
  $: customProfiles = $allProfiles.filter(p => !p.isStandard);
</script>

<div class="profile-selector">
  <div class="selector-wrapper">
    <label for="profile-select">Aircraft Profile</label>
    <select
      id="profile-select"
      bind:value={$selectedProfileId}
      on:change={handleProfileChange}
    >
      <optgroup label="Standard Profiles">
        {#each standardProfiles as profile (profile.id)}
          <option value={profile.id}>{profile.name}</option>
        {/each}
      </optgroup>

      {#if customProfiles.length > 0}
        <optgroup label="My Profiles">
          {#each customProfiles as profile (profile.id)}
            <option value={profile.id}>
              {profile.name}
              {#if profile.isDefault}(Default){/if}
            </option>
          {/each}
        </optgroup>
      {/if}
    </select>
  </div>

  <div class="profile-actions">
    {#if $isAuthenticated}
      <button
        type="button"
        class="btn-secondary btn-small"
        on:click={handleManageProfiles}
        title="Manage Profiles"
      >
        Manage
      </button>
      <button
        type="button"
        class="btn-primary btn-small"
        on:click={handleNewProfile}
        title="Create New Profile"
      >
        + New
      </button>
    {:else}
      <span class="auth-hint">Sign in to create custom profiles</span>
    {/if}
  </div>
</div>

<style>
  .profile-selector {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .selector-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  select {
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    background: white;
    cursor: pointer;
    transition: all 0.15s;
  }

  select:hover {
    border-color: #9ca3af;
  }

  select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  optgroup {
    font-weight: 600;
    color: #6b7280;
  }

  option {
    font-weight: 400;
    color: #1f2937;
  }

  .profile-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-small {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .auth-hint {
    font-size: 0.75rem;
    color: #6b7280;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .profile-selector {
      flex-direction: column;
      align-items: stretch;
    }

    .profile-actions {
      justify-content: flex-start;
    }

    .auth-hint {
      text-align: left;
    }
  }
</style>
