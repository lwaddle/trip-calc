<script>
  import { toastVisible, toastMessage, toastType, hideToast } from '$lib/stores/ui.js';

  function handleClose() {
    hideToast();
  }
</script>

{#if $toastVisible}
  <div class="toast-container">
    <div class="toast toast-{$toastType}">
      <span class="toast-message">{$toastMessage}</span>
      <button
        type="button"
        class="toast-close"
        on:click={handleClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 300px;
    max-width: 500px;
  }

  .toast-success {
    background: #10b981;
    color: white;
  }

  .toast-error {
    background: #ef4444;
    color: white;
  }

  .toast-info {
    background: #3b82f6;
    color: white;
  }

  .toast-message {
    flex: 1;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .toast-close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .toast-close:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 640px) {
    .toast-container {
      top: 0.5rem;
      right: 0.5rem;
      left: 0.5rem;
    }

    .toast {
      min-width: auto;
    }
  }
</style>
