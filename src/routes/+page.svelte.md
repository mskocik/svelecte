<script>
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation'
  import Svelecte from '$lib/Svelecte.svelte';

  const navigation = getContext('navigation');

  const navOptions = Object.entries(navigation).map(([url, text]) => ({ url, text }));

  function navigate(opt) {
    goto(opt.url);
  }
</script>

<div class="m-auto">
  <img src="/svelecte.png" alt="Svelecte">
</div>

Svelecte is fully featured and customizable select/multiselect/autocomplete.

<Svelecte
  options={navOptions}
  placeholder="Quick website navigation"
  onChange={navigate}
/>

## Features

<div class="cols-2">
<div>

- searchable
- multiselect with limit of max selected items
- allow simple array or complex objects as items
- custom item renderering, multiple snippets
- allow creating new items
- remote data fetching
- themable with CSS variables

</div>

<div>

- virtual list support
-
- i18n support
- SSR support
- a11y
- drag & drop support (see [examples](/examples#drag--drop))
- usable as custom element

</div>
</div>

## Install

```bash
npm install svelecte
```

For svelte 3/4 use `v4`

```bash
npm install svelecte@4
```

## Getting started

Minimal example:

```svelte
<script>
  import Svelecte from 'svelecte';

  let value;
</script>

<Svelecte
  options={['One', 'Two', 'Three']}
  bind:value
/>
```
Result:
<Svelecte
  options={['One', 'Two', 'Three']}
/>

<style>
  .m-auto {
    margin: 2rem auto;
    & img {
      display: block;
      margin: auto;
    }
  }
  .cols-2 {
    display: flex;
    flex-wrap: wrap;
    & > div {
      width: 50%;
    }
  }
</style>
