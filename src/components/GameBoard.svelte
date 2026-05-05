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
  import Tutorial from './Tutorial.svelte';
  import { tt, locale, getQuestionText, getQuestionAnswer } from '../lib/i18n/index';
  import { isMuted, toggleMute, soundRoundStart, soundRevealRed, soundRevealBlue, soundVictory, soundPointGain } from '../lib/soundService';

  let { roomCode } = $props();

  let roomData = $state(null);
  let localPlayerId = $state('');
  let roomWasLoaded = $state(false);
  let showScorePanel = $state(false);
  let showTutorial = $state(
    typeof window !== 'undefined' && localStorage.getItem('tutorial_seen') !== 'true'
  );

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  let currentLocale = $state('es');
  $effect(() => {
    const unsub = locale.subscribe((val) => { currentLocale = val || 'es'; });
    return unsub;
  });

  let soundMuted = $state(isMuted());

  function handleToggleMute() {
    soundMuted = toggleMute();
  }

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
  let prevScores = $state({});

  $effect(() => {
    if (roundStatus && roundStatus !== 'ended' && roomData?.scores) {
      prevScores = { ...roomData.scores };
    }
    // Sound effects based on round status
    if (roundStatus === 'fishing' && currentRound?.roundNumber) {
      soundRoundStart();
    }
  });

  let isFisher = $derived(localPlayerId === currentRound?.fisherId);
  let nonFisherPlayers = $derived(
    (roomData?.players ?? []).filter((p) => p.id !== currentRound?.fisherId)
  );
  let localRole = $derived(currentRound?.roles?.[localPlayerId] ?? null);
  let localPlayerName = $derived(
    roomData?.players?.find((p) => p.id === localPlayerId)?.name ?? ''
  );
  let localPlayerAvatar = $derived(
    roomData?.players?.find((p) => p.id === localPlayerId)?.avatar ?? 'magikarp'
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
      title: t('game.exitTitle'),
      text: t('game.exitText'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('game.exitConfirm'),
      cancelButtonText: t('game.exitCancel'),
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
      <img src={`/images/avatares/${localPlayerAvatar}.png`} alt={localPlayerAvatar} class="score-btn-avatar" /> {localScore}
    </button>
    <div class="navbar-center">
      <p class="navbar-name">{localPlayerName}</p>
      <p class="navbar-round">{t('game.round', { n: currentRound.roundNumber })}</p>
    </div>
    <div class="navbar-right">
      <button onclick={handleToggleMute} class="mute-btn" title={soundMuted ? 'Unmute' : 'Mute'}>
        {soundMuted ? '🔇' : '🔊'}
      </button>
      <button onclick={handleExit} class="game-exit-btn">✕</button>
    </div>
  </div>

  <!-- Score panel overlay -->
  {#if showScorePanel}
    <div class="score-overlay" onclick={toggleScorePanel}>
      <div class="score-panel" onclick={(e) => e.stopPropagation()}>
        <h3 class="score-panel-title">{t('game.scoreTitle')}</h3>
        {#each [...(roomData.players ?? [])].sort((a, b) => (roomData.scores?.[b.id] ?? 0) - (roomData.scores?.[a.id] ?? 0)) as player, i}
          <div class="score-row {player.id === localPlayerId ? 'score-row-me' : ''}">
            <img src={`/images/avatares/${player.avatar ?? 'magikarp'}.png`} alt={player.avatar ?? ''} class="player-avatar-img" />
            <span class="score-name">{player.name}</span>
            <span class="score-badge score-badge-{Math.min(i + 1, 4)}">{roomData.scores?.[player.id] ?? 0}</span>
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
          question={getQuestionText(currentRound.question, currentLocale)}
          players={nonFisherPlayers}
          discardedPlayerIds={currentRound.discardedPlayerIds}
          roundPoints={currentRound.fisherRoundPoints ?? 0}
        />
      {:else if currentRound.discardedPlayerIds.includes(localPlayerId)}
        <!-- Discarded player sees eliminated screen -->
        <div class="eliminated-screen">
          <p class="eliminated-emoji">{t('game.eliminated.emoji')}</p>
          <p class="eliminated-title">{t('game.eliminated.title')}</p>
          <p class="eliminated-text">{t('game.eliminated.text')}</p>
        </div>
      {:else if localRole}
        <PlayerView
          role={localRole}
          question={getQuestionAnswer(currentRound.question, currentLocale)}
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
        {prevScores}
        players={roomData.players}
        onNextRound={handleNextRound}
        endReason={currentRound.endReason ?? null}
        {isFisher}
        localPlayerId={localPlayerId}
        roles={currentRound.roles}
        discardedPlayerIds={currentRound.discardedPlayerIds}
      />
    {/if}
  </div>

  {#if showTutorial}
    <Tutorial onClose={() => showTutorial = false} />
  {/if}

{:else if roomData?.status === 'finished'}
  <Results scores={roomData.scores} players={roomData.players} {roomCode} />
{/if}

