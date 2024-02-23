// import { join, resolve } from 'node:path';
import highlighter from './src/utils/codeHighlighter.js';

// const __dirname = resolve();

const config = {
  extensions: ['.svelte.md', '.svelte'],
  highlight: {
    highlighter,
  },
  // layout: join(__dirname, './src/lib/components/MarkdownLayout.svelte'),
};

export default config;
