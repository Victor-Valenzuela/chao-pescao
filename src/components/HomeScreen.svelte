<script>
  import { onMount } from 'svelte';
  import CreateRoom from './CreateRoom.svelte';
  import JoinRoom from './JoinRoom.svelte';
  import LanguageSelector from './LanguageSelector.svelte';
  import { locale, localeReady, tt, LOCALES } from '../lib/i18n/index';

  let activeView = $state('menu'); // 'menu' | 'create' | 'join'
  let prefillCode = $state('');
  let showLangSelector = $state(false);
  let isReady = $state(false);
  let currentFlag = $state('');

  $effect(() => {
    const unsub = localeReady.subscribe((ready) => { isReady = ready; });
    return unsub;
  });

  $effect(() => {
    const unsub = locale.subscribe((loc) => {
      const found = LOCALES.find((l) => l.code === loc);
      currentFlag = found?.flag ?? '/images/es.png';
    });
    return unsub;
  });

  let t = $state((key, params) => key);
  $effect(() => {
    const unsub = tt.subscribe((fn) => { t = fn; });
    return unsub;
  });

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      prefillCode = joinCode.toUpperCase();
      activeView = 'join';
    }
  });

  function showCreate() { activeView = 'create'; }
  function showJoin() { activeView = 'join'; }
  function goBack() { activeView = 'menu'; prefillCode = ''; }
  function openLangSelector() { showLangSelector = true; }
  function closeLangSelector() { showLangSelector = false; }
</script>

{#if !isReady}
  <LanguageSelector />
{/if}

{#if showLangSelector}
  <LanguageSelector onSelect={() => showLangSelector = false} />
{/if}

{#if isReady}
<div class="relative h-screen w-full flex flex-col items-center overflow-hidden">
  <!-- Background image -->
  <div
    class="absolute inset-0 bg-cover bg-center bg-no-repeat"
    style="background-image: url('/images/fondomain.png'); background-color: #0a5e8a;"
  ></div>
  <div class="absolute inset-0 bg-black/20"></div>

  <!-- Language change button -->
  <button onclick={openLangSelector} class="lang-change-btn" title="Change language">
    <img src={currentFlag} alt="Language" class="lang-change-img" />
  </button>

  <!-- Content -->
  <div class="relative z-10 w-full max-w-sm px-4 flex flex-col items-center min-h-screen">

    {#if activeView === 'menu'}
      <div class="text-center animate-fade-in" style="margin-top: 25vh;">
        <img
          src="/images/logo.png"
          alt="Chao Pescao"
          class="mx-auto logo-float"
          style="width: 90vw; max-width: 400px;"
        />
      </div>

      <div style="flex: 1;"></div>

      <div class="w-full flex flex-col items-center gap-5 animate-slide-up" style="margin-bottom: 13rem;">
        <p class="font-title text-2xl text-white tracking-wider"
           style="text-shadow: 2px 2px 0 rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3);">
          {t('home.tagline')}
        </p>

        <button onclick={showCreate} class="neo-btn neo-btn-cyan">
          <span class="neo-btn-text">{t('home.createRoom')}</span>
        </button>

        <button onclick={showJoin} class="neo-btn neo-btn-red">
          <span class="neo-btn-text">{t('home.joinRoom')}</span>
        </button>
      </div>
    {/if}

    {#if activeView === 'create'}
      <div class="w-full animate-slide-up" style="margin-top: 23vh;">
        <button onclick={goBack} class="neo-back-btn mb-4">{t('home.back')}</button>
        <CreateRoom />
      </div>
    {/if}

    {#if activeView === 'join'}
      <div class="w-full animate-slide-up" style="margin-top: 12vh;">
        <button onclick={goBack} class="neo-back-btn mb-4">{t('home.back')}</button>
        <JoinRoom initialCode={prefillCode} />
      </div>
    {/if}
  </div>
</div>
{/if}
