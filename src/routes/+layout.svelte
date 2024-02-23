

<script>
  import './../style/base.css';
  import './../style/vars.css';
  import './../style/doc.css';
  // import './../style/code.css';
  import './../style/style.css';

  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  onMount(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  });

  const navigation = {
    '/': 'Home',
    '/options': 'Options',
    '/rendering': 'Rendering',
    '/searching': 'Search & filtering',
    '/fetch': 'Remote Datasource',
    '/validation': 'Validation',
    '/events': 'Events',
    '/theme': 'Theme',
    '/global-config': 'Config, i18n',
    '/examples': 'Examples',
    '/migration-from-v3': 'Migration from v3'
  }
</script>

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
    </ul>
  </div>
  <div class="w-100">
    <div class="main-container vp-doc">
      <slot />
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
    font-size: 30px;
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
  }
  .main-container {
    width: 800px;
    margin: 2rem auto;
  }
  .nav {
    width: 200px;
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
</style>
