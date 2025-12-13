# SDK 使用指南

`@schema-element-editor/host-sdk` 是 Schema Element Editor 的官方宿主端 SDK，提供便捷的 postMessage 通信封装。

## 安装

```bash
npm install @schema-element-editor/host-sdk
```

支持的框架：

- React（内置 hooks）
- Vue（内置 composable）
- 纯 JavaScript / 其他框架

## React 项目

### 基本用法

```tsx
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'

function App() {
  // 数据存储（示例）
  const [dataStore, setDataStore] = useState<Record<string, any>>({
    'message-1': { type: 'paragraph', children: [{ text: 'Hello' }] },
  })

  useSchemaElementEditor({
    // 获取 Schema（必需）
    getSchema: (params) => dataStore[params],

    // 更新 Schema（必需）
    updateSchema: (schema, params) => {
      setDataStore((prev) => ({ ...prev, [params]: schema }))
      return true
    },
  })

  return <div data-id="message-1">可编辑的内容</div>
}
```

### 添加预览功能

```tsx
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import ReactDOM from 'react-dom/client'

function PreviewComponent({ data }: { data: any }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

function App() {
  useSchemaElementEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },

    // 预览函数（可选）
    renderPreview: (schema, containerId) => {
      const container = document.getElementById(containerId)
      if (!container) return

      const root = ReactDOM.createRoot(container)
      root.render(<PreviewComponent data={schema} />)

      // 返回清理函数
      return () => root.unmount()
    },
  })

  return <div>...</div>
}
```

### 条件启用

```tsx
function App() {
  const [isReady, setIsReady] = useState(false)

  useSchemaElementEditor({
    // 仅在 isReady 为 true 时启用
    enabled: isReady,
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },
  })

  useEffect(() => {
    // 某些初始化完成后启用
    initializeData().then(() => setIsReady(true))
  }, [])

  return <div>...</div>
}
```

### 录制模式数据推送

```tsx
function App() {
  const { recording } = useSchemaElementEditor({
    getSchema: (params) => dataStore[params],
    updateSchema: (schema, params) => {
      /* ... */
    },
  })

  // 数据变化时推送（SDK 内部管理录制状态）
  useEffect(() => {
    const handleSSEData = (params: string, data: any) => {
      // 更新本地数据
      dataStore[params] = data

      // 推送给插件（未录制时静默忽略）
      recording.push(params, data)
    }

    sseConnection.on('data', handleSSEData)
    return () => sseConnection.off('data', handleSSEData)
  }, [recording])

  return <div>...</div>
}
```

## Vue 项目

### 基本用法

```vue
<script setup lang="ts">
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
import { ref } from 'vue'

const dataStore = ref<Record<string, any>>({
  'message-1': { type: 'paragraph', children: [{ text: 'Hello' }] },
})

const { recording } = useSchemaElementEditor({
  getSchema: (params) => dataStore.value[params],
  updateSchema: (schema, params) => {
    dataStore.value[params] = schema
    return true
  },
})
</script>

<template>
  <div data-id="message-1">可编辑的内容</div>
</template>
```

### 条件启用

```vue
<script setup lang="ts">
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk/vue'
import { ref, computed } from 'vue'

const isReady = ref(false)

useSchemaElementEditor({
  // 支持 ref 或 computed
  enabled: isReady,
  getSchema: (params) => dataStore.value[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})

onMounted(async () => {
  await initializeData()
  isReady.value = true
})
</script>
```

## 纯 JavaScript / 其他框架

### 基本用法

```typescript
import { createSchemaElementEditorBridge } from '@schema-element-editor/host-sdk/core'

// 创建桥接器
const bridge = createSchemaElementEditorBridge({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    dataStore[params] = schema
    return true
  },
})

// 需要清理时调用
// bridge.cleanup()
```

### 录制模式

```typescript
const bridge = createSchemaElementEditorBridge({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },
})

// 数据变化时推送
sseHandler.onData = (params, data) => {
  bridge.recording.push(params, data)
}
```

## 配置选项

### 完整配置接口

```typescript
interface SchemaEditorConfig {
  /** 获取 Schema（必需） */
  getSchema: (params: string) => SchemaValue

  /** 更新 Schema（必需） */
  updateSchema: (schema: SchemaValue, params: string) => boolean

  /** 渲染预览（可选） */
  renderPreview?: (schema: SchemaValue, containerId: string) => (() => void) | void

  /** 消息标识配置（可选） */
  sourceConfig?: {
    contentSource?: string // 默认 'schema-element-editor-content'
    hostSource?: string // 默认 'schema-element-editor-host'
  }

  /** 消息类型配置（可选） */
  messageTypes?: {
    getSchema?: string // 默认 'GET_SCHEMA'
    updateSchema?: string // 默认 'UPDATE_SCHEMA'
    checkPreview?: string // 默认 'CHECK_PREVIEW'
    renderPreview?: string // 默认 'RENDER_PREVIEW'
    cleanupPreview?: string // 默认 'CLEANUP_PREVIEW'
    startRecording?: string // 默认 'START_RECORDING'
    stopRecording?: string // 默认 'STOP_RECORDING'
    schemaPush?: string // 默认 'SCHEMA_PUSH'
  }
}

// React 额外配置
interface ReactSchemaEditorConfig extends SchemaEditorConfig {
  /** 是否启用（默认 true） */
  enabled?: boolean
}
```

### 自定义消息配置

```typescript
useSchemaElementEditor({
  getSchema: (params) => dataStore[params],
  updateSchema: (schema, params) => {
    /* ... */
  },

  // 自定义消息标识（需与插件配置一致）
  sourceConfig: {
    contentSource: 'my-app-content',
    hostSource: 'my-app-host',
  },

  // 自定义消息类型（需与插件配置一致）
  messageTypes: {
    getSchema: 'MY_GET_SCHEMA',
    updateSchema: 'MY_UPDATE_SCHEMA',
    // 其他使用默认值
  },
})
```

## 返回值

### React

```typescript
interface UseSchemaEditorReturn {
  recording: {
    /** 推送 Schema 数据（未录制时静默忽略） */
    push: (params: string, data: SchemaValue) => void
  }
}

const { recording } = useSchemaElementEditor({
  /* ... */
})
```

### Vue

同 React，返回 `{ recording }` 对象。

### Core

```typescript
interface SchemaEditorBridge {
  /** 清理桥接器 */
  cleanup: () => void

  /** 录制相关方法 */
  recording: {
    push: (params: string, data: SchemaValue) => void
  }
}

const bridge = createSchemaElementEditorBridge({
  /* ... */
})
```

## iframe 场景

SDK 自动处理 iframe 场景：

- 自动检测是否在 iframe 中
- 接收来自自身和父窗口的消息
- 响应自动发送给正确的目标窗口

无需额外配置。

## TypeScript 支持

SDK 完全使用 TypeScript 编写，提供完整的类型定义。

### 导出的类型

```typescript
import type {
  SchemaValue,
  SchemaEditorConfig,
  PostMessageSourceConfig,
  PostMessageTypeConfig,
  SchemaEditorBridge,
  SchemaEditorRecording,
} from '@schema-element-editor/host-sdk'
```

## 最佳实践

### 1. 正确处理清理

React 和 Vue 版本会自动处理清理，使用 Core 版本时需要手动清理：

```typescript
const bridge = createSchemaElementEditorBridge({
  /* ... */
})

// 页面卸载时
window.addEventListener('beforeunload', () => {
  bridge.cleanup()
})
```

### 2. 预览函数的清理

如果 `renderPreview` 创建了需要清理的资源（如 React root、事件监听器等），应该返回清理函数：

```typescript
renderPreview: (schema, containerId) => {
  const container = document.getElementById(containerId)
  const root = ReactDOM.createRoot(container)
  root.render(<Preview data={schema} />)

  // 返回清理函数,SDK 会在下次渲染前或清理预览时调用
  return () => root.unmount()
}
```

如果只是简单修改 DOM 内容，可以不返回清理函数：

```typescript
renderPreview: (schema, containerId) => {
  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = `<pre>${JSON.stringify(schema, null, 2)}</pre>`
  }
  // 不需要返回清理函数
}
```

## 故障排除

### SDK 不工作

1. **检查安装**：确认 `@schema-element-editor/host-sdk` 已安装
2. **检查导入路径**：
   - React: `@schema-element-editor/host-sdk`
   - Vue: `@schema-element-editor/host-sdk/vue`
   - Core: `@schema-element-editor/host-sdk/core`
3. **检查 enabled 配置**：确认不是 `false`

### 配置与插件不匹配

如果自定义了 `sourceConfig` 或 `messageTypes`，确保与插件配置页面的设置一致。

### 录制推送不工作

1. 确认插件处于录制模式
2. 确认 `params` 与正在录制的元素匹配
3. 检查浏览器控制台是否有错误
