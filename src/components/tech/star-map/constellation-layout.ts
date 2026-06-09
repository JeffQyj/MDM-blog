/**
 * 星座布局
 *
 * 目标：11 个分类形成 11 个「星座」，每个星座是一个球冠区域；
 * 同分类的节点聚集在该球冠内随机散布。
 *
 * 算法：
 * 1. 按 category 分组
 * 2. Fibonacci 球面分布分类中心（11 个均匀点）
 * 3. 每个分类内用「局部 Fibonacci 球冠」散布节点
 * 4. 节点颜色：分类 HSL 色相（中等饱和度 + 65% 亮度，便于 Bloom 抓取）
 */
import { Color, Vector3 } from "three";
import type { CytoscapeNodeData } from "@/types/tech";
import type { PositionedNode } from "./types";

/** 11 分类色相映射（HSL，等距分布以最大化辨识度） */
const CATEGORY_HUES: Record<string, number> = {
	"AI 与 Agent": 195, // 青蓝
	"编程语言": 38, // 金
	"前端框架": 270, // 紫
	"后端框架": 145, // 绿
	"数据库": 215, // 蓝
	"中间件": 0, // 红
	"云原生": 320, // 玫红
	"工程化与工具": 60, // 黄
	"数据科学与 AI": 180, // 青
	"系统与底层": 240, // 靛
	"设计": 18, // 橙
};

const CLUSTER_RADIUS = 18; // 分类中心到原点的距离（聚拢版）
const NODE_LOCAL_RADIUS = 8; // 单个分类内节点的散布半径（聚拢版）
// v2：所有技术节点统一尺寸（同级别，不按 relatedPosts 差异化）
const BASE_NODE_SIZE = 2.0;

/**
 * 获取分类颜色（CSS HSL 字符串，用于 DOM Legend）
 */
export function getCategoryHsl(category: string): string {
	const h = CATEGORY_HUES[category] ?? 0;
	return `hsl(${h}, 65%, 65%)`;
}

/**
 * 获取分类 THREE.Color
 */
export function getCategoryColor(category: string): Color {
	const h = CATEGORY_HUES[category] ?? 0;
	return new Color().setHSL(h / 360, 0.6, 0.65);
}

/**
 * Fibonacci 球面均匀分布
 *   - n: 点数
 *   - radius: 球面半径
 *   - 返回 Vector3 列表（球面上均匀）
 */
export function fibonacciSphere(n: number, radius: number): Vector3[] {
	const points: Vector3[] = [];
	if (n <= 0) return points;
	const phi = Math.PI * (3 - Math.sqrt(5)); // 黄金角
	for (let i = 0; i < n; i++) {
		const y = 1 - (i / Math.max(1, n - 1)) * 2; // y ∈ [1, -1]
		const r = Math.sqrt(Math.max(0, 1 - y * y));
		const theta = phi * i;
		points.push(
			new Vector3(
				Math.cos(theta) * r * radius,
				y * radius,
				Math.sin(theta) * r * radius,
			),
		);
	}
	return points;
}

/**
 * 计算 3D 星座布局
 */
export function computeConstellationLayout(
	nodes: CytoscapeNodeData[],
): PositionedNode[] {
	// 1. 按分类分组
	const groups = new Map<string, CytoscapeNodeData[]>();
	for (const n of nodes) {
		if (!groups.has(n.category)) groups.set(n.category, []);
		groups.get(n.category)!.push(n);
	}

	// 2. 分类中心：Fibonacci 球面
	const categories = Array.from(groups.keys());
	const centers = fibonacciSphere(categories.length, CLUSTER_RADIUS);

	// 3. 散布
	const positioned: PositionedNode[] = [];
	categories.forEach((cat, ci) => {
		const center = centers[ci];
		const color = getCategoryColor(cat);
		const members = groups.get(cat)!;

		// 局部 Fibonacci 球冠
		const localFib = fibonacciSphere(members.length, NODE_LOCAL_RADIUS);
		members.forEach((n, ni) => {
			// v2：所有节点统一尺寸（不再按 relatedPosts 加成）
			const size = BASE_NODE_SIZE;

			positioned.push({
				id: n.id,
				name: n.name,
				category: cat,
				note: n.note ?? "",
				relatedPosts: n.relatedPosts ?? [],
				startedAt: n.startedAt ?? "",
				position: center.clone().add(localFib[ni]),
				color,
				size,
				clusterCenter: center.clone(),
			});
		});
	});

	return positioned;
}

/**
 * 随机抖动位置（用于初始入场动画）
 * 返回一个新的 Vector3，在原 position 附近 ±1.5 范围内
 */
export function jitterPosition(pos: Vector3, amount = 1.5): Vector3 {
	return new Vector3(
		pos.x + (Math.random() - 0.5) * amount,
		pos.y + (Math.random() - 0.5) * amount,
		pos.z + (Math.random() - 0.5) * amount,
	);
}
