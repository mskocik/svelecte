<script context="module">
  import rendererActions from './actions.js';
  import Item from './components/Item.svelte';

  const renderers = {
    default: Item
  };
  // provide ability to add additional renderers
  export function registerRenderer(name, component) { renderers[name] = component }
  export const itemActions = rendererActions;
</script>

<script>
  import { setContext, onDestroy, createEventDispatcher, tick } from 'svelte';
  import { key, initStore } from './contextStore.js';
  import { fetchRemote } from './lib/utils.js';
  import defaults from './settings.js';
  import Control from './components/Control.svelte';
  import Dropdown from './components/Dropdown.svelte';

  export let name = null;
  export let required = false;
  export let multiple = defaults.multiple;
  export let disabled = defaults.disabled;
  export let creatable = defaults.creatable;
  export let selectOnTab = defaults.selectOnTab;
  export let valueField = defaults.valueField;
  // export let labelField = defaults.labelField;  // TODO: implement custom sifter search options
  export let searchMode = defaults.searchMode;
  export let max = defaults.max;
  export let renderer = defaults.renderer;
  export let clearable = defaults.clearable;
  export let searchable = defaults.searchable;
  export let placeholder = 'Select';
  export let fetch = null;
  export let options = [];

  let className = 'svelecte-control';
  export { className as class};
  export let style = null;
  /** ************************************ API */
  export let selection = undefined;
  export let value = undefined;
  export const getSelection = () => JSON.parse(JSON.stringify(selection));
  export const setSelection = selection => _selectByValues(selection);

  // options are being updated
  let prevOptions = undefined;
  $: {
    if (prevOptions !== options && _set) {
      _set(options);
      prevOptions = options;
    }
  }

  const dispatch = createEventDispatcher();
  const storeSettings = {
    multiple,
    creatable,
    searchMode,
    max
  };
  multiple = name && !multiple ? name.endsWith('[]') : multiple;

  // TODO: re-evaluate need of this
  /** ************************************ auto configuration */
  $: {
    placeholder = options.reduce((res, opt, i) => {
      if (opt.value === '') {
        res = opt.text;
        options.splice(i, 1); // remove this option 
      }
      return res;
    }, placeholder);
  }
  // TODO: re-evaluate - can't it be done in some more clean fashion?
  $: {
    storeSettings.multiple = multiple;
    storeSettings.creatable = creatable;
    storeSettings.searchMode = searchMode;
    storeSettings.max = max;
  }

  /** ************************************ Context definition */
  const { 
      hasFocus, hasDropdownOpened, inputValue, listMessage,
      selectOption, deselectOption, clearSelection, 
      listLength, matchingOptions, flatMatching, currentListLength, selectedOptions, listIndexMap,
      _set, _remote, isFetchingData
  } = initStore(options, storeSettings, typeof fetch === 'string' ?  fetchRemote(fetch) : fetch);

  setContext(key, {
    hasFocus, hasDropdownOpened, inputValue, listMessage,
    selectOption, deselectOption, clearSelection, 
    listLength, matchingOptions, flatMatching, currentListLength, selectedOptions, listIndexMap, isFetchingData
  });

  /** ************************************ component logic */
  let refDropdown;
  let refControl;
  let ignoreHover = false;
  let dropdownActiveIndex = !multiple && options.some(o => o.isSelected)
    ? options.indexOf(options.filter(o => o.isSelected).shift())
    : 0;
  $: itemRenderer = typeof renderer === 'string' ? renderers[renderer] || Item : renderer;
  $: {
    selection = multiple
      ? $selectedOptions
      : $selectedOptions.length ? $selectedOptions[0] : null;
    value = multiple 
      ? $selectedOptions.map(opt => opt[valueField])
      : $selectedOptions.length ? $selectedOptions[0][valueField] : null;
  }

  /**
   * Dispatch change event on add options/remove selected items
   */  
  function emitChangeEvent() {
    tick().then(() => {
      dispatch('change', selection)
    });
  }

  /**
   * TODO: check this funcionality
   * Internal helper for passed value array. Should be used for CC
   */ 
  function _selectByValues(values) {
    if (!Array.isArray(values)) values = [values];
    if (values[0] && values[0] instanceof Object) values = values.map(opt => opt[valueField]);
    clearSelection();
    const newAddition = [];
    $flatMatching.forEach(opt => {
      if (values.includes(opt.value)) {
        newAddition.push(opt);
      }
    });
    newAddition.forEach(selectOption);
  }

  /**
   * Add given option to selection pool
   */
  function onSelect(event, opt) {
    opt = opt || event.detail;
    if (disabled || opt.isDisabled) return;
    selectOption(opt);
    $inputValue = '';
    if (!multiple) {
      $hasDropdownOpened = false;
    }
    emitChangeEvent();
  }

  /**
   * Remove option/all options from selection pool
   */
  function onDeselect(event, opt) {
    if (disabled) return;
    opt = opt || event.detail;
    if (opt) {
      deselectOption(opt);
    } else {  // apply for 'x' when clearable:true || ctrl+backspace || ctrl+delete
      clearSelection();
    }
    tick().then(refControl.focusControl);
    emitChangeEvent();
  }

  /**
   * Dropdown hover handler - update active item
   */
  function onHover(event) {
    if (ignoreHover) {
      ignoreHover = false;
      return;
    }
    dropdownActiveIndex = event.detail;
  }

  /**
   * Keyboard navigation
   */
  function onKeyDown(event) {
    let nextVal;
    let scrollParams = {};
    const Tab = selectOnTab && $hasDropdownOpened && !event.shiftKey ? 'Tab' : 'No-tab';
    switch (event.key) {
      case 'PageDown':
        dropdownActiveIndex = 0;
      case 'ArrowUp': 
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
        event.preventDefault();
        dropdownActiveIndex = dropdownActiveIndex == 0 
          ? $currentListLength
          : dropdownActiveIndex - 1;
        tick().then(refDropdown.scrollIntoView);
        ignoreHover = true;
        break;
      case 'PageUp':
        dropdownActiveIndex = $currentListLength + 2;
      case 'ArrowDown': 
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
        event.preventDefault();
        dropdownActiveIndex = dropdownActiveIndex >= $currentListLength ? 0 : dropdownActiveIndex + 1;
        tick().then(refDropdown.scrollIntoView);
        ignoreHover = true;
        break;
      case 'Escape':
        if (!$inputValue) {
          $hasDropdownOpened = false;
        }
        $inputValue = '';
        break;
      case Tab:
        $hasDropdownOpened = false;
        event.preventDefault();
      case 'Enter':
        if (!$hasDropdownOpened) return;
        let activeDropdownItem = $flatMatching[dropdownActiveIndex];
        if (creatable && $inputValue) {
          activeDropdownItem = !activeDropdownItem || event.ctrlKey 
            ? $inputValue
            : activeDropdownItem
        }
        activeDropdownItem && onSelect(null, activeDropdownItem);
        if ($flatMatching.length <= dropdownActiveIndex) {
          dropdownActiveIndex = $currentListLength > 0 ? $currentListLength : 0;
        }
        event.preventDefault(); // prevent form submit
        break;
      case ' ':
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          event.preventDefault();
        }
        break;
      case 'Backspace':
      case 'Delete':
        if ($inputValue === '' && $selectedOptions.length) {
          event.ctrlKey ? onDeselect({}) : onDeselect(null, $selectedOptions.pop());
        }
      default:
        if (!event.ctrlKey && event.key !== 'Shift' && !$hasDropdownOpened) {
          $hasDropdownOpened = true;
        }
        if (!multiple && $selectedOptions.length && event.key !== 'Tab') event.preventDefault();
    }
  }

  /**
   * Lazy calling of scrollIntoView function, which is required
   */ 
  onDestroy(currentListLength.subscribe(val => {
    if (val <= dropdownActiveIndex) dropdownActiveIndex = val;
    if (dropdownActiveIndex < 0) dropdownActiveIndex = 0;
    tick().then(() => refDropdown && refDropdown.scrollIntoView({}));
  }));
</script>

<div class={`svelecte ${className}`} class:is-disabled={disabled} {style}>
  {#if name}
  <select name={name} {multiple} class="is-hidden" tabindex="-1" {required} {disabled}>
    {#each $selectedOptions as opt}
    <option value={opt.value} selected>{opt.text}</option>
    {/each}
  </select>
  {/if}
  <Control bind:this={refControl} renderer={itemRenderer}
    {disabled} {clearable} {searchable} {placeholder} {multiple}
    on:deselect={onDeselect}
    on:keydown={onKeyDown}
  >
    <div slot="icon" class="icon-slot"><slot name="icon"></slot></div>
  </Control>
  <Dropdown bind:this={refDropdown} renderer={itemRenderer} {creatable} 
    maxReached={max && max === $selectedOptions.length}
    dropdownIndex={dropdownActiveIndex}
    on:select={onSelect} 
    on:hover={onHover}
  ></Dropdown>
</div>

<style>
.svelecte { position: relative; }
.svelecte.is-disabled { pointer-events: none; }
.icon-slot { display: flex; }
.is-hidden { display: none; visibility: hidden; }
</style>