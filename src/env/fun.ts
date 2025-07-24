/**
 * @description: 将函数转换为模拟原生函数
 * @param {Function} fn 需要转换的函数
 * @param {string} [customName] 自定义函数名
 * @return {Function} 转换后的函数
 */
export const toFnNative = <T extends Function>(
  fn: T,
  customName?: string
): T => {
  const nativeName = customName || fn.name || 'anonymousFunction';

  const toNativeString = function (this: Function) {
    return `function ${nativeName}() { [native code] }`;
  };

  const nativeFunctionMethods = ['toString', 'toLocaleString'];
  nativeFunctionMethods.forEach(methodName => {
    Object.defineProperty(fn, methodName, {
      value: toNativeString,
      configurable: false,
      writable: false
    });
  });

  return fn;
};

/**
 * @description: 设置对象的 toStringTag
 * @param {object} target 目标对象
 * @param {string} name 标签名
 * @return {object} 处理后的对象
 */
export const definedObjectTag = <T extends object>(target: T, name: string): T => {
  const isGlobalObject = target === globalThis;

  if (isGlobalObject) {
    definedValue(target, Symbol.toStringTag, name);
  } else {
    definedProtoValue(target, Symbol.toStringTag, name);
  }

  return target;
};

/**
 * @description: 定义对象属性，支持更精细的配置
 * @param {object} target 目标对象
 * @param {PropertyKey} name 属性名
 * @param {any} value 属性值
 * @param {PropertyDescriptor} [config] 属性描述符
 * @return {object} 处理后的对象
 */
export const definedValue = <T extends object>(
  target: T,
  name: PropertyKey,
  value: any,
  config: PropertyDescriptor = {}
): T => {
  const defaultConfig: PropertyDescriptor = {
    value,
    writable: true,
    enumerable: true,
    configurable: false,
    ...config
  };

  Object.defineProperty(target, name, defaultConfig);
  return target;
};

/**
 * @description: 在对象原型上定义属性
 * @param {object} target 目标对象
 * @param {PropertyKey} name 属性名
 * @param {any} value 属性值
 * @param {PropertyDescriptor} [config] 属性描述符
 * @return {object} 处理后的对象
 */
export const definedProtoValue = <T extends object>(
  target: T,
  name: PropertyKey,
  value: any,
  config: PropertyDescriptor = {}
): T => {
  const proto = Object.getPrototypeOf(target);

  const defaultConfig: PropertyDescriptor = {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
    ...config
  };

  Object.defineProperty(proto, name, defaultConfig);
  Object.setPrototypeOf(target, proto);

  return target;
};