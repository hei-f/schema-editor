import type { RecordingDataFetchMode } from '@/shared/types'

/**
 * 录制数据获取模式常量
 */
export const RECORDING_DATA_FETCH_MODE = {
  /** 事件驱动模式：宿主通过 pushSchema 主动推送数据 */
  EVENT_DRIVEN: 'eventDriven' as RecordingDataFetchMode,
  /** 轮询模式：插件定期调用 getSchema 获取数据 */
  POLLING: 'polling' as RecordingDataFetchMode,
} as const
