<script>
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  let options = dataset.countries();

  let selection = null;
  let value = null;

  setTimeout(() => {
    value = 'de';
  }, 4000);
</script>

<Svelecte {options} 
  bind:readSelection={selection}
  bind:value={value}
  placeholder="Select country"
></Svelecte>

<div>Current <code>readSelection</code> value: <b>{JSON.stringify(selection) }</b></div>
<div>Current <code>value</code> value: <b>{value}</b></div>