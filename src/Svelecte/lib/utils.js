import { asciifold } from './sifter';

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

export let xhr = null;

export function fetchRemote(url) {
  return function(query, cb) {
    return new Promise((resolve, reject) => {
      xhr = new XMLHttpRequest();
      xhr.open('GET', `${url.replace('[query]', encodeURIComponent(query))}`);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send();
      
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const resp = JSON.parse(xhr.response);
            resolve(cb ? cb(resp) : resp.data || resp.items || resp.options || resp);
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
      fn.apply(self, args)
		}, delay);
	};
};

/**
 * highlight-related code from selectize itself. We pass raw html through @html svelte tag
 * base from https://github.com/selectize/selectize.js/blob/master/src/contrib/highlight.js & edited
 */
const itemHtml = document.createElement('div');
itemHtml.className = 'sv-item-content';

export function highlightSearch(item, isSelected, $inputValue, formatter) {
  itemHtml.innerHTML = formatter ? formatter(item, isSelected) : item;
  if ($inputValue == '' || item.isSelected) return itemHtml.outerHTML;

  const regex = new RegExp(`(${asciifold($inputValue)})`, 'ig');
  
  highlight(itemHtml, regex);

  return itemHtml.outerHTML;
}

const highlight = function(node, regex) {
  let skip = 0;
  // Wrap matching part of text node with highlighting <span>, e.g.
  // Soccer  ->  <span class="highlight">Soc</span>cer  for regex = /soc/i
  if (node.nodeType === 3) {
    const folded = asciifold(node.data);
    const pos = folded.search(regex);
    // var pos = node.data.search(regex);
    if (pos >= 0 && node.data.length > 0) {
      const match = folded.match(regex);
      // var match = node.data.match(regex);
      const spannode = document.createElement('span');
      spannode.className = 'highlight';
      const middlebit = node.splitText(pos);
      const endbit = middlebit.splitText(match[0].length);
      const middleclone = middlebit.cloneNode(true);
      spannode.appendChild(middleclone);
      middlebit.parentNode.replaceChild(spannode, middlebit);
      skip = 1;
    }
  } 
  // Recurse element node, looking for child text nodes to highlight, unless element 
  // is childless, <script>, <style>, or already highlighted: <span class="hightlight">
  else if (node.nodeType === 1 && node.childNodes && !/(script|style)/i.test(node.tagName) && ( node.className !== 'highlight' || node.tagName !== 'SPAN' )) {
    for (var i = 0; i < node.childNodes.length; ++i) {
      i += highlight(node.childNodes[i], regex);
    }
  }
  return skip;
};

/**
 * Automatic setter for 'valueField' or 'labelField' when they are not set
 */
export function fieldInit(type, options) {
  const isValue = type === 'value';
  let val = isValue  ? 'value' : 'text';              // selectize style defaults
  if (options && options.length) {
    const firstItem = options[0].options ? options[0].options[0] : options[0];
    const autoAddItem = isValue ? 0 : 1;
    const guessList = isValue
      ? ['id', 'value', 'ID']
      : ['name', 'title', 'label'];
    val = Object.keys(firstItem).filter(prop => guessList.includes(prop))
      .concat([Object.keys(firstItem)[autoAddItem]])  // auto add field (used as fallback)
      .shift();  
  }
  return val;
}