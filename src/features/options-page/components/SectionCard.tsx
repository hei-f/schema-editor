import { Collapse } from 'antd'
import React from 'react'
import { CardSubtitle, StyledCollapse } from '../styles/layout.styles'

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
}

/**
 * 配置区块卡片组件
 * 可折叠的配置区块，带标题和副标题
 */
export const SectionCard: React.FC<SectionCardProps> = (props) => {
  const { title, subtitle, children, panelKey, defaultActive = true } = props

  return (
    <StyledCollapse 
      defaultActiveKey={defaultActive ? [panelKey] : []}
      style={{ marginBottom: 24 }}
    >
      <Panel header={title} key={panelKey}>
        {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
        {children}
      </Panel>
    </StyledCollapse>
  )
}

