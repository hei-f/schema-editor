import { EDITOR_THEME_OPTIONS } from '@/shared/constants/editor-themes'
import { ThemeIcon } from '@/shared/icons/drawer/title/ThemeIcon'
import type { EditorTheme } from '@/shared/types'
import { storage } from '@/shared/utils/browser/storage'
import { Dropdown, Tooltip } from 'antd'
import React from 'react'
import { DrawerTitleButton } from '../DrawerTitle/styles'
import {
  ThemeDropdownCheck,
  ThemeDropdownContainer,
  ThemeDropdownItem,
  ThemeDropdownItemContent,
  ThemeDropdownList,
} from '../../styles/toolbar/theme-dropdown.styles'

interface ThemeDropdownProps {
  editorTheme: EditorTheme
  onEditorThemeChange: (theme: EditorTheme) => void
  themeColor?: string
  showText?: boolean
}

/**
 * 主题选择下拉组件
 */
export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  editorTheme,
  onEditorThemeChange,
  themeColor = '#0066ff',
  showText = false,
}) => {
  const [open, setOpen] = React.useState(false)
  const isDark = editorTheme !== 'light'

  const handleThemeClick = (theme: EditorTheme) => {
    onEditorThemeChange(theme)
    storage.setEditorTheme(theme)
    setOpen(false)
  }

  const dropdownContent = (
    <ThemeDropdownContainer $isDark={isDark}>
      <ThemeDropdownList>
        {EDITOR_THEME_OPTIONS.map((option) => (
          <ThemeDropdownItem
            key={option.value}
            $isDark={isDark}
            $isActive={editorTheme === option.value}
            $themeColor={themeColor}
            onClick={() => handleThemeClick(option.value)}
          >
            <ThemeDropdownItemContent>
              <span style={{ flex: 1 }}>{option.label}</span>
              {editorTheme === option.value && <ThemeDropdownCheck>✓</ThemeDropdownCheck>}
            </ThemeDropdownItemContent>
          </ThemeDropdownItem>
        ))}
      </ThemeDropdownList>
    </ThemeDropdownContainer>
  )

  return (
    <Dropdown
      popupRender={() => dropdownContent}
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
    >
      <Tooltip title="切换主题">
        <DrawerTitleButton size="small" type="text" icon={<ThemeIcon />} aria-label="theme">
          {showText && '主题'}
        </DrawerTitleButton>
      </Tooltip>
    </Dropdown>
  )
}
