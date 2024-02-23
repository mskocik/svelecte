<script>
  import Dev from '$lib/Svelecte.svelte';
  import { dataset } from '../data';
  import { onMount } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';

  const items = 100;
  let options = [
    {id: 123123123, text: 'This will be very long text, wguc seda qweq asdqw qwe qweqw qweqweqweqwe'}
  ];
  for (let i = 1; i <= items; i++) {
    options.push({id: i, text: `Item #${i}`});
  }
  // let options = dataset.countryGroups();

  // @ts-ignore
  // options = [{
  //   label: 'My Group',
  //   options: options
  // }];

  let selection =
    [14,24, 38]
  ;
  $: iconSlot = selection
    ? ((Array.isArray(selection) ? selection.includes(10) : selection === 10) ? '💀' : '👍')
    : '👉';
let value = ['aqua','black'];
let disabled = false;
</script>

<div class="container">
  Fetch
  <Dev fetch="/api/colors?query=[query]" bind:value
    fetchDebounceTime={0}
    multiple
    max={2}
    minQuery={2}
    fetchResetOnBlur={false}
  ></Dev>
  <Dev fetch="/api/colors?sleep=5000"></Dev>
  <Dev multiple options={dataset.colors().slice(0,2)} bind:value creatable></Dev>
<!--
  <div>Selection: {selection}</div>
  <Dev {options} bind:value={selection} labelField="text"
    clearable
    {disabled}
    collapseSelection="blur"
    --sv-dropdown-width="100%"
  >
    <b slot="icon">{iconSlot}</b>
    <svelte:fragment slot="clear-icon" let:selectedOptions let:inputValue>{selectedOptions.length ? '❌' : inputValue ? '👀' : '❓' }</svelte:fragment>
    <svelte:fragment slot="dropdown-toggle" let:isOpen>{isOpen ? '😃':'😄'}</svelte:fragment>
    </Dev> -->
</div>

<!-- <button on:click={() => disabled = !disabled}>Toggle</button>
<button on:click={() => selection = [10]}>Set #10</button> -->

<style>
  .container {
    width: 450px;
    margin: 2rem auto;
  }
</style>
