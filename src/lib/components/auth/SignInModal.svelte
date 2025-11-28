<script>
  import { signIn } from '$lib/stores/auth.js';
  import { closeModal, openModal, showToast } from '$lib/stores/ui.js';

  // Local state
  let email = '';
  let password = '';
  let errorMessage = '';
  let isLoading = false;

  // Form validation
  $: isValid = email.trim() !== '' && password.trim() !== '';

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) {
      errorMessage = 'Please enter both email and password';
      return;
    }

    errorMessage = '';
    isLoading = true;

    try {
      const { user, error } = await signIn(email.trim(), password);

      if (error) {
        console.error('Sign in error:', error);
        errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
        isLoading = false;
        return;
      }

      if (user) {
        // Clear form
        email = '';
        password = '';

        // Show success message
        showToast('Successfully signed in!', 'success');

        // Close modal
        closeModal();
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleForgotPassword() {
    closeModal();
    openModal('password-reset');
  }

  function handleClose() {
    closeModal();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-overlay" on:click={handleClose} role="presentation">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="sign-in-title">
    <div class="modal-header">
      <h2 id="sign-in-title">Sign In</h2>
      <button
        type="button"
        class="close-btn"
        on:click={handleClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>

    <form on:submit={handleSubmit} class="modal-body">
      {#if errorMessage}
        <div class="error-message" role="alert">
          {errorMessage}
        </div>
      {/if}

      <div class="form-group">
        <label for="modal-email">Email</label>
        <input
          id="modal-email"
          type="email"
          bind:value={email}
          placeholder="your@email.com"
          disabled={isLoading}
          required
          autocomplete="email"
        />
      </div>

      <div class="form-group">
        <label for="modal-password">Password</label>
        <input
          id="modal-password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          disabled={isLoading}
          required
          autocomplete="current-password"
        />
      </div>

      <button
        type="button"
        class="forgot-password"
        on:click={handleForgotPassword}
        disabled={isLoading}
      >
        Forgot password?
      </button>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          on:click={handleClose}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </form>
  </div>
</div>

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
    max-width: 450px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 0.875rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-group input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .forgot-password {
    background: none;
    border: none;
    color: #667eea;
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0;
    margin-bottom: 1.5rem;
    text-align: left;
    transition: color 0.2s;
  }

  .forgot-password:hover:not(:disabled) {
    color: #764ba2;
    text-decoration: underline;
  }

  .forgot-password:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  @media (max-width: 640px) {
    .modal-content {
      margin: 1rem;
    }

    .modal-footer {
      flex-direction: column-reverse;
    }

    .btn {
      width: 100%;
    }
  }
</style>
