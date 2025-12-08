import { ConfigProvider } from 'antd'
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

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

// 重新导出所有 @testing-library/react 的内容
export * from '@testing-library/react'

// 覆盖默认的 render 函数
export { customRender as render }
