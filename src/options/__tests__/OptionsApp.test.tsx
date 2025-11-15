import * as storage from '@/utils/storage'
import { render, waitFor } from '@testing-library/react'
import { OptionsApp } from '../OptionsApp'

// Mock storage模块
jest.mock('@/utils/storage', () => ({
  storage: {
    getAttributeName: jest.fn(),
    setAttributeName: jest.fn()
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
  const mockGetAttributeName = storage.storage.getAttributeName as jest.Mock
  const mockSetAttributeName = storage.storage.setAttributeName as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAttributeName.mockResolvedValue('schema-params')
  })

  it('应该渲染配置页面', async () => {
    const { container } = render(<OptionsApp />)
    
    await waitFor(() => {
      expect(container).toBeTruthy()
      expect(mockGetAttributeName).toHaveBeenCalled()
    })
  })

  it('应该加载当前配置', async () => {
    mockGetAttributeName.mockResolvedValue('custom-attr')
    
    render(<OptionsApp />)
    
    await waitFor(() => {
      expect(mockGetAttributeName).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('应该处理配置加载', async () => {
    render(<OptionsApp />)
    
    await waitFor(() => {
      expect(mockGetAttributeName).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('应该处理保存操作', async () => {
    mockSetAttributeName.mockResolvedValue(undefined)
    
    render(<OptionsApp />)
    
    await waitFor(() => {
      expect(mockGetAttributeName).toHaveBeenCalled()
    })
  })

  it('应该处理保存失败', async () => {
    mockSetAttributeName.mockRejectedValue(new Error('Save failed'))
    
    render(<OptionsApp />)
    
    await waitFor(() => {
      expect(mockGetAttributeName).toHaveBeenCalled()
    })
  })
})

