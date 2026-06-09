# Project Instructions

## Project Overview

MDM-blog 是一个基于 Astro 5 的个人技术博客，采用 SSG（Static Site Generation）模式。博客以中文内容为主，记录作者从 2022 年开始的编程学习历程，涵盖编程技术学习笔记、个人成长感悟、项目实战经验等内容。站点支持多语言国际化、静态搜索和深色/浅色主题切换。

## Tech Stack

| 技术           | 版本      | 用途          |
| ------------ | ------- | ----------- |
| Astro        | 5.13.10 | 静态站点框架      |
| Svelte       | 5.39.8  | 交互式 UI 组件   |
| Tailwind CSS | 3.4.19  | 样式框架        |
| TypeScript   | 5.9.3   | 类型安全        |
| Biome        | 2.2.5   | 代码格式化和 Lint |
| pnpm         | 9.14.4  | 包管理器        |
| Pagefind     | 1.4.0   | 静态搜索        |
| KaTeX        | 0.16.27 | 数学公式渲染      |
| Swup         | 1.7.0   | 页面过渡动画      |

## Code Style

### 命名约定

| 类型    | 约定                                 | 示例                                 |
| ----- | ---------------------------------- | ---------------------------------- |
| 文件名   | kebab-case                         | `blog-card.astro`, `date-utils.ts` |
| 组件名   | PascalCase                         | `PostCard.astro`, `Profile.svelte` |
| 变量/函数 | camelCase                          | `getPostData()`, `currentPage`     |
| 常量    | camelCase 或 SCREAMING\_SNAKE\_CASE | `MAX_ITEMS`, `siteConfig`          |

### 代码规范

- **TypeScript**：启用 `strict` 模式，禁止隐式 any
- **Astro/Svelte 文件**：使用 Tab 缩进
- **JavaScript/TypeScript**：使用双引号字符串
- **路径别名**：配置了 `@components/*`, `@utils/*`, `@layouts/*` 等别名
- **内容类型**：使用 Astro Content Collections + Zod schema 验证

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

### 主题配置一致性

- 站点元信息（标题、副标题、描述）统一在 `src/config.ts` 中管理
- 样式变量统一在 `src/styles/` 目录下管理
- 组件开发遵循现有组件的命名和结构模式

## Key Entry Points

| 文件                      | 用途                            |
| ----------------------- | ----------------------------- |
| `src/config.ts`         | 站点全局配置（标题、导航、作者信息）            |
| `src/content/config.ts` | Content Collections schema 定义 |
| `astro.config.mjs`      | Astro 配置、集成、插件                |
| `biome.json`            | 代码质量工具配置                      |
| `src/content/posts/`    | 博客文章存放目录                      |
| `scripts/new-post.js`   | 文章生成脚本                        |

