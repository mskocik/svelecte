
import Svelecte, { SvelecteElement, addFormatter } from '../../src/svelecte.js';
import BasicExample from './examples/01-basic.svelte';
import BasicExampleExt from './examples/02-basicPlain.svelte';
import Groups from './examples/03-groups.svelte';
import ItemRender from './examples/04-item-rendering.svelte';
import Slot from './examples/05-slot.svelte';
import Fetch from './examples/06-fetch.svelte';
import Playground from './examples/07-playground.svelte';
import Element from './examples/08-custom-element.svelte';
import Dependent from './examples/09-custom-dependent.svelte';
import Vue from './examples/10-vue.svelte';
import { dataset } from './data.js';

[BasicExample, BasicExampleExt, Groups, ItemRender, Slot, Fetch, Playground, Element, Dependent, Vue]
  .forEach(
    (component, index) => new component({
      target: document.getElementById(`example-${index +1}`),
    })
  );

/** FETCH example sources */
const promises = [];
document.querySelectorAll('pre[data-src]')
  .forEach(codeBlock => promises.push(
    fetch(`src/examples/${codeBlock.dataset.src}.svelte`)
      .then(resp => resp.text())
      .then(html => {
        const codeEl = document.createElement('code');
        codeEl.className = 'svelte';
        codeEl.innerText = html.replaceAll(/(<\/?script>)/g, '<!-- $1 -->');;
        codeBlock.appendChild(codeEl);
      })
  ));
Promise.all(promises).then(() => hljs.highlightAll());
