import { App } from '@/shared/components/ContentApp'
import { PLUGIN_EVENTS } from '@/shared/constants/events'
import type { IframeConfig } from '@/shared/types'
import { MessageType, type ElementAttributes, type Message } from '@/shared/types'
import { listenChromeMessages } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import {
  initIframeBridgeListener,
  isInIframe,
  isSameOriginIframe,
  isTopFrame,
  type IframeBridgeHandlers,
} from '@/shared/utils/iframe-bridge'
import React from 'react'
import type ReactDOM from 'react-dom/client'
import { ElementMonitor } from './monitor'
import { createShadowRoot } from './shadow-dom'

/** 扩展全局类型声明 */
declare global {
  interface Window {
    __SEE_INSTANCE__?: SEEContent
    __SEE_VERSION__?: string
  }
}

/** 当前扩展版本号 */
const EXTENSION_VERSION = chrome.runtime.getManifest().version

/**
 * SEE (Schema Element Editor) Content Script 主应用类
 * 负责管理整个插件的生命周期
 */
export class SEEContent {
  private monitor!: ElementMonitor
  private reactRoot: ReactDOM.Root | null = null
  private container: HTMLDivElement | null = null
  private isActive: boolean = false
  private isInitialized: boolean = false
  private isDestroyed: boolean = false
  private iframeBridgeCleanup: (() => void) | null = null
  private iframeConfig: IframeConfig | null = null

  /** 是否为 top frame */
  private readonly isTop: boolean = isTopFrame()
  /** 是否在 iframe 内 */
  private readonly isIframe: boolean = isInIframe()
  /** 是否为同源 iframe */
  private readonly isSameOrigin: boolean = isSameOriginIframe()

  constructor() {
    // 如果已有旧实例且版本不同，先清理旧实例
    if (window.__SEE_INSTANCE__ && window.__SEE_VERSION__ !== EXTENSION_VERSION) {
      window.__SEE_INSTANCE__.destroy()
    }

    // 如果已有相同版本的实例，不重复创建
    if (window.__SEE_INSTANCE__ && window.__SEE_VERSION__ === EXTENSION_VERSION) {
      this.isDestroyed = true // 标记为无效实例
      return
    }

    // 注册当前实例
    window.__SEE_INSTANCE__ = this
    window.__SEE_VERSION__ = EXTENSION_VERSION

    this.monitor = new ElementMonitor()
    this.init()
  }

  /**
   * 销毁实例
   */
  public destroy(): void {
    if (this.isDestroyed) return
    this.isDestroyed = true

    this.stop()

    // 清理 iframe bridge 监听器
    if (this.iframeBridgeCleanup) {
      this.iframeBridgeCleanup()
      this.iframeBridgeCleanup = null
    }

    // 清理 React
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }

    // 清理容器
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = null
    }
  }

  /**
   * 初始化
   */
  private async init(): Promise<void> {
    // 加载 iframe 配置
    this.iframeConfig = await storage.getIframeConfig()

    // 检查初始激活状态
    this.isActive = await storage.getActiveState()

    // iframe 内且 iframe 功能未启用时，跳过初始化
    if (this.isIframe && !this.iframeConfig.enabled) {
      this.isDestroyed = true
      return
    }

    // iframe 内且非同源时，跳过初始化（跨域 iframe 不支持）
    if (this.isIframe && !this.isSameOrigin) {
      this.isDestroyed = true
      return
    }

    if (this.isActive) {
      this.start()
    }

    // 监听来自background的消息（用于 PING 等其他消息类型）
    listenChromeMessages((message: Message, _sender, sendResponse) => {
      return this.handleMessage(message, sendResponse)
    })

    // 监听 storage 中激活状态的变化
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (this.isDestroyed) return

      if (areaName === 'local' && changes.isActive) {
        const newValue = changes.isActive.newValue as boolean
        this.handleActiveStateChanged(newValue)
      }
    })

    // 设置元素点击回调
    this.monitor.setOnElementClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleElementClick(element, attrs)
    })

    // 设置录制模式点击回调
    this.monitor.setOnRecordingModeClick((element: HTMLElement, attrs: ElementAttributes) => {
      this.handleRecordingModeClick(element, attrs)
    })

    // 如果是 top frame 且 iframe 功能启用，初始化 iframe bridge 监听器
    if (this.isTop && this.iframeConfig.enabled) {
      this.initIframeBridge()
    }
  }

  /**
   * 初始化 iframe bridge 监听器（仅 top frame）
   */
  private initIframeBridge(): void {
    const handlers: IframeBridgeHandlers = {
      onElementHover: (payload) => {
        // 触发自定义事件，通知 React 应用渲染高亮框
        const event = new CustomEvent(PLUGIN_EVENTS.IFRAME_ELEMENT_HOVER, {
          detail: payload,
        })
        window.dispatchEvent(event)
      },
      onElementClick: (payload) => {
        // 清除高亮
        window.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.IFRAME_CLEAR_HIGHLIGHT))
        // 触发自定义事件，通知 React 应用处理 iframe 内元素点击
        const event = new CustomEvent(PLUGIN_EVENTS.IFRAME_ELEMENT_CLICK, {
          detail: payload,
        })
        window.dispatchEvent(event)
      },
      onClearHighlight: () => {
        // 触发清除 iframe 高亮事件
        window.dispatchEvent(new CustomEvent(PLUGIN_EVENTS.IFRAME_CLEAR_HIGHLIGHT))
      },
      onHighlightAllResponse: (payload) => {
        // 触发自定义事件，通知 React 应用渲染 iframe 内的高亮框
        const event = new CustomEvent(PLUGIN_EVENTS.IFRAME_HIGHLIGHT_ALL_RESPONSE, {
          detail: payload,
        })
        window.dispatchEvent(event)
      },
      onCrossOriginDetected: () => {
        // 跨域 iframe 检测到（静默处理）
      },
    }

    this.iframeBridgeCleanup = initIframeBridgeListener(handlers)
  }

  /**
   * 处理消息
   * @returns 返回 true 表示已同步响应
   */
  private handleMessage(message: Message, sendResponse?: (response: any) => void): boolean | void {
    // 已销毁的实例忽略消息
    if (this.isDestroyed) return

    switch (message.type) {
      case MessageType.ACTIVE_STATE_CHANGED:
        this.handleActiveStateChanged(message.payload?.isActive)
        break

      case MessageType.PING:
        // 响应 PING，返回当前版本号
        sendResponse?.({ status: 'ready', version: EXTENSION_VERSION })
        return true

      default:
        break
    }
  }

  /**
   * 处理激活状态变化
   */
  private handleActiveStateChanged(isActive: boolean): void {
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
    // 标记已初始化
    if (!this.isInitialized && this.isTop) {
      this.isInitialized = true
    }

    // 启动元素监听器（传入 iframe 模式标识）
    // 无需 await，让其异步加载配置，不阻塞 UI 初始化
    this.monitor.start(this.isIframe)

    // 仅 top frame 需要创建 React UI
    if (this.isTop && !this.reactRoot) {
      this.initReactUI()
    }
  }

  /**
   * 停止监听
   */
  private stop(): void {
    this.monitor.stop()

    // 卸载 React 应用
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }

    // 移除UI容器（完全清除DOM元素）
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = null
    }
  }

  /**
   * 初始化React UI
   */
  private async initReactUI(): Promise<void> {
    if (this.reactRoot) return

    const { container, root, shadowRoot } = await createShadowRoot()
    this.container = container
    this.reactRoot = root

    // 渲染React应用，传递shadowRoot引用
    this.reactRoot.render(React.createElement(App, { shadowRoot }))
  }

  /**
   * 处理元素点击
   */
  private handleElementClick(element: HTMLElement, attrs: ElementAttributes): void {
    // 触发自定义事件，通知React应用
    const event = new CustomEvent(PLUGIN_EVENTS.ELEMENT_CLICK, {
      detail: { element, attributes: attrs, isRecordingMode: false },
    })
    window.dispatchEvent(event)
  }

  /**
   * 处理录制模式下的元素点击
   */
  private handleRecordingModeClick(element: HTMLElement, attrs: ElementAttributes): void {
    // 触发自定义事件，通知React应用以录制模式打开
    const event = new CustomEvent(PLUGIN_EVENTS.ELEMENT_CLICK, {
      detail: { element, attributes: attrs, isRecordingMode: true },
    })
    window.dispatchEvent(event)
  }
}
