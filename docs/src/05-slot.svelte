<script>
  import Svelecte from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  let options = dataset.colors();

  let iconValue = null;
  $: iconSlot = iconValue 
    ? (iconValue === 'black' ? '💀' : '👍')
    : '👉';
</script>

<Svelecte options={options} 
  bind:value={iconValue}
  clearable
  placeholder="Pick your color, even the black. Try to type to see 'clearable' icon change"
>
  <b slot="icon">{iconSlot}</b>
  <svelte:fragment slot="clear-icon" let:selectedOptions let:inputValue>{selectedOptions.length ? '❌' : inputValue ? '👀' : '❓' }</svelte:fragment>
  <svelte:fragment slot="indicator-icon" let:hasDropdownOpened>{hasDropdownOpened?'😃':'😄'}</svelte:fragment>
</Svelecte>