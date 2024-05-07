<script>
  import Svelecte, { addRenderer } from '$lib/Svelecte.svelte';
  import { bindItem } from '$lib/utils/actions';
  import highlighter from '../../utils/codeHighlighter';
  import { dataset } from '../data';

  let options = dataset.colors();
  let selectionValue = ['red', 'green'];
  $: selectionMirror = selectionValue;

  function snippetRenderer(item) {
    return `<div class="snippet-definition" style="display: block;">option</div>`
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
- with [snippets](#snippets)

## Render functions

Render functions (aka renderers) are simple functions which return `string`, which is then rendered through `{@html}` tag. This is very
easily customizable and more importantly available outside svelte, which is needed when using svelecte as custom element.
Another advantage is, that highlighting is handled automatically. Of course highlighting can be disabled if needed.

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

## Snippets

Svelecte provide multiple Snippets as you can see below. On the `left` you can see default snippet implementation,
on the `right` you can see snippet placeholders.

{#snippet prepend()}
  <div class="snippet-definition">prepend</div>
{/snippet}
{#snippet collapsedSelection()}
  <div class="snippet-definition">Collapsed selection</div>
{/snippet}
{#snippet selection()}
  <div class="snippet-definition">selection</div>
{/snippet}
{#snippet clearIcon()}
  <div class="snippet-definition">clearIcon</div>
{/snippet}
{#snippet toggleIcon()}
  <div class="snippet-definition">toggleIcon</div>
{/snippet}
{#snippet append()}
  <div class="snippet-definition">append</div>
{/snippet}
{#snippet listHeader()}
  <div class="snippet-definition">List Header</div>
{/snippet}
{#snippet option()}
  <div class="snippet-definition">option</div>
{/snippet}
{#snippet createRow()}
  <div class="snippet-definition">Create row</div>
{/snippet}

<div class="cols-2">
  <div style="width: 40%">
    <Svelecte {options} bind:value={selectionValue} multiple collapseSelection="blur" clearable creatable keepSelectionInList max={5}/>
  </div>

  <Svelecte {options} bind:value={selectionMirror} multiple collapseSelection="blur" clearable creatable keepSelectionInList
    renderer={snippetRenderer}
    {prepend} {collapsedSelection} {selection} {clearIcon} {toggleIcon} {listHeader} {option} {createRow} {append}
  ></Svelecte>
</div>

Snippets summary:

```svelte
{#snippet prepend()}
{#snippet selection(selectedOptions, bindItemAction)}
{#snippet collapsedSelection(selectedOptions, i18n)}
{#snippet clearIcon(selectedOptions, inputValue)}
{#snippet toggleIcon(dropdownShow)}
{#snippet append()}
{#snippet listHeader()}
{#snippet option(opt)}
{#snippet createRow(isCreating, inputValue, i18n)}
```

<hr>

Snippets in more details:

### &bull; selection

```svelte
{#snippet collapsedSelection(selectedOptions, i18n)}
<!-- your snippet content -->
{/snippet}

<!-- example implementation -->
{#snippet selection(selectedOptions, bindItemAction)}
  {#each selectedOptions as opt (opt.id)}
    <div>
      {item.text}
      <button data-action="deselect" use:bindItem={opt}>&times;</button>
    </div>
  {/each}
{/snippet}
```

Where:

- `selectedOptions` is array of selected options as objects
- `bindItemAction` is _action_ which can be used to bind selected option option to the element with attribute `data-action="deselect"`. This attribute indicates, that when given option should be removed from selection.

### &bull; collapsedSelection

`collapsedSelection` is paired with `collapseSelection` prop:

- `collapseSelection`=`false`: only `selection` snippet is visible `(default)`
- `collapseSelection`=`'blur'`: `selection` snippet is show only when component is focused
- `collapseSelection`=`'always'`: `selection` snippet is never show

```svelte
{#snippet collapsedSelection(selectedOptions, i18n)}{/snippet}

<!-- default implementation -->
{#snippet collapsedSelection(i18n)}
  {i18n.collapsedSelection(selectedOptions.length)}
{/snippet}
```

Where:

- `selectedOptions` is array of selected options as objects
- `i18n` default or customized `i18n` object

### &bull; clearIcon

Snippet is coupled with `clearable` prop. You can override _only_ the content of clear button.

```svelte
{#snippet snippet_clearIcon(selectedOptions, inputValue)}
```

Where:

- `selectedOptions` is array of selected options as objects
- `inputValue` search query, if state of clear icon is related to user action

### &bull; toggleIcon

Dropdown toggle icon

```svelte
{#snippet toggleIcon(dropdownShow)}
```

Where:

- `dropdownShow` is bool, whether dropdown is being shown or not

### &bull; listHeader

Optional dropdown header content

```svelte
<!-- empty snippet with no props -->
{#snippet listHeader()}
````

Originally added to address issue [#151](https://github.com/mskocik/svelecte/issues/151), but can be used for anything.
If you want to display selected options here as in mentioned issue, check [Migration guide](/migration-guide#migration-from-v3).

### &bull; option

```svelte
{#snippet option(opt)}
```

Where:

- `item` is current option in dropdown. To duplicate highlighting functionality you need to use function `highlightSearch` exported from the library.

### &bull; createRow

This snippet is available only when `creatable` prop is `true` (and you enter to enter some input).

```svelte
{#snippet snippet_createRow(isCreating, inputValue, i18n)}
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
  :global(.snippet-definition) {
    border: 2px dashed red;
  }
  :global(.svelecte.inline-flex .sv-item--content) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
</style>
