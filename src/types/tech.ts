// ============================================
// 技术神经图谱（Tech Neural Network）类型定义
// ============================================

/**
 * 11 个固定分类
 */
export type TechCategory =
	| "编程语言"
	| "前端框架"
	| "后端框架"
	| "AI 与 Agent"
	| "数据库"
	| "中间件"
	| "云原生"
	| "工程化与工具"
	| "数据科学与 AI"
	| "系统与底层"
	| "设计";

/**
 * 分类显示顺序（用于筛选条排序）
 */
export const TECH_CATEGORY_ORDER: TechCategory[] = [
	"AI 与 Agent",
	"编程语言",
	"前端框架",
	"后端框架",
	"数据库",
	"中间件",
	"云原生",
	"工程化与工具",
	"数据科学与 AI",
	"系统与底层",
	"设计",
];

/**
 * 单条技术数据
 *
 * 设计原则：去掉缩写、去掉「手写/认知/了解」分级，
 * 节点统一展示全称、视觉上保持一致的金色胶囊样式。
 */
export interface TechEntry {
	/** 内部唯一 ID（图中节点 ID），推荐用 kebab-case */
	id: string;
	/** 显示名（全称，画布上直接渲染） */
	name: string;
	/** 分类 */
	category: TechCategory;
	/** 一句话个人点评（可选，<= 50 字） */
	note?: string;
	/** 关联文章 slug 列表（仅展示不跳转） */
	relatedPosts?: string[];
	/** 手动声明的强关联技术 ID 列表 */
	relatedTo?: string[];
	/** 首次接触年月（YYYY-MM） */
	startedAt?: string;
}

/**
 * Cytoscape 节点数据
 */
export interface CytoscapeNodeData {
	id: string;
	/** 直接用全称作为 label */
	label: string;
	name: string;
	category: TechCategory;
	note: string;
	relatedPosts: string[];
	startedAt: string;
}

/**
 * Cytoscape 边数据
 */
export interface CytoscapeEdgeData {
	id: string;
	source: string;
	target: string;
	/** category: 同领域弱关联（细线） / strong: 手动强关联（粗金线） */
	type: "category" | "strong";
}
