import { DEFAULT_VALUES } from '@/constants/defaults'
import { storage } from '@/utils/browser/storage'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Button, Collapse, Form, Input, message, Space, Switch, Tooltip, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { ColorPickerField } from './ColorPickerField'
import {
  AutoSaveHint,
  CodeBlock,
  Container,
  ExampleLabel,
  ExampleSection,
  FullWidthInputNumber,
  HeaderActions,
  HeaderContent,
  HeaderSection,
  HelpIcon,
  PageDescription,
  PageTitle,
  SchemaNote,
  SectionTitle,
  StyledCard,
  StyledCollapse,
  VersionTag
} from './styles'

const { Panel } = Collapse

/**
 * 打开GitHub Releases页面检查更新
 */
const openReleasePage = () => {
  chrome.tabs.create({
    url: 'https://github.com/hei-f/schema-editor/releases/',
    active: true
  })
}

/**
 * 设置页面组件
 */
export const OptionsApp: React.FC = () => {
  const [form] = Form.useForm()
  const [attributeName, setAttributeName] = useState(DEFAULT_VALUES.attributeName)
  const [getFunctionName, setGetFunctionName] = useState(DEFAULT_VALUES.getFunctionName)
  const [updateFunctionName, setUpdateFunctionName] = useState(DEFAULT_VALUES.updateFunctionName)
  
  /** 防抖定时器 Map，为每个字段维护独立的定时器 */
  const timeoutMapRef = React.useRef<Map<string, NodeJS.Timeout>>(new Map())

  /**
   * 加载配置
   */
  useEffect(() => {
    loadSettings()
  }, [])


  const loadSettings = async () => {
    try {
      const name = await storage.getAttributeName()
      const searchConfig = await storage.getSearchConfig()
      const getFn = await storage.getGetFunctionName()
      const updateFn = await storage.getUpdateFunctionName()
      const autoParse = await storage.getAutoParseString()
      const debugLog = await storage.getEnableDebugLog()
      const toolbarButtons = await storage.getToolbarButtons()
      const drawerWidth = await storage.getDrawerWidth()
      const highlightColor = await storage.getHighlightColor()
      
      setAttributeName(name)
      setGetFunctionName(getFn)
      setUpdateFunctionName(updateFn)
      form.setFieldsValue({ 
        attributeName: name,
        drawerWidth: drawerWidth,
        searchDepthDown: searchConfig.searchDepthDown,
        searchDepthUp: searchConfig.searchDepthUp,
        throttleInterval: searchConfig.throttleInterval,
        getFunctionName: getFn,
        updateFunctionName: updateFn,
        autoParseString: autoParse,
        enableDebugLog: debugLog,
        toolbarButtonConvertToAST: toolbarButtons.convertToAST,
        toolbarButtonConvertToMarkdown: toolbarButtons.convertToMarkdown,
        toolbarButtonDeserialize: toolbarButtons.deserialize,
        toolbarButtonSerialize: toolbarButtons.serialize,
        toolbarButtonFormat: toolbarButtons.format,
        highlightColor: highlightColor
      })
    } catch (error) {
      message.error('加载配置失败')
    }
  }

  /**
   * 保存单个字段到存储
   */
  const saveField = React.useCallback(async (fieldName: string, allValues: any) => {
    try {
      switch (fieldName) {
        case 'attributeName':
          await storage.setAttributeName(allValues.attributeName)
          setAttributeName(allValues.attributeName)
          break
        case 'drawerWidth':
          await storage.setDrawerWidth(allValues.drawerWidth)
          break
        case 'searchDepthDown':
        case 'searchDepthUp':
        case 'throttleInterval':
          await storage.setSearchConfig({
            searchDepthDown: allValues.searchDepthDown,
            searchDepthUp: allValues.searchDepthUp,
            throttleInterval: allValues.throttleInterval
          })
          break
        case 'getFunctionName':
        case 'updateFunctionName':
          await storage.setFunctionNames(allValues.getFunctionName, allValues.updateFunctionName)
          setGetFunctionName(allValues.getFunctionName)
          setUpdateFunctionName(allValues.updateFunctionName)
          break
        case 'autoParseString':
          await storage.setAutoParseString(allValues.autoParseString)
          break
        case 'enableDebugLog':
          await storage.setEnableDebugLog(allValues.enableDebugLog)
          break
        case 'highlightColor':
          await storage.setHighlightColor(allValues.highlightColor)
          break
        case 'toolbarButtonConvertToAST':
        case 'toolbarButtonConvertToMarkdown':
        case 'toolbarButtonDeserialize':
        case 'toolbarButtonSerialize':
        case 'toolbarButtonFormat':
          await storage.setToolbarButtons({
            convertToAST: allValues.toolbarButtonConvertToAST,
            convertToMarkdown: allValues.toolbarButtonConvertToMarkdown,
            deserialize: allValues.toolbarButtonDeserialize,
            serialize: allValues.toolbarButtonSerialize,
            format: allValues.toolbarButtonFormat
          })
          break
      }
      
      message.success('已保存', 1.5)
    } catch (error) {
      message.error('保存失败')
    }
  }, [])

  /**
   * 防抖保存函数（用于Input类型字段）
   * 每个字段维护独立的定时器，避免相互干扰
   */
  const debouncedSave = React.useCallback(
    (fieldName: string, allValues: any) => {
      const existingTimeout = timeoutMapRef.current.get(fieldName)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }
      
      const newTimeout = setTimeout(async () => {
        try {
          await form.validateFields([fieldName])
          await saveField(fieldName, allValues)
        } catch (error) {
          // 验证失败，不保存，Form 会显示错误信息
        }
        timeoutMapRef.current.delete(fieldName)
      }, 500)
      
      timeoutMapRef.current.set(fieldName, newTimeout)
    },
    [saveField, form]
  )

  /**
   * 处理表单值变化
   */
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const fieldName = Object.keys(changedValues)[0]
    
    const inputFields = ['attributeName', 'drawerWidth', 'getFunctionName', 'updateFunctionName']
    const numberFields = ['searchDepthDown', 'searchDepthUp', 'throttleInterval']
    const colorFields = ['highlightColor']
    
    if (inputFields.includes(fieldName) || numberFields.includes(fieldName) || colorFields.includes(fieldName)) {
      debouncedSave(fieldName, allValues)
    } else {
      saveField(fieldName, allValues)
    }
  }

  return (
    <Container>
      <HeaderSection>
        <HeaderContent>
          <PageTitle level={2}>⚙️ Schema Editor 设置</PageTitle>
          <PageDescription type="secondary">
            配置插件的行为参数
          </PageDescription>
        </HeaderContent>
        <HeaderActions>
          <VersionTag>v1.0.10</VersionTag>
          <Button onClick={openReleasePage}>
            检查更新
          </Button>
        </HeaderActions>
      </HeaderSection>

      <StyledCard title="参数属性名配置">
        <AutoSaveHint>
          <CheckCircleOutlined />
          <span>所有配置项通过验证后将自动保存</span>
        </AutoSaveHint>
        
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={{ 
            attributeName: DEFAULT_VALUES.attributeName,
            drawerWidth: DEFAULT_VALUES.drawerWidth,
            searchDepthDown: DEFAULT_VALUES.searchConfig.searchDepthDown,
            searchDepthUp: DEFAULT_VALUES.searchConfig.searchDepthUp,
            throttleInterval: DEFAULT_VALUES.searchConfig.throttleInterval,
            getFunctionName: DEFAULT_VALUES.getFunctionName,
            updateFunctionName: DEFAULT_VALUES.updateFunctionName,
            autoParseString: DEFAULT_VALUES.autoParseString,
            enableDebugLog: DEFAULT_VALUES.enableDebugLog,
            highlightColor: DEFAULT_VALUES.highlightColor,
            toolbarButtonConvertToAST: DEFAULT_VALUES.toolbarButtons.convertToAST,
            toolbarButtonConvertToMarkdown: DEFAULT_VALUES.toolbarButtons.convertToMarkdown,
            toolbarButtonDeserialize: DEFAULT_VALUES.toolbarButtons.deserialize,
            toolbarButtonSerialize: DEFAULT_VALUES.toolbarButtons.serialize,
            toolbarButtonFormat: DEFAULT_VALUES.toolbarButtons.format
          }}
        >
          <Form.Item
            label="属性名称"
            name="attributeName"
            rules={[
              { required: true, message: '请输入属性名称' },
              { pattern: /^[a-z][a-z0-9-]*$/, message: '属性名只能包含小写字母、数字和连字符，且必须以小写字母开头' }
            ]}
            extra={`此属性名将用于从页面元素中提取参数，默认值为 ${DEFAULT_VALUES.attributeName}`}
          >
            <Input placeholder={`例如: ${DEFAULT_VALUES.attributeName}`} />
          </Form.Item>

          <SectionTitle level={5}>API函数配置</SectionTitle>
              <Form.Item
                label="获取Schema函数名"
                name="getFunctionName"
                rules={[
                  { required: true, message: '请输入函数名' },
                  { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
                ]}
                extra="页面需要提供的获取Schema数据的全局函数名"
              >
                <Input placeholder={`例如: ${DEFAULT_VALUES.getFunctionName}`} />
              </Form.Item>

              <Form.Item
                label="更新Schema函数名"
                name="updateFunctionName"
                rules={[
                  { required: true, message: '请输入函数名' },
                  { pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/, message: '必须是有效的JavaScript函数名' }
                ]}
                extra="页面需要提供的更新Schema数据的全局函数名"
              >
                <Input placeholder={`例如: ${DEFAULT_VALUES.updateFunctionName}`} />
              </Form.Item>

          <SectionTitle level={5}>搜索配置</SectionTitle>
              <Form.Item
                label="向下搜索深度"
                name="searchDepthDown"
                extra="查找子元素的最大层数，设置为 0 则不向下搜索"
              >
                <FullWidthInputNumber min={0} />
              </Form.Item>

              <Form.Item
                label="向上搜索深度"
                name="searchDepthUp"
                extra="查找父元素的最大层数，设置为 0 则不向上搜索"
              >
                <FullWidthInputNumber min={0} />
              </Form.Item>

              <Form.Item
                label="节流间隔 (毫秒)"
                name="throttleInterval"
                extra="控制鼠标移动检测频率，建议范围 8-200ms，较小值响应更快但可能影响性能"
              >
                <FullWidthInputNumber min={8} />
          </Form.Item>

          <StyledCollapse>
            <Panel header="高级" key="advanced">
              <Form.Item
                label={
                  <Space>
                    字符串自动解析
                    <Tooltip title="开启后，当获取的Schema数据为字符串时，插件会自动将其解析为Markdown Elements结构。编辑完成后保存时，会将Elements结构转换回字符串。关闭则直接显示原始字符串。">
                      <HelpIcon />
                    </Tooltip>
                  </Space>
                }
                name="autoParseString"
                valuePropName="checked"
                extra="自动将字符串类型的Schema数据解析为Markdown Elements结构进行编辑，保存时自动转换回字符串"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    启用调试日志
                    <Tooltip title="开启后，会在浏览器控制台输出插件的调试日志，如'注入成功'、'配置已同步'等信息。生产环境建议关闭。">
                      <HelpIcon />
                    </Tooltip>
                  </Space>
                }
                name="enableDebugLog"
                valuePropName="checked"
                extra="在浏览器控制台显示插件的调试日志信息"
              >
                <Switch />
              </Form.Item>
            </Panel>

            <Panel header="外观配置" key="appearance">
              <Form.Item
                label="抽屉宽度"
                name="drawerWidth"
                rules={[
                  { required: true, message: '请输入抽屉宽度' },
                  { pattern: /^\d+(%|px)$/, message: '宽度格式必须为数字+px或%，例如：800px 或 50%' }
                ]}
                extra="设置编辑器抽屉的宽度，支持像素(px)或百分比(%)单位"
              >
                <Input placeholder={`例如: ${DEFAULT_VALUES.drawerWidth} 或 50%`} />
              </Form.Item>

              <Form.Item
                label="高亮框颜色"
                name="highlightColor"
                extra="设置鼠标悬停时元素高亮框的颜色,影响边框和阴影"
              >
                <ColorPickerField
                  presets={[
                    {
                      label: '推荐颜色',
                      colors: [
                        '#39C5BB',
                        '#1890FF',
                        '#52C41A',
                        '#FAAD14',
                        '#F5222D',
                        '#722ED1',
                        '#13C2C2',
                        '#FA8C16',
                      ],
                    },
                  ]}
                />
              </Form.Item>
            </Panel>

            <Panel header="功能项配置" key="toolbarButtons">
              <Form.Item
                label="转换成AST"
                name="toolbarButtonConvertToAST"
                valuePropName="checked"
                extra="将Markdown文本解析转换为Elements数组(AST)结构，便于编辑和处理"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="转换成Markdown"
                name="toolbarButtonConvertToMarkdown"
                valuePropName="checked"
                extra="将Elements数组(AST)结构转换回Markdown文本格式"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="反序列化"
                name="toolbarButtonDeserialize"
                valuePropName="checked"
                extra="将序列化的字符串数据反序列化为可编辑的JSON对象"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="序列化"
                name="toolbarButtonSerialize"
                valuePropName="checked"
                extra="将JSON对象序列化为紧凑的字符串格式"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="格式化"
                name="toolbarButtonFormat"
                valuePropName="checked"
                extra="格式化JSON代码，添加缩进和换行，使其更易读"
              >
                <Switch />
              </Form.Item>
            </Panel>
          </StyledCollapse>
        </Form>

        <ExampleSection>
          <ExampleLabel strong>当前配置示例：</ExampleLabel>
          <CodeBlock>
            <span className="comment">&lt;!-- HTML元素属性 --&gt;</span>{'\n'}
            <span className="tag">&lt;div</span> <span className="attr-name">data-{attributeName}</span>=<span className="attr-value">"param1,param2,param3"</span><span className="tag">&gt;</span>{'\n'}
            {'  '}点击此元素{'\n'}
            <span className="tag">&lt;/div&gt;</span>{'\n\n'}
            <span className="comment">&lt;!-- 页面需要提供的全局函数 --&gt;</span>{'\n'}
            <span className="tag">&lt;script&gt;</span>{'\n'}
            {'  '}<span className="keyword">window</span>.<span className="function">{getFunctionName}</span> = <span className="keyword">function</span>(params) {'{'}{'\n'}
            {'    '}<span className="comment">// params: "param1,param2,param3"</span>{'\n'}
            {'    '}<span className="keyword">return</span> {'{'} your: <span className="string">'schema'</span> {'}'};{'\n'}
            {'  '}{'}'};{'\n\n'}
            {'  '}<span className="keyword">window</span>.<span className="function">{updateFunctionName}</span> = <span className="keyword">function</span>(schema, params) {'{'}{'\n'}
            {'    '}<span className="comment">// schema: 修改后的数据</span>{'\n'}
            {'    '}<span className="comment">// params: "param1,param2,param3"</span>{'\n'}
            {'    '}<span className="keyword">return</span> <span className="keyword">true</span>;{'\n'}
            {'  '}{'}'};{'\n'}
            <span className="tag">&lt;/script&gt;</span>
          </CodeBlock>
        </ExampleSection>
      </StyledCard>

      <StyledCard title="使用说明">
        <Typography.Paragraph>
          <ol>
            <li>
              在页面HTML元素上添加 <Typography.Text code>data-{attributeName}</Typography.Text> 属性，属性值为逗号分隔的参数字符串，例如：<Typography.Text code>"value1,value2,value3"</Typography.Text>
            </li>
            <li>
              页面需要实现两个全局函数（函数名可在上方配置）：
              <ul>
                <li><Typography.Text code>window.{getFunctionName}(params)</Typography.Text> - 获取schema数据</li>
                <li><Typography.Text code>window.{updateFunctionName}(schema, params)</Typography.Text> - 更新schema数据</li>
              </ul>
            </li>
            <li>
              激活插件后，按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键悬停在元素上查看参数
            </li>
            <li>
              按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键并点击元素，打开编辑器修改schema
            </li>
          </ol>
        </Typography.Paragraph>
      </StyledCard>

      <StyledCard title="Schema类型支持">
        <Typography.Paragraph>
          Schema编辑器支持以下数据类型：
        </Typography.Paragraph>
        <ul>
          <li><Typography.Text strong>字符串 (String)</Typography.Text>: <Typography.Text code>"hello world"</Typography.Text></li>
          <li><Typography.Text strong>数字 (Number)</Typography.Text>: <Typography.Text code>123</Typography.Text> 或 <Typography.Text code>45.67</Typography.Text></li>
          <li><Typography.Text strong>对象 (Object)</Typography.Text>: <Typography.Text code>{`{"key": "value"}`}</Typography.Text></li>
          <li><Typography.Text strong>数组 (Array)</Typography.Text>: <Typography.Text code>[1, 2, 3]</Typography.Text></li>
          <li><Typography.Text strong>布尔值 (Boolean)</Typography.Text>: <Typography.Text code>true</Typography.Text> 或 <Typography.Text code>false</Typography.Text></li>
        </ul>
        <SchemaNote type="secondary">
          注意：编辑器使用JSON格式，字符串值需要用引号包裹。null值不支持编辑。
        </SchemaNote>
      </StyledCard>
    </Container>
  )
}
