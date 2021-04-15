<script>
  import {SvelecteElement, addFormatter, config } from './../../../src/component.js';
  import { dataset } from '../data.js';

  let container;
  let optionList;
  let optionRenderer;
  let list = [];
  config.clearable = true;

  $: {
    if (optionList !== 'colors' && optionRenderer === 'dotted') {
      optionRenderer = '';
    }
  }

  window.customElements.define('el-svelecte', SvelecteElement);
  addFormatter('dotted', item => `<span style="background-color:${item.hex}" class="color"></span> ${item.text}`);
  addFormatter('caps', item => item.text.toUpperCase());

  function onSubmit() {
    /** here the svelecte is defined */
    const el = document.createElement('el-svelecte');
    el.options = dataset[optionList]();
    el.renderer = optionRenderer;
    /** that's all! */

    container.insertBefore(el, container.lastElementChild);
    const rmBtn = document.createElement('button');
    rmBtn.className = 'btn float-right ml-2';
    rmBtn.style = 'z-index: 1; position: relative';
    rmBtn.textContent = 'Remove select';
    rmBtn.onclick = () => {
      container.removeChild(el);
      container.removeChild(rmBtn);
    };
    container.insertBefore(rmBtn, container.lastElementChild);
    container.insertBefore(el, container.lastElementChild);
    optionList = '';
    optionRenderer = '';
  }
</script>

<div bind:this={container}>
  <form action="" on:submit|preventDefault={onSubmit}>
    Create new
    <select bind:value={optionList} required>
      <option value="">Select options</option>
      <option value="colors">Colors</option>
      <option value="countries">Countries</option>
      <option value="countryGroups">Groups</option>
    </select>
    <select bind:value={optionRenderer}>
      <option value="">Default renderer</option>
      <option value="dotted" disabled={optionList !== 'colors'}>Dotted (color only)</option>
      <option value="caps">Caps (all letters uppercase)</option>
    </select>

    <button class="btn" type="submit">Add Svelecte</button>
  </form>
</div>