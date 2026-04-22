---

title: 编程生涯：前端框架还得是React
published: 2023-12-16
description: 回忆 2023 年 12 月从 Vue 转向 React 的学习历程，记录第一次接触「一切皆组件」思想时的认知冲击与理解。
tags: [React, 前端]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这是「生涯补全」系列的技术篇，记录从 Vue 转向 React 的学习历程。
:::

## 起航：为什么是 React

2023 年 12 月 16 日，我开始学习 React。

彼时已经学完了 Vue2 和 Vue3，信心满满地觉得「前端框架不过如此」。老师布置了一个新任务：「接下来我们用 React 重构之前的项目。」

我的第一反应是：「Vue 都学完了，再学一个框架应该不难吧？」

结果第一天就被泼了一盆冷水——打开 React 文档，满屏都是陌生的概念：`JSX`、`Virtual DOM`、`Hooks`......这和 Vue 的「模板语法」完全不是一个路数。

## 认知冲击：JSX 是什么鬼

Vue 的模板语法让我感觉很亲切——写起来像写 HTML：

```html
<!-- Vue 模板：使用双大括号插值，@前缀绑定事件 -->
<template>
  <div>
    <!-- {{ }} 插值表达式 -->
    <h1>{{ title }}</h1>
    <!-- @click 绑定点击事件 -->
    <button @click="handleClick">点击</button>
  </div>
</template>

<script>
export default {
  data() {
    return { title: 'Hello Vue' }
  },
  methods: {
    handleClick() {
      console.log('按钮被点击了');
    }
  }
}
</script>
```

React 的写法完全不同：

```jsx
// React JSX：JavaScript 的语法扩展，在 JS 中写 HTML
// 这不是真正的 HTML，而是 JSX 语法，会被编译成 React.createElement 调用
function App() {
  // 定义数据：使用 const 声明的普通变量
  const title = 'Hello React';

  // 定义事件处理函数：普通 JS 函数
  function handleClick() {
    console.log(' clicked'); // 注意：React 中事件处理函数传入的是合成事件对象
  }

  // return 的不是 HTML，而是 JSX——一种看起来像 HTML 的 JavaScript 表达式
  return (
    // JSX 必须有一个根元素包裹
    <div>
      {/* {title} 插值表达式，用于在 JSX 中嵌入 JS 变量或表达式 */}
      <h1>{title}</h1>
      {/* onClick 驼峰命名，对应原生 HTML 的 onclick */}
      <button onClick={handleClick}>点击</button>
    </div>
  );
}
```

第一眼看到 `{title}` 和 `onClick={handleClick}` 的时候，我的脑子里冒出一堆问号：

- 为什么可以在 HTML 里直接写 JavaScript 表达式？
- 为什么事件处理不是 `@click` 而是 `onClick`？
- 这个 `function App()` 是组件？那 Vue 的 `export default {}` 算什么？

:::note
后来我才明白：**Vue 的模板语法是「HTML 扩展」**，模板里写的是增强版的 HTML。**React 的 JSX 是「JavaScript 扩展」**，在 JS 里写类似 HTML 的语法。两者思路完全相反，但殊途同归——最终都是生成 DOM。
:::

## 第一个门槛：理解 Virtual DOM

教程里反复提到「Virtual DOM」，但我完全不理解这是个什么东西。

> 「Virtual DOM 是真实 DOM 的 JavaScript 对象表示」

这句话我看了三遍，还是似懂非懂。直到看到了这张图：

```
真实 DOM 树（浏览器中的结构）：
<html>
  <head>
    <title>页面标题</title>
  </head>
  <body>
    <div id="app">
      <h1>标题</h1>
    </div>
  </body>
</html>

Virtual DOM（React 内部的 JavaScript 对象）：
{
  type: 'div',                    // 标签名
  props: { id: 'app' },           // 属性
  children: [                     // 子元素
    {
      type: 'h1',                 // 嵌套的子元素
      props: {},
      children: ['标题']
    }
  ]
}
```

**为什么需要 Virtual DOM？**

直接操作真实 DOM 是很慢的。想象一下，如果要更新页面上的一个标题：

| 方式 | 操作 | 速度 |
|------|------|------|
| 直接操作 DOM | `document.getElementById('title').textContent = '新标题'` | 每次都触发重排、重绘，浏览器开销大 |
| Virtual DOM | 更新 JS 对象 → diff 算法 → 只更新变化的部分 | 批量更新，只做最小变更 |

```jsx
// React 的工作原理（简化版）

// 1. 定义组件（返回 Virtual DOM）
// JSX 会被 Babel 等工具编译成 React.createElement 调用
function Title() {
  return <h1>Hello</h1>;
  // 编译后等价于：
  // return React.createElement('h1', null, 'Hello');
}

// 2. React 会把这个 JSX 转换成 Virtual DOM 对象
// {
//   type: 'h1',
//   props: {},
//   children: ['Hello']
// }

// 3. 当状态变化时，React会比较新旧 Virtual DOM（Diff 算法）
// 4. 只把变化的部分应用到真实 DOM 上（最小化重绘重排）
```

**Virtual DOM 的价值**：让我们用「声明式」的方式写 UI，不用关心 DOM 操作的细节。React 会帮我们计算「怎么最高效地更新页面」。

:::note
类比一下：**真实 DOM 像是用手工方式修改文件**，改一行要重新排版整页。**Virtual DOM 像是用 Word 的「修订模式」**，先把所有修改记录下来，最后一次性应用，只改真正变化的部分。
:::

## JSX 语法：看起来像 HTML，但不是

习惯了 JSX 之后，我开始探索它的规则。

### 标签闭合

```jsx
// 单标签必须闭合，像 XML 一样
// 错误写法
const input1 = <input type="text">;  // JSX 表达式必须完整

// 正确写法：自闭合
const input2 = <input type="text" />;

// 嵌套标签必须正确闭合
// 错误：标签嵌套交叉
const error = <div><p>内容</div></p>;

// 正确：标签嵌套正确
const correct = <div><p>内容</p></div>;
```

### className vs class

```jsx
// HTML 中使用 class 属性
// <div class="container"></div>

// JSX 中必须使用 className，因为 class 是 JavaScript 的保留字
// JSX 编译后会变成 DOM 的 class 属性
const element = (
  <div className="container">
    <p className="title">标题</p>
  </div>
);
```

| HTML 属性 | JSX 对应 | 说明 |
|----------|---------|------|
| `class` | `className` | class 是 JS 保留字 |
| `onclick` | `onClick` | 事件处理统一用驼峰 |
| `tabindex` | `tabIndex` | 同上 |
| `stroke-width` | `strokeWidth` | CSS 属性转驼峰 |
| `readonly` | `readOnly` | 同上 |

### 表达式插入

JSX 的大括号 `{}` 可以嵌入任何 JavaScript 表达式：

```jsx
// UserCard 组件：展示用户信息卡片
function UserCard() {
  // 定义数据：普通 JS 变量
  const name = '张三';
  const age = 20;
  const isAdult = age >= 18; // 三元表达式

  return (
    <div className="card">
      {/* 嵌入变量 */}
      <h1>{name}</h1>
      {/* 嵌入表达式：算数运算 */}
      <p>年龄：{age}</p>
      {/* 嵌入表达式：三元运算符 */}
      <p>状态：{isAdult ? '成年人' : '未成年'}</p>
      {/* 嵌入表达式：函数调用 */}
      <p>三年后：{age + 3}</p>
      {/* 嵌入表达式：数组方法 */}
      <p>名字长度：{name.length}</p>
    </div>
  );
}
```

**Vue 的 `{{ }}` 对应 React 的 `{ }`**，只是写法略有不同。

## 组件：一切皆组件

React 的核心理念是「一切皆组件」。

### 函数组件

```jsx
// 最简单的组件：函数
// React 认为 UI 是组件的组合，每个组件都是一个函数
// 函数组件返回 JSX，描述 UI 长什么样
function Welcome() {
  // 返回的 JSX 就是这个组件渲染的内容
  return <h1>欢迎</h1>;
}

// 在其他组件中使用：像使用 HTML 标签一样使用组件
function App() {
  return (
    <div>
      {/* <Welcome /> 是一个自定义标签，对应上面的 Welcome 函数 */}
      <Welcome />
    </div>
  );
}
```

### Props：组件的「参数」

Vue 用 `props` 接收父组件的数据，React 也不例外：

```jsx
// 定义一个 User 组件，接收 name 和 age 参数
// props 是一个对象，包含了父组件传过来的所有数据
function User(props) {
  // 访问 props 的方式：props.属性名
  return (
    <div>
      <p>姓名：{props.name}</p>
      <p>年龄：{props.age}</p>
    </div>
  );
}

// 使用时传入数据：像使用 HTML 属性一样传 props
function App() {
  return (
    <div>
      {/* name 和 age 是传给 User 组件的 props */}
      <User name="张三" age={20} />
      <User name="李四" age={25} />
    </div>
  );
}
```

### 解构 props

```jsx
// 原始写法：直接使用 props 对象
function User(props) {
  return (
    <div>
      <p>姓名：{props.name}</p>
      <p>年龄：{props.age}</p>
      {/* 每次都要写 props. 很麻烦 */}
    </div>
  );
}

// 解构写法：直接从 props 中提取需要的属性
// ES6 解构语法，更简洁
function User({ name, age }) {
  return (
    <div>
      <p>姓名：{name}</p>
      <p>年龄：{age}</p>
    </div>
  );
}
```

**Vue 的 props 对应 React 的 props**，写法不同但原理一样。

## State 和 Hooks：让组件「活」起来

如果组件只有 props，那就只是「静态展示」。要让它「动」起来，就需要 state。

### useState：最常用的 Hook

```jsx
// useState 是 React 内置的 Hook，用于在函数组件中添加状态
// Hook 是 React 16.8 引入的新特性，让函数组件也能有状态
import { useState } from 'react';

// 计数器组件：点击按钮数字会变化
function Counter() {
  // useState(0) 初始化状态值为 0
  // 返回一个数组：[当前值, 更新函数]
  // 约定俗成：用 [xxx, setXxx] 的命名方式
  const [count, setCount] = useState(0);

  return (
    <div>
      {/* 读取状态：直接使用 count 变量 */}
      <p>计数：{count}</p>
      {/* 点击按钮调用 setCount 更新状态 */}
      {/* setCount 会触发组件重新渲染，UI 自动更新 */}
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count - 1)}>-1</button>
    </div>
  );
}
```

| 概念 | Vue2 | Vue3 | React |
|------|------|------|-------|
| 数据存放 | `data()` | `ref/reactive` | `useState` |
| 更新数据 | 直接赋值 | `ref.value = x` | `setX(x)` |
| 触发更新 | 自动响应 | 自动响应 | 自动触发重渲染 |

:::note
Vue 的响应式是「自动的」——改了数据，视图自动更新。React 的响应式是「手动的」——要调用 `setX()` 才会触发更新。这不是优劣之分，只是设计哲学不同。
:::

### useEffect：处理副作用

Vue 有生命周期钩子（`created`、`mounted` 等），React 用 Hook 实现类似功能。

```jsx
import { useState, useEffect } from 'react';

// 用户资料组件：根据 userId 获取并显示用户信息
function UserProfile({ userId }) {
  // user: 存储用户数据，初始为 null（表示还没有数据）
  const [user, setUser] = useState(null);
  // loading: 存储加载状态，初始为 true（表示正在加载）
  const [loading, setLoading] = useState(true);

  // useEffect 用于处理副作用：数据获取、订阅、定时器等
  // 第一个参数：副作用逻辑（函数）
  // 第二个参数：依赖数组
  useEffect(() => {
    // 模拟获取用户数据的异步请求
    setLoading(true); // 开始加载，先把 loading 设为 true

    // fetch 是浏览器 API，用于发送网络请求
    fetch(`/api/users/${userId}`)           // 发送 GET 请求到接口
      .then(res => res.json())              // 解析响应为 JSON
      .then(data => {                      // data 就是获取到的用户数据
        setUser(data);                     // 更新 user 状态
        setLoading(false);                  // 加载完成，loading 设为 false
      })
      .catch(err => {                      // 处理请求错误
        console.error('获取用户失败:', err);
        setLoading(false);
      });
  }, [userId]); // 依赖项：userId 变化时重新执行 effect

  // 条件渲染：根据 loading 状态显示不同内容
  if (loading) return <p>加载中...</p>;  // 正在加载，显示加载提示

  // 加载完成，显示用户信息
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**useEffect 的第二个参数**控制什么时候执行：

| 写法 | 执行时机 |
|------|---------|
| `useEffect(() => {...})` | 每次渲染后都执行（容易导致性能问题） |
| `useEffect(() => {...}, [])` | 仅首次渲染后执行（类似 Vue 的 `mounted`） |
| `useEffect(() => {...}, [x, y])` | `x` 或 `y` 变化时执行 |

:::note
**清理副作用**：有些副作用需要清理，比如定时器、订阅等。可以在 useEffect 里返回一个函数。
:::

### useRef：访问 DOM 和保存可变值

```jsx
import { useState, useRef, useEffect } from 'react';

// 定时器组件：每秒增加计数
function Timer() {
  const [count, setCount] = useState(0);       // 计数状态
  // useRef 返回一个 ref 对象，.current 属性存储值
  // ref 的特点是：修改 .current 不会触发重新渲染
  const intervalRef = useRef(null);           // 存储定时器 ID

  useEffect(() => {
    // 设置定时器：每秒执行一次，增加计数
    intervalRef.current = setInterval(() => {
      // setCount 支持函数形式：传入旧值，返回新值
      // 这种写法比 setCount(count + 1) 更安全（避免闭包问题）
      setCount(c => c + 1);
    }, 1000);  // 1000ms = 1秒

    // 清理函数：组件卸载时清除定时器
    // 如果不清理，会导致内存泄漏
    return () => clearInterval(intervalRef.current);
  }, []); // 空依赖：只执行一次

  return (
    <div>
      <p>计数：{count}</p>
      {/* 通过 ref 访问 DOM */}
      <button onClick={() => clearInterval(intervalRef.current)}>停止</button>
    </div>
  );
}
```

## 条件渲染：显示什么的艺术

Vue 用 `v-if`、`v-show`，React 用 JavaScript 的逻辑运算符：

```jsx
// 欢迎组件：根据登录状态显示不同内容
function Greeting({ isLoggedIn }) {
  // 方式一：三元运算符，最常用
  return (
    <div>
      {isLoggedIn ? <h1>欢迎回来</h1> : <h1>请登录</h1>}
    </div>
  );
}

// 消息盒子组件：显示消息数量
function Mailbox({ messages }) {
  // 方式二：&& 运算符，适合条件为真时渲染内容
  return (
    <div>
      <h1>消息列表</h1>
      {/* 技巧：messages.length > 0 为真时，渲染后面的 JSX */}
      {messages.length > 0 && (
        <p>你有 {messages.length} 条新消息</p>
      )}
    </div>
  );
}
```

:::warning
**注意**：`&&` 运算符在 `condition && <Component />` 中，如果 `condition` 为 `false`，`false` 会被渲染（但 React 会忽略它）。更安全的写法是用三元运算符。
:::

## 列表渲染：map 是你的好朋友

Vue 用 `v-for`，React 用 `map`：

```jsx
// 博客列表组件：渲染多篇文章
function BlogList() {
  // 博客文章数据：数组，每个元素是一个文章对象
  const posts = [
    { id: 1, title: 'React 入门', content: '...' },
    { id: 2, title: 'Vue 进阶', content: '...' },
    { id: 3, title: 'TypeScript 实践', content: '...' }
  ];

  return (
    <div>
      {/* map 遍历数组，返回 JSX 数组 */}
      {/* 每个 JSX 元素都需要唯一的 key 属性 */}
      {posts.map(post => (
        // key 帮助 React 识别哪些元素改变了
        // key 必须是稳定的唯一值，通常用 id
        <div key={post.id} className="post">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
}
```

**`key` 的重要性**：和 Vue 一样，React 用 `key` 帮助识别哪些元素改变了。必须用唯一值，不能用索引。

```jsx
// 错误：使用索引作为 key
// 如果数组顺序变化，会导致 key 对应错误，渲染出错
{items.map((item, index) => (
  <div key={index}>...</div>  // 索引不稳定，慎用
))}

// 正确：使用唯一 ID 作为 key
// id 是数据的固有属性，稳定且唯一
{items.map(item => (
  <div key={item.id}>...</div>
))}
```

## 组件通信：Context 和状态管理

Vue 有 `props`、`$emit`、`Vuex`、`Pinia`，React 有类似方案。

### Props 层层传递（类比 Vue）

```jsx
// 爷组件：最顶层组件，管理数据
function GrandParent() {
  // 爷组件定义数据
  const [message, setMessage] = useState('Hello');
  return <Parent message={message} />; // 传给父组件
}

// 父组件：中间层，只负责转发数据
function Parent({ message }) {
  return <Child message={message} />; // 再传给子组件
}

// 子组件：最终使用数据的组件
function Child({ message }) {
  return <p>{message}</p>; // 显示数据
}
```

**问题**：如果嵌套很深（比如 5-6 层），props 要一层层传下去，很麻烦，叫「Prop Drilling」。

### Context：跨层级共享（类比 Vue Provide/Inject）

```jsx
import { createContext, useContext, useState } from 'react';

// 1. 创建 Context：类似创建一个"数据通道"
// createContext 参数是默认值，当没有 Provider 时使用
const ThemeContext = createContext('light');

// 2. 祖先组件提供数据
function App() {
  // 使用 useState 管理主题状态
  const [theme, setTheme] = useState('dark');

  // 使用 Provider 包裹子组件
  // value 属性传递要共享的数据
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Toolbar /> {/* Toolbar 不需要传 props，可以直接访问 theme */}
    </ThemeContext.Provider>
  );
}

// 3. Toolbar 是中间层，不需要知道 theme 的存在
function Toolbar() {
  // 直接渲染子组件，不传递任何 props
  return <ThemedButton />;
}

// 4. 孙组件直接使用 Context
function ThemedButton() {
  // useContext 获取最近 Provider 的 value
  // 如果没有 Provider，使用默认值 'light'
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    // 根据 theme 状态切换按钮样式
    <button className={theme}>
      当前主题：{theme}
    </button>
  );
}
```

| 场景 | Vue 方案 | React 方案 |
|------|---------|-----------|
| 父子通信 | props + $emit | Props |
| 跨层级共享 | Provide/Inject | Context |
| 全局状态 | Pinia/Vuex | Redux/Zustand/Context |

## 状态管理：Redux 和 Zustand

当应用变得复杂，Context 就不够用了。这时需要专门的状态管理库。

### Redux：最经典的状态管理方案

Redux 的核心概念：**Store（仓库）**、**Action（动作）**、**Reducer（处理器）**。

```jsx
// Redux 工作流程：
// 1. 组件 dispatch 一个 Action（描述要做什么）
// 2. Store 调用 Reducer 处理 Action
// 3. Reducer 返回新的 State
// 4. 组件订阅 Store 变化，自动重新渲染

// ========== 第一步：定义 Redux Store ==========

// reducer 是一个纯函数：接收旧状态和 action，返回新状态
// 不能有副作用（API调用、随机数等）
function counterReducer(state = { count: 0 }, action) {
  // 根据 action.type 判断要做什么
  switch (action.type) {
    case 'INCREMENT':
      // 返回新状态（不要直接修改原状态）
      return { count: state.count + 1 };

    case 'DECREMENT':
      return { count: state.count - 1 };

    default:
      // 返回原状态（没匹配到的 action）
      return state;
  }
}

// ========== 第二步：创建 Store ==========

import { createStore } from 'redux';

// createStore 接收 reducer，创建 Store
const store = createStore(counterReducer);

// ========== 第三步：组件中使用 ==========

// Counter 组件：显示计数
function Counter() {
  // getState() 获取当前状态
  const count = store.getState().count;

  return (
    <div>
      <p>计数：{count}</p>
      {/* dispatch 发送 action，触发状态更新 */}
      <button onClick={() => store.dispatch({ type: 'INCREMENT' })}>+1</button>
      <button onClick={() => store.dispatch({ type: 'DECREMENT' })}>-1</button>
    </div>
  );
}

// ========== 第四步：订阅变化 ==========

// subscribe 注册监听器，状态变化时自动调用
// 返回 unsubscribe 函数，调用可取消订阅
const unsubscribe = store.subscribe(() => {
  console.log('状态变化了', store.getState());
  // 实际项目中这里会触发组件更新
});
```

:::note
**Redux 三大原则**：
1. **单一数据源**：整个应用只有一个 Store
2. **State 只读**：不能直接修改 State，只能通过 Action
3. **纯函数修改**：Reducer 必须是纯函数
:::

### Redux Toolkit：现代 Redux 写法

原生 Redux 写起来繁琐，Redux Toolkit（RTK）简化了这一切：

```jsx
import { configureStore, createSlice } from '@reduxjs/toolkit';

// ========== 使用 createSlice 创建状态模块 ==========

// createSlice 一步到位：创建 reducer 和 action creators
const counterSlice = createSlice({
  name: 'counter',            // 模块名称，用于生成 action type
  initialState: { count: 0 }, // 初始状态
  reducers: {                 // 定义 reducer 逻辑
    increment: (state) => {
      // RTK 的 state 是可修改的（内部使用 Immer）
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
    incrementBy: (state, action) => {
      // action.payload 是 dispatch 传过来的数据
      state.count += action.payload;
    }
  }
});

// 自动生成 action creators
const { increment, decrement, incrementBy } = counterSlice.actions;

// ========== 创建 Store ==========

const store = configureStore({
  // reducer 可以组合多个 slice
  reducer: {
    counter: counterSlice.reducer
  }
});

// ========== 组件中使用 ==========

function Counter() {
  const count = store.getState().counter.count;

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={() => store.dispatch(increment())}>+1</button>
      <button onClick={() => store.dispatch(decrement())}>-1</button>
      <button onClick={() => store.dispatch(incrementBy(5))}>+5</button>
    </div>
  );
}
```

### Redux vs Vuex/Pinia 对比

| 特性 | Redux | Vuex | Pinia |
|------|-------|------|-------|
| API 风格 | 冗长 | 简洁 | 最简洁 |
| 模板代码 | 多 | 中 | 少 |
| Immutability | 手动处理 | 自动处理 | 自动处理 |
| 调试工具 | Redux DevTools | Vue DevTools | Pinia DevTools |
| 学习曲线 | 陡峭 | 平缓 | 平缓 |

### Zustand：轻量级状态管理

Redux 太复杂？Zustand 是一个更简单的替代品：

```jsx
import { create } from 'zustand';

// ========== 创建 Store（一步到位） ==========

// create 函数接收一个回调函数，返回 hook
// 回调函数里定义状态和方法
const useStore = create((set) => ({
  // 状态：count
  count: 0,

  // 方法：increment，直接调用 set({}) 更新状态
  // set 是函数，传入要更新的部分状态
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),

  // 方法：带参数
  incrementBy: (amount) => set((state) => ({ count: state.count + amount })),

  // 异步方法：处理异步逻辑
  fetchUser: async (userId) => {
    // 先设置 loading 状态
    set({ loading: true });

    try {
      const res = await fetch(`/api/users/${userId}`);
      const user = await res.json();

      // 更新用户数据和 loading 状态
      set({ user, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

// ========== 组件中使用 ==========

// 直接在组件里调用 hook 获取状态和方法
function Counter() {
  // 解构出需要的状态和方法
  const { count, increment, decrement, incrementBy } = useStore();

  return (
    <div>
      <p>计数：{count}</p>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={() => incrementBy(5)}>+5</button>
    </div>
  );
}

// 另一个组件也可以使用同一个 store
function ResetButton() {
  const { count } = useStore();

  // 只有计数大于 0 时才显示重置按钮
  if (count <= 0) return null;

  return (
    <button onClick={() => useStore.setState({ count: 0 })}>
      重置
    </button>
  );
}
```

### Zustand vs Redux 对比

| 特性 | Zustand | Redux |
|------|---------|-------|
| 体积 | 小（~1KB） | 大（~7KB） |
| 学习曲线 | 低 | 高 |
| Boilerplate | 少 | 多 |
| 模板代码 | 极简 | 冗长 |
| 适用场景 | 中小型项目 | 大型复杂项目 |

:::note
**什么时候用什么？**
- **Zustand**：项目不大，想快速上手，选它
- **Redux Toolkit**：项目复杂，需要严格架构，选它
- **Context**：只在少数地方需要共享数据，选它

没有绝对的好坏，只有适合与否。
:::

## React Router：路由管理

Vue 有 Vue Router，React 有 React Router。

### 基础路由配置

```jsx
// ========== 安装 ==========
// npm install react-router-dom

// ========== 基本使用 ==========

import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

// 首页组件
function Home() {
  return <h1>首页</h1>;
}

// 用户详情组件：接收 URL 参数
function UserProfile() {
  // useParams hook 获取 URL 参数
  // 路由定义 :id，所以这里取到的是用户 ID
  const { id } = useParams();

  return <h1>用户 ID：{id}</h1>;
}

// 文章详情组件
function Article() {
  const { id } = useParams();

  // useNavigate 编程式导航
  const navigate = useNavigate();

  return (
    <div>
      <h1>文章 ID：{id}</h1>
      {/* 点击返回文章列表 */}
      <button onClick={() => navigate('/articles')}>返回列表</button>
    </div>
  );
}

// 文章列表组件
function ArticleList() {
  return <h1>文章列表</h1>;
}

// ========== 路由配置 ==========

function App() {
  return (
    // BrowserRouter：使用 HTML5 History API，URL 美观
    // 所有路由相关组件必须包在 Router 里
    <BrowserRouter>
      {/* Link 组件：点击不刷新页面，但 URL 会变 */}
      {/* 相当于 Vue 的 <router-link> */}
      <nav>
        <Link to="/">首页</Link>
        <Link to="/users/123">用户123</Link>
        <Link to="/articles">文章列表</Link>
      </nav>

      {/* Routes：路由出口，所有 Route 的渲染位置 */}
      {/* 相当于 Vue 的 <router-view> */}
      <Routes>
        {/* exact 表示精确匹配，只有路径完全一致才渲染 */}
        <Route path="/" element={<Home />} />

        {/* :id 是动态参数，匹配 /users/任意值 */}
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<Article />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 嵌套路由

```jsx
// ========== 嵌套路由：布局 + 子路由 ==========

function Dashboard() {
  return (
    <div>
      <h1>仪表盘</h1>
      {/* 子路由出口 */}
      <Routes>
        <Route path="overview" element={<Overview />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* /dashboard 渲染 Dashboard，Dashboard 内部再渲染子路由 */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 编程式导航

```jsx
function LoginButton() {
  const navigate = useNavigate();

  async function handleLogin() {
    // 模拟登录请求
    await login();

    // 登录成功后，跳转到首页
    navigate('/');
  }

  return <button onClick={handleLogin}>登录</button>;
}
```

## 表单处理：受控组件与非受控组件

Vue 有 `v-model` 双向绑定，React 的表单处理方式不同。

### 受控组件：表单数据由 React 管理

```jsx
import { useState } from 'react';

// 受控组件：表单的值受 React 状态控制
function LoginForm() {
  // 每个表单字段对应一个状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  // 表单提交处理
  function handleSubmit(e) {
    // 阻止表单默认提交行为（刷新页面）
    e.preventDefault();

    // 收集表单数据
    const formData = {
      username,
      password,
      remember
    };

    console.log('提交的数据：', formData);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 输入框：value 绑定状态，onChange 更新状态 */}
      <input
        type="text"
        value={username}                    // 受控：值来自 state
        onChange={(e) => setUsername(e.target.value)} // 更新 state
        placeholder="用户名"
      />

      {/* 密码框 */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="密码"
      />

      {/* 复选框 */}
      <label>
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        记住我
      </label>

      {/* 提交按钮 */}
      <button type="submit">登录</button>
    </form>
  );
}
```

### 简化：统一处理多个输入框

```jsx
import { useState } from 'react';

// 使用一个状态对象管理所有字段
function LoginForm() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: false
  });

  // 统一的 change 处理函数
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    // 根据表单字段类型获取正确的值
    // checkbox 用 checked，其他用 value
    const newValue = type === 'checkbox' ? checked : value;

    // 更新对应字段：ES6 计算属性名 [name]
    setForm({
      ...form,           // 展开原有字段
      [name]: newValue   // 更新对应字段
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log('提交的数据：', form);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* name 属性对应 state 的字段名 */}
      <input
        name="username"
        type="text"
        value={form.username}
        onChange={handleChange}
      />
      <input
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
      />
      <input
        name="remember"
        type="checkbox"
        checked={form.remember}
        onChange={handleChange}
      />
      <button type="submit">登录</button>
    </form>
  );
}
```

### 非受控组件：表单数据由 DOM 管理

```jsx
import { useRef } from 'react';

// 非受控组件：不使用 value/onChange
// 通过 ref 直接访问 DOM 元素获取值
function UncontrolledForm() {
  const usernameRef = useRef();
  const passwordRef = useRef();

  function handleSubmit(e) {
    e.preventDefault();

    // 通过 ref 获取 DOM 元素，再获取值
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    console.log('用户名：', username);
    console.log('密码：', password);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* defaultValue 设置初始值，之后由 DOM 管理 */}
      <input ref={usernameRef} type="text" defaultValue="admin" />
      <input ref={passwordRef} type="password" />
      <button type="submit">登录</button>
    </form>
  );
}
```

**受控 vs 非受控**：

| 特性 | 受控组件 | 非受控组件 |
|------|---------|-----------|
| 数据管理 | React 状态 | DOM |
| 实时验证 | 方便 | 需要手动获取 |
| 使用场景 | 复杂表单 | 简单表单、文件上传 |

## React vs Vue：到底谁更好

学完 React 基础后，我忍不住把两个框架做了对比。

| 维度 | React | Vue |
|------|-------|-----|
| 设计哲学 | 「JavaScript 而非 HTML」 | 「保留 HTML 的熟悉感」 |
| 模板 vs JSX | JSX | Vue 模板 |
| 学习曲线 | 入门稍陡（JSX 陌生） | 入门平缓（模板像 HTML） |
| 灵活性 | 高（社区方案多） | 中（官方方案完备） |
| 状态管理 | Redux/Zustand | Pinia/Vuex |
| 官方生态 | 较轻，依赖社区 | 较重，官方提供完整方案 |
| 市场占用 | 略高 | 略低 |

**我的理解**：

- **Vue** 像是「贴心的保姆」——给你准备好模板、指令、响应式系统，你按照它的规矩来就行
- **React** 像是「自由的工匠」——只给你核心能力，怎么搭由你决定

两者没有绝对的优劣，只有适用场景不同。

:::note
站在 2023 年底的时间点，React 的生态更丰富，工作机会也更多。但 Vue 的上手体验更友好，文档也更易读。
:::

## 构建工具：Vite 依然是 yyds

和 Vue3 一样，React 也可以用 Vite 创建项目：

```bash
# 使用 Vite 创建 React 项目
# --template react 指定使用 React 模板
npm create vite@latest my-react-app -- --template react

# 进入项目目录
cd my-react-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**秒开的感觉，和 Vue 一样爽。**

## 写在最后

回顾这段学习经历，有一点感悟很深：

> **框架是工具，思维才是核心。**

无论是 Vue 的「响应式数据驱动」，还是 React 的「状态驱动渲染」，它们解决的都是同一个问题：**如何让 UI 和数据保持同步**。

只是思路不同：

- Vue 告诉你「数据变了，视图自动更新」
- React 告诉你「状态变了吗？变了我就重新渲染」

学 Vue 的时候，我学会了「跟着框架的思路走」。学 React 的时候，我开始理解「框架背后的思想」。

从 Props 到 State，从 Context 到 Redux/Zustand，React 教会我一件事：**任何复杂的问题都可以通过合理的抽象来解决**。

- Props 层层传递太麻烦？用 Context
- 全局状态太混乱？用 Zustand
- 项目太大太复杂？用 Redux Toolkit

这就是成长：**从会用，到理解为什么能用，再到理解为什么不这样用。**

---

*生涯补全系列，记录成长路上的每一次技术冲击。*
