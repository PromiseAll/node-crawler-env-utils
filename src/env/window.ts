import { definedValue, toFnNative, toObjectTag } from './fun';
import xhr2 from '../lib/xhr2';
/**
 * @description: 定义window环境
 * @return {string[]} 定义的全局变量名列表
 */
export const defineWindowEnv = (): string[] => {
  toObjectTag(globalThis, 'Window');
  definedValue(globalThis, 'window', globalThis);
  definedValue(globalThis, 'top', globalThis);
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

  globalThis.requestAnimationFrame = (callback: any) => {
    return setTimeout(callback, 0);
  };
  globalThis.requestIdleCallback = (callback: any) => {


  };
  return [
    'globalThis',
    'global',
    'window',
    'self',
    'parent',
    'navigator',
    'location',
    'history',
    'document',
    'localStorage',
    'sessionStorage',
    'XMLHttpRequest',
  ];
}

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