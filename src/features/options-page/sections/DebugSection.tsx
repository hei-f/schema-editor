import { FORM_PATHS } from '@/shared/constants/form-paths'
import { BulbOutlined } from '@ant-design/icons'
import { Form, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import { FormContent, FormSection, HelpTooltipIcon } from '../styles/layout.styles'
import type { SectionProps } from '../types'

/**
 * 开发调试配置区块
 * 包含调试日志等开发者选项
 */
export const DebugSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="开发调试"
      subtitle="开发者选项和诊断工具"
      icon={BulbOutlined}
      panelKey="debug"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <FormSection>
        <FormSectionLabelWithVariant id="field-log-settings">日志设置</FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                启用调试日志
                <Tooltip title="在浏览器控制台显示插件的调试日志信息">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.enableDebugLog}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </FormContent>
      </FormSection>
    </SectionCard>
  )
}
