<script>
  import Svelecte from "$lib/Svelecte.svelte";

  const items = 10;
  let options = [];
  for (let i = 1; i <= items; i++) {
    options.push({ id: i, text: `Item #${i}` });
  }
  let values = [];

  const renderer = (item, selected, value) => {
    return `<label onclick="(e) => e.preventDefault()">
      <input type="checkbox" ${values.indexOf(item.id) > -1 ? 'checked' : ''}  />
      <span class="sv-item-content">${item.text}</span>
    </label>`;
  }
</script>

<div class="container" style="width: 160px">
  <Svelecte 
    {options} 
    {renderer}
    placeholder='Items'
    i18n={{
        collapsedSelection: () => 'Items'
    }}
    searchable={false}
    filterSelections={false} 
    highlightFirstItem={false}
    hideSelections 
    collapseSelection 
    alwaysCollapsed
    multiple 
    bind:value={values} 
/>
</div>

<span>{values}</span>

<style>
  .container {
    width: 492px;
    margin: 2rem auto;
  }
</style>
