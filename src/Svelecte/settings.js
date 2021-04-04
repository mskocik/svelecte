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
  virtualList: false,
  // enable collapsible multiple selection
  collapseSelection: false, 
  i18n: {
    empty: 'No options',
    nomatch: 'No matching options',    
    max: num => `Maximum items ${num} selected`,
    fetchBefore: 'Type to search',
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => {
      // example of plural collapse
      // switch (count) {
      //   case 1: return '1 selected';
      // }
      return `${count} selected`;
    }
  }
}

export default settings;
