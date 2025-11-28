<script>
  import { isAuthenticated } from '$lib/stores/auth.js';
  import { totalEstimate } from '$lib/stores/calculator.js';
  import { currentEstimateId, currentEstimateName, saveEstimate } from '$lib/stores/estimates.js';
  import { openModal, showToast } from '$lib/stores/ui.js';

  let showSaveModal = false;
  let estimateName = '';
  let isSaving = false;

  function handleShare() {
    // TODO: Implement share functionality in Phase 5
    console.log('Share clicked');
    showToast('Share functionality coming in Phase 5', 'info');
  }

  function handleSaveClick() {
    // Pre-populate with current name if editing
    estimateName = $currentEstimateName || '';
    showSaveModal = true;
  }

  async function handleSaveConfirm() {
    if (!estimateName.trim()) {
      showToast('Please enter an estimate name', 'error');
      return;
    }

    isSaving = true;

    try {
      const { error } = await saveEstimate(estimateName.trim(), $totalEstimate.total);

      if (error) {
        showToast('Failed to save estimate: ' + error.message, 'error');
      } else {
        const action = $currentEstimateId ? 'updated' : 'saved';
        showToast(`Estimate ${action} successfully`, 'success');
        showSaveModal = false;
        estimateName = '';
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save estimate', 'error');
    }

    isSaving = false;
  }

  function handleSaveCancel() {
    showSaveModal = false;
    estimateName = '';
  }

  function handleExportPDF() {
    // TODO: Implement PDF export in Phase 5
    console.log('Export PDF clicked');
    showToast('PDF export coming in Phase 5', 'info');
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSaveConfirm();
    }
  }
</script>

<footer class="footer">
  <div class="footer-content">
    <div class="actions">
      <button type="button" class="action-btn" on:click={handleShare}>
        Share
      </button>

      {#if $isAuthenticated}
        <button type="button" class="action-btn primary" on:click={handleSaveClick}>
          {$currentEstimateId ? 'Update' : 'Save'} Estimate
        </button>
      {/if}

      <button type="button" class="action-btn" on:click={handleExportPDF}>
        Export PDF
      </button>
    </div>

    <div class="footer-info">
      <p>Trip Cost Calculator - Svelte Version</p>
    </div>
  </div>
</footer>

<!-- Save Modal -->
{#if showSaveModal}
  <div class="modal-overlay" on:click={handleSaveCancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2 class="modal-title">
        {$currentEstimateId ? 'Update' : 'Save'} Estimate
      </h2>

      <div class="form-group">
        <label for="estimate-name">Estimate Name</label>
        <input
          id="estimate-name"
          type="text"
          bind:value={estimateName}
          on:keypress={handleKeyPress}
          placeholder="Enter estimate name..."
          autofocus
        />
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={handleSaveCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleSaveConfirm}
          disabled={isSaving || !estimateName.trim()}
        >
          {isSaving ? 'Saving...' : ($currentEstimateId ? 'Update' : 'Save')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .footer {
    background: #1f2937;
    color: white;
    border-top: 1px solid #374151;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .action-btn {
    background: #374151;
    color: white;
    border: 1px solid #4b5563;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-btn:hover {
    background: #4b5563;
  }

  .action-btn.primary {
    background: #2563eb;
    border-color: #2563eb;
  }

  .action-btn.primary:hover {
    background: #1d4ed8;
  }

  .footer-info {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #374151;
  }

  .footer-info p {
    margin: 0;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  /* Modal Styles */
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
    .actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
    }

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
