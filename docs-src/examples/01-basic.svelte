<script>
	import Svelecte from './../../src/Svelecte.js';
  import { dataset } from './../data.js';

  let options = dataset.countries();

  let selection = null;
  let value = null;
</script>

<Svelecte {options} bind:selection={selection} bind:value={value} placeholder="Select country"></Svelecte>

<div>Current <code>selection</code> value: <b>{JSON.stringify(selection) }</b></div>
<div>Current <code>value</code> value: <b>{value}</b></div>