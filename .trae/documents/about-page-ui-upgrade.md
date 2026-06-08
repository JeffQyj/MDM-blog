# 关于页面 UI 升级 — 实施计划

## Summary

将当前扁平化的「关于」页面（仅一个 `card-base` 容器 + 默认 admonition 渲染）升级为「现代极简卡片风」的 Q&A 列表。**保留** `src/content/spec/about.md` 中的全部文字内容（不改动 Markdown 源），**新增**一个 `AboutPanel.astro` 组件负责解析 + 重排为定制卡片，最后简化 `src/pages/about.astro` 引用新组件。

> 设计关键词：现代极简 · 序号角标 · 顶部彩条 · 悬浮上移 · 错峰入场动画

---

## Current State Analysis

### 现有 `src/pages/about.astro`（[about.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/pages/about.astro#L1-L25)）

```astro
<MainGridLayout title={i18n(I18nKey.about)} description={i18n(I18nKey.about)}>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
        <div class="card-base z-10 px-9 py-6 relative w-full ">
            <Markdown class="mt-2">
                <Content />
            </Markdown>
        </div>
    </div>
</MainGridLayout>
```

只做了一件事：把 `spec/about.md` 渲染进一个 `card-base` 圆角容器。视觉上整页就是「白底 + 长串 TIP/NOTE 块 + 几道 `***` 横线」。

### 现有 `src/content/spec/about.md`（[about.md](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/content/spec/about.md)）

包含 10 段 Q&A + 1 段结尾寄语，结构高度规整：

```
# 关于我

:::tip
Q: 你是谁？…
:::

:::note
A 内容（多段、含表格/列表）
:::

***
…（共 10 段）
***

*感谢阅读…*
```

### 对比参考（项目内现成设计语言）

- `FeaturedPanel.astro` / `FeaturedCard.astro` — 杂志编辑风（serif 大字、巨号装饰、期号 meta），**与本次方向不符**
- `PostCard.astro` — 简洁卡片（圆角 + 标题 + meta + chevron），是「现代极简卡片」的最近参考
- `markdown-extend.styl` — admonition 现有色板（tip=青、note=蓝、important=紫、warning=黄、caution=橙）— **不在新设计中复用色彩，改为统一使用 `--primary`（hue 290 紫粉）作为唯一强调色**

### 设计 token 复用

| Token | 用途 |
|---|---|
| `--card-bg` | 卡片背景 |
| `--primary`（`oklch(0.70 0.14 var(--hue))`） | 序号 + 顶部彩条 |
| `--line-divider` | 卡片内虚线分隔 |
| `--radius-large`（1rem） | 卡片圆角 |
| `--btn-regular-bg` / `--btn-regular-bg-hover` | 浅色装饰点缀 |
| `--deep-text` | 标题色 |
| `:root.dark` | 深色模式覆盖 |

---

## Proposed Changes

### 改动 1：新建 `src/components/AboutPanel.astro`

**What**：新增组件，作为关于页面的视觉主体。

**Why**：把「Markdown → 自定义卡片」的转换封装到一个独立组件，`about.astro` 只负责布局 + 传参，职责清晰。

**How**（核心结构）：

```astro
---
import { Icon } from "astro-icon/components";
import Markdown from "@components/misc/Markdown.astro";
import type { CollectionEntry } from "astro:content";

interface Props {
    entry: CollectionEntry<"spec">;
}
const { entry } = Astro.props;

// 1) 解析 entry.body：提取 Q&A 对 + 结尾寄语
//    规则：按顺序扫 :::tip（Q）/ :::note（A）配对；
//    配对失败的条目跳过；末尾 *…* 行作为 footer。
// 2) 渲染：每对 Q&A 一个 <article class="qa-card">，
//    寄语作为 <footer class="qa-foot">。
const qaList = parseQAPairs(entry.body);
const footerText = extractFooter(entry.body);
---

<section class="about-panel">
    <header class="about-panel__intro">
        <p class="about-panel__lead">10 个问题，认识一下。</p>
    </header>

    <div class="about-panel__list">
        {qaList.map((qa, i) => (
            <article
                class="qa-card"
                style={`animation-delay: calc(var(--content-delay) + ${i * 70}ms);`}
            >
                <!-- 左侧彩条 + 序号 + 问句 -->
                <header class="qa-card__head">
                    <span class="qa-card__index">Q.{String(i + 1).padStart(2, "0")}</span>
                    <h3 class="qa-card__q">{qa.question}</h3>
                </header>
                <!-- 答案（重新走 Markdown 渲染管线，保留表格/列表/加粗） -->
                <div class="qa-card__body">
                    <Markdown class="!max-w-none">{qa.answer}</Markdown>
                </div>
            </article>
        ))}
    </div>

    {footerText && (
        <footer class="about-panel__foot">
            <Icon name="material-symbols:alternate-email-rounded" class="text-[1.1em]" />
            <span>{footerText}</span>
        </footer>
    )}
</section>

<style>
    /* 完整 CSS 见下方"设计细节" */
</style>

<script>
    // 解析逻辑（详见下文"实现要点"）
    interface QA { question: string; answer: string; }
    function parseQAPairs(body: string): QA[] { … }
    function extractFooter(body: string): string { … }
</script>
```

**`parseQAPairs` 实现要点**：
- 用 `matchAll(/^:::(tip|note)\r?\n([\s\S]*?)\r?\n:::/gm)` 拿到全部 admonition 块
- 按出现顺序两两配对（tip → note）
- Q 文本剥离开头的 `Q:` 前缀并 trim
- A 文本原样保留（让 `Markdown.astro` 继续渲染其内部的表格、列表、加粗、链接）

**`extractFooter` 实现要点**：
- 取最后一个 `***` 之后的所有非空内容
- 去掉首尾 `*`（斜体包裹）后 trim
- 若为空则返回 `null`

---

### 改动 2：重写 `src/pages/about.astro`

**What**：把页面改成纯壳子，仅引布局 + 新组件。

**Why**：解析与样式都搬到 `AboutPanel` 后，页面文件应当回归「单职责」。

**How**（替换全部 25 行）：

```astro
---
import { getEntry } from "astro:content";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import MainGridLayout from "../layouts/MainGridLayout.astro";
import AboutPanel from "../components/AboutPanel.astro";

const aboutPost = await getEntry("spec", "about");
if (!aboutPost) {
    throw new Error("About page content not found");
}
---

<MainGridLayout
    title={i18n(I18nKey.about)}
    description={i18n(I18nKey.about)}
    headings={[{ depth: 1, slug: "about-me", text: "关于我" }]}
>
    <div class="flex w-full rounded-[var(--radius-large)] overflow-hidden relative min-h-32">
        <div class="card-base z-10 px-7 md:px-9 py-6 md:py-8 relative w-full">
            <h1 class="about-page__title">关于我</h1>
            <AboutPanel entry={aboutPost} />
        </div>
    </div>
</MainGridLayout>
```

> 注：保留外层 `card-base` 容器（避免破坏站点统一的「主内容卡片」观感），把页面级 H1 标题放进去，再让 `AboutPanel` 接管 Q&A 列表。

---

### 设计细节（CSS 规范，写入 `AboutPanel.astro` 的 `<style>` 块）

**入场动画**（与 `FeaturedPanel` 一致的 `cubic-bezier(0.22, 1, 0.36, 1)` 缓动）：

```css
@keyframes qaFadeIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
}
.qa-card { animation: qaFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
```

**面板容器**：

```css
.about-panel { display: flex; flex-direction: column; gap: 1.5rem; }
.about-panel__intro { padding: 0 0.25rem; }
.about-panel__lead {
    margin: 0;
    font-size: 0.875rem;
    color: oklch(0.5 0.02 var(--hue));
    letter-spacing: 0.05em;
}
```

**单张 Q&A 卡片**（核心）：

```css
.qa-card {
    position: relative;
    padding: 1.5rem 1.75rem 1.5rem 2.25rem;   /* 左侧给彩条留位 */
    background: var(--card-bg);
    border: 1px solid oklch(from var(--primary) l c h / 0.12);
    border-radius: var(--radius-large);
    transition:
        transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 0.45s cubic-bezier(0.22, 1, 0.36, 1),
        border-color 0.45s ease;
    overflow: hidden;
}

/* 左侧 4px 彩条，hover 时加粗到 5px */
.qa-card::before {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 4px;
    background: linear-gradient(180deg,
        oklch(0.72 0.14 var(--hue)),
        oklch(0.62 0.14 calc(var(--hue) + 25)));
    transition: width 0.35s ease, opacity 0.35s ease;
    opacity: 0.85;
}
.qa-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px -10px oklch(0.4 0.08 var(--hue) / 0.18);
    border-color: oklch(from var(--primary) l c h / 0.32);
}
.qa-card:hover::before { width: 5px; opacity: 1; }

:root.dark .qa-card {
    border-color: oklch(from var(--primary) l c h / 0.18);
    box-shadow: 0 1px 0 0 oklch(0.3 0.02 var(--hue)) inset;
}
:root.dark .qa-card:hover {
    box-shadow: 0 10px 28px -10px rgb(0 0 0 / 0.5);
}
```

**头部（序号 + 问句）**：

```css
.qa-card__head {
    display: flex;
    align-items: baseline;
    gap: 0.875rem;
    padding-bottom: 0.875rem;
    margin-bottom: 1rem;
    border-bottom: 1px dashed var(--line-divider);
}

.qa-card__index {
    font-family: "JetBrains Mono Variable", ui-monospace, monospace;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--primary);
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
}

.qa-card__q {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.55;
    color: oklch(0.22 0.02 var(--hue));
}
:root.dark .qa-card__q { color: oklch(0.92 0.01 var(--hue)); }
```

**答案区**（沿用 `prose` 但缩窄默认字号、收紧边距）：

```css
.qa-card__body :global(.prose) { font-size: 0.9375rem; line-height: 1.75; }
.qa-card__body :global(p)      { margin: 0.4rem 0; }
.qa-card__body :global(table)  { font-size: 0.875rem; }
.qa-card__body :global(strong) { color: var(--primary); font-weight: 600; }
```

**结尾寄语**：

```css
.about-panel__foot {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-large);
    background: oklch(from var(--primary) l c h / 0.06);
    color: oklch(0.4 0.04 var(--hue));
    font-size: 0.9375rem;
}
:root.dark .about-panel__foot { color: oklch(0.78 0.02 var(--hue)); }
```

**页面 H1**（写在 `about.astro` 的 scoped 样式中或直接 Tailwind 内联）：

```astro
<h1 class="about-page__title text-3xl font-bold mb-1 dark:text-neutral-50 transition
            before:w-1 before:h-5 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:top-[35px] before:left-[18px] before:hidden md:before:block relative pl-3 md:pl-5">
    关于我
</h1>
```

**响应式**：

```css
@media (max-width: 640px) {
    .qa-card { padding: 1.25rem 1.25rem 1.25rem 1.75rem; }
    .qa-card__q { font-size: 1rem; }
    .qa-card__head { gap: 0.625rem; }
}
```

---

## Assumptions & Decisions

| 决策 | 选择 | 理由 |
|---|---|---|
| 内容源 | **保留** `src/content/spec/about.md` 不动 | 用户只说升级 UI，未授权改内容；解析层与内容层解耦更安全 |
| 解析方式 | 客户端 `<script>` 解析 `entry.body` 后注入 | 不增加 remark 插件，纯组件级方案 |
| 颜色 | 统一 `--primary`（hue 290 紫粉） | 现代极简需要克制色彩，与 FeaturedPanel 的多色形成差异化 |
| 入场动画 | 仅 Q&A 卡片错峰上浮（70ms × index） | 项目已大量使用该模式（`FeaturedPanel` 80ms、`PostCard` 等） |
| 标题层级 | 页面 H1 在 `about.astro`，Q 句作为 H3 在卡片内 | H1→H3 跳级用字号 + 视觉粗细弥补，符合既不冗余又有重点 |
| 答案区 | 复用 `<Markdown>` 组件走完整渲染管线 | 保留 A 内部的表格、列表、加粗、链接样式，零成本 |
| 兜底 | 解析失败时 console.warn + 渲染原 Markdown | 不让升级破坏页面可访问性 |
| 字体 | Q 句走系统无衬线，序号走 JetBrains Mono | 与 `markdown.css` 中 `code` 的字体保持一致 |

**未做**（避免越界）：
- 不改 admonition 全局样式（避免影响博客正文）
- 不加 Hero / 统计区 / 头像（用户明确否决）
- 不引入新依赖 / 字体包
- 不改 `Markdown.astro` 组件
- 不改 `variables.styl` token 体系

---

## Verification

按以下顺序验证，每步必须通过才能进入下一步：

1. **构建检查**
   ```bash
   pnpm check
   ```
   期望：TypeScript 0 错误，组件 props 类型与 `CollectionEntry<"spec">` 匹配。

2. **dev 启动 + 手动目检**
   ```bash
   pnpm dev
   ```
   打开 `http://localhost:4321/MDM-blog/about/`，确认：
   - 10 张卡片按序渲染，序号 01-10
   - 卡片内表格、列表、加粗、链接全部正常（重点检查「技术栈」表格）
   - hover 时彩条加粗 + 卡片上移
   - 深色模式颜色过渡自然（切换主题）
   - 移动端（≤640px）布局无溢出
   - 末尾「感谢阅读…3531641569@qq.com」出现在 footer 样式条中

3. **回退测试**
   - 临时把 about.md 中一段 Q 改成 `:::warning`（非 tip）模拟解析异常
   - 期望：那条不出现在卡片区，console 出现 warn，原页面不白屏
   - 测试后还原

4. **格式化**
   ```bash
   pnpm format
   ```
   应用 Biome 格式化到两个改动文件。

5. **最终构建**（可选）
   ```bash
   pnpm build
   ```
   确认无运行时错误且 Pagefind 索引正常生成。

---

## Files Changed

| 状态 | 路径 | 说明 |
|---|---|---|
| 🆕 新增 | `src/components/AboutPanel.astro` | 解析 + 渲染 Q&A 卡片的主组件 |
| ✏️ 修改 | `src/pages/about.astro` | 简化为布局壳，新增 `<AboutPanel />` 引用 |
| 🚫 不动 | `src/content/spec/about.md` | 内容源保持原样 |
| 🚫 不动 | `src/components/misc/Markdown.astro` | 复用其渲染管线 |
| 🚫 不动 | `src/styles/markdown-extend.styl` | 不影响全局 admonition |
