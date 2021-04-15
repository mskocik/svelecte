import Svelecte, { addFormatter, config } from './Svelecte/Svelecte.svelte';

const OPTION_LIST = [
  'options', 'fetch', 'name', 'required', 'value',
  'multiple','disabled', 'max', 'creatable', 'delimiter',
  'placeholder', 'renderer', 'searchable', 'clearable', 'fetch', 'valueField', 'labelField',
  'anchor'
];

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
    case 'value':
      return value ? value.split(',').map(item => {
        const _v = parseInt(item);
        return isNaN(_v) ? item : _v;
      }) : '';
    case 'renderer':
      return value || 'default';
    case 'searchable':
      return value == 'true';
    case 'clearable':
      return value != 'false';
    case 'required':
    case 'multiple':
    case 'creatable':
    case 'selectOnTab':
      return value !== null;
    case 'disabled':
      return value !== null;
    case 'max':
      return isNaN(parseInt(value)) ? 0 : parseInt(value);
    case 'anchor':
      return value ? document.getElementById(value) : null;
  }
  return value;
}

export { addFormatter, config };

/**
 * Connect Custom Component attributes to Svelte Component properties
 * @param {string} name Name of the Custom Component
 */
export const SvelecteElement = class extends HTMLElement {
  constructor() {
    super();
    this.svelecte = undefined;
    this._fetchOpts = null;
    
    /** ************************************ public API */
    this.setOptions = options => this.svelecte.setOptions(options);
    Object.defineProperties(this, {
      'selection': {
        get() {
          return this.svelecte.getSelection();
        }
      },
      'value': {
        get() {
          return this.svelecte.getSelection(true);
        },
        set(value) {
          this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
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
      'disabled': {
        get() {
          return this.getAttribute('disabled') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('disabled');
          } else {
            this.setAttribute('disabled', value === true ? '' : value);
          }
        }
      },
      'multiple': {
        get() {
          return this.getAttribute('multiple') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('multiple');
          } else {
            this.setAttribute('multiple', value === true ? '' : value);
          }
        }
      },
      'creatable': {
        get() {
          return this.getAttribute('creatable') !== null;
        },
        set(value) {
          if (!value) { 
            this.removeAttribute('creatable');
          } else {
            this.setAttribute('creatable', value === true ? '' : value);
          }
        }
      },
      'clearable': {
        get() {
          return this.getAttribute('clearable') !== 'false';
        },
        set(value) {
          this.setAttribute('clearable', value ? 'true' : 'false');
        }
      },
      'placeholder': {
        get() {
          return this.getAttribute('placeholder') || '';
        },
        set(value) {
          this.setAttribute('placeholder', value || 'Select');
        }
      },
      'renderer': {
        get() {
          return this.getAttribute('renderer') || 'default';
        },
        set(value) {
          value && this.setAttribute('renderer', value);
        }
      },
      'required': {
        get() {
          return this.hasAttribute('required');
        },
        set(value) {
          console.log('>S', value);
          if (!value && value !== '') {
            this.removeAttribute('required');
          } else {
            this.setAttribute('required', '');
          }
        }
      },
      'anchor': {
        get() {
          return this.getAttribute('anchor');
        },
        set(value) {
          this.setAttribute('anchor', value);
        }
      },
      'max': {
        get() {
          return this.getAttribute('max') || 0;
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
      'delimiter': {
        get() {
          return this.getAttribute('delimiter') || ',';
        },
        set(value) {
          this.setAttribute('delimiter', value);
        }
      },
      'valueField': {
        get() {
          return this.getAttribute('valueField') || '';
        },
        set(value) {
          this.setAttribute('valueField', value);
        }
      },
      'labelField': {
        get() {
          return this.getAttribute('labelField') || '';
        },
        set(value) {
          this.setAttribute('labelField', value);
        }
      }
    });
  }

  focus() {
    !this.disabled && this.querySelector('input').focus();
  }

  static get observedAttributes() {
    return OPTION_LIST;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this.svelecte && oldValue !== newValue) {
      name === 'value'
        ? this.svelecte.setSelection(formatValue(name, newValue))
        : this.svelecte.$set({ [name]: formatValue(name, newValue) });
    }
  }

  connectedCallback() {
    if (this.hasAttribute('parent') || this.hasAttribute('anchor') || this.hasAttribute('lazy')) {
      setTimeout(() => { this.render() });
    } else {
      this.render();
    }
  }

  render() {
    let props = {};
    for (const attr of OPTION_LIST) {
      if (this.hasAttribute(attr)) {
        console.log(attr);
        props[attr] = formatValue(attr, this.getAttribute(attr));
      }
    }
    if (this.hasAttribute('class')) {
      props.class = this.getAttribute('class');
    }
    if (this.hasAttribute('parent')) {
      delete props['fetch'];
      props.disabled = true;
      this.parent = document.getElementById(this.getAttribute('parent'));
      if (!this.parent.value && this.svelecte) {
        return;
      };
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
      props['anchor'] = anchorSelect;
      anchorSelect.tabIndex = -1; // just to be sure
    }
    // if (this.childElementCount > 0) {
    //   props.options = Array.prototype.slice.call(this.children).map(opt => {
    //     return Object.assign({
    //       isSelected: opt.selected,
    //       isDisabled: opt.disabled
    //     }, opt.dataset.data ? JSON.parse(opt.dataset.data)
    //       : {
    //         value: opt.value,
    //         text: opt.text,
    //       }
    //     );
    //   });
    //   this.innerHTML = '';
    // }
    this.svelecte = new Svelecte({
      target: this,
      anchor: anchorSelect,
      props,
    });
    this.svelecte.$on('change', e => {
      const value = this.svelecte.getSelection(true);
      this.setAttribute('value', Array.isArray(value) ? value.join(',') : value);
      this.dispatchEvent(e);
    });
    this.svelecte.$on('fetch', e => {
      this._fetchOpts = e.detail;
      this.dispatchEvent(e);
    });
    return true;
  }

  disconnectedCallback() {
    this.svelecte && this.svelecte.$destroy();
    this.parent && this.parent.removeEventListener('change', this.parentCallback);
  }
}
