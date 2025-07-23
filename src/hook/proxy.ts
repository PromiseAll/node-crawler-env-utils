/**
 * 增强版环境代理监控工具
 * 基于Proxy实现完整的对象操作拦截和日志记录, 提供精细的日志级别、操作过滤和格式化控制。
 */

const PROXY_MARKER = Symbol('__isEnvProxy');

// 日志级别定义
export enum ProxyLogLevel {
  /** 仅记录值为 "空值" 的 'get' 操作 (null, undefined, 0, '', NaN) */
  LOW = 0,
  /** 记录 'get' 和 'set' 操作 */
  MEDIUM = 1,
  /** 记录所有被 'allowedOperations' 允许的操作 */
  HIGH = 2,
  /** 记录所有允许的操作, 并附带调用堆栈信息, 用于深度追踪 */
  TRACE = 3,
}

// 代理操作类型, 涵盖了 Proxy Handler 的所有可用陷阱(trap)
export type ProxyOperation =
  | 'get'
  | 'set'
  | 'has'
  | 'deleteProperty'
  | 'ownKeys'
  | 'getOwnPropertyDescriptor'
  | 'defineProperty'
  | 'preventExtensions'
  | 'getPrototypeOf'
  | 'setPrototypeOf'
  | 'isExtensible'
  | 'apply'
  | 'construct';

// 日志配置接口
export interface LogConfig {
  /** 日志的详细程度 */
  level: ProxyLogLevel;
  /** 是否在控制台输出中启用 ANSI 颜色 */
  enableColors: boolean;
  /** 是否在 TRACE 级别下显示调用堆栈 */
  showStackTrace: boolean;
  /** 用户自定义的格式化函数, 用于完全控制日志输出字符串 */
  customFormatter?: (log: LogEntry) => string;
}

// 日志条目接口, 描述了单条日志的全部信息
export interface LogEntry {
  /** 被拦截的操作类型 */
  operation: ProxyOperation;
  /** 操作对象的访问路径 */
  path: string;
  /** 被操作的属性名 */
  property?: string | symbol;
  /** 操作返回或设置的值 */
  value?: any;
  /** 'set' 操作前的旧值 */
  oldValue?: any;
  /** 目标对象的类型 */
  targetType: string;
  /** 操作的调用堆栈信息 (仅在 TRACE 级别下) */
  stackTrace?: string;
}

// 代理配置接口
export interface ProxyConfig {
  /** 需要监控的全局对象路径 */
  paths: string[];
  /** 日志相关的配置 */
  logConfig: LogConfig;
  /** 需要忽略的属性集合, 对这些属性的操作不会被记录 */
  ignoredProperties: Set<string | symbol>;
  /** 是否对路径下的对象进行深度/递归代理 */
  isDeepProxy: boolean;
  /** 允许记录的操作类型集合, 'all' 表示不限制 */
  allowedOperations: Set<ProxyOperation> | 'all';
}

// 默认日志配置
const DEFAULT_LOG_CONFIG: LogConfig = {
  level: ProxyLogLevel.MEDIUM,
  enableColors: true,
  showStackTrace: false,
};

// ANSI 颜色代码, 用于美化控制台输出
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
};

/**
 * 获取一个值的详细类型字符串。
 * @param value 任意值
 * @returns 详细的类型名, 如 'Array', 'Date', 'Object' 等
 */
function getDetailedType(value: any): string {
  if (value === null) return 'null';
  if (typeof value === 'undefined') return 'undefined';
  if (Array.isArray(value)) return 'Array';
  if (value instanceof Date) return 'Date';
  if (value instanceof RegExp) return 'RegExp';
  if (typeof value === 'object') return value.constructor?.name || 'Object';
  return typeof value;
}

/**
 * 将任意值格式化为易于阅读的字符串。
 * @param value 任意值
 * @returns 格式化后的字符串
 */
function formatValue(value: any): string {
  if (value === null) return 'null';
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  try {
    if (Array.isArray(value)) {
      const items = value.slice(0, 10).map(v => formatValue(v));
      return `[${items.join(', ')}${value.length > 10 ? '...' : ''}]`;
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      const pairs = keys.slice(0, 5).map(k => `${k}: ${formatValue(value[k])}`);
      return `{ ${pairs.join(', ')}${keys.length > 5 ? '...' : ''} }`;
    }
  } catch {
    // 处理可能因为代理或其他原因导致的访问异常
    return `[${getDetailedType(value)}]`;
  }
  return String(value);
}

/**
 * 获取当前调用栈的简短信息。
 * @returns 包含调用位置信息的字符串
 */
function getStackTrace(): string | undefined {
  try {
    throw new Error();
  } catch (e) {
    // 从堆栈信息中提取关键的两行, 忽略内部调用
    return (e as Error).stack?.split('\n').slice(4, 6).join('\n');
  }
}

/**
 * 日志格式化器: 负责将 LogEntry 对象转换为最终的彩色字符串。
 */
class LogFormatter {
  constructor(private config: LogConfig) {}

  /**
   * 格式化单条日志。
   * @param entry 日志条目对象
   * @returns 格式化后的字符串
   */
  format(entry: LogEntry): string {
    if (this.config.customFormatter) return this.config.customFormatter(entry);

    const { enableColors } = this.config;
    const color = (c: string) => (enableColors ? c : '');
    const reset = enableColors ? COLORS.reset : '';

    const opColor = this.getOperationColor(entry.operation);
    let output = `${color(opColor)}[${entry.operation.toUpperCase()}]${reset} ${color(
      COLORS.cyan
    )}${entry.path}${reset}`;

    if (entry.property !== undefined) {
      output += ` -> ${color(COLORS.yellow)}${String(entry.property)}${reset}`;
    }

    // 根据操作类型附加额外信息
    if (entry.operation === 'set') {
      output += `: ${color(COLORS.red)}${formatValue(entry.oldValue)}${reset} → ${color(
        COLORS.green
      )}${formatValue(entry.value)}${reset}`;
    } else if (entry.operation === 'has') {
      output += ` = ${color(COLORS.magenta)}${entry.value}${reset}`;
    } else if (entry.operation === 'get' || entry.value !== undefined) {
      // 关键改动: 对 'get' 操作, 总是显示其值, 即使是 undefined
      output += ` = ${color(COLORS.green)}${formatValue(entry.value)}${reset}`;
    }

    // 如果需要, 附加堆栈信息
    if (this.config.showStackTrace && entry.stackTrace) {
      output += `\n${color(COLORS.gray)}${entry.stackTrace}${reset}`;
    }
    return output;
  }

  /**
   * 根据操作类型返回对应的颜色。
   * @param op 操作类型
   * @returns ANSI 颜色代码
   */
  private getOperationColor = (op: ProxyOperation): string =>
    ({
      get: COLORS.green,
      set: COLORS.yellow,
      has: COLORS.blue,
      deleteProperty: COLORS.red,
      ownKeys: COLORS.magenta,
      apply: COLORS.cyan,
      construct: COLORS.brightCyan,
    }[op] || COLORS.gray);
}

/**
 * 日志管理器: 决定哪些日志应该被记录以及如何记录。
 */
class Logger {
  private formatter: LogFormatter;

  constructor(private config: ProxyConfig) {
    this.formatter = new LogFormatter(config.logConfig);
  }

  /**
   * 记录一条日志, 前提是它通过了过滤条件。
   * @param entry 日志条目
   */
  log(entry: LogEntry): void {
    if (this.shouldLog(entry)) {
      if (this.config.logConfig.showStackTrace) {
        entry.stackTrace = getStackTrace();
      }
      console.log(this.formatter.format(entry));
    }
  }

  /**
   * 检查一个值是否被视为空值 (null, undefined, '', 0, NaN)。
   * @param value 要检查的值
   * @returns 如果是空值则返回 true, 否则返回 false
   */
  private isConsideredEmpty(value: any): boolean {
    return (
      value === null ||
      typeof value === 'undefined' ||
      value === '' ||
      value === 0 ||
      Number.isNaN(value)
    );
  }

  /**
   * 根据配置决定是否应该记录某条日志。
   * @param entry 日志条目
   * @returns 如果应该记录则返回 true
   */
  private shouldLog(entry: LogEntry): boolean {
    const { operation, value } = entry;
    const { level } = this.config.logConfig;

    // 1. 主过滤器: 操作是否在允许列表中?
    if (this.config.allowedOperations !== 'all' && !this.config.allowedOperations.has(operation)) {
      return false;
    }

    // 2. 级别过滤器: 根据日志级别决定是否显示
    switch (level) {
      case ProxyLogLevel.LOW:
        // 关键改动: 检查多种 "空" 值
        return operation === 'get' && this.isConsideredEmpty(value);
      case ProxyLogLevel.MEDIUM:
        return operation === 'get' || operation === 'set';
      case ProxyLogLevel.HIGH:
      case ProxyLogLevel.TRACE:
        return true; // 如果通过了主过滤器, 则总是显示
      default:
        return false;
    }
  }
}

/**
 * 代理处理器工厂: 负责创建和缓存 Proxy Handler。
 */
class ProxyHandlerFactory {
  // 使用 WeakMap 缓存已创建的代理, 避免重复代理同一个对象并防止内存泄漏
  private proxyCache = new WeakMap<object, any>();

  constructor(private logger: Logger, private config: ProxyConfig) {}

  /**
   * 为指定目标对象和路径创建一个 Proxy Handler。
   * @param target 目标对象
   * @param path 对象的访问路径
   * @returns Proxy Handler 配置对象
   */
  createHandler(target: any, path: string): ProxyHandler<any> {
    const createLogEntry = (operation: ProxyOperation, details: Partial<LogEntry>): LogEntry => ({
      operation,
      path,
      targetType: getDetailedType(target),
      ...details,
    });

    const self = this;
    return {
      get(target, prop, receiver) {
        if (prop === PROXY_MARKER) return true;
        if (self.config.ignoredProperties.has(prop)) return Reflect.get(target, prop, receiver);

        const value = Reflect.get(target, prop, receiver);
        self.logger.log(createLogEntry('get', { property: prop, value }));

        if (self.config.isDeepProxy && typeof value === 'object' && value !== null) {
          const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
          // 为避免 "TypeError: 'get' on proxy: property 'prototype' is a read-only..." 错误,
          // 对于不可配置且不可写的属性(如 class 的 prototype), 我们必须返回原始值, 而不是新代理。
          if (descriptor && !descriptor.configurable && !descriptor.writable) {
            return value;
          }
          const newPath = path ? `${path}.${String(prop)}` : String(prop);
          return self.createProxy(value, newPath);
        }
        return value;
      },
      set(target, prop, value, receiver) {
        if (self.config.ignoredProperties.has(prop))
          return Reflect.set(target, prop, value, receiver);
        const oldValue = Reflect.get(target, prop, receiver);
        const result = Reflect.set(target, prop, value, receiver);
        const currentPath = path ? `${path}.${String(prop)}` : String(prop);
        self.logger.log(
          createLogEntry('set', { path: currentPath, property: prop, oldValue, value })
        );
        return result;
      },
      // 其他所有陷阱都只负责记录事件, 然后调用 Reflect 执行原始操作
      has: (t, p) => (
        self.logger.log(createLogEntry('has', { property: p, value: Reflect.has(t, p) })),
        Reflect.has(t, p)
      ),
      deleteProperty: (t, p) => (
        self.logger.log(createLogEntry('deleteProperty', { property: p })),
        Reflect.deleteProperty(t, p)
      ),
      ownKeys: t => (
        self.logger.log(createLogEntry('ownKeys', { value: Reflect.ownKeys(t) })),
        Reflect.ownKeys(t)
      ),
      getOwnPropertyDescriptor: (t, p) => (
        self.logger.log(
          createLogEntry('getOwnPropertyDescriptor', {
            property: p,
            value: Reflect.getOwnPropertyDescriptor(t, p),
          })
        ),
        Reflect.getOwnPropertyDescriptor(t, p)
      ),
      defineProperty: (t, p, d) => (
        self.logger.log(createLogEntry('defineProperty', { property: p, value: d })),
        Reflect.defineProperty(t, p, d)
      ),
      preventExtensions: t => (
        self.logger.log(
          createLogEntry('preventExtensions', { value: Reflect.preventExtensions(t) })
        ),
        Reflect.preventExtensions(t)
      ),
      getPrototypeOf: t => (
        self.logger.log(createLogEntry('getPrototypeOf', { value: Reflect.getPrototypeOf(t) })),
        Reflect.getPrototypeOf(t)
      ),
      setPrototypeOf: (t, p) => (
        self.logger.log(createLogEntry('setPrototypeOf', { value: p })),
        Reflect.setPrototypeOf(t, p)
      ),
      isExtensible: t => (
        self.logger.log(createLogEntry('isExtensible', { value: Reflect.isExtensible(t) })),
        Reflect.isExtensible(t)
      ),
      apply: (t, thisArg, args) => {
        const result = Reflect.apply(t, thisArg, args);
        self.logger.log(createLogEntry('apply', { value: { args, result } }));
        return result;
      },
      construct: (t, args, newTarget) => {
        const result = Reflect.construct(t, args, newTarget);
        self.logger.log(createLogEntry('construct', { value: { args, result } }));
        return result;
      },
    };
  }

  /**
   * 创建或从缓存中获取一个代理对象。
   * @param target 要代理的目标对象
   * @param path 对象的访问路径
   * @returns 代理对象或原始值 (如果不是可代理的对象)
   */
  createProxy(target: any, path: string): any {
    if (!['object', 'function'].includes(typeof target) || target === null) return target;
    // 如果目标已是代理, 直接返回, 防止代理嵌套
    if (target[PROXY_MARKER]) return target;
    if (this.proxyCache.has(target)) return this.proxyCache.get(target);

    const handler = this.createHandler(target, path);
    const proxy = new Proxy(target, handler);
    this.proxyCache.set(target, proxy);
    return proxy;
  }
}

/**
 * 环境代理设置器: 负责解析配置并在全局作用域中设置代理。
 */
class EnvironmentProxySetter {
  private logger: Logger;
  private handlerFactory: ProxyHandlerFactory;

  constructor(private config: ProxyConfig) {
    this.logger = new Logger(config);
    this.handlerFactory = new ProxyHandlerFactory(this.logger, config);
  }

  /**
   * 应用所有代理配置。
   */
  setProxies(): void {
    const globalScope = globalThis;
    this.config.paths.forEach(path => this.setProxyForPath(globalScope, path));
    this.printSummary();
  }

  /**
   * 在给定的作用域和路径上设置一个代理。
   * @param scope 起始作用域 (如 globalThis)
   * @param path 要设置代理的完整路径 (如 'process.env')
   */
  private setProxyForPath(scope: any, path: string): void {
    const parts = path.split('.');
    const finalProp = parts.pop()!;
    let parent = scope;

    // 确保路径中的所有父对象都存在
    for (const part of parts) {
      parent = parent[part] =
        typeof parent[part] === 'object' && parent[part] !== null ? parent[part] : {};
    }

    // 创建并设置代理
    parent[finalProp] = this.handlerFactory.createProxy(parent[finalProp] || {}, path);
  }

  /**
   * 打印启动摘要信息, 告知用户代理已成功设置及其配置。
   */
  private printSummary(): void {
    const { logConfig, paths, allowedOperations, isDeepProxy } = this.config;
    const { enableColors } = logConfig;
    const color = (c: string) => (enableColors ? c : '');
    const reset = enableColors ? COLORS.reset : '';
    const green = (s: any) => `${color(COLORS.green)}${s}${reset}`;

    console.log(`\n${color(COLORS.magenta)}--- 环境代理设置完成 ---${reset}`);
    console.log(`监控路径: ${green(paths.join(', '))}`);
    console.log(`日志级别: ${green(ProxyLogLevel[logConfig.level])}`);
    const filters =
      allowedOperations === 'all' ? '无' : green(Array.from(allowedOperations).join(', '));
    console.log(`操作过滤: ${filters}`);
    console.log(`深度代理: ${green(isDeepProxy)}`);
    console.log(`${color(COLORS.magenta)}----------------------${reset}\n`);
  }
}

/**
 * 环境代理配置选项接口
 */
export interface SetEnvProxyOptions {
  /** 需要代理的全局路径列表。 @example ['process.env', 'myApp.config'] */
  paths: string[];

  /** 日志级别及格式化选项。 */
  logConfig?: Partial<Omit<LogConfig, 'showStackTrace'>> & { level?: ProxyLogLevel };

  /** 忽略的属性列表, 这些属性的任何操作都不会被记录。 @default [] */
  ignoredProperties?: (string | symbol)[];

  /**
   * 是否启用深度代理(递归代理)。
   * 如果为 `true`, 访问路径下的嵌套对象也会被监控。
   * @default true
   */
  isDeepProxy?: boolean;

  /**
   * 允许记录的代理操作类型列表。这是主要的过滤器。
   * 如果未提供或为 "all", 则仅由 `logConfig.level` 决定日志输出。
   * @default "all"
   * @example ['set', 'deleteProperty'] // 只记录设置和删除操作
   */
  allowedOperations?: ProxyOperation[] | 'all';
}

/**
 * 设置环境代理监控
 * @param options 配置选项
 * @example
 * // 监控 process.env 的 get/set, 以及 config 的所有高等级操作
 * setEnvProxy({
 *   paths: ['process.env', 'config'],
 *   logConfig: { level: ProxyLogLevel.MEDIUM },
 *   isDeepProxy: true
 * });
 *
 * // 仅监控 myAPI 的函数调用和构造器调用
 * setEnvProxy({
 *   paths: ['myAPI'],
 *   logConfig: { level: ProxyLogLevel.HIGH },
 *   allowedOperations: ['apply', 'construct'],
 *   isDeepProxy: false
 * });
 */
export function setEnvProxy(options: SetEnvProxyOptions): void {
  if (!options?.paths?.length) {
    throw new Error('setEnvProxy: options.paths 必须是一个非空数组');
  }

  const { logConfig: optLogConfig, ...restOptions } = options;

  // 合并用户配置和默认配置
  const fullLogConfig: LogConfig = {
    ...DEFAULT_LOG_CONFIG,
    ...optLogConfig,
    showStackTrace: optLogConfig?.level === ProxyLogLevel.TRACE,
  };

  // 构建完整的代理配置
  const config: ProxyConfig = {
    paths: restOptions.paths,
    logConfig: fullLogConfig,
    ignoredProperties: new Set(restOptions.ignoredProperties || []),
    isDeepProxy: restOptions.isDeepProxy ?? true, // 默认为 true
    allowedOperations:
      restOptions.allowedOperations === 'all' || !restOptions.allowedOperations
        ? 'all'
        : new Set(restOptions.allowedOperations),
  };

  new EnvironmentProxySetter(config).setProxies();
}

/** @deprecated 请直接使用 setEnvProxy。此函数为向后兼容而保留。 */
export function createEnvProxy(
  paths: string[],
  options: Partial<Omit<SetEnvProxyOptions, 'paths'>> = {}
): void {
  setEnvProxy({ paths, ...options });
}
