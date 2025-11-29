import { COMMUNICATION_MODE } from '@/shared/constants/ui-modes'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import type { ApiConfig, CommunicationMode } from '@/shared/types'

interface CommunicationModeResult {
  /** 当前通信模式 */
  communicationMode: CommunicationMode
  /** 是否为 postMessage 模式 */
  isPostMessageMode: boolean
  /** 是否为 windowFunction 模式 */
  isWindowFunctionMode: boolean
}

/**
 * 获取通信模式信息
 * 纯函数，可在 React 组件和非 React 代码中使用
 */
export const getCommunicationMode = (apiConfig?: ApiConfig): CommunicationModeResult => {
  const communicationMode =
    apiConfig?.communicationMode ?? DEFAULT_VALUES.apiConfig.communicationMode

  return {
    communicationMode,
    isPostMessageMode: communicationMode === COMMUNICATION_MODE.POST_MESSAGE,
    isWindowFunctionMode: communicationMode === COMMUNICATION_MODE.WINDOW_FUNCTION,
  }
}
