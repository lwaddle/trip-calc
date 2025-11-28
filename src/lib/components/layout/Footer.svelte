<script>
  import { isAuthenticated, user } from '$lib/stores/auth.js';
  import { estimate, resetCalculator } from '$lib/stores/calculator.js';
  import { currentEstimateId, currentEstimateName, saveEstimate, hasUnsavedChanges, discardChanges, clearCurrentEstimate } from '$lib/stores/estimates.js';
  import { showToast } from '$lib/stores/ui.js';
  import { exportPDF } from '$lib/utils/pdfExport.js';
  import ShareModal from '$lib/components/share/ShareModal.svelte';

  let showSaveModal = false;
  let showShareModal = false;
  let showPDFPreview = false;
  let showNewEstimateModal = false;
  let estimateName = '';
  let isSaving = false;
  let isExportingPDF = false;
  let pdfPreviewUrl = '';
  let pdfFilename = '';

  function handleShare() {
    showShareModal = true;
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
      const { error } = await saveEstimate(estimateName.trim(), $estimate.estimatedTotal);

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

  async function handleExportPDF() {
    isExportingPDF = true;

    try {
      // Prepare metadata
      const metadata = {
        creatorEmail: $isAuthenticated ? $user?.email : 'Guest'
      };

      // Export PDF
      const result = await exportPDF($estimate, $currentEstimateName, metadata);

      if (result.mode === 'preview') {
        // Desktop: Show preview modal
        pdfPreviewUrl = result.pdfUrl;
        pdfFilename = result.filename;
        showPDFPreview = true;
      } else {
        // Mobile: Already downloaded
        showToast('PDF downloaded successfully', 'success');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      showToast('Failed to export PDF', 'error');
    }

    isExportingPDF = false;
  }

  function handleDownloadPDF() {
    if (pdfPreviewUrl && pdfFilename) {
      // Create download link
      const a = document.createElement('a');
      a.href = pdfPreviewUrl;
      a.download = pdfFilename;
      a.click();
      showToast('PDF downloaded successfully', 'success');
    }
  }

  function handleClosePDFPreview() {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    pdfPreviewUrl = '';
    pdfFilename = '';
    showPDFPreview = false;
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      handleSaveConfirm();
    }
  }

  function handleDiscardChanges() {
    if (confirm('Are you sure you want to discard your changes? This will reload the last saved version of this estimate.')) {
      discardChanges();
      showToast('Changes discarded', 'success');
    }
  }

  function handleNewEstimate() {
    // If there are unsaved changes, show confirmation modal
    if ($hasUnsavedChanges) {
      showNewEstimateModal = true;
    } else {
      confirmNewEstimate();
    }
  }

  function confirmNewEstimate() {
    // Reset the calculator to default state
    resetCalculator();

    // Clear current estimate tracking
    clearCurrentEstimate();

    // Close modal
    showNewEstimateModal = false;

    showToast('New estimate created', 'success');
  }

  function cancelNewEstimate() {
    showNewEstimateModal = false;
  }
</script>

<footer class="footer">
  <div class="footer-content">
    <div class="actions">
      <!-- New Estimate Button -->
      <button type="button" class="action-btn" on:click={handleNewEstimate}>
        New Estimate
      </button>

      <!-- Discard Changes Button (only show when there are unsaved changes) -->
      {#if $hasUnsavedChanges}
        <button type="button" class="action-btn discard" on:click={handleDiscardChanges}>
          Discard Changes
        </button>
      {/if}

      <!-- Share Button -->
      <button type="button" class="action-btn" on:click={handleShare}>
        Share
      </button>

      <!-- Save/Update Button (authenticated only, with unsaved changes indicator) -->
      {#if $isAuthenticated}
        <button
          type="button"
          class="action-btn primary"
          class:has-changes={$hasUnsavedChanges}
          on:click={handleSaveClick}
        >
          {$currentEstimateId ? 'Update' : 'Save'} Estimate
          {#if $hasUnsavedChanges}
            <span class="unsaved-indicator"></span>
          {/if}
        </button>
      {/if}

      <!-- Export PDF Button -->
      <button type="button" class="action-btn" on:click={handleExportPDF} disabled={isExportingPDF}>
        {isExportingPDF ? 'Generating...' : 'Export PDF'}
      </button>
    </div>

    <div class="footer-info">
      <p>Trip Cost Calculator - Svelte Version</p>
    </div>
  </div>
</footer>

<!-- Share Modal -->
<ShareModal isOpen={showShareModal} onClose={() => showShareModal = false} />

<!-- PDF Preview Modal -->
{#if showPDFPreview}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={handleClosePDFPreview} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="pdf-preview-modal" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
      <div class="pdf-header">
        <h2 id="pdf-preview-title">PDF Preview</h2>
        <button class="close-btn" on:click={handleClosePDFPreview} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="pdf-preview-body">
        <iframe
          src={pdfPreviewUrl}
          title="PDF Preview"
          class="pdf-iframe"
        ></iframe>
      </div>

      <div class="pdf-footer">
        <button class="btn btn-secondary" on:click={handleClosePDFPreview}>
          Close
        </button>
        <button class="btn btn-primary" on:click={handleDownloadPDF}>
          Download PDF
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- New Estimate Confirmation Modal -->
{#if showNewEstimateModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={cancelNewEstimate} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="new-estimate-modal-title">
      <h2 class="modal-title" id="new-estimate-modal-title">Start New Estimate</h2>

      <div class="modal-warning">
        <p class="warning-text">
          <strong style="color: #d32f2f;">You have unsaved changes!</strong> Are you sure you want to start a new estimate? This will clear all data including:
        </p>
        <ul class="warning-list">
          <li>All flight legs</li>
          <li>All crew members</li>
          <li>Trip settings and notes</li>
          <li>Current calculations</li>
        </ul>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={cancelNewEstimate}
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          on:click={confirmNewEstimate}
        >
          Start New Estimate
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Save Modal -->
{#if showSaveModal}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={handleSaveCancel} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
      <h2 class="modal-title" id="save-modal-title">
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
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
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
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .action-btn.primary {
    background: #bc282e;
    border-color: #bc282e;
  }

  .action-btn.primary:hover {
    background: #a02227;
  }

  /* Discard Changes Button */
  .action-btn.discard {
    background: #dc2626;
    border-color: #dc2626;
    color: white;
  }

  .action-btn.discard:hover {
    background: #b91c1c;
  }

  /* Unsaved Changes Indicator (pulsing dot) */
  .action-btn.has-changes {
    position: relative;
  }

  .unsaved-indicator {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 8px;
    height: 8px;
    background: #f97316;
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  .footer-info {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-info p {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
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

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #b91c1c;
  }

  /* Modal Warning */
  .modal-warning {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .warning-text {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: #374151;
  }

  .warning-list {
    margin: 0;
    padding-left: 1.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }

  .warning-list li {
    margin-bottom: 0.25rem;
  }

  /* PDF Preview Modal */
  .pdf-preview-modal {
    background: white;
    border-radius: 12px;
    max-width: 900px;
    width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .pdf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .pdf-header h2 {
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

  .pdf-preview-body {
    flex: 1;
    min-height: 0;
    background: #f3f4f6;
  }

  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .pdf-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
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

    .pdf-preview-modal {
      width: 95vw;
      max-height: 95vh;
    }

    .pdf-header {
      padding: 1rem;
    }

    .pdf-footer {
      padding: 1rem;
      flex-direction: column-reverse;
    }
  }
</style>
