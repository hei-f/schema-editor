import { FORM_PATHS } from '@/shared/constants/form-paths'
import { EyeOutlined } from '@ant-design/icons'
import { Form, Space, Switch, Tooltip } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import {
  FixedWidthInputNumber,
  FormContent,
  FormSection,
  HelpTooltipIcon,
} from '../styles/layout.styles'
import type { SectionProps } from '../types'

/**
 * 实时预览配置区块
 * 包含预览功能的所有配置项
 */
export const PreviewConfigSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange, onResetDefault } = props

  return (
    <SectionCard
      title="实时预览配置"
      subtitle="控制预览区域的行为和显示"
      icon={EyeOutlined}
      panelKey="preview-config"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
      onResetDefault={onResetDefault}
    >
      <FormSection>
        <FormSectionLabelWithVariant id="field-preview-behavior">
          预览行为
        </FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                启用内置预览器
                <Tooltip title="当宿主页面未提供预览函数时，使用插件内置的 Markdown 预览器。支持 AST 和 RawString 类型的内容预览">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.enableBuiltinPreview}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                自动更新预览
                <Tooltip title="编辑器内容变化时自动更新预览（使用下面设置的延迟）">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.autoUpdate}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                更新防抖（毫秒）
                <Tooltip title="编辑后多久更新预览，避免频繁渲染">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.updateDelay}
          >
            <FixedWidthInputNumber min={100} max={2000} step={100} $width={120} />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                预览区域宽度
                <Tooltip title="预览区域占抽屉的百分比（20-80%）">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.previewWidth}
          >
            <FixedWidthInputNumber min={20} max={80} $width={120} suffix="%" />
          </Form.Item>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-z-index">层级配置</FormSectionLabelWithVariant>
        <FormContent>
          <Form.Item
            label={
              <Space>
                默认 z-index
                <Tooltip title="非预览模式下的层级，确保插件不被页面元素遮挡">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.zIndex.default}
          >
            <FixedWidthInputNumber min={1000} max={2147483647} $width={150} />
          </Form.Item>
          <Form.Item
            label={
              <Space>
                预览模式 z-index
                <Tooltip title="预览容器的层级，编辑器会自动使用 +1 的层级以确保 Tooltip 等弹出层正常显示">
                  <HelpTooltipIcon />
                </Tooltip>
              </Space>
            }
            name={FORM_PATHS.previewConfig.zIndex.preview}
          >
            <FixedWidthInputNumber min={1} max={2147483647} $width={150} />
          </Form.Item>
        </FormContent>
      </FormSection>
    </SectionCard>
  )
}
