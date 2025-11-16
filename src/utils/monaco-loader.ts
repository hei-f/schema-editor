import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

/**
 * 配置Monaco Editor
 * 
 * 在Chrome扩展环境中：
 * - 提供最小化的 MonacoEnvironment 配置（Monaco 要求必须定义）
 * - 所有 Worker 相关错误由 MonacoErrorBoundary 拦截和处理
 * - Monaco 会自动回退到主线程模式
 */
export function configureMonaco() {
  // 检查页面是否已有 MonacoEnvironment 配置
  const existingEnv = (self as any).MonacoEnvironment
  
  if (!existingEnv) {
    // 页面没有配置，提供扩展自己的最小配置
    // Monaco 要求必须定义 getWorker 并返回 Promise
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker() {
        // 返回一个 rejected Promise，Monaco 会正确处理失败并回退到主线程
        // Promise rejection 会被 MonacoErrorBoundary 拦截
        return new Promise((_, reject) => {
          reject(new Error('Workers are disabled in extension environment'))
        })
      }
    }
    console.log('📝 Monaco Editor 已加载（页面无配置，使用扩展配置）')
  } else {
    // 页面已有配置，不覆盖，使用页面的配置
    console.log('📝 Monaco Editor 已加载（使用页面现有配置）')
  }
  
  // 使用本地加载的monaco实例
  loader.config({ monaco })
}

