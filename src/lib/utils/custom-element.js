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

];
/**
 * You can specify 'create-row-label' on component level. Placeholder {value} will be replaced with current value
 */

const intRegex = /^[0-9]+$/;

function formatValueProp(value, delimiter) {
  return value ? value.split(delimiter).map(item => {
    const _v = intRegex.test(value) ? parseInt(value) : value;
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
      return value !== null && value !== 'false';
    case 'max':
      return isNaN(parseInt(value)) ? 0 : parseInt(value);
    case 'min-query':
      return isNaN(parseInt(value)) ? _config.minQuery : parseInt(value);
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

let _component;
/** @type {import("$lib/settings").Settings} */
let _config;

/**
 * @type {HTMLElement & {
 *  disabled: boolean,
 *  parent: HTMLSelectElement?
 * }}
 */
class SvelecteElement extends HTMLElement {
  constructor() {
    super();
    this.svelecte = undefined;
    this.anchorSelect = null;
    this._fetchOpts = null;
    this._selfSetValue = false;
    this._resetHandler = null;

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
          if (value === null) value = '';
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
          return this.anchorSelect
            ? this.anchorSelect.form
            : this.closest('form');
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
          return this.getAttribute('value-field') || _config.valueField;
        },
        set(value) {
          this.setAttribute('value-field', value);
        }
      },
      'labelField': {
        get() {
          return this.getAttribute('label-field') || _config.labelField;
        },
        set(value) {
          this.setAttribute('label-field', value);
        }
      },
      'delimiter': {
        get() {
          return this.getAttribute('delimiter') || _config.delimiter;
        },
        set(value) {
          this.setAttribute('delimiter', value);
        }
      },
      'lazyDropdown': {
        get() {
          return this.hasAttribute('lazy-dropdown')
            ? true
            : _config.lazyDropdown;
        },
        set() {
          console.warn('⚠ this setter has no effect after component has been created')
        }
      },
      'placeholder': {
        get() {
          return this.getAttribute('placeholder') || _config.placeholder;
        },
        set(value) {
          this.setAttribute('placeholder', value);
        }
      },
      'max': {
        get() {
          return this.getAttribute('max') || _config.max;
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
          return this.getAttribute('min-query') || _config.minQuery;
        },
        set(value) {
          try {
            value = parseInt(value);
            if (value < 1) value = 1;
          } catch (e) {
            value = _config.minQuery;
          }
          this.setAttribute('min-query', value);
        }
      },
      'creatablePrefix': {
        get() {
          return this.getAttribute('creatable-prefix') || _config.creatablePrefix
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
          return !hasProp ? _config[formatted] : notFalse;
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
    // @ts-ignore
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
            : this.svelecte.clearByParent(this.parent ? true : false, volatileEmitChange);
        }
        this._selfSetValue = false;
        volatileEmitChange = false;
        return;
      }
      this.svelecte.$set({ [formatProp(name)]: formatValue(name, newValue) });
    }
  }

  connectedCallback() {
    if (this.svelecte) return;
    let props = {};
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        props[formatProp(attr)] = attr !== 'value'
          ? formatValue(attr, this.getAttribute(attr))
          : formatValueProp(this.getAttribute('value'), this.getAttribute('value-delimiter') || ',');
      }
    }
    if (this.hasAttribute('create-row-label')) {
      const label = this.getAttribute('create-row-label');
      const localI18n = {
        createRowLabel: value => label.replace('{value}', value)
      };
      props.i18n = localI18n;
    }
    if (this.hasAttribute('class')) {
      props.class = this.getAttribute('class');
    }
    if (this.hasAttribute('parent')) {
      // @ts-ignore
      this.parent = document.getElementById(this.getAttribute('parent'));
      if (!this.parent.value && this.svelecte) {
        return;
      };
      const parentValue = this.parent.value || this.parent.getAttribute('value'); // for 'fetch'ed parent, value is always null
      props.parentValue = parentValue;
      this.parentCallback = e => {
        this.svelecte.$set({ parentValue: e.target.value });
      };
      this.parent.addEventListener('change', this.parentCallback);
    }
    const anchorSelect = (/** @type {HTMLSelectElement} */(/** @type {unknown} */ this.previousElementSibling));
    if (anchorSelect && anchorSelect.tagName==='SELECT') {
      props['anchor_element'] = anchorSelect.id;
      anchorSelect.style.cssText = 'opacity: 0; position: absolute; z-index: -2; top: 0; height: 38px';
      anchorSelect.tabIndex = -1; // just to be sure
      this.anchorSelect = anchorSelect;
      this.anchorSelect.multiple = props.multiple || anchorSelect.name.includes('[]');
      const initialValue = Array.isArray(props.value) ? props.value : [props.value || null].filter(e => e);
      anchorSelect.options.length !== initialValue.length && initialValue.forEach(val => {
        this.anchorSelect.innerHTML += `<option value="${val || ''}" selected>${val || 'No value'}</option>`;
      });
      setTimeout(() => {
        this.firstElementChild.appendChild(anchorSelect);
      });
    }
    this.svelecte = new _component({
      target: this,
      props,
    });
    // event listeners
    this.svelecte.$on('change', e => {
      const value = this.svelecte.getSelection(true);
      this._selfSetValue = true;
      this.value = value !== null ? value : ''; // this updates <option selected> items
      setTimeout(() => {
        this._selfSetValue = false;
      }, 100);
      // Custom-element related
      if (this.anchorSelect) {
        const value = this.svelecte.getSelection(true);
        // @ts-ignore
        const isMultiple = this.multiple;
        this.anchorSelect.innerHTML = (Array.isArray(value) ? (value.length ? value : [null]) : [value]).reduce((res, item) => {
          res+= item === '' || item === null
            ? (isMultiple ? '' : '<option value="" selected="">Empty</option>')
            : `<option value="${item}" selected>${item}</option>`;
          return res;
        }, '');
        this.anchorSelect.dispatchEvent(new Event('change'));
      };
      this.dispatchEvent(e);
    });
    this.svelecte.$on('fetch', e => {
      this._fetchOpts = e.detail;
      this.dispatchEvent(e);
    });
    this.svelecte.$on('createoption', e => {
      this.dispatchEvent(e);
    });

    const form = anchorSelect
      ? anchorSelect.form
      : this.closest('form');
    if (form) {
      this._resetHandler = this.resetHandler.bind(this);
      form.addEventListener('reset', this._resetHandler);
    }

    return true;
  }

  disconnectedCallback() {
    this.svelecte && this.svelecte.$destroy();
    this.parent && this.parent.removeEventListener('change', this.parentCallback);
    const form = this.anchorSelect
      ? this.anchorSelect.form
      : this.closest('form');
    if (form) form.removeEventListener('reset', this._resetHandler);
  }

  resetHandler() {
    // @ts-ignore
    this.svelecte.setSelection(null, true);
  }
}

/**
 * Define custom element
 *
 * @param {string} name custom-element name
 * @param {object} component Svelecte component
 * @param {import("$lib/settings").Settings} globalConfig globally available config
 */
export function registerSvelecte(name, component, globalConfig) {
  _component = component
  _config = globalConfig;
  window.customElements.define(name, SvelecteElement);
}
