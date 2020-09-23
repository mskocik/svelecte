import Svelecte, { addFormatter, config } from './Svelecte/Svelecte.svelte';
import { fetchRemote } from './Svelecte/lib/utils.js';

const OPTION_LIST = [
  'options', 'fetch', 'name', 'required',
  'multiple','disabled', 'max', 'creatable',
  'placeholder', 'renderer', 'searchable', 'clearable',
  'anchor'
];

function formatValue(name, value) {
  console.log(name, value);
  switch (name) {
    case 'options':
      window.opts = value;
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
export default function(name) {

  window.Svelecte = {
    addFormatter,
    config
  };
  window.customElements.define(name, class extends HTMLElement {
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
            if (!val) return null;
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
            console.log(value);
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
            if (!value) {
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
      console.log('hello');
      setTimeout(() => {
        for (const attr of OPTION_LIST) {
          if (this.hasAttribute(attr)) {
            props[attr] = formatValue(attr, this.getAttribute(attr));
          }
        }
        if (this.hasAttribute('parent')) {
          this.parent = document.getElementById(this.getAttribute('parent'));
          console.log('disabled', this.parent.value);
          if (!this.parent.value) {
            this.setAttribute('disabled', true);
            props['disabled'] = true;
          };
          this.parentCallback = e => {
            if (this.hasAttribute('remote-init')) {
              const url = this.getAttribute('remote-init').replace('[parent]', e.target.value);
              fetchRemote(url)()
                .then(data => {
                  this.disabled = false;
                  this.options = data;
                  return data.length > 0;
                })
                .then(shouldFocus => {
                  shouldFocus && this.querySelector('input').focus();
                })
                .catch(() => this.options = []);
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
        console.log(props);
        this.svelecte = new Svelecte({
          target: this,
          anchor: anchorSelect,
          props,
        });
        this.svelecte.$on('change', e => this.dispatchEvent(e));
      });
    }

    disconnectedCallback() {
      this.svelecte = this.svelecte.$destroy();
      this.parent && this.parent.removeEventListener('change', this.parentCallback);
    }
  });
}
