<script>
  import { saveProfile, editProfile } from '$lib/stores/profiles';
  import { closeModal, showToast, modalData } from '$lib/stores/ui';
  import { onMount } from 'svelte';

  // Check if we're editing an existing profile
  let editingProfile = null;
  let isEditMode = false;

  // Form data
  let formData = {
    name: '',
    fuelPrice: 6.00,
    fuelDensity: 6.7,
    pilotsRequired: 2,
    pilotRate: 0,
    attendantsRequired: 0,
    attendantRate: 0,
    hotelRate: 0,
    mealsRate: 0,
    maintenanceRate: 0,
    apuBurn: 0,
    isDefault: false,
    profileImageUrl: null
  };

  // Image upload
  let imageFile = null;
  let imagePreview = null;
  let isUploading = false;

  // Form state
  let isSaving = false;
  let errors = {};

  onMount(() => {
    const unsubscribe = modalData.subscribe(data => {
      if (data && data.profile) {
        editingProfile = data.profile;
        isEditMode = true;
        formData = { ...data.profile };
        imagePreview = data.profile.profileImageUrl;
      }
    });

    return unsubscribe;
  });

  function handleCancel() {
    closeModal();
  }

  function validateForm() {
    errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Profile name is required';
    }

    if (formData.fuelPrice < 0) {
      errors.fuelPrice = 'Fuel price must be positive';
    }

    if (formData.fuelDensity < 0) {
      errors.fuelDensity = 'Fuel density must be positive';
    }

    if (formData.pilotsRequired < 0) {
      errors.pilotsRequired = 'Pilots required must be positive';
    }

    if (formData.pilotRate < 0) {
      errors.pilotRate = 'Pilot rate must be positive';
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSave() {
    if (!validateForm()) {
      return;
    }

    isSaving = true;

    try {
      let result;

      if (isEditMode) {
        result = await editProfile(editingProfile.id, formData);
      } else {
        result = await saveProfile(formData);
      }

      if (result.error) {
        showToast(result.error.message, 'error');
      } else {
        showToast(
          isEditMode ? 'Profile updated successfully' : 'Profile created successfully',
          'success'
        );
        closeModal();
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      isSaving = false;
    }
  }

  function handleImageSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    imageFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    // In a real app, you would upload the image to storage here
    // For now, we'll just store the data URL
    // TODO: Implement image upload to Supabase Storage
    formData.profileImageUrl = imagePreview;
  }

  function handleRemoveImage() {
    imageFile = null;
    imagePreview = null;
    formData.profileImageUrl = null;
  }
</script>

<div class="modal-overlay" on:click={handleCancel}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <h2>{isEditMode ? 'Edit Profile' : 'New Profile'}</h2>
      <button
        type="button"
        class="close-button"
        on:click={handleCancel}
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <form class="modal-body" on:submit|preventDefault={handleSave}>
      <!-- Profile Image -->
      <div class="image-section">
        <label>Profile Image (Optional)</label>
        {#if imagePreview}
          <div class="image-preview">
            <img src={imagePreview} alt="Profile preview" />
            <button
              type="button"
              class="remove-image"
              on:click={handleRemoveImage}
              aria-label="Remove image"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        {:else}
          <div class="image-upload">
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              on:change={handleImageSelect}
            />
            <label for="profile-image" class="upload-label">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 8V24M8 16H24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Add Image</span>
            </label>
          </div>
        {/if}
      </div>

      <!-- Profile Name -->
      <div class="form-group">
        <label for="profile-name">Profile Name *</label>
        <input
          id="profile-name"
          type="text"
          bind:value={formData.name}
          placeholder="e.g., Citation Excel"
          class:error={errors.name}
          required
        />
        {#if errors.name}
          <span class="error-message">{errors.name}</span>
        {/if}
      </div>

      <!-- Fuel Settings -->
      <div class="section-title">Fuel Settings</div>
      <div class="form-row">
        <div class="form-group">
          <label for="fuel-price">Fuel Price ($/gal) *</label>
          <input
            id="fuel-price"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.fuelPrice}
            class:error={errors.fuelPrice}
            required
          />
          {#if errors.fuelPrice}
            <span class="error-message">{errors.fuelPrice}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="fuel-density">Fuel Density (lbs/gal) *</label>
          <input
            id="fuel-density"
            type="number"
            min="0"
            step="0.1"
            bind:value={formData.fuelDensity}
            class:error={errors.fuelDensity}
            required
          />
          {#if errors.fuelDensity}
            <span class="error-message">{errors.fuelDensity}</span>
          {/if}
        </div>
      </div>

      <!-- Crew Settings -->
      <div class="section-title">Crew Settings</div>
      <div class="form-row">
        <div class="form-group">
          <label for="pilots-required">Pilots Required</label>
          <input
            id="pilots-required"
            type="number"
            min="0"
            bind:value={formData.pilotsRequired}
            class:error={errors.pilotsRequired}
          />
        </div>

        <div class="form-group">
          <label for="pilot-rate">Pilot Rate ($/day)</label>
          <input
            id="pilot-rate"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.pilotRate}
            class:error={errors.pilotRate}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="attendants-required">Flight Attendants</label>
          <input
            id="attendants-required"
            type="number"
            min="0"
            bind:value={formData.attendantsRequired}
          />
        </div>

        <div class="form-group">
          <label for="attendant-rate">Attendant Rate ($/day)</label>
          <input
            id="attendant-rate"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.attendantRate}
          />
        </div>
      </div>

      <!-- Other Rates -->
      <div class="section-title">Other Rates</div>
      <div class="form-row">
        <div class="form-group">
          <label for="hotel-rate">Hotel Rate ($/night)</label>
          <input
            id="hotel-rate"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.hotelRate}
          />
        </div>

        <div class="form-group">
          <label for="meals-rate">Meals Rate ($/day)</label>
          <input
            id="meals-rate"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.mealsRate}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="maintenance-rate">Maintenance Rate ($/hr)</label>
          <input
            id="maintenance-rate"
            type="number"
            min="0"
            step="0.01"
            bind:value={formData.maintenanceRate}
          />
        </div>

        <div class="form-group">
          <label for="apu-burn">APU Burn (lbs/hr)</label>
          <input
            id="apu-burn"
            type="number"
            min="0"
            bind:value={formData.apuBurn}
          />
        </div>
      </div>

      <!-- Default checkbox -->
      <div class="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            bind:checked={formData.isDefault}
          />
          <span>Set as default profile</span>
        </label>
      </div>
    </form>

    <div class="modal-footer">
      <button
        type="button"
        class="btn-secondary"
        on:click={handleCancel}
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn-primary"
        on:click={handleSave}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : isEditMode ? 'Update Profile' : 'Create Profile'}
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
    overflow-y: auto;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.15s;
  }

  .close-button:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .image-section {
    margin-bottom: 1.5rem;
  }

  .image-section > label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .image-preview {
    position: relative;
    width: 160px;
    height: 120px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  }

  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s;
  }

  .remove-image:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .image-upload {
    position: relative;
  }

  .image-upload input[type="file"] {
    display: none;
  }

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 160px;
    height: 120px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.15s;
  }

  .upload-label:hover {
    border-color: #2563eb;
    color: #2563eb;
    background: #eff6ff;
  }

  .upload-label span {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 1.5rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  input[type="text"],
  input[type="number"] {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  input[type="text"]:focus,
  input[type="number"]:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  input.error {
    border-color: #dc2626;
  }

  input.error:focus {
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }

  .error-message {
    display: block;
    font-size: 0.75rem;
    color: #dc2626;
    margin-top: 0.25rem;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .checkbox-group input[type="checkbox"] {
    width: auto;
    cursor: pointer;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  button {
    padding: 0.625rem 1.25rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    border: none;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
  }

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .modal-content {
      max-height: 100vh;
      border-radius: 0;
    }
  }
</style>
