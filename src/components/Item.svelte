<script>
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
{#if isSelected && isMultiple}
  <button class="sv-item-btn" tabindex="-1" data-action="deselect">
    <svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
  </button>
{/if}
</div>
{/if}

<style>
.optgroup-header {
  padding: 3px 3px 3px 6px;
  font-weight: bold;
}
:global(.has-multiSelection .sv-item) {
  background-color: #efefef;
  margin: 2px 4px 2px 0;
}
:global(.has-multiSelection .sv-item-btn)  {
  display: flex;
}
:global(.has-multiSelection .sv-item-content),
:global(.sv-dropdown-content .sv-item) {
  padding: 3px 3px 3px 6px;
}
:global(.sv-dd-item-active > .sv-item) {
  background-color: #F2F5F8;
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
  color: rgb(51, 51, 51);
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
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

}
:global(.sv-item-btn:hover) { background-color: #ddd; }
:global(.highlight) { background-color: yellow; }
</style>
