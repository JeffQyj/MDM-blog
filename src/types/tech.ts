// ============================================
// 技术全景图（Tech Panorama）类型定义
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
 * 分类显示顺序（用于页面区块排序）
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
 */
export interface TechEntry {
	/** 内部唯一 ID（kebab-case） */
	id: string;
	/** 显示名（全称） */
	name: string;
	/** 分类 */
	category: TechCategory;
	/** 一句话个人点评（可选，<= 50 字） */
	note?: string;
	/** 关联文章的中文标题列表（由页面层解析为 slug/url） */
	relatedPosts?: string[];
	/** 手动声明的强关联技术 ID 列表（2D 版暂未使用，预留） */
	relatedTo?: string[];
	/** 首次接触年月（YYYY-MM） */
	startedAt?: string;
}
