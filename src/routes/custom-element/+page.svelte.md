## Custom element

Svelecte can be used outside svelte projects. Almost every commonly used property _should_ be available. Also
dependend selects are possible with custom elements. I have used it successfully in Vue and PHP projects myself.

Check the source and look for `<el-svelecte />` element.

```svelte
<script>
  import { registerAsCustomElement } from 'svelecte/component';

  registerAsCustomElement('el-svelecte');
</script>

<el-svelecte options="json_stringified_object_array"></el-svelecte>
```

Most of properties is supported with one change: `parentValue`.

You define `parent` attribute instead. It represents html `id` attribute of parent select.
This attribute should be defined on child svelecte element.

Native `<select>` element can be used as "anchor element", which will serve as underlying element for Svelecte component.
Svelecte component can inherit `required`, `multiple` and `disabled` properties from `<select>` element and in case `options`
property is not set, it can extract option list from `<option>` elements.

```html
  <select id="my_select" name="form_select" required>
    <option>...</option>
  </select>
  <el-svelecte placeholder="Pick an item"/>
```
