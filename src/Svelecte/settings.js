const settings = {

  /** ************************************ sub-component props */
  /* HTML related */
  name: null, // if name is defined, <select> element is created as well
  
  required: false,
  multiple: false,
  searchable: true,     // TODO: implement
  disabled: false,
  creatable: false,
  clearable: false,
  selectOnTab: false,
  placeholder: 'Select',
  valueField: 'value',  // TODO: implement
  labelField: 'text',   // TODO: implement
  searchMode: 'auto',   // TODO: implement - means, when there are optgroups, don't use Sifter
  max: 0,
  renderer: 'default',
}

export default settings;
