<script>
	import Svelecte from './../../src/Svelecte.js';
  import { dataset } from './../data.js';

  // plain text array
  let options = dataset
                  .countries()
                  .map(opt => opt.text);

  let labelAsValue = false;

  let selection = null;
  let value = null;
</script>

<Svelecte {options} {labelAsValue} 
  bind:selection={selection} 
  bind:value={value} 
  placeholder="Select country"
></Svelecte>

<div class="float-right">
  Pick
  <label><input type="radio" bind:group={labelAsValue} value={false}> value</label>
  <label><input type="radio" bind:group={labelAsValue} id="" value={true}> label</label>
</div>

<div>
  Current <code>selection</code> value: <b>{JSON.stringify(selection) }</b>
  <br>
  Current <code>value</code> value: <b>{value}</b>
</div>