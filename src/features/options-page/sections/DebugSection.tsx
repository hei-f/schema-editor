import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Switch } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'

/**
 * 开发调试配置区块
 * 包含调试日志等开发者选项
 */
export const DebugSection: React.FC = () => {
  return (
    <SectionCard
      title="开发调试"
      subtitle="开发者选项和诊断工具"
      panelKey="debug"
    >
      <Form.Item
        label="启用调试日志"
        name={FORM_PATHS.enableDebugLog}
        valuePropName="checked"
        extra="在浏览器控制台显示插件的调试日志信息"
      >
        <Switch />
      </Form.Item>
    </SectionCard>
  )
}

