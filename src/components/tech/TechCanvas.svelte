<script lang="ts">
import cytoscape from "cytoscape";
import type { Core, ElementDefinition, EventObject } from "cytoscape";
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
 * 节点样式（金色胶囊）
 * - 全称直接渲染在节点内（去缩写）
 * - 所有节点统一大小与配色（去三态分级）
 */
const NODE_STYLE_BASE = {
	shape: "round-rectangle",
	"background-color": "oklch(0.78 0.13 85 / 0.16)",
	"background-opacity": 1,
	"border-color": "oklch(0.78 0.13 85)",
	"border-width": 1.5,
	"border-opacity": 0.7,
	label: "data(name)",
	color: "oklch(0.95 0.01 var(--hue))",
	"font-family":
		"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
	"font-size": 11,
	"font-weight": 600,
	"text-valign": "center",
	"text-halign": "center",
	"text-wrap": "wrap",
	"text-max-width": "150px",
	"text-outline-width": 0,
	"overlay-opacity": 0,
	// 节点尺寸：宽度随 label 自适应、高度固定为 30，留 8px 内边距
	width: "label" as const,
	height: 30,
	"padding": "8px",
	"transition-property":
		"background-color, border-color, border-width, border-opacity, width, height, opacity",
	"transition-duration": 200,
};

const STYLE = [
	{ selector: "node", style: NODE_STYLE_BASE },
	{
		selector: "edge",
		style: {
			width: 0.5,
			"line-color": "rgba(255,255,255,0.15)",
			"curve-style": "straight",
			opacity: 0.6,
		},
	},
	{
		selector: 'edge[type = "strong"]',
		style: {
			width: 1.5,
			"line-color": "oklch(0.78 0.13 85)",
			opacity: 0.55,
			"curve-style": "bezier",
			"control-point-step-size": 40,
		},
	},
	// === 交互高亮 ===
	{
		selector: ".faded",
		style: { opacity: 0.1 },
	},
	{
		selector: ".highlighted-node",
		style: {
			"border-width": 2.5,
			"border-color": "oklch(0.95 0.13 88)",
			"background-color": "oklch(0.78 0.13 85 / 0.32)",
			"z-index": 999,
		},
	},
	{
		selector: ".highlighted-neighbor",
		style: {
			"border-width": 2,
			"border-color": "oklch(0.85 0.13 88)",
			"background-color": "oklch(0.78 0.13 85 / 0.24)",
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
		background:
			radial-gradient(
				ellipse at center,
				oklch(0.22 0.025 var(--hue) / 0.5) 0%,
				oklch(0.14 0.015 var(--hue)) 70%,
				oklch(0.1 0.01 var(--hue)) 100%
			);
		overflow: hidden;
		border-radius: var(--radius-large);
		border: 1px solid oklch(0.5 0.02 var(--hue) / 0.2);
	}

	/* 极淡的星点装饰（性能友好：纯 CSS，零 JS） */
	.tech-canvas::before {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image:
			radial-gradient(0.5px 0.5px at 12% 18%, rgba(255, 255, 255, 0.6) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 27% 47%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 41% 73%, rgba(255, 255, 255, 0.7) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 58% 21%, oklch(0.85 0.1 85) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 73% 64%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 88% 38%, rgba(255, 255, 255, 0.6) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 5% 82%, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
			radial-gradient(0.5px 0.5px at 94% 88%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
		background-size:
			300px 300px,
			280px 280px,
			350px 350px,
			320px 320px,
			290px 290px,
			310px 310px,
			270px 270px,
			330px 330px;
		opacity: 0.65;
		z-index: 0;
	}

	.tech-canvas :global(canvas) {
		position: relative;
		z-index: 1;
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
