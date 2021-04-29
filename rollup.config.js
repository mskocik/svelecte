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
    svelte({
      // Warnings are normally passed straight to Rollup. You can
      // optionally handle them here, for example to squelch
      // warnings with a particular code
      onwarn: (warning, handler) => {
        // e.g. don't warn on <marquee> elements, cos they're cool
        if (warning.code === 'module-script-reactive-declaration') return;

        // let Rollup handle all other warnings normally
        handler(warning);
      }
    }),
    css({output: 'svelecte.css'}),
    resolve(),

    production && terser()
  ]
}

export default module;
