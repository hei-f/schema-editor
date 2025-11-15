# Schema Editor 测试文档

## 测试架构

本项目采用三层测试策略：

### 1. 单元测试（Jest + React Testing Library）

**目的**：测试独立的函数和组件逻辑

**测试范围**：
- 工具函数（utils/）
- React组件（content/ui/）
- 存储管理（storage.ts）
- 消息传递（message.ts）

**运行命令**：
```bash
npm test                    # 运行所有单元测试
npm run test:watch         # 监听模式
npm run test:coverage      # 生成覆盖率报告
```

### 2. 集成测试

**目的**：测试模块间的交互

**测试场景**：
- 元素检测 → 属性提取
- 消息传递 → 状态更新
- 配置变更 → 行为响应

### 3. E2E测试（Playwright）

**目的**：测试完整用户流程

**测试场景**：
- 加载Chrome扩展
- 激活插件
- hover检测元素
- 点击打开抽屉
- 编辑并保存schema
- 配置修改

**运行命令**：
```bash
npm run test:e2e           # 运行E2E测试
```

## 测试覆盖场景

### ✅ JSON序列化工具测试

**文件**：`src/utils/__tests__/json-serializer.test.ts`

**覆盖场景**：
- ✅ 标准JSON序列化
- ✅ 标准JSON反序列化
- ✅ 单层序列化字符串解析
- ✅ 文本形式的转义符处理
- ✅ 多层序列化递归解析
- ✅ 空输入验证
- ✅ 无效JSON错误处理
- ✅ 过度序列化检测

### ✅ SchemaDrawer组件测试

**文件**：`src/content/ui/__tests__/SchemaDrawer.test.tsx`

**覆盖场景**：
- ✅ 组件渲染
- ✅ 参数显示（单个/多个）
- ✅ Schema数据显示
- ✅ 格式化功能
- ✅ 序列化功能
- ✅ 反序列化功能
- ✅ 保存功能
- ✅ 关闭功能
- ✅ 超长参数处理
- ✅ 超多参数换行

### ✅ E2E完整流程测试

**文件**：`e2e/extension.spec.ts`

**覆盖场景**：
- ✅ 元素检测和高亮
- ✅ Tooltip显示
- ✅ 点击打开抽屉
- ✅ 配置页面修改
- ✅ 序列化/反序列化操作
- ✅ 超长参数tooltip显示
- ✅ 超多参数换行布局
- ✅ 无效元素拒绝

## 快速开始

### 1. 安装测试依赖

```bash
npm install --save-dev \
  @types/jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  jest \
  jest-environment-jsdom \
  ts-jest
```

### 2. 运行测试

```bash
# 单元测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# E2E测试
npm run test:e2e
```

### 3. 查看覆盖率报告

运行 `npm run test:coverage` 后，打开 `coverage/lcov-report/index.html` 查看详细报告。

## 测试最佳实践

### 1. 单元测试

```typescript
describe('功能模块名称', () => {
  it('应该正确处理正常输入', () => {
    // Arrange: 准备测试数据
    const input = { key: 'value' }
    
    // Act: 执行测试
    const result = myFunction(input)
    
    // Assert: 验证结果
    expect(result).toBe(expected)
  })
})
```

### 2. 组件测试

```typescript
it('应该响应用户交互', async () => {
  render(<MyComponent {...props} />)
  
  const button = screen.getByRole('button')
  fireEvent.click(button)
  
  await waitFor(() => {
    expect(mockCallback).toHaveBeenCalled()
  })
})
```

### 3. E2E测试

```typescript
test('用户完整流程', async ({ page }) => {
  // 1. 导航到页面
  await page.goto(url)
  
  // 2. 执行操作
  await page.click(selector)
  
  // 3. 验证结果
  await expect(page.locator(selector)).toBeVisible()
})
```

## CI/CD集成

### GitHub Actions示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## 覆盖率目标

- **行覆盖率**: ≥ 70%
- **分支覆盖率**: ≥ 70%
- **函数覆盖率**: ≥ 70%
- **语句覆盖率**: ≥ 70%

## 常见问题

### Q: Mock Chrome API失败？
A: 确保 `test/setup.ts` 正确配置了全局的chrome对象。

### Q: E2E测试找不到扩展？
A: 先运行 `npm run build` 生成dist目录。

### Q: Monaco Editor渲染问题？
A: 在测试中可能需要mock Monaco Editor组件。

## 贡献指南

添加新功能时，请：
1. ✅ 为工具函数编写单元测试
2. ✅ 为组件编写渲染和交互测试
3. ✅ 为完整流程编写E2E测试
4. ✅ 确保覆盖率不低于70%
5. ✅ 运行 `npm test` 确保所有测试通过

