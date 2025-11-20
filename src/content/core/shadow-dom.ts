import ReactDOM from 'react-dom/client';

/**
 * 创建Shadow DOM容器并挂载React应用
 */
export const createShadowRoot = (): { container: HTMLDivElement; root: ReactDOM.Root } => {
  // 创建容器
  const container = document.createElement('div')
  container.id = 'schema-editor-root'
  container.setAttribute('data-schema-editor-ui', 'true')
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2147483646;
    pointer-events: none;
  `
  document.body.appendChild(container)

  // 创建Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' })

  // 创建样式容器
  const styleContainer = document.createElement('div')
  styleContainer.style.cssText = `
    pointer-events: auto;
  `
  shadowRoot.appendChild(styleContainer)

  // 创建React根容器
  const reactContainer = document.createElement('div')
  reactContainer.id = 'react-root'
  styleContainer.appendChild(reactContainer)

  // 创建React Root
  const root = ReactDOM.createRoot(reactContainer)

  return { container, root }
}

