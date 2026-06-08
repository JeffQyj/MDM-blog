<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let tags: string[] = [];
export let categories: string[] = [];
export let sortedPosts: Post[] = [];

const params = new URLSearchParams(window.location.search);
tags = params.has("tag") ? params.getAll("tag") : [];
categories = params.has("category") ? params.getAll("category") : [];
const uncategorized = params.get("uncategorized");

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string | null;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

let groups: Group[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

onMount(async () => {
	let filteredPosts: Post[] = sortedPosts;

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) =>
				Array.isArray(post.data.tags) &&
				post.data.tags.some((tag) => tags.includes(tag)),
		);
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter(
			(post) => post.data.category && categories.includes(post.data.category),
		);
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	const grouped = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: grouped[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);

	groups = groupedPostsArray;
});

// 派生：总文章数 + 年份跨度
$: totalCount = groups.reduce((s, g) => s + g.posts.length, 0);
$: yearSpan =
	groups.length > 0
		? `${groups[groups.length - 1].year} → ${groups[0].year}`
		: "";
</script>

<div class="archive-page flex flex-col gap-6">
    <!-- ============== Hero 统计条（纯静态、无 blur/filter） ============== -->
    <section class="archive-hero rounded-[var(--radius-large)] p-6 md:p-8 relative overflow-hidden">
        <span class="archive-hero__deco" aria-hidden="true"></span>
        <div class="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
                <div class="archive-hero__eyebrow">ARCHIVE · 归档</div>
                <h2 class="archive-hero__title">所有文章 · <span class="archive-hero__count">{totalCount}</span></h2>
                {#if yearSpan}
                    <div class="archive-hero__span">收录范围 · {yearSpan}</div>
                {/if}
            </div>
            <div class="flex flex-wrap gap-2">
                {#each groups as g (g.year)}
                    <a href={`#year-${g.year}`} class="archive-chip">
                        {g.year} · {g.posts.length}
                    </a>
                {/each}
            </div>
        </div>
    </section>

    <!-- ============== 时间线（纯静态、无 blur/filter） ============== -->
    <section class="archive-timeline rounded-[var(--radius-large)] p-6 md:p-8 relative">
        {#each groups as group (group.year)}
            <div id={`year-${group.year}`} class="archive-year">
                <!-- 年份行：左侧大字 + 主线 + 计数 -->
                <div class="archive-year__head">
                    <div class="archive-year__num">{group.year}</div>
                    <div class="archive-year__line" aria-hidden="true">
                        <div class="archive-year__line-fill"></div>
                    </div>
                    <div class="archive-year__count">
                        <span class="archive-chip">{group.posts.length} 篇</span>
                    </div>
                </div>

                <!-- 文章列表 -->
                <ul class="archive-list">
                    {#each group.posts as post (post.slug)}
                        <li>
                            <a
                                href={getPostUrlBySlug(post.slug)}
                                aria-label={post.data.title}
                                class="archive-item group/item"
                            >
                                <span class="archive-item__date">{formatDate(post.data.published)}</span>
                                <span class="archive-item__node" aria-hidden="true">
                                    <span class="archive-item__node-dot"></span>
                                </span>
                                <span class="archive-item__title">{post.data.title}</span>
                                <span class="archive-item__tags hidden md:inline">
                                    {formatTag(post.data.tags)}
                                </span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/each}
    </section>
</div>

<style>
    .archive-page {
        width: 100%;
    }

    /* ===== Hero 区域：极淡渐变背景（与主页卡片保持一致） ============== */
    .archive-hero {
        background:
            linear-gradient(
                135deg,
                #fcfcfd 0%,
                #f9f8fc 40%,
                #f6f4fa 70%,
                #f3f0f8 100%
            );
        border: 1px solid oklch(from var(--primary) l c h / 0.12);
    }
    :root.dark .archive-hero {
        background:
            linear-gradient(
                135deg,
                oklch(0.21 0.025 var(--hue)) 0%,
                oklch(0.19 0.03 calc(var(--hue) + 20)) 60%,
                oklch(0.17 0.03 calc(var(--hue) + 40)) 100%
            );
        border-color: oklch(from var(--primary) l c h / 0.18);
    }
    /* 右上角装饰（纯渐变圆，零成本） */
    .archive-hero__deco {
        position: absolute;
        top: -4rem;
        right: -3rem;
        width: 14rem;
        height: 14rem;
        border-radius: 9999px;
        background: radial-gradient(
            circle at center,
            oklch(from var(--primary) l c h / 0.25) 0%,
            transparent 70%
        );
        pointer-events: none;
        z-index: 0;
    }
    :root.dark .archive-hero__deco {
        background: radial-gradient(
            circle at center,
            oklch(from var(--primary) l c h / 0.18) 0%,
            transparent 70%
        );
    }

    .archive-hero__eyebrow {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: oklch(0.45 0.04 var(--hue) / 0.6);
        margin-bottom: 0.25rem;
    }
    :root.dark .archive-hero__eyebrow {
        color: oklch(0.82 0.02 var(--hue) / 0.6);
    }
    .archive-hero__title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: oklch(0.22 0.04 var(--hue));
    }
    @media (min-width: 768px) {
        .archive-hero__title {
            font-size: 1.75rem;
        }
    }
    :root.dark .archive-hero__title {
        color: oklch(0.95 0.02 var(--hue));
    }
    .archive-hero__count {
        color: oklch(from var(--primary) calc(l - 0.05) calc(c + 0.05) h);
    }
    :root.dark .archive-hero__count {
        color: oklch(from var(--primary) calc(l + 0.12) c h);
    }
    .archive-hero__span {
        font-size: 0.875rem;
        color: oklch(0.4 0.04 var(--hue) / 0.75);
        margin-top: 0.375rem;
    }
    :root.dark .archive-hero__span {
        color: oklch(0.82 0.02 var(--hue) / 0.75);
    }

    /* ===== 年份胶囊（无 blur） ===================================== */
    .archive-chip {
        display: inline-flex;
        align-items: center;
        height: 1.65rem;
        padding: 0 0.7rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        background-color: oklch(0.98 0.01 var(--hue) / 0.7);
        color: oklch(0.45 0.06 var(--hue));
        border: 1px solid oklch(0.92 0.03 var(--hue) / 0.6);
        text-decoration: none;
        white-space: nowrap;
        transition:
            background-color 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease;
    }
    :root.dark .archive-chip {
        background-color: oklch(0.25 0.03 var(--hue) / 0.7);
        color: oklch(0.88 0.02 var(--hue));
        border-color: oklch(0.4 0.03 var(--hue) / 0.5);
    }
    .archive-chip:hover {
        background-color: oklch(from var(--primary) l c h / 0.15);
        border-color: oklch(from var(--primary) l c h / 0.4);
        color: oklch(from var(--primary) calc(l - 0.1) calc(c + 0.05) h);
    }
    :root.dark .archive-chip:hover {
        color: oklch(from var(--primary) calc(l + 0.12) c h);
    }

    /* ===== 时间线容器 ============================================== */
    .archive-timeline {
        background-color: var(--card-bg);
        border: 1px solid var(--line-divider);
    }

    /* ===== 年份分组 ================================================ */
    .archive-year {
        padding: 1.25rem 0 1.5rem;
    }
    .archive-year + .archive-year {
        border-top: 1px dashed var(--line-divider);
    }
    .archive-year__head {
        display: grid;
        grid-template-columns: 6.5rem 1.5rem 1fr;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
    }
    .archive-year__num {
        font-family: "Georgia", "Times New Roman", "Songti SC", "STSong",
            "SimSun", serif;
        font-size: 2rem;
        font-weight: 800;
        font-feature-settings: "tnum" 1;
        line-height: 1;
        text-align: right;
        padding-right: 0.25rem;
        background: linear-gradient(
            135deg,
            oklch(from var(--primary) calc(l - 0.05) calc(c + 0.02) h),
            oklch(from var(--primary) calc(l + 0.05) calc(c + 0.05) calc(h + 30))
        );
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        white-space: nowrap;
        overflow: visible;
    }
    .archive-year__line {
        position: relative;
        height: 0.75rem;
        width: 1.5rem;
    }
    .archive-year__line-fill {
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        transform: translateX(-50%);
        border-radius: 9999px;
        background: linear-gradient(
            180deg,
            transparent 0%,
            oklch(from var(--primary) l c h / 0.5) 15%,
            oklch(from var(--primary) l c h / 0.5) 85%,
            transparent 100%
        );
    }
    .archive-year__count {
        display: flex;
    }

    /* ===== 文章列表 ================================================ */
    .archive-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
    }
    .archive-item {
        position: relative;
        display: grid;
        grid-template-columns: 5rem 1.5rem 1fr 12rem;
        align-items: center;
        gap: 0.75rem;
        height: 2.75rem;
        padding: 0 0.5rem;
        border-radius: 0.625rem;
        text-decoration: none;
        color: inherit;
        transition: background-color 0.3s ease;
    }
    .archive-item:hover {
        background-color: oklch(from var(--primary) l c h / 0.08);
    }
    :root.dark .archive-item:hover {
        background-color: oklch(from var(--primary) l c h / 0.14);
    }

    .archive-item__date {
        font-size: 0.8125rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: oklch(from var(--primary) l c h / 0.7);
        text-align: right;
        letter-spacing: 0.04em;
    }
    .archive-item__node {
        position: relative;
        width: 1.5rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .archive-item__node::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        bottom: 0;
        width: 2px;
        transform: translateX(-50%);
        background: linear-gradient(
            180deg,
            transparent 0%,
            var(--line-divider) 8%,
            var(--line-divider) 92%,
            transparent 100%
        );
    }
    .archive-item__node-dot {
        position: relative;
        z-index: 1;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 9999px;
        background-color: var(--card-bg);
        border: 2px solid oklch(from var(--primary) l c h / 0.55);
        transition:
            width 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.35s cubic-bezier(0.22, 1, 0.36, 1),
            background-color 0.3s ease,
            border-color 0.3s ease;
    }
    .archive-item:hover .archive-item__node-dot {
        width: 0.75rem;
        height: 0.75rem;
        background-color: var(--primary);
        border-color: var(--primary);
    }
    .archive-item__title {
        font-size: 0.9375rem;
        font-weight: 600;
        color: oklch(0.3 0.02 var(--hue));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition:
            color 0.3s ease,
            transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
    }
    :root.dark .archive-item__title {
        color: oklch(0.88 0.01 var(--hue));
    }
    .archive-item:hover .archive-item__title {
        color: var(--primary);
        transform: translateX(3px);
    }
    .archive-item__tags {
        font-size: 0.75rem;
        color: oklch(0.5 0.02 var(--hue));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.02em;
    }
    :root.dark .archive-item__tags {
        color: oklch(0.65 0.01 var(--hue));
    }

    /* ===== 响应式 ================================================== */
    @media (max-width: 768px) {
        .archive-year__head {
            grid-template-columns: 4.5rem 1.25rem 1fr;
        }
        .archive-item {
            grid-template-columns: 3.5rem 1.25rem 1fr;
        }
        .archive-year__num {
            font-size: 1.5rem;
        }
        .archive-item__date {
            font-size: 0.75rem;
        }
    }
</style>
