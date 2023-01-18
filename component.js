import Svelecte, { addFormatter, config, registerSvelecte as internalRegister } from './index';

export { addFormatter, config };
export const registerSvelecte = (name) => internalRegister(Svelecte, config, name || 'el-svelecte');