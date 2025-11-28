<script>
  import { showToast } from '$lib/stores/ui.js';

  export let isOpen = false;
  export let onClose = () => {};
  export let onImport = async (profileData) => {}; // Callback with parsed profile data

  let fileInput;
  let selectedFile = null;
  let isImporting = false;
  let error = null;

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
      selectedFile = null;
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      error = 'Please select a valid JSON file';
      selectedFile = null;
      return;
    }

    selectedFile = file;
    error = null;
  }

  async function handleImport() {
    if (!selectedFile) {
      error = 'Please select a file to import';
      return;
    }

    isImporting = true;
    error = null;

    try {
      // Read file contents
      const fileContent = await selectedFile.text();

      // Parse JSON
      let profileData;
      try {
        profileData = JSON.parse(fileContent);
      } catch (parseError) {
        error = 'Invalid JSON file format';
        isImporting = false;
        return;
      }

      // Validate profile structure
      if (!profileData.name) {
        error = 'Invalid profile format: missing "name" field';
        isImporting = false;
        return;
      }

      // Call the import callback
      await onImport(profileData);

      // Success - close modal
      showToast('Profile imported successfully', 'success');
      handleClose();
    } catch (err) {
      console.error('Import error:', err);
      error = err.message || 'Failed to import profile';
    }

    isImporting = false;
  }

  function handleClose() {
    selectedFile = null;
    error = null;
    if (fileInput) {
      fileInput.value = '';
    }
    onClose();
  }

  function handleBrowseClick() {
    fileInput?.click();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={handleClose} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="import-profile-title">
      <div class="modal-header">
        <h2 id="import-profile-title">Import Profile</h2>
        <button class="close-btn" on:click={handleClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="description">
          Import a previously exported profile from a JSON file. The profile will be added to your account.
        </p>

        <div class="file-upload-section">
          <input
            type="file"
            accept=".json,application/json"
            bind:this={fileInput}
            on:change={handleFileSelect}
            class="file-input"
            id="profile-file-input"
          />

          <div class="file-upload-display">
            {#if selectedFile}
              <div class="selected-file">
                <svg class="file-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <span class="file-name">{selectedFile.name}</span>
                <button
                  type="button"
                  class="remove-file-btn"
                  on:click={() => {
                    selectedFile = null;
                    fileInput.value = '';
                  }}
                  aria-label="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            {:else}
              <button type="button" class="browse-btn" on:click={handleBrowseClick}>
                <svg class="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Choose JSON file</span>
              </button>
            {/if}
          </div>
        </div>

        {#if error}
          <div class="error-message">
            <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        {/if}
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={handleClose}
          disabled={isImporting}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleImport}
          disabled={!selectedFile || isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Profile'}
        </button>
      </div>
    </div>
  </div>
{/if}

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
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .description {
    margin: 0 0 1.5rem 0;
    color: #64748b;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .file-upload-section {
    margin-bottom: 1rem;
  }

  .file-input {
    display: none;
  }

  .file-upload-display {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .browse-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem;
    width: 100%;
    background: #f9fafb;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #64748b;
  }

  .browse-btn:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #475569;
  }

  .upload-icon {
    color: #94a3b8;
  }

  .browse-btn span {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .selected-file {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    width: 100%;
  }

  .file-icon {
    flex-shrink: 0;
    color: #2563eb;
  }

  .file-name {
    flex: 1;
    font-size: 0.875rem;
    color: #1e293b;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-file-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .remove-file-btn:hover {
    background: #dbeafe;
    color: #1e293b;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .error-icon {
    flex-shrink: 0;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 0 0 12px 12px;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    color: #64748b;
    border: 1px solid #cbd5e1;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    .modal-content {
      max-width: 95vw;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .modal-actions {
      flex-direction: column-reverse;
      padding: 1rem;
    }

    .btn {
      width: 100%;
    }
  }
</style>
