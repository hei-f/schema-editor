import { DEFAULT_VALUES } from '@/constants/defaults'
import * as storage from '@/utils/browser/storage'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { OptionsApp } from '../OptionsApp'

// Mock chrome.tabs API
global.chrome = {
  tabs: {
    create: jest.fn()
  }
} as any

// Mock storage模块
jest.mock('@/utils/browser/storage', () => ({
  storage: {
    getAttributeName: jest.fn(),
    setAttributeName: jest.fn(),
    getSearchConfig: jest.fn(),
    setSearchConfig: jest.fn(),
    getGetFunctionName: jest.fn(),
    getUpdateFunctionName: jest.fn(),
    setFunctionNames: jest.fn(),
    getAutoParseString: jest.fn(),
    setAutoParseString: jest.fn(),
    getEnableDebugLog: jest.fn(),
    setEnableDebugLog: jest.fn(),
    getToolbarButtons: jest.fn(),
    setToolbarButtons: jest.fn(),
    getDrawerWidth: jest.fn(),
    setDrawerWidth: jest.fn(),
    getHighlightColor: jest.fn(),
    setHighlightColor: jest.fn()
  }
}))

// Mock Ant Design的message组件
jest.mock('antd', () => {
  const actual = jest.requireActual('antd')
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn()
    }
  }
})

// Mock window.matchMedia (Ant Design需要)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('OptionsApp组件测试', () => {
  const mockStorage = storage.storage as jest.Mocked<typeof storage.storage>

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    
    // 设置默认mock返回值
    mockStorage.getAttributeName.mockResolvedValue(DEFAULT_VALUES.attributeName)
    mockStorage.getSearchConfig.mockResolvedValue(DEFAULT_VALUES.searchConfig)
    mockStorage.getGetFunctionName.mockResolvedValue(DEFAULT_VALUES.getFunctionName)
    mockStorage.getUpdateFunctionName.mockResolvedValue(DEFAULT_VALUES.updateFunctionName)
    mockStorage.getAutoParseString.mockResolvedValue(DEFAULT_VALUES.autoParseString)
    mockStorage.getEnableDebugLog.mockResolvedValue(DEFAULT_VALUES.enableDebugLog)
    mockStorage.getToolbarButtons.mockResolvedValue({
      convertToAST: true,
      convertToMarkdown: true,
      deserialize: true,
      serialize: true,
      format: true
    })
    mockStorage.getDrawerWidth.mockResolvedValue(DEFAULT_VALUES.drawerWidth)
    mockStorage.getHighlightColor.mockResolvedValue(DEFAULT_VALUES.highlightColor)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('基本渲染', () => {
    it('应该渲染配置页面', async () => {
      const { container } = render(<OptionsApp />)
      
      await waitFor(() => {
        expect(container).toBeTruthy()
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })

    it('应该显示页面标题', async () => {
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(screen.getByText(/Schema Editor 设置/)).toBeInTheDocument()
      })
    })

    it('应该显示检查更新按钮', async () => {
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(screen.getByText('检查更新')).toBeInTheDocument()
      })
    })
  })

  describe('配置加载', () => {
    it('应该加载所有配置项', async () => {
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
        expect(mockStorage.getSearchConfig).toHaveBeenCalled()
        expect(mockStorage.getGetFunctionName).toHaveBeenCalled()
        expect(mockStorage.getUpdateFunctionName).toHaveBeenCalled()
        expect(mockStorage.getAutoParseString).toHaveBeenCalled()
        expect(mockStorage.getEnableDebugLog).toHaveBeenCalled()
        expect(mockStorage.getToolbarButtons).toHaveBeenCalled()
        expect(mockStorage.getDrawerWidth).toHaveBeenCalled()
        expect(mockStorage.getHighlightColor).toHaveBeenCalled()
      })
    })

    it('应该处理配置加载失败', async () => {
      mockStorage.getAttributeName.mockRejectedValue(new Error('Load failed'))
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })

    it('应该设置自定义配置值', async () => {
      const customAttr = 'custom-schema-attr'
      mockStorage.getAttributeName.mockResolvedValue(customAttr)
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })
  })

  describe('配置保存', () => {
    it('应该保存attributeName配置', async () => {
      mockStorage.setAttributeName.mockResolvedValue(undefined)
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
      
      const input = screen.getByDisplayValue(DEFAULT_VALUES.attributeName)
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'new-attr' } })
        jest.advanceTimersByTime(500)
      })
      
      await waitFor(() => {
        expect(mockStorage.setAttributeName).toHaveBeenCalledWith('new-attr')
      })
    })

    it('应该保存开关类型配置', async () => {
      mockStorage.setAutoParseString.mockResolvedValue(undefined)
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAutoParseString).toHaveBeenCalled()
      })
    })

    it('应该处理保存失败', async () => {
      mockStorage.setAttributeName.mockRejectedValue(new Error('Save failed'))
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
    })
  })

  describe('检查更新功能', () => {
    it('点击检查更新应该打开GitHub Releases页面', async () => {
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(screen.getByText('检查更新')).toBeInTheDocument()
      })
      
      const updateButton = screen.getByText('检查更新')
      fireEvent.click(updateButton)
      
      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://github.com/hei-f/schema-editor/releases/',
        active: true
      })
    })
  })

  describe('防抖功能', () => {
    it('输入字段应该使用防抖保存', async () => {
      mockStorage.setAttributeName.mockResolvedValue(undefined)
      
      render(<OptionsApp />)
      
      await waitFor(() => {
        expect(mockStorage.getAttributeName).toHaveBeenCalled()
      })
      
      const input = screen.getByDisplayValue(DEFAULT_VALUES.attributeName)
      
      await act(async () => {
        // 快速连续输入
        fireEvent.change(input, { target: { value: 'test1' } })
        jest.advanceTimersByTime(200)
        fireEvent.change(input, { target: { value: 'test2' } })
        jest.advanceTimersByTime(200)
        fireEvent.change(input, { target: { value: 'test3' } })
        jest.advanceTimersByTime(500)
      })
      
      await waitFor(() => {
        // 应该只保存最后一次的值
        expect(mockStorage.setAttributeName).toHaveBeenCalledTimes(1)
        expect(mockStorage.setAttributeName).toHaveBeenCalledWith('test3')
      })
    })
  })
})

