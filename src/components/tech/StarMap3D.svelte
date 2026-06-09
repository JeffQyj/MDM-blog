<script lang="ts">
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { onDestroy, onMount } from "svelte";

import { techStack } from "@/data/tech-stack";
import {
	filterCategory,
	hoveredTech,
	resetCameraTrigger,
} from "@/stores/tech-store";
import { buildGraph } from "@/utils/tech-utils";
import StarMapLegend from "./StarMapLegend.svelte";
import StarMapTooltip from "./StarMapTooltip.svelte";
import { computeConstellationLayout } from "./star-map/constellation-layout";
import { createConstellationLines } from "./star-map/constellation-lines";
import { setupInteraction } from "./star-map/interaction";
import { createNebula } from "./star-map/nebula";
import { setupPostFX } from "./star-map/post-processing";
import { buildScene, isWebGLAvailable } from "./star-map/scene-builder";
import { createStarField } from "./star-map/starfield";
import { createStarNodes } from "./star-map/star-nodes";

let container: HTMLDivElement;
let labelContainer: HTMLDivElement;
let webglOk = true;
let rafId = 0;
let initialTimer = 0;

// 提前构建图（客户端 + 服务端皆可；buildGraph 纯函数）
const { nodes, edges } = buildGraph(techStack);
const layout = computeConstellationLayout(nodes);

onMount(() => {
	if (!isWebGLAvailable()) {
		webglOk = false;
		return;
	}

	// 1. 场景
	const { scene, camera, renderer } = buildScene(container);

	// 2. 控件
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.08;
	controls.minDistance = 30;
	controls.maxDistance = 200;
	controls.rotateSpeed = 0.6;
	controls.zoomSpeed = 0.8;
	controls.enablePan = true;
	controls.autoRotate = false;

	// 3. 后处理
	const { composer } = setupPostFX({ scene, camera, renderer, container });

	// 4. 背景
	const starField = createStarField();
	const nebula = createNebula();
	scene.add(starField.group);
	scene.add(nebula.group);

	// 5. 节点 + 边
	const nodes3D = createStarNodes(layout);
	const lines3D = createConstellationLines(edges, layout);
	scene.add(nodes3D.group);
	scene.add(lines3D.group);

	// 6. 标签渲染器（CSS2D）
	const labelRenderer = new CSS2DRenderer({ element: labelContainer });
	labelRenderer.setSize(container.clientWidth, container.clientHeight);
	const onLabelResize = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (w && h) labelRenderer.setSize(w, h);
	};
	const ro = new ResizeObserver(onLabelResize);
	ro.observe(container);

	// 7. 交互
	const interaction = setupInteraction({
		camera,
		controls,
		domElement: renderer.domElement,
		nodes: nodes3D.nodes,
		nodeMap: nodes3D.nodeMap,
		instancedMesh: nodes3D.mesh,
		scene,
	});

	// 8. 渲染循环
	const clock = performance.now() / 1000;
	let lastT = clock;
	const tick = () => {
		rafId = requestAnimationFrame(tick);
		const now = performance.now() / 1000;
		const dt = Math.min(0.1, now - lastT);
		lastT = now;
		const t = now - clock;

		nodes3D.update(t, dt);
		lines3D.update(t, dt);
		starField.update(t);
		nebula.update(t);
		interaction.update(dt);
		controls.update();
		composer.render();
		labelRenderer.render(scene, camera);
	};
	tick();

	// 9. 响应 store
	const unsubReset = resetCameraTrigger.subscribe((n) => {
		if (n > 0) {
			interaction.resetCamera();
			// 重置后等动画完成再清零 trigger
			setTimeout(() => resetCameraTrigger.set(0), 100);
		}
	});

	const unsubFilter = filterCategory.subscribe((catSet) => {
		// 简化为：当前选中的分类集合 → 仅高亮这些分类
		if (catSet.size === 0) {
			nodes3D.resetHighlight();
			lines3D.resetHighlight();
		} else {
			const keepIds = new Set(
				layout.filter((n) => catSet.has(n.category)).map((n) => n.id),
			);
			nodes3D.fadeOthers(keepIds);
			// 边：仅保留强关联（不同分类之间也多为 strong，但有部分同分类）
			lines3D.resetHighlight();
		}
	});

	// 10. 响应 hover：更新 store 时高亮节点
	const unsubHover = hoveredTech.subscribe((h) => {
		if (!h) {
			// 恢复 filter 状态
			const catSet = currentFilterSet;
			if (catSet.size === 0) {
				nodes3D.resetHighlight();
				lines3D.resetHighlight();
			} else {
				const keepIds = new Set(
					layout.filter((n) => catSet.has(n.category)).map((n) => n.id),
				);
				nodes3D.fadeOthers(keepIds);
			}
			return;
		}
		const node = layout.find((n) => n.id === h.tech.id);
		if (!node) return;
		// 邻居：与该节点相关的强关联 + 同分类
		const neighborIds = new Set<string>([node.id]);
		for (const e of lines3D.edges) {
			if (e.type !== "strong") continue;
			if (e.source === node.id) neighborIds.add(e.target);
			if (e.target === node.id) neighborIds.add(e.source);
		}
		for (const other of layout) {
			if (other.id !== node.id && other.category === node.category) {
				neighborIds.add(other.id);
			}
		}
		nodes3D.highlight(neighborIds);
		// 边：仅显示与该节点相关的强关联
		const edgeIds = new Set(
			lines3D.edges
				.filter(
					(e) => e.type === "strong" && (e.source === node.id || e.target === node.id),
				)
				.map((e) => e.id),
		);
		lines3D.highlight(edgeIds);
	});

	// 跟踪当前 filter set（hover 取消时使用）
	let currentFilterSet: Set<string> = new Set();
	const unsubFilter2 = filterCategory.subscribe((s) => {
		currentFilterSet = s;
	});

	onDestroy(() => {
		cancelAnimationFrame(rafId);
		ro.disconnect();
		unsubReset();
		unsubFilter();
		unsubFilter2();
		unsubHover();
		controls.dispose();
		interaction.dispose();
		starField.dispose();
		nebula.dispose();
		nodes3D.dispose();
		lines3D.dispose();
		// composer.dispose 会由 scene-builder 内的 renderer.dispose 触发
		renderer.dispose();
		if (renderer.domElement.parentElement) {
			renderer.domElement.parentElement.removeChild(renderer.domElement);
		}
		// CSS2D 容器清理
		if (labelContainer) labelContainer.innerHTML = "";
		clearTimeout(initialTimer);
	});
});
</script>

<div class="star-map" aria-label="3D 神经图谱画布">
	{#if !webglOk}
		<div class="star-map__fallback">
			<div class="star-map__fallback-inner">
				<h2>⚠ 当前浏览器不支持 WebGL</h2>
				<p>3D 星图无法显示，请使用 Chrome / Edge / Firefox 等现代浏览器访问。</p>
			</div>
		</div>
	{/if}

	<div bind:this={container} class="star-map__canvas"></div>
	<div bind:this={labelContainer} class="star-map__labels"></div>

	<StarMapTooltip />
	<StarMapLegend />

	<!-- 操作提示 -->
	<div class="star-map__hint" aria-hidden="true">
		<span>拖拽旋转</span>
		<span class="dot">·</span>
		<span>滚轮缩放</span>
		<span class="dot">·</span>
		<span>悬停查看</span>
		<span class="dot">·</span>
		<span>单击涟漪</span>
		<span class="dot">·</span>
		<span>双击聚焦</span>
		<span class="dot">·</span>
		<span>R 重置</span>
	</div>
</div>

<style>
	.star-map {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 700px;
		/* 真正"深空黑"底色：中心 0.05 → 边缘 0.005 */
		background: radial-gradient(
			ellipse at center,
			oklch(0.05 0.02 270) 0%,
			oklch(0.02 0.01 250) 50%,
			oklch(0.005 0.005 240) 100%
		);
		border-radius: var(--radius-large);
		overflow: hidden;
		border: 1px solid oklch(0.4 0.04 230 / 0.25);
		box-shadow:
			inset 0 0 100px oklch(0.08 0.03 260 / 0.3),
			inset 0 0 200px oklch(0.2 0.06 280 / 0.05);
	}

	.star-map__canvas,
	.star-map__labels {
		position: absolute;
		inset: 0;
	}

	.star-map__labels {
		pointer-events: none;
		z-index: 2;
	}

	.star-map__canvas {
		z-index: 1;
	}

	.star-map__hint {
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

	.star-map__hint .dot {
		opacity: 0.4;
	}

	.star-map__fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.12 0.04 260);
		z-index: 100;
	}

	.star-map__fallback-inner {
		text-align: center;
		padding: 2rem;
		color: oklch(0.9 0.05 var(--hue));
	}

	.star-map__fallback-inner h2 {
		margin: 0 0 0.5rem;
		font-size: 1.25rem;
	}

	.star-map__fallback-inner p {
		margin: 0;
		font-size: 0.875rem;
		opacity: 0.8;
	}

	/* 节点标签默认样式（注入到 CSS2DRenderer 容器中） */
	:global(.star-map__label) {
		color: oklch(0.92 0.04 var(--hue));
		font:
			600 11px/1 "JetBrains Mono Variable", ui-monospace, monospace;
		letter-spacing: 0.04em;
		text-shadow: 0 0 6px rgb(0 0 0 / 0.95);
		padding: 2px 8px;
		border-radius: 3px;
		background: oklch(0.08 0.01 var(--hue) / 0.7);
		border: 1px solid oklch(0.7 0.1 var(--hue) / 0.35);
		white-space: nowrap;
		user-select: none;
		pointer-events: none;
		transform: translateY(-2px);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	@media (max-width: 768px) {
		.star-map {
			min-height: 560px;
		}
		.star-map__hint {
			font-size: 0.5625rem;
			padding: 0.375rem 0.625rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.star-map {
			animation: none;
		}
	}
</style>
