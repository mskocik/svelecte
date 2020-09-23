<script>
  import { getContext, createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
  import Item from './Item.svelte';
  import { key } from './../contextStore.js';
  import { isOutOfViewport} from './../lib/utils.js';

  export let creatable;
  export let maxReached = false;
  export let dropdownIndex = 0;
  export let renderer;

  export function scrollIntoView(params) {
    const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
    if (!focusedEl) return;
    const focusedRect = focusedEl.getBoundingClientRect();
    const menuRect = scrollContainer.getBoundingClientRect();
    const overScroll = focusedEl.offsetHeight / 3;
    switch (true) {
      case focusedEl.offsetTop < scrollContainer.scrollTop:
        scrollContainer.scrollTop = focusedEl.offsetTop - overScroll;
        break;
      case focusedEl.offsetTop  + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
        scrollContainer.scrollTop = focusedEl.offsetTop  + focusedRect.height - scrollContainer.offsetHeight + overScroll;
        break;
    }
  }

  const dispatch = createEventDispatcher();
  const {  // getContext
    inputValue, hasDropdownOpened, listLength, currentListLength, listMessage,
    isFetchingData, matchingOptions, flatMatching, selectedOptions, listIndexMap
  } = getContext(key);

  let container;
  let scrollContainer;
  let scrollPos = null;
  let isMounted = false;
  let hasEmptyList = false;
  let remoteSearch = false;

  $: {
    hasEmptyList = $matchingOptions.length < 1 && (creatable 
      ? !$inputValue
      : true
    );
  }

  function positionDropdown(val) {
    if (!scrollContainer) return;
    const outVp = isOutOfViewport(scrollContainer);
    if (outVp.bottom && !outVp.top) {
      scrollContainer.style.bottom = (scrollContainer.parentElement.clientHeight + 1) + 'px';
      // TODO: debounce ....
    } else if (!val || outVp.top) {
      scrollContainer.style.bottom = '';
    }
  }

  let dropdownStateSubscription; 
  /** ************************************ lifecycle */
  onMount(() => {
    isMounted = true;
    /** ************************************ flawless UX related tweak */
    dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
      tick().then(() => positionDropdown(val));
      // bind/unbind scroll listener
      document[val ? 'addEventListener' : 'removeEventListener']('scroll', () => positionDropdown(val));
    });
  });
  onDestroy(() => dropdownStateSubscription());
</script>

<div class="dropdown" aria-expanded={$hasDropdownOpened} tabindex="-1" 
  bind:this={scrollContainer}
  on:mousedown|preventDefault
>
  <div class="dropdown-content" bind:this={container} class:max-reached={maxReached}>
  {#if $listLength}
    {#each $matchingOptions as opt, i}
      <!-- opt group -->
      {#if opt.options && Array.isArray(opt.options)}
        <div class="optgroup-header" on:mousedown|preventDefault>
          <slot name="dropdown-group-header"><b>{opt.label}</b></slot>
        </div>
        {#each opt.options as groupOpt, j}
        <div data-pos={$listIndexMap[i][j]} class="optgroup-item" 
          class:active={$listIndexMap[i][j] === dropdownIndex}
        >
          <Item formatter={renderer}
            isDisabled={opt.isDisabled || groupOpt.isDisabled}
            index={$listIndexMap[i][j]}
            item={groupOpt}
            on:hover
            on:select>
          </Item>
        </div>
        {/each}
      {:else} <!-- END opt group -->
      <div data-pos={$listIndexMap[i]}
        class:active={$listIndexMap[i] === dropdownIndex}
      >
        <Item formatter={renderer}
          index={$listIndexMap[i]}
          isDisabled={opt.isDisabled}
          item={opt}
          on:hover
          on:select>
        </Item>
      </div>
      {/if}
    {/each}
  {/if}
    {#if $inputValue && creatable}
    <div class="creatable-row" on:click={dispatch('select', $inputValue)} class:active={$currentListLength === dropdownIndex}>
      <span>Create '{$inputValue}'</span>
      {#if $currentListLength !== dropdownIndex}
      <span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span>
      {/if}
    </div>
    {/if}
    {#if hasEmptyList}
    <div class="empty-list-row">{$listMessage}</div>
    {/if}
  </div>
</div>

<style>
.dropdown {
  box-sizing: border-box;
  position: absolute;
  background-color: white;
  width: 100%;
  min-height: 40px;
  padding: 4px;
  display: none;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: .25rem;
  box-shadow: 0 6px 12px rgba(0,0,0,0.175);
  z-index: 1;
}
.dropdown[aria-expanded="true"] { display: block; }
.dropdown-content.max-reached { opacity: 0.75; cursor: not-allowed; }

.creatable-row {
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 2px;
  padding: 3px 3px 3px 6px;
}
.creatable-row:hover,
.creatable-row:active,
.creatable-row.active {
    background-color: #F2F5F8;
}

.shortcut {
  display: flex;
  align-items: center;
  align-content: center;
}
.shortcut > kbd {
    border: 1px solid #efefef;
    border-radius: 4px;
    padding: 0px 6px;
    margin: -1px 0;
    background-color: white;
}

.empty-list-row {
  min-width: 0px;
  box-sizing: border-box;
  border-radius: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
  border-radius: 2px;
  overflow: hidden;
  padding: 3px 3px 3px 6px;
  text-align: left;
}

.optgroup-header {
  padding: 3px 3px 3px 6px;
  font-weight: bold;
}
.optgroup-item {
  margin-left: 0.5rem;
}
.fetch-remote + .dropdown-content {
  filter: blur(2px);
}
</style>