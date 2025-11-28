<script>
  import { onMount } from 'svelte';
  import { estimate } from '$lib/stores/calculator';
  import { formatCurrency } from '$lib/utils/formatters';

  // This is a skeleton - we'll add components as we build them
  let isReady = false;

  onMount(() => {
    console.log('Trip Cost Calculator (Svelte) - Initialized');
    isReady = true;
  });
</script>

<div class="app">
  {#if isReady}
    <header>
      <h1>Trip Cost Calculator (Svelte)</h1>
      <p>Migration in progress...</p>
    </header>

    <main>
      <div class="calculator-placeholder">
        <h2>Calculator Core</h2>
        <p>This is where the calculator form will go.</p>

        {#if $estimate}
          <div class="estimate-preview">
            <h3>Current Estimate</h3>
            <p>Total: ${formatCurrency($estimate.estimatedTotal)}</p>
            <p>Flight Hours: {$estimate.totalHours}h {$estimate.remainingMinutes}m</p>
            <p>Fuel: {$estimate.totalFuelGallons.toFixed(0)} gallons</p>
          </div>
        {/if}
      </div>
    </main>

    <footer>
      <p>Svelte migration - Phase 1: Setup Complete</p>
    </footer>
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    background: #2563eb;
    color: white;
    padding: 2rem;
    text-align: center;
  }

  header h1 {
    margin: 0 0 0.5rem 0;
  }

  header p {
    margin: 0;
    opacity: 0.9;
  }

  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .calculator-placeholder {
    background: #f3f4f6;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .estimate-preview {
    margin-top: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    text-align: left;
  }

  .estimate-preview h3 {
    margin-top: 0;
  }

  footer {
    background: #1f2937;
    color: white;
    padding: 1rem;
    text-align: center;
  }

  footer p {
    margin: 0;
  }
</style>
