<script>
  import { currentEstimateName, renameEstimate } from '$lib/stores/estimates.js';
  import { showToast } from '$lib/stores/ui.js';

  export let isOpen = false;
  export let onClose = () => {};

  let newName = '';
  let isRenaming = false;

  // Update newName when modal opens
  $: if (isOpen) {
    newName = $currentEstimateName || '';
  }

  async function handleRename() {
    if (!newName.trim()) {
      showToast('Please enter an estimate name', 'error');
      return;
    }

    if (newName.trim() === $currentEstimateName) {
      showToast('Name unchanged', 'info');
      onClose();
      return;
    }

    isRenaming = true;

    try {
      const { error } = await renameEstimate(newName.trim());

      if (error) {
        showToast('Failed to rename estimate: ' + error, 'error');
      } else {
        showToast('Estimate renamed successfully', 'success');
        onClose();
      }
    } catch (error) {
      console.error('Rename error:', error);
      showToast('Failed to rename estimate', 'error');
    }

    isRenaming = false;
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleRename();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={onClose} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="rename-modal-title">
      <h2 class="modal-title" id="rename-modal-title">Rename Estimate</h2>

      <div class="form-group">
        <label for="estimate-name">Estimate Name</label>
        <input
          id="estimate-name"
          type="text"
          bind:value={newName}
          on:keypress={handleKeyPress}
          placeholder="Enter new name..."
        />
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={onClose}
          disabled={isRenaming}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleRename}
          disabled={isRenaming || !newName.trim()}
        >
          {isRenaming ? 'Renaming...' : 'Rename'}
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
    padding: 2rem;
    max-width: 400px;
    width: 100%;
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1.5rem 0;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    color: #1f2937;
  }

  .form-group input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
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
      padding: 1.5rem;
    }

    .modal-actions {
      flex-direction: column-reverse;
    }

    .btn {
      width: 100%;
    }
  }
</style>
