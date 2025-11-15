import type { ElementAttributes, ElementPosition } from '@/types'
import { storage } from './storage'

/**
 * 从元素中获取目标属性
 * 从HTML data属性中读取并解析为参数数组
 */
export async function getElementAttributes(element: HTMLElement): Promise<ElementAttributes> {
  const attributeName = await storage.getAttributeName()
  const dataAttrName = `data-${attributeName}`
  const attrValue = element.getAttribute(dataAttrName)
  
  if (!attrValue) {
    return { params: [] }
  }
  
  const params = attrValue
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  
  return { params }
}

/**
 * 检查元素是否有有效的目标属性
 * 必须至少有一个参数
 */
export function hasValidAttributes(attrs: ElementAttributes): boolean {
  return attrs.params.length > 0
}

/**
 * 获取元素的位置和尺寸信息
 */
export function getElementPosition(element: HTMLElement): ElementPosition {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  }
}

/**
 * 获取鼠标位置相对于视口的坐标
 */
export function getMousePosition(event: MouseEvent): { x: number; y: number } {
  return {
    x: event.clientX,
    y: event.clientY
  }
}

/**
 * 检查点击是否在元素内
 */
export function isClickInside(
  event: MouseEvent,
  element: HTMLElement
): boolean {
  const rect = element.getBoundingClientRect()
  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  )
}

/**
 * 为元素添加高亮效果
 */
export function addHighlight(element: HTMLElement): void {
  element.style.outline = '2px solid #1890ff'
  element.style.outlineOffset = '2px'
  element.style.boxShadow = '0 0 10px rgba(24, 144, 255, 0.5)'
}

/**
 * 移除元素的高亮效果
 */
export function removeHighlight(element: HTMLElement): void {
  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.boxShadow = ''
}

