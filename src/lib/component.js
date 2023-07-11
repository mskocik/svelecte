import Svelecte, { addFormatter, config, registerSvelecte } from './index.js';

export { addFormatter, config };
export const registerAsCustomElement = (name) => registerSvelecte(name || 'el-svelecte', Svelecte, config);