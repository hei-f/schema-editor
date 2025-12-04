import React from 'react'
import { ThemeProvider } from 'styled-components'
import { DrawerContentContainer } from '../../styles/layout/drawer.styles'
import {
  DiffModeContent,
  NormalModeContent,
  PreviewModeContent,
  RecordingModeContent,
} from './modes'
import type { DrawerContentProps } from './types'

/**
 * 抽屉内容入口组件
 * 根据不同模式分发到对应的子组件
 */
export const DrawerContent: React.FC<DrawerContentProps> = (props) => {
  const {
    isDiffMode,
    isInRecordingMode,
    previewEnabled,
    isClosingPreview,
    editorThemeVars,
    diffModeProps,
    recordingModeProps,
    previewModeProps,
    normalModeProps,
    baseProps,
  } = props

  /**
   * 根据模式渲染对应的内容组件
   * 预览关闭过渡期间仍渲染 PreviewModeContent，保持布局结构
   */
  const renderContent = () => {
    if (isDiffMode) {
      return <DiffModeContent {...baseProps} {...diffModeProps} />
    }

    if (isInRecordingMode) {
      return <RecordingModeContent {...baseProps} {...recordingModeProps} />
    }

    // 预览模式或预览关闭过渡期间，都渲染 PreviewModeContent
    if (previewEnabled || isClosingPreview) {
      return <PreviewModeContent {...baseProps} {...previewModeProps} />
    }

    return <NormalModeContent {...baseProps} {...normalModeProps} />
  }

  return (
    <DrawerContentContainer>
      <ThemeProvider theme={editorThemeVars}>{renderContent()}</ThemeProvider>
    </DrawerContentContainer>
  )
}

// 导出类型
export type {
  DrawerContentProps,
  BaseContentProps,
  ToolbarActions,
  EditorProps,
  NotificationProps,
  DiffModeContentProps,
  RecordingModeContentProps,
  PreviewModeContentProps,
  NormalModeContentProps,
} from './types'
