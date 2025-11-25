import { Button, Collapse } from 'antd'
import React from 'react'
import { CardSubtitle, PanelHeader, PanelTitle, StyledCollapse } from '../styles/layout.styles'

const { Panel } = Collapse

interface SectionCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片副标题（描述） */
  subtitle?: string
  /** 卡片内容 */
  children: React.ReactNode
  /** 唯一的key，用于Collapse */
  panelKey: string
  /** 是否默认展开 */
  defaultActive?: boolean
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * 配置区块卡片组件
 * 可折叠的配置区块，带标题和副标题
 */
export const SectionCard: React.FC<SectionCardProps> = (props) => {
  const { title, subtitle, children, panelKey, defaultActive = true, onResetDefault } = props

  const handleResetClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onResetDefault?.()
  }

  const headerContent = (
    <PanelHeader>
      <PanelTitle>{title}</PanelTitle>
      {onResetDefault && (
        <Button 
          type="link" 
          size="small" 
          onClick={handleResetClick}
        >
          恢复默认
        </Button>
      )}
    </PanelHeader>
  )

  return (
    <StyledCollapse 
      defaultActiveKey={defaultActive ? [panelKey] : []}
    >
      <Panel header={headerContent} key={panelKey}>
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        {children}
      </Panel>
    </StyledCollapse>
  )
}
