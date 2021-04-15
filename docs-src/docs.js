
import Svelecte from '../src/svelecte.js';
import { SvelecteElement, addFormatter } from './../src/component.js';
import BasicExample from './examples/01-basic.svelte';
import BasicExampleExt from './examples/02-basicPlain.svelte';
import Groups from './examples/03-groups.svelte';
import ItemRender from './examples/04-item-rendering.svelte';
import Slot from './examples/05-slot.svelte';
import Fetch from './examples/06-fetch.svelte';
import Playground from './examples/07-playground.svelte';
import { dataset } from './data.js';

[BasicExample, BasicExampleExt, Groups, ItemRender, Slot, Fetch, Playground]
	.forEach(
		(component, index) => new component({
			target: document.getElementById(`example-${index +1}`),
		})
	);

// window.customElements.define('el-svelecte', SvelecteElement);
// addFormatter('dotted', item => `<span style="background-color:${item.hex}" class="color"></span> ${item.text}`);
// addFormatter('caps', item => item.text.toUpperCase());

// setTimeout(() => {
// 	window.el = document.querySelector('el-svelecte');
// 	el.renderer = 'dotted';
// 	el.options = dataset.colors();
// }, 200);

export default app;
