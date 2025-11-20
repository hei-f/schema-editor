import { MessageType } from '@/types'
import { listenChromeMessages } from '@/utils/browser/message'
import { configureMonaco } from '@/utils/browser/monaco'
import { storage } from '@/utils/browser/storage'
import { SchemaEditorContent } from '../core/content-app'
import * as injector from '../core/injector'
import { ElementMonitor } from '../core/monitor'
import * as shadowDom from '../core/shadow-dom'

// Mock dependencies
jest.mock('@/utils/browser/storage')
jest.mock('@/utils/browser/message')
jest.mock('@/utils/browser/monaco')
jest.mock('@/utils/logger')
jest.mock('../core/injector')
jest.mock('../core/monitor')
jest.mock('../core/shadow-dom')
jest.mock('../ui/App', () => ({
  App: () => null
}))

describe('SchemaEditorContent 测试', () => {
  let mockMonitor: any
  let mockListenCallback: any
  let mockOnElementClick: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock ElementMonitor
    mockOnElementClick = null
    mockMonitor = {
      start: jest.fn(),
      stop: jest.fn(),
      setOnElementClick: jest.fn((callback: any) => {
        mockOnElementClick = callback
      })
    }
    ;(ElementMonitor as jest.Mock).mockImplementation(() => mockMonitor)

    // Mock storage
    ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)

    // Mock listenChromeMessages
    ;(listenChromeMessages as jest.Mock).mockImplementation((callback: any) => {
      mockListenCallback = callback
      return jest.fn() // cleanup function
    })

    // Mock configureMonaco
    ;(configureMonaco as jest.Mock).mockReturnValue(true)

    // Mock injector
    ;(injector.injectPageScript as jest.Mock).mockImplementation(() => {})

    // Mock shadow-dom
    const mockRoot = {
      render: jest.fn()
    }
    const mockContainer = document.createElement('div')
    ;(shadowDom.createShadowRoot as jest.Mock).mockReturnValue({
      root: mockRoot,
      container: mockContainer
    })

    // Mock window.dispatchEvent
    jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('初始化', () => {
    it('应该创建 ElementMonitor 实例', () => {
      new SchemaEditorContent()
      
      expect(ElementMonitor).toHaveBeenCalled()
    })

    it('当初始状态为非激活时不应启动', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.start).not.toHaveBeenCalled()
    })

    it('当初始状态为激活时应自动启动', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(true)
      
      new SchemaEditorContent()
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.start).toHaveBeenCalled()
    })

    it('应该监听Chrome消息', async () => {
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(listenChromeMessages).toHaveBeenCalled()
    })

    it('应该设置元素点击回调', async () => {
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.setOnElementClick).toHaveBeenCalled()
    })
  })

  describe('激活状态变化', () => {
    it('应该处理激活消息', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 发送激活消息
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.start).toHaveBeenCalled()
    })

    it('应该处理停用消息', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(true)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 发送停用消息
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: false }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.stop).toHaveBeenCalled()
    })
  })

  describe('首次激活初始化', () => {
    it('首次激活时应配置Monaco', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(configureMonaco).toHaveBeenCalled()
    })

    it('首次激活时应注入页面脚本', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(injector.injectPageScript).toHaveBeenCalled()
    })

    it('首次激活时应创建React UI', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(shadowDom.createShadowRoot).toHaveBeenCalled()
    })

    it('第二次激活不应重复初始化', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 第一次激活
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      await new Promise(resolve => setTimeout(resolve, 0))
      
      jest.clearAllMocks()
      
      // 停用
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: false }
      })
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 第二次激活
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: true }
      })
      await new Promise(resolve => setTimeout(resolve, 0))
      
      // 不应该再次调用初始化函数
      expect(configureMonaco).not.toHaveBeenCalled()
      expect(injector.injectPageScript).not.toHaveBeenCalled()
    })
  })

  describe('元素点击处理', () => {
    it('应该触发自定义事件', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(false)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      const mockElement = document.createElement('div')
      const mockAttributes = { params: ['test1', 'test2'] }
      
      // 触发元素点击回调
      mockOnElementClick(mockElement, mockAttributes)
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'schema-editor:element-click',
          detail: {
            element: mockElement,
            attributes: mockAttributes
          }
        })
      )
    })
  })

  describe('停止功能', () => {
    it('停止时应停止monitor', async () => {
      ;(storage.getActiveState as jest.Mock).mockResolvedValue(true)
      
      new SchemaEditorContent()
      await new Promise(resolve => setTimeout(resolve, 0))
      
      mockListenCallback({
        type: MessageType.ACTIVE_STATE_CHANGED,
        payload: { isActive: false }
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      expect(mockMonitor.stop).toHaveBeenCalled()
    })
  })
})

