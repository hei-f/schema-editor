import type { StorageData } from '@/types'

/**
 * 存储管理器类
 * 封装Chrome Storage API，提供类型安全的存储操作
 */
class StorageManager {
  private readonly STORAGE_KEYS = {
    IS_ACTIVE: 'isActive',
    DRAWER_WIDTH: 'drawerWidth',
    ATTRIBUTE_NAME: 'attributeName'
  }

  private readonly DEFAULT_VALUES: StorageData = {
    isActive: false,
    drawerWidth: 800,
    attributeName: 'schema-params'
  }

  /**
   * 获取激活状态
   */
  async getActiveState(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.IS_ACTIVE)
      return result[this.STORAGE_KEYS.IS_ACTIVE] ?? this.DEFAULT_VALUES.isActive
    } catch (error) {
      console.error('获取激活状态失败:', error)
      return this.DEFAULT_VALUES.isActive
    }
  }

  /**
   * 设置激活状态
   */
  async setActiveState(isActive: boolean): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.IS_ACTIVE]: isActive
      })
    } catch (error) {
      console.error('设置激活状态失败:', error)
    }
  }

  /**
   * 切换激活状态
   */
  async toggleActiveState(): Promise<boolean> {
    const currentState = await this.getActiveState()
    const newState = !currentState
    await this.setActiveState(newState)
    return newState
  }

  /**
   * 获取抽屉宽度
   */
  async getDrawerWidth(): Promise<number> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.DRAWER_WIDTH)
      return result[this.STORAGE_KEYS.DRAWER_WIDTH] ?? this.DEFAULT_VALUES.drawerWidth
    } catch (error) {
      console.error('获取抽屉宽度失败:', error)
      return this.DEFAULT_VALUES.drawerWidth
    }
  }

  /**
   * 设置抽屉宽度
   */
  async setDrawerWidth(width: number): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.DRAWER_WIDTH]: width
      })
    } catch (error) {
      console.error('设置抽屉宽度失败:', error)
    }
  }

  /**
   * 获取属性名配置
   */
  async getAttributeName(): Promise<string> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEYS.ATTRIBUTE_NAME)
      return result[this.STORAGE_KEYS.ATTRIBUTE_NAME] ?? this.DEFAULT_VALUES.attributeName
    } catch (error) {
      console.error('获取属性名配置失败:', error)
      return this.DEFAULT_VALUES.attributeName
    }
  }

  /**
   * 设置属性名配置
   */
  async setAttributeName(name: string): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.ATTRIBUTE_NAME]: name
      })
    } catch (error) {
      console.error('设置属性名配置失败:', error)
    }
  }

  /**
   * 获取所有存储数据
   */
  async getAllData(): Promise<StorageData> {
    const [isActive, drawerWidth, attributeName] = await Promise.all([
      this.getActiveState(),
      this.getDrawerWidth(),
      this.getAttributeName()
    ])
    return { isActive, drawerWidth, attributeName }
  }
}

export const storage = new StorageManager()

