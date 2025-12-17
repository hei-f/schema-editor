import styled from 'styled-components'
import {
  ModernDropdownContainer,
  ModernDropdownItem,
  ModernDropdownItemContent,
  ModernDropdownList,
} from '../shared/modern-dropdown.styles'

/**
 * 主题下拉容器
 * 继承现代化下拉样式
 */
export const ThemeDropdownContainer = styled(ModernDropdownContainer)`
  width: 200px;
`

/**
 * 主题列表容器
 */
export const ThemeDropdownList = styled(ModernDropdownList)`
  max-height: 300px;
`

/**
 * 主题列表项
 * 继承现代化菜单项的交互效果
 */
export const ThemeDropdownItem = styled(ModernDropdownItem)<{ $isActive: boolean }>`
  /* 主题选择特定的样式可以在这里覆盖 */
`

/**
 * 主题菜单项内容容器
 */
export const ThemeDropdownItemContent = styled(ModernDropdownItemContent)`
  /* 保持统一的 gap 布局 */
`

/**
 * 主题选中标记
 */
export const ThemeDropdownCheck = styled.span`
  font-size: 16px;
  font-weight: bold;
  flex-shrink: 0;
`
