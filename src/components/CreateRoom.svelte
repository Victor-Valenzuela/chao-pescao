<script>
  import { createRoom, RoomServiceError } from '../lib/roomService';
  import { playerStore, setPlayerName, setCurrentRoom } from '../stores/playerStore';
  import { get } from 'svelte/store';
  import { tt } from '../lib/i18n/index';

  const AVATARS = ['pikachu', 'psyduck', 'magikarp', 'slowpoke', 'snorlax', 'starmie', 'wartortle', 'lapras', 'blastoise', 'gyarados'];

  let hostName = $state('');
  let selectedAvatar = $state('');
  let loading = $state(false);
  let error = $state('');

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hostName.trim() || !selectedAvatar || loading) return;
    loading = true;
    error = '';
    try {
      const localPlayerId = get(playerStore).playerId;
      const code = await createRoom(hostName.trim(), localPlayerId, selectedAvatar);
      setPlayerName(hostName.trim());
      setCurrentRoom(code);
      window.location.href = '/sala?code=' + code;
    } catch (err) {
      console.error('Error creating room:', err);
      if (err instanceof RoomServiceError) { error = err.message; }
      else { error = t('create.error'); }
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="form-card">
  <h2 class="form-title form-title-cyan">{t('create.title')}</h2>
  <p class="form-subtitle">{t('create.subtitle')}</p>

  <div class="form-field">
    <label for="host-name" class="form-label form-label-orange">{t('create.nameLabel')}</label>
    <input id="host-name" type="text" bind:value={hostName} placeholder={t('create.namePlaceholder')} maxlength="12" class="form-input" />
  </div>

  <div class="form-field">
    <p class="form-label form-label-orange">{t('create.avatarLabel')}</p>
    <div class="avatar-grid">
      {#each AVATARS as avatar}
        <button
          type="button"
          class="avatar-option {selectedAvatar === avatar ? 'avatar-selected' : ''}"
          onclick={() => selectedAvatar = avatar}
        >
          <img src={`/images/avatares/${avatar}.png`} alt={avatar} class="avatar-img" />
        </button>
      {/each}
    </div>
  </div>

  {#if error}
    <p class="form-error" role="alert">⚠️ {error}</p>
  {/if}

  <button type="submit" disabled={!hostName.trim() || !selectedAvatar || loading} class="form-btn form-btn-cyan">
    {loading ? t('create.loading') : t('create.submit')}
  </button>
</form>
