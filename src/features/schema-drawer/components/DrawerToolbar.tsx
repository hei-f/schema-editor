import type { ElementAttributes, ToolbarButtonsConfig } from '@/shared/types'
import { ContentType } from '@/shared/types'
import { Button, Segmented, Tooltip } from 'antd'
import { CopyOutlined, CheckOutlined, DiffOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import {
  AttributeTag,
  AttributeTagWrapper,
  ButtonGroup,
  CopyIconWrapper,
  ParamItem,
  ParamLabel,
  ParamsContainer,
  StyledCopyIcon,
  EditorToolbar as StyledEditorToolbar,
} from '../styles/toolbar.styles'
import { DIFF_DISPLAY_MODE_OPTIONS, type DiffDisplayMode } from './SchemaDiffView'

interface DrawerToolbarProps {
  attributes: ElementAttributes
  contentType: ContentType
  canParse: boolean
  toolbarButtons: ToolbarButtonsConfig
  previewEnabled?: boolean
  /** 是否正在录制（录制中禁用部分功能） */
  isRecording?: boolean
  /** 是否显示 diff 按钮 */
  showDiffButton?: boolean
  /** 是否处于 Diff 模式 */
  isDiffMode?: boolean
  /** 当前对比显示模式 */
  diffDisplayMode?: DiffDisplayMode
  /** 对比显示模式变化回调 */
  onDiffDisplayModeChange?: (mode: DiffDisplayMode) => void
  onFormat: () => void
  onEscape: () => void
  onUnescape: () => void
  onCompact: () => void
  onParse: () => void
  onSegmentChange: (value: string | number) => void
  onRenderPreview?: () => void
  /** 进入 diff 模式 */
  onEnterDiffMode?: () => void
  /** 退出 diff 模式 */
  onExitDiffMode?: () => void
}

/**
 * 抽屉工具栏组件
 */
export const DrawerToolbar: React.FC<DrawerToolbarProps> = ({
  attributes,
  contentType,
  canParse,
  toolbarButtons,
  previewEnabled = false,
  isRecording = false,
  showDiffButton = false,
  isDiffMode = false,
  diffDisplayMode = 'raw',
  onDiffDisplayModeChange,
  onFormat,
  onEscape,
  onUnescape,
  onCompact,
  onParse,
  onSegmentChange,
  onRenderPreview,
  onEnterDiffMode,
  onExitDiffMode,
}) => {
  // 复制状态管理: { [index: number]: 'idle' | 'copied' }
  const [copyStatus, setCopyStatus] = useState<Record<number, 'idle' | 'copied'>>({})

  /**
   * 处理复制操作
   */
  const handleCopy = async (param: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(param)

      // 设置为已复制状态
      setCopyStatus((prev) => ({ ...prev, [index]: 'copied' }))

      // 2秒后恢复为idle状态
      setTimeout(() => {
        setCopyStatus((prev) => ({ ...prev, [index]: 'idle' }))
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  // Diff 模式下的简化工具栏：只有对比模式 Segmented + 对比按钮（右对齐）
  if (isDiffMode) {
    return (
      <StyledEditorToolbar>
        <div style={{ flex: 1 }} />
        <ButtonGroup>
          <Tooltip title="选择数据展示格式进行对比">
            <Segmented
              size="small"
              value={diffDisplayMode}
              onChange={(value) => onDiffDisplayModeChange?.(value as DiffDisplayMode)}
              options={DIFF_DISPLAY_MODE_OPTIONS}
            />
          </Tooltip>
          <Tooltip title="关闭对比模式">
            <Button size="small" type="primary" icon={<DiffOutlined />} onClick={onExitDiffMode}>
              对比
            </Button>
          </Tooltip>
        </ButtonGroup>
      </StyledEditorToolbar>
    )
  }

  return (
    <StyledEditorToolbar>
      <ParamsContainer>
        {attributes.params && attributes.params.length > 0 && (
          <>
            {attributes.params.map((param: string, index: number) => (
              <ParamItem key={index}>
                <ParamLabel>params{index + 1}:</ParamLabel>
                <Tooltip title={param} placement="topLeft">
                  <AttributeTagWrapper>
                    <AttributeTag>{param}</AttributeTag>
                    <CopyIconWrapper
                      className="copy-icon-wrapper"
                      onClick={(e) => handleCopy(param, index, e)}
                    >
                      <StyledCopyIcon $isSuccess={copyStatus[index] === 'copied'}>
                        {copyStatus[index] === 'copied' ? <CheckOutlined /> : <CopyOutlined />}
                      </StyledCopyIcon>
                    </CopyIconWrapper>
                  </AttributeTagWrapper>
                </Tooltip>
              </ParamItem>
            ))}
          </>
        )}
      </ParamsContainer>
      <ButtonGroup>
        {previewEnabled && onRenderPreview && (
          <Button size="small" type="primary" onClick={onRenderPreview}>
            更新预览
          </Button>
        )}
        {toolbarButtons.astRawStringToggle && (
          <Tooltip
            title={
              isRecording
                ? '录制中不可切换'
                : contentType === ContentType.Other
                  ? '当前数据类型错误'
                  : ''
            }
          >
            <Segmented
              size="small"
              shape="round"
              options={[
                { label: 'AST', value: ContentType.Ast },
                { label: 'RawString', value: ContentType.RawString },
              ]}
              value={contentType === ContentType.Other ? undefined : contentType}
              onChange={onSegmentChange}
              disabled={contentType === ContentType.Other || isRecording}
            />
          </Tooltip>
        )}
        {toolbarButtons.escape && (
          <>
            <Tooltip title="将内容包装成字符串值，添加引号和转义">
              <Button size="small" onClick={onEscape}>
                转义
              </Button>
            </Tooltip>
            <Tooltip title="将字符串值还原，移除外层引号和转义">
              <Button size="small" onClick={onUnescape}>
                去转义
              </Button>
            </Tooltip>
          </>
        )}
        {toolbarButtons.serialize && (
          <Tooltip title="将 JSON 压缩成一行">
            <Button size="small" onClick={onCompact}>
              压缩
            </Button>
          </Tooltip>
        )}
        {toolbarButtons.deserialize && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : '解析多层嵌套/转义的 JSON'}>
            <Button size="small" onClick={onParse} disabled={!canParse}>
              解析
            </Button>
          </Tooltip>
        )}
        {toolbarButtons.format && (
          <Tooltip title={!canParse ? '当前内容不是有效的 JSON 格式' : ''}>
            <Button size="small" onClick={onFormat} disabled={!canParse}>
              格式化
            </Button>
          </Tooltip>
        )}
        {showDiffButton && onEnterDiffMode && (
          <Tooltip title="对比模式：对比两段内容的差异">
            <Button size="small" icon={<DiffOutlined />} onClick={onEnterDiffMode}>
              对比
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    </StyledEditorToolbar>
  )
}
