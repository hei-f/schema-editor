/**
 * styled-components Mock
 * 用于测试环境中模拟 styled-components 的行为
 */

import React from 'react'

/**
 * Mock styled function
 * 创建一个返回简单 React 元素的组件工厂函数
 */
const mockStyled = (tag: string) => (_styles: any) => {
  const Component = ({ children, ...props }: any) => React.createElement(tag, props, children)
  Component.displayName = `styled.${tag}`
  return Component
}

/**
 * 使用 Proxy 拦截属性访问，动态创建对应 HTML 标签的 styled 组件
 */
const styledProxy = new Proxy(mockStyled, {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      return target(prop)
    }
    return target
  },
})

/**
 * styled-components 模块的 Mock 实现
 */
export const styledComponentsMock = {
  ThemeProvider: ({ children }: any) => children,
  keyframes: () => '',
  css: () => '',
  styled: styledProxy,
  default: styledProxy,
}
