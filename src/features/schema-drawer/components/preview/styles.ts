import styled from 'styled-components'

/**
 * 内置预览容器
 * 保持与宿主预览器相同的视觉效果：12px padding + 白色内容区
 */
export const BuiltinPreviewContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
`

/**
 * 内置预览内容区域
 */
export const BuiltinPreviewContentArea = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #fff;
  border-radius: 12px;

  /* MarkdownEditor 样式覆盖 */
  .md-editor-container {
    height: 100%;
    border: none;
    border-radius: 8px;
  }

  .md-editor-content {
    padding: 16px;
  }
`
