import DocsApp from './App.svelte';
import DottedRenderer from './demo/DottedRenderer.svelte';
import registerSvelecte, { registerRenderer } from './Svelecte/registerComponent.js';

const app = new DocsApp({
	target: document.getElementById('app')
});

registerSvelecte('el-svelecte');
registerRenderer('dotted', DottedRenderer);

window.q = document.querySelector('el-svelecte');
q.options = [
	{ value: 2, text: 'blue', hex: '#00F' },
	{ value: 3, text: 'green', hex: '#0F0' },
	{ value: 1, text: 'red', hex: '#F00'},
	{ value: 4, text: 'yellow', hex: '#FF0'}
];

export default app;
