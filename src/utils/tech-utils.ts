import type {
	CytoscapeEdgeData,
	CytoscapeNodeData,
	TechEntry,
} from "@/types/tech";

/**
 * 构建 Cytoscape 节点数组
 * - label 直接使用全称（去缩写）
 * - 节点视觉尺寸由 Cytoscape 根据 label 自适应（pill 形）
 */
export function buildNodes(entries: TechEntry[]): CytoscapeNodeData[] {
	return entries.map((t) => ({
		id: t.id,
		label: t.name,
		name: t.name,
		category: t.category,
		note: t.note ?? "",
		relatedPosts: t.relatedPosts ?? [],
		startedAt: t.startedAt ?? "",
	}));
}

/**
 * 构建 Cytoscape 边数组
 *
 * 规则：
 * 1. 同一 Category 的节点两两相连（弱关联，白色细线）
 *    - 但每个节点的同类边数最多 MAX_CATEGORY_EDGES，避免过密
 * 2. 手动声明的 relatedTo（强关联，金色粗线）
 */
const MAX_CATEGORY_EDGES = 4;

/**
 * 完全图最小生成树（MST）近似
 * 用于在同类节点中选取 N 条边，使其连通但不爆炸
 *
 * 简单做法：按节点在数组中的位置，每个节点只连接同类的下 N 个邻居
 */
function buildCategoryEdges(entries: TechEntry[]): CytoscapeEdgeData[] {
	const byCategory = new Map<string, string[]>();
	entries.forEach((t) => {
		if (!byCategory.has(t.category)) byCategory.set(t.category, []);
		byCategory.get(t.category)!.push(t.id);
	});

	const edges: CytoscapeEdgeData[] = [];
	for (const ids of byCategory.values()) {
		if (ids.length < 2) continue;

		// 环形连接：每个节点连下一个节点（构成环），再加几条交叉
		for (let i = 0; i < ids.length; i++) {
			const next = (i + 1) % ids.length;
			edges.push({
				id: `cat-${ids[i]}-${ids[next]}`,
				source: ids[i],
				target: ids[next],
				type: "category",
			});
		}
		// 若同类较多，加少量交叉边
		if (ids.length > 3 && ids.length <= MAX_CATEGORY_EDGES + 1) {
			for (let i = 0; i < ids.length; i++) {
				const next = (i + 2) % ids.length;
				if (i < next) {
					edges.push({
						id: `cat-${ids[i]}-${ids[next]}-x`,
						source: ids[i],
						target: ids[next],
						type: "category",
					});
				}
			}
		} else if (ids.length > MAX_CATEGORY_EDGES + 1) {
			// 数量多时按位置连几个"跨越"边
			const step = Math.max(1, Math.floor(ids.length / 3));
			for (let i = 0; i < ids.length; i++) {
				const next = (i + step) % ids.length;
				edges.push({
					id: `cat-${ids[i]}-${ids[next]}-j`,
					source: ids[i],
					target: ids[next],
					type: "category",
				});
			}
		}
	}
	return edges;
}

/**
 * 构建手动声明的强关联边
 */
function buildStrongEdges(entries: TechEntry[]): CytoscapeEdgeData[] {
	const idSet = new Set(entries.map((t) => t.id));
	const edges: CytoscapeEdgeData[] = [];
	const seen = new Set<string>();

	for (const t of entries) {
		for (const target of t.relatedTo ?? []) {
			if (!idSet.has(target)) continue;
			// 去重（A→B 和 B→A 只保留一条）
			const key = [t.id, target].sort().join("|");
			if (seen.has(key)) continue;
			seen.add(key);
			edges.push({
				id: `strong-${t.id}-${target}`,
				source: t.id,
				target: target,
				type: "strong",
			});
		}
	}
	return edges;
}

/**
 * 构建完整图数据（节点 + 边）
 */
export function buildGraph(entries: TechEntry[]) {
	const nodes = buildNodes(entries);
	const categoryEdges = buildCategoryEdges(entries);
	const strongEdges = buildStrongEdges(entries);
	return {
		nodes,
		edges: [...categoryEdges, ...strongEdges],
	};
}
