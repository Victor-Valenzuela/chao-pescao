<script>
  import { createRoom, RoomServiceError } from '../lib/roomService';
  import { playerStore, setPlayerName, setCurrentRoom } from '../stores/playerStore';
  import { get } from 'svelte/store';

  let hostName = $state('');
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!hostName.trim() || loading) return;
    loading = true;
    error = '';
    try {
      const localPlayerId = get(playerStore).playerId;
      const code = await createRoom(hostName.trim(), localPlayerId);
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
  <p class="form-subtitle">Ingresa tu nombre para empezar</p>

  <div class="form-field">
    <label for="host-name" class="form-label form-label-orange">Tu nombre</label>
    <input id="host-name" type="text" bind:value={hostName} placeholder="Ej: María" maxlength="20" class="form-input" />
  </div>

  {#if error}
    <p class="form-error" role="alert">⚠️ {error}</p>
  {/if}

  <button type="submit" disabled={!hostName.trim() || loading} class="form-btn form-btn-cyan">
    {loading ? '⏳ Creando...' : '🏠 Crear Sala'}
  </button>
</form>
