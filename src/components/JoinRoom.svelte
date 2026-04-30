<script>
  import { joinRoom, RoomServiceError } from '../lib/roomService';
  import { playerStore, setPlayerName, setCurrentRoom } from '../stores/playerStore';
  import { get } from 'svelte/store';

  const AVATARS = ['pikachu', 'psyduck', 'magikarp', 'slowpoke', 'snorlax', 'starmie', 'wartortle', 'lapras', 'blastoise', 'gyarados'];

  let { initialCode = '' } = $props();

  let roomCode = $state(initialCode);
  let playerName = $state('');
  let selectedAvatar = $state('');
  let loading = $state(false);
  let error = $state('');

  function handleCodeInput(e) {
    roomCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (roomCode.length !== 4 || !playerName.trim() || !selectedAvatar || loading) return;
    loading = true;
    error = '';
    try {
      const localPlayerId = get(playerStore).playerId;
      await joinRoom(roomCode, playerName.trim(), localPlayerId, selectedAvatar);
      setPlayerName(playerName.trim());
      setCurrentRoom(roomCode);
      window.location.href = '/sala?code=' + roomCode;
    } catch (err) {
      console.error('Error uniéndose a sala:', err);
      if (err instanceof RoomServiceError) {
        if (err.code === 'ROOM_NOT_FOUND') { error = 'La sala no existe. Verifica el código.'; }
        else if (err.code === 'GAME_ALREADY_STARTED') { error = 'La partida ya está en curso.'; }
        else if (err.code === 'NAME_TAKEN') { error = 'Ya hay un jugador con ese nombre. Elige otro.'; }
        else if (err.code === 'AVATAR_TAKEN') { error = 'Ese avatar ya fue elegido. Elige otro.'; }
        else { error = err.message; }
      } else { error = 'Error al unirse. Intenta de nuevo.'; }
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="form-card">
  <h2 class="form-title form-title-orange">🔑 Unirse a Sala</h2>
  <p class="form-subtitle">Ingresa el código que te compartieron</p>

  <div class="form-field">
    <label for="room-code" class="form-label form-label-cyan">Código de sala</label>
    <input id="room-code" type="text" value={roomCode} oninput={handleCodeInput} placeholder="Ej: A3K9" maxlength="4" autocomplete="off" class="form-input form-input-orange code-input" />
  </div>

  <div class="form-field">
    <label for="player-name" class="form-label form-label-cyan">Tu nombre</label>
    <input id="player-name" type="text" bind:value={playerName} placeholder="Ej: Carlos" maxlength="12" class="form-input form-input-orange" />
  </div>

  <div class="form-field">
    <p class="form-label form-label-cyan">Tu avatar</p>
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

  <button type="submit" disabled={roomCode.length !== 4 || !playerName.trim() || !selectedAvatar || loading} class="form-btn form-btn-orange">
    {loading ? '⏳ Uniéndose...' : '🎮 Unirse'}
  </button>
</form>
