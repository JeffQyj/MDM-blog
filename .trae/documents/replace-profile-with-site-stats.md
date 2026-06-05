# 左侧示例数据 Widget（独立新增，静态+动态混合）

## Summary

在 `MainGridLayout.astro` 中**新增**一个绝对定位的左侧 widget（**不替换**任何现有组件，不改动 SideBar / Profile / Categories / Tags）。结构完全**镜像**右侧 TOC 的实现思路。展示 4 条数据，**采用静态/动态混合方案**：

| # | 内容 | 计算时机 | 理由 |
|---|------|----------|------|
| 1 | 本站累计输出内容已达 **xxx** 字数 | **静态**（build 时聚合） | 文章总字数不常变 |
| 2 | 浏览本站所有文章所需时长大约 **xxx** 分钟 | **静态**（build 时聚合） | 阅读总时长不常变 |
| 3 | 博主玩地球 online 已经 **xxx** 天了 | **动态**（客户端 JS，每分钟刷新） | 让天数「活」起来，体验更好 |
| 4 | 博主的编程生涯已经 **xxx** 天了 | **动态**（客户端 JS，每分钟刷新） | 同上 |

---

## Current State Analysis

### 关键发现

1. **每篇文章已有 reading-time 数据**：`src/plugins/remark-reading-time.mjs` 通过 `reading-time` 库为每篇文章计算 `words` 和 `minutes` 并写入 `data.astro.frontmatter`。
   - `PostCard.astro` L70-75 通过 `entry.render().remarkPluginFrontmatter` 读取
   - 但 `getCollection('posts')` 返回的 `entry.data` **不包含** `words` / `minutes`（这些仅在 `render()` 之后才能拿到）
   - 因此聚合总字数/总阅读时长**需要重新计算**（避免对每篇都调用 `render()` 影响构建性能）

2. **`reading-time` 库已安装**：`remark-reading-time.mjs` L3 引用了 `reading-time`，可直接在 `content-utils.ts` 复用

3. **数据计算方案**：在 `content-utils.ts` 新增 `getTotalReadingStats()`，对每篇 `entry.body` 走一遍 `reading-time`，汇总出 `totalWords` 和 `totalMinutes`

4. **日期差计算**：用 `(Date.now() - new Date(date)) / 86_400_000`，向下取整

5. **右侧 TOC 的实现模式**（`MainGridLayout.astro` L106-124）：

   ```text
   <div class="absolute w-full z-0 hidden 2xl:block">                  ← 外层：≥ 2xl 才显示
       <div class="relative max-w-[var(--page-width)] mx-auto">
           <div id="toc-wrapper" class="hidden lg:block absolute top-0 -right-[var(--toc-width)] w-[var(--toc-width)]">
               <div id="toc-inner-wrapper" class="fixed top-14 w-[var(--toc-width)] h-[calc(100vh_-_20rem)] overflow-y-scroll overflow-x-hidden hide-scrollbar">
                   <div id="toc" class="w-full h-full transition-swup-fade">
                       <TOC headings={headings} />
                   </div>
               </div>
           </div>
       </div>
   </div>
   ```

6. **样式复用点**：`--toc-badge-bg` / `--toc-btn-hover` / `--toc-btn-active` / `.text-50` / `.text-30` / `.card-base` / `.hide-scrollbar` / `--toc-width`（全部已存在）

---

## Proposed Changes

### 1. 新增文件 `src/components/widget/LeftStats.astro`

**目的**：渲染 4 条预计算数据，仿 TOC 样式。

**结构**：

```text
┌── card-base ─────────────────────────────┐
│  站点数据                                  │
├──────────────────────────────────────────┤
│  [1] 本站累计输出内容已达 9.2 万 字数       │
│  [2] 浏览本站所有文章所需时长大约 1234 分钟  │
│  [3] 博主玩地球 online 已经 8288 天了      │
│  [4] 博主的编程生涯已经 1345 天了           │
│  (max-h + 滚动)                            │
└──────────────────────────────────────────┘
```

**实现要点**：

- **不**包 `WidgetLayout`（避免出现「折叠标题」样式）
- 直接用 `card-base` 容器 + 列表项使用 TOC 样式（编号徽章 + 圆角悬停）
- 列表项模板（与 `TOC.astro` L36-57 一致，但全部为 1 级、无锚点）：
  > 因 `label` 包含 HTML 标签（动态天数的 `<span>`），需用 `set:html` 渲染（label 来源是受信任的组件内部字符串，安全可控）

  ```astro
  <div class="px-2 flex gap-2 relative transition w-full min-h-9 rounded-xl
              hover:bg-[var(--toc-btn-hover)] active:bg-[var(--toc-btn-active)] py-2">
      <div class="transition w-5 h-5 shrink-0 rounded-lg text-xs flex items-center justify-center font-bold
                  bg-[var(--toc-badge-bg)] text-[var(--btn-content)]">
          {idx + 1}
      </div>
      <div class="transition text-sm text-50" set:html={item.label}></div>
  </div>
  ```

- 顶部小标题：

  ```astro
  <div class="font-bold text-lg text-neutral-900 dark:text-neutral-100 relative ml-8 mt-3 mb-2
              before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
              before:absolute before:left-[-16px] before:top-[5.5px]">
      站点数据
  </div>
  ```

**数据来源**（frontmatter 中 `await`）：

```typescript
import { siteConfig } from "../../config";
import { getTotalReadingStats } from "../../utils/content-utils";

// 静态部分：build 时计算一次
const { totalWords, totalMinutes } = await getTotalReadingStats();

// 动态部分：仅在 frontmatter 中给出 SSR fallback 初值，客户端 JS 接管
const birthdayISO = siteConfig.leftStats.birthday;          // "2003-08-27"
const codingStartISO = siteConfig.leftStats.codingStart;    // "2022-09-18"

const items: { label: string; dynamic?: "days-alive" | "days-coding" }[] = [
    { label: `本站累计输出内容已达 ${totalWords.toLocaleString()} 字数` },
    { label: `浏览本站所有文章所需时长大约 ${totalMinutes.toLocaleString()} 分钟` },
    { label: `博主玩地球 online 已经 <span id="days-alive" data-birthday="${birthdayISO}">…</span> 天了`, dynamic: "days-alive" },
    { label: `博主的编程生涯已经 <span id="days-coding" data-coding-start="${codingStartISO}">…</span> 天了`, dynamic: "days-coding" },
];
```

**动态天数渲染 + 客户端 JS**（写在 `LeftStats.astro` 末尾的 `<script>` 块）：

```astro
<script>
    function bindDaysSpan(id: string, isoDate: string) {
        const el = document.getElementById(id);
        if (!el) return;
        const start = new Date(isoDate).getTime();
        const update = () => {
            el.textContent = Math.floor((Date.now() - start) / 86_400_000).toLocaleString();
        };
        update();
        setInterval(update, 60_000);  // 每分钟刷新一次
    }

    const aliveEl = document.getElementById("days-alive");
    if (aliveEl) bindDaysSpan("days-alive", aliveEl.dataset.birthday!);
    const codingEl = document.getElementById("days-coding");
    if (codingEl) bindDaysSpan("days-coding", codingEl.dataset.codingStart!);
</script>
```

**关键设计点**：

- **SSR fallback**：`<span id="days-alive">…</span>` 中的 `…` 是 build 时计算的 fallback（用户首次访问 / JS 未加载时显示）
- **数据透传**：通过 `data-birthday` / `data-coding-start` 把日期传给客户端，无需硬编码到 JS
- **Swup 兼容**：Swup 替换 `main` + `#toc`，`LeftStats` 在 `#left-stats` 中**不在** swup 容器内；但保险起见，将 `bindDaysSpan` 在 `DOMContentLoaded` 后调用一次即可
- **定时刷新**：60s 一次（用户感知的「分钟级」），避免过于频繁的 DOM 更新
- **`set:html` 指令**：因为 `items` 数组中的 label 包含 `<span>` 标签，需在模板中使用 `set:html={item.label}` 渲染（**仅限受信任字符串**）

### 2. 修改 `src/utils/content-utils.ts`

**新增导出函数**（**不**动现有 3 个函数）：

> ⚠️ **性能风险**：若不优化，`getTotalReadingStats()` 会在**每一页**构建时被调用一次（因 `LeftStats` 在 `MainGridLayout` 中，被所有页面共用），即 90+ 页 × 90+ 篇文章 × `reading-time` 计算 ≈ 8000+ 次重复计算，严重拖慢 build。
>
> **优化方案**：模块级 Promise 缓存，确保整个 build 进程内**只计算一次**。

```typescript
import getReadingTime from "reading-time";

function stripMarkdown(md: string): string {
    return (md || "")
        .replace(/```[\s\S]*?```/g, " ")      // code blocks
        .replace(/`[^`]*`/g, " ")              // inline code
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")  // links/images
        .replace(/[#>*_~|\-]/g, " ")            // markdown syntax
        .replace(/\s+/g, " ")
        .trim();
}

// 模块级缓存：整个 build 进程内只计算一次
let cachedTotalStats: Promise<{ totalWords: number; totalMinutes: number }> | null = null;

export function getTotalReadingStats(): Promise<{
    totalWords: number;
    totalMinutes: number;
}> {
    if (cachedTotalStats) return cachedTotalStats;

    cachedTotalStats = (async () => {
        const allPosts = await getCollection("posts", ({ data }) =>
            import.meta.env.PROD ? data.draft !== true : true
        );
        let totalWords = 0;
        let totalMinutes = 0;
        for (const p of allPosts) {
            const text = stripMarkdown(p.body || "");
            const rt = getReadingTime(text);
            totalWords += rt.words;
            totalMinutes += Math.max(1, Math.round(rt.minutes));
        }
        return { totalWords, totalMinutes };
    })();

    return cachedTotalStats;
}
```

**性能对比**：

| 方案 | 调用次数 | 预计耗时（90 篇文章） |
|------|----------|----------------------|
| 不优化 | 90+ 页 × 90+ 篇 = ~8000 次 reading-time | 数秒 ~ 数十秒 |
| **模块级缓存（采用）** | **1 次** reading-time 聚合 | **< 1 秒** |
| 写入 JSON 文件 + dev/build 分别处理 | 0 次运行时计算 | < 0.1 秒 + 1 次 IO |

**额外优化点（已包含在方案中）**：

1. ✅ **Promise 缓存**：避免重复 IO + 计算
2. ✅ **跳过草稿**：与 `getSortedPosts` 行为一致，减少工作量
3. ✅ **复用 `reading-time` 库**：与 `remark-reading-time.mjs` 同一份代码，结果完全一致，无需双轨
4. ✅ **不在 LeftStats 内部 await**：调用方拿到的是 cached Promise，重复 await 也是同一份数据

**未采用、但可考虑的更激进方案**（如未来文章数 >> 1000 可启用）：

- **方案 X**：build 期通过 `astro:integration` 在 `astro:build:start` 钩子中跑一次，写入 `src/data/site-stats.json`，运行时直接读 JSON
- **方案 Y**：使用 `experimental.contentCollectionCache` 缓存 `getCollection` 结果
- **方案 Z**：单独写一个 `scripts/compute-stats.mjs`，CI 中先跑再 build

**当前规模（90+ 篇文章）下，模块级 Promise 缓存已是性能与复杂度的最佳平衡点。**

### 3. 修改 `src/config.ts`

在 `siteConfig` 中新增 `leftStats` 字段：

```typescript
export const siteConfig: SiteConfig = {
    // ... 现有字段 ...
    leftStats: {
        enable: true,
        birthday: "2003-08-27",
        codingStart: "2022-09-18",
    },
};
```

### 4. 修改 `src/types/config.ts`

在 `SiteConfig` 接口中追加：

```typescript
leftStats?: {
    enable: boolean;
    birthday: string;   // ISO 字符串：YYYY-MM-DD
    codingStart: string; // ISO 字符串：YYYY-MM-DD
};
```

### 5. 修改 `src/layouts/MainGridLayout.astro`

**仅在** 现有 TOC 块**之后**新增一个对称的左侧 widget 块，**不动** `SideBar` / `Profile` / `Categories` / `Tags` / `main` / grid / 任何 class / id。

**修改位置**：`MainGridLayout.astro` L106-124（TOC 块所在的 `<div class="absolute w-full z-0 hidden 2xl:block">` 之后）。

**新增代码**（与 TOC 完全对称）：

```astro
<!-- Left stats mirror the right TOC -->
<div class="absolute w-full z-0 hidden 2xl:block">
    <div class="relative max-w-[var(--page-width)] mx-auto">
        {siteConfig.leftStats?.enable && (
            <div id="left-stats-wrapper" class:list={["hidden lg:block transition absolute top-0 -left-[var(--toc-width)] w-[var(--toc-width)] items-center",
                {"toc-hide": siteConfig.banner.enable}]}
            >
                <div id="left-stats-inner-wrapper" class="fixed top-14 w-[var(--toc-width)] h-[calc(100vh_-_20rem)] overflow-y-scroll overflow-x-hidden hide-scrollbar">
                    <div id="left-stats" class="w-full h-full transition-swup-fade card-base p-3">
                        <LeftStats></LeftStats>
                    </div>
                </div>
            </div>
        )}
    </div>
</div>
```

**新增 import**：

```typescript
import LeftStats from "../components/widget/LeftStats.astro";
```

### 6. 复用现有样式（**不新增 CSS**）

- `.card-base`：卡片外观
- `--toc-badge-bg` / `--toc-btn-hover` / `--toc-btn-active`：颜色
- `.text-50` / `.text-30`：文字色阶
- `.hide-scrollbar`：隐藏滚动条
- `--toc-width`：宽度变量

---

## Assumptions & Decisions

| 假设 / 决策 | 理由 |
|-------------|------|
| **新增**而非替换 | 用户明确「直接在红框区域创建一个新的组件」「其他内容都不要动」 |
| **完全镜像**右侧 TOC 的 `hidden 2xl:block` / `hidden lg:block` 断点 | 保持左右视觉对称；窄屏自动隐藏 |
| 位置：`absolute -left-[var(--toc-width)]` | 与右侧 `-right-[var(--toc-width)]` 对称 |
| 滚动容器：`h-[calc(100vh_-_20rem)] overflow-y-scroll` | 与右侧 TOC 完全一致 |
| 滚动条隐藏 | 与右侧 TOC 一致 |
| 顶部**带**小标题「站点数据」 | 与右侧 TOC 视觉权重平衡 |
| 4 条数据 = 2 静态 + 2 动态（混合方案） | 总字数/总分钟数 build 期算一次即可；天数「活」起来体验更好，客户端 JS 接管 |
| 动态天数用 `<span id="..." data-iso="...">` + 客户端 JS | SSR fallback 友好，JS 失败时显示 fallback 值；数据通过 `data-*` 透传 |
| 客户端 JS 60s 刷新一次 | 用户感知的「分钟级」精度；不增加 CPU 开销 |
| 总字数 / 总分钟数 build 时聚合 + 模块级 Promise 缓存 | 整个 build 内仅计算 1 次（详见 §2） |
| `getTotalReadingStats` 改为**同步返回 Promise**（非 async） | 避免并发竞态；调用方 `await` 与缓存 Promise 行为一致 |
| `label` 用 `set:html` 渲染 | 因含 `<span>` 标签；来源是组件内部字符串，安全可控 |
| 生日 / 编程开始日期放在 `siteConfig.leftStats` | 仅日期是配置项，数值全部自动算 |
| 总开关 `siteConfig.leftStats.enable = false` | 关闭时仅左侧 widget 消失，**不影响**主布局和右侧 TOC |
| **不**修改 `Sidebar.astro` / `Profile.astro` / `Categories.astro` / `Tags.astro` | 用户明确「其他内容都不要动」 |
| **不**修改 grid 模板列宽 | 仅在原绝对定位层新增，与栅格无关 |
| 跳过草稿（与 `getSortedPosts` 行为一致） | 生产环境不展示 draft |

---

## Verification Steps

1. **类型检查**：`pnpm check`，确保新增字段类型正确。
2. **代码格式**：`pnpm format`（Biome 自动格式化）。
3. **Lint**：`pnpm lint`，确保无 Biome 报错。
4. **开发预览**：`pnpm dev`：
   - 访问首页（≥ 2xl 屏宽）：左侧应出现「站点数据」卡片，4 行数据；右侧**不**显示 TOC（首页无 headings）。
   - 访问文章详情页（≥ 2xl）：左侧 widget 仍在；右侧 TOC 显示文章目录。
   - 调整浏览器至 < 2xl：左右两 widget 都应隐藏，主内容布局**保持不变**。
5. **数据准确性**：
   - 对比左侧 widget 显示的总字数 vs 所有 PostCard 的 `words` 之和（应一致或极接近，差异源于 `body` 提取方式）。
   - 对比总分钟数 vs 所有 PostCard 的 `minutes` 之和（同上）。
6. **动态天数验证**：
   - 浏览器中观察第 3 / 第 4 行的 `<span id="days-alive">` / `<span id="days-coding">` 的值。
   - 手动用 DevTools `Date.now()` 计算：(now - 2003-08-27) / 86400000 向下取整，应与显示一致。
   - 等候 60s+ 后再次访问，验证 `setInterval` 触发刷新。
   - 关闭 JS（DevTools 禁用 JavaScript），刷新页面，应显示 SSR fallback 值。
7. **视觉对比**：与右侧 TOC 卡片宽度、徽章圆角、颜色、hover 态、行高、间距一致。
8. **回退验证**：将 `siteConfig.leftStats.enable = false`，确认左侧 widget 消失，**主布局和右侧 TOC 不受影响**。
9. **构建**：`pnpm build`，确保 Pagefind 索引与构建无报错。
10. **性能验证**（可选）：
    - 注释掉 `cachedTotalStats` 缓存，临时跑一次 `pnpm build`，记录耗时 `T_naive`
    - 恢复缓存，再跑一次 `pnpm build`，记录耗时 `T_optimized`
    - 预期 `T_optimized - T_naive` 在 **2~10 秒**量级（视机器性能）
    - 90+ 篇文章规模下，构建总耗时增量 < 1 秒

---

## Out of Scope

- 数字递增动画（Svelte 组件）
- 用户手动添加/编辑条目
- 移动端（< 2xl）样式优化
- 修改 `Sidebar.astro` / `Profile.astro` / `Categories.astro` / `Tags.astro`
- 修改 `MainGridLayout.astro` 的 grid 列宽
- 修改 `content/config.ts` 的 schema
