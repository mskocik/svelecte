import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

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
  input: "docs/src/docs.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "docs/assets/docs.js"
  },
  plugins: [
    svelte({
      dev: !production,
      css: css => {
        css.write("docs.css", false);
      }
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration —
    // consult the documentation for details:
    // https://github.com/rollup/rollup-plugin-commonjs
    resolve(),
		commonjs(),
		
		!production && serve(),

		!production && livereload('docs/**'),

    production && terser()
  ]
};

const module = {
  input: 'src/svelecte.js',
  output: [
    {
      sourcemap: false,
      format: 'es',
      file: 'dist/svelecte.mjs'
    }
  ],
  plugins: [
    svelte({
      dev: !production,
      css: css => {
        css.write('svelecte.css', false)
      }
    }),
    resolve(),
    commonjs(),
  ]
}

const component = {
  input: 'src/component.js',
  output: [
    {
      sourcemap: false,
      format: 'iife',
      name: 'Svelecte',
      file: 'dist/svelecte.js'
    }
  ],
  plugins: [
    svelte({
      dev: !production,
      css: false
    }),
    resolve(),
    commonjs(),

    production && terser()
  ]
};

export default [docs, module, component];
