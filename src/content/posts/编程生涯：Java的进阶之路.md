---
title: 编程生涯：Java的进阶之路
published: 2023-04-17
description: 回顾2023年4月那段Java进阶的学习时光，从常用API到多线程，从IO流到反射，从数据库编程到XML解析，记录这段充满挑战与收获的旅程。
tags: [Java, 进阶]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
此刻是2026年，我坐在电脑前整理过去的博客。翻到2023年4月的那段日子，发现那是我Java学习生涯中变化最大的一个时期——从一个只会写Hello World的初学者，逐渐成长为一个能够独立完成数据库操作、多线程编程、XML解析的全栈初学者。那段时间，我经历了认知的一次次刷新，也踩了无数的坑。但正是这些坑，塑造了我对Java更深刻的理解。
:::

## 常用API：工具箱里的宝藏

学完JavaSE基础后，我以为自己对Java已经了解得差不多了。直到我开始真正接触「常用类」——我才意识到，Java提供一个多么庞大的工具箱。

### String：最熟悉的陌生人

`String`大概是Java里我们最先接触的类，但它的坑也最多。

```java
// 错误示例：创建了不必要的对象
String s1 = new String("hello");
String s2 = "hello";

// 正确做法：直接赋值
String s3 = "hello";
```

当时我百思不得其解：`new String()` 和直接赋值的 `"hello"` 有什么区别？

后来才明白——

| 创建方式 | 内存位置 | 创建对象数 |
|----------|----------|------------|
| `new String()` | 堆内存 | 2个（String对象 + 字符串常量池中的字符串） |
| `"hello"` 直接赋值 | 字符串常量池 | 1个（重用常量池中的对象） |

```java
// String的不可变性
String s = "hello";
s = "world";  // 这不是修改s，而是让s指向新的对象
```

:::note
String不可变的原因：字符串常量池的需要、线程安全、锁机制安全、缓存HashCode。这不是Java的缺陷，而是一种设计权衡。
:::

### StringBuilder vs StringBuffer：性能与安全的博弈

拼接字符串是我最常做的事情之一。

```java
// 低效的做法：每次拼接都创建新对象
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i;  // 每次都new String，效率极低
}

// 高效的做法：使用StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

| 类 | 线程安全 | 性能 | 适用场景 |
|----|----------|------|----------|
| StringBuffer | 线程安全（synchronized） | 较低 | 多线程环境 |
| StringBuilder | 非线程安全 | 高 | 单线程环境（大多数场景） |

当时我用的最多的就是StringBuilder，因为老师说过：「在没有多线程的情况下，用StringBuilder就够了。」

### 集合框架：从数组到容器

如果说数组是「固定大小的盒子」，那集合就是「可以伸缩的袋子」。

Java的集合框架可以分为两大体系：`Collection` 和 `Map`。

```
Collection
├── List（有序、可重复）
│   ├── ArrayList    // 底层是数组，查询快、增删慢
│   ├── LinkedList   // 底层是链表，增删快、查询慢
│   └── Vector       // 线程安全版ArrayList（已过时）
└── Set（无序、不可重复）
    ├── HashSet       // 哈希表实现，效率最高
    ├── LinkedHashSet // 保持插入顺序
    └── TreeSet       // 自然顺序/自定义排序

Map（键值对）
├── HashMap           // 最常用的Map实现
├── LinkedHashMap     // 保持插入顺序
├── TreeMap           // 按Key排序
└── Hashtable         // 线程安全版HashMap（已过时）
```

最让我震撼的是 `ArrayList` 和 `LinkedList` 的区别：

```java
// ArrayList：按 index 访问，O(1)，飞快
String item = list.get(0);

// LinkedList：按 index 访问，需要从头遍历，O(n)
String item = linkedList.get(0);

// 但在头部插入时：
// ArrayList 需要把后面所有元素后移，O(n)
list.add(0, newItem);  // 慢

// LinkedList 只需要修改指针，O(1)
linkedList.add(0, newItem);  // 快
```

| 操作 | ArrayList | LinkedList |
|------|------------|------------|
| 按 index 访问 | O(1) | O(n) |
| 头部插入/删除 | O(n) | O(1) |
| 尾部插入/删除 | O(1) 均摊 | O(1) |
| 内存占用 | 低（只存数据） | 高（存数据+前后指针） |

:::warning
选择哪个集合不是看「快不快」，而是看「在哪个场景下快」。大多数业务场景中，我们都是「查询多、增删少」，所以 ArrayList 是最常用的选择。
:::

### Map的遍历：四种姿势

Map的遍历让我困惑了好久，因为它的结构和Collection完全不同。

```java
Map<String, Integer> map = new HashMap<>();
map.put("Java", 100);
map.put("Python", 90);
map.put("C", 80);

// 姿势一：获取所有键，再遍历
for (String key : map.keySet()) {
    System.out.println(key + ": " + map.get(key));
}

// 姿势二：获取所有键值对
for (Map.Entry<String, Integer> entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// 姿势三：获取所有值（不推荐，无法获取键）
for (Integer value : map.values()) {
    System.out.println(value);
}

// 姿势四：JDK 8+ 的 Lambda 表达式（最简洁）
map.forEach((key, value) -> System.out.println(key + ": " + value));
```

那段时间，我用得最多的就是「姿势二」，因为既能拿到键，又能拿到值，清晰明了。

## 异常处理：程序的「安全气囊」

刚开始写代码时，我最怕看到的就是「红字」——异常。

```
Exception in thread "main" java.lang.NullPointerException
    at com.example.Main.main(Main.java:10)
```

空指针异常，大概是每个Java程序员的「入门礼」。

### 异常体系：一棵树的结构

Java的异常体系，其实是一棵继承树：

```
Throwable（异常体系的根）
├── Error（错误，程序无法处理）
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception（异常，程序可以处理）
    ├── RuntimeException（运行时异常，可以不处理）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   └── ClassCastException
    └── 非RuntimeException（编译时异常，必须处理）
        ├── IOException
        └── SQLException
```

| 类型 | 是否需要声明throws | 是否需要捕获 |
|------|-------------------|--------------|
| RuntimeException | 不需要 | 可以不捕获 |
| 非RuntimeException | 需要在方法签名声明 | 必须捕获或声明throws |

### try-catch-finally：三重保障

```java
try {
    // 可能出现异常的代码
    int result = 10 / 0;  // 这里会抛出 ArithmeticException
} catch (ArithmeticException e) {
    // 捕获特定异常
    System.out.println("除数不能为0！");
} catch (Exception e) {
    // 捕获其他异常（父类要放在后面）
    System.out.println("发生了其他异常：" + e.getMessage());
} finally {
    // 无论是否异常，都会执行的代码
    System.out.println("程序执行完毕");
}
```

:::note
finally块里的return会覆盖try或catch中的return。这是一个经典的「坑」，我当时被这个坑折磨了很久。
:::

### 自定义异常：从使用者到设计者

当系统提供的异常不够用时，我们可以自定义异常：

```java
// 定义一个自定义异常
public class AgeInvalidException extends RuntimeException {
    public AgeInvalidException() {
        super();
    }

    public AgeInvalidException(String message) {
        super(message);
    }
}

// 使用自定义异常
public class Person {
    private int age;

    public void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new AgeInvalidException("年龄必须在0-150之间");
        }
        this.age = age;
    }
}
```

这段代码让我理解了一个道理：**异常不仅仅是「报错了」，更是「告诉调用者为什么错了」的工具。**

## 多线程：同时做两件事的艺术

如果说前面的内容是「写代码」，那多线程就是「同时写两段代码」。

### 线程与进程：分工与协作

老师讲了一个形象的比喻：

> 进程就像一个工厂，线程就是工厂里的工人。
>
> 一个工厂可以有很多工人，它们共享工厂的资源（内存、文件句柄），但各自独立工作。
>
> 如果只有一个工人（单线程），那工厂一次只能做一件事。
> 如果有多个工人（多线程），工厂可以同时做多件事。

```java
// 方式一：继承Thread类
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程1正在执行");
    }
}

// 方式二：实现Runnable接口（更常用）
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("线程2正在执行");
    }
}

// 使用
Thread t1 = new MyThread();
Thread t2 = new Thread(new MyRunnable());
t1.start();  // 启动线程，调用的是start()而不是run()
t2.start();
```

| 对比 | Thread | Runnable |
|------|--------|----------|
| 单继承 | 是（Java不支持多继承） | 否（一个类可以实现多个接口） |
| 资源共享 | 各自独立 | 同一Runnable实例可被多线程共享 |
| 适用场景 | 简单线程 | 需要共享资源的场景 |

### 线程生命周期：五种状态

多线程的状态转换曾经让我晕头转向：

```
                    ┌─────────────────┐
                    │    NEW（新建）   │
                    └────────┬────────┘
                             │ start()
                             ▼
                    ┌─────────────────┐
          ┌─────────│ RUNNABLE（就绪） │
          │         └────────┬────────┘
          │                  │ 获得CPU执行权
          │                  ▼
          │         ┌─────────────────┐
          │         │  RUNNING（运行） │
          │         └────────┬────────┘
          │                  │ yield() / 时间片用完
          │                  ▼
          │         ┌─────────────────┐
          │         │  BLOCKED（阻塞） │
          │         └────────┬────────┘
          │                  │ 阻塞条件解除
          │                  ▼
          │         ┌─────────────────┐
          └─────────│  TERMINATED     │
                    │   （终止）       │
                    └─────────────────┘
```

### 线程同步：排队而不是抢队

多个线程同时访问同一个资源时，问题就来了——「抢票」问题。

```java
// 模拟抢票系统
class Ticket implements Runnable {
    private int tickets = 10;

    @Override
    public void run() {
        while (true) {
            if (tickets > 0) {
                try {
                    Thread.sleep(100);  // 模拟网络延迟
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println(Thread.currentThread().getName()
                    + " 卖出第 " + tickets-- + " 张票");
            } else {
                break;
            }
        }
    }
}
```

运行结果出现了「卖出第0张票」甚至「卖出第-1张票」的诡异情况——这就是线程安全问题。

解决方案是「同步」：

```java
// 方案一：synchronized 同步代码块
class Ticket1 implements Runnable {
    private int tickets = 10;
    private Object lock = new Object();

    @Override
    public void run() {
        while (true) {
            synchronized (lock) {  // 锁定对象
                if (tickets > 0) {
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println(Thread.currentThread().getName()
                        + " 卖出第 " + tickets-- + " 张票");
                } else {
                    break;
                }
            }  // 释放锁
        }
    }
}

// 方案二：synchronized 同步方法
class Ticket2 implements Runnable {
    private int tickets = 10;

    @Override
    public void run() {
        while (true) {
            if (!sellTicket()) break;
        }
    }

    private synchronized boolean sellTicket() {
        if (tickets > 0) {
            try {
                Thread.sleep(100);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println(Thread.currentThread().getName()
                + " 卖出第 " + tickets-- + " 张票");
            return true;
        }
        return false;
    }
}
```

| 同步方式 | 锁定对象 | 适用范围 |
|----------|----------|----------|
| synchronized 代码块 | 任意对象 | 粒度控制更灵活 |
| synchronized 方法 | this（当前对象） | 方法内所有代码 |
| static synchronized | 类.class | 所有对象共享 |

### 线程通信：wait与notify

如果说同步是「一个人干完再让另一个人干」，那线程通信就是「干完一部分，通知下一部分接着干」。

```java
// 生产者-消费者问题
class ShareResource {
    private int product = -1;

    public synchronized void produce(int value) {
        while (product != -1) {  // 有产品就等待
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        product = value;
        System.out.println("生产了: " + value);
        notify();  // 通知消费者
    }

    public synchronized int consume() {
        while (product == -1) {  // 没产品就等待
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
        int value = product;
        product = -1;
        System.out.println("消费了: " + value);
        notify();  // 通知生产者
        return value;
    }
}
```

#### wait()/notify() 的底层原理

当时我也很困惑：wait() 和 notify() 到底是怎么实现的？

**核心概念：Monitor（监视器锁）**

在JVM中，每个对象都关联着一个 Monitor（监视器锁）。你可以把 Monitor 想象成一把「钥匙」：

```
对象 obj 的内存结构
┌─────────────────────┐
│       对象头         │
│  ┌─────────────────┐│
│  │   Mark Word     ││  ← 存储对象的hashCode、GC信息、锁信息
│  ├─────────────────┤│
│  │   类型指针       ││  ← 指向方法区的类元数据
│  └─────────────────┘│
├─────────────────────┤
│       实例数据       │
└─────────────────────┘
          │
          │ 每个对象都关联一个
          ▼
┌─────────────────────┐
│      Monitor        │
│  ┌─────────────────┐│
│  │   _owner         ││  ← 当前持有锁的线程
│  ├─────────────────┤│
│  │   _WaitSet       ││  ← 等待队列（调用wait()的线程在这里）
│  ├─────────────────┤│
│  │   _entryList     ││  ← 阻塞队列（等待获取锁的线程在这里）
│  └─────────────────┘│
└─────────────────────┘
```

**wait() 的执行过程：**

1. 线程获取了对象的 Monitor（持有锁）
2. 调用 `obj.wait()`，线程会：
   - 将当前线程加入 `_WaitSet` 等待队列
   - **释放锁**（这是关键！）
   - 线程状态变为 `WAITING`

```java
synchronized (obj) {
    while (condition不满足) {
        obj.wait();  // 线程在这里等待，并释放锁
    }
    // 继续执行后续逻辑
}
```

**notify() 的执行过程：**

1. 线程获取了对象的 Monitor（持有锁）
2. 调用 `obj.notify()`，会：
   - 从 `_WaitSet` 中**随机挑选一个**线程唤醒
   - 被唤醒的线程还不能立刻执行，需要等待重新获取锁

**notifyAll() vs notify()：**

| 方法 | 唤醒数量 | 适用场景 |
|------|----------|----------|
| notify() | 1个（随机） | 只需要一个线程处理，条件单一 |
| notifyAll() | 全部唤醒 | 多个线程都可能处理，条件复杂 |

:::note
**为什么 wait() 必须在 synchronized 中使用？**
因为 wait() 依赖于锁来保护「条件」和「等待队列」。没有锁，就无法保证「检查条件」和「调用wait」之间的原子性，可能会导致死锁。
:::

:::warning
**经典错误：虚假唤醒（Spurious Wakeup）**
JDK文档明确指出，wait() 可能会「虚假唤醒」——即使没有调用 notify()，线程也可能醒来。所以 wait() 必须放在 while 循环中，而不是 if 判断中。
```java
// 错误写法
if (product != -1) {  // 虚假唤醒时，这里可能已经不应该等待了
    wait();
}

// 正确写法
while (product != -1) {  // 每次醒来都要重新检查条件
    wait();
}
```
:::

## IO流：数据的流动

IO，即 Input/Output，是程序与外部世界交流的桥梁。

### IO流家族：一图流

```
                    ┌──────────────┐
                    │   字节流      │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
    ┌──────────────┐              ┌──────────────┐
    │  InputStream │              │ OutputStream │
    └──────────────┘              └──────────────┘
            │                              │
    ┌───────┴───────┐              ┌───────┴───────┐
    ▼               ▼              ▼               ▼
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│FileInput│   │Buffered │    │FileOut │   │Buffered │
│ Stream │   │InputStream│   │  put   │   │OutputStream│
└────────┘    └────────┘    └────────┘    └────────┘

                    ┌──────────────┐
                    │   字符流      │
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
    ┌──────────────┐              ┌──────────────┐
    │   Reader     │              │    Writer    │
    └──────────────┘              └──────────────┘
```

### 字节流：万能流

字节流是最「通用」的流，可以处理任何类型的文件。

```java
// 字节流复制文件（原始但有效）
FileInputStream fis = null;
FileOutputStream fos = null;

try {
    fis = new FileInputStream("source.jpg");
    fos = new FileOutputStream("dest.jpg");

    byte[] buffer = new byte[1024];
    int length;
    while ((length = fis.read(buffer)) != -1) {
        fos.write(buffer, 0, length);
    }
    System.out.println("复制完成");
} catch (IOException e) {
    e.printStackTrace();
} finally {
    // 关闭流
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    if (fos != null) {
        try {
            fos.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 字符流：文本的专属

字符流是Java为文本文件「量身定做」的流，因为它能正确处理中文。

```java
// 使用 BufferedReader 读取文本文件（高效）
FileReader fr = new FileReader("novel.txt");
BufferedReader br = new BufferedReader(fr);

String line;
while ((line = br.readLine()) != null) {
    System.out.println(line);
}
br.close();

// 使用 BufferedWriter 写入文本文件
FileWriter fw = new FileWriter("output.txt");
BufferedWriter bw = new BufferedWriter(fw);

bw.write("这是第一行");
bw.newLine();  // 跨平台换行符
bw.write("这是第二行");
bw.close();
```

| 流类型 | 适用场景 | 缓冲效果 |
|--------|----------|----------|
| FileInputStream/FileOutputStream | 任意文件（图片、视频等） | 无缓冲 |
| BufferedInputStream/BufferedOutputStream | 任意文件（需要包装） | 有缓冲，效率高 |
| FileReader/FileWriter | 文本文件 | 无缓冲 |
| BufferedReader/BufferedWriter | 文本文件（需要包装） | 有缓冲，效率高 |

### 转换流：桥梁的作用

有时候，字节流和字符流之间需要「翻译」——这就是转换流的作用：

```java
// 字节流 → 字符流（解码）
FileInputStream fis = new FileInputStream("chinese.txt");
InputStreamReader isr = new InputStreamReader(fis, "UTF-8");  // 指定编码
BufferedReader br = new BufferedReader(isr);

// 字符流 → 字节流（编码）
FileOutputStream fos = new FileOutputStream("output.txt");
OutputStreamWriter osw = new OutputStreamWriter(fos, "UTF-8");
BufferedWriter bw = new BufferedWriter(osw);
```

:::warning
编码问题是一个大坑！写入和读取时必须使用相同的编码，否则就会出现乱码。Windows默认GBK，IDEA和大多数Linux系统默认UTF-8。
:::

## 反射：框架的灵魂

如果说前面的内容是「写业务代码」，那反射就是「写让别人用的代码」——比如框架。

### 反射是什么？

反射是一种「在运行时获取类信息」的机制。

正常情况下，我们在写代码时就知道要操作什么类：

```java
Person p = new Person();  // 编译时就知道是Person类
p.eat();
```

但框架不一样——框架在写的时候不知道你要用哪个类，它在运行时才知道。

```java
// 反射：在运行时动态加载类
Class<?> clazz = Class.forName("com.example.Person");  // 字符串可以是配置文件里读取的
Object obj = clazz.getDeclaredConstructor().newInstance();
Method method = clazz.getMethod("eat");
method.invoke(obj);
```

### Class对象：反射的核心

每个类在加载到JVM时，都会生成一个 `Class` 对象。这个对象包含了类的所有信息。

```java
// 三种获取Class对象的方式
// 方式一：通过类名
Class<?> c1 = Person.class;

// 方式二：通过对象
Person p = new Person();
Class<?> c2 = p.getClass();

// 方式三：通过全限定名（最常用，字符串可以来自配置文件）
Class<?> c3 = Class.forName("com.example.Person");
```

### 反射操作：能动也能改

反射不仅能「获取」，还能「调用」，甚至能「绕过」访问修饰符的限制。

```java
// 获取类的构造方法
Constructor<?>[] constructors = clazz.getConstructors();  // public构造方法
Constructor<?>[] declaredConstructors = clazz.getDeclaredConstructors();  // 所有构造方法

// 获取特定构造方法并创建对象
Constructor<?> constructor = clazz.getDeclaredConstructor(String.class, int.class);
Object obj = constructor.newInstance("张三", 20);

// 获取类的属性
Field[] fields = clazz.getDeclaredFields();  // 所有属性
Field nameField = clazz.getDeclaredField("name");
nameField.setAccessible(true);  // 跳过权限检查
String name = (String) nameField.get(obj);  // 获取属性值
nameField.set(obj, "李四");  // 修改属性值

// 获取类的方法
Method[] methods = clazz.getDeclaredMethods();  // 所有方法
Method eatMethod = clazz.getDeclaredMethod("eat");
eatMethod.invoke(obj);  // 调用方法
```

:::note
`setAccessible(true)` 是一个「危险」的操作，它允许访问private成员。这在框架中很常见，但普通业务代码应该尽量避免。
:::

### 反射的实际应用

当时老师让我们理解反射时，用了一个很经典的案例——模拟Spring的IOC容器：

```java
// 假设这是我们的BeanFactory
class BeanFactory {
    public static Object getBean(String className) {
        try {
            Class<?> clazz = Class.forName(className);
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException("创建Bean失败: " + className, e);
        }
    }
}

// 配置文件（beans.properties）
// userService=com.example.service.UserServiceImpl

// 使用
String className = "com.example.service.UserServiceImpl";
Object bean = BeanFactory.getBean(className);
```

这样一来，我们只需要修改配置文件，不需要修改代码，就能改变程序的行为。这就是「解耦」的力量。

## XML解析：数据的另一种表达

学完反射之后，老师紧接着讲了XML——因为很多框架的配置都是用XML写的。

### XML是什么？

XML（可扩展标记语言）是一种「用来存储和传输数据」的格式。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<students>
    <student id="1">
        <name>张三</name>
        <age>20</age>
        <gender>男</gender>
    </student>
    <student id="2">
        <name>李四</name>
        <age>19</age>
        <gender>女</gender>
    </student>
</students>
```

### XML解析方式对比

Java中解析XML有四种常见方式：

| 解析方式 | 特点 | 适用场景 |
|----------|------|----------|
| DOM | 把整个XML加载到内存，形成树形结构 | XML较小、需要随机访问 |
| SAX | 逐行扫描，边读边解析 | XML较大、只需顺序读取 |
| JDOM | Java专用，比DOM更简单 | 了解不多 |
| DOM4J | 功能强大，使用最广泛 | 复杂XML处理 |

### DOM4J解析实战

当时我用的最多的就是DOM4J，因为它简单又强大：

```java
// 导入DOM4J的包
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;

public class XMLParser {
    public static void main(String[] args) {
        // 1. 创建SAXReader
        SAXReader reader = new SAXReader();

        try {
            // 2. 读取XML文件
            Document document = reader.read(new File("students.xml"));

            // 3. 获取根元素
            Element root = document.getRootElement();
            System.out.println("根元素: " + root.getName());

            // 4. 获取所有student元素
            List<Element> students = root.elements("student");
            for (Element student : students) {
                // 5. 获取属性
                String id = student.attributeValue("id");
                // 6. 获取子元素
                String name = student.elementText("name");
                String age = student.elementText("age");
                String gender = student.elementText("gender");

                System.out.println("学生[id=" + id + "]: " +
                    name + ", " + age + "岁, " + gender);
            }
        } catch (DocumentException e) {
            e.printStackTrace();
        }
    }
}
```

输出：

```
根元素: students
学生[id=1]: 张三, 20岁, 男
学生[id=2]: 李四, 19岁, 女
```

### XPath：快速定位

当XML层级很深时，一层层往下找很麻烦。XPath就是用来「快速定位」元素的：

```java
import org.dom4j.XPath;

// 查找id为1的学生
String xpath = "//student[@id='1']";
Element student = (Element) document.selectSingleNode(xpath);

// 查找所有学生的名字
List<Element> names = document.selectNodes("//student/name");
for (Element name : names) {
    System.out.println(name.getText());
}
```

:::note
XPath使用`//`表示「从任意位置开始查找」，使用`@`表示「获取属性」。这些表达式比Java代码简洁多了。
:::

## 注解：给代码贴标签

如果说前面的内容是「写代码」，那注解就是「给代码写注释」——只不过这个注释是给程序读的。

### 注解是什么？

注解（Annotation）是JDK 5引入的一种语法元数据。它可以在不改变程序逻辑的情况下，在代码中嵌入补充信息。

```java
// 这就是一个注解
@Override
public void toString() {
    return "Hello";
}
```

`@Override` 告诉编译器：「这个方法是重写的，如果父类没有这个方法，请报错。」

### 内置注解：Java内置的标签

| 注解 | 作用 | 作用域 |
|------|------|--------|
| `@Override` | 标记方法是重写的 | 方法 |
| `@Deprecated` | 标记方法是过时的 | 方法、类 |
| `@SuppressWarnings` | 抑制编译器警告 | 类、方法、变量 |
| `@FunctionalInterface` | 标记是函数式接口 | 接口 |

```java
// @Override：方法重写检查
@Override
public void onClick(View v) {  // 如果父类没有这个方法，编译报错
    // ...
}

// @Deprecated：提示使用者这个方法已过时
@Deprecated
public void oldMethod() {
    // 不推荐使用，但还能用
}

// @SuppressWarnings：抑制警告
@SuppressWarnings("unchecked")
List<String> list = (List<String>) oldCode();
```

### 自定义注解：自己造标签

光用别人的注解不过瘾，有时候我们需要自己定义注解：

```java
// 定义一个注解
@Retention(RetentionPolicy.RUNTIME)  // 注解保留到运行时
@Target(ElementType.METHOD)          // 只能用在方法上
public @interface MyAnnotation {
    String value();                  // 注解的属性（类似配置）
    int priority() default 1;        // 带默认值的属性
}

// 使用自定义注解
public class UserService {

    @MyAnnotation(value = "保存用户", priority = 1)
    public void saveUser(User user) {
        // 保存逻辑
    }

    @MyAnnotation(value = "删除用户", priority = 2)
    public void deleteUser(int id) {
        // 删除逻辑
    }
}
```

**注解的属性：**

| 属性类型 | 定义方式 | 使用方式 |
|----------|----------|----------|
| String | `String value();` | `@MyAnnotation("hello")` |
| int（带默认值） | `int priority() default 1;` | `@MyAnnotation(value="x", priority=2)` |
| 枚举 | `enum Type {A, B}` | `@MyAnnotation(type=Type.A)` |

### 元注解：注解的注解

元注解是用来「注解注解」的注解：

| 元注解 | 作用 |
|--------|------|
| `@Retention` | 注解的生命周期（SOURCE、CLASS、RUNTIME） |
| `@Target` | 注解可以应用的目标（方法、类、字段等） |
| `@Documented` | 注解是否出现在Javadoc中 |
| `@Inherited` | 注解是否可以被继承 |

```java
@Retention(RetentionPolicy.RUNTIME)  // 必须设为RUNTIME，反射才能读取
@Target(ElementType.METHOD)
public @interface Log {
    String operation() default "";  // 操作描述
}
```

### 注解与反射：读取注解的值

注解的真正威力在于「反射读取」：

```java
public class AnnotationProcessor {

    public static void main(String[] args) throws Exception {
        // 获取UserService类的所有方法
        Method[] methods = UserService.class.getDeclaredMethods();

        for (Method method : methods) {
            // 检查方法是否有@MyAnnotation注解
            if (method.isAnnotationPresent(MyAnnotation.class)) {
                // 获取注解
                MyAnnotation annotation = method.getAnnotation(MyAnnotation.class);
                String value = annotation.value();
                int priority = annotation.priority();

                System.out.println("发现操作: " + value +
                    "，优先级: " + priority + "，方法: " + method.getName());
            }
        }
    }
}
```

输出：

```
发现操作: 保存用户，优先级: 1，方法: saveUser
发现操作: 删除用户，优先级: 2，方法: deleteUser
```

:::note
注解本身不执行任何逻辑，它只是「标记」。真正的逻辑由读取注解的代码（通常是框架）来实现。Spring、Hibernate、MyBatis……这些框架都大量使用了注解。
:::

## 序列化：对象的旅行

如果说字节流是「复制文件」，那序列化就是「复制对象」——把内存中的对象变成字节流，方便存储或传输。

### 序列化的意义

当一个程序需要「保存对象状态」或者「在网络上传输对象」时，序列化就成了关键技术：

```
内存中的对象          序列化           字节数据
┌─────────┐      ┌─────────┐      ┌─────────┐
│ User    │ ──── │serialize│ ──── │10110010 │
│ 对象    │      │        │      │  文件   │
└─────────┘      └─────────┘      └─────────┘

字节数据          反序列化         内存中的对象
┌─────────┐      ┌─────────┐      ┌─────────┐
│10110010 │ ──── │deserialize│ ─── │ User    │
│  文件   │      │        │      │ 对象    │
└─────────┘      └─────────┘      └─────────┘
```

### Serializable：让对象能序列化

Java中，让一个对象可序列化非常简单——实现 `Serializable` 接口：

```java
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private String password;
    private int age;

    // 构造方法、getter、setter略
}
```

### ObjectOutputStream：序列化到文件

```java
// 序列化：把对象写到文件
User user = new User("张三", "123456", 20);

FileOutputStream fos = new FileOutputStream("user.dat");
ObjectOutputStream oos = new ObjectOutputStream(fos);

oos.writeObject(user);  // 把对象序列化并写入文件

oos.close();
System.out.println("序列化完成");
```

### ObjectInputStream：反序列化

```java
// 反序列化：从文件读取对象
FileInputStream fis = new FileInputStream("user.dat");
ObjectInputStream ois = new ObjectInputStream(fis);

User user = (User) ois.readObject();  // 读取并反序列化

ois.close();
System.out.println("用户名: " + user.getUsername() +
    "，年龄: " + user.getAge());

ois.close();
```

### transient：不想序列化的字段

有时候，某些字段不需要序列化——比如密码：

```java
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private transient String password;  // 不会被序列化
    private int age;

    // 反序列化后，password = null
}
```

| 字段类型 | transient效果 |
|----------|---------------|
| 普通字段 | 字段值不序列化，反序列化后为默认值（0/null） |
| static字段 | 不受transient影响，仍然不会被序列化（属于类不属于对象） |

### 序列化版本UID：版本控制

```java
public class User implements Serializable {
    // 显式声明版本号
    private static final long serialVersionUID = 1L;

    private String username;
    private int age;
}
```

`serialVersionUID` 的作用是「版本控制」——如果类的结构变了（比如添加了新字段），旧序列化的数据可能无法正确反序列化。

| 情况 | serialVersionUID | 结果 |
|------|------------------|------|
| 类没变 | 相同 | 正常反序列化 |
| 添加了新字段 | 相同 | 字段为默认值，其他字段正常 |
| 类结构大幅改变 | 不同 | 抛出InvalidClassException |

:::warning
反序列化不会调用构造方法！对象是通过Class字节码信息「凭空」创建出来的。这是很多人容易踩的坑。
:::

## 网络编程：让程序对话

如果说IO是「程序和文件」对话，那网络编程就是「程序和程序」对话。

### IP地址与端口：找到对方的门牌号

老师讲了一个形象的比喻：

> IP地址就像是城市地址，端口就像是房间号。
>
> 知道了城市地址（IP），只能找到对方在哪栋楼；
> 知道了房间号（端口），才能真正找到对方这个人。

```
访问百度
┌──────────┐       IP地址        ┌──────────┐
│  我的电脑 │ ────────────────  │  百度的   │
└──────────┘   14.215.177.38    │  服务器   │
                                  └──────────┘
                                        │
端口区分服务                                Port 443 (HTTPS)
┌──────────┐       端口号        ┌──────────┐
│  我的电脑 │ ────────────────  │   nginx  │
└──────────┘      :443         │   服务器 │
                                  └──────────┘
```

| 常见端口 | 服务 |
|----------|------|
| 80 | HTTP |
| 443 | HTTPS |
| 3306 | MySQL |
| 6379 | Redis |
| 8080 | Tomcat（默认） |

### TCP与UDP：两种通信方式

| 特性 | TCP | UDP |
|------|-----|-----|
| 连接方式 | 面向连接（三次握手） | 无连接 |
| 可靠性 | 可靠，不丢包 | 不可靠，可能丢包 |
| 速度 | 较慢 | 较快 |
| 适用场景 | 文件传输、网页、邮件 | 视频通话、DNS查询、直播 |

### Socket：套接字编程

Java网络编程的核心是 `Socket`——「插座」的意思。

#### TCP通信：打电话模型

TCP是「打电话」——先建立连接，然后双向通信，最后断开连接。

**服务器端：**

```java
// 服务器端：开电话等待
ServerSocket serverSocket = new ServerSocket(8888);
System.out.println("服务器启动，监听端口: 8888");

while (true) {
    // 等待客户端连接（阻塞）
    Socket clientSocket = serverSocket.accept();
    System.out.println("有客户端连接: " + clientSocket.getInetAddress());

    // 处理客户端请求
    new Thread(() -> {
        try {
            // 获取输入流（读取客户端发来的数据）
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(clientSocket.getInputStream()));

            // 获取输出流（向客户端发送数据）
            PrintWriter writer = new PrintWriter(
                clientSocket.getOutputStream(), true);

            String message;
            while ((message = reader.readLine()) != null) {
                System.out.println("收到: " + message);
                writer.println("服务器收到: " + message);  // 回复客户端
            }

            clientSocket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }).start();
}
```

**客户端：**

```java
// 客户端：打电话
Socket socket = new Socket("localhost", 8888);
System.out.println("已连接到服务器");

// 获取输出流（发送数据给服务器）
PrintWriter writer = new PrintWriter(
    socket.getOutputStream(), true);

// 获取输入流（读取服务器回复）
BufferedReader reader = new BufferedReader(
    new InputStreamReader(socket.getInputStream()));

// 发送数据
writer.println("Hello, Server!");
System.out.println("收到服务器回复: " + reader.readLine());

socket.close();
```

**通信流程图：**

```
客户端                              服务器
   │                                  │
   │─────── TCP三次握手建立连接 ───────>
   │                                  │
   │────────── 发送数据 ------------->│
   │<────────── 收到回复 -------------│
   │                                  │
   │────────── 发送数据 ------------->│
   │<────────── 收到回复 -------------│
   │                                  │
   │─────── TCP四次挥手断开连接 ───────>
   │
```

#### UDP通信：发快递模型

UDP是「发快递」——不需要建立连接，直接发送数据包，也不保证对方一定能收到。

**发送方：**

```java
// UDP发送方
DatagramSocket socket = new DatagramSocket();

String message = "这是一条UDP消息";
byte[] data = message.getBytes();

// 目标地址和端口
InetAddress address = InetAddress.getByName("localhost");
int port = 8888;

// 创建数据包
DatagramPacket packet = new DatagramPacket(
    data, data.length, address, port);

// 发送
socket.send(packet);
System.out.println("UDP消息已发送");

socket.close();
```

**接收方：**

```java
// UDP接收方
DatagramSocket socket = new DatagramSocket(8888);
byte[] buffer = new byte[1024];

// 创建接收数据包
DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

System.out.println("UDP服务器启动，等待数据...");

// 阻塞等待数据
socket.receive(packet);
System.out.println("收到数据: " + new String(packet.getData(), 0, packet.getLength()));
System.out.println("来源: " + packet.getAddress() + ":" + packet.getPort());

socket.close();
```

| 对比 | TCP Socket | UDP DatagramSocket |
|------|-----------|-------------------|
| 编程模型 | ServerSocket + Socket | DatagramSocket + DatagramPacket |
| 连接 | 需要建立连接 | 无连接 |
| 单位 | 字节流（Stream） | 数据包（Packet） |
| 可靠性 | 可靠 | 不可靠 |
| 速度 | 较慢 | 快 |

:::note
UDP虽然「不可靠」，但在一些场景下反而是优势——视频通话、在线游戏，追求的是实时性，偶尔丢一帧画面比卡顿好多了。
:::

## 数据库编程：数据是资产

如果说前面的内容是「让程序跑起来」，那数据库编程就是「让程序记住数据」。

### JDBC：Java连接数据库的桥梁

JDBC（Java Database Connectivity）是Java操作数据库的标准API。

```java
// JDBC操作数据库的六步曲
// 1. 加载驱动
Class.forName("com.mysql.cj.jdbc.Driver");

// 2. 获取连接
String url = "jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC";
String username = "root";
String password = "123456";
Connection conn = DriverManager.getConnection(url, username, password);

// 3. 获取语句执行者
Statement stmt = conn.createStatement();

// 4. 执行SQL
String sql = "SELECT * FROM student WHERE age > 18";
ResultSet rs = stmt.executeQuery(sql);

// 5. 处理结果
while (rs.next()) {
    int id = rs.getInt("id");
    String name = rs.getString("name");
    int age = rs.getInt("age");
    System.out.println("id: " + id + ", name: " + name + ", age: " + age);
}

// 6. 关闭资源（后开先关）
rs.close();
stmt.close();
conn.close();
```

### PreparedStatement：防止SQL注入

刚开始学JDBC时，我写的是Statement。后来才知道PreparedStatement有多重要：

```java
// 危险的做法：直接拼接SQL（可能被SQL注入攻击）
String sql1 = "SELECT * FROM user WHERE name='" + name + "'";
stmt.executeQuery(sql1);

// 安全的做法：使用PreparedStatement
String sql2 = "SELECT * FROM user WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(sql2);
pstmt.setString(1, name);  // 参数索引从1开始
ResultSet rs = pstmt.executeQuery();
```

| 对比 | Statement | PreparedStatement |
|------|-----------|-------------------|
| SQL拼接 | 字符串拼接 | 参数占位符 `?` |
| SQL注入 | 可能被攻击 | 防止注入 |
| 预编译 | 不预编译 | 预编译，效率高 |
| 适用场景 | 简单SQL（不推荐） | 复杂SQL、有参数的SQL |

:::warning
永远不要用字符串拼接来构建SQL语句！这是SQL注入的根源。一定要使用PreparedStatement。
:::

### 事务控制：要么全成功，要么全失败

当我第一次需要「同时操作多张表」时，事务就成了必修课：

```java
Connection conn = null;
PreparedStatement pstmt1 = null;
PreparedStatement pstmt2 = null;

try {
    conn = DriverManager.getConnection(url, username, password);
    conn.setAutoCommit(false);  // 开启事务

    // 操作1：插入订单
    String sql1 = "INSERT INTO orders (id, amount) VALUES (?, ?)";
    pstmt1 = conn.prepareStatement(sql1);
    pstmt1.setInt(1, 1001);
    pstmt1.setDouble(2, 999.9);
    pstmt1.executeUpdate();

    // 操作2：扣减库存
    String sql2 = "UPDATE stock SET quantity = quantity - 1 WHERE product_id = ?";
    pstmt2 = conn.prepareStatement(sql2);
    pstmt2.setInt(1, 2001);
    pstmt2.executeUpdate();

    conn.commit();  // 提交事务
    System.out.println("操作成功！");
} catch (Exception e) {
    if (conn != null) {
        conn.rollback();  // 回滚事务
        System.out.println("操作失败，已回滚！");
    }
    e.printStackTrace();
} finally {
    // 关闭资源
    if (pstmt2 != null) pstmt2.close();
    if (pstmt1 != null) pstmt1.close();
    if (conn != null) conn.close();
}
```

| 事务特性 | 说明 | 保证 |
|----------|------|------|
| 原子性（Atomicity） | 事务是最小执行单位，不可分割 | 要么全成功，要么全失败 |
| 一致性（Consistency） | 事务执行前后，数据保持一致 | 由原子性保证 |
| 隔离性（Isolation） | 并发执行的事务互不干扰 | 通过锁机制保证 |
| 持久性（Durability） | 事务提交后，数据永久保存 | 由数据库保证 |

## 站在今天，回望那段时光

2023年4月的那段Java进阶学习，是我编程生涯中「从会写到会造」的转变期。

回想起来，每一个知识点都是一座山：

- **常用API**让我知道Java工具箱有多丰富
- **异常处理**让我学会与「错误」共处
- **多线程**让我理解「同时」的意义
- **IO流**让我看清数据的流向
- **反射**让我理解框架的秘密
- **XML解析**让我进入配置的世界
- **数据库编程**让我懂得数据的价值
- **注解**让我理解元编程的威力
- **序列化**让我明白对象如何「旅行」
- **网络编程**让我看清数据在网络中穿梭的轨迹

Spring、Hibernate、MyBatis……这些框架的背后，都是这些基础知识的组合。

:::note
最开始学Java的时候我觉得，大伙不就都是API调用工程师吗？直到现在我也还是那么觉得。因为，底层的那些抽象逻辑，前人已经封装得很好了。

甚至有时候都想，那我们学习还要那么大费周章去拨开底层、一丝一缕地学习是为什么？

我想呢，就是为个「明白」。

就比如没学计网之前，我不会知道随手发的一条信息是漂游了多少距离才到对方手机。现在我知道了。相比不知道的人多了什么呢？就是多个「明白」。

我更加能够理解这个世界，更加能够解析这个世界。那么就够了。

即使大费周章，便也值得。
:::

---

*2023年4月的Java进阶之路结束了，但那扇通往更高处的大门，才刚刚打开。*
