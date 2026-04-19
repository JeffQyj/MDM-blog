---
title: Fuwari 博客主题二开指南
published: 2024-12-01
description: 全面解析 Fuwari 博客主题的配置、自定义与部署
image: ''
tags: [Astro, Blog, Tutorial, Fuwari]
category: Guides
draft: false
---

## 项目简介

Fuwari 是一个基于 Astro 构建的静态博客主题，拥有以下特性：

| 特性 | 说明 |
|------|------|
| **技术栈** | Astro + Tailwind CSS + Svelte |
| **主题模式** |亮/暗/自动切换，支持自定义主题色 |
| **动画效果** | Swup 页面过渡动画 |
| **内容组织** | Markdown 扩展语法、目录生成、阅读时间 |
| **搜索功能** | Pagefind 全文搜索 |
| **部署平台** | Vercel / Netlify / GitHub Pages |

## 基础配置

所有核心配置集中在 `src/config.ts` 文件中。

### 站点信息配置

```typescript
export const siteConfig: SiteConfig = {
  title: "你的博客名称",
  subtitle: "你的博客副标题",
  lang: "zh_CN", // 支持: en, zh_CN, zh_TW, ja, ko, es, th, vi, tr, id
  themeColor: {
    hue: 250, // 主题色色相，0-360
    fixed: false, // 是否隐藏主题色切换器
  },
  // ...
};
```

### 导航栏配置

```typescript
export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,      // 首页
    LinkPreset.Archive,   // 归档页
    LinkPreset.About,      // 关于页
    {
      name: "GitHub",
      url: "https://github.com/你的用户名",
      external: true, // 外链会显示图标并在新标签页打开
    },
  ],
};
```

`LinkPreset` 是预定义的导航项枚举，也可完全自定义导航链接。

### 个人资料配置

```typescript
export const profileConfig: ProfileConfig = {
  avatar: "assets/images/demo-avatar.png", // 头像路径
  name: "你的名字",
  bio: "你的个人简介",
  links: [
    {
      name: "Twitter",
      icon: "fa6-brands:twitter", // 图标来自 icones.js.org
      url: "https://twitter.com/你的用户名",
    },
    {
      name: "GitHub",
      icon: "fa6-brands:github",
      url: "https://github.com/你的用户名",
    },
  ],
};
```

图标使用 [Iconify](https://icones.js.org/)，格式为 `集合:图标名`。常用图标集合：
- `fa6-brands` - Font Awesome 品牌图标
- `fa6-regular` - Font Awesome 常规图标
- `fa6-solid` - Font Awesome 实体图标
- `material-symbols` - Material Symbols

## 文章撰写

### 创建新文章

使用项目提供的脚本快速创建：

```bash
pnpm new-post 我的文章标题
```

这会在 `src/content/posts/` 目录下创建带 front-matter 的 Markdown 文件。

### Front-matter 字段

```yaml
---
title: 文章标题
published: 2024-12-01      # 发布日期
updated: 2024-12-15       # 更新日期（可选）
description: 文章描述      # 首页显示的摘要
image: ./cover.jpg         # 封面图
tags: [Tag1, Tag2]        # 标签
category: Guides           # 分类
draft: false               # 草稿状态，true 时不显示
lang: zh_CN               # 文章语言（可选）
---
```

### 扩展 Markdown 语法

#### 1. 提示块 (Admonitions)

```markdown
:::note
这是提示内容
:::

:::tip
这是技巧提示
:::

:::important
这是重要信息
:::

:::warning
这是警告
:::

:::caution
这是注意事项
:::
```

效果示例：

:::tip
提示块支持自定义标题：`:::tip[自定义标题]`
:::

#### 2. GitHub 仓库卡片

```markdown
::github{repo="owner/repo"}
```

#### 3. 链接渲染

标题自动生成锚点链接，访问 [Astro 文档](https://docs.astro.build/) 查看详细配置。

### 文章目录

默认在文章右侧显示目录，配置位于 `src/config.ts`：

```typescript
toc: {
  enable: true,           // 是否显示
  depth: 2,               // 目录深度 1-3
},
```

## 样式定制

### 主题色系统

主题色通过 CSS 变量 `(--hue)` 控制，色相值 0-360 对应不同颜色：

| 色相值 | 颜色示例 |
|--------|----------|
| 0 | 红色 |
| 60 | 黄色 |
| 120 | 绿色 |
| 180 | 青色 |
| 250 | 蓝色（默认）|
| 345 | 粉色 |

### CSS 变量配置

核心变量定义在 `src/styles/variables.styl`，包括：

- `--primary` - 主色调
- `--page-bg` - 页面背景
- `--card-bg` - 卡片背景
- `--codeblock-bg` - 代码块背景
- `--admonitions-color-*` - 各类型提示块颜色

### Banner 配置

```typescript
banner: {
  enable: true,
  src: "assets/images/demo-banner.png",
  position: "center", // top, center, bottom
  credit: {
    enable: false,
    text: "图片来源",
    url: "https://example.com",
  },
},
```

## 部署流程

### 1. 修改 GitHub 仓库地址

```bash
git remote remove origin
git remote add origin git@github.com:你的用户名/你的仓库名.git
```

### 2. 修改站点 URL

编辑 `astro.config.mjs`：

```javascript
export default defineConfig({
  site: "https://你的用户名.github.io", // 改为你的 GitHub Pages 地址
  // ...
});
```

### 3. GitHub Actions 自动构建

项目已配置 `.github/workflows/build.yml`，push 到 main 分支自动触发构建。

### 4. 启用 GitHub Pages

在仓库 **Settings → Pages → Source** 中选择 **GitHub Actions**。

### 部署到 Vercel / Netlify

推送代码后，连接仓库即可自动部署。Vercel 配置文件为空对象 `{}`，Netlify 无需额外配置。

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产版本（含搜索索引）|
| `pnpm preview` | 预览构建结果 |
| `pnpm new-post <name>` | 创建新文章 |
| `pnpm format` | 代码格式化 |
| `pnpm check` | 类型检查 |

## 目录结构

```
src/
├── config.ts           # 核心配置文件
├── constants/           # 常量定义
├── components/          # Astro/Svelte 组件
│   ├── control/        # 控制类组件
│   ├── misc/           # 杂项组件
│   └── widget/         # 侧边栏小组件
├── content/
│   ├── posts/          # 博客文章
│   └── spec/           # 特殊页面（如 about）
├── i18n/               # 国际化
├── layouts/            # 页面布局
├── pages/              # 页面路由
├── plugins/            # Markdown 插件
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## 进阶定制

### 添加新图标

如果需要使用的图标不在已有集合中：

```bash
pnpm add @iconify-json/<icon-set-name>
```

然后在 `src/config.ts` 的 icon 配置中添加即可。

### 修改页面宽度

编辑 `src/constants/constants.ts`：

```typescript
export const PAGE_WIDTH = 75; // 单位: rem
```

### 添加自定义页面

在 `src/pages/` 下创建 `.astro` 文件即可自动生成路由。例如创建 `src/pages/custom.astro`。

---

有问题或建议？欢迎提交 Issue 或 Pull Request。
