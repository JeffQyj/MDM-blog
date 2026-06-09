<script lang="ts">
import { onMount } from "svelte";

export let independentCount = 0;
export let secondaryCount = 0;
export let totalCount = 0;

type CategoryKey = "ALL" | "独立项目" | "二次开发";
type SortKey = "newest" | "oldest";

let activeCategory: CategoryKey = "ALL";
let sort: SortKey = "newest";

// localStorage 键名
const STORAGE_KEY_CAT = "projects.filter.category";
const STORAGE_KEY_SORT = "projects.filter.sort";

// 可选项
const categoryOptions: { key: CategoryKey; label: string }[] = [
	{ key: "ALL", label: "全部" },
	{ key: "独立项目", label: "独立项目" },
	{ key: "二次开发", label: "二次开发" },
];

const sortOptions: { key: SortKey; label: string }[] = [
	{ key: "newest", label: "最新优先" },
	{ key: "oldest", label: "最早优先" },
];

function getCount(key: CategoryKey): number {
	if (key === "ALL") return totalCount;
	if (key === "独立项目") return independentCount;
	return secondaryCount;
}

function setCategory(key: CategoryKey) {
	activeCategory = key;
	persist();
	applyFilter();
}

function setSort(value: SortKey) {
	sort = value;
	persist();
	applyFilter();
}

function persist() {
	try {
		localStorage.setItem(STORAGE_KEY_CAT, activeCategory);
		localStorage.setItem(STORAGE_KEY_SORT, sort);
	} catch (e) {
		// localStorage 不可用时静默失败
	}
}

function applyFilter() {
	const cards = document.querySelectorAll<HTMLElement>("[data-project-card]");
	if (!cards.length) return;

	// 1) 收集当前按 published 排序的卡片
	const allCards = Array.from(cards);
	const sorted = allCards.slice().sort((a, b) => {
		const pa = Number(a.dataset.published) || 0;
		const pb = Number(b.dataset.published) || 0;
		return sort === "newest" ? pb - pa : pa - pb;
	});

	// 2) 找到父级 grid 容器
	const parent = sorted[0]?.parentElement;
	if (!parent) return;

	// 3) 按当前排序重排 DOM（appendChild 会自动移动元素到末尾）
	sorted.forEach((card) => {
		parent.appendChild(card);
	});

	// 4) 分类过滤：data-category 不匹配的隐藏
	let visibleIndex = 0;
	sorted.forEach((card) => {
		const cat = card.dataset.category || "";
		const match = activeCategory === "ALL" || cat === activeCategory;
		card.style.display = match ? "" : "none";
		if (match) {
			// 重置入场动画延迟
			visibleIndex += 1;
			card.style.animationDelay = `calc(var(--content-delay) + ${visibleIndex * 50}ms)`;
		}
	});

	// 5) 通知空状态
	dispatchEmptyState();
}

function dispatchEmptyState() {
	const visible = Array.from(
		document.querySelectorAll<HTMLElement>("[data-project-card]"),
	).filter((el) => el.style.display !== "none");
	window.dispatchEvent(
		new CustomEvent("projects:filter-changed", {
			detail: { count: visible.length, category: activeCategory, sort },
		}),
	);
}

onMount(() => {
	// 读取持久化状态
	try {
		const savedCat = localStorage.getItem(
			STORAGE_KEY_CAT,
		) as CategoryKey | null;
		const savedSort = localStorage.getItem(STORAGE_KEY_SORT) as SortKey | null;
		if (savedCat && ["ALL", "独立项目", "二次开发"].includes(savedCat)) {
			activeCategory = savedCat;
		}
		if (savedSort && ["newest", "oldest"].includes(savedSort)) {
			sort = savedSort;
		}
	} catch (e) {
		// 忽略
	}

	// 首次应用（DOM 已就绪）
	requestAnimationFrame(applyFilter);
});
</script>

<section
	class="projects-filter"
	aria-label="项目筛选"
>
	<div class="projects-filter__group">
		<span class="projects-filter__label" aria-hidden="true">CATEGORY</span>
		<div class="projects-filter__chips" role="tablist">
			{#each categoryOptions as opt (opt.key)}
				{@const active = activeCategory === opt.key}
				{@const count = getCount(opt.key)}
				<button
					type="button"
					role="tab"
					aria-selected={active}
					class="projects-filter__chip"
					class:is-active={active}
					on:click={() => setCategory(opt.key)}
				>
					<span class="projects-filter__chip-label">{opt.label}</span>
					<span class="projects-filter__chip-count">{count}</span>
				</button>
			{/each}
		</div>
	</div>

	<div class="projects-filter__group projects-filter__group--right">
		<span class="projects-filter__label" aria-hidden="true">SORT</span>
		<div class="projects-filter__sort">
			{#each sortOptions as opt (opt.key)}
				{@const active = sort === opt.key}
				<button
					type="button"
					class="projects-filter__sort-btn"
					class:is-active={active}
					on:click={() => setSort(opt.key)}
					aria-pressed={active}
				>
					<span class="projects-filter__sort-dot" aria-hidden="true"></span>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>
</section>

<style>
	.projects-filter {
		--mono:
			"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco,
			Consolas, "Liberation Mono", "Courier New", monospace;
		--accent: var(--primary);

		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: var(--radius-large);
		background: var(--card-bg);
		box-shadow:
			inset 0 0 0 1px oklch(0.5 0.02 var(--hue) / 0.1),
			0 1px 2px 0 rgb(0 0 0 / 0.04);
	}

	:root.dark .projects-filter {
		box-shadow:
			inset 0 0 0 1px oklch(0.7 0.02 var(--hue) / 0.12),
			0 4px 12px -4px rgb(0 0 0 / 0.4);
	}

	.projects-filter__group {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.projects-filter__group--right {
		margin-left: auto;
	}

	.projects-filter__label {
		font-family: var(--mono);
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		color: oklch(0.55 0.04 var(--hue));
		opacity: 0.7;
		user-select: none;
	}

	:root.dark .projects-filter__label {
		color: oklch(0.7 0.04 var(--hue));
	}

	/* 分类 chip */
	.projects-filter__chips {
		display: inline-flex;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.projects-filter__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4375rem 0.75rem;
		border-radius: 2px;
		border: 1px solid oklch(0.55 0.02 var(--hue) / 0.2);
		background: transparent;
		color: oklch(0.45 0.02 var(--hue));
		font-family: var(--mono);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition:
			background 0.25s ease,
			color 0.25s ease,
			border-color 0.25s ease;
	}

	:root.dark .projects-filter__chip {
		border-color: oklch(0.7 0.02 var(--hue) / 0.25);
		color: oklch(0.78 0.02 var(--hue));
	}

	.projects-filter__chip:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.projects-filter__chip.is-active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--card-bg);
	}

	.projects-filter__chip-count {
		font-size: 0.625rem;
		opacity: 0.75;
		font-weight: 700;
		padding: 0 0.25rem;
		border-radius: 2px;
		background: oklch(0 0 0 / 0.08);
	}

	.projects-filter__chip.is-active .projects-filter__chip-count {
		background: oklch(0 0 0 / 0.18);
	}

	:root.dark .projects-filter__chip-count {
		background: oklch(1 0 0 / 0.1);
	}

	:root.dark .projects-filter__chip.is-active .projects-filter__chip-count {
		background: oklch(1 0 0 / 0.2);
	}

	/* 排序按钮 */
	.projects-filter__sort {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 2px;
		background: oklch(0.95 0.01 var(--hue) / 0.6);
		border: 1px solid oklch(0.55 0.02 var(--hue) / 0.15);
	}

	:root.dark .projects-filter__sort {
		background: oklch(0.18 0.015 var(--hue) / 0.6);
		border-color: oklch(0.7 0.02 var(--hue) / 0.18);
	}

	.projects-filter__sort-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3125rem 0.625rem;
		border-radius: 2px;
		border: none;
		background: transparent;
		color: oklch(0.5 0.02 var(--hue));
		font-family: var(--mono);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		cursor: pointer;
		transition: background 0.25s ease, color 0.25s ease;
	}

	:root.dark .projects-filter__sort-btn {
		color: oklch(0.72 0.02 var(--hue));
	}

	.projects-filter__sort-btn:hover {
		color: var(--accent);
	}

	.projects-filter__sort-btn.is-active {
		background: var(--accent);
		color: var(--card-bg);
	}

	.projects-filter__sort-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: currentColor;
		opacity: 0.6;
	}

	.projects-filter__sort-btn.is-active .projects-filter__sort-dot {
		opacity: 1;
		background: currentColor;
	}

	/* 移动端 */
	@media (max-width: 768px) {
		.projects-filter {
			padding: 0.875rem;
		}
		.projects-filter__group--right {
			margin-left: 0;
			width: 100%;
			justify-content: space-between;
		}
		.projects-filter__chip {
			padding: 0.375rem 0.625rem;
			font-size: 0.6875rem;
		}
	}
</style>
