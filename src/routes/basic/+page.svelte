<script>
  import Svelecte from "$lib/Svelecte.svelte";

  import { dataset } from './../data.js';

  let src = 'groups'

  const list = {
    default: dataset.countries(),
    groups: dataset.countryGroups(),
    array: ['First Item', 'Second Item', 'Third Item'],
  }

  $: options = list[src];

  let value;
  let readSelection;

  $: console.log('Selection', readSelection);

</script>

<h1>Basic</h1>

<fieldset>
  <legend>Options</legend>
  <label for="default">
    <input type="radio" name="groups" id="default" bind:group={src} value="default">
    Object array
  </label>
  <label for="groups">
    <input type="radio" name="groups" id="groups" bind:group={src} value="groups">
    Groups
  </label>
  <label for="array">
    <input type="radio" name="groups" id="array" bind:group={src} value="array">
    Simple Array
  </label>
</fieldset>


<fieldset>
  <legend>Selection</legend>
  <div style="display: flex; justify-content: space-between">
    <code>{value}</code>
    <button on:click={() => value = 'de'} disabled={src === 'array'}>Set Value</button>
  </div>
</fieldset>


<br>
<Svelecte {options} bind:value bind:readSelection virtualList></Svelecte>
