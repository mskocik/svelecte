<script>
import Svelecte from "$lib/Svelecte.svelte";
import { dataset } from './../data.js';

  let parentValue = $state(null);
  let value;

  let refetchValue = $state('blue');
  let refetcher;

  function onClick() {
    refetcher.refetchWith('red');
  }

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  let childPlaceholder = $derived.by(()=>(parentValue? 'Now you can start searching' : 'Pick parent first'));
</script>

# Remote fetching

Fetching capabilities are defined by `fetch` property - URL of desired endpoint. Svelecte automatically
resolves "fetch mode" by `[query]` placeholder in `fetch` property.

When this placeholder `[query]` is present, svelecte operates in _"query"_ mode. Otherwise switches to _"init"_ mode,
where remote endpoint is requested, when component is mounted.

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
<Svelecte multiple fetch="https://example.com/url?search[query]" bind:value={multiValue} />
```

## Manually re-fetching value in "query" mode

Imagine scenario, you have component in query mode with default value set. And you _need_ to change default value, but
still keep the same fech mode.

By default changing `value='blue'` to `value='red'` wouldn't change the value. You need to call `refetchWith(newValue)` API method.

```svelte
<script>
  let value = ['blue'];
  let el;

  function onClick() {
    el.refetchWith('red');
  }
</script>

<Svelecte bind:this={el} fetch="https://example.com/url?search=[query]" bind:value />
<button on:click={onClick}>Change selected value to red</button>
```

Results to:

<Svelecte fetch="/api/colors?query=[query]" bind:value={refetchValue} bind:this={refetcher} />
<button class="btn" on:click={onClick}>Change selected value to red</button>

### ⚠️ Caution with objects

When using _objects_ as `value` (with `valueAsObject` property set), you _always_ need to set `strictMode` to `false`.
Otherwise initial value won't be set. Also using `refetchWith` method has no meaning, because you can set object value
directly, no need for fetch request.

## Other useful fetch-related properties are:

- `fetchCallback: Function` Response transform function. It contains JSON-ized response. If not specified, one of following properties are tried in given order: `data`, `items`, `options` or response JSON itself as a fallback. Svelecte expects array to be returned.
- `fetchResetOnBlur: boolean` Setting to `false` will keep fetched results in dropdown.
- `minQuery: number` Force minimal length of input text to trigger remote request.
- Settings `skipSort:  true` on `searchProps` to avoid re-ordering search results. More about search settings at [Searching](/searching) page.

## User-provided fetch function

In v4.0 whole fetch-related functionality has been reworked and it's **no longer** possible to provide your own
fetch function. Properties `fetch` and `fetchProps` should be enough for every use case.
