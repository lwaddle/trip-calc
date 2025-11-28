<script>
  import { legs, addLeg } from '$lib/stores/calculator';
  import FlightLeg from './FlightLeg.svelte';

  function handleAddLeg() {
    addLeg();
  }
</script>

<div class="flight-legs-list">
  <div class="section-header">
    <h2>Flight Legs</h2>
    <button type="button" class="add-btn" on:click={handleAddLeg}>
      + Add Leg
    </button>
  </div>

  {#if $legs.length === 0}
    <div class="empty-state">
      <p>No flight legs added yet.</p>
      <p class="hint">Click "Add Leg" to get started.</p>
    </div>
  {:else}
    <div class="legs-container">
      {#each $legs as leg, index (leg.id)}
        <FlightLeg {leg} {index} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .flight-legs-list {
    margin-bottom: 2rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .add-btn {
    background: #2563eb;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .add-btn:hover {
    background: #1d4ed8;
  }

  .add-btn:active {
    background: #1e40af;
  }

  .empty-state {
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .empty-state p {
    margin: 0;
    color: #6b7280;
  }

  .empty-state .hint {
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .legs-container {
    /* Container for legs - no specific styles needed, FlightLeg handles its own spacing */
  }
</style>
