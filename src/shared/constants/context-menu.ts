/**
 * 右键菜单触发方式常量
 */
export const CONTEXT_MENU_TRIGGER_MODE = {
  /** 选中自动出现 */
  SELECTION: 'selection',
  /** 右键出现 */
  CONTEXT_MENU: 'contextmenu',
} as const

/**
 * 右键菜单触发方式类型
 */
export type ContextMenuTriggerMode =
  (typeof CONTEXT_MENU_TRIGGER_MODE)[keyof typeof CONTEXT_MENU_TRIGGER_MODE]
