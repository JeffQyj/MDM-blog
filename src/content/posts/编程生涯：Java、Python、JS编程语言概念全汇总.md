---
title: 编程生涯：Java、Python、JS编程语言概念全汇总
published: 2023-11-11
description: 2023年11月11日，站在三门语言学习的交汇点，用生活类比和表格对比，全面梳理Java、Python、JavaScript的核心概念与差异。
tags: [Java, Python, JavaScript]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
此刻是2026年，我在整理过去的编程学习笔记。翻到2023年11月11日，那是一个特殊的节点——我已经学完了Java和Python的进阶内容，JavaScript进阶也刚刚收尾。

三门语言，三种哲学，三种思考方式。但当我把它们放在一起对比时，发现它们解决的很多问题是相通的——只是表达方式不同。

今天，我把这些对比整理成一份「概念地图」，送给同样在这三门语言中摸索的你。
:::

## 起航：三门语言的交汇点

2023年11月11日，光棍节。

但对于我来说，这一天不是关于单身与否，而是关于三门语言的交汇。

彼时的我：
- Java学完了常用API、多线程、IO流、反射、注解
- Python学完了装饰器、生成器、上下文管理器
- JavaScript学完了作用域、闭包、原型链、异步编程

三门语言，三本笔记，三套概念体系。

当我尝试把它们放在一起对比时，发现了一件有意思的事——**它们解决的是同一个问题，只是用了不同的语言**。

今天，就把这份对比整理出来。

## 变量与数据类型：三门语言的「积木」

### 变量声明：从「声明」到「推断」

如果说编程是搭积木，那变量就是积木的基本单元。

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 类型声明 | 必须声明类型 | 动态类型，不用声明 | 弱类型，不用声明 |
| 变量声明关键字 | `int a = 10;` | `a = 10` | `let a = 10;` |
| 常量声明 | `final int PI = 3.14;` | `PI = 3.14`（无真正常量） | `const PI = 3.14;` |
| 类型推断 | 无（Java 10+ var除外） | 有（自动推断） | 有（let/const自动判断） |

Java是「严谨的建筑师」——每块积木都要标明材质和尺寸。

```java
// Java：类型写在前面，一目了然
int age = 25;
String name = "张三";
double height = 1.75;
boolean isStudent = true;
```

Python是「随性的画家」——拿起笔就画，不拘泥于形式。

```python
# Python：类型靠猜，但不报错
age = 25
name = "张三"
height = 1.75
is_student = True
```

JavaScript是「灵活的魔术师」——盒子是通用的，装什么由你决定。

```javascript
// JavaScript：盒子是通用的
let age = 25;
let name = "张三";
let height = 1.75;
let isStudent = true;
```

### 数据类型对照表

| 类型分类 | Java | Python | JavaScript |
|----------|------|--------|------------|
| 整数 | `int`, `long` | `int`, `float`（统一为int） | `Number` |
| 浮点数 | `float`, `double` | `float` | `Number` |
| 字符串 | `String` | `str` | `String` |
| 布尔值 | `boolean` | `bool` | `Boolean` |
| 空值 | `null` | `None` | `null`, `undefined` |

:::note
Python没有「整数溢出」问题，因为Python的整数是「大数」，自动扩展；而Java和JavaScript都有整数范围限制。这也是Python「简洁哲学」的一部分——让语言自己处理边界情况。
:::

## 面向对象：三门语言的「家族体系」

### 类与对象：构建「对象王国」

三门语言都是面向对象的，但实现方式各有特色。

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 类定义 | `class Person {}` | `class Person:` | `class Person {}`（ES6+） |
| 构造器 | `Person(String name)` | `def __init__(self, name)` | `constructor(name)` |
| 继承关键字 | `extends` | 直接写`class Student(Person)` | `extends` |
| 方法重写 | `@Override`注解 | 直接覆盖 | 直接覆盖 |
| 访问修饰符 | `public/private/protected` | `_xxx`（约定，无语法限制） | 无真正private（ES2022+ `#xxx`） |

### 继承体系对比

**Java的继承——「正式领养」**

```java
// Java：清晰的父子关系
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

**Python的继承——「族谱追溯」**

```python
# Python：多重继承也支持
class Animal:
    def eat(self):
        print("动物在吃东西")

class Dog(Animal):
    def eat(self):
        print("狗在吃狗粮")

    def bark(self):
        print("狗在叫")

dog = Dog()
dog.eat()   # 狗在吃狗粮
dog.bark()  # 狗在叫
```

**JavaScript的继承——「原型链」**

```javascript
// JavaScript：ES6 Class语法糖
class Animal {
    eat() {
        console.log("动物在吃东西");
    }
}

class Dog extends Animal {
    eat() {
        console.log("狗在吃狗粮");
    }

    bark() {
        console.log("狗在叫");
    }
}

const dog = new Dog();
dog.eat();   // 狗在吃狗粮
dog.bark();  // 狗在叫
```

### 抽象类与接口

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 抽象类 | `abstract class` | 可用`abc`模块 | 无原生支持 |
| 接口 | `interface` | 无（用类模拟） | 无（用对象模拟） |
| 多继承 | 不支持（只支持单继承） | 支持 | 不支持（只支持单继承） |

**Java的接口——「契约社会」**

```java
// Java接口：定义行为的契约
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

// 企鹅会游泳但不会飞
class Penguin implements Swimmable {
    @Override
    public void swim() {
        System.out.println("企鹅在游泳");
    }
}

// 鸭子既会飞又会游泳
class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("鸭子在飞");
    }

    @Override
    public void swim() {
        System.out.println("鸭子在游泳");
    }
}
```

**Python的接口——「duck typing」**

Python没有显式接口，但它遵循「duck typing」原则——「如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子」。

```python
# Python：不需要声明，实现即可
class Penguin:
    def swim(self):
        print("企鹅在游泳")

class Duck:
    def fly(self):
        print("鸭子在飞")

    def swim(self):
        print("鸭子在游泳")

# 只要有swim方法，就可以
def let_them_swim(obj):
    obj.swim()  # 不检查类型，只检查方法
```

**JavaScript的接口——「协议对象」**

```javascript
// JavaScript：用对象模拟接口
const Flyable = {
    fly: function() {}
};

const Swimmable = {
    swim: function() {}
};

// 组合对象
const penguin = Object.assign({}, Swimmable, {
    swim: function() {
        console.log("企鹅在游泳");
    }
});

const duck = Object.assign({}, Flyable, Swimmable, {
    fly: function() {
        console.log("鸭子在飞");
    },
    swim: function() {
        console.log("鸭子在游泳");
    }
});
```

:::note
三种语言体现了三种设计哲学：
- **Java**：契约式编程——「先说好你能做什么，再做」
- **Python**：契约式编程的进化——「不用说好，你能做就行」
- **JavaScript**：极度灵活——「你就是你的行为」
:::

## 函数与方法：动作的「封装」

### 函数定义对比

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 定义方式 | 在类中定义方法 | `def 函数名():` | `function 函数名()` 或箭头函数 |
| 参数传递 | 值传递（基本类型）/引用传递（对象） | 对象引用传递 | 值传递（基本类型）/引用传递（对象） |
| 默认参数 | `method(int a = 10)` 不支持 | 支持 | 支持 |
| 可变参数 | `int... args` | `*args` | `...args` |

**Java的方法——「严肃认真」**

```java
public class Calculator {
    // 普通方法
    public int add(int a, int b) {
        return a + b;
    }

    // 可变参数
    public int sum(int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }
}
```

**Python的函数——「简洁优雅」**

```python
# 普通函数
def add(a, b):
    return a + b

# 默认参数
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

# 可变参数
def sum(*numbers):
    return sum(numbers)

# Lambda表达式
square = lambda x: x * x
```

**JavaScript的函数——「多变灵活」**

```javascript
// 普通函数
function add(a, b) {
    return a + b;
}

// 箭头函数
const add = (a, b) => a + b;

// 默认参数
const greet = (name, greeting = "Hello") => {
    return `${greeting}, ${name}!`;
};

// 可变参数
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0);
```

### 闭包与装饰器：函数的「进阶魔法」

如果说普通函数是「一次性的工具」，那闭包和装饰器就是「可复用的工具箱」。

**Python装饰器——「给函数穿外套」**

```python
# 装饰器：给函数添加新功能，但不改变函数本身
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("装饰器生效前")
        result = func(*args, **kwargs)
        print("装饰器生效后")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")

say_hello()
# 输出：
# 装饰器生效前
# Hello!
# 装饰器生效后
```

**JavaScript闭包——「私人保险箱」**

```javascript
// 闭包：函数能记住它出生时的环境
function createCounter() {
    let count = 0;  // 私有变量，外部无法直接访问

    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count
    };
}

const counter = createCounter();
console.log(counter.getCount());  // 0
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.getCount());  // 1
```

**Java的注解——「给代码贴标签」**

Java没有装饰器，但有注解——「给代码写注释，只不过这个注释是给程序读的」。

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MyAnnotation {
    String value();
    int priority() default 1;
}

public class UserService {
    @MyAnnotation(value = "保存用户", priority = 1)
    public void saveUser(User user) {
        // 保存逻辑
    }
}
```

| 特性 | Python | JavaScript | Java |
|------|--------|------------|------|
| 函数嵌套 | 支持 | 支持 | 支持（内部类） |
| 闭包 | 支持 | 支持 | 支持（内部类+接口） |
| 装饰器 | `@decorator` | 无原生（用高阶函数模拟） | 注解+反射 |
| 高阶函数 | 支持 | 支持 | 部分支持（Stream API） |

## 异常处理：程序的「安全气囊」

三门语言都有异常处理机制，但细节各有不同。

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 异常体系 | 继承树结构（Throwable） | 继承自BaseException | 基于Error对象 |
| 捕获语法 | `try-catch-finally` | `try-except-finally` | `try-catch-finally` |
| 抛出异常 | `throw new Exception()` | `raise Exception()` | `throw new Error()` |
| 自定义异常 | `extends Exception` | `class MyError(Exception)` | `class MyError extends Error` |
| 运行时异常 | `RuntimeException` | 无需声明 | 无需声明 |

### 异常处理对比

**Java——「严谨的安全气囊」**

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("除数不能为0：" + e.getMessage());
} catch (Exception e) {
    System.out.println("其他异常：" + e.getMessage());
} finally {
    System.out.println("无论是否异常，都会执行");
}
```

**Python——「简洁的保险丝」**

```python
try:
    result = 10 / 0
except ZeroDivisionError:
    print("除数不能为0")
except Exception as e:
    print(f"其他异常：{e}")
finally:
    print("无论是否异常，都会执行")
```

**JavaScript——「灵活的防护网」**

```javascript
try {
    const result = 10 / 0;
} catch (error) {
    console.log("出错了：" + error.message);
} finally {
    console.log("无论是否异常，都会执行");
}
```

:::note
Java的异常分为「受检异常」和「运行时异常」。受检异常必须声明或捕获，这是Java的「严谨」之处。Python和JavaScript则更灵活——异常就是异常，处理方式一样。
:::

## 集合框架：三门语言的「容器」

### 列表/数组：有序集合

| 操作 | Java | Python | JavaScript |
|------|------|--------|------------|
| 创建 | `List<int> list = new ArrayList<>();` | `list = [1, 2, 3]` | `let arr = [1, 2, 3]` |
| 添加元素 | `list.add(element)` | `list.append(element)` | `arr.push(element)` |
| 遍历 | `for (int item : list)` | `for item in list` | `for (let item of arr)` |
| 长度 | `list.size()` | `len(list)` | `arr.length` |

**Java——「类型安全的数组」**

```java
List<String> names = new ArrayList<>();
names.add("张三");
names.add("李四");
names.add("王五");

for (String name : names) {
    System.out.println(name);
}
```

**Python——「随性的列表」**

```python
names = ["张三", "李四", "王五"]

for name in names:
    print(name)

# 列表推导式：一行代码完成过滤+转换
squares = [x * x for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]
```

**JavaScript——「万能的数组」**

```javascript
const names = ["张三", "李四", "王五"];

names.forEach(name => console.log(name));

// 映射
const squares = [1, 2, 3, 4, 5].map(x => x * x);
console.log(squares);  // [1, 4, 9, 16, 25]
```

### 映射/字典：键值对

| 操作 | Java | Python | JavaScript |
|------|------|--------|------------|
| 创建 | `Map<String, Integer> map = new HashMap<>();` | `dict = {"a": 1}` | `let map = {a: 1}` |
| 添加 | `map.put(key, value)` | `dict[key] = value` | `map[key] = value` |
| 获取 | `map.get(key)` | `dict[key]` | `map[key]` |
| 遍历 | `map.forEach((k, v) => {})` | `for k, v in dict.items()` | `Object.entries(map)` |

**Java——「规范的映射」**

```java
Map<String, Integer> scores = new HashMap<>();
scores.put("语文", 90);
scores.put("数学", 95);
scores.put("英语", 88);

scores.forEach((subject, score) -> {
    System.out.println(subject + ": " + score);
});
```

**Python——「直觉的字典」**

```python
scores = {"语文": 90, "数学": 95, "英语": 88}

for subject, score in scores.items():
    print(f"{subject}: {score}")

# 字典推导式
double_scores = {k: v * 2 for k, v in scores.items()}
```

**JavaScript——「对象的化身」**

```javascript
const scores = {语文: 90, 数学: 95, 英语: 88};

Object.entries(scores).forEach(([subject, score]) => {
    console.log(`${subject}: ${score}`);
});

// 映射新对象
const doubleScores = Object.fromEntries(
    Object.entries(scores).map(([k, v]) => [k, v * 2])
);
```

| 集合类型 | Java | Python | JavaScript |
|----------|------|--------|------------|
| 列表 | `ArrayList`, `LinkedList` | `list` | `Array` |
| 集合 | `HashSet`, `TreeSet` | `set` | `Set` |
| 映射 | `HashMap`, `TreeMap` | `dict` | `Object`, `Map` |
| 队列 | `Queue`, `Deque` | `collections.deque` | 无原生（用数组模拟） |

## 并发编程：三门语言的「分身术」

### 线程与进程

| 特性 | Java | Python | JavaScript |
|------|------|--------|------------|
| 并发模型 | 原生多线程 | 受GIL限制 | 单线程+事件循环 |
| 线程创建 | `Thread`/`Runnable` | `threading`（受GIL限制） | 无原生线程 |
| 进程创建 | `Process` | `multiprocessing` | 无原生进程 |
| 异步编程 | `CompletableFuture` | `asyncio` | `Promise`/`async/await` |

**Java多线程——「真正的分身」**

```java
// 方式一：继承Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程1正在执行");
    }
}

// 方式二：实现Runnable（更常用）
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("线程2正在执行");
    }
}

// 启动
Thread t1 = new MyThread();
Thread t2 = new Thread(new MyRunnable());
t1.start();
t2.start();
```

**JavaScript异步——「单线程的魔法」**

JavaScript是单线程的，但它通过事件循环实现了「并发」：

```javascript
// 回调函数
setTimeout(function() {
    console.log("异步任务完成");
}, 1000);

// Promise
fetch("https://api.example.com/data")
    .then(response => response.json())
    .then(data => console.log(data));

// async/await（最直观）
async function fetchData() {
    const response = await fetch("https://api.example.com/data");
    const data = await response.json();
    console.log(data);
}
```

**Python异步——「协程的艺术」**

```python
import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return "数据"

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())
```

| 模型 | Java | Python | JavaScript |
|------|------|--------|------------|
| 线程 | 原生支持 | 受GIL限制 | 无（单线程） |
| 进程 | 原生支持 | 原生支持 | 无 |
| 协程 | Project Loom（发展中） | 原生支持 | 原生支持（async/await） |
| 异步IO | `CompletableFuture` | `asyncio` | `Promise` |

:::note
Python的GIL（全局解释器锁）是一个历史遗留问题——它确保同一时刻只有一个线程执行Python字节码。这意味着Python的多线程不能真正利用多核CPU。对于CPU密集型任务，要用多进程；对于IO密集型任务，协程是更好的选择。
:::

## 设计模式：三门语言的「套路」

设计模式是解决问题的「套路」，三门语言都能实现，但表达方式不同。

### 单例模式：全局唯一

**Java——「双重检查锁定」**

```java
public class Singleton {
    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}
```

**Python——「模块就是单例」**

```python
# Python的模块本身就是单例
# 创建一个singleton.py
class Singleton:
    pass

singleton = Singleton()  # 模块级别只有一个实例
```

**JavaScript——「闭包实现」**

```javascript
const Singleton = (function() {
    let instance;

    function createInstance() {
        return { message: "我是单例" };
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

const obj1 = Singleton.getInstance();
const obj2 = Singleton.getInstance();
console.log(obj1 === obj2);  // true
```

### 工厂模式：统一创建

**Java——「反射+配置文件」**

```java
public class BeanFactory {
    public static Object getBean(String className) {
        try {
            Class<?> clazz = Class.forName(className);
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException("创建Bean失败", e);
        }
    }
}
```

**Python——「函数即对象」**

```python
def create_product(type_name):
    products = {
        "A": ProductA,
        "B": ProductB,
    }
    return products[type_name]()

product = create_product("A")
```

**JavaScript——「对象映射」**

```javascript
const factory = {
    createA: function() { return new ProductA(); },
    createB: function() { return new ProductB(); }
};

const product = factory.createA();
```

## 站在今天，回望这三门语言

2023年11月11日，当我把这三门语言放在一起对比时，最大的感受是——**它们解决的是同一个问题，只是表达方式不同**。

| 维度 | Java | Python | JavaScript |
|------|------|--------|------------|
| 设计哲学 | 严谨、类型安全、编译时检查 | 简洁、可读性、duck typing | 灵活、动态、原型继承 |
| 核心优势 | 企业级应用、Android | 脚本、数据分析、AI | 前端开发、Node.js |
| 学习曲线 | 较陡（类型+语法） | 平缓（语法简洁） | 先易后难（坑多） |
| 性能 | 高（编译型+JIT） | 中（解释型） | 高（ JIT编译） |

三门语言，三种哲学：

- **Java**：像「严谨的建筑」——每块砖都要标明尺寸，每个结构都要提前规划。它教会我「好的代码是设计出来的」。
- **Python**：像「瑞士军刀」——轻便、实用、一专多能。它教会我「代码是写给人看的，顺便让机器执行」。
- **JavaScript**：像「变形金刚」——灵活到没有固定形态。它教会我「解决问题不只有一种方式」。

:::note
学得越多，越发现「万物归一」。不同的语言、不同的框架，解决问题的思路往往是相通的。

这也是为什么，我从不觉得学一门新语言是「从头开始」——因为核心概念是相通的，变的只是表达方式。
:::

---

*2023年11月11日的这份概念对比，帮我理清了三门语言的关系，也让我对「编程语言」这件事有了更深的理解。*
