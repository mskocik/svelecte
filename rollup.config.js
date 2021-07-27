import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const module = {
  input: 'index.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'dist/svelecte.mjs'
    }
  ],
  plugins: [
    svelte(),
    css({output: 'svelecte.css'}),
    resolve(),

    production && terser()
  ]
}

export default module;
