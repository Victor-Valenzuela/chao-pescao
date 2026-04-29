<script>
  import { discardPlayer, stopFishing } from '../lib/gameService';

  let { roomCode, question, players, discardedPlayerIds, roundPoints = 0 } = $props();

  let loading = $state(false);
  let error = $state('');
  let selectedPlayerId = $state(null);

  let activePlayers = $derived(
    players.filter((p) => !discardedPlayerIds.includes(p.id))
  );
  let discardedPlayers = $derived(
    players.filter((p) => discardedPlayerIds.includes(p.id))
  );
  let selectedPlayerName = $derived(
    activePlayers.find((p) => p.id === selectedPlayerId)?.name ?? ''
  );

  function selectPlayer(playerId) {
    selectedPlayerId = selectedPlayerId === playerId ? null : playerId;
  }

  async function confirmDiscard() {
    if (!selectedPlayerId || loading) return;
    loading = true;
    error = '';
    try {
      await discardPlayer(roomCode, selectedPlayerId);
      selectedPlayerId = null;
    } catch (err) { error = err?.message ?? 'Error al descartar.'; }
    finally { loading = false; }
  }

  async function handleStop() {
    if (loading) return;
    loading = true;
    error = '';
    try { await stopFishing(roomCode); }
    catch (err) { error = err?.message ?? 'Error al parar.'; }
    finally { loading = false; }
  }
</script>

<div class="fisher-container">
  <!-- Question card — bigger and more prominent -->
  <div class="question-card">
    <div class="question-icon">🔍</div>
    <p class="question-text">{question}</p>
  </div>

  <!-- Player cards -->
  <p class="select-label">¿Quién miente?</p>

  {#if activePlayers.length}
    <div class="player-cards">
      {#each activePlayers as player}
        <button
          onclick={() => selectPlayer(player.id)}
          disabled={loading}
          class="fish-card {selectedPlayerId === player.id ? 'fish-card-selected' : ''}"
        >
          <div class="fish-card-mystery">?</div>
          <span class="fish-card-name">{player.name}</span>
          {#if selectedPlayerId === player.id}
            <span class="fish-card-check">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <p class="no-players">No quedan jugadores por descartar.</p>
  {/if}

  <!-- Discarded -->
  {#if discardedPlayers.length}
    <div class="discarded-section">
      <p class="discarded-label">Descartados</p>
      <div class="discarded-list">
        {#each discardedPlayers as player}
          <span class="discarded-chip">💀 {player.name}</span>
        {/each}
      </div>
    </div>
  {/if}

  {#if error}
    <p class="fisher-error">⚠️ {error}</p>
  {/if}

  <!-- Actions — fixed at bottom -->
  <div class="action-buttons">
    <button onclick={confirmDiscard} disabled={!selectedPlayerId || loading} class="discard-btn">
      {#if loading}
        ⏳...
      {:else if selectedPlayerId}
        🎯 Descartar a {selectedPlayerName}
      {:else}
        🎯 Selecciona un jugador
      {/if}
    </button>

    <div class="round-points-display">
      <span class="round-points-label">Puntos esta ronda:</span>
      <span class="round-points-value">{roundPoints}</span>
    </div>

    <button onclick={handleStop} disabled={loading} class="stop-btn" style="margin-top: 1.5rem;">
      {loading ? '⏳...' : '✋ Terminar turno'}
    </button>
  </div>
</div>


