# 精选文章页面实现计划

## Summary

为博客新增 `/featured/` 精选文章页面，提供「作者精心挑选」的文章列表展示。流程上：
1. 在文章 frontmatter 增加 `featured` 标记字段
2. 新增导航入口（精选文章）
3. 新增 `/featured/` 路由 + 2 列网格卡片列表
4. 卡片为新建的 `FeaturedCard.astro`，按时间倒序排列

## Current State Analysis

### 关键发现

| 文件 | 现状 | 关联点 |
|---|---|---|
| `src/pages/archive.astro` | 归档页：调 `getSortedPostsList()`，渲染 `ArchivePanel.svelte` | **页面结构范本**（参考实现） |
| `src/components/ArchivePanel.svelte` | 按年分组 + 时间轴 + tag 行内显示 | **不被复用**，精选页改用网格卡片 |
| `src/config.ts` | `navBarConfig.links` + `LinkPreset` 枚举 | 需新增 `LinkPreset.Featured` |
| `src/constants/link-presets.ts` | `LinkPresets[LinkPreset.X]` 映射 | 需新增 Featured 映射 |
| `src/types/config.ts` | `LinkPreset` 枚举 | 需新增 `Featured = 3` |
| `src/content/config.ts` | postsCollection schema | **需扩展 `featured` 字段** |
| `src/i18n/i18nKey.ts` + 10 个语言文件 | i18n key 字典 | 需新增 `featured` key |
| `src/components/PostCard.astro` | 现通用文章卡（横向 cover+元信息） | **不修改** |
| `src/components/PostMeta.astro` | 复用：日期/分类/tag 元信息展示 | 在 FeaturedCard 中按需引用 |
| `src/utils/content-utils.ts` | 已有 `getRawSortedPosts` / `getSortedPostsList` | 需新增 `getFeaturedPosts()` |
| `src/layouts/MainGridLayout.astro` | 通用布局 | 直接复用 |

### 现导航栏 links
```ts
// src/config.ts
export const navBarConfig: NavBarConfig = {
    links: [LinkPreset.Home, LinkPreset.Archive, LinkPreset.About, GitHub外链],
};
```

### 现归档页实现
```astro
---
import ArchivePanel from "@components/ArchivePanel.svelte";
const sortedPostsList = await getSortedPostsList();
---
<MainGridLayout title={i18n(I18nKey.archive)}>
    <ArchivePanel sortedPosts={sortedPostsList} client:only="svelte"></ArchivePanel>
</MainGridLayout>
```

## Proposed Changes

### 1. 扩展 Content Collections Schema
**文件**：`src/content/config.ts`
- 在 `postsCollection.schema` 中新增 `featured: z.boolean().optional().default(false)`
- **为何**：用户选定的标记方案——`featured: true` 即为精选

```ts
const postsCollection = defineCollection({
    schema: z.object({
        // ... 已有字段
        featured: z.boolean().optional().default(false),
    }),
});
```

### 2. 新增工具函数
**文件**：`src/utils/content-utils.ts`
- 在文件末尾新增 `getFeaturedPosts()`：复用 `getRawSortedPosts()` 后过滤 `data.featured === true`
- 返回 `PostForList[]`（与 `getSortedPostsList` 同类型）
- **为何**：保持与归档页一致的排序/草稿过滤逻辑

```ts
export async function getFeaturedPosts(): Promise<PostForList[]> {
    const allPosts = await getRawSortedPosts();
    return allPosts
        .filter((post) => post.data.featured === true)
        .map((post) => ({ slug: post.slug, data: post.data }));
}
```

### 3. 新增 i18n Key
**文件**：`src/i18n/i18nKey.ts`（新增 1 个枚举项）

```ts
featured = "featured",
```

**文件**：`src/i18n/languages/*.ts`（10 个语言文件全部新增一行）
- `zh_CN.ts`: `[Key.featured]: "精选"`
- `en.ts`: `featured: "Featured"`
- 其他 8 种语言补充占位翻译

### 4. 扩展 LinkPreset
**文件**：`src/types/config.ts`

```ts
export enum LinkPreset {
    Home = 0,
    Archive = 1,
    About = 2,
    Featured = 3,  // 新增
}
```

**文件**：`src/constants/link-presets.ts`

```ts
import { i18n } from "@i18n/translation";
// ...
[LinkPreset.Featured]: {
    name: i18n(I18nKey.featured),
    url: "/featured/",
},
```

### 5. 添加导航栏入口
**文件**：`src/config.ts`
- 在 `navBarConfig.links` 中插入 `LinkPreset.Featured`（放在 Archive 与 About 之间，与"内容浏览"语义分组）

```ts
export const navBarConfig: NavBarConfig = {
    links: [
        LinkPreset.Home,
        LinkPreset.Archive,
        LinkPreset.Featured,  // 新增
        LinkPreset.About,
        { name: "GitHub", ... },
    ],
};
```

### 6. 新增精选页面
**文件**：`src/pages/featured.astro`（新建）

```astro
---
import FeaturedPanel from "@components/FeaturedPanel.astro";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import MainGridLayout from "@layouts/MainGridLayout.astro";
import { getFeaturedPosts } from "../utils/content-utils";

const featuredPosts = await getFeaturedPosts();
---
<MainGridLayout title={i18n(I18nKey.featured)}>
    <FeaturedPanel posts={featuredPosts}></FeaturedPanel>
</MainGridLayout>
```

### 7. 新增精选列表组件
**文件**：`src/components/FeaturedPanel.astro`（新建）

- 接收 `posts: PostForList[]`
- 顶部一行小标题 + 数量统计 + 简短说明
- 2 列网格（移动端单列）渲染 `posts`
- 空状态提示（无精选文章时）
- **为何**：参考归档页用单独组件，逻辑隔离

```astro
---
import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";
import FeaturedCard from "./FeaturedCard.astro";

interface Props { posts: PostForList[]; }
const { posts } = Astro.props;
---
<div class="card-base px-6 md:px-8 py-6 mb-4">
    <div class="flex items-baseline justify-between mb-6">
        <h1 class="text-2xl font-bold text-90">精选文章</h1>
        <span class="text-sm text-50">{posts.length} 篇</span>
    </div>
    {posts.length === 0 ? (
        <div class="text-center text-50 py-12">暂无精选文章</div>
    ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post, i) => (
                <FeaturedCard entry={...} ... style={...}></FeaturedCard>
            ))}
        </div>
    )}
</div>
```

### 8. 新增精选卡片组件
**文件**：`src/components/FeaturedCard.astro`（新建）

- **布局**：单卡（card-base 风格）+ 上下结构
  - 顶部：分类小帽（`getCategoryUrl` 链接）+ 描述摘要（line-clamp-2）
  - 中部：标题（hover 变色、左侧 primary 色块）
  - 底部：左侧 tag chip + 右侧「阅读 →」按钮
- **样式**：复用现有 `card-base`、`btn-regular`、`text-50/75/90` 等设计系统
- **动画**：使用 `onload-animation` + `style` prop 注入 delay
- **依赖**：复用 `PostMeta.astro` 显示日期+阅读时长（`hideTagsForMobile=false`、`hideUpdateDate=true`）

```astro
---
import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";
import PostMetadata from "./PostMeta.astro";

interface Props {
    entry: CollectionEntry<"posts">;
    title: string;
    url: string;
    published: Date;
    tags: string[];
    category: string | null;
    description: string;
    style?: string;
}
const { entry, title, url, published, tags, category, description, style } = Astro.props;

const { remarkPluginFrontmatter } = await entry.render();
---
<div class="card-base flex flex-col w-full rounded-[var(--radius-large)] p-6 relative onload-animation" style={style}>
    <!-- 分类小帽 -->
    {category && (
        <a href={getCategoryUrl(category)} class="inline-flex self-start mb-3 px-2 py-0.5 text-xs rounded-md
            bg-[var(--btn-regular-bg)] text-[var(--btn-content)] hover:bg-[var(--btn-regular-bg-hover)] transition">
            {category}
        </a>
    )}

    <!-- 描述摘要 -->
    <div class="text-sm text-50 line-clamp-2 mb-3 min-h-[2.5em]">
        {description || remarkPluginFrontmatter.excerpt}
    </div>

    <!-- 标题 -->
    <a href={url} class="transition font-bold text-xl text-90 hover:text-[var(--primary)] block mb-3
        before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
        before:absolute before:top-7 before:left-[18px] before:hidden md:before:block
        pl-0 md:pl-4">
        {title}
    </a>

    <!-- 元信息：日期+阅读时长 -->
    <PostMetadata published={published} tags={tags} category={null}
        hideTagsForMobile={true} hideUpdateDate={true} class="mb-4 text-xs"></PostMetadata>

    <!-- 底部：tag + 阅读 -->
    <div class="flex items-center justify-between mt-auto pt-3 border-t border-dashed border-black/10 dark:border-white/[0.15]">
        <div class="flex flex-wrap gap-1.5">
            {(tags ?? []).slice(0, 2).map((tag) => (
                <a href={...} class="text-xs px-2 py-0.5 rounded-md
                    bg-[var(--btn-regular-bg)] text-[var(--btn-content)] hover:bg-[var(--btn-regular-bg-hover)] transition">
                    {tag}
                </a>
            ))}
        </div>
        <a href={url} class="btn-regular !rounded-lg !h-8 !px-3 text-sm flex items-center gap-1 text-[var(--primary)]">
            阅读
            <Icon name="material-symbols:chevron-right-rounded" class="text-base"></Icon>
        </a>
    </div>
</div>
```

### 9. 给已存在的 2-3 篇文章打上 `featured: true` 标记
- **文件**：`src/content/posts/*.md`（任选 2-3 篇，**仅修改 frontmatter 不动正文**）
- 建议选：质量高 / 系列代表作 / 篇幅适中的文章
- 候选（仅作建议，可由用户最终决定）：
  - `编程生涯：从Hello-World开始的编程之路.md`
  - `独立项目：天机学堂——一次全面的微服务复习.md`
  - `成长碎记：2024年终总结.md`
- **具体选哪几篇留给用户在执行阶段决定**，本计划阶段不动这些文件

## Assumptions & Decisions

| 决策点 | 决定 | 理由 |
|---|---|---|
| 精选标记机制 | frontmatter `featured: true` 字段 | 用户明确选定；语义化最干净 |
| 排序方式 | 沿用 `published` 倒序 | 与归档页/主页一致 |
| 是否需要 client 端交互 | 否，纯 SSG 渲染 | 归档页用 Svelte 是为了年份分组 + URL 参数过滤；精选无此需求，astro 静态渲染足够 |
| 草稿处理 | 复用 `getRawSortedPosts` 的 `draft` 过滤逻辑 | 避免 prod 环境暴露草稿 |
| 多语言 | 10 种语言全部补 `featured` 翻译 | 与现有 i18n 体系一致；非中文 fallback 到英文 |
| 是否修改归档组件 | 否 | 归档页行为独立 |
| 导航栏位置 | Home → Archive → **Featured** → About → GitHub | 「内容浏览」分组，逻辑相邻 |
| 卡片是否带封面 | 否（用户明确） | 但保留 2 列网格 + 完整元信息 |
| 是否复用 PostCard | 否 | 用户明确要求新建 FeaturedCard |

## Verification Steps

执行完成后按以下顺序验证：

1. **类型检查**
   ```bash
   pnpm check
   ```
   重点确认 `src/content/config.ts` 扩展 schema 后无破坏性。

2. **启动开发服务器**
   ```bash
   pnpm dev
   ```

3. **手动验证清单**
   - [ ] 导航栏出现「精选」按钮，点击跳到 `/featured/`
   - [ ] `/featured/` 页面正确渲染所有 `featured: true` 的文章
   - [ ] 卡片 2 列网格布局（移动端单列）
   - [ ] 卡片显示：分类小帽、描述、标题、日期+阅读时长、tag chip、「阅读 →」按钮
   - [ ] 排序为 `published` 倒序
   - [ ] 无 `featured: true` 文章时显示空状态
   - [ ] 给文章 `draft: true` 不会出现在精选页（prod 模式）
   - [ ] 移动端菜单（NavMenuPanel）也显示「精选」入口

4. **格式化**
   ```bash
   pnpm format
   ```

5. **构建验证**
   ```bash
   pnpm build
   ```
   确认 `/featured/` 静态页面成功生成。

6. **代码审查**
   - 对照 `article-constraints.md` 命名/格式规范
   - 对照 `article-style.md` 风格（虽然这是代码任务不是文章，但风格一致）
   - 确认未改动 `PostCard.astro`、`ArchivePanel.svelte`

## Files Changed Summary

| 类型 | 文件 | 行数估计 |
|---|---|---|
| 新增 | `src/pages/featured.astro` | ~15 |
| 新增 | `src/components/FeaturedPanel.astro` | ~30 |
| 新增 | `src/components/FeaturedCard.astro` | ~80 |
| 修改 | `src/content/config.ts` | +1 行 |
| 修改 | `src/utils/content-utils.ts` | +10 行 |
| 修改 | `src/types/config.ts` | +1 行 |
| 修改 | `src/constants/link-presets.ts` | +3 行 |
| 修改 | `src/config.ts` | +1 行 |
| 修改 | `src/i18n/i18nKey.ts` | +1 行 |
| 修改 | `src/i18n/languages/zh_CN.ts` | +1 行 |
| 修改 | `src/i18n/languages/en.ts` 等 9 个语言文件 | 各 +1 行 |
| 修改（可选） | 2-3 篇博客 frontmatter | 各 +1 行 |
