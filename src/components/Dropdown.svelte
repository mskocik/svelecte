<script>
  import { createEventDispatcher, onDestroy, onMount, tick } from 'svelte';
  import VirtualList from 'svelte-tiny-virtual-list';
  import { isOutOfViewport} from './../lib/utils.js';
  import Item from './Item.svelte';

  export let lazyDropdown;
  
  export let creatable;
  export let maxReached = false;
  export let dropdownIndex = 0;
  export let renderer;
  export let items= [];
  export let alreadyCreated;
  export let virtualList;
  export let vlItemSize;
  export let vlHeight;
  /** internal props */
  export let inputValue;
  export let listIndex;
  export let hasDropdownOpened;
  export let listMessage;

  export function scrollIntoView(params) {
    if (virtualList) return;
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

  let container;
  let scrollContainer;
  let isMounted = false;
  let hasEmptyList = false;
  let renderDropdown = !lazyDropdown;
  $: currentListLength = items.length; 

  let vl_height = vlHeight;
  let vl_itemSize = vlItemSize;
  $: vl_listHeight = Math.min(vl_height, Array.isArray(vl_itemSize) 
    ? vl_itemSize.reduce((res, num) => {
      res+= num;
      return res;
    }, 0)
    : items.length * vl_itemSize
  );
  let vl_autoMode = vlHeight === null && vlItemSize === null;
  let refVirtualList;

  $: {
    hasEmptyList = items.length < 1 && (creatable 
      ? !$inputValue
      : true
    );
    // required when changing item list 'on-the-fly' for VL
    if (virtualList && vl_autoMode && isMounted && renderDropdown) {
      if (hasEmptyList) dropdownIndex = null;
      vl_itemSize = 0;
      tick().then(virtualListDimensionsResolver);
    }
  }

  function positionDropdown(val) {
    if (!scrollContainer && !renderDropdown) return;
    const outVp = isOutOfViewport(scrollContainer);
    if (outVp.bottom && !outVp.top) {
      scrollContainer.style.bottom = (scrollContainer.parentElement.clientHeight + 1) + 'px';
      // FUTURE: debounce ....
    } else if (!val || outVp.top) {
      scrollContainer.style.bottom = '';
    }
  }

  function virtualListDimensionsResolver() {
    if (!refVirtualList) return;
    const pixelGetter = (el, prop) => {
      const styles = window.getComputedStyle(el);
      let { groups: { value, unit } } = styles[prop].match(/(?<value>\d+)(?<unit>[a-zA-Z]+)/);
      value = parseFloat(value);
      if (unit !== 'px') {
        const el = unit === 'rem'
          ? document.documentElement
          : scrollContainer.parentElement;
        const multipler = parseFloat(window.getComputedStyle(el).fontSize.match(/\d+/).shift());
        value = multipler * value; 
      }
      return value;
    }
    vl_height = pixelGetter(scrollContainer, 'maxHeight')
      - pixelGetter(scrollContainer, 'paddingTop')
      - pixelGetter(scrollContainer, 'paddingBottom');
    // get item size (hacky style)
    scrollContainer.style = 'opacity: 0; display: block';
    const firstItem = refVirtualList.$$.ctx[0].firstElementChild.firstElementChild;
    if (firstItem) {

      firstItem.style = '';
      const firstSize = firstItem.getBoundingClientRect().height;
      const secondItem = refVirtualList.$$.ctx[0].firstElementChild.firstElementChild.nextElementSibling;
      let secondSize;
      if (secondItem) {
        secondItem.style = '';
        secondSize = secondItem.getBoundingClientRect().height;
      }
      if (firstSize !== secondSize) {
        const groupHeaderSize = items[0].$isGroupHeader ? firstSize : secondSize;
        const regularItemSize = items[0].$isGroupHeader ? secondSize : firstSize;
        vl_itemSize = items.map(opt => opt.$isGroupHeader ? groupHeaderSize : regularItemSize);
      } else {
        vl_itemSize = firstSize;
      }
    }
    scrollContainer.style = '';
  }

  let dropdownStateSubscription = () => {};
  /** ************************************ lifecycle */
  onMount(() => {
    /** ************************************ flawless UX related tweak */
    dropdownStateSubscription = hasDropdownOpened.subscribe(val => {
      if (!renderDropdown && val) renderDropdown = true;
      tick().then(() => positionDropdown(val));
      // bind/unbind scroll listener
      document[val ? 'addEventListener' : 'removeEventListener']('scroll', () => positionDropdown(val), { passive: true });
    });
    isMounted = true;
  });
  onDestroy(() => dropdownStateSubscription());
</script>

{#if isMounted && renderDropdown}
<div class="sv-dropdown" class:is-virtual={virtualList} aria-expanded={$hasDropdownOpened} tabindex="-1" 
  bind:this={scrollContainer}
  on:mousedown|preventDefault
>
  <div class="sv-dropdown-content" bind:this={container} class:max-reached={maxReached}>
  {#if items.length}
    {#if virtualList}
      <VirtualList bind:this={refVirtualList}
        width="100%"
        height={vl_listHeight}
        itemCount={items.length}
        itemSize={vl_itemSize}
        scrollToAlignment="auto"
        scrollToIndex={items.length && isMounted ? dropdownIndex :  null}
      >
        <div slot="item" let:index let:style {style} class:sv-dd-item-active={index == dropdownIndex}>
          <Item formatter={renderer}
            index={listIndex.map[index]}
            isDisabled={items[index].isDisabled}
            item={items[index]}
            inputValue={$inputValue}
            on:hover
            on:select>
          </Item>
        </div>
      </VirtualList>
    {:else}
      {#each items as opt, i}
        <div data-pos={listIndex.map[i]} class:sv-dd-item-active={listIndex.map[i] == dropdownIndex}>
          <Item formatter={renderer}
            index={listIndex.map[i]}
            isDisabled={opt.isDisabled}
            item={opt}
            inputValue={$inputValue}
            on:hover
            on:select>
          </Item>
        </div>
      {/each}
    {/if}
  {/if}
  {#if $inputValue && creatable && !maxReached}
    <div class="creatable-row" on:click={dispatch('select', $inputValue)}
      class:active={currentListLength === dropdownIndex}
      class:is-disabled={alreadyCreated.includes($inputValue)}
    >
      <span>Create '{$inputValue}'</span>
      {#if currentListLength !== dropdownIndex}
      <span class="shortcut"><kbd>Ctrl</kbd>+<kbd>Enter</kbd></span>
      {/if}
    </div>
  {/if}
  {#if hasEmptyList || maxReached}
    <div class="empty-list-row">{listMessage}</div>
  {/if}
  </div>
</div>
{/if}

<style>
.sv-dropdown {
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
  z-index: 2;
}
.sv-dropdown.is-virtual {
  overflow-y: hidden;
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
.creatable-row.active.is-disabled {
  opacity: 0.5;
  background-color: rgb(252, 186, 186);
}
.creatable-row.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
</style>