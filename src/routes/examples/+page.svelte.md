<script>
  import { onMount } from 'svelte';
  import { dataset } from '../data';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones, setDebugMode } from 'svelte-dnd-action';
  import Svelecte from '$lib/Svelecte.svelte';

  import { highlightSearch } from '$lib';

  /** ************************************ drag-n-drop */

  overrideItemIdKeyNameBeforeInitialisingDndZones('value');

  let value = $state(['red', 'blue', 'purple']);

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

  let parentValue = $state(null);
  let childValue;

  function updateParent(value) {
    parentValue = value;
  }

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  let childPlaceholder = $derived(parentValue ? 'Now you can start searching' : 'Pick parent first');

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

## Custom `option` snippet

Simple example of using snippet instead of [render function](/rendering#render-functions) for dropdown item rendering.
Default snippet implementation correctly handles highlighted search. Custom snippet has no ability to do that.

If you need to keep highlighting feature use [render function](/rendering#render-functions) for custom option rendering.

{#snippet option(item)}
<div>
	{item.$selected ? '👌' : '👉'} {item.text} {item.$selected ? '✅' : '☑️'}
</div>
{/snippet}

<Svelecte options={render_options} closeAfterSelect={false} value={'1'} {option} />

```svelte
<script>
	import Svelecte from 'svelecte';

	let options = [
    {id: '1', text: 'option X'},
    {id: '2', text: 'option Y'},
    {id: '3', text: 'option Z'}
	];
</script>

{#snippet option(item)}
<div>
	{item.$selected ? '👌' : '👉'} {item.text} {item.$selected ? '✅' : '☑️'}
</div>
{/snippet}

<Svelecte {options} closeAfterSelect={false} value={'1'} {option} />
```

{#snippet optionWithSearch(item, inputValue)}
<div>
	<b>Item:</b> {@html highlightSearch(item, false, inputValue, opt => opt.text)}
</div>
{/snippet}

<h3 class="mb-3">💡 Replicate "search highlighting" with custom option</h3>
<br>
<Svelecte
  options={render_options}
  closeAfterSelect={false}
  option={optionWithSearch}
>
	<div slot="option" let:item let:inputValue>
		<b>Item: </b> {@html highlightSearch(item, false, inputValue, opt => opt.text)}
	</div>
</Svelecte>

```svelte
<script>
  import Svelecte from 'svelecte'
	import { highlightSearch } from 'svelecte';

	let options = [
    {id: '1', text: 'option X'},
    {id: '2', text: 'option Y'},
    {id: '3', text: 'option Z'}
	];
</script>

<Svelecte options={render_options} closeAfterSelect={false} value={'1'}>
	<div slot="option" let:item let:inputValue>
		<b>Item:</b> {@html highlightSearch(item, false, inputValue, opt => opt.text)}
	</div>
</Svelecte>
```

## Dependent selects

This functionality is not strictly related to remote fetch, but it's typical how it's used. Just set `parentValue` and
you're done. If you require `parentValue` in your `fetch` URL, just use `[parent]` placeholder.

<label for="parent">Choose category first</label>
<Svelecte options={parentOptions} bind:value={parentValue} inputId="parent" clearable onChange={updateParent} />
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
