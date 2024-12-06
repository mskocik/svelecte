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

Component is (hopefully) fully themable.

When changing `--sv-min-height`, you may also need to tweak one or multiple of these properties:
`--sv-selection-wrap-padding`, `--sv-selection-multi-wrap-padding`, `--sv-item-wrap-padding`.

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
  --sv-selection-wrap-padding: 3px 3px 3px 4px;
  --sv-selection-multi-wrap-padding: 3px 3px 3px 6px;
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
