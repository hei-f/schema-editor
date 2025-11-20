import { createShadowRoot } from '../core/shadow-dom'

describe('Shadow DOM 测试', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    // 清理之前的容器
    const existing = document.getElementById('schema-editor-root')
    if (existing) {
      existing.remove()
    }
  })

  afterEach(() => {
    // 清理测试容器
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
  })

  it('应该创建容器元素', () => {
    const result = createShadowRoot()
    container = result.container
    
    expect(container).toBeTruthy()
    expect(container.id).toBe('schema-editor-root')
    expect(container.getAttribute('data-schema-editor-ui')).toBe('true')
  })

  it('应该将容器添加到 document.body', () => {
    const result = createShadowRoot()
    container = result.container
    
    expect(container.parentNode).toBe(document.body)
  })

  it('应该设置正确的样式', () => {
    const result = createShadowRoot()
    container = result.container
    
    expect(container.style.position).toBe('fixed')
    expect(container.style.zIndex).toBe('2147483646')
    expect(container.style.pointerEvents).toBe('none')
  })

  it('应该创建 Shadow DOM', () => {
    const result = createShadowRoot()
    container = result.container
    
    expect(container.shadowRoot).toBeTruthy()
    expect(container.shadowRoot?.mode).toBe('open')
  })

  it('应该创建 React 根容器', () => {
    const result = createShadowRoot()
    container = result.container
    
    const reactContainer = container.shadowRoot?.querySelector('#react-root')
    expect(reactContainer).toBeTruthy()
  })

  it('应该返回 React Root 实例', () => {
    const result = createShadowRoot()
    container = result.container
    
    expect(result.root).toBeTruthy()
    expect(typeof result.root.render).toBe('function')
  })

  it('应该在样式容器中设置正确的指针事件', () => {
    const result = createShadowRoot()
    container = result.container
    
    const styleContainer = container.shadowRoot?.firstChild as HTMLElement
    expect(styleContainer).toBeTruthy()
    expect(styleContainer.style.pointerEvents).toBe('auto')
  })
})

