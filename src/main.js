import DocsApp from './App.svelte';
import registerSvelecte from './Svelecte/registerComponent.js';

const app = new DocsApp({
	target: document.getElementById('app')
});

registerSvelecte('el-svelecte');

export default app;
