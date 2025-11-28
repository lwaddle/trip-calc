<script>
  import { isAuthenticated } from '$lib/stores/auth.js';
  import { currentEstimateId, currentEstimateName, hasUnsavedChanges } from '$lib/stores/estimates.js';
  import { estimate } from '$lib/stores/calculator.js';
  import { generateShareLink, shareViaEmail, shareViaNative, copyToClipboard } from '$lib/stores/share.js';
  import { showToast } from '$lib/stores/ui.js';
  import { generatePDF } from '$lib/utils/pdfExport.js';
  import EmailUnsavedChangesModal from './EmailUnsavedChangesModal.svelte';

  export let isOpen = false;
  export let onClose = () => {};

  let shareUrl = '';
  let isGeneratingLink = false;
  let linkGenerated = false;
  let showUnsavedChangesModal = false;
  let pendingEmailAction = null; // Store which email action is pending
  let emailFormat = 'text'; // 'text' or 'pdf'

  // Generate estimate text for email sharing
  function getEstimateText() {
    // Create a simple text representation of the estimate
    const legs = $estimate.legsSummary || [];
    const total = $estimate.estimatedTotal || 0;

    let text = 'Trip Cost Estimate\n\n';

    if ($currentEstimateName) {
      text += `Name: ${$currentEstimateName}\n\n`;
    }

    text += 'Flight Legs:\n';
    if (legs.length === 0) {
      text += '  No legs added\n';
    } else {
      legs.forEach(leg => {
        text += `  Leg ${leg.index}: ${leg.from} → ${leg.to} (${leg.hours}h ${leg.minutes}m)\n`;
      });
    }

    text += `\nEstimated Total: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;

    return text;
  }

  async function handleGenerateLink() {
    if (!$isAuthenticated || !$currentEstimateId) {
      showToast('Please save the estimate first', 'error');
      return;
    }

    isGeneratingLink = true;

    try {
      const { shareUrl: url, error } = await generateShareLink($currentEstimateId, $currentEstimateName);

      if (error) {
        showToast('Failed to create share link: ' + error.message, 'error');
        return;
      }

      shareUrl = url;
      linkGenerated = true;
    } catch (error) {
      console.error('Share link error:', error);
      showToast('Failed to create share link', 'error');
    } finally {
      isGeneratingLink = false;
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) {
      await handleGenerateLink();
      if (!shareUrl) return;
    }

    await copyToClipboard(shareUrl);
  }

  async function handleEmailShare() {
    // Check for unsaved changes first
    if ($isAuthenticated && $currentEstimateId && $hasUnsavedChanges) {
      pendingEmailAction = 'email';
      showUnsavedChangesModal = true;
      return;
    }

    // Proceed with email
    await performEmailShare();
  }

  async function performEmailShare() {
    if (emailFormat === 'pdf') {
      // Generate PDF and attach to email
      try {
        const { blob, filename } = await generatePDF(
          $estimate,
          $currentEstimateName,
          null // metadata - can add if needed
        );

        // For mobile devices, download PDF instead of email
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
          showToast('PDF downloaded. You can now attach it to an email.', 'success');
        } else {
          // Desktop: Create mailto link with suggestion to attach PDF
          const subject = $currentEstimateName ? `Trip Estimate: ${$currentEstimateName}` : 'Trip Cost Estimate';
          const body = `Please find the attached PDF estimate.\n\nNote: The PDF has been downloaded to your device. Please attach it to this email before sending.`;
          const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

          // Download PDF
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);

          // Open email client after short delay
          setTimeout(() => {
            window.location.href = mailtoLink;
          }, 500);

          showToast('PDF downloaded. Opening email client...', 'success');
        }
      } catch (error) {
        console.error('PDF generation error:', error);
        showToast('Failed to generate PDF', 'error');
      }
    } else {
      // Text format (original behavior)
      const estimateText = getEstimateText();

      if ($isAuthenticated && $currentEstimateId) {
        // Generate link and share via email
        if (!shareUrl) {
          await handleGenerateLink();
          if (!shareUrl) {
            // Failed to generate link, share text only
            shareViaEmail(estimateText);
            return;
          }
        }
        shareViaEmail(estimateText, shareUrl);
      } else {
        // Guest user - share text only
        shareViaEmail(estimateText);
      }
    }
  }

  async function handleNativeShare() {
    const title = 'Trip Cost Estimate';

    if ($isAuthenticated && $currentEstimateId) {
      // Generate link and share
      if (!shareUrl) {
        await handleGenerateLink();
        if (!shareUrl) {
          // Failed to generate link, share text only
          const text = getEstimateText();
          await shareViaNative(title, null, text);
          return;
        }
      }
      await shareViaNative(title, shareUrl);
    } else {
      // Guest user - share text only
      const text = getEstimateText();
      await shareViaNative(title, null, text);
    }
  }

  function handleClose() {
    shareUrl = '';
    linkGenerated = false;
    showUnsavedChangesModal = false;
    pendingEmailAction = null;
    onClose();
  }

  // Handle unsaved changes modal actions
  function handleEmailCurrentVersion() {
    showUnsavedChangesModal = false;
    performEmailShare();
  }

  async function handleSaveAndEmail() {
    showUnsavedChangesModal = false;
    // The EmailUnsavedChangesModal will handle saving
    // After it saves, it will call this function
    await performEmailShare();
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
    <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div class="modal-header">
        <h2 id="share-modal-title">Share Estimate</h2>
        <button class="close-btn" on:click={handleClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Info message for unauthenticated/unsaved -->
        {#if !$isAuthenticated || !$currentEstimateId}
          <div class="info-message">
            <p>
              {#if !$isAuthenticated}
                Sign in and save your estimate to create a shareable link.
              {:else}
                Save your estimate first to create a shareable link.
              {/if}
            </p>
          </div>
        {/if}

        <!-- Email Format Toggle -->
        <div class="format-toggle">
          <label class="toggle-label">Email Format:</label>
          <div class="toggle-buttons">
            <button
              class="toggle-btn {emailFormat === 'text' ? 'active' : ''}"
              on:click={() => emailFormat = 'text'}
              type="button"
            >
              Text
            </button>
            <button
              class="toggle-btn {emailFormat === 'pdf' ? 'active' : ''}"
              on:click={() => emailFormat = 'pdf'}
              type="button"
            >
              PDF
            </button>
          </div>
        </div>

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
              <p>Share via email {emailFormat === 'pdf' ? '(PDF)' : '(Text)'}</p>
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

          <!-- Copy Link (only for saved estimates) -->
          {#if $isAuthenticated && $currentEstimateId}
            <button class="share-option" on:click={handleCopyLink} disabled={isGeneratingLink}>
              <div class="option-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </div>
              <div class="option-content">
                <h3>Copy Link</h3>
                <p>{isGeneratingLink ? 'Generating...' : 'Copy shareable link'}</p>
              </div>
            </button>
          {/if}
        </div>

        <!-- Share link display (if generated) -->
        {#if linkGenerated && shareUrl}
          <div class="share-link-container">
            <label for="share-link-input">Share Link</label>
            <div class="link-input-group">
              <input
                id="share-link-input"
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
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Unsaved Changes Warning Modal -->
<EmailUnsavedChangesModal
  isOpen={showUnsavedChangesModal}
  onClose={() => showUnsavedChangesModal = false}
  onEmailCurrent={handleEmailCurrentVersion}
  onSaveAndEmail={handleSaveAndEmail}
/>

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

  .info-message {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-message p {
    margin: 0;
    color: #1e40af;
    font-size: 0.875rem;
  }

  .format-toggle {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .toggle-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .toggle-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .toggle-btn {
    flex: 1;
    padding: 0.625rem 1rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
  }

  .toggle-btn:hover:not(.active) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .toggle-btn.active {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
  }

  .share-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    margin-top: 1.5rem;
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
