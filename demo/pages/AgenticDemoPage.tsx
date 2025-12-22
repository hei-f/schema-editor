import React, { useState, useRef, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { BubbleList, MarkdownInputField } from '@ant-design/agentic-ui'
import type { MessageBubbleData } from '@ant-design/agentic-ui'
import { useSchemaElementEditor } from '@schema-element-editor/host-sdk'
import { useLatest } from '@/shared/hooks/useLatest'

/** 页面容器 */
const AgenticDemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px - 48px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
`

/** 对话区域 */
const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`

/** 输入区域 */
const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
`

/** 扩展的消息数据接口 */
interface RichMessageData extends MessageBubbleData {
  typing?: boolean
  extra?: {
    model?: string
    duration?: number
    confidence?: number
    status?: 'success' | 'in_progress' | 'error'
    priority?: 'high' | 'medium' | 'low'
    customTags?: string[]
    tokens?: number
    liked?: boolean
    disliked?: boolean
  }
}

/** 初始欢迎消息（包含所有数据类型演示） */
const WELCOME_MESSAGE: RichMessageData = {
  id: 'welcome',
  role: 'assistant',
  content: `👋 欢迎使用 **Agentic UI Demo**！

这是一个展示 Schema Element Editor 插件接入的演示页面，包含所有常见的 Markdown 数据类型。

## ✨ 核心特性

1. 💬 **流式 AI 响应** - 模拟真实的 AI 打字效果
2. 🎨 **丰富的元数据** - 显示模型、耗时、置信度等信息
3. ✏️ **实时编辑** - 按住 Alt/Option 悬停消息气泡，点击编辑

### 代码示例
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`
}
console.log(greet("World"))
\`\`\`

### 数据表格
| 功能 | 状态 | 优先级 |
|------|------|--------|
| 流式输出 | ✅ 已完成 | 高 |
| 元数据展示 | ✅ 已完成 | 高 |

### 任务清单
- [x] 实现流式返回效果
- [x] 添加丰富的元数据
- [ ] 等待你的体验反馈

### 性能指标
- **响应速度**: 提升 40%
- **内存占用**: 减少 30%
- **用户体验**: 提升 50%

> 💡 试试发送一条消息，体验流式响应效果！`,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  extra: {
    model: 'GPT-4o',
    duration: 1200,
    confidence: 0.98,
    status: 'success',
    priority: 'high',
    customTags: ['欢迎', '演示', '所有类型'],
    tokens: 256,
  },
}

/** 生成唯一 ID */
const generateId = (): string => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

/** 创建消息 */
const createMessage = (
  role: 'user' | 'assistant',
  content: string,
  isFinished = true,
  extra?: RichMessageData['extra']
): RichMessageData => {
  const now = Date.now()
  return {
    id: generateId(),
    role,
    content,
    createAt: now,
    updateAt: now,
    isFinished,
    extra,
  }
}

/** 生成综合响应内容（包含所有数据类型） */
const generateComprehensiveResponse = (userQuestion: string): string => {
  return `收到你的问题："${userQuestion}"，让我为你详细解答。

## 📝 问题分析

我理解你的需求，让我从以下几个方面来回答：

1. 首先分析问题的核心要点
2. 然后提供具体的解决方案
3. 最后给出实施建议

### 代码实现
\`\`\`javascript
// 解决方案示例
function solution(input) {
  const result = input.map(x => x * 2)
  return result.filter(x => x > 10)
}
console.log(solution([5, 8, 12]))
\`\`\`

### 执行步骤
| 步骤 | 操作 | 预计时间 |
|------|------|----------|
| 1 | 准备环境 | 5分钟 |
| 2 | 执行处理 | 10分钟 |
| 3 | 验证结果 | 5分钟 |

### 任务清单
- [x] 需求分析完成
- [x] 方案设计完成
- [ ] 等待你的确认

### 关键指标
- **处理速度**: 提升 40%
- **资源占用**: 减少 30%
- **准确率**: 达到 95%

> 💡 建议先在测试环境验证，确认无误后再部署到生产环境。

以上就是我的分析和建议，如有疑问欢迎继续提问！`
}

/** 生成随机的响应元数据 */
const generateResponseMetadata = (): RichMessageData['extra'] => {
  const models = ['GPT-4o', 'GPT-4', 'Claude-3']
  const priorities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']
  const tags = [
    ['分析', '代码', '性能'],
    ['解答', '建议', '优化'],
    ['实现', '测试', '部署'],
    ['架构', '设计', '最佳实践'],
  ]

  return {
    model: models[Math.floor(Math.random() * models.length)],
    duration: Math.floor(Math.random() * 2000) + 1000,
    confidence: 0.85 + Math.random() * 0.13,
    status: 'success',
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    customTags: tags[Math.floor(Math.random() * tags.length)],
    tokens: Math.floor(Math.random() * 200) + 100,
  }
}

interface AgenticDemoPageProps {
  siderCollapsed: boolean
}

export const AgenticDemoPage: React.FC<AgenticDemoPageProps> = () => {
  // 初始只包含欢迎消息
  const [chatList, setChatList] = useState<RichMessageData[]>([WELCOME_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 使用 useLatest 存储 chatList，避免 getSchema 的闭包陷阱
  const chatListRef = useLatest(chatList)

  /** 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight
      }
    })
  }, [])

  /** 清理流式定时器 */
  useEffect(() => {
    return () => {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current)
      }
    }
  }, [])

  /**
   * 获取 Schema 数据
   * 根据消息 ID 从 chatList 中查找对应消息的 content
   */
  const handleGetSchema = useCallback(
    (params: string): string => {
      console.log('[SchemaElementEditor] getSchema:', params)
      const message = chatListRef.current.find((msg) => msg.id === params)
      if (message) {
        const content = message.content
        return typeof content === 'string' ? content : String(content ?? '')
      }
      console.warn('[SchemaElementEditor] Message not found:', params)
      return ''
    },
    [chatListRef]
  )

  /**
   * 更新 Schema 数据
   * 根据消息 ID 更新 chatList 中对应消息的 content
   */
  const handleUpdateSchema = useCallback((schema: unknown, params: string): boolean => {
    console.log('[SchemaElementEditor] updateSchema:', { params, schema })
    setChatList((prevList) => {
      const index = prevList.findIndex((msg) => msg.id === params)
      if (index === -1) {
        console.warn('[SchemaElementEditor] Message not found for update:', params)
        return prevList
      }
      const newList = [...prevList]
      newList[index] = {
        ...newList[index],
        content: schema as string,
        updateAt: Date.now(),
      }
      return newList
    })
    return true
  }, [])

  // 接入 Schema Element Editor 插件（使用高优先级覆盖 agentic-ui 内置 SDK）
  useSchemaElementEditor({
    level: 100,
    getSchema: handleGetSchema,
    updateSchema: handleUpdateSchema,
    // 使用 null 明确阻止预览功能：
    // - 参与优先级竞争（阻止 agentic-ui 的低优先级预览响应）
    // - CHECK_PREVIEW 返回 exists: false（触发插件的内置预览器）
    renderPreview: null,
  })

  /** 处理点赞 */
  const handleLike = useCallback((bubble: MessageBubbleData) => {
    console.log('[AgenticDemo] 点赞消息:', bubble.id)
    setChatList((prev) =>
      prev.map((msg) =>
        msg.id === bubble.id
          ? {
              ...msg,
              extra: {
                ...((msg as RichMessageData).extra ?? {}),
                liked: true,
                disliked: false,
              },
            }
          : msg
      )
    )
  }, [])

  /** 处理点踩 */
  const handleDisLike = useCallback((bubble: MessageBubbleData) => {
    console.log('[AgenticDemo] 点踩消息:', bubble.id)
    setChatList((prev) =>
      prev.map((msg) =>
        msg.id === bubble.id
          ? {
              ...msg,
              extra: {
                ...((msg as RichMessageData).extra ?? {}),
                liked: false,
                disliked: true,
              },
            }
          : msg
      )
    )
  }, [])

  /** 处理发送消息 */
  const handleSend = useCallback(
    async (value: string): Promise<void> => {
      if (!value.trim() || isSending) return

      // 清理可能存在的流式定时器
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current)
        streamingTimerRef.current = null
      }

      setIsSending(true)

      // 创建并添加用户消息
      const userMessage = createMessage('user', value)
      setChatList((prev) => [...prev, userMessage])
      setInputValue('')
      scrollToBottom()

      // 模拟 AI 思考延迟
      await new Promise((resolve) => setTimeout(resolve, 600))

      // 生成包含所有类型的响应内容
      const content = generateComprehensiveResponse(value)
      const extra = generateResponseMetadata()

      // 创建初始 AI 消息（空内容，准备流式输出）
      const aiMessage = createMessage('assistant', '', false, extra)
      const aiMessageId = aiMessage.id
      aiMessage.typing = true

      setChatList((prev) => [...prev, aiMessage])
      scrollToBottom()

      // 开始流式输出
      await new Promise((resolve) => setTimeout(resolve, 100))

      // 流式输出
      await new Promise<void>((resolve) => {
        const CHARS_PER_INTERVAL = 2
        const INTERVAL_MS = 30
        let currentIndex = 0

        const streamInterval = setInterval(() => {
          currentIndex += CHARS_PER_INTERVAL

          if (currentIndex >= content.length) {
            clearInterval(streamInterval)
            streamingTimerRef.current = null

            setChatList((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content,
                      typing: false,
                      isFinished: true,
                      updateAt: Date.now(),
                    }
                  : msg
              )
            )
            scrollToBottom()
            resolve()
          } else {
            const partialContent = content.slice(0, currentIndex)
            setChatList((prev) =>
              prev.map((msg) =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      content: partialContent,
                      updateAt: Date.now(),
                    }
                  : msg
              )
            )
            scrollToBottom()
          }
        }, INTERVAL_MS)

        streamingTimerRef.current = streamInterval
      })

      setIsSending(false)
    },
    [isSending, scrollToBottom]
  )

  return (
    <AgenticDemoContainer>
      <ChatArea ref={chatAreaRef}>
        <BubbleList
          bubbleList={chatList}
          userMeta={{
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
            title: '用户',
          }}
          assistantMeta={{
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
            title: 'AI 助手',
          }}
          onLike={handleLike}
          onDisLike={handleDisLike}
        />
      </ChatArea>
      <InputArea>
        <MarkdownInputField
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder="输入消息，按 Enter 发送..."
          disabled={isSending}
          typing={isSending}
        />
      </InputArea>
    </AgenticDemoContainer>
  )
}
