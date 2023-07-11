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
  export let alwaysCollapsed;
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
  export let isIOS;

  const flipDurationMs = 100;

  let inputMode = 'none';             // mobile related only

  export function focusControl(event) {
    if (disabled) return;
    if (!event) {
      !$hasFocus && refInput.focus();
      $hasDropdownOpened = true;
      return;
    } else if (event?.target.tagName !== 'INPUT') {
      event.preventDefault();
    }
    if (!$hasFocus) {
      refInput.focus();
    } else {
      if ((isAndroid || isIOS) && inputMode !== 'text') {
        inputMode = 'text';
        return;
      }
      if (event?.target.tagName === 'INPUT' && $inputValue) {
        return;
      } else if (inputMode === 'text') {
        inputMode = 'none';
        $hasDropdownOpened = true;
        return
      }
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
    !alwaysCollapsed && setTimeout(() => {
    doCollapse = false;
    }, 150);
  }

  function onBlur() {
    inputMode = 'none';
    $hasFocus = false;
    $hasDropdownOpened = false;
    if (resetOnBlur) $inputValue = ''; // reset
    !alwaysCollapsed && setTimeout(() => {
      doCollapse = true;
    }, 100);
    dispatch('blur');
  }

  function toggleDropdown(event) {
    event.preventDefault();
    event.stopPropagation();
    inputMode = 'none';
    if (!$hasFocus) {
      refInput.focus();
    } else {
      $hasDropdownOpened = !$hasDropdownOpened;
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="sv-control" class:is-active={$hasFocus} class:is-disabled={disabled}
on:mousedown={focusControl}
>
  <slot name="icon"></slot>
  <!-- selection & input -->
  <div class="sv-content sv-input-row" class:has-multiSelection={multiple} use:dndzone={{items:selectedOptions,flipDurationMs, type: inputId }} on:consider on:finalize>
    {#if selectedOptions.length }
      {#if multiple && collapseSelection && doCollapse}
        {@html collapseSelection(selectedOptions.length, selectedOptions) }
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
      {isAndroid} {inputMode}
      bind:this={refInput}
      on:focus={onFocus}
      on:blur={onBlur}
      on:keydown
      on:paste
    ></Input>
  </div>
  <!-- buttons, indicators -->
  <div class="indicator" class:is-loading={isFetchingData} >
    {#if clearable && !disabled}
    <div aria-hidden="true" class="indicator-container close-icon"
      on:mousedown|preventDefault
      on:click={() => dispatch('deselect')}
    >
      <slot name="clear-icon"></slot>
    </div>
    {/if}
    {#if clearable}
    <span class="indicator-separator"></span>
    {/if}
    <div aria-hidden="true" class="indicator-container" on:mousedown={toggleDropdown}>
      <slot name="indicator-icon" hasDropdownOpened={$hasDropdownOpened}></slot>
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