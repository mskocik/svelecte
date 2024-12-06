

<script>
  import './../style/base.css';
  import './../style/vars.css';
  import './../style/doc.css';
  import './../style/style.css';

  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  /** @type {{children?: import('svelte').Snippet}} */
  let { children } = $props();

  let mode = '';
  let is_mounted = false;

  function toggleTheme() {
    if (!is_mounted) return;
    const newmode = mode === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newmode);
    mode = newmode;
  }

  onMount(() => {
    is_mounted = true;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('started');
      mode = 'dark';
      return;
    }
    mode = 'light';
  });

  const navigation = {
    '/': 'Home',
    '/properties': 'Properties',
    '/options': 'Options',
    '/rendering': 'Rendering',
    '/searching': 'Search & filtering',
    '/fetch': 'Remote Datasource',
    // '/events': 'Events',
    '/theme': 'Theme',
    '/global-config': 'Config, i18n',
    '/validation': 'Form Validation',
    '/examples': 'Examples',
    '/migration-guide': 'Migration guide'
  }
</script>

<div class="app-wrap">
  <div class="page-container">
    <div class="page-wrap">
      <div class="sidebar">
        <div class="docs-brand text-center mb-0 page-wrap pt-2" style="justify-content: center;align-items:center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          <a href="https://github.com/mskocik/svelecte" class="header-link" data-tooltip="Svelecte GitHub repository" target="_blank">
            <b>S</b><span class="velecte">velecte</span>
          </a>
        </div>
        <ul class="nav">
          {#each Object.entries(navigation) as entry (entry[0])}
            <li class="link-item">
              <a href={entry[0]} class="VPLink link" class:is-active={$page.route.id === entry[0]}>
                <p class="text">
                  {entry[1]}
                </p>
              </a>
              </li>
          {/each}
          <div class="vp-doc">
            <hr>
            <div class="nav-footer" style="align-items: flex-start">
              <span>
                <a href="https://github.com/mskocik/svelecte"><img src="https://img.shields.io/npm/v/svelecte.svg?style=flat" alt="svelecte version" class="middle-img"></a>
              </span>
              <button class="inline-flex text-xl p-2 theme-toggle" onclick="{toggleTheme}" aria-label="Switch theme">
                <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="dark-toggle"><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"/></svg>
                <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="light-toggle"><path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"/><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"/><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"/><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"/></svg>
              </button>
            </div>
          </div>

        </ul>
      </div>
      <div class="w-100">
        <div class="main-container vp-doc">
          {@render children()}
        </div>
      </div>
    </div>
    <div class="page-wrap vp-doc">
      <hr>
      Made with <a href="https://svelte.dev" target="_blank">Svelte</a> ❤ by <a href="https://github.com/mskocik" target="_blank">Martin Skocik</a>.<br>
      &diams;<br>
      You can support me through <a href="https://github.com/sponsors/mskocik" target="_blank">GitHub</a>.
    </div>
  </div>
</div>

<style>
  .docs-brand {
    padding: 32px 0 ;
    color: var(--vp-c-brand-1);
    & b {
      font-weight: 700;
    }
    & svg {
      fill: var(--vp-c-text-1);
    }
  }
  .header-link {
    font-size: 26px;
    padding: 0 12px;
    &:hover {
      text-decoration: underline;
    }
  }
  .w-100 {
    width: 100%;
  }
  .page-wrap {
    display: flex;
    max-width: 1280px;
    margin: 0 auto;
    width: 100%;
  }
  .page-wrap.vp-doc {
    display: block;
    text-align: center;
    padding: 32px 0 24px;
  }
  .main-container {
    width: 800px;
    margin: 2rem auto;
  }
  .nav {
    width: 200px;
    position: sticky;
    top: 32px;
  }
  .link-item {
    padding: 4px 10px;
  }
  .link {
    font-weight: 500;
    color: var(--vp-c-text-2);
    white-space: nowrap;
  }
  .link.is-active,
  .link:hover {
    color: var(--vp-c-brand-1);
  }

  .theme-toggle > svg {
    width: 20px;
    height: 20px;
  }
</style>
