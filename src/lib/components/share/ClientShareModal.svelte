<script>
  import { shareViaEmail, shareViaNative, copyToClipboard } from '$lib/stores/share.js';

  export let isOpen = false;
  export let onClose = () => {};
  export let shareUrl = ''; // The current share URL
  export let estimateText = ''; // Text representation of the estimate

  async function handleEmailShare() {
    shareViaEmail(estimateText, shareUrl);
  }

  async function handleNativeShare() {
    const title = 'Trip Cost Estimate';
    await shareViaNative(title, shareUrl, estimateText);
  }

  async function handleCopyLink() {
    await copyToClipboard(shareUrl);
  }

  function handleClose() {
    onClose();
  }

  // Check if Web Share API is supported
  const supportsNativeShare = typeof navigator !== 'undefined' && navigator.share;
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-overlay" on:click={handleClose} role="presentation">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="client-share-title">
      <div class="modal-header">
        <h2 id="client-share-title">Share This Estimate</h2>
        <button class="close-btn" on:click={handleClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Share options -->
        <div class="share-options">
          <!-- Email Share -->
          <button class="share-option" on:click={handleEmailShare}>
            <div class="option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div class="option-content">
              <h3>Email</h3>
              <p>Share via email</p>
            </div>
          </button>

          <!-- Native Share (mobile) -->
          {#if supportsNativeShare}
            <button class="share-option" on:click={handleNativeShare}>
              <div class="option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </div>
              <div class="option-content">
                <h3>Share</h3>
                <p>Use native sharing</p>
              </div>
            </button>
          {/if}

          <!-- Copy Link -->
          <button class="share-option" on:click={handleCopyLink}>
            <div class="option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <div class="option-content">
              <h3>Copy Link</h3>
              <p>Copy this page's link</p>
            </div>
          </button>
        </div>

        <!-- Current share link display -->
        <div class="share-link-container">
          <label for="client-share-link">Share Link</label>
          <div class="link-input-group">
            <input
              id="client-share-link"
              type="text"
              value={shareUrl}
              readonly
              on:click={(e) => e.target.select()}
            />
            <button class="copy-btn" on:click={handleCopyLink}>
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .share-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .share-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    text-align: left;
  }

  .share-option:hover:not(:disabled) {
    border-color: #2563eb;
    background: #f8fafc;
  }

  .share-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-icon {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    background: #eff6ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #2563eb;
  }

  .option-content h3 {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1e293b;
  }

  .option-content p {
    margin: 0;
    font-size: 0.75rem;
    color: #64748b;
  }

  .share-link-container {
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .share-link-container label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .link-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .link-input-group input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #1f2937;
    background: #f9fafb;
  }

  .link-input-group input:focus {
    outline: none;
    border-color: #2563eb;
    background: white;
  }

  .copy-btn {
    padding: 0.75rem 1.25rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-btn:hover {
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    .modal-content {
      max-height: 95vh;
    }

    .modal-header {
      padding: 1rem;
    }

    .modal-body {
      padding: 1rem;
    }

    .share-option {
      padding: 0.875rem;
    }

    .option-icon {
      width: 36px;
      height: 36px;
    }
  }
</style>
