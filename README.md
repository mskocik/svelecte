# Svelecte

Proud descendant of Selectize.js written with Svelte. Also usable as custom element (CE), which behaves very similar to standard `<select>` element.

## Features


- searchable
- multiselect
    - limit max selected items
- allow simple array or complex objects as items
- custom item renderer (formatter)
- allow creating new items
- remote data fetch
- virtual list support

## Documentation

Playground with detailed documentation can be found at [here](https://mskocik.github.io/svelecte/).

Property  | Type   | Default | Description
----------|--------|---------|------------
options   | array  | `[]`    | Data array
name      | string | `null`  | create `<select>`, usable for normal forms.
anchor    | string | `null`  | existing select (for CE)
required  | bool   | `false` | make sense only when `name` is defined
multiple  | bool   | `false` | allow multiselection. Will be set automatically to `true`, if `name` property ends with `[]`, like `tags[]`
collapseSelection | bool | `false` | collapse selection when `multiple` and not focused
disabled  | bool   | `false` | Disable component
creatable | bool   | `false` | Allow creating new item(s)
creatablePrefix | string | `*` | Prefix marking new item
selectOnTab | bool | `false` | Allow selecting currently active item by <kbd>Tab</kbd> key
valueField | string | `null` | Property to be used as value (if not specified, will be selected automatically)
labelField | string | `null` | Property shown in dropdown (if not specified, will be selected automatically)
max        | number | `0` | Maximum allowed items selected, applicable only for multiselect
renderer   | string\|function | `null` | dropdown and selection renderer function. More info in item rendering section
clearable | bool | `false` | Display ✖ icon to clear whole selection
searchable | bool | `true` | Allow search among items by typing
delimiter | string | `,` | split inserted text when pasting to create multiple items
placeholder | string | `Select | Input placeholder
fetch | string\|function | `null` | Check "remote datasource" section for more details
fetchCallback | function | `null` | optional fetch callback
virtualList | bool | `false` | Whether use virtual list for dropdown items (useful for large datasets)
vlHeight | number | `null` | Height of virtual list dropdown (if not specified, computed automatically)
vlItemSize | number | `null` | Height of one row (if not specified, computed automatically)
searchField | string\|array | `null` | Specify item property that will be used to search by (if not specified all props except `value` prop will be used)
sortField | string | `null` | Specify sort property. If not specified, first after `value` field will be used
sortRemote | bool | `true` | sort items (by relevancy) when results are fetched from remote

Event | arguments | description
------|-----------|-------------
fetch | options   | newly fetched remote options
change| selection | selected objects * if `anchor` is defined, `change` event is called also on it

## Based on

- [selectize.js](https://github.com/selectize/selectize.js)
- [sifter](https://github.com/brianreavis/sifter.js)

