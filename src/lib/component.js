import Svelecte, { addRenderer, config } from './index.js';

import { registerSvelecte } from './utils/custom-element.js';

export { addRenderer, config };
export const registerAsCustomElement = (name) => registerSvelecte(name || 'el-svelecte', Svelecte, config);
