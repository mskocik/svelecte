
import BasicExample from './src/01-basic.svelte';
import BasicExampleExt from './src/02-basicPlain.svelte';
import Groups from './src/03-groups.svelte';
import ItemRender from './src/04-item-rendering.svelte';
import Slot from './src/05-slot.svelte';
import Fetch from './src/06-fetch.svelte';
import Playground from './src/07-playground.svelte';
import Element from './src/08-custom-element.svelte';
import Dependent from './src/09-custom-dependent.svelte';
import Remote from './src/10-custom-remote.svelte';
import Vue from './src/11-vue.svelte';

[BasicExample, BasicExampleExt, Groups, ItemRender, Slot, Fetch, Playground, Element, Dependent, Remote, Vue]
  .forEach(
    (component, index) => new component({
      target: document.getElementById(`example-${index +1}`),
    })
  );

/** FETCH example sources */
const promises = [];
document.querySelectorAll('pre[data-src]')
  .forEach(codeBlock => promises.push(
    fetch(`src/${codeBlock.dataset.src}.svelte`)
      .then(resp => resp.text())
      .then(html => {
        const codeEl = document.createElement('code');
        codeEl.className = 'svelte';
        codeEl.innerText = html.replaceAll(/(<\/?script>)/g, '<!-- $1 -->');;
        codeBlock.appendChild(codeEl);
      })
  ));
Promise.all(promises).then(() => hljs.highlightAll());
