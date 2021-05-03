# Svelecte

![svelecte](https://mskocik.github.io/svelecte-docs/static/svelecte.png)

Flexible autocomplete/select component written in Svelte. Massively inspired by Selectize.js. Also usable as [custom element](https://github.com/mskocik/svelecte-element) (CE). Usable in forms, behaves very similar to standard `<select>` element.

## 📃 Features

- searchable
- multiselect with limit of max selected items
- allow simple array or complex objects as items
- custom item renderer (formatter)
- allow creating new items
- remote data fetch
- virtual list support
- usable as custom element
- i18n support
- SSR support


## 🔧 Installation

```
npm install svelecte --save
```

## 👀 Examples

👉 Examples with detailed documentation can be found at [https://mskocik.github.io/svelecte-docs/](https://mskocik.github.io/svelecte-docs/).

## 🛠 Configuration & API

### Exposed properties:


Property          | Type             | Default    | Description
------------------|------------------|------------|------------
options           | array            | `[]`       | Data array
valueField        | string           | `null`     | Property to be used as value (if not specified, will be selected automatically)
labelField        | string           | `null`     | Property shown in dropdown (if not specified, will be selected automatically)
required          | bool             | `false`    | make sense only when `name` is defined
placeholder       | string           | `'Select'` | Input placeholder
searchable        | bool             | `true`     | Allow search among items by typing
disabled          | bool             | `false`    | Disable component
renderer          | string\|function | `null`     | dropdown and selection renderer function. More info in item rendering section
selectOnTab       | bool             | `false`    | Allow selecting currently active item by <kbd>Tab</kbd> key
clearable         | bool             | `false`    | Display ✖ icon to clear whole selection
multiple          | bool             | `false`    | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
max               | number           | `0`        | Maximum allowed items selected, applicable only for multiselect
collapseSelection | bool             | `false`    | collapse selection when `multiple` and not focused
name              | string           | `null`     | create `<select>`, usable for normal forms.
anchor            | string           | `null`     | existing select (for CE)
creatable         | bool             | `false`    | Allow creating new item(s)
creatablePrefix   | string           | `'*'`      | Prefix marking new item
delimiter         | string           | `','`      | split inserted text when pasting to create multiple items
fetch             | string\|function | `null`     | Check "remote datasource" section for more details
fetch             | string           | `'auto'`   | When set to `init` options are fetched only when mounted, when searching it search in downloaded dataset
fetchCallback     | function         | `null`     | optional fetch callback
lazyDropdown      | bool             | `true`     | render dropdown after first focus, not by default
virtualList       | bool             | `false`    | Whether use virtual list for dropdown items (useful for large datasets)
vlHeight          | number           | `null`     | Height of virtual list dropdown (if not specified, computed automatically)
vlItemSize        | number           | `null`     | Height of one row (if not specified, computed automatically)
searchField       | string\|array    | `null`     | Specify item property that will be used to search by (if not specified all props except `value` prop will be used)
sortField         | string           | `null`     | Specify sort property. If not specified, `labelField` will be used 
disableSifter     | bool             | `false`    | Disable option sifting and accept all fetched options.
class             | string           | `'svelecte-control'` | default css class
style             | string           | null       | inline style

### Emitted events:

Event | arguments | description
------|-----------|-------------
fetch | options   | newly fetched remote options
change| selection | selected objects * if `anchor` is defined, `change` event is called also on it

### Public API:

Name          | type     | arguments | description
--------------|----------|-----------|-------------
selection     | property | -         | setter/getter - selected value(s) as objects, for binding. For usage in Svelte
focus         | function | -         | focus input
getSelection  | function | bool      | return selection, if `true` is passed, only values are returns, whole objects otherwise 
setSelection  | function | array     | set selection programmatically
config        | property | -         | **context property**: global common config for all instances, you can override most properties here and also some additional, mainly i18n
addFormatter  | function | -         | **context function**: with signature `(name, formatFn)` you can add additional item renderers (formatters)
<!-- clearByParent | bool | internal for CE  -->

## 🙏 Thanks to 

- [selectize.js](https://github.com/selectize/selectize.js) - inspiration
- [sifter](https://github.com/brianreavis/sifter.js) - search engine
- [svelte-select](https://github.com/rob-balfre/svelte-select) - inspiration & how-to, including some code borrowing 😊
- [svelte-tiny-virtual-list](https://github.com/Skayo/svelte-tiny-virtual-list) virtual list capability

## License

[MIT License](https://github.com/mskocik/svelecte/blob/master/LICENSE)
