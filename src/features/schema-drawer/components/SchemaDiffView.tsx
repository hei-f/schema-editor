import type { SchemaSnapshot } from '@/shared/types'
import { RollbackOutlined } from '@ant-design/icons'
import { Button, Select, Segmented, Tooltip } from 'antd'
import React, { useMemo, useState, useRef } from 'react'
import { diffChars } from 'diff'
import {
  DiffContentArea,
  DiffModeContainer,
  DiffToolbar,
  EmptyState,
  VersionSelectorGroup,
  VersionSelectorLabel,
  DiffTableContainer,
  DiffTableHeader,
  DiffTableHeaderCell,
  DiffTableBody,
  DiffTableRow,
  DiffCell,
  DiffCellLineNumber,
  DiffCellContent,
  DiffInlineAdd,
  DiffInlineRemove,
  SyntaxKeyword,
  SyntaxString,
  SyntaxNumber,
  SyntaxBoolean,
  SyntaxNull,
  SyntaxPunctuation,
  SyntaxSquareBracket,
  SyntaxBrace
} from '../styles/recording.styles'
import { schemaTransformer } from '../services/schema-transformer'

/** 对比模式类型 */
type DiffDisplayMode = 'raw' | 'deserialize' | 'ast'

interface SchemaDiffViewProps {
  /** 快照列表 */
  snapshots: SchemaSnapshot[]
  /** 返回编辑模式回调 */
  onBackToEditor: () => void
}

interface DiffLineInfo {
  content: string
  type: 'added' | 'removed' | 'unchanged' | 'empty'
  lineNumber: number | null
}

interface DiffResultLine {
  left: DiffLineInfo
  right: DiffLineInfo
}

interface DiffResult {
  lines: DiffResultLine[]
}

/**
 * 格式化时间戳（毫秒）
 */
function formatTimestamp(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  const seconds = (ms / 1000).toFixed(1)
  return `${seconds}s`
}

/**
 * 行对齐的diff算法
 */
function computeDiff(leftContent: string, rightContent: string): DiffResult {
  const leftLines = leftContent.split('\n')
  const rightLines = rightContent.split('\n')
  
  const result: DiffResult = { lines: [] }
  
  let leftIdx = 0
  let rightIdx = 0
  let leftLineNum = 1
  let rightLineNum = 1
  
  while (leftIdx < leftLines.length || rightIdx < rightLines.length) {
    if (leftIdx >= leftLines.length) {
      result.lines.push({
        left: { content: '', type: 'empty', lineNumber: null },
        right: { content: rightLines[rightIdx], type: 'added', lineNumber: rightLineNum++ }
      })
      rightIdx++
    } else if (rightIdx >= rightLines.length) {
      result.lines.push({
        left: { content: leftLines[leftIdx], type: 'removed', lineNumber: leftLineNum++ },
        right: { content: '', type: 'empty', lineNumber: null }
      })
      leftIdx++
    } else if (leftLines[leftIdx] === rightLines[rightIdx]) {
      result.lines.push({
        left: { content: leftLines[leftIdx], type: 'unchanged', lineNumber: leftLineNum++ },
        right: { content: rightLines[rightIdx], type: 'unchanged', lineNumber: rightLineNum++ }
      })
      leftIdx++
      rightIdx++
    } else {
      result.lines.push({
        left: { content: leftLines[leftIdx], type: 'removed', lineNumber: leftLineNum++ },
        right: { content: rightLines[rightIdx], type: 'added', lineNumber: rightLineNum++ }
      })
      leftIdx++
      rightIdx++
    }
  }
  
  return result
}

/**
 * 尝试将内容转换为可处理的 JSON 字符串
 */
function ensureJsonString(content: string): string {
  try {
    JSON.parse(content)
    return content
  } catch {
    return JSON.stringify(content)
  }
}

/**
 * 转换内容到指定显示模式
 */
function transformContent(content: string, mode: DiffDisplayMode): string {
  if (!content) return ''
  
  switch (mode) {
    case 'raw':
      return content
    
    case 'deserialize': {
      const jsonContent = ensureJsonString(content)
      const result = schemaTransformer.deserializeJson(jsonContent)
      if (result.success && result.data) {
        try {
          return JSON.stringify(JSON.parse(result.data), null, 2)
        } catch {
          return result.data
        }
      }
      return content
    }
    
    case 'ast': {
      const jsonContent = ensureJsonString(content)
      const result = schemaTransformer.convertToAST(jsonContent)
      if (result.success && result.data) {
        return result.data
      }
      return content
    }
    
    default:
      return content
  }
}

/**
 * JSON 语法高亮渲染
 * 参考 schemaEditorDark 主题配色
 */
const SyntaxHighlight: React.FC<{ content: string }> = ({ content }) => {
  const parts = useMemo(() => {
    const result: React.ReactNode[] = []
    // 匹配 JSON 语法元素（区分不同类型的括号）
    // 1: 键名（带冒号）, 2: 字符串值, 3: 数字, 4: 布尔值, 5: null, 6: 花括号, 7: 方括号, 8: 逗号冒号
    const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+\.?\d*(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}])|([\[\]])|([,:])/g
    
    let lastIndex = 0
    let match: RegExpExecArray | null
    
    while ((match = regex.exec(content)) !== null) {
      // 添加匹配前的普通文本（空白字符等）
      if (match.index > lastIndex) {
        result.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>)
      }
      
      if (match[1]) {
        // 键名（属性名）- 红色
        result.push(<SyntaxKeyword key={`key-${match.index}`}>{match[1]}</SyntaxKeyword>)
      } else if (match[2]) {
        // 字符串值 - 绿色
        result.push(<SyntaxString key={`str-${match.index}`}>{match[2]}</SyntaxString>)
      } else if (match[3]) {
        // 数字 - 橙色
        result.push(<SyntaxNumber key={`num-${match.index}`}>{match[3]}</SyntaxNumber>)
      } else if (match[4]) {
        // 布尔值 - 橙色加粗
        result.push(<SyntaxBoolean key={`bool-${match.index}`}>{match[4]}</SyntaxBoolean>)
      } else if (match[5]) {
        // null - 橙色加粗
        result.push(<SyntaxNull key={`null-${match.index}`}>{match[5]}</SyntaxNull>)
      } else if (match[6]) {
        // 花括号 {} - 绿色
        result.push(<SyntaxBrace key={`brace-${match.index}`}>{match[6]}</SyntaxBrace>)
      } else if (match[7]) {
        // 方括号 [] - 黄色
        result.push(<SyntaxSquareBracket key={`bracket-${match.index}`}>{match[7]}</SyntaxSquareBracket>)
      } else if (match[8]) {
        // 逗号、冒号 - 浅灰色
        result.push(<SyntaxPunctuation key={`punct-${match.index}`}>{match[8]}</SyntaxPunctuation>)
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // 添加剩余文本
    if (lastIndex < content.length) {
      result.push(<span key={`text-end`}>{content.slice(lastIndex)}</span>)
    }
    
    return result.length > 0 ? result : [<span key="empty">{content}</span>]
  }, [content])

  return <>{parts}</>
}

/**
 * 渲染行内差异高亮（带语法高亮）
 */
interface InlineDiffProps {
  leftContent: string
  rightContent: string
  side: 'left' | 'right'
}

const InlineDiffContent: React.FC<InlineDiffProps> = ({ leftContent, rightContent, side }) => {
  const diffs = useMemo(() => {
    return diffChars(leftContent, rightContent)
  }, [leftContent, rightContent])

  return (
    <>
      {diffs.map((part, index) => {
        if (side === 'left') {
          if (part.removed) {
            return <DiffInlineRemove key={index}>{part.value}</DiffInlineRemove>
          } else if (!part.added) {
            return <span key={index}>{part.value}</span>
          }
          return null
        } else {
          if (part.added) {
            return <DiffInlineAdd key={index}>{part.value}</DiffInlineAdd>
          } else if (!part.removed) {
            return <span key={index}>{part.value}</span>
          }
          return null
        }
      })}
    </>
  )
}

/**
 * Schema Diff视图组件
 */
export const SchemaDiffView: React.FC<SchemaDiffViewProps> = (props) => {
  const { snapshots, onBackToEditor } = props
  
  const [leftVersionId, setLeftVersionId] = useState<number | null>(
    snapshots.length > 0 ? snapshots[0].id : null
  )
  const [rightVersionId, setRightVersionId] = useState<number | null>(
    snapshots.length > 1 ? snapshots[snapshots.length - 1].id : null
  )
  
  const [displayMode, setDisplayMode] = useState<DiffDisplayMode>('raw')
  
  const versionOptions = useMemo(() => {
    return snapshots.map((snapshot, index) => ({
      value: snapshot.id,
      label: `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`
    }))
  }, [snapshots])
  
  const leftRawContent = useMemo(() => {
    const snapshot = snapshots.find(s => s.id === leftVersionId)
    return snapshot?.content || ''
  }, [snapshots, leftVersionId])
  
  const rightRawContent = useMemo(() => {
    const snapshot = snapshots.find(s => s.id === rightVersionId)
    return snapshot?.content || ''
  }, [snapshots, rightVersionId])
  
  const leftContent = useMemo(() => {
    return transformContent(leftRawContent, displayMode)
  }, [leftRawContent, displayMode])
  
  const rightContent = useMemo(() => {
    return transformContent(rightRawContent, displayMode)
  }, [rightRawContent, displayMode])
  
  const leftVersionInfo = useMemo(() => {
    const snapshot = snapshots.find(s => s.id === leftVersionId)
    const index = snapshots.findIndex(s => s.id === leftVersionId)
    if (!snapshot) return null
    return `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`
  }, [snapshots, leftVersionId])
  
  const rightVersionInfo = useMemo(() => {
    const snapshot = snapshots.find(s => s.id === rightVersionId)
    const index = snapshots.findIndex(s => s.id === rightVersionId)
    if (!snapshot) return null
    return `版本 ${index + 1} (${formatTimestamp(snapshot.timestamp)})`
  }, [snapshots, rightVersionId])
  
  const diffResult = useMemo(() => {
    if (!leftContent || !rightContent) {
      return null
    }
    return computeDiff(leftContent, rightContent)
  }, [leftContent, rightContent])
  
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const handleModeChange = (value: string | number) => {
    setDisplayMode(value as DiffDisplayMode)
  }

  /**
   * 渲染单元格内容
   */
  const renderCellContent = (line: DiffResultLine, side: 'left' | 'right') => {
    const info = side === 'left' ? line.left : line.right
    
    if (info.type === 'empty') {
      return <span>&nbsp;</span>
    }
    
    // 如果两边都有修改，使用行内差异高亮
    if (
      (side === 'left' && line.left.type === 'removed' && line.right.type === 'added') ||
      (side === 'right' && line.right.type === 'added' && line.left.type === 'removed')
    ) {
      return (
        <InlineDiffContent
          leftContent={line.left.content}
          rightContent={line.right.content}
          side={side}
        />
      )
    }
    
    // 对于相同行或单侧变化，使用语法高亮
    return <SyntaxHighlight content={info.content || ''} />
  }

  return (
    <DiffModeContainer>
      {/* Diff工具栏 */}
      <DiffToolbar>
        <Button 
          icon={<RollbackOutlined />} 
          onClick={onBackToEditor}
          size="small"
        >
          返回编辑模式
        </Button>
        
        <VersionSelectorGroup>
          <VersionSelectorLabel>左侧版本:</VersionSelectorLabel>
          <Select
            value={leftVersionId}
            onChange={setLeftVersionId}
            options={versionOptions}
            style={{ width: 180 }}
            size="small"
            popupMatchSelectWidth={false}
            getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          />
        </VersionSelectorGroup>
        
        <VersionSelectorGroup>
          <VersionSelectorLabel>右侧版本:</VersionSelectorLabel>
          <Select
            value={rightVersionId}
            onChange={setRightVersionId}
            options={versionOptions}
            style={{ width: 180 }}
            size="small"
            popupMatchSelectWidth={false}
            getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          />
        </VersionSelectorGroup>
        
        <VersionSelectorGroup>
          <VersionSelectorLabel>对比模式:</VersionSelectorLabel>
          <Tooltip title="选择数据展示格式进行对比">
            <Segmented
              size="small"
              value={displayMode}
              onChange={handleModeChange}
              options={[
                { label: '原始', value: 'raw' },
                { label: '反序列化', value: 'deserialize' },
                { label: 'AST', value: 'ast' }
              ]}
            />
          </Tooltip>
        </VersionSelectorGroup>
      </DiffToolbar>

      {/* Diff内容区域 - 使用表格结构确保行对齐 */}
      <DiffContentArea 
        ref={scrollContainerRef}
        onScroll={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        <DiffTableContainer>
          {/* 表头 */}
          <DiffTableHeader>
            <DiffTableHeaderCell $isLeft>
              {leftVersionInfo || '请选择左侧版本'}
            </DiffTableHeaderCell>
            <DiffTableHeaderCell>
              {rightVersionInfo || '请选择右侧版本'}
            </DiffTableHeaderCell>
          </DiffTableHeader>
          
          {/* 内容 */}
          <DiffTableBody>
            {diffResult ? (
              diffResult.lines.map((line, idx) => (
                <DiffTableRow key={idx}>
                  {/* 左侧单元格 */}
                  <DiffCell $type={line.left.type} $isLeft>
                    <DiffCellLineNumber $type={line.left.type}>
                      {line.left.lineNumber ?? ''}
                    </DiffCellLineNumber>
                    <DiffCellContent $type={line.left.type}>
                      {renderCellContent(line, 'left')}
                    </DiffCellContent>
                  </DiffCell>
                  
                  {/* 右侧单元格 */}
                  <DiffCell $type={line.right.type}>
                    <DiffCellLineNumber $type={line.right.type}>
                      {line.right.lineNumber ?? ''}
                    </DiffCellLineNumber>
                    <DiffCellContent $type={line.right.type}>
                      {renderCellContent(line, 'right')}
                    </DiffCellContent>
                  </DiffCell>
                </DiffTableRow>
              ))
            ) : (
              <DiffTableRow>
                <DiffCell $type="empty" $isLeft>
                  <EmptyState>请选择要对比的版本</EmptyState>
                </DiffCell>
                <DiffCell $type="empty">
                  <EmptyState>请选择要对比的版本</EmptyState>
                </DiffCell>
              </DiffTableRow>
            )}
          </DiffTableBody>
        </DiffTableContainer>
      </DiffContentArea>
    </DiffModeContainer>
  )
}
