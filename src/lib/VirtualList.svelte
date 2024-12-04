<script>
  import { onDestroy, onMount, tick } from "svelte";

  /**
   * @typedef {{
   *  itemCount: Array<Object>,
   *  maxHeight: number,
   *  itemHeight?: number,
   *  scrollToIndex: number,
   *  children: import('svelte').Snippet<[ index: number ]>
   * }} */
  const {
    itemCount,
    maxHeight,
    itemHeight = null,  // null means, automatic handling
    scrollToIndex,
    children,
  } = $props();

  export function resolveItemSize() {
    /** @ts-ignore @type {HTMLElement}  */
    const el = ref_contents.firstElementChild;

    return el?.offsetHeight || 0;
  }

  let prev_itemCount = itemCount;
  let prev_scrollToIndex = scrollToIndex;
  let currentOffset = 0;

  let start = $state(0);
  let end = $state(0);
  let top = $state(0);
  let viewport_height = $state(0);
  /** @type {HTMLElement} */
  let ref_viewport  = $state(null);
  /** @type {HTMLElement} */
  let ref_contents = $state(null);
  /** @type {number} */
  let itemSize = $state(itemHeight);

  let style = $derived(`height:${viewport_height}px;width:100%`);
  let visibleItems = $derived.by(() => {
    const items = [];
    for (let i = start; i< end; i++) {
      items.push({ index: i });
    }
    return items;
  });

  function updateScrollIndex(index) {
    prev_scrollToIndex = index;
    if (index < 0 || index > itemCount) {
      index = 0;
    }
    if (start < index && index < end -1) {
      return;
    }

    const maxOffset = index * itemSize;
    const minOffset = maxOffset - ref_viewport.clientHeight + itemSize;
    const totalSize = itemCount * itemSize;

    const idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));

    currentOffset = Math.max(0, Math.min(totalSize - ref_viewport.clientHeight, idealOffset));
    ref_viewport.scroll({
      top: currentOffset,
      behavior: 'auto'
    });
  }

  /**
   *
   * @param {number} itemsCount
   */
  async function refresh(itemsCount) {
    // first init
    if (!itemSize && itemsCount && end === 0) {
      end = 1;
      await tick();
      itemSize = resolveItemSize();
    }

    prev_itemCount = itemsCount;

    viewport_height = Math.min(maxHeight, itemsCount * itemSize);
    end = Math.min(itemsCount, Math.round(maxHeight / itemSize));

    await tick();
    handle_scroll();  // just make sure to repaint visible area
  }

  async function handle_scroll() {
    const { scrollTop } = ref_viewport;

    const old_start = start;

    let i = 0;
    let y = 0;

    while (i < itemCount) {
      if (y + itemSize > scrollTop) {
        start = i;
        top = y;
        break;
      }

      y += itemSize;
      i += 1;
    }

    while (i < itemCount) {
      y += itemSize;
      i += 1;

      if (y > scrollTop + viewport_height) break;
    }

    end = i;

    if (start < old_start) {
      // await tick();

      let expected_height = 0;
      let actual_height = 0;

      for (let i = start; i < old_start; i += 1) {
        const idx = i - start;
        if (start <= idx && idx < end) {
          expected_height += itemSize;
          actual_height += itemSize;
        }
      }

      const d = actual_height - expected_height;
      ref_viewport.scrollTo(0, scrollTop + d);
    }
  }

  onMount(() => {
    refresh(itemCount);
    ref_viewport?.addEventListener('scroll', handle_scroll, { passive: true });
  });

  onDestroy(() => {
    ref_viewport?.removeEventListener('scroll', handle_scroll);
  });

  $effect(() => {
    prev_itemCount !== itemCount && refresh(itemCount);
  });

  $effect(() => {
    prev_scrollToIndex !== scrollToIndex && updateScrollIndex(scrollToIndex);
  });
</script>

<svelecte-list-viewport
  bind:this={ref_viewport}
  {style}
>
  <svelecte-list-content
    bind:this={ref_contents}
    style="padding-top: {top}px; height: {itemCount * itemSize}px;"
  >
    {#each visibleItems as row (row.index)}
      <svelecte-list-row>
        {@render children?.(row.index)}
      </svelecte-list-row>
    {/each}
  </svelecte-list-content>
</svelecte-list-viewport>

<style>
  svelecte-list-viewport {
    position: relative;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
  }

  svelecte-list-content,
  svelecte-list-row {
    display: block;
  }

  svelecte-list-row {
    /* NOTE: 🤔 needed? */
    overflow: hidden;
  }
</style>
