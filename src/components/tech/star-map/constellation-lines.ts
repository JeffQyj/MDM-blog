/**
 * 边管理
 *
 * - 同类（category）边：细蓝灰线，弱关联
 * - 强关联（strong）边：粗金线，附带能量流粒子
 * - 使用两个 LineSegments：所有同类边共享几何，所有强关联边共享几何
 * - 能量流：每条强关联边上的 3 颗小光点沿边往复移动
 */
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	Color,
	Group,
	LineBasicMaterial,
	LineSegments,
	Points,
	PointsMaterial,
} from "three";
import type {
	ConstellationLinesHandle,
	PositionedEdge,
	PositionedNode,
} from "./types";

/** 强关联颜色：暖金（v2：更柔和 0xffd27a → 0xffd9a8） */
const STRONG_COLOR = new Color(0xffd9a8);
/** 弱关联颜色：冷蓝灰 */
const CATEGORY_COLOR = new Color(0x7a8caa);
/** 能量流颜色：偏白偏金 */
const ENERGY_COLOR = new Color(0xfff2c8);
/** 弱关联边不透明度 */
const CATEGORY_OPACITY = 0.28;
/** 强关联边不透明度（v2：0.9 → 0.7，线条变细） */
const STRONG_OPACITY = 0.7;
/** 强关联边每条的光点数 */
const PARTICLES_PER_EDGE = 3;

export function createConstellationLines(
	edges: { id: string; source: string; target: string; type: "category" | "strong" }[],
	nodes: PositionedNode[],
): ConstellationLinesHandle {
	const group = new Group();
	group.name = "constellation-lines";

	// 节点 id → 位置索引
	const idToNode = new Map<string, PositionedNode>();
	for (const n of nodes) idToNode.set(n.id, n);

	// 计算每条边的中点 / 方向 / 长度
	const positionedEdges: PositionedEdge[] = [];
	for (const e of edges) {
		const s = idToNode.get(e.source);
		const t = idToNode.get(e.target);
		if (!s || !t) continue;
		const dir = t.position.clone().sub(s.position);
		const len = dir.length();
		dir.normalize();
		positionedEdges.push({
			id: e.id,
			source: e.source,
			target: e.target,
			type: e.type,
			midpoint: s.position.clone().add(t.position).multiplyScalar(0.5),
			length: len,
			direction: dir,
		});
	}

	const strong = positionedEdges.filter((e) => e.type === "strong");
	const category = positionedEdges.filter((e) => e.type === "category");

	// === 同类弱关联边（LineSegments） ===
	const catGeo = new BufferGeometry();
	const catPositions = new Float32Array(category.length * 2 * 3);
	for (let i = 0; i < category.length; i++) {
		const e = category[i];
		const s = idToNode.get(e.source)!;
		const t = idToNode.get(e.target)!;
		catPositions[i * 6 + 0] = s.position.x;
		catPositions[i * 6 + 1] = s.position.y;
		catPositions[i * 6 + 2] = s.position.z;
		catPositions[i * 6 + 3] = t.position.x;
		catPositions[i * 6 + 4] = t.position.y;
		catPositions[i * 6 + 5] = t.position.z;
	}
	catGeo.setAttribute("position", new BufferAttribute(catPositions, 3));
	catGeo.setDrawRange(0, category.length * 2);

	const catMat = new LineBasicMaterial({
		color: CATEGORY_COLOR,
		transparent: true,
		opacity: CATEGORY_OPACITY,
		depthWrite: false,
	});
	const categoryLines = new LineSegments(catGeo, catMat);
	categoryLines.name = "lines-category";
	group.add(categoryLines);

	// === 强关联边（LineSegments） ===
	const strongGeo = new BufferGeometry();
	const strongPositions = new Float32Array(strong.length * 2 * 3);
	for (let i = 0; i < strong.length; i++) {
		const e = strong[i];
		const s = idToNode.get(e.source)!;
		const t = idToNode.get(e.target)!;
		strongPositions[i * 6 + 0] = s.position.x;
		strongPositions[i * 6 + 1] = s.position.y;
		strongPositions[i * 6 + 2] = s.position.z;
		strongPositions[i * 6 + 3] = t.position.x;
		strongPositions[i * 6 + 4] = t.position.y;
		strongPositions[i * 6 + 5] = t.position.z;
	}
	strongGeo.setAttribute("position", new BufferAttribute(strongPositions, 3));
	strongGeo.setDrawRange(0, strong.length * 2);

	const strongMat = new LineBasicMaterial({
		color: STRONG_COLOR,
		transparent: true,
		opacity: STRONG_OPACITY,
		depthWrite: false,
	});
	const strongLines = new LineSegments(strongGeo, strongMat);
	strongLines.name = "lines-strong";
	group.add(strongLines);

	// === 能量流粒子（Points） ===
	const particleCount = strong.length * PARTICLES_PER_EDGE;
	const particleGeo = new BufferGeometry();
	const particlePos = new Float32Array(particleCount * 3);

	for (let i = 0; i < strong.length; i++) {
		for (let j = 0; j < PARTICLES_PER_EDGE; j++) {
			const idx = i * PARTICLES_PER_EDGE + j;
			// 初始位置先放边起点，update 中刷新
			const s = idToNode.get(strong[i].source)!;
			particlePos[idx * 3 + 0] = s.position.x;
			particlePos[idx * 3 + 1] = s.position.y;
			particlePos[idx * 3 + 2] = s.position.z;
		}
	}
	particleGeo.setAttribute("position", new BufferAttribute(particlePos, 3));
	particleGeo.setDrawRange(0, particleCount);

	const particleMat = new PointsMaterial({
		color: ENERGY_COLOR,
		size: 1.0, // v2：1.6 → 1.0（粒子变小，不喧宾夺主）
		sizeAttenuation: true,
		transparent: true,
		opacity: 0.85, // v2：0.95 → 0.85
		blending: AdditiveBlending,
		depthWrite: false,
	});
	const energyParticles = new Points(particleGeo, particleMat);
	energyParticles.name = "energy-particles";
	group.add(energyParticles);

	// === 状态 ===
	let catScale = 1;
	let catTarget = 1;
	let strongScale = 1;
	let strongTarget = 1;

	const handle: ConstellationLinesHandle = {
		group,
		strongLines,
		categoryLines,
		energyParticles,
		edges: positionedEdges,

		update(t, dt) {
			// 平滑过渡
			const k = Math.min(1, dt * 6);
			catScale += (catTarget - catScale) * k;
			strongScale += (strongTarget - strongScale) * k;
			(catMat as LineBasicMaterial).opacity = CATEGORY_OPACITY * catScale;
			(strongMat as LineBasicMaterial).opacity = STRONG_OPACITY * strongScale;

			// 能量流粒子位置更新
			const posAttr = particleGeo.getAttribute(
				"position",
			) as BufferAttribute;
			for (let i = 0; i < strong.length; i++) {
				const e = strong[i];
				const s = idToNode.get(e.source)!;
				const tn = idToNode.get(e.target)!;
				for (let j = 0; j < PARTICLES_PER_EDGE; j++) {
					const idx = i * PARTICLES_PER_EDGE + j;
					// 错相位：3 颗粒子均匀分布，沿边往复
					const phase = ((t * 0.6 + j / PARTICLES_PER_EDGE) % 1 + 1) % 1;
					const px = s.position.x + (tn.position.x - s.position.x) * phase;
					const py = s.position.y + (tn.position.y - s.position.y) * phase;
					const pz = s.position.z + (tn.position.z - s.position.z) * phase;
					posAttr.setXYZ(idx, px, py, pz);
				}
			}
			posAttr.needsUpdate = true;
		},

		highlight(edgeIds) {
			// 简化：edgeIds 存在 → 强关联完全显示，弱关联隐藏
			// 当前数据中 strong === edgeIds 的子集；非 strong 的隐藏
			catTarget = edgeIds.size > 0 ? 0 : 1;
			strongTarget = 1;
			void edgeIds;
		},

		resetHighlight() {
			catTarget = 1;
			strongTarget = 1;
		},

		dispose() {
			catGeo.dispose();
			catMat.dispose();
			strongGeo.dispose();
			strongMat.dispose();
			particleGeo.dispose();
			particleMat.dispose();
		},
	};

	return handle;
}
