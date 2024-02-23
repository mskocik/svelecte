/**
 * Simple debouncer
 *
 * @param {function} fn
 * @param {number} delay
 */
export function debounce(fn, delay) {
  let timeout;
	return function() {
		const self = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
      fn.apply(self, args)
		}, delay);
	};
};

/**
 * @callback RequestFactoryFn
 * @param {string} query
 * @param {{
 *  url: ?string,
 *  parentValue: string|number|null|undefined,
 *  initial: string|number|string[]|null,
 *  controller: AbortController
 *  }} props
 * @param {RequestInit|object} fetchProps
 * @returns {Request}
 */

/**
 * Built-in fetch request factory
 *
 * @type {RequestFactoryFn}
 */
export function requestFactory(query, { url, parentValue, initial, controller }, fetchProps) {
  if (parentValue) {
    url = url.replace('[parent]', encodeURIComponent(parentValue));
  }
  if (query) {
    url = url.replace('[query]', encodeURIComponent(query));
  }
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
  const props = Object.assign({}, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    },
    cache: 'no-store',
    signal: controller.signal
  }, fetchProps);
  return new Request(fetchUrl, props);
}
