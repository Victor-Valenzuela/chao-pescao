<script>
  import { revealDiscard } from '../lib/gameService';
  import { tt } from '../lib/i18n/index';

  let { roomCode, currentDiscard, isFisher, targetPlayerName, isTargetPlayer = false } = $props();

  let secondsLeft = $state(10);
  let revealed = $state(false);

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  $effect(() => {
    if (!currentDiscard?.startedAt || revealed) return;

    const startMs = currentDiscard.startedAt.seconds
      ? currentDiscard.startedAt.seconds * 1000
      : currentDiscard.startedAt.toDate?.()
        ? currentDiscard.startedAt.toDate().getTime()
        : Date.now();

    function tick() {
      const elapsed = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, 5 - elapsed);
      secondsLeft = Math.ceil(remaining);

      if (remaining <= 0 && !revealed) {
        revealed = true;
        revealDiscard(roomCode).catch(() => {});
      }
    }

    tick();
    const interval = setInterval(tick, 250);
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
