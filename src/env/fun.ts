/**
 * @description:  定义函数为原生函数
 * @param {Function} fun
 * @return {*}
 */
export const toFnNative = (fun: Function) => {
  const toNativeString = function () {
    return `function ${this.name}() { [native code] }`;
  };
  const funName = ['toString', 'toLocaleString'];
  funName.forEach(name => {
    definedValue(fun, name, toNativeString);
  });
  return fun;
};

/**
 * @description: 定义对象的toStringTag
 * @param {object} target
 * @param {string} name
 * @return {*}
 */
export const toObjectTag = (target: object, name: string) => {
  definedValue(target, Symbol.toStringTag, name);
  return target;
};

/**
 * @description: 定义对象的属性值
 * @param {object} target
 * @param {string} name
 * @param {any} value
 * @return {*}
 */
export const definedValue = (target: object, name: any, value: any) => {
  Object.defineProperty(target, name, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
  return target;
};
