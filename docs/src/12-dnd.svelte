<script>
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones, setDebugMode } from 'svelte-dnd-action';
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  overrideItemIdKeyNameBeforeInitialisingDndZones('value');

  const options = dataset.colors();
  let value = [options[3], options[7]];
</script>

One DND svelecte
<Svelecte {options} bind:value={value} multiple {dndzone} valueAsObject placeholder="Re-order selected items by dragging"></Svelecte>
<br>
Second DND svelecte (cannot drag from one to the other)
<Svelecte {options} multiple {dndzone} placeholder="Re-order selected items by dragging"></Svelecte>
