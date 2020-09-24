const settings = {

  /** ************************************ sub-component props */
  /* HTML related */
  name: null, // if name is defined, <select> element is created as well
  
  required: false,
  multiple: false,
  searchable: true,
  disabled: false,
  creatable: false,
  clearable: false,
  selectOnTab: false,
  placeholder: 'Select',
  valueField: null,
  labelField: null,
  max: 0,
  delimiter: ',',
  sortRemoteResults: true,
  i18n: {
    empty: 'No options',
    nomatch: 'No matching options',    
    max: 'Maximum items :maxItems selected',
    fetchBefore: 'Type to search',
    fetchWait: 'Stop typing to search',
    fetchEmpty: 'No data related to your search'
  }
}

export default settings;
