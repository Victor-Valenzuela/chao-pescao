<script>
  import { subscribeToRoom, room } from '../stores/roomStore';
  import { playerStore, setCurrentRoom } from '../stores/playerStore';
  import { startGame, startRound } from '../lib/gameService';
  import { leaveRoom } from '../lib/roomService';
  import { tt } from '../lib/i18n/index';
  import QRCode from 'qrcode';

  let { roomCode } = $props();

  let roomData = $state(null);
  let localPlayerId = $state('');
  let loading = $state(false);
  let error = $state('');
  let qrDataUrl = $state('');

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  $effect(() => {
    const unsubRoom = room.subscribe((value) => { roomData = value; });
    return unsubRoom;
  });

  $effect(() => {
    const unsubPlayer = playerStore.subscribe((value) => { localPlayerId = value.playerId; });
    return unsubPlayer;
  });

  $effect(() => {
    const unsubscribe = subscribeToRoom(roomCode);
    return unsubscribe;
  });

  $effect(() => {
    const url = `${window.location.origin}/?join=${roomCode}`;
    QRCode.toDataURL(url, {
      width: 160,
      margin: 1,
      color: { dark: '#0a1a2e', light: '#ffffff' },
    }).then((dataUrl) => { qrDataUrl = dataUrl; }).catch(() => {});
  });

  let isHost = $derived(roomData?.hostId === localPlayerId);
  let playerCount = $derived(roomData?.players?.length ?? 0);
  let canStart = $derived(playerCount >= 3);
  let isWaiting = $derived(roomData?.status === 'waiting');

  async function handleStart() {
    if (!canStart || loading) return;
    loading = true;
    error = '';
    try {
      await startGame(roomCode);
      await startRound(roomCode);
    } catch (err) {
      error = err?.message ?? 'Error';
      loading = false;
    }
  }

  async function handleLeave() {
    try { await leaveRoom(roomCode, localPlayerId); } catch {}
    setCurrentRoom(null);
    window.location.href = '/';
  }
</script>

{#if isWaiting}
  <div class="lobby-container">
    <div class="lobby-card code-card">
      <p class="code-label">{t('lobby.codeLabel')}</p>
      <p class="code-value">{roomCode}</p>

      {#if qrDataUrl}
        <div class="qr-wrapper">
          <img src={qrDataUrl} alt="QR" class="qr-img" />
        </div>
      {/if}

      <p class="code-hint">{t('lobby.codeHint')}</p>
    </div>

    <div class="lobby-card">
      <h2 class="players-title">{t('lobby.playersTitle', { count: playerCount })}</h2>

      {#if roomData?.players?.length}
        <ul class="player-list">
          {#each roomData.players as player, i}
            <li class="player-item {player.id === localPlayerId ? 'player-item-me' : ''}">
              <img src={`/images/avatares/${player.avatar ?? 'magikarp'}.png`} alt={player.avatar ?? ''} class="player-avatar-img" style="animation-delay: {i * 0.4}s;" />
              <span class="player-name">{player.name}</span>
              {#if player.id === localPlayerId}
                <span class="me-badge">{t('lobby.you')}</span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="waiting-text">{t('lobby.waiting')}</p>
      {/if}
    </div>

    {#if isHost}
      {#if error}
        <p class="error-text">⚠️ {error}</p>
      {/if}

      {#if !canStart}
        <p class="min-players-text">{t('lobby.minPlayers', { count: playerCount })}</p>
      {/if}

      <button onclick={handleStart} disabled={!canStart || loading} class="start-btn">
        {loading ? t('lobby.startLoading') : t('lobby.startBtn')}
      </button>
    {/if}

    <button onclick={handleLeave} class="leave-btn">
      {t('lobby.leaveBtn')}
    </button>
  </div>
{/if}
