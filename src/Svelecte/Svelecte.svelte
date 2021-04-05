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
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fetchRemote } from './lib/utils.js';
  import { flatList, filterList, indexList } from './lib/list.js';
  import Control from './components/Control.svelte';
  import Dropdown from './components/Dropdown.svelte';

  export let name = null;
  export let anchor = null;
  export let required = false;
  export let multiple = defaults.multiple;
  export let collapseSelection = defaults.collapseSelection;
  export let disabled = defaults.disabled;
  export let creatable = defaults.creatable;
  export let creatablePrefix = defaults.creatablePrefix;
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
  export let virtualList = defaults.virtualList;
  export let vlHeight = defaults.vlHeight;
  export let vlItemSize = defaults.vlItemSize;
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
  export const getSelection = onlyValues => {
    if (!selection) return multiple ? [] : null;
    return multiple 
      ? selection.map(opt => onlyValues ? opt[currentValueField] : Object.assign({}, opt))
      : (onlyValues ? selection[currentValueField] : Object.assign({}, selection));
  };
  export const setSelection = selection => _selectByValues(selection);
  export const clearByParent = doDisable => {
    clearSelection();
    emitChangeEvent();
    if (doDisable) disabled = true;
    fetch = null;
  }
 
  const dispatch = createEventDispatcher();

  let isInitialized = false;
  let refDropdown;
  let refControl;
  let ignoreHover = false;
  let dropdownActiveIndex = null;
  // !multiple && options.some(o => o.isSelected)
  //   ? options.indexOf(options.filter(o => o.isSelected).shift())
  //   : 0;
  let fetchUnsubscribe = null;
  let currentValueField = valueField;
  let currentLabelField = labelField;
  
  /** ************************************ automatic init */
  multiple = name && !multiple ? name.endsWith('[]') : multiple;
  if (searchMode === 'auto') {
    currentValueField = valueField || fieldInit('value', options);
    currentLabelField = labelField || fieldInit('label', options);
  }

  /** ************************************ Context definition */
  const inputValue = writable('');
  const hasFocus = writable(false);
  const hasDropdownOpened = writable(false);

  let isFetchingData = false;
  
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
      fetchSource(query, fetchCallback || defaults.fetchCallback)
        .then(data => {
          options = data;
        })
        .catch(() => options = [])
        .finally(() => {
          isFetchingData = false;
          $hasFocus && hasDropdownOpened.set(true);
          listMessage = config.i18n.fetchEmpty;
          tick().then(() => dispatch('fetch', options));
        })
    }, 500);

    if (initFetchOnly) {
      if (typeof fetch === 'string' && fetch.indexOf('[parent]') !== -1) return null;
      isFetchingData = true;
      debouncedFetch(null);
      return null;
    }

    fetchUnsubscribe = inputValue.subscribe(value => {
      if (xhr && xhr.readyState !== 4) {  // cancel previously run 
        xhr.abort();
      };
      if (!value) {
        listMessage = config.i18n.fetchBefore;
        return;
      }
      isFetchingData = true;
      hasDropdownOpened.set(false);
      debouncedFetch(value);
    });

    return debouncedFetch;
  }

  /** ************************************ component logic */

  value && _selectByValues(value);   // init values if passed

  let prevSelection = selection;

  $: {
    if (prevSelection !== selection) {
      clearSelection();
      if (selection) {
        Array.isArray(selection) ? selection.forEach(selectOption) : selectOption(selection);
      }
      prevSelection = selection;
    }
  }
  /** - - - - - - - - - - STORE - - - - - - - - - - - - - -*/
  let selectedOptions = new Set();
  $: flatItems = flatList(options);
  $: maxReached = max && selectedOptions.length === max 
  $: availableItems = maxReached ? [] : filterList(flatItems, $inputValue, multiple, selectedOptions.length);
  $: currentListLength = creatable && $inputValue ? availableItems.length : availableItems.length - 1;
  $: listIndex = indexList(availableItems, currentListLength);
  // $: {
  //   if (dropdownActiveIndex === null) {
  //     dropdownActiveIndex = listIndex.first;
  //   } else if (dropdownActiveIndex > listIndex.last) {
  //     dropdownActiveIndex = listIndex.last;
  //   }
  // }
  $: listMessage = maxReached ? config.i18n.max(max) : config.i18n.empty;
  $: itemRenderer = typeof renderer === 'function' ? renderer : (formatterList[renderer] || formatterList.default.bind({ label: currentLabelField}));
  $: {
    const _unifiedSelection = multiple 
      ? Array.from(selectedOptions)
      : selectedOptions.size ? selectedOptions[0] : null;
    value = multiple 
      ? Array.from(selectedOptions).map(opt => opt[currentValueField])
      : selectedOptions.size ? selectedOptions[0][currentValueField] : null;
    prevSelection = _unifiedSelection;
    selection = _unifiedSelection;
    // Custom-element related
    if (anchor) {
      anchor.innerHTML = (Array.isArray(value) ? value : [value]).reduce((res, item) => {
        if (!item) {
          res = '<option value="" selected=""></option>';
          return res;
        };
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
      // NOTE: this event should not be emitted
      // if (options.some(opt => opt.isSelected)) emitChangeEvent();
      // option
    }
  }
  // $: dropdownComponent = virtualList ? DropdownVirtual : Dropdown;
  $: dropdownComponent = Dropdown;

  /**
   * Dispatch change event on add options/remove selected items
   */  
  function emitChangeEvent() {
    tick().then(() => {
      dispatch('change', selection)
    });
  }

  /**
   * Internal helper for passed value array. Should be used for CE
   */ 
  function _selectByValues(values) {
    if (!Array.isArray(values)) values = [values];
    if (values && values.length && values[0] instanceof Object) values = values.map(opt => opt[currentValueField]);
    clearSelection();
    const newAddition = [];
    values.forEach(val => {
      availableItems.some(opt => {
        if (val == (opt[currentValueField])) {
          newAddition.push(opt);
          return true;
        }
        return false;
      });
    });
    newAddition.forEach(selectOption);
  }

  function selectOption(opt) {
    if (maxReached) return;
    
    if (typeof opt === 'string') {
      opt = {
        [currentLabelField]: `${creatablePrefix}${opt}`,
        [currentValueField]: encodeURIComponent(opt),
        isSelected: true,
        _created: true,
      };
      options = [...options, opt];
    }
    opt.isSelected = true;
    !selectedOptions.has(opt) && selectedOptions.add(opt);
    selectedOptions = selectedOptions;
    flatItems = flatItems;
  }

  function deselectOption(opt) {
    selectedOptions.delete(opt);
    opt.isSelected = false;
    selectedOptions = selectedOptions;
    flatItems = flatItems;
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
    } else {
      tick().then(() => {
        dropdownActiveIndex = maxReached
          ? null
          : listIndex.next(dropdownActiveIndex - 1, true);
      })
    }
    emitChangeEvent();
  }

  /**
   * Remove option/all options from selection pool
   */
  function onDeselect(event, opt) {
    if (disabled) return;
    opt = opt || event.detail;
    console.log('deselect', opt);
    if (opt) {
      deselectOption(opt);
    } else {  // apply for 'x' when clearable:true || ctrl+backspace || ctrl+delete
      selectedOptions.forEach(deselectOption);
    }
    tick().then(refControl.focusControl);
    emitChangeEvent();
    tick().then(() => {
        dropdownActiveIndex = listIndex.next(dropdownActiveIndex - 1); 
      })
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
    event = event.detail; // from dispatched event
    if (creatable && delimiter.indexOf(event.key) > -1) {
      $inputValue.length > 0 && onSelect(null, $inputValue); // prevent creating item with delimiter itself
      event.preventDefault();
      return;
    }
    const Tab = selectOnTab && $hasDropdownOpened && !event.shiftKey ? 'Tab' : 'No-tab';
    switch (event.key) {
      case 'PageDown':
      case 'End':
        dropdownActiveIndex = listIndex.first;
      case 'ArrowUp': 
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
        event.preventDefault();
        dropdownActiveIndex = listIndex.prev(dropdownActiveIndex);
        tick().then(refDropdown.scrollIntoView);
        ignoreHover = true;
        break;
      case 'PageUp':
      case 'Home':
        dropdownActiveIndex = listIndex.last;
      case 'ArrowDown': 
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
        event.preventDefault();
        dropdownActiveIndex = listIndex.next(dropdownActiveIndex);
        tick().then(refDropdown.scrollIntoView);
        ignoreHover = true;
        break;
      case 'Escape':
        if ($hasDropdownOpened) { // prevent ESC bubble in this case (interfering with modal closing etc. (bootstrap))
          event.preventDefault();
          event.stopPropagation();
        }
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
        let activeDropdownItem = availableItems[dropdownActiveIndex];
        if (creatable && $inputValue) {
          activeDropdownItem = !activeDropdownItem || event.ctrlKey 
            ? $inputValue
            : activeDropdownItem
        }
        activeDropdownItem && onSelect(null, activeDropdownItem);
        if (availableItems.length <= dropdownActiveIndex) {
          dropdownActiveIndex = currentListLength > 0 ? currentListLength : listIndex.first;
        }
        event.preventDefault(); // prevent form submit
        break;
      case ' ':
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          event.preventDefault();
        }
        break;
      // FUTURE: handle 'PageDown' & 'PageUp'
      case 'Backspace':
      case 'Delete':
        if ($inputValue === '' && selectedOptions.size) {
          event.ctrlKey ? onDeselect({ /** no detail prop */}) : onDeselect(null, [...selectedOptions].pop());
        }
      default:
        if (!event.ctrlKey && !['Tab', 'Shift'].includes(event.key) && !$hasDropdownOpened && !isFetchingData) {
          $hasDropdownOpened = true;
        }
        if (!multiple && selectedOptions.length && event.key !== 'Tab') event.preventDefault();
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
      pasted.match(rx).forEach(opt => onSelect(null, opt.trim()));
    }
    // do nothing otherwise
  }

  /** ************************************ component lifecycle related */

  onMount(() => {
    isInitialized = true;
    // Lazy calling of scrollIntoView function, which is required
    // TODO: resolve, probably already fixed
    // if (val <= dropdownActiveIndex) dropdownActiveIndex = val;
    // if (dropdownActiveIndex < 0) dropdownActiveIndex = listIndexMap.first;
    dropdownActiveIndex = listIndex.first;
    if (prevSelection && !multiple) {
      dropdownActiveIndex = flatItems.findIndex(opt => opt[currentValueField] === prevSelection[currentValueField]);
      tick().then(() => refDropdown && refDropdown.scrollIntoView({}));
    }
    if (anchor) anchor.classList.add('anchored-select');
  });
</script>

<div class={`svelecte ${className}`} class:is-disabled={disabled} {style}>
  <Control bind:this={refControl} renderer={itemRenderer}
    {disabled} {clearable} {searchable} {placeholder} {multiple} collapseSelection={collapseSelection ? config.i18n.collapsedSelection : null}
    inputValue={inputValue} hasFocus={hasFocus} hasDropdownOpened={hasDropdownOpened} selectedOptions={Array.from(selectedOptions)} {isFetchingData}
    on:deselect={onDeselect}
    on:keydown={onKeyDown}
    on:paste={onPaste}
  >
    <div slot="icon" class="icon-slot"><slot name="icon"></slot></div>
  </Control>
  <Dropdown bind:this={refDropdown} renderer={itemRenderer} {creatable} {maxReached} 
    virtualList={creatable ? false : virtualList} {vlHeight} {vlItemSize}
    dropdownIndex={dropdownActiveIndex}
    items={availableItems} {listIndex}
    {inputValue} {hasDropdownOpened} {listMessage}
    on:select={onSelect} 
    on:hover={onHover}
    let:item={item}
  ></Dropdown>
  {#if name && !anchor}
  <select name={name} {multiple} class="is-hidden" tabindex="-1" {required} {disabled}>
    {#each Array.from(selectedOptions) as opt}
    <option value={opt[currentValueField]} selected>{opt[currentLabelField]}</option>
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