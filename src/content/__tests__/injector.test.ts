import { storage } from '@/utils/browser/storage'
import { injectPageScript, syncConfigToInjectedScript } from '../core/injector'

// Mock dependencies
jest.mock('@/utils/browser/storage', () => ({
  storage: {
    getGetFunctionName: jest.fn(),
    getUpdateFunctionName: jest.fn()
  }
}))

jest.mock('@/utils/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}))

describe('Injector 测试', () => {
  let mockScript: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock chrome.runtime.getURL
    global.chrome = {
      runtime: {
        getURL: jest.fn((path: string) => `chrome-extension://test/${path}`)
      }
    } as any

    // Mock document.createElement
    mockScript = {
      src: '',
      onload: null as any,
      onerror: null as any,
      remove: jest.fn()
    }
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockScript as any)
    jest.spyOn(document.head, 'appendChild').mockImplementation(() => mockScript)
    
    // Mock window.postMessage
    jest.spyOn(window, 'postMessage').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete (window as any).__SCHEMA_EDITOR_INJECTED__
  })

  describe('injectPageScript', () => {
    it('应该创建并注入脚本元素', () => {
      injectPageScript()
      
      expect(document.createElement).toHaveBeenCalledWith('script')
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('injected.js')
      expect(mockScript.src).toBe('chrome-extension://test/injected.js')
      expect(document.head.appendChild).toHaveBeenCalledWith(mockScript)
    })

    it('应该在脚本加载成功后同步配置', async () => {
      ;(storage.getGetFunctionName as jest.Mock).mockResolvedValue('__getContentById')
      ;(storage.getUpdateFunctionName as jest.Mock).mockResolvedValue('__updateContentById')
      
      injectPageScript()
      
      // 触发 onload
      await mockScript.onload()
      
      expect(mockScript.remove).toHaveBeenCalled()
      expect(storage.getGetFunctionName).toHaveBeenCalled()
      expect(storage.getUpdateFunctionName).toHaveBeenCalled()
      expect(window.postMessage).toHaveBeenCalled()
    })

    it('应该跳过重复注入', async () => {
      ;(window as any).__SCHEMA_EDITOR_INJECTED__ = true
      ;(storage.getGetFunctionName as jest.Mock).mockResolvedValue('__getContentById')
      ;(storage.getUpdateFunctionName as jest.Mock).mockResolvedValue('__updateContentById')
      
      injectPageScript()
      
      // 等待异步配置同步完成
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(document.createElement).not.toHaveBeenCalled()
      expect(window.postMessage).toHaveBeenCalled() // 仍然同步配置
    })
  })

  describe('syncConfigToInjectedScript', () => {
    it('应该发送配置消息', async () => {
      ;(storage.getGetFunctionName as jest.Mock).mockResolvedValue('customGet')
      ;(storage.getUpdateFunctionName as jest.Mock).mockResolvedValue('customUpdate')
      
      await syncConfigToInjectedScript()
      
      expect(window.postMessage).toHaveBeenCalledWith(
        {
          source: 'schema-editor-content',
          type: 'CONFIG_SYNC',
          payload: {
            getFunctionName: 'customGet',
            updateFunctionName: 'customUpdate'
          }
        },
        '*'
      )
    })

    it('应该处理获取配置失败的情况', async () => {
      ;(storage.getGetFunctionName as jest.Mock).mockRejectedValue(new Error('Storage error'))
      
      await syncConfigToInjectedScript()
      
      // 不应该抛出错误
      expect(window.postMessage).not.toHaveBeenCalled()
    })
  })
})

