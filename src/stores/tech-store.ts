import { type Writable, writable } from "svelte/store";
import type { TechCategory } from "@/types/tech";

/**
 * 3D 神经图谱的共享状态（Svelte stores）
 *
 * - hoveredTech: 当前 hover 的节点（驱动 tooltip 显示）
 * - filterCategory: 分类过滤集（空集表示「全部」）
 * - resetCameraTrigger: 自增计数器，每次点击「重置视角」+1，画布订阅并执行重置
 */

export const hoveredTech = writable<{
	x: number;
	y: number;
	tech: {
		id: string;
		name: string;
		category: string;
		note: string;
		relatedPosts: string[];
		startedAt: string;
	};
} | null>(null);

export const filterCategory: Writable<Set<TechCategory>> = writable(new Set());

export const resetCameraTrigger = writable(0);

/**
 * 清除所有过滤（回到全部）
 */
export function clearAllFilters() {
	filterCategory.set(new Set());
}
