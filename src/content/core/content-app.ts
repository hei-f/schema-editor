import { MessageType, type ElementAttributes, type Message } from '@/types'
import { listenChromeMessages } from '@/utils/browser/message'
import { configureMonaco } from '@/utils/browser/monaco'
import { storage } from '@/utils/browser/storage'
import { logger } from '@/utils/logger'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from '../ui/App'
import { injectPageScript } from './injector'
import { ElementMonitor } from './monitor'
import { createShadowRoot } from './shadow-dom'

/**
 * Schema Editor Content Script 主应用类
 * 负责管理整个插件的生命周期
 */
export class SchemaEditorContent {
  private monitor: ElementMonitor
  private reactRoot: ReactDOM.Root | null = null
  private container: HTMLDivElement | null = null
  private isActive: boolean = false
  private isInitialized: boolean = false

  constructor() {
    this.monitor = new ElementMonitor()
    this.init()
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    // 检查初始激活状态
    this.isActive = await storage.getActiveState()
    if (this.isActive) {
      this.start()
    }

    // 监听来自background的消息
    listenChromeMessages((message: Message) => {
      this.handleMessage(message)
    })

    // 设置元素点击回调
    this.monitor.setOnElementClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleElementClick(element, attrs)
    })

    logger.log('Schema Editor Content初始化完成, 激活状态:', this.isActive)
  }

  /**
   * 处理消息
   */
  private handleMessage(message: Message): void {
    switch (message.type) {
      case MessageType.ACTIVE_STATE_CHANGED:
        this.handleActiveStateChanged(message.payload?.isActive)
        break

      default:
        break
    }
  }

  /**
   * 处理激活状态变化
   */
  private handleActiveStateChanged(isActive: boolean): void {
    logger.log('激活状态变化:', isActive)
    this.isActive = isActive

    if (isActive) {
      this.start()
    } else {
      this.stop()
    }
  }

  /**
   * 启动监听
   */
  private start(): void {
    logger.log('启动Schema Editor')
    
    // 首次激活时执行初始化
    if (!this.isInitialized) {
      // 配置Monaco Editor（必须在Shadow DOM创建之前）
      configureMonaco()
      // 注入页面脚本
      injectPageScript()
      this.isInitialized = true
    }
    
    // 启动元素监听器
    this.monitor.start()

    // 懒加载React UI（首次需要时才创建）
    if (!this.reactRoot) {
      this.initReactUI()
    }
  }

  /**
   * 停止监听
   */
  private stop(): void {
    logger.log('停止Schema Editor')
    this.monitor.stop()
    
    // 移除UI容器（完全清除DOM元素）
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      logger.log('✅ UI容器已移除')
    }
  }

  /**
   * 初始化React UI
   */
  private initReactUI(): void {
    if (this.reactRoot) return

    const { container, root } = createShadowRoot()
    this.container = container
    this.reactRoot = root

    // 渲染React应用
    this.reactRoot.render(
      React.createElement(React.StrictMode, null,
        React.createElement(App, null)
      )
    )

    logger.log('React UI已初始化')
  }

  /**
   * 处理元素点击
   */
  private handleElementClick(element: HTMLElement, attrs: ElementAttributes): void {
    logger.log('元素点击事件:', element, attrs)

    // 触发自定义事件，通知React应用
    const event = new CustomEvent('schema-editor:element-click', {
      detail: { element, attributes: attrs }
    })
    window.dispatchEvent(event)
  }
}

