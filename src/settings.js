const settings = {
  // html
  disabled: false,
  // basic
  valueField: null,
  labelField: null,
  disabledField: '$disabled',
  placeholder: 'Select',
  // ui
  searchable: true,
  clearable: false,
  selectOnTab: false,
  resetOnBlur: true,
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
    fetchBefore: 'Type to search',
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => `${count} selected`,
    createRowLabel: value => `Create '${value}'`
  },
  collapseSelectionFn: function(selectionCount, selection) {
    return settings.i18n.collapsedSelection(selectionCount);
  }
}

export default settings;
