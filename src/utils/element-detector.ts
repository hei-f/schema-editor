import type { ElementAttributes, ElementPosition } from '@/types'
import { storage } from './storage'

/**
 * 检查元素是否可见
 */
export function isVisibleElement(element: HTMLElement): boolean {
  // 排除特殊元素
  const tagName = element.tagName.toLowerCase()
  if (['script', 'style', 'link', 'meta', 'head'].includes(tagName)) {
    return false
  }

  // 检查是否隐藏
  const style = window.getComputedStyle(element)
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) {
    return false
  }

  return true
}

/**
 * BFS向下搜索子元素
 */
async function searchDescendants(
  element: HTMLElement,
  maxDepth: number,
  attributeName: string
): Promise<HTMLElement[]> {
  const results: HTMLElement[] = []
  const dataAttrName = `data-${attributeName}`
  const queue: Array<{ el: HTMLElement; depth: number }> = [{ el: element, depth: 0 }]

  while (queue.length > 0) {
    const { el, depth } = queue.shift()!

    // 超过最大深度则停止
    if (depth > maxDepth) continue

    // 检查所有直接子元素
    const children = Array.from(el.children) as HTMLElement[]
    for (const child of children) {
      // 跳过不可见元素
      if (!isVisibleElement(child)) continue

      // 如果有目标属性，加入结果
      if (child.hasAttribute(dataAttrName)) {
        results.push(child)
      }

      // 继续向下搜索
      queue.push({ el: child, depth: depth + 1 })
    }
  }

  return results
}

/**
 * BFS向上搜索父元素
 */
async function searchAncestors(
  element: HTMLElement,
  maxDepth: number,
  attributeName: string
): Promise<HTMLElement[]> {
  const results: HTMLElement[] = []
  const dataAttrName = `data-${attributeName}`
  let current: HTMLElement | null = element.parentElement
  let depth = 0

  while (current && depth < maxDepth) {
    // 跳过不可见元素
    if (isVisibleElement(current) && current.hasAttribute(dataAttrName)) {
      results.push(current)
    }

    current = current.parentElement
    depth++
  }

  return results
}

/**
 * 查找带有schema-params的元素
 * 使用elementsFromPoint获取鼠标位置下的所有元素，然后向下和向上搜索
 */
export async function findElementWithSchemaParams(
  mouseX: number,
  mouseY: number
): Promise<{ target: HTMLElement | null; candidates: HTMLElement[] }> {
  const attributeName = await storage.getAttributeName()
  const searchConfig = await storage.getSearchConfig()
  const dataAttrName = `data-${attributeName}`

  // 获取鼠标位置下的所有元素
  const elementsAtPoint = document.elementsFromPoint(mouseX, mouseY) as HTMLElement[]

  const allCandidates: HTMLElement[] = []

  // 遍历每个元素
  for (const element of elementsAtPoint) {
    // 忽略扩展自己的UI元素
    if (element.closest('[data-schema-editor-ui]')) {
      continue
    }

    // 跳过不可见元素
    if (!isVisibleElement(element)) {
      continue
    }

    // 检查自身
    if (element.hasAttribute(dataAttrName)) {
      allCandidates.push(element)
    }

    // 向下搜索
    const descendants = await searchDescendants(
      element,
      searchConfig.searchDepthDown,
      attributeName
    )
    allCandidates.push(...descendants)

    // 向上搜索
    const ancestors = await searchAncestors(
      element,
      searchConfig.searchDepthUp,
      attributeName
    )
    allCandidates.push(...ancestors)
  }

  // 去重
  const uniqueCandidates = Array.from(new Set(allCandidates))

  // 过滤掉扩展UI元素
  const filteredCandidates = uniqueCandidates.filter(
    el => !el.hasAttribute('data-schema-editor-ui') && !el.closest('[data-schema-editor-ui]')
  )

  // 返回第一个找到的元素作为目标
  const target = filteredCandidates.length > 0 ? filteredCandidates[0] : null

  return { target, candidates: filteredCandidates }
}

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

/**
 * 为候选元素添加高亮效果
 */
export function addCandidateHighlight(element: HTMLElement): void {
  element.style.outline = '2px dashed rgba(24, 144, 255, 0.5)'
  element.style.outlineOffset = '2px'
  element.style.boxShadow = '0 0 5px rgba(24, 144, 255, 0.3)'
}

/**
 * 移除候选元素的高亮效果
 */
export function removeCandidateHighlight(element: HTMLElement): void {
  element.style.outline = ''
  element.style.outlineOffset = ''
  element.style.boxShadow = ''
}

