import { lazy } from 'react'

/**
 * BuiltinPreview 的懒加载版本
 * 只在需要使用内置预览器时才动态加载
 *
 * 加载时机：
 * - 没有配置预览方法（!hasPreviewFunction）
 * - 开启了内置预览器配置（previewConfig.enableBuiltinPreview）
 * - 内容类型支持（AST 或 RawString）
 * - 预览已打开（previewEnabled）
 */
export const BuiltinPreview = lazy(() =>
  import('./BuiltinPreview').then((module) => ({
    default: module.BuiltinPreview,
  }))
)
