<script>
  import Svelecte from '$lib/Svelecte.svelte';
  import { android } from '$lib/utils/helpers';

  import { colors } from '../colors';

  const items = 100;
  let options = [];
  let selection = null;

  for (let i = 1; i <= items; i++) {
    options.push(
      Object.assign({}, colors[i], { internal: {
        id: i
      }})
    );
  }

  let fields = 'name';
  let sort;
  let skipSort;
  let nesting;
  let disabled;

  $: placeholder = fields === 'internal.id'
    ? 'Search by internal (nested id)'
    : (fields === 'hex'
      ? 'Search by hex'
      : 'Search by name'
    );

  $: searchProps = {
    fields: fields,
    sort, skipSort, nesting, disabled
  }

</script>

# Searching and filtering

Svelecte supports filtering available options based on what you write. This functionality is controlled by `searchable`
property and is enabled by default and *all* first child properties are searchable.

Seach and filtering capabilities are provided by [sifter.js](https://github.com/brianreavis/sifter.js/) internally and search settings
has been extended for more granular search settings in v4.0.

## 🧩 Playground

<div>
  <Svelecte {options} bind:value={selection} {placeholder}
    {searchProps}
    clearable
    multiple
  >
    <!-- <div slot="option" let:item>{item.name} #{item.internal.id}</div> -->
    <!-- <b slot="icon">{iconSlot}</b>
    <svelte:fragment slot="clear-icon" let:selectedOptions let:inputValue>{selectedOptions.length ? '❌' : inputValue ? '👀' : '❓' }</svelte:fragment>
    <svelte:fragment slot="indicator-icon" let:hasDropdownOpened>{hasDropdownOpened?'😃':'😄'}</svelte:fragment> -->
  </Svelecte>

  <hr>
  <div>
    Now searching in properties: <code>{searchProps.fields}</code>.
    <br>
    Try switching to <code>or</code> search by typing <code>|</code> between other words. For example <code>b c</code> vs <code>b | c</code>
    <hr>
    <label for="fields">
      Select search field:
      <select name="fields" id="fields" bind:value={fields}>
        <option value="name">Name</option>
        <option value="hex">Hex (not visible property)</option>
        <option value="internal.id">ID (nesting required)</option>
      </select>
    </label>

    <label for="nesting">
      <input type="checkbox" name="nesting" id="nesting" bind:checked={nesting}>
      Nesting
    </label>

    <label for="skipSort">
      <input type="checkbox" name="skipSort" id="skipSort" bind:checked={skipSort}>
      Skip sorting results
    </label>
    <br>
    <label for="disable">
      <input type="checkbox" name="disable" id="disable" bind:checked={disabled}>
      Disable filtering
    </label>
  </div>
</div>

## Settings

Customizing search is possible by passing `searchProps` property and can have following structure. All properties are
optional and boolean values are false by default.

```js
 /**
  * @typedef {object} SearchProps
  * @property {string|string[]} [fields]
  * @property {string|SortDef[]} [sort]
  * @property {boolean} [skipSort]
  * @property {'or'} [conjunction]
  * @property {boolean} [nesting]
  * @property {boolean} [disabled]
  *
  *
  * @typedef {object} SortDef
  * @property {string} field
  * @property {'asc'|'desc'} [direction]
  */
```

- `fields` allow you to specify which properties are used for search. In combination with `nesting` parameter you can specify also nested properties with dot notation like `my.nested.property`.
- `sort` define sort properties which search result sorting is based upon.
- `skipSort` sorting can be turned off.
- `conjuction` defaults to `and`, defines how multiple words are searched. `or` can be turned on directly when entering text by typing `|` character.
- `nesting` allow for search in nested properties, as mentions in `fields` description
- `disabled` when `true` no option is filtered out, just searched phrase is highlighted (which can be disabled by `disabledHighlighting`)

<style>
  label {
    display: inline-block;
    margin: 8px 1rem 8px 0;
  }
  select {
    appearance: auto;
  }
</style>
