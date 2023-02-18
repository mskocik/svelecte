<script>
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  let options = dataset.countries();

  let selection = null;
  let value = ['cz', 'de', 'sk'];
</script>

<label for="country-collapsable">Select a country</label>
<Svelecte {options} 
  inputId="country-collapsable"
  multiple
  collapsable
  virtualList
  bind:readSelection={selection}
  bind:value={value}
  placeholder="Select countries"
></Svelecte>