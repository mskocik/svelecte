<script>
  import ItemClose from './ItemClose.svelte';
  import itemActions from './../actions.js';
  import { highlightSearch } from './../lib/utils.js';

  export let inputValue;  // value only

  export let index = -1;
  export let item = {};
  export let isSelected = false;
  export let isDisabled = false;
  export let isMultiple = false;

  export let formatter = null;
  export let disableHighlight = false;
</script>

{#if item.$isGroupHeader}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="optgroup-header" on:mousedown|preventDefault><b>{item.label}</b></div>
{:else}
<div class="sv-item"
  title={item.$created ? 'Created item' : ''}
  class:is-disabled={isDisabled}
  use:itemActions={{item, index}}
  on:select
  on:deselect
  on:hover
>
  {@html (isSelected 
    ? `<div class="sv-item-content">${formatter(item, isSelected, inputValue)}</div>`
    : highlightSearch(item, isSelected, inputValue, formatter, disableHighlight))
  }
  {#if isSelected && isMultiple}<ItemClose/>{/if}
</div>
{/if}

<style>
.optgroup-header {
  padding: 3px 3px 3px 6px;
  font-weight: bold;
}
</style>
