# QYJ_MDM · All in AI

> 个人技术博客 · 记录 2022 年至今的编程学习与 AI 时代思考

基于 [Astro 5](https://astro.build) 的静态博客（SSG 模式），以中文内容为主，覆盖**编程技术笔记、项目实战、个人成长感悟**三大方向。

## ✨ 特性

- 🚀 **Astro 5 + Svelte 5**：静态生成 + 局部交互，按需加载
- 🎨 **Tailwind CSS 3**：可定制的深色 / 浅色主题
- 🌐 **多语言**：原生支持 10 种语言翻译
- 🔍 **Pagefind 全文搜索**：构建时生成索引，无后端依赖
- 🧮 **KaTeX 数学公式**：支持复杂公式渲染
- ✨ **Swup 页面过渡**：丝滑的页面切换动画
- 📡 **RSS 订阅**：自动生成 Feed
- 📱 **响应式设计**：移动端友好

## 📁 文章分类

| 分类   | 方向                |
| ---- | ----------------- |
| 成长碎记 | 个人成长、学习感悟、生活记录 |
| 个人杂谈 | 游戏、影视、随想等非技术内容 |
| 二次开发 | 基于现有项目的二次开发经验 |
| 独立项目 | 从零到一的完整项目实战    |
| 编程生涯 | 编程技术学习笔记       |

## 🛠️ 技术栈

| 技术           | 版本      | 用途       |
| ------------ | ------- | -------- |
| Astro        | 5.13.10 | 静态站点框架   |
| Svelte       | 5.39.8  | 交互式 UI  |
| Tailwind CSS | 3.4.19  | 样式框架     |
| TypeScript   | 5.9.3   | 类型安全     |
| Biome        | 2.2.5   | 格式化 + Lint |
| pnpm         | 9.14.4  | 包管理器     |
| Pagefind     | 1.4.0   | 静态搜索     |
| KaTeX        | 0.16.27 | 数学公式     |
| Swup         | 1.7.0   | 页面过渡     |

## 🚀 本地运行

环境要求：**Node.js ≥ 20**、**pnpm ≥ 9**

```bash
# 安装依赖
pnpm install

# 启动开发服务器（默认 http://localhost:4321/MDM-blog）
pnpm dev

# 类型检查
pnpm check

# 代码质量
pnpm lint       # Biome Lint
pnpm format     # Biome 格式化

# 生产构建（产物在 dist/，自动生成 Pagefind 索引）
pnpm build

# 预览构建产物
pnpm preview

# 新建文章
pnpm new-post <文件名>
```

## ✍️ 撰写文章

新文章统一存放在 `src/content/posts/`，按下面流程创作：

1. **运行** `pnpm new-post 分类：标题.md` 生成模板
2. **遵循** 站内 5 类固定分类与命名格式（`分类名称：具体标题`）
3. **参考** [`.trae/rules/article-workflow.md`](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-workflow.md) 工作流
4. **遵守** [`.trae/rules/article-constraints.md`](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md) 硬性规范
5. **对照** [`.trae/rules/article-examples.md`](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-examples.md) 正反例

站内跳转一律用 `../<slug>/` 相对路径（slug 是 Astro 生成的，不是 Markdown 文件原名）。

## 📐 项目结构

```
src/
├── content/posts/     # 博客文章（Markdown）
├── components/         # UI 组件（control / misc / widget）
├── layouts/            # 页面布局
├── pages/              # 路由
│   └── posts/[...slug].astro   # 文章详情页
├── styles/             # 样式（CSS + Stylus）
├── plugins/            # 自定义 remark / rehype 插件
├── i18n/               # 多语言翻译
├── utils/              # 工具函数
├── constants/          # 常量
└── config.ts           # 站点全局配置（标题、导航、作者）
```

## 🚢 部署

项目已配置 Vercel 部署（`vercel.json`），推送 `main` 分支即触发自动构建。修改 `astro.config.mjs` 中的 `base` 等配置可适配其他平台（Netlify / GitHub Pages / Cloudflare Pages）。

## 📄 许可证

本仓库的代码与配置遵循 [MIT 协议](https://opensource.org/licenses/MIT)。

文章内容（`src/content/posts/`）采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议，转载请保留署名与原文链接。

---

*记录学习的脚印 · 在 AI 时代保持思考 · All in AI*
