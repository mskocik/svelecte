const settings = {
  // html
  disabled: false,
  // basic
  valueField: null,
  labelField: null,
  disabledField: '$disabled',
  placeholder: 'Select',
  valueAsObject: false,
  // ui
  searchable: true,
  clearable: false,
  selectOnTab: false,
  resetOnBlur: true,
  resetOnSelect: true,
  fetchResetOnBlur: true,
  // multi
  multiple: false,
  max: 0,
  collapseSelection: false, // enable collapsible multiple selection
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
  collapseSelectionFn: function(selectionCount, selection) {
    return settings.i18n.collapsedSelection(selectionCount);
  }
}

export default settings;
