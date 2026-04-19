---
title: 生涯补全：TS的学习
published: 2022-10-01
description: 回忆 2022 年 10 月从 JavaScript 转向 TypeScript 的学习历程，记录从「以为TS是新语言」到理解「类型系统」认知升级的过程。
tags: [前端, TypeScript, JavaScript, 生涯补全]
category: 生涯补全
draft: false
lang: zh_CN
---

:::tip
这是「生涯补全」系列的第三篇文章，记录从 JavaScript 转向 TypeScript 的学习历程。
:::

## 起航：以为 TS 是新语言

2022 年 10 月 1 日，我第一次看到「TypeScript」这个词。

那时候刚学完前端三件套不久，正是信心爆棚的阶段——觉得自己已经掌握了前端的三件套，可以写一些简单的页面了。结果老师突然布置了一个新任务：「接下来我们学习 TypeScript。」

我当时的反应是：「又是什么新语言？」

甚至去搜索了一下「TypeScript 和 JavaScript 的区别」，看到有人说「TypeScript 是 JavaScript 的超集」，脑子里冒出一堆问号：

- 超集是什么？
- 既然是超集，为什么不直接叫 JavaScript？
- 多出来的那部分是什么？

现在想来好笑——**我连「类型」是什么都不清楚，又怎么可能理解 TypeScript 的价值。**

## 认知重启：类型到底是什么

带着疑惑，我打开了黑马的 TypeScript 教程。第一节课讲的就是类型声明。

```typescript
let name: string = '张三';
let age: number = 25;
let isStudent: boolean = true;
```

我当时的状态是：**这不就是把 JavaScript 的变量用一种「显式」的方式写出来吗？**

```javascript
// 这是 JavaScript
let name = '张三';
let age = 25;
let isStudent = true;
```

**为什么要多此一举？**

让我真正开始思考的，是一个经典的场景：

```typescript
// JavaScript
function greet(name) {
    return 'Hello, ' + name;
}

greet(123); // 'Hello, 123' - 不会报错，但语义不对
```

```typescript
// TypeScript
function greet(name: string) {
    return 'Hello, ' + name;
}

greet(123); // Type 'number' is not assignable to type 'string'
```

当我在编辑器里看到这行报错时，第一次真正理解了类型系统的意义：

**类型不是束缚，而是约束。约束的意义在于：把错误从运行时提前到编译时。**

:::note
JavaScript 的错误只能在程序运行时才能发现，而 TypeScript 能在写代码时就告诉你「这里有问题」。
:::

## 基础阶段：八种基础类型

教程的第一部分讲的是基础类型。TypeScript 的基础类型包括：

| 类型 | 示例 | 说明 |
|------|------|------|
| `string` | `'hello'` `"hello"` `` `hello` `` | 字符串 |
| `number` | `1`, `3.14`, `0xFF` | 数字（含整型、浮点、十六进制） |
| `boolean` | `true`, `false` | 布尔值 |
| `null` | `null` | 空值 |
| `undefined` | `undefined` | 未定义 |
| `symbol` | `Symbol('id')` | 唯一标识 |
| `bigint` | `100n` | 大整数 |
| `object` | `{name: '张三'}` | 对象（含数组、函数等） |

让我困惑的是 `null` 和 `undefined` 的区别：

```typescript
let a: null = null;
let b: undefined = undefined;

function fn(x: string | null) {
    if (x === null) {
        console.log('x 是空值');
    } else {
        console.log('x 是字符串: ' + x);
    }
}
```

后来我才明白：**`null` 是「刻意设置为空」，`undefined` 是「还没设置」。**

## 类型注解与类型推断

这一阶段有两个重要概念：类型注解（Explicit）和类型推断（Implicit）。

```typescript
// 类型注解 - 主动声明类型
let name: string = '张三';

// 类型推断 - 编译器自动推断
let name = '张三'; // TS 自动推断为 string 类型
```

```typescript
// 类型推断的好处
let age = 25;       // 推断为 number
let isStudent = true; // 推断为 boolean

// 后续赋值会报错
age = 'hello'; // Error: Type 'string' is not assignable to type 'number'
```

**什么时候用注解，什么时候用推断？**

| 场景 | 推荐方式 |
|------|---------|
| 变量声明时初始化 | 类型推断 |
| 函数参数、返回值 | 类型注解 |
| 变量暂时没有初始化 | 类型注解 |
| 复杂类型、第三方库 | 类型注解 |

## 入门阶段：接口与类型别名

学了基础类型后，进入第二阶段——自定义类型。教程讲了两种方式：**接口（interface）** 和 **类型别名（type）**。

### 接口

```typescript
interface User {
    name: string;
    age: number;
    email?: string;        // 可选属性
    readonly id: number;  // 只读属性
}

const user: User = {
    name: '张三',
    age: 25,
    id: 1
};

user.name = '李四';  // OK
user.id = 2;        // Error: Cannot assign to 'id' because it is a read-only property
```

### 类型别名

```typescript
type ID = string | number;
type Point = { x: number; y: number };

function printID(id: ID) {
    console.log(id);
}

const point: Point = { x: 10, y: 20 };
```

### 区别是什么

当时我很困惑：interface 和 type 都能定义对象类型，它们有什么区别？

```typescript
// 接口
interface Animal {
    name: string;
}
interface Animal {
    age: number;
}
// 合并结果：name + age

// 类型别名
type Animal = {
    name: string;
};
// type Animal = { age: number }; // Error: Duplicate identifier 'Animal'
```

**简单记忆**：interface 支持声明合并，type 更灵活（可以联合、交叉、元组）。

```typescript
// type 的灵活性
type Status = 'pending' | 'success' | 'error';
type Result = { data: string } | { error: string };
type Pair<T> = { key: T; value: T };
```

## 函数类型

函数是 TypeScript 中的重要部分。

### 函数声明

```typescript
function add(a: number, b: number): number {
    return a + b;
}

// 可选参数
function greet(name: string, age?: number): string {
    if (age !== undefined) {
        return `Hello, ${name}, you are ${age}`;
    }
    return `Hello, ${name}`;
}

// 默认参数
function greet(name: string = 'World'): string {
    return `Hello, ${name}`;
}
```

### 函数类型表达式

```typescript
// 完整写法
const add: (a: number, b: number) => number = function(a, b) {
    return a + b;
};

// 简写：使用接口
interface Add {
    (a: number, b: number): number;
}
const add: Add = function(a, b) {
    return a + b;
};
```

### 剩余参数

```typescript
function sum(...numbers: number[]): number {
    return numbers.reduce((acc, cur) => acc + cur, 0);
}

sum(1, 2, 3, 4, 5); // 15
```

## 进阶阶段：联合类型与交叉类型

### 联合类型

一个值可以是多种类型之一：

```typescript
type StringOrNumber = string | number;

function print(id: StringOrNumber): string {
    // 类型收窄（Type Narrowing）
    if (typeof id === 'string') {
        return `String: ${id.toUpperCase()}`;
    }
    return `Number: ${id.toFixed(2)}`;
}

print('abc');  // String: ABC
print(123.45); // Number: 123.45
```

### 交叉类型

多个类型合并成一个：

```typescript
interface Person {
    name: string;
    age: number;
}

interface Worker {
    company: string;
    salary: number;
}

type Employee = Person & Worker;

const employee: Employee = {
    name: '张三',
    age: 25,
    company: '某公司',
    salary: 10000
};
```

### 实用场景

```typescript
// 菜单项可能是字符串 ID 或对象
type MenuItem = string | { id: string; label: string };

function renderMenu(item: MenuItem): string {
    if (typeof item === 'string') {
        return `<a href="/${item}">${item}</a>`;
    }
    return `<a href="/${item.id}">${item.label}</a>`;
}
```

## 泛型入门

泛型是 TypeScript 中最强大的特性之一。

### 为什么需要泛型

```typescript
// 不用泛型：只能用 any，丢失类型信息
function identity(arg: any): any {
    return arg;
}

const result = identity('hello'); // type: any
```

```typescript
// 用泛型：保留类型信息
function identity<T>(arg: T): T {
    return arg;
}

const result = identity('hello'); // type: string
const num = identity(123);         // type: number
```

### 泛型约束

限制泛型的范围：

```typescript
interface Lengthwise {
    length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);
    return arg;
}

logLength('hello');     // OK
logLength([1, 2, 3]);   // OK
logLength({ length: 10 }); // OK
logLength(123);          // Error: number 没有 length 属性
```

### 泛型接口与类型别名

```typescript
// 泛型接口
interface Container<T> {
    value: T;
    getValue(): T;
}

const stringContainer: Container<string> = {
    value: 'hello',
    getValue() { return this.value; }
};

// 泛型类型别名
type Pair<K, V> = {
    key: K;
    value: V;
};

const pair: Pair<string, number> = { key: 'age', value: 25 };
```

### 泛型在函数中的应用

```typescript
// 泛型 + 联合类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

const user = { name: '张三', age: 25, email: 'zhang@example.com' };

getProperty(user, 'name');    // string
getProperty(user, 'age');     // number
getProperty(user, 'email');   // string
getProperty(user, 'invalid'); // Error
```

## 枚举类型

枚举是一组具名的常量值：

```typescript
// 数字枚举
enum Direction {
    Up,    // 0
    Down,  // 1
    Left,  // 2
    Right  // 3
}

const move = Direction.Up; // 0
```

```typescript
// 字符串枚举
enum Status {
    Pending = 'PENDING',
    Success = 'SUCCESS',
    Error = 'ERROR'
}

const current = Status.Pending; // 'PENDING'
```

```typescript
// 常量枚举（编译时内联）
const enum Color {
    Red = '#FF0000',
    Green = '#00FF00',
    Blue = '#0000FF'
}

const red = Color.Red; // 直接替换为 '#FF0000'
```

:::note
枚举会生成额外的运行时代码。如果只需要几个常量，考虑使用 `const enum` 或 `as const`。
:::

## 类型守卫

类型守卫是 TypeScript 中「收窄类型」的技术：

```typescript
// typeof
function print(value: string | number) {
    if (typeof value === 'string') {
        // 这里是 string
        console.log(value.toUpperCase());
    } else {
        // 这里是 number
        console.log(value.toFixed(2));
    }
}

// instanceof
class Dog {
    bark() { console.log('汪汪'); }
}

class Cat {
    meow() { console.log('喵喵'); }
}

function makeSound(animal: Dog | Cat) {
    if (animal instanceof Dog) {
        animal.bark();
    } else {
        animal.meow();
    }
}
```

### 自定义类型谓词

```typescript
interface Fish {
    swim(): void;
}

interface Bird {
    fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
    return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
    if (isFish(pet)) {
        pet.swim(); // TypeScript 知道这里是 Fish
    } else {
        pet.fly();  // TypeScript 知道这里是 Bird
    }
}
```

## 类型断言

有时候你比 TypeScript 更清楚一个值的类型：

```typescript
// as 语法
const input = document.getElementById('myInput') as HTMLInputElement;
input.value = 'hello'; // 不报错

// 尖括号语法（和 JSX 冲突时不适用）
const input = <HTMLInputElement>document.getElementById('myInput');

// 非空断言
const name: string | null = getName();
console.log(name!.toUpperCase()); // 确信 name 不为 null
```

:::warning
类型断言要谨慎使用。滥用会导致运行时错误，因为你跳过了 TypeScript 的检查。
:::

## 认知升级：从「不知道」到「知道不知道」

学了这么多语法后，最大的收获不是记住了多少规则，而是**认知框架的升级**。

在学习 TypeScript 之前，我以为「会写代码」就是「能让程序跑起来」。但类型系统让我意识到：**代码不仅要能跑，还要「对」。「对」的含义包括：语义清晰、边界明确、易于维护。**

这也是后来我开始理解「静态类型」和「动态类型」区别的原因：

| 特性 | 动态类型语言 | 静态类型语言 |
|------|-------------|-------------|
| 类型检查 | 运行时 | 编译时 |
| 开发体验 | 灵活，但错误发现晚 | 初期繁琐，但错误发现早 |
| 代码提示 | 弱 | 强 |
| 重构友好度 | 低 | 高 |

JavaScript 是动态类型语言，而 TypeScript 通过「类型标注」让它拥有了静态类型的优点。

## 后来的后来

学完 TypeScript 基础后，我又陆续接触了更深入的内容：

- **never 类型**：代表永远不可能发生的值
- **unknown 类型**：比 any 更安全的「任意类型」
- **装饰器**：`experimentalDecorators` 配置
- **模块解析**：`moduleResolution: "node"` / `"bundler"`
- **声明文件**：`.d.ts` 文件的作用

每深入一点，都会发现自己「不知道」的东西又多了一点。

这大概就是学习的常态：**越学，越觉得自己无知。**

## 写在最后

回顾 TypeScript 的学习，我想用一句话总结：

> TypeScript 不是让你写更少的代码，而是让你写「更不容易出错」的代码。

类型系统的本质是**约束**，而约束是为了**信任**——信任自己的代码，信任团队成员的代码，信任未来的自己能读懂现在的代码。

学会了类型系统之后，我看待代码的眼光变了。不再只是「能不能跑」，而是「对不对」「好不好」「能不能维护」。

**这就是技术学习带给我的认知升级。**

---

*生涯补全系列，记录成长路上的每一个脚印。*
