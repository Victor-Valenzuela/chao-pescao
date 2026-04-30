<script>
  import { generateRanking } from '../lib/gameService';
  import { playerStore, setCurrentRoom } from '../stores/playerStore';
  import { leaveRoom } from '../lib/roomService';
  import { get } from 'svelte/store';

  let { scores, players, roomCode = '' } = $props();

  let ranking = $derived(generateRanking(scores ?? {}, players ?? []));

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
  <h2 class="scoreboard-title">🏆 Resultados Finales</h2>
  <p class="results-subtitle">Partida finalizada</p>

  {#if ranking.length}
    <div class="scoreboard-list">
      {#each ranking as entry, i}
        <div class="scoreboard-row {i === 0 ? 'scoreboard-row-first' : ''}">
          <span class="scoreboard-name">{entry.name}</span>
          <span class="score-badge-wrap">
            <img src={`/images/score-${Math.min(i + 1, 4)}.png`} alt={`Posición ${i + 1}`} />
            <span class="score-badge-num">{entry.score}</span>
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <button onclick={handleBackToLobby} class="scoreboard-btn scoreboard-btn-cyan">
    🏠 Volver al Inicio
  </button>
</div>
