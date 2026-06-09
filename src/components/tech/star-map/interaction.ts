/**
 * 交互层（v2：增强版）
 *
 * - Raycaster 拾取节点（基于 InstancedMesh）
 * - Hover：触发 hoveredTech store 更新（位置为屏幕坐标）
 * - 悬停轨道环：悬停节点时显示分类色细圆环（半径 ×3）
 * - 点击涟漪：单击节点时向外发出扩散环（1.2s 动画）
 * - 键盘控制：方向键旋转、+/- 缩放、R 重置、Space 暂停/继续自旋
 * - 闲置旋转：5s 无操作后开始绕 Y 轴 0.05 rad/s 旋转，OrbitControls 交互时停止
 * - 相机缓动：resetCamera / focusNode 用 lerp 缓动
 * - 窗口失焦 / 隐藏时暂停动画
 */
import {
	BufferGeometry,
	Float32BufferAttribute,
	Group,
	Line,
	LineBasicMaterial,
	Raycaster,
	Vector2,
	Vector3,
} from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { hoveredTech } from "@/stores/tech-store";
import type { PositionedNode, PositionedNodeMap } from "./types";

const IDLE_BEFORE_AUTO_ROTATE = 5.0; // s
const AUTO_ROTATE_SPEED = 0.05; // rad/s
const FOCUS_DISTANCE = 18;
const RING_SEGMENTS = 48;
const RIPPLE_DURATION = 1.2; // s
const KEYBOARD_ROTATE_STEP = Math.PI / 36; // 5°
const KEYBOARD_ZOOM_STEP = 5;

export interface InteractionHandle {
	/** 每帧调用 */
	update(dt: number): void;
	/** 触发相机回正（重置） */
	resetCamera(): void;
	/** 聚焦某节点 */
	focusNode(id: string): void;
	/** 切换闲置旋转 */
	toggleAutoRotate(force?: boolean): void;
	/** 释放资源 */
	dispose(): void;
}

interface InteractionOptions {
	camera: import("three").PerspectiveCamera;
	controls: OrbitControls;
	domElement: HTMLElement;
	nodes: PositionedNode[];
	nodeMap: PositionedNodeMap;
	instancedMesh: import("three").InstancedMesh;
	scene: import("three").Scene;
}

/** 单个涟漪的动画状态 */
interface RippleState {
	line: Line;
	mat: LineBasicMaterial;
	startTime: number;
	nodePosition: Vector3;
	nodeSize: number;
}

export function setupInteraction(opts: InteractionOptions): InteractionHandle {
	const { camera, controls, domElement, nodes, nodeMap, instancedMesh, scene } =
		opts;

	const raycaster = new Raycaster();
	const ndc = new Vector2();
	let lastInteraction = performance.now() / 1000;
	let autoRotateEnabled = true;
	let lastHoverId: string | null = null;
	let lastFrameTime = performance.now() / 1000;

	// 相机缓动目标
	let targetPos: Vector3 | null = null;
	let targetLook: Vector3 | null = null;
	let isEasing = false;
	let isUserControlling = false;
	const tmpVec = new Vector3();

	// === 悬停轨道环 ===
	const ringGroup = new Group();
	ringGroup.name = "hover-rings";
	scene.add(ringGroup);
	let currentRing: Line | null = null;
	let currentRingMat: LineBasicMaterial | null = null;

	// === 点击涟漪池 ===
	const ripples: RippleState[] = [];

	// OrbitControls 事件 → 标记用户在操作
	const onStart = () => {
		isUserControlling = true;
		lastInteraction = performance.now() / 1000;
	};
	const onEnd = () => {
		isUserControlling = false;
		lastInteraction = performance.now() / 1000;
	};
	controls.addEventListener("start", onStart);
	controls.addEventListener("change", () => {
		lastInteraction = performance.now() / 1000;
	});

	// 鼠标移动 → 拾取
	const onPointerMove = (ev: PointerEvent) => {
		const rect = domElement.getBoundingClientRect();
		ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
		ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(ndc, camera);

		const hits = raycaster.intersectObject(instancedMesh, false);
		if (hits.length === 0) {
			if (lastHoverId !== null) {
				lastHoverId = null;
				hoveredTech.set(null);
				// 清除轨道环
				if (currentRing) {
					ringGroup.remove(currentRing);
					currentRing.geometry.dispose();
					currentRingMat?.dispose();
					currentRing = null;
					currentRingMat = null;
				}
			}
			domElement.style.cursor = "default";
			return;
		}

		const hit = hits[0];
		const instanceId = hit.instanceId;
		if (instanceId === undefined || instanceId >= nodes.length) return;
		const node = nodes[instanceId];
		if (lastHoverId === node.id) {
			// 更新 tooltip 位置（跟手）
			hoveredTech.update((prev) =>
				prev ? { ...prev, x: ev.clientX, y: ev.clientY } : prev,
			);
			// 更新轨道环位置
			updateRing(node);
			return;
		}
		lastHoverId = node.id;
		domElement.style.cursor = "pointer";
		hoveredTech.set({
			x: ev.clientX,
			y: ev.clientY,
			tech: {
				id: node.id,
				name: node.name,
				category: node.category,
				note: node.note,
				relatedPosts: node.relatedPosts,
				startedAt: node.startedAt,
			},
		});
		// 创建/更新轨道环
		createOrUpdateRing(node);
	};
	domElement.addEventListener("pointermove", onPointerMove);

	// 离开画布时清除 hover
	const onPointerLeave = () => {
		if (lastHoverId !== null) {
			lastHoverId = null;
			hoveredTech.set(null);
			// 清除轨道环
			if (currentRing) {
				ringGroup.remove(currentRing);
				currentRing.geometry.dispose();
				currentRingMat?.dispose();
				currentRing = null;
				currentRingMat = null;
			}
			domElement.style.cursor = "default";
		}
	};
	domElement.addEventListener("pointerleave", onPointerLeave);

	// 单击 → 涟漪 + 聚焦
	const onClick = (ev: MouseEvent) => {
		const rect = domElement.getBoundingClientRect();
		ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
		ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(ndc, camera);
		const hits = raycaster.intersectObject(instancedMesh, false);
		if (hits.length === 0) return;
		const id = hits[0].instanceId;
		if (id === undefined) return;
		const node = nodes[id];
		if (node) {
			spawnRipple(node);
			focusNode(node.id);
		}
	};
	domElement.addEventListener("click", onClick);

	// 双击 → 聚焦（保留原有行为）
	const onDblClick = (ev: MouseEvent) => {
		const rect = domElement.getBoundingClientRect();
		ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
		ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
		raycaster.setFromCamera(ndc, camera);
		const hits = raycaster.intersectObject(instancedMesh, false);
		if (hits.length === 0) return;
		const id = hits[0].instanceId;
		if (id === undefined) return;
		const node = nodes[id];
		if (node) focusNode(node.id);
	};
	domElement.addEventListener("dblclick", onDblClick);

	// 视口失焦 / 隐藏 → 暂停自旋
	const onVisibility = () => {
		if (document.hidden) {
			autoRotateEnabled = false;
		}
	};
	document.addEventListener("visibilitychange", onVisibility);

	// === 键盘控制 ===
	const onKeyDown = (ev: KeyboardEvent) => {
		// 仅在画布或其子元素 focus 时响应
		const active = document.activeElement;
		if (
			active &&
			active !== domElement &&
			!domElement.contains(active)
		) {
			return;
		}
		switch (ev.key) {
			case "ArrowLeft":
				ev.preventDefault();
				rotateCamera(0, KEYBOARD_ROTATE_STEP);
				break;
			case "ArrowRight":
				ev.preventDefault();
				rotateCamera(0, -KEYBOARD_ROTATE_STEP);
				break;
			case "ArrowUp":
				ev.preventDefault();
				rotateCamera(KEYBOARD_ROTATE_STEP, 0);
				break;
			case "ArrowDown":
				ev.preventDefault();
				rotateCamera(-KEYBOARD_ROTATE_STEP, 0);
				break;
			case "+":
			case "=":
				ev.preventDefault();
				zoomCamera(-KEYBOARD_ZOOM_STEP);
				break;
			case "-":
				ev.preventDefault();
				zoomCamera(KEYBOARD_ZOOM_STEP);
				break;
			case "r":
			case "R":
				ev.preventDefault();
				resetCamera();
				break;
			case " ":
				ev.preventDefault();
				toggleAutoRotate();
				break;
		}
	};
	document.addEventListener("keydown", onKeyDown);

	// === 轨道环 ===
	function createOrUpdateRing(node: PositionedNode) {
		if (currentRing) {
			ringGroup.remove(currentRing);
			currentRing.geometry.dispose();
			currentRingMat?.dispose();
		}
		const radius = node.size * 3;
		const geo = new BufferGeometry();
		const pos: number[] = [];
		for (let i = 0; i <= RING_SEGMENTS; i++) {
			const angle = (i / RING_SEGMENTS) * Math.PI * 2;
			pos.push(
				Math.cos(angle) * radius,
				Math.sin(angle) * radius,
				0,
			);
		}
		geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
		const mat = new LineBasicMaterial({
			color: node.color,
			transparent: true,
			opacity: 0.7,
			depthWrite: false,
		});
		currentRingMat = mat;
		currentRing = new Line(geo, mat);
		currentRing.position.copy(node.position);
		currentRing.lookAt(camera.position);
		ringGroup.add(currentRing);
	}

	function updateRing(node: PositionedNode) {
		if (!currentRing) return;
		currentRing.position.copy(node.position);
		currentRing.lookAt(camera.position);
	}

	// === 点击涟漪 ===
	function spawnRipple(node: PositionedNode) {
		const geo = new BufferGeometry();
		const pos: number[] = [];
		for (let i = 0; i <= RING_SEGMENTS; i++) {
			const angle = (i / RING_SEGMENTS) * Math.PI * 2;
			pos.push(Math.cos(angle), Math.sin(angle), 0);
		}
		geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
		const mat = new LineBasicMaterial({
			color: node.color,
			transparent: true,
			opacity: 1,
			depthWrite: false,
		});
		const line = new Line(geo, mat);
		line.position.copy(node.position);
		line.lookAt(camera.position);
		scene.add(line);
		ripples.push({
			line,
			mat,
			startTime: performance.now() / 1000,
			nodePosition: node.position.clone(),
			nodeSize: node.size,
		});
	}

	function updateRipples(now: number) {
		for (let i = ripples.length - 1; i >= 0; i--) {
			const r = ripples[i];
			const elapsed = now - r.startTime;
			const progress = Math.min(1, elapsed / RIPPLE_DURATION);
			if (progress >= 1) {
				// 移除
				scene.remove(r.line);
				r.line.geometry.dispose();
				r.mat.dispose();
				ripples.splice(i, 1);
				continue;
			}
			// 半径从 nodeSize → nodeSize * 6
			const scale = r.nodeSize * (1 + progress * 5);
			r.line.scale.setScalar(scale);
			// 不透明度 1 → 0
			r.mat.opacity = 1 - easeInQuad(progress);
			// 跟随节点位置
			r.line.position.copy(r.nodePosition);
			r.line.lookAt(camera.position);
		}
	}

	// === 键盘辅助 ===
	function rotateCamera(deltaPolar: number, deltaAzimuth: number) {
		const offset = new Vector3().subVectors(camera.position, controls.target);
		// 球坐标
		const r = offset.length();
		let theta = Math.atan2(offset.x, offset.z);
		let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / r)));
		theta += deltaAzimuth;
		phi += deltaPolar;
		phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
		// 转回笛卡尔
		const sinPhi = Math.sin(phi);
		offset.set(
			r * sinPhi * Math.sin(theta),
			r * Math.cos(phi),
			r * sinPhi * Math.cos(theta),
		);
		camera.position.copy(controls.target).add(offset);
		camera.lookAt(controls.target);
		lastInteraction = performance.now() / 1000;
	}

	function zoomCamera(delta: number) {
		const offset = new Vector3().subVectors(camera.position, controls.target);
		const r = Math.max(10, offset.length() + delta);
		offset.normalize().multiplyScalar(r);
		camera.position.copy(controls.target).add(offset);
		lastInteraction = performance.now() / 1000;
	}

	// === 相机缓动函数 ===
	function easeTo(newPos: Vector3, newLook: Vector3) {
		targetPos = newPos.clone();
		targetLook = newLook.clone();
		isEasing = true;
	}

	function resetCamera() {
		easeTo(new Vector3(0, 18, 60), new Vector3(0, 0, 0));
	}

	function focusNode(id: string) {
		const node = nodeMap.get(id);
		if (!node) return;
		tmpVec.copy(node.position).normalize().multiplyScalar(FOCUS_DISTANCE);
		easeTo(tmpVec, node.position.clone());
	}

	// 初始记录
	resetCamera();

	function toggleAutoRotate(force?: boolean) {
		autoRotateEnabled = force ?? !autoRotateEnabled;
	}

	return {
		update(_dt) {
			const now = performance.now() / 1000;
			const realDt = now - lastFrameTime;
			lastFrameTime = now;

			// 更新涟漪
			updateRipples(now);

			// 更新轨道环朝向（始终面向相机）
			if (currentRing) {
				currentRing.lookAt(camera.position);
			}

			// 缓动相机
			if (isEasing && targetPos && targetLook) {
				const k = Math.min(1, realDt * 2.5);
				camera.position.lerp(targetPos, k);
				const curLook = new Vector3();
				camera.getWorldDirection(curLook);
				const desiredDir = new Vector3()
					.subVectors(targetLook, camera.position)
					.normalize();
				const newDir = curLook.lerp(desiredDir, k);
				camera.lookAt(camera.position.clone().add(newDir.multiplyScalar(10)));
				if (
					camera.position.distanceTo(targetPos) < 0.5 &&
					desiredDir.dot(camera.getWorldDirection(new Vector3())) > 0.999
				) {
					isEasing = false;
				}
			}

			// 闲置自旋
			const idle = now - lastInteraction;
			if (
				autoRotateEnabled &&
				!isUserControlling &&
				!isEasing &&
				idle > IDLE_BEFORE_AUTO_ROTATE
			) {
				const angle = AUTO_ROTATE_SPEED * realDt;
				const offset = new Vector3().subVectors(
					camera.position,
					controls.target,
				);
				const cosA = Math.cos(angle);
				const sinA = Math.sin(angle);
				const nx = offset.x * cosA - offset.z * sinA;
				const nz = offset.x * sinA + offset.z * cosA;
				offset.x = nx;
				offset.z = nz;
				camera.position.copy(controls.target).add(offset);
				camera.lookAt(controls.target);
			}
		},
		resetCamera,
		focusNode,
		toggleAutoRotate,
		dispose() {
			domElement.removeEventListener("pointermove", onPointerMove);
			domElement.removeEventListener("pointerleave", onPointerLeave);
			domElement.removeEventListener("click", onClick);
			domElement.removeEventListener("dblclick", onDblClick);
			document.removeEventListener("visibilitychange", onVisibility);
			document.removeEventListener("keydown", onKeyDown);
			controls.removeEventListener("start", onStart);
			controls.removeEventListener("end", onEnd);
			// 清理轨道环
			if (currentRing) {
				currentRing.geometry.dispose();
				currentRingMat?.dispose();
			}
			// 清理涟漪
			for (const r of ripples) {
				scene.remove(r.line);
				r.line.geometry.dispose();
				r.mat.dispose();
			}
			ripples.length = 0;
			scene.remove(ringGroup);
		},
	};
}

/** easeInQuad：加速衰减（涟漪用） */
function easeInQuad(t: number): number {
	return t * t;
}
