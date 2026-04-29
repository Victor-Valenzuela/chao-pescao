<script>
  import { room } from '../stores/roomStore';
  import { playerStore, setCurrentRoom } from '../stores/playerStore';
  import { nextRound } from '../lib/gameService';
  import { leaveRoom } from '../lib/roomService';
  import { deleteDoc, doc } from 'firebase/firestore';
  import { db } from '../lib/firebase';
  import Swal from 'sweetalert2';
  import FisherView from './FisherView.svelte';
  import PlayerView from './PlayerView.svelte';
  import DiscardTimer from './DiscardTimer.svelte';
  import RevealScreen from './RevealScreen.svelte';
  import Scoreboard from './Scoreboard.svelte';
  import Results from './Results.svelte';

  let { roomCode } = $props();

  let roomData = $state(null);
  let localPlayerId = $state('');
  let roomWasLoaded = $state(false);
  let showScorePanel = $state(false);

  $effect(() => {
    const unsub = room.subscribe((value) => {
      roomData = value;
      if (value) roomWasLoaded = true;
      if (!value && roomWasLoaded && typeof window !== 'undefined') {
        setCurrentRoom(null);
        window.location.href = '/';
      }
    });
    return unsub;
  });

  $effect(() => {
    const unsub = playerStore.subscribe((value) => { localPlayerId = value.playerId; });
    return unsub;
  });

  let currentRound = $derived(roomData?.currentRound ?? null);
  let roundStatus = $derived(currentRound?.status ?? null);
  let isFisher = $derived(localPlayerId === currentRound?.fisherId);
  let nonFisherPlayers = $derived(
    (roomData?.players ?? []).filter((p) => p.id !== currentRound?.fisherId)
  );
  let localRole = $derived(currentRound?.roles?.[localPlayerId] ?? null);
  let localPlayerName = $derived(
    roomData?.players?.find((p) => p.id === localPlayerId)?.name ?? ''
  );
  let localScore = $derived(roomData?.scores?.[localPlayerId] ?? 0);
  let targetPlayerName = $derived.by(() => {
    const targetId = currentRound?.currentDiscard?.targetPlayerId;
    if (!targetId) return '';
    return roomData?.players?.find((p) => p.id === targetId)?.name ?? '';
  });

  let loadingNextRound = $state(false);

  async function handleNextRound() {
    if (loadingNextRound) return;
    loadingNextRound = true;
    try { await nextRound(roomCode); } catch {}
    finally { loadingNextRound = false; }
  }

  async function handleExit() {
    const result = await Swal.fire({
      title: '¿Salir de la sala?',
      text: 'Si sales, podrías perder tu progreso',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#132e4a',
      color: '#fff',
      confirmButtonColor: '#e85d5d',
      cancelButtonColor: '#3cc4b9',
      backdrop: 'rgba(0,0,0,0.6)',
      customClass: {
        popup: 'swal-blur-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
      },
    });
    if (result.isConfirmed) doExit();
  }

  async function doExit() {
    try {
      await leaveRoom(roomCode, localPlayerId);
      if (roomData && roomData.players.length <= 3) {
        await deleteDoc(doc(db, 'rooms', roomCode));
      }
    } catch {}
    setCurrentRoom(null);
    window.location.href = '/';
  }

  function toggleScorePanel() {
    showScorePanel = !showScorePanel;
  }
</script>

{#if roomData?.status === 'playing' && currentRound}
  <!-- Top navbar -->
  <div class="game-navbar">
    <button onclick={toggleScorePanel} class="score-btn" title="Ver marcador">
      🏆 {localScore}
    </button>
    <div class="navbar-center">
      <p class="navbar-name">{localPlayerName}</p>
      <p class="navbar-round">Ronda {currentRound.roundNumber}</p>
    </div>
    <button onclick={handleExit} class="game-exit-btn" title="Salir de la sala">✕</button>
  </div>

  <!-- Score panel overlay -->
  {#if showScorePanel}
    <div class="score-overlay" onclick={toggleScorePanel}>
      <div class="score-panel" onclick={(e) => e.stopPropagation()}>
        <h3 class="score-panel-title">🏆 Marcador</h3>
        {#each [...(roomData.players ?? [])].sort((a, b) => (roomData.scores?.[b.id] ?? 0) - (roomData.scores?.[a.id] ?? 0)) as player, i}
          <div class="score-row {player.id === localPlayerId ? 'score-row-me' : ''}">
            <span class="score-pos">{i === 0 ? '👑' : `${i + 1}.`}</span>
            <span class="score-name">{player.name}</span>
            <span class="score-val">{roomData.scores?.[player.id] ?? 0}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="game-wrapper">
    {#if roundStatus === 'fishing'}
      {#if isFisher}
        <FisherView
          {roomCode}
          question={currentRound.question.text}
          players={nonFisherPlayers}
          discardedPlayerIds={currentRound.discardedPlayerIds}
        />
      {:else if currentRound.discardedPlayerIds.includes(localPlayerId)}
        <!-- Discarded player sees eliminated screen -->
        <div class="eliminated-screen">
          <p class="eliminated-emoji">💀</p>
          <p class="eliminated-title">¡Fuiste descartado!</p>
          <p class="eliminated-text">Espera a que termine la ronda</p>
        </div>
      {:else if localRole}
        <PlayerView
          role={localRole}
          question={currentRound.question.answer}
          playerName={localPlayerName}
          score={localScore}
        />
      {/if}
    {:else if roundStatus === 'discarding'}
      <DiscardTimer
        {roomCode}
        currentDiscard={currentRound.currentDiscard}
        {isFisher}
        {targetPlayerName}
        isTargetPlayer={localPlayerId === currentRound.currentDiscard?.targetPlayerId}
      />
    {:else if roundStatus === 'revealing'}
      <RevealScreen
        {roomCode}
        currentDiscard={currentRound.currentDiscard}
        {targetPlayerName}
        {isFisher}
        isTargetPlayer={localPlayerId === currentRound.currentDiscard?.targetPlayerId}
        targetRole={currentRound.roles?.[currentRound.currentDiscard?.targetPlayerId] ?? null}
      />
    {:else if roundStatus === 'ended'}
      <Scoreboard
        scores={roomData.scores}
        players={roomData.players}
        onNextRound={handleNextRound}
      />
    {/if}
  </div>

{:else if roomData?.status === 'finished'}
  <Results scores={roomData.scores} players={roomData.players} />
{/if}

