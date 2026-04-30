<script>
  let { onClose } = $props();

  let currentSlide = $state(0);
  let dontShowAgain = $state(false);

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
      <!-- Slide 1: Dinámica -->
      <h2 class="tutorial-title">🎣 ¿Cómo se juega?</h2>
      <div class="tutorial-body">
        <div class="tutorial-item">
          <span class="tutorial-icon">🔍</span>
          <p>Cada ronda, un jugador es el <span class="tutorial-highlight-cyan">pescador</span> y los demás son <span class="tutorial-highlight-orange">peces</span></p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🐟</span>
          <p>Un pez es <span class="tutorial-highlight-blue">azul</span> y debe decir la <span class="tutorial-highlight-blue">verdad</span>. Los demás son <span class="tutorial-highlight-red">rojos</span> y deben <span class="tutorial-highlight-red">mentir</span></p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🎯</span>
          <p>El pescador ve una pregunta <span class="tutorial-highlight-orange">sin la respuesta</span> y debe descubrir quién miente</p>
        </div>
      </div>
    {:else}
      <!-- Slide 2: Puntos -->
      <h2 class="tutorial-title">⭐ Puntuación</h2>
      <div class="tutorial-body">
        <div class="tutorial-item">
          <span class="tutorial-icon">✅</span>
          <p>Descartar un <span class="tutorial-highlight-red">pez rojo</span>: pescador gana <span class="tutorial-highlight-cyan">+1 punto</span></p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">💀</span>
          <p>Descartar al <span class="tutorial-highlight-blue">pez azul</span>: pescador <span class="tutorial-highlight-red">pierde todos</span> los puntos de la ronda</p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🤫</span>
          <p><span class="tutorial-highlight-red">Peces rojos</span> no descubiertos y <span class="tutorial-highlight-blue">pez azul</span> descartado por error ganan <span class="tutorial-highlight-cyan">+1 punto</span></p>
        </div>
        <div class="tutorial-item">
          <span class="tutorial-icon">🏆</span>
          <p>El primero en llegar a <span class="tutorial-highlight-orange">15 puntos</span> gana la partida</p>
        </div>
      </div>
    {/if}

    <!-- Dots -->
    <div class="tutorial-dots">
      <span class="tutorial-dot {currentSlide === 0 ? 'tutorial-dot-active' : ''}"></span>
      <span class="tutorial-dot {currentSlide === 1 ? 'tutorial-dot-active' : ''}"></span>
    </div>

    <!-- Navigation -->
    <div class="tutorial-nav">
      {#if currentSlide > 0}
        <button onclick={prev} class="tutorial-btn tutorial-btn-back">← Atrás</button>
      {:else}
        <div></div>
      {/if}
      <button onclick={next} class="tutorial-btn tutorial-btn-next">
        {currentSlide === 1 ? '🎮 ¡A jugar!' : 'Siguiente →'}
      </button>
    </div>

    <!-- Don't show again -->
    <label class="tutorial-checkbox-label">
      <input type="checkbox" bind:checked={dontShowAgain} class="tutorial-checkbox" />
      <span>No volver a mostrar</span>
    </label>
  </div>
</div>
