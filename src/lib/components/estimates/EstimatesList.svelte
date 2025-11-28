<script>
  import { estimates } from '$lib/stores/estimates.js';
  import EstimateCard from './EstimateCard.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleLoadEstimate(event) {
    dispatch('load', event.detail);
  }

  function handleDeleteEstimate(event) {
    dispatch('delete', event.detail);
  }
</script>

<div class="estimates-list">
  {#if $estimates.length === 0}
    <div class="empty-message">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      <p>No saved estimates yet</p>
      <p class="empty-subtitle">Create a new estimate to get started</p>
    </div>
  {:else}
    <div class="estimates-grid">
      {#each $estimates as estimate (estimate.id)}
        <EstimateCard
          {estimate}
          on:load={handleLoadEstimate}
          on:delete={handleDeleteEstimate}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .estimates-list {
    width: 100%;
  }

  .empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    color: #94a3b8;
  }

  .empty-message svg {
    margin-bottom: 1rem;
  }

  .empty-message p {
    margin: 0.5rem 0;
    font-size: 1rem;
    color: #64748b;
  }

  .empty-subtitle {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .estimates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .estimates-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    .empty-message {
      padding: 3rem 1.5rem;
    }
  }
</style>
