<script>
  import { onMount } from 'svelte';
  import { dataset } from '../data';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones, setDebugMode } from 'svelte-dnd-action';
  import Svelecte from '$lib/Svelecte.svelte';
	import RenderItem from './RenderItem.svelte';

  /** ************************************ drag-n-drop */

  overrideItemIdKeyNameBeforeInitialisingDndZones('value');

  let value = ['red', 'blue', 'purple'];

  /** ************************************ custom element */

  onMount(() => {
    import('$lib/component').then(resolved => {
      resolved.registerAsCustomElement('el-svelecte');
    });
  });

  const options = JSON.stringify(dataset.colors());
  const render_options = [
    {id: '1', text: 'option X'},
    {id: '2', text: 'option Y'},
    {id: '3', text: 'option Z'}
	];

  /** ************************************ multiselect */

  const svg_checked = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Interface / Checkbox_Check">
    <path id="Vector" d="M8 12L11 15L16 9M4 16.8002V7.2002C4 6.08009 4 5.51962 4.21799 5.0918C4.40973 4.71547 4.71547 4.40973 5.0918 4.21799C5.51962 4 6.08009 4 7.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H7.19691C6.07899 20 5.5192 20 5.0918 19.7822C4.71547 19.5905 4.40973 19.2842 4.21799 18.9079C4 18.4801 4 17.9203 4 16.8002Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </svg>`;
  const svg_empty = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Interface / Checkbox_Unchecked">
    <path id="Vector" d="M4 7.2002V16.8002C4 17.9203 4 18.4801 4.21799 18.9079C4.40973 19.2842 4.71547 19.5905 5.0918 19.7822C5.5192 20 6.07899 20 7.19691 20H16.8031C17.921 20 18.48 20 18.9074 19.7822C19.2837 19.5905 19.5905 19.2842 19.7822 18.9079C20 18.4805 20 17.9215 20 16.8036V7.19691C20 6.07899 20 5.5192 19.7822 5.0918C19.5905 4.71547 19.2837 4.40973 18.9074 4.21799C18.4796 4 17.9203 4 16.8002 4H7.2002C6.08009 4 5.51962 4 5.0918 4.21799C4.71547 4.40973 4.40973 4.71547 4.21799 5.0918C4 5.51962 4 6.08009 4 7.2002Z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    </svg>`

  /** @type {import('$lib/Svelecte.svelte').RenderFunction} */
  function svgRenderer(opt, isSelected, _input) {
    return `<div class="inlined">${opt.$selected ? svg_checked : svg_empty}<span>${opt.text}</span></div>`;
  }

  /** ************************************ dependent selects */

  let parentValue = null;
  let childValue;

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  $: childPlaceholder = parentValue? 'Now you can start searching' : 'Pick parent first';

</script>

# Various examples

This page gives you some examples what can be done and how.

## Multiselect

Example how multiselect can be implemented.

<Svelecte options={dataset.colors()} value={['blue','fuchsia','purple']} labelField="text"
  renderer={svgRenderer}
  clearable
  multiple
  highlightFirstItem={false}
  keepSelectionInList={true}
  searchProps={{skipSort: true}}
  collapseSelection="always"
></Svelecte>

```svelte
<script>
  const svg_checked = `<svg>...</svg>`;
  const svg_empty = `<svg>...</svg>`;
  function svgRenderer(opt, isSelected, _input) {
    return `<div class="inlined">${opt.$selected ? svg_checked : svg_empty}<span>${opt.text}</span></div>`;
  }
</script>

<Svelecte
  multiple
  renderer={svgRenderer}
  collapseSelection="always"
  clearable
  keepSelectionInList={true}
  searchProps={{skipSort: true}}
></Svelecte>
```

## Custom `option` slot component

Simple example of using `<slot>` instead of [render function](/rendering#render-functions) for dropdown item rendering.

<Svelecte options={render_options} closeAfterSelect={false} value={'1'}>
	<svelte:fragment slot="option" let:item>
		<RenderItem {item} />
	</svelte:fragment>
</Svelecte>

```svelte
<script>
	import Svelecte from 'svelecte'
	import Item from './Item.svelte';

	let options = [
    {id: '1', text: 'option X'},
    {id: '2', text: 'option Y'},
    {id: '3', text: 'option Z'}
	];
</script>

<Svelecte {options} closeAfterSelect={false} value={'1'}>
	<svelte:fragment slot="option" let:item>
		<Item {item} />
	</svelte:fragment>
</Svelecte>
```

```svelte
// Item.svelte
<script>
	export let item
</script>

<div>
	{item.$selected ? '👌' : '👉'} {item.text} {item.$selected ? '✅' : '☑️'}
</div>
```

## Dependent selects

This functionality is not strictly related to remote fetch, but it's typical how it's used. Just set `parentValue` and
you're done. If you require `parentValue` in your `fetch` URL, just use `[parent]` placeholder.

<label for="parent">Choose category first</label>
<Svelecte options={parentOptions} bind:value={parentValue} inputId="parent" clearable/>
<label for="child">Search for it</label>
<Svelecte {parentValue} bind:value={childValue} fetch="/api/[parent]?query=[query]" inputId="child" placeholder={childPlaceholder}/>

```svelte
<script>
  let parentValue;
  let value;
</script>

<Svelecte {options} bind:parentValue clearable />
<Svelecte {parentValue} bind:value fetch="/api/[parent]?search=[query]" />
```


## Drag & Drop

You can add support for drag & drop reordering by adding [svelte-dnd-action](https://github.com/isaacHagoel/svelte-dnd-action/) library

Reorder selection by dragging: {value}
<Svelecte options={dataset.colors()} bind:value={value} multiple {dndzone} placeholder="Re-order selected items by dragging" />

```svelte
<script>
  import Svelecte from 'svelecte';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones, setDebugMode } from 'svelte-dnd-action';

  /** my example has no 'id' property */
  overrideItemIdKeyNameBeforeInitialisingDndZones('value');

  // rest of code ...
</script>

<Svelecte {options} bind:value={value} multiple {dndzone} placeholder="Re-order selected items by dragging" />
```


## Custom element

Svelecte can be used outside svelte projects. I have used it successfully in Vue and PHP projects myself.

<select id="original"></select>
<el-svelecte options={options} placeholder="Pick a color" />

Check the source and look for `<el-svelecte />` element.

```svelte
<script>
  import { registerAsCustomElement } from 'svelecte/component';

  registerAsCustomElement('el-svelecte');
</script>

<el-svelecte options="json_stringified_object_array"></el-svelecte>
```

Most of properties is supported with one change: `parentValue`.

You define `parent` attribute instead. It represents html `id` attribute of parent select.
This attribute should be defined on child svelecte element.

<style>
  :global(.inlined) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  :global(.light .sv-item--content svg) {
    stroke: #000;
  }
  :global(.dark .sv-item--content svg) {
    stroke: #eee;
  }
</style>
