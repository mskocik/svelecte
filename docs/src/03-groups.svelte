<script>
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';
</script>

<Svelecte options={dataset.countryGroups()}></Svelecte>