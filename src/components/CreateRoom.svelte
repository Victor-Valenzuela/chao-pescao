<script>
  import { createRoom, RoomServiceError } from '../lib/roomService';
  import { playerStore, setPlayerName, setCurrentRoom } from '../stores/playerStore';
  import { get } from 'svelte/store';

  const AVATARS = ['pikachu', 'psyduck', 'magikarp', 'slowpoke', 'snorlax', 'starmie', 'wartortle', 'lapras', 'blastoise', 'gyarados'];

  let hostName = $state('');
  let selectedAvatar = $state('');
  let loading = $state(false);
  let error = $state('');

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
      console.error('Error creando sala:', err);
      if (err instanceof RoomServiceError) { error = err.message; }
      else { error = 'Error al crear la sala. Intenta de nuevo.'; }
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="form-card">
  <h2 class="form-title form-title-cyan">🏠 Crear Sala</h2>
  <p class="form-subtitle">Ingresa tu nombre y elige tu avatar</p>

  <div class="form-field">
    <label for="host-name" class="form-label form-label-orange">Tu nombre</label>
    <input id="host-name" type="text" bind:value={hostName} placeholder="Ej: María" maxlength="12" class="form-input" />
  </div>

  <div class="form-field">
    <p class="form-label form-label-orange">Tu avatar</p>
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
    {loading ? '⏳ Creando...' : '🏠 Crear Sala'}
  </button>
</form>
