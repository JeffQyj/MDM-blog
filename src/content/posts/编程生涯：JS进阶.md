---
title: 编程生涯：JS进阶
published: 2023-10-23
description: 回顾2023年10月JavaScript进阶的学习历程，用生活类比和Java概念迁移，解释作用域、闭包、原型链、this指向、异步编程等核心概念。
tags: [JavaScript, 前端]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
此刻是2026年，我在整理过去的博客笔记。翻到2023年10月的那段日子，发现那是我前端学习中最「开窍」的一个月。

JavaScript的进阶概念，像是六把钥匙——每把都能打开一扇门。闭包是「私人保险箱」，原型链是「家族族谱」，this是「当下的我」，异步是「订外卖」，事件循环是「餐厅出餐顺序」……

有意思的是，学完JS再回头看Java，发现很多概念竟然是相通的——只是换了件衣服。
:::

## 起航：从「会用」到「真懂」

2023年10月23日，我正在啃JavaScript的进阶内容。

在那之前，我已经学完了前端三件套（HTML、CSS、JavaScript基础），觉得自己「已经掌握了JS」。能写个表单验证，能做个简单的动画，觉得JavaScript不过如此。

直到我开始深入学习——我才发现自己对JS的理解，连门槛都没摸到。

老师布置了几个实战任务，每一个都让我怀疑人生：

- 闭包是什么？为什么面试总问这个？
- 原型链是什么？`__proto__`和`prototype`有什么区别？
- `this`到底指向谁？为什么有时候对有时候错？
- 异步编程是什么？为什么代码「看起来是错的，执行起来却是对的」？

这些问题，像是六座大山，横亘在我和「真正掌握JavaScript」之间。

但当我一座一座翻过去之后，发现——哎，这些概念怎么和Java有点像？

## 作用域：你的地盘听我的

### 作用域是什么

如果说Java的变量作用域是「教室」，那JS的变量作用域就是「公司层级」。

在Java里，我们用`{}`划定块级作用域：

```java
// Java
public void method() {
    if (true) {
        int a = 10;  // 只在这个if块里有效
        System.out.println(a);
    }
    // a++;  // 编译报错！出了if块就找不到a了
}
```

JS的`var`不一样，它只有函数作用域，没有块级作用域：

```javascript
// JavaScript
function method() {
    if (true) {
        var a = 10;  // var是函数作用域，不是块级作用域！
    }
    console.log(a);  // 居然能打印出来！
}
```

这就像是：Java的「地盘」用墙隔开，而JS的`var`只认「公司大门」——只要没出函数，就是自己人。

### let和const：Java的「升级版」

ES6引入的`let`和`const`，终于让JS也有了「块级作用域」：

```javascript
// let和const就像Java的局部变量
function method() {
    if (true) {
        let a = 10;
        const b = 20;
    }
    // a++;  // ReferenceError! 出了if块就找不到a了
    // b++;  // ReferenceError! const更是如此
}
```

| Java | JS对比 | 说明 |
|------|--------|------|
| `int a = 10;`（方法内） | `let a = 10;` | 块级作用域 |
| `static int a = 10;`（类内） | `var a = 10;`（函数外） | 函数/全局作用域 |
| `final int a = 10;` | `const a = 10;` | 常量，不可重新赋值 |

### 变量提升：JS的「预答辩」机制

Java没有变量提升这个概念，变量必须先声明后使用。但JS有——

```javascript
console.log(a);  // undefined，不是报错！
var a = 10;
```

这就像是毕业答辩的「预答辩」：你不用完全准备好，但至少要「报名」。

```javascript
// JS的预编译等价于：
var a;           // 报名（声明提升）
console.log(a); // 预答辩（可以打印，但没准备好）
a = 10;         // 正式答辩（赋值留在原地）
```

:::note
变量提升是JS设计早期的「历史遗留」，ES6的`let`和`const`通过「暂时性死区」解决了这个问题——在声明之前访问会直接报错。
:::

## 闭包：私人保险箱

### 闭包是什么

如果说Java的封装是「把东西装进盒子」，那JS的闭包就是「把东西装进保险箱」——不仅锁着，还能「远程解锁」。

让我用一个生活场景解释：

```javascript
function createCounter() {
    let count = 0;  // 保险箱里的私房钱

    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const myCounter = createCounter();
console.log(myCounter.getCount());  // 0
myCounter.increment();
myCounter.increment();
myCounter.decrement();
console.log(myCounter.getCount());  // 1
```

这段代码发生了什么？

1. `createCounter()`执行完毕，正常情况下局部变量`count`应该被销毁
2. 但`return`出去的`increment`、`decrement`、`getCount`还在「引用」`count`
3. 所以`count`就像被锁进了保险箱，外界无法直接访问，但可以通过钥匙（返回的方法）来操作

**这和Java的私有字段一模一样！**

```java
// Java版
public class Counter {
    private int count = 0;  // 私有字段，外界无法直接访问

    public void increment() { count++; }
    public void decrement() { count--; }
    public int getCount() { return count; }
}
```

| Java | JavaScript |
|------|------------|
| `private` 字段 | 闭包中的局部变量 |
| `public` 方法访问 | 返回的函数访问 |
| 外界无法直接修改 | 只能通过返回的方法操作 |

### 闭包的经典应用

#### 防抖：憋大招

JavaScript的防抖，像是「憋大招」——你尽管点，我只放最后一次。

```javascript
function debounce(fn, delay) {
    let timer = null;

    return function(...args) {
        clearTimeout(timer);  // 取消之前的
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 搜索框输入——用户停手0.5秒后才真正搜索
const handleSearch = debounce(function(keyword) {
    console.log("搜索:", keyword);
}, 500);
```

| 生活场景 | 技术场景 |
|----------|----------|
| 憋大招 | 防抖 |
| 抢票时限制点击 | 节流 |

#### 模块化：每人一间办公室

```javascript
const UserModule = (function() {
    let username = "张三";  // 私有变量，外部无法直接访问
    let password = "123456";  // 私有变量

    function login(name, pwd) {
        if (name === username && pwd === password) {
            return true;
        }
        return false;
    }

    function getUsername() {
        return username;
    }

    // 对外暴露的接口
    return {
        login: login,
        getUsername: getUsername
    };
})();

UserModule.login("张三", "123456");  // true
console.log(UserModule.username);    // undefined —— 访问不到！
```

这就像是每人一间独立的办公室——里面的东西在里面工作的人才能用。

### 闭包的坑：循环里的「早熟」

Java的循环没有这个问题，因为循环变量是真正的局部变量。但JS的`var`会「泄露」：

```javascript
// 错误写法
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);  // 输出：3, 3, 3
    }, 100);
}
```

为什么是三个3？因为`var`没有块级作用域，当定时器执行时，循环早已结束，`i`早就变成了3。

解决方案和Java一样——用块级作用域的变量：

```javascript
// 解决方案：let有块级作用域
for (let i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);  // 输出：0, 1, 2
    }, 100);
}

// 或者用闭包捕获（类似Java的最终变量）
for (var i = 0; i < 3; i++) {
    (function(j) {
        setTimeout(function() {
            console.log(j);  // 输出：0, 1, 2
        }, 100);
    })(i);
}
```

:::warning
闭包不是越多越好。就像保险箱太多会影响空间，闭包太多会占内存。不用了记得「清空」。
:::

## 原型链：JS的「族谱」

### 为什么需要原型

如果说Java的继承是「正式领养」——父子关系清晰，那么JS的原型链就是「家族族谱」——往上追溯能找到祖先。

Java的继承：

```java
// Java —— 明确的父子类关系
class Animal {
    public void eat() {
        System.out.println("动物在吃东西");
    }
}

class Dog extends Animal {
    @Override
    public void eat() {
        System.out.println("狗在吃狗粮");
    }

    public void bark() {
        System.out.println("狗在叫");
    }
}

Dog dog = new Dog();
dog.eat();   // 狗在吃狗粮 —— 优先用自己的
dog.bark();  // 狗在叫 —— 自己独有的
```

JS的原型链：

```javascript
// JS —— 通过原型链查找
const animal = {
    eats: true,
    walk: function() {
        console.log("动物在走路");
    }
};

const dog = {
    barks: true,
    __proto__: animal  // 原型链：dog → animal → Object.prototype → null
};

console.log(dog.eats);   // true —— 自己没有，沿原型链往上找
dog.walk();              // 动物在走路 —— 继承自animal
console.log(dog.barks);  // true —— 自己有
```

### prototype 与 __proto__

这是让很多JS初学者崩溃的概念。但如果你学过Java，会发现它其实很眼熟：

| Java概念 | JS对应 | 说明 |
|----------|--------|------|
| 类静态方法 | `构造函数.prototype.方法` | 定义在「模板」上的方法，所有实例共享 |
| 实例调用 | `实例.__proto__` | 实例通往「模板」的链接 |

```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
}

// 在prototype上定义方法 —— 类似Java的静态方法
Person.prototype.speak = function() {
    console.log("我叫" + this.name + "，今年" + this.age + "岁");
};

const p1 = new Person("张三", 25);
const p2 = new Person("李四", 30);

console.log(p1.__proto__ === Person.prototype);  // true
console.log(p2.__proto__ === Person.prototype);   // true
console.log(p1.speak === p2.speak);              // true —— 同一个方法！
```

### 原型链图示：族谱的追溯

```
┌─────────────────────────────────────────────────────────────┐
│                        JS原型链                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  new Dog("旺财")                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  自有属性：name="旺财", breed="中华田园犬"           │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  __proto__ (指向父亲)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Dog.prototype                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  共享方法：bark()                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  constructor: Dog                                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  __proto__ (指向祖父)                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Animal.prototype                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  共享方法：eat()                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  __proto__ (指向曾祖父)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Object.prototype                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  共享方法：toString(), hasOwnProperty()             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  __proto__ → null（族谱终点）                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ES6 Class：JS的「族谱简化版」

ES6的`class`让JS的原型继承看起来更像Java的类继承：

```javascript
// ES6 Class —— 更像Java的写法
class Animal {
    constructor(name) {
        this.name = name;
    }

    eat() {
        console.log(this.name + "在吃东西");
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // 调用父类构造器 —— 和Java一样
        this.breed = breed;
    }

    bark() {
        console.log(this.name + "在叫：汪汪！");
    }
}

const dog = new Dog("旺财", "中华田园犬");
dog.eat();   // 旺财在吃东西 —— 继承自Animal
dog.bark();  // 旺财在叫：汪汪！ —— 自己定义
```

:::note
JS的`class`只是原型继承的「语法糖」，它的底层实现依然是原型链。`typeof class {}`的结果是`"function"`。
:::

## this指向：谁叫的我，我就指向谁

### this是什么

如果说Java的`this`是「当前对象」，那么JS的`this`就是一个「会变的自己」——谁调用我，我就指向谁。

Java的this是「指针」，指向是固定的；JS的this是「角色」，扮演谁就是谁。

### 四种绑定规则

| Java | JavaScript | 说明 |
|------|------------|------|
| `this` 在构造器中指向新建对象 | `new` 绑定 | `new Person()` 中 `this` 指向实例 |
| `obj.method()` | 隐式绑定 | `this` 指向 `obj` |
| 无（Java用不到） | 默认绑定 | 独立调用时 `this` 指向全局 |
| 无（Java用不到） | 显式绑定 | `call`、`apply`、`bind` 强行指定 |

```javascript
// 1. new绑定 —— 和Java一样
function Person(name) {
    this.name = name;
}
const p = new Person("张三");
console.log(p.name);  // 张三

// 2. 隐式绑定 —— 对象方法调用
const obj = {
    name: "李四",
    greet: function() {
        console.log("你好，我是" + this.name);
    }
};
obj.greet();  // 你好，我是李四

// 3. 显式绑定 —— JS独有，Java没有
function speak() {
    console.log("我是" + this.name);
}
speak.call({ name: "王五" });  // 我是王五 —— 强行指定

// 4. 默认绑定 —— 浏览器环境下指向window
function fn() {
    console.log(this.name);
}
fn();  // undefined（严格模式）或者打印window.name
```

### 箭头函数：扮演「继承」而非「绑定」

这是JS独有的概念，Java没有。

普通函数的`this`是「谁调用我，我就指向谁」；箭头函数的`this`是「我继承定义时所在的那个人」。

```javascript
const obj = {
    name: "张三",
    // 普通函数：this是「调用时的我」
    fn1: function() {
        console.log(this.name);  // 张三 —— obj调用的
    },
    // 箭头函数：this是「定义时的外层我」
    fn2: () => {
        console.log(this.name);  // undefined —— 外层是window
    }
};

obj.fn1();  // 张三
obj.fn2();  // undefined
```

### 经典面试题：定时器里的「失踪」

Java没有定时器，但JS有。这是面试最爱问的场景：

```javascript
const obj = {
    name: "定时器",
    // 普通函数在定时器里会「跑丢」
    fn1: function() {
        setTimeout(function() {
            console.log(this.name);  // undefined —— 定时器回调是window调用的
        }, 0);
    },
    // 箭头函数在定时器里「不会跑丢」
    fn2: function() {
        setTimeout(() => {
            console.log(this.name);  // 定时器 —— 继承fn2的this
        }, 0);
    }
};

obj.fn1();  // undefined
obj.fn2();  // 定时器
```

| 场景 | 普通函数this | 箭头函数this |
|------|-------------|-------------|
| 对象方法调用 | 指向对象 | 指向外层（非obj） |
| 定时器回调 | 指向window | 指向定义时的外层 |
| 事件处理 | 指向事件源 | 指向定义时的外层 |

## 异步编程：JS的「时间管理」

### 为什么需要异步

先说一个生活场景：你在餐厅点餐，Java的方式是——你站在柜台前等厨师做完，**厨师做好一道你才能走**。

```java
// Java同步 —— 站在柜台前等
System.out.println("老板，来碗面");
System.out.println("等待10分钟...");
System.out.println("面好了，你端着走吧");
System.out.println("下一步：回家");  // 必须等面做完才能执行
```

但JS不一样——它是**扫码点餐**。你扫码下单，然后可以去干别的，等外卖到了再回来。

```javascript
// JS异步 —— 扫码下单，先干别的
console.log("扫码下单");

setTimeout(function() {
    console.log("外卖到了");
}, 10000);

console.log("去打游戏了");
console.log("去看剧了");
// 输出：扫码下单 → 去打游戏了 → 去看剧了 → 10秒后 → 外卖到了
```

**为什么JS需要异步？因为它是单线程——一个厨师一次只能做一道菜。如果厨师一直等着，餐厅就卡死了。**

### 回调函数：第一代解决方案

最早的解决方案叫**回调函数**——「做好了打我电话」。

```javascript
// 口头约定
console.log("下单成功");

setTimeout(function() {
    console.log("外卖到了，请取餐");
}, 2000);

console.log("去干别的");

// 输出：下单成功 → 去干别的 → 2秒后 → 外卖到了
```

这个方案简单、有效。但问题是——**如果点餐有依赖呢？**

比如：
1. 先获取用户信息
2. 根据用户ID获取订单
3. 根据订单获取商品
4. 根据商品获取推荐

用回调写出来就是这样：

```javascript
// 回调地狱 —— 像俄罗斯套娃，一层套一层
getUser(function(user) {
    getOrders(user.id, function(orders) {
        getProducts(orders, function(products) {
            getRecommendations(products, function(recs) {
                console.log("推荐结果:", recs);
            });
        });
    });
});
```

:::warning
这就是著名的「回调地狱」——嵌套太深，代码像金字塔一样，难以阅读和维护。而且错误处理也很麻烦，每一层都要写`catch`。
:::

### Promise：第二代解决方案

为了解决回调地狱，ES6引入了**Promise**——「书面合同」。

口头约定容易扯皮，书面合同更规范。Promise有三种状态：

| 合同状态 | Promise状态 | 含义 |
|----------|-------------|------|
| 合同签订中 | Pending | 异步操作进行中 |
| 合同兑现了 | Fulfilled | 操作成功，结果可用 |
| 合同违约了 | Rejected | 操作失败，出了差错 |

**Promise的核心改进：可以用`.then()`链式调用，把嵌套拍平。**

```javascript
// 链式调用 —— 像流水线，一站接一站
getUser()
    .then(user => getOrders(user.id))
    .then(orders => getProducts(orders))
    .then(products => getRecommendations(products))
    .then(recs => console.log("推荐结果:", recs))
    .catch(error => console.error("出错了:", error));
```

对比一下：

```
回调地狱（垂直发展）：
getUser(() → {
    getOrders(() → {
        getProducts(() → {
            ...
        })
    })
})

Promise链（水平延伸）：
getUser()
    .then(getOrders)
    .then(getProducts)
    .then(...)
```

**这就是进步——从垂直嵌套，变成了水平串联。**

### Async/Await：第三代解决方案

Promise已经比回调好多了，但还不够完美。ES7的**async/await**让异步代码**看起来像同步代码**。

```javascript
// async/await —— 像写同步代码一样写异步
async function orderFood() {
    const user = await getUser();           // 等用户信息
    const orders = await getOrders(user.id); // 等订单信息
    const products = await getProducts(orders); // 等商品信息
    const recommendations = await getRecommendations(products);

    console.log("推荐结果:", recommendations);
}
```

对比Promise写法：

```javascript
// Promise链
getUser()
    .then(user => getOrders(user.id))
    .then(orders => getProducts(orders))
    .then(products => console.log("推荐结果:", products));
```

**Async/Await只是Promise的语法糖——它让代码读起来更自然，「先等A，再做B，再做C」。**

| 方案 | 优点 | 缺点 |
|------|------|------|
| 回调函数 | 简单直接 | 嵌套深，回调地狱 |
| Promise | 链式调用，水平扩展 | 语法繁琐 |
| async/await | 像同步代码，易读 | 本质还是Promise |

### 异步编程小结

```
异步编程演进史：

┌─────────────────────────────────────────────────────────────┐
│  第一代：回调函数                                           │
│  「做好了打我电话」                                         │
│  问题：嵌套深，难维护                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  第二代：Promise                                           │
│  「签书面合同，链式执行」                                   │
│  改进：.then()链式调用，水平扩展                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  第三代：async/await                                       │
│  「像同步一样写异步」                                       │
│  改进：语法更自然，易读易维护                               │
└─────────────────────────────────────────────────────────────┘
```

学到这里我才明白——**技术演进都是有原因的。每一次升级，都是在解决上一代的问题。**

## 事件循环：JS的「调度秘诀」

### 为什么需要事件循环

理解了异步，你可能会有疑问：JS是单线程，怎么实现「同时做多件事」？

答案是——**事件循环**。

用一个生活场景比喻：

```
餐厅模型：
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   主厨（JS主线程）                                          │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  一次只能处理一个订单                                 │   │
│   │  但有些菜需要等（炖汤、烤鸭）                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│   等候区（任务队列）                                         │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  2号单：等5分钟                                      │   │
│   │  5号单：等10分钟                                     │   │
│   │  ...                                                 │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

JS主线程就像主厨，它不空闲——**做完一道菜，立刻去做下一道，等着的菜做好了就叫号。**

### 宏任务与微任务：两种等候区

JS的任务队列分两种：

| 等候区 | 任务类型 | 优先级 |
|--------|----------|--------|
| 普通等候区 | `setTimeout`、`setInterval`、I/O | 低（排队） |
| VIP等候区 | `Promise.then`、`MutationObserver` | 高（插队） |

**执行规则：主厨做完当前活 → 先清空VIP等候区 → 再去普通等候区取下一个**

```javascript
console.log("1");              // 主厨立刻做

setTimeout(function() {        // 放入普通等候区
    console.log("2");
}, 0);

Promise.resolve()              // 放入VIP等候区
    .then(function() {
        console.log("3");
    });

console.log("4");              // 主厨立刻做

// 输出：1 → 4 → 3 → 2
```

为什么？

```
┌─────────────────────────────────────────────────────────────┐
│ 第一步：主厨（JS主线程）立刻做的事                              │
│                                                             │
│   console.log("1");  → 打印 1                               │
│   console.log("4");  → 打印 4                               │
│                                                             │
│   当前任务完成，检查VIP等候区                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 第二步：清空VIP等候区（微任务）                                │
│                                                             │
│   Promise.then → 打印 3                                     │
│   VIP清空 ✓                                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 第三步：去普通等候区取下一个（宏任务）                           │
│                                                             │
│   setTimeout → 打印 2                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

最终输出：1 → 4 → 3 → 2
```

:::note
记住这个顺序：**同步代码 → 微任务 → 宏任务**。

就像餐厅：**先做能立刻做的 → 再叫VIP → 最后叫普通排队**
:::

### 事件循环与异步的关系

现在我们把「异步」和「事件循环」串起来理解：

```
┌─────────────────────────────────────────────────────────────┐
│  异步编程 vs 事件循环                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  异步编程 —— 关注「怎么做」                                   │
│  「我不想等着」，所以用回调/Promise/async/await             │
│                                                             │
│  事件循环 —— 关注「谁来调度」                                 │
│  「谁来决定先做哪个」，这就是事件循环的工作                    │
│                                                             │
│  关系：异步代码放入队列，事件循环决定执行顺序                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 异步编程全览

学到这里，终于把「异步编程」和「事件循环」串成一条线了：

| 概念 | 解决的问题 | 生活的类比 |
|------|------------|------------|
| 异步编程 | 「我不想等着」 | 扫码点餐，不用站着等 |
| 回调函数 | 异步怎么做 | 口头约定，做好了叫我 |
| Promise | 回调嵌套问题 | 书面合同，链式执行 |
| async/await | Promise语法繁琐 | 更自然的语法糖 |
| 事件循环 | 谁来调度任务 | 餐厅出餐顺序 |

回顾这六座大山，从「会用」到「真懂」，每一座都有它的价值——

| 概念 | 核心收获 |
|------|----------|
| 作用域 | 变量不是无处不在，它有「地盘」 |
| 闭包 | 函数能「记住」它出生时的环境 |
| 原型链 | JS的继承是「族谱」，不是「领养」 |
| this | 谁调用我，我就指向谁 |
| 异步编程 | 「不等着」的三代解决方案 |
| 事件循环 | 单线程也能「同时」做多件事 |

## 站在今天，回望那段时光

2023年10月的JavaScript进阶学习，是我前端学习中最「通透」的一个月。

学完这些之后，我有个意外的收获——**Java和JS居然是相通的**。

| Java概念 | JavaScript概念 | 类比 |
|----------|---------------|------|
| 类与继承 | 原型链 | 族谱追溯 |
| `private` 字段 | 闭包变量 | 保险箱 |
| `this` | `this` | 当前对象（但JS更灵活） |
| 同步方法调用 | `await` | 等待完成 |
| 线程/队列 | 事件循环 | 出餐顺序 |

它们解决的问题是类似的，只是表达方式不同。

Java像「严谨的建筑」，每个房间有明确的门和墙；JS像「灵活的集装箱」，可以随时重组和叠加。但本质上，它们都在解决同一个问题：**如何组织代码，让它易于维护和扩展。**

:::note
学技术最有趣的事情就是——你学得越多，就越发现「万物归一」。

不同的语言、不同的框架，解决问题的思路往往是相通的。
:::

---

*2023年10月的JS进阶学习结束了，但那扇通往真正「掌握JavaScript」的大门，才刚刚打开。*
