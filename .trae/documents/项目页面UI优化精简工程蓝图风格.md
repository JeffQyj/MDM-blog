# 实施方案：项目页 UI 精简优化

## Summary

在保留「工程蓝图」核心识别符（栅格背景 + 四角 CAD 角标）的前提下，对项目页 `/projects/` 进行精简优化：
- **删除冗余元素**：PRJ 项目代号、状态徽章（ACTIVE/DEPLOYED/ARCHIVED/DRAFT）、状态 LED 条、状态图例、扫描线、坐标轴、卡片顶部分隔线、序号、LATEST 引用
- **收敛 Hero 数据**：从 6 项数据条 + 4 项 LED + LATEST 引用，压缩为 2-3 项关键数据
- **统一网格列数**：卡片网格限定 2 列（不再 3 列），充分展示卡片
- **增大呼吸感**：缩减装饰层、扩大容器间距、降低字号密度

---

## Phase 1 探索结论

| 文件 | 当前内容 | 处置 |
| --- | --- | --- |
| `src/components/ProjectsPanel.astro` | Hero（含 eyebrow / 7 类内容）+ Filter + Grid + Legend | 精简 Hero、删除 Legend |
| `src/components/ProjectCard.astro` | 顶部分隔线 + 序号 + PRJ + 状态徽章 + 主体 + 底部 + 尺寸标注线 | 删顶部整段、删尺寸标注线、保留四角角标 |
| `src/components/ProjectsFilter.svelte` | 分类 + 排序筛选 | 保持不变 |
| `src/pages/projects.astro` | 页面入口 | 保持不变 |
| `src/utils/content-utils.ts` `getProjectPosts` | 文章筛选 | 保持不变 |
| `src/layouts/Layout.astro` | 条件注入 Syne 字体 | 保持不变 |
| `src/i18n/*`、`src/config.ts`、`src/constants/link-presets.ts`、`src/types/config.ts` | 导航与多语言 | 保持不变 |

---

## Proposed Changes

### 1. `src/components/ProjectsPanel.astro` 精简 Hero 与清理派生数据

#### 1.1 删除/调整的派生计算

| 派生变量 | 处置 | 原因 |
| --- | --- | --- |
| `computeStatus(entry)` | **删除** | 项目状态不再展示 |
| `statusCounts` | **删除** | 配合状态机下线 |
| `projectCodeMap` | **删除** | PRJ 编号不再展示 |
| `allTags` / `techStackCount` | **删除** | 数据条收敛 |
| `years` / `yearRangeText` | **删除** | 数据条收敛 |
| `latestPost` / `latestDate` / `latestDateText` / `latestProjectTitle` | **删除** | LATEST 引用区下线 |
| `independentCount` | **保留** | 数据条需要 |
| `secondaryCount` | **保留** | 数据条需要 |
| `totalCount` | **保留** | 数据条需要 |
| `ProjectStatus` 类型 import | **删除** | 配合 computeStatus 下线 |

#### 1.2 Hero 区新结构（自上而下）

```text
┌─────────────────────────────────────────────────────────┐
│  [栅格背景 + 四角 ┌ ┐ └ ┘]                              │
│                                                         │
│              ┌── Projects ──┐                          │
│              │   PROJECTS  （H1 英文，Syne 字体）       │
│              │   项　目      （H1 中文，Syne 字体）       │
│              └──────────────┘                          │
│                                                         │
│        独立项目 · 二次开发  ｜  共 13 件                 │
│                                                         │
│      ┌──────┬──────┬──────┐                              │
│      │ TOTAL│ 独立 │ 二次 │                              │
│      │  13  │  9   │  4   │                              │
│      └──────┴──────┴──────┘                              │
└─────────────────────────────────────────────────────────┘
```

具体改动清单：
- **删除** `<span class="projects-hero__eyebrow">` 整段
- **保留** `<h1 class="projects-hero__title">`（英文 + 中文双语），可微调上下间距
- **保留** `<p class="projects-hero__subtitle">`，精简文案为「独立项目 · 二次开发 ｜ 共 N 件」
- **收敛** `<div class="projects-hero__specs">`：从 6 项数据条压到 **3 项**（TOTAL、独立项目、二次开发），去掉 STACKS / RANGE / LAST BUILD
- **删除** `<div class="projects-hero__status">`（4 项状态 LED）
- **删除** `<div class="projects-hero__latest">`（LATEST 引用）
- **删除** `<span class="projects-hero__scanline">`、`<span class="projects-hero__axis--x/y">`
- **保留** `<div class="projects-hero__grid">`（栅格背景）与 4 个 `<span class="projects-hero__corner">`（角标）
- **保留** `@keyframes projectsHeroIn` 入场动画，**删除** `@keyframes scanline`、`@keyframes heroLedPulse`

#### 1.3 Hero 内边距与字号调整（提升呼吸感）

| Token | 原值 | 新值 | 理由 |
| --- | --- | --- | --- |
| `.projects-hero` padding | `3rem 2.5rem 2rem` | `4rem 2.5rem 3rem` | 上下放大 |
| `.projects-hero__inner` gap | `1.125rem` | `1.5rem` | 章节间距 |
| `.projects-hero__title-zh` font-size | `clamp(3rem, 1.5rem + 6vw, 5.5rem)` | `clamp(2.5rem, 1.2rem + 5vw, 4.5rem)` | 略收敛 |
| `.projects-hero__specs` padding | `0.875rem 1.25rem` | `1rem 1.5rem` | 稍宽松 |
| `.projects-hero__specs` margin-top | `0.5rem` | `1rem` | 与副标题拉开 |
| `.projects-page` gap | `1.25rem` | `1.75rem` | Hero / Filter / Grid 段间 |

#### 1.4 删除底部图例

```astro
<!-- 删除整个 <aside class="projects-legend"> 区块（包含 4 项 LED 含义 + PRJ 编号说明） -->
```

#### 1.5 卡片网格列数调整

```css
.projects-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;        /* 1.25rem → 1.5rem，呼应呼吸感 */
}

@media (min-width: 768px) {
    .projects-grid {
        grid-template-columns: repeat(2, 1fr);   /* 限定 2 列，不再 3 列 */
    }
}

/* 删除 @media (min-width: 1280px) { ... 3 列 } */
```

---

### 2. `src/components/ProjectCard.astro` 卡片结构重塑

#### 2.1 Props 收敛

```ts
interface Props {
    entry: CollectionEntry<"posts">;
    techStack: string[];
    index: number;
    class?: string;
    style?: string;
}

/* 删除 props: projectCode, status */
/* 删除 type ProjectStatus 的导出 */
```

#### 2.2 模板结构变化

```text
[改前]                                              [改后]
┌── .project-card ─────────────────────┐            ┌── .project-card ─────────────────────┐
│ ┌ 角标 ┐ 序号  PRJ.2024.001  [LED] ┐│            │ ┌ 角标 ┐                              │
│ ├──── 虚线分隔 ─────────────────────┤│            │ │                                    │
│ │ [分类]                            ││            │ │ [分类]                              │
│ │ 标题                              ││   ──→     │ │ 标题                                │
│ │ 描述 2 行截断                      ││            │ │ 描述 2 行截断                        │
│ │ [tech] [tech] [tech]              ││            │ │ [tech] [tech] [tech]                │
│ │ ├─ 尺寸标注线 ─┤                   ││            │ │                                    │
│ │ 📅 2024.01.01 ⏱ 5min 分类  [READ →]│            │ │ 📅 2024.01.01 ⏱ 5min  [READ →]    │
│ └ 角标 ┘                            ││            │ └ 角标 ┘                              │
└─────────────────────────────────────┘            └─────────────────────────────────────┘
```

具体改动清单：
- **删除** 整个 `<header class="project-card__topbar">`（序号 + PRJ + 状态 LED + 虚线分隔）
- **删除** 整个 `<div class="project-card__scalebar">`（尺寸标注线）
- **删除** `category` 元数据条目（避免与顶部 [分类] chip 重复，分类 chip 保留）
- **保留** 四角角标（4 个 `<span class="project-card__corner">`）
- **保留** 分类 chip / 标题 / 描述 / 技术栈芯片 / 日期 + 阅读时长 / READ 按钮
- **保留** 悬停动效（`transform: translateY(-4px)` + 角标放大 + READ 箭头右移）

#### 2.3 关键 CSS 调整

```css
/* 卡片整体：放大 padding 与 gap */
.project-card {
    padding: 1.5rem 1.75rem 1.25rem;     /* 原 1.25rem 1.5rem 1.125rem */
    gap: 1.125rem;                        /* 原 1rem */
}

/* 删除 .project-card__topbar、.project-card__topbar-left/-right  */
/* 删除 .project-card__index、.project-card__code                  */
/* 删除 .project-card__status、.project-card__led                 */
/* 删除 .project-card__status-en、.project-card__status-zh         */
/* 删除 .project-card__scalebar 相关样式                            */
/* 删除 @keyframes ledPulse                                         */
/* 删除 .project-card__meta-item--category 样式                     */
/* 移动端保留的 .project-card__status-zh { display: none } 也一并删除 */
```

---

### 3. 父组件传参清理

在 `ProjectsPanel.astro` 调用 `ProjectCard` 处，删除 `projectCode` 与 `status` 两个 prop：

```astro
{renderedPosts.map(({ entry }, i) => {
    const techStack = (entry.data.tags ?? []).slice(0, 4);
    return (
        <ProjectCard
            entry={entry}
            techStack={techStack}
            index={i + 1}
            style={`animation-delay: calc(var(--content-delay) + ${(i + 1) * 60}ms);`}
        />
    );
})}
```

---

### 4. `src/components/ProjectsFilter.svelte` 保持不变

筛选功能本身无冗余，状态机逻辑只在卡片中体现。无需改动。

---

## Assumptions & Decisions

| 决策点 | 选择 | 理由 |
| --- | --- | --- |
| Hero 数据条保留项 | TOTAL / 独立项目 / 二次开发 三项 | 用户明确「2-3 项关键数据」；这三项最能体现项目档案核心指标 |
| 卡片网格列数 | 移动 1 列 / 桌面 2 列（取消 3 列） | 用户明确「并排展示限定为两个，充分展示项目卡片」 |
| 卡片顶部分隔线 | 删除 | 序号 + PRJ + 状态徽章整段移除后，分隔线失去意义 |
| 卡片序号（01/02） | 删除 | 顶部分隔线删除后，序号成为孤立元素 |
| 卡片底部尺寸标注线 | 删除 | 装饰元素，不承载信息 |
| 卡片底部 `category` 元数据 | 删除 | 与顶部 [分类] chip 信息重复 |
| 状态机逻辑（computeStatus 等） | 整段删除 | 状态机下线即删除相关数据计算，避免死代码 |
| 扫描线 / 坐标轴动画 | 删除 | 装饰过重，与「呼吸感不够」的目标冲突 |
| Eyebrow（PROJECT ARCHIVE / 项目档案）| 删除 | H1 已承担身份表达，eyebrow 冗余 |
| LATEST 引用 | 删除 | 「最近项目」属于噪声信息，破坏档案总览感 |
| 底部图例（projects-legend）| 整段删除 | 用户明确「脚注内容完全不需要」 |
| Hero 栅格背景 | 保留 | 用户明确勾选 |
| 四角 CAD 角标（Hero + Card）| 保留 | 用户明确勾选 |
| Syne 字体按需加载 | 保留 | 工程蓝图标题字体核心识别符 |
| 暗色模式适配 | 保持 | 所有改动不破坏 `:root.dark` 规则 |
| 是否动 i18n | 不动 | 文案是中文，删 LATEST 引用后剩余文案已足够 |
| ProjectsFilter.svelte | 不动 | 筛选功能无冗余 |

---

## Verification

1. **类型检查**：`pnpm check` 必须通过
   - 重点关注 `ProjectStatus` 类型被删除后，ProjectsPanel 中 `import type { ProjectStatus }` 是否还有引用
2. **代码规范**：`pnpm format` + `pnpm lint` 必须无错
3. **构建验证**：`pnpm build` 必须成功
   - 验证 SSG 仍能生成 13 张卡片
   - 验证生成的 HTML 中不再出现 `PRJ.`、`ACTIVE`、`DEPLOYED`、`ARCHIVED`、`DRAFT`、`LEGEND` 等关键词
4. **本地预览**：`pnpm preview` 后浏览器访问 `/projects/`
   - 验证：① Hero 视觉干净、数据条只剩 3 项；② 卡片顶部无 PRJ/状态徽章；③ 卡片网格桌面端 2 列；④ 暗色模式无视觉错位；⑤ 移动端 1 列；⑥ 筛选功能仍正常
5. **对比截图**：优化前后截一张 `/projects/` 全图，提交对比

---

## 改动文件清单

| # | 路径 | 类型 | 改动量预估 |
| --- | --- | --- | --- |
| 1 | `src/components/ProjectsPanel.astro` | 修改 | 减少 ~120 行（删除状态机、legend、scanline、axis、eyebrow、LATEST） |
| 2 | `src/components/ProjectCard.astro` | 修改 | 减少 ~150 行（删除 topbar、scalebar、状态相关 CSS） |
| 3 | `src/components/ProjectsFilter.svelte` | **不动** | 0 |
| 4 | `src/pages/projects.astro` | **不动** | 0 |
| 5 | `src/utils/content-utils.ts` | **不动** | 0 |
| 6 | `src/layouts/Layout.astro` | **不动** | 0 |
| 7 | `src/i18n/*`、`src/config.ts`、`src/constants/link-presets.ts`、`src/types/config.ts` | **不动** | 0 |

**预计净减：~270 行 CSS + TSX；Hero 与卡片视觉元素从 9 类收敛到 5 类（栅格、角标、H1、副标题、数据条）；卡片顶部分隔线、序号、PRJ、状态、尺寸标注线 5 项装饰全部下线。**
