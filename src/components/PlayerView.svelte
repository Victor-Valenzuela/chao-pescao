<script>
  let { role, question, playerName, score = 0 } = $props();

  let isBlue = $derived(role === 'blue');
  let instruction = $derived(
    isBlue ? 'Di la respuesta correcta' : 'Inventa una respuesta 👀'
  );
</script>

<div class="player-container">
  <!-- Fish image with swimming animation -->
    <div class="fish-swim">
      <img
        src={isBlue ? '/images/pez-azul.png' : '/images/pez-rojo.png'}
        alt={isBlue ? 'Pez Azul' : 'Pez Rojo'}
        class="fish-image"
      />
    </div>
  <!-- Instruction -->
  <div class="instruction-card {isBlue ? 'inst-blue' : 'inst-red'}">
    <p class="instruction-text">{instruction}</p>
  </div>

  <!-- Answer -->
  <div class="answer-card">
    <p class="answer-label">Respuesta correcta</p>
    <p class="answer-text">{question}</p>
  </div>
</div>

