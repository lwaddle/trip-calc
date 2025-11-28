<script>
  import ProfileCard from './ProfileCard.svelte';
  import { userProfiles } from '$lib/stores/profiles';
</script>

<div class="profiles-list">
  <div class="profiles-grid">
    {#each $userProfiles as profile (profile.id)}
      <ProfileCard {profile} />
    {/each}
  </div>
</div>

<style>
  .profiles-list {
    width: 100%;
  }

  .profiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    .profiles-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
</style>
