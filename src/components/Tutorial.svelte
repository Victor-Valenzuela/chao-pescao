<script>
  import { tt } from '../lib/i18n/index';

  let { onClose } = $props();

  let currentSlide = $state(0);
  let dontShowAgain = $state(false);

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  function next() {
    if (currentSlide < 1) {
      currentSlide = 1;
    } else {
      finish();
    }
  }

  function prev() {
    if (currentSlide > 0) currentSlide = 0;
  }

  function finish() {
    if (dontShowAgain) {
      localStorage.setItem('tutorial_seen', 'true');
    }
    onClose();
  }
</script>

<div class="tutorial-overlay">
  <div class="tutorial-card">
    {#if currentSlide === 0}
      <h2 class="tutorial-title">{t('tutorial.slide1.title')}</h2>
      <div class="tutorial-body">
        <div class="tutorial-item">
          <span class="tutorial-icon">🔍</span>
          <p>{@html t('tutorial.slide1.item1')}</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🐟</span>
          <p>{@html t('tutorial.slide1.item2')}</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🎯</span>
          <p>{@html t('tutorial.slide1.item3')}</p>
        </div>
      </div>
    {:else}
      <h2 class="tutorial-title">{t('tutorial.slide2.title')}</h2>
      <div class="tutorial-body">
        <div class="tutorial-item">
          <span class="tutorial-icon">✅</span>
          <p>{@html t('tutorial.slide2.item1')}</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">💀</span>
          <p>{@html t('tutorial.slide2.item2')}</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🤫</span>
          <p>{@html t('tutorial.slide2.item3')}</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🏆</span>
          <p>{@html t('tutorial.slide2.item4')}</p>
        </div>
      </div>
    {/if}

    <div class="tutorial-dots">
      <span class="tutorial-dot {currentSlide === 0 ? 'tutorial-dot-active' : ''}"></span>
      <span class="tutorial-dot {currentSlide === 1 ? 'tutorial-dot-active' : ''}"></span>
    </div>

    <div class="tutorial-nav">
      {#if currentSlide > 0}
        <button onclick={prev} class="tutorial-btn tutorial-btn-back">{t('tutorial.back')}</button>
      {:else}
        <div></div>
      {/if}
      <button onclick={next} class="tutorial-btn tutorial-btn-next">
        {currentSlide === 1 ? t('tutorial.play') : t('tutorial.next')}
      </button>
    </div>

    <label class="tutorial-checkbox-label">
      <input type="checkbox" bind:checked={dontShowAgain} class="tutorial-checkbox" />
      <span>{t('tutorial.dontShow')}</span>
    </label>
  </div>
</div>
