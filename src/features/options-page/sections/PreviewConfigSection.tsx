import { FORM_PATHS } from '@/shared/constants/form-paths'
import { Form, Slider, Switch } from 'antd'
import React from 'react'
import { SectionCard } from '../components/SectionCard'
import { FullWidthInputNumber } from '../styles/layout.styles'

/**
 * 实时预览配置区块
 * 包含预览功能的所有配置项
 */
export const PreviewConfigSection: React.FC = () => {
  return (
    <SectionCard
      title="实时预览配置"
      subtitle="控制预览区域的行为和显示"
      panelKey="preview-config"
    >
      <Form.Item
        label="自动更新预览"
        name={FORM_PATHS.previewConfig.autoUpdate}
        valuePropName="checked"
        extra="编辑器内容变化时自动更新预览（使用下面设置的延迟）"
      >
        <Switch />
      </Form.Item>
      
      <Form.Item
        label="更新延迟（毫秒）"
        name={FORM_PATHS.previewConfig.updateDelay}
        extra="编辑后多久更新预览，避免频繁渲染"
      >
        <FullWidthInputNumber 
          min={100} 
          max={2000} 
          step={100}
        />
      </Form.Item>
      
      <Form.Item
        label="预览区域宽度"
        name={FORM_PATHS.previewConfig.previewWidth}
        extra="预览区域占抽屉的百分比（10-60%）"
      >
        <Slider 
          min={10} 
          max={60} 
          marks={{ 
            10: '10%', 
            30: '30%', 
            40: '40%', 
            60: '60%' 
          }}
        />
      </Form.Item>

      <Form.Item
        label="记住预览状态"
        name={FORM_PATHS.previewConfig.rememberState}
        valuePropName="checked"
        extra="下次打开抽屉时自动恢复预览状态"
      >
        <Switch />
      </Form.Item>
    </SectionCard>
  )
}

