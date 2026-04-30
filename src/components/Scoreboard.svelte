<script>
  import { WIN_SCORE } from '../lib/gameService';

  let { scores, players, onNextRound, endReason = null, isFisher = false, localPlayerId = '', roles = {}, discardedPlayerIds = [] } = $props();

  let sortedPlayers = $derived(
    [...(players ?? [])].sort((a, b) => (scores?.[b.id] ?? 0) - (scores?.[a.id] ?? 0))
  );

  let hasWinner = $derived(
    Object.values(scores ?? {}).some((s) => s >= WIN_SCORE)
  );

  let localRole = $derived(roles?.[localPlayerId] ?? null);
  let wasDiscarded = $derived(discardedPlayerIds.includes(localPlayerId));
</script>

<div class="scoreboard-card">
  <!-- End reason message -->
  {#if endReason === 'last_blue'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-green">🎣 ¡No caíste en mentiras!<br/>+1 punto extra</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-red">🐟 ¡Aprende a mentir mejor!</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">🎣 El pescador descubrió a todos los mentirosos</p>
    {/if}
  {:else if endReason === 'blue_found'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-red">😱 ¡Descartaste al pez azul!<br/>Perdiste los puntos de la ronda</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-green">🎉 ¡Te pescaron por error!<br/>+1 punto para ti</p>
    {:else if localRole === 'red' && !wasDiscarded}
      <p class="scoreboard-end-msg scoreboard-msg-green">🤫 No te descubrieron mintiendo<br/>+1 punto</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">😱 El pescador descartó al pez azul</p>
    {/if}
  {:else if endReason === 'fisher_stopped'}
    {#if isFisher}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">✋ Terminaste tu turno<br/>Conservaste tus puntos</p>
    {:else if localRole === 'red' && !wasDiscarded}
      <p class="scoreboard-end-msg scoreboard-msg-green">🤫 ¡Supiste mentir!<br/>+1 punto</p>
    {:else if localRole === 'blue'}
      <p class="scoreboard-end-msg scoreboard-msg-red">🐟 No lograste engañar al pescador</p>
    {:else}
      <p class="scoreboard-end-msg scoreboard-msg-neutral">✋ Se terminó la ronda</p>
    {/if}
  {/if}

  <h2 class="scoreboard-title">🏆 Marcador</h2>

  {#if sortedPlayers.length}
    <div class="scoreboard-list">
      {#each sortedPlayers as player, i}
        <div class="scoreboard-row {i === 0 ? 'scoreboard-row-first' : ''}">
          <span class="scoreboard-name">{player.name}</span>
          <span class="score-badge score-badge-{Math.min(i + 1, 4)}">{scores?.[player.id] ?? 0}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if hasWinner}
    <p class="scoreboard-winner">🎉 ¡{sortedPlayers[0]?.name} llegó a {WIN_SCORE} puntos!</p>
    <button onclick={() => window.location.href = '/'} class="scoreboard-btn scoreboard-btn-green">
      🏆 Ver Resultados
    </button>
  {:else if onNextRound}
    <button onclick={onNextRound} class="scoreboard-btn scoreboard-btn-cyan">
      🎣 Siguiente Ronda
    </button>
  {/if}
</div>
