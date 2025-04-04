<script module>
  import defaults from './settings.js';

  import { requestFactory, debounce } from './utils/fetch.js';
  import { onCreate_helper, escapeHtml } from './utils/helpers.js';

  defaults.requestFactory = requestFactory;

  const stringFormatters = {
    default: function(item) { return escapeHtml(item[this.label]); },
    html: function(item) { return item[this.label]; }
  };

  const _noop = _node => ({ destroy: () => {}});

  /**
   * Provide ability to add additional renderers in raw html string format
   *
   * @param {string|Record<string, (item: object, selectionSection?: boolean, inputValue?: string) => string>} name
   * @param {(item: object, selectionSection?: boolean, inputValue?: string) => string} rendererFn
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
</script>

<!-- svelte-ignore state_referenced_locally -->
<script>
  import { onMount, tick } from 'svelte';
  import { flip } from 'svelte/animate';
  import { pixelGetter, positionDropdown, scrollIntoView } from './utils/dropdown.js';
  import { createConfig, ensureObjectArray, filterList, flatList, fieldInit, initSelection } from './utils/list.js';
  import { highlightSearch, android } from './utils/helpers.js';
  import { bindItem } from './utils/actions.js';
  import VirtualList from './VirtualList.svelte';

  /**
   * @type {{
   *  name?: string;
   *  inputId?: string;
   *  required?: boolean;
   *  disabled?: boolean;
   *  options?: Array<any> | object;
   *  optionResolver?: (options: any, selectedKeys: Set) => object[];
   *  valueField?: string | null;
   *  labelField?: string | null;
   *  groupLabelField?: string;
   *  groupItemsField?: string;
   *  disabledField?: string;
   *  placeholder?: string;
   *  searchable?: boolean;
   *  clearable?: boolean;
   *  renderer?: ( (item: object, selectionSection?: boolean, inputValue?: string) => string ) | string;
   *  disableHighlight?: boolean;
   *  highlightFirstItem?: boolean;
   *  selectOnTab?: boolean | "select-navigate";
   *  resetOnBlur?: boolean;
   *  resetOnSelect?: boolean;
   *  closeAfterSelect?: string | boolean;
   *  deselectMode?: "native" | "toggle" | "none";
   *  dndzone?: Function;
   *  strictMode?: boolean;
   *  multiple?: boolean;
   *  max?: number;
   *  collapseSelection?: "blur" | "always" | null;
   *  keepSelectionInList?: boolean | "auto";
   *  creatable?: boolean;
   *  creatablePrefix?: string;
   *  allowEditing?: boolean;
   *  keepCreated?: boolean;
   *  delimiter?: string;
   *  createFilter?: (inputValue: string) => boolean;
   *  createHandler?: (prop: { inputValue: string, valueField: string, labelField: string, prefix: string }) => (Promise<object> | object);
   *  fetch?: string | null;
   *  fetchProps?: object;
   *  fetchMode?: "auto" | "init";
   *  fetchCallback?: Function;
   *  fetchResetOnBlur?: boolean;
   *  fetchDebounceTime?: number;
   *  minQuery?: number;
   *  lazyDropdown?: boolean;
   *  virtualList?: boolean;
   *  vlItemSize?: number;
   *  searchProps?: import("./utils/list.js").SearchProps | null;
   *  class?: string | array | object;
   *  i18n?: object;
   *  value?: any[] | string | number | object | null;
   *  readSelection?: object | object[] | null;
   *  valueAsObject?: boolean;
   *  parentValue?: string | number | null | undefined;
   *  emitValues?: boolean;
   *  onChange?: Function;
   *  onFocus?: Function;
   *  onBlur?: Function;
   *  onCreateOption?: Function;
   *  onCreateFail?: Function;
   *  onEnterKey?: Function;
   *  onFetch?: Function;
   *  onFetchError?: Function;
   *  onInvalidValue?: Function;
   *  prepend?: import("svelte").Snippet | undefined;
   *  collapsedSelection?: import("svelte").Snippet<[selectedOptions: object[], i18n: import("./settings.js").I18nObject]>;
   *  selection?: import("svelte").Snippet<[selectedOptions: object[], bindItem: Function]>;
   *  clearIcon?: import("svelte").Snippet<[selectedOptions: object[], input_value: string]>;
   *  toggleIcon?: import("svelte").Snippet<[dropdownShow: boolean]>;
   *  append?: import("svelte").Snippet | undefined;
   *  listHeader?: import("svelte").Snippet | undefined;
   *  option?: import("svelte").Snippet<[option: object, inputValue: string]>;
   *  createRow?: import("svelte").Snippet<[isCreating: boolean, inputValue: string, i18n: import("./settings.js").I18nObject]>;
   *  positionResolver?: Function;
   *  anchor_element?: string | null;
   *  controlClass?: string | null;
   *  dropdownClass?: string | null;
   *  optionClass?: string | null;
   * }}
   */
  let {
    name = '',
    inputId = '',
    required = false,
    disabled = false,
    options = [],
    optionResolver,
    valueField = defaults.valueField,
    labelField = defaults.labelField,
    groupLabelField = defaults.groupLabelField,
    groupItemsField = defaults.groupItemsField,
    disabledField = defaults.disabledField,
    placeholder = defaults.placeholder,
    searchable = defaults.searchable,
    clearable = defaults.clearable,
    renderer,
    disableHighlight = false,
    highlightFirstItem = defaults.highlightFirstItem,
    selectOnTab = defaults.selectOnTab,
    resetOnBlur = defaults.resetOnBlur,
    resetOnSelect = defaults.resetOnSelect,
    closeAfterSelect = defaults.closeAfterSelect,
    deselectMode = defaults.deselectMode,
    dndzone = _noop,
    strictMode = true,
    multiple = defaults.multiple,
    max = defaults.max,
    collapseSelection = defaults.collapseSelection,
    keepSelectionInList = defaults.keepSelectionInList,
    creatable = defaults.creatable,
    creatablePrefix = defaults.creatablePrefix,
    allowEditing = defaults.allowEditing,
    keepCreated = defaults.keepCreated,
    delimiter = defaults.delimiter,
    createFilter,
    createHandler,
    fetch = null,
    fetchProps = defaults.fetchProps,
    fetchMode = 'auto',
    fetchCallback = defaults.fetchCallback,
    fetchResetOnBlur = true,
    fetchDebounceTime = defaults.fetchDebounceTime,
    minQuery = defaults.minQuery,
    lazyDropdown = defaults.lazyDropdown,
    virtualList = defaults.virtualList,
    vlItemSize = defaults.vlItemSize,
    searchProps = null,
    class: className = 'svelecte-control',
    i18n = null,
    value = $bindable(),
    readSelection = $bindable(),  // never used, updated from component to the parent
    emitValues = false,
    valueAsObject = defaults.valueAsObject,
    parentValue = undefined,
    onChange = _readSelection => {},
    onFocus = _htmlInput => {},
    onBlur = _htmlInput => {},
    onCreateOption = _newObj => {},
    onCreateFail = _fail => {},
    onEnterKey = _event => {},
    onFetch = _data => {},
    onFetchError = _err => {},
    onInvalidValue = _val => {},
    prepend = undefined,
    collapsedSelection = snippet_collapsedSelection,
    selection = snippet_selection,
    clearIcon = snippet_clearIcon,
    toggleIcon = snippet_toggleIcon,
    append = undefined,
    listHeader = undefined,
    option = snippet_option,
    createRow = snippet_createRow,
    positionResolver = _noop,
    anchor_element = undefined,
    controlClass = undefined,
    dropdownClass = undefined,
    optionClass = undefined
  } = $props();

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
    return compute_selection(!onlyValues);
  }
  /**
   * Add ability to re-initialize fetch even when component is in query mode
   * @param {string|number|array} value
   */
  export function refetchWith(value) {
    if (!fetch) return;
    fetch_runner({
      init: true,
      initValue: value,
      storedValue: fetchResetOnBlur
    });
    fetchResetOnBlur = false; // force this to preven 'clearSelection' clear fetched options
  }

  const DOM_ID = name ? `sv-${name}-select-${`${Math.random()}`.substring(2, 6)}` : null;

  if (required && !name) console.warn(`[Svelecte]: 'required' prop has no effect when 'name' prop is NOT set`)

  /** ************************************ preparation */
  /* possibility to provide initial (selected) values in `fetch` mode (only !strictMode) **/
  if (fetch && value && valueAsObject && !strictMode && (!options || (options && options.length === 0))) {
    options = Array.isArray(value) ? value : [value];
  }
  if (!inputId) inputId = DOM_ID ? DOM_ID.replace('-select-', '-input-') : `svelecte-input-${`${Math.random()}`.substring(2, 12)}`;
  /** ************************************ END preparation */

  let is_mounted = $state(false);
  // state-related
  let options_stopgap = options;
  let prev_value;
  let prev_parent_value = undefined;
  let init_only_options = optionResolver
    ? optionResolver(options, new Set())
    : ensureObjectArray(options, valueField, labelField)
  let currentValueField = $state(valueField || fieldInit('value', init_only_options, groupItemsField));
  let currentLabelField = $state(labelField || fieldInit('label', init_only_options, groupItemsField));
  const itemConfig = createConfig(currentValueField, currentLabelField, groupLabelField, groupItemsField);

  let prev_options = $state(flatList(init_only_options, itemConfig));
  let options_flat_override = $state(false);
  let options_flat = $derived(options_flat_override ? [] : prev_options);
  // @ts-ignore
  init_only_options = undefined; // cleanup


  /** @reactive @type {object[]} */
  let selectedOptions = $state(
    value
      ? initSelection(options_flat, value, valueAsObject, currentValueField)
      : []
  );
  /** @type {Set<string|number>} */
  const selectedKeys = selectedOptions.reduce((/** @type {Set} */ set,/** @type {object} */ opt) => {
    set.add(opt[currentValueField]);
    return set;
  }, new Set());
  let alreadyCreated = selectedOptions.filter(opt => opt.$created);
  // logic-related
  let is_focused = $state(false);
  let focus_by_mouse = $state(false);
  let is_tainted = $state(false); // true after first focus
  let is_dropdown_opened = $state(false);
  let dropdown_show = $state(false);
  let dropdown_index = $state(highlightFirstItem ? 0 : -1);
  // dropdown-related
  let render_dropdown = $state(!lazyDropdown);
  let dropdown_scroller = null;
  let meta_key = $state();
  let hasEmptyList = false;
  // input-related
  /** @type {string} */
  let input_value = $state('');
  let disable_key_event_bubble = false;
  // utils
  /** @type {import('./settings.js').I18nObject} */
  let i18n_actual = $derived(Object.assign({}, config.i18n, i18n || {}));
  let fetch_initOnly = $derived(fetchMode === 'init' || (fetch && fetch.includes('[query]') === false));
  let fetch_initValue = (fetch && (value || (multiple && value && value.length)))
    ? (valueAsObject
      ? (strictMode === false
        ? $state.snapshot(value)
        : null
      )
      : JSON.parse(JSON.stringify(value))
    )
    : null;
  let isIOS = null;
  let doCollapse = $state(collapseSelection !== null);
  let isFetchingData = $state(false);
  let isCreating = $state(false);
  let flipDurationMs = $state(100);
  let is_dragging = false;
  let is_fetch_dependent = false;
  // refs
  let /** @type {HTMLInputElement}  */  ref_input;
  // svelte-ignore non_reactive_update
  let /** @type {HTMLSelectElement} */  ref_select_element;
  // svelte-ignore non_reactive_update
  let /** @type {HTMLDivElement}    */  ref_container;
  // @ts-ignore
  let /** @type {HTMLDivElement}    */  ref_container_scroll = $state(null);
  // svelte-ignore non_reactive_update
  let /** svelte-tiny-virtual-list  */  ref_virtuallist;

  // #region [reactivity]
  $effect(() => {
    watch_item_props(valueField, labelField)
  });
  let maxReached = $derived.by(() => {
    return max !== 0 && selectedOptions.length == max;     // == is intentional, if string is provided
  });
  $effect(() => {
    watch_options(options);
  });
  $effect(() => {
    value !== undefined && watch_value_change(value);
  });
  let options_filtered_override = null;
  let options_filtered = $derived.by(() => {
    selectedOptions.length;
    options_flat.length;

    if (!input_value && fetch && !fetch_initOnly && fetchResetOnBlur) return [];
    if (options_filtered_override) return options_filtered_override;  // related to fetch

    return maxReached
      ? []
      : filterList(
        options_flat,
        input_value,
        resolveExcludedValue(input_value),
        itemConfig,
        searchProps || {}
      )
  });
  $effect(() => {
    let list_length = options_filtered.length;
    if (creatable && input_value) list_length++;  // needed for NOT reseting dropdown_index with create_row displayed

    list_length <= dropdown_index && setDropdownIndex(0, { asc: !creatable, desc: creatable });
    watch_listMessage(maxReached, options_filtered);
  });
  // only initial setter
  if (highlightFirstItem) setDropdownIndex(0, { asc: true });

  let createFilterFn = $derived(createFilter || (inputVal => alreadyCreated.includes(inputVal)));
  let createHandlerFn = $derived(createHandler || (({ inputValue, labelField, valueField, prefix }) => ({
    [valueField]: inputValue,
    [labelField]: `${prefix}${inputValue}`
  })));

  /**
   * @type {function}
   */
   let itemRenderer = $derived.by(() => typeof renderer === 'function'
    ? renderer
    : ((stringFormatters[renderer]
      ? stringFormatters[renderer]
      : stringFormatters['default']
    ).bind({ label: currentLabelField}))
  );

  /** ************************************ input-specific */

  /** @type {'text'|'none'}*/
  let input_mode = $derived(searchable ? 'text' : 'none');
  /** @type {string} */
  let placeholder_active = $derived(selectedOptions.length ? '' : placeholder);
  /** @type {'enter'|null} */
  let enter_hint = $derived(selectedOptions.length > 0 && multiple === false ? null : 'enter');
  // aria related
  let aria_selection = $derived(i18n_actual.aria_selected(selectedOptions.map(o => o[currentLabelField])));
  let aria_context = $derived.by(() => {
    if (selectedOptions.length && selectedOptions.length === max) return i18n_actual.max(max);

    const idx = Math.min(dropdown_index, options_filtered.length-1);  // can happen, because derived run before effects
    if (fetch) {
      return isFetchingData
        ? i18n_actual.fetchInit
        : (options_filtered.length
          ? (dropdown_index !== -1
            ? i18n_actual.aria_inputFocused()
            : (options_filtered[dropdown_index]
              ? i18n_actual.aria_listActive(options_filtered[idx], currentLabelField, options_filtered.filter(o => !o.$isGroupHeader).length)
              : 'N/A.' + dropdown_index
            )
          )
          : (minQuery > 1
            ? i18n_actual.fetchQuery(minQuery, input_value.length)
            : i18n_actual.fetchBefore
          )
        )
      ;
    }
    return options_filtered.length
      ? (is_dropdown_opened && dropdown_index !== -1 && !isNaN(dropdown_index)
        ? i18n_actual.aria_listActive(options_filtered[idx], currentLabelField, options_filtered.filter(o => !o.$isGroupHeader).length)
        : i18n_actual.aria_inputFocused()
      )
    : (input_value.length
      ? i18n_actual.nomatch
      : i18n_actual.empty
    );
  });

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

    if (valueProp && currentValueField !== valueProp) {
      itemConfig.valueField = currentValueField = valueProp;
      // check note in watch_options()
      selectedKeys.size > 0 && clearSelection();
    }
    if (labelProp) {
      itemConfig.labelField = currentLabelField = labelProp;
    }
  }


  /**
   * @param {array} opts
   */
  function watch_options(opts) {
    if (options_stopgap === opts) return;
    // make sure, it's an array
    opts = flatList(  // although valid data is passed, `flatList` must be run, to update optionProps
      ensureObjectArray(opts, currentValueField, currentLabelField), itemConfig
    );

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
      };
    }
    options_stopgap = opts;
    // continue to update options_flat
    prev_options = optionResolver
      ? optionResolver(opts, selectedKeys)
      : opts;
  }

  function equals(prevValue, passedVal) {
    if (multiple) {
      if (prevValue && passedVal?.length === prevValue.length && prevValue.length > 0) {
        return valueAsObject
          ? prevValue.every((o, i) => o[currentValueField] === passedVal[i][currentValueField])
          : prevValue.every((o, i) => o === passedVal[i]);
      }
    } else {
      if (passedVal && prevValue) {
        return valueAsObject
          ? passedVal[currentValueField] === prevValue[currentValueField]
          : passedVal === prevValue;
      }
    }
    return false;
  }


  /**
   * @typedef {object} ValueWatcherOptions
   * @property {boolean} [skipEqualityCheck]
   *
   * @param {any} passedVal
   * @param {ValueWatcherOptions} [opts]
   */
  function watch_value_change(passedVal, opts) {
    if (equals(prev_value, passedVal) && !opts?.skipEqualityCheck) return;
    // NOTE: I am commenting all `optionResolver` if-s
    // if (optionResolver) return;

    const ifArrayThenNonEmpty = (Array.isArray(passedVal) && passedVal.length) || multiple === false; // return true for allowing '' or 0
    if (passedVal !== null && ifArrayThenNonEmpty) {
      if ((multiple && !Array.isArray(passedVal)) || (!multiple && Array.isArray(passedVal))) {
        console.warn(`[Svelecte]: Passed 'value' property should ${ multiple ? 'be' : 'NOT be'} an array`);
      }
      // wait for fetch to be resolved
      if (fetch_initValue && (Array.isArray(fetch_initValue) ? fetch_initValue.length : true)) return;

      const arrValue = Array.isArray(passedVal) ? passedVal : [passedVal];
      const newSelectedKeys = [];
      const _selection = arrValue.reduce((res, val) => {
        // skip options scan when in valueAsObject non-strict mode
        if (valueAsObject && (!strictMode || (creatable && val.$created))) {
          res.push(Object.fromEntries(Object.entries(val)));
          return res;
        }
        let opt = options_flat.find(item => valueAsObject
          ? item[currentValueField] == val[currentValueField]
          : item[currentValueField] == val
        );
        if (!opt && !strictMode) {
          // only sync (or default) handler is allowed for code simplicty
          opt =  createHandler
            ? createHandlerFn({
              inputValue: val,
              valueField: currentValueField,
              labelField: currentLabelField,
              prefix: creatablePrefix
            })
            : {
              [currentValueField]: val,
              [currentLabelField]: val
            };
        }
        if (opt) {
          if (!selectedKeys.has(opt[currentValueField])) {
            res.push(opt);
          }
          newSelectedKeys.push(opt[currentValueField]);
        }
        return res;
      }, []);
      // de-select those, that cannot be selected anymore
      // if (!optionResolver) {
        selectedOptions.forEach(opt => !newSelectedKeys.includes(opt[currentValueField]) && deselectOption(opt));
      // }

      // let success = arrValue.filter(o => o.$created !== true).length !== _selection.filter(o => o.$created !== false);
      let success = _selection.every(selectOption) && (multiple
        ? selectedKeys.size === arrValue.length
        : selectedKeys.size === 1
      );

      // this is run only when invalid 'value' is provided, like out of option array
      if (!success) {
        console.warn('[Svelecte]: provided "value" property is invalid', passedVal);
        if (valueAsObject && strictMode && fetch) {
          console.warn(`[Svelecte]: with 'fetch' and 'valueAsObject' set make sure 'strictMode' is set to false to be to set initial value`);
        }
        clearSelection();
        prev_value = multiple ? [] : null;
        value = prev_value;
        readSelection = prev_value;
        onInvalidValue(passedVal);
        return;
      }
    } else {
      clearSelection();
    }
    prev_value = $state.snapshot(passedVal);
    if (multiple && !Array.isArray(passedVal)) {
      prev_value = [];
      value = prev_value;
    }
    readSelection = compute_selection(true);
  }

  /**
   * Compute selection value
   * @returns {array|object|string|number|null}
   */
  function compute_selection(asObjects) {
    const asValues = asObjects !== true;
    // if (is_dragging) return;
    const selection_formatted = selectedOptions
      .map(opt => {
        if (asValues) return opt[currentValueField];
        const obj = {};
        for (let [prop, val] of Object.entries(opt)) {
          if (prop[0] !== '$') obj[prop] = val;
        }
        return obj;
      });

    return multiple
      ? selection_formatted
      : (selection_formatted.length
        ? selection_formatted.shift()
        : null
      );
  }

  $effect(() => {   // previously $: watch_parentValue()
    // check for undefined is required because parent have empty value as well and I want to avoid 2 props just for this
    if ((parentValue !== undefined && prev_parent_value !== parentValue)
      || (parentValue === undefined && prev_parent_value !== parentValue)
    ) {
      const disabled_to_set = parentValue === undefined
        ? false
        : (!parentValue
          ? true
          : false
        )
      clearSelection();
      value = multiple ? [] : null;
      disabled = disabled_to_set;
    }
    prev_parent_value = parentValue;
    is_fetch_dependent = parentValue !== undefined;
  });

  function updateDropdownState(val) {
    if (val && !focus_by_mouse) focus_by_mouse = true;
    const alreadyRendered = render_dropdown;
    if (!render_dropdown && val) render_dropdown = true;

    is_dropdown_opened = val;
    tick()
      .then(() => {
        /**
         * conditional tick() required to properly delay calling positionDropdown when lazy & virtual list
         * initializing for the first time, because of its internal use of tick()
         */
        if (!alreadyRendered && virtualList) return tick();
      })
      .then(() => {
        positionResolver === _noop && positionDropdown(val, ref_container_scroll, true);
        if (val) {
          // ensure proper dropdown index
          // do not respect highlightFirstItem here
          if (highlightFirstItem && (selectedOptions.length === 0 || multiple)) setDropdownIndex(0, { asc: true});
          if (!multiple && selectedOptions.length) {
            // ensure item is set
            dropdown_index = options_flat.findIndex(opt => opt[currentValueField] === selectedOptions[0][currentValueField]);
          }
          scrollIntoView({ container: ref_container, scrollContainer: ref_container_scroll, virtualList, center: false }, dropdown_index);
        }
        tick().then(() => dropdown_show = val);
      });
    if (!dropdown_scroller) dropdown_scroller = () => positionResolver === _noop && positionDropdown(val, ref_container_scroll, true);
    // bind/unbind scroll listener
    document[val ? 'addEventListener' : 'removeEventListener']('scroll', dropdown_scroller, { passive: true });
  }

  /**
   * @param {boolean} maxReached
   * @param {array} options_filtered
   */
  function watch_listMessage(maxReached, options_filtered) {
    // fetch-related states are handled manually
    if (fetch && !fetch_initOnly) return;

    if (maxReached) {
      listMessage = i18n_actual.max(max);
      return;
    }

    listMessage = options_filtered.length !== options_flat.length && selectedOptions.length !== options_flat.length
      ? (creatable
        ? i18n_actual.emptyCreatable
        : i18n_actual.nomatch
      )
      : (creatable
        ? i18n_actual.emptyCreatable
        : i18n_actual.empty
      );
  }

  // #endregion

  // #region [event-emitters]

  /**
   * Dispatch change event on add options/remove selected items
   */
   function emitChangeEvent() {
    const objectSelection = compute_selection(true);
    const valueSelection = compute_selection(false);
    prev_value = valueAsObject ? objectSelection : valueSelection;
    value = prev_value;
    readSelection = objectSelection;
    tick().then(() => {
      onChange(emitValues ? valueSelection : objectSelection);
      if (ref_select_element) {
        ref_select_element.dispatchEvent(new Event('change'));  // typically you expect change event to be fired
      }
    });
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
    if (selectedKeys.has(opt[currentValueField])) {
      if (!multiple && deselectMode !== 'toggle') return;
      return onDeselect(opt);
    }

    // creatable branch
    if (typeof opt === 'string') {
      if (!creatable) return;
      opt = onCreate_helper(opt);
      if (alreadyCreated.includes(opt) || selectedKeys.has(opt)) return;

      isCreating = true;
      Promise.resolve()
        .then(() => createHandlerFn({
          inputValue: opt,
          valueField: currentValueField,
          labelField: currentLabelField,
          prefix: creatablePrefix
        }))
        .then(newObj => {
          isCreating = false;
          !fetch && alreadyCreated.push(opt);
          newObj.$created = true;  // internal setter
          if (keepCreated) {
            prev_options.push(newObj);
            newObj = prev_options[prev_options.length - 1]; // get proxy-wrapped version to make it reactive in dropdown
          }
          onCreateOption(newObj);
          selectOption(newObj);
          onSelectTeardown();
          emitChangeEvent();
        })
        .catch(e => {
          isCreating = false;
          onCreateFail({
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
      updateDropdownState(false);
    }
    if (max && selectedOptions.length == max) {
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
      selectedKeys.add(opt[currentValueField]);
    } else {
      const previousSelected = selectedOptions.shift();
      if (previousSelected) previousSelected.$selected = false;
      selectedOptions = [opt];
      selectedKeys.clear();
      selectedKeys.add(opt[currentValueField]);
      tick().then(() => {
        const idx = options_flat.indexOf(opt);
        dropdown_index = idx < 0
          ? 0
          : idx;
      });
    }

    if (optionResolver) {
      tick().then(() => {
        prev_options = optionResolver(options, selectedKeys)
      });
    }

    // options_flat = options_flat;
    return true;
  }

  /**
   *
   * @param {object} [opt]
   * @param {boolean} [backspacePressed]
   */
  function onDeselect(opt = null, backspacePressed) {
    if (disabled) return;
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
      if (!keepCreated) {
        alreadyCreated.splice(alreadyCreated.findIndex(o => o === opt[currentValueField]), 1);
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

    if (optionResolver) {
      prev_options = optionResolver(options, selectedKeys);
      return;
    }

    if (fetch && !fetch_initOnly && fetchResetOnBlur) options_flat_override = true; // results in `options_flat = []`
  }

  function clearSelection() {
    if (selectedKeys.size === 0 || (!multiple && deselectMode==='none')) return;
    selectedKeys.clear();

    selectedOptions = selectedOptions.reduce((_, opt) => {
      opt.$selected = false;
      return [];
    }, []);
    if (!keepCreated) alreadyCreated = [];  // ref #198
    if (input_value) input_value = '';

    if (optionResolver) {
      prev_options = optionResolver(options, selectedKeys);
      return;
    }

    if (fetch && !fetch_initOnly && fetchResetOnBlur) options_flat_override = true; // results in `options_flat = []`
  }

  function on_create(event) {
    event.preventDefault();
    if (alreadyCreated.includes(input_value)) return;

    onSelect(null, input_value);
  }

  /**
   * @param {KeyboardEvent} event
   */
  function processKeyDown(event) {
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
            // @ts-ignore
            Math.ceil((item * dropdown_index + wrap) / item), // can be more than max, therefore Math.min
            options_filtered.length + (creatable && input_value ? 1 : 0)
          );
        }
      case 'ArrowUp':
        event.preventDefault();
        if (!is_dropdown_opened) {
          updateDropdownState(true);
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
          // @ts-ignore
          dropdown_index = Math.floor((item * dropdown_index - wrap) / item);
        }
      case 'ArrowDown':
        event.preventDefault();
        if (!is_dropdown_opened) {
          updateDropdownState(true);
          return;
        }
        // not to skip first item when `highlightFirstItem=false`
        const dix = dropdown_index === null ? -1 : dropdown_index;
        !supressIndexMove && setDropdownIndex(dix + 1, { asc: true });
        tick().then(() => scrollIntoView({ scrollContainer: ref_container_scroll, container: ref_container, virtualList, center: false}, dropdown_index));
        break;
      case 'Escape':
        if (is_dropdown_opened) { // prevent ESC bubble in this case (interfering with modal closing etc. (bootstrap))
          event.preventDefault();
          event.stopPropagation();
        }
        if (!input_value) {
          updateDropdownState(false);
        }
        input_value = '';
        break;
      case Tab:
      case 'Enter':
        if (!is_dropdown_opened) {
          event.key !== Tab && onEnterKey(event); // ref #125
          return;
        }
        let activeDropdownItem = !ctrlKey ? options_filtered[dropdown_index] : null;
        if (creatable && !activeDropdownItem && input_value) {
          const preventCreation = createFilterFn(onCreate_helper(input_value));
          activeDropdownItem = !activeDropdownItem || ctrlKey
            ? onCreate_helper(input_value)
            : activeDropdownItem
          ctrlKey = preventCreation;  // previously ctrlKey was set to `false` which resulted in item being not respecting createFilter result
        }
        !ctrlKey && activeDropdownItem && onSelect(null, activeDropdownItem);
        if (options_filtered.length <= dropdown_index) {
          setDropdownIndex(options_filtered.length - 1);
        }
        if (!activeDropdownItem && selectedOptions.length) {
          updateDropdownState(false);
          event.key !== Tab && onEnterKey(event); // ref #125
          return;
        }
        (event.key !== Tab || (event.key === Tab && selectOnTab !== 'select-navigate')) && event.preventDefault(); // prevent form submit
        break;
      case ' ':
        if (!fetch && !is_dropdown_opened) {
          updateDropdownState(true);
          event.preventDefault();
        }
        break;
      case 'Backspace':
        if (collapseSelection === 'always') return;
        backspacePressed = true;
      case 'Delete':
        if (input_value === '' && selectedOptions.length) {
          if (!multiple && deselectMode === 'none') return;
          ctrlKey ? onDeselect() : onDeselect(selectedOptions[selectedOptions.length - 1], backspacePressed);
          event.preventDefault();
        }
      default:
        if (!ctrlKey && !['Tab', 'Shift'].includes(event.key) && !is_dropdown_opened && !isFetchingData) {
          updateDropdownState(true);
        }
    }
  }

  /**
   * Prevent focus change
   * @param {MouseEvent} event
   */
  function on_mouse_down(event) {
    event.preventDefault();
  }

  /**
   * Single click handler. Unified for dropdown items, for selected items and 'x' clear button
   *
   * @param {MouseEvent & { currentTarget: EventTarget & HTMLDivElement} & { target: HTMLElement }} event
   */
  function on_click(event) {
    if (disabled) return;

    const target = /** @type {HTMLElement & import('./utils/actions.js').ExtButton} */ (event.target.closest('[data-action]'));

    if (!focus_by_mouse) focus_by_mouse = true;
    // allow escaping click handler
    if (target?.dataset.action === 'default') return;

    event.preventDefault();
    const dropdown_item = /** @type {HTMLElement & {dataset: { pos: string }}} */ (event.target.closest('[data-pos]'));

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
        onDeselect(bound_item);
        bound_item && !is_focused && ref_input.focus();
        break;
      case 'select':
        const opt_position = parseInt(dropdown_item.dataset.pos);
        onSelect(null, options_filtered[opt_position]);
        break;
      case 'toggle':
        updateDropdownState(!is_dropdown_opened);
        break;
    }
  }

  /**
   * @param {KeyboardEvent} e
   */
   function on_key_down(e) {
    if (android() && !enter_hint && e.key === 'Enter') return true;

    disable_key_event_bubble = ['Enter', 'Escape'].includes(e.key) && is_dropdown_opened;
    processKeyDown(e);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function on_key_up(e) {
    if (disable_key_event_bubble) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
    disable_key_event_bubble = false;
  }

  /**
   * Required for mobile single select to work properly
   */
  function on_input() {
    if (selectedOptions.length === 1 && !multiple) {
      // input_value = '';
    }
  }

  function on_focus() {
    is_focused = true;
    updateDropdownState(focus_by_mouse);
    if (!is_tainted) is_tainted = true;
    collapseSelection === 'blur' && !is_dragging && setTimeout(() => {
      doCollapse = false;
    }, 100);
    onFocus(ref_input);
  }

  function on_blur() {
    is_focused = false;
    updateDropdownState(false);
    focus_by_mouse = false;
    if (resetOnBlur) {
      input_value = '';
    } else {
      fetch_controller && !fetch_initOnly && fetch_controller.abort('blur');
    }
    collapseSelection === 'blur' && !is_dragging && setTimeout(() => {
      doCollapse = true;
    }, 100);
    onBlur(ref_input);
  }

  /**
   * Enable create items by pasting
   */
   function on_paste(event) {
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

  function on_dnd_event(e) {
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

  /** @type {AbortController?} */
  let fetch_controller;

  /** @type {function|null} */
  let debouncedFetch;

  $effect(() => {
    trigger_fetch(input_value);
  });
  $effect(() => {
    watch_fetch_init(fetch, parentValue)
  });

  let listMessage = $state(fetch
    ? (fetch_initOnly
      ? i18n_actual.fetchInit
      : (minQuery > 1
        ? i18n_actual.fetchQuery(minQuery, 0)
        : i18n_actual.fetchBefore
      )
    )
    : (creatable
      ? i18n_actual.emptyCreatable
      : i18n_actual.empty
    )
  );

  /**
   *
   * @param {string?} fetch
   * @param {string|number|null|undefined} _parentValue
   */
  function watch_fetch_init(fetch, _parentValue) {
    if (!fetch) {
      debouncedFetch = null;
      return;
    }

    if (fetch_initOnly || fetch_initValue) {
      isFetchingData = true;
      fetch_runner({init: true}); // skip debounce on init
    }

    debouncedFetch = debounce(fetch_runner, fetchDebounceTime);
  }

  /**
   * User only for QUERY mode
   *
   * @param {string} inputValue
   */
  function trigger_fetch(inputValue) {
    if (fetch_initOnly || maxReached) {
      listMessage = maxReached
        ? i18n_actual.max(max)
        : i18n_actual.fetchInit;
      return;
    }
    if (debouncedFetch) {
      fetch_controller?.abort();
      isFetchingData = true;
      if (input_value.length < minQuery) {
        isFetchingData = false;
      }
      if (!optionResolver && fetchResetOnBlur) options_filtered_override = [];
      dropdown_show = inputValue.length >= minQuery
        ? creatable
        : true;
      listMessage = maxReached
        ? i18n_actual.max(max)
        : (minQuery <= 1
          ? i18n_actual.fetchBefore
          : i18n_actual.fetchQuery(minQuery, inputValue.length)
        );
      debouncedFetch();
    }
  }
  /**
   * @typedef {{
   *  init?: boolean,
   *  initValue?: any,
   *  storedValue?: boolean
   * }} FetchOptions
   *
   * @param {FetchOptions} opts
   */
  function fetch_runner(opts = {}) {
    fetch_controller?.abort();
    if ((opts.init !== true && !input_value.length) || (is_fetch_dependent && !parentValue)) {
      isFetchingData = false;
      if (fetchResetOnBlur) {
        prev_options = optionResolver ? optionResolver(options, selectedKeys) : [];
      }
      return;
    }

    if (input_value && input_value.length < minQuery) {
      isFetchingData = false;
      return;
    }

    // update fetchInitValue when fetch is changed, but we are in 'init' mode, ref #113
    if (fetch_initOnly && prev_value && (!multiple || prev_value?.length > 0)) fetch_initValue = prev_value;

    const initial = $state.snapshot(fetch_initValue || opts.initValue);
    let initialFetchValue;
    if (initial) {
      initialFetchValue = valueAsObject
        ? (multiple
          ? initial.map(opt => opt[currentValueField])
          : initial[currentValueField]
        )
        : initial;
    }

    if (fetch_initOnly) {
      listMessage = i18n_actual.fetchInit;
    // edge-case! To prevent initial 'empty' fetch with resolver
    } else if (initial && optionResolver) {
      fetch_initValue = null;
      listMessage = minQuery > 1
        ? i18n_actual.fetchQuery(minQuery, input_value.length)
        : i18n_actual.fetchBefore;
      return;
    }

    const built = defaults.requestFactory(input_value, { parentValue, url: fetch, initial: initialFetchValue }, fetchProps);
    fetch_controller?.abort();
    fetch_controller = built.controller;
    window.fetch(built.request)
      .then(resp => resp.json())
      // success
      .then((/** @type {object} */ json) => {
        // sveltekit returns error property
        if (!Array.isArray(json) && json?.error) onFetchError(json.error);
        return Promise.resolve(fetchCallback
          ? fetchCallback(json)
          : (json.data || json.items || json.options || json)
        )
          .then(data => {
            if (!Array.isArray(data)) {
              console.warn('[Svelecte]:Fetch - array expected, invalid property provided:', data);
              data = [];
            }
            options_flat_override = false;
            options_filtered_override = null;
            prev_options = flatList(data, itemConfig);
            onFetch(data);

            // tick().then(() => {
              if (initial) {
                fetch_initValue = null; // always reset
                watch_value_change(initial, { skipEqualityCheck: true });
                if ('storedValue' in opts) fetchResetOnBlur = opts.storedValue; // related to re-fetch
              }
            // })
          })
      })
      // error
      .catch(e => {
        if (e instanceof DOMException && e.name === 'AbortError') return true;
        options_filtered_override = null;
        prev_options = [];
        onFetchError(e);
        console.warn('[Svelecte] Fetch Error:', e);
      })
      // teardown
      .then(fetchAborted => {
        if (fetchAborted === true) return;
        listMessage = fetch_initOnly
          ? i18n_actual.empty
          : (initial
            ? (minQuery > 1
              ? i18n_actual.fetchQuery(minQuery, 0)
              : i18n_actual.fetchBefore
            )
            : i18n_actual.fetchEmpty
          );
        fetch_controller = null;
        isFetchingData = false;
        if (is_focused) updateDropdownState(true);

        if (is_dropdown_opened && !dropdown_show) {
          dropdown_show = true;
        }
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
    const dropdown_list_length = creatable && input_value
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
   * FUTURE: take into account searchable to keep inputmode=none - is this even valid?
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

    updateDropdownState(!is_dropdown_opened);
  }

  /**
   * @returns {[listHeight: number, itemSize?: number]}
   */
  function get_dropdown_dimensions() {
    if (virtualList) {
      return [
        pixelGetter(ref_container_scroll, 'maxHeight')
          - pixelGetter(ref_container_scroll, 'paddingTop')
          - pixelGetter(ref_container_scroll, 'paddingBottom'),
        ref_virtuallist?.resolveItemSize()
      ];
    }
    return [
      ref_container_scroll.offsetHeight,
      // @ts-ignore
      ref_container.firstElementChild.offsetHeight
    ];
  }

  //#endregion


  onMount(() => {
    is_mounted = true;
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#examples
    isIOS = navigator.platform.indexOf("Mac") === 0 || navigator.platform === "iPhone";
    meta_key = isIOS ? '⌘' : 'Ctrl';
    if (anchor_element) {
      // @ts-ignore
      ref_select_element = document.getElementById(anchor_element);
      ref_select_element.className = 'sv-hidden-element';
      ref_select_element.innerHTML = '';
      ref_select_element.tabIndex = -1;
      // this setup is required, because definition can be on el-svelecte only (not on underlying <select>)
      ref_select_element.disabled = disabled;
      ref_select_element.required = required;
      ref_select_element.multiple = multiple;
      !multiple && ref_select_element.insertAdjacentHTML('beforeend', '<option value="" selected>Empty</option>');
      selectedKeys.forEach(k => {
        ref_select_element.insertAdjacentHTML('beforeend', `<option value=${k} selected>${k}</option>`);
      });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) flipDurationMs = 0;
  });
</script>

{#snippet snippet_collapsedSelection(selectedOptions, i18n)}
  <span>{i18n.collapsedSelection(selectedOptions.length)}</span>
{/snippet}

{#snippet snippet_selection(selectedOptions, bindItemAction)}
  {#each selectedOptions as opt (opt[currentValueField])}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="sv-item--container" animate:flip={{duration: flipDurationMs }} onmousedown={e => e.preventDefault()}>
    <div class="sv-item--wrap in-selection" class:is-multi={multiple}>
      <div class="sv-item--content">{@html itemRenderer(opt, true)}</div>
    </div>
    {#if multiple}
    <button class="sv-item--btn" tabindex="-1" type="button"
      data-action="deselect"
      aria-label={i18n_actual.aria_removeItemLabel(opt, currentLabelField)}
      use:bindItemAction={opt}
    >
      <svg height="16" width="16" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
      </svg>
    </button>
    {/if}
  </div>
  {/each}
{/snippet}

{#snippet snippet_clearIcon(_selectedOptions, _inputValue)}
  {#if selectedOptions.length}
    <svg class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path></svg>
  {/if}
{/snippet}

{#snippet snippet_toggleIcon(_dropdownShow)}
<svg class="indicator-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
  <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
</svg>
{/snippet}

{#snippet snippet_option(opt, inputValue)}
<div class="sv-item--content">
  {@html highlightSearch(opt, false, inputValue, itemRenderer, disableHighlight) }
</div>
{/snippet}

{#snippet snippet_createRow(isCreating, inputValue, i18n)}
<span class:is-loading={isCreating}>{i18n.createRowLabel(inputValue)}</span>
<span class="shortcut"><kbd>{meta_key}</kbd>+<kbd>Enter</kbd></span>
{/snippet}

<div class={[`svelecte`, className]}
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
  >
    {#each selectedOptions as opt (opt[currentValueField])}
    <option value={opt[currentValueField]} selected>{opt[currentValueField]}</option>
    {/each}
  </select>
  {/if}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="sv-control {controlClass}" onmousedown={on_mouse_down} onclick={on_click}>
    {#if prepend}{@render prepend()}{/if}
    <!-- #region selection & input -->
    <div class="sv-control--selection" class:is-single={multiple === false} class:has-items={selectedOptions.length > 0} class:has-input={input_value.length}
      use:dndzone={{items: selectedOptions, flipDurationMs, type: inputId, dragDisabled: doCollapse }}
      onconsider={on_dnd_event}
      onfinalize={on_dnd_event}
    >
      {#if selectedOptions.length && multiple && doCollapse}
        {@render collapsedSelection(selectedOptions, i18n_actual)}
      {:else if selectedOptions.length}
        {@render selection(selectedOptions, bindItem)}
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
          onfocus={on_focus}
          onkeydown={on_key_down}
          onkeyup={on_key_up}
          oninput={on_input}
          onblur={on_blur}
          onpaste={on_paste}
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
        {@render clearIcon(selectedOptions, input_value)}
      </button>
      {/if}
      {#if clearable}<span class="sv-btn-separator"></span>{/if}
      <button type="button" class="sv-btn-indicator" class:sv-dropdown-opened={is_dropdown_opened}
        data-action="toggle" tabindex="-1"
      >
        {@render toggleIcon(is_dropdown_opened)}
      </button>
    </div>
    {#if append}{@render append()}{/if}
    <!-- #endregion -->
  </div>

  <!-- #region DROPDOWN -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="sv_dropdown {dropdownClass} " class:is-open={dropdown_show}
    onmousedown={on_mouse_down}
    onclick={on_click}
    use:positionResolver
  >
  {#if is_mounted && render_dropdown}
      {#if listHeader}{@render listHeader()}{/if}
      <div bind:this={ref_container_scroll} class="sv-dropdown-scroll" class:has-items={options_filtered.length>0} class:is-virtual={virtualList} tabindex="-1">
        <div bind:this={ref_container} class="sv-dropdown-content" class:max-reached={maxReached} >
          {#if virtualList && ref_container_scroll}
            <VirtualList
              bind:this={ref_virtuallist}
              maxHeight={get_dropdown_dimensions().shift()}
              itemHeight={vlItemSize}
              itemCount={options_filtered.length || 0}
              scrollToIndex={dropdown_index}
            >
              {#snippet children(index)}
                {@const opt = options_filtered[index] || {}}
                {#if opt.$isGroupHeader}
                  <div class="sv-optgroup-header"><b>{opt.label}</b></div>
                {:else}
                  <div data-pos={index}
                    class="sv-item--wrap in-dropdown {optionClass}"
                    class:sv-dd-item-active={dropdown_index === index}
                    class:is-selected={opt.$selected || selectedKeys.has(opt[currentValueField])}
                    class:is-disabled={opt[disabledField]}
                  >
                    {@render option(opt, input_value)}
                  </div>
                {/if}
              {/snippet}
            </VirtualList>
          {:else}
            {#each options_filtered as opt, i}
              {#if opt.$isGroupHeader}
                <div class="sv-optgroup-header"><b>{opt.label}</b></div>
              {:else}
                <div data-pos={i}
                  class="sv-item--wrap in-dropdown {optionClass}"
                  class:sv-dd-item-active={dropdown_index === i}
                  class:is-selected={opt.$selected}
                  class:is-disabled={opt[disabledField]}
                >
                  {@render option(opt, input_value)}
                </div>
              {/if}
            {/each}
          {/if}
        {#if options_filtered.length === 0 && (!creatable || !input_value) || maxReached}
          <div class="is-dropdown-row">
            <div class="sv-item--wrap in-dropdown {optionClass}"><div class="sv-item--content">{listMessage}</div></div>
          </div>
        {/if}
      </div>
    </div> <!-- scroll container end -->
    {#if creatable && input_value && !maxReached}
      <div class="is-dropdown-row">
        <button type="button" class="creatable-row" onclick={on_create} onmousedown={e => e.preventDefault()}
          class:active={(options_filtered.length ? options_filtered.length : 0) === dropdown_index}
          class:is-disabled={createFilterFn(input_value)}
          disabled={createFilterFn(input_value)}
        >
          {@render createRow(isCreating, input_value, i18n_actual)}
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
    --sv-min-height: 34px;
    --sv-bg: #fff;
    --sv-disabled-bg: #eee;
    --sv-border: 1px solid #ccc;
    --sv-border-radius: 4px;
    --sv-selection-gap: 4px;
    --sv-general-padding: 4px;
    --sv-control-bg: var(--sv-bg);
    --sv-selection-wrap-padding: 0px 3px 0px 4px;
    --sv-selection-multi-wrap-padding: 0px 3px 0px 6px;
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
    min-height: var(--sv-min-height, 34px);
  }

  .sv-control--selection {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: var(--sv-selection-gap, 4px);
    padding: var(--sv-selection-gap, var(--sv-general-padding, 4px));
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
  }
  :global(.sv-item--wrap.in-selection) {
    padding: var(--sv-selection-wrap-padding, 0px 3px 0px 4px);
  }
  :global(.sv-item--wrap.is-multi) {
    padding: var(--sv-selection-multi-wrap-padding, 0px 3px 0px 6px);
    background-color: var(--sv-item-selected-bg, #efefef);
  }
  :global(.sv-item--wrap.in-dropdown) {
    padding: var(--sv-item-wrap-padding, 3px 3px 3px 6px);
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
  }


  /** #region ************************************ buttons */
  :global(.sv-item--btn > svg) {
    fill: var(--sv-item-btn-color, var(--sv-icon-color, #bbb));
  }
  :global(.sv-item--btn:hover) {
    background-color: var(--sv-item-btn-bg-hover, #ddd);
  }
  :global(.sv-item--btn:hover > svg) {
    fill: var(--sv-item-btn-color-hover, #777);
  }

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

  }

  /*
   * moved selector to global due to https://github.com/sveltejs/svelte/issues/10143 -> https://github.com/sveltejs/svelte/pull/10208
   */
  .creatable-row :global(> .is-loading) {
    position: relative;
    &:after {
      left: calc(100% + 4px);
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
    position: absolute;
    pointer-events: none;
    display: inline-grid;
    vertical-align: top;
    align-items: center;

    &:after {
      content: attr(data-value) ' ';
      visibility: hidden;
      white-space: pre-wrap;
    }
  }
  .is-focused .sv-input--sizer {
    position: relative;
    pointer-events: all;
  }
  .has-items .keep-value:not(:focus) {
    color: transparent;
  }
  /* moved selector to global due to https://github.com/sveltejs/svelte/issues/10143 -> https://github.com/sveltejs/svelte/pull/10208 */
  .is-focused :global(.is-single.has-items.has-input > .sv-item--container) {
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
  }

  .sv-input--text {
    outline: none;
    &::placeholder {
      color: var(--sv-placeholder-color, #ccccd6);
    }
  }
  /* #endregion */
</style>
