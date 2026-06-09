<script lang="ts">
import {
	filterCategory,
	clearAllFilters,
	resetViewTrigger,
} from "@/stores/tech-store";
import { TECH_CATEGORY_ORDER } from "@/types/tech";

/**
 * 顶栏筛选条
 * - 左：分类筛选（多选，空集=全部）
 * - 右：清除按钮 + 重置视图按钮（通过 store 触发）
 *
 * 已下线：状态筛选（手写/认知/了解三态分级已取消）
 */

function handleResetView() {
	resetViewTrigger.update((n) => n + 1);
}

function toggleCategory(cat: string) {
	filterCategory.update((set) => {
		const next = new Set(set);
		if (next.has(cat as any)) next.delete(cat as any);
		else next.add(cat as any);
		return next;
	});
}
</script>

<section class="tech-filter" aria-label="技术筛选">
	<!-- 分类组 -->
	<div class="tech-filter__group">
		<span class="tech-filter__label" aria-hidden="true">CATEGORY</span>
		<div class="tech-filter__chips">
			{#each TECH_CATEGORY_ORDER as cat (cat)}
				{@const active = $filterCategory.has(cat)}
				<button
					type="button"
					class="tech-filter__chip"
					class:is-active={active}
					on:click={() => toggleCategory(cat)}
					aria-pressed={active}
				>
					{cat}
				</button>
			{/each}
		</div>
	</div>

	<!-- 操作组 -->
	<div class="tech-filter__group tech-filter__group--right">
		<button
			type="button"
			class="tech-filter__action"
			on:click={clearAllFilters}
			aria-label="清除筛选"
		>
			清除
		</button>
		<button
			type="button"
			class="tech-filter__action tech-filter__action--primary"
			on:click={handleResetView}
			aria-label="重置视图"
		>
			⟲ 重置视图
		</button>
	</div>
</section>

<style>
	.tech-filter {
		--mono:
			"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco,
			Consolas, "Liberation Mono", "Courier New", monospace;
		--accent: var(--primary);

		position: relative;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem 1.25rem;
		padding: 0.875rem 1.125rem;
		border-radius: var(--radius-large);
		background: oklch(0.18 0.015 var(--hue) / 0.85);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid oklch(0.5 0.02 var(--hue) / 0.2);
		box-shadow: 0 4px 16px -4px rgb(0 0 0 / 0.35);
		font-family: var(--mono);
		color: oklch(0.92 0.01 var(--hue));
	}

	.tech-filter__group {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.tech-filter__group--right {
		margin-left: auto;
	}

	.tech-filter__label {
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.2em;
		opacity: 0.55;
		user-select: none;
	}

	.tech-filter__chips {
		display: inline-flex;
		gap: 0.3125rem;
		flex-wrap: wrap;
	}

	.tech-filter__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3125rem 0.625rem;
		border-radius: 2px;
		border: 1px solid oklch(0.7 0.02 var(--hue) / 0.2);
		background: transparent;
		color: oklch(0.78 0.01 var(--hue));
		font-family: var(--mono);
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease;
	}

	.tech-filter__chip:hover {
		border-color: var(--accent);
		color: oklch(0.95 0.01 var(--hue));
	}

	.tech-filter__chip.is-active {
		background: var(--accent);
		border-color: var(--accent);
		color: oklch(0.16 0.01 var(--hue));
		font-weight: 700;
	}

	.tech-filter__action {
		display: inline-flex;
		align-items: center;
		gap: 0.3125rem;
		padding: 0.3125rem 0.625rem;
		border-radius: 2px;
		border: 1px solid oklch(0.7 0.02 var(--hue) / 0.2);
		background: transparent;
		color: oklch(0.85 0.01 var(--hue));
		font-family: var(--mono);
		font-size: 0.6875rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.tech-filter__action:hover {
		border-color: var(--accent);
		color: oklch(0.95 0.01 var(--hue));
	}

	.tech-filter__action--primary {
		background: var(--accent);
		border-color: var(--accent);
		color: oklch(0.16 0.01 var(--hue));
	}

	.tech-filter__action--primary:hover {
		filter: brightness(1.1);
	}

	@media (max-width: 768px) {
		.tech-filter {
			padding: 0.75rem;
			gap: 0.5rem 0.75rem;
		}
		.tech-filter__group--right {
			margin-left: 0;
			width: 100%;
			justify-content: space-between;
		}
		.tech-filter__chip {
			font-size: 0.625rem;
			padding: 0.25rem 0.5rem;
		}
	}
</style>
