import parseJson from 'parse-json'
import { jsonrepair } from 'jsonrepair'

/**
 * JSON 错误信息
 */
interface JsonErrorInfo {
  /** 完整错误消息（包含 codeFrame） */
  message: string
  /** 简短错误消息（不含 codeFrame，用于 UI 显示） */
  shortMessage: string
  /** 错误行号（1-indexed） */
  line: number
  /** 错误列号（1-indexed） */
  column: number
  /** 带箭头标记的代码片段 */
  codeFrame: string
}

/**
 * JSON 分析结果
 */
interface JsonAnalysisResult {
  /** 是否为有效 JSON */
  isValid: boolean
  /** 格式化后的内容（如果有效） */
  formatted: string | null
  /** 错误信息（如果无效） */
  error: JsonErrorInfo | null
  /** 修复后的内容 */
  repaired: string | null
  /** 修复是否成功 */
  repairSuccess: boolean
}

/**
 * 分析 JSON 字符串
 * 1. 尝试正常解析
 * 2. 如果失败，使用 parse-json 获取详细错误信息
 * 3. 尝试使用 jsonrepair 修复
 *
 * @param input - 输入的 JSON 字符串
 * @returns 分析结果
 */
export function analyzeJson(input: string): JsonAnalysisResult {
  // 1. 尝试正常解析
  try {
    const parsed = JSON.parse(input)
    return {
      isValid: true,
      formatted: JSON.stringify(parsed, null, 2),
      error: null,
      repaired: null,
      repairSuccess: true,
    }
  } catch {
    // 继续分析错误
  }

  // 2. 使用 parse-json 获取详细错误信息
  let errorInfo: JsonErrorInfo | null = null
  try {
    parseJson(input)
  } catch (err: unknown) {
    const error = err as {
      message?: string
      rawCodeFrame?: string
    }
    const message = error.message ?? '未知错误'

    // 从 message 中解析行号和列号
    // 格式: "... at position X (line Y column Z) ..."
    const { line, column } = parseLineColumnFromMessage(message)

    // 提取简短消息（只取第一行，不含 codeFrame）
    const shortMessage = extractShortMessage(message)

    errorInfo = {
      message,
      shortMessage,
      line,
      column,
      codeFrame: error.rawCodeFrame ?? generateCodeFrame(input, line, column),
    }
  }

  // 3. 尝试修复
  let repaired: string | null = null
  let repairSuccess = false
  try {
    const repairedRaw = jsonrepair(input)
    // 验证修复后的结果是否为有效 JSON
    const parsed = JSON.parse(repairedRaw)
    repaired = JSON.stringify(parsed, null, 2)
    repairSuccess = true
  } catch {
    repaired = null
  }

  return {
    isValid: false,
    formatted: null,
    error: errorInfo,
    repaired,
    repairSuccess,
  }
}

/**
 * 仅获取 JSON 错误信息（用于定位错误按钮）
 *
 * @param input - 输入的 JSON 字符串
 * @returns 错误信息，如果 JSON 有效则返回 null
 */
export function getJsonError(input: string): JsonErrorInfo | null {
  // 先尝试正常解析
  try {
    JSON.parse(input)
    return null
  } catch {
    // 继续获取详细错误
  }

  // 使用 parse-json 获取详细错误信息
  try {
    parseJson(input)
    return null
  } catch (err: unknown) {
    const error = err as {
      message?: string
      rawCodeFrame?: string
    }
    const message = error.message ?? '未知错误'

    // 从 message 中解析行号和列号
    const { line, column } = parseLineColumnFromMessage(message)

    // 提取简短消息（只取第一行，不含 codeFrame）
    const shortMessage = extractShortMessage(message)

    return {
      message,
      shortMessage,
      line,
      column,
      codeFrame: error.rawCodeFrame ?? generateCodeFrame(input, line, column),
    }
  }
}

/**
 * 尝试修复 JSON（用于修复JSON按钮）
 *
 * @param input - 输入的 JSON 字符串
 * @returns 修复结果
 */
export function repairJson(input: string): {
  success: boolean
  repaired: string | null
  error?: string
} {
  try {
    const repairedRaw = jsonrepair(input)
    // 验证修复后的结果是否为有效 JSON
    const parsed = JSON.parse(repairedRaw)
    return {
      success: true,
      repaired: JSON.stringify(parsed, null, 2),
    }
  } catch (err: unknown) {
    const error = err as { message?: string }
    return {
      success: false,
      repaired: null,
      error: error.message ?? '修复失败',
    }
  }
}

/**
 * 从完整错误消息中提取简短描述
 * parse-json 的消息包含 codeFrame，我们只需要第一行
 */
function extractShortMessage(message: string): string {
  // 消息格式通常是：
  // "Expected ... at position X (line Y column Z)\n\n> 1 | code\n    | ^"
  // 我们只需要第一行（到第一个换行符）
  const firstLine = message.split('\n')[0]
  return firstLine.trim()
}

/**
 * 从错误信息中解析行号和列号
 * parse-json 的错误信息格式: "... at position X (line Y column Z) ..."
 */
function parseLineColumnFromMessage(message: string): { line: number; column: number } {
  // 匹配格式: (line X column Y)
  const lineColumnMatch = message.match(/\(line\s+(\d+)\s+column\s+(\d+)\)/)
  if (lineColumnMatch) {
    return {
      line: parseInt(lineColumnMatch[1], 10),
      column: parseInt(lineColumnMatch[2], 10),
    }
  }

  // 备用匹配: line X, column Y 或其他格式
  const altMatch = message.match(/line\s+(\d+)/i)
  const colMatch = message.match(/column\s+(\d+)/i)

  return {
    line: altMatch ? parseInt(altMatch[1], 10) : 1,
    column: colMatch ? parseInt(colMatch[1], 10) : 1,
  }
}

/**
 * 生成代码片段（带错误位置标记）
 * 用于在 parse-json 未提供 codeFrame 时自己生成
 */
function generateCodeFrame(input: string, line: number, column: number): string {
  const lines = input.split('\n')
  const contextLines = 2
  const startLine = Math.max(0, line - 1 - contextLines)
  const endLine = Math.min(lines.length, line + contextLines)

  const result: string[] = []

  for (let i = startLine; i < endLine; i++) {
    const lineNum = i + 1
    const lineContent = lines[i]
    const prefix = lineNum === line ? '> ' : '  '
    const lineNumStr = String(lineNum).padStart(3, ' ')

    result.push(`${prefix}${lineNumStr} | ${lineContent}`)

    // 在错误行下方添加箭头
    if (lineNum === line) {
      const spaces = ' '.repeat(column + 6) // 6 = prefix(2) + lineNum(3) + ' | '(3) - 2
      result.push(`${spaces}^`)
    }
  }

  return result.join('\n')
}
