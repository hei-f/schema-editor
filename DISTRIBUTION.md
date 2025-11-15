# Schema Editor 分发指南

本文档说明如何将插件分发给其他用户使用。

## 📦 方式一：分享 dist 目录（推荐）

### 优点
- ✅ 最简单快速
- ✅ 无需任何配置
- ✅ 适合内部团队使用

### 步骤

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **打包 dist 目录**
   ```bash
   # 创建 zip 文件
   cd dist
   zip -r ../SchemaEditor-v1.0.0.zip .
   ```

3. **分享给用户**
   - 发送 `SchemaEditor-v1.0.0.zip` 文件
   - 附上 `INSTALL.md` 安装说明

4. **用户安装**
   - 解压 zip 文件
   - 在 Chrome 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹

---

## 🌐 方式二：发布到 Chrome Web Store（正式发布）

### 优点
- ✅ 官方渠道，用户信任
- ✅ 自动更新
- ✅ 更好的分发体验

### 费用
- 需要一次性支付 **$5 美元** 开发者注册费

### 步骤

#### 1. 注册 Chrome Web Store 开发者账号

访问：https://chrome.google.com/webstore/devconsole

#### 2. 准备发布材料

**必需文件：**
```
dist/                    # 插件文件
icons/
  - icon-128.png        # 应用图标（128x128）
  - screenshot-1.png    # 应用截图（至少1张，最多5张）
  - screenshot-2.png    # 建议尺寸：1280x800 或 640x400
```

**必需信息：**
- 应用名称：Schema Editor
- 简短描述：DOM 元素 Schema 查看和编辑工具
- 详细描述：（见下方示例）
- 分类：开发者工具
- 语言：中文（简体）
- 隐私政策：（如果不收集数据可以说明）

**详细描述示例：**
```markdown
Schema Editor 是一个强大的 Chrome 扩展程序，用于查看和编辑 DOM 元素的 Schema 数据。

核心功能：
• 智能元素检测：按住 Alt/Option 键悬停元素即可查看属性
• 可视化高亮：清晰标记目标元素
• Monaco Editor：专业的代码编辑器
• 实时更新：修改后立即生效
• 状态持久化：记住激活状态

适用场景：
- Web 应用开发调试
- 数据结构查看和修改
- 前端开发工具集成
```

#### 3. 打包插件

```bash
# 确保在项目根目录
npm run build

# 创建 zip 文件（Chrome Web Store 要求）
cd dist
zip -r SchemaEditor.zip .
```

#### 4. 上传到 Chrome Web Store

1. 登录开发者控制台
2. 点击"新增项"
3. 上传 `SchemaEditor.zip`
4. 填写商店信息：
   - 上传截图
   - 填写描述
   - 设置分类
5. 选择可见性：
   - **公开**：所有人可见
   - **不公开**：只有知道链接的人可以安装
   - **私密**：仅限指定 Google 账号或群组
6. 提交审核（通常 1-3 个工作日）

#### 5. 审核通过后

- 用户可以直接在 Chrome Web Store 搜索安装
- 插件更新会自动推送给用户

---

## 📂 方式三：GitHub 发布（开源）

### 优点
- ✅ 开源社区可见
- ✅ 版本管理清晰
- ✅ 便于协作开发

### 步骤

#### 1. 创建 GitHub 仓库

```bash
cd /Users/lyj/Desktop/project/ChromeTools
git init
git add .
git commit -m "Initial commit: Schema Editor v1.0.0"
git branch -M main
git remote add origin https://github.com/你的用户名/schema-editor.git
git push -u origin main
```

#### 2. 创建 Release

1. 在 GitHub 仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. Tag version: `v1.0.0`
4. Release title: `Schema Editor v1.0.0`
5. 描述版本更新内容
6. 上传 `SchemaEditor-v1.0.0.zip`
7. 发布

#### 3. 用户安装

用户可以：
1. 从 Releases 下载 zip 文件
2. 或直接 clone 仓库并运行 `npm run build`

---

## 🔐 方式四：企业内部分发

### 适用场景
- 公司内部工具
- 需要统一管理和更新

### Google Workspace 方式

如果公司使用 Google Workspace：

1. 管理员登录 Google Admin Console
2. 前往 "设备" > "Chrome" > "应用和扩展程序"
3. 点击 "添加 Chrome 应用或扩展程序"
4. 上传插件 zip 文件
5. 选择要安装的组织单位
6. 设置安装策略（强制安装/允许安装）

### 自托管方式

1. 将 `dist` 目录放在内部服务器
2. 提供下载链接
3. 用户手动安装

---

## 📊 推荐方案对比

| 方式 | 适用场景 | 难度 | 成本 | 更新方式 |
|------|---------|------|------|---------|
| **dist 分享** | 小团队/测试 | ⭐ | 免费 | 手动重新加载 |
| **Chrome Store** | 公开发布 | ⭐⭐⭐ | $5 | 自动更新 |
| **GitHub** | 开源项目 | ⭐⭐ | 免费 | 手动重新加载 |
| **企业分发** | 公司内部 | ⭐⭐⭐⭐ | 看情况 | 统一管理 |

---

## 💡 最佳实践建议

### 小团队使用
👉 **推荐：dist 分享**
- 构建 → 打包成 zip → 分享给团队
- 附上 `INSTALL.md` 安装说明

### 对外发布
👉 **推荐：Chrome Web Store**
- 官方渠道，用户信任度高
- 自动更新功能
- 用户体验最好

### 开源项目
👉 **推荐：GitHub + Chrome Store**
- GitHub 托管代码
- Chrome Store 提供安装渠道
- 两者互补

---

## 🔄 版本更新流程

### 更新插件版本

1. **修改版本号**
   ```json
   // src/manifest.json
   {
     "version": "1.0.1"  // 更新版本号
   }
   ```

2. **重新构建**
   ```bash
   npm run build
   ```

3. **根据分发方式：**
   - **dist 分享**：重新打包并分享
   - **Chrome Store**：上传新版本到开发者控制台
   - **GitHub**：创建新的 Release

### 版本号规范

遵循语义化版本（Semantic Versioning）：

```
主版本号.次版本号.修订号 (MAJOR.MINOR.PATCH)

1.0.0 → 初始版本
1.0.1 → Bug 修复
1.1.0 → 新增功能（向后兼容）
2.0.0 → 重大变更（可能不兼容）
```

---

## 📝 下一步

选择合适的分发方式，然后：

1. 📄 准备好 `INSTALL.md`（已创建）
2. 📦 构建并打包插件
3. 📤 分享给用户
4. 📖 提供使用文档（`README.md`）

祝分发顺利！🎉

