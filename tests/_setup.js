import * as matchers from '@testing-library/jest-dom/matchers';
import { vi, expect } from 'vitest';
import { server } from './mocks/node.js';

expect.extend(matchers);

// https://github.com/vitest-dev/vitest/issues/821
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
const oConsole = window.console;
window.console = Object.assign({}, oConsole, { log: () => {}, warn: () => {} });


beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
