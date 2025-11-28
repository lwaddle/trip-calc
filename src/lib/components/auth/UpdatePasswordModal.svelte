<script>
  import { updatePassword } from '$lib/stores/auth.js';
  import { closeModal, showToast } from '$lib/stores/ui.js';

  // Local state
  let newPassword = '';
  let confirmPassword = '';
  let errorMessage = '';
  let isLoading = false;

  // Form validation
  $: isValid = newPassword.trim() !== '' &&
                newPassword === confirmPassword &&
                newPassword.length >= 6;

  $: passwordsMatch = newPassword === confirmPassword || confirmPassword === '';
  $: passwordLongEnough = newPassword.length >= 6 || newPassword === '';

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isValid) {
      if (newPassword.length < 6) {
        errorMessage = 'Password must be at least 6 characters long';
      } else if (newPassword !== confirmPassword) {
        errorMessage = 'Passwords do not match';
      } else {
        errorMessage = 'Please fill in all fields';
      }
      return;
    }

    errorMessage = '';
    isLoading = true;

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        console.error('Update password error:', error);
        errorMessage = error.message || 'Failed to update password. Please try again.';
        isLoading = false;
        return;
      }

      // Clear form
      newPassword = '';
      confirmPassword = '';

      // Show success message
      showToast('Password updated successfully!', 'success');

      // Close modal
      closeModal();
    } catch (error) {
      console.error('Unexpected password update error:', error);
      errorMessage = 'An unexpected error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleClose() {
    closeModal();
  }
</script>

<div class="modal-overlay" on:click={handleClose}>
  <div class="modal-content" on:click|stopPropagation>
    <div class="modal-header">
      <h2>Update Password</h2>
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
      <p class="instruction">
        Enter your new password below. Password must be at least 6 characters long.
      </p>

      {#if errorMessage}
        <div class="error-message" role="alert">
          {errorMessage}
        </div>
      {/if}

      <div class="form-group">
        <label for="new-password">New Password</label>
        <input
          id="new-password"
          type="password"
          bind:value={newPassword}
          placeholder="••••••••"
          disabled={isLoading}
          required
          autocomplete="new-password"
          minlength="6"
        />
        {#if !passwordLongEnough}
          <p class="field-hint error">Password must be at least 6 characters</p>
        {/if}
      </div>

      <div class="form-group">
        <label for="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          disabled={isLoading}
          required
          autocomplete="new-password"
        />
        {#if !passwordsMatch}
          <p class="field-hint error">Passwords do not match</p>
        {/if}
      </div>

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
          {isLoading ? 'Updating...' : 'Update Password'}
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

  .instruction {
    margin: 0 0 1.5rem 0;
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.5;
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

  .field-hint {
    margin: 0.5rem 0 0 0;
    font-size: 0.8rem;
    color: #6b7280;
  }

  .field-hint.error {
    color: #dc2626;
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
