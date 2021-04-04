
import Svelecte from '../src/svelecte.js';
import { SvelecteElement, addFormatter } from './../src/component.js';
import Playground from './Playground.svelte';
import { dataset } from './data.js';

const app = new Playground({
	target: document.getElementById('app')
});

// window.customElements.define('el-svelecte', SvelecteElement);
// addFormatter('dotted', item => `<span style="background-color:${item.hex}" class="color"></span> ${item.text}`);
// addFormatter('caps', item => item.text.toUpperCase());

// setTimeout(() => {
// 	window.el = document.querySelector('el-svelecte');
// 	el.renderer = 'dotted';
// 	el.options = dataset.colors();
// }, 200);

export default app;
