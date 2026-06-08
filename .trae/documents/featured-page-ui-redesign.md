# 精选文章页面 UI 重构计划（杂志编辑风）

## Summary

将 `/featured/` 精选文章页面从「通用 2 列文本卡片」重构为「杂志编辑风」视觉：
- 顶部**英雄区（Hero）**——主视觉 + 装饰性大字 + 期号副信息
- 首位**特写卡片**——占据整宽，序号"01"巨号衬线字作为视觉焦点
- 后续**网格卡片**——2-3 列统一权重，但每张仍带杂志元素（序号、徽章、READ 按钮）

全程**沿用现有 frontmatter**（`title/published/tags/category/description`），**不新增图片字段**，仅靠排版、字号、留白、渐变背景和装饰元素营造杂志感。

## Current State Analysis

### 现状痛点（从截图观察）

| 问题 | 表现 |
|---|---|
| 信息堆叠 | 分类小帽 + 描述 + 标题 + 日期 + tag + 阅读按钮挤在一行 |
| 装饰孤立 | 标题前的 `\|` 装饰条悬空，无承托 |
| 层次缺失 | 全部 5 张卡片同尺寸同权重，没有「主推」 |
| 留白不足 | 卡片内边距紧凑，元素间间距过小 |
| 品牌感弱 | 没有「精选」氛围，没有序号/期号/徽章等杂志感元素 |
| 标题字号 | 标题只有 `text-xl`，缺乏视觉冲击力 |

### 现关键文件

| 文件 | 现状 |
|---|---|
| [src/components/FeaturedCard.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/FeaturedCard.astro) | 通用文本卡，2 列网格中的标准单元 |
| [src/components/FeaturedPanel.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/FeaturedPanel.astro) | 简单 grid 容器 + 标题行 |
| [src/styles/variables.styl](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/styles/variables.styl) | 现有 CSS 变量系统，支持 `--hue` 动态主题色 |
| [src/components/PostCard.astro](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/src/components/PostCard.astro) | 现有通用卡（**参考对象**），不修改 |

### 设计 Token（已可用，不引入新变量）

| 变量 | 用途 |
|---|---|
| `--primary` / `--hue` | 主题色，可作为序号大字、徽章 |
| `--card-bg` | 卡片背景 |
| `--btn-regular-bg/-hover/-active` | 按钮背景 |
| `--btn-content` | 按钮文字 |
| `--radius-large` (1rem) | 圆角 |
| `--content-delay` (150ms) | 加载动画基准延迟 |

## Proposed Changes

### 1. 重写 `src/components/FeaturedPanel.astro`

**改造前**：简单标题行 + 2 列网格
**改造后**：
- **Hero 英雄区**（独立 component 风格，首屏即焦点）
  - 背景：微妙渐变（`linear-gradient(135deg, oklch(0.95 0.03 var(--hue)), oklch(0.95 0.05 calc(var(--hue) + 40)))`）
  - 装饰几何：右上角大号半透明 "★" SVG 或装饰线条
  - 大字标题：超大衬线"精选" + 小字英文"EDITOR'S PICK" 在其下方
  - 副信息：杂志期号样式 `VOL.06 · 2026/06/08 · 5 ARTICLES`（以小帽 + 装饰圆点分隔）
  - 装饰分隔线：底部 1px dashed 渐变
- **First Feature 首位特写卡片**：`renderedPosts[0]` 用特写版（带巨号"01"、全宽、渐变背景）
- **Grid 后续卡片网格**：`renderedPosts.slice(1)` 用紧凑版，2-3 列
- 整页使用 0.05-0.1s 错峰淡入（`animation-delay` 沿用 `i * 50ms`）

### 2. 重写 `src/components/FeaturedCard.astro`

**新增 prop：`variant: "feature" | "compact"`（默认 `compact`）**
- Feature 特写版
  - 整宽卡片，背景渐变（淡 → 透）
  - 左侧大号衬线序号 `01`（`text-[10rem] leading-none font-black text-[var(--primary)]/15`）绝对定位为背景数字
  - 主标题放大到 `text-3xl md:text-4xl`，前有 4px 实色竖条
  - 双语小帽：`[分类] · CATEGORY` 形式
  - 引言式描述：左侧大引号装饰
  - 元信息行：`📅 2026-06-08 · ⏱ 12 分钟`（用小图标 + 文字）
  - 底部：tag 斜杠分隔（`tag1 / tag2`）+ 圆形悬浮"READ →"按钮
  - hover：整卡上浮 + 阴影加深 + 序号缩放
- Compact 紧凑版（保持现有信息架构，但视觉更精致）
  - 卡片顶部装饰：4px 高的渐变细条（hover 时变粗变亮）
  - 左上角小序号 `01` 衬线字（`text-3xl`）
  - 分类小帽（保留）
  - 标题（保留但加粗加大到 `text-2xl`）
  - 描述摘要
  - 元信息：日期 | 阅读时长（细灰小字）
  - tag 用斜杠分隔而非 chip：`tag1 / tag2`（更杂志）
  - 右下角圆形"READ →"按钮（绝对定位，hover 时浮起）
  - 整卡 hover：上浮、阴影、右上渐变条展开

### 3. 关键视觉元素（仅作概念，不写实际代码）

```
┌────────────────────────────────────────────┐
│   ★ EDITOR'S PICK  精选                  │
│                                            │
│   VOL.06 · 2026/06/08 · 5 ARTICLES        │
│   ─────────────────────────────────        │
├────────────────────────────────────────────┤
│                                            │
│  ╭────────────────────────────────────╮    │
│  │ ┌──┐                                │   │
│  │ 01│   [CATEGORY · 成长碎记]          │  │
│  │   │   「从宇宙尺度到 138 亿年演化史   │  │
│  │   │   从雕星一主禹润霍金辐射…」       │  │
│  │   │                                  │  │
│  │   │   成长碎记：青年大学习之          │  │
│  │   │   基本宇宙学概览                 │  │
│  │   │                                  │  │
│  │   │   2026-06-08  ⏱ 12 分钟  READ →  │  │
│  ╰────────────────────────────────────╯    │
│                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 02      │  │ 03      │  │ 04      │   │
│  │ [CAT]   │  │ [CAT]   │  │ [CAT]   │   │
│  │ 标题... │  │ 标题... │  │ 标题... │   │
│  │ 描述... │  │ 描述... │  │ 描述... │   │
│  │ 06-29  →│  │ 06-28  →│  │ 06-24  →│   │
│  └─────────┘  └─────────┘  └─────────┘   │
└────────────────────────────────────────────┘
```

### 4. 字体策略（不引入外部字体，复用系统字体）

```css
/* 标题/序号：粗衬线，制造杂志感 */
font-family: "Source Han Serif SC", "Noto Serif SC", "Songti SC",
             "SimSun", "Georgia", serif;
font-weight: 900;

/* 正文：现有 Inter/system-ui */
font-feature-settings: "tnum" 1;  /* 数字等宽 */
```

### 5. 错峰入场动效（保留并强化）

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}
```

每个元素 `style="animation-delay: calc(var(--content-delay) + ${i * 80}ms);"`，营造翻页感。

## Assumptions & Decisions

| 决策点 | 决定 | 理由 |
|---|---|---|
| 设计方向 | 杂志编辑风 | 用户选定 |
| 顶部 | Hero 英雄区 | 用户选定 |
| 卡片布局 | 首篇特写 + 后面网格 | 用户选定 |
| 封面图 | **不新增** | 用户之前明确「不使用封面」 |
| 字体 | 复用系统衬线（不引入 Google Fonts） | 避免页面加载负担 |
| 是否动 FeaturedCard | 是，但保留组件名 | 通过 `variant` prop 复用 |
| i18n key | 复用 `Key.featured`，不新增 key | 「精选」是唯一的 hero 标题 |
| 移动端 | 单列堆叠，特写变窄 | 响应式 |
| 暗色模式 | 渐变/序号颜色自动反转（用 oklch 自适应） | 沿用现有设计系统 |
| 排序 | 不变（published 倒序） | 沿用现有 |
| 删改原 PostCard | **不修改** | 与原通用卡解耦 |

## Verification Steps

1. **类型检查**：`pnpm check` 应 0 errors
2. **格式化**：`pnpm format`
3. **构建**：`pnpm build` 应成功
4. **手动验证清单**：
   - [ ] `/featured/` 顶部出现 Hero 英雄区
   - [ ] 首位卡片"特写"——整宽、巨号"01"、渐变背景
   - [ ] 后续 4 篇为 2-3 列紧凑网格
   - [ ] 每张卡片左上有序号（01-05）
   - [ ] 每张卡片有"READ →"按钮
   - [ ] 标题有 4px 竖条装饰
   - [ ] tag 用斜杠分隔
   - [ ] hover 时卡片上浮 + 序号缩放/渐变条展开
   - [ ] 移动端：单列堆叠
   - [ ] 暗色模式下颜色自适应
   - [ ] 错峰入场动效可见
5. **截图对比**：参考 vue 杂志、苹果 App Store 编辑推荐、Apple Music 精选集、The Browser Company 风格的视觉

## Files Changed Summary

| 类型 | 文件 | 行数估计 |
|---|---|---|
| 修改 | `src/components/FeaturedCard.astro` | 完全重写 ~150 行 |
| 修改 | `src/components/FeaturedPanel.astro` | 重构为 Hero + Feature + Grid ~100 行 |
| 不变 | `src/pages/featured.astro` | 复用，无需改 |
| 不变 | `src/config.ts`、`i18n/*`、`content/config.ts` | 全部沿用 |
