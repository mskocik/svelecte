---
title: Global Config
slug: global-config
---

<script>
import { config } from '$lib';
  import { json } from '@sveltejs/kit';

let enabled = config.clearable;
let searchable = config.searchable;

function toggleClearable() {
  enabled = !enabled;
  config.clearable = enabled;
}


function toggleDisabled() {
  searchable = !searchable;
  config.searchable = searchable;
}

function toggleDef(e) {
  e.target.parentElement.classList.toggle('show-values');
}

</script>

# Global Config

Svelecte provides global config with many of settings. Basically it is an export from `<script context="module"></script>`
so when you call it before you create any `<Svelecte />` instance, you can change some defaults for your whole app.

Part of global config is also global `i18n` object, although it can be set also on component level.

## Example

<button class="btn" on:click={toggleClearable}>
  {@html enabled ? '<code>clearable</code> enabled!' : 'Enable <code>clearable</code>'}
</button>

<button class="btn" on:click={toggleDisabled}>
  {@html searchable ? `Disable <code>searchable</code>` : `Enable <code>searchable</code>` }
</button>

Toggle buttons and visit another pages. YOu will see the settings are applied globally.

### Settings

<div class="toggle-wrap">
  <button class="press-btn" on:click={toggleDef}>Toggle definition / Defaults</button>

```ts
export type Settings = {
  valueField: string | null;
  labelField: string | null;
  groupLabelField: string;
  groupItemsField: string;
  disabledField: string;
  placeholder: string;
  valueAsObject: boolean;
  searchable: boolean;
  clearable: boolean;
  highlightFirstItem: boolean;
  selectOnTab: boolean | 'select-navigate';
  resetOnBlur: boolean;
  resetOnSelect: boolean;
  fetchResetOnBlur: boolean;
  fetchDebounceTime: number;
  multiple: boolean;
  closeAfterSelect: boolean | string;
  max: number;
  collapseSelection: 'blur' | 'always' | null;
  keepSelectionInList: 'auto' | boolean;
  creatable: boolean;
  creatablePrefix: string;
  keepCreated: boolean;
  allowEditing: boolean;
  delimiter: string;
  fetchCallback: Function;
  minQuery: number;
  lazyDropdown: boolean;
  virtualList: boolean;
  vlItemSize: number | null;
  vlHeight: number | null;
  i18n: I18nObject;
  requestFactory: import("./utils/fetch").RequestFactoryFn;
}
```


```js
const settings = {
  valueField: null,
  labelField: null,
  groupLabelField: 'label',
  groupItemsField: 'options',
  disabledField: '$disabled',
  placeholder: 'Select',
  valueAsObject: false,
  searchable: true,
  clearable: false,
  highlightFirstItem: true,
  selectOnTab: false,
  resetOnBlur: true,
  resetOnSelect: true,
  fetchResetOnBlur: true,
  fetchDebounceTime: 300,
  multiple: false,
  closeAfterSelect: 'auto',
  max: 0,
  collapseSelection: null,
  keepSelectionInList: 'auto',
  creatable: false,
  creatablePrefix: '*',
  keepCreated: true,
  allowEditing: false,
  delimiter: ',',
  fetchCallback: null,
  minQuery: 1,
  lazyDropdown: true,
  virtualList: false,
  vlItemSize: null,
  vlHeight: null,
```

</div>

### I18n

<div class="toggle-wrap">
  <button class="press-btn" on:click={toggleDef}>Toggle definition / Defaults</button>

```ts
export type I18nObject = {
  empty: string;
  nomatch: string;
  max: i18n_max;
  fetchBefore: string;
  fetchQuery: i18n_fetchQuery;
  fetchInit: string;
  fetchEmpty: string;
  collapsedSelection: i18n_collapsedSelection;
  createRowLabel: i18n_createRowLabel;
  aria_selected: i18n_aria_selection;
  aria_listActive: i18n_aria_listActive;
  aria_inputFocused: i18n_aria_inputFocus;
  aria_label: string;
  aria_describedby: string;
}
```

```js
i18n: {
  aria_label: '',
  aria_describedby: '',
  aria_selected: (opts) => opts.length ? `Option${opts.length > 1 ? 's' : ''} ${opts.join(', ')} selected.` : '',
  aria_listActive: (opt, labelField, count) => `You are currently focused on option ${opt[labelField]}. ${count} result${count>1?'s': ''} available.`,
  aria_inputFocused: () => 'Select is focused, type to refine list, press down to scroll through the list',
  empty: 'No options',
  nomatch: 'No matching options',
  max: num => `Maximum items ${num} selected`,
  fetchBefore: 'Type to start searching',
  fetchQuery: (minQuery, inputLength) => `Type at least ${minQuery} character${
      minQuery > 1 ? 's' : ''
    } to start searching`
  ,
  fetchInit: 'Fetching data, please wait...',
  fetchEmpty: 'No data related to your search',
  collapsedSelection: count => `${count} selected`,
  createRowLabel: value => `Add '${value}'`,
  emptyCreatable: 'Add new by typing'
}
```

</div>

<style>
  .btn {
    background-color: var(--vp-c-gray-2);
    padding: 8px 12px;
    border-radius: 4px;
  }
  .press-btn {
    background-color: var(--vp-c-brand-2);
    padding: 8px 12px;
    border-radius: 4px;
  }
  :global(.langunage-js) {
    display: none;
  }
  .toggle-wrap {
    position: relative;
    padding: 32px 0;
  }
  :global(.vp-doc .show-values .language-ts) {
    opacity: 0;
  }
  :global(.vp-doc .language-js.vp-adaptive-theme) {
    display: none;
  }
  :global(.vp-doc .show-values .language-js.vp-adaptive-theme) {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 96px;
    left: 0;
    bottom: 0;
    display: block;
  }
</style>
