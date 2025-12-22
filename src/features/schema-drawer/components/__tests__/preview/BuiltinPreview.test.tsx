import { render, waitFor } from '@test/test-utils'
import { BuiltinPreview } from '../../preview/BuiltinPreview'
import { ContentType } from '@/shared/types'

/**
 * Mock MarkdownEditor
 */
const mockUpdateNodeList = vi.fn()
const mockStore = {
  updateNodeList: mockUpdateNodeList,
}

vi.mock('@ant-design/agentic-ui', () => ({
  MarkdownEditor: ({ editorRef, initValue }: any) => {
    // 立即设置 ref，确保父组件的 useEffect 能访问到
    if (editorRef && !editorRef.current) {
      editorRef.current = { store: mockStore }
    }
    return <div data-testid="markdown-editor">{initValue || 'Editor'}</div>
  },
  parserMarkdownToSlateNode: vi.fn((markdown: string) => {
    // 模拟将Markdown字符串转为AST节点
    return {
      schema: [{ type: 'paragraph', children: [{ text: markdown }] }],
    }
  }),
  parserSlateNodeToMarkdown: vi.fn((nodes: any[]) => {
    // 模拟将AST节点转为Markdown字符串
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return ''
    const firstNode = nodes[0]
    if (
      firstNode &&
      firstNode.children &&
      Array.isArray(firstNode.children) &&
      firstNode.children[0]
    ) {
      return firstNode.children[0].text || ''
    }
    return ''
  }),
}))

describe('BuiltinPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该渲染MarkdownEditor组件', () => {
      const { getByTestId } = render(
        <BuiltinPreview editorValue='{"name":"test"}' contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })

    it('应该处理空字符串输入', () => {
      const { getByTestId } = render(
        <BuiltinPreview editorValue="" contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })
  })

  describe('RawString类型内容', () => {
    it('应该正确解析并显示RawString类型的内容', () => {
      const markdownText = '# Hello World'
      const editorValue = JSON.stringify(markdownText)

      const { getByTestId } = render(
        <BuiltinPreview editorValue={editorValue} contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })

    it('应该使用initValue初始化RawString类型内容', async () => {
      const markdownText = '# Test Title'
      const editorValue = JSON.stringify(markdownText)

      render(<BuiltinPreview editorValue={editorValue} contentType={ContentType.RawString} />)

      // 新逻辑：统一通过 updateNodeList 更新，而不是 initValue
      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalled()
      })
    })
  })

  describe('AST类型内容', () => {
    it('应该正确解析并显示AST类型的内容', async () => {
      const astNodes = [{ type: 'paragraph', children: [{ text: 'Hello' }] }]
      const editorValue = JSON.stringify(astNodes)

      render(<BuiltinPreview editorValue={editorValue} contentType={ContentType.Ast} />)

      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalledWith(astNodes)
      })
    })

    it('应该对AST类型使用空初始值', () => {
      const astNodes = [{ type: 'paragraph', children: [{ text: 'Test' }] }]
      const editorValue = JSON.stringify(astNodes)

      const { getByTestId } = render(
        <BuiltinPreview editorValue={editorValue} contentType={ContentType.Ast} />
      )

      const editor = getByTestId('markdown-editor')
      // AST类型应该使用空初始值
      expect(editor.textContent).toBe('Editor')
    })
  })

  describe('内容更新', () => {
    it('应该在editorValue变化时更新预览（RawString）', async () => {
      const initialValue = JSON.stringify('# Initial')
      const updatedValue = JSON.stringify('# Updated')

      const { rerender } = render(
        <BuiltinPreview editorValue={initialValue} contentType={ContentType.RawString} />
      )

      rerender(<BuiltinPreview editorValue={updatedValue} contentType={ContentType.RawString} />)

      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalled()
      })
    })

    it('应该在editorValue变化时更新预览（AST）', async () => {
      const initialNodes = [{ type: 'paragraph', children: [{ text: 'Initial' }] }]
      const updatedNodes = [{ type: 'paragraph', children: [{ text: 'Updated' }] }]

      const { rerender } = render(
        <BuiltinPreview editorValue={JSON.stringify(initialNodes)} contentType={ContentType.Ast} />
      )

      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalledWith(initialNodes)
      })

      vi.clearAllMocks()

      rerender(
        <BuiltinPreview editorValue={JSON.stringify(updatedNodes)} contentType={ContentType.Ast} />
      )

      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalledWith(updatedNodes)
      })
    })

    it('应该在contentType变化时正确处理', async () => {
      const value = JSON.stringify('Test content')

      const { rerender } = render(
        <BuiltinPreview editorValue={value} contentType={ContentType.RawString} />
      )

      rerender(<BuiltinPreview editorValue={value} contentType={ContentType.Ast} />)

      await waitFor(() => {
        expect(mockUpdateNodeList).toHaveBeenCalled()
      })
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的JSON格式', () => {
      const invalidJson = 'not a valid json'

      const { getByTestId } = render(
        <BuiltinPreview editorValue={invalidJson} contentType={ContentType.RawString} />
      )

      // 应该仍然渲染编辑器，不抛出错误
      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })

    it('应该处理格式错误的AST结构', () => {
      const invalidAst = '{"invalid": "structure"}'

      const { getByTestId } = render(
        <BuiltinPreview editorValue={invalidAst} contentType={ContentType.Ast} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })

    it('应该处理null或undefined的editorValue', () => {
      const { getByTestId } = render(
        <BuiltinPreview editorValue={null as any} contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })
  })

  describe('特殊字符处理', () => {
    it('应该处理包含特殊字符的Markdown', () => {
      const markdownWithSpecialChars = '# Title\\n\\nHello **World**'
      const editorValue = JSON.stringify(markdownWithSpecialChars)

      const { getByTestId } = render(
        <BuiltinPreview editorValue={editorValue} contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })

    it('应该处理包含HTML标签的内容', () => {
      const markdownWithHtml = '<div>Test</div>'
      const editorValue = JSON.stringify(markdownWithHtml)

      const { getByTestId } = render(
        <BuiltinPreview editorValue={editorValue} contentType={ContentType.RawString} />
      )

      expect(getByTestId('markdown-editor')).toBeInTheDocument()
    })
  })
})
