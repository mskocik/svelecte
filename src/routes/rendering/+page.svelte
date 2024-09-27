<script>
  import Svelecte, { addRenderer } from '$lib/Svelecte.svelte';
  import { bindItem } from '$lib/utils/actions';
  import highlighter from '../../utils/codeHighlighter';
  import { dataset } from '../data';

  let options = dataset.colors();
  let selection = ['red', 'green','blue'];

  function slotRenderer(item) {
    return `<div class="slot-definition" style="display: block;">option</div>`
  }

  function colorRenderer(item, _isSelection, _inputValue) {
    return _isSelection
      ? `<div style="width:16px; height: 16px; background-color: ${item.hex};"></div>${item.text}`
      : `${item.text} (#${item.hex})`
  }

  addRenderer('color', colorRenderer);
</script>

# Rendering

Svelecte provides many ways how to customize rendering. Whole concept of rendering was rewritten in v4.0 to provide more
possibilities as many (some) users requested. Hopefully you will have enough tools to make it work as you need.

In general rendering customization can be split into 2 groups:

- with [render functions](#render-functions)
- with [slots](#slots)

## Render functions

Render functions (aka renderers) are simple functions which return `string`, which is then rendered through `{@html}` tag. This is very
easily customizable and more importantly available also outside svelte. Another advantage is, that highlighting is handled
automatically. Of course highlighting can be disabled if needed.

Render function have following signature:

```js
/**
 * @param {object} item
 * @param {boolean} [selectionSection] - if true, option is rendered in control, otherwise in dropdown
 * @param {string} [inputValue] - search value, if you want to handle highlighting yourself
 * @returns {string}
 */
function renderer() {}
```

You can define renderers globally or per-component basis. To differenciate whether item is selected you can use internal
`$selected` property.

Note: When using custom renderers with `inputValue` being used, it's up to you correctly escape HTML tags

```svelte
<script>
  import Svelecte, { addRenderer } from 'svelecte';

  function colorRenderer(item, _isSelection, _inputValue) {
    return _isSelection
      ? `<div style="width:16px; height: 16px; background-color: ${item.hex};"></div>${item.text}`
      : `${item.text} (#${item.hex})`
  }

  addRenderer('color', colorRenderer);
</script>

<Svelecte renderer="color" />

<Svelecte renderer={colorRenderer} />
```

Result:

Using renderer globally:
<Svelecte renderer="color" options={dataset.colors()} class="inline-flex"/>

Using renderer locally:
<Svelecte renderer={colorRenderer} options={dataset.colors()} class="inline-flex"/>

## Slots

Svelecte provide multiple slots as you can see below. On the `left` you can see default slot implementation,
on the `right` you can see slot placeholders.

<div class="cols-2">
  <Svelecte {options} bind:value={selection} multiple collapseSelection="blur" clearable creatable keepSelectionInList/>

  <Svelecte {options} renderer={slotRenderer} bind:value={selection} multiple collapseSelection="blur" clearable creatable keepSelectionInList>
    <div class="slot-definition" slot="icon">
      Icon
    </div>
    <div class="slot-definition" slot="collapsedSelection">
      Collapsed selection
    </div>
    <div class="slot-definition" slot="selection">
      Selection
    </div>
    <div class="slot-definition" slot="clear-icon">
      Clear
    </div>
    <div class="slot-definition" slot="dropdown-toggle">
      Toggle
    </div>
    <div class="slot-definition" slot="list-header">
      List header
    </div>
    <div class="slot-definition" slot="create-row">
      Create row
    </div>
  </Svelecte>
</div>

Slot summary:

```svelte
<slot name="icon" />
<slot name="collapsedSelection" let:selectedOptions let:i18n />
<slot name="selection" let:selectedOptions let:bindItem />
<slot name="clear-icon" let:selectedOptions let:inputValue />
<slot name="dropdown-toggle" let:isOpen />
<slot name="list-header" />
<slot name="option" let:item />
<slot name="create-row" let:isCreating let:inputValue let:i18n  />
```

<hr>

Slots in more details:

### &bull; selection

```svelte
<slot name="selection" let:selectedOptions let:bindItem/>

<!-- example implementation -->
<slot name="selection" let:selectedOptions let:bindItem>
  {#each selectedOptions as opt (opt.id)}
    <div>
      {item.text}
      <button data-action="deselect" use:bindItem={opt}>&times;</button>
    </div>
  {/each}
</slot>
```

Where:

- `selectedOptions` is array of selected options as objects
- `bindItem` is _action_ which can be used to bind selected option option to the element with attribute `data-action="deselect"`. This attribute indicates, that when given option should be removed from selection.

### &bull; collapsedSelection

`collapsedSelection` is paired with `collapseSelection` prop:

- `collapseSelection`=`null`: only `selection` slot is visible `(default)`
- `collapseSelection`=`'blur'`: `selection` slot is show only when component is focused
- `collapseSelection`=`'always'`: `selection` slot is never show

```svelte
<slot name="collapsedSelection" let:selectedOptions let:i18n/>

<!-- default implementation -->
<slot name="collapsedSelection" let:selectedOptions let:i18n>
  {i18n.collapsedSelection(selectedOptions.length)}
</slot>
```

Where:

- `selectedOptions` is array of selected options as objects
- `i18n` default or customized `i18n` object

### &bull; clear-icon

`clear-icon` slot is coupled with `clearable` prop.

```svelte
<slot name="clear-icon" let:selectedOptions let:inputValue />
```

Where:

- `selectedOptions` is array of selected options as objects
- `inputValue` search query

### &bull; drodpdown-toggle

```svelte
<slot name="dropdown-toggle" let:isOpen />
```

### &bull; list-header

```svelte
<!-- empty slot with no props -->
<slot name="list-header" />
````

Originally added to address issue [#151](https://github.com/mskocik/svelecte/issues/151), but can be used for anything.
If you want to display selected options here as in mentioned issue, check [Migration guide](/migration-from-v3).

### &bull; option

```svelte
<slot name="option" let:item />
```

Where:

- `item` is current option in dropdown. To duplicate highlighting functionality you need to use function `highlightSearch` exported from the library.

### &bull; option-icon

```svelte
<slot name="option-icon" let:item/>
```

Added to include icons for options depending on whether the item is selected and depending on the item.
Where:

- `item` is current option in dropdown.

### &bull; create-row

`create-row` slot with `creatable` prop (and you enter to enter some input).

```svelte
<slot name="create-row" let:isCreating let:inputValue let:i18n />
```

Where:

- `isCreating` is `true` when executing async `createHandler`.
- `inputValue` entered value
- `i18n` default or customized `i18n` object

<style>
  .cols-2 {
    display: flex;
    flex-wrap: nowrap;
    flex: 0;
    gap: 20px;

  }
  .cols-2 > :global(.svelecte.svelecte-control) {
    width: 50%;
  }
  :global(.slot-definition) {
    border: 2px dashed red;
  }
  :global(.svelecte.inline-flex .sv-item--content) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
</style>
