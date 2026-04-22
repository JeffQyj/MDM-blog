---
title: 编程生涯：Vue2与Vue3
published: 2023-12-06
description: 回忆 2023 年 12 月跟着黑马教程先学 Vue2 再学 Vue3 的经历，记录从懵懂到理解的过程，以及两个版本之间的核心差异。
tags: [Vue, 前端]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这是「生涯补全」系列的技术篇，记录从 Vue2 到 Vue3 的学习历程。
:::

## 起航：从「套模板」开始

2023 年 12 月，我开始学习 Vue。

彼时已学完前端三件套和 JS 基础与进阶知识，正是信心满满准备进军框架的时候。老师说：「前端框架学 Vue，入门快、文档好、社区活跃。」

于是我打开黑马的教程视频，准备大干一场。

老师的教学路线是：先 Vue2 打基础，再 Vue3 跟进新特性。我当时的心态是：「Vue2 学完再说，Vue3 等学完再看不迟。」

结果等 Vue2 学完，开始 Vue3 的那一刻——

> 「这...真的是同一个框架？」

## Vue2 上手：框架的第一印象

### 创建项目：Webpack 时代

跟着教程，我敲下了第一行命令：

```bash
vue init webpack my-first-vue
cd my-first-vue
npm install
npm run dev
```

然后就是漫长的等待——`npm install` 装了一大堆依赖，`npm run dev` 等了好几秒才看到编译完成的提示。

打开 `http://localhost:8080`，看到 Vue 默认的启动页面时，心里还挺激动的：「哇，这就是传说中的 Vue 项目！」

:::note
后来我才知道，这个「漫长等待」是 Webpack 时代的标配。每次改代码都要重新编译，热更新时间以秒计算。等切换到 Vite 之后，才知道什么叫「飞一般的感觉」。
:::

### 模板语法：双大括号的神奇

教程第一个例子是这个：

```html
<!-- Vue 模板：类似写 HTML，但可以在 {{ }} 里写 JavaScript 表达式 -->
<div id="app">
  <!-- {{ message }} 会自动替换成 data 里的 message 值 -->
  <h1>{{ message }}</h1>
  <!-- 支持表达式：字符串拼接 -->
  <p>我叫 {{ name }}，今年 {{ age }} 岁</p>
</div>
```

```javascript
// 创建 Vue 实例
new Vue({
  // el 是 "element" 的缩写，指定这个实例接管哪个 DOM 元素
  // '#app' 是 CSS 选择器语法，表示 id="app" 的元素
  // 也就是说：把 <div id="app">...</div> 这块区域交给 Vue 管理
  el: '#app',

  // data 里定义的数据会自动变成「响应式」的
  // 改这些值，页面会自动更新——这就是 Vue 的核心能力
  data: {
    message: 'Hello Vue!',
    name: '张三',
    age: 20
  }
})
```

我盯着双大括号 `{{ }}` 看了半天：「这不就是把 JavaScript 的变量塞进 HTML 里吗？」

教程说这叫「插值表达式」，可以动态渲染数据。我试着改了改 `data` 里的值，页面居然真的自动更新了——不用手动 `innerHTML`，不用重新加载页面。

:::note
当时的感受：**神奇，但不知道为什么神奇。**
:::

#### 对比感：没有框架之前怎么写

后来我回头想，如果不用 Vue，用原生 JavaScript 怎么实现同样效果？

```html
<!-- 原生写法：HTML 只负责结构，不负责数据 -->
<div id="app">
  <h1 id="title"></h1>
  <p id="info"></p>
</div>
```

```javascript
// 数据
const data = {
  message: 'Hello Vue!',
  name: '张三',
  age: 20
};

// 手动更新 DOM——数据变了，视图不会自动变
document.getElementById('title').textContent = data.message;
document.getElementById('info').textContent = '我叫 ' + data.name + '，今年 ' + data.age + ' 岁';

// 如果想「数据变，视图跟着变」——就得自己写一堆逻辑
function updateView() {
  document.getElementById('title').textContent = data.message;
  document.getElementById('info').textContent = '我叫 ' + data.name + '，今年 ' + data.age + ' 岁';
}

// 每次改数据都要手动调用 updateView
data.message = 'Hello World';  // 这样改，页面不会变！
updateView();  // 必须手动调用，页面才变
```

**对比一下**：

| 维度 | 原生 JavaScript | Vue |
|------|----------------|-----|
| 数据定义 | 普通对象 | 响应式 data 对象 |
| 更新视图 | 手动操作 DOM | 数据变 → 视图自动变 |
| 代码量 | 要写获取元素、赋值、刷新逻辑 | 模板里放 `{{ }}` 就行 |
| 维护 | 数据和 DOM 分散，难以追踪 | 数据和视图绑定，清晰可控 |

Vue 的好处立竿见影：**数据归数据，视图归视图，Vue 在中间自动同步。**

### 指令系统：v-开头的魔法

教程接着讲指令，这是 Vue 最独特的标识——以 `v-` 开头的特殊属性。

#### v-bind：让属性动态起来

```html
<!-- 静态写法 -->
<img src="https://example.com/logo.png">

<!-- 动态写法：用 v-bind 绑定 src -->
<img v-bind:src="imageUrl">
<img :src="imageUrl">  <!-- 简写形式 -->
```

```javascript
new Vue({
  el: '#app',
  data: {
    imageUrl: 'https://example.com/logo.png'
  }
})
```

第一次用 `:src` 替代 `v-bind:src` 时，我停下来反复确认：「这样写居然也能运行？」

#### v-model：双向绑定的初体验

```html
<input v-model="username" type="text">
<p>你输入的是：{{ username }}</p>
```

```javascript
data: {
  username: ''
}
```

我在输入框里打字，下面的 `<p>` 标签里的文字跟着变；我在 `data` 里改了 `username` 的值，输入框里的文字也跟着变。

这就是传说中的「双向绑定」？确实有点东西。

:::note
当时只是会用，理解「双向」是什么意思花了不少时间：数据变 → 视图变，视图变 → 数据也变。
:::

#### v-if 和 v-show：傻傻分不清

这两个指令让我困惑了很久。

```html
<!-- 方案一：v-if -->
<div v-if="isShow">我会消失</div>

<!-- 方案二：v-show -->
<div v-show="isShow">我也会消失</div>
```

效果看起来一模一样，但教程说「不一样」。

| 特性 | v-if | v-show |
|------|------|--------|
| 原理 | 动态添加/移除 DOM | 切换 display 属性 |
| 初始渲染 | 条件为 false 时不渲染 | 条件为 false 时渲染但不显示 |
| 切换开销 | 高（创建/销毁） | 低（只改样式） |
| 适用场景 | 很少切换 |频繁切换 |

我尝试的笨办法是：**遇到不确定用哪个的情况，就两个都试试，看哪个效果对就用哪个。**

后来才明白：「如果元素要频繁切换，用 `v-show`；如果条件很少为 true，用 `v-if`。」

#### v-for：循环渲染列表

这是第一个让我觉得「Vue 真的很强大」的功能：

```html
<ul>
  <li v-for="item in fruits" :key="item.id">
    {{ item.name }} - {{ item.price }}元
  </li>
</ul>
```

```javascript
data: {
  fruits: [
    { id: 1, name: '苹果', price: 5 },
    { id: 2, name: '香蕉', price: 3 },
    { id: 3, name: '橙子', price: 6 }
  ]
}
```

以前用原生 JavaScript 渲染列表，要写 `for` 循环、`document.createElement`、`appendChild` 一堆操作。现在几行模板就搞定了。

**`:key` 的作用一开始我完全不理解**，教程说「要加 key 帮助 Vue 识别每个节点」，但我不加好像也能跑。

后来踩了个坑才明白：

```html
<!-- 不加 key：删除第二项时，可能错删成第三项 -->
<li v-for="item in fruits">{{ item.name }}</li>

<!-- 加 key：Vue 能精准追踪每个节点 -->
<li v-for="item in fruits" :key="item.id">{{ item.name }}</li>
```

:::warning
血的教训：v-for 的 key 一定要用唯一值（如 id），不要用索引 index。因为用索引做 key 时，删除中间项会导致错位。
:::

#### v-on：绑定事件

```html
<button v-on:click="handleClick">点我</button>
<button @click="handleClick">点我（简写）</button>
```

```javascript
methods: {
  handleClick() {
    alert('按钮被点击了！');
  }
}
```

当时觉得简写形式 `@click` 很酷，但用多了才发现：**原生事件（如 `onclick`）是「on」开头，Vue 指令是「@」开头**，不要混淆。

### 计算属性：第一次用「缓存」提升性能

```html
<p>原价：{{ price }}元</p>
<p>折后价：{{ discountPrice }}元</p>
<p>含税价：{{ taxPrice }}元</p>
```

```javascript
data: {
  price: 100,
  taxRate: 0.13
},
computed: {
  discountPrice() {
    console.log('计算折扣价');  // 验证是否被调用
    return this.price * 0.8;
  },
  taxPrice() {
    console.log('计算含税价');  // 验证是否被调用
    return this.price * (1 + this.taxRate);
  }
}
```

一开始我觉得计算属性（`computed`）和 methods 没什么区别——都能定义函数，都能用于模板。

直到我在 `discountPrice` 和 `taxPrice` 里加了 `console.log`，然后在组件里多次使用这两个值：

```html
<div>{{ discountPrice }}</div>
<div>{{ discountPrice }}</div>
<div>{{ discountPrice }}</div>
```

**methods 每次都打印，但 computed 只打印一次。**

这就是计算属性的「缓存」特性：**依赖的数据没变，就不重新计算。**

:::note
计算属性适合处理「基于已有数据派生出新数据」的场景，比如总价、折扣价、格式化等。
:::

### 监听器：watch 的使用场景

```javascript
watch: {
  username(newVal, oldVal) {
    console.log(`用户名从 "${oldVal}" 变成了 "${newVal}"`);
    if (newVal.length < 3) {
      console.log('用户名太短了');
    }
  }
}
```

监听器（`watch`）和计算属性（`computed`）的区别困扰了我很久：

| 特性 | computed | watch |
|------|----------|-------|
| 用途 | 派生新值 | 执行副作用 |
| 返回值 | 必须有返回值 | 不一定有 |
| 同步/异步 | 同步 | 可同步可异步 |
| 适用场景 | 数据转换、过滤 | 异步操作、条件触发 |

**简单记忆**：算新值用 `computed`，要「看到旧值变了自己做点什么」用 `watch`。

### 组件通信：props 和 $emit

教程到这里的时候，我已经有点晕了。

```javascript
// Parent.vue
<template>
  <Child :title="pageTitle" @update="handleUpdate"></Child>
</template>

<script>
export default {
  data() {
    return { pageTitle: '首页' }
  },
  methods: {
    handleUpdate(newTitle) {
      this.pageTitle = newTitle;
    }
  }
}
</script>
```

```javascript
// Child.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="changeTitle">修改标题</button>
  </div>
</template>

<script>
export default {
  props: ['title'],  // 接收父组件的数据
  methods: {
    changeTitle() {
      this.$emit('update', '新标题');  // 通知父组件
    }
  }
}
</script>
```

**父传子用 props，子传父用 $emit。**

这个「单向数据流」的原则我背了下来，但实际用的时候总是搞混：到底是 props 还是 $emit？

:::note
后来找到的记忆方法是：**数据从父到子用 props，子要改父的数据用 $emit 通知父，让父自己改。**
:::

### 生命周期钩子：每个阶段的入场券

Vue 的生命周期是面试常考题，但学习的时候完全没意识到它的重要性。

```javascript
new Vue({
  data: {
    message: 'Hello'
  },
  beforeCreate() {
    console.log('beforeCreate: 实例刚创建，data 和 methods 都访问不到');
  },
  created() {
    console.log('created: 可以访问 data 和 methods，DOM 还没挂载');
    this.fetchData();  // 适合在这里发请求
  },
  beforeMount() {
    console.log('beforeMount: 模板编译完成，即将挂载');
  },
  mounted() {
    console.log('mounted: DOM 已挂载，可以操作 $el 和 $refs');
    this.$refs.myInput.focus();  // 适合在这里操作 DOM
  },
  beforeUpdate() {
    console.log('beforeUpdate: 数据变化，DOM 更新前');
  },
  updated() {
    console.log('updated: DOM 更新完成');
  },
  beforeDestroy() {
    console.log('beforeDestroy: 实例即将销毁，清理定时器、事件监听');
    clearInterval(this.timer);
  },
  destroyed() {
    console.log('destroyed: 实例已销毁');
  }
})
```

当时只觉得「这些钩子名字好长」，真正理解它们的价值是在踩坑之后：

- **忘记在 `beforeDestroy` 清理定时器**，导致组件销毁后定时器还在跑，内存泄漏
- **在 `created` 里写需要 DOM 的代码**，结果报错 `$refs undefined`
- **在 `mounted` 里发请求太慢**，页面 loading 太久，后来学会在 `created` 里发

:::note
生命周期钩子就像是组件的「出生 → 成长 → 衰老 → 死亡」的过程，每个阶段都有特定适合做的事情。
:::

## Vue2 生态：Router 和 Vuex

学完基础组件之后，教程开始讲两个重要的生态工具——**Vue Router**（路由管理）和 **Vuex**（状态管理）。

如果说 Vue 基础让你会写组件，那这两个工具让你会做「应用」。

### Vue Router：第一次做「单页应用」

当时我完全不懂「路由」是什么意思——在我们的认知里，网页之间跳转就是「换页面」，A 页面跳转到 B 页面就是打开一个新 URL。

```javascript
// 以前的跳转方式：整个页面刷新
window.location.href = '/about.html';  // 浏览器要重新加载整个页面
window.location.href = '/user/123';   // 后端根据 URL 返回不同的 HTML
```

但 Vue Router 做的事情不一样：**页面不刷新，但 URL 变了，内容也变了。**

这就是「单页应用」（SPA - Single Page Application）的核心：虽然地址栏变了，但浏览器只加载了一次，之后的「跳转」都是 JavaScript 动态替换页面内容。

#### 路由配置：定义「URL 到组件」的映射

```javascript
// router/index.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import User from '@/views/User.vue';

// 安装路由插件
Vue.use(VueRouter);

// 定义路由规则：URL 路径 → 对应组件
const routes = [
  { path: '/', component: Home },           // 访问 / 显示 Home 组件
  { path: '/about', component: About },   // 访问 /about 显示 About 组件
  { path: '/user/:id', component: User }, // /user/123 → id=123
];

// 创建路由实例
const router = new VueRouter({
  routes  // 相当于 routes: routes
});

export default router;
```

#### 路由出口和链接

光有路由规则还不够，Vue 还需要知道「组件要显示在哪里」：

```html
<!-- App.vue -->
<template>
  <div id="app">
    <!-- 导航链接：点击不刷新页面，但 URL 会变 -->
    <nav>
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/user/123">我的主页</router-link>
    </nav>

    <!-- 路由出口：组件会在这里渲染 -->
    <router-view></router-view>
  </div>
</template>
```

```javascript
// main.js
import Vue from 'vue';
import App from './App.vue';
import router from './router';

new Vue({
  router,       // 注入路由
  render: h => h(App)
}).$mount('#app');
```

**核心概念**：

- `<router-link>` 渲染成 `<a>` 标签，但点击不刷新页面
- `<router-view>` 是「插槽」，路由匹配到的组件在这里显示
- URL 变化 → Vue Router 根据路径找到对应组件 → 替换 `<router-view>` 的内容

#### 动态路由：同一个组件，不同参数

```javascript
// 定义带参数的路由
{ path: '/user/:id', component: User }

// User.vue 中获取参数
export default {
  created() {
    // this.$route 是「当前路由信息对象」
    // this.$route.params 是路由参数
    console.log(this.$route.params.id);  // URL 是 /user/123，这里就是 123
  }
}
```

```html
<!-- 导航到不同用户 -->
<router-link to="/user/1">用户1</router-link>
<router-link to="/user/2">用户2</router-link>
```

:::note
这就像是「同一个页面模板，不同的数据」——User 组件是同一个，但根据 URL 参数不同，显示的用户信息也不同。
:::

#### 编程式导航：JavaScript 控制跳转

除了 `<router-link>`，还可以在 JavaScript 里跳转：

```javascript
methods: {
  goToHome() {
    // 方式一：字符串路径
    this.$router.push('/');

    // 方式二：命名路由（要给路由起 name）
    this.$router.push({ name: 'home' });

    // 方式三：带参数
    this.$router.push({ path: '/user/123' });
  },

  goBack() {
    // 后退一页
    this.$router.back();

    // 前进一页
    this.$router.forward();
  }
}
```

**$router vs $route 的区别**：

| 对象 | 说明 |
|------|------|
| `this.$router` | 路由实例，包含 `push`、`back`、`replace` 等方法 |
| `this.$route` | 当前路由信息，包含 `params`、`query`、`path` 等 |

#### 路由守卫：登录拦截的第一次接触

教程讲到这里时，我第一次听说「路由守卫」这个词。

```javascript
// 路由守卫：每次路由切换前都会触发
router.beforeEach((to, from, next) => {
  // to：要去哪
  // from：从哪来
  // next：是否放行

  // 假设需要登录才能访问 /profile
  if (to.path === '/profile') {
    // 检查是否已登录（假设存在 localStorage 里）
    const isLoggedIn = localStorage.getItem('token');

    if (isLoggedIn) {
      next();  // 已登录，放行
    } else {
      next('/login');  // 未登录，跳转到登录页
    }
  } else {
    next();  // 其他页面，放行
  }
});
```

当时觉得这个功能很「高级」——以前用原生 JavaScript 做登录拦截，要自己在每个页面开头写判断逻辑，既麻烦又容易漏。

**路由守卫的好处**：拦截逻辑只写一次，所有页面共享。

### Vuex：第一次理解「全局状态管理」

路由学完之后，教程开始讲 Vuex。

说实话，听到「状态管理」四个字的时候，我是懵的：**组件自己的数据在 `data` 里，组件之间的通信用 `props` 和 `$emit`，为什么还要一个专门的东西来「管理状态」？**

直到做了一个需要「跨组件共享数据」的功能，才明白 Vuex 的价值。

#### 问题场景：用户信息要在多个地方显示

假设有这样一个需求：用户登录后，要在整个应用里显示用户名。

不用 Vuex 的写法：

```javascript
// App.vue
export default {
  data() {
    return { username: '' }
  },
  methods: {
    login() {
      // 登录成功后保存用户名
      this.username = '张三';
    }
  }
}
```

```html
<!-- Header.vue：显示用户名 -->
<template>
  <header>
    <span>欢迎 {{ username }}</span>
  </header>
</template>

<script>
export default {
  // 要从 props 接收，但 props 层层传递很麻烦
  props: ['username']
}
</script>
```

如果用 Mixin：

```javascript
// userMixin.js
export default {
  data() {
    return { username: '' }
  }
}
```

但问题是：**Mixin 的数据来源依然不清晰，而且多个 Mixin 可能冲突。**

#### Vuex 的解决方案：中央仓库

Vuex 的核心思想是：**把共享的数据放到一个「中央仓库」里，各个组件按需读取。**

```javascript
// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  // state 相当于组件里的 data，但这是「全局的」
  state: {
    username: '',
    token: '',
    isLoggedIn: false
  },

  // mutations 相当于 methods，但只能同步修改 state
  mutations: {
    // 登录成功，保存用户信息
    login(state, payload) {
      state.username = payload.username;
      state.token = payload.token;
      state.isLoggedIn = true;
    },

    // 登出
    logout(state) {
      state.username = '';
      state.token = '';
      state.isLoggedIn = false;
    }
  },

  // actions 相当于 mutations，但可以处理异步操作
  actions: {
    // 登录（通常是异步的，比如调接口）
    async login({ commit }, credentials) {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      const data = await response.json();

      // 登录成功后，提交 mutation
      commit('login', {
        username: data.username,
        token: data.token
      });
    }
  },

  // getters 相当于 computed，用于派生出 state
  getters: {
    // 是否已登录（根据 state 派生）
    isAuthenticated: state => state.isLoggedIn,

    // 欢迎语
    welcomeMsg: state => `欢迎回来，${state.username}！`
  }
});
```

#### 组件中使用 Vuex

```html
<!-- Header.vue -->
<template>
  <header>
    <span v-if="isLoggedIn">{{ username }}</span>
    <button v-else @click="goLogin">登录</button>
  </header>
</template>

<script>
export default {
  computed: {
    // 从 store 读取 state
    username() {
      return this.$store.state.username;
    },
    isLoggedIn() {
      return this.$store.getters.isAuthenticated;
    }
  },

  methods: {
    goLogin() {
      // 调用 store 的 action
      this.$store.dispatch('login', {
        username: 'admin',
        password: '123456'
      });
    }
  }
}
</script>
```

**为什么要有 mutations 和 actions 两层？**

| 层级 | 作用 | 能否异步 |
|------|------|---------|
| mutations | 修改 state | 不能，只能同步 |
| actions | 提交 mutations | 能，可以处理异步（如接口调用） |

:::note
简单理解：**mutations 是「改数据的操作」，actions 是「包含业务逻辑的操作」。** actions 里调接口，接口返回后再 commit mutation。
:::

## Vue3 来袭：又一次「重新学」

学完 Vue2 基础和 Vue Router、Vuex 之后，我信心满满地进入了 Vue3 的学习。

结果第一课就被泼了一盆冷水。

### setup：扑面而来的陌生感

Vue3 的第一节课，我就被 `setup` 函数整懵了。

```javascript
import { ref, computed } from 'vue';

export default {
  name: 'UserProfile',
  setup() {
    const username = ref('张三');
    const age = ref(20);

    const displayName = computed(() => {
      return username.value.toUpperCase();
    });

    function updateUsername(newName) {
      username.value = newName;
    }

    return { username, age, displayName, updateUsername };
  }
}
```

**三个巨大的疑惑**：

1. `ref` 是什么？为什么访问值要用 `.value`？
2. `computed` 怎么从 `data` 选项跑到了外面？
3. 生命周期钩子 `created` 和 `beforeCreate` 怎么不见了？

教程说「setup 是新的入口函数」，相当于 Vue2 的 `beforeCreate` 和 `created` 的结合体。

我当时的内心是：「一个函数就替代了两个生命周期？那我之前背的那些钩子名字都白背了？」

### ref 和 reactive：响应式数据的新姿势

Vue2 的响应式数据必须写在 `data()` 里：

```javascript
// Vue2
data() {
  return {
    username: '张三',
    age: 20
  }
}
```

Vue3 提供了两种方式：

```javascript
// Vue3：ref 处理基本类型
const username = ref('张三');
const age = ref(20);

// Vue3：reactive 处理对象
const user = reactive({
  username: '张三',
  age: 20
});

// 访问方式不同
console.log(username.value);  // ref 需要 .value
console.log(user.username);   // reactive 不需要
```

**为什么基本类型用 ref，对象用 reactive？**

因为 JavaScript 的 Proxy 只能代理对象，不能代理基本类型值。`ref` 底层其实是用一个对象包裹了基本类型值：

```javascript
// ref 的简单实现
function ref(initialValue) {
  return {
    value: initialValue
  };
}
```

:::note
所以用 `ref` 时必须 `.value`，而 `reactive` 直接就是原生对象，不需要 `.value`。
:::

### script setup：更简洁的写法

Vue3.2 引入了 `<script setup>` 语法糖，让代码更简洁：

```vue
<script setup>
import { ref, computed } from 'vue';

const username = ref('张三');
const displayName = computed(() => username.value.toUpperCase());

function updateUsername(newName) {
  username.value = newName;
}

// 不需要 return，模板直接能用
</script>

<template>
  <div>
    <h1>{{ displayName }}</h1>
    <button @click="updateUsername('李四')">修改</button>
  </div>
</template>
```

对比一下 Vue2 的写法：

```vue
<!-- Vue2 -->
<script>
export default {
  data() {
    return { username: '张三' }
  },
  computed: {
    displayName() {
      return this.username.toUpperCase();
    }
  },
  methods: {
    updateUsername(newName) {
      this.username = newName;
    }
  }
}
</script>
```

Vue2 的问题在于：**一个功能的代码散落在 data、computed、methods 三个地方。**

Vue3 `<script setup>` 把相关逻辑聚在一起，代码量也少了很多。

### 新特性：Vue3 独有的能力

#### v-if 和 v-for 的优先级变化

这个变化让我踩了坑。

```html
<!-- Vue2：v-for 优先级高，先循环再判断条件 -->
<li v-for="item in items" v-if="item.show">{{ item.name }}</li>

<!-- Vue3：v-if 优先级高，先判断再循环 -->
<li v-for="item in items" v-if="item.show">{{ item.name }}</li>
```

Vue3 把优先级调换了，这意味着：

- Vue2：`v-for` 先执行，循环过程中 `v-if` 判断，效率低
- Vue3：`v-if` 先执行，条件不满足直接不循环，效率高

**如果 Vue3 也想先循环再过滤，应该怎么写？**

```html
<!-- 计算属性先过滤，再循环 -->
<li v-for="item in visibleItems">{{ item.name }}</li>

<script setup>
const items = ref([...]);
const visibleItems = computed(() => items.value.filter(i => i.show));
</script>
```

#### 多根节点：终于不用包裹 div 了

Vue2 的模板必须只有一个根节点：

```html
<!-- Vue2：错误 -->
<template>
  <header>头部</header>
  <main>主体</main>
  <footer>底部</footer>
</template>

<!-- Vue2：正确：必须包裹一个 div -->
<template>
  <div>
    <header>头部</header>
    <main>主体</main>
    <footer>底部</footer>
  </div>
</template>
```

Vue3 支持多根节点：

```html
<!-- Vue3：OK -->
<template>
  <header>头部</header>
  <main>主体</main>
  <footer>底部</footer>
</template>
```

当时我遇到的真实场景是：用 Element Plus 的布局容器 `el-container`，里面已经有一堆子元素了，偏偏被逼着再包一层 `<div>`，样式难调得要命。Vue3 出来后，这个问题就没了。

#### Teleport：传送门是真好用

弹窗组件是我学习 Vue2 时最头疼的问题之一：

```html
<!-- 弹窗组件 -->
<template>
  <div class="modal-wrapper">
    <div class="modal">
      <h2>弹窗标题</h2>
      <button @click="close">关闭</button>
    </div>
  </div>
</template>

<style scoped>
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  /* 遮罩层样式 */
}
</style>
```

问题在哪？`modal-wrapper` 的定位是相对于**父容器**的，如果父容器有 `transform` 或 `position` 属性，定位会乱掉。

Vue3 的 `Teleport` 解决了这个问题：

```html
<template>
  <Teleport to="body">
    <div class="modal">
      <h2>弹窗标题</h2>
      <button @click="close">关闭</button>
    </div>
  </Teleport>
</template>
```

`Teleport` 把弹窗内容直接传送到 `<body>` 下，定位不再受父容器影响。

### Composition API：逻辑复用的正确姿势

Vue2 时代，复用逻辑用 Mixin：

```javascript
// userMixin.js
export default {
  data() {
    return {
      username: '',
      isAdmin: false
    };
  },
  methods: {
    fetchUser() { /* ... */ }
  }
};

// 组件使用
import userMixin from './userMixin';
export default {
  mixins: [userMixin],
  // 问题：不知道这些数据从哪来，可能命名冲突
}
```

Vue3 的 Composition API 提供了更清晰的复用方式——Composables：

```javascript
// useUser.js
export function useUser() {
  const username = ref('');
  const isAdmin = ref(false);

  async function fetchUser() {
    // 获取用户逻辑
  }

  return { username, isAdmin, fetchUser };
}

// 组件使用
import { useUser } from '@/composables/useUser';

export default {
  setup() {
    const { username, isAdmin, fetchUser } = useUser();
    // 数据来源一目了然
  }
}
```

**Composables 的优势**：

| 特性 | Mixin | Composables |
|------|-------|-------------|
| 数据来源 | 不清晰 | 清晰（从函数返回值解构） |
| 命名冲突 | 可能冲突 | 不冲突（每个 composable 独立） |
| Tree-shaking | 不支持 | 支持（未使用的会摇掉） |
| 传参 | 不支持 | 支持（函数参数） |

:::note
Composables 本质上是一个「函数」，只不过这个函数返回的是响应式数据和函数。学会了这种思维方式，逻辑复用就变得优雅多了。
:::

### Vue3 生态：Router 4.x 和 Pinia

Vue3 版本的生态工具也有了升级。

#### Vue Router 4.x

Vue3 的路由版本变化不大，但语法略有调整：

```javascript
// Vue Router 4.x（Vue3 用）
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  // history 模式：用 HTML5 History API，URL 更美观（没有 #）
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
  ]
});
```

最大的变化是 `this.$router` 变成了组合式 API 中的 `useRouter()`，`this.$route` 变成了 `useRoute()`：

```javascript
// Vue3 Composition API 中使用路由
import { useRouter, useRoute } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    function goToUser() {
      router.push('/user/123');          // 跳转
      console.log(route.params.id);       // 获取参数
    }

    return { goToUser };
  }
}
```

#### Pinia：更轻量的状态管理

Vue3 不再推荐 Vuex，而是推出了 Pinia。语法更简洁，理念差不多。

```javascript
// stores/user.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  // state（用 ref）
  const username = ref('');
  const token = ref('');

  // getters（用 computed）
  const isLoggedIn = computed(() => !!token.value);
  const welcomeMsg = computed(() => `欢迎回来，${username.value}！`);

  // actions（用函数）
  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    const data = await response.json();

    username.value = data.username;
    token.value = data.token;
  }

  function logout() {
    username.value = '';
    token.value = '';
  }

  return { username, token, isLoggedIn, welcomeMsg, login, logout };
});
```

组件中使用：

```html
<script setup>
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 访问 state
console.log(userStore.username);

// 调用 action
userStore.login({ username: 'admin', password: '123456' });
</script>
```

**Pinia 相比 Vuex 的优势**：

| 特性 | Vuex | Pinia |
|------|------|-------|
| 体积 | 较大（约 20KB） | 较小（约 10KB） |
| API 复杂度 | 4 个概念（state/getters/mutations/actions） | 3 个（state/getters/actions，无 mutations） |
| TypeScript 支持 | 需要装饰器 | 原生支持 |
| 组合式风格 | Options 风格 | 可选组合式风格 |
| 热更新 | 支持但复杂 | 原生支持 |

:::note
Pinia 的设计理念：**去掉 mutations，让 actions 直接修改 state。** 这样虽然不符合 Vuex 的「只能通过 mutation 修改 state」原则，但写起来更简单，而且在 Pinia 的实现里，devtools 依然可以追踪变化。
:::

## 构建工具：Webpack 到 Vite 的跨越

说到 Vue2 和 Vue3 的差异，还有一个不能忽视的区别——**构建工具**。

Vue2 时代，项目的打包构建主要靠 **Webpack**；Vue3 时代，官方推荐使用的是 **Vite**。

这两个工具的差异，直接影响了开发体验。

### Webpack：功能强大，但速度慢

Webpack 是当时前端工程化的标配，功能确实强大：

- 模块打包：把各种资源（JS、CSS、图片）打包成浏览器能识别的文件
- 代码分割：按需加载，提升首屏加载速度
- 热更新：监视文件变化，重新编译并刷新页面

但问题是——**太慢了**。

```bash
# Webpack 项目启动
npm run dev

# 等待...
# 等待...
# 编译中...
# 等待...
# 终于编译完成
DONE  Compiled successfully in 4.23s
```

每次改一行代码，都要等好几秒才能看到效果。这在写小项目时还好，但做大了之后，10 秒、20 秒的等待时间让人崩溃。

:::note
Webpack 慢的根源在于：**它要把所有模块都打包一遍，即使只改了一个文件。** 就像工厂生产产品，每次都要从头到尾走一遍流水线。
:::

### Vite：真正的「飞快」

第一次用 Vite 创建 Vue3 项目时，我的反应是：

```bash
npm create vite@latest my-vue3-project -- --template vue
cd my-vue3-project
npm install
npm run dev
```

**秒开。**

没有任何等待，打开浏览器就能看到效果。修改代码后，页面的热更新几乎是**即时**的。

Vite 之所以这么快，是因为它的原理完全不同：

| 维度 | Webpack | Vite |
|------|---------|------|
| 打包方式 | 先打包，再运行 | 先启动 dev server，按需编译 |
| 开发体验 | 改代码要等几秒 | 改代码即时生效 |
| 热更新 | 重新打包，慢 | 只更新变化的模块，极快 |
| 生产构建 | 整包打包 | 基于 Rollup，高效 |
| 依赖预编译 | 无 | esbuild 预编译依赖（快 10-100 倍） |

**Vite 的核心原理**：

1. **开发阶段不打包**：Vite 使用原生 ES Module，只在浏览器请求某个模块时才编译该模块
2. **依赖预编译**：使用 esbuild 提前处理 `node_modules` 中的依赖，这比 Webpack 快 10-100 倍
3. **按需更新**：只对变化的模块进行热更新，不需要重新打包整个项目

```javascript
// Vite 的开发服务器原理（简化）
// 浏览器请求 /src/main.js
// Vite 拦截请求，编译 main.js 和它的依赖
// 返回编译后的 ES Module 代码
// 浏览器直接运行，不需要打包
```

:::note
类比一下：**Webpack 像是「先把所有食材都做成半成品，放进冰箱」，做菜时再拿出来热。Vite 像是「需要什么食材，就现场拿什么」，现拿现做。**
:::

### Vue3 + Vite = 最佳拍档

Vue3 项目默认使用 Vite 作为构建工具，两者配合默契：

- Vue3 的 Composition API 让代码更有组织性
- Vite 让开发体验飞起来
- 两者都是「更轻量、更快、更现代」的设计理念

这也解释了为什么说 Vue2 和 Vue3 是「两个生态」——不仅仅是 API 的变化，更是工具链的升级。

## 两个版本的深度对比

### 响应式原理：Object.defineProperty vs Proxy

Vue2 用 `Object.defineProperty` 实现响应式：

```javascript
// Vue2 响应式的简单模拟
function defineReactive(obj, key, value) {
  Object.defineProperty(obj, key, {
    get() {
      return value;
    },
    set(newValue) {
      if (newValue !== value) {
        value = newValue;
        // 触发更新
      }
    }
  });
}
```

**问题：新增属性不触发响应式**

```javascript
const vm = new Vue({
  data: { name: '张三' }
});

vm.age = 20;        // 不触发响应式！
vm.$set(vm, 'age', 20);  // 要用这个才行
```

Vue3 用 `Proxy` 解决：

```javascript
// Vue3 响应式的简单模拟
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      Reflect.set(target, key, value);
      return true;  // 自动触发更新
    }
  });
}

const user = reactive({ name: '张三' });
user.age = 20;  // 自动触发响应式！
```

### 生命周期全面对比

| Vue2 | Vue3 | 说明 |
|------|------|------|
| `beforeCreate` | `setup()` | setup 是新的入口 |
| `created` | `setup()` | setup 是新的入口 |
| `beforeMount` | `onBeforeMount` | DOM 挂载前 |
| `mounted` | `onMounted` | DOM 挂载后 |
| `beforeUpdate` | `onBeforeUpdate` | 数据更新前 |
| `updated` | `onUpdated` | 数据更新后 |
| `beforeDestroy` | `onBeforeUnmount` | 组件销毁前 |
| `destroyed` | `onUnmounted` | 组件销毁后 |
| `activated` | `onActivated` | keep-alive 激活时 |
| `deactivated` | `onDeactivated` | keep-alive 停用时 |

### 编程思维的变化

Vue2 到 Vue3，不只是 API 的变化，更是编程思维的升级：

| 维度 | Vue2 思维 | Vue3 思维 |
|------|----------|----------|
| 代码组织 | 按选项分类（data/methods/computed） | 按功能模块组合 |
| 逻辑复用 | Mixin（来源不清晰） | Composables（来源清晰） |
| 响应式 | 手动定义，有限制 | Proxy 自动代理，更强大 |
| 类型支持 | 装饰器方案，有局限性 | 原生 TypeScript 支持 |
| 开发体验 | Webpack 慢 | Vite 快（毫秒级热更新） |

## 大二上 vs 大二下：理论到实战

回顾这段学习经历，有一点体会很深：

**大二上的 Vue 学习，核心任务是「理解概念」。**

跟着黑马教程，一个知识点一个知识点地过：模板语法、指令系统、计算属性、监听器、组件通信、生命周期、Vue Router、Vuex......每学完一块，都要做几个小练习巩固。

那时候的我，**「会用」但「不太懂原理」**。

**大二下的项目实战，核心任务是「解决问题」。**

当真正开始做「十次方」社区项目时，问题不再是「怎么用 Vue」，而是：

- 组件怎么拆分才合理？
- 状态管理怎么组织才不乱？
- 路由守卫怎么写才安全？
- 接口请求怎么统一封装？

**理论告诉你「是什么」和「为什么」，项目教会你「怎么用」和「怎么搭」。**

两者缺一不可。

## 写在最后

站在今天回顾那段学习经历，有一句话特别想说：

> **框架在变，思维也在变。但不变的是：对原理的理解和对学习的热爱。**

Vue2 到 Vue3 的转变，让我意识到：同一个问题可以有不同的解法，没有绝对的对错，只有适合与否。

- Vue2 的 Options API 约定俗成，新人容易上手
- Vue3 的 Composition API 灵活强大，逻辑复用更优雅
- Webpack 到 Vite，是工程化体验的质变
- 理解原理，才能在技术迭代中保持从容

感谢黑马老师的教学安排：先 Vue2 打基础，再 Vue3 跟进迭代。这个路线让我既理解了传统方案的思路，也掌握了新方案的优势。

**至于那些年踩过的坑——v-for 的 key、v-if 和 v-show 的区别、响应式丢失问题、Webpack 漫长的等待——它们都是成长的印记。**

---

*生涯补全系列，记录成长路上的每一次技术冲击。*
