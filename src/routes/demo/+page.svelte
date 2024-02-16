<script>
  import SvelecteOld from '$lib/old_Svelecte.svelte';
  // import Svelecte from '$lib/__Svelecte.svelte';
  // import Markup from '$lib/Markup.svelte';

  const items = 100;
  let options = [
    // {id: 123123123, text: 'This will be very long text, wguc seda qweq asdqw qwe qweqw qweqweqweqwe'}
  ];
  for (let i = 1; i <= items; i++) {
    options.push({id: i, text: `Item #${i}`});
  }
  let selection = [14, 28];

  let groups = [
    {
      label: 'First Group',
      options: [
        {id: 1, text: 'Item #1'},
        {id: 2, text: 'Item #2'},
        {id: 3, text: 'Item #3'},
        {id: 4, text: 'Item #4'},
      ]
    },
    {
      label: 'Second Group',
      options: [
        {id: 11, text: 'Item #11'},
        {id: 12, text: 'Item #12'},
        {id: 13, text: 'Item #13'},
        {id: 14, text: 'Item #14'},
      ]
    }
  ]

  let selectionGroups = [];


  /**
   * @param {SubmitEvent} event
   */
  function onSubmit(event) {
    const form = event.target;
    const formData = new FormData(form);
  }
</script>

<form on:submit|preventDefault={onSubmit}>
<div class="container">
  <SvelecteOld options={options}  bind:value={selectionGroups} clearable virtualList multiple/>
  <hr>
  <!-- <Markup {options} _selection={[options[3], options[7], options[0], options[5] ]}/> -->
  <hr>
  <!-- <Svelecte options={options} bind:value={selectionGroups}  /> -->
</div>
<button type="submit">Submit</button>
</form>

<style>
  .container {
    width: 492px;
    margin: 2rem auto;
  }
</style>
