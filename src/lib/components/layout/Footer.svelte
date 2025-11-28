<script>
  // Placeholder for future functionality
  let isAuthenticated = false;

  function handleShare() {
    console.log('Share clicked');
  }

  function handleSave() {
    console.log('Save clicked');
  }

  function handleExportPDF() {
    console.log('Export PDF clicked');
  }
</script>

<footer class="footer">
  <div class="footer-content">
    <div class="actions">
      <button type="button" class="action-btn" on:click={handleShare}>
        Share
      </button>

      {#if isAuthenticated}
        <button type="button" class="action-btn primary" on:click={handleSave}>
          Save Estimate
        </button>
      {/if}

      <button type="button" class="action-btn" on:click={handleExportPDF}>
        Export PDF
      </button>
    </div>

    <div class="footer-info">
      <p>Trip Cost Calculator - Svelte Version</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background: #1f2937;
    color: white;
    border-top: 1px solid #374151;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .action-btn {
    background: #374151;
    color: white;
    border: 1px solid #4b5563;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-btn:hover {
    background: #4b5563;
  }

  .action-btn.primary {
    background: #2563eb;
    border-color: #2563eb;
  }

  .action-btn.primary:hover {
    background: #1d4ed8;
  }

  .footer-info {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #374151;
  }

  .footer-info p {
    margin: 0;
    font-size: 0.875rem;
    color: #9ca3af;
  }

  @media (max-width: 640px) {
    .actions {
      flex-direction: column;
    }

    .action-btn {
      width: 100%;
    }
  }
</style>
