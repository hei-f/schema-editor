/**
 * Schema Editor Host SDK - Vue
 * Vue 3 Composition API 包装
 */

import { onMounted, onUnmounted, watch, toValue, type MaybeRefOrGetter } from 'vue'
import { createSchemaEditorBridge } from './core'
import type {
  SchemaEditorConfig,
  SchemaValue,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
} from './core'

// 重新导出类型
export type { SchemaEditorConfig, SchemaValue, PostMessageSourceConfig, PostMessageTypeConfig }

/**
 * Vue 版本的 Schema Editor 配置
 * 支持响应式值（ref/reactive/getter）
 */
export interface VueSchemaEditorConfig {
  /**
   * 获取 Schema 数据
   */
  getSchema: MaybeRefOrGetter<(params: string) => SchemaValue>

  /**
   * 更新 Schema 数据
   */
  updateSchema: MaybeRefOrGetter<(schema: SchemaValue, params: string) => boolean>

  /**
   * 渲染预览（可选）
   */
  renderPreview?: MaybeRefOrGetter<
    ((schema: SchemaValue, containerId: string) => (() => void) | void) | undefined
  >

  /**
   * 是否启用桥接（默认 true）
   * 设为 false 时不创建桥接器，不监听消息
   * 支持响应式值
   */
  enabled?: MaybeRefOrGetter<boolean>

  /** 消息标识配置（可选，有默认值） */
  sourceConfig?: Partial<PostMessageSourceConfig>

  /** 消息类型配置（可选，有默认值） */
  messageTypes?: Partial<PostMessageTypeConfig>
}

/**
 * Schema Editor 插件接入 composable（Vue 3）
 * 用于在宿主页面接入 Schema Editor 插件，通过 postMessage 接收插件请求并返回响应
 *
 * @param config - Schema Editor 配置（支持响应式值）
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSchemaEditor } from 'use-schema-editor/vue'
 * import { ref } from 'vue'
 *
 * const dataStore = ref({})
 *
 * useSchemaEditor({
 *   getSchema: (params) => dataStore.value[params],
 *   updateSchema: (schema, params) => {
 *     dataStore.value[params] = schema
 *     return true
 *   },
 * })
 * </script>
 * ```
 */
export function useSchemaEditor(config: VueSchemaEditorConfig): void {
  const { getSchema, updateSchema, renderPreview, sourceConfig, messageTypes, enabled } = config

  let cleanup: (() => void) | null = null

  const destroyBridge = () => {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  }

  const createBridge = () => {
    // 清理之前的桥接
    destroyBridge()

    // enabled 明确为 false 时不创建桥接
    if (toValue(enabled) === false) {
      return
    }

    // 创建代理配置，始终使用最新的值
    const proxyConfig: SchemaEditorConfig = {
      getSchema: (params) => toValue(getSchema)(params),
      updateSchema: (schema, params) => toValue(updateSchema)(schema, params),
      renderPreview: toValue(renderPreview)
        ? (schema, containerId) => toValue(renderPreview)?.(schema, containerId)
        : undefined,
      sourceConfig,
      messageTypes,
    }

    cleanup = createSchemaEditorBridge(proxyConfig)
  }

  onMounted(() => {
    createBridge()
  })

  onUnmounted(() => {
    destroyBridge()
  })

  // 监听配置变化，重新创建桥接
  watch(
    () => [
      toValue(enabled),
      sourceConfig?.contentSource,
      sourceConfig?.hostSource,
      messageTypes?.getSchema,
      messageTypes?.updateSchema,
      messageTypes?.checkPreview,
      messageTypes?.renderPreview,
      messageTypes?.cleanupPreview,
    ],
    () => {
      createBridge()
    },
    { deep: true }
  )
}
