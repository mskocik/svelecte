# Migration from v4

Version 5 requires svelte v5. Currently in development, can contains bugs.

If you are use v3 of Svelecte, [migrate to v4 first](#migration-from-v3) and when you migrate to svelte v5, update also svelecte to v5.

## Slots

Slots were removed in favour of snippets. Slot to snippet mappings:

```svelte
{#snippet prepend}          // [!code ++]
  <div>🔍</div>             // [!code ++]
{/snippet}                  // [!code ++]

<Svelecte {prepend} >       // [!code ++]
  <div slot="icon">🔍</div> // [!code --]
</Svelecte>
```

- `icon` changed to `prepend`
- `selection` left unchanged
- `collapsedSelection` left unchanged
- `clear-icon` changed to `clearIcon`
- `dropdown-toggle` changed to `toggleIcon`
- `dropdown-toggle` changed to `append`
- `list-header` changed to `listHeader`
- `option` left unchanged
- `create-row` changed to `createRow`

## Events

Due to deprecation of `createEventDispatcher` all events has been replaced by event callback properties.

```svelte
<Svelecte on:fetch={fetchEventHandler} /> // [!code --]
<Svelecte onFetch={fetchEventHandler} /> // [!code ++]
```
This is the event to prop mapping list:

- `change` changed to `onChange`
- `focus` changed to `onFocus`
- `blur` changed to `onBlur`
- `createoption` changed to `onCreateOption`
- `createFail` changed to `onCreateFail`
- `enterKey` changed to `onEnterKey`
- `fetch` changed to `onFetch`
- `fetchError` changed to `onFetchError`
- `invalidValue` changed to `onInvalidValue`

## Validation through `svelte-use-form`

Support for `svelte-use-form` has been dropped without replacement. Svelecte works nicely out of the box with `sveltekit-superforms` as shown in [validation](validation) page.

```svelte
<Svelecte validatorAction={...}/> // [!code --]
```

---
---

# Migration from v3

The v4.0 release of Svelecte is almost complete rewrite. This gave me opportunity to start fresh and write things more correct/elegant way, which will much easier to reason about and work with. So breaking changes were inevitable to pursue this goal of simplicity and maintainability breaking changes are relatively huge - ranging from HTML markup and CSS props to dropped/merged properties and changes what can be defined in specific properties.
It's all for the best.

## Changed exports

Previously globally available function `addFormatter` has been renamed to `addRenderer` to be inline with `renderer` property.

```svelte
import { addFormatter } from 'svelecte'; // [!code --]
import { addRenderer } from 'svelecte@next';  // [!code ++]
```

Exported property `TAB_SELECT_NAVIGATE` has been removed due to added types. Now `selectOnTab` offers correct values to set.

```svelte
<script>
  import Svelecte, { TAB_SELECT_NAVIGATE } from 'svelecte'; // [!code --]
  import Svelecte from 'svelecte@next'; // [!code ++]
</script>

<Svelecte selectOnTab={TAB_SELECT_NAVIGATE} /> // [!code --]
<Svelecte selectOnTab="select-navigate" /> // [!code ++]
```

## Changed properties

Properties which have different set of possible values.

### `fetch`

`fetch` now accepts *ONLY* strings. Due to inner rewrite, you can't really rewrite underlying fetch requesing logic as was possible in v3. If you need to further customize
fetch props, you can set them in `fetchProps` property. Refer to [fetch](/fetch) page for more details.

```svelte
<script>
// options for Fetch API Request constructor
const fetchProps = {
    headers: {
        Authorization: 'bearer my-query',
        'X-Requested-With': 'my-custom-header'
    }
}

// my custom fetch                                            // [!code --]
function myFetch(query) {                                     // [!code --]
    return fetch(`/api?query=${query}`, fetchProps)           // [!code --]
        .then((res) => res.json());                           // [!code --]
}

</script>

<Svelecte fetch={myFetch} />  // [!code --]
<Svelecte fetch="/api?query=[query]" fetchProps={props} /> // [!code ++]
```


### `collapseSelection`

Previously a `boolean`, now the type of collapsing must be specified (`null`, `'blur'` or `'always'`). Basically it merges together properties `collapseSelection` and `alwaysCollapsed`.

```svelte
<Svelecte collapseSelection /> // [!code --]
<Svelecte collapseSelection="blur" /> // [!code ++]
```

### `createFilter`

This function now accepts just one parameter, `inputValue: string` and returns `boolean`

```js
function createFilter(inputValue, options) {}  // [!code --]
function createFilter(inputValue) {}  // [!code ++]
```

### `createTransform`

This function has been renamed to `createHandler` and instead of 4 arguments it received one argument object with the same props.
Also this function can be async.

```svelte
function myCreateTransform(inputValue, prefix, valueField, labelField) {...}  // [!code --]
async function myAsyncCreateHandler({ inputValue, prefix, valueField, labelField }) { ... } // [!code ++]

<Svelecte createTransform={myCreateTransform} /> // [!code --]
<Svelecte createHandler={myAsyncCreateHandler} /> // [!code ++]
```

## Removed properties

Some properties were removed and in most cases, replacement exists, will be always shown or linked to.

### `controlItem`

This property has been dropped in favor to named slot `selection`. Main difference here is that slot exposes `selectedOptions` property. See [Rendering](/rendering) page for more details about exposed properties.

```svelte
<Svelecte controlItem={MyComponent} {...otherProps}>           // [!code --]
<Svelecte {...otherProps} >                                                             // [!code ++]
  <svelte:fragment slot="selection" let:selectedOptions let:bindItem let:labelField>    // [!code ++]
    {#each selectedOptions as item(item.value)}                                         // [!code ++]
      <MyItem {item} {bindItem} labelProp={labelField}/>                                // [!code ++]
    {/each}                                                                             // [!code ++]
  </svelte:fragment>                                                                    // [!code ++]
</Svelecte>
```

### `dropdownItem`

This property has been dropped in favor to named slot `option` with exposed `item` property. Againg refer to [Rendering](/rendering) page for more details.


```svelte
<Svelecte dropdownItem={MyComponent} {...otherProps}>                 // [!code --]
<Svelecte {...otherProps} >                   // [!code ++]
  <svelte:fragment slot="option" let:item>    // [!code ++]
    <MyDropdownItem {item} />                         // [!code ++]
  </svelte:fragment>                          // [!code ++]
</Svelecte>
```

### `alwaysCollapsed`

This property has been merged into property `collapseSelection` which now accepts `'blur'` or `'always'` value. With this
change new slot `list-header` has been added to allow customize selection rendering directly in the dropdown,
although implementing it is optional.
But if you were using it in v3, you need to implement it to keep it the same.

```svelte
<Svelecte collapseSelection alwaysCollapsed /> // [!code --]
<Svelecte collapseSelection="always" bind:readSelection>        // [!code ++]
  <div slot="list-header" class="sv-control--selection" >     // [!code ++]
    {#each readSelection as opt (opt.id)}                     // [!code ++]
        <!-- your rendering -->                               // [!code ++]
    {/each}                                                 // [!code ++]
  </div>                                                    // [!code ++]
</Svelecte>
```

### `searchField`

This property has been dropped in favour of extend search-related settings. Refer to [Searching](/searching) page for more options.

### `sortField`

This property has been dropped in favour of extend search-related settings. Refer to [Searching](/searching) page for more options.

### `disableSifter`

This property has been dropped in favour of extend search-related settings. Refer to [Searching](/searching) page for more options.

### `style`

Removed. Styling with [CSS variables](/theme) is recommended way to customize component visuals.

### `labelAsValue`

This property has no replacement. Now when simple array (strings, no objects) are passed as `options` prop, it is converted internally like this:

```js
options = ['One', 'Two', 'Three'];

// v3 conversion
options = [
    {value: 0, text: 'One'},
    {value: 1, text: 'Two'},
    {value: 2, text: 'Three'}
];

// v4 conversion
options = [
    {value: 'One', text: 'One'},
    {value: 'Two', text: 'Two'},
    {value: 'Three', text: 'Three'}
];
```

## Slots

### `indicator-icon`

This slot has been renamed to `dropdown-toggle` and also it's exposed property has been changed

```svelte
<slot name="indicator-icon" let:hasDropdownOpened>  // [!code --]
<slot name="dropdown-toggle" let:isOpen>            // [!code ++]
```

## CSS

Due to markup changes you can expect that everything changed. But on the bright side, CSS theming is now fully supported
and hopefully sufficient enough. If you miss something, raise an issue or open new discussion.

Check the details on [Theme](/theme) page.

## Global config

### `collapseSelectionFn`

Property has been dropped in favour of `collapsedSelection` slot. By default it still uses `i18n.collapseSelection`.

### `closeAfterSelect`

Default value changed from `false` to `'auto'`. `Auto` meand v3 default behaviour. `true` or `false` represents
enforcing behavior.

### `selectOnTab`

Default value changed from `null` to `false`.
