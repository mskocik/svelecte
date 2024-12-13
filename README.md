# Svelecte [![NPM version](http://img.shields.io/npm/v/svelecte.svg?style=flat)](https://www.npmjs.org/package/svelecte)

![svelecte](https://svelecte.vercel.app/svelecte.png)

Flexible autocomplete/select component written in Svelte. Initially inspired by Selectize.js. Also usable as custom element. Usable in forms, behaves very similar to standard `<select>` element.

See the latest changes on the [Releases](https://github.com/mskocik/svelecte/releases) page.

## 📃 Features

- searchable
- multiselect with limit of max selected items
- allow simple array or complex objects as items
- custom item renderer (formatter)
- allow creating new items (and possibly edit them)
- remote data fetch
- virtual list support
- i18n and basic ARIA support
- SSR support
- client-validation support (tested with [sveltekit-superforms](https://github.com/ciscoheat/sveltekit-superforms/))
- lazy dropdown rendering
- usable as custom element
- customizable styling
- dnd intergration with `svelte-dnd-action`


## 🔧 Installation

```
npm install svelecte
```

> [!NOTE]
> For Svelte 4 use version 4. Version 5 is svelte 5 only ⚡

## Minimalistic example

```html
<script>
import Svelecte from 'svelecte';

const list = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2'}, ...];
let myValue = null;
</script>

<Svelecte options={list} bind:value={myValue}></Svelecte>
```

Visit [documentation](https://svelecte.vercel.app/) for more details.

## Thanks to

- [selectize.js](https://github.com/selectize/selectize.js) - main inspiration
- [sifter](https://github.com/brianreavis/sifter.js) - search engine
- [svelte-tiny-virtual-list](https://github.com/Skayo/svelte-tiny-virtual-list) virtual list functionality for v3, v4
- and [svelte](https://svelte.dev) of course 😊

And if you want to thank me, you can through my [sponsor](https://github.com/sponsors/mskocik) page.

## License

[MIT License](https://github.com/mskocik/svelecte/blob/master/LICENSE)
