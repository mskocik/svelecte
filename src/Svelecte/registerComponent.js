import Svelecte from './Svelecte.svelte';

const OPTION_LIST = [
  'options', 'fetch', 'name', 'required',
  'multiple','disabled', 'max', 'creatable', 
  'placeholder', 'renderer', 'searchable', 'clearable', 'css'
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
    case 'renderer':
      return value || 'default';
    case 'searchable':
      return value == 'true';
    case 'clearable':
      return value != 'false';
    case 'multiple':
    case 'creatable':
    case 'selectOnTab':
      return value !== null;
    case 'disabled':
      return value !== null;
    case 'max':
      return isNaN(parseInt(value)) ? 0 : parseInt(value);
  }
  return value;
}

/**
 * Connect Web Component attributes to Svelte Component properties
 * @param {string} name Name of the Web Component
 */
export function registerSvelecte(name) {
  return customElements.define(name, class extends HTMLElement {
    constructor() {
      super();
      this.svelecte = undefined;
      
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
            const val = this.svelecte.getSelection();
            return this.multiple ? val.map(v => v.value) : val.value;
          },
          set(value) {
            this.svelecte.setSelection(value);
          }
        },
        'options': {
          get() {
            return JSON.parse(this.getAttribute('options'));
          },
          set(value) {
            this.setAttribute('options', JSON.stringify(value));
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
        }
      });
    }

    static get observedAttributes() {
      return OPTION_LIST;
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (this.svelecte && oldValue !== newValue) {
        this.svelecte.$set({ [name]: formatValue(name, newValue) });
      }
    }

    connectedCallback() {
      let props = {};

      setTimeout(() => {
        for (const attr of OPTION_LIST) {
          if (this.hasAttribute(attr)) {
            props[attr] = formatValue(attr, this.getAttribute(attr));
          }
        }
        if (this.childElementCount > 0) {
          props.options = Array.prototype.slice.call(this.children).map(opt => {
            return Object.assign({
              isSelected: opt.selected,
              isDisabled: opt.disabled
            }, opt.dataset.data ? JSON.parse(opt.dataset.data)
              : {
                value: opt.value,
                text: opt.text,
              }
            );
          });
          this.innerHTML = '';
        }

        this.svelecte = new Svelecte({
          target: this,
          props,
        });
        this.svelecte.$on('change', e => this.dispatchEvent(e));
      });
    }

    disconnectedCallback() {
      this.svelecte && this.svelecte.$destroy();
    }
  });
}