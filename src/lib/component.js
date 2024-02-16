import Svelecte, { addFormatter, config } from './index.js';

import { registerSvelecte } from './utils/custom-element.js';

export { addFormatter, config };
export const registerAsCustomElement = (name) => registerSvelecte(name || 'el-svelecte', Svelecte, config);
