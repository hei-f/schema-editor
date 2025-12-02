import { CheckOutlined, CopyOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import copy from 'copy-to-clipboard'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  AttributeTag,
  AttributeTagWrapper,
  CopyIconWrapper,
  ParamItem,
  ParamLabel,
  StyledCopyIcon,
} from '../../styles/toolbar/toolbar.styles'

/** 复制成功后图标显示时长（毫秒） */
const COPY_SUCCESS_DISPLAY_DURATION = 2000
/** 淡出动画时长（毫秒），需与 CSS transition 保持一致 */
const FADE_OUT_DURATION = 200

interface ParamTagProps {
  /** 参数值 */
  value: string
  /** 参数索引（用于显示 params1, params2 等） */
  index: number
  /** 是否处于预览模式 */
  previewEnabled?: boolean
}

/**
 * 单个参数标签组件
 * 显示参数值，支持复制功能
 */
export const ParamTag: React.FC<ParamTagProps> = ({ value, index, previewEnabled = false }) => {
  /** 控制图标是否强制显示 */
  const [isVisible, setIsVisible] = useState(false)
  /** 控制显示勾还是复制图标 */
  const [showSuccessIcon, setShowSuccessIcon] = useState(false)

  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iconTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * 预览模式下的 Tooltip 容器获取函数
   * 挂载到 document.body，避免被预览容器的 overflow 裁剪
   */
  const tooltipContainer = useMemo(() => {
    if (!previewEnabled) return undefined
    return () => document.body
  }, [previewEnabled])

  /** 清理所有定时器 */
  const clearTimers = () => {
    if (visibilityTimerRef.current) {
      clearTimeout(visibilityTimerRef.current)
      visibilityTimerRef.current = null
    }
    if (iconTimerRef.current) {
      clearTimeout(iconTimerRef.current)
      iconTimerRef.current = null
    }
  }

  /** 组件卸载时清理定时器 */
  useEffect(() => {
    return clearTimers
  }, [])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = copy(value)
    if (success) {
      clearTimers()
      setIsVisible(true)
      setShowSuccessIcon(true)

      visibilityTimerRef.current = setTimeout(() => {
        setIsVisible(false)
        iconTimerRef.current = setTimeout(() => {
          setShowSuccessIcon(false)
        }, FADE_OUT_DURATION)
      }, COPY_SUCCESS_DISPLAY_DURATION)
    } else {
      console.error('复制失败: copy-to-clipboard 返回 false')
    }
  }

  return (
    <ParamItem style={{ flexShrink: 0 }}>
      <ParamLabel>params{index + 1}:</ParamLabel>
      <Tooltip title={value} placement="bottom" getPopupContainer={tooltipContainer}>
        <AttributeTagWrapper>
          <AttributeTag>{value}</AttributeTag>
          <CopyIconWrapper
            className="copy-icon-wrapper"
            onClick={handleCopy}
            $forceVisible={isVisible}
          >
            <StyledCopyIcon $isSuccess={showSuccessIcon}>
              {showSuccessIcon ? <CheckOutlined /> : <CopyOutlined />}
            </StyledCopyIcon>
          </CopyIconWrapper>
        </AttributeTagWrapper>
      </Tooltip>
    </ParamItem>
  )
}
