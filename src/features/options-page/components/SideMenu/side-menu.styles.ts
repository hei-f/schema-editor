import { MENU_COLLAPSED_WIDTH, MENU_EXPANDED_WIDTH } from '../../config/menu-config'
import styled, { css, keyframes } from 'styled-components'

/** 渐变流动动画 */
const gradientFlow = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

/** 光晕脉动动画 */
const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.6;
    filter: blur(60px);
  }
  50% {
    opacity: 0.9;
    filter: blur(80px);
  }
`

/** 菜单容器 - 固定定位 */
export const MenuContainer = styled.div<{ $collapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${(props) => (props.$collapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH)}px;
  z-index: 100;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

/** 动态渐变背景层 */
export const GradientBackground = styled.div`
  position: absolute;
  inset: -50%;
  background: linear-gradient(
    -45deg,
    #e8d5eb,
    #d5e5f7,
    #e0d5f7,
    #f7d5e8,
    #d5f0f7,
    #e8d5f7,
    #f7e5d5
  );
  background-size: 400% 400%;
  animation: ${gradientFlow} 15s ease infinite;
  z-index: -2;
`

/** 霓虹光晕效果层 */
export const NeonGlowLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    animation: ${glowPulse} 4s ease-in-out infinite;
  }

  &::before {
    width: 200px;
    height: 200px;
    top: -50px;
    left: -50px;
    background: radial-gradient(circle, rgba(180, 130, 220, 0.6) 0%, transparent 70%);
    animation-delay: 0s;
  }

  &::after {
    width: 180px;
    height: 180px;
    bottom: 50px;
    right: -40px;
    background: radial-gradient(circle, rgba(130, 180, 240, 0.6) 0%, transparent 70%);
    animation-delay: 2s;
  }
`

/** 额外光晕层 */
export const ExtraGlowLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    width: 160px;
    height: 160px;
    top: 40%;
    left: 20%;
    background: radial-gradient(circle, rgba(240, 150, 180, 0.5) 0%, transparent 70%);
    border-radius: 50%;
    animation: ${glowPulse} 5s ease-in-out infinite;
    animation-delay: 1s;
  }
`

/** 毛玻璃层 */
export const GlassLayer = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.5);
  z-index: 0;
`

/** 菜单内容区域 */
export const MenuContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 0;
`

/** 菜单头部 */
export const MenuHeader = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'space-between')};
  padding: ${(props) => (props.$collapsed ? '12px 0' : '12px 16px')};
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`

/** 菜单标题 */
export const MenuTitle = styled.span<{ $collapsed: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : 'auto')};
  transition:
    opacity 0.2s ease,
    width 0.2s ease;
`

/** 折叠按钮 */
export const CollapseButton = styled.button<{ $collapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #1677ff;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$collapsed ? 'rotate(180deg)' : 'rotate(0deg)')};
  }
`

/** 菜单列表容器 */
export const MenuList = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 8px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }
`

/** 菜单项基础样式 */
const menuItemBase = css`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: inherit;
  }

  &:hover::before {
    opacity: 1;
  }
`

/** 菜单项 */
export const MenuItem = styled.div<{ $active?: boolean; $collapsed: boolean }>`
  ${menuItemBase}
  margin-bottom: 4px;
  justify-content: ${(props) => (props.$collapsed ? 'center' : 'flex-start')};

  ${(props) =>
    props.$active &&
    css`
      background: linear-gradient(135deg, rgba(22, 119, 255, 0.15), rgba(22, 119, 255, 0.08));

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 20px;
        background: linear-gradient(180deg, #1677ff, #4096ff);
        border-radius: 0 2px 2px 0;
      }
    `}

  &:hover {
    transform: translateX(2px);
  }
`

/** 菜单项图标 */
export const MenuItemIcon = styled.span<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 16px;
  color: ${(props) => (props.$active ? '#1677ff' : '#666')};
  transition: color 0.2s ease;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
`

/** 菜单项文字 */
export const MenuItemText = styled.span<{ $collapsed: boolean; $active?: boolean }>`
  margin-left: 12px;
  font-size: 13px;
  font-weight: ${(props) => (props.$active ? 500 : 400)};
  color: ${(props) => (props.$active ? '#1677ff' : '#333')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  width: ${(props) => (props.$collapsed ? 0 : 'auto')};
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
`

/** 展开箭头 */
export const ExpandArrow = styled.span<{ $expanded: boolean; $collapsed: boolean }>`
  margin-left: auto;
  display: flex;
  align-items: center;
  color: #999;
  font-size: 10px;
  opacity: ${(props) => (props.$collapsed ? 0 : 1)};
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;

  svg {
    transition: transform 0.2s ease;
    transform: ${(props) => (props.$expanded ? 'rotate(90deg)' : 'rotate(0deg)')};
  }
`

/** 子菜单容器 */
export const SubMenuContainer = styled.div<{ $expanded: boolean; $collapsed: boolean }>`
  overflow: hidden;
  max-height: ${(props) => (props.$expanded && !props.$collapsed ? '500px' : '0')};
  opacity: ${(props) => (props.$expanded && !props.$collapsed ? 1 : 0)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: ${(props) => (props.$collapsed ? 0 : '20px')};
`

/** 子菜单项 */
export const SubMenuItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: ${(props) => (props.$active ? '#1677ff' : '#666')};
  background: ${(props) => (props.$active ? 'rgba(22, 119, 255, 0.08)' : 'transparent')};
  transition: all 0.2s ease;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${(props) => (props.$active ? '#1677ff' : '#ccc')};
    transition: all 0.2s ease;
  }

  &:hover {
    color: #1677ff;
    background: rgba(22, 119, 255, 0.06);

    &::before {
      background: #1677ff;
      transform: translateY(-50%) scale(1.2);
    }
  }
`

/** 子菜单项文字 */
export const SubMenuItemText = styled.span`
  margin-left: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
