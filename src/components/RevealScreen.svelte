<script>
  import { continueAfterReveal } from '../lib/gameService';

  let { roomCode, currentDiscard, targetPlayerName, isFisher = false, isTargetPlayer = false, targetRole = null } = $props();

  let result = $derived(currentDiscard?.result ?? null);
  let isRed = $derived(result === 'red');
  let isBlue = $derived(result === 'blue');
  let loading = $state(false);

  async function handleContinue() {
    if (loading) return;
    loading = true;
    try { await continueAfterReveal(roomCode); }
    catch {}
    finally { loading = false; }
  }
</script>

<div class="reveal-screen">
  {#if result}
    <div class="reveal-fish-container">
      <img
        src={isRed ? '/images/pez-rojo.png' : '/images/pez-azul.png'}
        alt={isRed ? 'Pez Rojo' : 'Pez Azul'}
        class="reveal-fish-img reveal-fish-appear"
      />
    </div>

    {#if isRed}
      <div class="reveal-result reveal-fade-in">
        <p class="reveal-result-title reveal-title-red">¡Pez Rojo!</p>
        {#if isFisher}
          <p class="reveal-result-subtitle">🎯 {targetPlayerName} estaba mintiendo</p>
          <p class="reveal-points reveal-points-green">+1 punto para ti</p>
        {:else if isTargetPlayer}
          <p class="reveal-result-subtitle">😅 ¡Te descubrieron mintiendo!</p>
          <p class="reveal-points reveal-points-red">El pescador gana +1 punto</p>
        {:else}
          <p class="reveal-result-subtitle">🎯 Descubrieron a {targetPlayerName} mintiendo</p>
          <p class="reveal-points reveal-points-red">El pescador gana +1 punto</p>
        {/if}
      </div>
    {:else if isBlue}
      <div class="reveal-result reveal-fade-in">
        <p class="reveal-result-title reveal-title-blue">¡Pez Azul!</p>
        {#if isFisher}
          <p class="reveal-result-subtitle">😱 {targetPlayerName} decía la verdad</p>
          <p class="reveal-points reveal-points-red">Pierdes todos tus puntos</p>
        {:else if isTargetPlayer}
          <p class="reveal-result-subtitle">🎉 ¡Decías la verdad!</p>
          <p class="reveal-points reveal-points-green">El pescador pierde todos sus puntos</p>
        {:else}
          <p class="reveal-result-subtitle">😱 {targetPlayerName} decía la verdad</p>
          <p class="reveal-points reveal-points-green">El pescador pierde todos sus puntos</p>
        {/if}
      </div>
    {/if}

    {#if isFisher}
      <button onclick={handleContinue} disabled={loading} class="reveal-continue-btn">
        {loading ? '⏳...' : '▶ Continuar'}
      </button>
    {:else}
      <p class="discard-hint">Esperando al pescador...</p>
    {/if}
  {:else}
    <p class="reveal-loading">🔍 Revelando...</p>
  {/if}
</div>
