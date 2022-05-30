# Svelecte [![NPM version](http://img.shields.io/npm/v/svelecte.svg?style=flat)](https://www.npmjs.org/package/svelecte)

![svelecte](https://mskocik.github.io/svelecte/static/svelecte.png)

Flexible autocomplete/select component written in Svelte. Massively inspired by Selectize.js. Also usable as [custom element](https://github.com/mskocik/svelecte-element) (CE). Usable in forms, behaves very similar to standard `<select>` element.

See the latest changes on the [Releases](https://github.com/mskocik/svelecte/releases) page.

## 📃 Features 

- searchable
- multiselect with limit of max selected items
- allow simple array or complex objects as items
- custom item renderer (formatter)
- allow creating new items (and possibly edit them)
- remote data fetch
- virtual list support
- i18n support
- SSR support
- lazy dropdown rendering
- usable as custom element
- stylable
- reordable multi selection  with addition of `svelte-dnd-action` ([example](https://svelte.dev/repl/da2de4b9ed13465d892b678eba07ed99?version=3.44.0)) 
- usable with `svelte-use-form`  ([example](https://svelte.dev/repl/de3cd8e47feb4d078b6bace8d4cf7b90?version=3.44.1))


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

<details>
<summary><strong>💭 Note about <code>value</code> and <code>readSelection</strong></code> property</summary>
<div>
Since v3.0 inner logic behind these properties has changed. Now `value` property reflects inner selection. By default it
returns `valueField` property (if not defined, Svelecte tries to guess which property is representing value). This also means
that if you want to set new value, you need to assign to it correct value. Let's take the example above:

```
myValue = 2;
```
This would select item with `id` property `2`.

Sometimes you want to work strictly with objects, like `myValue = {id: 2, name: 'Item 2'}`. You can set property `valueAsObject` which tells Svelecte to handle `value` property as object or array of object (if `multiple` is also set).

Property `readSelection` _always_ returns selected object or object array no matter if `valueAsObject` is set or not.
</div>
</details>

---

## 👀 Examples

👉 Examples with more detailed documentation can be found at [https://mskocik.github.io/svelecte/](https://mskocik.github.io/svelecte/).

## 🛠 Configuration & API

### Exposed properties:


Property          | Type             | Default    | Description
------------------|------------------|------------|------------
options           | array            | `[]`       | Data array
valueAsObject     | bool             | `false`    | Switch whether Svelecte should expects from and return to `bind:value` objects or primitive value (usually string, number)
valueField        | string           | `null`     | Property to be used as value (if not specified, will be selected automatically)
labelField        | string           | `null`     | Property shown in dropdown (if not specified, will be selected automatically)
disabledField     | string           | `$disabled`| Property to check, whether given options should be disabled and unselectable
required          | bool             | `false`    | make sense only when `name` is defined
placeholder       | string           | `Select`   | Input placeholder
searchable        | bool             | `true`     | Allow search among items by typing
disabled          | bool             | `false`    | Disable component
renderer          | string\|function | `null`     | dropdown and selection renderer function. More info in item rendering section
controlItem       | Component        | `Item`     | Item component when item is selected. See [Custom Items](#custom-items) section for more details.
dropdownItem      | Component        | `Item`     | Item component in dropdown. See [Custom Items](#custom-items) section for more details.
selectOnTab       | bool             | `false`    | Allow selecting currently active item by <kbd>Tab</kbd> key
resetOnBlur       | bool             | `true`     | Control if input value should be cleared on blur
resetOnSelect     | bool             | `true`     | Control if input value should be cleared on item selection. **Note:** applicable only with `multiple` 
clearable         | bool             | `false`    | Display ✖ icon to clear whole selection
multiple          | bool             | `false`    | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
max               | number           | `0`        | Maximum allowed items selected, applicable only for multiselect
collapseSelection | bool             | `false`    | collapse selection when `multiple` and not focused
name              | string           | `null`     | create `<select>`, usable for normal forms.
inputId           | string           | `null`     | allow targeting input using a html label.
creatable         | bool             | `false`    | Allow creating new item(s)
creatablePrefix   | string           | `*`        | Prefix marking new item
allowEditing      | bool             | `false`    | When pressing `Backspace` switch to edit mode instead of removing newly created item. **NOTE** intended to be used with `creatable` property
keepCreated       | bool             | `true`     | Switch whether to add newly created option to option list or not
delimiter         | string           | `,`        | split inserted text when pasting to create multiple items
createFilter      | function         | `null`     | Function, that transform input string to custom value. It can serve as a filter, if value is valid or not. If you want to dismiss entered value, function should return `''` (empty string). By default all input string is trimmed and all multiple spaces are removed. Function notation:<br>`createFilter(inputValue: string, dropdownOptions: array): string`
createTransform   | function         | `null`     | Custom function transforming input string to option object. Default returns object with `valueField` and `labelField` properties, where `labelField`'s value is input string prefixed with `creatablePrefix` property. Function notation:<br>`createTransform(inputValue: string, creatablePrefix: string, valueField: string, labelField: string): object`
fetch             | string\|function | `null`     | Check "remote datasource" section for more details
fetchMode         | string           | `auto`     | When set to `init` options are fetched only when mounted, when searching it search in downloaded dataset
fetchCallback     | function         | `null`     | optional fetch callback
fetchResetOnBlur  | bool             | `true`     | reset previous search results on empty input, related to `resetOnBlur`
minQuery          | number           | `1`        | Minimal amount of characters required to perform remote request. Usable with `fetch` property
lazyDropdown      | bool             | `true`     | render dropdown after first focus, not by default
virtualList       | bool             | `false`    | Whether use virtual list for dropdown items (useful for large datasets)
vlHeight          | number           | `null`     | Height of virtual list dropdown (if not specified, computed automatically)
vlItemSize        | number           | `null`     | Height of one row (if not specified, computed automatically)
searchField       | string\|array    | `null`     | Specify item property that will be used to search by (if not specified all props except `value` prop will be used)
sortField         | string           | `null`     | Specify sort property. If not specified, `labelField` will be used
disableSifter     | bool             | `false`    | Disable Sifter filtering & sorting. Can be useful in combination with `fetch`, when further filtering or sorting may be undesired
disableHighlight  | bool             | `false`    | Disable highlighting of input value in results. Can be useful with a `renderer` function that includes additional text or does its own highlighting
class             | string           | `svelecte-control` | default css class
style             | string           | `null`     | inline style
hasAnchor         | bool             | `null`     | `internal`: when passing also existing select (for CE)
i18n              | object           | `null`     | I18n object overriding default settings
dndzone           | function         | empty      | Pass `dndzone` from `svelte-dnd-action`, if you want to support selection reordering. See the [example REPL](https://svelte.dev/repl/da2de4b9ed13465d892b678eba07ed99?version=3.44.0)
validatorAction   | array            | `null`     | Bind validator action for inner `<select>` element. Designed to be used with `svelte-use-form`. See the [example REPL](https://svelte.dev/repl/de3cd8e47feb4d078b6bace8d4cf7b90?version=3.44.1)


### Custom items

If `renderer` property is not enough for you or you prefer Component syntax to HTML strings, you can use your own Components. Keep in mind that default `Item` component handles highlighting when searching, but the rest of features 
like styling should be inherited if you use proper css classes (the same as `Item` component)..

To make it easier to use your own Components, there are available actions, highlighting function and close button icon for you to use.

The simplest example can be found in this [REPL](https://svelte.dev/repl/627c83c2666f452185baa8947f5588bb?version=3.44.1).

---

### Emitted events:

Event        | arguments | description
-------------|-----------|-------------
fetch        | options   | newly fetched remote options
change       | selection | selected objects. If `anchor` property is defined, `change` event is called also on it
createoption | option    | newly created option object
blur         | -         | blur event

### Public API:

Name          | type     | arguments | description
--------------|----------|-----------|-------------
focus         | function | -         | focus input
getSelection  | function | bool      | return selection, if `true` is passed, only values are returns, whole objects otherwise
setSelection  | function | array     | set selection programmatically
config        | property | -         | **context property**: global common config for all instances, you can override most properties here and also some additional, mainly i18n
addFormatter  | function | -         | **context function**: with signature `(name, formatFn)` you can add additional item renderers (formatters)
<!-- clearByParent | bool | internal for CE  -->

### I18n

This is default value of `i18n` property: 
```js
// config.i18n defaults:
{
  i18n: {
    empty: 'No options',
    nomatch: 'No matching options',    
    max: num => `Maximum items ${num} selected`,
    fetchBefore: 'Type to start searching',
    fetchQuery: (minQuery, inputLength) => `Type ${minQuery > 1 && minQuery > inputLength 
      ? `at least ${minQuery - inputLength} characters `
      : '' }to start searching`,
    fetchEmpty: 'No data related to your search',
    collapsedSelection: count => `${count} selected`,
    createRowLabel: value => `Create '${value}'`
  },
  collapseSelectionFn: function(selectionCount, selection) {
    return settings.i18n.collapsedSelection(selectionCount);
  }
}
```

You can override whole object or only items you are interested in. You can override it globally or on component level:

```js
// global override
import Svelecte, { config } from 'svelecte';

config.i18n = {
    empty: '🚫',
    nomatch: '✋',
    max: num => '🙄',
    fetchBefore: '💻',
    fetchQuery: (minQuery, inputLength) => '🧮',
    fetchEmpty: '🚮',
    collapsedSelection: () => '🗃',
    createRowLabel: value => `📝 ${value}`
}

// local override (component-level)
const myI18n = {
    empty: `Empty list, can't you see?`
}

<Svelecte i18n={myI18n}></Svelecte>
```

## 🙏 Thanks to

- [selectize.js](https://github.com/selectize/selectize.js) - inspiration
- [sifter](https://github.com/brianreavis/sifter.js) - search engine
- [svelte-select](https://github.com/rob-balfre/svelte-select) - inspiration & how-to, including some code borrowing 😊
- [svelte-tiny-virtual-list](https://github.com/Skayo/svelte-tiny-virtual-list) virtual list capability

## License

[MIT License](https://github.com/mskocik/svelecte/blob/master/LICENSE)
