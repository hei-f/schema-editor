import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { RECORDING_DATA_FETCH_MODE } from '@/shared/constants/recording'
import type {
  ApiConfig,
  ElementAttributes,
  RecordingDataFetchMode,
  SchemaSnapshot,
} from '@/shared/types'
import {
  listenHostPush,
  sendRequestToHost,
  type HostPushPayload,
} from '@/shared/utils/browser/message'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLatest } from '@/shared/hooks/useLatest'

interface UseSchemaRecordingOptions {
  /** 元素属性（用于获取schema的params） */
  attributes: ElementAttributes
  /** 当获取到新schema时的回调 */
  onSchemaChange?: (content: string) => void
  /** API 配置 */
  apiConfig?: ApiConfig | null
  /** 自动停止超时时间（秒），null 表示禁用 */
  autoStopTimeout?: number | null
  /** 自动停止时的回调 */
  onAutoStop?: () => void
  /** 轮询间隔（毫秒），仅在轮询模式下生效 */
  pollingInterval?: number
  /** 数据获取模式 */
  dataFetchMode?: RecordingDataFetchMode
}

interface UseSchemaRecordingReturn {
  /** 是否正在录制 */
  isRecording: boolean
  /** 录制的快照列表 */
  snapshots: SchemaSnapshot[]
  /** 当前选中的快照ID */
  selectedSnapshotId: number | null
  /** 开始录制 */
  startRecording: () => void
  /** 停止录制 */
  stopRecording: () => void
  /** 选择快照 */
  selectSnapshot: (id: number) => void
  /** 清空快照 */
  clearSnapshots: () => void
}

/**
 * Schema录制Hook
 * 支持两种模式：
 * 1. 事件驱动模式：宿主通过 SCHEMA_PUSH 主动推送数据（需要宿主接入 SDK 并调用 pushSchema）
 * 2. 轮询模式（默认）：插件定期调用 GET_SCHEMA 获取数据
 */
export function useSchemaRecording(props: UseSchemaRecordingOptions): UseSchemaRecordingReturn {
  const { attributes, onSchemaChange, apiConfig, autoStopTimeout, onAutoStop } = props

  // 录制模式配置
  const recordingDefaults = DEFAULT_VALUES.recordingModeConfig
  const pollingInterval = props.pollingInterval ?? recordingDefaults.pollingInterval
  const dataFetchMode = props.dataFetchMode ?? recordingDefaults.dataFetchMode
  const isEventDrivenMode = dataFetchMode === RECORDING_DATA_FETCH_MODE.EVENT_DRIVEN

  // 使用 useLatest 稳定回调引用
  const onSchemaChangeRef = useLatest(onSchemaChange)
  const onAutoStopRef = useLatest(onAutoStop)

  // 消息类型配置（提前计算）
  const getSchemaType =
    apiConfig?.messageTypes?.getSchema ?? DEFAULT_VALUES.apiConfig.messageTypes.getSchema
  const schemaPushType =
    apiConfig?.messageTypes?.schemaPush ?? DEFAULT_VALUES.apiConfig.messageTypes.schemaPush
  const startRecordingType =
    apiConfig?.messageTypes?.startRecording ?? DEFAULT_VALUES.apiConfig.messageTypes.startRecording
  const stopRecordingType =
    apiConfig?.messageTypes?.stopRecording ?? DEFAULT_VALUES.apiConfig.messageTypes.stopRecording
  const requestTimeout = apiConfig?.requestTimeout ?? DEFAULT_VALUES.apiConfig.requestTimeout
  const sourceConfig = apiConfig?.sourceConfig

  /** 当前 params */
  const params = attributes.params.join(',')

  // 用于卸载清理的 refs（保持最新值）
  const stopRecordingTypeRef = useLatest(stopRecordingType)
  const paramsRef = useLatest(params)
  const requestTimeoutRef = useLatest(requestTimeout)
  const sourceConfigRef = useLatest(sourceConfig)
  const isEventDrivenModeRef = useLatest(isEventDrivenMode)

  const [isRecording, setIsRecording] = useState(false)
  const [snapshots, setSnapshots] = useState<SchemaSnapshot[]>([])
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null)

  /** 录制开始时间 */
  const recordingStartTimeRef = useRef<number>(0)
  /** 上一次的schema内容（用于去重） */
  const lastContentRef = useRef<string>('')
  /** 快照ID计数器 */
  const snapshotIdRef = useRef<number>(0)
  /** 宿主推送监听清理函数 */
  const pushListenerCleanupRef = useRef<(() => void) | null>(null)
  /** 录制状态ref（避免闭包问题） */
  const isRecordingRef = useRef(false)
  /** 上次数据变化时间（用于自动停止） */
  const lastChangeTimeRef = useRef<number>(0)
  /** 自动停止定时器 */
  const autoStopTimerRef = useRef<number | null>(null)
  /** 轮询定时器（仅在轮询模式下使用） */
  const pollingTimerRef = useRef<number | null>(null)

  /**
   * 处理宿主推送的 schema 数据
   */
  const handleSchemaPush = (payload: HostPushPayload) => {
    // 只在录制中时处理响应
    if (!isRecordingRef.current) {
      return
    }

    if (!payload.success || payload.data === undefined) {
      return
    }

    // 将数据转换为可显示的字符串
    let content: string
    if (typeof payload.data === 'string') {
      content = payload.data
    } else {
      try {
        content = JSON.stringify(payload.data, null, 2)
      } catch {
        content = String(payload.data)
      }
    }

    // 去重：与上一次内容相同则跳过
    if (content === lastContentRef.current) {
      return
    }

    lastContentRef.current = content
    lastChangeTimeRef.current = Date.now()

    // 计算相对时间
    const timestamp = Date.now() - recordingStartTimeRef.current

    // 创建新快照
    const newSnapshot: SchemaSnapshot = {
      id: snapshotIdRef.current++,
      content,
      timestamp,
    }

    setSnapshots((prev) => [...prev, newSnapshot])
    setSelectedSnapshotId(newSnapshot.id)

    // 通知外部schema变化
    onSchemaChangeRef.current?.(content)
  }

  /**
   * 内部停止录制函数
   */
  const stopRecordingInternal = async (isAutoStop: boolean = false) => {
    // 清理自动停止定时器
    if (autoStopTimerRef.current !== null) {
      clearInterval(autoStopTimerRef.current)
      autoStopTimerRef.current = null
    }

    // 清理轮询定时器
    if (pollingTimerRef.current !== null) {
      clearInterval(pollingTimerRef.current)
      pollingTimerRef.current = null
    }

    // 清理宿主推送监听
    if (pushListenerCleanupRef.current) {
      pushListenerCleanupRef.current()
      pushListenerCleanupRef.current = null
    }

    // 发送停止录制指令给宿主（仅在事件驱动模式下）
    if (isRecordingRef.current && isEventDrivenMode) {
      try {
        await sendRequestToHost(stopRecordingType, { params }, requestTimeout, sourceConfig)
      } catch (error) {
        console.error('[Recording] 发送停止录制指令失败:', error)
      }
    }

    isRecordingRef.current = false
    setIsRecording(false)

    // 如果是自动停止，触发回调
    if (isAutoStop) {
      onAutoStopRef.current?.()
    }
  }

  /**
   * 轮询获取 schema 数据
   */
  const pollSchema = async () => {
    if (!isRecordingRef.current) return

    try {
      const response = await sendRequestToHost(
        getSchemaType,
        { params },
        requestTimeout,
        sourceConfig
      )

      if (response.success && response.data !== undefined) {
        handleSchemaPush({ success: true, data: response.data })
      }
    } catch (error) {
      // 轮询中的单次失败可以忽略,但在开发中打印警告有助于调试
      console.warn('[Recording] 轮询获取数据失败:', error)
    }
  }

  /**
   * 开始录制
   */
  const startRecording = async () => {
    // 使用ref判断避免闭包问题
    if (isRecordingRef.current) return

    // 重置状态
    setSnapshots([])
    setSelectedSnapshotId(null)
    lastContentRef.current = ''
    snapshotIdRef.current = 0
    recordingStartTimeRef.current = Date.now()
    lastChangeTimeRef.current = Date.now()

    // 先设置录制状态，确保 pollSchema/handleSchemaPush 能正常工作
    isRecordingRef.current = true
    setIsRecording(true)

    if (isEventDrivenMode) {
      // 事件驱动模式：先设置监听，再发送开始指令
      pushListenerCleanupRef.current = listenHostPush(
        schemaPushType,
        handleSchemaPush,
        sourceConfig
      )

      // 发送开始录制指令给宿主
      try {
        const response = await sendRequestToHost(
          startRecordingType,
          { params },
          requestTimeout,
          sourceConfig
        )

        if (!response.success) {
          console.error('[Recording] 开始录制失败:', response.error)
          // 清理监听
          if (pushListenerCleanupRef.current) {
            pushListenerCleanupRef.current()
            pushListenerCleanupRef.current = null
          }
          // 重置录制状态
          isRecordingRef.current = false
          setIsRecording(false)
          return
        }
      } catch (error) {
        console.error('[Recording] 发送开始录制指令失败:', error)
        // 清理监听
        if (pushListenerCleanupRef.current) {
          pushListenerCleanupRef.current()
          pushListenerCleanupRef.current = null
        }
        // 重置录制状态
        isRecordingRef.current = false
        setIsRecording(false)
        return
      }
    } else {
      // 轮询模式：定期调用 GET_SCHEMA
      // 立即执行一次
      pollSchema()
      // 启动定时轮询
      pollingTimerRef.current = window.setInterval(pollSchema, pollingInterval)
    }

    // 启动自动停止检测（如果配置了超时时间）
    if (autoStopTimeout != null && autoStopTimeout > 0) {
      const timeoutMs = autoStopTimeout * 1000
      autoStopTimerRef.current = window.setInterval(() => {
        const timeSinceLastChange = Date.now() - lastChangeTimeRef.current
        if (timeSinceLastChange >= timeoutMs) {
          stopRecordingInternal(true)
        }
      }, 1000)
    }
  }

  /**
   * 停止录制（手动停止）
   */
  const stopRecording = () => {
    stopRecordingInternal(false)
  }

  /**
   * 选择快照
   */
  const selectSnapshot = (id: number) => {
    const snapshot = snapshots.find((s) => s.id === id)
    if (snapshot) {
      setSelectedSnapshotId(id)
      onSchemaChangeRef.current?.(snapshot.content)
    }
  }

  /**
   * 清空快照
   */
  const clearSnapshotsImpl = () => {
    setSnapshots([])
    setSelectedSnapshotId(null)
    lastContentRef.current = ''
    snapshotIdRef.current = 0
    isRecordingRef.current = false
  }

  // 保存内部函数的最新引用
  const startRecordingRef = useLatest(startRecording)
  const stopRecordingRef = useLatest(stopRecording)
  const selectSnapshotRef = useLatest(selectSnapshot)
  const clearSnapshotsRef = useLatest(clearSnapshotsImpl)

  // 返回稳定的包装函数（refs 来自 useLatest 是稳定的，所以函数引用也稳定）
  const stableStartRecording = useCallback(() => startRecordingRef.current(), [startRecordingRef])
  const stableStopRecording = useCallback(() => stopRecordingRef.current(), [stopRecordingRef])
  const stableSelectSnapshot = useCallback(
    (id: number) => selectSnapshotRef.current(id),
    [selectSnapshotRef]
  )
  const stableClearSnapshots = useCallback(() => clearSnapshotsRef.current(), [clearSnapshotsRef])

  /**
   * 组件卸载时清理（包括通知宿主停止录制）
   */
  useEffect(() => {
    return () => {
      // 如果正在录制且使用事件驱动模式，通知宿主停止
      if (isRecordingRef.current && isEventDrivenModeRef.current) {
        // 异步发送停止消息（fire and forget，不等待响应）
        // 通过 ref 获取最新值，避免闭包捕获旧值
        sendRequestToHost(
          stopRecordingTypeRef.current,
          { params: paramsRef.current },
          requestTimeoutRef.current,
          sourceConfigRef.current
        ).catch((error) => console.error('[Recording] 卸载时发送停止录制指令失败:', error))
      }

      // 清理定时器和监听器
      if (autoStopTimerRef.current !== null) {
        clearInterval(autoStopTimerRef.current)
      }
      if (pollingTimerRef.current !== null) {
        clearInterval(pollingTimerRef.current)
      }
      if (pushListenerCleanupRef.current) {
        pushListenerCleanupRef.current()
      }
    }
  }, [])

  return {
    isRecording,
    snapshots,
    selectedSnapshotId,
    startRecording: stableStartRecording,
    stopRecording: stableStopRecording,
    selectSnapshot: stableSelectSnapshot,
    clearSnapshots: stableClearSnapshots,
  }
}
