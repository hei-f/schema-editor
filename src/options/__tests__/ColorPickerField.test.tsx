import { DEFAULT_VALUES } from '@/constants/defaults'
import { normalizeColorValue } from '@/utils/ui/color'
import { render, screen } from '@testing-library/react'
import { ColorPickerField } from '../ColorPickerField'

// Mock dependencies
jest.mock('@/utils/ui/color')
jest.mock('antd', () => ({
  ColorPicker: jest.fn(({ value, onChange, showText, format, presets }) => (
    <div
      data-testid="color-picker"
      data-value={value}
      data-show-text={showText}
      data-format={format}
      data-presets={presets ? JSON.stringify(presets) : undefined}
      onClick={() => {
        // 模拟颜色选择
        if (onChange) {
          const mockColor = {
            toHexString: () => '#ff0000'
          }
          onChange(mockColor)
        }
      }}
    >
      ColorPicker Mock
    </div>
  ))
}))

describe('ColorPickerField 组件测试', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(normalizeColorValue as jest.Mock).mockImplementation((value, defaultValue) => value || defaultValue)
  })

  describe('基本渲染', () => {
    it('应该正确渲染组件', () => {
      render(<ColorPickerField />)
      
      expect(screen.getByTestId('color-picker')).toBeInTheDocument()
    })

    it('应该使用规范化后的颜色值', () => {
      const testColor = '#123456'
      ;(normalizeColorValue as jest.Mock).mockReturnValue(testColor)
      
      render(<ColorPickerField value="#invalid" />)
      
      expect(normalizeColorValue).toHaveBeenCalledWith('#invalid', DEFAULT_VALUES.highlightColor)
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-value', testColor)
    })

    it('value为undefined时应使用默认值', () => {
      ;(normalizeColorValue as jest.Mock).mockReturnValue(DEFAULT_VALUES.highlightColor)
      
      render(<ColorPickerField value={undefined} />)
      
      expect(normalizeColorValue).toHaveBeenCalledWith(undefined, DEFAULT_VALUES.highlightColor)
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-value', DEFAULT_VALUES.highlightColor)
    })
  })

  describe('Props传递', () => {
    it('应该正确传递showText属性', () => {
      render(<ColorPickerField showText={false} />)
      
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-show-text', 'false')
    })

    it('showText默认为true', () => {
      render(<ColorPickerField />)
      
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-show-text', 'true')
    })

    it('应该正确传递format属性', () => {
      render(<ColorPickerField format="rgb" />)
      
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-format', 'rgb')
    })

    it('format默认为hex', () => {
      render(<ColorPickerField />)
      
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-format', 'hex')
    })

    it('应该正确传递presets属性', () => {
      const presets = [
        {
          label: '测试颜色',
          colors: ['#ff0000', '#00ff00']
        }
      ]
      
      render(<ColorPickerField presets={presets} />)
      
      expect(screen.getByTestId('color-picker')).toHaveAttribute('data-presets', JSON.stringify(presets))
    })
  })

  describe('onChange处理', () => {
    it('onChange未提供时不应报错', () => {
      render(<ColorPickerField />)
      
      expect(() => {
        screen.getByTestId('color-picker').click()
      }).not.toThrow()
    })

    it('应该处理Color对象', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      // 获取实际传递给ColorPicker的onChange
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      const mockColor = {
        toHexString: () => '#ff0000'
      }
      
      colorPickerOnChange(mockColor)
      
      expect(mockOnChange).toHaveBeenCalledWith('#ff0000')
    })

    it('应该处理字符串颜色', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      colorPickerOnChange('#00ff00')
      
      expect(mockOnChange).toHaveBeenCalledWith('#00ff00')
    })

    it('应该处理cleared状态', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      const mockClearedColor = {
        cleared: true
      }
      
      colorPickerOnChange(mockClearedColor)
      
      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_VALUES.highlightColor)
    })

    it('应该处理undefined颜色', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      colorPickerOnChange(undefined)
      
      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_VALUES.highlightColor)
    })

    it('应该处理null颜色', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      colorPickerOnChange(null)
      
      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_VALUES.highlightColor)
    })

    it('应该处理没有toHexString方法的Color对象', () => {
      const { ColorPicker } = require('antd')
      
      render(<ColorPickerField onChange={mockOnChange} />)
      
      const colorPickerOnChange = ColorPicker.mock.calls[0][0].onChange
      
      const mockInvalidColor = {
        // 没有toHexString方法
      }
      
      colorPickerOnChange(mockInvalidColor)
      
      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_VALUES.highlightColor)
    })
  })
})

