<script>
  import Svelecte from '../../src/Svelecte.svelte';

  let resetOnBlur = true;
  let fetchResetOnBlur = true;

  /**
   * NOTE: We do not define initial value for `options` property. Initial options are created from `value` property.
   * To make this conversion automatic, `valueAsObject` must be set to `true`
   */ 
  let selectionWork = [
    {
    "id": 10,
    "name": "Clementina DuBuque",
    "username": "Moriah.Stanton",
    "email": "Rey.Padberg@karina.biz",
    "address": {
      "street": "Kattie Turnpike",
      "suite": "Suite 198",
      "city": "Lebsackbury",
      "zipcode": "31428-2261",
      "geo": {
        "lat": "-38.2386",
        "lng": "57.2232"
      }
    },
    "phone": "024-648-3804",
    "website": "ambrose.net",
    "company": {
      "name": "Hoeger LLC",
      "catchPhrase": "Centralized empowering task-force",
      "bs": "target end-to-end models"
    }
  }]
  
  let minQueryValue = 2;
</script>

<Svelecte
  {resetOnBlur}
  {fetchResetOnBlur}
  bind:value={selectionWork}
  valueAsObject
  minQuery={minQueryValue}
  multiple
  placeholder="Start typing ('re' for example)"
  fetch="https://jsonplaceholder.typicode.com/users/?email_like=[query]"
></Svelecte>
<div>
  <b>Selected:</b>
  <span class="float-right">
    Min. query length:<input type="number" min="1" step="1" bind:value={minQueryValue} class="small-input">
    <label for="rob" class="mr-2">
      <input type="checkbox" name="" id="rob" bind:checked={resetOnBlur}> Reset on blur
    </label>
    <label for="frob">
      <input type="checkbox" name="" id="frob" bind:checked={fetchResetOnBlur}> Reset search results on empty input
    </label>
  </span>
  <pre class="mt-2">{ JSON.stringify(selectionWork) }</pre>
</div>

<style>
  .small-input {
    width: 50px;
    height: 20px;
  }
</style>