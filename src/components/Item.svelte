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
  {@html highlightSearch(item, isSelected, inputValue, formatter, disableHighlight)}
  {#if isSelected && isMultiple}<ItemClose/>{/if}
</div>
{/if}

<style>
.optgroup-header {
  padding: 3px 3px 3px 6px;
  font-weight: bold;
}
:global(.has-multiSelection .sv-item) {
  background-color: var(--sv-item-selected-bg);
  margin: 2px 4px 2px 0;
}
:global(.has-multiSelection .sv-item-btn)  {
  display: flex;
}
:global(.has-multiSelection .sv-item-content),
:global(.sv-dropdown-content .sv-item) {
  padding: 3px 3px 3px 6px;
}
:global(.sv-item) {
  display: flex;
  min-width: 0px;
  box-sizing: border-box;
  border-radius: 2px;
  cursor: default;
}
:global(.sv-item.is-disabled) { opacity: 0.5; cursor: not-allowed; }

:global(.sv-item-content) {
  color: var(--sv-item-color, var(--sv-color));
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}
:global(.sv-dd-item-active > .sv-item) {
  background-color: var(--sv-item-active-bg);
}
:global(.sv-dd-item-active > .sv-item .sv-item-content) {
  color: var(--sv-item-active-color, var(--sv-item-color));
}
:global(.sv-item-btn) {
  display: none;
  position: relative;
  align-items: center;
  align-self: stretch;
  padding-left: 4px;
  padding-right: 4px;
  box-sizing: border-box;
  border-radius: 2px;
  border-width: 0;
  margin: 0;
  cursor: pointer;
  background-color: var(--sv-item-btn-bg, var(--sv-item-selected-bg));
}
.sv-item-btn > svg {
  fill: var(--sv-item-btn-icon, var(--sv-icon-color));
}
:global(.sv-item-btn:hover) { background-color: var(--sv-item-btn-bg-hover); }
:global(.highlight) {
  background-color: var(--sv-highlight-bg);
  color: var(--sv-highlight-color, var(--sv-color));
}
</style>
