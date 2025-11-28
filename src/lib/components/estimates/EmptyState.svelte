<script>
  import { isAuthenticated } from '$lib/stores/auth.js';

  export let onNewEstimate = () => {};
  export let onViewEstimates = () => {};
</script>

<div class="empty-state">
  <div class="empty-state-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="12" y1="18" x2="12" y2="12"></line>
      <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
  </div>

  <h2>No Estimate Loaded</h2>
  <p>Start by creating a new estimate or load an existing one.</p>

  <div class="empty-state-actions">
    <button class="btn btn-primary" on:click={onNewEstimate}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      New Estimate
    </button>

    {#if $isAuthenticated}
      <button class="btn btn-secondary" on:click={onViewEstimates}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        My Estimates
      </button>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
  }

  .empty-state-icon {
    color: #94a3b8;
    margin-bottom: 1.5rem;
  }

  .empty-state h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  .empty-state p {
    font-size: 1rem;
    color: #64748b;
    margin: 0 0 2rem 0;
  }

  .empty-state-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
  }

  .btn-primary:hover {
    background: #1d4ed8;
  }

  .btn-secondary {
    background: white;
    color: #2563eb;
    border: 1px solid #cbd5e1;
  }

  .btn-secondary:hover {
    background: #f8fafc;
    border-color: #2563eb;
  }

  @media (max-width: 640px) {
    .empty-state {
      padding: 3rem 1.5rem;
    }

    .empty-state h2 {
      font-size: 1.25rem;
    }

    .empty-state-actions {
      flex-direction: column;
      width: 100%;
    }

    .btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
