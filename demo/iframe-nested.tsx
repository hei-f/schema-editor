import { createRoot } from 'react-dom/client'

/**
 * 中间层 iframe 应用
 * 仅作为嵌套结构，不处理 Schema 请求
 * Alt 键状态由 content script 自动转发
 */
function NestedIframeApp() {
  const isTopFrame = window === window.top

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, background: '#fffbe6' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid #ffc069',
        }}
      >
        <h4 style={{ color: '#d46b08', margin: '0 0 4px 0', fontSize: 14 }}>
          🔗 中间层 iframe（第 2 层）
        </h4>
        <p style={{ color: '#fa8c16', fontSize: 12, margin: 0 }}>
          嵌套测试。window.top: {isTopFrame ? '是顶层' : '不是顶层'}
        </p>
      </div>

      <div
        style={{
          background: '#fff7e6',
          border: '1px solid #ffc069',
          borderRadius: 6,
          padding: 10,
          marginBottom: 12,
          fontSize: 11,
        }}
      >
        ✅ Alt 键状态由 content script 自动转发到子 iframe
      </div>

      <div
        style={{
          border: '2px dashed #ffc069',
          borderRadius: 8,
          padding: 12,
          background: '#fff',
        }}
      >
        <h5 style={{ color: '#d46b08', fontSize: 12, margin: '0 0 8px 0' }}>
          📦 内层 iframe（第 3 层）- 使用 SDK
        </h5>
        <iframe
          src="/iframe-app.html"
          title="内层 iframe"
          style={{
            width: '100%',
            height: 350,
            border: '1px solid #ffc069',
            borderRadius: 4,
            background: '#fff',
          }}
        />
      </div>
    </div>
  )
}

// 渲染应用
createRoot(document.getElementById('root')!).render(<NestedIframeApp />)
