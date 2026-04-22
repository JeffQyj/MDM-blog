---
title: 编程生涯：从ajax到axios
published: 2023-11-21
description: 回忆 2023 年 11 月学习 ajax 后立刻转向 axios 的经历，记录那句「恭喜白学」背后的技术迭代与成长感悟。
tags: [前端, JavaScript]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这是「生涯补全」系列的又一篇，记录技术学习历程中那些让人「猝不及防」的时刻。
:::

## 背景：ajax 的短暂旅程

2023 年 11 月，我开始学习前端请求技术。

彼时跟着视频教程，一步一步地配置、传参、处理回调，总算把 ajax 的基本用法学完了。心里还挺有成就感——「原以为多难的东西，其实也就这样」。

正准备多练几遍巩固一下，老师紧接着来了一句：

> 「好，ajax 我们就学到这，接下来我们讲 axios。」

那一瞬间的心情，该怎么形容呢？

:::note
用现在的流行语来说，大概就是「我谢谢您嘞」。
:::

## 「恭喜白学」的真正含义

事后回想，这句「恭喜白学」其实藏着两层意思。

**第一层，是技术的更新换代。**

ajax 本身并没有错，它是一个成熟的技术方案。但当社区有了更好、更优雅的替代品时，教学自然会与时俱进。这不是 ajax 的悲哀，而是前端生态蓬勃发展的证明。

**第二层，是学习方法的重塑。**

「白学」不是真的白学。每学一个新工具，都是在建立对一类问题的认知框架。学 ajax 的过程让我理解了异步请求的本质，而这种认知在切换到 axios 后依然有效。

| 维度 | 原生 XMLHttpRequest | jQuery $.ajax | axios |
|------|---------------------|---------------|-------|
| 请求流程 | 四步手动控制 | 一步完成 | 一步完成 |
| 状态判断 | 手动判断 readyState 和 status | 自动封装 | 自动封装 |
| 错误处理 | if 判断状态码 | error 回调 | catch 统一捕获 |
| 原理理解 | HTTP 细节一览无余 | 封装一层 | 再封装一层 |

## 从ajax到axios：变了什么，没变什么

### 变了的部分

最直观的感受是代码变简洁了。这中间经历了三次「白学」，三层封装。

**第一层：原生 XMLHttpRequest**

```javascript
// 原生 ajax（XMLHttpRequest）的四步骤
const xhr = new XMLHttpRequest();
xhr.open('GET', 'http://127.0.0.1:80/server');
xhr.send();
xhr.onreadystatechange = function () {
  if (xhr.readyState === 4) {
    if (xhr.status >= 200 && xhr.status < 300) {
      console.log(xhr.status);
      console.log(xhr.statusText);
      console.log(xhr.getAllResponseHeaders());
      console.log(xhr.response);
    }
  }
};
```

**第二层：jQuery 的 $.ajax**

```javascript
// jQuery 封装后的 ajax
$.ajax({
  url: '/api/user',
  method: 'POST',
  contentType: 'application/json',
  headers: { 'Authorization': 'Bearer xxx' },
  data: JSON.stringify({ name: '小明', age: 20 }),
  success: function(data, textStatus, jqXHR) {
    console.log('状态码:', jqXHR.status);
    console.log('响应头:', jqXHR.getAllResponseHeaders());
    console.log('数据:', data);
  },
  error: function(jqXHR, textStatus, errorThrown) {
    console.log('请求失败:', errorThrown);
  }
});
```

**第三层：axios**

```javascript
// axios 的写法
axios.post('/api/user', { name: '小明', age: 20 }, {
  headers: { 'Authorization': 'Bearer xxx' }
})
  .then(res => {
    console.log('状态码:', res.status);
    console.log('响应头:', res.headers);
    console.log('数据:', res.data);
  })
  .catch(err => console.log('请求失败:', err.message));
```

从四步、手动判断状态码、手动获取响应头，到 jQuery 的回调封装，再到 axios 的 Promise 风格——每一层封装都在简化写法，同时也在隐藏更多细节。

### 没变的部分

变了的是 API，不变的是原理。

ajax 教给我的是：**前端和后端是如何通信的**。这个认知在任何时代都适用。axios 不过是把这个过程包装得更好用了一些。

所以回到那句话——「恭喜白学」并不准确。准确的说法应该是：

> 「恭喜你又往前走了一步。」

## 时代的变迁与人的适应

写这篇文章的时候，axios 其实也已经不是最新、最火的选择了。

Vue 生态里有 `fetch API` 的封装方案，React 社区有 `SWR` 和 `React Query`，甚至原生的 `fetch` 也在逐步完善。

技术更新的速度越来越快，这是事实。但换个角度想：

- 2000 年的时候，jQuery 是神器
- 2010 年左右，angularjs 掀起了 MVVM 浪潮
- 2015 年后，React、Vue、Angular 三足鼎立
- 现在，前端框架又有了 Next.js、Nuxt.js 等全栈方案

每一代技术都有它的生命周期。而我们能做的，不是追逐每一个新框架，而是：

| 核心能力 | 说明 |
|----------|------|
| 原理理解 | 理解 HTTP、异步、跨域等底层知识 |
| 学习方法 | 掌握如何快速上手一个新工具 |
| 技术判断力 | 判断什么时候该用，什么不该用 |

## 写在最后

2023 年 11 月的那句「恭喜白学」，现在想来更像是一句调侃。

没有永远的技术，只有永远的技术人。

ajax 教会我的，axios 没有让我遗忘。而 axios 正在教我的，也会在下一个「白学」时刻继续沉淀。

技术的浪潮一波接一波，能依靠的只有自己的适应能力和学习能力。而这，恰恰是程序员最核心的竞争力。

---

*生涯补全系列，记录成长路上的每一个「猝不及防」。*
