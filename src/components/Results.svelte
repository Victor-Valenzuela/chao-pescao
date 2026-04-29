<script>
  import { generateRanking } from '../lib/gameService';

  let { scores, players } = $props();

  let ranking = $derived(generateRanking(scores ?? {}, players ?? []));

  function handleBackToLobby() {
    window.location.href = '/';
  }
</script>

<div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-md text-center">
  <h2 class="text-xl font-bold text-gray-800 mb-2">🏆 Resultados Finales</h2>
  <p class="text-gray-400 text-sm mb-4">Partida finalizada</p>

  {#if ranking.length}
    <ul class="flex flex-col gap-2 mb-6">
      {#each ranking as entry, i}
        <li class="flex items-center justify-between min-h-[44px] px-4 py-2 rounded-lg {i === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50'}">
          <span class="text-base text-gray-800">
            {#if i === 0}👑{:else}{i + 1}.{/if}
            <span class="{i === 0 ? 'font-bold' : ''}">{entry.name}</span>
          </span>
          <span class="text-lg font-bold {i === 0 ? 'text-yellow-600' : 'text-blue-700'}">{entry.score}</span>
        </li>
      {/each}
    </ul>
  {/if}

  <button
    onclick={handleBackToLobby}
    class="w-full min-h-[44px] bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
  >
    Volver al Lobby
  </button>
</div>
