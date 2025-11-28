<script>
  import { updateCrew, removeCrew } from '$lib/stores/calculator';

  // Svelte 5 $props() rune
  let { member, index } = $props();

  function handleUpdate(field, value) {
    updateCrew(member.id, field, value);
  }

  function handleRemove() {
    removeCrew(member.id);
  }
</script>

<div class="crew-member">
  <div class="crew-header">
    <span class="crew-number">#{index + 1}</span>
    <button type="button" class="remove-btn" on:click={handleRemove} title="Remove crew member">
      ✕
    </button>
  </div>

  <div class="crew-grid">
    <div class="form-group">
      <label for="role-{member.id}">Role</label>
      <input
        id="role-{member.id}"
        type="text"
        placeholder="Pilot, Flight Attendant, etc."
        value={member.role}
        on:input={(e) => handleUpdate('role', e.target.value)}
      />
    </div>

    <div class="form-group">
      <label for="rate-{member.id}">Daily Rate ($)</label>
      <input
        id="rate-{member.id}"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={member.rate}
        on:input={(e) => handleUpdate('rate', parseFloat(e.target.value) || 0)}
      />
    </div>
  </div>
</div>

<style>
  .crew-member {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .crew-member:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .crew-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .crew-number {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .remove-btn {
    background: transparent;
    border: none;
    color: #ef4444;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .remove-btn:hover {
    background: #fee2e2;
  }

  .crew-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 0.75rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.25rem;
  }

  .form-group input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .crew-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
