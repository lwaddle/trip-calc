<script>
  import { onMount } from 'svelte';
  import { loadEstimates, loadEstimate, deleteEstimate, newEstimate } from '$lib/stores/estimates.js';
  import { closeModal, showToast } from '$lib/stores/ui.js';
  import EstimatesList from './EstimatesList.svelte';

  let showDeleteConfirm = false;
  let estimateToDelete = null;
  let isLoading = true;

  onMount(async () => {
    await loadEstimates();
    isLoading = false;
  });

  async function handleLoadEstimate(event) {
    const estimate = event.detail;

    try {
      await loadEstimate(estimate);
      showToast(`Loaded estimate: ${estimate.name}`, 'success');
      closeModal();
    } catch (error) {
      console.error('Error loading estimate:', error);
      showToast('Failed to load estimate', 'error');
    }
  }

  function handleDeleteClick(event) {
    estimateToDelete = event.detail;
    showDeleteConfirm = true;
  }

  async function confirmDelete() {
    if (!estimateToDelete) return;

    try {
      const { error } = await deleteEstimate(estimateToDelete.id);

      if (error) {
        showToast('Failed to delete estimate', 'error');
      } else {
        showToast(`Deleted estimate: ${estimateToDelete.name}`, 'success');
      }
    } catch (error) {
      console.error('Error deleting estimate:', error);
      showToast('Failed to delete estimate', 'error');
    }

    showDeleteConfirm = false;
    estimateToDelete = null;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
    estimateToDelete = null;
  }

  function handleNewEstimate() {
    newEstimate();
    showToast('Started new estimate', 'success');
    closeModal();
  }
</script>

<div class="estimates-view">
  <div class="estimates-header">
    <button class="back-button" on:click={closeModal} aria-label="Close estimates view">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>

    <h1 class="estimates-title">My Estimates</h1>

    <button class="new-button" on:click={handleNewEstimate} aria-label="New estimate">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      New
    </button>
  </div>

  <div class="estimates-content">
    {#if isLoading}
      <div class="loading-message">
        <p>Loading estimates...</p>
      </div>
    {:else}
      <EstimatesList
        on:load={handleLoadEstimate}
        on:delete={handleDeleteClick}
      />
    {/if}
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal-overlay" on:click={cancelDelete}>
    <div class="modal-content" on:click|stopPropagation>
      <h2 class="modal-title">Delete Estimate?</h2>
      <p class="modal-message">
        Are you sure you want to delete "{estimateToDelete?.name}"? This action cannot be undone.
      </p>
      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={cancelDelete}>
          Cancel
        </button>
        <button class="btn btn-danger" on:click={confirmDelete}>
          Delete
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .estimates-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f8fafc;
    z-index: 100;
    overflow-y: auto;
  }

  .estimates-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .back-button:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .estimates-title {
    flex: 1;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }

  .new-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .new-button:hover {
    background: #1d4ed8;
  }

  .estimates-content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-message {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
  }

  .loading-message p {
    font-size: 1rem;
    color: #64748b;
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
    z-index: 200;
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
    margin: 0 0 1rem 0;
  }

  .modal-message {
    font-size: 1rem;
    color: #64748b;
    margin: 0 0 2rem 0;
    line-height: 1.5;
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

  .btn-secondary {
    background: white;
    color: #64748b;
    border: 1px solid #cbd5e1;
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #94a3b8;
  }

  .btn-danger {
    background: #dc2626;
    color: white;
  }

  .btn-danger:hover {
    background: #b91c1c;
  }

  @media (max-width: 640px) {
    .estimates-header {
      padding: 1rem;
    }

    .estimates-title {
      font-size: 1.25rem;
    }

    .new-button svg {
      display: none;
    }

    .estimates-content {
      padding: 1rem;
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
