# 书架页面实现方案 v2（含提前约束）

## 概要

新增 `/bookshelf/` 页面，按 `好书分享` 标签过滤展示好书分享类文章。设计采用「私人图书馆 / 图书馆目录」美学，重点展示书籍封面，双列布局，融合项目已有的金色 + 衬线 + 等宽字体的设计语言。`frontmatter.image` 字段在 schema 中已就绪，本计划**首次落地**使用。

| 属性        | 内容                                                |
| --------- | ------------------------------------------------- |
| 新增页面      | `/bookshelf/`                                     |
| 新增组件      | `BookshelfPanel.astro`、`BookCard.astro`           |
| 数据源       | frontmatter `tags` 包含 `好书分享` 的全部已发布文章             |
| 导航        | 加入 NavBar（位于 `Tech` 之后，`About` 之前）                  |
| 视觉关键词     | 图书馆 · 书架 · 烫金 · 衬线 · 双列 · 封面为先                       |
| i18n       | 新增 `bookshelf` 键（10 语言全量翻译）                         |
| 封面图位置     | `src/assets/books/`（中央目录）                          |
| 封面图适配策略   | 固定 `aspect-ratio: 2 / 3` + `object-fit: cover` + 默认 `object-position: center` |
| 文章分类      | `个人杂谈`（**不新增**「好书分享」分类）                           |
| 文章标签      | `好书分享` + 其他 1-4 个（`好书分享` 仅作为 tag）                  |
| 标题格式      | `个人杂谈：《书名》`                                      |

---

## 0. 提前约束（Pre-Constraints，新增章节）

> 本节是 v2 计划的新增内容，明确**封面图存放位置**与**封面图适配策略**，是后续撰写好书分享文章的硬性约束。
>
> **状态说明**：本节内容已于 2026-06-10 固化到 `.trae/rules/article-constraints.md` §8（含 §8.1 封面图存放位置、§8.2 封面图适配策略、§8.3 文章命名/标签/分类硬性约束、§8.4 为什么 `好书分享` 不做成 category）。**本节保留为设计决策记录与对比依据**，撰写好书分享文章时**以规则文件为准**。

### 0.1 封面图存放位置

| 项       | 规范                                                                          |
| ------- | --------------------------------------------------------------------------- |
| 存放根目录   | `src/assets/books/`（**新创建**，与 `src/assets/images/` 平级）                       |
| 文件命名    | 使用**书名**（不含《》书名号）作为文件名，全角书名号省略                                          |
| 文件格式    | 优先 **WebP**（推荐）；允许 JPG / PNG；Astro `Image` 组件会自动转码为现代格式                     |
| 推荐分辨率   | **1200 × 1800 px**（2:3 长宽比，2x DPI 适配 retina 屏）                              |
| 最小分辨率   | 600 × 900 px（避免高 DPI 屏糊图）                                                |
| frontmatter 写法 | `image: <书名>.webp`（相对 `src/assets/books/` 的文件名）                            |
| basePath 参数 | `BookCard.astro` 中固定传入 `basePath="assets/books/"`                            |

**示例**（以《被讨厌的勇气》为例）：

```text
src/
└── assets/
    └── books/
        └── 被讨厌的勇气.webp    ← 封面图

src/content/posts/
└── 个人杂谈：《被讨厌的勇气》.md  ← 对应文章
```

对应 frontmatter：

```yaml
---
title: 个人杂谈：《被讨厌的勇气》
published: 2026-06-10
description: 一本能让你重新定义「自由」与「幸福」的阿德勒心理学入门书——…
tags: [好书分享, 个人杂谈, 心理学]
category: 个人杂谈
image: 被讨厌的勇气.webp
draft: false
lang: zh_CN
---
```

**为什么不沿用现有「图片与 .md 同目录」惯例？**

| 方案             | 优点                       | 缺点                                                                          |
| -------------- | ------------------------ | --------------------------------------------------------------------------- |
| 图片与 .md 同目录（PostCard 现状） | 与现有代码零侵入                  | 1) 中文文件名 + 图片混在 90+ 个 .md 中，检索困难；2) 一篇好书文可能配多张图（多书合评）时难管理；3) 文件名含 `：` 在 Windows 上有兼容性隐患 |
| **中央目录 `src/assets/books/`（采用）** | 1) 所有书封集中管理；2) 易于做全站书封统计/检索；3) 文件名可用纯书名，无冲突；4) 与 `src/assets/images/`（站点头像/banner）风格一致 | 1) 需为 `BookCard.astro` 单独指定 `basePath`；2) 是新约定，无历史包袱（首次落地）       |

**注意**：`ImageWrapper.astro` 已支持任意 `basePath`，且 `import.meta.glob("../../**")` 扫描整个 `src/**`，零代码改动即可发现 `src/assets/books/` 下的图片。

> 📌 **本节内容已固化到规则文件**：[article-constraints.md §8.1 封面图存放位置](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L125-L164)。撰写文章时以规则为准。

### 0.2 封面图适配策略

| 维度       | 规范                                                                              |
| -------- | ------------------------------------------------------------------------------- |
| 容器宽高比    | 固定 `aspect-ratio: 2 / 3`（业界书封主流比例，竖向）                                            |
| 图片填充模式   | `object-fit: cover`（裁切以填满容器，绝不露白）                                                  |
| 裁切锚点     | `object-position: center`（默认居中裁切）                                                |
| 容器背景     | 浅金色渐变 `linear-gradient(180deg, oklch(0.62 0.13 78 / 0.08), oklch(0.78 0.13 85 / 0.08))`（占位底色，图片加载前可见） |
| hover 效果 | 图片轻微缩放 `transform: scale(1.03)` + 烫金描边加深 2px                                       |
| 暗色模式     | 占位底色降为深色 `oklch(0.25 0.04 var(--hue) / 0.4)`                                      |
| **缺图降级** | 当 `image` 为空或文件不存在时，渲染**「书脊 + 占位标题」** 兜底条（详见 §3 改动 9）                       |

**为什么不选其他方案？**

| 备选              | 评价                                                            |
| --------------- | ------------------------------------------------------------- |
| `object-fit: contain` 保留完整图 | 卡片高度不可控 → 破坏双列网格的「等高美感」，违背「书架」整齐语义                       |
| 不固定宽高比，按原图展示      | 同上，破坏网格                                                    |
| **固定 2:3 + cover（采用）** | 业内书封 90%+ 接近 2:3 → 损失最小；非 2:3 极端情况接受边缘裁切，视觉整齐度最高         |
| 引入新 schema 字段（如 `imagePosition`）允许每本书指定锚点 | 1) 侵入性增大；2) 当前 90%+ 情况 `center` 已够用；3) 未来真有需求时再迭代更优     |

**输入侧建议（已固化到 `article-constraints.md` 规范）**：

> 好书分享文章应使用 2:3 长宽比的封面图，且**关键视觉元素（书名、作者）应位于图片中心区域**。若原图非 2:3，请预先裁切/加白边到 2:3 再上传。

> 📌 **本节内容已固化到规则文件**：[article-constraints.md §8.2 封面图适配策略](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L166-L179)。撰写文章时以规则为准。

### 0.3 文章命名 / 标签 / 分类硬性约束

| 字段          | 规范                                                                          |
| ----------- | --------------------------------------------------------------------------- |
| 文件名         | `个人杂谈：《书名》.md`（全角书名号《 》，**书名内部如含 `：` 等系统保留字符，替换为全角 `：`**）              |
| `title`     | 与文件名完全一致                                                                    |
| `category`  | `个人杂谈`（**不**为「好书分享」新增 category）                                                |
| `tags`      | 数组，至少 2 个，至多 5 个；**`好书分享` 是必填第一项**；其余从已有标签池选（`个人杂谈`、`心理学`、`哲学`、`文学`、`技术` 等） |
| `image`     | 0.1 节约定的封面图文件名；不写则走「书脊占位」兜底                                                   |
| `published` | 实际发布/更新日期                                                                    |
| `lang`      | `zh_CN`                                                                    |

**为什么 `好书分享` 不做成 category？**

依据 `article-constraints.md §4.1` 五类固定分类规则，「好书分享」本质是「个人杂谈」下的内容子集，归类为「个人杂谈」即可；用 `tags: [好书分享]` 实现**内容子站**（书架页），避免分类膨胀（5 类已足够精简）。

> 📌 **本节内容已固化到规则文件**：[article-constraints.md §8.3 命名/标签/分类硬性约束](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L181-L191) 与 [§8.4 为什么 `好书分享` 不做 category](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L193-L193)。撰写文章时以规则为准。

---

## 1. 当前状态分析

### 1.1 关键发现

| 维度     | 现状                                              | 结论           |
| ------ | ----------------------------------------------- | ------------ |
| 框架     | Astro 5.13.10 + Svelte 5.39.8 + Tailwind 3.4.19  | 无需新增依赖       |
| 路由模式   | `pages/<route>.astro` → `MainGridLayout.astro` 包裹 | 沿用 `featured.astro` 范式 |
| 列表页范式  | `*.astro` 页面文件 + `*Panel.{astro\|svelte}` 组件     | 严格遵循         |
| 数据源    | `src/content/posts/*.md` + Zod schema            | schema 已支持 `image` 字段 |
| 过滤工具   | `src/utils/content-utils.ts` 提供 `getFeaturedPosts` / `getProjectPosts` | 复制该模式新增 `getBookshelfPosts` |
| 样式规范   | 原生 CSS + `oklch()` + CSS 变量                      | 全部用现有 token   |
| 字体     | Syne / Noto Serif SC（标题）、JetBrains Mono（meta）      | 直接复用         |
| i18n   | enum (`i18nKey.ts`) + 10 语言文件 + `i18n()` 函数       | 新增键需全量翻译     |
| 导航     | `LinkPreset` 枚举 + `LinkPresets` 映射               | 末尾追加避免破坏已有引用 |
| 图片方案   | frontmatter `image: string`（schema 已就绪）+ `ImageWrapper.astro` | 零改造直接使用，新增 `assets/books/` 子目录即可 |

### 1.2 schema 字段确认（`src/content/config.ts`）

```ts
image: z.string().optional().default(""),  // ← 已存在
tags:  z.array(z.string()).optional().default([]),  // ← 已存在
```

`image` 字段是 **可选字符串**，默认空串。**零 schema 改动**。当前没有任何文章使用 `image` 字段，书架页是首次落地。

### 1.3 `ImageWrapper.astro` 工作机制

- 本地图片：`import.meta.glob("../../**")` 扫描整个 `src/**`，通过 `basePath + src` 拼出绝对路径
- 公网图片（`http://`/`https://`/`data:`）：原样传递
- 公共目录图片（`/` 开头）：走 `url()` 工具拼站点 base URL
- **支持任意 `basePath`**，只要拼出的路径在 `src/` 下即可被 glob 命中

`src/assets/books/被讨厌的勇气.webp` + `basePath="assets/books/"` + `src="被讨厌的勇气.webp"` → `Image` 组件正常工作 ✓

### 1.4 既有范式参考

| 范式         | 引用                                          | 借鉴价值           |
| ---------- | ------------------------------------------- | -------------- |
| Hero 英雄区  | `FeaturedPanel.astro` / `ProjectsPanel.astro` / `tech.astro` | eyebrow + 大标题 + 数据条 + 四角角标 + 星点 |
| 卡片双列      | `ProjectCard.astro` (`grid-template-columns: repeat(2, 1fr)` @ 768px) | 直接复用           |
| 衬线大标题     | `FeaturedCard.__title`                      | 沿用风格           |
| 等宽 meta   | `ProjectCard.__meta`                        | 沿用             |
| READ 按钮   | `ProjectCard.__read-btn`                    | 直接复用           |
| 封面渲染（侧栏小图） | `PostCard.astro:108-117` + `ImageWrapper.astro`  | 改造为 2:3 主图    |

---

## 2. 方案决策

### 决策 1：过滤方式 — 标签过滤

| 维度       | 封面图过滤             | 标签过滤（**采用**）                          |
| -------- | ----------------- | ------------------------------------- |
| 数据模型侵入   | 隐式约定（每篇好书文有图、其它文无图） | 显式 opt-in，作者明确标注                      |
| 误伤风险     | 高                 | 零                                     |
| 跨页复用     | 仅本页               | 同时可用于 `/archive/?tag=好书分享`             |
| 未来扩展     | 弱                 | 强（可拓展「必读」「影评」等）                      |
| 改动量      | content-utils     | content-utils + i18n + LinkPreset       |

**用户已明确指示**：「在标签中固定一个好书分享的标签，通过该标签过滤展示」。

**决策**：采用标签过滤，标签名沿用 `好书分享`（中文，与 `成长碎记` / `个人杂谈` 风格一致）。

### 决策 2：视觉风格 — 图书馆目录美学

继承项目已有 token，新增 1-2 个图书馆元素（书签丝带、书脊色条），保持"延续 > 创新"。

| 来源                    | 元素                          | 是否沿用 |
| --------------------- | --------------------------- | ---- |
| `FeaturedPanel.astro` | 衬线大标题、eyebrow、杂志感         | ✅    |
| `ProjectsPanel.astro` | 角标、栅格底纹、金色渐变文字、monospace meta | ✅    |
| `tech.astro`          | 星点装饰、四角 ┌ ┐ └ ┘、金色描边 SVG  | ✅    |
| **新增（图书馆风）**          | 书签丝带 / 书脊色条 / 烫金边         | ✅    |

### 决策 3：卡片布局 — 横版（封面左 + 信息右）

| 备选        | 优                                | 劣              |
| --------- | -------------------------------- | -------------- |
| 竖向（封面上 + 信息下） | 像真实书架立放                          | 信息宽度受限，移动端需要切换布局 |
| **横版（封面左 + 信息右）（采用）** | 桌面端两列等高，封面纵向 2:3 仍能充分展示 | —              |
| 整封面 + 浮层信息 | 封面最聚焦                            | 描述截断需浮层，可访问性差    |

### 决策 4：封面适配（v2 新增，详见 §0.2）

- 固定 `aspect-ratio: 2 / 3`
- `object-fit: cover` + 默认 `object-position: center`
- 缺图走「书脊占位」兜底

---

## 3. 详细改动

### 改动 1：数据层 — `src/utils/content-utils.ts`（追加）

在 `getProjectPosts` 之后追加：

```ts
// 书架页使用：标签中包含 "好书分享" 的全部已发布文章，按 published 倒序
// 返回完整 entry（含 body）供 Astro 组件在构建时调用 entry.render()
export async function getBookshelfPosts(): Promise<CollectionEntry<"posts">[]> {
  const allPosts = await getRawSortedPosts();
  return allPosts.filter((post) =>
    (post.data.tags ?? []).includes("好书分享"),
  );
}
```

**理由**：
- 与 `getFeaturedPosts` / `getProjectPosts` 模式完全一致，**最小理解成本**
- `tags` schema 已存在，**零 schema 改动**
- 自动按 `getRawSortedPosts` 的 `published` 降序排列

### 改动 2：类型枚举 — `src/types/config.ts`（末尾追加）

```ts
export enum LinkPreset {
  Home = 0,
  Archive = 1,
  About = 2,
  Featured = 3,
  Projects = 4,
  Tech = 5,
  Bookshelf = 6,  // ← 新增，必须放末尾
}
```

**注意**：数字枚举值不能插入到中间（会破坏 LinkPresets 映射表的语义），必须末尾追加。

### 改动 3：导航预设 — `src/constants/link-presets.ts`（追加）

```ts
[LinkPreset.Bookshelf]: {
  name: i18n(I18nKey.bookshelf),
  url: "/bookshelf/",
},
```

### 改动 4：i18n — `src/i18n/i18nKey.ts`（末尾追加）

```ts
enum I18nKey {
  // ... 既有项 ...
  bookshelf = "bookshelf",  // ← 新增
}
```

### 改动 5：i18n — 10 个语言文件（全部追加）

| 文件                                  | 翻译                              |
| ----------------------------------- | ------------------------------- |
| `src/i18n/languages/zh_CN.ts`       | `[Key.bookshelf]: "书架"`          |
| `src/i18n/languages/zh_TW.ts`       | `[Key.bookshelf]: "書架"`          |
| `src/i18n/languages/en.ts`          | `[Key.bookshelf]: "Bookshelf"`  |
| `src/i18n/languages/ja.ts`          | `[Key.bookshelf]: "本棚"`          |
| `src/i18n/languages/ko.ts`          | `[Key.bookshelf]: "책장"`          |
| `src/i18n/languages/es.ts`          | `[Key.bookshelf]: "Estantería"` |
| `src/i18n/languages/th.ts`          | `[Key.bookshelf]: "ชั้นหนังสือ"`    |
| `src/i18n/languages/vi.ts`          | `[Key.bookshelf]: "Kệ sách"`     |
| `src/i18n/languages/tr.ts`          | `[Key.bookshelf]: "Kitaplık"`    |
| `src/i18n/languages/id.ts`          | `[Key.bookshelf]: "Rak Buku"`   |

### 改动 6：导航配置 — `src/config.ts`（追加）

在 `navBarConfig.links` 中加入 `LinkPreset.Bookshelf`，位置在 `Tech` 之后：

```ts
links: [
  LinkPreset.Home,
  LinkPreset.Projects,
  LinkPreset.Featured,
  LinkPreset.Tech,
  LinkPreset.Bookshelf,  // ← 新增
  LinkPreset.About,
  LinkPreset.Archive,
],
```

### 改动 7：页面文件 — `src/pages/bookshelf.astro`（新建）

```astro
---
import BookshelfPanel from "@components/BookshelfPanel.astro";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import MainGridLayout from "@layouts/MainGridLayout.astro";
import { getBookshelfPosts } from "../utils/content-utils";

const bookshelfPosts = await getBookshelfPosts();
---

<MainGridLayout
  title={i18n(I18nKey.bookshelf)}
  description="私人书架：精选值得反复品读的好书"
>
  <BookshelfPanel posts={bookshelfPosts}></BookshelfPanel>
</MainGridLayout>
```

### 改动 8：主面板 — `src/components/BookshelfPanel.astro`（新建）

**结构**（参考 `FeaturedPanel.astro` 与 `ProjectsPanel.astro`）：

```
.bookshelf-page
├── .bookshelf-hero                    // 英雄区
│   ├── 装饰层：左右各一条竖向"书脊"渐变（拟书架边缘）
│   ├── 装饰层：四角 ┌ ┐ └ ┘ 角标（继承自 ProjectsPage / TechPage）
│   ├── 装饰层：背景细密点阵 + 烫金细线
│   ├── .bookshelf-hero__eyebrow       // "READING SHELF · 私人书架"
│   ├── .bookshelf-hero__title          // 大字「书架 / Bookshelf」
│   ├── .bookshelf-hero__subtitle       // 副标题
│   └── .bookshelf-hero__meta           // 3 项数据：藏书数 / 最新入架日期 / 阅读总时长
├── .bookshelf-grid                     // 双列网格（移动端 1 列）
│   └── <BookCard /> × N
└── .bookshelf-empty                    // 空状态（标签未被使用时）
```

**视觉 token**（与项目统一）：
- 衬线标题：`"Syne", "Noto Serif SC", "Source Han Serif SC", serif`
- 等宽 meta：`"JetBrains Mono Variable", ui-monospace, ...`
- 金色三阶（深/中/浅）：`oklch(0.62 0.13 78)` / `oklch(0.78 0.13 85)` / `oklch(0.9 0.08 88)`（沿用 Projects）
- 入场动画：`@keyframes fadeUp` 0.7s `cubic-bezier(0.22, 1, 0.36, 1)`
- 暗色适配：`:root.dark` 选择器（与其它页面一致）

**数据条**（3 项）：
- `TOTAL`：好书数
- `LATEST`：最新入架日期（YYYY-MM-DD）
- `SHELVED`：累计阅读总时长（小时 / 分钟）

### 改动 9：卡片 — `src/components/BookCard.astro`（新建）

**目标**：以封面图为主角，文字元信息为辅。

**桌面端布局**（横版，左封面 + 右信息）：

```
┌──────────────────────────────────────┐
│  .book-card（圆角 16px，深色阴影）    │
│                                      │
│  ┌──────────────┐  ┌────────────────┐│
│  │              │  │  #01           ││
│  │  封面图        │  │  个人杂谈       ││
│  │  (2:3 竖向)    │  │  ───           ││
│  │  object-fit   │  │  标题（大字）    ││
│  │  : cover      │  │  ───           ││
│  │              │  │  描述（2 行）   ││
│  │  📕 书脊色条   │  │                ││
│  │  (右侧 6px)  │  │  #好书分享 ... ││
│  │              │  │                ││
│  │  烫金描边     │  │  📅 2025-xx-xx ││
│  │  (hover 2px)  │  │  ⏱ 8 分钟  READ││
│  └──────────────┘  └────────────────┘│
│  ▲ 书签丝带                            │
│  (右上角 12px)                         │
└──────────────────────────────────────┘
```

**移动端布局**（768px 以下）：
- 切换为**竖向**（封面上 + 信息下）
- 封面图宽度撑满，高度按 2:3 等比缩放
- 书签丝带保留右上角位置

**关键元素清单**：

| 元素       | 描述                                                                 | 实现方式                                                                  |
| -------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 封面图容器    | 固定 `aspect-ratio: 2 / 3`                                        | `<div class="book-card__cover-wrap">`                                |
| 封面图底色    | 浅金色渐变占位，图片加载前/缺图时显示                                                 | `background: linear-gradient(180deg, gold/0.08, gold/0.12)`         |
| 封面图      | 主体，2:3，`object-fit: cover`，`object-position: center`         | `<ImageWrapper>` + `basePath="assets/books/"`                       |
| 烫金描边     | 封面四边 1px 浅金（hover 时加深变 2px）                                         | `box-shadow: inset 0 0 0 1px var(--gold)`                           |
| 书脊色条     | 封面右侧 6px 宽的渐变色带，呼应实体书                                              | 绝对定位 `<span>` + `linear-gradient(180deg, var(--gold-deep), var(--gold))` |
| 书签丝带     | 卡片右上角 12px 宽丝带，与书脊色同色系                                            | `clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)`        |
| 序号       | 右上角 monospace 数字（`#01` 格式）                                          | 沿用 `ProjectCard.__index`                                            |
| 分类 chip  | 衬线小帽                                                               | 沿用 `FeaturedCard.__category`                                        |
| 标题       | 衬线大字，左侧金 bar                                                       | 沿用 `FeaturedCard.__title`                                          |
| 描述       | 2 行截断，斜体                                                            | 沿用 `ProjectCard.__summary`                                         |
| 标签 chips | 第一个 chip（`好书分享`）金色高亮，其余等宽灰                                       | 沿用 `ProjectCard.__tech-chip` 风格                                    |
| 日期 / 时长  | monospace 小字 + Icon                                                | 沿用 `ProjectCard.__meta`                                            |
| READ 按钮  | 圆形描边按钮                                                              | 直接复用 `ProjectCard.__read-btn`                                     |

**v2 新增 — 缺图降级策略**：

当 `image` 为空或文件不存在时（通过 `hasCover` 判断），封面区**不渲染** `<ImageWrapper>`，改为渲染「书脊占位条」：

```astro
{hasCover ? (
  <div class="book-card__cover-wrap">
    <ImageWrapper
      src={image}
      basePath="assets/books/"
      alt={title}
      position="center"
      class="book-card__cover-img"
    />
  </div>
) : (
  <div class="book-card__cover-wrap book-card__cover-wrap--placeholder">
    <div class="book-card__cover-placeholder">
      <span class="book-card__placeholder-eyebrow">COVER PENDING</span>
      <span class="book-card__placeholder-title">{title.replace(/个人杂谈：/, '').replace(/《|》/g, '')}</span>
      <span class="book-card__placeholder-hint">封面待补</span>
    </div>
  </div>
)}
```

占位条设计：
- 浅金色书脊渐变（与书脊色条同色系）+ 衬线书名居中 + 「封面待补」小字
- 与有封面卡片保持**等高**，不破坏双列网格
- 视觉降权：占位条饱和度低于实封面，让用户直观看到「需补图」

### 改动 10：空状态样式

`.bookshelf-empty` 区块（参考 `FeaturedPanel.astro` 既有写法）：

> 暂无书架收录，去给想要展示的文章加上 `tags: [好书分享, ...]` 吧。

---

## 4. 文件改动清单

| #  | 文件                                       | 类型    | 改动                                |
| -- | ---------------------------------------- | ----- | --------------------------------- |
| 1  | `src/utils/content-utils.ts`             | 编辑    | 追加 `getBookshelfPosts()`         |
| 2  | `src/types/config.ts`                    | 编辑    | `LinkPreset` 末尾追加 `Bookshelf = 6` |
| 3  | `src/constants/link-presets.ts`          | 编辑    | 追加 `[LinkPreset.Bookshelf]`      |
| 4  | `src/i18n/i18nKey.ts`                    | 编辑    | enum 末尾追加 `bookshelf`           |
| 5  | `src/i18n/languages/*.ts`                | 编辑    | 10 个文件各追加 1 行翻译                   |
| 6  | `src/config.ts`                          | 编辑    | `navBarConfig.links` 中插入 `LinkPreset.Bookshelf` |
| 7  | `src/assets/books/`                      | 新建目录  | 首次创建，存放书封                          |
| 8  | `src/pages/bookshelf.astro`              | 新建文件  | 页面入口（仿 `featured.astro`）           |
| 9  | `src/components/BookshelfPanel.astro`    | 新建文件  | Hero + 网格 + 空状态                    |
| 10 | `src/components/BookCard.astro`          | 新建文件  | 书籍卡片（含缺图降级）                        |
| 11 | `.trae/rules/article-constraints.md`     | ✅ 已前置完成 | 新增「好书分享文章约束」§8（封面图存放/适配/命名/分类），见 [规则文件](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L121-L193) |

**总计**：6 处编辑 + 1 个新目录 + 3 个新文件 + 1 个规范文档更新。**零依赖新增**。

---

## 5. 假设与决策

| #  | 假设                  | 若要变更                                  |
| -- | ------------------- | ------------------------------------- |
| 1  | 标签名采用 `好书分享`        | 改 `content-utils.ts` 字符串               |
| 2  | 页面 URL 采用 `/bookshelf/` | 改 `link-presets.ts` 与 `pages/bookshelf.astro` |
| 3  | NavBar 位置：Tech 之后、About 之前 | 改 `config.ts` `navBarConfig.links` 数组顺序 |
| 4  | **封面图存放 `src/assets/books/`** | 改 `BookCard.astro` 的 `basePath`         |
| 5  | **封面图命名 = 书名（无《》）**  | 改 `BookCard.astro` 取值逻辑                  |
| 6  | **封面图固定 2:3 + object-fit: cover + center** | 改 `BookCard.astro` CSS                  |
| 7  | **`好书分享` 仅作 tag，不作 category** | 不变（与 5 类固定分类规则一致）                     |
| 8  | **文章标题格式 `个人杂谈：《书名》`** | 改 `article-constraints.md`              |
| 9  | **缺图走「书脊占位」降级**      | 改 `BookCard.astro`                     |
| 10 | 无好书文章时显示空状态          | 已规划                                  |
| 11 | 不实现按"已读 / 未读 / 评分"细分   | 后续工作                                 |

---

## 6. 验证步骤

| #  | 命令 / 操作                                                                              | 预期                                   |
| -- | ------------------------------------------------------------------------------------ | ------------------------------------ |
| 1  | `pnpm install`                                                                       | 依赖完整（应当无需新增）                         |
| 2  | `pnpm check`                                                                         | 类型检查通过（含 LinkPreset、i18n 新增项）          |
| 3  | `pnpm format`                                                                        | Biome 格式化                            |
| 4  | `pnpm build`                                                                         | 全量构建无 SSR 错误（`BookshelfPanel` 需正确调用 `entry.render()`） |
| 5  | `pnpm dev`                                                                           | 启动 dev server，手工验证：<br>① 访问 `/bookshelf/` 正常打开<br>② NavBar 出现「书架」<br>③ 无标签文章时显示空状态<br>④ 暗色模式视觉一致 |
| 6  | 准备 3 张测试封面图到 `src/assets/books/`：<br>① 2:3 竖向图<br>② 1:1 正方形图<br>③ 4:3 横向图 | 验证适配策略：均按 2:3 显示，居中裁切，构图合理           |
| 7  | 准备一篇**无封面**的好书分享文章                                                              | 验证「书脊占位」降级条正确渲染                      |
| 8  | 准备一篇**有封面**的好书分享文章                                                               | 验证完整渲染：封面图加载、书脊色条、书签丝带、hover 效果       |
| 9  | 二次 `pnpm check`                                                                     | 确认无回退                                |

---

## 7. 推荐落地顺序

| 步骤 | 任务                              | 产出                            |
| -- | ------------------------------- | ----------------------------- |
| 1  | 创建 `src/assets/books/` 目录       | 目录就绪                          |
| 2  | 准备 2-3 张测试封面图到该目录             | 验证 `ImageWrapper` 能正确发现并加载     |
| 3  | 实施数据层（改动 1）                    | `getBookshelfPosts()` 函数就绪     |
| 4  | 实施类型/i18n/导航（改动 2-6）          | 编译通过                          |
| 5  | 实施 BookCard + BookshelfPanel（改动 8-10） | 页面可访问                         |
| 6  | 实施页面入口（改动 7）                   | 路由可达                          |
| 7  | 跑 `pnpm check` / `pnpm dev` 全量验证 | 符合验收                          |
| 8  | **调用 `design-taste-frontend` skill** | 视觉打磨（封面比例 / 配色 / 烫金细节 / 丝带角度） |
| 9  | ✅ 更新 `article-constraints.md`（已前置到 2026-06-10 完成） | §8 规范已固化，见 [规则文件](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L121-L193) |

---

## 8. 不在本次实现范围

- 创建样例文章：用户后续撰写第一篇「好书分享」时按 §0.3 规范执行
- 筛选增强：按"已读 / 未读 / 评分"细分（本次仅做"全部"）
- 外链扩展：豆瓣/购买链接（需新增 frontmatter 字段）
- 封面图 `imagePosition` 字段：当前 90%+ 情况 `center` 已够用，**真有必要时再迭代**（详见 §0.2 决策表）

---

## 9. 引用文件清单（已读取）

| 文件                                  | 用途                            |
| ----------------------------------- | ----------------------------- |
| `src/content/config.ts`             | 确认 `image` / `tags` 字段已存在       |
| `src/content/posts/*.md`            | 确认现有 frontmatter 样例（**无 `image` 字段**） |
| `src/utils/content-utils.ts`        | 复制 `getFeaturedPosts` 模式       |
| `src/types/config.ts`               | `LinkPreset` 枚举末尾追加           |
| `src/constants/link-presets.ts`     | 追加 `LinkPresets[Bookshelf]`     |
| `src/config.ts`                     | `navBarConfig.links` 插入新预设      |
| `src/i18n/i18nKey.ts`               | enum 追加                     |
| `src/i18n/languages/*.ts`           | 10 个文件全部追加翻译                  |
| `src/pages/featured.astro`          | 页面骨架参考                       |
| `src/pages/projects.astro`          | 页面骨架参考                       |
| `src/components/FeaturedPanel.astro` | Hero 范式参考                    |
| `src/components/FeaturedCard.astro`  | 衬线标题 + READ 按钮范式             |
| `src/components/ProjectCard.astro`   | 角标 + monospace meta + 双列网格范式   |
| `src/components/PostCard.astro`      | 封面图渲染范式（`ImageWrapper` 用法）    |
| `src/components/misc/ImageWrapper.astro` | 图片组件（支持任意 `basePath`）         |
| `src/layouts/MainGridLayout.astro`   | 页面布局（无需改动）                  |
| `src/pages/posts/[...slug].astro`   | 确认文章详情页封面图渲染（作为参考）           |
| `.trae/rules/article-constraints.md` | 规范参考，本次将新增「好书分享」小节           |
| `scripts/new-post.js`               | 文章生成脚本（无需改动）                |

---

## 10. 与原计划差异（v1 → v2）

| 维度       | v1（[原计划](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/documents/bookshelf-page-implementation-plan.md)） | v2（本计划）                                |
| -------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 封面图存放    | 「假设 4」一笔带过（沿用 PostCard 同目录惯例）                                                                           | **中央目录 `src/assets/books/`**，新增 §0.1 详细规范 |
| 封面图适配    | 「改动 9」提到 2:3 竖向、`object-fit: cover`，但未明确 `object-position` 与缺图降级                                         | **新增 §0.2**，明确 2:3 + cover + center + 缺图「书脊占位」 |
| 文章标题格式   | 未明确                                                                                               | **新增 §0.3**，`个人杂谈：《书名》`              |
| `好书分享` 性质 | 「决策 1」定位为 tag，但「假设 6」重复提了不作为 category（隐含）                                                              | **§0.3 显式约束**：仅作 tag，category 固定 `个人杂谈` |
| 缺图降级     | 提了一句「若文章缺 `image`，回退到'书脊 + 占位标题'占位条」，实现细节模糊                                                            | **§3 改动 9** 给出完整代码示例与视觉规范              |
| 落地顺序     | 无                                                                                                | **§7** 明确 9 步顺序，包含**先准备测试图**          |
| 视觉打磨时机   | 「执行阶段建议」一句话                                                                                            | **§7 步骤 8** 显式调用 `design-taste-frontend` skill |
| 规范文档更新   | 无                                                                                                | **§4 改动 11** 更新 `article-constraints.md` |

---

## 11. 计划同步记录

> 本节记录本计划文档相对 v2 原始定稿的**事后变更**，便于回溯。

### 11.1 2026-06-10 — 约束前置固化

**触发**：用户准备撰写第一篇好书分享文章，要求**先**把 §0 提前约束落到规则文件，以便在创作时直接引用。

**变更**：
1. 在 `.trae/rules/article-constraints.md` 新增「§8 好书分享文章约束」（含 §8.1 封面图存放位置、§8.2 封面图适配策略、§8.3 命名/标签/分类硬性约束、§8.4 为什么 `好书分享` 不做 category）
2. 本计划文档同步调整：
   - §0 标题下加注「已固化到 article-constraints.md §8，本节保留为设计决策记录」
   - §0.1 / §0.2 / §0.3 末尾各加 1 行指针提示，避免双写
   - §4 改动 11 状态：`编辑（可选）` → `✅ 已前置完成`
   - §7 步骤 9 状态：`更新 article-constraints.md` → `✅ 已完成（已前置到 2026-06-10）`
   - 新增本节（§11）记录变更

**Single Source of Truth**：
- 撰写文章时 → 以 [article-constraints.md §8](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md#L121-L193) 为准
- 阅读设计决策与对比依据 → 以本计划文档 §0、§2、§10 为准

**未变更**：本计划文档 §0 的内容文字保持原样（仅追加指针），便于历史回溯与「为什么这样设计」的解释。
