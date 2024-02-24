<script>
  import Svelecte from '$lib/Svelecte.svelte';
  import { onMount } from 'svelte';
  import { dataset } from '../data';

  let options = dataset.colors();
  options[4].$disabled = true;
  options[4].text += ' (disabled)';
  let selection = 'red';

  let mode = '';
  let is_mounted = false;

  onMount(() => {
    // @ts-ignore
    document.querySelector('button[data-action=toggle]').click();
    // @ts-ignore
    document.querySelector('.sv_dropdown').style.cssText = 'opacity: 1; z-index: 2; pointer-events: auto; position: relative';
    is_mounted = true;
  });
</script>

# Theme

Component is (hopefully) fully themable. This is the only page on the website where you can toggle light/dark mode.

<div>
  <label for="theme-light">
    <input type="radio" bind:group={mode} id="theme-light" value="light">
    Light theme
  </label>
  <label for="theme-dark">
    <input type="radio" bind:group={mode} id="theme-dark" value="dark">
    Dark theme
  </label>
</div>

<button class="inline-flex text-xl p-2 theme-toggle" on:click="{toggleTheme}" aria-label="Switch theme">
  <svg preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" class="dark-toggle"><path fill="currentColor" d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93a9.93 9.93 0 0 0 7.07-2.929a10.007 10.007 0 0 0 2.583-4.491a1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343a7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483a10.027 10.027 0 0 0 2.89 7.848a9.972 9.972 0 0 0 7.848 2.891a8.036 8.036 0 0 1-1.484 2.059z"/></svg>
  <svg width="1.2em" height="1.2em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 512 512" class="light-toggle"><path d="M256 387c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4v-46.2c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M256 48c-8.5 0-15.4 6.9-15.4 15.4v46.2c0 8.5 6.9 15.4 15.4 15.4s15.4-6.9 15.4-15.4V63.4c0-8.5-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M125 256c0-8.5-6.9-15.4-15.4-15.4H63.4c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4z" fill="currentColor"/><path d="M448.6 240.6h-46.2c-8.5 0-15.4 6.9-15.4 15.4s6.9 15.4 15.4 15.4h46.2c8.5 0 15.4-6.9 15.4-15.4s-6.9-15.4-15.4-15.4z" fill="currentColor"/><path d="M152.5 344.1c-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5l32.7-32.7c6-6 6-15.8 0-21.8-2.9-2.9-6.8-4.5-10.9-4.5z" fill="currentColor"/><path d="M359.5 167.9c4.1 0 8-1.6 10.9-4.5l32.7-32.7c2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5l-32.7 32.7c-2.9 2.9-4.5 6.8-4.5 10.9s1.6 8 4.5 10.9c2.9 2.9 6.8 4.5 10.9 4.5z" fill="currentColor"/><path d="M130.7 108.9c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-2.9 2.9-4.5 6.8-4.5 10.9 0 4.1 1.6 8 4.5 10.9l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M370.4 348.6c-2.9-2.9-6.8-4.5-10.9-4.5-4.1 0-8 1.6-10.9 4.5-6 6-6 15.8 0 21.8l32.7 32.7c2.9 2.9 6.8 4.5 10.9 4.5 4.1 0 8-1.6 10.9-4.5 2.9-2.9 4.5-6.8 4.5-10.9s-1.6-8-4.5-10.9l-32.7-32.7z" fill="currentColor"/><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96z" fill="currentColor"/></svg>
</button>

---

<Svelecte {options} bind:value={selection} lazyDropdown={false} multiple clearable/>

<div class="catpuccin-latte">

```css
/** Library defaults (switch to dark mode to see dark theme on this page) */
:root {
  --sv-min-height: 40px;
  --sv-bg: #fff;
  --sv-disabled-bg: #eee;
  --sv-border: 1px solid #ccc;
  --sv-border-radius: 4px;
  --sv-general-padding: 4px;
  --sv-control-bg: var(--sv-bg);
  --sv-item-wrap-padding: 3px 3px 3px 6px;
  --sv-item-selected-bg: #efefef;
  --sv-item-btn-color: #000;
  --sv-item-btn-color-hover: #777;  /* same as icon-color-hover in default theme */
  --sv-item-btn-bg: #efefef;
  --sv-item-btn-bg-hover: #ddd;
  --sv-icon-color: #bbb;
  --sv-icon-color-hover: #777;
  --sv-icon-bg: transparent;
  --sv-icon-size: 20px;
  --sv-separator-bg: #ccc;
  --sv-btn-border: 0;
  --sv-placeholder-color: #ccccd6;
  --sv-dropdown-bg: var(--sv-bg);
  --sv-dropdown-offset: 1px;
  --sv-dropdown-border: 1px solid rgba(0,0,0,0.15);
  --sv-dropdown-width: auto;
  --sv-dropdown-shadow: 0 6px 12px #0000002d;
  --sv-dropdown-height: 320px;
  --sv-dropdown-active-bg: #F2F5F8;
  --sv-dropdown-selected-bg: #ECF3F9;
  --sv-create-kbd-border: 1px solid #efefef;
  --sv-create-kbd-bg: #fff;
  --sv-create-disabled-bg: #fcbaba;
  --sv-loader-border: 2px solid #ccc;
}
```
</div>

<div class="monokai">

```css
/** Dark mode on this page (switch to light mode to see library defaults) */
.dark {
  --sv-min-height: 40px;
  --sv-bg: #32363f;
  --sv-disabled-bg: #eee;
  --sv-border: 1px solid #626262;
  --sv-border-radius: 4px;
  --sv-general-padding: 4px;
  --sv-control-bg: var(--sv-bg);
  --sv-item-wrap-padding: 3px 3px 3px 6px;
  --sv-item-selected-bg: #626262;
  --sv-item-btn-color: #ccc;
  --sv-item-btn-color-hover: #ccc;
  --sv-item-btn-bg: #626262;
  --sv-item-btn-bg-hover: #bc6063;
  --sv-icon-color: #bbb;
  --sv-icon-color-hover: #ccc;
  --sv-icon-bg: transparent;
  --sv-icon-size: 20px;
  --sv-separator-bg: #626262;
  --sv-btn-border: 0;
  --sv-placeholder-color: #ccccd6;
  --sv-dropdown-bg: var(--sv-bg);
  --sv-dropdown-border: var(--sv-border);
  --sv-dropdown-offset: 1px;
  --sv-dropdown-width: auto;
  --sv-dropdown-shadow: 0 1px 3px #555;
  --sv-dropdown-height: 320px;
  --sv-dropdown-active-bg: #553d3d;
  --sv-dropdown-selected-bg: #754545;
  --sv-create-kbd-border: 1px solid #626262;
  --sv-create-kbd-bg: #626262;
  --sv-create-disabled-bg: #fcbaba;
  --sv-loader-border: 2px solid #626262;
}
```
</div>


<style>
  :global(.dark .catpuccin-latte) {
    display: none;
  }
</style>
