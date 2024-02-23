/**
 * Simple debouncer
 *
 * @param {function} fn
 * @param {number} delay
 * @returns fn
 */
export function debounce(fn, delay) {
  let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
      fn.apply(this, args);
		}, delay);
	};
};

/**
 * @callback RequestFactoryFn
 * @param {string} query
 * @param {{
 *  url: ?string,
 *  parentValue: string|number|null|undefined,
 *  initial: string|number|string[]|null
 *  }} props
 * @param {RequestInit|object} fetchProps
 * @returns {{
 *  request: Request
 *  controller: AbortController
 * }}
 */

/**
 * Built-in fetch request factory
 *
 * @type {RequestFactoryFn}
 */
export function requestFactory(query, { url, parentValue, initial }, fetchProps) {
  if (parentValue) {
    url = url.replace('[parent]', encodeURIComponent(parentValue));
  }
  if (query) {
    url = url.replace('[query]', encodeURIComponent(query));
  }
  if (Array.isArray(initial) && initial.length === 0) initial = null;
  if (initial) {
    url = url.replace('[query]', 'init');
  }
  const fetchUrl = url[0] === '/'
    ? new URL(url, window.location.origin)
    : new URL(url);

  if (initial) {
    const arr = Array.isArray(initial) ? initial : [initial];
    fetchUrl.searchParams.append('init', arr.join(','));
  }
  const controller = new AbortController();
  const props = Object.assign({}, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    cache: 'no-store',
  }, fetchProps, { signal: controller.signal });
  return {
    request: new Request(fetchUrl, props),
    controller: controller
  };
}
