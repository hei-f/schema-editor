import type { HistoryEntry, HistoryEntryType } from '@/shared/types'
import { ClearOutlined, HistoryOutlined } from '@ant-design/icons'
import { Button, Popover } from 'antd'
import React from 'react'
import styled from 'styled-components'

interface HistoryDropdownProps {
  history: HistoryEntry[]
  currentIndex: number
  onLoadVersion: (index: number) => void
  onClearHistory: () => void
  disabled: boolean
}

/**
 * 历史类型图标映射
 */
const HISTORY_ICONS: Record<HistoryEntryType, string> = {
  initial: '📄',
  auto: '✏️',
  save: '💾',
  draft: '📝',
  favorite: '⭐',
  manual: '🔄'
}

/**
 * 时间格式化
 */
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * 历史记录列表容器
 */
const HistoryList = styled.div`
  max-height: 450px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px;
  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
    margin: 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #bfbfbf;
    border-radius: 3px;
    
    &:hover {
      background: #999;
    }
  }
  
  /* 滚动性能优化 */
  -webkit-overflow-scrolling: touch;
  will-change: scroll-position;
`

/**
 * 历史记录项
 */
const HistoryItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  cursor: pointer !important;
  background: ${props => props.$isActive ? '#e6f7ff' : '#ffffff'};
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  border-radius: 8px;
  border: 2px solid ${props => props.$isActive ? '#1890ff' : '#f0f0f0'};
  box-shadow: ${props => props.$isActive 
    ? '0 2px 8px rgba(24, 144, 255, 0.15)' 
    : '0 1px 2px rgba(0, 0, 0, 0.05)'};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: ${props => props.$isActive ? '#bae7ff' : '#f8f9fa'};
    border-color: ${props => props.$isActive ? '#1890ff' : '#d9d9d9'};
    box-shadow: ${props => props.$isActive 
      ? '0 4px 12px rgba(24, 144, 255, 0.2)' 
      : '0 2px 6px rgba(0, 0, 0, 0.08)'};
    transform: translateY(-1px);
  }
  
  &:active {
    background: ${props => props.$isActive ? '#91d5ff' : '#f0f0f0'};
    transform: translateY(0);
  }
  
  .history-icon {
    font-size: 20px;
    line-height: 1;
    flex-shrink: 0;
    pointer-events: none;
    filter: ${props => props.$isActive ? 'none' : 'grayscale(0.2)'};
  }
  
  .history-info {
    flex: 1;
    min-width: 0;
    pointer-events: none;
  }
  
  .history-desc {
    font-size: 14px;
    color: ${props => props.$isActive ? '#1890ff' : '#262626'};
    font-weight: ${props => props.$isActive ? 600 : 500};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 20px;
    margin-bottom: 4px;
  }
  
  .history-time {
    font-size: 12px;
    color: ${props => props.$isActive ? '#40a9ff' : '#8c8c8c'};
    line-height: 18px;
    font-weight: 400;
  }
  
  .history-check {
    color: #1890ff;
    font-weight: 700;
    font-size: 18px;
    flex-shrink: 0;
    pointer-events: none;
    animation: checkFadeIn 0.2s ease;
  }
  
  @keyframes checkFadeIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  * {
    cursor: pointer !important;
  }
`

/**
 * 清除按钮容器
 */
const ClearButtonContainer = styled.div`
  border-top: 2px solid #f0f0f0;
  padding: 12px 16px;
  background: #fafafa;
  
  button {
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
`

/**
 * 空状态容器
 */
const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`

/**
 * 历史记录下拉菜单组件
 * 
 * 功能：
 * - 展示历史记录列表（按时间排序）
 * - 图标标记不同类型的版本
 * - 当前版本高亮显示
 * - 清除历史功能
 */
export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
  history,
  currentIndex,
  onLoadVersion,
  onClearHistory,
  disabled
}) => {
  const [open, setOpen] = React.useState(false)

  const handleItemClick = (index: number) => {
    onLoadVersion(index)
    setTimeout(() => setOpen(false), 50)
  }

  const handleClear = () => {
    onClearHistory()
    setTimeout(() => setOpen(false), 50)
  }

  const content = (
    <div style={{ minWidth: '360px', maxWidth: '420px' }}>
      {history.length === 0 ? (
        <EmptyState>
          <div className="empty-icon">📭</div>
          <div>暂无历史记录</div>
        </EmptyState>
      ) : (
        <>
          <HistoryList>
            {history.map((entry, index) => (
              <HistoryItem
                key={entry.id}
                $isActive={index === currentIndex}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleItemClick(index)
                }}
                role="button"
                tabIndex={0}
                aria-label={`加载历史版本: ${entry.description || '内容变更'}`}
              >
                <span className="history-icon">
                  {HISTORY_ICONS[entry.type]}
                </span>
                <div className="history-info">
                  <div className="history-desc">
                    {entry.description || '内容变更'}
                  </div>
                  <div className="history-time">
                    {formatTimeAgo(entry.timestamp)}
                  </div>
                </div>
                {index === currentIndex && (
                  <span className="history-check">✓</span>
                )}
              </HistoryItem>
            ))}
          </HistoryList>
          <ClearButtonContainer>
            <Button
              block
              size="middle"
              danger
              icon={<ClearOutlined />}
              onClick={handleClear}
              type="primary"
            >
              清除历史
            </Button>
          </ClearButtonContainer>
        </>
      )}
    </div>
  )
  
  return (
    <Popover
      content={content}
      title={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '15px',
          fontWeight: 600,
          padding: '8px 12px',
          borderBottom: '1px solid #f0f0f0',
          margin: '-12px -16px 0'
        }}>
          <span style={{ fontSize: '20px', lineHeight: 1 }}>📜</span>
          <span style={{ flex: 1 }}>本次编辑历史</span>
          <span style={{ 
            color: '#8c8c8c', 
            fontWeight: 'normal',
            fontSize: '12px',
            background: '#f5f5f5',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {history.length} 条
          </span>
        </div>
      }
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayInnerStyle={{ padding: '12px 16px' }}
      destroyTooltipOnHide={false}
      getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
    >
      <Button
        size="small"
        type="text"
        icon={<HistoryOutlined />}
        disabled={disabled}
      >
        历史
      </Button>
    </Popover>
  )
}

