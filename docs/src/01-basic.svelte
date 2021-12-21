<script>
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  let options = dataset.countries();

  let selection = null;
  let value = 'cz';

  setTimeout(() => {
    value = 'de';
  }, 4000);
</script>

<label for="country">Select a country</label>
<Svelecte {options} 
  inputId="country"
  bind:readSelection={selection}
  bind:value={value}
  placeholder="Select country"
></Svelecte>

<div>Current <code>readSelection</code> value: <b>{JSON.stringify(selection) }</b></div>
<div>Current <code>value</code> value: <b>{value}</b></div>