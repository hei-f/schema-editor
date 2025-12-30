import { ConfigProvider } from 'antd'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import type { ConfigPreset, StorageData } from '@/shared/types'

/**
 * antd 组件使用的自定义前缀
 * 与 ContentApp 中的 prefixCls 保持一致
 */
const ANTD_PREFIX_CLS = 'see'

/**
 * 测试环境的 Providers 包装器
 * 确保测试环境与生产环境使用相同的 antd 配置
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ConfigProvider prefixCls={ANTD_PREFIX_CLS}>{children}</ConfigProvider>
}

/**
 * 自定义 render 函数
 * 自动包装 ConfigProvider 以确保 antd 组件使用正确的前缀
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

/**
 * 创建用于测试的 ConfigPreset mock 数据
 * @param overrides 需要覆盖的 ConfigPreset 属性
 * @returns 完整的 ConfigPreset 对象
 */
export const createMockConfigPreset = (
  overrides: Partial<ConfigPreset> & { config?: Partial<StorageData> } = {}
): ConfigPreset => {
  const { config = {}, ...restOverrides } = overrides
  return {
    id: 'test-preset-id',
    name: 'Test Preset',
    timestamp: Date.now(),
    config: {
      ...config,
    } as StorageData,
    ...restOverrides,
  }
}

// 重新导出所有 @testing-library/react 的内容
export * from '@testing-library/react'

// 覆盖默认的 render 函数
export { customRender as render }
