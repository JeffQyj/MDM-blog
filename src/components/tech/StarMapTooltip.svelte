<script lang="ts">
import { hoveredTech } from "@/stores/tech-store";

/**
 * 节点 hover 时显示的 tooltip
 * - 由 interaction.ts 触发
 * - 位置来自屏幕坐标 (clientX, clientY)
 * - 展示：技术全称 + 分类 + 首次接触 + 个人点评
 */
</script>

{#if $hoveredTech}
	{@const h = $hoveredTech}
	<div
		class="tech-tooltip"
		style="left: {h.x}px; top: {h.y}px;"
		role="tooltip"
		aria-live="polite"
	>
		<div class="tech-tooltip__name">
			<span class="tech-tooltip__dot" aria-hidden="true"></span>
			{h.tech.name}
		</div>
		<div class="tech-tooltip__meta">
			<span class="tech-tooltip__cat">{h.tech.category}</span>
			{#if h.tech.startedAt}
				<span class="tech-tooltip__sep" aria-hidden="true">·</span>
				<span class="tech-tooltip__date">首次接触 {h.tech.startedAt}</span>
			{/if}
		</div>
		{#if h.tech.note}
			<div class="tech-tooltip__note">"{h.tech.note}"</div>
		{/if}
		<div class="tech-tooltip__hint">悬停查看 · 双击聚焦</div>
	</div>
{/if}

<style>
	.tech-tooltip {
		--mono:
			"JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Monaco,
			monospace;

		position: fixed;
		transform: translate(-50%, calc(-100% - 18px));
		pointer-events: none;
		z-index: 1000;

		min-width: 220px;
		max-width: 320px;
		padding: 0.625rem 0.875rem;
		border-radius: 4px;
		background: oklch(0.1 0.015 var(--hue) / 0.96);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid oklch(0.78 0.13 85 / 0.5);
		box-shadow:
			0 8px 28px -6px rgb(0 0 0 / 0.65),
			0 0 0 1px oklch(0.78 0.13 85 / 0.12),
			0 0 22px oklch(0.78 0.13 85 / 0.18);
		color: oklch(0.95 0.01 var(--hue));
		font-family: var(--mono);
		animation: tooltipIn 0.18s ease-out;
	}

	/* 下方小三角 */
	.tech-tooltip::after {
		content: "";
		position: absolute;
		left: 50%;
		bottom: -6px;
		transform: translateX(-50%) rotate(45deg);
		width: 10px;
		height: 10px;
		background: oklch(0.1 0.015 var(--hue) / 0.96);
		border-right: 1px solid oklch(0.78 0.13 85 / 0.5);
		border-bottom: 1px solid oklch(0.78 0.13 85 / 0.5);
	}

	@keyframes tooltipIn {
		from {
			opacity: 0;
			transform: translate(-50%, calc(-100% - 8px));
		}
		to {
			opacity: 1;
			transform: translate(-50%, calc(-100% - 18px));
		}
	}

	.tech-tooltip__name {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		color: oklch(0.98 0.01 var(--hue));
	}

	.tech-tooltip__dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: oklch(0.85 0.13 85);
		box-shadow: 0 0 8px oklch(0.85 0.13 85);
	}

	.tech-tooltip__meta {
		margin-top: 0.3125rem;
		font-size: 0.6875rem;
		color: oklch(0.7 0.01 var(--hue));
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		letter-spacing: 0.04em;
	}

	.tech-tooltip__cat {
		color: oklch(0.85 0.01 var(--hue));
	}

	.tech-tooltip__sep {
		opacity: 0.5;
	}

	.tech-tooltip__date {
		color: oklch(0.75 0.01 var(--hue));
	}

	.tech-tooltip__note {
		margin-top: 0.4375rem;
		padding-top: 0.4375rem;
		border-top: 1px dashed oklch(0.5 0.02 var(--hue) / 0.3);
		font-size: 0.75rem;
		line-height: 1.5;
		color: oklch(0.82 0.01 var(--hue));
		font-style: italic;
	}

	.tech-tooltip__hint {
		margin-top: 0.4375rem;
		font-size: 0.5625rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.45;
	}

	@media (prefers-reduced-motion: reduce) {
		.tech-tooltip {
			animation: none;
		}
	}
</style>
