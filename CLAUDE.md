# Project Instructions

## Project Overview

MDM-blog 是一个基于 Astro 5 的个人技术博客，采用 SSG（Static Site Generation）模式。博客以中文内容为主，记录作者从 2022 年开始的编程学习历程，涵盖编程技术学习笔记、个人成长感悟、项目实战经验等内容。站点支持多语言国际化、静态搜索和深色/浅色主题切换。

## Tech Stack

| 技术 | 版本 | 用途 |
|------|------|------|
| Astro | 5.13.10 | 静态站点框架 |
| Svelte | 5.39.8 | 交互式 UI 组件 |
| Tailwind CSS | 3.4.19 | 样式框架 |
| TypeScript | 5.9.3 | 类型安全 |
| Biome | 2.2.5 | 代码格式化和 Lint |
| pnpm | 9.14.4 | 包管理器 |
| Pagefind | 1.4.0 | 静态搜索 |
| KaTeX | 0.16.27 | 数学公式渲染 |
| Swup | 1.7.0 | 页面过渡动画 |

## Code Style

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 文件名 | kebab-case | `blog-card.astro`, `date-utils.ts` |
| 组件名 | PascalCase | `PostCard.astro`, `Profile.svelte` |
| 变量/函数 | camelCase | `getPostData()`, `currentPage` |
| 常量 | camelCase 或 SCREAMING_SNAKE_CASE | `MAX_ITEMS`, `siteConfig` |

### 代码规范

- **TypeScript**：启用 `strict` 模式，禁止隐式 any
- **Astro/Svelte 文件**：使用 Tab 缩进
- **JavaScript/TypeScript**：使用双引号字符串
- **路径别名**：配置了 `@components/*`, `@utils/*`, `@layouts/*` 等别名
- **内容类型**：使用 Astro Content Collections + Zod schema 验证

## Testing

- 当前项目**未配置测试框架**
- 如需添加测试，建议使用 Vitest（与 Vite 生态兼容）

## Build & Run

```bash
# 安装依赖（强制使用 pnpm）
pnpm install

# 开发模式
pnpm dev          # 或 pnpm start

# 类型检查
pnpm check         # Astro 类型检查
pnpm type-check    # TypeScript 严格检查

# 代码质量
pnpm lint          # Biome Lint + 自动修复
pnpm format        # Biome 格式化

# 生产构建
pnpm build         # 构建 + Pagefind 索引

# 预览
pnpm preview
```

## Project Structure

```
src/
├── content/
│   ├── posts/          # 博客文章（Markdown）
│   ├── ref/            # 文章参考资料
│   ├── spec/           # 站点说明页面
│   └── config.ts       # Content Collections 定义
├── components/          # UI 组件
│   ├── control/        # 控制类组件（分页、返回顶部）
│   ├── misc/           # 杂项组件（图片、许可证）
│   └── widget/         # 侧边栏组件（目录、标签、作者）
├── layouts/            # 页面布局
├── pages/              # 路由页面
│   ├── posts/[...slug].astro   # 文章详情页
│   ├── [..page].astro          # 分页列表页
│   ├── archive.astro           # 归档页
│   └── about.astro             # 关于页
├── styles/             # 样式文件（CSS + Stylus）
├── plugins/            # 自定义 Astro 插件
│   ├── remark-*        # Markdown 插件
│   └── rehype-*       # HTML 转换插件
├── i18n/               # 国际化配置
│   └── languages/      # 10 种语言翻译
├── utils/              # 工具函数
├── constants/          # 常量定义
├── types/              # TypeScript 类型定义
└── config.ts           # 站点全局配置
```

## Conventions

### Git 提交规范

使用 Conventional Commits 格式：

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat: 新增文章自动生成脚本` |
| `fix` | Bug 修复 | `fix: 修复主题切换闪烁问题` |
| `docs` | 文档更新 | `docs: 更新博客文章` |
| `refactor` | 代码重构 | `refactor: 简化工具函数` |
| `chore` | 杂项任务 | `chore: 更新依赖版本` |

### 文章命名规范（最高优先级）

```
分类名称：[具体事件/阶段标题].md
```

示例：
- `编程生涯：从Hello-World开始的编程之路.md`
- `二次开发：博客诞生日志.md`
- `成长碎记：2024年终总结.md`

### 文章 Frontmatter 规范

```yaml
---
title: 文章标题
published: YYYY-MM-DD
description: 简短描述（50-150字）
tags: [标签1, 标签2]        # 数组形式，最多两个标签
category: 分类名称            # 固定五类之一
draft: false                 # true 表示草稿
lang: zh_CN                  # 语言代码
---
```

### 文章分类

博客文章分为五类：

| 分类 | 说明 |
|------|------|
| 成长碎记 | 个人成长、学习感悟、生活记录 |
| 个人杂谈 | 游戏、影视、随想等非技术内容 |
| 二次开发 | 基于现有项目的二次开发经验 |
| 独立项目 | 从零到一的完整项目实战 |
| 编程生涯 | 编程技术学习笔记 |

### 内容创作规范

1. **写作风格**：第一视角、亲切简洁、技术文章需代码注释
2. **禁止互动引导**：不出现「欢迎留言」「有问题请留言」等互动类内容
3. **Admonition 使用**：每篇文章需包含 tip、note、important、caution、warning 五种类型
4. **文章联动**：独立项目系列需与发布时间更早的系列文章进行联动

## Key Entry Points

| 文件 | 用途 |
|------|------|
| `src/config.ts` | 站点全局配置（标题、导航、作者信息） |
| `src/content/config.ts` | Content Collections schema 定义 |
| `astro.config.mjs` | Astro 配置、集成、插件 |
| `biome.json` | 代码质量工具配置 |
| `src/content/posts/` | 博客文章存放目录 |
| `scripts/new-post.js` | 文章生成脚本 |

## Additional Notes

- **CI/CD**：GitHub Actions 配置了 Biome 检查和构建流程
- **依赖更新**：使用 Dependabot 自动更新 npm 依赖
- **部署平台**：配置了 Vercel 部署（`vercel.json`）
- **静态搜索**：构建时生成 Pagefind 索引，支持站内全文搜索
- **代码高亮**：使用 astro-expressive-code 增强代码块显示

## Important Paths

- **项目规则**：`.trae/rules/project_rules*.md`（5 个规则文件）
- **博客文章**：`src/content/posts/**/*.md`（90+ 篇文章）
- **站点配置**：`src/config.ts`
- **样式变量**：`src/styles/variables.styl`
