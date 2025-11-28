import { SchemaDrawer } from '@/features/schema-drawer'
import { shadowDomTheme } from '@/shared/constants/theme'
import type { ApiConfig, CommunicationMode, ElementAttributes, Message, SchemaResponsePayload, UpdateResultPayload } from '@/shared/types'
import { MessageType } from '@/shared/types'
import { initHostMessageListener, listenPageMessages, postMessageToPage, sendRequestToHost } from '@/shared/utils/browser/message'
import { storage } from '@/shared/utils/browser/storage'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { App as AntdApp, ConfigProvider, message as antdMessage } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheetManager } from 'styled-components'

interface AppProps {
  shadowRoot: ShadowRoot
}

/**
 * Schema Editor主应用
 */
export const App: React.FC<AppProps> = ({ shadowRoot }) => {
  // 初始化 shadowRoot 全局管理器
  shadowRootManager.init(shadowRoot)
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [schemaData, setSchemaData] = useState<any>(null)
  const [currentAttributes, setCurrentAttributes] = useState<ElementAttributes>({ params: [] })
  const [drawerWidth, setDrawerWidth] = useState<string | number>('800px')
  const [isRecordingMode, setIsRecordingMode] = useState(false)
  
  /** API 配置 */
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  const configSyncedRef = useRef(false)

  /**
   * 获取当前通信模式
   */
  const getCommunicationMode = useCallback((): CommunicationMode => {
    return apiConfig?.communicationMode ?? 'postMessage'
  }, [apiConfig])

  /**
   * 同步配置到注入脚本（仅 windowFunction 模式需要）
   */
  const syncConfigToInjected = useCallback(async () => {
    if (configSyncedRef.current) return
    if (getCommunicationMode() !== 'windowFunction') return
    
    const [getFunctionName, updateFunctionName, previewFunctionName] = await Promise.all([
      storage.getGetFunctionName(),
      storage.getUpdateFunctionName(),
      storage.getPreviewFunctionName()
    ])
    
    postMessageToPage({
      type: MessageType.CONFIG_SYNC,
      payload: {
        getFunctionName,
        updateFunctionName,
        previewFunctionName
      }
    })
    
    configSyncedRef.current = true
  }, [getCommunicationMode])

  /**
   * 初始化：加载配置
   */
  useEffect(() => {
    const loadConfig = async () => {
      const [width, config] = await Promise.all([
        storage.getDrawerWidth(),
        storage.getApiConfig()
      ])
      setDrawerWidth(width)
      setApiConfig(config)
    }
    loadConfig()
    storage.cleanExpiredDrafts()
  }, [])

  /**
   * API 配置加载后，初始化通信
   */
  useEffect(() => {
    if (!apiConfig) return
    
    // windowFunction 模式：同步配置到 injected.js
    if (apiConfig.communicationMode === 'windowFunction') {
      syncConfigToInjected()
    }
  }, [apiConfig, syncConfigToInjected])

  /**
   * 初始化宿主消息监听器（postMessage 模式）
   */
  useEffect(() => {
    if (!apiConfig || apiConfig.communicationMode !== 'postMessage') return
    
    const cleanup = initHostMessageListener()
    return cleanup
  }, [apiConfig])

  /**
   * 监听来自 injected script 的消息（windowFunction 模式）
   */
  useEffect(() => {
    if (!apiConfig || apiConfig.communicationMode !== 'windowFunction') return

    const cleanup = listenPageMessages((msg: Message) => {
      switch (msg.type) {
        case MessageType.SCHEMA_RESPONSE:
          handleSchemaResponse(msg.payload as SchemaResponsePayload)
          break

        case MessageType.UPDATE_RESULT:
          handleUpdateResult(msg.payload as UpdateResultPayload)
          break

        default:
          break
      }
    })

    return cleanup
  }, [apiConfig])

  /**
   * 请求获取 Schema
   */
  const requestSchema = useCallback(async (attributes: ElementAttributes) => {
    const params = attributes.params.join(',')
    
    if (getCommunicationMode() === 'postMessage') {
      // postMessage 直连模式
      try {
        const response = await sendRequestToHost<SchemaResponsePayload>(
          'GET_SCHEMA',
          { params },
          apiConfig?.requestTimeout ?? 5
        )
        handleSchemaResponse({
          success: response.success !== false,
          data: response.data,
          error: response.error
        })
      } catch (error: any) {
        antdMessage.error(error.message || '获取Schema失败')
      }
    } else {
      // windowFunction 模式：通过 injected.js
      postMessageToPage({
        type: MessageType.GET_SCHEMA,
        payload: { params }
      })
    }
  }, [apiConfig, getCommunicationMode])

  /**
   * 监听来自 monitor 的元素点击事件
   */
  useEffect(() => {
    const handleElementClick = (event: Event) => {
      const customEvent = event as CustomEvent
      const { attributes, isRecordingMode: recordingMode } = customEvent.detail

      setCurrentAttributes(attributes)
      setIsRecordingMode(recordingMode || false)
      requestSchema(attributes)
    }

    window.addEventListener('schema-editor:element-click', handleElementClick)

    return () => {
      window.removeEventListener('schema-editor:element-click', handleElementClick)
    }
  }, [requestSchema])

  /**
   * 处理 Schema 响应
   */
  const handleSchemaResponse = (payload: SchemaResponsePayload) => {
    if (payload.success && payload.data !== undefined) {
      setSchemaData(payload.data)
      setDrawerOpen(true)
    } else {
      antdMessage.error(payload.error || '获取Schema失败')
    }
  }

  /**
   * 处理保存操作
   */
  const handleSave = useCallback(async (data: any) => {
    const params = currentAttributes.params.join(',')
    
    if (getCommunicationMode() === 'postMessage') {
      // postMessage 直连模式
      const response = await sendRequestToHost<UpdateResultPayload>(
        'UPDATE_SCHEMA',
        { schema: data, params },
        apiConfig?.requestTimeout ?? 5
      )
      
      if (response.success === false) {
        throw new Error(response.error || '更新失败')
      }
    } else {
      // windowFunction 模式：通过 injected.js
      return new Promise<void>((resolve, reject) => {
        postMessageToPage({
          type: MessageType.UPDATE_SCHEMA,
          payload: { schema: data, params }
        })

        const timeout = setTimeout(() => {
          reject(new Error('更新超时'))
        }, 10000)

        const cleanup = listenPageMessages((msg: Message) => {
          if (msg.type === MessageType.UPDATE_RESULT) {
            clearTimeout(timeout)
            cleanup()
            const result = msg.payload as UpdateResultPayload
            if (result.success === false) {
              reject(new Error(result.error || '更新失败'))
            } else {
              resolve()
            }
          }
        })
      })
    }
  }, [currentAttributes, apiConfig, getCommunicationMode])

  /**
   * 处理更新结果（windowFunction 模式）
   */
  const handleUpdateResult = (payload: UpdateResultPayload) => {
    if (!payload.success) {
      antdMessage.error(payload.error || '更新失败')
    }
  }

  /**
   * 关闭抽屉
   */
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    setIsRecordingMode(false)
    
    // 抽屉关闭时，触发清除高亮的事件
    window.dispatchEvent(new CustomEvent('schema-editor:clear-highlight'))
  }

  return (
    <StyleSheetManager target={shadowRoot as unknown as HTMLElement}>
      <ConfigProvider
        locale={zhCN}
        theme={shadowDomTheme}
        getPopupContainer={() => shadowRoot as unknown as HTMLElement}
      >
        <AntdApp>
          <SchemaDrawer
            open={drawerOpen}
            schemaData={schemaData}
            attributes={currentAttributes}
            onClose={handleCloseDrawer}
            onSave={handleSave}
            width={drawerWidth}
            isRecordingMode={isRecordingMode}
            apiConfig={apiConfig}
          />
        </AntdApp>
      </ConfigProvider>
    </StyleSheetManager>
  )
}

