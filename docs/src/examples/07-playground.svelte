<script>
  import Svelecte from '../../../src/svelecte.js';
  import config from '../../../src/Svelecte/settings.js';
  import { dataset } from '../data.js';

  let remoteValue = 'opts';
  let myValue = null;
  let classSelection = 'svelecte-control'

  const remotes = {
    colors: 'https://my-json-server.typicode.com/mskocik/svelecte-db/colors?value_like=[query]',
    json: 'https://jsonplaceholder.typicode.com/users/'
  }
  const slots = {
    opts: '🎨',
    countries: '🌍',
    groups: '🔠',
    colors: '⚡',
    json: '🙋'
  }

  let cmp;
  let isFlexWidth = false;
  let { 
    multiple, max, collapseSelection,
    placeholder, searchable, clearable, selectOnTab,
    disabled, creatable, creatablePrefix, delimiter, virtualList,
    style
  } = config;
  let settings = {
    searchable: true
  };
  $: slot = slots[remoteValue];

  $: {
    if (remoteValue === 'opts') {
      settings = {
        multiple, max, collapseSelection,
        searchable, clearable, selectOnTab,
        disabled, creatable, creatablePrefix, delimiter, virtualList,
        style,
        class: classSelection,
        options: dataset.colors(),
        fetch: null,
        placeholder: 'Pick your color'
      }
    } else if (remoteValue === 'countries') {
      settings = {
        multiple, max, collapseSelection,
        searchable, clearable, selectOnTab,
        disabled, creatable, creatablePrefix, delimiter, virtualList,
        style,
        class: classSelection,
        options: dataset.countries(),
        fetch: null,
        placeholder: 'Choose your favourite European country'
      };
    } else if (remoteValue === 'groups') {
      settings = {
        multiple, max, collapseSelection,
        searchable, clearable, selectOnTab,
        disabled, creatable, creatablePrefix, delimiter, virtualList,
        style,
        class: classSelection,
        options: dataset.countryGroups(),
        fetch: null,
        placeholder: 'Select from country group',
      }
    } else {
      settings = {
        multiple, max, collapseSelection,
        searchable, clearable, selectOnTab,
        disabled, creatable, creatablePrefix, delimiter, virtualList,
        style,
        class: classSelection,
        fetch: remotes[remoteValue],
        fetchCallback: remoteValue === 'json' ? fetchCallback : null,
        placeholder: remoteValue === 'json' ? 'Select from prefetched list' : 'Search for color',
        renderer: remoteValue === 'json' ? fetchRenderer : null,
        options: []
      }
    }
  }

  function s(prop, value) {
    settings[prop] = value !== null ? value : !settings[prop];
    settings = settings;
  }

  function fetchCallback(resp) {
    return resp.map(user => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        street: `${user.address.street} ${user.address.suite}`,
        city: user.address.city
      }
    });
  }

  function fetchRenderer(item, isSelected) {
    return isSelected
      ? `<figure class="avatar avatar-sm" data-initial="${item.name.split(' ').map(w => w[0]).slice(0,2).join('')}" style="background-color: #5755d9;"></figure>
          ${item.name}`
      : `${item.name}, ${item.street}`
  }

  function onPresetCollapsible() {
    multiple = true;
    collapseSelection = true;
    isFlexWidth = true;
    remoteValue = 'countries';
    const countries = dataset.countries();
    setTimeout(() => {
      cmp.setSelection([countries[2], countries[7]]);
    });
    setTimeout(() => {
      document.querySelector('#example-7 input').focus();
    }, 500);
  }
</script>

<div class="columns">
  <div class="column col-xl-12 col-5">
    <h4 id="sub-playground">Complex playground</h4>
    
    <div class="form-row example-wrap" class:flexible-svelecte={isFlexWidth}>
      <Svelecte {...settings} bind:selection={myValue} name="select" bind:this={cmp}>
        <b slot="icon">{slot}</b>
      </Svelecte>
      Current value: {JSON.stringify(myValue)}

      <p class="mt-2">Complete playground with almost options available. Try for example <button on:click={onPresetCollapsible}>collapsible multiselection</button></p>
    </div>
  </div>
  <div class="column col-xl-12 col-7">
    <fieldset>
      <legend>Customize</legend>
      <div class="columns">
        <fieldset class="col">
          <legend>Options</legend>
          <select on:change={e => { cmp.clearByParent(); remoteValue = e.target.value }} on:blur>
            <option value="opts">🎨 colors</option>
            <option value="countries">🌍 countries</option>
            <option value="groups">🔠 country groups</option>
            <option value="colors">💬 [API]: Colors</option>
            <option value="json">💬 [API]: User list</option>
          </select>
          <p>
            Options prefixed with<br>
            <code>[API]</code>are demonstrate<br>
            AJAX fetching.</p>
        </fieldset>

        <fieldset>
          <legend>Control</legend>
          <label><input type="checkbox" on:change={e => s('disabled', e.target.checked)} bind:checked={disabled}> Disabled</label><br>
          <label><input type="checkbox" on:change={e => s('creatable', e.target.checked)}  bind:checked={creatable}> Creatable</label>
          <input class="input-sm input-short" placeholder="Item prefix" on:input={e => s('creatablePrefix', e.target.value)} disabled={!settings.creatable}  bind:value={creatablePrefix}>
          <input class="input-sm input-short" placeholder="Delimiter" on:input={e => s('delimiter', e.target.value)} disabled={!settings.creatable}  bind:value={delimiter}><br>
          <label><input type="checkbox" on:change={e => s('virtualList', e.target.checked)} bind:checked={virtualList}> Use virtual list</label><br>
          <button class="btn mt-2" on:click={() => { myValue = settings.multiple ? [] : null } }>Clear selection</button>
        </fieldset>

        <fieldset>
          <legend>Multiple</legend>
          <label><input type="checkbox" on:change={e => s('multiple', e.target.checked)}  bind:checked={multiple}> Multiple</label>
          <input class="input-sm" type="number" placeholder="limit" disabled={!settings.multiple} on:input={e => s('max', parseInt(e.target.value))} min="0" bind:value={max}>
          <br>
          <label><input type="checkbox" on:change={e => s('collapseSelection', e.target.checked) } disabled={!settings.multiple} bind:checked={collapseSelection}> Collapse selection</label>
          
        </fieldset>
        
        <fieldset>
          <legend>UI</legend>
          Placeholder <input class="input-sm" on:input={e => s('placeholder', e.target.value)} bind:value={settings.placeholder}><br>
          <label><input type="checkbox" on:change={e => s('searchable', e.target.checked)} bind:checked={searchable}> Searchable</label><br>
          <label><input type="checkbox" on:change={e => s('clearable', e.target.checked)} bind:checked={clearable}> Clearable</label><br>
          <label><input type="checkbox" on:change={e => s('selectOnTab', e.target.checked)} bind:checked={selectOnTab}> Select on <code>Tab</code></label>
          <hr>
          <label><input type="checkbox" bind:checked={isFlexWidth}> Inline width</label>
        </fieldset>

        <fieldset>
          <legend>Styling</legend>
          <span>CSS class</span>
          <select on:change={e => s('class', e.target.value)} bind:value={classSelection} on:blur>
            <option value="svelecte-control">svelecte-control (default)</option>
            <option value="svelecte-control custom-css">red style (custom)</option>
          </select>

        </fieldset>
      </div>
    </fieldset>
  </div>
</div>

<style>
  :global(.icon-slot b) {
    font-family: 'Fira Code';
    margin-left: 0.5rem;
  }
  :global(.flexible-svelecte .sv-control) {
    display: inline-flex !important;
  }
  .flexible-svelecte :global(.svelecte) {
    min-width: 100px;
  }
  .flexible-svelecte :global(.sv-input-row) {
    min-width: 100px;
    transition: min-width .15s ease;
  }
  .flexible-svelecte :global(.is-active .sv-input-row) {
    min-width: 300px;
    transition: min-width .15s ease;
  }

  :global(.svelecte-control.custom-css .sv-control) {
    border: 1px dashed rgb(255, 147, 147) !important;
  }
  :global(.custom-css .sv-control.is-active) {
    border: 1px dashed red !important;
    box-shadow: 0 0px 7px rgba(255, 0, 0, 0.151);
  }
  :global(.svelecte-control.custom-css .sv-dropdown) {
    border-color: rgba(255, 0, 0, 0.2) !important;
  }
  :global(.svelecte-control.custom-css .sv-dropdown .highlight) {
    color: white;
    background-color: rgb(167, 63, 63);
  }
  :global(.custom-css .sv-input-row .sv-item-content) {
    color: rgb(190, 74, 74);
    text-decoration: underline;
    font-weight: bold;
  }
  :global(.custom-css .sv-input-row .inputBox::placeholder) {
    color: red;
  }
  :global(.custom-css .sv-dd-item-active > .sv-item) {
    background-color: rgba(255, 0, 0, 0.151);
  }
  /* input {
    width: 100%;
    margin-bottom: 0;
  }  */
  .form-row {
    margin-bottom: 2rem;
    min-height: 20px;
  }
  /* .form-row:focus-within {
    box-shadow: 0 0 10px #ccc;
  } */
  :global(.optgroup-header) {
    height: 40px;
    padding-top: 10px !important;
    text-align: left;
  }
  details {
    margin-top: 1rem;
  }
  fieldset {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0.5rem;
  }
  fieldset fieldset {
    margin: 0 .5rem .5rem;
  }
  legend {
    border-radius: 4px;
    background-color: #000;
    color: #fff;
    padding: 3px 6px;
    font-size: 14px;
    margin-bottom: 0;
  }
  :global(.sv-input-row .color-item) {
    color:transparent;
  }
  :global(.sv-dropdown .color-item) {
    display: inline-flex;
    width: 16px; 
    height: 16px; 
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-right: .5rem;
    align-self: center;
    position: relative;
    top: 2px;
  }
  input[type=number] {
    width: 60px;
  }
  .input-short {
    width: 100px;
  }
</style>