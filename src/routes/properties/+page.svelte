# Properties

Scroll down for [event callback props](#event-callback-props).

Property            | Type              | Default     | Description
--------------------|-------------------|-------------|------------
name                | `string`          | `'svelecte'`| Create internal `<select>` element. Without `name` defined, no `<select>` is created
inputId             | `string`          | `null`      | Allow targeting input using a html ID. Otherwise it is based on `name` property
required            | `bool`            | `false`     | Make sense only when `name` is defined and you work with it as standard `<select>` element
disabled            | `bool`            | `false`     | Disable component
options             | `array`           | `[]`        | Option list, see [Options](/options) for more info
optionResolver      | `function`        |`undefined`  | Custom option resolver. Enabling "query mode". Check the example on [Options](/options) page
value               | `string`,`object` |  `null`     | Bound value property. For `multiple` is always array
valueAsObject       | `bool`            | `false`     | Switch whether Svelecte should expects from and return to `bind:value` objects or primitive value (usually string, number)
parentValue         | `string`          | `undefined` | Value which this component depends on. When `parentValue` is `null`, component is disabled. There is an example on [Remote Datasource](/fetch) page.
valueField          | `string`          | `null`      | Property to be used as value (if not specified, will be resolved automatically)
labelField          | `string`          | `null`      | Property shown in dropdown (if not specified, will be resolved automatically)
groupLabelField     | `string`          | `label`     | Property to be used as optgroup label
groupItemsField     | `string`          | `options`   | Property holding optgroup option list
disabledField       | `string`          | `$disabled` | Property to check, whether given options should be disabled and unselectable
placeholder         | `string`          | `Select`    | Input placeholder
searchable          | `bool`            | `true`      | Allow search among items by typing
clearable           | `bool`            | `false`     | Display ✖ icon to clear whole selection
renderer            | `mixed`           | `null`      | Dropdown and selection renderer function. More on [Rendering](/rendering) page
disableHighlight    | `bool`            | `false`     | Disable highlighting of input value in results. Can be useful with a `renderer` function that includes additional text or does its own highlighting
highlightFirstItem  | `bool`            | `true`      | Automatically highlight the first item in the list when the dropdown opens
selectOnTab         | `bool`,`string`   | `null`      | Based on value provided, it allows selecting currently active item by <kbd>Tab</kbd> AND (if value is `'select-navigate'`) also focus next input.
resetOnBlur         | `bool`            | `true`      | Control if input value should be cleared on blur
resetOnSelect       | `bool`            | `true`      | Control if input value should be cleared on item selection. **Note:** applicable only with `multiple`
closeAfterSelect    | `bool`            | `'auto'`    | closes dropdown after selection. Setting this to `true` is useful for **multiple** select only. For single select dropdown is always closed no matter the value this property has
strictMode          | `bool`            | `true`      | When `true`, passed value is checked whether exists on provided `options` array. If not, `invalidValue` event is dispatched
multiple            | `bool`            | `false`     | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
max                 | `number`          | `0`         | Maximum allowed items selected, applicable only for multiselect
collapseSelection   | `string`          | `null`      | Whether selection should be collapsed and when, check [Rendering](/rendering) for more info.
keepSelectionInList | `bool`            | `'auto'`    | Whether keep selected items in dropdown. `auto` for `multiple` removes selected items from dropdown
creatable           | `bool`            | `false`     | Allow creating new item(s)
creatablePrefix     | `string`          | `*`         | Prefix marking new item
allowEditing        | `bool`            | `false`     | When pressing `Backspace` switch to edit mode instead of removing newly created item. **NOTE** intended to be used with `creatable` property
keepCreated         | `bool`            | `true`      | Switch whether to add newly created option to option list or not
delimiter           | `string`          | `,`         | split inserted text when pasting to create multiple items
createFilter        | `function`        | `null`      | Function, that transform input string to custom value. It can serve as a filter, if value is valid or not. If you want to dismiss entered value, function should return `''` (empty string). By default all input string is trimmed and all multiple spaces are removed.
createHandler       | `function`        | `null`      | Custom (may be) async function transforming input string to option object. Default returns object with `valueField` and `labelField` properties, where `labelField`'s value is input string prefixed with `creatablePrefix` property.
fetch               | `string`          | `null`      | Sets fetch URL. Visit [Remote datasource] form more details
fetchProps          | `object`          | `null`      | Set options for new fetch [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
fetchCallback       | `function`        | `null`      | optional fetch callback
fetchResetOnBlur    | `bool`            | `true`      | reset previous search results on empty input, related to `resetOnBlur`
fetchDebounceTime   | `number`          | `300`       | how many miliseconds is request debounced before fetch is executed
minQuery            | `number`          | `1`         | Minimal amount of characters required to perform remote request. Usable with `fetch` property
lazyDropdown        | `bool`            | `true`      | render dropdown after first focus, not by default
virtualList         | `bool`            | `false`     | Whether use virtual list for dropdown items (useful for large datasets)
vlHeight            | `number`          | `null`      | Height of virtual list dropdown (if not specified, computed automatically)
vlItemSize          | `number`          | `null`      | Height of one row (if not specified, computed automatically)
searchProps         | `object`          | `null`      | Customize `sifter.js` settings. See [Searching](/searching) page for more details
class               | `string`          | `svelecte-control` | default css class
i18n                | `object`          | `null`      | I18n object overriding default settings
dndzone             | `function`        | noop        | Pass `dndzone` from `svelte-dnd-action`, if you want to support selection reordering. See the [example REPL](https://svelte.dev/repl/da2de4b9ed13465d892b678eba07ed99?version=3.44.0)
validatorAction     | `array`           | `null`      | Bind validator action for inner `<select>` element. Designed to be used with `svelte-use-form`. See the [example REPL](https://svelte.dev/repl/de3cd8e47feb4d078b6bace8d4cf7b90?version=3.44.1). For this to work, `name` property MUST be defined
anchor_element      | `bool`            | `null`      | `internal`: when passing also existing select (for custom element)

## Event callback props

Property        | arguments                   | description
-------------|-----------------------------|----------------------------------------------------------------------------
onChange       | selection                   | selected objects. If `anchor` property is defined, `change` event is called also on it
onFocus        | `<input>`                        | focus event
onBlur         | `<input>`                           | blur event
onCreateOption | option                      | newly created option object
onCreateFail | object | thrown if `createHandler` fails
onEnterKey     | underlying `keyDown` event  | triggered when natively it would cause form submit (dropdown is closed). This gives you ability to prevent it by calling `event.detail.preventDefault()`
onFetch        | options                     | newly fetched remote options
onFetchError   | error                     | dispatche on fetch error of any kind
onInvalidValue | invalidValue                | triggered when passed `value` is out of provided `options` items. Internal (and bound, if any) `value` is set to `null` or `[]` if multiple
