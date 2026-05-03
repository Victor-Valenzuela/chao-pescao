<script>
  import { generateRanking } from '../lib/gameService';
  import { playerStore, setCurrentRoom } from '../stores/playerStore';
  import { leaveRoom } from '../lib/roomService';
  import { get } from 'svelte/store';
  import { tt } from '../lib/i18n/index';

  let { scores, players, roomCode = '' } = $props();

  let ranking = $derived(generateRanking(scores ?? {}, players ?? []));

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  async function handleBackToLobby() {
    const localPlayerId = get(playerStore).playerId;
    try {
      if (roomCode) await leaveRoom(roomCode, localPlayerId);
    } catch {}
    setCurrentRoom(null);
    window.location.href = '/';
  }
</script>

<div class="scoreboard-card">
  <h2 class="scoreboard-title">{t('results.title')}</h2>
  <p class="results-subtitle">{t('results.subtitle')}</p>

  {#if ranking.length}
    <div class="scoreboard-list">
      {#each ranking as entry, i}
        <div class="scoreboard-row {i === 0 ? 'scoreboard-row-first' : ''}">
          <img src={`/images/avatares/${entry.avatar ?? 'magikarp'}.png`} alt={entry.avatar ?? ''} class="player-avatar-img" />
          <span class="scoreboard-name">{entry.name}</span>
          <span class="score-badge score-badge-{Math.min(i + 1, 4)}">{entry.score}</span>
        </div>
      {/each}
    </div>
  {/if}

  <button onclick={handleBackToLobby} class="scoreboard-btn scoreboard-btn-cyan">
    {t('results.backBtn')}
  </button>
</div>
