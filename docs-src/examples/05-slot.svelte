<script>
	import Svelecte from './../../src/Svelecte.js';
  import { dataset } from './../data.js';

  let options = dataset.colors();

  let iconValue = null;
	$: iconSlot = iconValue 
		? (iconValue === 'black' ? '💀' : '👍')
		: '👉';
</script>

<Svelecte options={options} bind:value={iconValue} placeholder="Pick your color, even the black 😉">
  <b slot="icon">{iconSlot}</b>
</Svelecte>