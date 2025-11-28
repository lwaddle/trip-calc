# Svelte Application Architecture

## File Structure

```
trip-calc/
├── src/
│   ├── App.svelte                    # Root component
│   ├── main.js                       # Entry point
│   │
│   ├── lib/
│   │   ├── components/               # UI Components
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Header.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   └── MobileMenu.svelte
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── SignInView.svelte
│   │   │   │   ├── SignInModal.svelte
│   │   │   │   ├── PasswordResetModal.svelte
│   │   │   │   └── UpdatePasswordModal.svelte
│   │   │   │
│   │   │   ├── calculator/
│   │   │   │   ├── CalculatorForm.svelte
│   │   │   │   ├── FlightLeg.svelte
│   │   │   │   ├── FlightLegsList.svelte
│   │   │   │   ├── CrewMember.svelte
│   │   │   │   ├── CrewList.svelte
│   │   │   │   ├── ProfileSelector.svelte
│   │   │   │   └── EstimateSummary.svelte
│   │   │   │
│   │   │   ├── profiles/
│   │   │   │   ├── ProfilesView.svelte
│   │   │   │   ├── ProfileCard.svelte
│   │   │   │   ├── ProfileEditor.svelte
│   │   │   │   └── ProfilesList.svelte
│   │   │   │
│   │   │   ├── estimates/
│   │   │   │   ├── EstimatesView.svelte
│   │   │   │   ├── EstimateCard.svelte
│   │   │   │   ├── EstimatesList.svelte
│   │   │   │   └── EmptyState.svelte
│   │   │   │
│   │   │   ├── share/
│   │   │   │   ├── ShareModal.svelte
│   │   │   │   ├── ShareView.svelte
│   │   │   │   └── ShareOptions.svelte
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── Modal.svelte
│   │   │       ├── Toast.svelte
│   │   │       ├── Button.svelte
│   │   │       └── Dropdown.svelte
│   │   │
│   │   ├── stores/                   # State Management
│   │   │   ├── auth.js              # Authentication state
│   │   │   ├── calculator.js        # Legs, crew, calculations
│   │   │   ├── profiles.js          # User profiles
│   │   │   ├── estimates.js         # Saved estimates
│   │   │   └── ui.js                # Modals, toasts, loading
│   │   │
│   │   ├── services/                 # API & External Services
│   │   │   ├── auth.js              # Supabase auth (from vanilla JS)
│   │   │   ├── database.js          # Supabase database (from vanilla JS)
│   │   │   └── supabase.js          # Supabase client (from vanilla JS)
│   │   │
│   │   └── utils/                    # Pure Functions & Utilities
│   │       ├── calculations.js      # Trip cost calculations
│   │       ├── formatters.js        # Currency, number formatting
│   │       ├── validation.js        # Form validation
│   │       ├── pdfExport.js         # PDF generation
│   │       └── constants.js         # App constants
│   │
│   └── styles/
│       └── global.css                # Global styles
│
├── index.html                         # HTML entry point
├── vite.config.js                     # Vite configuration
├── package.json
├── MIGRATION.md                       # Migration planning doc
├── ARCHITECTURE.md                    # This file
└── TODO.md                           # Task list
```

---

## Naming Conventions

### Files
- **Components:** PascalCase.svelte (`FlightLeg.svelte`, `ProfileCard.svelte`)
- **Stores:** camelCase.js (`calculator.js`, `auth.js`)
- **Services:** camelCase.js (`database.js`, `auth.js`)
- **Utils:** camelCase.js (`formatters.js`, `calculations.js`)

### Variables & Functions
- **Variables:** camelCase (`totalCost`, `selectedProfile`)
- **Constants:** UPPER_SNAKE_CASE (`DEFAULT_PROFILE_ID`, `STANDARD_PROFILES`)
- **Functions:** camelCase (`calculateTotal`, `formatCurrency`)
- **Components:** PascalCase when importing (`<FlightLeg />`)

### Stores
- **Writable stores:** Plural nouns (`legs`, `profiles`, `estimates`)
- **Derived stores:** Descriptive names (`totalCost`, `hasUnsavedChanges`)

---

## State Management Patterns

### Global State (Svelte Stores)

Use stores for state that needs to be shared across multiple components:

```javascript
// stores/calculator.js
import { writable, derived } from 'svelte/store';

// Writable stores for mutable state
export const legs = writable([]);
export const crew = writable([]);
export const fuelPrice = writable(6.00);

// Derived stores for computed values
export const totalFuelCost = derived(
  [legs, fuelPrice],
  ([$legs, $fuelPrice]) => {
    return $legs.reduce((sum, leg) => sum + (leg.fuel * $fuelPrice), 0);
  }
);

// Helper functions for complex updates
export function addLeg(leg) {
  legs.update(l => [...l, { ...leg, id: Date.now() }]);
}

export function removeLeg(id) {
  legs.update(l => l.filter(leg => leg.id !== id));
}
```

### Local Component State

Use `let` for state that only matters within a component:

```svelte
<script>
  // Local UI state
  let isOpen = false;
  let selectedTab = 'details';
  let inputValue = '';

  function toggle() {
    isOpen = !isOpen;
  }
</script>
```

### Reactive Statements

Use `$:` for derived values within a component:

```svelte
<script>
  import { legs } from '$lib/stores/calculator';

  // Automatically recalculates when $legs changes
  $: legCount = $legs.length;
  $: hasLegs = $legs.length > 0;
  $: totalDistance = $legs.reduce((sum, leg) => sum + leg.distance, 0);
</script>

<p>You have {legCount} flight legs totaling {totalDistance} miles</p>
```

---

## Component Patterns

### Component Template

```svelte
<script>
  // 1. Imports
  import { onMount } from 'svelte';
  import { someStore } from '$lib/stores/calculator';
  import ChildComponent from './ChildComponent.svelte';

  // 2. Props (exported variables)
  export let title = 'Default Title';
  export let data;
  export let onSave = () => {};

  // 3. Local state
  let isLoading = false;
  let errorMessage = '';

  // 4. Reactive statements
  $: isValid = data && data.length > 0;

  // 5. Functions
  function handleSubmit() {
    isLoading = true;
    // Logic here
    onSave(data);
    isLoading = false;
  }

  // 6. Lifecycle
  onMount(() => {
    // Runs when component mounts
    return () => {
      // Cleanup function (runs on unmount)
    };
  });
</script>

<!-- 7. Markup -->
<div class="component-container">
  <h2>{title}</h2>

  {#if isLoading}
    <p>Loading...</p>
  {:else if errorMessage}
    <p class="error">{errorMessage}</p>
  {:else}
    <ChildComponent {data} on:change={handleSubmit} />
  {/if}
</div>

<!-- 8. Scoped styles -->
<style>
  .component-container {
    padding: 1rem;
  }

  .error {
    color: red;
  }
</style>
```

### Props Pattern

```svelte
<script>
  // Required prop (no default)
  export let id;

  // Optional prop with default
  export let name = 'Untitled';

  // Callback prop
  export let onUpdate = (value) => {};

  // Object/array props
  export let leg = {};
  export let items = [];
</script>

<!-- Usage in parent: -->
<!-- <FlightLeg {id} {leg} onUpdate={handleUpdate} /> -->
```

### Events Pattern

**Child component (emit event):**
```svelte
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('save', { data: 'some data' });
  }
</script>

<button on:click={handleClick}>Save</button>
```

**Parent component (listen):**
```svelte
<script>
  import Child from './Child.svelte';

  function handleSave(event) {
    console.log(event.detail); // { data: 'some data' }
  }
</script>

<Child on:save={handleSave} />
```

---

## Store Usage Patterns

### Reading from Stores

```svelte
<script>
  import { legs, crew } from '$lib/stores/calculator';

  // Access store value with $ prefix
  // Automatically subscribes/unsubscribes
</script>

<p>You have {$legs.length} legs and {$crew.length} crew members</p>
```

### Updating Stores

```svelte
<script>
  import { legs } from '$lib/stores/calculator';

  function addLeg() {
    // Update entire store
    legs.update(l => [...l, { id: Date.now(), origin: '', destination: '' }]);
  }

  function updateLeg(id, field, value) {
    // Update specific item
    legs.update(l => l.map(leg =>
      leg.id === id ? { ...leg, [field]: value } : leg
    ));
  }

  function clearLegs() {
    // Set entire store
    legs.set([]);
  }
</script>
```

### Two-Way Binding with Stores

```svelte
<script>
  import { fuelPrice } from '$lib/stores/calculator';
</script>

<!-- Automatically updates store on input change -->
<input type="number" bind:value={$fuelPrice} />
```

---

## Form Patterns

### Input Binding

```svelte
<script>
  let value = '';
  let checked = false;
  let selected = 'option1';
</script>

<!-- Text input -->
<input type="text" bind:value />

<!-- Checkbox -->
<input type="checkbox" bind:checked />

<!-- Select dropdown -->
<select bind:value={selected}>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>

<!-- Number input with validation -->
<input
  type="number"
  bind:value
  min="0"
  step="0.01"
/>
```

### Form Submission

```svelte
<script>
  let formData = {
    name: '',
    email: '',
    password: ''
  };

  let errors = {};

  function validate() {
    errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    // Submit logic here
    console.log('Form submitted:', formData);
  }
</script>

<form on:submit={handleSubmit}>
  <label>
    Name:
    <input type="text" bind:value={formData.name} />
    {#if errors.name}<span class="error">{errors.name}</span>{/if}
  </label>

  <button type="submit">Submit</button>
</form>
```

---

## Conditional Rendering

```svelte
<script>
  import { isAuthenticated } from '$lib/stores/auth';
  let count = 5;
</script>

<!-- If/else -->
{#if $isAuthenticated}
  <p>Welcome back!</p>
{:else}
  <p>Please sign in</p>
{/if}

<!-- If/else if/else -->
{#if count === 0}
  <p>No items</p>
{:else if count === 1}
  <p>One item</p>
{:else}
  <p>{count} items</p>
{/if}
```

---

## List Rendering

```svelte
<script>
  import { legs } from '$lib/stores/calculator';
</script>

<!-- Each loop -->
{#each $legs as leg, index (leg.id)}
  <div class="leg">
    <h3>Leg {index + 1}</h3>
    <p>{leg.origin} → {leg.destination}</p>
  </div>
{:else}
  <p>No legs added yet</p>
{/each}

<!-- Key is important for proper updates! Use unique ID -->
```

---

## Styling Approach

### Scoped Component Styles

```svelte
<style>
  /* These styles only apply to this component */
  .container {
    padding: 1rem;
  }

  h2 {
    color: blue; /* Won't affect h2 elements in other components */
  }
</style>
```

### Global Styles

```css
/* src/styles/global.css */
:root {
  --primary-color: #2563eb;
  --text-color: #1f2937;
  --border-radius: 8px;
}

body {
  font-family: 'Inter', sans-serif;
  color: var(--text-color);
}
```

### Using CSS Variables

```svelte
<style>
  .button {
    background: var(--primary-color);
    border-radius: var(--border-radius);
  }
</style>
```

---

## Error Handling

### Service Layer

```javascript
// services/database.js
export async function saveEstimate(data) {
  try {
    const { data: result, error } = await supabase
      .from('estimates')
      .insert(data);

    if (error) throw error;

    return { data: result, error: null };
  } catch (error) {
    console.error('Save estimate error:', error);
    return { data: null, error: error.message };
  }
}
```

### Component Layer

```svelte
<script>
  import { saveEstimate } from '$lib/services/database';
  import { showToast } from '$lib/stores/ui';

  async function handleSave() {
    const { data, error } = await saveEstimate(estimateData);

    if (error) {
      showToast(error, 'error');
      return;
    }

    showToast('Estimate saved successfully', 'success');
  }
</script>
```

---

## Code Organization Principles

### Single Responsibility
Each component should do one thing well:
- ✅ `FlightLeg.svelte` - Renders a single flight leg
- ✅ `FlightLegsList.svelte` - Manages the list of legs
- ❌ `FlightLegsAndCrewAndCalculations.svelte` - Too much!

### Separation of Concerns
- **Components:** UI and user interaction
- **Stores:** State management
- **Services:** API calls and external integrations
- **Utils:** Pure functions, no side effects

### DRY (Don't Repeat Yourself)
Extract reusable logic:
- Shared UI → Component (`Button.svelte`, `Modal.svelte`)
- Shared logic → Utility function
- Shared state → Store

---

## Performance Considerations

### Avoid Unnecessary Reactivity

```svelte
<script>
  import { legs } from '$lib/stores/calculator';

  // ❌ BAD: Recalculates on every component update
  let total = $legs.reduce((sum, leg) => sum + leg.cost, 0);

  // ✅ GOOD: Only recalculates when $legs changes
  $: total = $legs.reduce((sum, leg) => sum + leg.cost, 0);
</script>
```

### Use Keys in Each Loops

```svelte
<!-- ❌ BAD: Svelte can't track items properly -->
{#each items as item}
  <div>{item.name}</div>
{/each}

<!-- ✅ GOOD: Svelte can efficiently update specific items -->
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

---

## Migration Notes

### What Changed from Vanilla JS

| Vanilla JS | Svelte |
|------------|--------|
| Manual DOM updates | Automatic reactivity |
| `document.getElementById()` | Component state / stores |
| String concatenation for HTML | Declarative markup |
| Event listeners in JS | `on:event` directives |
| Manual state management | Svelte stores |
| Global state object | Multiple focused stores |

### What Stayed the Same

- Calculation logic (pure functions)
- Service layer (auth.js, database.js)
- Supabase integration
- PDF export logic (PDFKit)
- Overall app functionality

---

## Resources

- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Svelte API Docs](https://svelte.dev/docs)
- [Svelte Store Guide](https://svelte.dev/tutorial/writable-stores)
- [Vite + Svelte Guide](https://vitejs.dev/guide/)

---

## Last Updated
- **Date:** 2025-01-XX (Initial creation)
- **Status:** Architecture defined, ready for implementation
