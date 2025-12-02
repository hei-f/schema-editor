/// <reference types="vite/client" />

// 声明 worker 模块导入类型
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

/**
 * 发布模式标识（由 vite.config.ts 注入）
 * - true: 发布版本，隐藏调试开关
 * - false: 开发版本，显示调试开关
 */
declare const __IS_RELEASE_BUILD__: boolean
