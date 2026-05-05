<script>
  import { discardPlayer, stopFishing } from '../lib/gameService';
  import { tt } from '../lib/i18n/index';
  import { soundDiscard, soundClick } from '../lib/soundService';

  let { roomCode, question, players, discardedPlayerIds, roundPoints = 0 } = $props();

  let loading = $state(false);
  let error = $state('');
  let selectedPlayerId = $state(null);

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

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
    soundDiscard();
    try {
      await discardPlayer(roomCode, selectedPlayerId);
      selectedPlayerId = null;
    } catch (err) { error = err?.message ?? 'Error'; }
    finally { loading = false; }
  }

  async function handleStop() {
    if (loading) return;
    loading = true;
    error = '';
    try { await stopFishing(roomCode); }
    catch (err) { error = err?.message ?? 'Error'; }
    finally { loading = false; }
  }
</script>

<div class="fisher-container">
  <div class="question-card">
    <div class="question-icon">🔍</div>
    <p class="question-text">{question}</p>
  </div>

  <p class="select-label">{t('fisher.whoLies')}</p>

  {#if activePlayers.length}
    <div class="player-cards">
      {#each activePlayers as player}
        <button
          onclick={() => selectPlayer(player.id)}
          disabled={loading}
          class="fish-card {selectedPlayerId === player.id ? 'fish-card-selected' : ''}"
        >
          <div class="fish-card-mystery">
            <img src={`/images/avatares/${player.avatar ?? 'magikarp'}.png`} alt={player.avatar ?? ''} class="fish-card-avatar-img" />
          </div>
          <span class="fish-card-name">{player.name}</span>
          {#if selectedPlayerId === player.id}
            <span class="fish-card-check">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  {:else}
    <p class="no-players">{t('fisher.noPlayers')}</p>
  {/if}

  {#if discardedPlayers.length}
    <div class="discarded-section">
      <p class="discarded-label">{t('fisher.discarded')}</p>
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

  <div class="action-buttons">
    <button onclick={confirmDiscard} disabled={!selectedPlayerId || loading} class="discard-btn">
      {#if loading}
        ⏳...
      {:else if selectedPlayerId}
        {t('fisher.discardBtn', { name: selectedPlayerName })}
      {:else}
        {t('fisher.selectBtn')}
      {/if}
    </button>

    <div class="round-points-display">
      <span class="round-points-label">{t('fisher.roundPoints')}</span>
      <span class="round-points-value">{roundPoints}</span>
    </div>

    <button onclick={handleStop} disabled={loading} class="stop-btn" style="margin-top: 1.5rem;">
      {loading ? '⏳...' : t('fisher.stopBtn')}
    </button>
  </div>
</div>
