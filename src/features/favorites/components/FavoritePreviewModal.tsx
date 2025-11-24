import { CodeMirrorEditor } from '@/features/schema-drawer/components/CodeMirrorEditor'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { Button, Modal } from 'antd'
import React from 'react'
import { PreviewEditorContainer } from '../styles/modals.styles'

interface FavoritePreviewModalProps {
  visible: boolean
  title: string
  content: string
  onClose: () => void
}

/**
 * 收藏预览模态框组件
 */
export const FavoritePreviewModal: React.FC<FavoritePreviewModalProps> = ({
  visible,
  title,
  content,
  onClose
}) => {
  return (
    <Modal
      title={`预览：${title}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      width={900}
      getContainer={shadowRootManager.getContainer}
      styles={{
        body: { padding: 0, height: '600px' }
      }}
    >
      <PreviewEditorContainer>
        <CodeMirrorEditor
          height="100%"
          defaultValue={content}
          theme="light"
          readOnly={true}
        />
      </PreviewEditorContainer>
    </Modal>
  )
}

