/**
 * JSON处理结果接口
 */
export interface JsonProcessResult {
  success: boolean
  data?: string
  parseCount?: number
  error?: string
}

/**
 * 序列化JSON
 * @description 将JSON对象转换为序列化的字符串
 * @param data JSON对象
 * @returns 序列化后的字符串
 */
export const serializeJson = (data: any): JsonProcessResult => {
  try {
    const jsonString = JSON.stringify(data)
    return {
      success: true,
      data: JSON.stringify(jsonString, null, 2)
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

/**
 * 反序列化JSON字符串
 * @description 处理从外部复制的序列化JSON字符串，转换为格式化的JSON对象
 * 支持多种输入格式：
 * 1. 标准JSON格式：[{"key":"value"}]
 * 2. 单层序列化字符串："[{\"key\":\"value\"}]"
 * 3. 多层序列化字符串："\\"[{\\\\\"key\\\\\":\\\\\"value\\\\\"}]\\""
 * 4. 文本形式的转义符：[{\"key\":\"value\"}]（包含真实的反斜杠字符）
 * @param input 待反序列化的JSON字符串
 * @returns 反序列化结果对象
 */
export const deserializeJson = (input: string): JsonProcessResult => {
  const MAX_PARSE_DEPTH = 10
  let parseCount = 0

  try {
    let parsed: any = input.trim()
    
    // 如果输入为空
    if (!parsed) {
      return {
        success: false,
        error: '输入内容为空'
      }
    }

    // 尝试修复常见的格式问题
    // 处理文本形式的转义符：[{\"key\":\"value\"}] -> [{"key":"value"}]
    const fixedInput = tryFixJsonString(parsed)
    if (fixedInput !== parsed) {
      parsed = fixedInput
      parseCount++ // 记录进行了一次修复
    }

    // 递归解析：如果结果是字符串，继续解析直到得到对象
    while (typeof parsed === 'string' && parseCount < MAX_PARSE_DEPTH) {
      try {
        const nextParsed = JSON.parse(parsed)
        parsed = nextParsed
        parseCount++
      } catch (error) {
        // 如果解析失败，尝试修复后再解析一次
        const fixed = tryFixJsonString(parsed)
        if (fixed !== parsed) {
          try {
            parsed = JSON.parse(fixed)
            parseCount++
            continue
          } catch {
            // 修复后仍然失败，退出循环
            break
          }
        }
        // 无法修复，退出循环
        break
      }
    }

    // 检查是否超过最大解析深度
    if (parseCount >= MAX_PARSE_DEPTH && typeof parsed === 'string') {
      return {
        success: true,
        data: JSON.stringify(parsed, null, 2),
        parseCount,
        error: '已达到最大解析深度，可能存在过度序列化'
      }
    }

    // 如果最终结果仍是字符串，说明无法进一步解析
    if (typeof parsed === 'string') {
      return {
        success: false,
        error: '无法解析为有效的JSON格式，请检查输入内容'
      }
    }

    return {
      success: true,
      data: JSON.stringify(parsed, null, 2),
      parseCount: parseCount > 0 ? parseCount : undefined
    }
  } catch (error) {
    return {
      success: false,
      error: `解析失败: ${(error as Error).message}`
    }
  }
}

/**
 * 尝试修复常见的JSON格式问题
 * @param input 输入字符串
 * @returns 修复后的字符串
 */
export const tryFixJsonString = (input: string): string => {
  let fixed = input.trim()
  
  // 策略1: 移除首尾的额外引号
  // "{"key":"value"}" -> {"key":"value"}
  if (fixed.startsWith('"') && fixed.endsWith('"')) {
    fixed = fixed.slice(1, -1)
  }
  
  // 策略2: 替换文本形式的转义引号
  // [{\"key\":\"value\"}] -> [{"key":"value"}]
  // 检查是否包含 \" 模式（真实的反斜杠加引号）
  if (fixed.includes('\\')) {
    // 尝试替换所有的 \" 为 "
    const withoutEscapes = fixed.replace(/\\"/g, '"')
    
    // 验证替换后是否能成为有效JSON
    try {
      JSON.parse(withoutEscapes)
      return withoutEscapes
    } catch {
      // 替换后仍无效，保持原样
    }
  }
  
  return fixed
}

