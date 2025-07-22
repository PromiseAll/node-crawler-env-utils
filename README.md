# 增强版爬虫环境代理监控工具

基于Proxy实现的环境代理监控工具，支持完整的对象操作拦截、美化日志输出和高度可配置化。

## ✨ 新特性

### 🎯 1. 拦截更多Proxy操作
- **全面拦截**: 支持12种Proxy操作类型
  - `get`, `set`, `has`, `deleteProperty`
  - `ownKeys`, `getOwnPropertyDescriptor`, `defineProperty`
  - `preventExtensions`, `getPrototypeOf`, `setPrototypeOf`
  - `apply`, `construct`

### 🔧 2. 重构参数结构
- **模块化设计**: 拆分多个内部类，但只导出一个主函数
- **清晰的配置结构**: 使用接口定义配置参数
- **减少耦合**: 日志、代理、格式化器完全解耦

### 📊 3. 可配置日志输出
- **5级日志级别**: ERROR, WARN, INFO, DEBUG, TRACE
- **灵活配置**: 颜色、时间格式、深度、堆栈跟踪等
- **自定义格式化**: 支持自定义日志格式函数

### 🎨 4. 美化日志输出
- **彩色输出**: ANSI颜色代码美化终端显示
- **详细信息**: 显示操作类型、路径、值、类型等
- **智能截断**: 避免过长输出，智能显示对象结构

## 📦 安装

```bash
npm install crawler-env-utils
# 或
yarn add crawler-env-utils
```

## 🚀 快速开始

### 基本用法

```typescript
import { setEnvProxy } from 'crawler-env-utils';

// 基本配置
setEnvProxy({
  paths: ['window.navigator', 'document', 'location']
});
```

### 高级配置

```typescript
import { setEnvProxy, LogLevel } from 'crawler-env-utils';

setEnvProxy({
  paths: ['window.navigator', 'document', 'screen'],
  logConfig: {
    level: LogLevel.DEBUG,
    enableColors: true,
    timestampFormat: 'iso',
    maxDepth: 3,
    showStackTrace: true
  },
  ignoredProperties: ['constructor', '__proto__'],
  deepProxyPaths: ['window.navigator'],
  enableApply: true,
  enableConstruct: true
});
```

## 📋 API 文档

### setEnvProxy(options: SetEnvProxyOptions)

#### SetEnvProxyOptions

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `paths` | `string[]` | `[]` | 需要代理的路径数组 |
| `logConfig` | `Partial<LogConfig>` | `{}` | 日志配置选项 |
| `ignoredProperties` | `(string \| symbol)[]` | `[]` | 需要忽略的属性 |
| `deepProxyPaths` | `string[]` | `[]` | 需要深度代理的路径 |
| `enableApply` | `boolean` | `true` | 是否启用函数调用拦截 |
| `enableConstruct` | `boolean` | `true` | 是否启用构造函数调用拦截 |
| `enablePropertyDescriptor` | `boolean` | `false` | 是否启用属性描述符操作拦截 |

#### LogConfig

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `level` | `LogLevel` | `LogLevel.INFO` | 日志级别 |
| `enableColors` | `boolean` | `true` | 是否启用彩色输出 |
| `timestampFormat` | `'iso' \| 'time' \| 'none'` | `'time'` | 时间戳格式 |
| `maxDepth` | `number` | `3` | 对象显示深度 |
| `showStackTrace` | `boolean` | `false` | 是否显示调用栈 |
| `customFormatter` | `(log: LogEntry) => string` | `undefined` | 自定义日志格式化函数 |

#### LogLevel 枚举

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}
```

## 🎨 日志输出示例

### 彩色输出示例
```
[10:30:45] [GET] window.navigator.userAgent = "Mozilla/5.0..."
[10:30:45] [SET] window.navigator.newProp: undefined → "new value"
[10:30:45] [HAS] document.cookie = true
[10:30:45] [DELETE] window.tempProperty DELETED
```

### 自定义格式示例
```typescript
setEnvProxy({
  paths: ['test'],
  logConfig: {
    customFormatter: (log) => {
      return `[${log.operation}] ${log.path} -> ${String(log.property || '')}`;
    }
  }
});
```

## 🔍 使用场景

### 1. 逆向分析
```typescript
// 监控浏览器环境
setEnvProxy({
  paths: ['window.navigator', 'window.screen', 'document'],
  logConfig: { level: LogLevel.TRACE }
});
```

### 2. 调试测试
```typescript
// 调试特定对象
setEnvProxy({
  paths: ['myTestObject'],
  logConfig: {
    level: LogLevel.DEBUG,
    showStackTrace: true,
    maxDepth: 2
  },
  deepProxyPaths: ['myTestObject']
});
```

### 3. 性能监控
```typescript
// 只监控重要操作
setEnvProxy({
  paths: ['performance', 'console'],
  logConfig: { level: LogLevel.WARN }
});
```

## 📁 项目结构

```
src/
├── hook/
│   ├── proxy-new.ts          # 主实现文件
│   ├── proxy-usage-example.ts # 使用示例
│   └── 参考.js               # 原始参考文件
├── package.json              # 项目配置
└── README.md                 # 本文档
```

## 🛠️ 开发

### 运行示例
```bash
npm run example
# 或
npm run dev
```

### 构建
```bash
npm run build
```

### 测试
```bash
npm test
```

## 🔄 向后兼容

为了向后兼容，保留了旧的API接口：

```typescript
// 旧接口（仍然可用）
import { createEnvProxy } from 'crawler-env-utils';
createEnvProxy(['window', 'document']);
```

## 📝 注意事项

1. **性能影响**: 深度代理和TRACE级别日志可能影响性能
2. **内存使用**: 使用WeakMap缓存代理对象，避免内存泄漏
3. **循环引用**: 自动处理对象循环引用
4. **类型安全**: 完整的TypeScript类型支持

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

ISC License
