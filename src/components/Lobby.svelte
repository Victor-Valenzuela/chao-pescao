<script>
  import { subscribeToRoom, room } from '../stores/roomStore';
  import { playerStore, setCurrentRoom } from '../stores/playerStore';
  import { startGame, startRound } from '../lib/gameService';
  import { leaveRoom } from '../lib/roomService';
  import QRCode from 'qrcode';

  let { roomCode } = $props();

  let roomData = $state(null);
  let localPlayerId = $state('');
  let loading = $state(false);
  let error = $state('');
  let qrDataUrl = $state('');

  // Subscribe to room store
  $effect(() => {
    const unsubRoom = room.subscribe((value) => { roomData = value; });
    return unsubRoom;
  });

  // Subscribe to player store
  $effect(() => {
    const unsubPlayer = playerStore.subscribe((value) => { localPlayerId = value.playerId; });
    return unsubPlayer;
  });

  // Subscribe to Firestore room on mount
  $effect(() => {
    const unsubscribe = subscribeToRoom(roomCode);
    return unsubscribe;
  });

  // Generate QR code
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
      error = err?.message ?? 'Error al iniciar la partida.';
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
    <!-- Room code + QR -->
    <div class="lobby-card code-card">
      <p class="code-label">Código de sala</p>
      <p class="code-value">{roomCode}</p>

      {#if qrDataUrl}
        <div class="qr-wrapper">
          <img src={qrDataUrl} alt="QR para unirse a la sala" class="qr-img" />
        </div>
      {/if}

      <p class="code-hint">Comparte el código o escanea el QR</p>
    </div>

    <!-- Player list -->
    <div class="lobby-card">
      <h2 class="players-title">🎮 Jugadores ({playerCount})</h2>

      {#if roomData?.players?.length}
        <ul class="player-list">
          {#each roomData.players as player, i}
            <li class="player-item {player.id === localPlayerId ? 'player-item-me' : ''}">
              <img src={`/images/avatares/${player.avatar ?? 'magikarp'}.png`} alt={player.avatar ?? ''} class="player-avatar-img" style="animation-delay: {i * 0.4}s;" />
              <span class="player-name">{player.name}</span>
              {#if player.id === localPlayerId}
                <span class="me-badge">Tú</span>
              {/if}
            </li>
          {/each}
        </ul>
      {:else}
        <p class="waiting-text">Esperando jugadores...</p>
      {/if}
    </div>

    <!-- Host controls -->
    {#if isHost}
      {#if error}
        <p class="error-text">⚠️ {error}</p>
      {/if}

      {#if !canStart}
        <p class="min-players-text">
          Se necesitan al menos 3 jugadores ({playerCount}/3)
        </p>
      {/if}

      <button
        onclick={handleStart}
        disabled={!canStart || loading}
        class="start-btn"
      >
        {loading ? '⏳ Iniciando...' : '🚀 Iniciar Partida'}
      </button>
    {/if}

    <button onclick={handleLeave} class="leave-btn">
      🚪 Salir de la sala
    </button>
  </div>
{/if}

