import { describe, it, expect, beforeEach } from 'vitest'
import { presetManager } from '../preset-manager'
import type { ConfigPreset, StorageData } from '@/shared/types'
import { DEFAULT_VALUES } from '@/shared/constants/defaults'

describe('PresetManager', () => {
  let mockPresets: ConfigPreset[]
  let mockConfig: StorageData

  beforeEach(() => {
    mockConfig = { ...DEFAULT_VALUES }
    mockPresets = []
  })

  describe('getPresets', () => {
    it('应该返回预设配置列表', async () => {
      const preset: ConfigPreset = {
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
      }
      mockPresets.push(preset)

      const result = await presetManager.getPresets(async () => mockPresets)

      expect(result).toEqual([preset])
    })

    it('应该处理空列表', async () => {
      const result = await presetManager.getPresets(async () => [])

      expect(result).toEqual([])
    })

    it('应该按创建时间降序排序（最新的在前）', async () => {
      const baseTime = Date.now()
      mockPresets.push(
        {
          id: '1',
          name: 'Old',
          config: mockConfig,
          timestamp: baseTime,
        },
        {
          id: '2',
          name: 'New',
          config: mockConfig,
          timestamp: baseTime + 1000,
        }
      )

      const result = await presetManager.getPresets(async () => mockPresets)

      // 应该按timestamp降序排列（最新的在前）
      expect(result[0].id).toBe('2')
      expect(result[1].id).toBe('1')
    })
  })

  describe('addPreset', () => {
    it('应该添加新预设配置', async () => {
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.addPreset('New Preset', mockConfig, 5, async () => mockPresets, saveFn)

      expect(mockPresets).toHaveLength(1)
      expect(mockPresets[0].name).toBe('New Preset')
      expect(mockPresets[0].config).toEqual(mockConfig)
    })

    it('达到上限时应该抛出错误', async () => {
      // 添加5个预设（达到上限）
      const baseTime = Date.now()
      for (let i = 0; i < 5; i++) {
        mockPresets.push({
          id: `preset-${i}`,
          name: `Preset ${i}`,
          config: mockConfig,
          timestamp: baseTime + i * 1000,
        })
      }

      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await expect(
        presetManager.addPreset('New Preset', mockConfig, 5, async () => mockPresets, saveFn)
      ).rejects.toThrow('已达到预设配置数量上限（5/5），请删除旧预设后再添加')

      // 预设数量不应该改变
      expect(mockPresets).toHaveLength(5)
    })
  })

  describe('updatePreset', () => {
    beforeEach(() => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
      })
    })

    it('应该更新预设配置', async () => {
      const newConfig = { ...mockConfig, drawerWidth: '1000px' }
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.updatePreset(
        'test-1',
        'Updated Name',
        newConfig,
        async () => mockPresets,
        saveFn
      )

      expect(mockPresets[0].name).toBe('Updated Name')
      expect(mockPresets[0].config.drawerWidth).toBe('1000px')
    })

    it('应该抛出错误如果预设不存在', async () => {
      await expect(
        presetManager.updatePreset(
          'non-existent',
          'New Name',
          mockConfig,
          async () => mockPresets,
          async () => {}
        )
      ).rejects.toThrow('预设配置不存在')
    })
  })

  describe('deletePreset', () => {
    beforeEach(() => {
      mockPresets.push({
        id: 'test-1',
        name: 'Test Preset',
        config: mockConfig,
        timestamp: Date.now(),
      })
    })

    it('应该删除预设配置', async () => {
      const saveFn = async (presets: ConfigPreset[]) => {
        mockPresets = presets
      }

      await presetManager.deletePreset('test-1', async () => mockPresets, saveFn)

      expect(mockPresets).toHaveLength(0)
    })

    it('应该静默处理不存在的预设', async () => {
      const initialLength = mockPresets.length

      await presetManager.deletePreset(
        'non-existent',
        async () => mockPresets,
        async (p) => {
          mockPresets = p
        }
      )

      expect(mockPresets).toHaveLength(initialLength)
    })
  })
})
