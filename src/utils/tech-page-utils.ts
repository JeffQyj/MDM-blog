import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";

/**
 * 单篇文章的轻量索引项（弹窗内只用 slug/url/title/published 四个字段）
 */
export type PostIndexItem = {
	slug: string;
	url: string;
	title: string;
	published: string;
};

/**
 * 文章索引：同时支持 slug 和 title 两种 key
 * - slug 形如 `编程生涯java特性全解`（Astro 自动生成，全小写、去除 `：` 等）
 * - title 形如 `编程生涯：Java特性全解`（frontmatter.title）
 * 用途：把 tech-stack.ts 中 relatedPosts（slug 数组）解析为可跳转的 URL，
 *      同时把真实文章标题带回显示。
 */
export type PostIndex = Record<string, PostIndexItem>;

/**
 * 构建「文章 slug/title → 文章链接信息」索引
 *
 * - 仅收录非草稿文章（与全站列表/搜索口径一致）
 * - 同一篇文章会以 slug 和 title 两种 key 写入索引（值指向同一对象）
 */
export function buildPostIndex(posts: CollectionEntry<"posts">[]): PostIndex {
	const map: PostIndex = {};
	for (const p of posts) {
		if (p.data.draft) continue;
		const title = p.data.title;
		if (!title) continue;
		const item: PostIndexItem = {
			slug: p.slug,
			url: getPostUrlBySlug(p.slug),
			title,
			published:
				p.data.published instanceof Date
					? p.data.published.toISOString().slice(0, 10)
					: String(p.data.published).slice(0, 10),
		};
		// 双 key 写入：slug（tech-stack.ts 的 relatedPosts 用这个）
		//              title（frontmatter 完整标题，可读性更好）
		map[p.slug] = item;
		map[title] = item;
	}
	return map;
}

/**
 * 解析某个技术节点的 relatedPosts（slug 数组）为可点击链接列表
 * - 找不到对应文章时静默跳过
 * - 返回的 title 字段为文章真实标题（带 `：`），用于弹窗内显示
 */
export function resolveRelatedPosts(
	relatedPosts: string[] | undefined,
	postIndex: PostIndex,
): PostIndexItem[] {
	if (!relatedPosts || relatedPosts.length === 0) return [];
	const result: PostIndexItem[] = [];
	for (const key of relatedPosts) {
		const item = postIndex[key];
		if (!item) continue;
		result.push(item);
	}
	return result;
}
