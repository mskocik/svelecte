<script context="module">
  import defaults from './settings.js';

  import { requestFactory, debounce } from './utils/fetch.js';
  import { onCreate_helper, escapeHtml } from './utils/helpers.js';

  defaults.requestFactory = requestFactory;

  /**
   * Due to adding `$selected` property to items and ability to render selected items in dropdown
   * second parameter is not related to option selection status, buth whether it's rendered in selection (true)
   * or in dropdown (false)
   *
   * @callback RenderFunction
   * @param {object} item
   * @param {boolean} [selectionSection]
   * @param {string} [inputValue]
   * @returns {string}
   */

  /**
   * @callback CreateFilterFunction
   * @param {string} inputValue
   * @returns {boolean}
   */

  /**
   * Resolver function for creating new items. Async functions are support
   *
   * @callback CreateHandlerFunction
   * @param {{
   *  inputValue: string,
   *  valueField: string,
   *  labelField: string,
   *  prefix: string
   * }} props
   * @returns {Promise<object>|object}
   */


  /**
   * @callback OptionResolverFunction
   * @param {any} options
   * @param {Set} selectedKeys
   * @returns {object[]}
   */

  const stringFormatters = {
    /**
     * @type {RenderFunction}
     */
    default: function(item) { return escapeHtml(item[this.label]); }
  };
  /**
   * Provide ability to add additional renderers in raw html string format
   *
   * @param {string|Record<string, RenderFunction>} name
   * @param {RenderFunction} rendererFn
   */
  export function addRenderer(name, rendererFn) {
    if (name instanceof Object) {
      for (let prop in name) {
        stringFormatters[prop] = name[prop];
      }
    } else {
      stringFormatters[name] = rendererFn
    }
  };

  export const config = defaults;
  export const TAB_SELECT_NAVIGATE = 'select-navigate';
</script>

<script>
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { flip } from 'svelte/animate';
  import TinyVirtualList from 'svelte-tiny-virtual-list';
  import { positionDropdown, scrollIntoView, virtualListDimensionsResolver } from './utils/dropdown.js';
  import { createConfig, ensureObjectArray, filterList, flatList, getFilterProps, initSelection, fieldInit } from './utils/list.js';
  import { iOS, android, highlightSearch } from './utils/helpers.js';
  import { bindItem } from './utils/actions.js';

  /** @type {string} */
  export let name = 'svelecte';
  /** @type {string} */
  export let inputId = '';
  /** @type {boolean} */
  export let required = false;
  /** @type {boolean} */
  export let disabled = false;
  /** @type {string} */
  export let anchor_element = null;
  /** @type {array} */
  export let options = [];
  /** @type {OptionResolverFunction} */
  export let optionResolver = null;
  /** @type {string} */
  export let valueField = defaults.valueField;
  /** @type {string} */
  export let labelField = defaults.labelField;
  /** @type {string} */
  export let groupLabelField = defaults.groupLabelField;
  /** @type {string} */
  export let groupItemsField = defaults.groupItemsField;
  /** @type {string} */
  export let disabledField = defaults.disabledField;
  /** @type {string} */
  export let placeholder = defaults.placeholder;// UI, UX
  /** @type {boolean} */
  export let searchable = defaults.searchable;
  /** @type {boolean} */
  export let clearable = defaults.clearable;
  /** @type {string|RenderFunction}*/
  export let renderer = null;
  /** @type {boolean} */
  export let disableHighlight = false;
  /** @type {boolean} */
  export let highlightFirstItem = defaults.highlightFirstItem;
  /** @type {boolean|'select-navigate'} */
  export let selectOnTab = defaults.selectOnTab;
  /** @type {boolean} */
  export let resetOnBlur = defaults.resetOnBlur;
  /** @type {boolean} */
  export let resetOnSelect = defaults.resetOnSelect;
  /** @type {string|boolean} */
  export let closeAfterSelect = defaults.closeAfterSelect;
  /** @type {function} */
  export let dndzone = () => ({ noop: true, destroy: () => {}});
  /** @type {array} wrapper array for passing 'svelte-use-form validator action and its params '*/
  export let validatorAction = [];
  /** @type {boolean} */
  export let strictMode = true;
  // multiple
  /** @type {boolean} */
  export let multiple = defaults.multiple;
  /** @type {number} */
  export let max = defaults.max;
  /** @type {'blur'|'always'|null} */
  export let collapseSelection = defaults.collapseSelection;
  /** @type {boolean|'auto'} */
  export let keepSelectionInList = defaults.keepSelectionInList;
  // creating
  /** @type {boolean} */
  export let creatable = defaults.creatable;
  /** @type {string} */
  export let creatablePrefix = defaults.creatablePrefix;
  /** @type {boolean} */
  export let allowEditing = defaults.allowEditing;
  /** @type {boolean} */
  export let keepCreated = defaults.keepCreated;
  export let delimiter = defaults.delimiter;
  /** @type {CreateFilterFunction} */
  export let createFilter = null;
  /** @type {CreateHandlerFunction} */
  export let createHandler = null;
  // remote
  /** @type {string?} */
  export let fetch = null;
  /** @type {object} user-provided optional properties for Request constructor*/
  export let fetchProps = {};
  /** @type {'auto'|'init'} */
  export let fetchMode = 'auto';
  /** @type {function} */
  export let fetchCallback = defaults.fetchCallback;
  /** @type {boolean} */
  export let fetchResetOnBlur = true;
  /** @type {number} */
  export let fetchDebounceTime = defaults.fetchDebounceTime;
  /** @type {number} */
  export let minQuery = defaults.minQuery;
  // performance
  /** @type {boolean} */
  export let lazyDropdown = defaults.lazyDropdown;
  // virtual list
  export let virtualList = defaults.virtualList;
  export let vlHeight = defaults.vlHeight;
  export let vlItemSize = defaults.vlItemSize;
  // sifter related
  /** @type {import('./utils/list.js').SearchProps|null} */
  export let searchProps = null;
  // styling
  let className = 'svelecte-control';
  export { className as class};
  // i18n override
  export let i18n = null;
  // API: public
  export let readSelection = null;
  /** @type {array|string|number|object|null} */
  export let value = null;
  /** @type {boolean} */
  export let valueAsObject = defaults.valueAsObject;
  /** @type {string|number|null|undefined} */
  export let parentValue = undefined;

  export function focus() {
    ref_input.focus();
  }
  // required for custom element
  export function setSelection(selection, triggerChangeEvent) {
    watch_value_change(selection);
    triggerChangeEvent && emitChangeEvent();
  }
  // required for custom element
  export function getSelection(onlyValues) {
    return onlyValues ? value : readSelection;
  }
  /**
   * Add ability to re-initialize fetch even when component is in query mode
   * @param {string|number|array} value
   */
  export function refetchWith(value) {
    fetch && fetch_runner({
      init: true,
      initValue: value
    });
  }

  const dispatch = createEventDispatcher();
  const DOM_ID = `sv-${name}-select`;

  /** ************************************ preparation */
  /* possibility to provide initial (selected) values in `fetch` mode **/
  if (fetch && value && valueAsObject && (!options || (options && options.length === 0))) {
    options = Array.isArray(value) ? value : [value];
  }
  if (!inputId) inputId = `${DOM_ID}-input`;
  multiple = name && !multiple ? name.endsWith('[]') : multiple;
  /** ************************************ END preparation */

  let is_mounted = false;
  // state-related
  let prev_value;
  let prev_options = optionResolver
    ? optionResolver(options, new Set())
    : ensureObjectArray(options, valueField, labelField);
  let prev_parent_value = undefined;
  let currentValueField = valueField || fieldInit('value', prev_options, groupItemsField);
  let currentLabelField = labelField || fieldInit('label', prev_options, groupItemsField);
  let selectedOptions = value !== null ? initSelection(prev_options, value, valueAsObject, groupItemsField, currentValueField) : [];
  /** @type {Set<string|number>} */
  const selectedKeys = selectedOptions.reduce((/** @type {Set} */ set,/** @type {object} */ opt) => {
    set.add(opt[currentValueField]);
    return set;
  }, new Set());
  let alreadyCreated = selectedOptions.filter(opt => opt.$created);
  // logic-related
  let is_focused = false;
  let focus_by_mouse = false;
  let is_tainted = false; // true after first focus
  let is_dropdown_opened = false;
  let dropdown_show = false;
  let dropdown_index = highlightFirstItem ? 0 : null;
  // dropdown-related
  let render_dropdown = !lazyDropdown;
  let dropdown_scroller = null;
  let virtuallist_automode = virtualList && vlHeight === null && vlItemSize === null;
  let vl_height = vlHeight;
  let vl_itemSize = vlItemSize;
  let meta_key;
  let hasEmptyList = false;
  // input-related
  /** @type {string} */
  let input_value = '';
  let disable_key_event_bubble = false;
  // utils
  /** @type {import('./settings.js').I18nObject} */
  let i18n_actual;
  let fetch_initOnly = fetchMode === 'init' || (fetch && fetch.includes('[query]') === false);
  let fetch_initValue = fetch_initOnly
    ? value
    : (fetch && options.length === 0 ? value : null);
  let isIOS = null;
  let isAndroid = null;
  let doCollapse = collapseSelection !== null;
  let isFetchingData = false;
  let fetch_performed = false;  // related to and reset in watch_listMessage
  let isCreating = false;
  let flipDurationMs = 100;
  let is_dragging = false;
  let is_fetch_dependent = false;
  // refs
  let /** @type {HTMLInputElement}  */  ref_input;
  let /** @type {HTMLElement}       */  ref_select_element;
  let /** @type {HTMLDivElement}    */  ref_container;
  let /** @type {HTMLDivElement}    */  ref_container_scroll;
  let /** svelte-tiny-virtual-list  */  ref_virtuallist;

  const itemConfig = createConfig(currentValueField, currentLabelField, groupLabelField, groupItemsField);

  // #region [reactivity]
  $: watch_item_props(valueField, labelField);
  $: maxReached = max && selectedOptions.length == max;     // == is intentional, if string is provided
  $: watch_options(options);
  $: options_flat = flatList(prev_options, itemConfig);
  $: watch_value_change(value);
  $: options_filtered = maxReached
    ? []
    : filterList(
      options_flat,
      input_value,
      resolveExcludedValue(input_value),
      itemConfig,
      searchProps || {}
    );
  // only initial setter
  $: highlightFirstItem && setDropdownIndex(0, { asc: true });
  $: options_filtered.length <= dropdown_index && setDropdownIndex(0, { asc: !creatable, desc: creatable });

  $: if (!createFilter) createFilter = inputVal => alreadyCreated.includes(inputVal);
  $: if (!createHandler) createHandler = ({ inputValue, labelField, valueField, prefix }) => ({
    [valueField]: inputValue,
    [labelField]: `${prefix}${inputValue}`
  });

  // watch functions
  $: watch_i18n(i18n);
  $: watch_parentValue(parentValue);
  $: watch_selectedOptions(selectedOptions);

  /**
   * @type {RenderFunction}
   */
  $: itemRenderer = typeof renderer === 'function'
    ? renderer
    : (stringFormatters[renderer] || stringFormatters.default.bind({ label: currentLabelField}));

  /** ************************************ dropdown-specific */

  $: vl_listHeight = Math.min(vl_height, Array.isArray(vl_itemSize)
    ? vl_itemSize.reduce((res, num) => {
      res+= num;
      return res;
    }, 0)
    : options_filtered.length * vl_itemSize
  );
  $: virtuallist_automode && watch_options_virtualList(options_filtered);

  $: watch_is_dropdown_opened(is_dropdown_opened);

  /** ************************************ input-specific */

  /** @type {'text'|'none'}*/
  $: input_mode = searchable ? 'text' : 'none';
  /** @type {string} */
  $: placeholder_active = selectedOptions.length ? '' : placeholder;
  /** @type {'enter'} */
  $: enter_hint = selectedOptions.length > 0 && multiple === false ? null : 'enter';

  // aria related
  $: aria_selection = i18n_actual.aria_selected(selectedOptions.map(o => o[currentLabelField]));
  $: aria_context = options_filtered.length && dropdown_index
    ? (
      is_dropdown_opened
        ? i18n_actual.aria_listActive(options_filtered[dropdown_index], currentLabelField, options_filtered.length)
        : i18n_actual.aria_inputFocused()
    )
    : (input_value.length
      ? i18n_actual.nomatch
      : i18n_actual.empty
    );


  // #endregion

  // #region [watchers]

  /**
   * Set current*Field reiliably when props change
   *
   * @param {string?} valueProp
   * @param {string?} labelProp
   */
  function watch_item_props(valueProp, labelProp) {
    if (!is_mounted) return;

    if (valueProp) {
      itemConfig.valueField = currentValueField = valueProp;
      // check note in watch_options()
      selectedKeys.size > 0 && clearSelection();
    }
    if (labelProp) {
      itemConfig.labelField = currentLabelField = labelProp;
      if (renderer === null || renderer === 'default') {
        itemRenderer = stringFormatters.default.bind({ label: currentLabelField });
      }
    }
  }

  /**
   * @param {array} opts
   */
  function watch_options(opts) {
    if (!is_mounted) return;

    if (prev_options !== opts) {
      // make sure, it's an array
      opts = ensureObjectArray(opts, currentValueField, currentLabelField);

      // do these automatic re-adjustments only when props are not specified
      if (!valueField) {
        const ivalue = fieldInit('value', opts || null, groupItemsField);
        if (!valueField && currentValueField !== ivalue) {
          itemConfig.valueField = currentValueField = ivalue;
          /**
           * NOTE: selection is RESET when non-matching is detected (selection would be messed up anyway)
           */
          selectedKeys.size > 0 && clearSelection();
        }
      }
      if (!labelField) {
        const ilabel = fieldInit('label', opts || null, groupItemsField);
        if (!labelField && currentLabelField !== ilabel) {
          itemConfig.labelField = ilabel;
          currentLabelField = ilabel;
          if (renderer === null || renderer === 'default') {
            itemRenderer = stringFormatters.default.bind({ label: currentLabelField });
          }
        };
      }
    }
    options = opts;
    // continue to update options_flat
    prev_options = optionResolver
      ? optionResolver(opts, selectedKeys)
      : opts;
  }

  /**
   * @typedef {object} ValueWatcherOptions
   * @property {boolean} [skipEqualityCheck]
   *
   * @param {any} passedVal
   * @param {ValueWatcherOptions} [opts]
   */
  function watch_value_change(passedVal, opts) {
    if (prev_value === passedVal && !opts?.skipEqualityCheck) return;
    clearSelection();
    if (passedVal) {
      if ((multiple && !Array.isArray(passedVal)) || (!multiple && Array.isArray(passedVal))) {
        console.warn(`Passed 'value' property should ${ multiple ? 'be' : 'NOT be'} an array`);
      }
      // wait for fetch to be resolved
      if (fetch_initValue) return;

      const arrValue = Array.isArray(passedVal) ? passedVal : [passedVal];
      const _selection = arrValue.reduce((res, val) => {
        // skip options scan when in valueAsObject non-strict mode
        if (valueAsObject && (!strictMode || (creatable && val.$created))) {
          res.push(val);
          return res;
        }
        const opt = options_flat.find(item => item[currentValueField] == val);
        if (opt) {
          res.push(opt);
        } else {
          !strictMode && res.push(
            // only sync (or default) handler is allowed for code simplicty
            createHandler
              ? createHandler({
                inputValue: val,
                valueField: currentValueField,
                labelField: currentLabelField,
                prefix: creatablePrefix
              })
              : {
                [currentValueField]: val,
                [currentLabelField]: val
              }
          );
        }
        return res;
      }, []);

      let success = _selection.every(selectOption) && (multiple
        ? arrValue.length === _selection.length
        : _selection.length > 0
      );

      if (!success) {
        // this is run only when invalid 'value' is provided, like out of option array
        console.warn('[Svelecte]: provided "value" property is invalid', passedVal);
        value = multiple ? [] : null;
        readSelection = value;
        dispatch('invalidValue', passedVal);
        return;
      }
      readSelection = Array.isArray(passedVal) ? _selection : _selection.shift();
    }
    prev_value = passedVal;
  }

  /**
   * Reflect bound `value` to the outside word
   * @param {array} newSelection
   */
  function watch_selectedOptions(newSelection) {
    if (is_dragging) return;
    const selection_formatted = newSelection
      .map(opt => {
        const { '$disabled': unused1,  '$isGroupItem': unused2, ...obj } = opt;
        return obj;
      });
    const unified_selection = multiple
      ? selection_formatted
      : (selection_formatted.length ? selection_formatted[0] : null);

    if (!valueAsObject) {
      prev_value = multiple
        ? unified_selection.map(opt => opt[currentValueField])
        : selectedOptions.length ? unified_selection[currentValueField] : null;
    } else {
      prev_value = unified_selection;
    }
    value = prev_value;
    readSelection = unified_selection;
  }

  /**
   * @param {any} newParentValue
   */
  function watch_parentValue(newParentValue) {
    // check for undefined is required because parent have empty value as well and I want to avoid 2 props just for this
    if ((newParentValue !== undefined && prev_parent_value !== newParentValue)
      || (newParentValue === undefined && prev_parent_value !== newParentValue)
    ) {
      const disabled_to_set = newParentValue === undefined
        ? false
        : (!newParentValue
          ? true
          : false
        )
      clearSelection();
      prev_value = multiple ? [] : null;
      disabled = disabled_to_set;
    }
    prev_parent_value = newParentValue;
    is_fetch_dependent = newParentValue !== undefined;
  }

  /**
   * @param {array[]} [_watchTrigger]
   */
  function watch_options_virtualList(_watchTrigger) {
    if (!is_mounted || !render_dropdown) return;
    // required when changing item list 'on-the-fly' for VL
    // if (hasEmptyList) dropdown_index = null;
    tick()
      .then(() => {
        if (!ref_virtuallist) return;
        const dimensions = virtualListDimensionsResolver(ref_virtuallist, ref_container_scroll, options_filtered);
        vl_itemSize = dimensions.size;
        vl_height = dimensions.height;
      })
      .then(() => positionDropdown(is_dropdown_opened, ref_container_scroll, render_dropdown));
  }

  function watch_is_dropdown_opened(val) {
    if (!is_mounted) return;
    if (val && !focus_by_mouse) focus_by_mouse = true;

    if (!render_dropdown && val) render_dropdown = true;
    tick()
      .then(() => {
        virtuallist_automode && watch_options_virtualList();
      })
      .then(() => {
        positionDropdown(val, ref_container_scroll, true);
        if (val) {
          // ensure proper dropdown index
          // do not respect highlightFirstItem here
          if (highlightFirstItem && (selectedOptions.length === 0 || multiple)) setDropdownIndex(0, { asc: true});
          if (!multiple && selectedOptions.length) {
              // ensure item is set
            dropdown_index = options_flat.findIndex(opt => opt === selectedOptions[0]);
          }
          scrollIntoView({ container: ref_container, scrollContainer: ref_container_scroll, virtualList, center: false }, dropdown_index);
        }
        tick().then(() => dropdown_show = val);
      });
    if (!dropdown_scroller) dropdown_scroller = () => positionDropdown(val, ref_container_scroll, true);
    // bind/unbind scroll listener
    document[val ? 'addEventListener' : 'removeEventListener']('scroll', dropdown_scroller, { passive: true });
  }

  function watch_i18n(obj) {
    i18n_actual = Object.assign({}, config.i18n, obj || {});
  }

  /**
   * TODO: add option for 'noOption_creatable'
   *
   * @param maxReached
   * @param options_filtered
   * @param input_value
   * @param minQuery
   * @param fetch
   * @param isFetchingData
   */
  function watch_listMessage(maxReached, options_filtered, input_value, minQuery, fetch, isFetchingData) {
    let val = i18n_actual.empty;
    if (maxReached) {
      val = i18n_actual.max(max);
    } else {
      // fetch mode
      if (fetch) {
        if (fetch_performed && options_filtered.length === 0) {
          listMessage = fetch_initOnly
            ? i18n_actual.empty
            : i18n_actual.fetchEmpty;
          fetch_performed = false;
          return;
        }
        if (isFetchingData) {
          val = i18n_actual.fetchInit;
        } else {
          if (fetch_initOnly) {
            listMessage = val;
            return;
          }
          if (minQuery <= 1) {
            val = i18n_actual.fetchBefore;
          } else {
            val = i18n_actual.fetchQuery(minQuery, input_value.length);
          }
        }
      // normal mode
      } else {
        if (input_value.length && options_filtered.length === 0) {
          val = i18n_actual.nomatch;
        }
      }
    }

    listMessage = val;
  }

  // #endregion

  // #region [event-emitters]

  /**
   * Dispatch change event on add options/remove selected items
   */
   function emitChangeEvent() {
    tick().then(() => {
      dispatch('change', readSelection);
      if (ref_select_element) {
        ref_select_element.dispatchEvent(new Event('input'));   // required for svelte-use-form
        ref_select_element.dispatchEvent(new Event('change'));  // typically you expect change event to be fired
      }
    });
  }

  /**
   * Dispatch createoption event when user creates a new entry (with 'creatable' feature)
   */
  function emitCreateEvent(createdOpt) {
      dispatch('createoption', createdOpt)
  }
  // #endregion

  // #region [interactivity]

  /**
   * Handle user action on select
   */
   function onSelect(event, opt) {
    opt = opt || event.detail;
    if (disabled || opt[disabledField] || opt.$isGroupHeader) return;
    if (!opt || (multiple && maxReached)) return false;
    if (selectedKeys.has(opt[currentValueField])) return onDeselect(null, opt);

    // creatable branch
    if (typeof opt === 'string') {
      if (!creatable) return;
      opt = onCreate_helper(opt);
      if (alreadyCreated.includes(opt) || selectedKeys.has(opt)) return;

      isCreating = true;
      Promise.resolve(createHandler.call(null, {
        inputValue: opt,
        valueField: currentValueField,
        labelField: currentLabelField,
        prefix: creatablePrefix
      }))
        .then(newObj => {
          isCreating = false;
          !fetch && alreadyCreated.push(opt);
          newObj.$created = true;  // internal setter
          if (keepCreated) prev_options = [...prev_options, newObj];
          emitCreateEvent(newObj);
          selectOption(newObj);
          onSelectTeardown();
          emitChangeEvent();
        })
        .catch(e => {
          dispatch('createFail', {
            input: opt,
            error: e
          });
        });

      return;
    }

    selectOption(opt);
    onSelectTeardown();
    emitChangeEvent();
  }

  function onSelectTeardown() {
    if ((multiple && resetOnSelect) || !multiple) input_value = '';
    if (closeAfterSelect === true || (closeAfterSelect === 'auto' && !multiple)) {
      is_dropdown_opened = false;
    }
    if (selectedOptions.length == max) {
      dropdown_index = 0;
    }
  }

  /**
   * Add given option to selection pool
   * Check if not already selected or max item selection reached
   *
   * @returns bool
   */
  function selectOption(opt) {
    opt.$selected = true;
    if (multiple) {
      selectedOptions.push(opt);
      selectedOptions = selectedOptions;
      selectedKeys.add(opt[currentValueField]);
    } else {
      const previousSelected = selectedOptions.shift();
      if (previousSelected) previousSelected.$selected = false;
      selectedOptions = [opt];
      selectedKeys.clear();
      selectedKeys.add(opt[currentValueField]);
      tick().then(() => {
        dropdown_index = options_flat.indexOf(opt);
      });
    }

    if (optionResolver) {
      prev_options = optionResolver(options, selectedKeys)
      return true;
    }

    options_flat = options_flat;
    return true;
  }

  /**
   *
   * @param {object} event
   * @param {object} [opt]
   * @param {boolean} [backspacePressed]
   */
  function onDeselect(event = {}, opt = null, backspacePressed) {
    if (disabled) return;
    opt = opt || event.detail;
    if (opt) {
      deselectOption(opt, backspacePressed);
      /**
       * Condition for keepSelectionInList is important, othwise dropdown jump back to start.
       * It's required only for multiselect with default 'closeAfterSelect' setting.
       */
      keepSelectionInList !== true && tick().then(() => scrollIntoView({ scrollContainer: ref_container_scroll, container: ref_container, virtualList, center: false}, dropdown_index));
    } else {  // apply for 'x' when clearable:true || ctrl+backspace || ctrl+delete
      clearSelection();
    }
    emitChangeEvent();
  }

  /**
   * Remove option/all options from selection pool
   *
   * @param {object} opt,
   * @param {boolean} [backspacePressed]
   */
   function deselectOption(opt, backspacePressed) {
    if (opt.$created) {
      alreadyCreated.splice(alreadyCreated.findIndex(o => o === opt[currentValueField]), 1);
      alreadyCreated = alreadyCreated;
      if (keepCreated) {
        const idx = prev_options.findIndex(o => o[currentValueField] === opt[currentValueField]);
        idx !== -1 && prev_options.splice(idx, 1);
        prev_options = prev_options;
      }
      if (backspacePressed && allowEditing) {
        input_value = opt[currentLabelField].replace(creatablePrefix, '');
      }
    }
    opt.$selected = false;
    const id = opt[currentValueField];
    selectedKeys.delete(id);
    selectedOptions.splice(selectedOptions.findIndex(o => o[currentValueField] == id), 1);
    selectedOptions = selectedOptions;

    if (optionResolver) {
      prev_options = optionResolver(options, selectedKeys);
      return;
    }

    options_flat = options_flat;
  }

  function clearSelection() {
    if (selectedKeys.size === 0) return;
    selectedKeys.clear();

    selectedOptions = selectedOptions.reduce((_, opt) => {
      opt.$selected = false;
      return [];
    }, []);
    if (!keepCreated) alreadyCreated = [];  // ref #198
    maxReached = false;       // reset forcefully, related to #145
    if (input_value) input_value = '';

    if (optionResolver) {
      prev_options = optionResolver(options, selectedKeys);
      return;
    }

    options_flat = options_flat;
  }

  function onCreate(_event) {
    if (alreadyCreated.includes(input_value)) return;

    onSelect(null, input_value);
  }

  /**
   * @param {KeyboardEvent} event
   *
   * //NOTE: previously Svelecte.svelte/onKeyDown
   */
  function processKeyDown(event) {
    // DEPRECATED check this?
    // event = event.detail; // from dispatched event

    if (creatable && delimiter.indexOf(event.key) > -1) {
      input_value.length > 0 && onSelect(null, input_value); // prevent creating item with delimiter itself
      event.preventDefault();
      return;
    }
    const Tab = selectOnTab && is_dropdown_opened && !event.shiftKey ? 'Tab' : 'No-tab';
    let ctrlKey = isIOS ? event.metaKey : event.ctrlKey;
    let isPageEvent = ['PageUp', 'PageDown'].includes(event.key);
    let backspacePressed = false;
    let supressIndexMove = false;
    switch (event.key) {
      case 'End':
        if (input_value.length !== 0) return;
        setDropdownIndex(options_filtered.length, { desc: true });
      case 'PageDown':
        if (isPageEvent) {
          const [wrap, item] = get_dropdown_dimensions();
          dropdown_index = Math.min(
            Math.ceil((item * dropdown_index + wrap) / item), // can be more than max, therefore Math.min
            options_filtered.length
          );
        }
      case 'ArrowUp':
        event.preventDefault();
        if (!is_dropdown_opened) {
          is_dropdown_opened = true;
          return;
        }
        setDropdownIndex(dropdown_index - 1, { desc: true });
        tick().then(() => scrollIntoView({ scrollContainer: ref_container_scroll, container: ref_container, virtualList, center: false}, dropdown_index));
        break;
      case 'Home':
        supressIndexMove = true;
        if (input_value.length !== 0
          || (input_value.length === 0 && options_filtered.length === 0)  // ref #26
        ) return;
        setDropdownIndex(0, { asc: true });
      case 'PageUp':
        if (isPageEvent) {
          const [wrap, item] = get_dropdown_dimensions();
          dropdown_index = Math.floor((item * dropdown_index - wrap) / item);
        }
      case 'ArrowDown':
        event.preventDefault();
        if (!is_dropdown_opened) {
          is_dropdown_opened = true;
          return;
        }
        !supressIndexMove && setDropdownIndex(dropdown_index + 1, { asc: true });
        tick().then(() => scrollIntoView({ scrollContainer: ref_container_scroll, container: ref_container, virtualList, center: false}, dropdown_index));
        break;
      case 'Escape':
        if (is_dropdown_opened) { // prevent ESC bubble in this case (interfering with modal closing etc. (bootstrap))
          event.preventDefault();
          event.stopPropagation();
        }
        if (!input_value) {
          is_dropdown_opened = false;
        }
        input_value = '';
        break;
      case Tab:
      case 'Enter':
        if (!is_dropdown_opened) {
          event.key !== Tab && dispatch('enterKey', event); // ref #125
          return;
        }
        let activeDropdownItem = !ctrlKey ? options_filtered[dropdown_index] : null;
        if (creatable && input_value) {
          activeDropdownItem = !activeDropdownItem || ctrlKey
            ? onCreate_helper(input_value)
            : activeDropdownItem
          ctrlKey = false;
        }
        !ctrlKey && activeDropdownItem && onSelect(null, activeDropdownItem);
        if (options_filtered.length <= dropdown_index) {
          setDropdownIndex(options_filtered.length - 1);
        }
        if (!activeDropdownItem && selectedOptions.length) {
          is_dropdown_opened = false;
          event.key !== Tab && dispatch('enterKey', event); // ref #125
          return;
        }
        (event.key !== Tab || (event.key === Tab && selectOnTab !== TAB_SELECT_NAVIGATE)) && event.preventDefault(); // prevent form submit
        break;
      case ' ':
        if (!fetch && !is_dropdown_opened) {
          is_dropdown_opened = true;
          event.preventDefault();
        }
        break;
      case 'Backspace':
        if (collapseSelection === 'always') return;
        backspacePressed = true;
      case 'Delete':
        if (input_value === '' && selectedOptions.length) {
          ctrlKey ? onDeselect({ /** no detail prop */}) : onDeselect(null, selectedOptions[selectedOptions.length - 1], backspacePressed);
          event.preventDefault();
        }
      default:
        if (!ctrlKey && !['Tab', 'Shift'].includes(event.key) && !is_dropdown_opened && !isFetchingData) {
          is_dropdown_opened = true;
        }
    }
  }

  /**
   * Prevent focus change
   * @param {MouseEvent} event
   */
  function onMouseDown(event) {
    event.preventDefault();
  }

  /**
   * Single click handler. Unified for dropdown items, for selected items and 'x' clear button
   *
   * @param {MouseEvent & { currentTarget: EventTarget & HTMLDivElement} & { target: HTMLElement }} event
   */
  function onClick(event) {
    if (disabled) return;
    /** @type {HTMLElement & import('./utils/actions.js').ExtButton} */
    const target = event.target.closest('[data-action]');

    if (!focus_by_mouse) focus_by_mouse = true;
    // allow escaping click handler
    if (target?.dataset.action === 'default') return;

    event.preventDefault();
    /** @type {HTMLElement} */
    const dropdown_item = event.target.closest('[data-pos]');

    // handle click on selection row (general focus & toggle dropdown event)
    if (!target && !dropdown_item) {
      return focusControl(event.target);
    }
    const action = target?.dataset.action || 'select';

    // dropdown items has no data-action set
    switch(action) {
      case 'deselect':
        let bound_item = target.bound_item;
        // otherwise try to get item id from data-id prop
        if (!bound_item) {
          const dataId = target.dataset.id;
          bound_item = selectedOptions.filter(o => o[currentValueField] == dataId).shift();
        }
        onDeselect({}, bound_item);
        bound_item && !is_focused && ref_input.focus();
        break;
      case 'select':
        const opt_position = parseInt(dropdown_item.dataset.pos);
        onSelect(null, options_filtered[opt_position]);
        break;
      case 'toggle':
        is_dropdown_opened = !is_dropdown_opened;
        break;
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
   function onKeyDown(e) {
    if (android() && !enter_hint && e.key === 'Enter') return true;

    disable_key_event_bubble = ['Enter', 'Escape'].includes(e.key) && is_dropdown_opened;
    processKeyDown(e);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyUp(e) {
    if (disable_key_event_bubble) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
    disable_key_event_bubble = false;
  }

  /**
   * Required for mobile single select to work properly
   */
  function onInput() {
    if (selectedOptions.length === 1 && !multiple) {
      // input_value = '';
    }
  }

  function onFocus() {
    is_focused = true;
    is_dropdown_opened = focus_by_mouse;
    if (!is_tainted) is_tainted = true;
    collapseSelection === 'blur' && !is_dragging && setTimeout(() => {
      doCollapse = false;
    }, 100);
    dispatch('focus', ref_input);
  }

  function onBlur() {
    is_focused = false;
    is_dropdown_opened = false;
    focus_by_mouse = false;
    if (resetOnBlur) {
      input_value = '';
    } else {
      fetch_controller && !fetch_initOnly && fetch_controller.abort();
    }
    collapseSelection === 'blur' && !is_dragging && setTimeout(() => {
      doCollapse = true;
    }, 100);
    dispatch('blur', ref_input);
  }

  /**
   * Enable create items by pasting
   */
   function onPaste(event) {
    if (creatable) {
      event.preventDefault();
      const rx = new RegExp('([^' + delimiter + '\\n]+)', 'g');
      const pasted = event.clipboardData
        .getData('text/plain')
          .replace(/\//g, '\/')
          .replace(/\t/g, ' ');
      const matches = pasted.match(rx);
      if (matches.length === 1 && pasted.indexOf(',') === -1) {
        input_value = matches.pop().trim();
      }
      matches.forEach(opt  => onSelect(null, opt.trim()));
    }
    // do nothing otherwise
  }

  function onDndEvent(e) {
    is_dragging = e.type === 'consider';
    selectedOptions = e.detail.items;
    if (!is_dragging) {
      emitChangeEvent();
      if (collapseSelection === 'blur') setTimeout(() => {
        doCollapse = true;
      }, 200);
    }
  }

  // #endregion

  // #region [fetch]

  /** @type {AbortController} */
  let fetch_controller;

  /** @type {import('./utils/fetch.js').RequestFactoryFn} */
  let fetch_factory;

  $: trigger_fetch(input_value);
  $: is_mounted && watch_fetch_init(fetch, parentValue);

  let listMessage;
  $: watch_listMessage(maxReached, options_filtered, input_value, minQuery, isFetchingData);

  /**
   *
   * @param {string?} fetch
   * @param {string|number|null|undefined} _parentValue
   */
  function watch_fetch_init(fetch, _parentValue) {
    if (!fetch) {
      fetch_factory = null;
      return;
    }

    fetch_factory = defaults.requestFactory;
    (fetch_initOnly || fetch_initValue) && fetch_runner({init: true}); // skip debounce on init
  }

  function trigger_fetch(inputValue) {
    if (fetch_initOnly) return;
    if (fetch_factory) {
      if (fetch_controller && fetch_controller.signal.aborted === false) fetch_controller.abort();
      debounce(fetch_runner, fetchDebounceTime)();
    }
  }
  /**
   * @typedef {object} FetchOptions
   * @property {boolean} [init=false]
   * @property {any} [initValue]
   *
   * @param {FetchOptions} opts
   */
  function fetch_runner(opts = {}) {
    if ((opts.init !== true && !input_value.length) || (is_fetch_dependent && !parentValue)) {
      isFetchingData = false;
      if (fetchResetOnBlur) {
        fetch_performed = false;
        prev_options = optionResolver ? optionResolver(options, selectedKeys) : [];
      }
      return;
    }

    if (input_value && input_value.length < minQuery) return;

    // update fetchInitValue when fetch is changed, but we are in 'init' mode, ref #113
    if (fetch_initOnly && prev_value) fetch_initValue = prev_value;

    // reset found items
    if (fetchResetOnBlur) prev_options = [];

    const initial = fetch_initValue || opts.initValue;

    isFetchingData = true;
    fetch_controller = new AbortController();
    const request = fetch_factory(input_value, { parentValue, url: fetch, initial, controller: fetch_controller }, fetchProps
    );
    window.fetch(request)
      .then(resp => resp.json())
      // success
      .then((/** @type {object} */ json) => {
        // sveltekit returns error property
        if (!Array.isArray(json) && json?.error) dispatch('fetchError', json.error);
        return Promise.resolve(fetchCallback ? fetchCallback(json) : (json.data || json.items || json.options || json))
          .then(data => {
            if (!Array.isArray(data)) {
              console.warn('[Svelecte]:Fetch - array expected, invalid property provided:', data);
              data = [];
            }
            prev_options = data;
            dispatch('fetch', prev_options);

            tick().then(() => {
              if (initial) {
                fetch_initValue = null; // always reset
                watch_value_change(initial, { skipEqualityCheck: true });
              }
            })
          })
      })
      // error
      .catch(e => {
        prev_options = [];
        dispatch('fetchError', e);
        console.warn('[Svelecte] Unexpected Fetch Error', e);
      })
      // teardown
      .finally(() => {
        fetch_controller = null;
        fetch_performed = true;
        isFetchingData = false;
        if (is_focused) is_dropdown_opened = true;

      });
  }

  // #endregion

  // #region [helper functions]

  /**
   * Resolve whether already selected items should be shown or not in the dropdown.
   *
   * @param {string} inputValue
   */
  function resolveExcludedValue(inputValue) {
    if (!keepSelectionInList) return selectedKeys;
    if (keepSelectionInList === true) return inputValue ? selectedKeys : null;
    // 'auto' otherwise
    return inputValue
      ? selectedKeys
      : (multiple
        ? selectedKeys
        : null
      );
  }

  /**
   * @typedef {object} DirectionSettings
   * @property {boolean} [asc]
   * @property {boolean} [desc]
   *
   * @param {number} pos
   * @param {DirectionSettings} direction
   */
   function setDropdownIndex(pos, direction = {}, limit = 0) {
    const dropdown_list_length = creatable
      ? options_filtered.length + 1
      : options_filtered.length;
    if (limit >= 2) return;
    if (pos < 0) pos = direction.desc
      ? dropdown_list_length - 1
      : 0;
    if ((dropdown_index === null && highlightFirstItem) || pos >= dropdown_list_length) {
      pos = 0;
    }
    // if pos represents group header, move to next one
    if (options_filtered[pos]?.$isGroupHeader) {
      setDropdownIndex(direction.asc
        ? pos + 1
        : pos - 1, direction, ++limit
      );
      return;
    }
    dropdown_index = pos;
  }

  /**
   * FUTURE: take into account searchable to keep inputmode=none
   *
   * @param {HTMLElement} target
   */
  function focusControl(target) {
    if (disabled) return;
    if (!is_focused) {
      ref_input.focus();
      return;
    }
    if (target.tagName === 'INPUT' && input_value) {
      return;
    }

    is_dropdown_opened = !is_dropdown_opened;
  }

  /**
   * @returns {number[]}
   */
  function get_dropdown_dimensions() {
    if (virtualList) {
      return [
        ref_container_scroll.offsetHeight,
        vl_itemSize
      ];
    }
    return [
      ref_container_scroll.offsetHeight,
      // @ts-ignore
      ref_container.firstElementChild.offsetHeight
    ];
  }

  //#endregion

  const svelte_use_form_validator = validatorAction.length
    ? validatorAction.shift()
    : () => {}; // noop

  onMount(() => {
    is_mounted = true;
    isAndroid = android();
    isIOS = iOS();
    meta_key = isIOS ? '⌘' : 'Ctrl';
    if (anchor_element) {
      ref_select_element = document.getElementById(anchor_element);
      ref_select_element.className = 'sv-hidden-element';
      ref_select_element.innerHTML = '';
      ref_select_element.tabIndex = -1;
      selectedKeys.forEach(k => {
        ref_select_element.insertAdjacentHTML('beforeend', `<option value=${k} selected>${k}</option>`);
      });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) flipDurationMs = 0;
  });
</script>

<div class={`svelecte ${className}`}
  class:is-required={required}
  class:is-empty={selectedOptions.length === 0}
  class:is-invalid={required && selectedOptions.length === 0}
  class:is-tainted={is_tainted}
  class:is-valid={required ? selectedOptions.length > 0 : true}
  class:is-focused={is_focused}
  class:is-open={is_dropdown_opened}
  class:is-disabled={disabled}
  role="none"
>
  <span aria-live="polite" aria-atomic="false" aria-relevant="additions text" class="a11y-text">
    {#if is_focused}
        <span id="aria-selection">{aria_selection}</span>
        <span id="aria-context">{aria_context}</span>
    {/if}
  </span>
  {#if name && !anchor_element}
  <select {name} {required} {multiple} {disabled} size="1" class="sv-hidden-element" id={DOM_ID} tabindex="-1" aria-hidden="true"
    bind:this={ref_select_element}
    use:svelte_use_form_validator={validatorAction}
  >
    {#each selectedOptions as opt (opt[currentValueField])}
    <option value={opt[currentValueField]} selected></option>
    {/each}
  </select>
  {/if}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="sv-control" on:mousedown={onMouseDown} on:click={onClick}
  >
    <slot name="icon"></slot>
    <!-- #region selection & input -->
    <div class="sv-control--selection" class:is-single={multiple === false} class:has-items={selectedOptions.length > 0} class:has-input={input_value.length}
      use:dndzone={{items: selectedOptions, flipDurationMs, type: inputId, dragDisabled: doCollapse }}
      on:consider={onDndEvent}
      on:finalize={onDndEvent}
    >
      {#if selectedOptions.length }
      {#if multiple && doCollapse}
        <slot name="collapsedSelection" {selectedOptions} i18n={i18n_actual}>{i18n_actual.collapsedSelection(selectedOptions.length)}</slot>
      {:else}
        <slot name="selection" {selectedOptions} {bindItem}>
          {#each selectedOptions as opt (opt[currentValueField])}
          <div class="sv-item--container" animate:flip={{duration: flipDurationMs }}
            on:mousedown|preventDefault
          >
            <div class="sv-item--wrap" class:is-multi={multiple}>
              <div class="sv-item--content">{@html itemRenderer(opt, true)}</div>
            </div>
            {#if multiple}
            <button class="sv-item--btn" tabindex="-1" type="button"
              data-action="deselect"
              use:bindItem={opt}
            >
              <svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
              </svg>
            </button>
            {/if}
          </div>
          {/each}
        </slot>
        {/if}
      {/if}

      <!-- #regions INPUT -->
      <span class="sv-input--sizer" data-value={input_value || placeholder_active}>
        <input type="text" class="sv-input--text" size="1" class:keep-value={!resetOnBlur}
          id={inputId}
          placeholder={input_value ? '' : placeholder_active}
          inputmode={input_mode}
          readonly={!searchable}
          enterkeyhint={enter_hint}
          {disabled}
          aria-label={i18n_actual.aria_label} aria-describedby={i18n_actual.aria_describedby}
          autocapitalize="none" autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list" tabindex="0"
          bind:this={ref_input}
          bind:value={input_value}
          on:focus={onFocus}
          on:keydown={onKeyDown}
          on:keyup={onKeyUp}
          on:input={onInput}
          on:blur={onBlur}
          on:paste={onPaste}
          >
      </span>
      <!-- #endregion -->
    </div>
    <!-- #endregion -->

    <!-- #region buttons, indicators -->
    <div class="sv-buttons" class:is-loading={isFetchingData}>
      {#if clearable && !disabled}
      <button type="button" class="sv-btn-indicator" class:sv-has-selection={selectedOptions.length}
        data-action="deselect"  tabindex="-1"
      >
        <slot name="clear-icon" {selectedOptions} inputValue={input_value}>
          {#if selectedOptions.length}
          <svg class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
          {/if}
        </slot>
      </button>
      {/if}
      {#if clearable}<span class="sv-btn-separator"></span>{/if}
      <button type="button" class="sv-btn-indicator" class:sv-dropdown-opened={is_dropdown_opened}
        data-action="toggle" tabindex="-1"
      >
        <slot name="dropdown-toggle" isOpen={is_dropdown_opened}>
          <svg class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
          </svg>
        </slot>
      </button>
    </div>
    <slot name="control-end"></slot>
    <!-- #endregion -->
  </div>

  <!-- #region DROPDOWN -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="sv_dropdown" class:is-open={dropdown_show}
    on:mousedown={onMouseDown}
    on:click={onClick}
  >
  {#if is_mounted && render_dropdown}
      <slot name="list-header" />
      <div bind:this={ref_container_scroll} class="sv-dropdown-scroll" class:has-items={options_filtered.length>0} class:is-virtual={virtualList} tabindex="-1">
        <div bind:this={ref_container} class="sv-dropdown-content" class:max-reached={maxReached} >
        {#if options_filtered.length}
          {#if virtualList}
            <TinyVirtualList bind:this={ref_virtuallist}
              width="100%"
              height={vl_listHeight}
              itemCount={options_filtered.length}
              itemSize={vl_itemSize}
              scrollToAlignment="auto"
              scrollToIndex={dropdown_index}
            >
              <div slot="item" let:index let:style {style}>
                {@const opt = options_filtered[index]}
                {#if opt.$isGroupHeader}
                  <div class="sv-optgroup-header"><b>{opt.label}</b></div>
                {:else}
                  <div data-pos={index}
                    class="sv-item--wrap in-dropdown"
                    class:sv-dd-item-active={dropdown_index === index}
                    class:is-selected={opt.$selected}
                    class:is-disabled={opt[disabledField]}
                  >
                    <slot name="option" item={opt}>
                      <div class="sv-item--content">
                        {@html highlightSearch(opt, false, input_value, itemRenderer, disableHighlight) }
                      </div>
                    </slot>
                  </div>
                {/if}
              </div>
            </TinyVirtualList>
          {:else}
            {#each options_filtered as opt, i}
              {#if opt.$isGroupHeader}
                <div class="sv-optgroup-header"><b>{opt.label}</b></div>
              {:else}
                <div data-pos={i}
                  class="sv-item--wrap in-dropdown"
                  class:sv-dd-item-active={dropdown_index === i}
                  class:is-selected={opt.$selected}
                  class:is-disabled={opt[disabledField]}
                >
                  <slot name="option" item={opt}>
                    <div class="sv-item--content">
                      {@html highlightSearch(opt, false, input_value, itemRenderer, disableHighlight) }
                    </div>
                  </slot>
                </div>
              {/if}
            {/each}
          {/if}
        {:else if options_filtered.length === 0 && (!creatable || !input_value) || maxReached}
          <div class="is-dropdown-row">
            <div class="sv-item--wrap"><div class="sv-item--content">{listMessage}</div></div>
          </div>
        {/if}
      </div>
    </div> <!-- scroll container end -->
    {#if creatable && input_value && !maxReached}
      <div class="is-dropdown-row">
        <button type="button" class="creatable-row" on:click|preventDefault={onCreate} on:mousedown|preventDefault
          class:active={(options_filtered.length ? options_filtered.length : 0) === dropdown_index}
          class:is-disabled={createFilter(input_value)}
        >
          <slot name="create-row" {isCreating} inputValue={input_value} i18n={i18n_actual}>
            <span class:is-loading={isCreating}>{i18n_actual.createRowLabel(input_value)}</span>
            <span class="shortcut"><kbd>{meta_key}</kbd>+<kbd>Enter</kbd></span>
          </slot>
        </button>
      </div>
    {/if}
  {/if}
  <!-- #endregion -->
  </div>
</div> <!-- /svelecte -->

<style>
  /** make it global to be able to apply it also for anchored select */
  :global(.sv-hidden-element) { opacity: 0; position: absolute; z-index: -2; top: 0; height: var(--sv-min-height, 30px)}

  /* stylable props */
  /*
  :root {
    --sv-min-height: 30px;
    --sv-bg: #fff;
    --sv-disabled-bg: #eee;
    --sv-border: 1px solid #ccc;
    --sv-border-radius: 4px;
    --sv-general-padding: 4px;
    --sv-control-bg: var(--sv-bg);
    --sv-item-wrap-padding: 3px 3px 3px 6px;
    --sv-item-selected-bg: #efefef;
    --sv-item-btn-color: #000;
    --sv-item-btn-color-hover: #777;
    --sv-item-btn-bg: #efefef;
    --sv-item-btn-bg-hover: #ddd;
    --sv-icon-color: #bbb;
    --sv-icon-color-hover: #777;
    --sv-icon-bg: transparent;
    --sv-icon-size: 20px;
    --sv-separator-bg: #ccc;
    --sv-btn-border: 0;
    --sv-placeholder-color: #ccccd6;
    --sv-dropdown-bg: var(--sv-bg);
    --sv-dropdown-offset: 1px;
    --sv-dropdown-border: 1px solid rgba(0,0,0,0.15);
    --sv-dropdown-width: auto;
    --sv-dropdown-shadow: 0 6px 12px #0000002d;
    --sv-dropdown-height: 320px;
    --sv-dropdown-active-bg: #F2F5F8;
    --sv-dropdown-selected-bg: #ECF3F9;
    --sv-create-disabled-bg: #fcbaba;
    --sv-create-kbd-border: 1px solid #efefef;
    --sv-create-kbd-bg: #fff;
    --sv-loader-border: 2px solid #ccc;
  }
  */
  .a11y-text {
    z-index: 9999;
    border: 0px;
    clip: rect(1px, 1px, 1px, 1px);
    height: 1px;
    width: 1px;
    position: absolute;
    overflow: hidden;
    padding: 0px;
    white-space: nowrap;
  }
  .svelecte {
    position: relative;
    flex: 1 1 auto;
    color: var(--sv-color, inherit);

    &.is-disabled > .sv-control {
      background-color: var(--sv-disabled-bg, #eee);
    }
  }

  .sv-control {
    display: flex;
    align-items: center;
    border: var(--sv-border, 1px solid #ccc);
    border-radius: var(--sv-border-radius, 4px);
    background-color: var(--sv-control-bg, var(--sv-bg, #fff));
    min-height: var(--sv-min-height, 30px);
  }

  .sv-control--selection {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 4px;
    padding: var(--sv-general-padding, 4px);
    min-height: 24px;
    &.is-single {
      flex-wrap: nowrap;
    }
  }
  :global(.sv-item--container) {
    display: flex;
    min-width: 0;
  }
  :global(.sv-item--wrap) {
    display: flex;
    min-width: 0;
    padding: var(--sv-item-wrap-padding, 3px 3px 3px 6px);
    &.is-multi {
      background-color: var(--sv-item-selected-bg, #efefef);
    }

  }
  :global(.sv-item--content) {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  :global(.sv-item--btn) {
    position: relative;
    display: inline-flex;
    align-items: center;
    align-self: stretch;
    padding: 0 4px;
    box-sizing: border-box;
    border-radius: calc(var(--sv-border-radius, 4px) / 2);
    border-width: 0;
    margin: 0;
    cursor: pointer;
    background-color: var(--sv-item-btn-bg, var(--sv-item-selected-bg, #efefef));

    & > svg {
      fill: var(--sv-item-btn-color, var(--sv-icon-color, #bbb));
    }
    &:hover {
      background-color: var(--sv-item-btn-bg-hover, #ddd);
      & > svg {
        fill: var(--sv-item-btn-color-hover, #777);
      }
    }
  }


  /** #region ************************************ buttons */

  .sv-buttons {
    display: flex;
    align-self: stretch;
    position: relative;
  }
  .sv-btn-indicator {
    color: var(--sv-icon-color, #bbb);
    display: flex;
    transition: color 150ms ease 0s;
    box-sizing: border-box;
    background-color: var(--sv-icon-bg, transparent);
    border: var(--sv-btn-border, 0);
    padding: 0;
    margin: var(--sv-general-padding, 4px);
    align-items: center;
    fill: currentcolor;
    line-height: 1;
    stroke: currentcolor;
    stroke-width: 0px;
    &:hover {
      color: var(--sv-icon-color-hover, #777);
    }
  }
  .sv-btn-separator {
    align-self: stretch;
    background-color: var(--sv-separator-bg, #ccc);
    margin-bottom: var(--sv-general-padding, 4px);
    margin-top: var(--sv-general-padding, 4px);
    width: 1px;
    box-sizing: border-box;
  }
  .indicator-icon {
    width: var(--sv-icon-size, 20px);
    height: var(--sv-icon-size, 20px);
  }
  .is-loading:after {
    animation: spinAround 0.5s infinite linear;
    border: var(--sv-loader-border, 2px solid #ccc);
    border-radius: 50%;
    border-right-color: transparent;
    border-top-color: transparent;
    content: "";
    display: block;
    height: var(--sv-icon-size, 20px);
    width: var(--sv-icon-size, 20px);
    right: var(--sv-general-padding, 4px);
    top: calc(50% - (var(--sv-icon-size, 20px) / 2));
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

  /** #endregion */

  /** ************************************ dropdown */

  .sv_dropdown {
    margin: var(--sv-dropdown-offset, 1px) 0;
    box-sizing: border-box;
    position: absolute;
    min-width: 100%;
    width: var(--sv-dropdown-width, auto);
    background-color: var(--sv-dropdown-bg, var(--sv-bg, #fff));
    overflow-y: auto;
    overflow-x: hidden;
    border: var(--sv-dropdown-border, 1px solid rgba(0,0,0,0.15));
    border-radius: var(--sv-border-radius, 4px);
    box-shadow: var(--sv-dropdown-shadow, 0 6px 12px #0000002d);
    opacity: 0;
    z-index: -1000;
    pointer-events: none;

    &.is-open {
      opacity: 1;
      z-index: 2;
      pointer-events: auto;
    }
  }
  .sv-dropdown-scroll {
    /* min-height: 40px; */
    padding: 0;
    box-sizing: border-box;
    max-height: var(--sv-dropdown-height, 320px);
    overflow-y: auto;
    overflow-x: hidden;
    &.has-items {
      padding: 4px;
    }
  }
  .in-dropdown.is-selected {
    background-color: var(--sv-dropdown-selected-bg, #ECF3F9);
  }
  .in-dropdown.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .in-dropdown.sv-dd-item-active,
  .in-dropdown:hover,
  .in-dropdown:active {
    background-color: var(--sv-dropdown-active-bg, #F2F5F8);
  }
  .is-dropdown-row {
    padding: var(--sv-general-padding, 4px);
  }

  /** ************************************ creatable */

  .sv-dropdown-scroll.has-items + .is-dropdown-row {
    border-top: 1px solid transparent;
    border-color: var(--sv-separator-bg, #ccc);
  }
  .creatable-row {
    width: 100%;
    border: 0;
    background-color: inherit;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: calc(var(--sv-border-radius, 4px) / 2);
    padding: var(--sv-item-wrap-padding, 3px 3px 3px 6px);

    &:hover,
    &:active,
    &.active {
      background-color: var(--sv-dropdown-active-bg, #F2F5F8);
    }
    &.active.is-disabled {
      opacity: 0.5;
      background-color: var(--sv-create-disabled-bg, #fcbaba);
    }
    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    & > .is-loading {
      position: relative;
      &:after {
        left: calc(100% + 4px);
      }
    }
  }

  .shortcut {
    display: flex;
    align-items: center;
    align-content: center;
  }
  .shortcut > kbd {
      border: var(--sv-create-kbd-border, 1px solid #efefef);
      border-radius: var(--sv-border-radius, 4px);
      padding: 0px 6px;
      margin: -1px 0;
      background-color: var(--sv-create-kbd-bg, #fff);
  }

  /** #region input */
  .sv-input--sizer {
    position: relative;
    display: inline-grid;
    vertical-align: top;
    align-items: center;

    &:not(:focus-within) {
      position: absolute;
    }

    &:after {
      content: attr(data-value) ' ';
      visibility: hidden;
      white-space: pre-wrap;
    }
  }
  .has-items .keep-value:not(:focus) {
    color: transparent;
  }
  .is-focused .is-single.has-items.has-input > .sv-item--container {
    opacity: 0.2;
  }
  .sv-input--sizer:after,
  .sv-input--text {
    width: auto;
    min-width: 1em;
    grid-area: 1 / 2;
    font: inherit;
    padding: 0 0.25em;
    margin: 0;
    resize: none;
    background: none;
    appearance: none;
    border: none;
  }
  .has-items .sv-input--text {
    padding-left: 0;
    margin-left: -2px;
  }

  .sv-input--text {
    outline: none;
    &:placeholder {
      color: var(--sv-placeholder-color, #ccccd6);
    }
  }
  /* #endregion */
</style>
