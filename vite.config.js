import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

const vitestBrowserConditionPlugin = {
  name: 'vite-plugin-vitest-browser-condition',
  config({resolve}) {
    if(process.env.VITEST) {
      resolve.conditions.unshift('browser');
    }
  }
}

export default defineConfig({
  plugins: [vitestBrowserConditionPlugin, sveltekit()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    // extend jsdom matchers
    setupFiles: ['./tests/setup.js']
  }
});
