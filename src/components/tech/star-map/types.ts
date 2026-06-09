/**
 * 3D 神经图谱类型定义
 *
 * 与 src/types/tech.ts 解耦：
 * - src/types/tech.ts：节点/边数据契约（来源）
 * - star-map/types.ts：3D 渲染专属类型（消费）
 */
import type { Color, Vector3 } from "three";

/** 布局后的节点（3D 坐标 + 颜色 + 尺寸） */
export interface PositionedNode {
	id: string;
	name: string;
	category: string;
	note: string;
	relatedPosts: string[];
	startedAt: string;
	position: Vector3;
	color: Color;
	size: number;
	clusterCenter: Vector3;
}

/** 节点索引（按 id 快速查找） */
export type PositionedNodeMap = Map<string, PositionedNode>;

/** 边布局数据 */
export interface PositionedEdge {
	id: string;
	source: string;
	target: string;
	type: "category" | "strong";
	midpoint: Vector3;
	length: number;
	/** 单位方向向量（target - source normalize） */
	direction: Vector3;
}

/** 星点层（远/中/近） */
export interface StarLayer {
	points: import("three").Points;
	material: import("three").ShaderMaterial;
	count: number;
	twinkleSpeed: number;
	twinkleOffset: number;
}

/** 节点管理对象（暴露给主组件 update/dispose） */
export interface StarNodesHandle {
	group: import("three").Group;
	mesh: import("three").InstancedMesh;
	glowMesh: import("three").InstancedMesh;
	labelRenderer: import("three").Object3D[];
	nodes: PositionedNode[];
	nodeMap: PositionedNodeMap;
	update(t: number, dt: number): void;
	highlight(ids: Set<string>): void;
	resetHighlight(): void;
	fadeOthers(keepIds: Set<string>): void;
	dispose(): void;
}

/** 边管理对象 */
export interface ConstellationLinesHandle {
	group: import("three").Group;
	strongLines: import("three").LineSegments;
	categoryLines: import("three").LineSegments;
	energyParticles: import("three").Points;
	edges: PositionedEdge[];
	update(t: number, dt: number): void;
	highlight(edgeIds: Set<string>): void;
	resetHighlight(): void;
	dispose(): void;
}

/** 星点场管理对象 */
export interface StarFieldHandle {
	group: import("three").Group;
	layers: StarLayer[];
	update(t: number): void;
	dispose(): void;
}

/** 星云管理对象 */
export interface NebulaHandle {
	group: import("three").Group;
	update(t: number): void;
	dispose(): void;
}

/** 交互上下文 */
export interface InteractionContext {
	camera: import("three").PerspectiveCamera;
	renderer: import("three").WebGLRenderer;
	controls: import("three").OrbitControls;
	nodes3D: StarNodesHandle;
	lines3D: ConstellationLinesHandle;
	labelContainer: HTMLElement;
}
