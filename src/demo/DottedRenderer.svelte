<script>
  import { itemActions } from './../Svelecte/Svelecte.svelte';
  
  export let index = -1;
  export let item = {};
  export let isSelected = false;
  export let isDisabled = false;

  $: itemStyle = `background-color: ${item.hex || '#ccc'}`;
</script>

<style>
:global(.has-multiSelection) .item {
  background-color: #efefef;
  margin: 2px 4px 2px 0;
  color: yellow;
}
:global(.has-multiSelection) .item-btn {
  display: flex;
}
:global(.has-multiSelection) .item-content,
:global(.dropdown-content) .item {
  padding: 3px 3px 3px 6px;
}
:global(.active) .item {
  background-color: #F2F5F8;
}
.item {
  display: flex;
  min-width: 0px;
  box-sizing: border-box;
  border-radius: 2px;
  cursor: default;
}
.item.is-disabled { opacity: 0.5; cursor: not-allowed; }

.item-content {
  color: rgb(51, 51, 51);
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  margin-left: 3px;
  box-shadow: 0 0 4px #ccc;
}

.item-btn {
  display: none;
  position: relative;
  align-items: center;
  align-self: stretch;
  padding-left: 4px;
  padding-right: 4px;
  box-sizing: border-box;
  border-radius: 2px;
}
.item-btn:hover { background-color: #ddd; }
</style>


<div class="item"
  class:is-disabled={isDisabled}
  use:itemActions={{item, index}}
  on:select
  on:deselect
  on:hover
>
  <div class="item-content">
    <span style={itemStyle} class="color"></span> {item.text}
  </div>
{#if isSelected}
  <a href="#deselect" class="item-btn" tabindex="-1" data-action="deselect">
    <svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
  </a>
{/if}
</div>