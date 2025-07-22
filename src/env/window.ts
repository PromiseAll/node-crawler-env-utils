import { definedValue, toFnNative, toObjectTag } from './fun';
import xhr2 from '../lib/xhr2';
/**
 * @description: 定义window环境
 * @return {*}
 */
export const defineWindowEnv = () => {
  toObjectTag(globalThis, 'Window');
  definedValue(globalThis, 'window', globalThis);
  definedValue(globalThis, 'self', globalThis);
  definedValue(globalThis, 'parent', globalThis);
  definedValue(globalThis, 'global', globalThis);
  setWindowsEnv('navigator');
  setWindowsEnv('location');
  setWindowsEnv('history');
  setWindowsEnv('document', 'HTMLDocument');
  setWindowsEnv('localStorage', 'Storage');
  setWindowsEnv('sessionStorage', 'Storage');
  setXhrEnv();
};

// 抽离方法定义
export const setWindowsEnv = (envName: string, tagName?: string, value: any = {}) => {
  toObjectTag(value, tagName ?? envName.replace(/^./, match => match.toUpperCase()));
  definedValue(globalThis, envName, value);
  definedValue(value, '__proto__', value);
  return value;
};

export const setXhrEnv = () => {
  toFnNative(xhr2);
  setWindowsEnv('XMLHttpRequest', 'XMLHttpRequest', xhr2);
};
