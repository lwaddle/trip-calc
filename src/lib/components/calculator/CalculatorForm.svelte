<script>
  import FlightLegsList from './FlightLegsList.svelte';
  import CrewList from './CrewList.svelte';
  import EstimateSummary from './EstimateSummary.svelte';
  import ProfileSelector from './ProfileSelector.svelte';
  import { fuelPrice, fuelDensity, includeAPU } from '$lib/stores/calculator';
  import { currentEstimateId } from '$lib/stores/estimates';

  // Hide profile selector when editing a saved estimate
  $: showProfileSelector = !$currentEstimateId;
</script>

<div class="calculator-form">
  <!-- Profile Selector (only show for new/unsaved estimates) -->
  {#if showProfileSelector}
    <ProfileSelector />
  {/if}

  <div class="settings-section">
    <h2>Settings</h2>
    <div class="settings-grid">
      <div class="form-group">
        <label for="fuel-price">Fuel Price ($/gal)</label>
        <input
          id="fuel-price"
          type="number"
          min="0"
          step="0.01"
          bind:value={$fuelPrice}
        />
      </div>

      <div class="form-group">
        <label for="fuel-density">Fuel Density (lbs/gal)</label>
        <input
          id="fuel-density"
          type="number"
          min="0"
          step="0.1"
          bind:value={$fuelDensity}
        />
      </div>

      <div class="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            bind:checked={$includeAPU}
          />
          <span>Include APU</span>
        </label>
      </div>
    </div>
  </div>

  <FlightLegsList />
  <CrewList />
  <EstimateSummary />
</div>

<style>
  .calculator-form {
    max-width: 1200px;
    margin: 0 auto;
  }

  .settings-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .settings-section:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .settings-section h2 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    align-items: end;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .form-group input[type="number"] {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .form-group input[type="number"]:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  .checkbox-group {
    display: flex;
    align-items: center;
  }

  .checkbox-group label {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin: 0;
  }

  .checkbox-group input[type="checkbox"] {
    margin-right: 0.5rem;
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }

  .checkbox-group span {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  @media (max-width: 768px) {
    .settings-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
