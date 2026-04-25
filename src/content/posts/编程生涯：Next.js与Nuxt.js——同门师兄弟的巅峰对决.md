---
title: 编程生涯：Next.js与Nuxt.js——同门师兄弟的巅峰对决
published: 2024-09-09
description: 记录 2024 年 9 月系统学习 Next.js 与 Nuxt.js 全栈框架的全过程，通过对照式学习深入理解两大框架的设计哲学、核心概念与实战技巧，完整梳理同构式框架开发的技术体系。
tags: [Next.js, Nuxt.js]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这是「生涯补全」系列的全栈框架学习篇，记录从前端框架过渡到全栈框架的关键转型期。
:::

## 引言：从前端框架到全栈框架

2024 年 9 月，在Java 后端项目开发的过程中，一个问题突然浮现在脑海：

> 「为什么后端只能用 Java 呢？JavaScript 和 TypeScript 难道不能写后端吗？」

带着这个疑问，我开始搜索探索。没想到这一探索不要紧，直接打开了一扇新世界的大门——**全栈框架**。

Next.js、Nuxt.js、Server Components、SSR、SSG、ISR、Hydration、Edge Runtime... 这些概念以前闻所未闻，一时间让我眼花缭乱。原来在 React/Vue 之外，还有这样一套完整的技术体系；原来「前端框架」和「全栈框架」之间，差的不是一星半点。

这篇文章，就来完整记录我对照式学习 **Next.js** 和 **Nuxt.js** 的全过程。如果你也在学习这两个框架，或者对全栈开发感兴趣，这篇文章或许能给你一些参考。

---

## 一、技术渊源与设计哲学

### 1.1 同样的起点，不同的方向

2016 年 10 月，Next.js 和 Nuxt.js 几乎同时诞生。这是一个有趣的巧合，也注定了它们将成为一对「瑜亮之争」。

| 维度 | Next.js | Nuxt.js |
|------|---------|---------|
| 底层框架 | React 18+ | Vue 3.4+ |
| 创始人 | Vercel（原ZEIT） | NuxtJS Team |
| 首次发布 | 2016年10月 | 2016年10月 |
| 当前稳定版 | Next.js 14（App Router） | Nuxt 3.13（Composition API） |
| 最新预览版 | Next.js 15（React 19） | Nuxt 4（测试版） |
| 核心定位 | 「全能」全栈框架 | 「智能」全栈框架 |
| 默认渲染 | SSR（服务端渲染） | SSR（服务端渲染） |

**通俗类比**：如果把 React 和 Vue 比作两门武学心法（内力运行方式），那么 Next.js 就是基于「React 心法」构建的全栈武功秘籍，而 Nuxt.js 则是基于「Vue 心法」构建的全栈武功秘籍。两者目标一致——打造高性能、易开发、体验佳的 Web 应用，但实现路径各有特色。

### 1.2 设计哲学的核心差异

| 设计哲学 | Next.js | Nuxt.js |
|---------|---------|---------|
| 核心理念 | 「做选择」—— 开发者完全控制渲染策略 | 「智能化」—— 框架自动选择最佳策略 |
| 配置方式 | 约定式 + 可配置（next.config.ts） | 约定式为主（nuxt.config.ts） |
| 路由系统 | 文件系统路由 + App Router | 文件系统路由 + 基于文件的自动路由 |
| 数据获取 | Server Components + fetch API | useFetch / useAsyncData 组合 |
| 状态管理 | 需引入外部方案（Zustand/Context） | 内置 useState（SSR 友好） |
| 生态策略 | 最小化核心 + 社区生态 | 高度集成 + 官方模块生态 |

### 1.3 技术概念家庭类比表

为了让读者更直观地理解抽象概念，这里用通俗的生活场景做类比：

| 技术概念 | 通俗比喻 | Next.js 实现 | Nuxt.js 实现 |
|---------|---------|-------------|-------------|
| **SSR（服务端渲染）** | 「餐厅厨房现做」 | Server Components 默认 | `ssr: true`（默认） |
| **SSG（静态生成）** | 「便利店预制菜」 | `generateStaticParams` | `prerender: true` |
| **ISR（增量静态再生成）** | 「定时刷新菜单」 | `revalidate` | `routeRules` |
| **CSR（客户端渲染）** | 「外卖点餐」 | `'use client'` | `ssr: false` |
| **Hydration（水合）** | 「服务员端菜上桌」 | RSC 机制 | Vue 3 水合 |
| **自动导入** | 「全自动洗衣机」 | 需手动 import | 开箱即用 |
| **Server Components** | 「后厨一体化系统」 | 默认服务端组件 | — |
| **Nitro 服务器引擎** | 「万能料理机」 | — | Nuxt 3+ 内置 |
| **Edge Runtime** | 「分布式厨房」 | Edge Functions | Nitro Presets |

---

## 二、项目结构与约定

### 2.1 Next.js App Router 项目结构

Next.js 13+ 引入了全新的 **App Router**，采用基于文件系统的约定式路由：

```
├── app/                          # App Router 目录
│   ├── layout.tsx               # 根布局（所有页面共享，不会触发重渲染）
│   ├── page.tsx                 # 首页（对应路由 /）
│   ├── loading.tsx              # 加载状态（页面切换时显示）
│   ├── error.tsx                # 错误边界（页面出错时显示）
│   ├── not-found.tsx            # 404 页面
│   ├── about/
│   │   └── page.tsx             # 关于页（/about）
│   ├── blog/
│   │   ├── page.tsx             # 博客列表页（/blog）
│   │   └── [slug]/
│   │       └── page.tsx         # 博客详情页（/blog/:slug）
│   ├── (marketing)/             # Route Groups：包裹一组共享布局的路由
│   │   ├── layout.tsx           # 营销页面专用布局
│   │   ├── page.tsx             # 首页（/）
│   │   └── pricing/
│   │       └── page.tsx         # 价格页（/pricing）
│   └── api/                      # API 路由
│       └── hello/
│           └── route.ts          # API 端点（/api/hello）
├── components/                  # React 组件目录（需手动 import）
├── lib/                         # 工具函数、数据库客户端
├── public/                      # 静态资源（直接映射到根路径）
├── styles/                      # 样式文件目录
├── next.config.ts              # Next.js 配置文件
└── package.json
```

:::note
**App Router vs Pages Router**：Next.js 13 引入了全新的 App Router 目录结构。App Router 的核心理念是「默认服务端渲染」，而 Pages Router 是「默认客户端渲染」。App Router 是目前推荐的方式，但 Pages Router 仍然被支持。
:::

### 2.2 Nuxt.js 项目结构

Nuxt.js 同样采用**约定式项目结构**，但更加自动化，许多文件可以自动被识别和注册：

```
├── app/                          # 应用程序源码目录（Nuxt 4 新特性）
│   ├── assets/                  # 未编译的资源（CSS、图片等）
│   ├── components/              # Vue 组件（自动导入）
│   │   ├── Header.vue           # → <Header />
│   │   ├── blog/
│   │   │   └── Card.vue         # → <BlogCard />
│   │   └── base/
│   │       └── Button.vue       # → <BaseButton />
│   ├── composables/             # 组合式函数（自动导入）
│   │   └── useCounter.ts        # → useCounter()
│   ├── layouts/                 # 布局文件
│   │   ├── default.vue          # 默认布局
│   │   └── blog.vue             # 博客专用布局
│   ├── middleware/               # 中间件
│   │   └── auth.ts              # 路由守卫
│   ├── pages/                   # 页面目录（自动生成路由）
│   │   ├── index.vue            # 首页（/）
│   │   ├── about.vue            # 关于页（/about）
│   │   └── blog/
│   │       ├── index.vue        # 博客列表（/blog）
│   │       └── [slug].vue       # 博客详情（/blog/:slug）
│   ├── plugins/                 # 插件（应用启动时执行）
│   │   └── init.client.ts       # 客户端插件
│   ├── public/                  # 静态资源（直接映射到 /public/）
│   ├── utils/                   # 工具函数（自动导入）
│   │   └── formatDate.ts        # → formatDate()
│   ├── app.config.ts            # 应用配置（运行时可修改）
│   ├── app.vue                  # 应用根组件
│   └── error.vue                # 错误页面
├── server/                      # 服务端代码（Nuxt 3+）
│   ├── api/                     # API 端点
│   │   ├── hello.get.ts         # GET /api/hello
│   │   ├── users/
│   │   │   ├── index.get.ts     # GET /api/users
│   │   │   ├── index.post.ts    # POST /api/users
│   │   │   └── [id].get.ts      # GET /api/users/:id
│   │   ├── middleware/          # 服务端中间件
│   │   └── utils/              # 服务端工具
├── nuxt.config.ts              # Nuxt 配置文件
└── package.json
```

:::note
**自动导入机制**：Nuxt.js 最强大的特性之一就是**自动导入**。在 `components/`、`composables/`、`utils/` 目录下的文件和函数可以自动在应用中使用，无需手动 import。这大大减少了样板代码。
:::

### 2.3 项目结构对照表

| 特性 | Next.js (App Router) | Nuxt.js |
|------|---------------------|---------|
| 页面目录 | `app/` | `app/pages/` |
| 布局文件 | `layout.tsx` | `layouts/*.vue` |
| 加载状态 | `loading.tsx` | `loading.vue` |
| 错误边界 | `error.tsx` | `error.vue` |
| 动态路由 | `[folder]/page.tsx` | `[folder].vue` |
| 路由分组 | `(groupName)/` | — |
| 嵌套路由 | 通过 layout.tsx 嵌套 | 通过目录嵌套 |
| API 路由 | `app/api/route.ts` | `server/api/*.ts` |
| 中间件 | `middleware.ts` | `middleware/*.ts` |
| 组件导入 | 手动 import | 自动导入 |
| 错误处理 | `notFound()` | `throw createError()` |

---

## 三、渲染模式全解析

### 3.1 四种渲染模式的家庭类比

| 渲染模式 | 全称 | 通俗比喻 | Next.js | Nuxt.js | 适用场景 |
|---------|------|---------|---------|---------|---------|
| **SSR** | Server-Side Rendering（服务端渲染） | 厨房现做 | Server Components（默认） | `ssr: true`（默认） | 仪表盘、用户中心 |
| **SSG** | Static Site Generation（静态生成） | 便利店预制菜 | `generateStaticParams` | `prerender: true` | 博客、文档 |
| **ISR** | Incremental Static Regeneration（增量静态再生成） | 定时刷新菜单 | `revalidate: 3600` | `routeRules` | 电商详情页 |
| **CSR** | Client-Side Rendering（客户端渲染） | 外卖点餐 | `'use client'` | `ssr: false` | 点赞、评论 |

### 3.2 Next.js 渲染模式

```typescript
// ==================== 静态生成（SSG）====================
// app/blog/[slug]/page.tsx

// 构建时预渲染，生成静态 HTML
// 适用于内容不频繁变化的页面，如博客文章、产品文档
// 特点：页面在构建时生成，后续请求直接返回缓存的 HTML
export async function generateStaticParams() {
  const posts = await fetchPosts();
  // 返回所有文章的 slug，预渲染这些页面
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);

  // 如果文章不存在，返回 404
  if (!post) {
    notFound();
  }

  return <Article title={post.title} content={post.content} />;
}
```

```typescript
// ==================== 服务端渲染（SSR）====================
// app/dashboard/page.tsx

// 每次请求时动态渲染
// 适用于需要实时数据的页面，如用户仪表盘
// 特点：每个请求都会执行数据库查询，返回最新数据
export default async function Dashboard() {
  // 直接在 Server Component 中获取数据
  const userData = await getCurrentUser();  // 实时获取用户数据
  const analytics = await fetchAnalytics(); // 实时获取分析数据

  return (
    <div>
      <h1>欢迎回来，{userData.name}</h1>
      <AnalyticsPanel data={analytics} />
    </div>
  );
}
```

```typescript
// ==================== 增量静态再生成（ISR）====================
// app/products/[id]/page.tsx

// 静态页面 + 按需重新验证
// 适用于电商产品页：大部分时间静态缓存，定期更新
// 特点：页面首次访问时生成，之后在 revalidate 秒数内使用缓存
export const revalidate = 3600; // 每小时重新验证一次缓存

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct(params.id);
  return <ProductDetail product={product} />;
}
```

```typescript
// ==================== 客户端渲染（CSR）====================
// app/likes/page.tsx

'use client';  // 声明为客户端组件，所有代码发送到浏览器执行

import { useState, useEffect } from 'react';

export default function LikeButton() {
  const [likes, setLikes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 客户端环境下获取点赞数
    // 典型场景：需要实时数据、用户交互驱动的功能
    fetchLikes().then((data) => {
      setLikes(data.count);
      setIsLoading(false);
    });
  }, []);

  const handleLike = async () => {
    setLikes(likes + 1);
    await fetch('/api/likes', { method: 'POST' });
  };

  if (isLoading) return <div>加载中...</div>;

  return <button onClick={handleLike}>👍 {likes}</button>;
}
```

### 3.3 Nuxt.js 渲染模式

Nuxt.js 通过 `routeRules` 配置不同的渲染策略，更加声明式：

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    // 静态生成：构建时预渲染所有页面
    '/blog/**': { prerender: true },

    // SSR：每次请求动态渲染（默认行为）
    '/dashboard/**': { ssr: true },

    // 客户端渲染：仅在浏览器执行，禁用服务端渲染
    '/admin/**': { ssr: false },

    // ISR：按需重新验证缓存
    '/products/**': { cache: { maxAge: 3600, staleMaxAge: 86400 } },

    // 混合渲染：不同端点不同策略
    '/api/**': { headers: { 'cache-control': 's-maxage=60' } }
  }
})
```

```vue
<!-- ==================== 组合式数据获取 ==================== -->
<!-- pages/blog/[slug].vue -->

<script setup lang="ts">
// useAsyncData：在服务端执行，在客户端复用（避免水合不匹配）
// 第一个参数：唯一键名（用于缓存和去重）
// 第二个参数：异步获取函数
const route = useRoute();
const { data: post, pending, error, refresh } = await useAsyncData(
  'post',  // 缓存 key，同一 key 不会重复请求
  () => $fetch(`/api/post/${route.params.slug}`)
);

// useFetch：useAsyncData 的语法糖，更简洁
// 自动处理请求配置、响应类型转换、错误处理
const { data: user } = await useFetch('/api/user/profile');

// 响应式数据获取
const { data: comments } = await useFetch(
  () => `/api/comments/${route.params.slug}`,
  { watch: [route.params.slug] }  // 当 slug 变化时重新获取
);
</script>

<template>
  <div>
    <!-- pending 状态：请求进行中 -->
    <div v-if="pending" class="loading">加载中...</div>

    <!-- error 状态：请求失败 -->
    <div v-else-if="error" class="error">
      加载失败：{{ error.message }}
    </div>

    <!-- 正常显示数据 -->
    <article v-else>
      <h1>{{ post.title }}</h1>
      <div>{{ post.content }}</div>
    </article>
  </div>
</template>
```

### 3.4 Server Components 边界与 Hydration 原理

#### 3.4.1 什么是 Hydration（水合）？

**通俗解释**：可以把 SSR 想象成「餐厅厨房先把菜做好」，Hydration 就是「服务员把菜端到桌上，让菜『活』过来」。

| 步骤 | Next.js | Nuxt.js |
|------|---------|---------|
| 服务端渲染 | React Server Components 生成 HTML | Vue 组件渲染成 HTML 字符串 |
| 发送 HTML | 浏览器收到完整的 HTML 页面 | 浏览器收到完整的 HTML 页面 |
| 水合过程 | React 在客户端「激活」组件 | Vue 在客户端挂载组件 |
| 事件绑定 | React 绑定事件处理器 | Vue 建立响应式系统 |

#### 3.4.2 Server Components vs Client Components

```typescript
// ==================== Server Component（Next.js 默认） ====================
// app/components/ArticleContent.tsx

/*
 * 服务端组件特点：
 * 1. 默认类型，不需要 'use client'
 * 2. 可以在组件内使用 async/await
 * 3. 可以直接访问服务端资源（数据库、文件系统、环境变量）
 * 4. 不能使用 hooks（useState、useEffect 等）
 * 5. 不能使用浏览器 API（window、document 等）
 * 6. 不能绑定事件处理（onClick、onChange 等）
 */

// 这个组件在服务端渲染，可以直接访问数据库
// 代码不会发送到客户端，敏感数据安全
export default async function ArticleContent({ slug }: { slug: string }) {
  // 直接在服务端查询数据库
  const article = await db.articles.findUnique({
    where: { slug },
    include: { author: true, tags: true }
  });

  return (
    <article>
      <h1>{article.title}</h1>
      <p>作者：{article.author.name}</p>
      <Content content={article.content} />
      {/* 嵌套客户端组件用于交互 */}
      <LikeButton articleId={article.id} initialLikes={article.likes} />
      <CommentSection articleId={article.id} />
    </article>
  );
}
```

```typescript
// ==================== Client Component ====================
// app/components/LikeButton.tsx

'use client';  // 声明为客户端组件，代码会发送到客户端

/*
 * 客户端组件特点：
 * 1. 需要 'use client' 声明
 * 2. 可以使用所有 React hooks
 * 3. 可以使用浏览器 API、事件处理
 * 4. 不能直接访问服务端资源
 */

import { useState, useEffect } from 'react';

interface Props {
  articleId: string;
  initialLikes: number;  // 从服务端获取的初始值
}

export default function LikeButton({ articleId, initialLikes }: Props) {
  // 使用 useState 管理本地状态
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  // useEffect：在客户端挂载后执行
  useEffect(() => {
    // 检查用户是否已经点过赞
    checkUserLiked(articleId).then(setIsLiked);
  }, [articleId]);

  const handleLike = async () => {
    // 乐观更新：先更新 UI，再发送请求
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikes(newIsLiked ? likes + 1 : likes - 1);

    // 发送请求到服务端
    await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
  };

  return (
    <button onClick={handleLike}>
      {isLiked ? '❤️' : '🤍'} {likes}
    </button>
  );
}
```

### 3.5 渲染模式选择决策树

```
需要 SEO 优化？
├── 是 → 内容是否频繁变化？
│   ├── 否 → SSG（静态生成）
│   └── 是 → 是否需要实时数据？
│       ├── 否 → ISR（增量静态再生成）
│       └── 是 → SSR（服务端渲染）
└── 否 → 是否需要用户交互？
    ├── 否 → SSR（服务端渲染）
    └── 是 → CSR（客户端渲染）或部分水合
```

---

## 四、路由系统进阶

### 4.1 Next.js App Router 进阶特性

#### 路由分组（Route Groups）

```typescript
// ==================== 路由分组 app/(marketing)/layout.tsx ====================

/*
 * 路由分组不会影响 URL 结构
 * 用途：为一组路由共享布局、样式、中间件
 * 语法：用圆括号包裹目录名 (groupName)
 */

// app/(marketing)/layout.tsx
// 这个布局只包裹 (marketing) 下的页面
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-wrapper">
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
```

```
路由结构：
app/
├── (marketing)/           # 路由分组，不影响 URL
│   ├── layout.tsx        # 营销页面专用布局
│   ├── page.tsx          # → / (首页)
│   └── pricing/
│       └── page.tsx      # → /pricing
├── (dashboard)/          # 另一个路由分组
│   ├── layout.tsx        # 仪表盘专用布局
│   ├── page.tsx          # → /dashboard
│   └── settings/
│       └── page.tsx      # → /dashboard/settings
└── blog/
    ├── page.tsx          # → /blog
    └── [slug]/
        └── page.tsx      # → /blog/:slug
```

#### 拦截路由（Intercepting Routes）

```typescript
// ==================== 拦截路由 ====================
// app/@modal/(.)blog/[slug]/page.tsx

/*
 * 拦截路由可以「拦截」导航并显示不同的 UI
 * 典型场景：
 *   - 列表页点击文章，在模态框中预览（而不是跳转）
 *   - 图片点击，在灯箱中查看
 * URL 保持不变，但显示的是模态框内容
 */

// app/@modal/layout.tsx
// 定义模态框插槽
export default function ModalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="modal-overlay">
      {children}
    </div>
  );
}
```

### 4.2 Nuxt.js 自动路由与中间件

```vue
<!-- ==================== 嵌套布局 app/layouts/blog.vue ==================== -->

<!--
 * layouts 目录下的文件用于定义布局
 * 使用 <slot /> 渲染页面内容
-->
<template>
  <div class="blog-layout">
    <aside class="blog-sidebar">
      <BlogCategories />
      <RecentPosts />
    </aside>
    <main>
      <slot />  <!-- 页面内容在这里渲染 -->
    </main>
  </div>
</template>
```

```vue
<!-- ==================== 布局使用 app/pages/blog/index.vue ==================== -->

<script setup lang="ts">
// 使用 definePageMeta 指定页面配置
definePageMeta({
  layout: 'blog',        // 使用 blog 布局（覆盖默认布局）
  middleware: ['auth']   // 使用 auth 中间件
});
</script>
```

```typescript
// ==================== 中间件 app/middleware/auth.ts ====================

/*
 * Nuxt.js 中间件用于在路由切换前执行逻辑
 * 三种类型：
 *   1. 路由中间件：只对特定路由生效
 *   2. 全局中间件：所有路由切换前执行
 *   3. 命名路由中间件：可按需应用的中间件
 */

// 路由中间件：只对 /dashboard 生效
export default defineNuxtRouteMiddleware((to, from) => {
  // Nuxt 自动注入的 composables 可以直接使用
  const user = useUser();

  // 如果未登录且不是访问登录页，重定向到登录页
  if (!user.value?.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login');
  }
});
```

```typescript
// ==================== 全局中间件 nuxt.config.ts 配置 ====================

// 全局中间件在所有路由切换前执行
export default defineNuxtConfig({
  router: {
    middleware: ['auth']  // 注册全局中间件
  }
})
```

```typescript
// ==================== 命名路由中间件 app/middleware/auth.ts ====================

// 定义命名中间件（named middleware）
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuth();

  if (!auth.isLoggedIn) {
    return navigateTo('/login');
  }
});

// 使用时在 definePageMeta 中指定
// definePageMeta({ middleware: { auth: true } });
```

### 4.3 路由系统对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| 动态路由 | `[param]/page.tsx` | `[param].vue` |
| 路由分组 | `(groupName)/` | — |
| 拦截路由 | `(.)folder/route` | — |
| 嵌套路由 | 通过 layout.tsx 嵌套 | 通过目录嵌套 |
| 布局系统 | layout.tsx | layouts/*.vue + `<slot />` |
| 中间件 | middleware.ts | middleware/*.ts |
| 404处理 | not-found.tsx | error.vue |
| 重定向 | redirect() | navigateTo() |

---

## 五、数据获取机制

### 5.1 Next.js 数据获取

```typescript
// ==================== 服务端数据获取（Server Component） ====================
// app/users/page.tsx

// 直接在 Server Component 中使用 async/await
// 数据获取在服务端执行，客户端只会收到序列化后的数据
export default async function UsersPage() {
  // 多个请求可以并行执行，提高性能
  const [usersResponse, postsResponse] = await Promise.all([
    fetch('/api/users', { next: { revalidate: 3600 } }),  // 缓存 1 小时
    fetch('/api/posts', { next: { revalidate: 1800 } })   // 缓存 30 分钟
  ]);

  const users = await usersResponse.json();
  const posts = await postsResponse.json();

  return (
    <div>
      <h1>用户列表</h1>
      <UserList users={users} />
      <RecentPosts posts={posts} />
    </div>
  );
}
```

```typescript
// ==================== Server Actions：表单与 mutations ====================
// app/actions.ts

'use server';  // 标记为服务端 action，整个文件都是服务端代码

/*
 * Server Actions 允许从客户端直接调用服务端函数
 * 无需创建 API 路由，适合表单提交、数据修改等场景
 * 自动处理 CSRF 保护、类型安全、重验证等
 */

// 定义服务端 action
export async function submitForm(formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;

  // 服务端验证
  if (!email || !name) {
    return { error: '请填写所有字段' };
  }

  // 数据库操作（服务端直接访问）
  const user = await db.user.create({ data: { email, name } });

  // 重新验证缓存，触发 UI 更新
  revalidatePath('/users');

  return { success: true, user };
}
```

```typescript
// ==================== 客户端组件中的 Server Action 调用 ====================
// app/components/UserForm.tsx

'use client';  // 明确声明为客户端组件

import { submitForm } from '../actions';
import { useFormState } from 'react-dom';

export default function UserForm() {
  // useFormState：管理表单状态和错误信息
  // 第一个参数：Server Action
  // 第二个参数：初始状态
  const [state, formAction] = useFormState(submitForm, null);

  return (
    <form action={formAction}>
      <input name="name" type="text" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      {state?.error && <p className="error">{state.error}</p>}
      <button type="submit">提交</button>
    </form>
  );
}
```

### 5.2 Nuxt.js 数据获取

```typescript
// ==================== useAsyncData：带缓存的数据获取 ====================
// composables/usePost.ts

/*
 * useAsyncData 是 Nuxt 中最核心的数据获取 composable
 * 特点：
 *   1. 服务端执行，客户端自动复用（避免水合不匹配）
 *   2. 自动缓存请求结果，相同 key 不会重复请求
 *   3. 支持后台刷新、错误处理
 */
export const usePost = (slug: Ref<string> | string) => {
  return useAsyncData(
    `post-${slug}`,  // 唯一键名，用于缓存和去重
    () => $fetch(`/api/post/${slug}`),
    {
      watch: [slug],  // 当 slug 变化时重新获取
    }
  );
};
```

```typescript
// ==================== useFetch：useAsyncData 的语法糖 ====================
// pages/blog/[slug].vue

<script setup lang="ts">
const route = useRoute();

// useFetch 自动处理请求配置、响应类型转换、错误处理
// 简单写法：自动从 URL 推导 key
const { data: post } = await useFetch(`/api/post/${route.params.slug}`);

// 完整写法：更多配置选项
const { data: user, pending, error, refresh } = await useFetch('/api/user/profile', {
  method: 'POST',                  // 请求方法
  body: { name: '张三' },         // 请求体
  headers: {                       // 请求头
    Authorization: `Bearer ${useCookie('token').value}`
  },
  transform: (data) => {           // 数据转换函数
    return {
      ...data,
      fullName: `${data.firstName} ${data.lastName}`
    };
  },
  pick: ['id', 'name', 'email'],  // 只 pick 部分字段，减少数据传输
});

// 手动刷新数据
const handleRefresh = () => {
  refresh();
};
</script>
```

```typescript
// ==================== $fetch：轻量级请求函数 ====================
// 在 composables、组件或 server/api 中使用

// 发送 POST 请求
const result = await $fetch('/api/create-post', {
  method: 'POST',
  body: { title: '新文章', content: '内容...' }
});

// 发送带认证的请求
const secureData = await $fetch('/api/protected', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

### 5.3 数据获取对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| 服务端获取 | async component + fetch | useAsyncData / useFetch |
| 客户端复用 | 自动（RSC 机制） | 自动（useAsyncData） |
| 缓存策略 | `next: { revalidate }` | `getCachedData` |
| 手动刷新 | `revalidatePath` | `refresh()` |
| 错误处理 | try/catch | `error` ref |
| 请求取消 | AbortController | `clear` / `abortController` |

---

## 六、组件边界与复用

### 6.1 Next.js 组件系统

```typescript
// ==================== Server Component（默认） ====================
// app/components/ArticleContent.tsx

/*
 * 服务端组件特点：
 * 1. 默认类型，不需要 'use client'
 * 2. 可以在组件内使用 async/await
 * 3. 可以访问服务端资源（数据库、文件系统）
 * 4. 不能使用 hooks、浏览器 API、事件处理
 */

export default async function ArticleContent({ slug }: { slug: string }) {
  const article = await db.articles.findUnique({ where: { slug } });

  return (
    <article>
      <h1>{article.title}</h1>
      <LikeButton articleId={article.id} initialLikes={article.likes} />
    </article>
  );
}
```

```typescript
// ==================== Client Component ====================
// app/components/LikeButton.tsx

'use client';  // 声明为客户端组件

import { useState, useEffect } from 'react';

export default function LikeButton({ articleId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    checkUserLiked(articleId).then(setIsLiked);
  }, [articleId]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
  };

  return <button onClick={handleLike}>{isLiked ? '❤️' : '🤍'} {likes}</button>;
}
```

### 6.2 Nuxt.js 组件自动导入

```vue
<!-- ==================== 自动导入的组件 ==================== -->
<!-- pages/index.vue -->

<!--
 * components 目录下的组件会自动注册
 * 命名规则：
 *   - components/Header.vue → <Header />
 *   - components/blog/Header.vue → <BlogHeader />
 *   - components/base/Button.vue → <BaseButton />
-->
<script setup lang="ts">
// 不需要 import 语句，组件直接可用
// Nuxt 会自动解析并导入
</script>

<template>
  <div>
    <Header />
    <ArticleCard
      v-for="article in articles"
      :key="article.id"
      :title="article.title"
      :excerpt="article.excerpt"
    />
    <Footer />
  </div>
</template>
```

```vue
<!-- ==================== 懒加载组件 ==================== -->

<template>
  <div>
    <!-- 非懒加载：立即加载 -->
    <HeavyChart />

    <!-- 懒加载：组件在进入视口时加载 -->
    <!-- 使用 Lazy 前缀实现代码分割 -->
    <LazyHeavyChart />

    <!-- 配合 Suspense 使用 -->
    <Suspense>
      <LazyComplexWidget />
      <template #fallback>
        <LoadingSkeleton />
      </template>
    </Suspense>
  </div>
</template>
```

### 6.3 组件系统对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| 客户端组件 | `'use client'` | 默认（SPA 模式下） |
| 服务端组件 | 默认 | 所有组件 |
| 组件导入 | 手动 import | 自动导入 |
| 懒加载 | `dynamic()` | `Lazy` 前缀 |
| Props 类型 | TypeScript interfaces | `defineProps` |
| 动态组件 | `<Component is={...} />` | `<component :is="..." />` |

---

## 七、状态管理原理

### 7.1 SSR 兼容的状态管理

**为什么需要特殊处理？**

在 SSR 场景下，状态管理比纯客户端 SPA 复杂得多：

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 水合不匹配 | 服务端渲染的 HTML 与客户端初始状态不一致 | useState/useAsyncData 自动处理 |
| 状态丢失 | 页面切换时状态未持久化 | 客户端复用服务端数据 |
| 重复初始化 | 客户端再次执行 useState 初始化 | 使用函数初始化 `useState('key', () => value)` |

### 7.2 Next.js 状态管理

```typescript
// ==================== useState：基础状态 ====================
'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)}>减少</button>
    </div>
  );
}
```

```typescript
// ==================== Context API：全局状态 ====================
// app/context/ThemeContext.tsx

'use client';  // Context 必须是客户端组件

import { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

```typescript
// ==================== Zustand：轻量级状态管理 ====================
// store/useUserStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: { id: string; name: string } | null;
  isLoggedIn: boolean;
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: (user) => set({ user, isLoggedIn: true }),

      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'user-storage',  // localStorage key
    }
  )
);
```

### 7.3 Nuxt.js 状态管理

```typescript
// ==================== useState：跨 SSR 的响应式状态 ====================
// composables/useCounter.ts

/*
 * useState 是 Nuxt 3 推荐的状态管理方式
 * 特点：
 *   1. 服务端初始化，客户端自动复用（避免水合不匹配）
 *   2. 基于 Vue 3 的响应式系统
 *   3. 响应式、类型安全、支持 SSR
 */

// 基础用法：useState 返回 Ref
export const useCounter = () => {
  return useState('counter', () => 0);  // 0 是初始值
};

// 带类型推断
export const useUser = () => {
  return useState<{ id: string; name: string } | null>('user', () => null);
};
```

```typescript
// ==================== 完整示例：购物车状态 ====================
// composables/useCart.ts

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const useCart = () => {
  // 使用 useState 创建购物车状态
  // 第一个参数：唯一键名
  // 第二个参数：初始值函数（避免 SSR 数据泄漏）
  const items = useState<CartItem[]>('cart-items', () => []);

  // 计算总价（computed）
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  // 添加商品
  const addItem = (product: Omit<CartItem, 'quantity'>) => {
    const existing = items.value.find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  };

  // 移除商品
  const removeItem = (id: string) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index > -1) {
      items.value.splice(index, 1);
    }
  };

  return {
    items: readonly(items),  // readonly 防止外部直接修改
    totalPrice,
    addItem,
    removeItem
  };
};
```

```typescript
// ==================== Pinia 集成（大型应用推荐）====================
// stores/user.ts

import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as string | null,
    name: null as string | null,
    email: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.id,
    displayName: (state) => state.name || state.email || '匿名用户',
  },

  actions: {
    async fetchUser() {
      const user = await $fetch('/api/user/me');
      this.$patch(user);
    },

    logout() {
      this.$reset();
      navigateTo('/login');
    },
  },
});
```

### 7.4 状态管理对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| 组件状态 | useState | ref / reactive |
| 全局状态 | Context / Zustand | useState / Pinia |
| SSR 兼容 | 需要额外处理 | useState 自动处理 |
| 持久化 | 需手动实现 | 需手动实现 |
| 推荐方案 | Zustand + Context | useState + Pinia |

---

## 八、API 路由与中间件

### 8.1 Next.js API Routes

```typescript
// ==================== GET / POST 请求 app/api/users/route.ts ====================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users - 获取用户列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const users = await db.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const total = await db.user.count();

  return NextResponse.json({
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}

// POST /api/users - 创建用户
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: '姓名和邮箱是必填项' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: '该邮箱已被注册' }, { status: 409 });
    }

    const user = await db.user.create({ data: { name, email } });
    return NextResponse.json({ data: user }, { status: 201 });

  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
```

### 8.2 Next.js Middleware

```typescript
// ==================== middleware.ts ====================

/*
 * Next.js Middleware 在每个请求前执行
 * 适用场景：认证、日志、重定向、请求修改
 * 运行位置：Edge Runtime（全球分布式）
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 获取用户 token
  const token = request.cookies.get('auth-token')?.value;

  // 检查是否是受保护的路由
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      // 重定向到登录页
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 检查是否是管理后台
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 从 JWT 中获取用户角色（Edge Runtime 不支持 Node.js API）
    const payload = parseJwt(token);
    if (payload?.role !== 'admin') {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }

  // 允许请求继续
  return NextResponse.next();
}

// 配置匹配规则，限制中间件执行范围
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/profile/:path*']
};
```

### 8.3 Nuxt.js Server API

```typescript
// ==================== GET 请求 server/api/users.get.ts ====================

/*
 * 文件命名规则：users.get.ts → GET /api/users
 * 支持的 HTTP 方法：.get.ts, .post.ts, .put.ts, .delete.ts
 * Nuxt 自动从 @nuxt/schema 导入类型
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || 10;

  const users = await db.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });

  const total = await db.user.count();

  return {
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
});
```

```typescript
// ==================== POST 请求 server/api/users.post.ts ====================

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email } = body;

  if (!name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: '姓名和邮箱是必填项'
    });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: '该邮箱已被注册' });
  }

  const user = await db.user.create({ data: { name, email } });
  setResponseStatus(event, 201);
  return { data: user };
});
```

```typescript
// ==================== 动态路由 server/api/users/[id].get.ts ====================

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: '用户 ID 是必填项' });
  }

  const user = await db.user.findUnique({ where: { id } });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: '用户不存在' });
  }

  return { data: user };
});
```

### 8.4 API 与中间件对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| API 路由定义 | `app/api/route.ts` | `server/api/*.ts` |
| HTTP 方法 | 函数名（GET/POST等） | 文件后缀 |
| 动态路由 | `[id]/route.ts` | `[id].get.ts` |
| 请求读取 | `request.json()` | `readBody(event)` |
| 响应格式 | `NextResponse.json()` | `return object` |
| 错误处理 | throw + status | `createError()` |
| 中间件位置 | `middleware.ts` | `middleware/*.ts` |
| 中间件运行位置 | Edge Runtime | Node.js / Edge |

---

## 九、Nitro 与 Edge Runtime

### 9.1 什么是 Nitro？（Nuxt.js）

**Nitro** 是 Nuxt 3 内置的服务器引擎，是 Nuxt.js 最重要的架构升级之一。

| 特性 | 说明 |
|------|------|
| 多平台部署 | 一套代码，部署到任何平台（Node.js、Cloudflare Workers、AWS Lambda 等） |
| 自动代码分割 | 根据部署目标自动优化打包体积 |
| 混合渲染 | 不同路由使用不同渲染策略 |
| 内置 API | 常见功能（缓存、重定向、CORS）开箱即用 |

```typescript
// nuxt.config.ts - 配置 Nitro 预设
export default defineNuxtConfig({
  nitro: {
    // 预设：决定部署平台
    preset: 'node-server',        // Node.js 服务器
    // preset: 'cloudflare-pages'  // Cloudflare Pages
    // preset: 'aws-lambda'       // AWS Lambda
    // preset: 'vercel'            // Vercel

    // 预渲染所有路由
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog']
    },

    // 路由规则（混合渲染）
    routeRules: {
      '/api/**': { cors: true },
      '/blog/**': { prerender: true }
    }
  }
})
```

### 9.2 什么是 Edge Runtime？（Next.js）

**Edge Runtime** 是 Next.js 的边缘计算方案，代码在全球分布式节点执行，延迟更低。

| 特性 | 说明 |
|------|------|
| 全球分布式 | 代码在边缘节点执行，距离用户更近 |
| 低延迟 | 首字节时间（TTFB）显著降低 |
| 无冷启动 | 边缘节点常驻，即时响应 |
| V8 沙箱 | 使用 V8 引擎，安全性高 |

```typescript
// ==================== Edge Middleware ====================
// middleware.ts

// Next.js Middleware 默认运行在 Edge Runtime
// 适用场景：认证、重定向、A/B 测试

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const country = request.geo?.country;

  // 根据用户地区返回不同内容
  if (country === 'CN') {
    return NextResponse.rewrite(new URL('/zh-cn' + request.nextUrl.pathname, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
```

### 9.3 Nitro vs Edge Runtime 对照

| 特性 | Nitro（Nuxt.js） | Edge Runtime（Next.js） |
|------|------------------|------------------------|
| 多平台支持 | ✅ 更广泛 | 限于 Vercel/Cloudflare |
| 混合部署 | ✅ 原生支持 | 需要额外配置 |
| Serverless | ✅ 多种预设 | Vercel Functions |
| 自定义服务器 | ✅ 支持 | ❌ 受限 |
| 学习曲线 | 较缓 | 较陡 |

---

## 十、部署与生态

### 10.1 Next.js 部署

```bash
# ==================== 部署到 Vercel（推荐）====================
# Vercel 是 Next.js 的「娘家」，提供零配置部署
# 推送代码到 Git 仓库即可自动部署

npx vercel  # 交互式部署

# 或
git push  # 推送到 main 分支自动触发部署
```

```bash
# ==================== 静态导出（自托管）====================
# next.config.ts 启用静态导出

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',  // 生成纯静态文件（HTML/CSS/JS）
  images: {
    unoptimized: true  // 静态导出时禁用图片优化
  }
};

export default nextConfig;
```

```bash
# ==================== Docker 部署 ====================
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 10.2 Nuxt.js 部署

```bash
# ==================== Node.js 服务器 ====================
# nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'node-server'
  }
})

npm run build
node .output/server/index.mjs
```

```bash
# ==================== 静态站点部署 ====================
export default defineNuxtConfig({
  ssr: true,
  nitro: {
    preset: 'static'
  }
})

npm run generate
# 生成的文件在 .output/public/ 目录
```

```bash
# ==================== Docker 部署 ====================
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### 10.3 部署生态对照表

| 特性 | Next.js | Nuxt.js |
|------|---------|---------|
| 官方托管 | Vercel（零配置） | Vercel、Netlify、Cloudflare |
| 静态导出 | `output: 'export'` | `preset: 'static'` |
| 服务端部署 | Node.js / Docker | Node.js / Docker |
| Serverless | Vercel Functions | Nuxt Serverless |
| 边缘计算 | Edge Runtime | Nitro Presets |

---

## 十一、实战技巧：踩坑实录

### 11.1 Next.js 常见问题

```typescript
// ==================== 问题1：Server Component 中使用 hooks ====================

// ❌ 错误：Server Component 不能使用 hooks
// 'use client' 标记后就不是 Server Component 了
export default function Counter() {
  const [count, setCount] = useState(0);  // ❌ 错误：Server Component 不能使用 useState
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ 正确：按需分离组件
// 将交互逻辑抽离到客户端组件
'use client';
export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// 服务端组件只负责布局和数据获取
export default function CounterPage() {
  const data = await fetchData();  // 服务端获取数据
  return (
    <div>
      <h1>计数器</h1>
      <Counter />  {/* 客户端组件负责交互 */}
      <DataDisplay data={data} />
    </div>
  );
}
```

```typescript
// ==================== 问题2：useSearchParams 需要 Suspense ====================

// ❌ 错误：useSearchParams 在 App Router 中需要 Suspense 边界
'use client';
export default function SearchPage() {
  const params = useSearchParams();  // ❌ 会导致构建错误
  return <div>搜索：{params.get('q')}</div>;
}

// ✅ 正确：使用 Suspense 包裹
import { Suspense } from 'react';

function SearchResults() {
  const params = useSearchParams();
  return <div>搜索：{params.get('q')}</div>;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="skeleton">加载中...</div>}>
      <SearchResults />
    </Suspense>
  );
}
```

### 11.2 Nuxt.js 常见问题

```typescript
// ==================== 问题1：useState 的 SSR 数据泄漏 ====================

// ❌ 错误：useState 传入非函数初始值可能导致 SSR 数据泄漏
// 原因：服务端和客户端各自初始化，可能产生不同的值
export const useTheme = () => {
  const theme = useState('theme', {});  // ❌ 对象直接作为初始值不安全
  // ...
};

// ✅ 正确：使用函数初始化
// 函数只在服务端执行一次，客户端复用服务端的值
export const useTheme = () => {
  const theme = useState('theme', () => ({
    mode: 'light' as 'light' | 'dark',
    primaryColor: '#1890ff'
  }));
  // ...
};

// ✅ 最佳实践：使用组合式函数封装
export const useTheme = () => {
  const mode = useState<'light' | 'dark'>('theme-mode', () => 'light');
  const primaryColor = useState('theme-primary', () => '#1890ff');

  const toggleMode = () => {
    mode.value = mode.value === 'light' ? 'dark' : 'light';
  };

  return {
    mode: readonly(mode),
    primaryColor: readonly(primaryColor),
    toggleMode
  };
};
```

```typescript
// ==================== 问题2：在 composables 中使用 getCurrentInstance ====================

// ❌ 错误：Nuxt 组合式函数不应使用 this
export default function useAuth() {
  // ❌ 错误：getCurrentInstance 是 Vue 2 的遗留用法
  const vm = getCurrentInstance();
  const { proxy } = vm;

  // ...
}

// ✅ 正确：使用 Auto-imported 的 composables
export const useAuth = () => {
  // Nuxt 自动注入的 composables 可以直接使用
  const cookie = useCookie('auth-token');
  const user = useState<{ id: string; name: string } | null>('user', () => null);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await $fetch('/api/login', {
        method: 'POST',
        body: credentials
      });
      user.value = response.user;
      cookie.value = response.token;
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = () => {
    user.value = null;
    cookie.value = null;
    navigateTo('/login');
  };

  return {
    user: readonly(user),
    isLoggedIn: computed(() => !!user.value),
    login,
    logout
  };
};
```

```typescript
// ==================== 问题3：$fetch vs useFetch ====================

// $fetch：在组件 setup 中使用会执行两次请求（SSR + 客户端）
// 这是因为 $fetch 不会缓存结果

// ❌ 错误：在 setup 中直接使用 $fetch
const user = await $fetch('/api/user');  // 会执行两次

// ✅ 正确：使用 useFetch 或在 onMounted 中使用
const { data: user } = await useFetch('/api/user');  // 自动缓存，不会重复请求

// 或在 onMounted 中使用 $fetch
onMounted(async () => {
  const user = await $fetch('/api/user');  // 只在客户端执行
});
```

### 11.3 调试技巧

```typescript
// ==================== Next.js 服务端日志 ====================
// 在 Server Component 中打印日志

export default async function Page() {
  console.log('服务端日志');  // 在终端输出

  const data = await fetchData();
  console.log('获取到的数据:', data);

  return <div>{/* ... */}</div>;
}
```

```typescript
// ==================== Nuxt.js 服务端日志 ====================
// 使用 useLogger 获取带上下文的日志

export default defineEventHandler(async (event) => {
  const logger = useLogger();

  logger.info('处理请求', { url: event.path });
  logger.warn('警告信息');
  logger.error('错误信息', { error: new Error('test') });

  return { message: 'Hello' };
});
```

---

## 结语：框架之争与个人选择

2024 年 9 月的这次对照式学习，让我对「全栈框架」有了更深的理解。

**最大的收获是什么？**

不是学会了多少 API，而是理解了一个道理：**框架只是工具，思维才是核心。**

| 维度 | Next.js | Nuxt.js |
|------|---------|---------|
| 学习曲线 | 较陡（React 基础 + 新概念） | 较缓（Vue 基础 + 约定式） |
| 开发体验 | 灵活但需自己做选择 | 智能但需理解约定 |
| 渲染策略 | 开发者完全控制 | 框架智能选择 |
| 状态管理 | 需引入外部方案 | 内置 useState |
| 自动导入 | 需手动 import | 开箱即用 |
| 生态整合 | 社区驱动 | 官方模块生态 |
| 适用场景 | 需要精细控制的场景 | 追求开发效率的场景 |

> 框架之争没有胜负，只有「适合」二字。
>
> React 生态的灵活性与 Vue 生态的约定式便利，
> 就像金庸小说里的「独孤九剑」与「六脉神剑」——
> 前者无招胜有招，后者意到剑到。
>
> 关键不在于哪个更强，而在于你更习惯哪种战斗方式。

**如果你问我现在更倾向哪个？**

说实话，我目前使用 Next.js 比较多，毕竟 React 生态更成熟，文档和社区资源也更丰富。但在国内环境下，Nuxt.js 的生态其实更加友好——中文文档完善、社区活跃，很多国内开源项目都是基于 Nuxt 开发。

**最大的感悟是什么？**

没有确定的技术选择，只有确定的需求分析。

| 问题 | 技术选型 |
|------|---------|
| SEO 要求极高、迭代频繁 | Next.js + Vercel |
| 团队熟悉 Vue、追求开发效率 | Nuxt.js |
| 需要 SSR + SEO + 快速交付 | Nuxt.js |
| 需要精细的性能优化 | Next.js |
| 部署环境多样化（不想绑定 Vercel） | Nuxt.js + Nitro |

框架只是工具，**需求才是主导**。弄清楚真正要解决的问题是什么，比一开始就纠结用哪个框架重要得多。

现在回头看那些「踩坑」的经历，其实都是宝贵的财富。每一个解决掉的问题，都在让我对全栈开发的理解更深一层。

---

*技术学习没有捷径，只有在实践中反复打磨，才能真正掌握一门框架的精髓。学习 Next.js 和 Nuxt.js 的过程本身，就是对现代 Web 开发最好的一次深度探索。如果这篇文章能给你一些帮助，那便是它存在的最大价值。*
