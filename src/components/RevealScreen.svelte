<script>
  import { continueAfterReveal } from '../lib/gameService';
  import { tt } from '../lib/i18n/index';

  let { roomCode, currentDiscard, targetPlayerName, isFisher = false, isTargetPlayer = false, targetRole = null } = $props();

  let result = $derived(currentDiscard?.result ?? null);
  let isRed = $derived(result === 'red');
  let isBlue = $derived(result === 'blue');
  let loading = $state(false);

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

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
        alt={isRed ? 'Red Fish' : 'Blue Fish'}
        class="reveal-fish-img reveal-fish-appear"
      />
    </div>

    {#if isRed}
      <div class="reveal-result reveal-fade-in">
        <p class="reveal-result-title reveal-title-red">{t('reveal.redTitle')}</p>
        {#if isFisher}
          <p class="reveal-result-subtitle">{t('reveal.red.fisher', { name: targetPlayerName })}</p>
          <p class="reveal-points reveal-points-green">{t('reveal.red.fisherPoints')}</p>
        {:else if isTargetPlayer}
          <p class="reveal-result-subtitle">{t('reveal.red.target')}</p>
          <p class="reveal-points reveal-points-red">{t('reveal.red.targetPoints')}</p>
        {:else}
          <p class="reveal-result-subtitle">{t('reveal.red.other', { name: targetPlayerName })}</p>
          <p class="reveal-points reveal-points-red">{t('reveal.red.otherPoints')}</p>
        {/if}
      </div>
    {:else if isBlue}
      <div class="reveal-result reveal-fade-in">
        <p class="reveal-result-title reveal-title-blue">{t('reveal.blueTitle')}</p>
        {#if isFisher}
          <p class="reveal-result-subtitle">{t('reveal.blue.fisher', { name: targetPlayerName })}</p>
          <p class="reveal-points reveal-points-red">{t('reveal.blue.fisherPoints')}</p>
        {:else if isTargetPlayer}
          <p class="reveal-result-subtitle">{t('reveal.blue.target')}</p>
          <p class="reveal-points reveal-points-green">{t('reveal.blue.targetPoints')}</p>
        {:else}
          <p class="reveal-result-subtitle">{t('reveal.blue.other', { name: targetPlayerName })}</p>
          <p class="reveal-points reveal-points-green">{t('reveal.blue.otherPoints')}</p>
        {/if}
      </div>
    {/if}

    {#if isFisher}
      <button onclick={handleContinue} disabled={loading} class="reveal-continue-btn">
        {loading ? '⏳...' : t('reveal.continue')}
      </button>
    {:else}
      <p class="discard-hint">{t('reveal.waiting')}</p>
    {/if}
  {:else}
    <p class="reveal-loading">{t('reveal.loading')}</p>
  {/if}
</div>
