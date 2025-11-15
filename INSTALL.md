# Schema Editor 安装指南

## 📦 从源码安装

### 步骤 1：获取插件文件

从开发者处获取 `ChromeTools` 文件夹（或下载 zip 并解压）

### 步骤 2：安装到 Chrome

1. 打开 Chrome 浏览器
2. 在地址栏输入：`chrome://extensions/`
3. 开启右上角的 **"开发者模式"**
4. 点击 **"加载已解压的扩展程序"**
5. 选择 `ChromeTools/dist` 文件夹
6. 完成！插件图标应该出现在浏览器工具栏

### 步骤 3：使用插件

1. 点击工具栏的插件图标激活（会显示绿色 "ON" 徽章）
2. 在支持的页面上，按住 **Alt 键（Mac 使用 Option ⌥ 键）**
3. 鼠标悬停在元素上查看高亮和属性
4. 按住 Alt/Option 键并点击元素打开编辑器

## ⚠️ 注意事项

- 插件需要页面元素同时具有 `data-chat-msg-id` 和 `data-opener-component-id` 两个属性
- 页面需要提供 `window.__getSchemaById` 和 `window.__updateSchemaById` 方法
- 只在激活状态下工作

## 🔄 更新插件

1. 获取新版本的文件
2. 访问 `chrome://extensions/`
3. 找到 Schema Editor
4. 点击 🔄 **重新加载** 按钮

## ❓ 常见问题

**Q: 为什么显示"非法目标"？**  
A: 元素必须同时具有 `data-chat-msg-id` 和 `data-opener-component-id` 两个属性

**Q: 为什么悬停没有高亮？**  
A: 需要按住 Alt/Option 键

**Q: Mac 上用什么键？**  
A: 使用 Option ⌥ 键（在 Command 键旁边）

