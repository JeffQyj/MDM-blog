import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "@utils/url-utils";

/**
 * 单篇文章的轻量索引项（弹窗内只用 slug/url/published 三个字段）
 */
export type PostIndexItem = {
	slug: string;
	url: string;
	published: string;
};

/**
 * 文章索引：key = 文章 frontmatter.title（中文）
 * 用途：把 tech-stack.ts 中 relatedPosts（中文标题数组）解析为可跳转的 URL
 */
export type PostIndex = Record<string, PostIndexItem>;

/**
 * 构建「文章标题 → 文章链接信息」索引
 *
 * - 仅收录非草稿文章（与全站列表/搜索口径一致）
 * - title 缺失或重复时，后者覆盖前者（去重靠 Astro slug 保证唯一）
 */
export function buildPostIndex(posts: CollectionEntry<"posts">[]): PostIndex {
	const map: PostIndex = {};
	for (const p of posts) {
		if (p.data.draft) continue;
		const title = p.data.title;
		if (!title) continue;
		map[title] = {
			slug: p.slug,
			url: getPostUrlBySlug(p.slug),
			published:
				p.data.published instanceof Date
					? p.data.published.toISOString().slice(0, 10)
					: String(p.data.published).slice(0, 10),
		};
	}
	return map;
}

/**
 * 解析某个技术节点的 relatedPosts（中文标题数组）为可点击链接列表
 * - 找不到对应文章时静默跳过
 */
export function resolveRelatedPosts(
	relatedPosts: string[] | undefined,
	postIndex: PostIndex,
): Array<PostIndexItem & { title: string }> {
	if (!relatedPosts || relatedPosts.length === 0) return [];
	const result: Array<PostIndexItem & { title: string }> = [];
	for (const title of relatedPosts) {
		const item = postIndex[title];
		if (!item) continue;
		result.push({ title, ...item });
	}
	return result;
}
