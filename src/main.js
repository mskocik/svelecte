import DocsApp from './App.svelte';
import registerSvelecte, { addFormatter } from './component.js';
import { dataset } from './demo/data.js';

const app = new DocsApp({
	target: document.getElementById('app')
});

registerSvelecte('el-svelecte');
addFormatter('dotted', item => `<span style="background-color:${item.hex}" class="color"></span> ${item.text}`);
addFormatter('caps', item => item.text.toUpperCase());

// setTimeout(() => {
// 	window.el = document.querySelector('el-svelecte');
// 	el.renderer = 'dotted';
// 	el.options = dataset.colors();
// }, 200);

export default app;
