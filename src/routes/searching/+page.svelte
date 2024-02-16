<script>
  import Dev from '$lib/Svelecte.svelte';

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

  let selection = 14;
  $: iconSlot = selection 
    ? (selection === 10 ? '💀' : '👍')
    : '👉';

</script>

<div class="container">
  <div>Selection: {selection}</div>
  <Dev {options} bind:value={selection} labelField="text" placeholder="Search for option"
    clearable
    virtualList
    multiple
    --sv-dropdown-width="100%"
  >
    <b slot="icon">{iconSlot}</b>
    <svelte:fragment slot="clear-icon" let:selectedOptions let:inputValue>{selectedOptions.length ? '❌' : inputValue ? '👀' : '❓' }</svelte:fragment>
    <svelte:fragment slot="indicator-icon" let:hasDropdownOpened>{hasDropdownOpened?'😃':'😄'}</svelte:fragment>
    </Dev>
</div>

<style>
  .container {
    width: 450px;
    margin: 2rem auto;
  }
</style>
