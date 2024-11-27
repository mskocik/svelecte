import { defineMDSveXConfig } from 'mdsvex';
import highlighter from './src/utils/codeHighlighter.js';
import autolinkHeadings from 'rehype-autolink-headings';
import slugPlugin from 'rehype-slug';

// const __dirname = resolve();

const config = defineMDSveXConfig({
  extensions: ['.svelte.md'],
  highlight: {
    highlighter,
  },
  rehypePlugins: [
    slugPlugin,
    [
      autolinkHeadings,
      {
        behavior: 'wrap',
      },
    ],
  ]
  // layout: join(__dirname, './src/lib/components/MarkdownLayout.svelte'),
});

export default config;
