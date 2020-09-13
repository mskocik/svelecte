// source: https://github.com/rob-balfre/svelte-select/blob/master/src/utils/isOutOfViewport.js
export function isOutOfViewport(elem) {
  const bounding = elem.getBoundingClientRect();
  const out = {};

  out.top = bounding.top < 0 || bounding.top - bounding.height < 0;
  out.left = bounding.left < 0;
  out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
  out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;

  return out;
};

export function fetchRemote(url) {
  return function(query) {
    return new Promise((resolve, reject) => {
        if (!query) return [];
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${url.replace('[query]', encodeURIComponent(query))}`);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.send();
        
        xhr.onreadystatechange = () => {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              const resp = JSON.parse(xhr.response);
              resolve(resp.data || resp.items || resp.options || resp);
            } else {
              reject();
            }
          } 
        };
    });
  }
}

let timeout;
export function debounce(fn, delay) {
	return function() {
		const self = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			fn.apply(self, args);
		}, delay);
	};
};
