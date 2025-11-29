/**
 * parse-json mock
 * 模拟 parse-json 的行为，提供详细的错误信息
 */

class JSONParseError extends Error {
  rawCodeFrame?: string

  constructor(message: string, rawCodeFrame?: string) {
    super(message)
    this.name = 'JSONParseError'
    this.rawCodeFrame = rawCodeFrame
  }
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch (originalError) {
    // 尝试找到错误位置
    const errorMessage = (originalError as Error).message

    // 从原生错误中提取位置信息
    const positionMatch = errorMessage.match(/position\s+(\d+)/)
    const position = positionMatch ? parseInt(positionMatch[1], 10) : 0

    // 计算行号和列号
    let line = 1
    let column = 1
    for (let i = 0; i < position && i < input.length; i++) {
      if (input[i] === '\n') {
        line++
        column = 1
      } else {
        column++
      }
    }

    // 生成 codeFrame
    const lines = input.split('\n')
    const errorLine = lines[line - 1] || ''
    const codeFrame = `> ${line} | ${errorLine}\n    | ${' '.repeat(column - 1)}^`

    const detailedMessage = `${errorMessage} (line ${line} column ${column})\n\n${codeFrame}`

    throw new JSONParseError(detailedMessage, codeFrame)
  }
}

export default parseJson
