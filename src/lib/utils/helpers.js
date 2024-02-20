import { asciifold } from './sifter.js';

let itemHtml;

/**
 *
 * @param {object} item
 * @param {boolean} renderInSelection
 * @param {string} inputValue
 * @param {function} itemRenderer
 * @param {boolean} disableHighlight
 * @returns {string}
 */
export function highlightSearch(item, renderInSelection, inputValue, itemRenderer, disableHighlight) {
  const itemHtmlText = itemRenderer(item, renderInSelection, inputValue);

  if (inputValue == '' || item.isSelected || disableHighlight) {
    return itemHtmlText;
  }

  if (!itemHtml) {
    itemHtml = document.createElement('div');
  }
  itemHtml.innerHTML = itemHtmlText;

  const pattern = asciifold(inputValue);
  (pattern.includes('|')
    ? pattern.split('|').map(w => w.trim())
    : pattern.split(' ')
  )
    .filter(e => e).forEach(pat => {
      highlight(itemHtml, pat);
    });

  return itemHtml.innerHTML;
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
 * Detect Mac device
 *
 * @returns {boolean}
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
 * @returns {boolean}
 */
export function android() {
  return navigator.userAgent.toLowerCase().includes('android');
}

/**
 * Internal formatter of newly created items
 *
 * @param {string} enteredValue
 * @returns {string}
 */
export function onCreate_helper(enteredValue) {
  return (enteredValue || '').replace(/\t/g, ' ').trim().split(' ').filter(ch => ch).join(' ');
}

/**
 * Escape HTML
 * @param {string} html
 * @returns {string}
 */
export function escapeHtml(html) {
  return `${html}`
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
