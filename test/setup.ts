import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    onInstalled: {
      addListener: vi.fn(),
    },
    onStartup: {
      addListener: vi.fn(),
    },
  },
  storage: {
    local: {
      get: vi.fn((_keys: any) => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      remove: vi.fn(() => Promise.resolve()),
    },
  },
  tabs: {
    sendMessage: vi.fn(() => Promise.resolve()),
    query: vi.fn(() => Promise.resolve([])),
  },
  action: {
    onClicked: {
      addListener: vi.fn(),
    },
    setTitle: vi.fn(() => Promise.resolve()),
    setIcon: vi.fn(() => Promise.resolve()),
  },
} as any

// Mock window.postMessage
global.postMessage = vi.fn()

// Suppress console errors in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
}

// Mock window.matchMedia (required by Ant Design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (used by ScrollableParams)
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(callback: IntersectionObserverCallback) {
    // 立即调用回调以模拟初始状态
    setTimeout(() => {
      callback([], this)
    }, 0)
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

global.IntersectionObserver = MockIntersectionObserver

// Mock ResizeObserver (used by ScrollableParams)
class MockResizeObserver implements ResizeObserver {
  constructor(_callback: ResizeObserverCallback) {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

global.ResizeObserver = MockResizeObserver

// Fix cssstyle issue with CSS variables in jsdom
// cssstyle库在处理antd的CSS变量时会抛出错误，需要包装CSSStyleDeclaration.setProperty
const originalSetProperty = CSSStyleDeclaration.prototype.setProperty
CSSStyleDeclaration.prototype.setProperty = function (
  property: string,
  value: string | null,
  priority?: string
) {
  try {
    return originalSetProperty.call(this, property, value, priority ?? '')
  } catch {
    // 忽略 CSS 变量导致的错误
  }
}

// Suppress getComputedStyle pseudo-element warnings from jsdom
// jsdom不完全支持伪元素，但项目中不使用伪元素，可以安全地抑制警告
const originalGetComputedStyle = window.getComputedStyle
window.getComputedStyle = function (element: Element, pseudoElement?: string | null) {
  // 伪元素在测试中不会被使用，直接返回空样式对象
  if (pseudoElement) {
    return {} as CSSStyleDeclaration
  }
  return originalGetComputedStyle(element)
} as typeof window.getComputedStyle

// Mock shadowRootManager for tests
vi.mock('@/shared/utils/shadow-root-manager', () => {
  const mockContainer = document.createElement('div')
  const mockShadowRoot = mockContainer.attachShadow({ mode: 'open' })

  return {
    shadowRootManager: {
      init: vi.fn(),
      get: vi.fn(() => mockShadowRoot),
      getContainer: vi.fn(() => mockContainer),
      reset: vi.fn(),
    },
  }
})
