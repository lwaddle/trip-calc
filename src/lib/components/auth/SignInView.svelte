<script>
  import { signIn } from '$lib/stores/auth.js';
  import { openModal } from '$lib/stores/ui.js';

  // Props
  export let onContinueAsGuest = () => {};
  export let onSignInSuccess = () => {};

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

        // Call success callback
        onSignInSuccess();
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleForgotPassword() {
    openModal('password-reset');
  }

  function handleContinueAsGuest() {
    onContinueAsGuest();
  }
</script>

<div class="sign-in-view">
  <div class="sign-in-container">
    <div class="sign-in-header">
      <h1>Trip Cost Calculator</h1>
      <p>Sign in to save estimates and manage profiles</p>
    </div>

    <form on:submit={handleSubmit} class="sign-in-form">
      {#if errorMessage}
        <div class="error-message" role="alert">
          {errorMessage}
        </div>
      {/if}

      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="your@email.com"
          disabled={isLoading}
          required
          autocomplete="email"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
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

      <button
        type="submit"
        class="btn btn-primary"
        disabled={!isValid || isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <div class="divider">
        <span>or</span>
      </div>

      <button
        type="button"
        class="btn btn-secondary"
        on:click={handleContinueAsGuest}
        disabled={isLoading}
      >
        Continue as Guest
      </button>

      <p class="guest-note">
        Guest mode lets you use the calculator without an account.
        You won't be able to save estimates or create profiles.
      </p>
    </form>
  </div>
</div>

<style>
  .sign-in-view {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1.5rem;
  }

  .sign-in-container {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 420px;
    width: 100%;
    overflow: hidden;
  }

  .sign-in-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
  }

  .sign-in-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .sign-in-header p {
    margin: 0;
    font-size: 0.95rem;
    opacity: 0.95;
  }

  .sign-in-form {
    padding: 2rem;
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

  .btn {
    width: 100%;
    padding: 0.875rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
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

  .divider {
    margin: 1.5rem 0;
    text-align: center;
    position: relative;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e5e7eb;
  }

  .divider span {
    background: white;
    padding: 0 1rem;
    color: #9ca3af;
    font-size: 0.875rem;
    position: relative;
    z-index: 1;
  }

  .guest-note {
    margin: 1rem 0 0 0;
    font-size: 0.8rem;
    color: #6b7280;
    text-align: center;
    line-height: 1.4;
  }

  @media (max-width: 640px) {
    .sign-in-view {
      padding: 1rem;
    }

    .sign-in-header h1 {
      font-size: 1.5rem;
    }

    .sign-in-header p {
      font-size: 0.875rem;
    }

    .sign-in-form {
      padding: 1.5rem;
    }
  }
</style>
