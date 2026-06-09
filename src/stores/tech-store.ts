import { writable, type Writable } from "svelte/store";
import type { TechCategory } from "@/types/tech";

/**
 * 技术神经图谱的共享状态（Svelte stores）
 *
 * - hoveredTech: 当前 hover 的节点（驱动 tooltip 显示）
 * - filterCategory: 分类过滤集（空集表示「全部」）
 * - resetViewTrigger: 自增计数器，每次点击「重置视图」+1，画布订阅并执行重置
 *
 * 已移除：activeTech（详情抽屉功能下线）、filterStatus（三态分级已下线）
 */

export const hoveredTech = writable<{ x: number; y: number; tech: any } | null>(
	null,
);
export const filterCategory: Writable<Set<TechCategory>> = writable(new Set());
export const resetViewTrigger = writable(0);

/**
 * 清除所有过滤（回到全部）
 */
export function clearAllFilters() {
	filterCategory.set(new Set());
}
