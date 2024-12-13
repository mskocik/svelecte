

<script>
  import './../style/base.css';
  import './../style/vars.css';
  import './../style/doc.css';
  import './../style/style.css';

  import { onDestroy, onMount, setContext } from 'svelte';
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';

  /** @type {{children?: import('svelte').Snippet}} */
  let { children } = $props();

  let mode = '';
  let is_mounted = false;
  let isWide = $state(false);
  let navToggle = $state(false);
  let navbarShow = $derived(isWide || navToggle);

  function outsideNavClick(e) {
    !isWide && navToggle && (
      e.target.closest('aside') === null
      || e.target.closest('a') !== null
     ) && onNavToggle();
  }

  function onNavToggle() {
    navToggle = !navToggle;
    // document[navToggle ? 'addEventListener' : 'removeEventListener']('click', outsideNavClick)
  }

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

  setContext('navigation', navigation);

  let page_nav = $state([]);

  function buildPageNav() {
    const list = document.querySelectorAll('.main-container h2 > a, .main-container h1:not(:first-of-type) > a, .main-container h3 > a');
    let newNav = [];
    list.forEach(link => {
      newNav.push({
        // @ts-ignore
        anchor: link.href,
        text: link.textContent,
        important: link.parentElement.tagName === 'H1',
        h3: link.parentElement.tagName === 'H3',
      });
    });
    page_nav = newNav
  }

  afterNavigate(nav => nav.complete.then(buildPageNav));

  function toggleTheme() {
    if (!is_mounted) return;
    const newmode = mode === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newmode);
    localStorage.setItem('theme', newmode);
    mode = newmode;
  }

  onMount(() => {
    is_mounted = true;
    mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';

    const navMenuMedia = matchMedia("(min-width: 1024px)");
    isWide = navMenuMedia.matches;
    navMenuMedia.addEventListener("change", (query) => {
      navToggle = false;
      isWide = query.matches;
      document[isWide ? 'removeEventListener' : 'addEventListener']('click', outsideNavClick);
    });
    !isWide && document.addEventListener('click', outsideNavClick);
    buildPageNav();
  });

  onDestroy(() => {
    !isWide && typeof document !== 'undefined' && document.removeEventListener('click', outsideNavClick);
  });


</script>

<div class="header flex shadow-lg relative z-10">
  <div class="page-wrap">
    {#if !isWide}
    <div class="flex items-center flex-1">
      <div class="lg:hidden">
        <button
          class="flex items-center"
          onclick={e => {
            e.stopPropagation();
            onNavToggle();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span class="leading-4 hidden sm:block">Menu</span>
        </button>
      </div>
    </div>
    {/if}
    <a href="/" class="home-link">
      Svelecte
    </a>
    <div class="header-buttons">
      <a class="inline-flex" href="https://github.com/mskocik/svelecte" target="_blank" rel="noreferrer" aria-label="GitHub repository">
        <svg width="36px" height="36px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 32 32" data-v-8ff9b2e6=""><path fill="currentColor" fill-rule="evenodd" d="M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.71 3.71 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2Z"/></svg>
      </a>
      <button class="inline-flex text-xl p-2 theme-toggle" onclick="{toggleTheme}" aria-label="Switch theme">
        <svg width="36px" height="36px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="dark-toggle"><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"/></svg>
        <svg width="36px" height="36px" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="light-toggle"><path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"/><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"/><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"/><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"/></svg>
      </button>
      <!-- <ThemeToggle /> -->
    </div>
  </div>
</div>

<div class="app-wrap">
  <div class="page-container">
    <div class="page-wrap">
      <aside class="sidebar" class:opened={navbarShow}>
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

            </div>
          </div>

        </ul>
      </aside>
      <div class="w-100" style="display: flex;flex-wrap: none;">
        <div class="main-container vp-doc">
          {@render children?.()}
        </div>
        <div class="page-nav">
          {#if page_nav.length}
            On this page
            <ul class="nav">
              {#each page_nav as link}
              <li class="link-item"
                class:link-off={link.important}
                class:link-on={link.h3}
              ><a href="{link.anchor}" class="link">{link.text}</a></li>
              {/each}

            </ul>
          {/if}
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
  .w-100 {
    width: 100%;
  }
  .header > .page-wrap {
    padding: 12px 8px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--vp-c-divider);
    margin-bottom: 8px;
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
    max-width: 800px;
    width: 100%;
    margin: 1rem auto 2rem;
    padding: 0 8px;
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
  .home-link {
    font-size: 24px;
    font-weight: 500;
  }
  .theme-toggle > svg {
    width: 20px;
    height: 20px;
  }
  aside {
    width: 240px;
    max-width: 100%;
    padding: 16px 8px;
    background-color: var(--vp-c-bg);
    transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  }
  aside.opened {
    transform: translateX(0);
  }
  .header-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .page-nav {
    padding: 16px 0 0 16px;
    width: 200px;
    border-left: 1px solid var(--vp-c-divider);
  }
  .link-off {
    margin-left: -8px;
    text-decoration: underline;
  }
  .link-on {
    padding: 2px 20px
  }
  @media screen and (max-width: 1023px) {
    aside {
      z-index: 15;
      top: 0;
      bottom: 0;
      position: fixed;
      transform: translateX(-100%);
      overflow-y: auto;
      padding: 32px 20px;
    }
    aside.opened {
      box-shadow: 0 20px 20px #ccc;
    }
    .page-nav {
      display: none;
    }

    .header > .page-wrap {
      padding: 0 6px;
    }
    .header {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: var(--vp-c-bg);
    }
  }
</style>
