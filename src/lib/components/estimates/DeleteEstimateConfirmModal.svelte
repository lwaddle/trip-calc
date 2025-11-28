<script>
  export let isOpen = false;
  export let estimateName = '';
  export let onConfirm = () => {};
  export let onCancel = () => {};
  export let isDeleting = false;
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={onCancel} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="delete-estimate-title">
      <div class="modal-header">
        <h2 id="delete-estimate-title">Delete Estimate</h2>
      </div>

      <div class="modal-body">
        <div class="warning-message">
          <svg class="warning-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <p class="warning-text">
            Are you sure you want to delete <strong>"{estimateName}"</strong>?
          </p>
          <p class="warning-subtext">
            This action cannot be undone. The estimate will be permanently removed from your account.
          </p>
        </div>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          on:click={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Estimate'}
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
    max-width: 450px;
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
    margin: 0 0 0.75rem 0;
    color: #1f2937;
    font-size: 0.938rem;
    line-height: 1.5;
  }

  .warning-text strong {
    color: #dc2626;
    font-weight: 600;
  }

  .warning-subtext {
    margin: 0;
    color: #64748b;
    font-size: 0.813rem;
    line-height: 1.4;
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

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
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
