import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { 
  FormRowContainer, 
  InlineFormRow, 
  FormLabel, 
  ZeroMarginFormItem,
  HelpTooltipIcon
} from '../styles/layout.styles'

/**
 * 功能开关配置区块
 * 控制编辑器工具栏按钮的显示/隐藏
 */
export const FeatureToggleSection: React.FC = () => {
  return (
    <SectionCard
      title="功能开关"
      subtitle="控制编辑器工具栏按钮的显示"
      panelKey="feature-toggle"
    >
      <FormRowContainer>
        <InlineFormRow>
          <FormLabel>AST/RawString切换:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.astRawStringToggle}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>反序列化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.deserialize}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>序列化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.serialize}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>格式化:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.format}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>预览:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.preview}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
        </InlineFormRow>

        <InlineFormRow>
          <FormLabel>导入导出:</FormLabel>
          <ZeroMarginFormItem
            name={FORM_PATHS.toolbarButtons.importExport}
            valuePropName="checked"
          >
            <Switch />
          </ZeroMarginFormItem>
          <Tooltip title="在标题栏显示导入/导出按钮">
            <HelpTooltipIcon />
          </Tooltip>
        </InlineFormRow>
      </FormRowContainer>
    </SectionCard>
  )
}

