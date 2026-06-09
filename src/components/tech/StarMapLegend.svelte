<script lang="ts">
import { filterCategory } from "@/stores/tech-store";
import { techStack } from "@/data/tech-stack";
import { TECH_CATEGORY_ORDER, type TechCategory } from "@/types/tech";
import { getCategoryHsl } from "./star-map/constellation-layout";

/**
 * 分类图例
 * - 11 个分类色块 + 节点数
 * - 点击切换 filter（多选模式：空集 = 全部）
 * - 当前选中态有边框高亮
 */

$: counts = (() => {
	const m: Record<string, number> = {};
	for (const t of techStack) m[t.category] = (m[t.category] || 0) + 1;
	return m;
})();

function toggle(cat: TechCategory) {
	filterCategory.update((s) => {
		const ns = new Set(s);
		if (ns.has(cat)) ns.delete(cat);
		else ns.add(cat);
		return ns;
	});
}

function clearAll() {
	filterCategory.set(new Set());
}
</script>

<div class="legend" role="group" aria-label="分类图例">
	<div class="legend__title">分类</div>
	<div class="legend__items">
		{#each TECH_CATEGORY_ORDER as cat (cat)}
			{@const active = $filterCategory.has(cat)}
			<button
				type="button"
				class="legend__item"
				class:legend__item--active={active}
				style="--cat-color: {getCategoryHsl(cat)}"
				on:click={() => toggle(cat)}
				aria-pressed={active}
			>
				<span class="legend__dot" aria-hidden="true"></span>
				<span class="legend__name">{cat}</span>
				<span class="legend__count">{counts[cat] ?? 0}</span>
			</button>
		{/each}
	</div>
	{#if $filterCategory.size > 0}
		<button type="button" class="legend__clear" on:click={clearAll}>
			清除筛选
		</button>
	{/if}
</div>

<style>
	.legend {
		position: absolute;
		top: 14px;
		right: 14px;
		z-index: 10;
		max-width: 220px;
		padding: 0.625rem 0.75rem 0.5rem;
		border-radius: 8px;
		background: oklch(0.1 0.015 var(--hue) / 0.78);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid oklch(0.7 0.02 var(--hue) / 0.18);
		box-shadow: 0 6px 18px -4px rgb(0 0 0 / 0.4);
		font-family: var(--mono, "JetBrains Mono Variable", monospace);
	}

	.legend__title {
		font-size: 0.625rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: oklch(0.7 0.01 var(--hue) / 0.8);
		margin-bottom: 0.4375rem;
	}

	.legend__items {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2px;
	}

	.legend__item {
		display: flex;
		align-items: center;
		gap: 0.4375rem;
		padding: 0.25rem 0.4375rem;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		color: oklch(0.85 0.01 var(--hue) / 0.85);
		cursor: pointer;
		font-family: inherit;
		font-size: 0.6875rem;
		text-align: left;
		transition: all 0.15s ease-out;
	}

	.legend__item:hover {
		background: oklch(0.18 0.02 var(--hue) / 0.6);
		color: oklch(0.95 0.01 var(--hue));
	}

	.legend__item--active {
		background: oklch(0.18 0.02 var(--hue) / 0.7);
		border-color: var(--cat-color);
		color: oklch(0.98 0.01 var(--hue));
		box-shadow: 0 0 8px var(--cat-color);
	}

	.legend__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--cat-color);
		box-shadow: 0 0 6px var(--cat-color);
	}

	.legend__item--active .legend__dot {
		box-shadow: 0 0 10px var(--cat-color), 0 0 2px var(--cat-color);
	}

	.legend__name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.legend__count {
		flex-shrink: 0;
		font-size: 0.5625rem;
		padding: 0 0.3125rem;
		border-radius: 999px;
		background: oklch(0.2 0.02 var(--hue) / 0.5);
		color: oklch(0.75 0.01 var(--hue));
		min-width: 1.4rem;
		text-align: center;
	}

	.legend__clear {
		display: block;
		margin-top: 0.4375rem;
		padding: 0.25rem 0.5rem;
		width: 100%;
		border: 1px solid oklch(0.7 0.05 var(--hue) / 0.25);
		border-radius: 4px;
		background: oklch(0.18 0.02 var(--hue) / 0.4);
		color: oklch(0.85 0.01 var(--hue));
		font-family: inherit;
		font-size: 0.625rem;
		letter-spacing: 0.1em;
		cursor: pointer;
		transition: all 0.15s ease-out;
	}

	.legend__clear:hover {
		background: oklch(0.25 0.04 var(--hue) / 0.6);
		color: oklch(0.95 0.01 var(--hue));
	}

	@media (max-width: 640px) {
		.legend {
			max-width: 160px;
			padding: 0.5rem 0.5rem 0.375rem;
		}
		.legend__title {
			font-size: 0.5625rem;
		}
		.legend__item {
			font-size: 0.625rem;
			padding: 0.2rem 0.3rem;
		}
	}
</style>
