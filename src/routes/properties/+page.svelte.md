# Properties

Scroll down for [event callback props](#event-callback-props).

Property            | Type              | Default     | Description
--------------------|-------------------|-------------|------------
name                | `string`          | `'svelecte'`| Create internal `<select>` element. ⚠️ Without `name` defined, no `<select>` element is created and standard form submit won't work as expected
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
deselectMode        | `'native'`\|`'toggle'`\|`'none'`| `'toggle'` | **single-select only**. Defines behavior how currently selected item can be de-selected. `native` disabled ability to clear selection by "selecting item again", but it's still possible to remove selection by icon, or by button, if `clearable` is set. `none` prevents any selection removal, only change, after first selection is made. `toggle` provides no restrictions and is consistent with multiselect behavior
strictMode          | `bool`            | `true`      | When `true`, passed value is checked whether exists on provided `options` array. If not, `invalidValue` event is dispatched. This is useful with `fetch` defined and you want to specify default value
multiple            | `bool`            | `false`     | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
max                 | `number`          | `0`         | Maximum allowed items selected, applicable only for multiselect
collapseSelection   | `string`          | `null`      | Whether selection should be collapsed and when, check [Rendering](/rendering) for more info.
keepSelectionInList | `bool`            | `'auto'`    | Whether keep selected items in dropdown. `auto` for `multiple` removes selected items from dropdown
creatable           | `bool`            | `false`     | Allow creating new item(s)
creatablePrefix     | `string`          | `*`         | Prefix marking new item
allowEditing        | `bool`            | `false`     | When pressing `Backspace` switch to edit mode instead of removing newly created item. **NOTE** intended to be used with `creatable` property
keepCreated         | `bool`            | `true`      | Switch whether to add newly created option to option list or not
delimiter           | `string`          | `,`         | split inserted text when pasting to create multiple items
createFilter        | `function`        | `null`      | Function receiving `inputValue` returning `bool` checks if input string is valid or not. If you want to dismiss entered value (ie. prevent item creation), function should return `true`, `false` otherwise.
createHandler       | `function`        | `null`      | Custom (may be) async function transforming input string to option object. Default returns object with `valueField` and `labelField` properties, where `labelField`'s value is input string prefixed with `creatablePrefix` property.
fetch               | `string`          | `null`      | Sets fetch URL. Visit [Remote datasource] form more details
fetchProps          | `object`          | `null`      | Set options for new fetch [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)
fetchCallback       | `function`        | `null`      | optional fetch callback
fetchResetOnBlur    | `bool`            | `true`      | reset previous search results on empty input, related to `resetOnBlur`
fetchDebounceTime   | `number`          | `300`       | how many miliseconds is request debounced before fetch is executed
minQuery            | `number`          | `1`         | Minimal amount of characters required to perform remote request. Usable with `fetch` property
lazyDropdown        | `bool`            | `true`      | render dropdown after first focus, not by default
positionResolver    | `function`        | `noop`      | (optional) action for custom dropdown positioning.
virtualList         | `bool`            | `false`     | Whether use virtual list for dropdown items (useful for large datasets)
vlItemSize          | `number`          | `null`      | Height of one row (if not specified, computed automatically)
searchProps         | `object`          | `null`      | Customize `sifter.js` settings. See [Searching](/searching) page for more details
class               | `string`          | `svelecte-control` | default css class
i18n                | `object`          | `null`      | I18n object overriding default settings
dndzone             | `function`        | noop        | Pass `dndzone` from `svelte-dnd-action`, if you want to support selection reordering. See the [examples](/examples#drag--drop)
anchor_element      | `bool`            | `null`      | `internal`: when passing also existing select (for custom element)
controlClass        | `string`          | `null`      | Optional css class for element `.sv-control`
dropdownClass       | `string`          | `null`      | Optional css class for element `.sv_dropdown`
optionClass         | `string`          | `null`      | Optional css class for element `.sv-item--wrap.in-dropdown`

## Event callback props

Property        | arguments                   | description
-------------|-----------------------------|----------------------------------------------------------------------------
onChange       | selection                   | selected objects. If `anchor_element` property is defined, `change` event is called also on it
onFocus        | `<input>`                        | focus event
onBlur         | `<input>`                           | blur event
onCreateOption | option                      | newly created option object
onCreateFail | object | thrown if `createHandler` fails
onEnterKey     | underlying `keyDown` event  | triggered when natively it would cause form submit (dropdown is closed). This gives you ability to prevent it by calling `event.preventDefault()`
onFetch        | options                     | newly fetched remote options
onFetchError   | error                     | dispatche on fetch error of any kind
onInvalidValue | invalidValue                | triggered when passed `value` is out of provided `options` items. Internal (and bound, if any) `value` is set to `null` or `[]` if multiple
