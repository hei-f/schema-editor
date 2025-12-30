import { MessageType, type Message } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'

/**
 * 更新图标状态显示
 */
function updateIconState(isActive: boolean) {
  // 更新图标标题
  chrome.action.setTitle({
    title: `Schema Element Editor - ${isActive ? '已激活 ✓' : '未激活'}`,
  })

  // 切换图标颜色
  const iconSuffix = isActive ? 'active' : 'inactive'
  chrome.action.setIcon({
    path: {
      16: `icons/icon-${iconSuffix}-16.png`,
      48: `icons/icon-${iconSuffix}-48.png`,
      128: `icons/icon-${iconSuffix}-128.png`,
    },
  })
}

/**
 * 监听扩展图标点击事件
 */
chrome.action.onClicked.addListener(async () => {
  // 切换激活状态
  const newState = await storage.toggleActiveState()

  // 更新图标状态
  updateIconState(newState)

  // 状态变化会通过 chrome.storage.onChanged 事件自动通知所有页面
})

/**
 * 监听来自content script的消息
 */
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: { success: boolean; isActive?: boolean; error?: string }) => void
  ) => {
    // 处理消息
    switch (message.type) {
      case MessageType.TOGGLE_ACTIVE:
        storage.toggleActiveState().then((newState) => {
          sendResponse({ success: true, isActive: newState })
        })
        return true // 保持消息通道开启

      default:
        sendResponse({ success: false, error: '未知的消息类型' })
    }

    return false
  }
)

/**
 * Service Worker启动/恢复时立即恢复图标状态
 * 解决 MV3 Service Worker 从休眠恢复后图标状态不一致的问题
 */
;(async () => {
  const isActive = await storage.getActiveState()
  updateIconState(isActive)
})()
