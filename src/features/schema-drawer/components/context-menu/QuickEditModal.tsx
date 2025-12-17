import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { App, Button, ConfigProvider, Modal, Space } from 'antd'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { ContentType, type EditorTheme } from '@/shared/types'
import { TOOLBAR_MODE } from '@/shared/constants/ui-modes'
import { getJsonError, repairJson } from '../../utils/json-repair'
import { schemaTransformer } from '../../services/schema-transformer'
import { CodeMirrorEditor, type CodeMirrorEditorHandle } from '../editor/CodeMirrorEditor'
import { DrawerToolbar } from '../toolbar/DrawerToolbar'
import type { QuickEditModalProps } from './types'

/**
 * 弹窗内编辑器容器
 */
const EditorContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
`

/**
 * 弹窗内容容器
 * 使用 gap 实现子元素间隔，符合项目布局规范
 */
const ModalContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 500px;
`

/**
 * 快速编辑弹窗组件
 * 用于在独立的编辑器中对选中内容执行定位错误或JSON修复操作
 */
export const QuickEditModal: React.FC<QuickEditModalProps> = (props) => {
  const { visible, content, editorTheme, themeColor, onSave, onClose } = props

  const { message } = App.useApp()
  const editorRef = useRef<CodeMirrorEditorHandle | null>(null)
  const [editorValue, setEditorValue] = useState<string>(content)
  const [contentType, setContentType] = useState<ContentType>(ContentType.Other)

  /**
   * 检测内容类型
   */
  const detectContentType = useCallback((value: string) => {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
        setContentType(ContentType.Ast)
      } else if (typeof parsed === 'string') {
        setContentType(ContentType.RawString)
      } else {
        setContentType(ContentType.Other)
      }
    } catch {
      setContentType(ContentType.Other)
    }
  }, [])

  /**
   * 弹窗打开时更新编辑器内容
   */
  React.useEffect(() => {
    if (visible && content) {
      setEditorValue(content)
      // 检测内容类型
      detectContentType(content)
      // 使用 setTimeout 确保编辑器已经渲染
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.setValue(content)
        }
      }, 50)
    }
  }, [visible, content, detectContentType])

  /**
   * 检查是否可以解析
   */
  const canParse = useMemo(() => {
    try {
      const parsed = JSON.parse(editorValue)
      return typeof parsed === 'string'
    } catch {
      return false
    }
  }, [editorValue])

  /**
   * 计算主题色
   */
  const modalTheme = useMemo(() => {
    const colors = generate(themeColor)
    const primaryColor = colors[5]
    const hoverColor = colors[4]
    const activeColor = colors[6]

    return {
      cssVar: { prefix: 'see' },
      token: {
        colorPrimary: primaryColor,
        colorPrimaryHover: hoverColor,
        colorPrimaryActive: activeColor,
        colorInfo: primaryColor,
        colorLink: primaryColor,
        colorLinkHover: hoverColor,
        colorLinkActive: activeColor,
      },
    }
  }, [themeColor])

  /**
   * 处理编辑器内容变化
   */
  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value)
      detectContentType(value)
    },
    [detectContentType]
  )

  /**
   * 格式化
   */
  const handleFormat = useCallback(() => {
    const result = schemaTransformer.formatJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      message.success('格式化成功')
    } else {
      message.error('格式化失败：' + result.error)
    }
  }, [editorValue, message])

  /**
   * 转义
   */
  const handleEscape = useCallback(() => {
    const result = schemaTransformer.escapeJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      message.success('转义成功')
    } else {
      message.error('转义失败：' + result.error)
    }
  }, [editorValue, message])

  /**
   * 去转义
   */
  const handleUnescape = useCallback(() => {
    const result = schemaTransformer.unescapeJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      message.success('去转义成功')
    } else {
      message.error('去转义失败：' + result.error)
    }
  }, [editorValue, message])

  /**
   * 压缩
   */
  const handleCompact = useCallback(() => {
    const result = schemaTransformer.compactJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      message.success('压缩成功')
    } else {
      message.error('压缩失败：' + result.error)
    }
  }, [editorValue, message])

  /**
   * 解析
   */
  const handleParse = useCallback(() => {
    const result = schemaTransformer.parseNestedJson(editorValue)
    if (result.success && result.data) {
      editorRef.current?.setValue(result.data)
      setEditorValue(result.data)
      message.success(`解析成功${result.parseCount ? `（解析了 ${result.parseCount} 层）` : ''}`)
    } else {
      message.error('解析失败：' + result.error)
    }
  }, [editorValue, message])

  /**
   * Segment 切换
   */
  const handleSegmentChange = useCallback((_value: string | number) => {
    // 不需要实现，快速编辑模式下不需要切换
  }, [])

  /**
   * 定位错误
   */
  const handleLocateError = useCallback(() => {
    const errorInfo = getJsonError(editorValue)

    if (errorInfo) {
      const errorMessage = `JSON 语法错误：${errorInfo.message}`
      editorRef.current?.showErrorWidget(errorInfo.line, errorInfo.column, errorMessage)
      message.warning('已定位到错误位置')
    } else {
      message.success('JSON 格式正确，无语法错误')
    }
  }, [editorValue, message])

  /**
   * 修复 JSON
   */
  const handleRepairJson = useCallback(() => {
    const result = repairJson(editorValue)

    if (result.success && result.repaired) {
      editorRef.current?.setValue(result.repaired)
      setEditorValue(result.repaired)
      message.success('JSON 修复成功')
    } else {
      try {
        JSON.parse(editorValue)
        message.info('JSON 格式正确，无需修复')
      } catch {
        message.error(result.error || '无法修复此 JSON，请手动检查')
      }
    }
  }, [editorValue, message])

  /**
   * 保存并关闭
   */
  const handleSave = useCallback(() => {
    const currentValue = editorRef.current?.getValue() || editorValue
    onSave(currentValue)
  }, [editorValue, onSave])

  /**
   * 获取 Portal 容器
   */
  const getPortalContainer = useCallback(() => {
    return shadowRootManager.getContainer()
  }, [])

  return (
    <ConfigProvider theme={modalTheme} getPopupContainer={getPortalContainer}>
      <App>
        <Modal
          title="单独编辑"
          open={visible}
          onCancel={onClose}
          width={900}
          getContainer={getPortalContainer}
          styles={{
            container: {
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
            },
            header: { margin: 0, padding: 0 },
            body: { margin: 0, padding: 0 },
            footer: { margin: 0, padding: 0 },
          }}
          footer={
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={handleSave}>
                保存并替换
              </Button>
            </Space>
          }
        >
          <ModalContentContainer>
            <DrawerToolbar
              mode={TOOLBAR_MODE.NORMAL}
              attributes={{ params: [] }}
              contentType={contentType}
              canParse={canParse}
              toolbarButtons={{
                astRawStringToggle: false,
                escape: true,
                deserialize: true,
                serialize: true,
                format: true,
                preview: false,
                importExport: false,
                draft: false,
                favorites: false,
                history: false,
              }}
              onFormat={handleFormat}
              onEscape={handleEscape}
              onUnescape={handleUnescape}
              onCompact={handleCompact}
              onParse={handleParse}
              onSegmentChange={handleSegmentChange}
              onLocateError={handleLocateError}
              onRepairJson={handleRepairJson}
            />

            <EditorContainer>
              <CodeMirrorEditor
                ref={editorRef}
                defaultValue={content}
                onChange={handleEditorChange}
                theme={editorTheme as EditorTheme}
                height="100%"
                placeholder="在此编辑 JSON..."
              />
            </EditorContainer>
          </ModalContentContainer>
        </Modal>
      </App>
    </ConfigProvider>
  )
}
