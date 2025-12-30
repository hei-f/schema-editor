import { fireEvent, render, screen } from '@test/test-utils'
import userEvent from '@testing-library/user-event'
import { AddPresetModal } from '../AddPresetModal'

/**
 * Mock shadowRootManager
 */
vi.mock('@/shared/utils/shadow-root-manager', () => ({
  shadowRootManager: {
    getContainer: () => document.body,
  },
}))

/**
 * 获取保存按钮
 */
const getSaveButton = () => {
  return screen.getByRole('button', { name: /保\s*存/ })
}

/**
 * 获取取消按钮
 */
const getCancelButton = () => {
  return screen.getByRole('button', { name: /取\s*消/ })
}

describe('AddPresetModal 组件测试', () => {
  const defaultProps = {
    visible: true,
    presetNameInput: '',
    themeColor: '#1890ff',
    onInputChange: vi.fn(),
    onAdd: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本渲染', () => {
    it('应该在visible为true时渲染Modal', () => {
      render(<AddPresetModal {...defaultProps} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该在visible为false时不渲染Modal内容', () => {
      render(<AddPresetModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('保存为预设配置')).not.toBeInTheDocument()
    })

    it('应该渲染输入框', () => {
      render(<AddPresetModal {...defaultProps} />)

      expect(screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')).toBeInTheDocument()
    })

    it('应该渲染保存和取消按钮', () => {
      render(<AddPresetModal {...defaultProps} />)

      expect(getSaveButton()).toBeInTheDocument()
      expect(getCancelButton()).toBeInTheDocument()
    })
  })

  describe('输入交互', () => {
    it('应该显示presetNameInput的值', () => {
      render(<AddPresetModal {...defaultProps} presetNameInput="测试预设" />)

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('测试预设')
    })

    it('应该在输入时调用onInputChange', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddPresetModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      await user.type(input, '新')

      expect(onInputChange).toHaveBeenCalledWith('新')
    })

    it('应该限制输入最大长度为50', () => {
      render(<AddPresetModal {...defaultProps} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      expect(input).toHaveAttribute('maxlength', '50')
    })

    it('应该处理空的presetNameInput', () => {
      render(<AddPresetModal {...defaultProps} presetNameInput="" />)

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('应该处理特殊字符输入', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddPresetModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      await user.type(input, '<script>')

      expect(onInputChange).toHaveBeenCalled()
    })

    it('应该处理emoji输入', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddPresetModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      await user.type(input, '😀')

      expect(onInputChange).toHaveBeenCalled()
    })
  })

  describe('按钮交互', () => {
    it('应该在点击保存按钮时调用onAdd', async () => {
      const user = userEvent.setup()
      const onAdd = vi.fn()
      render(<AddPresetModal {...defaultProps} onAdd={onAdd} />)

      const saveButton = getSaveButton()
      await user.click(saveButton)

      expect(onAdd).toHaveBeenCalled()
    })

    it('应该在点击取消按钮时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddPresetModal {...defaultProps} onClose={onClose} />)

      const cancelButton = getCancelButton()
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('应该在按下Enter键时调用onAdd', () => {
      const onAdd = vi.fn()
      render(<AddPresetModal {...defaultProps} onAdd={onAdd} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(onAdd).toHaveBeenCalled()
    })
  })

  describe('Modal关闭', () => {
    it('应该在点击Modal关闭图标时调用onClose', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddPresetModal {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('主题配置', () => {
    it('应该使用传入的主题色配置按钮样式', () => {
      render(<AddPresetModal {...defaultProps} themeColor="#ff0000" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该响应主题色变化', () => {
      const { rerender } = render(<AddPresetModal {...defaultProps} themeColor="#1890ff" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()

      rerender(<AddPresetModal {...defaultProps} themeColor="#52c41a" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该处理短格式颜色', () => {
      render(<AddPresetModal {...defaultProps} themeColor="#f00" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该处理无效颜色格式', () => {
      render(<AddPresetModal {...defaultProps} themeColor="invalid" />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })
  })

  describe('Props更新', () => {
    it('应该响应visible变化', () => {
      const { rerender } = render(<AddPresetModal {...defaultProps} visible={false} />)

      expect(screen.queryByText('保存为预设配置')).not.toBeInTheDocument()

      rerender(<AddPresetModal {...defaultProps} visible={true} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })

    it('应该响应presetNameInput变化', () => {
      const { rerender } = render(<AddPresetModal {...defaultProps} presetNameInput="预设1" />)

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe('预设1')

      rerender(<AddPresetModal {...defaultProps} presetNameInput="预设2" />)

      expect(input.value).toBe('预设2')
    })

    it('应该支持多次打开和关闭', () => {
      const { rerender } = render(<AddPresetModal {...defaultProps} visible={true} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()

      rerender(<AddPresetModal {...defaultProps} visible={false} />)
      rerender(<AddPresetModal {...defaultProps} visible={true} />)

      expect(screen.getByText('保存为预设配置')).toBeInTheDocument()
    })
  })

  describe('边界情况', () => {
    it('应该处理长文本输入', () => {
      const longText = 'a'.repeat(50)
      render(<AddPresetModal {...defaultProps} presetNameInput={longText} />)

      const input = screen.getByPlaceholderText(
        '请输入预设配置名称（不超过50字符）'
      ) as HTMLInputElement
      expect(input.value).toBe(longText)
    })

    it('应该处理中文输入', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddPresetModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      await user.type(input, '中文')

      expect(onInputChange).toHaveBeenCalled()
    })

    it('应该处理连续快速输入', async () => {
      const user = userEvent.setup()
      const onInputChange = vi.fn()
      render(<AddPresetModal {...defaultProps} onInputChange={onInputChange} />)

      const input = screen.getByPlaceholderText('请输入预设配置名称（不超过50字符）')
      await user.type(input, 'abc')

      expect(onInputChange).toHaveBeenCalledTimes(3)
    })
  })
})
