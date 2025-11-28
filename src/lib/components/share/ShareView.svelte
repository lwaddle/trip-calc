<script>
  import { onMount } from 'svelte';
  import { isAuthenticated } from '$lib/stores/auth.js';
  import { legs, crew, estimate, applyCalculatorState } from '$lib/stores/calculator.js';
  import { loadShared, importSharedEstimate, exitShareView, sharedEstimateData } from '$lib/stores/share.js';
  import { showToast } from '$lib/stores/ui.js';
  import EstimateSummary from '$lib/components/calculator/EstimateSummary.svelte';
  import FlightLegsList from '$lib/components/calculator/FlightLegsList.svelte';
  import CrewList from '$lib/components/calculator/CrewList.svelte';
  import ClientShareModal from './ClientShareModal.svelte';

  export let shareToken = '';

  let isLoading = true;
  let loadError = null;
  let estimateData = null;
  let isImporting = false;
  let showClientShareModal = false;

  onMount(async () => {
    if (!shareToken) {
      loadError = 'No share token provided';
      isLoading = false;
      return;
    }

    // Load the shared estimate
    const { data, error } = await loadShared(shareToken);

    if (error) {
      loadError = error.message || 'Failed to load shared estimate';
      isLoading = false;
      return;
    }

    estimateData = data;

    // Apply the estimate data to the calculator (read-only mode)
    if (data.estimate_data) {
      applyCalculatorState(data.estimate_data);
    }

    isLoading = false;
  });

  async function handleImport() {
    if (!$isAuthenticated) {
      showToast('Please sign in to import this estimate', 'error');
      return;
    }

    isImporting = true;

    const { data, error } = await importSharedEstimate(shareToken);

    isImporting = false;

    if (!error && data) {
      // Successfully imported - exit share view and show success
      exitShareView();
      // The user will now be viewing the normal calculator with the imported estimate loaded
    }
  }

  function handleExitShareView() {
    exitShareView();
  }

  function handleShareClick() {
    showClientShareModal = true;
  }

  // Generate estimate text for sharing
  function getEstimateText() {
    const legs = $estimate.legsSummary || [];
    const total = $estimate.estimatedTotal || 0;

    let text = 'Trip Cost Estimate\n\n';

    if (estimateData?.name) {
      text += `Name: ${estimateData.name}\n\n`;
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

  // Get the current page URL for sharing
  $: shareUrl = typeof window !== 'undefined' ? window.location.href : '';
</script>

{#if isLoading}
  <div class="share-view">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading shared estimate...</p>
    </div>
  </div>
{:else if loadError}
  <div class="share-view">
    <div class="error-container">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2>Failed to Load Estimate</h2>
      <p>{loadError}</p>
      <button class="btn btn-primary" on:click={handleExitShareView}>
        Go to Calculator
      </button>
    </div>
  </div>
{:else}
  <div class="share-view">
    <!-- Header Banner -->
    <div class="share-header">
      <div class="share-header-content">
        <div class="share-info">
          <h1>Shared Trip Cost Estimate</h1>
          {#if estimateData?.name}
            <p class="estimate-name">{estimateData.name}</p>
          {/if}
          {#if estimateData?.creator_email}
            <p class="creator-info">Created by {estimateData.creator_email}</p>
          {/if}
        </div>

        <div class="share-actions">
          <button class="btn btn-share" on:click={handleShareClick} title="Share this estimate">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          {#if $isAuthenticated}
            <button
              class="btn btn-primary"
              on:click={handleImport}
              disabled={isImporting}
            >
              {isImporting ? 'Importing...' : 'Import to My Account'}
            </button>
          {/if}
          <button class="btn btn-secondary" on:click={handleExitShareView}>
            Exit Share View
          </button>
        </div>
      </div>
    </div>

    <!-- Read-only Calculator View -->
    <div class="share-content">
      <div class="calculator-container readonly">
        <!-- Flight Legs (read-only) -->
        <div class="section">
          <h2>Flight Legs</h2>
          <FlightLegsList readonly={true} />
        </div>

        <!-- Crew (read-only) -->
        <div class="section">
          <h2>Crew</h2>
          <CrewList readonly={true} />
        </div>

        <!-- Estimate Summary -->
        <div class="section">
          <EstimateSummary />
        </div>
      </div>

      <!-- Sign-in CTA for guests -->
      {#if !$isAuthenticated}
        <div class="sign-in-cta">
          <div class="cta-content">
            <h3>Want to save or modify this estimate?</h3>
            <p>Sign in to import this estimate to your account and make changes.</p>
            <button class="btn-cta" on:click={() => window.location.href = '/'}>
              Sign in to save estimate
            </button>
          </div>
        </div>
      {/if}

      <!-- Footer link -->
      <div class="share-footer">
        <p>Want to create your own estimate? <a href="/" class="footer-link">Start here</a></p>
      </div>
    </div>
  </div>
{/if}

<!-- Client Share Modal -->
<ClientShareModal
  isOpen={showClientShareModal}
  onClose={() => showClientShareModal = false}
  shareUrl={shareUrl}
  estimateText={getEstimateText()}
/>

<style>
  .share-view {
    min-height: 100vh;
    background: #f9fafb;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
    text-align: center;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-container p {
    margin-top: 1rem;
    color: #64748b;
    font-size: 1rem;
  }

  .error-icon {
    color: #dc2626;
    margin-bottom: 1rem;
  }

  .error-container h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 0.5rem 0;
  }

  .error-container p {
    color: #64748b;
    margin: 0 0 1.5rem 0;
  }

  .share-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    padding: 2rem 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .share-header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
  }

  .share-info h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .estimate-name {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0 0 0.25rem 0;
    opacity: 0.95;
  }

  .creator-info {
    font-size: 0.875rem;
    margin: 0;
    opacity: 0.85;
  }

  .share-actions {
    display: flex;
    gap: 0.75rem;
  }

  .share-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .calculator-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .calculator-container.readonly {
    border: 2px solid #fbbf24;
    position: relative;
  }

  .calculator-container.readonly::before {
    content: 'READ-ONLY VIEW';
    position: absolute;
    top: -12px;
    left: 1rem;
    background: #fbbf24;
    color: #78350f;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .section {
    margin-bottom: 2rem;
  }

  .section:last-child {
    margin-bottom: 0;
  }

  .section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1rem 0;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .sign-in-cta {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #bfdbfe;
    border-radius: 12px;
    padding: 2rem;
    margin-top: 2rem;
    text-align: center;
  }

  .cta-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e40af;
    margin: 0 0 0.5rem 0;
  }

  .cta-content p {
    color: #1e40af;
    margin: 0 0 1.5rem 0;
    font-size: 0.938rem;
  }

  .btn-cta {
    background: #2563eb;
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.938rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-cta:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .share-footer {
    text-align: center;
    padding: 2rem 1rem;
    margin-top: 2rem;
    border-top: 1px solid #e5e7eb;
  }

  .share-footer p {
    color: #64748b;
    margin: 0;
    font-size: 0.938rem;
  }

  .footer-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .footer-link:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-share {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }

  .btn-share:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }

  .btn-primary {
    background: white;
    color: #2563eb;
  }

  .btn-primary:hover:not(:disabled) {
    background: #f9fafb;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    .share-header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .share-info h1 {
      font-size: 1.5rem;
    }

    .share-actions {
      width: 100%;
      flex-direction: column;
    }

    .btn {
      width: 100%;
    }

    .calculator-container {
      padding: 1.5rem;
    }

    .share-content {
      padding: 1.5rem 1rem;
    }
  }
</style>
