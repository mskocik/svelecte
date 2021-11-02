import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-css-only';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const isProduction = !process.env.ROLLUP_WATCH;

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

    isProduction && terser()
  ]
};
const component = {
  input: 'component.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'Svelecte',
      file: 'dist/svelecte-element.js'
    }
  ],
  plugins: [
    svelte({
      emitCss: false
    }),
    resolve(),
    isProduction && terser()
  ]
};

function serve() {
	let server;
	
	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

const docs = {
  input: "docs/app.js",
  output: {
    sourcemap: false,
    format: "iife",
    name: "app",
    file: "docs/build/app.js"
  },
  plugins: [
    svelte(),
    css({output: 'app.css'}),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
		!isProduction && serve(),
		!isProduction && livereload(),

    isProduction && terser()
  ]
};

export default isProduction
  ? [module, component, docs]
  : docs;
