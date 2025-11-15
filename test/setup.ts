import '@testing-library/jest-dom'

// Mock Chrome API
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn((path: string) => `chrome-extension://test-id/${path}`)
  },
  storage: {
    local: {
      get: jest.fn((_keys: any) => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve())
    }
  },
  tabs: {
    sendMessage: jest.fn()
  }
} as any

// Mock window.postMessage
global.postMessage = jest.fn()

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn()
}

