<script>
  import Svelecte from '../../../src/svelecte.js';
  import { dataset } from '../data.js';

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
</script>

<Svelecte {options} renderer={colorRenderer} placeholder="Select color"></Svelecte>