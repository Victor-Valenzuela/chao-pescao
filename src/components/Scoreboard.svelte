<script>
  import { WIN_SCORE } from '../lib/gameService';

  let { scores, players, onNextRound } = $props();

  let sortedPlayers = $derived(
    [...(players ?? [])].sort((a, b) => (scores?.[b.id] ?? 0) - (scores?.[a.id] ?? 0))
  );

  let hasWinner = $derived(
    Object.values(scores ?? {}).some((s) => s >= WIN_SCORE)
  );
</script>

<div class="scoreboard-card">
  <h2 class="scoreboard-title">🏆 Marcador</h2>

  {#if sortedPlayers.length}
    <div class="scoreboard-list">
      {#each sortedPlayers as player, i}
        <div class="scoreboard-row {i === 0 ? 'scoreboard-row-first' : ''}">
          <span class="scoreboard-pos">
            {#if i === 0}👑{:else}{i + 1}.{/if}
          </span>
          <span class="scoreboard-name">{player.name}</span>
          <span class="scoreboard-score">{scores?.[player.id] ?? 0}</span>
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
      Siguiente Ronda
    </button>
  {/if}
</div>
