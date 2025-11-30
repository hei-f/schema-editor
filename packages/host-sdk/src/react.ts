/**
 * Schema Editor Host SDK - React
 * React hooks 包装
 */

import { useEffect, useRef } from 'react'
import { createSchemaEditorBridge } from './core'
import type {
  SchemaEditorConfig,
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
} from './core'

// 重新导出类型
export type { SchemaValue, PostMessageSourceConfig, PostMessageTypeConfig }
// 同时导出 SchemaEditorConfig 供需要基础类型的用户使用
export type { SchemaEditorConfig }

/** React 版本的 Schema Editor 配置 */
export interface ReactSchemaEditorConfig extends SchemaEditorConfig {
  /**
   * 是否启用桥接（默认 true）
   * 设为 false 时不创建桥接器，不监听消息
   */
  enabled?: boolean
}

/**
 * Schema Editor 插件接入 hooks（React）
 * 用于在宿主页面接入 Schema Editor 插件，通过 postMessage 接收插件请求并返回响应
 *
 * @param config - Schema Editor 配置
 *
 * @example
 * ```tsx
 * import { useSchemaEditor } from 'use-schema-editor'
 * // 或
 * import { useSchemaEditor } from 'use-schema-editor/react'
 *
 * function App() {
 *   useSchemaEditor({
 *     getSchema: (params) => dataStore[params],
 *     updateSchema: (schema, params) => {
 *       dataStore[params] = schema
 *       return true
 *     },
 *     renderPreview: (schema, containerId) => {
 *       const container = document.getElementById(containerId)
 *       if (container) {
 *         ReactDOM.render(<Preview data={schema} />, container)
 *         return () => ReactDOM.unmountComponentAtNode(container)
 *       }
 *     },
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useSchemaEditor(config: ReactSchemaEditorConfig): void {
  const { getSchema, updateSchema, renderPreview, sourceConfig, messageTypes, enabled } = config

  // 使用 ref 存储最新的配置，避免闭包陷阱
  const configRef = useRef({ getSchema, updateSchema, renderPreview })
  configRef.current = { getSchema, updateSchema, renderPreview }

  useEffect(() => {
    // enabled 明确为 false 时不创建桥接
    if (enabled === false) {
      return
    }

    // 创建代理配置，始终使用最新的 ref 值
    const proxyConfig: SchemaEditorConfig = {
      getSchema: (params) => configRef.current.getSchema(params),
      updateSchema: (schema, params) => configRef.current.updateSchema(schema, params),
      renderPreview: configRef.current.renderPreview
        ? (schema, containerId) => configRef.current.renderPreview?.(schema, containerId)
        : undefined,
      sourceConfig,
      messageTypes,
    }

    const cleanup = createSchemaEditorBridge(proxyConfig)

    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sourceConfig 和 messageTypes 变化时需要重新创建
  }, [
    enabled,
    sourceConfig?.contentSource,
    sourceConfig?.hostSource,
    messageTypes?.getSchema,
    messageTypes?.updateSchema,
    messageTypes?.checkPreview,
    messageTypes?.renderPreview,
    messageTypes?.cleanupPreview,
  ])
}
