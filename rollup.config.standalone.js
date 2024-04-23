import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import terser from '@rollup/plugin-terser';

import { readFileSync } from 'node:fs';

const pkg = (JSON.parse(readFileSync('./package.json').toString()));

const module = {
  input: 'src/lib/index.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'bundle/svelecte.js'
    }
  ],
  plugins: [
    svelte(),
    css({output: 'svelecte.css'}),
    resolve(),
    terser({
      format: {
        preamble: `// version: ${pkg.version}`
      }
    })
  ]
};

const component = {
  input: 'src/lib/component.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'Svelecte',
      file: 'bundle/svelecte-element.js'
    }
  ],
  plugins: [
    svelte({
      emitCss: false
    }),
    resolve(),
    terser({
      format: {
        preamble: `// version: ${pkg.version}`
      }
    })
  ]
};

export default [module, component];
