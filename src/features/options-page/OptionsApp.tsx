import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { useDeferredEffect } from '@/shared/hooks/useDeferredEffect'
import type { ApiConfig, CommunicationMode } from '@/shared/types'
import { CheckCircleOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, ConfigProvider, Form, message, Popconfirm } from 'antd'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { SideMenu } from './components/SideMenu'
import { SECTION_KEYS } from './config/field-config'
import { useResetConfig, useSectionNavigation, useSettingsForm } from './hooks'
import { DataManagementSection } from './sections/DataManagementSection'
import { DebugSection } from './sections/DebugSection'
import { EditorConfigSection } from './sections/EditorConfigSection'
import { ElementDetectionSection } from './sections/ElementDetectionSection'
import { FeatureToggleSection } from './sections/FeatureToggleSection'
import { IntegrationConfigSection } from './sections/IntegrationConfigSection'
import { KeyboardShortcutsSection } from './sections/KeyboardShortcutsSection'
import { PreviewConfigSection } from './sections/PreviewConfigSection'
import { UsageGuideSection } from './sections/UsageGuideSection'
import {
  AutoSaveHint,
  BackgroundGlowLayer,
  Container,
  EdgeGlowLayer,
  HeaderActions,
  HeaderContent,
  HeaderSection,
  PageDescription,
  PageRoot,
  PageTitle,
  RightGlowLayer,
  VersionTag,
} from './styles/layout.styles'

/** 当前插件版本 */
const CURRENT_VERSION = 'v1.20.2'

/**
 * 打开GitHub Releases页面检查更新
 */
const openReleasePage = () => {
  chrome.tabs.create({
    url: 'https://github.com/hei-f/schema-editor/releases/',
    active: true,
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
  const [previewFunctionName, setPreviewFunctionName] = useState(DEFAULT_VALUES.previewFunctionName)
  const [communicationMode, setCommunicationMode] = useState<CommunicationMode>(
    DEFAULT_VALUES.apiConfig.communicationMode
  )
  const [apiConfig, setApiConfig] = useState<ApiConfig | null>(null)
  const [menuCollapsed, setMenuCollapsed] = useState(false)

  /** 光晕层 refs */
  const pageRootRef = useRef<HTMLDivElement>(null)
  const bgGlowRef = useRef<HTMLDivElement>(null)
  const edgeGlowRef = useRef<HTMLDivElement>(null)
  const rightGlowRef = useRef<HTMLDivElement>(null)

  /** Section 导航 */
  const {
    activeSection,
    expandedSections,
    toggleSectionExpanded,
    scrollToSection,
    scrollToAnchor,
  } = useSectionNavigation()

  /** 表单处理 */
  const { loadSettings, handleValuesChange } = useSettingsForm({
    form,
    onAttributeNameChange: setAttributeName,
    onGetFunctionNameChange: setGetFunctionName,
    onUpdateFunctionNameChange: setUpdateFunctionName,
    onPreviewFunctionNameChange: setPreviewFunctionName,
    onCommunicationModeChange: setCommunicationMode,
    onApiConfigChange: setApiConfig,
    showSuccess: (msg) => message.success(msg, 1.5),
    showError: (msg) => message.error(msg),
  })

  /** 重置配置 */
  const { resetSectionToDefault, resetAllToDefault } = useResetConfig({
    form,
    onAttributeNameChange: setAttributeName,
    onGetFunctionNameChange: setGetFunctionName,
    onUpdateFunctionNameChange: setUpdateFunctionName,
    onPreviewFunctionNameChange: setPreviewFunctionName,
    onCommunicationModeChange: setCommunicationMode,
    onApiConfigChange: setApiConfig,
    showSuccess: (msg) => message.success(msg),
  })

  /**
   * 为光晕层设置随机负延迟，使每次刷新从不同位置开始
   */
  useLayoutEffect(() => {
    const glowRefs = [pageRootRef, bgGlowRef, edgeGlowRef, rightGlowRef]

    glowRefs.forEach((ref) => {
      if (ref.current) {
        const randomDelay1 = -Math.random() * 40
        const randomDelay2 = -Math.random() * 40
        ref.current.style.setProperty('--glow-delay-1', `${randomDelay1}s`)
        ref.current.style.setProperty('--glow-delay-2', `${randomDelay2}s`)
      }
    })
  }, [])

  /** 加载设置 */
  useDeferredEffect(() => {
    loadSettings()
  }, [])

  /**
   * 设置页面标题
   */
  useEffect(() => {
    document.title = `Schema Editor 设置 (${CURRENT_VERSION})`
  }, [])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#39c5bb',
          colorPrimaryHover: '#5fd4cb',
          colorPrimaryActive: '#2ba89f',
          colorLink: '#39c5bb',
          colorLinkHover: '#5fd4cb',
          colorLinkActive: '#2ba89f',
        },
        components: {
          Alert: {
            colorInfo: '#39c5bb',
            colorInfoBg: '#e6fffb',
            colorInfoBorder: '#87e8de',
          },
          Button: {
            colorLink: '#39c5bb',
            colorLinkHover: '#5fd4cb',
            colorLinkActive: '#2ba89f',
            defaultHoverColor: '#5fd4cb',
            defaultHoverBorderColor: '#5fd4cb',
            defaultActiveColor: '#2ba89f',
            defaultActiveBorderColor: '#2ba89f',
          },
        },
      }}
    >
      <PageRoot ref={pageRootRef}>
        {/* 背景光晕层 */}
        <BackgroundGlowLayer ref={bgGlowRef} />
        <EdgeGlowLayer ref={edgeGlowRef} />
        <RightGlowLayer ref={rightGlowRef} />

        {/* 侧边菜单 */}
        <SideMenu
          collapsed={menuCollapsed}
          onCollapsedChange={setMenuCollapsed}
          activeSection={activeSection}
          communicationMode={communicationMode}
          onMenuClick={scrollToSection}
          onSubMenuClick={scrollToAnchor}
        />

        {/* 内容区域 */}
        <Container $menuCollapsed={menuCollapsed}>
          <HeaderSection justify="space-between" align="center" gap={16}>
            <HeaderContent>
              <PageTitle level={2}>⚙️ Schema Editor 设置</PageTitle>
              <PageDescription type="secondary">配置插件的行为参数</PageDescription>
            </HeaderContent>
            <HeaderActions align="center" gap={12}>
              <VersionTag>{CURRENT_VERSION}</VersionTag>
              <Button onClick={openReleasePage}>检查更新</Button>
            </HeaderActions>
          </HeaderSection>

          <AutoSaveHint align="center" gap={8}>
            <CheckCircleOutlined />
            <span>所有配置项通过验证后将自动保存</span>
            <Popconfirm
              title="恢复默认配置"
              description="确定要将所有配置恢复为默认值吗？"
              onConfirm={resetAllToDefault}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" icon={<UndoOutlined />}>
                恢复全部默认
              </Button>
            </Popconfirm>
          </AutoSaveHint>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleValuesChange}
            initialValues={DEFAULT_VALUES}
          >
            {/* 卡片1: 集成配置 */}
            <div id="section-integration-config">
              <IntegrationConfigSection
                communicationMode={communicationMode}
                attributeName={attributeName}
                getFunctionName={getFunctionName}
                updateFunctionName={updateFunctionName}
                previewFunctionName={previewFunctionName}
                apiConfig={apiConfig}
                isActive={expandedSections.has('section-integration-config')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-integration-config', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.INTEGRATION_CONFIG)}
              />
            </div>

            {/* 卡片2: 元素检测与高亮 */}
            <div id="section-element-detection">
              <ElementDetectionSection
                attributeName={attributeName}
                isActive={expandedSections.has('section-element-detection')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-element-detection', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.ELEMENT_DETECTION)}
              />
            </div>

            {/* 卡片3: 编辑器配置 */}
            <div id="section-editor-config">
              <EditorConfigSection
                isActive={expandedSections.has('section-editor-config')}
                onActiveChange={(active) => toggleSectionExpanded('section-editor-config', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.EDITOR_CONFIG)}
              />
            </div>

            {/* 卡片4: 功能开关 */}
            <div id="section-feature-toggle">
              <FeatureToggleSection
                isActive={expandedSections.has('section-feature-toggle')}
                onActiveChange={(active) => toggleSectionExpanded('section-feature-toggle', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.FEATURE_TOGGLE)}
              />
            </div>

            {/* 卡片5: 实时预览配置 */}
            <div id="section-preview-config">
              <PreviewConfigSection
                isActive={expandedSections.has('section-preview-config')}
                onActiveChange={(active) => toggleSectionExpanded('section-preview-config', active)}
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.PREVIEW_CONFIG)}
              />
            </div>

            {/* 卡片6: 数据管理配置 */}
            <div id="section-data-management">
              <DataManagementSection
                isActive={expandedSections.has('section-data-management')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-data-management', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DATA_MANAGEMENT)}
              />
            </div>

            {/* 卡片7: 快捷键配置 */}
            <div id="section-keyboard-shortcuts">
              <KeyboardShortcutsSection
                isActive={expandedSections.has('section-keyboard-shortcuts')}
                onActiveChange={(active) =>
                  toggleSectionExpanded('section-keyboard-shortcuts', active)
                }
                onResetDefault={() => resetSectionToDefault(SECTION_KEYS.KEYBOARD_SHORTCUTS)}
              />
            </div>

            {/* 卡片8: 开发调试 */}
            {!__IS_RELEASE_BUILD__ && (
              <div id="section-debug">
                <DebugSection
                  isActive={expandedSections.has('section-debug')}
                  onActiveChange={(active) => toggleSectionExpanded('section-debug', active)}
                  onResetDefault={() => resetSectionToDefault(SECTION_KEYS.DEBUG)}
                />
              </div>
            )}
          </Form>

          {/* 卡片10: 使用指南 */}
          <div id="section-usage-guide">
            <UsageGuideSection
              attributeName={attributeName}
              isActive={expandedSections.has('section-usage-guide')}
              onActiveChange={(active) => toggleSectionExpanded('section-usage-guide', active)}
            />
          </div>
        </Container>
      </PageRoot>
    </ConfigProvider>
  )
}
