import { MODAL_Z_INDEX } from '@/shared/constants/theme'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import { generate } from '@ant-design/colors'
import { Button, ConfigProvider, Input, Modal, Space } from 'antd'
import React, { useMemo } from 'react'
import styled from 'styled-components'

const StyledButton = styled(Button)<{
  $themeColor: string
  $hoverColor: string
  $activeColor: string
}>`
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    background: ${(props) => props.$themeColor} !important;
    border-color: ${(props) => props.$themeColor} !important;
    color: #ffffff !important;

    &:hover {
      background: ${(props) => props.$hoverColor} !important;
      border-color: ${(props) => props.$hoverColor} !important;
      color: #ffffff !important;
    }

    &:active {
      background: ${(props) => props.$activeColor} !important;
      border-color: ${(props) => props.$activeColor} !important;
      color: #ffffff !important;
    }
  }
`

interface AddFavoriteModalProps {
  visible: boolean
  favoriteNameInput: string
  themeColor: string
  onInputChange: (value: string) => void
  onAdd: () => Promise<void>
  onClose: () => void
}

/**
 * 添加收藏模态框组件
 */
export const AddFavoriteModal: React.FC<AddFavoriteModalProps> = ({
  visible,
  favoriteNameInput,
  themeColor,
  onInputChange,
  onAdd,
  onClose,
}) => {
  const { modalTheme, primaryColor, hoverColor, activeColor } = useMemo(() => {
    const colors = generate(themeColor)
    const primaryColor = colors[5]
    const hoverColor = colors[4]
    const activeColor = colors[6]

    return {
      primaryColor,
      hoverColor,
      activeColor,
      modalTheme: {
        token: {
          colorPrimary: primaryColor,
          colorPrimaryHover: hoverColor,
          colorPrimaryActive: activeColor,
          colorInfo: primaryColor,
          colorLink: primaryColor,
          colorLinkHover: hoverColor,
          colorLinkActive: activeColor,
          colorTextLightSolid: '#ffffff',
        },
        components: {
          Modal: {
            contentBg: '#ffffff',
            headerBg: '#ffffff',
          },
        },
      },
    }
  }, [themeColor])

  return (
    <ConfigProvider theme={modalTheme} prefixCls="see">
      <Modal
        title="添加到收藏"
        open={visible}
        onCancel={onClose}
        footer={
          <Space>
            <Button onClick={onClose}>取消</Button>
            <StyledButton
              type="primary"
              onClick={onAdd}
              $themeColor={primaryColor}
              $hoverColor={hoverColor}
              $activeColor={activeColor}
            >
              添加
            </StyledButton>
          </Space>
        }
        getContainer={shadowRootManager.getContainer}
        zIndex={MODAL_Z_INDEX}
      >
        <Input
          placeholder="请输入收藏名称（不超过50字符）"
          value={favoriteNameInput}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
          maxLength={50}
          onPressEnter={onAdd}
        />
      </Modal>
    </ConfigProvider>
  )
}
