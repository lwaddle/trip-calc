<script>
  import { updateLeg, removeLeg } from '$lib/stores/calculator';

  // Svelte 5 $props() rune
  let { leg, index } = $props();

  function handleUpdate(field, value) {
    updateLeg(leg.id, field, value);
  }

  function handleRemove() {
    removeLeg(leg.id);
  }
</script>

<div class="flight-leg">
  <div class="leg-header">
    <h3>Leg {index + 1}</h3>
    <button type="button" class="remove-btn" on:click={handleRemove} title="Remove leg">
      ✕
    </button>
  </div>

  <div class="leg-grid">
    <!-- Route -->
    <div class="form-group">
      <label for="from-{leg.id}">From</label>
      <input
        id="from-{leg.id}"
        type="text"
        placeholder="KIAD"
        value={leg.from}
        on:input={(e) => handleUpdate('from', e.target.value)}
      />
    </div>

    <div class="form-group">
      <label for="to-{leg.id}">To</label>
      <input
        id="to-{leg.id}"
        type="text"
        placeholder="KTEB"
        value={leg.to}
        on:input={(e) => handleUpdate('to', e.target.value)}
      />
    </div>

    <!-- Flight time -->
    <div class="form-group">
      <label for="hours-{leg.id}">Flight Hours</label>
      <input
        id="hours-{leg.id}"
        type="number"
        min="0"
        step="1"
        value={leg.hours}
        on:input={(e) => handleUpdate('hours', parseInt(e.target.value) || 0)}
      />
    </div>

    <div class="form-group">
      <label for="minutes-{leg.id}">Flight Minutes</label>
      <input
        id="minutes-{leg.id}"
        type="number"
        min="0"
        max="59"
        step="1"
        value={leg.minutes}
        on:input={(e) => handleUpdate('minutes', parseInt(e.target.value) || 0)}
      />
    </div>

    <!-- Ground time -->
    <div class="form-group">
      <label for="ground-hours-{leg.id}">Ground Hours</label>
      <input
        id="ground-hours-{leg.id}"
        type="number"
        min="0"
        step="1"
        value={leg.groundHours}
        on:input={(e) => handleUpdate('groundHours', parseInt(e.target.value) || 0)}
      />
    </div>

    <div class="form-group">
      <label for="ground-minutes-{leg.id}">Ground Minutes</label>
      <input
        id="ground-minutes-{leg.id}"
        type="number"
        min="0"
        max="59"
        step="1"
        value={leg.groundMinutes}
        on:input={(e) => handleUpdate('groundMinutes', parseInt(e.target.value) || 0)}
      />
    </div>

    <!-- Fuel and distance -->
    <div class="form-group">
      <label for="fuel-{leg.id}">Fuel Burn (lbs)</label>
      <input
        id="fuel-{leg.id}"
        type="number"
        min="0"
        step="1"
        value={leg.fuelBurn}
        on:input={(e) => handleUpdate('fuelBurn', parseFloat(e.target.value) || 0)}
      />
    </div>

    <div class="form-group">
      <label for="distance-{leg.id}">Distance (nm)</label>
      <input
        id="distance-{leg.id}"
        type="number"
        min="0"
        step="1"
        value={leg.distance}
        on:input={(e) => handleUpdate('distance', parseFloat(e.target.value) || 0)}
      />
    </div>
  </div>
</div>

<style>
  .flight-leg {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }

  .flight-leg:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .leg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .leg-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
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

  .leg-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
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
    .leg-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
