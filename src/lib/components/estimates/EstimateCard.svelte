<script>
  import { formatCurrency } from '$lib/utils/formatters.js';
  import { createEventDispatcher } from 'svelte';

  export let estimate;

  const dispatch = createEventDispatcher();

  let showActionsMenu = false;

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  function handleLoad() {
    dispatch('load', estimate);
    showActionsMenu = false;
  }

  function handleDelete() {
    dispatch('delete', estimate);
    showActionsMenu = false;
  }

  function toggleActionsMenu() {
    showActionsMenu = !showActionsMenu;
  }

  function handleClickOutside(event) {
    if (showActionsMenu && !event.target.closest('.actions-menu')) {
      showActionsMenu = false;
    }
  }

  // Get total cost from estimate data
  $: totalCost = estimate.estimate_data?.totalCost || 0;
  $: legCount = estimate.estimate_data?.legs?.length || 0;
  $: crewCount = estimate.estimate_data?.crew?.length || 0;
</script>

<svelte:window on:click={handleClickOutside} />

<div class="estimate-card">
  <div class="estimate-header">
    <div class="estimate-info">
      <h3 class="estimate-name">{estimate.name}</h3>
      <p class="estimate-date">{formatDate(estimate.updated_at || estimate.created_at)}</p>
    </div>

    <div class="estimate-actions">
      <button class="actions-toggle" on:click={toggleActionsMenu} aria-label="Estimate actions">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
        </svg>
      </button>

      {#if showActionsMenu}
        <div class="actions-menu">
          <button class="action-item" on:click={handleLoad}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Load
          </button>
          <button class="action-item action-delete" on:click={handleDelete}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          </button>
        </div>
      {/if}
    </div>
  </div>

  <div class="estimate-details">
    <div class="detail-item">
      <span class="detail-label">Legs:</span>
      <span class="detail-value">{legCount}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">Crew:</span>
      <span class="detail-value">{crewCount}</span>
    </div>
  </div>

  <div class="estimate-total">
    <span class="total-label">Total Cost</span>
    <span class="total-value">{formatCurrency(totalCost)}</span>
  </div>

  <button class="load-button" on:click={handleLoad}>
    Load Estimate
  </button>
</div>

<style>
  .estimate-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
    cursor: pointer;
  }

  .estimate-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .estimate-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .estimate-info {
    flex: 1;
    min-width: 0;
  }

  .estimate-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .estimate-date {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0;
  }

  .estimate-actions {
    position: relative;
    margin-left: 1rem;
  }

  .actions-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .actions-toggle:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .actions-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10;
    min-width: 150px;
    overflow: hidden;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    color: #1e293b;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }

  .action-item:hover {
    background: #f8fafc;
  }

  .action-delete {
    color: #dc2626;
  }

  .action-delete:hover {
    background: #fef2f2;
  }

  .estimate-details {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .detail-item {
    display: flex;
    gap: 0.5rem;
  }

  .detail-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .detail-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1e293b;
  }

  .estimate-total {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .total-label {
    font-size: 0.875rem;
    color: #64748b;
  }

  .total-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2563eb;
  }

  .load-button {
    width: 100%;
    padding: 0.75rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .load-button:hover {
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    .estimate-card {
      padding: 1.25rem;
    }

    .estimate-name {
      font-size: 1rem;
    }

    .total-value {
      font-size: 1.25rem;
    }
  }
</style>
