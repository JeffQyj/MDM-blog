# 主页 & 归档页 UI 升级 — 实施计划

## Summary

在不改变项目框架（Astro 5 + Svelte 5 + Tailwind 3 + Biome）的前提下，对 **首页文章卡片** 和 **归档页时间线** 进行「**精致渐变 + 玻璃拟态**」风格升级。改动落在 3 个组件 + 1 个样式文件：

| 文件 | 性质 | 改动 |
|---|---|---|
| [src/components/PostCard.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/PostCard.astro) | 重写 | 玻璃背景 + 渐变描边 + 柔光圈 + 渐变标题 |
| [src/components/PostPage.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/PostPage.astro) | 微调 | 把容器切换为玻璃风，去掉硬背景 |
| [src/components/ArchivePanel.svelte](file:///e:/A_One_Year_Load/Project/Secondary_Dev_Road/MDM-blog/src/components/ArchivePanel.svelte) | 重写 | 玻璃 Hero + 渐变时间线 + 节点光晕 |
| [src/styles/main.css](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/styles/main.css) | 追加 | 6 个新通用类（glass / glow / gradient 等） |

> 关键约束：**不动** `variables.styl`（保留原 OKLCH 色板与 hue 主题机制）、**不动** `MainGridLayout` 与侧边栏、**不动** Markdown 文章页、**不动** i18n 与数据流。

---

## Current State Analysis

### 主页（`[...page].astro` → `PostPage.astro` → `PostCard.astro`）

- **当前观感**（基于截图）：横向布局，左侧文字（标题 + 元信息 + 摘要 + 字数/阅读时间），右侧缩略图（可选）。圆角卡片、白底 + 紫色 `#` 标签色，整体扁平、缺少氛围感。
- **PostPage.astro** 容器：`rounded-[var(--radius-large)] bg-[var(--card-bg)] py-1 md:py-0 md:bg-transparent md:gap-4` — 移动端有背景，桌面透明。
- **PostCard.astro** 容器：`card-base flex flex-col-reverse md:flex-col w-full rounded-[var(--radius-large)] overflow-hidden relative` — 单层背景，hover 仅颜色变化。

### 归档页（`archive.astro` → `ArchivePanel.svelte`）

- **当前观感**（代码读取）：年份/竖线/标题的左对齐时间线，年份灰色大字（`text-2xl font-bold text-75`），中间列圆点（10% 宽），右侧文章列表。节点圆点 hover 时由 `w-1 h-1` 拉长到 `h-5` 加上 `--primary` 颜色。
- **痛点**：虚线列固定 10% 宽，桌面端 80% 区域堆在右侧显得空旷；年份与文章之间没有视觉承接；时间线只是「点 + 灰线」，缺乏氛围。

### 项目内既有设计语言（约束参考）

| 来源 | 风格 | 与本次关系 |
|---|---|---|
| `FeaturedPanel.astro` | 杂志编辑风（serif 大字、Hero、点阵装饰） | **不同**——本次不要杂志感 |
| `AboutPanel.astro` | 现代极简（Q&A 卡片 + 4px 彩条 + hover 上浮） | **可借鉴**——彩条 + 上浮交互 |
| `PostCard.astro` | 简洁卡片（横排、圆角、chevron） | **本计划升级对象** |
| `main.css` | 现有 `.card-base` `.btn-plain` `.expand-animation` 等基础类 | **本计划在末尾追加** 6 个新通用类 |
| `variables.styl` | OKLCH + hue 主题、`--primary` `--card-bg` `--line-divider` 等 | **完全不动**，所有新样式通过变量接入 |

### 设计 token 复用（不新增 token）

| Token | 用途 |
|---|---|
| `--primary`（oklch 紫粉 hue 290） | 玻璃高光、渐变终止色、焦点环 |
| `--card-bg` | 玻璃面板半透明基底（与 alpha 通道叠加） |
| `--radius-large`（1rem） | 卡片圆角 |
| `--line-divider` / `--line-color` | 描边、虚线、渐变线条的 alpha 源 |
| `--btn-regular-bg` / `--btn-regular-bg-hover` | 装饰小色块 |
| `--content-delay`（150ms） | 入场动画延迟基线 |
| `--meta-divider` | 元信息分隔 |

---

## Proposed Changes

### 改动 1：新增 6 个通用类 → `src/styles/main.css`

**What**：在 `@layer components` 块末尾追加本次所需的玻璃/渐变工具类，未来其他模块可复用。

**Why**：用户明确选择「**组件 + main.css 通用类**」深度——样式集中维护，新组件按需消费。

**How**（追加在 `.btn-regular-dark.success` 之后、闭合 `}` 之前）：

```css
/* ============================================
   玻璃拟态 + 渐变工具类（v1.0 · 主页/归档页升级）
   ============================================ */

/* 1) 玻璃面板：半透明 + backdrop blur + 内描边模拟折射 */
.glass-panel {
    background-color: oklch(from var(--card-bg) l c h / 0.72);
    backdrop-filter: blur(14px) saturate(140%);
    -webkit-backdrop-filter: blur(14px) saturate(140%);
    border: 1px solid oklch(from var(--primary) l c h / 0.18);
    box-shadow:
        inset 0 1px 0 0 oklch(1 0 0 / 0.4),
        0 1px 2px 0 oklch(0 0 0 / 0.04);
}
:root.dark .glass-panel {
    background-color: oklch(from var(--card-bg) l c h / 0.55);
    border-color: oklch(from var(--primary) l c h / 0.22);
    box-shadow:
        inset 0 1px 0 0 oklch(1 0 0 / 0.06),
        0 2px 8px -2px oklch(0 0 0 / 0.5);
}

/* 2) 渐变描边：使用 mask 把渐变裁成 1px 边线 */
.gradient-border {
    position: relative;
    background:
        linear-gradient(
            135deg,
            oklch(from var(--primary) l c h / 0.35),
            oklch(from var(--primary) calc(l + 0.1) calc(c + 0.02) calc(h + 40) / 0.18)
        );
    padding: 1px;             /* 描边宽度 */
    border-radius: inherit;
}
.gradient-border > * {
    border-radius: calc(var(--radius-large) - 1px);
    background: oklch(from var(--card-bg) l c h / 0.85);
}
:root.dark .gradient-border > * {
    background: oklch(from var(--card-bg) l c h / 0.6);
}

/* 3) 渐变文字：背景裁剪文本 */
.gradient-text {
    background: linear-gradient(
        120deg,
        oklch(0.45 0.12 var(--hue)) 0%,
        oklch(0.6  0.16 calc(var(--hue) + 30)) 50%,
        oklch(0.5  0.14 calc(var(--hue) - 20)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
}
:root.dark .gradient-text {
    background: linear-gradient(
        120deg,
        oklch(0.92 0.04 var(--hue)) 0%,
        oklch(0.82 0.10 calc(var(--hue) + 30)) 50%,
        oklch(0.88 0.06 calc(var(--hue) - 20)) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* 4) 柔光圈：绝对定位、模糊、用于卡片背景装饰 */
.glow-blob {
    position: absolute;
    pointer-events: none;
    border-radius: 9999px;
    filter: blur(48px);
    opacity: 0.55;
    z-index: 0;
}
:root.dark .glow-blob { opacity: 0.35; }

/* 5) 渐变线：用于时间线主轴/分隔线 */
.gradient-line {
    background: linear-gradient(
        180deg,
        transparent 0%,
        oklch(from var(--primary) l c h / 0.5) 8%,
        oklch(from var(--primary) l c h / 0.5) 92%,
        transparent 100%
    );
}

/* 6) 玻璃小徽章：标签/年份计数等 */
.glass-chip {
    display: inline-flex;
    align-items: center;
    height: 1.5rem;
    padding: 0 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: oklch(from var(--primary) l c h / 0.12);
    color: var(--primary);
    border: 1px solid oklch(from var(--primary) l c h / 0.2);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}
:root.dark .glass-chip {
    background: oklch(from var(--primary) l c h / 0.18);
    border-color: oklch(from var(--primary) l c h / 0.28);
}
```

**兼容性注意**：
- `oklch(from ...)` 语法需要 Chrome 111+ / Safari 16.4+ / Firefox 113+；项目 `package.json` 已无 IE 目标，可放心使用。
- `.gradient-border` 内部子元素必须显式给 `background`，否则会透出渐变；PostCard 中我将重写结构保证外层只有一个直接子包裹。
- 不引入任何新依赖、不改 `tailwind.config`、不改 `biome.json`。

---

### 改动 2：重写 `src/components/PostCard.astro`

**What**：把单层 `card-base` 升级为「**渐变描边外壳 + 玻璃内壳 + 柔光圈装饰 + 渐变标题 + 玻璃徽章**」。

**Why**：原卡片信息层级弱（标题与摘要字号差小、缺氛围），升级后保持现有 DOM 结构与外层 props（`class` / `style`），仅调整 class 与新增装饰层。

**How**（核心模板，仅展示有改动的部分）：

```astro
---
import path from "node:path";
import { Icon } from "astro-icon/components";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getDir } from "../utils/url-utils";
import ImageWrapper from "./misc/ImageWrapper.astro";
import PostMetadata from "./PostMeta.astro";

// 现有 props 不变
// ...
const hasCover = image !== undefined && image !== null && image !== "";
const coverWidth = "28%";
const { remarkPluginFrontmatter } = await entry.render();

// 新增：根据标签取稳定 hash → 选柔光圈 hue 偏移，避免每张卡片光圈一样
const tagHueShift = (entry.data.tags?.[0]?.length ?? 0) * 17 % 60 - 30;
---
<div
    class:list={["post-card-wrap onload-animation relative group", className]}
    style={style}
>
    <!-- 渐变描边外壳（1px 渐变） -->
    <div class="gradient-border w-full rounded-[var(--radius-large)] transition-all duration-500 group-hover:-translate-y-1">
        <!-- 玻璃内壳 -->
        <div class="card-base glass-panel relative flex flex-col-reverse md:flex-col w-full !rounded-[calc(var(--radius-large)-1px)] overflow-hidden">

            <!-- 柔光圈装饰：两个绝对定位的模糊球（仅 ≥ md 显示） -->
            <div
                class="glow-blob hidden md:block"
                style={`width: 14rem; height: 14rem; top: -3rem; right: -2rem;
                        background: oklch(0.75 0.18 calc(var(--hue) + ${tagHueShift}));`}
                aria-hidden="true"
            ></div>
            <div
                class="glow-blob hidden md:block"
                style={`width: 9rem; height: 9rem; bottom: -2.5rem; left: 30%;
                        background: oklch(0.7 0.15 calc(var(--hue) + 40 + ${tagHueShift}));`}
                aria-hidden="true"
            ></div>

            <div class:list={["relative z-10 pl-6 md:pl-9 pr-6 md:pr-2 pt-6 md:pt-7 pb-6",
                {"w-full md:w-[calc(100%_-_52px_-_12px)]": !hasCover,
                 "w-full md:w-[calc(100%_-_var(--coverWidth)_-_12px)]": hasCover}]}>

                <!-- 标题：hover 时切换为渐变文字 -->
                <a href={url}
                   class="post-card__title block font-bold mb-3 text-3xl text-90 transition-all duration-500
                          hover:gradient-text
                          active:text-[var(--title-active)] dark:active:text-[var(--title-active)]
                          before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
                          before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block">
                    {title}
                    <Icon class="inline text-[2rem] text-[var(--primary)] md:hidden translate-y-0.5 absolute"
                          name="material-symbols:chevron-right-rounded"></Icon>
                    <Icon class="text-[var(--primary)] text-[2rem] transition hidden md:inline absolute
                                  translate-y-0.5 opacity-0 group-hover:opacity-100 -translate-x-1
                                  group-hover:translate-x-0"
                          name="material-symbols:chevron-right-rounded"></Icon>
                </a>

                <!-- 元信息：复用 PostMeta，不动；下方加一行玻璃徽章形式的标签 -->
                <PostMetadata published={published} updated={updated} tags={tags}
                              category={category} hideTagsForMobile={true} hideUpdateDate={true}
                              class="mb-3"></PostMetadata>

                <!-- 标签玻璃徽章行（仅桌面端，作为 meta 的视觉补充） -->
                {!hideTagsForMobile && tags && tags.length > 0 && (
                    <div class="hidden md:flex flex-wrap gap-1.5 mb-4">
                        {tags.map((t) => (
                            <span class="glass-chip">{t.trim()}</span>
                        ))}
                    </div>
                )}

                <!-- 摘要：保留原 line-clamp -->
                <div class:list={["transition text-75 mb-3.5 pr-4 relative z-10",
                    {"line-clamp-2 md:line-clamp-1": !description}]}>
                    {description || remarkPluginFrontmatter.excerpt}
                </div>

                <!-- 字数/阅读：保留原结构，加间距 + 渐变小图标 -->
                <div class="text-sm text-black/30 dark:text-white/30 flex gap-4 transition relative z-10">
                    <div class="inline-flex items-center gap-1.5">
                        <span class="inline-block w-1 h-1 rounded-full bg-[var(--primary)]"></span>
                        {remarkPluginFrontmatter.words} {i18n(...)}
                    </div>
                    <div>|</div>
                    <div class="inline-flex items-center gap-1.5">
                        <span class="inline-block w-1 h-1 rounded-full bg-[var(--primary)]"></span>
                        {remarkPluginFrontmatter.minutes} {i18n(...)}
                    </div>
                </div>
            </div>

            <!-- 封面（保持原 ImageWrapper） -->
            {hasCover && (
                <a href={url} aria-label={title}
                   class:list={["group/cover",
                       "max-h-[20vh] md:max-h-none mx-4 mt-4 -mb-2 md:mb-0 md:mx-0 md:mt-0",
                       "md:w-[var(--coverWidth)] relative md:absolute md:top-3 md:bottom-3 md:right-3
                        rounded-xl overflow-hidden active:scale-95"
                   ]}>
                    <div class="absolute pointer-events-none z-10 w-full h-full
                                group-hover/cover:bg-black/30 group-active/cover:bg-black/50 transition"></div>
                    <div class="absolute pointer-events-none z-20 w-full h-full flex items-center justify-center">
                        <Icon name="material-symbols:chevron-right-rounded"
                              class="transition opacity-0 group-hover/cover:opacity-100 scale-50
                                     group-hover/cover:scale-100 text-white text-5xl"></Icon>
                    </div>
                    <ImageWrapper src={image} basePath={...} alt="..." class="w-full h-full"></ImageWrapper>
                </a>
            )}

            <!-- 无封面时的进入按钮：玻璃化 -->
            {!hasCover && (
                <a href={url} aria-label={title}
                   class="!hidden md:!flex btn-regular w-[3.25rem] absolute right-3 top-3 bottom-3
                          rounded-xl glass-panel hover:bg-[var(--enter-btn-bg-hover)]
                          active:bg-[var(--enter-btn-bg-active)] active:scale-95 !border-0
                          transition-all duration-500">
                    <Icon name="material-symbols:chevron-right-rounded"
                          class="transition text-[var(--primary)] text-4xl mx-auto
                                 group-hover:translate-x-0.5"></Icon>
                </a>
            )}
        </div>
    </div>
</div>

<!-- 卡片间虚线：保留 -->
<div class="transition border-t-[1px] border-dashed mx-6 border-black/10
            dark:border-white/[0.15] last:border-t-0 md:hidden"></div>

<style define:vars={{ coverWidth }}>
    /* 卡片自身滚动入场略快于全局 onload，避免累加过慢 */
    .post-card-wrap { animation-duration: 0.6s; }

    /* hover 时的玻璃高光强化（外层描边更亮） */
    .post-card-wrap:hover .gradient-border {
        background: linear-gradient(
            135deg,
            oklch(from var(--primary) l c h / 0.55),
            oklch(from var(--primary) calc(l + 0.1) calc(c + 0.02) calc(h + 40) / 0.35)
        );
    }
    .post-card-wrap:hover .glass-panel {
        background-color: oklch(from var(--card-bg) l c h / 0.78);
        box-shadow:
            inset 0 1px 0 0 oklch(1 0 0 / 0.5),
            0 12px 32px -10px oklch(0.4 0.08 var(--hue) / 0.18);
    }
    :root.dark .post-card-wrap:hover .glass-panel {
        background-color: oklch(from var(--card-bg) l c h / 0.62);
        box-shadow:
            inset 0 1px 0 0 oklch(1 0 0 / 0.08),
            0 12px 32px -10px rgb(0 0 0 / 0.5);
    }

    /* 移动端隐藏 hover 效果以防粘滞 */
    @media (hover: none) {
        .post-card-wrap:active .gradient-border { background: ... ; }
    }
</style>
```

**保留不变**：
- 文件顶部的所有 imports、Props 接口、变量解构
- `remarkPluginFrontmatter.words` / `minutes` 的国际化文案
- `class:list` 接收外部 `className` 与 `style` 的契约
- 外层动画 `onload-animation` + `style="animation-delay:..."`（由 PostPage 注入）

---

### 改动 3：微调 `src/components/PostPage.astro`

**What**：把外层容器从 `bg-[var(--card-bg)] py-1 md:py-0 md:bg-transparent md:gap-4` 改为**纯 gap 容器**，并让每张卡片自带背景（已由 PostCard 内部 `glass-panel` 提供）。

**Why**：升级后的 PostCard 已是玻璃面板，外层再加白底会糊掉毛玻璃效果。

**How**（仅修改 div className，5 行内）：

```astro
<div class="transition flex flex-col rounded-[var(--radius-large)] py-1 md:py-0 gap-4 mb-4">
    {page.data.map(...) /* 不变 */}
</div>
```

去掉 `bg-[var(--card-bg)]` 与 `md:bg-transparent`，保留 `gap-4 mb-4` 与 `rounded-[var(--radius-large)]`（容器圆角仍兜底，玻璃面板外溢时不会越界）。

---

### 改动 4：重写 `src/components/ArchivePanel.svelte`

**What**：把现有「灰线 + 圆点 + 标题」时间线升级为「**玻璃 Hero + 渐变主线 + 节点光晕 + 玻璃徽章**」三段式。

**Why**：归档页是「全站文章索引」，信息密度低、纵向长、缺乏节奏，需要明显的视觉锚点。

**How**（完整结构，`<script>` 部分保留现有 `onMount` 逻辑不变）：

```svelte
<script lang="ts">
    // 全部保留原 import / props / types / onMount / formatDate / formatTag
    // 末尾追加一个总文章数计算
    $: totalCount = groups.reduce((s, g) => s + g.posts.length, 0);
    $: yearSpan = groups.length > 0
        ? `${groups[groups.length - 1].year} → ${groups[0].year}`
        : "";
</script>

<div class="archive-page flex flex-col gap-6">
    <!-- ============== Hero 统计条 ============== -->
    <section class="archive-hero glass-panel rounded-[var(--radius-large)] p-6 md:p-8 relative overflow-hidden">
        <div
            class="glow-blob"
            style="width: 18rem; height: 18rem; top: -6rem; right: -4rem;
                   background: oklch(0.78 0.18 var(--hue));"
            aria-hidden="true"
        ></div>
        <div
            class="glow-blob"
            style="width: 12rem; height: 12rem; bottom: -5rem; left: 10%;
                   background: oklch(0.72 0.15 calc(var(--hue) + 50));"
            aria-hidden="true"
        ></div>
        <div class="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
                <div class="text-xs font-semibold tracking-[0.2em] uppercase text-50 mb-1">ARCHIVE · 归档</div>
                <h2 class="text-2xl md:text-3xl font-bold gradient-text m-0">所有文章 · {totalCount}</h2>
                {#if yearSpan}
                    <div class="text-50 text-sm mt-1.5">收录范围 · {yearSpan}</div>
                {/if}
            </div>
            <div class="flex gap-2">
                {#each groups.slice(0, 4) as g}
                    <a href={`#year-${g.year}`} class="glass-chip">
                        {g.year} · {g.posts.length}
                    </a>
                {/each}
            </div>
        </div>
    </section>

    <!-- ============== 时间线 ============== -->
    <section class="archive-timeline glass-panel rounded-[var(--radius-large)] p-6 md:p-8 relative">
        {#each groups as group (group.year)}
            <div id={`year-${group.year}`} class="archive-year">
                <!-- 年份行：左侧大字 + 渐变主线 + 计数 -->
                <div class="archive-year__head">
                    <div class="archive-year__num gradient-text">{group.year}</div>
                    <div class="archive-year__line" aria-hidden="true">
                        <div class="archive-year__line-fill gradient-line"></div>
                    </div>
                    <div class="archive-year__count">
                        <span class="glass-chip">{group.posts.length} 篇</span>
                    </div>
                </div>

                <!-- 文章列表 -->
                <ul class="archive-list">
                    {#each group.posts as post (post.slug)}
                        <li>
                            <a
                                href={getPostUrlBySlug(post.slug)}
                                aria-label={post.data.title}
                                class="archive-item group/item"
                            >
                                <span class="archive-item__date">{formatDate(post.data.published)}</span>
                                <span class="archive-item__node" aria-hidden="true">
                                    <span class="archive-item__node-dot"></span>
                                </span>
                                <span class="archive-item__title">{post.data.title}</span>
                                <span class="archive-item__tags hidden md:inline">
                                    {formatTag(post.data.tags)}
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </section>
</div>

<style>
    .archive-page { width: 100%; }

    /* 年份行布局：日期 | 节点 | 标题 | 标签 */
    .archive-year { padding: 1.25rem 0 1.5rem; }
    .archive-year + .archive-year { border-top: 1px dashed var(--line-divider); }
    .archive-year__head {
        display: grid;
        grid-template-columns: 5rem 1.5rem 1fr;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
    }
    .archive-year__num {
        font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", "SimSun", Georgia, serif;
        font-size: 2.25rem;
        font-weight: 800;
        font-feature-settings: "tnum" 1;
        line-height: 1;
        text-align: right;
    }
    .archive-year__line {
        position: relative;
        height: 0.75rem;
        width: 1.5rem;
    }
    .archive-year__line-fill {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        transform: translateX(-50%);
        border-radius: 9999px;
    }
    .archive-year__count { display: flex; }

    /* 文章列表 */
    .archive-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }
    .archive-item {
        position: relative;
        display: grid;
        grid-template-columns: 5rem 1.5rem 1fr 12rem;
        align-items: center;
        gap: 0.75rem;
        height: 2.75rem;
        padding: 0 0.5rem;
        border-radius: 0.625rem;
        text-decoration: none;
        transition: background 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .archive-item:hover { background: oklch(from var(--primary) l c h / 0.08); }
    :root.dark .archive-item:hover { background: oklch(from var(--primary) l c h / 0.14); }

    .archive-item__date {
        font-size: 0.8125rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: oklch(from var(--primary) l c h / 0.7);
        text-align: right;
        letter-spacing: 0.04em;
    }
    .archive-item__node {
        position: relative;
        width: 1.5rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .archive-item__node::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        transform: translateX(-50%);
        background: linear-gradient(180deg,
            transparent 0%,
            var(--line-divider) 8%,
            var(--line-divider) 92%,
            transparent 100%);
    }
    .archive-item__node-dot {
        position: relative;
        z-index: 1;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 9999px;
        background: var(--card-bg);
        border: 2px solid oklch(from var(--primary) l c h / 0.55);
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .archive-item:hover .archive-item__node-dot {
        width: 0.875rem;
        height: 0.875rem;
        background: var(--primary);
        border-color: var(--primary);
        box-shadow: 0 0 0 4px oklch(from var(--primary) l c h / 0.18);
    }
    .archive-item__title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: oklch(0.3 0.02 var(--hue));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.35s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    }
    :root.dark .archive-item__title { color: oklch(0.88 0.01 var(--hue)); }
    .archive-item:hover .archive-item__title {
        color: var(--primary);
        transform: translateX(4px);
    }
    .archive-item__tags {
        font-size: 0.75rem;
        color: oklch(0.5 0.02 var(--hue));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.02em;
    }
    :root.dark .archive-item__tags { color: oklch(0.65 0.01 var(--hue)); }

    /* 响应式：移动端隐藏标签列 */
    @media (max-width: 768px) {
        .archive-year__head,
        .archive-item { grid-template-columns: 3.5rem 1.25rem 1fr; }
        .archive-year__num { font-size: 1.75rem; }
        .archive-item__date { font-size: 0.75rem; }
    }
</style>
```

**保留不变**：
- `<script>` 中所有 `import` / `tags` / `categories` / `sortedPosts` props
- `onMount` 内部分组逻辑、`groupedPostsArray.sort`
- `URLSearchParams` 过滤（标签/分类/未分类）
- `formatDate` / `formatTag` 工具函数

---

## Assumptions & Decisions

| 决策 | 选择 | 理由 |
|---|---|---|
| 升级对象 | 仅主页卡片 + 归档页时间线 | 用户明确选择「主页 + 归档页都改」，其他模块不动 |
| 颜色策略 | 统一 `--primary`（hue 290 紫粉），辅以 ±30° 微调 | 与 `FeaturedPanel` 的「多色」形成差异化；玻璃质感在单一 hue 上更耐看 |
| 字体策略 | 不引入新字体 | 系统字体已够用；避免新增 woff2 资产 |
| 卡片是否拆分 | **不拆分 PostCard** | 用户明确选择「**组件 + main.css 通用类**」深度，所有新逻辑都在 PostCard 内部 + 通用类消费 |
| 柔光圈性能 | 桌面端才显示（`hidden md:block`）+ `filter: blur(48px)` | 移动端 blur 极耗 GPU，主动降级 |
| 玻璃兼容性 | 接受 Chrome 111+ / Safari 16.4+（项目已无 IE） | `oklch(from var)` 是 2023+ 语法 |
| 入场动画 | 沿用项目 `onload-animation` 机制（`--content-delay` 错峰） | 与 `FeaturedPanel` `AboutPanel` 一致 |
| 暗色模式 | 玻璃透明度从 0.72 → 0.55、阴影加重 | 暗色下玻璃更明显 |
| 移动端 hover | 改为 `:active` 反馈 | 触屏没有 hover |
| 不动 `Markdown.astro` | ✓ | 与卡片无关 |
| 不动 `variables.styl` | ✓ | 用户明确要求「不动框架」，CSS 变量层也算框架一部分 |
| 不动侧边栏 / TOC / 导航 | ✓ | 题目范围外 |
| 不动文章详情页 | ✓ | 题目范围外 |

**未做（避免越界）**：
- 不新增字体包（避免 woff2 资产膨胀）
- 不改 Astro / Tailwind / Biome 配置
- 不动归档页的「URL 过滤」交互（`?tag=` `?category=` `?uncategorized`）
- 不分拆 PostCard（升级在原文件内消化）
- 不重做全站主题（仅在现有色板基础上加 6 个工具类）

---

## Verification

按以下顺序验证，每步必须通过：

1. **类型检查**
   ```bash
   pnpm check
   ```
   期望：TypeScript 0 错误；PostCard 的 props 与 `CollectionEntry<"posts">` 匹配；ArchivePanel 的 `Post` interface 包含原 onMount 所需字段。

2. **dev 启动 + 桌面端目检**
   ```bash
   pnpm dev
   ```
   打开 `http://localhost:4321/MDM-blog/`，确认：
   - 首页 8 张卡片均显示柔光圈（每个卡片光圈 hue 因标签不同而略异）
   - 卡片悬停时整体上浮 4px、描边变亮、标题变渐变文字、玻璃背景更透
   - 标签改为玻璃小徽章形式
   - 字数/阅读时间前各有渐变小圆点
   - 翻页（点击 `/2/`）后第 9-16 张同样表现一致

3. **归档页目检**
   打开 `http://localhost:4321/MDM-blog/archive/`，确认：
   - 顶部 Hero 显示「ARCHIVE · 归档」、总文章数（渐变文字）、年份跨度
   - 右上角 4 个玻璃徽章（年份 + 计数）可点击锚跳转
   - 每个年份行：左侧巨号渐变年份（衬线字体）、中间细渐变线、右侧玻璃徽章
   - 文章行：hover 时背景染色 + 标题变 primary 色并右移 + 节点圆点放大
   - 移动端（≤768px）布局：标签列隐藏，节点线变细

4. **深色模式**
   点击右上角主题切换，验证：
   - 玻璃面板背景从 0.72 alpha 降为 0.55
   - 描边、内高光、阴影都对应加深
   - 渐变文字仍清晰可读
   - 柔光圈不抢戏

5. **URL 过滤仍可用**
   `http://localhost:4321/MDM-blog/archive/?category=编程生涯`：
   - 仍按 URL 过滤后展示对应分组
   - 过滤为空时 Hero 仍渲染、groups 为空时不报错

6. **代码格式化**
   ```bash
   pnpm format
   ```
   应用 Biome 格式化到 3 个改动文件。

7. **回归构建（可选）**
   ```bash
   pnpm build
   ```
   期望：构建成功，Pagefind 索引正常生成，无控制台错误。

---

## Files Changed

| 状态 | 路径 | 说明 |
|---|---|---|
| ✏️ 修改 | [src/styles/main.css](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/styles/main.css) | `@layer components` 末尾追加 6 个通用类 |
| ✏️ 重写 | [src/components/PostCard.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/PostCard.astro) | 玻璃面板 + 渐变描边 + 柔光圈 + 渐变标题 + 玻璃徽章 |
| ✏️ 微调 | [src/components/PostPage.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/PostPage.astro) | 容器去除多余背景，让玻璃生效 |
| ✏️ 重写 | [src/components/ArchivePanel.svelte](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/ArchivePanel.svelte) | 玻璃 Hero + 渐变时间线 + 节点光晕 + 玻璃徽章 |
| 🚫 不动 | `src/styles/variables.styl` | 主题 token 不动 |
| 🚫 不动 | `src/layouts/MainGridLayout.astro` | 布局壳不动 |
| 🚫 不动 | `src/pages/[...page].astro` / `src/pages/archive.astro` | 页面壳不动 |
| 🚫 不动 | `src/components/PostMeta.astro` | 元信息组件复用 |
| 🚫 不动 | `src/components/widget/*` | 侧边栏 / TOC / 导航全部不动 |
