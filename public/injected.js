;(function () {
  // 检测是否已经注入，避免重复注入
  if (window.__SCHEMA_EDITOR_INJECTED__) {
    return
  }
  
  // 设置全局标记
  window.__SCHEMA_EDITOR_INJECTED__ = true

  const MESSAGE_SOURCE = {
    FROM_CONTENT: 'schema-editor-content',
    FROM_INJECTED: 'schema-editor-injected'
  }

  /** API 配置 */
  let apiConfig = {
    /** 通信模式: 'customEvent' | 'windowFunction' */
    communicationMode: 'customEvent',
    /** 请求超时时间（秒） */
    requestTimeout: 5,
    /** 请求事件名 */
    requestEventName: 'schema-editor:request',
    /** 响应事件名 */
    responseEventName: 'schema-editor:response'
  }

  /**
   * 函数名配置
   * @deprecated 仅 windowFunction 模式使用，该模式已废弃
   */
  let functionNames = {
    get: '__getContentById',
    update: '__updateContentById'
  }

  /**
   * 预览函数名
   * @deprecated 仅 windowFunction 模式使用，该模式已废弃
   */
  let previewFunctionName = '__getContentPreview'

  /** 预览容器和 React root */
  let previewContainer = null
  let previewRoot = null
  /** 用户返回的清理函数 */
  let userCleanupFn = null

  /** 预览容器 ID */
  const PREVIEW_CONTAINER_ID = 'schema-editor-preview-container'

  /** CustomEvent 请求管理（性能优化：单一持久监听器 + Map） */
  let requestCounter = 0
  const pendingRequests = new Map()
  let currentResponseEventName = null

  /**
   * 初始化或更新响应事件监听器
   * 使用单一持久监听器替代每次请求的 add/remove，提升性能
   */
  function ensureResponseListener() {
    const eventName = apiConfig.responseEventName
    if (currentResponseEventName === eventName) return
    
    // 移除旧的监听器
    if (currentResponseEventName) {
      window.removeEventListener(currentResponseEventName, handleGlobalResponse)
    }
    
    // 注册新的监听器
    window.addEventListener(eventName, handleGlobalResponse)
    currentResponseEventName = eventName
  }

  /**
   * 全局响应处理器
   */
  function handleGlobalResponse(event) {
    const { requestId } = event.detail || {}
    const pending = pendingRequests.get(requestId)
    if (pending) {
      clearTimeout(pending.timeoutId)
      pendingRequests.delete(requestId)
      pending.resolve(event.detail)
    }
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    if (!event.data || event.data.source !== MESSAGE_SOURCE.FROM_CONTENT) return

    const { type, payload } = event.data

    switch (type) {
      case 'CONFIG_SYNC':
        handleConfigSync(payload)
        break
      case 'GET_SCHEMA':
        handleGetSchema(payload)
        break
      case 'UPDATE_SCHEMA':
        handleUpdateSchema(payload)
        break
      case 'CHECK_PREVIEW_FUNCTION':
        handleCheckPreviewFunction()
        break
      case 'RENDER_PREVIEW':
        handleRenderPreview(payload)
        break
      case 'CLEAR_PREVIEW':
        handleClearPreview()
        break
      case 'HIDE_PREVIEW':
        handleHidePreview()
        break
      case 'SHOW_PREVIEW':
        handleShowPreview()
        break
      default:
        console.warn('未知的消息类型:', type)
    }
  })

  function handleConfigSync(payload) {
    const { 
      getFunctionName, 
      updateFunctionName, 
      previewFunctionName: previewFnName,
      communicationMode,
      requestTimeout,
      requestEventName,
      responseEventName
    } = payload || {}
    
    // @deprecated windowFunction 模式配置
    if (getFunctionName) {
      functionNames.get = getFunctionName
    }
    if (updateFunctionName) {
      functionNames.update = updateFunctionName
    }
    if (previewFnName) {
      previewFunctionName = previewFnName
    }
    
    // API 配置
    if (communicationMode) {
      apiConfig.communicationMode = communicationMode
    }
    if (requestTimeout) {
      apiConfig.requestTimeout = requestTimeout
    }
    if (requestEventName) {
      apiConfig.requestEventName = requestEventName
    }
    if (responseEventName) {
      apiConfig.responseEventName = responseEventName
    }
  }

  /**
   * 通过 CustomEvent 发送请求并等待响应
   * 性能优化：使用递增计数器生成 requestId，单一持久监听器管理响应
   */
  function sendCustomEventRequest(type, payload) {
    // 确保响应监听器已注册
    ensureResponseListener()
    
    return new Promise((resolve, reject) => {
      // 优化：使用递增计数器替代 Date.now() + Math.random()
      const requestId = `req-${++requestCounter}`
      const timeoutMs = apiConfig.requestTimeout * 1000
      
      const timeoutId = setTimeout(() => {
        pendingRequests.delete(requestId)
        reject(new Error(`请求超时，请检查页面是否正确监听了 ${apiConfig.requestEventName} 事件`))
      }, timeoutMs)
      
      // 存储到 Map，由全局监听器处理响应
      pendingRequests.set(requestId, { resolve, reject, timeoutId })
      
      window.dispatchEvent(new CustomEvent(apiConfig.requestEventName, {
        detail: {
          type,
          payload,
          requestId
        }
      }))
    })
  }

  /**
   * 获取 Schema（支持双模式）
   */
  async function handleGetSchema(payload) {
    const { params } = payload || {}

    if (apiConfig.communicationMode === 'customEvent') {
      // CustomEvent 模式
      try {
        const response = await sendCustomEventRequest('GET_SCHEMA', { params })
        sendResponse('SCHEMA_RESPONSE', {
          success: response.success !== false,
          data: response.data,
          error: response.error
        })
      } catch (error) {
        console.error('获取Schema失败:', error)
        sendResponse('SCHEMA_RESPONSE', {
          success: false,
          error: error.message || '获取Schema时发生错误'
        })
      }
    } else {
      // @deprecated windowFunction 模式
      try {
        const getFn = window[functionNames.get]
        if (typeof getFn !== 'function') {
          sendResponse('SCHEMA_RESPONSE', {
            success: false,
            error: `页面未提供 ${functionNames.get} 方法`
          })
          return
        }

        const schema = getFn(params)
        sendResponse('SCHEMA_RESPONSE', {
          success: true,
          data: schema
        })
      } catch (error) {
        console.error('获取Schema失败:', error)
        sendResponse('SCHEMA_RESPONSE', {
          success: false,
          error: error.message || '获取Schema时发生错误'
        })
      }
    }
  }

  /**
   * 更新 Schema（支持双模式）
   */
  async function handleUpdateSchema(payload) {
    const { schema, params } = payload || {}

    if (apiConfig.communicationMode === 'customEvent') {
      // CustomEvent 模式
      try {
        const response = await sendCustomEventRequest('UPDATE_SCHEMA', { schema, params })
        const success = response.success !== false
        sendResponse('UPDATE_RESULT', {
          success,
          message: success ? '更新成功' : '更新失败',
          error: response.error
        })
      } catch (error) {
        console.error('更新Schema失败:', error)
        sendResponse('UPDATE_RESULT', {
          success: false,
          error: error.message || '更新Schema时发生错误'
        })
      }
    } else {
      // @deprecated windowFunction 模式
      try {
        const updateFn = window[functionNames.update]
        if (typeof updateFn !== 'function') {
          sendResponse('UPDATE_RESULT', {
            success: false,
            error: `页面未提供 ${functionNames.update} 方法`
          })
          return
        }

        const result = updateFn(schema, params)
        const success = result !== false
        sendResponse('UPDATE_RESULT', {
          success,
          message: success ? '更新成功' : '更新失败'
        })
      } catch (error) {
        console.error('更新Schema失败:', error)
        sendResponse('UPDATE_RESULT', {
          success: false,
          error: error.message || '更新Schema时发生错误'
        })
      }
    }
  }

  /**
   * 检查预览函数是否存在（支持双模式）
   */
  async function handleCheckPreviewFunction() {
    if (apiConfig.communicationMode === 'customEvent') {
      // CustomEvent 模式：发送检查请求
      try {
        const response = await sendCustomEventRequest('CHECK_PREVIEW', {})
        sendResponse('PREVIEW_FUNCTION_RESULT', {
          exists: response.exists === true
        })
      } catch (error) {
        // 超时或错误时认为不存在
        sendResponse('PREVIEW_FUNCTION_RESULT', {
          exists: false
        })
      }
    } else {
      // @deprecated windowFunction 模式
      const previewFn = window[previewFunctionName]
      sendResponse('PREVIEW_FUNCTION_RESULT', {
        exists: typeof previewFn === 'function'
      })
    }
  }

  /**
   * 渲染预览内容（支持双模式）
   */
  async function handleRenderPreview(payload) {
    const { data, position } = payload || {}

    // 创建或更新预览容器
    if (!previewContainer) {
      createPreviewContainer(position)
    } else {
      updatePreviewPosition(position)
    }

    if (apiConfig.communicationMode === 'customEvent') {
      // CustomEvent 模式：通知宿主渲染预览
      try {
        const response = await sendCustomEventRequest('RENDER_PREVIEW', { 
          data, 
          containerId: PREVIEW_CONTAINER_ID 
        })
        
        // 如果宿主返回了清理函数标记，记录下来
        if (response.hasCleanup) {
          userCleanupFn = async () => {
            try {
              await sendCustomEventRequest('CLEANUP_PREVIEW', { containerId: PREVIEW_CONTAINER_ID })
            } catch (e) {
              console.warn('清理预览失败:', e)
            }
          }
        }
      } catch (error) {
        console.error('渲染预览失败:', error)
        if (previewContainer) {
          previewContainer.innerHTML = `
            <div style="color: red; padding: 20px;">
              <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
              <div style="font-size: 12px;">${error.message || '未知错误'}</div>
            </div>
          `
        }
      }
    } else {
      // @deprecated windowFunction 模式
      try {
        const previewFn = window[previewFunctionName]
        if (typeof previewFn !== 'function') {
          return
        }
        renderPreviewContent(data, previewFn)
      } catch (error) {
        console.error('渲染预览失败:', error)
      }
    }
  }

  /**
   * 创建预览容器
   */
  function createPreviewContainer(position) {
    previewContainer = document.createElement('div')
    previewContainer.id = PREVIEW_CONTAINER_ID
    previewContainer.style.cssText = `
      position: fixed;
      left: ${position.left}px;
      top: ${position.top}px;
      width: ${position.width}px;
      height: ${position.height}px;
      z-index: 2147483646;
      background: #f5f5f5;
      border-right: 1px solid #e8e8e8;
      overflow: auto;
      padding: 16px;
      box-sizing: border-box;
    `
    
    document.body.appendChild(previewContainer)
  }

  /**
   * 更新预览容器位置
   */
  function updatePreviewPosition(position) {
    if (!previewContainer) return
    
    previewContainer.style.left = `${position.left}px`
    previewContainer.style.top = `${position.top}px`
    previewContainer.style.width = `${position.width}px`
    previewContainer.style.height = `${position.height}px`
  }

  /**
   * 渲染预览内容
   * @deprecated 仅 windowFunction 模式使用
   */
  function renderPreviewContent(data, previewFn) {
    if (!previewContainer) return
    
    try {
      const fn = previewFn || window[previewFunctionName]
      if (typeof fn !== 'function') {
        console.error('预览函数不存在')
        return
      }
      
      const result = fn(data, previewContainer)
      
      if (typeof result === 'function') {
        userCleanupFn = result
        return
      }
      
      if (result === null || result === undefined) {
        return
      }
      
      const reactNode = result
      
      if (window.ReactDOM) {
        if (window.ReactDOM.createRoot) {
          if (!previewRoot) {
            previewRoot = window.ReactDOM.createRoot(previewContainer)
          }
          previewRoot.render(reactNode)
        } 
        else if (window.ReactDOM.render) {
          window.ReactDOM.render(reactNode, previewContainer)
        }
      } else {
        console.warn('ReactDOM 不可用，尝试直接设置 HTML')
        if (typeof reactNode === 'string') {
          previewContainer.innerHTML = reactNode
        } else {
          previewContainer.innerHTML = '<div style="color: #999;">无法渲染预览内容（ReactDOM 不可用）</div>'
        }
      }
    } catch (error) {
      console.error('渲染预览内容失败:', error)
      previewContainer.innerHTML = `
        <div style="color: red; padding: 20px;">
          <div style="font-weight: bold; margin-bottom: 8px;">预览渲染错误</div>
          <div style="font-size: 12px;">${error.message || '未知错误'}</div>
        </div>
      `
    }
  }

  /**
   * 隐藏预览容器（拖拽时使用）
   */
  function handleHidePreview() {
    if (previewContainer) {
      previewContainer.style.display = 'none'
    }
  }

  /**
   * 显示预览容器（拖拽结束后使用）
   */
  function handleShowPreview() {
    if (previewContainer) {
      previewContainer.style.display = 'block'
    }
  }

  /**
   * 清除预览
   */
  async function handleClearPreview() {
    try {
      // 调用用户返回的清理函数
      if (userCleanupFn) {
        try {
          if (typeof userCleanupFn === 'function') {
            await userCleanupFn()
          }
        } catch (e) {
          console.warn('执行用户清理函数失败:', e)
        }
        userCleanupFn = null
      }
      
      // 清理 React root（windowFunction 模式）
      if (previewRoot) {
        if (previewRoot.unmount) {
          previewRoot.unmount()
        } else if (previewRoot._internalRoot) {
          window.ReactDOM.unmountComponentAtNode(previewContainer)
        }
        previewRoot = null
      }
      
      // 移除容器
      if (previewContainer && previewContainer.parentNode) {
        previewContainer.parentNode.removeChild(previewContainer)
      }
      previewContainer = null
    } catch (error) {
      console.error('清除预览失败:', error)
    }
  }

  function sendResponse(type, payload) {
    window.postMessage(
      {
        source: MESSAGE_SOURCE.FROM_INJECTED,
        type,
        payload
      },
      '*'
    )
  }

  sendResponse('INJECTED_READY', { ready: true })
})()
