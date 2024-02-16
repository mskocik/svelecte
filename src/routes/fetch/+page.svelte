<script>
  import Svelecte, { TAB_SELECT_NAVIGATE } from "$lib/Svelecte.svelte";
  import { dataset } from './../data.js';

  let value= 'red';
  let options = [];

  $: console.log(options);

</script>

<h1>Creatable </h1>

<fieldset>
  <legend>Selection</legend>
  <code>{Array.isArray(value) ? (value.length ? value : 'null') : (value || 'null') }</code>
</fieldset>

<br>
<form>
  <Svelecte
   {options}
    selectOnTab={TAB_SELECT_NAVIGATE}
    name="test"
    fetch="/api/fetch?query=[query]"
    bind:value
  ></Svelecte>
<button type="submit">Submit</button>
</form>

