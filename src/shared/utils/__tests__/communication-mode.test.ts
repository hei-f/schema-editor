import { getCommunicationMode } from '../communication-mode'
import { COMMUNICATION_MODE } from '@/shared/constants/ui-modes'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'

describe('communication-mode', () => {
  describe('getCommunicationMode', () => {
    it('没有配置时应该返回默认通信模式', () => {
      const result = getCommunicationMode()

      expect(result.communicationMode).toBe(DEFAULT_VALUES.apiConfig.communicationMode)
    })

    it('配置为 undefined 时应该返回默认通信模式', () => {
      const result = getCommunicationMode(undefined)

      expect(result.communicationMode).toBe(DEFAULT_VALUES.apiConfig.communicationMode)
    })

    it('配置为 postMessage 模式时应该正确识别', () => {
      const result = getCommunicationMode({
        communicationMode: COMMUNICATION_MODE.POST_MESSAGE,
      })

      expect(result.communicationMode).toBe(COMMUNICATION_MODE.POST_MESSAGE)
      expect(result.isPostMessageMode).toBe(true)
      expect(result.isWindowFunctionMode).toBe(false)
    })

    it('配置为 windowFunction 模式时应该正确识别', () => {
      const result = getCommunicationMode({
        communicationMode: COMMUNICATION_MODE.WINDOW_FUNCTION,
      })

      expect(result.communicationMode).toBe(COMMUNICATION_MODE.WINDOW_FUNCTION)
      expect(result.isPostMessageMode).toBe(false)
      expect(result.isWindowFunctionMode).toBe(true)
    })

    it('配置对象中 communicationMode 为 undefined 时应该使用默认值', () => {
      const result = getCommunicationMode({
        communicationMode: undefined,
      })

      expect(result.communicationMode).toBe(DEFAULT_VALUES.apiConfig.communicationMode)
    })

    it('返回的结果结构应该正确', () => {
      const result = getCommunicationMode()

      expect(result).toHaveProperty('communicationMode')
      expect(result).toHaveProperty('isPostMessageMode')
      expect(result).toHaveProperty('isWindowFunctionMode')
      expect(typeof result.communicationMode).toBe('string')
      expect(typeof result.isPostMessageMode).toBe('boolean')
      expect(typeof result.isWindowFunctionMode).toBe('boolean')
    })

    it('isPostMessageMode 和 isWindowFunctionMode 应该互斥', () => {
      const postMessageResult = getCommunicationMode({
        communicationMode: COMMUNICATION_MODE.POST_MESSAGE,
      })
      expect(postMessageResult.isPostMessageMode).toBe(true)
      expect(postMessageResult.isWindowFunctionMode).toBe(false)

      const windowFunctionResult = getCommunicationMode({
        communicationMode: COMMUNICATION_MODE.WINDOW_FUNCTION,
      })
      expect(windowFunctionResult.isPostMessageMode).toBe(false)
      expect(windowFunctionResult.isWindowFunctionMode).toBe(true)
    })
  })
})
