<script>
  import { onMount } from 'svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import CalculatorForm from '$lib/components/calculator/CalculatorForm.svelte';

  let isReady = false;

  onMount(() => {
    console.log('Trip Cost Calculator (Svelte) - Initialized');
    isReady = true;
  });
</script>

<div class="app">
  {#if isReady}
    <Header />

    <main class="main-content">
      <div class="container">
        <CalculatorForm />
      </div>
    </main>

    <Footer />
  {:else}
    <div class="loading">
      <p>Loading...</p>
    </div>
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f3f4f6;
  }

  .main-content {
    flex: 1;
    padding: 2rem 1.5rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading p {
    font-size: 1.25rem;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    .main-content {
      padding: 1rem;
    }
  }
</style>
