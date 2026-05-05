<script>
  import { revealDiscard } from '../lib/gameService';
  import { tt } from '../lib/i18n/index';
  import { soundTick } from '../lib/soundService';

  let { roomCode, currentDiscard, isFisher, targetPlayerName, isTargetPlayer = false } = $props();

  let secondsLeft = $state(5);
  let revealed = $state(false);

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  let tickStarted = false;

  // Simple local countdown: starts at 5, ticks every second
  $effect(() => {
    if (tickStarted) return;
    tickStarted = true;

    soundTick(); // Play once — audio covers the full countdown

    const interval = setInterval(() => {
      secondsLeft--;

      if (secondsLeft <= 0) {
        clearInterval(interval);
        revealed = true;
        revealDiscard(roomCode).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="discard-screen {isFisher ? 'discard-screen-fisher' : 'discard-screen-player'}">
  {#if isFisher}
    <p class="discard-waiting-title">{t('discard.fishingTitle')}</p>
    <p class="discard-target-name">{targetPlayerName}</p>

    <div class="fishing-scene">
      <img src="/images/pez-azul.png" alt="Fish" class="fish-silhouette fish-swim-in" />
    </div>

    <div class="discard-timer-circle">
      <span class="discard-timer-num">{secondsLeft}</span>
    </div>
    <p class="discard-hint">{t('discard.discovering')}</p>

  {:else}
    <p class="discard-caught-title">{t('discard.caughtTitle')}</p>
    <p class="discard-hint">{t('discard.waitingReveal')}</p>

    <div class="discard-timer-circle">
      <span class="discard-timer-num">{secondsLeft}</span>
    </div>
  {/if}
</div>
