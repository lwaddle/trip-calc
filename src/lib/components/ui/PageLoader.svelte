<script>
  export let isLoading = true;
</script>

{#if isLoading}
  <div class="page-loader">
    <div class="loader-content">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  </div>
{/if}

<style>
  .page-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .loader-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #bc282e;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loader-content p {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: #64748b;
  }
</style>
