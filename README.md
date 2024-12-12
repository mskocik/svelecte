# Svelecte [![NPM version](http://img.shields.io/npm/v/svelecte.svg?style=flat)](https://www.npmjs.org/package/svelecte)

![svelecte](https://svelecte.vercel.app/svelecte.png)

> [!NOTE]
> For Svelte 4 use version 4. Version 5 is svelte 5 only ⚡


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
npm install svelecte --save
```

## Minimalistic example

```html
<script>
import Svelecte from 'svelecte';

const list = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2'}, ...];
let myValue = null;
</script>

<Svelecte options={list} bind:value={myValue}></Svelecte>
```

## Properties

Property                  | Type              | Default     | Description
--------------------------|-------------------|-------------|------------
name                      | `string`          | `'svelecte'`| Create internal `<select>` element. Without `name` defined, no `<select>` is created
inputId                   | `string`          | `null`      | Allow targeting input using a html ID. Otherwise it is based on `name` property
required                  | `bool`            | `false`     | Make sense only when `name` is defined and you work with it as standard `<select>` element
disabled                  | `bool`            | `false`     | Disable component
options                   | `array`           | `[]`        | Option list, see [Options](https://svelecte.vercel.app/options) for more info
optionResolver            | `function`        |`undefined`  | Custom option resolver. Enabling "query mode". Check the example on [Options](https://svelecte.vercel.app/options) page
value                     | `string`,`object` |  `null`     | Bound value property. For `multiple` is always array
valueAsObject             | `bool`            | `false`     | Switch whether Svelecte should expects from and return to `bind:value` objects or primitive value (usually string, number)
parentValue               | `string`          | `undefined` | Value which this component depends on. When `parentValue` is `null`, component is disabled. There is an example on [Remote Datasource](https://svelecte.vercel.app/fetch) page.
valueField                | `string`          | `null`      | Property to be used as value (if not specified, will be resolved automatically)
labelField                | `string`          | `null`      | Property shown in dropdown (if not specified, will be resolved automatically)
groupLabelField           | `string`          | `label`     | Property to be used as optgroup label
groupItemsField           | `string`          | `options`   | Property holding optgroup option list
disabledField             | `string`          | `$disabled` | Property to check, whether given options should be disabled and unselectable
placeholder               | `string`          | `Select`    | Input placeholder
searchable                | `bool`            | `true`      | Allow search among items by typing
clearable                 | `bool`            | `false`     | Display ✖ icon to clear whole selection
renderer                  | `mixed`           | `null`      | Dropdown and selection renderer function. More on [Rendering](https://svelecte.vercel.app/rendering) page
disableHighlight          | `bool`            | `false`     | Disable highlighting of input value in results. Can be useful with a `renderer` function that includes additional text or does its own highlighting
highlightFirstItem        | `bool`            | `true`      | Automatically highlight the first item in the list when the dropdown opens
selectOnTab               | `bool`,`string`   | `null`      | Based on value provided, it allows selecting currently active item by <kbd>Tab</kbd> AND (if value is `'select-navigate'`) also focus next input.
resetOnBlur               | `bool`            | `true`      | Control if input value should be cleared on blur
resetOnSelect             | `bool`            | `true`      | Control if input value should be cleared on item selection. **Note:** applicable only with `multiple`
closeAfterSelect          | `bool`            | `'auto'`    | closes dropdown after selection. Setting this to `true` is useful for **multiple** select only. For single select dropdown is always closed no matter the value this property has
deselectMode              | `'native'\|'toggle'\|'none'` | `'toggle'` | **single-select only**. Defines behavior how currently selected item can be de-selected. `native` disabled ability to clear selection by "selecting item again", but it's still possible to remove selection by icon, or by button, if `clearable` is set. `none` prevents any selection removal, only change, after first selection is made. `toggle` provides no restrictions and is consistent with multiselect behavior
strictMode                | `bool`            | `true`      | When `true`, passed value is checked whether exists on provided `options` array. If not, `invalidValue` event is dispatched
multiple                  | `bool`            | `false`     | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
max                       | `number`          | `0`         | Maximum allowed items selected, applicable only for multiselect
collapseSelection         | `string`          | `null`      | Whether selection should be collapsed and when, check [Rendering](https://svelecte.vercel.app/rendering) for more info.
keepSelectionInList       | `bool`            | `'auto'`    | Whether keep selected items in dropdown. `auto` for `multiple` removes selected items from dropdown
keepSelectionDuringSearch | `bool`            | `false`     | Whether keep selected items in dropdown while searching. Requires `keepSelectionInList={true}`
creatable                 | `bool`            | `false`     | Allow creating new item(s)
creatablePrefix           | `string`          | `*`         | Prefix marking new item
allowEditing              | `bool`            | `false`     | When pressing `Backspace` switch to edit mode instead of removing newly created item. **NOTE** intended to be used with `creatable` property
keepCreated               | `bool`            | `true`      | Switch whether to add newly created option to option list or not
delimiter                 | `string`          | `,`         | split inserted text when pasting to create multiple items
createFilter              | `function`        | `null`      | Function receiving `inputValue` returning `bool` checks if input string is valid or not. If you want to dismiss entered value (ie. prevent item creation), function should return `true`, `false` otherwise.
createHandler             | `function`        | `null`      | Custom (may be) async function transforming input string to option object. Default returns object with `valueField` and `labelField` properties, where `labelField`'s value is input string prefixed with `creatablePrefix` property.
fetch                     | `string`          | `null`      | Sets fetch URL. Visit [Remote datasource] form more details
fetchProps                | `object`          | `null`      | Set options for new fetch [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
fetchCallback             | `function`        | `null`      | optional fetch callback
fetchResetOnBlur          | `bool`            | `true`      | reset previous search results on empty input, related to `resetOnBlur`
fetchDebounceTime         | `number`          | `300`       | how many miliseconds is request debounced before fetch is executed
minQuery                  | `number`          | `1`         | Minimal amount of characters required to perform remote request. Usable with `fetch` property
lazyDropdown              | `bool`            | `true`      | render dropdown after first focus, not by default
positionResolver          | `function`        | `noop`      | (optional) Action for custom dropdown positioning.
virtualList               | `bool`            | `false`     | Whether use virtual list for dropdown items (useful for large datasets)
vlItemSize                | `number`          | `null`      | Height of one row (if not specified, computed automatically)
searchProps               | `object`          | `null`      | Customize `sifter.js` settings. See [Searching](https://svelecte.vercel.app/searching) page for more details
class                     | `string`          | `svelecte-control` | default css class
i18n                      | `object`          | `null`      | I18n object overriding default settings
dndzone                   | `function`        | noop        | Pass `dndzone` from `svelte-dnd-action`, see [Examples](https://svelecte.vercel.app/examples) page
validatorAction           | `array`           | `null`      | Bind validator action for inner `<select>` element. Designed to be used with `svelte-use-form`, see [Validation](https://svelecte.vercel.app/validation) page. For this to work, `name` property MUST be defined
anchor_element            | `bool`            | `null`      | `internal`: when passing also existing select (for custom element)
controlClass              | `string`          | `null`      | Optional css class for element `.sv-control`
dropdownClass             | `string`          | `null`      | Optional css class for element `.sv_dropdown`
optionClass               | `string`          | `null`      | Optional css class for element `.sv-item--wrap.in-dropdown`


## Available slots

For more info refer to [Rendering](https://svelecte.vercel.app/rendering) page.

```html
<slot name="icon" />
<slot name="collapsedSelection" let:selectedOptions let:i18n />
<slot name="selection" let:selectedOptions let:bindItem />
<slot name="clear-icon" let:selectedOptions let:inputValue />
<slot name="dropdown-toggle" let:isOpen />
<slot name="list-header" />
<slot name="option" let:item />
<slot name="create-row" let:isCreating let:inputValue let:i18n  />
```

## Emitted events:

Event        | arguments                   | description
-------------|-----------------------------|----------------------------------------------------------------------------
fetch        | options                     | newly fetched remote options
fetchError   | error                     | dispatche on fetch error of any kind
change       | selection                   | selected objects. If `anchor` property is defined, `change` event is called also on it
createoption | option                      | newly created option object
createFail | object | thrown if `createHandler` fails
focus        | `<input>`                        | focus event
blur         | `<input>`                           | blur event
invalidValue | invalidValue                | triggered when passed `value` is out of provided `options` items. Internal (and bound, if any) `value` is set to `null` or `[]` if multiple
enterKey     | underlying `keyDown` event  | triggered when natively it would cause form submit (dropdown is closed). This gives you ability to prevent it by calling `event.detail.preventDefault()`

## Public API:

Name          | type       | arguments | description
--------------|------------|-----------|-------------
focus         | `function` | -         | focus input
refetchWith   | `function` | new value |
<!-- clearByParent | bool | internal for CE  -->

There are global config and `addRenderer` function available. Refer to [Global config](https://svelecte.vercel.app/global-config) and [Rendering](https://svelecte.vercel.app/rendering) page respectively.

## I18n, a11y, CSS variables

Visit [documentation](https://svelecte.vercel.app/global-config) for more details.

## Thanks to

- [selectize.js](https://github.com/selectize/selectize.js) - main inspiration
- [sifter](https://github.com/brianreavis/sifter.js) - search engine
- [svelte-tiny-virtual-list](https://github.com/Skayo/svelte-tiny-virtual-list) virtual list functionality for v3, v4
- and [svelte](https://svelte.dev) of course 😊

And if you want to thank me, you can through my [sponsor](https://github.com/sponsors/mskocik) page.

## License

[MIT License](https://github.com/mskocik/svelecte/blob/master/LICENSE)
