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
  definedValue(globalThis, 'TouchEvent', function TouchEvent() {
    return new Event('touchstart');
  });
  definedValue(globalThis, 'MouseEvent', function MouseEvent() {
    return new Event('mousedown');
  });
  definedValue(globalThis, 'KeyboardEvent', function KeyboardEvent() {
    return new Event('keydown');
  });
  definedValue(globalThis, 'Screen', function Screen() {
    return {
      width: 1920,
      height: 1080,
    };
  });
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
  globalThis.requestIdleCallback = (callback: any) => {};
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
};

// 抽离方法定义
export const setWindowsEnv = (envName: string, tagName?: string, value: any = {}) => {
  toObjectTag(value, tagName ?? envName.replace(/^./, match => match.toUpperCase()));
  definedValue(globalThis, envName, value);
  Object.setPrototypeOf(value, { ...value });
  return value;
};

export const setXhrEnv = () => {
  // toFnNative(xhr2);
  // setWindowsEnv('XMLHttpRequest', 'XMLHttpRequest', xhr2);

  function XMLHttpRequest() {
    this.open = function open() {};
    this.send = function send() {};
    this.setRequestHeader = function setRequestHeader() {};
    this.getResponseHeader = function getResponseHeader() {};
    this.getAllResponseHeaders = function getAllResponseHeaders() {};
    this.abort = function abort() {};
    this.onreadystatechange = function onreadystatechange() {};
  }
  XMLHttpRequest.prototype = XMLHttpRequest;

  globalThis.XMLHttpRequest = XMLHttpRequest;
};
