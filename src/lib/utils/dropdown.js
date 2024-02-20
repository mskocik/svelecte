/**
 * @param {HTMLDivElement} element
 * @param {string} prop
 * @returns {number}
 */
function pixelGetter(element, prop) {
  const styles = window.getComputedStyle(element);
  let { groups: { value, unit } } = styles[prop].match(/(?<value>\d+)(?<unit>[a-zA-Z]+)/);
  let floatValue = parseFloat((/** @type {unknown} */ value));
  if (unit !== 'px') {
    const el = unit === 'rem'
      ? document.documentElement
      : element.parentElement.parentElement;
    const multipler = parseFloat(window.getComputedStyle(el).fontSize.match(/\d+/).shift());
    floatValue = multipler * floatValue;
  }
  return floatValue;
}

/**
 * @typedef {object} outValue
 * @property {boolean} top
 * @property {boolean} left
 * @property {boolean} bottom
 * @property {boolean} right
 * @property {boolean} any
 *
 * @param {*} elem
 * @returns {outValue}
 */
function isOutOfViewport(elem) {
  const parentBounding = elem
    .parentElement  // dropdown container
    .parentElement  // component container
      .getBoundingClientRect();
  const bounding = elem.getBoundingClientRect();
  const out = {};

  out.top = parentBounding.top < 0;
  out.left = parentBounding.left < 0;
  out.bottom = parentBounding.bottom + bounding.height > (window.innerHeight || document.documentElement.clientHeight)
    && parentBounding.top > bounding.height && ((window.innerHeight || document.documentElement.clientHeight) > bounding.height + 50);
  out.right = parentBounding.right > (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;

  return out;
};

/**
 * @param {boolean} isOpened
 * @param {HTMLDivElement} scrollContainer
 * @param {boolean} renderDropdown
 * @returns {void}
 */
export function positionDropdown(isOpened, scrollContainer, renderDropdown) {
  if (!scrollContainer || !renderDropdown) return;
  const outVp = isOutOfViewport(scrollContainer);
  if (outVp.bottom && !outVp.top) {
    scrollContainer.parentElement.style.bottom = (scrollContainer.parentElement.parentElement.clientHeight + 1) + 'px';
    // FUTURE: debounce ....
  } else if (!isOpened || outVp.top) {
    scrollContainer.parentElement.style.bottom = '';
  }
}

/**
 * @typedef {object} ItemDimension
 * @property {number} size
 * @property {number} height
 *
 * @param {import('svelte').SvelteComponent} refVirtualList
 * @param {HTMLDivElement} scrollContainer
 * @param {array} options
 * @returns {ItemDimension}
 */
export function virtualListDimensionsResolver(refVirtualList, scrollContainer, options) {
  let vl_itemSize;
  const vl_height = pixelGetter(scrollContainer, 'maxHeight')
    - pixelGetter(scrollContainer, 'paddingTop')
    - pixelGetter(scrollContainer, 'paddingBottom');
  // get item size (hacky style)
  scrollContainer.parentElement.style.cssText = 'opacity: 0; display: block';
  const firstItem = refVirtualList.$$.ctx[1].firstElementChild.firstElementChild;

  if (firstItem) {
    firstItem.style = '';
    const firstSize = firstItem.getBoundingClientRect().height;
    const secondItem = refVirtualList.$$.ctx[1].firstElementChild.firstElementChild.nextElementSibling;
    let secondSize;
    if (secondItem) {
      secondItem.style = '';
      secondSize = secondItem.getBoundingClientRect().height;
    }
    if (secondSize && firstSize !== secondSize) {
      const groupHeaderSize = options[0].$isGroupHeader ? firstSize : secondSize;
      const regularItemSize = options[0].$isGroupHeader ? secondSize : firstSize;
      vl_itemSize = options.map(opt => opt.$isGroupHeader ? groupHeaderSize : regularItemSize);
    } else {
      vl_itemSize = firstSize;
    }
  }
  scrollContainer.parentElement.style.cssText = '';

  return {
    size: vl_itemSize,
    height: vl_height
  };
}

/**
 * @typedef {object} ScrollParams
 * @property {HTMLDivElement} container
 * @property {HTMLDivElement} scrollContainer
 * @property {boolean} virtualList
 * @property {boolean} center
 *
 * @param {ScrollParams} params
 * @param {number} dropdownIndex
 * @returns
 */
export function scrollIntoView({ container, scrollContainer, virtualList, center }, dropdownIndex) {
  if (virtualList || !container) return;

  /** @type {HTMLDivElement} */
  const focusedEl = container.querySelector(`[data-pos="${dropdownIndex}"]`);
  if (!focusedEl) return;

  const focusedRect = focusedEl.getBoundingClientRect();
  const menuRect = scrollContainer.getBoundingClientRect();
  const overScroll = focusedEl.offsetHeight / 3;
  const centerOffset = center ? scrollContainer.offsetHeight / 2 : 0;
  switch (true) {
    case focusedEl.offsetTop < scrollContainer.scrollTop:
      scrollContainer.scrollTop = focusedEl.offsetTop - overScroll + centerOffset;
      break;
    case focusedEl.offsetTop + focusedRect.height > scrollContainer.scrollTop + menuRect.height:
        scrollContainer.scrollTop = focusedEl.offsetTop + focusedRect.height - scrollContainer.offsetHeight + overScroll + centerOffset;
      break;
  }
}
