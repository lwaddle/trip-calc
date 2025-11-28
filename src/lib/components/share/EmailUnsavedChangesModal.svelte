<script>
  import { saveEstimate, currentEstimateName } from '$lib/stores/estimates.js';
  import { estimate } from '$lib/stores/calculator.js';
  import { showToast } from '$lib/stores/ui.js';

  export let isOpen = false;
  export let onClose = () => {};
  export let onEmailCurrent = () => {}; // Callback to email current saved version
  export let onSaveAndEmail = async () => {}; // Callback to save changes and email

  let isSaving = false;

  async function handleSaveAndEmail() {
    isSaving = true;

    try {
      // Save the current estimate
      const { error } = await saveEstimate($currentEstimateName, $estimate.estimatedTotal);

      if (error) {
        showToast('Failed to save estimate: ' + error.message, 'error');
        isSaving = false;
        return;
      }

      showToast('Estimate saved successfully', 'success');

      // Close modal and proceed with email
      onClose();
      await onSaveAndEmail();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save estimate', 'error');
    }

    isSaving = false;
  }

  function handleEmailCurrent() {
    onClose();
    onEmailCurrent();
  }

  function handleCancel() {
    onClose();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={handleCancel} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="unsaved-changes-title">
      <div class="modal-header">
        <h2 id="unsaved-changes-title">Unsaved Changes</h2>
      </div>

      <div class="modal-body">
        <div class="warning-message">
          <svg class="warning-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <p class="warning-text">
            You have unsaved changes to this estimate. Do you want to save your changes before sharing?
          </p>
        </div>

        <div class="options-info">
          <p><strong>Your options:</strong></p>
          <ul>
            <li><strong>Cancel</strong> - Return without sharing</li>
            <li><strong>Email Current Version</strong> - Share the last saved version (ignoring recent changes)</li>
            <li><strong>Save Changes & Email</strong> - Save your changes first, then share</li>
          </ul>
        </div>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={handleCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-warning"
          on:click={handleEmailCurrent}
          disabled={isSaving}
        >
          Email Current Version
        </button>
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleSaveAndEmail}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes & Email'}
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
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .warning-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
  }

  .warning-icon {
    color: #dc2626;
    margin-bottom: 1rem;
  }

  .warning-text {
    margin: 0;
    color: #1f2937;
    font-size: 0.938rem;
    line-height: 1.5;
  }

  .options-info {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .options-info p {
    margin: 0 0 0.75rem 0;
    color: #374151;
    font-size: 0.875rem;
  }

  .options-info ul {
    margin: 0;
    padding-left: 1.25rem;
    color: #64748b;
    font-size: 0.875rem;
  }

  .options-info li {
    margin-bottom: 0.5rem;
  }

  .options-info li:last-child {
    margin-bottom: 0;
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

  .btn-warning {
    background: #f59e0b;
    color: white;
  }

  .btn-warning:hover:not(:disabled) {
    background: #d97706;
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
