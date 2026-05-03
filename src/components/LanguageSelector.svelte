<script>
  import { locale, LOCALES } from '../lib/i18n/index';

  let { onSelect = null } = $props();

  function selectLanguage(code) {
    locale.set(code);
    if (onSelect) onSelect();
  }
</script>

<div class="lang-overlay">
  <div class="lang-card">
    <h2 class="lang-title">🌍</h2>
    <div class="lang-options">
      {#each LOCALES as loc}
        <button
          class="lang-btn"
          onclick={() => selectLanguage(loc.code)}
        >
          <img src={loc.flag} alt={loc.name} class="lang-flag-img" />
          <span class="lang-name">{loc.name}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
