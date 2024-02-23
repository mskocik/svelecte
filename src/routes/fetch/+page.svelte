<script>
import Svelecte from "$lib/Svelecte.svelte";
  import { dataset } from './../data.js';

  let parentValue = null;
  let value;

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  $: childPlaceholder = parentValue? 'Now you can start searching' : 'Pick parent first';
</script>

# Remote fetching

Fetching capabilities are defined by `fetch` property - URL of desired endpoint. Svelecte automatically
resolves "fetch mode" by `[query]` placeholder in `fetch` property. When this placeholder is missing,
Svelecte switches to _init_ mode, where remote endpoint is requested, when component is mounted.

```svelte
<!-- remote fetch is triggered when user types -->
<Svelecte fetch="https://example.com/url?search=[query]">

<!-- remote fetch is triggered on mount -->
<Svelecte fetch="https://example.com/url">
```

## Fetching default value

Since v4.0 fetching initial value happens automatically on mount, regardless of "fetch mode". In v3 it was possible only
in `init` mode.

```svelte
<script>
  let value="my-value";
  let multiValue=['one','two','three'];
</script>
<!-- URL requested: https://example.com/url?search=init&init=my-value  -->
<Svelecte fetch="https://example.com/url?search=[query]" bind:value>

<!-- URL requested: https://example.com/url?init=my-value  -->
<Svelecte fetch="https://example.com/url" bind:value>

<!-- Multiselect -->
<!-- URL requested: https://example.com/url?search=init&init=one,two,three  -->
<Svelecte multiple fetch="https://example.com/url?search[query]" bind:value={multiValue}>
```
### Other useful fetch-related properties are:

- `fetchCallback: Function` Response transform function. It contains JSON-ized response. If not specified, one of following properties are tried in given order: `data`, `items`, `options` or response JSON itself as a fallback. Svelecte expects array to be returned.
- `fetchResetOnBlur: boolean` Setting to `false` will keep fetched results in dropdown.
- `minQuery: number` Force minimal length of input text to trigger remote request.
- Settings `skipSort:  true` on `searchProps` to avoid re-ordering search results. More about search settings at [Searching](/searching) page.

# Dependent selects

This functionality is not strictly related to remote fetch, but it's typical how it's used. Just set `parentValue` and
you're done. If you require `parentValue` in your `fetch` URL, just use `[parent]` placeholder.

```svelte
<script>
  let parentValue;
  let value;
</script>

<Svelecte {options} bind:parentValue />
<Svelecte {parentValue} bind:value fetch="/api/[parent]?search=[query]" />
```

<label for="parent">Choose category first</label>
<Svelecte options={parentOptions} bind:value={parentValue} inputId="parent" clearable/>
<label for="child">Search for it</label>
<Svelecte {parentValue} bind:value fetch="/api/[parent]?query=[query]&sleep=500" inputId="child" placeholder={childPlaceholder} on:fetchError={console.log}/>

## ⚠️ Notice

In v4.0 whole fetch-related functionality has been reworked and it's **no longer** possible to provide your own
fetch function. Properties `fetch` and `fetchProps` should be enough for every use case.
