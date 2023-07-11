import Svelecte, { addFormatter, config } from './index.js';

import { registerSvelecte } from './lib/custom-element.js';

export { addFormatter, config };
export const registerAsCustomElement = (name) => registerSvelecte(name || 'el-svelecte', Svelecte, config);