<script context="module">
  import defaults from './settings.js';
  import { debounce, xhr, fieldInit, iOS } from './lib/utils.js'; // shared across instances

  const formatterList = {
    default: function(item) { return item[this.label]; }
  };
  // provide ability to add additional renderers
  export function addFormatter(name, formatFn) {
    if (name instanceof Object) {
      for (let prop in name) {
        formatterList[prop] = name[prop];
      }
    } else {
      formatterList[name] = formatFn
    }
  };
  export const config = defaults;
</script>

<!-- svelte-ignore module-script-reactive-declaration -->
<script>
  import { createEventDispatcher, tick, onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fetchRemote, defaultCreateFilter } from './lib/utils.js';
  import { initSelection, flatList, filterList, indexList, getFilterProps } from './lib/list.js';
  import Control from './components/Control.svelte';
  import Dropdown from './components/Dropdown.svelte';
  import Item from './components/Item.svelte';

  // form and CE
  export let name = 'svelecte';
  export let inputId = null;
  export let required = false;
  export let hasAnchor = false;
  export let disabled = defaults.disabled;
  // basic
  export let options = [];
  export let valueField = defaults.valueField;
  export let labelField = defaults.labelField;
  export let disabledField = defaults.disabledField;
  export let placeholder = 'Select';
  // UI, UX
  export let searchable = defaults.searchable;
  export let clearable = defaults.clearable;
  export let renderer = null;
  export let disableHighlight = false;
  export let selectOnTab = defaults.selectOnTab;
  export let resetOnBlur = defaults.resetOnBlur;
  export let dndzone = () => ({ noop: true, destroy: () => {}});
  export let validatorAction = null;
  export let dropdownItem = Item;
  export let controlItem = Item;
  // multiple
  export let multiple = defaults.multiple;
  export let max = defaults.max;
  export let collapseSelection = defaults.collapseSelection;
  // creating
  export let creatable = defaults.creatable;
  export let creatablePrefix = defaults.creatablePrefix;
  export let allowEditing = defaults.allowEditing;
  export let keepCreated = defaults.keepCreated;
  export let delimiter = defaults.delimiter;
  export let createFilter = null;
  // remote
  export let fetch = null;
  export let fetchMode = 'auto';
  export let fetchCallback = defaults.fetchCallback;
  export let fetchResetOnBlur = true;
  export let minQuery = defaults.minQuery;
  // performance
  export let lazyDropdown = defaults.lazyDropdown;
  // virtual list
  export let virtualList = defaults.virtualList;
  export let vlHeight = defaults.vlHeight;
  export let vlItemSize = defaults.vlItemSize;
  // sifter related
  export let searchField = null;
  export let sortField = null;
  export let disableSifter = false;
  // styling
  let className = 'svelecte-control';
  export { className as class};
  export let style = null;
  // i18n override
  export let i18n = null;
  // API: public
  export let readSelection = null;
  export let value = null;
  export let labelAsValue = false;
  export let valueAsObject = defaults.valueAsObject;
  export const focus = event => {
    refControl.focusControl(event);
  };
  export const getSelection = onlyValues => {
    if (!selectedOptions.length) return multiple ? [] : null;
    const _selection = selectedOptions.map(opt => onlyValues
      ? opt[labelAsValue ? currentLabelField : currentValueField] 
      : Object.assign({}, opt));
    return multiple ? _selection : _selection[0];
  };
  export const setSelection = (selection, triggerChangeEvent) => {
    handleValueUpdate(selection);
    triggerChangeEvent && emitChangeEvent();
  }
  // API: internal for CE
  export const clearByParent = doDisable => {
    clearSelection();
    emitChangeEvent();
    if (doDisable) {
      disabled = true;
      fetch = null;
    }
  }

  const dispatch = createEventDispatcher();

  const itemConfig = {
    optionsWithGroups: false,
    isOptionArray: options && options.length && typeof options[0] !== 'object',
    optionProps: [],
    valueField: valueField,
    labelField: labelField,
    labelAsValue: labelAsValue,
  };

  if (fetch && value && (!options || (options && options.length === 0))) {
    options = Array.isArray(value) ? value : [value];
  }
  let isInitialized = false;
  let refDropdown;
  let refControl;
  let ignoreHover = false;
  let dropdownActiveIndex = null;
  let currentValueField = valueField || fieldInit('value', options, itemConfig);
  let currentLabelField = labelField || fieldInit('label', options, itemConfig);
  let isIOS = false;
  let refSelectAction = validatorAction ? validatorAction.shift() : () => ({ destroy: () => {}});
  let refSelectActionParams = validatorAction || [];
  let refSelectElement = null;

  itemConfig.valueField = currentValueField;
  itemConfig.labelField = currentLabelField;
  itemConfig.optionProps = value && valueAsObject && (multiple && Array.isArray(value) ? value.length > 0 : true)
    ? getFilterProps(multiple ? value.slice(0,1).shift() : value)
    : [currentValueField, currentLabelField];

  /** ************************************ automatic init */
  multiple = name && !multiple ? name.endsWith('[]') : multiple;
  if (!createFilter) createFilter = defaultCreateFilter;

  /** ************************************ Context definition */
  const inputValue = writable('');
  const hasFocus = writable(false);
  const hasDropdownOpened = writable(false);

  let isFetchingData = false;
  let initFetchOnly = false;

  /** ************************************ remote source */
  let fetchUnsubscribe = null;
  $: createFetch(fetch);
  $: disabled && cancelXhr() && hasDropdownOpened.set(false);

  function cancelXhr() {
    if (isFetchingData) {
      xhr && ![0,4].includes(xhr.readyState) && xhr.abort();
      isFetchingData = false;
    }
    return true;
  }

  function createFetch(fetch) {
    if (fetchUnsubscribe) {
      fetchUnsubscribe();
      fetchUnsubscribe = null;
    }
    if (!fetch) return null;

    const fetchSource = typeof fetch === 'string' ? fetchRemote(fetch) : fetch;
    initFetchOnly = fetchMode === 'init' || (fetchMode === 'auto' && typeof fetch === 'string' && fetch.indexOf('[query]') === -1);
    const debouncedFetch = debounce(query => {
      if (query && !$inputValue.length) {
        isFetchingData = false;
        return;
      }
      fetchSource(query, fetchCallback)
        .then(data => {
          if (!Array.isArray(data)) {
            console.warn('[Svelecte]:Fetch - array expected, invalid property provided:', data);
            data = [];
          }
          options = data;
        })
        .catch(() => {
          options = []
        })
        .finally(() => {
          isFetchingData = false;
          $hasFocus && hasDropdownOpened.set(true);
          listMessage = _i18n.fetchEmpty;
          tick().then(() => dispatch('fetch', options));
        })
    }, 500);

    if (initFetchOnly) {
      if (typeof fetch === 'string' && fetch.indexOf('[parent]') !== -1) return null;
      isFetchingData = true;
      options = [];
      debouncedFetch(null);
      return null;
    }

    fetchUnsubscribe = inputValue.subscribe(value => {
      cancelXhr(); // cancel previous run
      if (!value) {
        if (isInitialized && fetchResetOnBlur) {
          options = [];
        }
        return;
      }
      if (value && value.length < minQuery) return;
      !initFetchOnly && hasDropdownOpened.set(false);
      isFetchingData = true;
      debouncedFetch(value);
    });

    return debouncedFetch;
  }

  /** ************************************ component logic */

  let prevValue = value;
  let _i18n = config.i18n;

  $: {
    if (i18n && typeof i18n === 'object') {
      _i18n = Object.assign({}, config.i18n, i18n);
    }
  }

  $: prevValue !== value && handleValueUpdate(value);

  /** - - - - - - - - - - STORE - - - - - - - - - - - - - -*/
  let selectedOptions = initSelection.call(options, value, valueAsObject, itemConfig);
  let selectedKeys = selectedOptions.reduce((set, opt) => { set.add(opt[currentValueField]); return set; }, new Set());
  let alreadyCreated = [''];
  $: flatItems = flatList(options, itemConfig);
  $: maxReached = max && selectedOptions.length === max
  $: availableItems = maxReached
    ? []
    : filterList(flatItems, disableSifter ? null : $inputValue, multiple ? selectedKeys : false, searchField, sortField, itemConfig);
  $: currentListLength = creatable && $inputValue ? availableItems.length : availableItems.length - 1;
  $: listIndex = indexList(availableItems, creatable && $inputValue, itemConfig);
  $: {
    if (dropdownActiveIndex === null) {
      dropdownActiveIndex = listIndex.first;
    } else if (dropdownActiveIndex > listIndex.last) {
      dropdownActiveIndex = listIndex.last;
    }
  }
  $: listMessage = maxReached
    ? _i18n.max(max)
    : ($inputValue.length && availableItems.length === 0 && minQuery <= 1
      ? _i18n.nomatch
      : (fetch
        ? (minQuery <= 1 
          ? (initFetchOnly ? _i18n.fetchInit : _i18n.fetchBefore)
          : _i18n.fetchQuery(minQuery, $inputValue.length)
        )
        : _i18n.empty
      )
    );
  $: itemRenderer = typeof renderer === 'function' ? renderer : (formatterList[renderer] || formatterList.default.bind({ label: currentLabelField}));
  $: {
    const _selectionArray = selectedOptions
      .map(opt => {
        const obj = {};
        itemConfig.optionProps.forEach(prop => obj[prop] = opt[prop]);
        return obj;
      });
    const _unifiedSelection = multiple
      ? _selectionArray
      : (_selectionArray.length ? _selectionArray[0] : null);
    const valueProp = itemConfig.labelAsValue ? currentLabelField : currentValueField;

    if (!valueAsObject) {
      prevValue = multiple
        ? _unifiedSelection.map(opt => opt[valueProp])
        : selectedOptions.length ? _unifiedSelection[valueProp] : null;
    } else {
      prevValue = _unifiedSelection;
    }
    value = prevValue;
    readSelection = _unifiedSelection;
  }
  let prevOptions = options;
  $: {
    if (isInitialized && prevOptions !== options && options.length) {
      const ivalue = fieldInit('value', options || null, itemConfig);
      const ilabel = fieldInit('label', options || null, itemConfig);
      if (!valueField && currentValueField !== ivalue) itemConfig.valueField = currentValueField = ivalue;
      if (!labelField && currentLabelField !== ilabel) itemConfig.labelField = currentLabelField = ilabel;
    }
  }
  $: {
    itemConfig.labelAsValue = labelAsValue;
  }

  /**
   * Dispatch change event on add options/remove selected items
   */
  function emitChangeEvent() {
    tick().then(() => {
      dispatch('change', readSelection);
      refSelectElement && refSelectElement.dispatchEvent(new Event('input')); // required for svelte-use-form
    });
  }

  /**
   * Dispatch createoption event when user creates a new entry (with 'creatable' feature)
   */
  function emitCreateEvent(createdOpt) {
      dispatch('createoption', createdOpt)
  }

  /**
   * update inner selection, when 'value' property is changed
   */
  function handleValueUpdate(passedVal) {
    clearSelection();
    if (passedVal) {
      let _selection = Array.isArray(passedVal) ? passedVal : [passedVal];
      if (!valueAsObject) {
        const valueProp = itemConfig.labelAsValue ? currentLabelField : currentValueField;
        _selection = _selection.reduce((res, val) => {
          const opt = flatItems.find(item => item[valueProp] == val);
          opt && res.push(opt);
          return res;
        }, []);
      }
      let success = _selection.every(selectOption) && (multiple
        ? passedVal.length === _selection.length
        : _selection.length > 0
      );
      if (!success) {
        // this is run only when invalid 'value' is provided, like out of option array
        console.warn('[Svelecte]: provided "value" property is invalid', passedVal);
        value = null;
        readSelection = null;
        return;
      }
      readSelection = Array.isArray(passedVal) ? _selection : _selection.shift();
    }
    prevValue = passedVal;
  }

  /** 
   * Add given option to selection pool
   * Check if not already selected or max item selection reached
   * 
   * @returns bool
   */
  function selectOption(opt) { 
    if (!opt || (multiple && maxReached)) return false;
    if (selectedKeys.has(opt[currentValueField])) return;

    if (typeof opt === 'string') {
      opt = createFilter(opt);
      if (alreadyCreated.includes(opt)) return;
      !fetch && alreadyCreated.push(opt);
      opt = {
        [currentValueField]: encodeURIComponent(opt),
        [currentLabelField]: `${creatablePrefix}${opt}`,
        '$created': true,
      };
      if (keepCreated) options = [...options, opt];
      emitCreateEvent(opt);
    }
    if (multiple) {
      selectedOptions.push(opt);
      selectedOptions = selectedOptions;
      selectedKeys.add(opt[currentValueField]);
    } else {
      selectedOptions = [opt];
      selectedKeys.clear();
      selectedKeys.add(opt[currentValueField]);
      dropdownActiveIndex = options.indexOf(opt);
    } 
    flatItems = flatItems;
    return true;
  }

  /**
   * Remove option/all options from selection pool
   */
  function deselectOption(opt) {
    if (opt.$created && backspacePressed && allowEditing) {
      alreadyCreated.splice(alreadyCreated.findIndex(o => o === opt[labelAsValue ? currentLabelField : currentValueField]), 1);
      alreadyCreated = alreadyCreated;
      if (keepCreated) {
        options.splice(options.findIndex(o => o === opt), 1);
        options = options;
      }
      $inputValue = opt[currentLabelField].replace(creatablePrefix, '');
    }
    const id = opt[currentValueField];
    selectedKeys.delete(id);
    selectedOptions.splice(selectedOptions.findIndex(o => o[currentValueField] == id), 1);
    selectedOptions = selectedOptions;
    flatItems = flatItems;
  }

  function clearSelection() {
    selectedKeys.clear();
    selectedOptions = [];
    flatItems = flatItems;
  }

  /**
   * Handle user action on select
   */
  function onSelect(event, opt) {
    opt = opt || event.detail;
    if (disabled || opt[disabledField] || opt.$isGroupHeader) return;

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

  /** keyboard related props */
  let backspacePressed = false;

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
    let ctrlKey = isIOS ? event.metaKey : event.ctrlKey;
    let isPageEvent = ['PageUp', 'PageDown'].includes(event.key);
    switch (event.key) {
      case 'End':
        if ($inputValue.length !== 0) return;
        dropdownActiveIndex = listIndex.first;
      case 'PageDown':
        if (isPageEvent) {
          const [wrap, item] = refDropdown.getDimensions();
          dropdownActiveIndex = Math.ceil((item * dropdownActiveIndex + wrap) / item);
        }
      case 'ArrowUp':
        event.preventDefault();
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
        dropdownActiveIndex = listIndex.prev(dropdownActiveIndex);
        tick().then(refDropdown.scrollIntoView);
        ignoreHover = true;
        break;
      case 'Home':
        if ($inputValue.length !== 0
          || ($inputValue.length === 0 && availableItems.length === 0)  // ref #26
        ) return;
        dropdownActiveIndex = listIndex.last;
      case 'PageUp':
        if (isPageEvent) {
          const [wrap, item] = refDropdown.getDimensions();
          dropdownActiveIndex = Math.floor((item * dropdownActiveIndex - wrap) / item);
        }
      case 'ArrowDown':
        event.preventDefault();
        if (!$hasDropdownOpened) {
          $hasDropdownOpened = true;
          return;
        }
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
        cancelXhr();
        $inputValue = '';
        break;
      case Tab:
      case 'Enter':
        if (!$hasDropdownOpened) return;
        let activeDropdownItem = !ctrlKey ? availableItems[dropdownActiveIndex] : null;
        if (creatable && $inputValue) {
          activeDropdownItem = !activeDropdownItem || ctrlKey
            ? $inputValue
            : activeDropdownItem
          ctrlKey = false;
        }
        !ctrlKey && activeDropdownItem && onSelect(null, activeDropdownItem);
        if (availableItems.length <= dropdownActiveIndex) {
          dropdownActiveIndex = currentListLength > 0 ? currentListLength : listIndex.first;
        }
        if (!activeDropdownItem && selectedOptions.length) {
          $hasDropdownOpened = false;
          return;
        }
        event.preventDefault(); // prevent form submit
        break;
      case ' ':
        if (!fetch && !$hasDropdownOpened) {
          $hasDropdownOpened = true;
          event.preventDefault();
        }
        break;
      case 'Backspace':
        backspacePressed = true;
      case 'Delete':
        if ($inputValue === '' && selectedOptions.length) {
          ctrlKey ? onDeselect({ /** no detail prop */}) : onDeselect(null, selectedOptions[selectedOptions.length - 1]);
          event.preventDefault();
        }
        backspacePressed = false;
      default:
        if (!ctrlKey && !['Tab', 'Shift'].includes(event.key) && !$hasDropdownOpened && !isFetchingData) {
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
      const pasted = event.clipboardData.getData('text/plain').replaceAll('/', '\/');
      const matches = pasted.match(rx);
      if (matches.length === 1 && pasted.indexOf(',') === -1) {
        $inputValue = matches.pop().trim();
      }
      matches.forEach(opt  => onSelect(null, opt.trim()));
    }
    // do nothing otherwise
  }

  function onDndEvent(e) {
    selectedOptions = e.detail.items;
  }

  /** ************************************ component lifecycle related */

  onMount(() => {
    isInitialized = true;
    if (creatable) {
      const valueProp = itemConfig.labelAsValue ? currentLabelField : currentValueField;
      alreadyCreated = [''].concat(flatItems.map(opt => opt[valueProp]).filter(opt => opt));
    }
    dropdownActiveIndex = listIndex.first;
    if (prevValue && !multiple) {
      const prop = labelAsValue ? currentLabelField : currentValueField;
      const selectedProp = valueAsObject ? prevValue[prop] : prevValue;
      dropdownActiveIndex = flatItems.findIndex(opt => opt[prop] === selectedProp);
    }
    isIOS = iOS();
  });
</script>

<div class={`svelecte ${className}`} class:is-disabled={disabled} {style}>
  <Control bind:this={refControl} renderer={itemRenderer}
    {disabled} {clearable} {searchable} {placeholder} {multiple} {inputId} {resetOnBlur} collapseSelection={collapseSelection ? config.collapseSelectionFn : null}
    inputValue={inputValue} hasFocus={hasFocus} hasDropdownOpened={hasDropdownOpened} selectedOptions={selectedOptions} {isFetchingData}
    {dndzone} {currentValueField}
    itemComponent={controlItem}
    on:deselect={onDeselect}
    on:keydown={onKeyDown}
    on:paste={onPaste}
    on:consider={onDndEvent}
    on:finalize={onDndEvent}
    on:blur
  >
    <div slot="icon" class="icon-slot"><slot name="icon"></slot></div>
  </Control>
  <Dropdown bind:this={refDropdown} renderer={itemRenderer} {disableHighlight} {creatable} {maxReached} {alreadyCreated}
    {virtualList} {vlHeight} {vlItemSize} lazyDropdown={virtualList || lazyDropdown}
    dropdownIndex={dropdownActiveIndex}
    items={availableItems} {listIndex}
    inputValue={createFilter($inputValue)} {hasDropdownOpened} {listMessage} {disabledField} createLabel={_i18n.createRowLabel}
    metaKey={isIOS ? '⌘' : 'Ctrl'}
    itemComponent={dropdownItem}
    on:select={onSelect}
    on:hover={onHover}
    on:createoption
    let:item={item}
  ></Dropdown>
  {#if name && !hasAnchor}
  <select name={name} {multiple} class="is-hidden" tabindex="-1" {required} {disabled} use:refSelectAction={refSelectActionParams} bind:this={refSelectElement}>
    {#each selectedOptions as opt}
    <option value={opt[currentValueField]} selected>{opt[currentLabelField]}</option>
    {/each}
  </select>
  {/if}
</div>

<style>
  .svelecte-control {
    --sv-bg: #fff;
    --sv-color: inherit;
    --sv-min-height: 38px;
    --sv-border-color: #ccc;
    --sv-border: 1px solid var(--sv-border-color);
    --sv-active-border: 1px solid #555;
    --sv-active-outline: none;
    --sv-disabled-bg: #f2f2f2;
    --sv-disabled-border-color: #e6e6e6;
    --sv-placeholder-color: #ccccc6;
    --sv-icon-color: #ccc;
    --sv-icon-hover: #999;
    --sv-loader-border: 3px solid #dbdbdb;
    --sv-dropdown-shadow: 0 6px 12px rgba(0,0,0,0.175);
    --sv-dropdown-height: 250px;
    --sv-item-selected-bg: #efefef;
    --sv-item-color: #333333;
    --sv-item-active-color: var(--sv-item-color);
    --sv-item-active-bg: #F2F5F8;
    --sv-item-btn-bg: var(--sv-item-selected-bg);
    --sv-item-btn-bg-hover: #ddd;
    --sv-item-btn-icon: var(--sv-item-color);
    --sv-highlight-bg: yellow;
    --sv-highlight-color: var(--sv-item-color);
  }
  .svelecte { position: relative; flex: 1 1 auto; color: var(--sv-color);}
  .svelecte.is-disabled { pointer-events: none; }
  .icon-slot { display: flex; }
  .is-hidden { opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px}

  /** globally available styles for control/dropdown Item components */    
  :global(.svelecte-control .has-multiSelection .sv-item) {
    background-color: var(--sv-item-selected-bg);
    margin: 2px 4px 2px 0;
  }
  :global(.svelecte-control .has-multiSelection .sv-item-content),
  :global(.svelecte-control .sv-dropdown-content .sv-item) {
    padding: 3px 3px 3px 6px;
  }
  :global(.svelecte-control .sv-item) {
    display: flex;
    min-width: 0px;
    box-sizing: border-box;
    border-radius: 2px;
    cursor: default;
  }
  :global(.svelecte-control .sv-item.is-disabled) { opacity: 0.5; cursor: not-allowed; }

  :global(.svelecte-control .sv-item-content) {
    color: var(--sv-item-color, var(--sv-color));
    text-overflow: ellipsis;
    white-space: nowrap;
    box-sizing: border-box;
    border-radius: 2px;
    overflow: hidden;
    width: 100%;
  }
  :global(.svelecte-control .sv-dd-item-active > .sv-item) {
    background-color: var(--sv-item-active-bg);
  }
  :global(.svelecte-control .sv-dd-item-active > .sv-item .sv-item-content) {
    color: var(--sv-item-active-color, var(--sv-item-color));
  }
  :global(.svelecte-control .highlight) {
    background-color: var(--sv-highlight-bg);
    color: var(--sv-highlight-color, var(--sv-color));
  }
</style>
