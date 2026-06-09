<script lang="ts">
import type { Core, ElementDefinition, EventObject } from "cytoscape";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { onDestroy, onMount } from "svelte";

import { techStack } from "@/data/tech-stack";
import {
	filterCategory,
	hoveredTech,
	resetViewTrigger,
} from "@/stores/tech-store";
import type { CytoscapeEdgeData, CytoscapeNodeData } from "@/types/tech";
import { buildGraph } from "@/utils/tech-utils";

// 注册 fcose 力导向布局（仅一次）
if (!(cytoscape as any).__fcoseRegistered) {
	cytoscape.use(fcose);
	(cytoscape as any).__fcoseRegistered = true;
}

// 在模块顶层构建图数据（静态数据，客户端可用）
const { nodes, edges } = buildGraph(techStack) as {
	nodes: CytoscapeNodeData[];
	edges: CytoscapeEdgeData[];
};

let container: HTMLDivElement;
let cy: Core | null = null;
let layout: any = null;

// 跟踪 hover 中的节点 id，避免重复触发
let hoveredId: string | null = null;

/**
 * 节点样式（椭圆 + 灯芯发光）
 * - shape: ellipse，宽度跟随 label 自适应，高度固定，形成横向"胶囊"（视觉上是圆角椭圆）
 * - 边框亮金色 + 外圈 outline 模拟光晕
 * - 文字加深色描边（text-outline）增强星空背景下的可读性
 */
const NODE_STYLE_BASE = {
	shape: "ellipse",
	"background-color": "oklch(0.18 0.03 var(--hue) / 0.78)",
	"background-opacity": 1,
	"border-color": "oklch(0.88 0.13 88)",
	"border-width": 1.5,
	"border-opacity": 0.95,
	// 外发光圈（cytoscape outline-*，硬边光圈）
	"outline-color": "oklch(0.82 0.14 85 / 0.45)",
	"outline-width": 3,
	"outline-offset": 1,
	"outline-opacity": 1,
	// 文字描边，提升星空背景下的可读性
	"text-outline-color": "oklch(0.06 0.015 var(--hue) / 0.95)",
	"text-outline-width": 2,
	"text-outline-opacity": 1,
	label: "data(name)",
	color: "oklch(0.96 0.05 88)",
	"font-family":
		"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
	"font-size": 11,
	"font-weight": 600,
	"text-valign": "center",
	"text-halign": "center",
	"text-wrap": "wrap",
	"text-max-width": "150px",
	"overlay-opacity": 0,
	// 椭圆尺寸：宽=label+padding（横向自适应），高=固定 22（形成扁椭圆）
	width: "label" as const,
	height: 22,
	padding: "10px",
	"transition-property":
		"background-color, border-color, border-width, border-opacity, outline-color, outline-width, outline-opacity, width, height, opacity",
	"transition-duration": 250,
};

const STYLE = [
	{ selector: "node", style: NODE_STYLE_BASE },
	{
		selector: "edge",
		style: {
			width: 0.5,
			"line-color": "oklch(0.78 0.08 220 / 0.22)",
			"curve-style": "straight",
			opacity: 0.7,
		},
	},
	{
		selector: 'edge[type = "strong"]',
		style: {
			width: 1.4,
			"line-color": "oklch(0.85 0.13 85 / 0.7)",
			opacity: 0.75,
			"curve-style": "bezier",
			"control-point-step-size": 40,
		},
	},
	// === 交互高亮 ===
	{
		selector: ".faded",
		style: { opacity: 0.12 },
	},
	{
		selector: ".highlighted-node",
		style: {
			"border-width": 2.5,
			"border-color": "oklch(0.98 0.13 88)",
			"background-color": "oklch(0.22 0.05 var(--hue) / 0.92)",
			"outline-color": "oklch(0.95 0.15 88 / 0.85)",
			"outline-width": 5,
			"outline-offset": 2,
			"z-index": 999,
		},
	},
	{
		selector: ".highlighted-neighbor",
		style: {
			"border-width": 2,
			"border-color": "oklch(0.9 0.13 88)",
			"background-color": "oklch(0.2 0.04 var(--hue) / 0.85)",
			"outline-color": "oklch(0.88 0.13 88 / 0.6)",
			"outline-width": 4,
		},
	},
	{
		selector: ".highlighted-edge",
		style: {
			"line-color": "oklch(0.92 0.13 85)",
			width: 2.2,
			opacity: 1,
			"z-index": 10,
		},
	},
	{
		selector: ".hidden-by-filter",
		style: { display: "none" },
	},
];

function buildElements(): ElementDefinition[] {
	const nodeEls: ElementDefinition[] = nodes.map((n) => ({
		group: "nodes" as const,
		data: { ...n },
	}));
	const edgeEls: ElementDefinition[] = edges.map((e) => ({
		group: "edges" as const,
		data: { ...e },
	}));
	return [...nodeEls, ...edgeEls];
}

function runLayout() {
	if (!cy) return;
	layout = cy.layout({
		name: "fcose",
		quality: "default",
		animate: true,
		animationDuration: 1200,
		animationEasing: "ease-out",
		randomize: true,
		nodeRepulsion: 12000,
		idealEdgeLength: 110,
		edgeElasticity: 0.45,
		nestingFactor: 0.1,
		gravity: 0.25,
		numIter: 2500,
		tile: true,
		padding: 50,
		packComponents: false,
	} as any);
	layout.run();
}

function applyHighlight(node: any) {
	if (!cy) return;
	const neighborhood = node.closedNeighborhood();
	cy.elements().addClass("faded");
	neighborhood.removeClass("faded");
	node.removeClass("faded").addClass("highlighted-node");
	neighborhood.nodes().not(node).addClass("highlighted-neighbor");
	neighborhood.edges().addClass("highlighted-edge");
}

function clearHighlight() {
	if (!cy) return;
	cy.elements().removeClass(
		"faded highlighted-node highlighted-neighbor highlighted-edge",
	);
}

function applyFilters() {
	if (!cy) return;
	const catSet = $filterCategory;
	cy.batch(() => {
		cy!.nodes().forEach((n) => {
			const matchCat = catSet.size === 0 || catSet.has(n.data("category"));
			if (matchCat) n.removeClass("hidden-by-filter");
			else n.addClass("hidden-by-filter");
		});
		// 与隐藏节点相连的边也隐藏
		cy!.edges().forEach((e) => {
			const s = e.source();
			const t = e.target();
			if (s.hasClass("hidden-by-filter") || t.hasClass("hidden-by-filter")) {
				e.addClass("hidden-by-filter");
			} else {
				e.removeClass("hidden-by-filter");
			}
		});
	});
}

/**
 * 重置视图
 * 暴露给父组件
 */
export function resetView() {
	if (!cy) return;
	cy.animate({
		center: { eles: cy.elements() },
		zoom: 1,
		duration: 600,
		easing: "ease-out",
	} as any);
}

/**
 * 居中并放大某个节点（双击触发）
 */
function focusOnNode(id: string) {
	if (!cy) return;
	const node = cy.getElementById(id);
	if (node.length === 0) return;
	cy.animate({
		center: { eles: node },
		zoom: 1.6,
		duration: 500,
		easing: "ease-out",
	} as any);
}

onMount(() => {
	cy = cytoscape({
		container,
		elements: buildElements(),
		style: STYLE,
		wheelSensitivity: 0.25,
		minZoom: 0.2,
		maxZoom: 4,
		zoomingEnabled: true,
		userZoomingEnabled: true,
		panningEnabled: true,
		userPanningEnabled: true,
		boxSelectionEnabled: false,
		autoungrabify: false,
	});

	// 启动力导向布局
	runLayout();

	// ====== 事件绑定 ======
	cy.on("mouseover", "node", (evt: EventObject) => {
		const node = evt.target;
		hoveredId = node.id();
		const pos = evt.renderedPosition || node.renderedPosition();
		const tech = node.data();
		hoveredTech.set({ x: pos.x, y: pos.y, tech });
		applyHighlight(node);
	});

	cy.on("mouseout", "node", () => {
		hoveredId = null;
		hoveredTech.set(null);
		clearHighlight();
	});

	cy.on("mouseover", "edge", () => {
		container.style.cursor = "pointer";
	});

	cy.on("mouseout", "edge", () => {
		container.style.cursor = "default";
	});

	// 已下线：点击节点打开详情抽屉（统一去掉该交互）

	cy.on("dbltap", "node", (evt: EventObject) => {
		focusOnNode(evt.target.id());
	});

	// 鼠标样式
	cy.on("mouseover", "node", () => {
		container.style.cursor = "pointer";
	});
	cy.on("mouseout", "node", () => {
		container.style.cursor = "default";
	});
});

onDestroy(() => {
	if (cy) {
		cy.destroy();
		cy = null;
	}
});

// 响应 filter 变化
$: if (cy) {
	applyFilters();
}

// 响应重置视图触发器（仅在 trigger > 0 时执行，跳过初始值 0）
$: if (cy && $resetViewTrigger > 0) {
	resetView();
}
</script>

<div bind:this={container} class="tech-canvas" aria-label="技术神经图谱画布">
	<!-- 银河 / 星云层 -->
	<div class="tech-canvas__nebula" aria-hidden="true"></div>
	<!-- Cytoscape 在此渲染 -->
</div>

<div class="tech-canvas__hint" aria-hidden="true">
	<span>滚轮缩放</span>
	<span class="dot">·</span>
	<span>拖拽空白平移</span>
	<span class="dot">·</span>
	<span>悬停查看</span>
	<span class="dot">·</span>
	<span>双击聚焦</span>
</div>

<style>
	.tech-canvas {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 600px;
		/* 星空底色：深空蓝紫 → 边缘近黑 */
		background:
			radial-gradient(
				ellipse at 50% 28%,
				oklch(0.2 0.06 270) 0%,
				oklch(0.12 0.04 245) 45%,
				oklch(0.07 0.025 220) 100%
			);
		overflow: hidden;
		border-radius: var(--radius-large);
		border: 1px solid oklch(0.5 0.06 230 / 0.35);
		box-shadow:
			inset 0 0 100px oklch(0.15 0.06 260 / 0.5),
			inset 0 0 200px oklch(0.4 0.1 280 / 0.12);
	}

	/* 银河/星云层（z-index 最低） */
	.tech-canvas__nebula {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
		background:
			/* 主银河带 */
			radial-gradient(
				ellipse 70% 18% at 50% 38%,
				oklch(0.55 0.18 290 / 0.18) 0%,
				oklch(0.45 0.15 260 / 0.08) 35%,
				transparent 70%
			),
			/* 紫色星云 */
			radial-gradient(
				ellipse 45% 25% at 22% 70%,
				oklch(0.5 0.18 310 / 0.12) 0%,
				transparent 65%
			),
			/* 蓝色星云 */
			radial-gradient(
				ellipse 40% 20% at 80% 75%,
				oklch(0.55 0.12 220 / 0.1) 0%,
				transparent 65%
			);
		filter: blur(30px);
	}

	/* 密集小星点层（错落网格 + 缓慢闪烁） */
	.tech-canvas::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		background-image:
			radial-gradient(0.6px 0.6px at 50% 50%, rgba(255, 255, 255, 0.85) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 25% 25%, rgba(255, 255, 255, 0.7) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 75% 75%, rgba(255, 255, 255, 0.65) 50%, transparent 100%),
			radial-gradient(0.7px 0.7px at 12% 78%, rgba(255, 255, 255, 0.8) 50%, transparent 100%);
		background-size:
			90px 90px,
			120px 120px,
			150px 150px,
			180px 180px;
		background-position:
			0 0,
			45px 30px,
			20px 60px,
			70px 90px;
		opacity: 0.7;
		animation: techTwinkle 4s ease-in-out infinite alternate;
	}

	/* 大星点层（彩色：白/金/蓝紫，带自身光晕） */
	.tech-canvas::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		background-image:
			radial-gradient(1.2px 1.2px at 8% 18%, oklch(0.95 0.1 85) 50%, transparent 100%),
			radial-gradient(1px 1px at 18% 62%, oklch(0.92 0.05 60) 50%, transparent 100%),
			radial-gradient(1.4px 1.4px at 33% 35%, oklch(0.98 0.04 30) 50%, transparent 100%),
			radial-gradient(1px 1px at 52% 12%, oklch(0.9 0.08 220) 50%, transparent 100%),
			radial-gradient(1.2px 1.2px at 68% 28%, oklch(0.95 0.06 200) 50%, transparent 100%),
			radial-gradient(1.5px 1.5px at 82% 52%, oklch(0.96 0.05 80) 50%, transparent 100%),
			radial-gradient(1px 1px at 92% 22%, oklch(0.88 0.12 290) 50%, transparent 100%),
			radial-gradient(1.1px 1.1px at 95% 82%, oklch(0.95 0.04 30) 50%, transparent 100%),
			radial-gradient(1.3px 1.3px at 75% 88%, oklch(0.92 0.08 240) 50%, transparent 100%),
			radial-gradient(0.9px 0.9px at 42% 78%, oklch(0.95 0.1 50) 50%, transparent 100%),
			radial-gradient(1.1px 1.1px at 12% 92%, oklch(0.9 0.06 280) 50%, transparent 100%),
			radial-gradient(1px 1px at 60% 60%, oklch(0.98 0.03 60) 50%, transparent 100%);
		animation: techTwinkle 5.5s ease-in-out infinite alternate;
		animation-delay: 1.8s;
	}

	@keyframes techTwinkle {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 1;
		}
	}

	/* cytoscape 画布在星空层之上 */
	.tech-canvas :global(canvas) {
		position: relative;
		z-index: 2;
	}

	.tech-canvas__hint {
		position: absolute;
		bottom: 14px;
		left: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4375rem 0.875rem;
		border-radius: 999px;
		background: oklch(0.12 0.01 var(--hue) / 0.7);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid oklch(0.7 0.02 var(--hue) / 0.15);
		font-family: var(--mono, "JetBrains Mono Variable", monospace);
		font-size: 0.625rem;
		letter-spacing: 0.08em;
		color: oklch(0.78 0.01 var(--hue) / 0.8);
		z-index: 5;
		pointer-events: none;
		user-select: none;
	}

	.tech-canvas__hint .dot {
		opacity: 0.4;
	}

	@media (max-width: 640px) {
		.tech-canvas {
			min-height: 500px;
		}
		.tech-canvas__hint {
			font-size: 0.5625rem;
			padding: 0.375rem 0.625rem;
			gap: 0.3125rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tech-canvas {
			transition: none;
		}
	}
</style>
