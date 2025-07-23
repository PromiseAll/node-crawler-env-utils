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
    definedProtoValue(fun, name, toNativeString);
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
  if (target === globalThis) {
    definedValue(target, Symbol.toStringTag, name);
  } else {
    definedProtoValue(target, Symbol.toStringTag, name);
  }
  return target;
};

/**
 * @description: 定义对象的属性值
 * @param {object} target
 * @param {string} name
 * @param {any} value
 * @return {*}
 */
export const definedValue = (target: object, name: any, value: any, config: {
  writable?: boolean;
  enumerable?: boolean;
  configurable?: boolean;
} = {}) => {
  Object.defineProperty(target, name, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
    ...config,
  });
  return target;
};

// 定义对象原型的属性 使用 Object.setPrototypeOf
export const definedProtoValue = (target: object, name: any, value: any, config: {
  writable?: boolean;
  enumerable?: boolean;
  configurable?: boolean;
} = {}) => {
  const proto = Object.getPrototypeOf(target);
  Object.defineProperty(proto, name, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
    ...config,
  });
  Object.setPrototypeOf(target, proto);
  return target;
};