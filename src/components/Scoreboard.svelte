<script>
  import { WIN_SCORE } from '../lib/gameService';
  import { tt } from '../lib/i18n/index';

  let { scores, prevScores = {}, players, onNextRound, endReason = null, isFisher = false, localPlayerId = '', roles = {}, discardedPlayerIds = [] } = $props();

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  let sortedPlayers = $derived(
    [...(players ?? [])].sort((a, b) => (scores?.[b.id] ?? 0) - (scores?.[a.id] ?? 0))
  );

  let hasWinner = $derived(
    Object.values(scores ?? {}).some((s) => s >= WIN_SCORE)
  );

  let localRole = $derived(roles?.[localPlayerId] ?? null);
  let wasDiscarded = $derived(discardedPlayerIds.includes(localPlayerId));

  function pointsDiff(playerId) {
    const current = scores?.[playerId] ?? 0;
    const prev = prevScores?.[playerId] ?? 0;
    return current - prev;
  }
</script>

<div class="scoreboard-card">
  {#if endReason === 'last_blue'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-green">{@html t('score.lastBlue.fisher')}</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-red">{@html t('score.lastBlue.blue')}</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">{@html t('score.lastBlue.other')}</p>
    {/if}
  {:else if endReason === 'blue_found'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-red">{@html t('score.blueFound.fisher')}</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-green">{@html t('score.blueFound.blue')}</p>
    {:else if localRole === 'red' && !wasDiscarded}
      <p class="scoreboard-end-msg scoreboard-msg-green">{@html t('score.blueFound.redSafe')}</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">{@html t('score.blueFound.other')}</p>
    {/if}
  {:else if endReason === 'fisher_stopped'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">{@html t('score.stopped.fisher')}</p>
    {:else if localRole === 'red' && !wasDiscarded}
      <p class="scoreboard-end-msg scoreboard-msg-green">{@html t('score.stopped.redSafe')}</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-red">{@html t('score.stopped.blue')}</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">{@html t('score.stopped.other')}</p>
    {/if}
  {/if}

  <h2 class="scoreboard-title">{t('score.title')}</h2>

  {#if sortedPlayers.length}
    <div class="scoreboard-list">
      {#each sortedPlayers as player, i}
        <div class="scoreboard-row {i === 0 ? 'scoreboard-row-first' : ''}">
          <img src={`/images/avatares/${player.avatar ?? 'magikarp'}.png`} alt={player.avatar ?? ''} class="player-avatar-img" />
          <span class="scoreboard-name">{player.name}</span>
          <span class="score-badge score-badge-{Math.min(i + 1, 4)}">{scores?.[player.id] ?? 0}</span>
          {#if pointsDiff(player.id) > 0}
            <span class="score-diff score-diff-positive">+{pointsDiff(player.id)}</span>
          {:else if pointsDiff(player.id) < 0}
            <span class="score-diff score-diff-negative">{pointsDiff(player.id)}</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if hasWinner}
    <p class="scoreboard-winner">{t('score.winner', { name: sortedPlayers[0]?.name, points: WIN_SCORE })}</p>
    <button onclick={() => window.location.href = '/'} class="scoreboard-btn scoreboard-btn-green">
      {t('score.resultsBtn')}
    </button>
  {:else if onNextRound}
    <button onclick={onNextRound} class="scoreboard-btn scoreboard-btn-cyan">
      {t('score.nextRound')}
    </button>
  {/if}
</div>
