<script context="module">
  import defaults from './settings.js';
  import { debounce, xhr, fieldInit } from './lib/utils.js'; // shared across instances

  const formatterList = {
    default: function(item) { return item[this.label]; }
  };
  // provide ability to add additional renderers
  export function addFormatter(name, formatFn) {
    if (name instanceof Object) {
      formatterList = Object.assign(formatterList, name);
    } else {
      formatterList[name] = formatFn
    }
  };
  export const config = defaults;
</script>

<script>
  import { setContext, onDestroy, createEventDispatcher, tick, onMount } from 'svelte';
  import { key, initStore, initSettings } from './contextStore.js';
  import { fetchRemote } from './lib/utils.js';
  import Control from './components/Control.svelte';
  import Dropdown from './components/Dropdown.svelte';

  export let name = null;
  export let anchor = null;
  export let required = false;
  export let multiple = defaults.multiple;
  export let disabled = defaults.disabled;
  export let creatable = defaults.creatable;
  export let selectOnTab = defaults.selectOnTab;
  export let valueField = defaults.valueField;
  export let labelField = defaults.labelField;
  export let max = defaults.max;
  export let renderer = null;
  export let clearable = defaults.clearable;
  export let searchable = defaults.searchable;
  export let delimiter = defaults.delimiter;
  export let placeholder = 'Select';
  export let fetch = null;
  export let fetchMode = 'auto';
  export let fetchCallback = null;
  export let options = [];
  // sifter related
  export let searchField = null;
  export let sortField = null;
  export let sortRemote = defaults.sortRemoteResults;
  // 'auto' means, when there are optgroups, don't use Sifter for sortings
  export let searchMode = 'auto'; // FUTURE: this about implementing this

  let className = 'svelecte-control';
  export { className as class};
  export let style = null;
  /** ************************************ API */
  export let selection = undefined;
  export let value = undefined;
  export const getSelection = () => JSON.parse(JSON.stringify(selection));
  export const setSelection = selection => _selectByValues(selection);
 
  const dispatch = createEventDispatcher();

  let isInitialized = false;
  let refDropdown;
  let refControl;
  let ignoreHover = false;
  let dropdownActiveIndex = !multiple && options.some(o => o.isSelected)
    ? options.indexOf(options.filter(o => o.isSelected).shift())
    : 0;
  let fetchUnsubscribe = null;
  let currentValueField = valueField;
  let currentLabelField = labelField;
  
  /** ************************************ automatic init */
  multiple = name && !multiple ? name.endsWith('[]') : multiple;
  if (searchMode === 'auto') {
    currentValueField = valueField || fieldInit('value');
    currentLabelField = labelField || fieldInit('label');
  }

  /** ************************************ Context definition */
  const { 
      hasFocus, hasDropdownOpened, inputValue, isFetchingData, listMessage, settings,                               // stores
      selectOption, deselectOption, clearSelection, settingsUnsubscribe,                            // actions
      listLength, listIndexMap, matchingOptions, flatMatching, currentListLength, selectedOptions,   // getters
      updateOpts, 
  } = initStore(
    options, 
    { currentValueField, currentLabelField, max, multiple, creatable, searchField, sortField, sortRemote },
    config.i18n
  );

  setContext(key, {
    hasFocus, hasDropdownOpened, inputValue, listMessage,
    selectOption, deselectOption, clearSelection, 
    listLength, matchingOptions, flatMatching, currentListLength, selectedOptions, listIndexMap, isFetchingData
  });

  
  /** ************************************ remote source */
  $: initFetchOnly = fetchMode === 'init' || (typeof fetch === 'string' && fetch.indexOf('[query]') === -1);
  $: createFetch(fetch);

  function createFetch(fetch) {
    if (fetchUnsubscribe) {
      fetchUnsubscribe();
      fetchUnsubscribe = null;
    } 
    if (!fetch) return null;

    const fetchSource = typeof fetch === 'string' ? fetchRemote(fetch) : fetch;
    const initFetchOnly = fetchMode === 'init' || (fetchMode === 'auto' && typeof fetch === 'string' && fetch.indexOf('[query]') === -1);
    const debouncedFetch = debounce(query => {
      fetchSource(query, fetchCallback)
        .then(data => {
          options = data;
        })
        .catch(() => opts.set([]))
        .finally(() => {
          isFetchingData.set(false);
          $hasFocus && hasDropdownOpened.set(true);
          listMessage.set(config.i18n.fetchEmpty);
        })
    }, 500);

    if (initFetchOnly) {
      isFetchingData.set(true);
      debouncedFetch(null);
      return null;
    }

    fetchUnsubscribe = inputValue.subscribe(value => {
      if (xhr && xhr.readyState !== 4) {  // cancel previously run 
        xhr.abort();
      };
      if (!value) {
        listMessage.set(config.i18n.fetchBefore);
        return;
      }
      isFetchingData.set(true);
      listMessage.set(config.i18n.fetchWait);
      hasDropdownOpened.set(false);
      debouncedFetch(value);
    });

    return debouncedFetch;
  }

  /** ************************************ component logic */
  
  $: settings.set({ max, multiple, creatable, searchField, sortField, currentLabelField, currentValueField, sortRemote });
  $: itemRenderer = formatterList[renderer] || formatterList.default.bind({ label: currentLabelField})
  $: {
    selection = multiple
      ? $selectedOptions
      : $selectedOptions.length ? $selectedOptions[0] : null;
    value = multiple 
      ? $selectedOptions.map(opt => opt[currentValueField])
      : $selectedOptions.length ? $selectedOptions[0][currentValueField] : null;
    // Custom-element related
    if (anchor && value) {
      anchor.innerHTML = (Array.isArray(value) ? value : [value]).reduce((res, item) => {
        res+= `<option value="${item}" selected>${item}</option>`;
        return res;
      }, '');
      anchor.dispatchEvent(new Event('change'));
    }
  }
  let prevOptions = options;
  $: {
    if (isInitialized && prevOptions !== options) {
      if (searchMode === 'auto') {
        const ivalue = fieldInit('value', options || null);
        const ilabel = fieldInit('label', options || null);
        if (!valueField && currentValueField !== ivalue) currentValueField = ivalue;
        if (!labelField && currentLabelField !== ilabel) currentLabelField = ilabel;
      }
      updateOpts(options);
    }
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
    if (creatable && delimiter.indexOf(event.key) > -1) {
      onSelect(null, $inputValue);
      event.preventDefault();
      return;
    }
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
        if (!event.ctrlKey && !['Tab', 'Shift'].includes(event.key) && !$hasDropdownOpened && !$isFetchingData) {
          $hasDropdownOpened = true;
        }
        if (!multiple && $selectedOptions.length && event.key !== 'Tab') event.preventDefault();
    }
  }

  /**
   * Enable create items by pasting
   */
  function onPaste(event) {
    if (creatable) {
      event.preventDefault();
      const rx = new RegExp('([^' + delimiter + '\\n]+)', 'g');
      const pasted = event.clipboardData.getData('text/plain');
      pasted.match(rx).forEach(opt => onSelect(null, opt));
    }
    // do nothing otherwise
  }

  /** ************************************ component lifecycle related */

  let currentListSubscriber;

  onMount(() => {
    isInitialized = true;
    // Lazy calling of scrollIntoView function, which is required
    currentListSubscriber = currentListLength.subscribe(val => {
      if (val <= dropdownActiveIndex) dropdownActiveIndex = val;
      if (dropdownActiveIndex < 0) dropdownActiveIndex = 0;
      tick().then(() => refDropdown && refDropdown.scrollIntoView({}));
    });
    if (anchor) anchor.classList.add('anchored-select');
  });

  onDestroy(() => {
    currentListSubscriber();
    settingsUnsubscribe();
  });
</script>

<div class={`svelecte ${className}`} class:is-disabled={disabled} {style}>
  <Control bind:this={refControl} renderer={itemRenderer}
    {disabled} {clearable} {searchable} {placeholder} {multiple}
    on:deselect={onDeselect}
    on:keydown={onKeyDown}
    on:paste={onPaste}
  >
    <div slot="icon" class="icon-slot"><slot name="icon"></slot></div>
  </Control>
  <Dropdown bind:this={refDropdown} renderer={itemRenderer} {creatable} 
    maxReached={max && max === $selectedOptions.length}
    dropdownIndex={dropdownActiveIndex}
    on:select={onSelect} 
    on:hover={onHover}
  ></Dropdown>
  {#if name && !anchor}
  <select name={name} {multiple} class="is-hidden" tabindex="-1" {required} {disabled}>
    {#each $selectedOptions as opt}
    <option value={opt.value} selected>{opt.text}</option>
    {/each}
  </select>
  {/if}
</div>

<style>
.svelecte { position: relative; flex: 1 1 auto; }
.svelecte.is-disabled { pointer-events: none; }
.icon-slot { display: flex; }
.is-hidden,
:global(.anchored-select) { opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px}
</style>