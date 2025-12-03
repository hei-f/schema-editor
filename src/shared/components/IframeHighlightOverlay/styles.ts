import styled from 'styled-components'

/** 高亮框样式 */
export const HighlightBox = styled.div<{ $color: string; $isRecording: boolean }>`
  position: fixed;
  pointer-events: none;
  z-index: 999998;
  box-sizing: border-box;
  border: 2px solid ${(props) => props.$color};
  box-shadow: 0 0 10px ${(props) => props.$color}80;
`

/** Tooltip 样式 */
export const IframeTooltip = styled.div<{ $isValid: boolean }>`
  position: fixed;
  z-index: 2147483647;
  background: ${(props) => (props.$isValid ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 77, 79, 0.9)')};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  pointer-events: none;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`

/** 录制模式标签 */
export const RecordingLabel = styled.div`
  background: #ff4d4f;
  color: white;
  padding: 4px 8px;
  margin: -8px -12px 8px -12px;
  border-radius: 6px 6px 0 0;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
`

/** 高亮所有元素时的标签 */
export const HighlightLabel = styled.div`
  position: absolute;
  top: -26px;
  left: 0;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border-radius: 6px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`
