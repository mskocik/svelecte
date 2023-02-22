<script>
  import { createEventDispatcher } from 'svelte';
  import { flip } from 'svelte/animate';
  import Input from './Input.svelte';

  export let clearable;
  export let searchable;
  export let renderer;
  export let disabled;
  export let placeholder;
  export let multiple;
  export let resetOnBlur;
  export let collapseSelection;
  export let inputId;
  /** internal props */
  export let inputValue;
  export let hasFocus;
  export let hasDropdownOpened;
  export let selectedOptions;           // passed as array
  export let isFetchingData;
  export let dndzone;
  export let currentValueField;
  export let itemComponent;
  export let isAndroid;
  export let collapsable;
  export let virtualList;

  const flipDurationMs = 100;


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

  let doCollapse = true;
  let refInput = undefined;

  function onFocus() {
    $hasFocus = true;
    $hasDropdownOpened = true;
    setTimeout(() => {
    doCollapse = false;
    }, 150);
  }

  function onBlur() {
    $hasFocus = false;
    $hasDropdownOpened = false;
    if (resetOnBlur) $inputValue = ''; // reset
    setTimeout(() => {
      doCollapse = true;
    }, 100);
    dispatch('blur');
  }

  $: selectedOptionsLength = selectedOptions.length
</script>

<div class="sv-control" class:is-active={$hasFocus} class:is-disabled={disabled}
  on:mousedown|preventDefault
  on:click|preventDefault={focusControl}
>
  <slot name="icon"></slot>
  <!-- selection & input -->
  <div class="sv-content sv-input-row" class:has-multiSelection={multiple} use:dndzone={{items:selectedOptions,flipDurationMs, type: inputId }} on:consider on:finalize>
    {#if selectedOptionsLength }
      {#if virtualList && collapsable && selectedOptionsLength > 1}
        <slot name="collapsable-item"/>
      {:else if multiple && collapseSelection && doCollapse}
        { collapseSelection(selectedOptionsLength, selectedOptions) }
      {:else}
        {#each selectedOptions as opt (opt[currentValueField])}
        <div animate:flip={{duration: flipDurationMs }}>
          <svelte:component this={itemComponent} formatter={renderer} item={opt} isSelected={true} on:deselect isMultiple={multiple} inputValue={$inputValue}/>
        </div>
        {/each}
      {/if}
    {/if}
    <!-- input -->
    <Input {disabled} {searchable} {placeholder} {multiple} {inputId}
      {inputValue} {hasDropdownOpened} {selectedOptions}
      {isAndroid}
      bind:this={refInput}
      on:focus={onFocus}
      on:blur={onBlur}
      on:keydown
      on:paste
    ></Input>
  </div>
  <!-- buttons, indicators -->
  <div class="indicator" class:is-loading={isFetchingData} >
    {#if clearable && selectedOptionsLength && !disabled}
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
      <svg width="20" height="20" class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
      </svg>
    </div>
  </div>
  <slot name="control-end"></slot>
</div>

<style>
.sv-control {
  background-color: var(--sv-bg);
  border: var(--sv-border);
  border-radius: 4px;
  min-height: var(--sv-min-height);
}
.sv-control.is-active {
  border: var(--sv-active-border);
  outline: var(--sv-active-outline);
}
.sv-control.is-disabled {
  background-color: var(--sv-disabled-bg);
  border-color: var(--sv-disabled-border-color);
  cursor: default;
  flex-wrap: wrap;
  justify-content: space-between;
  outline: currentcolor none 0px !important;
  position: relative;
  transition: all 100ms ease 0s;
}
.sv-control {
  display: flex;
  align-items: center;
  box-sizing: border-box;
}
.sv-content {
  align-items: center;
  display: flex;
  flex: 1 1 0%;
  flex-wrap: nowrap;
  padding: 0 0 0 6px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}
.sv-content.sv-input-row.has-multiSelection {
  flex-flow: wrap;
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
  color: var(--sv-icon-color);
  display: flex;
  padding: 8px;
  transition: color 150ms ease 0s;
  box-sizing: border-box;
}
.indicator-container:hover { color: var(--sv-icon-hover) }
.indicator-separator {
  align-self: stretch;
  background-color: var(--sv-border-color);
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
  border: var(--sv-loader-border);
  border-radius: 290486px;
  border-right-color: transparent;
  border-top-color: transparent;
  content: "";
  display: block;
  height: 20px;
  width: 20px;
  right: 8px;
  top: calc(50% - 10px);
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