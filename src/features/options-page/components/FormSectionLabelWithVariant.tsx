import React from 'react'
import { FormSectionLabel } from '../styles/layout.styles'

interface FormSectionLabelWithVariantProps {
  id?: string
  children: React.ReactNode
}

/**
 * 表单区块子标题
 * 配合 FormSection 容器使用
 */
export const FormSectionLabelWithVariant: React.FC<FormSectionLabelWithVariantProps> = (props) => {
  const { id, children } = props

  return <FormSectionLabel id={id}>{children}</FormSectionLabel>
}
