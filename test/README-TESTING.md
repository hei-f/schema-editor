# 🧪 Chrome扩展自动化测试完整方案

## 📋 测试架构概览

```
测试层级                工具                      覆盖范围
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
单元测试              Jest + RTL               工具函数、组件
集成测试              Jest                     模块交互
E2E测试               Playwright               完整流程
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 将 package.json.test 重命名为 package.json（合并配置）
# 然后运行：
npm install
```

### 2. 运行测试

```bash
# 单元测试（快速反馈）
npm test

# 监听模式（开发时）
npm run test:watch

# 覆盖率报告
npm run test:coverage

# E2E测试（需要先构建）
npm run build
npm run test:e2e
```

## ✅ 已实现的测试用例

### 1. JSON序列化工具测试
- ✅ 标准JSON序列化/反序列化
- ✅ 单层/多层序列化处理
- ✅ 文本转义符处理：`[{\"key\":\"value\"}]`
- ✅ 空输入和无效JSON验证
- ✅ 过度序列化检测（10层限制）

### 2. SchemaDrawer组件测试
- ✅ 参数显示（单个/多个/超长/超多）
- ✅ 格式化/序列化/反序列化功能
- ✅ 保存和关闭回调
- ✅ 超长参数省略和tooltip
- ✅ 超多参数自动换行

### 3. E2E完整流程测试
- ✅ 元素检测和高亮（Alt+hover）
- ✅ 点击打开抽屉（Alt+click）
- ✅ 配置页面修改
- ✅ 序列化/反序列化操作
- ✅ 无效元素拒绝

## 📊 测试覆盖率目标

```
指标              目标      当前
━━━━━━━━━━━━━━━━━━━━━━━━━
行覆盖率          ≥70%     -
分支覆盖率        ≥70%     -
函数覆盖率        ≥70%     -
语句覆盖率        ≥70%     -
```

## 📁 项目结构

```
ChromeTools/
├── src/
│   ├── utils/__tests__/           # 工具函数测试
│   │   └── json-serializer.test.ts
│   └── content/ui/__tests__/      # 组件测试
│       └── SchemaDrawer.test.tsx
├── test/
│   ├── setup.ts                   # Jest配置
│   ├── __mocks__/                 # Mock文件
│   └── TESTING.md                 # 详细测试文档
├── e2e/
│   └── extension.spec.ts          # E2E测试
├── jest.config.js                 # Jest配置
└── playwright.config.ts           # Playwright配置
```

## 🎯 关键测试场景

### 场景1: 文本转义符处理

```typescript
// 输入：从控制台复制的带转义符的JSON
input: '[{\"key\":\"value\"}]'

// 点击"反序列化"按钮
↓

// 输出：格式化的JSON
[
  {
    "key": "value"
  }
]

// ✅ 测试通过：正确识别并替换转义符
```

### 场景2: 超长参数显示

```typescript
// 输入：500字符的超长参数
params: ['a'.repeat(500)]

// 预期行为：
// 1. 参数被省略显示（...）
// 2. hover显示完整tooltip
// 3. 不影响布局

// ✅ 测试通过：样式正确应用
```

### 场景3: 超多参数换行

```typescript
// 输入：10个参数
params: ['p1', 'p2', ..., 'p10']

// 预期行为：
// 1. 所有参数都显示
// 2. 自动换行不挤压按钮
// 3. 操作按钮保持在右侧

// ✅ 测试通过：布局自适应
```

## 🔧 核心测试工具

### Jest配置

```javascript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}
```

### Chrome API Mock

```typescript
// test/setup.ts
global.chrome = {
  runtime: { sendMessage: jest.fn(), ... },
  storage: { local: { get: jest.fn(), ... } },
  tabs: { sendMessage: jest.fn() }
}
```

## 💡 最佳实践

### 1. 单元测试模式

```typescript
describe('功能模块', () => {
  it('应该正确处理正常输入', () => {
    // AAA模式
    const input = ...        // Arrange
    const result = fn(input) // Act
    expect(result).toBe(...) // Assert
  })
})
```

### 2. 组件测试模式

```typescript
it('应该响应用户交互', async () => {
  render(<Component />)
  fireEvent.click(screen.getByRole('button'))
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalled()
  })
})
```

### 3. E2E测试模式

```typescript
test('完整流程', async ({ page }) => {
  await page.goto(url)
  await page.click(selector)
  await expect(page.locator(...)).toBeVisible()
})
```

## 🚨 常见问题解决

### Q1: Monaco Editor测试失败？
```typescript
// 解决方案：Mock Editor组件
jest.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="monaco-editor" />
}))
```

### Q2: Chrome API未定义？
```typescript
// 解决方案：确保test/setup.ts正确加载
// 检查jest.config.js的setupFilesAfterEnv配置
```

### Q3: E2E测试找不到扩展？
```bash
# 解决方案：先构建扩展
npm run build
# 再运行E2E测试
npm run test:e2e
```

## 📈 CI/CD集成

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm run test:e2e
```

## 📚 延伸阅读

- [Jest官方文档](https://jestjs.io/)
- [Testing Library文档](https://testing-library.com/)
- [Playwright文档](https://playwright.dev/)
- [Chrome扩展测试指南](https://developer.chrome.com/docs/extensions/mv3/testing/)

---

**测试覆盖的价值**：
- ✅ 及早发现bug
- ✅ 重构时保持信心
- ✅ 文档化的代码行为
- ✅ 提升代码质量

**开始测试，写出更健壮的代码！** 🎉

