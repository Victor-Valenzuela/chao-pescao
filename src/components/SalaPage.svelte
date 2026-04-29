<script>
  import { onMount } from 'svelte';
  import Lobby from './Lobby.svelte';
  import GameBoard from './GameBoard.svelte';

  let roomCode = $state('');

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      roomCode = code.toUpperCase();
    } else {
      window.location.href = '/';
    }
  });
</script>

{#if roomCode}
  <div class="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('/images/fondomain.png'); background-color: #0a5e8a;"></div>
    <div class="absolute inset-0 bg-black/20"></div>
    <div class="relative z-10 w-full flex flex-col items-center px-4 py-6">
      <Lobby {roomCode} />
      <GameBoard {roomCode} />
    </div>
  </div>
{/if}
