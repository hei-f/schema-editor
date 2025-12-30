import type { EditorView } from '@codemirror/view'
import { useCallback, useState } from 'react'
import {
  ContextMenuAction,
  type MenuPosition,
  type SelectionRange,
} from '../../components/context-menu/types'
import type { CodeMirrorEditorHandle } from '../../components/editor/CodeMirrorEditor'

interface UseEditorContextMenuProps {
  /** 编辑器引用 */
  editorRef: React.RefObject<CodeMirrorEditorHandle | null>
  /** 是否启用右键菜单 */
  enabled: boolean
}

interface UseEditorContextMenuReturn {
  /** 菜单是否可见 */
  menuVisible: boolean
  /** 菜单位置 */
  menuPosition: MenuPosition
  /** 选区信息 */
  selectionRange: SelectionRange | null
  /** 弹窗是否可见 */
  modalVisible: boolean
  /** 弹窗编辑内容 */
  modalContent: string
  /** 处理右键菜单事件 */
  handleContextMenu: (event: MouseEvent, view: EditorView) => void
  /** 处理选中事件（自动显示菜单） */
  handleSelection: (event: MouseEvent | null, view: EditorView, hasSelection: boolean) => void
  /** 处理菜单选择 */
  handleMenuSelect: (action: ContextMenuAction) => void
  /** 处理弹窗保存 */
  handleModalSave: (content: string) => void
  /** 关闭菜单 */
  closeMenu: () => void
  /** 关闭弹窗 */
  closeModal: () => void
}

/**
 * 编辑器右键菜单逻辑 Hook
 * 管理右键菜单和快速编辑弹窗的状态和交互逻辑
 */
export const useEditorContextMenu = (
  props: UseEditorContextMenuProps
): UseEditorContextMenuReturn => {
  const { editorRef, enabled } = props

  // 菜单状态
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 })
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null)

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false)
  const [modalContent, setModalContent] = useState<string>('')

  /**
   * 处理右键菜单事件
   */
  const handleContextMenu = useCallback(
    (event: MouseEvent, view: EditorView) => {
      if (!enabled) return

      event.preventDefault()

      // 获取选中内容
      const { selection } = view.state
      const { from, to } = selection.main
      const text = view.state.sliceDoc(from, to)

      // 保存选区信息
      setSelectionRange({ from, to, text })

      // 设置菜单位置
      setMenuPosition({ x: event.clientX, y: event.clientY })

      // 显示菜单
      setMenuVisible(true)
    },
    [enabled]
  )

  /**
   * 处理选中事件（自动显示菜单）
   */
  const handleSelection = useCallback(
    (event: MouseEvent | null, view: EditorView, hasSelection: boolean) => {
      if (!enabled) return

      if (hasSelection) {
        // 获取选中内容
        const { selection } = view.state
        const { from, to } = selection.main
        const text = view.state.sliceDoc(from, to)

        // 只有真正有内容时才显示菜单
        if (!text) return

        // 保存选区信息
        setSelectionRange({ from, to, text })

        // 计算菜单位置
        if (event) {
          // 如果是鼠标触发的选择，使用鼠标实际位置
          setMenuPosition({ x: event.clientX, y: event.clientY })
        } else {
          // 如果是非鼠标触发（如键盘选择、程序化选择），使用选区的右下角坐标
          const coords = view.coordsAtPos(to)
          if (coords) {
            setMenuPosition({ x: coords.right, y: coords.bottom })
          }
        }

        // 显示菜单
        setMenuVisible(true)
      } else {
        // 取消选中时隐藏菜单
        setMenuVisible(false)
      }
    },
    [enabled]
  )

  /**
   * 处理菜单选择
   */
  const handleMenuSelect = useCallback(
    (_action: ContextMenuAction) => {
      if (!selectionRange?.text) return

      // 设置弹窗状态
      setModalContent(selectionRange.text)
      setModalVisible(true)

      // 关闭菜单
      setMenuVisible(false)
    },
    [selectionRange]
  )

  /**
   * 处理弹窗保存
   */
  const handleModalSave = useCallback(
    (newContent: string) => {
      if (!selectionRange || !editorRef.current) {
        setModalVisible(false)
        return
      }

      // 使用 editorRef 的 replaceRange 方法替换内容
      editorRef.current.replaceRange(selectionRange.from, selectionRange.to, newContent)

      // 关闭弹窗
      setModalVisible(false)
      setModalContent('')
      setSelectionRange(null)
    },
    [selectionRange, editorRef]
  )

  /**
   * 关闭菜单
   */
  const closeMenu = useCallback(() => {
    setMenuVisible(false)
  }, [])

  /**
   * 关闭弹窗
   */
  const closeModal = useCallback(() => {
    setModalVisible(false)
    setModalContent('')
  }, [])

  return {
    menuVisible,
    menuPosition,
    selectionRange,
    modalVisible,
    modalContent,
    handleContextMenu,
    handleSelection,
    handleMenuSelect,
    handleModalSave,
    closeMenu,
    closeModal,
  }
}
