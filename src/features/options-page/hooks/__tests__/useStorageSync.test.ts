import { renderHook } from '@test/test-utils'
import { useStorageSync } from '../useStorageSync'

describe('useStorageSync Hook 测试', () => {
  let mockListener: ((changes: any, areaName: string) => void) | null = null

  const mockChromeStorage = {
    onChanged: {
      addListener: vi.fn((listener) => {
        mockListener = listener
      }),
      removeListener: vi.fn(() => {
        mockListener = null
      }),
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockListener = null
    // Mock minimal chrome.storage structure for testing
    global.chrome = {
      storage: mockChromeStorage,
    } as any
  })

  afterEach(() => {
    mockListener = null
  })

  describe('基本功能', () => {
    it('应该在挂载时添加storage监听器', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      expect(mockChromeStorage.onChanged.addListener).toHaveBeenCalledTimes(1)
      expect(mockListener).not.toBeNull()
    })

    it('应该在卸载时移除storage监听器', () => {
      const loadSettings = vi.fn()
      const { unmount } = renderHook(() => useStorageSync({ loadSettings }))

      expect(mockListener).not.toBeNull()

      unmount()

      expect(mockChromeStorage.onChanged.removeListener).toHaveBeenCalledTimes(1)
      expect(mockListener).toBeNull()
    })
  })

  describe('配置变化检测', () => {
    it('应该在local存储的配置变化时调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        theme: { oldValue: 'light', newValue: 'dark' },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })

    it('应该在多个配置同时变化时调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        theme: { oldValue: 'light', newValue: 'dark' },
        fontSize: { oldValue: 14, newValue: 16 },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })

    it('应该在sync存储变化时不调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        theme: { oldValue: 'light', newValue: 'dark' },
      }

      mockListener?.(changes, 'sync')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该在managed存储变化时不调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        theme: { oldValue: 'light', newValue: 'dark' },
      }

      mockListener?.(changes, 'managed')

      expect(loadSettings).not.toHaveBeenCalled()
    })
  })

  describe('过滤特殊键', () => {
    it('应该在草稿变化时不调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        'draft:schema1': { oldValue: null, newValue: '{}' },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该在收藏变化时不调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        favorites: { oldValue: [], newValue: [{ id: '1' }] },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该在预设配置变化时不调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        configPresets: { oldValue: [], newValue: [{ id: '1' }] },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该在混合变化时正确过滤', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      // 同时有草稿和收藏变化，但没有配置变化
      const changes = {
        'draft:schema1': { oldValue: null, newValue: '{}' },
        favorites: { oldValue: [], newValue: [] },
        configPresets: { oldValue: [], newValue: [] },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该在混合变化包含配置时调用loadSettings', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      // 同时有草稿和配置变化
      const changes = {
        'draft:schema1': { oldValue: null, newValue: '{}' },
        theme: { oldValue: 'light', newValue: 'dark' },
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })
  })

  describe('边界情况', () => {
    it('应该处理空的changes对象', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      mockListener?.({}, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该处理null的changes', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      // null应该抛出错误
      expect(() => mockListener?.(null as any, 'local')).toThrow()
    })

    it('应该处理undefined的areaName', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        theme: { oldValue: 'light', newValue: 'dark' },
      }

      mockListener?.(changes, undefined as any)

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该处理多次连续的变化', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes1 = { theme: { oldValue: 'light', newValue: 'dark' } }
      const changes2 = { fontSize: { oldValue: 14, newValue: 16 } }
      const changes3 = { editorConfig: { oldValue: {}, newValue: {} } }

      mockListener?.(changes1, 'local')
      mockListener?.(changes2, 'local')
      mockListener?.(changes3, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(3)
    })

    it('应该在loadSettings变化时更新监听器', () => {
      const loadSettings1 = vi.fn()
      const { rerender } = renderHook(({ loadSettings }) => useStorageSync({ loadSettings }), {
        initialProps: { loadSettings: loadSettings1 },
      })

      expect(mockChromeStorage.onChanged.addListener).toHaveBeenCalledTimes(1)

      const loadSettings2 = vi.fn()
      rerender({ loadSettings: loadSettings2 })

      // 应该移除旧的监听器并添加新的
      expect(mockChromeStorage.onChanged.removeListener).toHaveBeenCalledTimes(1)
      expect(mockChromeStorage.onChanged.addListener).toHaveBeenCalledTimes(2)
    })
  })

  describe('特殊键名格式', () => {
    it('应该处理以draft:开头的键', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        'draft:test': {},
        'draft:': {},
        'draft:a:b:c': {},
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).not.toHaveBeenCalled()
    })

    it('应该处理包含draft但不是前缀的键', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        notdraft: {},
        'some:draft': {},
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })

    it('应该区分favorites和其他包含favorites的键', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        myFavorites: {},
        favoritesData: {},
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })

    it('应该区分configPresets和其他包含configPresets的键', () => {
      const loadSettings = vi.fn()
      renderHook(() => useStorageSync({ loadSettings }))

      const changes = {
        myConfigPresets: {},
        configPresetsData: {},
      }

      mockListener?.(changes, 'local')

      expect(loadSettings).toHaveBeenCalledTimes(1)
    })
  })
})
