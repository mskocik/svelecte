<script>
  import Dev from '$lib/Svelecte.svelte';
  import { onMount } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';

  const items = 100;
  let options = [
    {id: 123123123, text: 'This will be very long text, wguc seda qweq asdqw qwe qweqw qweqweqweqwe'}
  ];
  for (let i = 1; i <= items; i++) {
    options.push({id: i, text: `Item #${i}`});
  }

  // @ts-ignore
  // options = [{
  //   label: 'My Group',
  //   options: options
  // }];

  let selection = [14,24, 38];
  $: iconSlot = selection 
    ? ((Array.isArray(selection) ? selection.includes(10) : selection === 10) ? '💀' : '👍')
    : '👉';

let disabled = false
</script>

<div class="container">
  <div>Selection: {selection}</div>
  <Dev {options} bind:value={selection} labelField="text" 
    clearable
    virtualList
    {disabled}
    --sv-dropdown-width="100%"
  >
    <b slot="icon">{iconSlot}</b>
    <svelte:fragment slot="clear-icon" let:selectedOptions let:inputValue>{selectedOptions.length ? '❌' : inputValue ? '👀' : '❓' }</svelte:fragment>
    <svelte:fragment slot="indicator-icon" let:hasDropdownOpened>{hasDropdownOpened?'😃':'😄'}</svelte:fragment>
    </Dev>
</div>

<button on:click={() => disabled = !disabled}>Toggle</button>
<button on:click={() => selection = [10]}>Set #10</button>

<style>
  .container {
    width: 450px;
    margin: 2rem auto;
  }
</style>
