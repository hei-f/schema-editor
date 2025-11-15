import { MessageType, type ElementAttributes, type Message } from '@/types'
import { listenChromeMessages } from '@/utils/message'
import { storage } from '@/utils/storage'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ElementMonitor } from './monitor'
import { App } from './ui/App'

console.log('Schema Editor Content Script已加载')

/**
 * 注入页面脚本
 * 使用chrome.runtime.getURL加载独立的脚本文件
 */
function injectPageScript(): void {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('injected.js')
  script.onload = () => {
    console.log('✅ Injected script已成功注入')
    script.remove()
  }
  script.onerror = (error) => {
    console.error('❌ Injected script注入失败:', error)
  }
  ;(document.head || document.documentElement).appendChild(script)
}

/**
 * 创建Shadow DOM容器并挂载React应用
 */
function createShadowRoot(): { container: HTMLDivElement; root: ReactDOM.Root } {
  // 创建容器
  const container = document.createElement('div')
  container.id = 'schema-editor-root'
  container.setAttribute('data-schema-editor-ui', 'true')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483646;
    pointer-events: none;
  `
  document.body.appendChild(container)

  // 创建Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 创建样式容器
  const styleContainer = document.createElement('div')
  styleContainer.style.cssText = `
    pointer-events: auto;
  `
  shadowRoot.appendChild(styleContainer)

  // 注入Ant Design样式
  const antdStyle = document.createElement('link')
  antdStyle.rel = 'stylesheet'
  antdStyle.href = 'https://cdn.jsdelivr.net/npm/antd@5.12.0/dist/reset.css'
  shadowRoot.appendChild(antdStyle)

  // 创建React根容器
  const reactContainer = document.createElement('div')
  reactContainer.id = 'react-root'
  styleContainer.appendChild(reactContainer)

  // 创建React Root
  const root = ReactDOM.createRoot(reactContainer)

  return { container, root }
}

/**
 * 主逻辑
 */
class SchemaEditorContent {
  private monitor: ElementMonitor
  private reactRoot: ReactDOM.Root | null = null
  private isActive: boolean = false

  constructor() {
    this.monitor = new ElementMonitor()
    this.init()
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    // 注入页面脚本
    injectPageScript()

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

    console.log('Schema Editor Content初始化完成, 激活状态:', this.isActive)
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
    console.log('激活状态变化:', isActive)
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
    console.log('启动Schema Editor')
    
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
    console.log('停止Schema Editor')
    this.monitor.stop()
  }

  /**
   * 初始化React UI
   */
  private initReactUI(): void {
    if (this.reactRoot) return

    const { root } = createShadowRoot()
    this.reactRoot = root

    // 渲染React应用
    this.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )

    console.log('React UI已初始化')
  }

  /**
   * 处理元素点击
   */
  private handleElementClick(element: HTMLElement, attrs: ElementAttributes): void {
    console.log('元素点击事件:', element, attrs)

    // 触发自定义事件，通知React应用
    const event = new CustomEvent('schema-editor:element-click', {
      detail: { element, attributes: attrs }
    })
    window.dispatchEvent(event)
  }
}

// 启动Content Script
new SchemaEditorContent()

