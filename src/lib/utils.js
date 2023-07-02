import { asciifold } from './sifter';

// source: https://github.com/rob-balfre/svelte-select/blob/master/src/utils/isOutOfViewport.js
export function isOutOfViewport(elem) {
  if (!elem) return false;
  const parentBounding = elem
    .parentElement  // dropdown container
    .parentElement  // component container
      .getBoundingClientRect();
  const bounding = elem.getBoundingClientRect();
  const out = {};

  out.top = parentBounding.top < 0;
  out.left = parentBounding.left < 0;
  out.bottom = parentBounding.bottom + bounding.height > (window.innerHeight || document.documentElement.clientHeight); 
  out.right = parentBounding.right > (window.innerWidth || document.documentElement.clientWidth);
  out.any = out.top || out.left || out.bottom || out.right;

  return out;
};

export let xhr = null;

export function fetchRemote(url) {
  return function(query, parentValue, cb) {
    return new Promise((resolve, reject) => {
      xhr = new XMLHttpRequest();
      if (parentValue) {
        url = url.replace('[parent]', encodeURIComponent(parentValue));
      }
      xhr.open('GET', `${url.replace('[query]', encodeURIComponent(query))}`);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.send();
      
      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            try {
              const resp = JSON.parse(this.response);
              resolve(cb ? cb(resp) : (resp.data || resp.items || resp.options || resp));
            } catch (e) {
              console.warn('[Svelecte]:Fetch - error handling fetch response', e);
              reject();
            }
          } else {
            reject();
          }
        } 
      };
    });
  }
}

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

let itemHtml;

export function highlightSearch(item, isSelected, $inputValue, formatter, disableHighlight) {
  const itemHtmlText = formatter ? formatter(item, isSelected, $inputValue) : item;
  
  if ($inputValue == '' || item.isSelected || disableHighlight) {
    return '<div class="sv-item-content">' + itemHtmlText + '</div>';
  }

  if (!itemHtml) {
    itemHtml = document.createElement('div');
    itemHtml.className = 'sv-item-content';
  }
  itemHtml.innerHTML = itemHtmlText;

  // const regex = new RegExp(`(${asciifold($inputValue)})`, 'ig');
  const pattern = asciifold($inputValue);
  pattern.split(' ').filter(e => e).forEach(pat => {
    highlight(itemHtml, pat);
  });
  
  return itemHtml.outerHTML;
}

/**
 * highlight function code from selectize itself. We pass raw html through @html svelte tag
 * base from https://github.com/selectize/selectize.js/blob/master/src/contrib/highlight.js & edited
 */
const highlight = function(node, regex) {
  let skip = 0;
  // Wrap matching part of text node with highlighting <span>, e.g.
  // Soccer  ->  <span class="highlight">Soc</span>cer for pattern 'soc'
  if (node.nodeType === 3) {
    const folded = asciifold(node.data);
    let pos = folded.indexOf(regex);
    pos -= (folded.substr(0, pos).toUpperCase().length - folded.substr(0, pos).length);
    if (pos >= 0 ) {
      const spannode = document.createElement('span');
      spannode.className = 'highlight';
      const middlebit = node.splitText(pos);
      const endbit = middlebit.splitText(regex.length);
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
export function fieldInit(type, options, config) {
  const isValue = type === 'value';
  if (config.isOptionArray) return isValue ? 'value' : 'label';
  let val = isValue  ? 'value' : 'text';              // selectize style defaults
  if (options && options.length) {
    const firstItem = options[0][config.optItems] ? options[0][config.optItems][0] : options[0];
    if (!firstItem) return val;
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

/**
 * Detect Mac device
 * 
 * @returns {bool}
 */
export function iOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**
 * Detects if on android device
 * 
 * @returns {bool}
 */
export function android() {
  return navigator.userAgent.toLowerCase().includes('android');
}

/**
 * Formatter of newly created items. When `''` is returned, it means new option cannot be created.
 * 
 * @param {string} val 
 * @param {array} options 
 * @returns {string}
 */
export function defaultCreateFilter(val, options) {  
  return (val || '').replace(/\t/g, ' ').trim().split(' ').filter(ch => ch).join(' ');
}

/**
 * Default create function
 * 
 * @param {string} inputValue 
 * @param {string} creatablePrefix 
 * @returns {object} newly created option
 */
export function defaultCreateTransform(inputValue, creatablePrefix, valueField, labelField) {
  return {
    [valueField]: inputValue,
    [labelField]: creatablePrefix + inputValue,
  }
}
