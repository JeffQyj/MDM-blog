<script lang="ts">
import type { TechCategory, TechEntry } from "@/types/tech";
import { type PostIndex, resolveRelatedPosts } from "@/utils/tech-page-utils";
import type { Action } from "svelte/action";

type Props = {
	category: TechCategory;
	entries: TechEntry[];
	postIndex: PostIndex;
};

let { category, entries, postIndex }: Props = $props();

// 11 分类的统一调色（HSL hue 角度，s/l 固定，参考原 3D 配色微调）
const CATEGORY_HUE: Record<string, number> = {
	"AI 与 Agent": 195,
	编程语言: 38,
	前端框架: 270,
	后端框架: 145,
	数据库: 215,
	中间件: 0,
	云原生: 320,
	工程化与工具: 60,
	"数据科学与 AI": 180,
	系统与底层: 240,
	设计: 18,
};

const catColor = $derived(`hsl(${CATEGORY_HUE[category] ?? 38}, 70%, 60%)`);

// 同分类内排序：有 startedAt 升序，无则按 name
const sortedEntries = $derived(
	[...entries].sort((a, b) => {
		if (a.startedAt && b.startedAt)
			return a.startedAt.localeCompare(b.startedAt);
		if (a.startedAt) return -1;
		if (b.startedAt) return 1;
		return a.name.localeCompare(b.name, "zh-CN");
	}),
);

// 选中状态：null 表示未选中
let activeId = $state<string | null>(null);
let activeAnchor = $state<HTMLElement | null>(null);

const activeNode = $derived(
	sortedEntries.find((e) => e.id === activeId) ?? null,
);

// 弹窗位置
type PopoverPos = {
	x: number;
	y: number;
	placement: "right" | "left" | "bottom";
};
let popoverPos = $state<PopoverPos>({ x: 0, y: 0, placement: "right" });

const POPOVER_WIDTH = 320;
const POPOVER_GAP = 14;
const POPOVER_MARGIN = 8;

// 把弹窗 portal 到 body，避免被祖先 transform/filter 约束 fixed 定位
//（#content-wrapper 的 .onload-animation 动画末态 transform: translateY(0)
//  会创建新的包含块，导致 fixed 弹窗相对 #content-wrapper 而非视口定位）
const portal: Action<HTMLElement> = (node) => {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		},
	};
};

// 计算弹窗位置（避免超出视口）
function calcPosition(anchor: HTMLElement): PopoverPos {
	const rect = anchor.getBoundingClientRect();
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	// 移动端：底部 sheet
	if (vw <= 640) {
		return { x: 0, y: vh, placement: "bottom" };
	}

	const spaceRight = vw - rect.right;
	const spaceLeft = rect.left;
	const preferRight =
		spaceRight >= POPOVER_WIDTH + POPOVER_GAP + POPOVER_MARGIN;
	const preferLeft = spaceLeft >= POPOVER_WIDTH + POPOVER_GAP + POPOVER_MARGIN;

	let placement: "right" | "left" = "right";
	if (!preferRight && preferLeft) placement = "left";

	let x: number;
	if (placement === "right") {
		x = Math.min(rect.right + POPOVER_GAP, vw - POPOVER_WIDTH - POPOVER_MARGIN);
	} else {
		x = Math.max(rect.left - POPOVER_GAP - POPOVER_WIDTH, POPOVER_MARGIN);
	}

	// 垂直位置：以节点垂直中心对齐；上下越界则向内收
	const centerY = rect.top + rect.height / 2;
	const estHalfHeight = 160; // 预估弹窗半高
	let y = centerY - estHalfHeight;
	y = Math.max(
		POPOVER_MARGIN,
		Math.min(y, vh - 2 * estHalfHeight - POPOVER_MARGIN),
	);

	return { x, y, placement };
}

function toggle(entry: TechEntry, ev: MouseEvent) {
	if (activeId === entry.id) {
		close();
		return;
	}
	const btn = ev.currentTarget as HTMLElement;
	activeAnchor = btn;
	activeId = entry.id;
	popoverPos = calcPosition(btn);
}

function close() {
	activeId = null;
	activeAnchor = null;
}

// 点击空白 / Esc 关闭
function handleDocClick(ev: MouseEvent) {
	const target = ev.target as HTMLElement;
	if (!activeId) return;
	// 弹窗内部不关闭
	if (target.closest(".cat-popover")) return;
	// 节点按钮不关闭（onclick 自己处理）
	if (target.closest(".cat-block__node")) return;
	close();
}

function handleKey(ev: KeyboardEvent) {
	if (ev.key === "Escape") close();
}

$effect(() => {
	if (!activeId) return;
	document.addEventListener("click", handleDocClick, true);
	document.addEventListener("keydown", handleKey);
	// 滚动 / 缩放时关闭
	const onScroll = () => close();
	window.addEventListener("scroll", onScroll, true);
	window.addEventListener("resize", onScroll);
	return () => {
		document.removeEventListener("click", handleDocClick, true);
		document.removeEventListener("keydown", handleKey);
		window.removeEventListener("scroll", onScroll, true);
		window.removeEventListener("resize", onScroll);
	};
});

// 解析当前节点的文章链接
const activePostList = $derived(
	activeNode ? resolveRelatedPosts(activeNode.relatedPosts, postIndex) : [],
);
</script>

<section class="cat-block" aria-label={category}>
	<header class="cat-block__head">
		<span class="cat-block__dot" style="--cat-color: {catColor}" aria-hidden="true"></span>
		<h2 class="cat-block__title">{category}</h2>
		<span class="cat-block__count" aria-label="技术数量">{sortedEntries.length}</span>
	</header>

	<ul class="cat-block__grid">
		{#each sortedEntries as e (e.id)}
			<li>
				<button
					type="button"
					class="cat-block__node"
					class:cat-block__node--active={activeId === e.id}
					style="--cat-color: {catColor}"
					onclick={(ev) => toggle(e, ev)}
					aria-expanded={activeId === e.id}
					aria-label="查看 {e.name} 详情"
				>
					{e.name}
				</button>
			</li>
		{/each}
	</ul>
</section>

{#if activeNode}
	<div
		use:portal
		class="cat-popover"
		class:cat-popover--left={popoverPos.placement === "left"}
		class:cat-popover--bottom={popoverPos.placement === "bottom"}
		style="left: {popoverPos.x}px; top: {popoverPos.y}px;"
		role="dialog"
		aria-modal="false"
		aria-label={activeNode.name}
	>
		<header class="cat-popover__head">
			<span class="cat-popover__dot" style="--cat-color: {catColor}" aria-hidden="true"></span>
			<h3 class="cat-popover__name">{activeNode.name}</h3>
			<button
				type="button"
				class="cat-popover__close"
				onclick={close}
				aria-label="关闭"
			>✕</button>
		</header>

		<div class="cat-popover__meta">
			<span class="cat-popover__cat">{activeNode.category}</span>
			{#if activeNode.startedAt}
				<span class="cat-popover__sep" aria-hidden="true">·</span>
				<span class="cat-popover__date">首次接触 {activeNode.startedAt}</span>
			{/if}
		</div>

		{#if activeNode.note}
			<p class="cat-popover__note">"{activeNode.note}"</p>
		{/if}

		{#if activePostList.length > 0}
			<div class="cat-popover__links">
				<div class="cat-popover__links-title">相关文章</div>
				<ul>
					{#each activePostList as p (p.slug)}
						<li>
							<a
								href={p.url}
								target="_blank"
								rel="noopener"
								class="cat-popover__link"
							>
								<span class="cat-popover__link-arrow" aria-hidden="true">↗</span>
								<span class="cat-popover__link-title">{p.title}</span>
								<span class="cat-popover__link-date">{p.published}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{:else}
			<div class="cat-popover__empty">该技术暂未撰写相关文章。</div>
		{/if}
	</div>
{/if}

<style>
	.cat-block {
		--mono:
			"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco,
			Consolas, "Liberation Mono", "Courier New", monospace;
		--cat-color: oklch(0.78 0.13 85);
		--cat-color-soft: oklch(0.78 0.13 85 / 0.18);

		position: relative;
		padding: 1.5rem 1.5rem 1.75rem;
		border-radius: 16px;
		background: oklch(0.985 0.012 var(--hue));
		border: 1px solid oklch(0.85 0.02 var(--hue) / 0.5);
		box-shadow:
			0 1px 0 0 oklch(0.99 0.01 var(--hue)) inset,
			0 4px 14px -6px oklch(0.4 0.02 var(--hue) / 0.15);
		transition: box-shadow 0.3s ease, border-color 0.3s ease;
	}

	.cat-block:hover {
		border-color: oklch(0.78 0.13 85 / 0.4);
		box-shadow:
			0 1px 0 0 oklch(0.99 0.01 var(--hue)) inset,
			0 8px 22px -8px oklch(0.5 0.04 var(--hue) / 0.22);
	}

	:root.dark .cat-block {
		background: oklch(0.18 0.018 var(--hue));
		border-color: oklch(0.32 0.02 var(--hue) / 0.6);
		box-shadow:
			inset 0 1px 0 0 oklch(0.32 0.02 var(--hue) / 0.5),
			0 6px 18px -8px rgb(0 0 0 / 0.5);
	}

	/* 头部 */
	.cat-block__head {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		margin-bottom: 1.125rem;
		padding-bottom: 0.875rem;
		border-bottom: 1px dashed oklch(0.6 0.02 var(--hue) / 0.25);
	}

	:root.dark .cat-block__head {
		border-bottom-color: oklch(0.4 0.02 var(--hue) / 0.5);
	}

	.cat-block__dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--cat-color);
		box-shadow: 0 0 10px var(--cat-color);
	}

	.cat-block__title {
		margin: 0;
		flex: 1;
		font-family: var(--mono);
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: oklch(0.4 0.02 var(--hue));
	}

	:root.dark .cat-block__title {
		color: oklch(0.85 0.01 var(--hue));
	}

	.cat-block__count {
		font-family: var(--mono);
		font-size: 0.6875rem;
		font-weight: 700;
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		background: oklch(0.78 0.13 85 / 0.15);
		color: oklch(0.55 0.1 78);
		min-width: 1.75rem;
		text-align: center;
	}

	:root.dark .cat-block__count {
		background: oklch(0.78 0.13 85 / 0.18);
		color: oklch(0.88 0.08 85);
	}

	/* 节点网格 */
	.cat-block__grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cat-block__node {
		display: inline-flex;
		align-items: center;
		padding: 0.4375rem 0.875rem;
		border-radius: 999px;
		border: 1px solid oklch(0.78 0.13 85 / 0.5);
		background: oklch(0.99 0.01 var(--hue));
		color: oklch(0.4 0.02 var(--hue));
		font-family: var(--mono);
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		user-select: none;
		transition:
			background 0.18s ease-out,
			color 0.18s ease-out,
			border-color 0.18s ease-out,
			transform 0.18s ease-out,
			box-shadow 0.18s ease-out;
	}

	:root.dark .cat-block__node {
		background: oklch(0.22 0.02 var(--hue));
		color: oklch(0.92 0.01 var(--hue));
		border-color: oklch(0.78 0.13 85 / 0.4);
	}

	.cat-block__node:hover {
		background: oklch(0.78 0.13 85 / 0.18);
		border-color: oklch(0.78 0.13 85 / 0.85);
		color: oklch(0.35 0.04 var(--hue));
		transform: translateY(-1px);
		box-shadow: 0 4px 12px -4px oklch(0.78 0.13 85 / 0.5);
	}

	:root.dark .cat-block__node:hover {
		background: oklch(0.78 0.13 85 / 0.22);
		color: oklch(0.98 0.01 var(--hue));
	}

	.cat-block__node--active,
	.cat-block__node--active:hover {
		background: linear-gradient(
			180deg,
			oklch(0.85 0.13 85) 0%,
			oklch(0.7 0.13 78) 100%
		);
		border-color: oklch(0.62 0.13 78);
		color: oklch(0.15 0.02 78);
		box-shadow:
			0 0 0 2px oklch(0.78 0.13 85 / 0.4),
			0 6px 16px -4px oklch(0.5 0.12 78 / 0.55);
	}

	/* 弹窗 */
	.cat-popover {
		--mono:
			"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco,
			Consolas, "Liberation Mono", "Courier New", monospace;

		position: fixed;
		z-index: 100;
		width: 320px;
		max-width: calc(100vw - 16px);
		padding: 1rem 1rem 0.875rem;
		border-radius: 12px;
		background: oklch(0.1 0.015 var(--hue) / 0.96);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid oklch(0.78 0.13 85 / 0.5);
		box-shadow:
			0 16px 40px -8px rgb(0 0 0 / 0.55),
			0 0 0 1px oklch(0.78 0.13 85 / 0.12),
			0 0 22px oklch(0.78 0.13 85 / 0.18);
		color: oklch(0.95 0.01 var(--hue));
		font-family: var(--mono);
		animation: popoverIn 0.18s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes popoverIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* 移动端底部 sheet */
	.cat-popover--bottom {
		left: 8px !important;
		right: 8px;
		width: auto;
		bottom: 8px;
		top: auto !important;
		border-radius: 16px 16px 12px 12px;
		animation: popoverInBottom 0.22s cubic-bezier(0.22, 1, 0.36, 1);
	}

	@keyframes popoverInBottom {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.cat-popover__head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.cat-popover__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--cat-color, oklch(0.78 0.13 85));
		box-shadow: 0 0 8px var(--cat-color, oklch(0.78 0.13 85));
	}

	.cat-popover__name {
		margin: 0;
		flex: 1;
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		color: oklch(0.98 0.01 var(--hue));
	}

	.cat-popover__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 6px;
		border: 1px solid oklch(0.78 0.13 85 / 0.25);
		background: oklch(0.18 0.02 var(--hue) / 0.4);
		color: oklch(0.85 0.01 var(--hue));
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s ease-out;
	}

	.cat-popover__close:hover {
		background: oklch(0.78 0.13 85 / 0.2);
		color: oklch(0.98 0.01 var(--hue));
		border-color: oklch(0.78 0.13 85 / 0.55);
	}

	.cat-popover__meta {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		font-size: 0.6875rem;
		color: oklch(0.7 0.01 var(--hue));
		letter-spacing: 0.04em;
		margin-bottom: 0.5rem;
	}

	.cat-popover__cat {
		color: oklch(0.85 0.01 var(--hue));
	}

	.cat-popover__sep {
		opacity: 0.5;
	}

	.cat-popover__date {
		color: oklch(0.75 0.01 var(--hue));
	}

	.cat-popover__note {
		margin: 0 0 0.75rem;
		padding-top: 0.5rem;
		border-top: 1px dashed oklch(0.5 0.02 var(--hue) / 0.3);
		font-family:
			"Source Han Serif SC", "Noto Serif SC", "Songti SC", "STSong", serif;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: oklch(0.88 0.02 var(--hue));
		font-style: italic;
	}

	.cat-popover__links-title {
		font-size: 0.625rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: oklch(0.78 0.13 85);
		opacity: 0.85;
		margin-bottom: 0.4375rem;
	}

	.cat-popover__links ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.cat-popover__link {
		display: flex;
		align-items: center;
		gap: 0.4375rem;
		padding: 0.4375rem 0.5rem;
		border-radius: 6px;
		background: oklch(0.18 0.02 var(--hue) / 0.5);
		color: oklch(0.9 0.01 var(--hue));
		font-size: 0.75rem;
		text-decoration: none;
		border: 1px solid oklch(0.78 0.13 85 / 0.15);
		transition: all 0.15s ease-out;
	}

	.cat-popover__link:hover {
		background: oklch(0.78 0.13 85 / 0.18);
		border-color: oklch(0.78 0.13 85 / 0.5);
		color: oklch(0.98 0.01 var(--hue));
	}

	.cat-popover__link-arrow {
		flex-shrink: 0;
		color: oklch(0.78 0.13 85);
		font-size: 0.8125rem;
	}

	.cat-popover__link-title {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cat-popover__link-date {
		flex-shrink: 0;
		font-size: 0.625rem;
		color: oklch(0.6 0.01 var(--hue));
		letter-spacing: 0.05em;
	}

	.cat-popover__empty {
		padding: 0.625rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(0.65 0.01 var(--hue));
		background: oklch(0.18 0.02 var(--hue) / 0.4);
		border-radius: 6px;
		border: 1px dashed oklch(0.5 0.02 var(--hue) / 0.3);
		text-align: center;
		font-style: italic;
	}

	@media (max-width: 640px) {
		.cat-block {
			padding: 1.125rem 1rem 1.25rem;
		}

		.cat-block__title {
			font-size: 0.75rem;
			letter-spacing: 0.14em;
		}

		.cat-block__node {
			padding: 0.375rem 0.75rem;
			font-size: 0.75rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cat-popover,
		.cat-popover--bottom,
		.cat-block,
		.cat-block__node {
			animation: none;
			transition: none;
		}
	}
</style>
