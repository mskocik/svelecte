<script>
  import Svelecte from "$lib/Svelecte.svelte";
  import { dataset } from '../data.js';

  let parentValue = null;
  let value;

  let refetchValue = 'blue';
  let refetcher;

  function onClick() {
    refetcher.refetchWith('red');
  }

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  function myFetch(query, { signal }) {
    return window.fetch(`/api/colors?query=${encodeURIComponent(query)}`, { signal })
      .then(res => res.json());
  }

  $: childPlaceholder = parentValue? 'Now you can start searching' : 'Pick parent first';
</script>

# Remote fetching

Fetching capabilities are defined by `fetch` property - URL of desired endpoint. Svelecte automatically
resolves "fetch mode" by `[query]` placeholder in `fetch` property.

When this placeholder `[query]` is present, svelecte operates in _"query"_ mode. Otherwise  switches to _"init"_ mode,
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
  let value = $state("my-value");
  let multiValue = $state(['one','two','three']);
</script>
<!-- URL requested: https://example.com/url?search=init&init=my-value  -->
<Svelecte bind:value
  fetch="https://example.com/url?search=[query]"
/>
<!-- URL requested: https://example.com/url?init=my-value  -->
<Svelecte
  bind:value
  fetch="https://example.com/url"
/>
<!-- Multiselect -->
<!-- URL requested: https://example.com/url?search=init&init=one,two,three  -->
<Svelecte
  bind:value={multiValue}
  fetch="https://example.com/url?search[query]"
  multiple
/>
```

## Manually re-fetching value in "query" mode

Imagine scenario, you have component in query mode with default value set. And you _need_ to change default value, but
still keep the same fech mode.

By default changing `value='blue'` to `value='red'` wouldn't change the value. You need to call `refetchWith(newValue)` API method.

```svelte
<script>
  let value = $state(['blue']);
  let el;

  function onClick() {
    el.refetchWith('red');
  }
</script>

<Svelecte
  bind:this={el}
  bind:value
  fetch="https://example.com/url?search=[query]"
/>
<button onclick={onClick}>Change selected value to red</button>
```

Results to:


<Svelecte
  bind:this={refetcher}
  bind:value={refetchValue}
  fetch="/api/colors?query=[query]"
  searchProps={{ skipSort: true }}
/>
<button onclick={onClick} style="border: 1px solid var(--vp-c-text-1); padding: 0px 4px; border-radius: 4px; margin-top: 6px">Change selected value to red</button>

### ⚠️ Caution with objects

When using _objects_ as `value` (with `valueAsObject` property set), you *always* need to set `strictMode` to `false`.
Otherwise initial value won't be set. Also using `refetchWith` method has no meaning, because you can set object value
directly, no need for fetch request.


## User-provided fetch function

When `fetch` URL with `fetchProps` is not enough, you can provide your own fetch implementation through `customFetch` property. When set, it takes precedence over `fetch` property.

The function receives the current input value and a context object, and must return a `Promise` (or value) resolving
to the response data. Returned data are processed the same way as with `fetch` - through `fetchCallback` if set, or
by looking up `data`, `items` or `options` property.

```ts
customFetch(query: string, context: {
  signal: AbortSignal,                         // aborted when a newer request is triggered or on blur
  parentValue: string|number|null|undefined,   // value of `parentValue` property
  initial: string|number|string[]|null|undefined // initial value(s) to fetch, when fetching default value
}) => Promise<object>
```

```svelte
<script>
  function myFetch(query, { signal, parentValue, initial }) {
    const url = initial
      ? `https://example.com/url?init=${[initial].flat().join(',')}`
      : `https://example.com/url?search=${encodeURIComponent(query)}&parent=${parentValue ?? ''}`;
    return window.fetch(url, { signal })
      .then(res => res.json());
  }
</script>

<Svelecte customFetch={myFetch} />

<!-- fetch on mount -->
<Svelecte customFetch={myFetch} fetchMode="init" />
```

Because there is no URL to look for the `[query]` placeholder, component operates in _"query"_ mode by default. Set
`fetchMode="init"` to fetch options on mount instead.

Results to:

<Svelecte
  customFetch={myFetch}
  searchProps={{ skipSort: true }}
/>


## Other useful fetch-related properties are:

- `fetchCallback: Function` Response transform function. It contains JSON-ized response. If not specified, one of following properties are tried in given order: `data`, `items`, `options` or response JSON itself as a fallback. Svelecte expects array to be returned.
- `fetchResetOnBlur: boolean` Setting to `false` will keep fetched results in dropdown.
- `minQuery: number` Force minimal length of input text to trigger remote request.
- Settings `skipSort:  true` on `searchProps` to avoid re-ordering search results. More about search settings at [Searching](/searching) page.

