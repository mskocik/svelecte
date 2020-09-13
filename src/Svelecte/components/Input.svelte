<script>
  import { getContext, onDestroy, createEventDispatcher } from 'svelte';
  import { key } from './../contextStore.js';

  export const focus = () => inputRef.focus();
  export let placeholder;
  export let searchable;
  export let disabled;

  let inputRef = null;
  let shadowWidth = 0;

  const dispatch = createEventDispatcher();
  const { inputValue, selectedOptions } = getContext(key);

  $: placeholderText = $selectedOptions.length ? '' : placeholder;
  $: shadowText = $inputValue || placeholder;
  $: inputStyle = `width: ${shadowWidth + 19}px`;

  function dispatchEvent(event) {
    dispatch(event.type);
  }
</script>

<!--<div class="inputRow"> -->
<input type="text" class="inputBox"
  disabled={disabled}
  readonly={!searchable}
  style={inputStyle} placeholder={placeholderText}
  bind:this={inputRef} 
  bind:value={$inputValue} 
  on:focus|stopPropagation={dispatchEvent} 
  on:blur|stopPropagation={dispatchEvent}
  on:keydown
>
<div class="shadow-text" bind:clientWidth={shadowWidth}>{shadowText}</div>
<!--</div>-->

<style>
.inputBox {
  box-sizing: content-box;
  width: 19px;
  background: rgba(0, 0, 0, 0) none repeat scroll 0px center;
  border: 0px none;
  font-size: inherit;
  font-family: inherit;
  opacity: 1;
  outline: currentcolor none 0px;
  padding: 0px;
  color: inherit;
  margin: -2px 0 0;
  height: 20px;
}
.inputBox:read-only { width: 100%; }
.shadow-text {
  visibility: hidden;
  position: absolute; left: 100%;
  z-index: -100;
  min-width: 24px;
  white-space: nowrap;
  top: 0;
  left: 0;
}
</style>