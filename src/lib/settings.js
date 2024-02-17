/**
 * @callback i18n_max
 * @param {number} max
 * @returns {string}
 *
 * @callback i18n_fetchQuery
 * @param {number} max
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
 * @callback i18n_collapseSelectionFn
 * @param {number} selectionCount
 * @param {object[]} selection
 * @this {I18nObject}
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
 *
 * @typedef {object} Settings
 * @property {boolean} disabled
 * @property {boolean} disabled
 * @property {boolean} disabled
 *
 * @property {string|null} valueField,
 * @property {string|null} labelField,
 * @property {string} groupLabelField: 'label',
 * @property {string} groupItemsField: 'options',
 * @property {string} disabledField: '$disabled',
 * @property {string} placeholder: 'Select',
 * @property {boolean} valueAsObject: false,
 * @property {boolean} searchable: true,
 * @property {boolean} clearable: false,
 * @property {boolean} highlightFirstItem: true,
 * @property {null|true|'select-navigate'} selectOnTab: null,        // recognize values: null, truthy, 'select-navigate'
 * @property {boolean} resetOnBlur: true,
 * @property {boolean} resetOnSelect: true,
 * @property {boolean} fetchResetOnBlur: true,
 * @property {boolean} multiple: false,
 * @property {boolean|string} closeAfterSelect: 'auto',
 * @property {number} max: 0,
 * @property {boolean} collapseSelection: false, // enable collapsible multiple selection
 * @property {boolean} alwaysCollapsed: false,
 * @property {boolean} creatable: false,
 * @property {string} creatablePrefix: '*',
 * @property {boolean} keepCreated: true,
 * @property {boolean} allowEditing: false,
 * @property {string} delimiter: ',',
 * @property {function} fetchCallback: null,
 * @property {number} minQuery: 1,
 * @property {boolean} lazyDropdown: true,
 * @property {boolean} virtualList: false,
 * @property {number|null} vlItemSize: null,
 * @property {number|null} vlHeight: null,
 * @property {I18nObject} i18n
 * @property {i18n_collapseSelectionFn} collapseSelectionFn
 */
const /**@type {Settings} */ settings = {
  // html
  disabled: false,
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
  selectOnTab: null,        // recognize values: null, truthy, 'select-navigate'
  resetOnBlur: true,
  resetOnSelect: true,
  fetchResetOnBlur: true,
  // multi
  multiple: false,
  closeAfterSelect: 'auto',
  max: 0,
  collapseSelection: false, // enable collapsible multiple selection
  alwaysCollapsed: false,
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
    empty: 'No options',
    nomatch: 'No matching options',
    max: num => `Maximum items ${num} selected`,
    fetchBefore: 'Type to start searching',
    fetchQuery: (minQuery, inputLength) => `Type ${minQuery > 1 && minQuery > inputLength
      ? `at least ${minQuery - inputLength} characters `
      : '' }to start searching`,
    fetchInit: 'Fetching data, please wait...',
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => `${count} selected`,
    createRowLabel: value => `Create '${value}'`
  },
  /**
   * Bound to 'i18n'
   *
   * @this {I18nObject}
   * @param {number} selectionCount
   * @param {object[]} selection
   * @returns {string}
   */
  collapseSelectionFn: function(selectionCount, selection) {
    return this.collapsedSelection(selectionCount);
  },
}

export default settings;
