import { FORM_PATHS } from '@/shared/constants/form-paths'
import type { CommunicationMode } from '@/shared/types'
import { Alert, Form, InputNumber, Radio, Space, Typography } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { CodeBlock, ExampleLabel, ExampleSection } from '../styles/layout.styles'

const { Text } = Typography

interface ApiConfigSectionProps {
  /** 当前通信模式 */
  communicationMode: CommunicationMode
  /** 当前获取函数名（windowFunction 模式） */
  getFunctionName: string
  /** 当前更新函数名（windowFunction 模式） */
  updateFunctionName: string
  /** 当前预览函数名（windowFunction 模式） */
  previewFunctionName: string
  /** 恢复默认回调 */
  onResetDefault?: () => void
}

/**
 * API 配置区块
 * 配置扩展与宿主页面的通信方式
 */
export const ApiConfigSection: React.FC<ApiConfigSectionProps> = (props) => {
  const { 
    communicationMode, 
    getFunctionName,
    updateFunctionName,
    previewFunctionName,
    onResetDefault 
  } = props

  return (
    <SectionCard
      title="API 配置"
      subtitle="配置扩展与宿主页面的通信方式"
      panelKey="api-config"
      onResetDefault={onResetDefault}
    >
      <Form.Item
        label="通信模式"
        name={FORM_PATHS.apiConfig.communicationMode}
        extra="选择扩展与页面的通信方式"
      >
        <Radio.Group>
          <Space direction="vertical">
            <Radio value="postMessage">
              <Text strong>postMessage 直连通信</Text>
              <Text type="secondary" style={{ marginLeft: 8 }}>（推荐）</Text>
            </Radio>
            <Radio value="windowFunction">
              <Text strong>Window 函数调用</Text>
              <Text type="warning" style={{ marginLeft: 8 }}>（已废弃）</Text>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>

      {communicationMode === 'windowFunction' && (
        <>
          <Alert
            message="Window 函数模式已废弃"
            description="此模式将在未来版本中移除，建议迁移到 postMessage 直连通信模式。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <ExampleSection>
            <ExampleLabel strong>Window 函数模式 - 宿主页面示例（已废弃）：</ExampleLabel>
            <CodeBlock>
              <span className="comment">// 核心 API（必需）</span>{'\n'}
              <span className="keyword">window</span>.<span className="function">{getFunctionName}</span> = (params) =&gt; {'{'}{'\n'}
              {'  '}<span className="comment">// params: 'param1' 或 'param1,param2'</span>{'\n'}
              {'  '}<span className="keyword">return</span> getSchema(params);{'\n'}
              {'}'};{'\n\n'}
              <span className="keyword">window</span>.<span className="function">{updateFunctionName}</span> = (schema, params) =&gt; {'{'}{'\n'}
              {'  '}saveSchema(schema, params);{'\n'}
              {'  '}<span className="keyword">return</span> <span className="attr-value">true</span>;{'\n'}
              {'}'};{'\n\n'}
              <span className="comment">// 预览 API（可选）</span>{'\n'}
              <span className="keyword">let</span> previewRoot = <span className="attr-value">null</span>;{'\n'}
              <span className="keyword">window</span>.<span className="function">{previewFunctionName}</span> = (data, container) =&gt; {'{'}{'\n'}
              {'  '}<span className="keyword">if</span> (!previewRoot) {'{'}{'\n'}
              {'    '}previewRoot = ReactDOM.<span className="function">createRoot</span>(container);{'\n'}
              {'  }'}{'\n'}
              {'  '}previewRoot.<span className="function">render</span>({'<Preview data={data} />'});{'\n'}
              {'  '}<span className="keyword">return</span> () =&gt; {'{'}{'\n'}
              {'    '}previewRoot?.<span className="function">unmount</span>();{'\n'}
              {'    '}previewRoot = <span className="attr-value">null</span>;{'\n'}
              {'  }'};{'\n'}
              {'}'};
            </CodeBlock>
          </ExampleSection>
        </>
      )}

      {communicationMode === 'postMessage' && (
        <>
          <Form.Item
            label="请求超时时间（秒）"
            name={FORM_PATHS.apiConfig.requestTimeout}
            rules={[
              { required: true, message: '请输入超时时间' },
              { type: 'number', min: 1, max: 30, message: '超时时间必须在 1-30 秒之间' }
            ]}
            extra="发送请求后等待响应的最长时间"
          >
            <InputNumber min={1} max={30} style={{ width: 120 }} addonAfter="秒" />
          </Form.Item>

          <ExampleSection>
            <ExampleLabel strong>postMessage 模式 - 宿主页面示例：</ExampleLabel>
            <CodeBlock>
              <span className="comment">// 监听扩展请求</span>{'\n'}
              <span className="keyword">window</span>.<span className="function">addEventListener</span>(<span className="string">'message'</span>, (event) =&gt; {'{'}{'\n'}
              {'  '}<span className="keyword">if</span> (event.source !== <span className="keyword">window</span>) <span className="keyword">return</span>;{'\n'}
              {'  '}<span className="keyword">if</span> (event.data?.source !== <span className="string">'schema-editor-content'</span>) <span className="keyword">return</span>;{'\n\n'}
              {'  '}<span className="keyword">const</span> {'{ type, payload, requestId }'} = event.data;{'\n'}
              {'  '}<span className="keyword">let</span> result;{'\n\n'}
              {'  '}<span className="keyword">switch</span> (type) {'{'}{'\n'}
              {'    '}<span className="keyword">case</span> <span className="string">'GET_SCHEMA'</span>:{'\n'}
              {'      '}result = {'{ success: true, data: getSchema(payload.params) }'};{'\n'}
              {'      '}<span className="keyword">break</span>;{'\n'}
              {'    '}<span className="keyword">case</span> <span className="string">'UPDATE_SCHEMA'</span>:{'\n'}
              {'      '}result = {'{ success: updateSchema(payload.schema, payload.params) }'};{'\n'}
              {'      '}<span className="keyword">break</span>;{'\n'}
              {'    '}<span className="keyword">case</span> <span className="string">'CHECK_PREVIEW'</span>:{'\n'}
              {'      '}result = {'{ exists: true }'};{'\n'}
              {'      '}<span className="keyword">break</span>;{'\n'}
              {'    '}<span className="keyword">case</span> <span className="string">'RENDER_PREVIEW'</span>:{'\n'}
              {'      '}<span className="keyword">const</span> container = <span className="keyword">document</span>.<span className="function">getElementById</span>(payload.containerId);{'\n'}
              {'      '}renderPreview(payload.schema, container);{'\n'}
              {'      '}result = {'{ success: true }'};{'\n'}
              {'      '}<span className="keyword">break</span>;{'\n'}
              {'    '}<span className="keyword">case</span> <span className="string">'CLEANUP_PREVIEW'</span>:{'\n'}
              {'      '}cleanupPreview();{'\n'}
              {'      '}result = {'{ success: true }'};{'\n'}
              {'      '}<span className="keyword">break</span>;{'\n'}
              {'  }'}{'\n\n'}
              {'  '}<span className="comment">// 发送响应（必须携带 requestId）</span>{'\n'}
              {'  '}<span className="keyword">window</span>.<span className="function">postMessage</span>({'{'}{'\n'}
              {'    '}source: <span className="string">'schema-editor-host'</span>,{'\n'}
              {'    '}requestId,{'\n'}
              {'    '}...result{'\n'}
              {'  }'},<span className="string"> '*'</span>);{'\n'}
              {'}'});
            </CodeBlock>
          </ExampleSection>
        </>
      )}
    </SectionCard>
  )
}

