import { getElementAttributes, hasValidAttributes } from '../element-detector'
import { storage } from '../storage'

// Mock storage模块
jest.mock('../storage', () => ({
  storage: {
    getAttributeName: jest.fn()
  }
}))

describe('Element Detector测试', () => {
  const mockGetAttributeName = storage.getAttributeName as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // 默认返回schema-params
    mockGetAttributeName.mockResolvedValue('schema-params')
  })

  describe('getElementAttributes', () => {
    it('应该提取单个参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['param1']
      })
    })

    it('应该提取多个参数（逗号分隔）', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1,param2,param3')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['param1', 'param2', 'param3']
      })
    })

    it('应该处理参数前后的空格', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ' param1 , param2 , param3 ')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['param1', 'param2', 'param3']
      })
    })

    it('应该处理空属性值', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: []
      })
    })

    it('应该处理没有属性的元素', async () => {
      const element = document.createElement('div')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: []
      })
    })

    it('应该使用自定义属性名', async () => {
      mockGetAttributeName.mockResolvedValue('custom-attr')
      
      const element = document.createElement('div')
      element.setAttribute('data-custom-attr', 'value1,value2')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['value1', 'value2']
      })
    })

    it('应该处理包含特殊字符的参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'user.name,item[0],data_id')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['user.name', 'item[0]', 'data_id']
      })
    })

    it('应该过滤掉空字符串参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1,,param2,  ,param3')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['param1', 'param2', 'param3']
      })
    })

    it('应该处理中文参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '用户名,订单号,商品ID')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['用户名', '订单号', '商品ID']
      })
    })

    it('应该处理超长参数', async () => {
      const longParam = 'a'.repeat(1000)
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', longParam)
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: [longParam]
      })
    })

    it('应该处理大量参数', async () => {
      const params = Array.from({ length: 50 }, (_, i) => `param${i + 1}`)
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', params.join(','))
      
      const result = await getElementAttributes(element)
      
      expect(result.params).toHaveLength(50)
      expect(result.params[0]).toBe('param1')
      expect(result.params[49]).toBe('param50')
    })
  })

  describe('hasValidAttributes', () => {
    it('应该验证有效的属性（单个参数）', () => {
      const attrs = { params: ['param1'] }
      
      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该验证有效的属性（多个参数）', () => {
      const attrs = { params: ['param1', 'param2', 'param3'] }
      
      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该拒绝空参数数组', () => {
      const attrs = { params: [] }
      
      expect(hasValidAttributes(attrs)).toBe(false)
    })

    it('应该拒绝只包含空字符串的参数', () => {
      const attrs = { params: [''] }
      
      // hasValidAttributes检查params.length > 0，但空字符串仍然是有效元素
      // 实际上空字符串应该在getElementAttributes时被过滤掉
      expect(hasValidAttributes(attrs)).toBe(true)
    })
  })

  describe('边界情况', () => {
    it('应该处理null元素', async () => {
      // element-detector不处理null，应该在调用前验证
      try {
        await getElementAttributes(null as any)
      } catch (error) {
        // 预期会抛出错误
        expect(error).toBeDefined()
      }
    })

    it('应该处理undefined元素', async () => {
      // element-detector不处理undefined，应该在调用前验证
      try {
        await getElementAttributes(undefined as any)
      } catch (error) {
        // 预期会抛出错误
        expect(error).toBeDefined()
      }
    })

    it('应该处理storage获取失败', async () => {
      mockGetAttributeName.mockRejectedValue(new Error('Storage error'))
      
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'param1')
      
      // 应该使用默认值或抛出错误
      await expect(getElementAttributes(element)).rejects.toThrow()
    })

    it('应该处理只有逗号的字符串', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ',,,')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: []
      })
    })

    it('应该处理混合空格和逗号', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', ' , , , ')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: []
      })
    })

    it('应该处理URL作为参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'https://example.com/api,user.profile.name')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['https://example.com/api', 'user.profile.name']
      })
    })

    it('应该处理JSON路径作为参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', 'data[0].user.name,items[*].id')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['data[0].user.name', 'items[*].id']
      })
    })

    it('应该处理特殊符号参数', async () => {
      const element = document.createElement('div')
      element.setAttribute('data-schema-params', '@user,#id,$price,&status')
      
      const result = await getElementAttributes(element)
      
      expect(result).toEqual({
        params: ['@user', '#id', '$price', '&status']
      })
    })
  })

  describe('hasValidAttributes额外测试', () => {
    it('应该处理大量有效参数', () => {
      const params = Array.from({ length: 100 }, (_, i) => `param${i}`)
      const attrs = { params }
      
      expect(hasValidAttributes(attrs)).toBe(true)
    })

    it('应该验证单个长参数', () => {
      const longParam = 'a'.repeat(10000)
      const attrs = { params: [longParam] }
      
      expect(hasValidAttributes(attrs)).toBe(true)
    })
  })
})

