/**
 * @callback i18n_max
 * @param {number} max
 * @returns {string}
 *
 * @callback i18n_fetchQuery
 * @param {number} minQuery
 * @param {number} inputLength
 * @returns {string}
 *
 * @callback i18n_collapsedSelection
 * @param {number} count
 * @returns {string}
 *
 * @callback i18n_createRowLabel
 * @param {string} value
 * @returns {string}
 *
 * @callback i18n_aria_selection
 * @param {string[]} opts
 * @returns {string}
 *
 * @callback i18n_aria_listActive
 * @param {object} opt
 * @param {string} labelField
 * @param {number} resultCount
 * @returns {string}
 *
 * @callback i18n_aria_inputFocus
 * @returns {string}
 *
 * @typedef {object} I18nObject
 * @property {string} empty
 * @property {string} nomatch
 * @property {i18n_max} max
 * @property {string} fetchBefore
 * @property {i18n_fetchQuery} fetchQuery
 * @property {string} fetchInit
 * @property {string} fetchEmpty
 * @property {i18n_collapsedSelection} collapsedSelection
 * @property {i18n_createRowLabel} createRowLabel
 * @property {string} emptyCreatable
 * @property {i18n_aria_selection} aria_selected
 * @property {i18n_aria_listActive} aria_listActive
 * @property {i18n_aria_inputFocus} aria_inputFocused
 * @property {string} aria_label
 * @property {string} aria_describedby
 *
 * @typedef {object} Settings
 * @property {string|null} valueField
 * @property {string|null} labelField
 * @property {string} groupLabelField
 * @property {string} groupItemsField
 * @property {string} disabledField
 * @property {string} placeholder
 * @property {boolean} valueAsObject
 * @property {boolean} searchable
 * @property {boolean} clearable
 * @property {boolean} highlightFirstItem
 * @property {boolean|'select-navigate'} selectOnTab
 * @property {boolean} resetOnBlur
 * @property {boolean} resetOnSelect
 * @property {boolean} fetchResetOnBlur
 * @property {number} fetchDebounceTime
 * @property {boolean} multiple
 * @property {boolean|string} closeAfterSelect
 * @property {number} max
 * @property {'blur'|'always'|null} collapseSelection
 * @property {'auto'|boolean} keepSelectionInList
 * @property {boolean} creatable
 * @property {string} creatablePrefix
 * @property {boolean} keepCreated
 * @property {boolean} allowEditing
 * @property {string} delimiter
 * @property {function} fetchCallback
 * @property {number} minQuery
 * @property {boolean} lazyDropdown
 * @property {boolean} virtualList
 * @property {number|null} vlItemSize
 * @property {number|null} vlHeight
 * @property {I18nObject} i18n
 * @property {import("./utils/fetch").RequestFactoryFn} requestFactory
 */
const /**@type {Settings} */ settings = {
  // basic
  valueField: null,
  labelField: null,
  groupLabelField: 'label',
  groupItemsField: 'options',
  disabledField: '$disabled',
  placeholder: 'Select',
  valueAsObject: false,
  // ui
  searchable: true,
  clearable: false,
  highlightFirstItem: true,
  selectOnTab: false,
  resetOnBlur: true,
  resetOnSelect: true,
  fetchResetOnBlur: true,
  fetchDebounceTime: 300,
  // multi
  multiple: false,
  closeAfterSelect: 'auto',
  max: 0,
  collapseSelection: null,
  keepSelectionInList: 'auto',
  // create
  creatable: false,
  creatablePrefix: '*',
  keepCreated: true,
  allowEditing: false,
  delimiter: ',',
  // remote
  fetchCallback: null,
  minQuery: 1,
  // performance
  lazyDropdown: true,
  // virtual list
  virtualList: false,
  vlItemSize: null,
  vlHeight: null,
  // i18n
  i18n: {
    aria_label: '',
    aria_describedby: '',
    aria_selected: (opts) => opts.length ? `Option${opts.length > 1 ? 's' : ''} ${opts.join(', ')} selected.` : '',
    aria_listActive: (opt, labelField, count) => `You are currently focused on option ${opt[labelField]}. ${count} result${count>1?'s': ''} available.`,
    aria_inputFocused: () => 'Select is focused, type to refine list, press down to scroll through the list',
    empty: 'No options',
    nomatch: 'No matching options',
    max: num => `Maximum items ${num} selected`,
    fetchBefore: 'Type to start searching',
    fetchQuery: (minQuery, inputLength) => `Type at least ${minQuery} character${
        minQuery > 1 ? 's' : ''
      } to start searching`
    ,
    fetchInit: 'Fetching data, please wait...',
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => `${count} selected`,
    createRowLabel: value => `Add '${value}'`,
    emptyCreatable: 'Add new by typing'
  },
  requestFactory: null
}

export default settings;
