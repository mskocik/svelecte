<script>
  import { getContext, createEventDispatcher, tick } from 'svelte';
  import { key } from './../contextStore.js';
  import Input from './Input.svelte';
  import Item from './Item.svelte';

  export let clearable;
  export let searchable;
  export let renderer;
  export let disabled;
  export let placeholder;
  export let multiple;
  export function focusControl(event) {
    if (disabled) return;
    if (!event) {
      !$hasFocus && refInput.focus();
      $hasDropdownOpened = true;
      return;
    }
    if (!$hasFocus) {
      refInput.focus();
    } else {
      $hasDropdownOpened = !$hasDropdownOpened;
    }
  }

  /** ************************************ context */
  const dispatch = createEventDispatcher();
  const { inputValue, hasFocus, hasDropdownOpened, selectedOptions, isFetchingData } = getContext(key);

  let refInput = undefined;
  $: showSelection = multiple ? true : !$inputValue && $selectedOptions.length;

  function onFocus() {
    $hasFocus = true; 
    $hasDropdownOpened = true;
  }

  function onBlur() {
    $hasFocus = false;
    $hasDropdownOpened = false;
    $inputValue = ''; // reset
  }
</script>

<div class="control" class:is-active={$hasFocus} class:is-disabled={disabled}
  on:mousedown|preventDefault
  on:click|preventDefault={focusControl}
>
  <slot name="icon"></slot>
  <!-- selection & input -->
  <div class="content" class:has-multiSelection={multiple}>
    {#if $selectedOptions.length }
      {#each $selectedOptions as opt}
      <Item formatter={renderer} item={opt} isSelected={true} on:deselect isMultiple={multiple}></Item>
      {/each}
    {/if}
    <!-- input -->
    <Input {disabled} {searchable} {placeholder}
      bind:this={refInput}
      on:focus={onFocus}
      on:blur={onBlur}
      on:keydown
      on:paste
    ></Input>
  </div>
  <!-- buttons, indicators -->
  <div class="indicator" class:is-loading={$isFetchingData} >
    {#if clearable && $selectedOptions.length && !disabled}
    <div aria-hidden="true" class="indicator-container close-icon"
      on:mousedown|preventDefault
      on:click={() => dispatch('deselect')}
    >
      <svg class="indicator-icon" height="20" width="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
    </div>
    {/if}
    {#if clearable}
    <span class="indicator-separator"></span>
    {/if}
    <div aria-hidden="true" class="indicator-container" on:mousedown|preventDefault>
      <svg width="20" class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
      </svg>
    </div>
  </div>
</div>

<style>
/** global default styles for wrapper div (*/
:global(.svelecte-control) .control             { border: 1px solid #ccc; border-radius: 4px; min-height: 38px; }
:global(.svelecte-control) .control.is-active   { border: 1px solid #555; }
.control.is-disabled {
  background-color: rgb(242, 242, 242);
  border-color: rgb(230, 230, 230);
  cursor: default;
  flex-wrap: wrap;
  justify-content: space-between;
  outline: currentcolor none 0px !important;
  position: relative;
  transition: all 100ms ease 0s;
}
.control {
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.content {
  align-items: center;
  display: flex;
  flex: 1 1 0%;
  flex-wrap: wrap;
  padding: 0 0 0 6px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
.indicator {
  position: relative;
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-shrink: 0;
  box-sizing: border-box;
}
.indicator-container {
  color: rgb(204, 204, 204);
  display: flex;
  padding: 8px;
  transition: color 150ms ease 0s;
  box-sizing: border-box;
}
.indicator-container:hover { color: rgb(153, 153, 153); }
.indicator-separator {
  align-self: stretch;
  background-color: rgb(204, 204, 204);
  margin-bottom: 8px;
  margin-top: 8px;
  width: 1px;
  box-sizing: border-box;
}
.indicator-icon {
  display: inline-block;
  fill: currentcolor;
  line-height: 1;
  stroke: currentcolor;
  stroke-width: 0px;
}
.is-loading:after {
  animation: spinAround .5s infinite linear;
  border: 3px solid #dbdbdb;
  border-radius: 290486px;
  border-right-color: transparent;
  border-top-color: transparent;
  content: "";
  display: block;
  height: 16px;
  width: 16px;
  left: calc(50% - (1em / 2));
  top: calc(50% - (1em / 2));
  position: absolute !important;
  box-sizing: border-box;
}

@keyframes spinAround {
  from {
    transform: rotate(0deg)
  }
  to {
    transform: rotate(359deg)
  }
}
</style>