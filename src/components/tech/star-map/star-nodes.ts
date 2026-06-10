/**
 * 节点管理（v2：shader 复合形态）
 *
 * 关键改进：
 * - 单 InstancedMesh + 自定义 ShaderMaterial 渲染「核心球体 + 十字芒 + 圆形光晕」复合形态
 * - 节点本体尺寸从 1.3 放大到 2.0（更醒目）
 * - 取消 POST_SIZE_BONUS（所有技术节点同级）
 * - 光晕从独立的 6× 球体改为 shader 内 1.8× 的圆形光晕
 * - 十字芒（4 角光芒）让节点具有"恒星"质感
 * - per-instance color 通过 instanceColor 传递分类色
 *
 * - 入场动画：从中心向目标位置缓动（1.4s，easeOutCubic）
 * - 持续动画：尺寸 ±3% 慢呼吸 + 缓慢自转
 * - 标签：CSS2DObject（轻量 DOM overlay，名称浮动在节点上方）
 */
import {
	Color,
	DynamicDrawUsage,
	Group,
	IcosahedronGeometry,
	InstancedMesh,
	Object3D,
	ShaderMaterial,
	Vector3,
} from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type {
	PositionedNode,
	PositionedNodeMap,
	StarNodesHandle,
} from "./types";

const INTRO_DURATION = 1.4;
const VERT = /* glsl */ `
attribute vec3 instanceColor;
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

void main() {
  vColor = instanceColor;
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;
uniform float uHighlight;
uniform float uTime;
uniform float uIntensity;

void main() {
  vec2 dir = vUv - vec2(0.5);
  float dist = length(dir);

  // 1) 核心球体：基于 Fresnel（边缘亮）
  float ndotv = max(dot(vNormal, vViewDir), 0.0);
  float fresnel = pow(1.0 - ndotv, 2.0);
  float core = mix(0.55, 1.4, fresnel);

  // 2) 十字芒（4 角光芒）
  float cross = 0.0;
  // 横向芒
  cross += exp(-abs(dir.y) * 90.0) * exp(-abs(dir.x) * 7.0) * 1.4;
  // 纵向芒
  cross += exp(-abs(dir.x) * 90.0) * exp(-abs(dir.y) * 7.0) * 1.4;
  // 对角芒（弱）
  cross += exp(-abs(dir.x + dir.y) * 70.0) * exp(-abs(dir.x - dir.y) * 10.0) * 0.35;
  cross += exp(-abs(dir.x - dir.y) * 70.0) * exp(-abs(dir.x + dir.y) * 10.0) * 0.35;

  // 3) 圆形光晕：1.8× 收敛
  float halo = exp(-dist * 9.0) * 0.55;

  // 4) 整体强度合成
  float intensity = (core + cross * 0.85 + halo) * uIntensity;
  // 高亮 ×2.2
  intensity *= 1.0 + uHighlight * 1.2;

  gl_FragColor = vec4(vColor * intensity, 1.0);
}
`;

export function createStarNodes(nodes: PositionedNode[]): StarNodesHandle {
	const group = new Group();
	group.name = "star-nodes";

	// === 节点本体（单 InstancedMesh + ShaderMaterial） ===
	const nodeGeo = new IcosahedronGeometry(1, 1);
	const nodeMat = new ShaderMaterial({
		vertexShader: VERT,
		fragmentShader: FRAG,
		uniforms: {
			uHighlight: { value: 0 },
			uTime: { value: 0 },
			uIntensity: { value: 1 },
		},
		transparent: false,
		depthWrite: true,
	});
	const mesh = new InstancedMesh(nodeGeo, nodeMat, nodes.length);
	mesh.name = "star-nodes-mesh";
	mesh.instanceMatrix.setUsage(DynamicDrawUsage);

	// 写入每实例颜色（per-instance color attribute）
	const tmpColor = new Color();
	for (let i = 0; i < nodes.length; i++) {
		tmpColor.copy(nodes[i].color);
		mesh.setColorAt(i, tmpColor);
	}
	mesh.instanceColor!.needsUpdate = true;

	// === 运行时数据：每个节点缓存 startPos / phase ===
	const runtimes: NodeRuntime[] = nodes.map((n, i) => {
		// 入场起点：分类中心 × 0.05 + 小幅抖动
		const startPos = n.clusterCenter.clone().multiplyScalar(0.05);
		startPos.x += (Math.random() - 0.5) * 4;
		startPos.y += (Math.random() - 0.5) * 4;
		startPos.z += (Math.random() - 0.5) * 4;
		return {
			node: n,
			startPos,
			phase: i * 0.37,
		};
	});

	// === 标签（CSS2D） ===
	const labelRenderer: CSS2DObject[] = [];
	const nodeMap: PositionedNodeMap = new Map();
	const tmpObj = new Object3D();

	for (const r of runtimes) {
		nodeMap.set(r.node.id, r.node);
		const label = makeLabel(r.node);
		label.position.copy(r.startPos);
		group.add(label);
		labelRenderer.push(label);
	}

	group.add(mesh);

	// === 高亮状态 ===
	let highlighted = new Set<string>();
	let globalFade = 1;
	let globalFadeTarget = 1;
	let globalOpacity = 1;
	let globalOpacityTarget = 1;
	let highlightUniform = 0; // 0~1 平滑
	let highlightTarget = 0;

	const handle: StarNodesHandle = {
		group,
		mesh,
		glowMesh: mesh, // 兼容旧接口：单 mesh
		labelRenderer,
		nodes,
		nodeMap,

		update(t, dt) {
			// 平滑过渡 fade / 高亮 uniform
			const k = Math.min(1, dt * 6);
			globalFade += (globalFadeTarget - globalFade) * k;
			globalOpacity += (globalOpacityTarget - globalOpacity) * k;
			highlightUniform += (highlightTarget - highlightUniform) * k;
			nodeMat.uniforms.uIntensity.value = globalOpacity;
			nodeMat.uniforms.uHighlight.value = highlightUniform;
			nodeMat.uniforms.uTime.value = t;

			// 入场进度 0 → 1
			const introT = Math.min(1, t / INTRO_DURATION);
			const eased = easeOutCubic(introT);
			const scaleEase = easeOutBack(eased);

			for (let i = 0; i < runtimes.length; i++) {
				const r = runtimes[i];
				const n = r.node;
				const isHi = highlighted.has(n.id);

				// 当前帧位置：起点 → 目标，easeOutCubic
				const cur = new Vector3().lerpVectors(r.startPos, n.position, eased);

				// 呼吸（错相位）
				const breath = 1 + Math.sin(t * 1.0 + r.phase) * 0.04;

				// 高亮放大
				const hiScale = isHi ? 1.45 : 1.0;
				const fade = isHi ? 1 : globalFade;

				// 节点本体
				tmpObj.position.copy(cur);
				tmpObj.scale.setScalar(n.size * hiScale * breath * scaleEase * fade);
				tmpObj.rotation.x = t * 0.18 + r.phase * 0.5;
				tmpObj.rotation.y = t * 0.22 + r.phase * 0.7;
				tmpObj.updateMatrix();
				mesh.setMatrixAt(i, tmpObj.matrix);

				// 标签
				const label = labelRenderer[i];
				label.position.copy(cur);
				label.position.y += n.size * 2.4;
				// 入场前 30% 隐藏；高亮或正常态显示
				label.visible = introT >= 0.3 && (isHi || globalFadeTarget > 0.95);
			}
			mesh.instanceMatrix.needsUpdate = true;
		},

		highlight(ids) {
			highlighted = ids;
			globalFadeTarget = 1;
			globalOpacityTarget = 1;
			highlightTarget = ids.size > 0 ? 1 : 0;
		},

		resetHighlight() {
			highlighted = new Set();
			globalFadeTarget = 1;
			globalOpacityTarget = 1;
			highlightTarget = 0;
		},

		fadeOthers(keepIds) {
			highlighted = keepIds;
			globalFadeTarget = 0.15;
			globalOpacityTarget = 0.45;
			highlightTarget = 0;
		},

		dispose() {
			nodeGeo.dispose();
			nodeMat.dispose();
			labelRenderer.forEach((l) => {
				if (l.parent) l.parent.remove(l);
			});
			labelRenderer.length = 0;
		},
	};

	return handle;
}

/** 每个节点的渲染时状态 */
interface NodeRuntime {
	node: PositionedNode;
	startPos: Vector3;
	phase: number;
}

/**
 * 构造一个节点标签（CSS2DObject）
 */
function makeLabel(node: PositionedNode): CSS2DObject {
	const div = document.createElement("div");
	div.className = "star-map__label";
	div.textContent = node.name;
	div.dataset.techId = node.id;
	const obj = new CSS2DObject(div);
	obj.userData.techId = node.id;
	return obj;
}

/** easeOutCubic：起步快，收尾慢 */
function easeOutCubic(t: number): number {
	const f = t - 1;
	return f * f * f + 1;
}

/** easeOutBack：起步快，结尾有微小回弹 */
function easeOutBack(t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
