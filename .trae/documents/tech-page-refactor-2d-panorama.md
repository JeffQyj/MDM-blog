# 技术星图重构 → 技术全景图（2D 版）

## Summary

将 `src/pages/tech.astro` 从 3D Three.js 神经图谱重构为 2D **「技术全景图」** 页面。
- **视觉**：融合现有金色主题（深色 hero + 金色渐变 + 神经网装饰） + 浅色分类卡片网格（参考第二张图 AI Agents Stack 的多区块布局）
- **数据**：复用 `src/data/tech-stack.ts`（11 个分类、约 55 个技术节点）
- **交互**：点击节点 → 弹出深色介绍卡（含全称、分类、首次接触年月、note、相关文章链接） → 点击文章链接跳转
- **清理**：删除 3D 渲染相关全部文件 + 卸载 `three` 依赖

---

## Current State Analysis

### 现状问题
1. **性能**：3D Three.js + WebGL 渲染在大列表场景下耗性能，移动端更明显
2. **风格**：3D 球面 + 神经网深空背景与其他页面（projects/archive/bookshelf）UI 风格割裂
3. **数据冗余**：`buildGraph` 构建的「边」数据（同类环 / 强关联）只服务于 3D 拓扑可视化，2D 平面版无需边

### 关键代码现状

| 路径 | 角色 | 处理方式 |
| --- | --- | --- |
| `src/pages/tech.astro` | 页面入口 | **重写** |
| `src/data/tech-stack.ts` | 11 分类 55+ 技术节点数据源 | **保留**（数据源不变） |
| `src/types/tech.ts` | 类型定义 | **改写**：删 `CytoscapeNodeData` / `CytoscapeEdgeData`，保留 `TechEntry` / `TechCategory` / `TECH_CATEGORY_ORDER` |
| `src/utils/tech-utils.ts` | 图构建（边数据） | **删除**（2D 不需要边） |
| `src/stores/tech-store.ts` | 3D 状态管理（hoveredTech/filterCategory/resetCameraTrigger） | **删除** |
| `src/components/tech/StarMap3D.svelte` | 3D 主组件 | **删除** |
| `src/components/tech/StarMapTooltip.svelte` | 3D tooltip | **删除** |
| `src/components/tech/StarMapLegend.svelte` | 3D 分类图例 | **删除** |
| `src/components/tech/star-map/*` (9 个文件) | 3D 场景/布局/交互模块 | **整个目录删除** |
| `package.json` | `three` + `@types/three` | **卸载** |
| `src/i18n/i18nKey.ts` / `src/i18n/languages/zh_CN.ts` | "tech" 文案 "技术" | 保留（导航栏文字不变） |

### 数据关键发现
- `relatedPosts` 字段存的是**文章中文标题**（如 `"编程生涯java特性全解"`），不是 Astro slug
- 跳转时需在构建时通过 `getCollection("posts")` 把 title 映射为 `entry.slug`，再调用 `getPostUrlBySlug(slug)` 生成 `/posts/<slug>/`
- 部分节点的 `relatedPosts` 为空数组（无文章），需优雅降级：弹窗仍显示，但不显示链接区

---

## Proposed Changes

### 1. 重写 `src/pages/tech.astro`（重写）

**结构调整**：
```
<MainGridLayout title="技术" description="技术全景图">
  <div class="tech-page">
    <!-- Hero（复用现有金色 + 神经网风格，标题改为「技术全景图」） -->
    <section class="tech-hero">…</section>

    <!-- 数据条（11 分类 / N 技术 / 首次接触最早年月） -->
    <div class="tech-stats">…</div>

    <!-- 11 个分类区块（每块 = 分类胶囊 + 节点网格） -->
    {#each TECH_CATEGORY_ORDER as cat}
      <CategoryBlock category={cat} entries={…} />
    {/each}
  </div>
</MainGridLayout>
```

**Hero 文案更新**：
- 顶部小帽：`NEURAL · MAP　技　术　星　图` → `PANORAMA · 技　术　全　景　图`
- 副标题：`欢迎探索我的技术宇宙` → `一图纵览我从 2022 年至今的技术版图`
- 标题保留 `技　术`（用户未要求改）

**每个 CategoryBlock 的渲染**：
```astro
<CategoryBlock
  client:load
  category={cat}
  entries={entriesOfThisCategory}
  posts={postsIndex}  <!-- {title → {slug, url, published}} -->
/>
```

### 2. 新建 `src/components/tech/CategoryBlock.svelte`（新增）

**职责**：
- 渲染一个分类区块（标题胶囊 + 节点网格）
- 管理当前选中节点状态
- 点击节点 → 弹出深色介绍卡
- 点击空白 / 按 Esc → 关闭弹窗

**Props**（Svelte 5 runes 风格）：
```ts
type PostIndex = Record<string, { slug: string; url: string; published: string }>;
let {
  category,
  entries,
  posts,
}: {
  category: TechCategory;
  entries: TechEntry[];
  posts: PostIndex;
} = $props();
```

**节点映射**：
```ts
const resolved = entries.map(e => ({
  ...e,
  relatedPostList: (e.relatedPosts ?? [])
    .map(title => posts[title])
    .filter(Boolean),
}));
```

**弹窗定位策略**：
- 用 `position: fixed` + 节点 DOM 元素的 `getBoundingClientRect()` 计算坐标
- 弹窗在节点右侧；空间不足则左侧；上下越界则翻转
- 不依赖任何外部库

**模板结构**：
```svelte
<section class="cat-block">
  <header class="cat-block__head">
    <span class="cat-block__dot" style="--cat-color: {catColor}"></span>
    <h2 class="cat-block__title">{category}</h2>
    <span class="cat-block__count">{entries.length}</span>
  </header>

  <ul class="cat-block__grid">
    {#each resolved as e}
      <li>
        <button
          class="cat-block__node"
          class:cat-block__node--active={activeId === e.id}
          onclick={() => toggle(e)}
        >
          {e.name}
        </button>
      </li>
    {/each}
  </ul>
</section>

{#if activeNode}
  <div class="cat-popover" style="..." role="dialog" aria-label={activeNode.name}>
    <!-- 弹窗内容 -->
  </div>
{/if}
```

**弹窗内容**：
- 技术全称（标题 + 分类彩色 dot）
- meta 行：分类 · 首次接触 YYYY-MM
- note 引用（如果存在）
- 「相关文章」列表（每个 link 用 `getPostUrlBySlug` 后的 URL，跳新页）
- 关闭按钮 ✕

### 3. 新建 `src/utils/tech-page-utils.ts`（新增）

```ts
import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";

export type PostIndex = Record<string, { slug: string; url: string; published: string }>;

/**
 * 将 tech-stack.ts 中 relatedPosts（中文标题数组）
 * 映射为 {title: {slug, url, published}} 索引，供 2D 弹窗使用
 */
export function buildPostIndex(posts: CollectionEntry<"posts">[]): PostIndex {
  const map: PostIndex = {};
  for (const p of posts) {
    const title = p.data.title;
    if (!title) continue;
    map[title] = {
      slug: p.slug,
      url: getPostUrlBySlug(p.slug),
      published: p.data.published.toISOString().slice(0, 10),
    };
  }
  return map;
}
```

### 4. 简化 `src/types/tech.ts`（改写）

**保留**：
- `TechCategory` 联合类型（11 个分类）
- `TECH_CATEGORY_ORDER` 排序常量
- `TechEntry` 接口（id / name / category / note / relatedPosts / relatedTo / startedAt）

**删除**：
- `CytoscapeNodeData`（3D 专用）
- `CytoscapeEdgeData`（3D 专用）

### 5. 删除以下文件（完整清单）

```
src/utils/tech-utils.ts
src/stores/tech-store.ts
src/components/tech/StarMap3D.svelte
src/components/tech/StarMapTooltip.svelte
src/components/tech/StarMapLegend.svelte
src/components/tech/star-map/constellation-layout.ts
src/components/tech/star-map/constellation-lines.ts
src/components/tech/star-map/interaction.ts
src/components/tech/star-map/nebula.ts
src/components/tech/star-map/post-processing.ts
src/components/tech/star-map/scene-builder.ts
src/components/tech/star-map/star-nodes.ts
src/components/tech/star-map/starfield.ts
src/components/tech/star-map/types.ts
```

最后 `src/components/tech/` 目录为空，**整个目录删除**。

### 6. 卸载 `three` 依赖

**`package.json` 修改**：
- `dependencies` 移除：`"three": "^0.184.0"`
- `devDependencies` 移除：`"@types/three": "^0.184.1"`
- **不动** `@types/markdown-it` / `@types/hast` 等其他 types
- 执行 `pnpm install` 让 pnpm 清理 `node_modules/three` 和 `node_modules/@types/three`
- 同时检查 lockfile 是否需要更新（`pnpm install` 会自动更新）

---

## Visual Style Spec

### Hero 区（沿用现有金色神经网风）
- 标题「技　术」（保留原大字号金色渐变）
- 顶部小帽 `PANORAMA · 技　术　全　景　图`（改为 PANORAMA 关键词）
- 副标题 `一图纵览我从 2022 年至今的技术版图`
- 数据条：分类数 / 技术总数 / 最早接触年月

### 分类区块（融合第二张图）
- 标题胶囊：`🔴 编程语言  7` 形式，圆点 + 分类名（大写小型 caps） + 数字徽章
- 卡片背景：浅色（浅金渐变到白），深色模式下深色卡片 + 金色描边
- 节点 pill：金色描边胶囊，hover 时金色填充 + 阴影，激活时变金色实心
- 节点尺寸：自适应内容宽度

### 弹窗
- 定位：节点右侧 12px gap，若右侧空间不足则左侧
- 样式：深色玻璃感（`oklch(0.1 0.015 var(--hue) / 0.96)` + `backdrop-filter: blur(14px)` + 金色描边）
- 内容：技术名 / 分类 + 首次接触 / note 引用 / 文章链接列表 / 关闭按钮
- 移动端：弹窗改为底部 sheet 或全宽浮层

---

## File Change Summary

| 操作 | 路径 | 说明 |
| --- | --- | --- |
| **删除** | `src/utils/tech-utils.ts` | 边构建，2D 不需要 |
| **删除** | `src/stores/tech-store.ts` | 3D 状态管理 |
| **删除** | `src/components/tech/StarMap3D.svelte` | 3D 主组件 |
| **删除** | `src/components/tech/StarMapTooltip.svelte` | 3D tooltip |
| **删除** | `src/components/tech/StarMapLegend.svelte` | 3D 分类图例 |
| **删除** | `src/components/tech/star-map/*` (9 文件) | 3D 模块 |
| **删除** | `src/components/tech/` 空目录 | — |
| **重写** | `src/pages/tech.astro` | 新 2D 布局 + Hero + 分类区块 |
| **新增** | `src/components/tech/CategoryBlock.svelte` | 分类区块 + 弹窗 |
| **新增** | `src/utils/tech-page-utils.ts` | 文章索引工具 |
| **改写** | `src/types/tech.ts` | 删 Cytoscape 类型 |
| **修改** | `package.json` | 移除 three / @types/three |
| **保留** | `src/data/tech-stack.ts` | 数据源不动 |
| **保留** | `src/constants/link-presets.ts` | 导航 / i18n 不动 |

---

## Assumptions & Decisions

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| 弹窗定位算法 | 用 `getBoundingClientRect()` + 视口检测 | 简单、零依赖、支持响应式 |
| 弹窗同时只能打开一个 | 是 | 用户要求「在其旁边弹出一个介绍框」（单数） |
| 多篇文章链接 | 在弹窗内以列表展示，每条独立 `<a>` | relatedPosts 是数组，0/1/N 都要支持 |
| 节点排序 | 同分类内按 `startedAt` 升序，无则按 name 字母序 | 学习时间线感更强 |
| 分类排序 | 沿用 `TECH_CATEGORY_ORDER`（AI 与 Agent 排首位） | 与现有数据契约一致 |
| 节点可点击 vs hover | 仅点击 | 移动端 hover 不可靠；点击更明确 |
| Hero 是否保留 | **保留** | 用户选「融合现有金色主题」 |
| 弹窗是否需要动画 | 简单淡入 + 8px 位移 | 复用现有项目风格 |
| 弹窗关闭交互 | 点空白 / 按 Esc / 点 ✕ | 三个都支持，覆盖全平台 |
| 移动端弹窗 | 改为全宽底部固定 + 圆角顶部 | 小屏定位算法不可靠，统一改为底部 sheet |
| 是否卸载 three | **是** | 删除 3D 文件后 three 依赖无引用，避免冗余 |
| 数据契约是否变化 | `relatedPosts` 保持原样（中文标题数组） | 最小改动，复用现有数据 |
| 是否输出 11 区块的单页 | **是** | 与第二张图风格最接近 |
| 筛选/搜索功能 | 不实现 | 用户未要求，保持简洁 |
| 节点间是否画连线 | **不画** | 2D 卡片网格无连线需求，避免视觉杂乱 |
| 是否需要筛选条 | 不需要 | 11 分类已经清晰分块 |

---

## Verification Steps

1. **运行 `pnpm install`** 卸载 `three` / `@types/three`，确认 lockfile 更新无错
2. **运行 `pnpm check`** 确保 Astro 类型检查通过（重点验证 `tech.astro` / `CategoryBlock.svelte` / `tech.ts`）
3. **运行 `pnpm dev`** 访问 `/tech/`
   - 验证 11 个分类区块按顺序展示
   - 验证每个分类下节点 pill 全部可见
   - 验证点击节点 → 弹窗在节点旁边出现
   - 验证弹窗内文章链接可跳转（无 relatedPosts 时不显示链接区）
   - 验证点空白 / Esc / ✕ 都能关闭弹窗
   - 验证深色 / 浅色主题切换正常
   - 验证移动端（DevTools 模拟）布局与弹窗
4. **运行 `pnpm build`** 确保生产构建无错（Pagefind 索引正常生成）
5. **运行 `pnpm format`** 让 Biome 统一格式
6. **最终检查** `git status` 确认 3D 相关文件全部删除，无残留引用

---

## Implementation Order

1. 新建 `src/utils/tech-page-utils.ts`
2. 改写 `src/types/tech.ts`（先于组件，避免类型引用错误）
3. 新建 `src/components/tech/CategoryBlock.svelte`
4. 重写 `src/pages/tech.astro`
5. 删除 3D 相关文件（src/components/tech/* + src/utils/tech-utils.ts + src/stores/tech-store.ts）
6. 修改 `package.json`（移除 three）+ 运行 `pnpm install`
7. `pnpm check` / `pnpm dev` 验证
8. `pnpm format` 格式化
