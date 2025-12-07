import React from 'react'
import { ThemeProvider } from 'styled-components'
import {
  ContentAreaContainer,
  DrawerContentContainer,
  ModeContentWrapper,
  ModeSwitchContainer,
} from '../../styles/layout/drawer.styles'
import { EditorContainer } from '../../styles/editor/editor.styles'
import { LightSuccessNotification } from '../../styles/notifications/notifications.styles'
import {
  RecordingContentArea,
  RecordingEditorArea,
  RecordingModeContainer,
} from '../../styles/recording/recording.styles'
import { CodeMirrorEditor } from '../editor/CodeMirrorEditor'
import { RecordingStatusBar } from '../recording/RecordingStatusBar'
import { VersionHistoryPanel } from '../recording/VersionHistoryPanel'
import { DiffModeContent } from './modes'
import { ToolbarSection } from './shared/ToolbarSection'
import type { ToolbarMode } from '../toolbar/DrawerToolbar'
import type { BaseContentProps, DiffModeContentProps, RecordingModeContentProps } from './types'
import type { EditorThemeVars } from '../../styles/editor/editor-theme-vars'
import { ContentType } from '@/shared/types'

/**
 * 录制模式布局 Props
 * 处理：录制模式、录制模式下的 Diff 模式
 */
interface RecordingModeLayoutProps {
  isDiffMode: boolean
  editorThemeVars: EditorThemeVars
  diffModeProps: Omit<DiffModeContentProps, keyof BaseContentProps>
  recordingModeProps: Omit<RecordingModeContentProps, keyof BaseContentProps>
  baseProps: BaseContentProps
}

/**
 * 计算工具栏模式
 */
function getToolbarMode(isDiffMode: boolean): ToolbarMode {
  if (isDiffMode) return 'diff'
  return 'recording'
}

/**
 * 录制模式布局组件
 *
 * 负责渲染：
 * - 录制模式：录制状态栏 + 工具栏 + (版本历史 | 编辑器)
 * - 录制模式下的 Diff：录制状态栏 + 工具栏 + Diff视图
 */
export const RecordingModeLayout: React.FC<RecordingModeLayoutProps> = (props) => {
  const { isDiffMode, editorThemeVars, diffModeProps, recordingModeProps, baseProps } = props

  const toolbarMode = getToolbarMode(isDiffMode)

  // 编辑器相关 props
  const { editorProps, notificationProps } = baseProps
  const { editorRef, editorValue, editorTheme, enableAstTypeHints, contentType, onChange } =
    editorProps
  const { lightNotifications } = notificationProps

  // 录制模式相关
  const { isRecording, snapshots, selectedSnapshotId, onSelectSnapshot } = recordingModeProps

  /**
   * 渲染编辑器
   */
  const renderEditor = () => (
    <>
      {lightNotifications.map((notification, index) => (
        <LightSuccessNotification key={notification.id} style={{ top: `${16 + index * 48}px` }}>
          ✓ {notification.text}
        </LightSuccessNotification>
      ))}
      <CodeMirrorEditor
        ref={editorRef}
        height="100%"
        defaultValue={editorValue}
        onChange={onChange}
        theme={editorTheme}
        placeholder="在此输入 JSON Schema..."
        enableAstHints={enableAstTypeHints}
        isAstContent={() => contentType === ContentType.Ast}
      />
    </>
  )

  /**
   * 渲染工具栏
   */
  const renderToolbar = () => (
    <ToolbarSection
      mode={toolbarMode}
      baseProps={baseProps}
      previewEnabled={false}
      isRecording={isRecording}
      showDiffButton={isDiffMode}
      isDiffMode={isDiffMode}
      diffDisplayMode={diffModeProps.diffDisplayMode}
      onDiffDisplayModeChange={diffModeProps.onDiffDisplayModeChange}
      hasPendingRepair={!!diffModeProps.pendingRepairedValue}
      onApplyRepair={diffModeProps.onApplyRepair}
      onCancelRepair={diffModeProps.onCancelRepair}
    />
  )

  /**
   * 渲染模式切换区域（编辑器/Diff 内容）
   * 动画只影响这个区域，工具栏不受影响
   */
  const renderModeSwitchArea = () => (
    <ModeSwitchContainer>
      {/* 录制模式内容 - 非 Diff 时显示 */}
      <ModeContentWrapper $active={!isDiffMode}>
        <ContentAreaContainer>
          <RecordingModeContainer>
            <RecordingContentArea>
              <VersionHistoryPanel
                isRecording={isRecording}
                snapshots={snapshots}
                selectedSnapshotId={selectedSnapshotId}
                onSelectSnapshot={onSelectSnapshot}
              />
              <RecordingEditorArea>
                <EditorContainer>{renderEditor()}</EditorContainer>
              </RecordingEditorArea>
            </RecordingContentArea>
          </RecordingModeContainer>
        </ContentAreaContainer>
      </ModeContentWrapper>

      {/* Diff 内容 - Diff 时显示 */}
      <ModeContentWrapper $active={isDiffMode}>
        <ContentAreaContainer>
          <DiffModeContent {...baseProps} {...diffModeProps} />
        </ContentAreaContainer>
      </ModeContentWrapper>
    </ModeSwitchContainer>
  )

  return (
    <ThemeProvider theme={editorThemeVars}>
      <DrawerContentContainer>
        {/* 录制状态栏：Diff 模式下隐藏 */}
        {!isDiffMode && (
          <RecordingStatusBar
            isRecording={isRecording}
            snapshots={snapshots}
            onStopRecording={recordingModeProps.onStopRecording}
            onEnterDiffMode={recordingModeProps.onEnterDiffMode}
          />
        )}

        {/* 工具栏：不参与模式切换动画 */}
        {renderToolbar()}

        {/* 模式切换区域：只有内容区域有动画 */}
        {renderModeSwitchArea()}
      </DrawerContentContainer>
    </ThemeProvider>
  )
}
