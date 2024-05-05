<script>
  import Svelecte from '$lib/Svelecte.svelte';
</script>

<div class="m-auto">
  <img src="/svelecte.png" alt="Svelecte">
</div>

Svelecte is fully featured and customizable select/multiselect/autocomplete.

<div class="cols-2">
<div>

- searchable
- multiselect with limit of max selected items
- allow simple array or complex objects as items
- custom item renderering, multiple slots
- allow creating new items
- remote data fetch

</div>

<div>

- virtual list support
- i18n support
- SSR support
- themable
- a11y
- usable as custom element

</div>
</div>

## Getting started

Minimal example:

```svelte
<script>
  import Svelecte from 'svelecte';

  let value;
</script>

<Svelecte options={['One', 'Two', 'Three']} bind:value />
```
Result:
<Svelecte options={['One', 'Two', 'Three']} />


## Install

```bash
npm install svelecte
```

If you _need_ svelte 5 related version, use `next version`

```bash
npm install svelecte@next
```


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
