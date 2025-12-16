import { Button, Tag } from 'antd'
import styled from 'styled-components'

export const ShortcutInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const ShortcutDisplayBox = styled.div<{ $isRecording: boolean; $hasWarning: boolean }>`
  min-width: 140px;
  height: 36px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${(props) => (props.$isRecording ? '#13c2c2' : props.$hasWarning ? '#faad14' : '#d9d9d9')};
  border-radius: 8px;
  background: ${(props) => (props.$isRecording ? '#e6fffb' : '#fafafa')};
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #13c2c2;
    background: ${(props) => (props.$isRecording ? '#e6fffb' : '#f0f5ff')};
  }

  &:focus {
    outline: none;
    border-color: #13c2c2;
    box-shadow: 0 0 0 3px rgba(19, 194, 194, 0.15);
  }
`

export const RecordingHintText = styled.span`
  color: #13c2c2;
  font-size: 13px;
  font-weight: 400;
`

export const PlaceholderText = styled.span`
  color: #bfbfbf;
  font-size: 13px;
  font-weight: 400;
`

export const ActionButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const WarningTag = styled(Tag)`
  && {
    margin: 0;
    font-size: 12px;
  }
`

/**
 * 快捷键录入确认按钮
 * 使用主题色作为背景色
 */
export const ShortcutConfirmButton = styled(Button)<{
  $themeColor: string
  $hoverColor: string
  $activeColor: string
}>`
  &.see-btn-primary:not(:disabled):not(.see-btn-disabled) {
    border-radius: 6px;
    background: ${(props) => props.$themeColor} !important;
    border-color: ${(props) => props.$themeColor} !important;
    color: #ffffff !important;

    &:hover {
      background: ${(props) => props.$hoverColor} !important;
      border-color: ${(props) => props.$hoverColor} !important;
      color: #ffffff !important;
    }

    &:active {
      background: ${(props) => props.$activeColor} !important;
      border-color: ${(props) => props.$activeColor} !important;
      color: #ffffff !important;
    }
  }
`

/**
 * 快捷键录入取消按钮
 */
export const ShortcutCancelButton = styled(Button)`
  && {
    border-radius: 6px;
  }
`

/**
 * 快捷键重置按钮
 */
export const ShortcutResetButton = styled(Button)`
  && {
    border-radius: 6px;
    opacity: ${(props) => (props.disabled ? 0.3 : 1)};
    transition: opacity 0.2s ease;
  }
`
