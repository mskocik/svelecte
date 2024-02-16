<script>
  import Svelecte from "$lib/Svelecte.svelte";
  import { dataset } from './../data.js';

  let value;

  let asyncTransform = function(value, valueProp, labelProp) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          [valueProp]: value.toUpperCase(),
          [labelProp]: value.toUpperCase(),
        })
      }, 3000);
    })
  }

  /**
   * 
   * @param {string} value
   */
  let syncTransform = function(value, valueProp, labelProp, prefix) {
    return {
      [valueProp]: value.split('').reverse().join(''),
      [labelProp]: `${prefix}${value.split('').reverse().join('')}`,
    };
  }

  let keepCreated = !false;
</script>

<h1>Creatable</h1>

<fieldset>
  <legend>Selection</legend>
  <code>{Array.isArray(value) ? (value.length ? value : 'null') : (value || 'null') }</code>
</fieldset>

<br>
<form>
  <Svelecte options={dataset.colors()}
    name="test"
    bind:value
    creatable
    lazyDropdown={false}
    createHandler={syncTransform}
    {keepCreated}
  ></Svelecte>
<button type="submit">Submit</button>
</form>

