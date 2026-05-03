<script>
  import { tt } from '../lib/i18n/index';

  let { role, question, playerName, score = 0 } = $props();

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  let isBlue = $derived(role === 'blue');
  let instruction = $derived(
    isBlue ? t('player.blueInstruction') : t('player.redInstruction')
  );
</script>

<div class="player-container">
  <div class="fish-swim">
    <img
      src={isBlue ? '/images/pez-azul.png' : '/images/pez-rojo.png'}
      alt={isBlue ? 'Blue Fish' : 'Red Fish'}
      class="fish-image"
    />
  </div>
  <div class="instruction-card {isBlue ? 'inst-blue' : 'inst-red'}">
    <p class="instruction-text">{instruction}</p>
  </div>
  <div class="answer-card">
    <p class="answer-label">{t('player.answerLabel')}</p>
    <p class="answer-text">{question}</p>
  </div>
</div>
