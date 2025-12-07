import { useCallback } from 'react'
import type { FormInstance } from 'antd'
import type { SectionKey } from '../config/field-config'
import type { SettingsStorage } from '../types'

interface UseResetConfigProps {
  form: FormInstance
  storage: SettingsStorage
  /** 主题色变化回调（需要在 Form 外部使用，所以需要单独通知） */
  onThemeColorChange?: (color: string) => void
  showSuccess: (msg: string) => void
}

interface UseResetConfigReturn {
  /** 恢复指定卡片的默认配置 */
  resetSectionToDefault: (sectionKey: SectionKey) => Promise<void>
  /** 恢复全部默认配置 */
  resetAllToDefault: () => Promise<void>
}

/**
 * 重置配置 Hook
 * 处理恢复默认配置的逻辑
 */
export const useResetConfig = (props: UseResetConfigProps): UseResetConfigReturn => {
  const { form, storage, onThemeColorChange, showSuccess } = props

  /**
   * 恢复指定卡片的默认配置
   */
  const resetSectionToDefault = useCallback(
    async (sectionKey: SectionKey) => {
      const defaultValues = await storage.resetSectionToDefault(sectionKey)
      form.setFieldsValue(defaultValues)

      // 通知主题色变化（用于 ConfigProvider）
      const themeColor = defaultValues.themeColor as string | undefined
      if (themeColor && onThemeColorChange) {
        onThemeColorChange(themeColor)
      }

      showSuccess('已恢复默认配置')
    },
    [form, storage, onThemeColorChange, showSuccess]
  )

  /**
   * 恢复全部默认配置
   */
  const resetAllToDefault = useCallback(async () => {
    const defaultValues = await storage.resetAllToDefault()
    form.setFieldsValue(defaultValues)

    // 通知主题色变化（用于 ConfigProvider）
    const themeColor = defaultValues.themeColor as string | undefined
    if (themeColor && onThemeColorChange) {
      onThemeColorChange(themeColor)
    }

    showSuccess('已恢复全部默认配置')
  }, [form, storage, onThemeColorChange, showSuccess])

  return {
    resetSectionToDefault,
    resetAllToDefault,
  }
}
