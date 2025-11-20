import type { StorageData } from '@/types'

/**
 * 默认配置值
 * 项目中所有默认值的单一数据源
 */
export const DEFAULT_VALUES: Readonly<StorageData> = {
  isActive: false,
  drawerWidth: '800px',
  attributeName: 'id',
  searchConfig: {
    searchDepthDown: 5,
    searchDepthUp: 0,
    throttleInterval: 100
  },
  getFunctionName: '__getContentById',
  updateFunctionName: '__updateContentById',
  autoParseString: true,
  enableDebugLog: false,
  toolbarButtons: {
    convertToAST: true,
    convertToMarkdown: true,
    deserialize: true,
    serialize: true,
    format: true
  },
  highlightColor: '#39C5BB'
} as const

/**
 * 存储键名
 */
export const STORAGE_KEYS = {
  IS_ACTIVE: 'isActive',
  DRAWER_WIDTH: 'drawerWidth',
  ATTRIBUTE_NAME: 'attributeName',
  SEARCH_CONFIG: 'searchConfig',
  GET_FUNCTION_NAME: 'getFunctionName',
  UPDATE_FUNCTION_NAME: 'updateFunctionName',
  AUTO_PARSE_STRING: 'autoParseString',
  ENABLE_DEBUG_LOG: 'enableDebugLog',
  TOOLBAR_BUTTONS: 'toolbarButtons',
  HIGHLIGHT_COLOR: 'highlightColor'
} as const

