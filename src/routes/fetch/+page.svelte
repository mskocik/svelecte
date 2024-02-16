<script>
  import Svelecte, { TAB_SELECT_NAVIGATE } from "$lib/Svelecte.svelte";
  import { dataset } from './../data.js';

  let parentValue = null;
  let value;

  let parentOptions = [
    { id: 'colors', text: 'Colors'},
    { id: 'countries', text: 'Countries' },
    { id: 'countryGroups', text: 'Country Groups' },
  ];

  let APIS = {
    init: '/api/fetch',
    query: '/api/fetch?query=[query]',
    parent_init: '/api/fetch-parent?parent=[parent]',
    parent_query: '/api/fetch-parent?query=[query]&parent=[parent]',
  }

</script>

<h1>Fetch </h1>

<fieldset>
  <legend>Selection</legend>
  <code>{Array.isArray(value) ? (value.length ? value : 'null') : (value || 'null') }</code>
</fieldset>

<br>
<form>
  <label for="sv-select-parent-input">Parent</label>
  <Svelecte name="parent" options={parentOptions} required bind:value={parentValue} clearable />
  <hr>
  <label for="sv-select-child-input">Dependent child</label>
  <Svelecte
    selectOnTab={TAB_SELECT_NAVIGATE}
    name="child"
    fetch={APIS.parent_init}
    bind:value
    {parentValue}
    required
  ></Svelecte>
<br>
<button type="submit">Submit</button>
</form>

