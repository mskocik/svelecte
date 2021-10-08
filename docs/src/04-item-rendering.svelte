<script>
  import Svelecte, { addFormatter } from '../../src/Svelecte.svelte';
  import { dataset } from './data.js';

  let options = dataset.colors();

  function colorRenderer(item, isSelected) {
    if (isSelected) {
      return `<div class="color-item" style="background-color: ${item.hex}">
        Selected color
      </div>`;
    }
    return `<span class="color-item" style="background-color: ${item.hex};">
      </span>${item.text}`;
  }

  addFormatter('color-blocks', colorRenderer);
</script>

<Svelecte {options} renderer="color-blocks" placeholder="Select color"></Svelecte>