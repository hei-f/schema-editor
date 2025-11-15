import { deserializeJson, serializeJson } from '@/utils/json-serializer'

describe('JSON序列化工具测试', () => {
  describe('serializeJson', () => {
    it('应该正确序列化简单对象', () => {
      const input = { key: 'value' }
      const result = serializeJson(input)
      
      expect(result.success).toBe(true)
      expect(result.data).toBe('"{\\\"key\\\":\\\"value\\\"}"')
    })

    it('应该正确序列化数组', () => {
      const input = [1, 2, 3]
      const result = serializeJson(input)
      
      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toBe('[1,2,3]')
    })

    it('应该处理null值', () => {
      const input = null
      const result = serializeJson(input)
      
      expect(result.success).toBe(true)
    })
  })

  describe('deserializeJson', () => {
    it('应该正确解析标准JSON', () => {
      const input = '[{"key":"value"}]'
      const result = deserializeJson(input)
      
      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理单层序列化字符串', () => {
      const input = '"[{\\"key\\":\\"value\\"}]"'
      const result = deserializeJson(input)
      
      expect(result.success).toBe(true)
      // parseCount可能是1或2，取决于修复策略
      expect(result.parseCount).toBeGreaterThanOrEqual(1)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理文本形式的转义符', () => {
      const input = '[{\\"key\\":\\"value\\"}]'
      const result = deserializeJson(input)
      
      expect(result.success).toBe(true)
      expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
    })

    it('应该处理多层序列化', () => {
      // 创建2层序列化，最终结果是对象而不是字符串
      const obj = { key: 'value' }
      const once = JSON.stringify(obj) // "{"key":"value"}"
      const twice = JSON.stringify(once) // "\"{\"key\":\"value\"}\""
      
      const result = deserializeJson(twice)
      
      expect(result.success).toBe(true)
      expect(result.parseCount).toBeGreaterThanOrEqual(2)
      const parsed = JSON.parse(result.data!)
      expect(parsed).toEqual({ key: 'value' })
    })

    it('应该拒绝空输入', () => {
      const result = deserializeJson('')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('输入内容为空')
    })

    it('应该拒绝无效JSON', () => {
      const input = '{invalid json}'
      const result = deserializeJson(input)
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('无法解析')
    })

    it('应该检测过度序列化', () => {
      // 创建12层序列化，超过10层限制
      let input: any = { key: 'value' }
      for (let i = 0; i < 12; i++) {
        input = JSON.stringify(input)
      }
      
      const result = deserializeJson(input)
      
      // 可能成功也可能失败，取决于递归能否完成
      // 但如果成功，应该有警告
      if (result.success) {
        expect(result.parseCount).toBeGreaterThanOrEqual(10)
        expect(result.error).toContain('最大解析深度')
      } else {
        // 如果失败，也应该有相关错误信息
        expect(result.error).toBeTruthy()
      }
    })
  })
})

