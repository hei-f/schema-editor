import { DEFAULT_VALUES } from '@/shared/constants/defaults'
import { FORM_PATHS } from '@/shared/constants/form-paths'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { Form, Typography } from 'antd'
import React from 'react'
import { FormSectionLabelWithVariant } from '../components/FormSectionLabelWithVariant'
import { SectionCard } from '../components/SectionCard'
import { FormContent, FormSection } from '../styles/layout.styles'
import type { SectionProps } from '../types'

/**
 * 使用指南区块
 * 合并原有的使用说明和Schema类型支持
 */
export const UsageGuideSection: React.FC<SectionProps> = (props) => {
  const { sectionId, isActive, onActiveChange } = props

  /** 通过 Form.useWatch 获取属性名 */
  const attributeName = Form.useWatch<string>(FORM_PATHS.attributeName)

  return (
    <SectionCard
      title="使用指南"
      subtitle="快速上手和参考信息"
      icon={QuestionCircleOutlined}
      panelKey="usage-guide"
      sectionId={sectionId}
      isActive={isActive}
      onActiveChange={onActiveChange}
    >
      <FormSection>
        <FormSectionLabelWithVariant id="field-usage-instructions">
          使用说明
        </FormSectionLabelWithVariant>
        <FormContent>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            <ol style={{ marginBottom: 0 }}>
              <li>
                在页面HTML元素上添加{' '}
                <Typography.Text code>
                  data-{attributeName ?? DEFAULT_VALUES.attributeName}
                </Typography.Text>{' '}
                属性
              </li>
              <li>页面需要实现获取和更新Schema数据的全局函数</li>
              <li>
                激活插件后，按住 <Typography.Text keyboard>Alt/Option</Typography.Text>{' '}
                键悬停查看参数
              </li>
              <li>
                按住 <Typography.Text keyboard>Alt/Option</Typography.Text> 键并点击元素打开编辑器
              </li>
            </ol>
          </Typography.Paragraph>
        </FormContent>
      </FormSection>

      <FormSection>
        <FormSectionLabelWithVariant id="field-schema-types">
          Schema类型支持
        </FormSectionLabelWithVariant>
        <FormContent>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            Schema编辑器支持字符串、数字、对象、数组、布尔值等数据类型
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            注意：编辑器使用JSON格式，字符串值需要用引号包裹
          </Typography.Paragraph>
        </FormContent>
      </FormSection>
    </SectionCard>
  )
}
