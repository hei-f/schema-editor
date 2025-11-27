import { storage } from '@/shared/utils/browser/storage'
import { logger } from '@/shared/utils/logger'

/**
 * 注入页面脚本
 * 使用 chrome.runtime.getURL 加载独立的脚本文件
 */
export const injectPageScript = (): void => {
  // 检查是否已经注入过
  if ((window as any).__SCHEMA_EDITOR_INJECTED__) {
    // 即使已注入，也要同步配置（配置可能已更新）
    syncConfigToInjectedScript()
    return
  }
  
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('injected.js')
  script.onload = async () => {
    script.remove()
    
    await syncConfigToInjectedScript()
  }
  script.onerror = (error) => {
    logger.error('❌ Injected script注入失败:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * 同步配置到注入脚本
 */
export const syncConfigToInjectedScript = async (): Promise<void> => {
  try {
    const [getFunctionName, updateFunctionName, previewFunctionName, apiConfig] = await Promise.all([
      storage.getGetFunctionName(),
      storage.getUpdateFunctionName(),
      storage.getPreviewFunctionName(),
      storage.getApiConfig()
    ])
    
    window.postMessage(
      {
        source: 'schema-editor-content',
        type: 'CONFIG_SYNC',
        payload: {
          // @deprecated windowFunction 模式配置
          getFunctionName,
          updateFunctionName,
          previewFunctionName,
          // API 配置
          communicationMode: apiConfig.communicationMode,
          requestTimeout: apiConfig.requestTimeout,
          requestEventName: apiConfig.requestEventName,
          responseEventName: apiConfig.responseEventName
        }
      },
      '*'
    )
  } catch (error) {
    logger.error('❌ 同步配置失败:', error)
  }
}

