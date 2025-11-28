<script>
  import { estimate } from '$lib/stores/calculator';
  import { isAuthenticated } from '$lib/stores/auth';
  import { openModal } from '$lib/stores/ui';
  import { formatCurrency } from '$lib/utils/formatters';

  // Reactive calculations for display using Svelte 5 $derived rune
  let totalHours = $derived($estimate?.totalHours || 0);
  let remainingMinutes = $derived($estimate?.remainingMinutes || 0);
  let fuelCost = $derived($estimate?.fuelCost || 0);
  let crewCost = $derived($estimate?.crewCost || 0);
  let hotelCost = $derived($estimate?.hotelCost || 0);
  let mealsCost = $derived($estimate?.mealsCost || 0);
  let maintenanceCost = $derived($estimate?.maintenanceCost || 0);
  let consumablesCost = $derived($estimate?.consumablesCost || 0);
  let additionalCost = $derived($estimate?.additionalCost || 0);
  let airportFees = $derived($estimate?.airportFees || 0);
  let miscFees = $derived($estimate?.miscFees || 0);
  let grandTotal = $derived($estimate?.estimatedTotal || 0);
  let totalFuelGallons = $derived($estimate?.totalFuelGallons || 0);
  let totalDistance = $derived($estimate?.totalDistance || 0);
</script>

<div class="estimate-summary">
  <h2>Estimate Summary</h2>

  <div class="summary-grid">
    <!-- Flight Info -->
    <div class="summary-section">
      <h3>Flight Information</h3>
      <div class="summary-item">
        <span class="label">Total Flight Time:</span>
        <span class="value">{totalHours}h {remainingMinutes}m</span>
      </div>
      <div class="summary-item">
        <span class="label">Total Distance:</span>
        <span class="value">{totalDistance.toLocaleString()} nm</span>
      </div>
      <div class="summary-item">
        <span class="label">Total Fuel:</span>
        <span class="value">{totalFuelGallons.toLocaleString()} gallons</span>
      </div>
    </div>

    <!-- Cost Breakdown -->
    <div class="summary-section">
      <h3>Cost Breakdown</h3>

      {#if fuelCost > 0}
        <div class="summary-item">
          <span class="label">Fuel:</span>
          <span class="value">{formatCurrency(fuelCost)}</span>
        </div>
      {/if}

      {#if crewCost > 0}
        <div class="summary-item">
          <span class="label">Crew:</span>
          <span class="value">{formatCurrency(crewCost)}</span>
        </div>
      {/if}

      {#if hotelCost > 0}
        <div class="summary-item">
          <span class="label">Hotel:</span>
          <span class="value">{formatCurrency(hotelCost)}</span>
        </div>
      {/if}

      {#if mealsCost > 0}
        <div class="summary-item">
          <span class="label">Meals:</span>
          <span class="value">{formatCurrency(mealsCost)}</span>
        </div>
      {/if}

      {#if maintenanceCost > 0}
        <div class="summary-item">
          <span class="label">Maintenance:</span>
          <span class="value">{formatCurrency(maintenanceCost)}</span>
        </div>
      {/if}

      {#if consumablesCost > 0}
        <div class="summary-item">
          <span class="label">Consumables:</span>
          <span class="value">{formatCurrency(consumablesCost)}</span>
        </div>
      {/if}

      {#if additionalCost > 0}
        <div class="summary-item">
          <span class="label">Additional:</span>
          <span class="value">{formatCurrency(additionalCost)}</span>
        </div>
      {/if}

      {#if airportFees > 0}
        <div class="summary-item">
          <span class="label">Airport Fees:</span>
          <span class="value">{formatCurrency(airportFees)}</span>
        </div>
      {/if}

      {#if miscFees > 0}
        <div class="summary-item">
          <span class="label">Misc Fees:</span>
          <span class="value">{formatCurrency(miscFees)}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Grand Total -->
  <div class="grand-total">
    <span class="label">Estimated Total:</span>
    <span class="value">{formatCurrency(grandTotal)}</span>
  </div>

  <!-- Auth Tip for Guest Users -->
  {#if !$isAuthenticated}
    <div class="auth-tip">
      <svg class="tip-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <span class="tip-text">
        <strong>Tip:</strong> Sign in to save and load estimates across devices.
      </span>
      <button class="tip-btn" on:click={() => openModal('sign-in')}>
        Sign In
      </button>
    </div>
  {/if}
</div>

<style>
  .estimate-summary {
    background: white;
    border: 2px solid #2563eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .estimate-summary:hover {
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
  }

  .estimate-summary h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .summary-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.75rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: 0.875rem;
  }

  .summary-item .label {
    color: #6b7280;
  }

  .summary-item .value {
    font-weight: 500;
    color: #1f2937;
  }

  .grand-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #eff6ff;
    border-radius: 6px;
    border: 1px solid #bfdbfe;
  }

  .grand-total .label {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e40af;
  }

  .grand-total .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e40af;
  }

  /* Auth Tip */
  .auth-tip {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 0.875rem 1rem;
    background: #fef3c7;
    border: 1px solid #fde68a;
    border-radius: 6px;
  }

  .tip-icon {
    flex-shrink: 0;
    color: #d97706;
  }

  .tip-text {
    flex: 1;
    font-size: 0.875rem;
    color: #78350f;
    line-height: 1.4;
  }

  .tip-text strong {
    font-weight: 600;
  }

  .tip-btn {
    flex-shrink: 0;
    padding: 0.5rem 1rem;
    background: #d97706;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .tip-btn:hover {
    background: #b45309;
  }

  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: 1fr;
    }

    .grand-total {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .auth-tip {
      flex-wrap: wrap;
      justify-content: center;
    }

    .tip-text {
      flex-basis: 100%;
      text-align: center;
      margin-bottom: 0.5rem;
    }

    .tip-btn {
      width: 100%;
    }
  }
</style>
