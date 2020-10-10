<script>
  import { getContext, onDestroy, createEventDispatcher } from 'svelte';
  import { key } from './../contextStore.js';

  export const focus = () => inputRef.focus();
  export let placeholder;
  export let searchable;
  export let disabled;
  export let multiple;

  let inputRef = null;
  let shadowWidth = 0;

  const dispatch = createEventDispatcher();
  const { inputValue, selectedOptions } = getContext(key);

  $: isSingleFilled = $selectedOptions.length > 0 && multiple === false;
  $: placeholderText = $selectedOptions.length > 0 ? '' : placeholder;
  $: shadowText = $inputValue || placeholderText;
  $: widthAddition = $selectedOptions.length === 0 ? 19 : 12;
  $: inputStyle = `width: ${isSingleFilled ? 2 : shadowWidth + widthAddition}px`;

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
  on:focus
  on:blur
  on:keydown
  on:paste
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
  opacity: 0;
  position: absolute; left: 100%;
  z-index: -100;
  min-width: 24px;
  white-space: nowrap;
  top: 0;
  left: 0;
}
</style>