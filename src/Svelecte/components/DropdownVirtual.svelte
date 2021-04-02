<script>
  import { getContext, createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
	import VirtualList from 'svelte-tiny-virtual-list';
  import Item from './Item.svelte';
  import { key } from './../contextStore.js';
  import { isOutOfViewport} from './../lib/utils.js';

  export let creatable;
  export let maxReached = false;
  export let dropdownIndex = 0;
  export let renderer;
  // TODO: pass list settings
  
  export function scrollIntoView(params) {
    scrollIndex = dropdownIndex;
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
  let scrollIndex;

  $: {
    hasEmptyList = $matchingOptions.length < 1 && (creatable 
      ? !$inputValue
      : true
    );
  }

  // TODO: resolve - ie. throw error on group data,which will not be supported
  let hasGroupData = false;

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
    console.log('$', $matchingOptions);
  });
  onDestroy(() => dropdownStateSubscription());
</script>

<div class="sv-dropdown" aria-expanded={$hasDropdownOpened} tabindex="-1" 
  bind:this={scrollContainer}
  on:mousedown|preventDefault
>
  <div class="sv-dropdown-content" bind:this={container} class:max-reached={maxReached}>
  {#if $listLength}
    <VirtualList
      width="100%"
      height={Math.min(250, $matchingOptions.length * 27 + 8)}
      itemCount={$matchingOptions.length}
      itemSize={27}
      scrollToAlignment="auto"
      scrollToIndex={$matchingOptions.length ? scrollIndex : null}
    >
      <div slot="item" let:index let:style {style}
      class:sv-dd-item-active={index === dropdownIndex}
      >
        <Item formatter={renderer}
          index={$listIndexMap[index]}
          isDisabled={$matchingOptions[index].isDisabled}
          item={$matchingOptions[index]}
          on:hover
          on:select>
        </Item>
      </div>
    </VirtualList>
  {/if}
    {#if $inputValue && creatable && !maxReached}
    <div class="creatable-row" on:click={dispatch('select', $inputValue)} class:active={$currentListLength === dropdownIndex}>
      <span>Create '{$inputValue}'</span>
      {#if $currentListLength !== dropdownIndex}
      <span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span>
      {/if}
    </div>
    {/if}
    {#if hasEmptyList || maxReached}
    <div class="empty-list-row">{$listMessage}</div>
    {/if}
  </div>
</div>

<style>
.sv-dropdown {
  box-sizing: border-box;
  position: absolute;
  background-color: white;
  width: 100%;
  min-height: 40px;
  display: none;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: .25rem;
  box-shadow: 0 6px 12px rgba(0,0,0,0.175);
  z-index: 2;
}
.sv-dropdown :global(.virtual-list-wrapper:not(:empty)) {
  
  padding: 4px;
}
.sv-dropdown[aria-expanded="true"] { display: block; }
.sv-dropdown-content.max-reached { opacity: 0.75; cursor: not-allowed; }

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
</style>