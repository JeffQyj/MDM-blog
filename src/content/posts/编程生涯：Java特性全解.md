---
title: 编程生涯：Java特性全解
published: 2026-06-02
description: 系统梳理Java近三十年核心新特性，以"五大LTS接力赛"为主线，串起Java 8/11/17/21/25五大里程碑版本，中间穿插非LTS过渡期的关键铺垫，助你建立完整的Java特性认知地图与升级决策树。
tags: [Java, 新特性, LTS, JDK演进, 函数式编程]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
把 Java 这三十年想象成一场"版本接力赛"，从 1.0 时代的拓荒，到 8 的函数式革命，再到 25 的集大成，每一个 LTS 都在给世界交出一份新的答卷。本文以"五大 LTS 接力赛"为主线，把过渡版本压缩为"LTS 之间的预热场"，带你一次性建立完整的 Java 特性认知地图。
:::

## 第一章：Java 前传——1.0 到 1.7 的三十年沉浮

在 Java 8 横空出世之前，Java 世界其实已经走过了十五个春秋。这段历史看似平淡，实则为后来 LTS 战略的诞生埋下了关键伏笔。

### 1.1 拓荒时代：JDK 1.0-1.4（1996-2002）

1996 年，Sun Microsystems 推出 JDK 1.0，Java 正式走入历史舞台。这五年是 Java 的拓荒期，每一个大版本都意味着语言层面的关键进步：

| 版本      | 时间      | 关键特性                               |
| ------- | ------- | ---------------------------------- |
| JDK 1.0 | 1996.01 | AWT、Applet、JDBC 雏形                 |
| JDK 1.1 | 1997.02 | 内部类、反射、JavaBeans、JDBC              |
| JDK 1.2 | 1998.12 | **Collections 集合框架**、Swing、JIT 编译器 |
| JDK 1.3 | 2000.05 | JNDI、JDK 1.3 默认 HotSpot 虚拟机        |
| JDK 1.4 | 2002.02 | **NIO**、正则表达式、断言、日志 API            |

> 1.2 引入了 Collections 框架，这是 Java 标准库"工具箱"化的开端；1.4 的 NIO 则为后来 Netty、Tomcat 等高性能中间件奠定了底层基础。

### 1.2 承前启后：JDK 5（2004）

JDK 5 是 Java 历史上"承前启后"的里程碑，引入了大量现代语言特性：

```java
// 泛型：类型安全从运行时提前到编译期
List<String> list = new ArrayList<String>();

// 注解：Spring 生态的基石
@Override
public String toString() { return "JDK 5"; }

// 增强 for 循环：告别 Iterator 样板代码
for (String s : list) {
    System.out.println(s);
}

// 枚举：单例 + 类型安全的常量集
public enum Color { RED, GREEN, BLUE }

// 可变参数与自动装箱
public void log(String... messages) { /* ... */ }
```

> 毫不夸张地说，**没有 JDK 5 的泛型与注解，就不会有后来的 Spring 帝国**。

### 1.3 长寿稳定版：JDK 6（2006）

JDK 6 生命周期长达 7 年（至 2013 年 4 月），在 JDK 7 发布后依然是大量企业的首选。这个版本主要做的是**性能优化**与**脚本引擎集成**（JSR 223），是 Java 走向成熟的标志。

:::note
JDK 6 的长寿给 Oracle 留下了重要启示：**企业用户需要的是稳定**，而不是一年一变的尝鲜。这为后来 LTS 战略的提出埋下了伏笔。
:::

### 1.4 临门一脚：JDK 7（2011）

JDK 7 在语言层面没有大刀阔斧的改革，但几项改进至今仍是开发高频：

```java
// try-with-resources：告别 finally 里的 close() 样板代码
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    return br.readLine();
}

// switch 支持字符串
switch (day) {
    case "MON": return 1;
    case "TUE": return 2;
    // ...
}

// 钻石运算符 <>：泛型推断的语法糖
Map<String, List<Integer>> map = new HashMap<>();

// 数字字面量下划线 + 二进制支持
int billion = 1_000_000_000;
int binary = 0b1010_1010;
```

但 JDK 7 没能复制 JDK 6 的辉煌——它的商业支持在 2022 年 7 月正式结束，反而是紧随其后的 **JDK 8 成为了新的"长寿王者"**。

***

## 第二章：Java 8 LTS——函数式编程革命

如果说 Java 三十年历史中只允许选一个版本，那一定是 **JDK 8**。它是第一个 LTS 版本，引入了影响深远的革命性特性，并直接定义了此后近十年的开发范式。

### 2.1 为什么 JDK 8 至今长盛不衰？

JDK 8 的成功是 Oracle 商业策略、技术革新、生态固化三者合力的结果。

**支柱一：超长待机保障**

| 版本        | 首次发布时间  | Oracle 免费更新截止     | 第三方商业支持可至 |
| --------- | ------- | ----------------- | --------- |
| **JDK 8** | 2014.03 | 2019.01（个人/开发无限期） | 约 2030 年  |
| **JDK 7** | 2011.07 | 2015.04           | 约 2028 年  |
| **JDK 6** | 2006.12 | 2013.04           | 约 2028 年  |

**支柱二：语言层面的革命**

- Lambda 表达式：让 Java 拥抱函数式编程
- Stream API：声明式集合处理
- `java.time` 包：彻底重构日期时间 API
- 接口默认方法：解决接口演化难题

**支柱三：生态锁定**

- Spring Boot 2.x 深度依赖 JDK 8
- 主流中间件（Dubbo、RocketMQ、MyBatis）在 JDK 8 上经历了最广泛的测试

> 毫不夸张地说：**JDK 8 凭一己之力，把 Java 推向了函数式编程时代**。

### 2.2 Lambda 表达式：函数式编程的入场券

Lambda 是 Java 8 最具标志性的特性，它让 Java 第一次拥有了"将函数作为参数传递"的能力。

**语法格式**：

```java
(参数列表) -> { 方法体 }
```

**新旧对比**：

```java
// Java 8 之前：按钮点击事件需要匿名内部类
button.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        System.out.println("按钮被点击了");
    }
});

// Java 8 之后：Lambda 一行搞定
button.addActionListener(e -> System.out.println("按钮被点击了"));

// 创建线程也一样
new Thread(() -> System.out.println("线程正在运行")).start();
```

**三条简化规则**：

1. 参数类型可省略，编译器自动推断
2. 只有一个参数时，括号可省略
3. 方法体只有一行时，大括号和 `return` 可省略

### 2.3 方法引用：Lambda 的极致简化

当 Lambda 体里只是调用一个已存在的方法时，方法引用可以让代码再瘦一圈。

| 类型       | 语法          | 示例                    |
| -------- | ----------- | --------------------- |
| 静态方法引用   | `类名::静态方法名` | `Integer::valueOf`    |
| 实例方法引用   | `对象::实例方法名` | `System.out::println` |
| 类的实例方法引用 | `类名::实例方法名` | `String::length`      |
| 构造方法引用   | `类名::new`   | `ArrayList::new`      |

```java
List<String> names = Arrays.asList("Jeff", "MDM", "AI");

// Lambda 写法
names.forEach(name -> System.out.println(name));

// 方法引用写法（更简洁）
names.forEach(System.out::println);
```

:::important
在 MyBatis Plus 等 ORM 框架中，方法引用被广泛用于构造查询条件，避免了硬编码字段名：

```java
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getName, "Jeff"); // 等价于 eq("name", "Jeff")
```

:::

### 2.4 函数式接口：Lambda 的类型契约

**函数式接口 = 只有一个抽象方法的接口**，Lambda 表达式的本质就是函数式接口的匿名实现。

```java
@FunctionalInterface
public interface Calculator {
    double calculate(double a, double b);
}

Calculator add = (a, b) -> a + b;
Calculator multiply = (a, b) -> a * b;
```

Java 8 在 `java.util.function` 包中预置了 6 个高频内置接口：

| 接口                  | 方法                    | 作用   | 示例     |
| ------------------- | --------------------- | ---- | ------ |
| `Predicate<T>`      | `boolean test(T t)`   | 条件判断 | 过滤集合元素 |
| `Function<T, R>`    | `R apply(T t)`        | 数据转换 | 字符串转长度 |
| `Consumer<T>`       | `void accept(T t)`    | 消费数据 | 遍历集合   |
| `Supplier<T>`       | `T get()`             | 提供数据 | 延迟加载   |
| `UnaryOperator<T>`  | `T apply(T t)`        | 一元操作 | 数字自增   |
| `BinaryOperator<T>` | `T apply(T t1, T t2)` | 二元操作 | 数字相加   |

> 注：`UnaryOperator<T>` 本质上是 `Function<T, T>` 的子接口（特殊化），方法签名继承自 `Function`，但语义上强调"输入输出类型相同"，例如数字自增、字符串去空格。

> **关键细节**：函数式接口可以包含多个 `default` 和 `static` 方法，因为它们不是抽象方法。注解 `@FunctionalInterface` 不是必须的，但强烈建议加——编译器会自动校验。

### 2.5 Stream API：声明式集合处理

如果说 Lambda 是入场券，Stream API 就是 Java 函数式编程的主舞台。它让集合处理从"命令式循环"进化到"声明式流水线"。

```
原始集合 → 创建流 → 中间操作1 → 中间操作2 → ... → 终端操作 → 最终结果
```

**新旧对比**：

```java
List<String> words = Arrays.asList("apple", "banana", "cherry", "date", "elderberry");

// 传统写法：繁琐的样板代码
List<String> result = new ArrayList<>();
for (String word : words) {
    if (word.length() > 5) {
        result.add(word.toUpperCase());
    }
}
Collections.sort(result);

// Stream 写法：声明式、链式调用
List<String> result = words.stream()
    .filter(word -> word.length() > 5)   // 过滤
    .map(String::toUpperCase)            // 转换
    .sorted()                            // 排序
    .collect(Collectors.toList());       // 收集
```

**Stream 操作分两类**：

| 类型       | 特点              | 触发时机       |
| -------- | --------------- | ---------- |
| **中间操作** | 返回 Stream，可链式调用 | 惰性求值，不立即执行 |
| **终端操作** | 返回非 Stream      | 触发整条流水线执行  |

**常用中间操作**：

| 方法                                | 作用        |
| --------------------------------- | --------- |
| `filter(Predicate)`               | 过滤元素      |
| `map(Function)`                   | 转换元素类型    |
| `sorted()` / `sorted(Comparator)` | 排序        |
| `distinct()`                      | 去重        |
| `limit(long)`                     | 限制数量      |
| `skip(long)`                      | 跳过前 n 个   |
| `peek(Consumer)`                  | 调试用，不改变元素 |

**常用终端操作**：

| 方法                                    | 作用    |
| ------------------------------------- | ----- |
| `collect(Collector)`                  | 收集到集合 |
| `forEach(Consumer)`                   | 遍历    |
| `count()`                             | 统计数量  |
| `findFirst()` / `findAny()`           | 查找元素  |
| `anyMatch` / `allMatch` / `noneMatch` | 匹配判断  |
| `reduce(BinaryOperator)`              | 归约    |
| `max` / `min`                         | 极值    |

:::caution
**并行流的 4 大陷阱**：

```java
// 错误：共享变量导致线程不安全
int[] sum = {0};
numbers.parallelStream().forEach(n -> sum[0] += n); // 结果不确定

// 正确：用 reduce 保证原子性
int sum = numbers.parallelStream().reduce(0, Integer::sum);
```

1. **使用全局线程池**：默认 `ForkJoinPool.commonPool()`，线程数 = CPU 核心数 - 1
2. **不一定更快**：小数据集下线程切换开销可能超过并行收益
3. **不适合 I/O 密集型**：如数据库查询、网络请求
4. **必须考虑线程安全**：共享可变状态会出现竞争
   :::

### 2.6 Optional：优雅处理 null

`NullPointerException` 长期霸榜 Java 异常 TOP 1。Optional 的设计哲学是：**强制开发者显式处理空值**。

**三种创建方式**：

```java
Optional<String> opt1 = Optional.of("Hello");             // 非空值，传 null 立即抛 NPE
Optional<String> opt2 = Optional.ofNullable(getName());   // 可能为 null，最常用
Optional<String> opt3 = Optional.empty();                  // 显式空
```

**安全取值**：

```java
// 不推荐：直接 get()，空时会抛 NoSuchElementException
opt1.get();

// 推荐：提供默认值
opt1.orElse("默认值");
opt1.orElseGet(() -> "动态生成");  // 仅当为空时才执行 Supplier

// 推荐：为空时抛业务异常
opt1.orElseThrow(() -> new IllegalArgumentException("参数不能为空"));
```

:::important
**面试高频考点：`orElse()`** **vs** **`orElseGet()`** **的区别**

```java
public static String generate() {
    System.out.println("生成默认值");
    return "默认值";
}

Optional<String> opt = Optional.of("实际值");

opt.orElse(generate());    // 仍会打印"生成默认值"
opt.orElseGet(() -> generate());  // 不会执行
```

核心区别在于**执行时机**：`orElse()` 无论 Optional 是否有值，都会执行括号内表达式；`orElseGet()` 只在为空时才执行 Supplier。
:::

**链式调用避免嵌套判空**：

```java
// 传统写法：地狱级嵌套
String city = null;
if (user != null) {
    Address address = user.getAddress();
    if (address != null) {
        City cityObj = address.getCity();
        if (cityObj != null) {
            city = cityObj.getName();
        }
    }
}

// Optional 写法：优雅链式
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .map(City::getName)
    .orElse("未知城市");
```

**避坑指南**：

- ❌ 不要把 Optional 作为类的字段
- ❌ 不要把 Optional 作为方法参数
- ❌ 不要嵌套 `Optional<Optional<String>>`
- ❌ 不要用 Optional 包装集合

### 2.7 新日期时间 API：彻底解决旧 API 痛点

`java.time` 包是对旧版 `Date` / `Calendar` 的**彻底重构**。

**旧 API 的五大罪状**：

- 线程不安全（`Date`、`Calendar`、`SimpleDateFormat` 都是可变类）
- 设计反人类（月份从 0 开始，年份从 1900 开始）
- 职责不清（`Date` 同时含日期和时间）
- 时区处理繁琐
- 格式化工具不安全

**新 API 的 7 大核心类**：

| 类名              | 作用           | 示例                                             |
| --------------- | ------------ | ---------------------------------------------- |
| `LocalDate`     | 日期（年-月-日）    | `2025-09-01`                                   |
| `LocalTime`     | 时间（时-分-秒-纳秒） | `14:30:25.123`                                 |
| `LocalDateTime` | 日期+时间        | `2025-09-01T14:30:25.123`                      |
| `ZonedDateTime` | 带时区的日期+时间    | `2025-09-01T14:30:25.123+08:00[Asia/Shanghai]` |
| `Instant`       | 时间戳          | Unix 时间戳                                       |
| `Duration`      | 时间间隔（时-分-秒）  | 两个时间点之差                                        |
| `Period`        | 日期间隔（年-月-日）  | 两个日期之差                                         |

**重要细节**：新 API 的月份从 **1** 开始（1 代表 1 月），彻底告别反人类设计。

**格式化与解析**（`DateTimeFormatter` 线程安全，可作为全局常量）：

```java
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss");
String formatted = LocalDateTime.now().format(formatter); // 2025年09月01日 14:30:25
```

**日期计算**（所有方法返回新对象，原对象不可变）：

```java
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusWeeks(1);
LocalDate lastMonth = today.minusMonths(1);
```

### 2.8 接口默认方法与静态方法

**默认方法解决的核心问题**：接口一旦发布就无法在不破坏现有实现的情况下添加新方法。

```java
public interface Drawable {
    void draw();

    // 默认方法：提供默认实现，已有实现类自动继承
    default void drawWithBorder() {
        System.out.println("绘制边框");
        draw();
        System.out.println("边框绘制完成");
    }
}
```

正是有了默认方法，Java 8 才能在不破坏任何现有代码的情况下，给所有集合类添加 `stream()`、`forEach()` 等方法。

**冲突解决规则**：

| 场景             | 规则           |
| -------------- | ------------ |
| 父类方法 vs 接口默认方法 | 父类优先（类优先原则）  |
| 两个接口同名默认方法     | 编译器报错，必须显式指定 |

```java
public class C implements A, B {
    @Override
    public void hello() {
        A.super.hello();  // 显式选择 A 接口的默认方法
    }
}
```

**接口 vs 抽象类**：

| 特性   | 接口默认方法                   | 抽象类  |
| ---- | ------------------------ | ---- |
| 继承数量 | 多实现                      | 单继承  |
| 成员变量 | 只能 `public static final` | 任意类型 |
| 构造方法 | 无                        | 有    |
| 状态   | 无                        | 可保存  |

***

## 第三章：Java 9-10——跨入现代 Java 的过渡

Java 9 和 10 是两个**快速发布版本**，它们的重要使命是：为 Java 11 LTS 铺路，并孵化对未来影响深远的特性。

### 3.1 Java 9：模块系统与集合工厂方法

**模块系统（Project Jigsaw）** 是 Java 9 最大的特性，通过 `module-info.java` 实现强封装与显式依赖：

```java
// module-info.java
module user.management {
    exports com.company.user.service;  // 只导出 service 包
    requires java.base;                // 所有模块默认依赖
    requires database.connection;      // 显式声明依赖
}
```

:::note
**模块系统的现状**：概念很美好，但企业应用极少。改造现有项目成本远大于收益，传统 Maven/Gradle + JAR 模式已能满足大多数需求。普通开发者了解概念即可，无需在项目中强制使用。
:::

**集合工厂方法**（Java 9 最实用的特性，必备）：

```java
// Java 9 之前：创建不可变集合极其繁琐
List<String> oldList = new ArrayList<>();
oldList.add("苹果");
oldList.add("香蕉");
List<String> immutableList = Collections.unmodifiableList(oldList);

// Java 9 之后：一行代码
List<String> fruits = List.of("苹果", "香蕉", "草莓");
Set<Integer> numbers = Set.of(1, 2, 3, 4, 5);
Map<String, Integer> scores = Map.of("张三", 85, "Jeff", 92);
Map<String, String> largeMap = Map.ofEntries(
    Map.entry("key1", "value1"),
    Map.entry("key2", "value2")
);
```

**重要特性**：

- 真正不可变：任何修改操作立即抛 `UnsupportedOperationException`
- 不允许 null 元素
- Set/Map 不允许重复键

**JShell REPL**：Java 9 终于有了交互式解释器：

```
jshell> int a = 10;
a ==> 10
jshell> System.out.println(a + 20);
30
```

**其他实用改进**：

- **接口私有方法**：解决默认方法之间的代码重复

```java
public interface Calculator {
    private void validate(double x, double y) {  // 私有方法
        if (x <= 0 || y <= 0) throw new IllegalArgumentException("必须为正数");
    }
    default double add(double x, double y) {
        validate(x, y);
        return x + y;
    }
}
```

- **try-with-resources 改进**：允许直接使用外部 **effectively final**（事实上不可变）的变量，不要求显式声明 `final`

```java
BufferedReader reader = Files.newBufferedReader(Paths.get(filename));
try (reader) {  // 不需要重新赋值
    reader.lines().forEach(System.out::println);
}
```

### 3.2 Java 10：var 关键字

`var` 是 Java 10 唯一实用的特性，支持**局部变量类型推断**：

```java
// 传统写法：类型重复且冗长
Map<String, List<Integer>> complexMap = new HashMap<String, List<Integer>>();

// var 写法：编译器自动推断
var complexMap = new HashMap<String, List<Integer>>();
```

:::caution
**var 的使用限制**：

- ❌ 不能用于成员变量、方法参数、方法返回值
- ❌ 必须声明时初始化
- ❌ 不能初始化为 null
- ❌ **var 不是动态类型**，Java 仍是强类型语言，类型一旦推断确定不可改变

```java
var num = 10;     // 推断为 int
num = "hello";    // 编译错误：不能将 String 赋值给 int
```

**最佳实践**：右侧类型明显时用，类型不明显时不用。
:::

***

## 第四章：Java 11 LTS——现代化工具集大成

Java 11 是**第二个官方 LTS**，是企业从 8 升级的常见跳板。它没有大刀阔斧的语法改革，而是把重心放在**标准库优化**上。

### 4.1 内置 HttpClient API

Java 11 将孵化版 HttpClient 正式转正，原生支持 **HTTP/2、WebSocket**，告别 OkHttp/RestTemplate 才能发请求的时代。

```java
// 1. 创建客户端
HttpClient client = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

// 2. 构建 GET 请求
HttpRequest getRequest = HttpRequest.newBuilder()
        .uri(URI.create("https://codefather.cn"))
        .header("Accept", "application/json")
        .timeout(Duration.ofSeconds(30))
        .GET()
        .build();

// 同步发送
HttpResponse<String> response = client.send(getRequest, HttpResponse.BodyHandlers.ofString());
System.out.println("状态码：" + response.statusCode());

// 异步发送（基于 CompletableFuture）
client.sendAsync(getRequest, HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body)
        .thenAccept(System.out::println);

// WebSocket 长连接
WebSocket ws = HttpClient.newHttpClient()
        .newWebSocketBuilder()
        .buildAsync(URI.create("ws://localhost:8080/ws"), new WebSocket.Listener() {})
        .join();
```

**核心优势**：全异步基于 NIO + `CompletableFuture`，高并发性能优秀；HTTP/2 多路复用、WebSocket 开箱即用。

### 4.2 String 4 个高频实用方法

| 方法            | 作用            | 与旧 API 区别                       |
| ------------- | ------------- | ------------------------------- |
| `isBlank()`   | 判断空白字符串       | 比 `isEmpty()` 更严格，能识别全空格、Tab、换行 |
| `strip()` 系列  | Unicode 安全去空格 | 比 `trim()` 兼容全角空格、Unicode 空白符   |
| `lines()`     | 按行切割为 Stream  | 自动处理 `\n` / `\r` / `\r\n`       |
| `repeat(int)` | 字符串重复拼接       | 告别手写 for 循环拼接                   |

```java
"   ".isBlank();                  // true
"\n\t".isBlank();                 // true

"  Hello World  \n".strip();      // "Hello World"
"  Hello World  \n".stripLeading();  // "Hello World  \n"

String multiLine = "第一行\n第二行\n第三行";
multiLine.lines().count();        // 3

"=".repeat(50);                   // 生成 50 个等号的分隔线
```

### 4.3 Files 文件读写新 API

```java
// 1. 一行代码写入文件
Path path = Files.writeString(Paths.get("temp.txt"), "测试内容", StandardCharsets.UTF_8);

// 2. 一次性读取全文件
String content = Files.readString(path, StandardCharsets.UTF_8);

// 3. 大文件流式按行读取（避免一次性加载全文件）
try (Stream<String> lineStream = Files.lines(path, StandardCharsets.UTF_8)) {
    lineStream.filter(line -> !line.isBlank())
              .map(String::trim)
              .forEach(System.out::println);
}
```

### 4.4 其他重要特性

- **var 可用于 lambda 形参**：方便给 lambda 参数加注解，`(var s) -> s.length()`
- **单文件直接运行源码**：`java Hello.java` 无需先 javac 编译
- **ZGC 雏形上线**：Java 11 引入 ZGC，但要到 Java 21 才完全生产可用
- **移除 JavaEE 包**：javax.xml、javax.annotation 等需要手动引入依赖

***

## 第五章：Java 12-16——语法糖密集发布期

这一段是 Java 17 LTS 的"预热期"，4 个重量级预览特性在这里转正。

### 5.1 Java 14：Switch 表达式正式转正

**传统 switch 的三大痛点**：

- 必须手动 `break`，否则 case 穿透
- 不能直接返回值，需要临时变量
- 代码冗长，可读性差

**新语法：用** **`->`** **替代** **`:`，自动 break**：

```java
// 传统写法
String dayType;
switch (day) {
    case MONDAY: case TUESDAY: case WEDNESDAY: case THURSDAY: case FRIDAY:
        dayType = "工作日";
        break;
    case SATURDAY: case SUNDAY:
        dayType = "周末";
        break;
    default:
        dayType = "未知";
}

// 新写法
String dayType = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "工作日";
    case SATURDAY, SUNDAY -> "周末";
    default -> "未知";
};
```

**复杂逻辑用 yield**：

```java
int score = switch (grade) {
    case 'A' -> {
        System.out.println("优秀！");
        yield 90;
    }
    case 'B' -> 80;
    default -> 0;
};
```

**增强的 NPE**：Java 14 改进了 NPE 错误信息，JVM 会精确指出哪个变量为 null：

```
Cannot invoke "String.length()" because "yupi" is null
    at com.yupi.Main.main(Main.java:7)
```

### 5.2 Java 15：文本块正式转正

**传统多行字符串的痛点**：

```java
// 丑陋不堪
String sql = "SELECT u.name, u.email, p.title\n" +
             "FROM users u\n" +
             "JOIN posts p ON u.id = p.user_id\n" +
             "WHERE u.status = 1\n" +
             "ORDER BY p.created_at DESC";
```

**新语法：用三个双引号** **`"""`** **包裹**：

```java
String sql = """
             SELECT u.name, u.email, p.title
             FROM users u
             JOIN posts p ON u.id = p.user_id
             WHERE u.status = 1
             ORDER BY p.created_at DESC
             """;
```

**典型应用**：SQL/NoSQL、HTML/XML/JSON 模板、邮件/短信模板。

**动态模板**（`String.formatted()` 最早作为文本块的配套功能在 Java 13 引入预览，Java 15 随文本块一起正式转正）：

```java
String emailTemplate = """
                       尊敬的 %s：
                       感谢您注册我们的编程导航！
                       您的账户信息如下：
                       - 用户名：%s
                       - 注册时间：%s
                       """;
String email = emailTemplate.formatted("Jeff", "Jeff", "2026-06-02");
```

### 5.3 Java 16：Records 正式转正

**传统 DTO 的样板代码灾难**：

```java
public class Person {
    private final String name;
    private final int age;
    private final String email;
    public Person(String name, int age, String email) { /* 构造 */ }
    public String getName() { return name; }
    public int getAge() { return age; }
    public String getEmail() { return email; }
    @Override public boolean equals(Object o) { /* 几十行 */ }
    @Override public int hashCode() { /* 几十行 */ }
    @Override public String toString() { /* 几十行 */ }
}
```

**Records 一行搞定**：

```java
public record Person(String name, int age, String email) {}
```

**编译器自动生成**：

- 所有字段都是 `private final`
- 全参数构造函数
- 访问器方法（注意是 `name()` 而不是 `getName()`）
- 正确的 `equals()` / `hashCode()` / `toString()`

**紧凑构造函数做校验**：

```java
public record BankAccount(String accountNumber, double balance) {
    public BankAccount {
        if (balance < 0) throw new IllegalArgumentException("余额不能为负数");
        if (accountNumber == null || accountNumber.isBlank())
            throw new IllegalArgumentException("账号不能为空");
    }

    public boolean isVIP() { return balance > 1_000_000; }
}
```

:::caution
**Records 的 4 个约束**：

- 不可变类（所有字段 final）
- 不能继承其他类（默认继承 `java.lang.Record`）
- 可以实现接口
- 适合纯数据载体，不适合有复杂业务逻辑的类
  :::

### 5.4 Java 16：instanceof 模式匹配正式转正

**传统写法**：

```java
if (obj instanceof String) {
    String str = (String) obj;  // 冗余的强制类型转换
    return str.length();
}
```

**新写法**：

```java
if (obj instanceof String str) {  // 判断类型的同时声明变量
    return str.length();
}
```

变量 `str` 的作用域仅限于 `if` 条件为 true 的代码块，符合最小作用域原则。

### 5.5 Java 16 Stream 新增 API

**`Stream.toList()`**：

```java
// 旧写法
List<String> result = stream.filter(s -> s.length() > 3)
                            .collect(Collectors.toList());

// 新写法
List<String> result = stream.filter(s -> s.length() > 3).toList();
```

**关键差异**：

| 方法                    | 返回集合           | 实现      |
| --------------------- | -------------- | ------- |
| `Collectors.toList()` | 可变 `ArrayList` | 收集器容器累加 |
| `Stream.toList()`     | 不可变 `List`     | 固定长度集合  |

**`Stream.mapMulti()`**：替代 `flatMap`，无中间 Stream 开销：

```java
List<String> words = List.of("hello", "world", "java");

// mapMulti 新写法
List<Character> chars = words.stream()
    .<Character>mapMulti((word, consumer) -> {
        for (char c : word.toCharArray()) {
            consumer.accept(c);
        }
    })
    .toList();
```

***

## 第六章：Java 17 LTS——现代 Java 新基准

Java 17 是**第三个 LTS**，被 Spring Boot 3、Spring 6 作为基线版本，是当前新项目的首选。它最大的贡献是 **Sealed 密封类**——精准填补了 Java 继承控制的中间空白。

### 6.1 Sealed 密封类

**原有继承控制的两极**：

| 修饰        | 含义    | 局限   |
| --------- | ----- | ---- |
| 普通类       | 全开放继承 | 不可控  |
| `final` 类 | 禁止继承  | 不可拓展 |

**Sealed 弥补中间空白**：精准限定只有指定少数类可以继承。

```java
// 仅 Circle、Rectangle、Triangle 能继承 Shape
public sealed class Shape permits Circle, Rectangle, Triangle {
}
```

**子类必须三选一修饰**：

| 修饰           | 含义          |
| ------------ | ----------- |
| `final`      | 终止继承，不能再有子类 |
| `sealed`     | 继续密封，自行限定子类 |
| `non-sealed` | 放开继承，任意类可继承 |

```java
public final class Circle extends Shape {}
public non-sealed class Rectangle extends Shape {}
public sealed class Triangle extends Shape permits RightTriangle {}
```

**搭配 Switch 模式匹配的核弹级优势**：

因为 Sealed 类的所有子类在编译期已知，编译器能穷举所有实现，**switch 表达式不需要 default 分支**：

```java
public double calculateArea(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.getRadius() * c.getRadius();
        case Rectangle r -> r.getWidth() * r.getHeight();
        case Triangle t -> 0.5 * t.getBase() * t.getHeight();
        // 无需 default，全部类型已枚举
    };
}
```

新增子类时编译器直接报错，强制补充 case 分支，**彻底杜绝漏判 bug**。

:::important
**Sealed 的实战价值**：

1. 领域枚举式建模（订单状态、消息类型、图形）
2. 框架 API 设计，限制第三方随意继承篡改内部逻辑
3. 配合 Switch 模式匹配实现编译期穷举校验

接口也支持 sealed：

```java
public sealed interface Animal permits Dog, Cat {}
```

:::

### 6.2 全新 RandomGenerator

```java
// Java 8 传统 Random（CAS 自旋锁，多线程并发性能差）
Random oldRandom = new Random();

// Java 17 新 API，可指定算法
RandomGenerator generator = RandomGenerator.of("L32X64MixRandom");
int value = generator.nextInt(100);
```

**优势**：

- 多算法可选（L32X64MixRandom、Xoroshiro128Plus 等现代伪随机算法）
- 并发性能更强（拆分多套实现）
- 统一接口 `RandomGenerator` 方便切换算法

### 6.3 强封装 JDK 内部 API

Java 17 严格限制通过反射访问 JDK 内部非公开类：

- ❌ `sun.misc.Unsafe`
- ❌ `com.sun.*` 全路径
- ❌ `jdk.internal.*` 包

**影响**：

- ✅ 安全性提升：屏蔽绕过 JVM 安全规范的黑魔法操作
- ✅ 稳定性优化：避免第三方代码依赖内部不稳定 API
- ⚠️ 老旧依赖 Unsafe 的工具/框架需要升级版本

**临时兼容方案**（仅用于过渡）：

```bash
java --add-opens java.base/sun.nio.ch=ALL-UNNAMED -jar app.jar
```

***

## 第七章：Java 18-20——未来特性的孵化期

Java 18-20 都是**非 LTS 过渡版本**，核心作用是**孵化 Java 21 的重量级特性**。

### 7.1 Java 18 三大实用特性

**内置 jwebserver 命令行文件服务器**：

```bash
# 默认启动：当前目录、8080端口
jwebserver

# 指定端口 + 资源目录
jwebserver -p 8080 -d /path/to/your/files
```

仅用于本地开发、静态文件预览、测试，不适合生产环境替代 Nginx/Tomcat。

**UTF-8 设为 JVM 默认字符集**：

- Java 18 之前：`FileReader/FileWriter/PrintStream` 跟随操作系统编码（Windows GBK、Linux UTF-8），跨系统中文易乱码
- Java 18+：全局默认 UTF-8，跨平台行为统一

```bash
# 兼容旧系统编码
java -Dfile.encoding=COMPAT -jar app.jar
```

**JavaDoc @snippet 标签**：

Java 18 引入 `@snippet` 文档注解，文档内可直接嵌入代码块、自动代码高亮排版，并支持引用外部源码文件片段，避免文档代码与业务代码不同步。典型用法：

```java
/**
 * 打印传入列表的所有元素。
 *
 * 示例代码：
 * {@snippet :
 * List<String> list = List.of("a", "b", "c");
 * list.forEach(System.out::println);
 * }
 *
 * @param items 待打印的字符串列表
 */
public void printAll(List<String> items) {
    items.forEach(System.out::println);
}
```

相比旧版 `<pre>{@code}` 繁琐写法，JDK 生成的 HTML 文档可读性大幅提升。

### 7.2 Java 19-20：三大特性预览

:::note
**为什么 19/20 生产环境基本不升级？** 因为所有关键能力均为预览/孵化器状态，最终在 Java 21 正式转正。它们是"21 的预热场"。
:::

**虚拟线程（Virtual Thread）预览**：

- JDK 轻量级用户态线程，由 JVM 调度而非 OS 内核
- 创建开销极低、几乎无栈内存成本
- 19 首次预览，20 迭代优化，21 正式落地

**Record 模式匹配 + Switch 模式匹配增强**：

- `instanceof` 拓展 Record 解构匹配
- Switch 完备模式匹配预览，支持 Record、类型、常量多分支匹配

**结构化并发（Structured Concurrency）孵化器**：

- 一套 API 统一管理子任务生命周期
- 子线程异常、取消可向上传递
- 规避传统多线程零散创建导致的资源泄漏

***

## 第八章：Java 21 LTS——并发新纪元

Java 21 是**划时代的 LTS 版本**，被很多人称为"Java 历史上最重要的版本之一"。它的核心使命是：**让 Java 并发编程进入协程时代**。

### 8.1 虚拟线程：Java 原生协程

**传统平台线程的痛点**：

- 1:1 绑定操作系统内核线程
- 单线程占用 **MB 级**栈内存
- I/O 阻塞时全程占用 OS 线程资源
- 高并发下线程池数量受限（默认 200-300 已是极限）

**虚拟线程的颠覆**：

- JVM 用户态轻量级线程
- 由 JVM 调度、复用底层平台线程
- 遇到 I/O 阻塞自动让出载体线程
- **单线程仅几 KB 内存**，可轻松创建百万级

**两种创建方式**：

```java
// 方式 1：批量创建（推荐）
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1000; i++) {
        executor.submit(() -> {
            // 网络 IO、DB 查询阻塞任务
            String res = httpClient.get("https://api.example.com");
        });
    }
}

// 方式 2：手动创建单个
Thread.ofVirtual().start(() -> {
    User user = userService.findById(1L);
});
```

:::important
**虚拟线程的三大核心优势**：

1. **超轻量化**：KB 级内存，百万并发无内存溢出风险
2. **编程模型不变**：沿用同步阻塞写法，不用改异步 Reactor/RxJava
3. **阻塞自动调度**：I/O 阻塞时自动释放平台线程

> 面试考点：Java 21 虚拟线程 = Java 原生协程，对标 Go goroutine。
> :::

:::warning
**虚拟线程的避坑提醒**：

Java 21 早期版本中，虚拟线程 + `synchronized` 会出现 **pinning（钉死）** 问题，导致虚拟线程被绑定到平台线程上，无法释放。Java 24 已修复大部分场景，但生产环境升级时仍需关注。
:::

**联动思考**：在《JUC并发编程之旅》中，我整理过 JUC 的四层金字塔——地基（JMM + volatile + CAS）、框架层（AQS）、工具箱（并发集合 + 线程池 + 同步工具）、架构师视角。**虚拟线程的诞生，让"工具箱"层发生了根本性重构**：传统 ThreadPoolExecutor 的地位被弱化，`Executors.newVirtualThreadPerTaskExecutor` 成为新宠。

### 8.2 Switch 完备模式匹配

**基础类型匹配**：

```java
public String processMsg(Object msg) {
    return switch (msg) {
        case String text -> "文本：" + text;
        case Integer num -> "数字：" + num;
        case List<?> list -> "集合，元素数：" + list.size();
        case null -> "空消息";
        default -> "未知类型";
    };
}
```

**`when`** **分支条件过滤**：

```java
public String processText(String text) {
    return switch (text) {
        case String s when s.length() < 10 -> "短文本：" + s;
        case String s when s.length() < 100 -> "中等文本：" + s.substring(0, 10);
        case String s -> "长文本：" + s.substring(0, 10);
    };
}
```

### 8.3 Record 解构模式匹配

可在 Switch 中**嵌套解构 Record 内部字段**：

```java
// Employee(Person(name, age), Address(city, street), Double salary)
public String analyzeEmp(Employee emp) {
    return switch (emp) {
        case Employee(Person(var name, var age), Address(var city, var street), var salary)
            when salary > 50000 ->
            String.format("%s(%d) 高薪，住址 %s%s", name, age, city, street);
        case Employee(Person(var name, var age), var addr, var salary) ->
            String.format("%s(%d)，薪资 %f", name, age, salary);
    };
}
```

搭配 Sealed 密封类后，编译器可穷举全部分支，可省略 `default`。

### 8.4 SequencedCollection 顶层有序接口

Java 21 统一了 List/Set/Map 的头尾操作 API：

```java
List<String> tasks = new ArrayList<>();
tasks.addFirst("头部元素");
tasks.addLast("尾部元素");
String first = tasks.getFirst();
String last = tasks.getLast();
tasks.removeFirst();
tasks.removeLast();
List<String> reverse = tasks.reversed();  // 返回反向视图
```

- `SequencedSet`：`LinkedHashSet` 实现
- `SequencedMap`：`LinkedHashMap` 实现，提供 `firstEntry()` / `lastEntry()` / `putFirst()` / `putLast()`

### 8.5 分代 ZGC

**历史 ZGC 的痛点**：ZGC 自 JDK 11 面世，主打**微秒级 STW 停顿**，但**全程不分代**：

- 新生代短命对象、老年代长寿对象统一一套回收策略
- 高分配速率场景下频繁全堆扫描，GC 开销偏高

**JDK 21 分代 ZGC 的改动（预览状态）**：

- 把堆划分为**新生代（Young）+ 老年代（Old）**
- 新生代优先 Minor GC，回收大部分瞬时消亡对象
- 依然保留 ZGC 标志性的**微秒级 STW**
- 需通过 `-XX:+ZGenerational` 显式开启，**Java 23 通过 JEP 474 才正式转正并设为默认**

> **时间线说明**：分代 ZGC 在 Java 21 仍为预览特性，Java 23 才正式转正；本节在 21 章节介绍是因其作为预览特性的代表性，详细落地见第九章 9.2 节。

**核心优势**：

1. **提升吞吐量**：短命对象集中在新生代快速回收
2. **降低内存开销**：减少无效对象晋升到老年代
3. **保留低延迟**：STW 维持微秒级别

**启用参数**：

```bash
# 开启分代 ZGC
java -XX:+UseZGC -XX:+ZGenerational -jar app.jar
```

**联动思考**：在《Java底层——JVM》中，我详细梳理过 GC 体系——Serial、Parallel、CMS、G1、ZGC、Shenandoah。**分代 ZGC 的成熟，是 ZGC 真正进入生产可用的标志**——它补齐了 ZGC 在高分配速率场景下的短板，兼顾**低停顿 + 高吞吐**。

***

## 第九章：Java 22-24——JDK 25 的预热

这一段是 Java 25 LTS 之前的过渡期，每一个版本都承接着关键的特性落地。

### 9.1 Java 22：FFM API 正式转正 + 未命名占位

**FFM 外部函数&内存 API（正式转正）**：

替代老旧 JNI，**类型安全、无胶水 C/C++ 调用**：

```java
import java.lang.foreign.Arena;
import java.lang.foreign.FunctionDescriptor;
import java.lang.foreign.Linker;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.SymbolLookup;
import java.lang.foreign.ValueLayout;
import java.lang.invoke.MethodHandle;

// 1. 加载原生库（libc）并查找 C 函数 strlen
SymbolLookup libc = SymbolLookup.libraryLookup("libc", Arena.ofConfined());
MemorySegment strlenSymbol = libc.find("strlen").orElseThrow();

// 2. 用 FunctionDescriptor 声明原生函数签名（C 的 strlen 接收 char* 返回 size_t）
FunctionDescriptor strlenDesc = FunctionDescriptor.of(
        ValueLayout.JAVA_LONG,
        ValueLayout.ADDRESS
);
MethodHandle strlen = Linker.nativeLinker().downcallHandle(strlenSymbol, strlenDesc);

// 3. 像调用普通 Java 方法一样调用 C 函数
try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateUtf8String("Hello FFM!");
    long len = (long) strlen.invokeExact(cString);
    System.out.println("字符串长度：" + len);
}

// 4. 安全堆外内存操作（替代 Unsafe 的非法内存读写）
try (Arena arena = Arena.ofConfined()) {
    MemorySegment segment = arena.allocate(1024);            // 分配 1024 字节
    segment.set(ValueLayout.JAVA_INT, 0, 42);                // 写入 int
    int value = segment.get(ValueLayout.JAVA_INT, 0);        // 读取 int
    System.out.println("堆外内存值：" + value);
}
```

用途：对接系统原生库、音视频/硬件驱动、C 语言算法。

**未命名变量** **`_`（下划线占位）**：

```java
// catch 忽略异常对象
try { processData(); } catch (IOException _) {}

// switch 只判断类型、舍弃取值
case Double _ -> "浮点类型";

// Record 解构只取 x，丢弃 y
if (point instanceof Point(var x, var _)) {}
```

### 9.2 Java 23：分代 ZGC 设为默认

- JDK 21 分代 ZGC 预览，**JDK 23 正式默认启用分代 ZGC**
- 新生代 + 老年代分代回收，保留 ZGC 微秒级 STW
- 无需手动配置 `-XX:+ZGenerational`，`-XX:+UseZGC` 自动走分代

### 9.3 Java 24：ClassFile API + Stream Gatherers

**ClassFile 字节码操作 API**：

JDK 内置字节码读写工具，淘汰第三方 ASM/ByteBuddy 底层依赖：

```java
// 动态生成 Class 字节码
byte[] bytes = ClassFile.of().build(ClassDesc.of("com.demo.Test"), cb -> {
    cb.withMethod("<init>", MethodTypeDesc.ofVoid(), mb -> {
        mb.withCode(codeb -> {
            codeb.aload(0).invokespecial(ConstantDescs.CD_Object, "<init>");
        });
    });
});

// 解析现有 class 字节码
ClassModel cm = ClassFile.of().parse(classBytes);
```

用途：框架 AOP、动态代理、字节码插桩。

:::note
ClassFile API 意味着 Spring AOP、CGLIB 等字节码增强框架不再强依赖第三方库，**JDK 原生能力进一步下沉**。
:::

**Stream Gatherers（流增强收集器）**：

新增 `.gather()` 中间操作，补齐 Stream 复杂聚合短板：

```java
// 滑动窗口
List<Double> avg = prices.stream()
    .gather(Gatherers.windowSliding(3))
    .map(window -> window.stream().mapToDouble(Double::doubleValue).average().orElse(0))
    .toList();

// 固定分块、滚动累加、并行映射
Gatherers.windowFixed(int);
Gatherers.scan();
Gatherers.fold();
Gatherers.mapConcurrent();
```

**自定义 Gatherer**（三段式构造）：

```java
// 给所有字符串加前缀
Gatherer<String, ?, String> addPre = Gatherer.ofSequential(
    () -> null,                                                              // 初始化器
    (state, elem, down) -> { down.push("前缀-" + elem); return true; },     // 整合器
    (state, down) -> { /* 可选收尾 */ }                                     // 收尾处理器
);
```

**Gatherer 的核心优势**：

| 优势           | 说明                                                 |
| ------------ | -------------------------------------------------- |
| **支持内部状态保存** | 可实现滑动窗口、分段聚合                                       |
| **全链路兼容**    | `.gather()` 是中间操作，可与 `map`/`filter`/`flatMap` 无缝串联 |
| **内置开箱即用**   | 滑动窗口、固定分块、滚动累加等                                    |

***

## 第十章：Java 25 LTS——集大成的下一代

Java 25 是**继 21 之后的第二个 LTS**，被官方称为"集大成者"，聚焦于**开发效率、并发处理、应用性能**三大方向。

### 10.1 语言与开发体验革新

**JEP 513：灵活构造函数体（最终版）**：

允许在调用父类构造函数之前编写验证等前置逻辑，代码逻辑更连贯、更安全。

**JEP 512 & JEP 511：简化入门编程（最终版）**：

```java
// 不再需要 public static void main 样板
void main() {
    IO.println("Hello World!");
}

// 通过 import module 声明模块依赖
import module java.base;
```

### 10.2 并发编程模型革新

**JEP 505：结构化并发（第五次预览）**：

通过 `StructuredTaskScope`，将一组并发任务视为一个整体，避免线程泄露，集中处理任务失败和取消。

**JEP 506：作用域值（最终版）**：

相比 `ThreadLocal`，`ScopedValue` 能更清晰、更高效地在大量线程间共享不可变数据，**尤其在虚拟线程场景下性能优势更显著**。

### 10.3 性能与运行时优化

**JEP 538：向量 API（第十次孵化）**：

在 x86 和 ARM 架构上利用 SIMD 指令集，极大提升大型数据集数值运算性能，**非常适用于 AI 推理等计算密集型场景**。

**JEP 540：紧凑对象头（最终版）**：

将普通对象头从最多 **128 位**压缩至 **64 位**，降低内存占用，提升数据访问效率。

**String::hashCode 性能优化**：当字符串常量作为 `Map` 的 key 时，JIT 编译器能直接将 map lookup 优化为直接访问，**性能提升最高可达 8 倍**。

**JEP 464：Shenandoah 分代 GC（最终版）**：

降低停顿时间，提升内存利用率和系统稳定性，让这款低延迟 GC 更适合生产环境。

### 10.4 安全与库增强

| JEP | 特性              | 意义                          |
| --- | --------------- | --------------------------- |
| 510 | 密钥派生函数 API（最终版） | 标准 API 支持 HKDF、Argon2 等现代算法 |
| 470 | PEM 编码 API（预览）  | PEM 格式与标准二进制格式互转            |
| 540 | 紧凑对象头           | 对象头 128 位 → 64 位            |

> Java 25 是**当前新项目的优选基线**——它继承了 21 的虚拟线程红利，又在 22-24 的过渡期上完善了字节码、流处理、GC 等基础设施。

***

## 第十一章：Java 26 STS——优化先锋

Java 26 是 25 之后的**短期支持版本（STS）**，作为 25 的补丁与 27 LTS 的预演。

| 维度      | 关键更新                                                                                                 |
| ------- | ---------------------------------------------------------------------------------------------------- |
| **语言**  | 原始类型模式匹配（JEP 530，第四次预览）                                                                              |
| **核心库** | 结构化并发（JEP 525，第六次预览）、惰性常量（JEP 526，第二次预览）、PEM API 第二次预览                                               |
| **性能**  | **HTTP/3 客户端**（JEP 517 最终版，QUIC 协议）、**G1 GC 吞吐量优化**（JEP 522，官方测试 5-15% 提升）、**ZGC AOT 对象缓存**（JEP 516） |
| **安全**  | **final 字段警告**（JEP 500，强化安全性）、**移除 Applet API**（JEP 504 最终版）                                         |

:::note
STS 短期支持版本尝鲜可以，生产环境**等 27 LTS**。
:::

***

## 第十二章：LTS 选型指南与未来展望

### 12.1 五大 LTS 接力赛全景

| LTS        | 时间      | 核心标签          | 升级理由                                        |
| ---------- | ------- | ------------- | ------------------------------------------- |
| **JDK 8**  | 2014.03 | 函数式编程革命       | Lambda + Stream + Optional + 新日期 API        |
| **JDK 11** | 2018.09 | 标准化工具集        | HttpClient + String 新方法 + Files 简化          |
| **JDK 17** | 2021.09 | 密封类 + Records | Sealed + Records + 模式匹配 + Spring Boot 3 基线  |
| **JDK 21** | 2023.09 | 并发新纪元         | 虚拟线程 + 分代 ZGC + Switch 模式匹配                 |
| **JDK 25** | 2025.09 | 集大成者          | 灵活构造体 + ScopedValue + 紧凑对象头 + Shenandoah 分代 |

### 12.2 升级路线建议

```
JDK 8 → 11 → 17 → 21 → 25
        ↘    ↘    ↘
         跳板   跳板   跳板
```

| 场景               | 推荐版本            | 理由                            |
| ---------------- | --------------- | ----------------------------- |
| **新项目（2026 启动）** | JDK 21 或 JDK 25 | 21 生态成熟、25 特性最新               |
| **企业生产**         | JDK 17 或 JDK 21 | 17 稳定、21 享虚拟线程红利              |
| **保守升级**         | 跟随主流 LTS        | 8 → 17 → 25（跳级升级）             |
| **AI 项目**        | 强制 JDK 17+      | Spring AI、LangChain4j 都要求 17+ |

### 12.3 升级避坑指南

| 坑位                              | 说明                             |
| ------------------------------- | ------------------------------ |
| **虚拟线程 + synchronized pinning** | Java 21 早期版本存在，24 已修复大部分场景     |
| **模块系统改造**                      | 收益小成本大，不建议全面切换                 |
| **Records 不可变约束**               | 不要把有复杂业务的类强行改造成 Record         |
| **Sealed 子类穷举**                 | 新增子类时务必同步更新所有 switch           |
| **JDK 17 强封装 Unsafe**           | 老旧依赖需要升级或用 `--add-opens` 临时兼容  |
| **Java 18 前跨平台中文**              | 升级后建议移除 `-Dfile.encoding` 显式设置 |

### 12.4 未来展望

Java 的演进速度比过去十年都更快——半年一个小版本，LTS 之间间隔 2-3 年。但万变不离其宗：

- **易用性**：语法糖越来越丰富（Records、模式匹配、`_` 占位）
- **性能**：ZGC 分代化、Shenandoah 分代化、紧凑对象头、向量 API
- **并发**：虚拟线程 + 结构化并发 + ScopedValue 逐步替代传统线程池
- **安全**：强封装 JDK 内部 API、final 字段警告、移除 Applet

> **升级不是目的，理解特性背后的设计哲学才是。** Java 的每一次革命，都不是凭空诞生的——它是对开发者痛点的回应，是对企业生产需求的响应，是整个生态的协同进化。

***

*更多内容可查看* *[Java 官方 JEP 索引](https://openjdk.org/jeps/0)* *与* *[Oracle JDK 发布说明](https://www.oracle.com/java/technologies/downloads/)。*
