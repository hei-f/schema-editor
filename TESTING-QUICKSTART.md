# 🎯 测试快速入门指南

## 📦 安装测试依赖

```bash
npm install --save-dev \
  @types/jest@^29.5.0 \
  @testing-library/react@^14.0.0 \
  @testing-library/jest-dom@^6.1.0 \
  @testing-library/user-event@^14.5.0 \
  @playwright/test@^1.40.0 \
  jest@^29.7.0 \
  jest-environment-jsdom@^29.7.0 \
  ts-jest@^29.1.0
```

## ⚡ 运行测试

```bash
# 1. 运行单元测试
npm test

# 2. 监听模式（开发时推荐）
npm run test:watch

# 3. 生成覆盖率报告
npm run test:coverage

# 4. 运行E2E测试（需要先构建）
npm run build
npm run test:e2e
```

## 📊 当前测试覆盖

### ✅ 工具函数测试
**文件**: `src/utils/__tests__/json-serializer.test.ts`

- ✅ `serializeJson` - 序列化对象/数组/null
- ✅ `deserializeJson` - 标准JSON解析
- ✅ 单层序列化字符串解析
- ✅ **文本转义符处理**: `[{\"key\":\"value\"}]` ✨
- ✅ 多层序列化递归解析
- ✅ 空输入验证
- ✅ 无效JSON错误处理
- ✅ 过度序列化检测（10层限制）

### ✅ UI组件测试
**文件**: `src/content/ui/__tests__/SchemaDrawer.test.tsx`

- ✅ 组件渲染和参数显示
- ✅ 格式化按钮功能
- ✅ 序列化按钮功能
- ✅ 反序列化按钮功能
- ✅ 保存和关闭回调
- ✅ **超长参数**省略和tooltip
- ✅ **超多参数**自动换行布局

### ✅ E2E流程测试
**文件**: `e2e/extension.spec.ts`

- ✅ 元素检测和高亮（Alt+hover）
- ✅ 点击打开抽屉（Alt+click）
- ✅ 配置页面修改
- ✅ 序列化/反序列化操作
- ✅ 超长参数tooltip显示
- ✅ 超多参数换行验证
- ✅ 无效元素拒绝

## 🔥 关键测试场景演示

### 场景1: 文本转义符自动处理

```typescript
// 测试: src/utils/__tests__/json-serializer.test.ts

it('应该处理文本形式的转义符', () => {
  // 从控制台复制的JSON（包含真实的反斜杠字符）
  const input = '[{\\"key\\":\\"value\\"}]'
  
  const result = deserializeJson(input)
  
  expect(result.success).toBe(true)
  expect(JSON.parse(result.data!)).toEqual([{ key: 'value' }])
})
```

### 场景2: 超长参数UI处理

```typescript
// 测试: src/content/ui/__tests__/SchemaDrawer.test.tsx

it('应该处理超长参数', () => {
  const longParam = 'a'.repeat(500)
  const props = {
    attributes: { params: [longParam] }
  }
  
  render(<SchemaDrawer {...props} />)
  
  // 验证省略样式
  const paramElement = screen.getByText(longParam)
  expect(paramElement).toHaveStyle({ 
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  })
})
```

## 🛠️ 测试文件结构

```
ChromeTools/
├── src/
│   ├── utils/__tests__/
│   │   └── json-serializer.test.ts    ← 工具函数测试
│   └── content/ui/__tests__/
│       └── SchemaDrawer.test.tsx      ← 组件测试
├── e2e/
│   └── extension.spec.ts              ← E2E测试
├── test/
│   ├── setup.ts                       ← Jest配置
│   ├── __mocks__/                     ← Mock文件
│   ├── TESTING.md                     ← 详细文档
│   └── README-TESTING.md              ← 概览文档
├── jest.config.js                     ← Jest配置
└── playwright.config.ts               ← Playwright配置
```

## 📈 测试命令说明

### `npm test`
运行所有单元测试，快速验证代码逻辑。

**输出示例**:
```
PASS  src/utils/__tests__/json-serializer.test.ts
  JSON序列化工具测试
    serializeJson
      ✓ 应该正确序列化简单对象 (3ms)
      ✓ 应该正确序列化数组 (1ms)
    deserializeJson
      ✓ 应该处理文本形式的转义符 (2ms)
      ✓ 应该处理多层序列化 (1ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### `npm run test:watch`
监听文件变化，自动重新运行相关测试。开发时最有用！

### `npm run test:coverage`
生成代码覆盖率报告。

**输出示例**:
```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   78.5  |   72.3   |   80.1  |   78.9  |
 json-serializer.ts   |   95.2  |   88.9   |   100   |   95.2  |
 SchemaDrawer.tsx     |   72.1  |   65.4   |   71.8  |   72.3  |
----------------------|---------|----------|---------|---------|
```

### `npm run test:e2e`
运行端到端测试，模拟真实用户操作。

**输出示例**:
```
Running 9 tests using 1 worker

  ✓ 测试页面 - 元素检测 (1.2s)
  ✓ 测试页面 - 点击元素打开抽屉 (1.5s)
  ✓ 编辑器 - 序列化功能 (2.1s)
  ✓ 超长参数 - 显示省略和tooltip (1.8s)

  9 passed (15s)
```

## 🎓 测试开发工作流

### 1. TDD模式（测试驱动开发）

```bash
# 步骤1: 编写测试
vim src/utils/__tests__/new-feature.test.ts

# 步骤2: 运行测试（应该失败）
npm run test:watch

# 步骤3: 实现功能
vim src/utils/new-feature.ts

# 步骤4: 测试通过 ✅
```

### 2. 普通开发模式

```bash
# 步骤1: 实现功能
vim src/utils/new-feature.ts

# 步骤2: 编写测试
vim src/utils/__tests__/new-feature.test.ts

# 步骤3: 验证测试通过
npm test
```

## 🐛 调试测试

### 单步调试

在测试文件中添加：
```typescript
it.only('需要调试的测试', () => {
  debugger  // 断点
  // ... 测试代码
})
```

运行：
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### 查看详细输出

```bash
npm test -- --verbose
```

## ✅ 提交前检查清单

- [ ] 运行 `npm test` 确保所有测试通过
- [ ] 运行 `npm run test:coverage` 确保覆盖率≥70%
- [ ] 运行 `npm run build` 确保构建成功
- [ ] 运行 `npm run test:e2e` 验证E2E测试
- [ ] 检查是否有跳过的测试（`.skip`）
- [ ] 确保没有调试代码（`.only`）

## 🚀 下一步

1. **安装依赖**: `npm install`
2. **运行首次测试**: `npm test`
3. **查看覆盖率**: `npm run test:coverage`
4. **添加更多测试**: 参考 `test/TESTING.md`

---

**记住**: 良好的测试是高质量代码的保证！ 🎉

