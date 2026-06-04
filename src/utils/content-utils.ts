import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import getReadingTime from "reading-time";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

// 去除 Markdown 标记，仅保留可读文本供 reading-time 统计
function stripMarkdown(md: string): string {
	return (md || "")
		.replace(/```[\s\S]*?```/g, " ") // 代码块
		.replace(/`[^`]*`/g, " ") // 行内代码
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接 / 图片
		.replace(/[#>*_~|-]/g, " ") // Markdown 语法字符
		.replace(/\s+/g, " ")
		.trim();
}

// 模块级 Promise 缓存：整个 build 进程内只计算一次
let cachedTotalStats: Promise<{
	totalWords: number;
	totalMinutes: number;
}> | null = null;

// 聚合全站文章的总字数与总阅读时长（分钟）
// 与 remark-reading-time.mjs 保持相同的 reading-time 库与口径，结果一致
export function getTotalReadingStats(): Promise<{
	totalWords: number;
	totalMinutes: number;
}> {
	if (cachedTotalStats) return cachedTotalStats;

	cachedTotalStats = (async () => {
		const allPosts = await getCollection("posts", ({ data }) => {
			return import.meta.env.PROD ? data.draft !== true : true;
		});
		let totalWords = 0;
		let totalMinutes = 0;
		for (const p of allPosts) {
			const text = stripMarkdown(p.body || "");
			const rt = getReadingTime(text);
			totalWords += rt.words;
			totalMinutes += Math.max(1, Math.round(rt.minutes));
		}
		return { totalWords, totalMinutes };
	})();

	return cachedTotalStats;
}
