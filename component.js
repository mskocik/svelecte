import Svelecte, { addFormatter, config } from './src/Svelecte.svelte';

export { addFormatter, config }

const OPTION_LIST = [
  'options', 'value',
  // form-related
  'name', 'required', 'disabled',
  // basic
  'value-field', 'label-field', 'disabled-field', 'placeholder',
  // UI, UX
  'searchable', 'clearable', 'renderer', 'disable-highlight', 'select-on-tab', 'reset-on-blur', 'reset-on-select',
  // multiple
  'multiple', 'max', 'collapse-selection',
  // creating
  'creatable', 'creatable-prefix', 'allow-editing', 'keepCreated', 'delimiter',
  // remote
  'fetch', 'fetch-reset-on-blur', 'min-query',
  // perf & virtual list
  'lazy-dropdown', 'virtual-list', 'vl-height', 'vl-item-size',
  // sifter
  'search-field', 'sort-field', 'disable-sifter',
  // others
  'label-as-value'
];

function formatValueProp(value, delimiter) {
  return value ? value.split(delimiter).map(item => {
    const _v = parseInt(item);
    return isNaN(_v) ? (item !== 'null' ? item : null) : _v;
  }) : ''
}

function formatValue(name, value) {
  switch (name) {
    case 'options':
      if (Array.isArray(value)) return value;
      try {
        value = JSON.parse(value);
        if (!Array.isArray(value)) {
          value = [];
        }
      } catch (e) {
        value = [];
      }
      return value;
    case 'renderer':
      return value || 'default';
    case 'required':
    case 'disabled':
    case 'searchable':
    case 'clearable':
    case 'disable-highlight':
    case 'select-on-tab':
    case 'reset-on-blur':
    case 'reset-on-select':
    case 'multiple':
    case 'collapse-selection':
    case 'creatable':
    case 'allow-editing':
    case 'keep-created':
    case 'fetch-reset-on-blur':
    case 'lazy-dropdown':
    case 'virtual-list':
    case 'disable-sifter':
    case 'label-as-value':
      return value !== null && value !== 'false';
    case 'max':
      return isNaN(parseInt(value)) ? 0 : parseInt(value);
    case 'min-query':
      return isNaN(parseInt(value)) ? config.minQuery : parseInt(value);
  }
  return value;
}

function formatProp(name) {
  if (name.includes('-')) return name.split('-').reduce((res, w, i) => {
    if (i) w = w[0].toUpperCase() + w.substr(1);
    return res+w;
  }, '');
  return name;
}

let volatileEmitChange = false;


/**
 * Connect Custom Component attributes to Svelte Component properties
 * @param {string} name Name of the Custom Component
 */
class SvelecteElement extends HTMLElement {
  constructor() {
    super();
    this.svelecte = undefined;
    this.anchorSelect = null;
    this._fetchOpts = null;
    this._selfSetValue = false;

    /** ************************************ public API */
    const baseProps = {
      'name': {
        get() {
          this.getAttribute('name');
        },
        set(value) {
          this.setAttribute('name', value);
        }
      },
      'selection': {
        get() {
          return this.svelecte
            ? this.svelecte.getSelection()
            : null;
        }
      },
      'value': {
        get() {
          return this.svelecte
            ? this.svelecte.getSelection(true)
            : null;
        },
        set(value) {
          const delim = this.getAttribute('value-delimiter') || ',';
          this.setAttribute('value', Array.isArray(value) ? value.join(delim) : value);
        }
      },
      'options': {
        get() {
          return this.hasAttribute('options')
            ? JSON.parse(this.getAttribute('options'))
            : (this._fetchOpts || []);
        },
        set(value) {
          this.setAttribute('options', Array.isArray(value) ? JSON.stringify(value) : value);
        }
      },
      'hasAnchor': {
        get() {
          return this.anchorSelect ? true : false;
        }
      },
      'form': {
        get() {
          return this.closest('form');
        }
      },
      'emitChange': {
        get() {
          volatileEmitChange = true;
          return this;
        }
      },
      'valueField': {
        get() {
          return this.getAttribute('value-field') || config.valueField;
        },
        set(value) {
          this.setAttribute('value-field', value);
        }
      },
      'labelField': {
        get() {
          return this.getAttribute('label-field') || config.labelField;
        },
        set(value) {
          this.setAttribute('label-field', value);
        }
      },
      'delimiter': {
        get() {
          return this.getAttribute('delimiter') || config.delimiter;
        },
        set(value) {
          this.setAttribute('delimiter', value);
        }
      },
      'lazyDropdown': {
        get() {
          return this.hasAttribute('lazy-dropdown')
            ? true
            : config.lazyDropdown;
        },
        set() {
          console.warn('⚠ this setter has no effect after component has been created')
        }
      },
      'placeholder': {
        get() {
          return this.getAttribute('placeholder') || config.placeholder;
        },
        set(value) {
          this.setAttribute('placeholder', value);
        }
      },
      'max': {
        get() {
          return this.getAttribute('max') || config.max;
        },
        set(value) {
          try {
            value = parseInt(value);
            if (value < 0) value = 0;
          } catch (e) {
            value = 0;
          }
          this.setAttribute('max', value);
        }
      },
      'minQuery': {
        get() {
          return this.getAttribute('min-query') || config.minQuery;
        },
        set(value) {
          try {
            value = parseInt(value);
            if (value < 1) value = 1;
          } catch (e) {
            value = config.minQuery;
          }
          this.setAttribute('min-query', value);
        }
      },
      'creatablePrefix': {
        get() {
          return this.getAttribute('creatable-prefix') || config.creatablePrefix
        },
        set(value) {
          this.setAttribute('creatable-prefix', value);
        }
      },
      'renderer': {
        get() {
          return this.getAttribute('renderer') || 'default';
        },
        set(value) {
          if (value) {
            this.setAttribute('renderer', value);
          } else {
            this.removeAttribute('renderer');
          }
        }
      }
    };
    const boolProps = ['searchable','clearable','disable-highlight', 'required', 'select-on-tab','reset-on-blur','reset-on-select',
      'multiple','collapse-selection','creatable','allow-editing','keep-created','fetch-reset-on-blur',
      'virtual-list','disable-sifter','label-as-value', 'disabled'
    ].reduce((res, propName) => {
      const formatted = formatProp(propName);
      res[formatted] = {
        get() {
          const hasProp = this.hasAttribute(propName);
          const notFalse = hasProp ? this.getAttribute(propName) !== 'false' : true;
          return !hasProp ? config[formatted] : notFalse;
        },
        set(value) {
          if (!value) {
            if (this.hasAttribute(propName)) {
              this.removeAttribute(propName);
            } else {
              // set directly to false, when config default is true
              this.svelecte && this.svelecte.$set({ [formatted]: value });
            }
          } else {
            this.setAttribute(propName, value = true ? '' : value);
          }
        }
      }
      return res;
    }, {});

    Object.defineProperties(this, Object.assign({}, baseProps, boolProps));
  }

  focus() {
    !this.disabled && this.querySelector('input').focus();
  }

  static get observedAttributes() {
    return OPTION_LIST;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.svelecte && oldValue !== newValue) {
      if (name === 'value') {
        if (!this._selfSetValue) {
          newValue
            ? this.svelecte.setSelection(formatValue(name, newValue), volatileEmitChange)
            : this.svelecte.clearByParent(this.parent ? true : false);
        }
        this._selfSetValue = false;
        volatileEmitChange = false;
        this.anchorSelect && setTimeout(() => {
          const value = this.svelecte.getSelection(true);
          this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
            if (!item) {
              res+= '<option value="" selected="">Empty</option>';
              return res;
            }
            res+= `<option value="${item}" selected>${item}</option>`;
            return res;
          }, '');
        });
        return;
      }
      this.svelecte.$set({ [formatProp(name)]: formatValue(name, newValue) });
    }
  } 

  connectedCallback() {
    setTimeout(() => { this.render() });
  }

  render() {
    if (this.svelecte) return;
    let props = {};
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        props[formatProp(attr)] = attr !== 'value'
          ? formatValue(attr, this.getAttribute(attr))
          : formatValueProp(this.getAttribute('value'), this.getAttribute('value-delimiter') || ',');
      }
    }
    if (this.hasAttribute('i18n')) {
      const i18nObj = JSON.parse(this.getAttribute('i18n'));
      if (i18nObj.createRowLabel) {
        const labelText = i18nObj.createRowLabel;
        i18nObj.createRowLabel = value => labelText.replace('#value', value);
      }
      props.i18n = i18nObj;
    }
    if (this.hasAttribute('class')) {
      props.class = this.getAttribute('class');
    }
    if (this.hasAttribute('parent')) {
      this.parent = document.getElementById(this.getAttribute('parent'));
      if (!this.parent.value && this.svelecte) {
        return;
      };
      const parentValue = this.parent.value || this.parent.getAttribute('value'); // for 'fetch'ed parent, value is always null
      if (parentValue) {
        props.disabled = false;
        props.fetch = this.getAttribute('fetch').replace('[parent]', parentValue);
      } else {
        delete props['fetch'];
        props.disabled = true;
      }
      this.parentCallback = e => {
        if (!e.target.selection || (Array.isArray(e.target.selection) && !e.target.selection.length)) {
          this.svelecte.clearByParent(true);
          return;
        }
        !this.parent.disabled && this.removeAttribute('disabled');
        if (this.hasAttribute('fetch')) {
          this.svelecte.clearByParent(true);
          const fetchUrl = this.getAttribute('fetch').replace('[parent]', e.target.value);
          this.svelecte.$set({ fetch: fetchUrl, disabled: false });
        }
      };
      this.parent.addEventListener('change', this.parentCallback);
    }
    const anchorSelect = this.querySelector('select');
    if (anchorSelect) {
      props['hasAnchor'] = true;
      anchorSelect.style = 'opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px';
      anchorSelect.tabIndex = -1; // just to be sure
      this.anchorSelect = anchorSelect;
      this.anchorSelect.multiple = props.multiple || anchorSelect.name.includes('[]');
      (Array.isArray(props.value) ? props.value : [props.value || null]).forEach(val => {
        this.anchorSelect.innerHTML += `<option value="${val || ''}" selected>${val || 'No value'}</option>`;
      });
    }
    this.svelecte = new Svelecte({
      target: this,
      anchor: anchorSelect,
      props,
    });
    // event listeners
    this.svelecte.$on('change', e => {
      const value = this.svelecte.getSelection(true);
      this._selfSetValue = true;
      this.value = value;
      setTimeout(() => {
        this._selfSetValue = false;
      }, 100);
      // Custom-element related
      if (this.anchorSelect) {
        this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
          if (!item) {
            res+= '<option value="" selected="">Empty</option>';
            return res;
          }
          res+= `<option value="${item}" selected>${item}</option>`;
          return res;
        }, '');
        this.anchorSelect.dispatchEvent(new Event('change'));
      }
      this.dispatchEvent(e);
    });
    this.svelecte.$on('fetch', e => {
      this._fetchOpts = e.detail;
      this.dispatchEvent(e);
    });
    this.svelecte.$on('createoption', e => {
      this.dispatchEvent(e);
    });
    return true;
  }

  disconnectedCallback() {
    this.svelecte && this.svelecte.$destroy();
    this.parent && this.parent.removeEventListener('change', this.parentCallback);
  }
}

export function registerSvelecte(name) {
  window.customElements.define(name || 'el-svelecte', SvelecteElement);
}
