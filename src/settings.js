const settings = {
  valueField: null,
  labelField: null,
  required: false,
  placeholder: 'Select',
  searchable: true,
  disabled: false,
  // ui
  clearable: false,
  selectOnTab: false,
  resetOnBlur: true,
  // multi
  multiple: false,
  max: 0,
  collapseSelection: false, // enable collapsible multiple selection
  // html
  name: null, // if name is defined, <select> element is created as well
  // create
  creatable: false,
  creatablePrefix: '*',
  delimiter: ',',
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
    collapsedSelection: count => `${count} selected`
  },
  collapseSelectionFn: function(selectionCount, selection) {
    return settings.i18n.collapsedSelection(selectionCount);
  }
}

export default settings;
