---
title: 编程生涯：JUC并发编程之旅
published: 2026-05-11
description: 2026年5月系统学习JUC并发编程的记录，从Java内存模型到AQS框架，从CAS原子操作到线程池，构建起完整的并发编程知识体系，深入理解Java并发工具的底层原理。
tags: [JUC, 并发编程]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
学习天机学堂项目，老师讲解到并发问题处理时，提到JUC，带着好奇，我开始系统地啃JUC。这一啃不要紧，直接打开了一扇通往计算机底层世界的大门——原来Java的并发机制，是一座如此精密的四层金字塔。
:::

## 为什么需要JUC？

JUC是Java提供的并发编程工具箱，全称是「Java Util Concurrent」。它解决的问题很简单：**如何让多个线程安全地协作？**

一个经典的并发安全问题——1000个线程各执行1000次increment，最终结果往往不是1000000。数据就这样悄无声息地丢失了。JUC就是为了解决这类问题而生的。

如何解决这个问题？用JUC的AtomicInteger：

```java
public class Counter {
    // 用AtomicInteger替代int
    private AtomicInteger count = new AtomicInteger(0);

    public void increment() {
        // incrementAndGet是原子操作，不会丢失
        count.incrementAndGet();
    }

    public int getCount() {
        return count.get();
    }
}
```

同样场景，1000个线程各执行1000次，结果一定是1000000。JUC就是用CAS等底层机制，让「丢失更新」成为历史。

### JUC的四层知识金字塔

根据我的学习总结，JUC可以分为四层结构：

```
┌─────────────────────────────────────────────────────────────┐
│                    第四层：架构师视角                         │
│            融会贯通 · 技术选型 · 工程思维                      │
├─────────────────────────────────────────────────────────────┤
│                    第三层：工具箱                              │
│         并发集合 · 执行器框架（线程池）· 同步工具              │
├─────────────────────────────────────────────────────────────┤
│                    第二层：框架层                              │
│                 AQS（抽象队列同步器）                          │
├─────────────────────────────────────────────────────────────┤
│                    第一层：地基                                │
│           Java内存模型 · volatile · CAS原子操作                │
└─────────────────────────────────────────────────────────────┘
```

越底层越重要，越上层越实用。这座金字塔的每一层，都依赖下一层作为支撑。

:::note
学习JUC就像盖楼：从打地基开始，一层层往上建。只有理解了底层原理，才能真正用好上层工具。
:::

## 第一层：地基——规则与原子操作

这一层是所有并发代码正确运行的根本保障。如果把并发程序比作一座大厦，那这一层就是地基——地基不稳，上面的建筑再华丽也会出问题。

### Java内存模型（JMM）

#### 什么是JMM？

JMM（Java Memory Model）是Java虚拟机规范中定义的一套规则，用来规范线程如何与主内存、工作内存交互。

现代计算机为了提升性能，CPU和内存之间引入了缓存：

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│     CPU      │     │   CPU缓存     │     │    主内存     │
│  (核心1)      │◄───►│  (L1/L2/L3)  │◄───►│    (RAM)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

线程执行时，会把数据从主内存拷贝到CPU缓存中进行操作，操作完再写回主内存。这带来了三个核心问题：

| 问题      | 描述                | 举例                      |
| ------- | ----------------- | ----------------------- |
| **可见性** | 一个线程修改了变量，其他线程看不到 | 线程A修改了flag=true，线程B却看不到 |
| **原子性** | 一个操作不是不可分割的       | i++看似一个操作，实际是三步         |
| **有序性** | 指令可能被重排序          | 代码写的顺序和执行顺序不一致          |

#### happens-before原则

JMM通过「happens-before」原则来解决可见性和有序性问题。你可以把它理解为**「先行发生」**——A happens-before B，意味着两件事：A的执行结果对B可见，且A一定在B之前执行完毕。

打个比方：银行转账场景，A账户减100，B账户加100。如果B happens-before A，那就会出现「B先看到余额不足」的问题。happens-before规则就是用来保证这种因果关系。

常见的happens-before规则：

| 规则 | 含义 | 实战场景 |
| --- | --- | --- |
| 程序顺序规则 | 同一线程中，前面的代码happens-before后面的代码 | 单线程内代码顺序不变 |
| volatile规则 | volatile变量的写happens-before读 | volatile变量的线程间通信 |
| 监视器锁规则 | 解锁happens-before加锁 | synchronized保证可见性 |
| 线程启动规则 | Thread.start() happens-before被启动线程的代码 | 主线程启动子线程 |
| 线程终止规则 | 线程中的代码 happens-before 其他线程检测到终止 | join()等待线程结束 |

:::important
happens-before不是保证「谁先执行」，而是保证「谁的结果对谁可见」。执行顺序可能变，但结果一定正确。
:::

### volatile关键字

volatile是JMM提供的**最轻量级**的同步机制。它的作用有两个：保证可见性和禁止指令重排序。

#### 1. 保证可见性

```java
public class VolatileDemo {
    // flag用volatile修饰
    private volatile boolean flag = false;

    // 线程A执行
    public void setFlagTrue() {
        flag = true;  // 修改后立即刷新到主内存
    }

    // 线程B执行
    public void watchFlag() {
        while (!flag) {  // 每次循环都从主内存读取最新值
            // 等待
        }
        System.out.println("检测到flag变化，退出循环");
    }
}
```

volatile变量的修改会立即刷新到主内存，其他线程读取时直接从主内存获取最新值。

#### 2. 禁止指令重排序

编译器为了优化性能，可能会调整代码的执行顺序。volatile通过**内存屏障**来阻止这种重排序：

```java
public class指令重排Demo {
    private volatile int a = 0;
    private volatile int b = 0;

    // 不加volatile：可能重排为 b=1; a=2;
    // 加volatile后：禁止重排，一定是 a=2; b=1;
    public void setValues() {
        a = 2;
        b = 1;
    }
}
```

:::caution
volatile不能保证原子性！`count++`这种复合操作，即使count是volatile的，在多线程下仍会有线程安全问题。因为它是「读取→加1→写入」三步操作。
:::

#### volatile vs synchronized

| 对比   | volatile | synchronized |
| ---- | -------- | ------------ |
| 作用范围 | 变量       | 代码块/方法       |
| 原子性  | 不保证      | 保证           |
| 性能   | 高（轻量级）   | 低（重量级）       |
| 可见性  | 保证       | 保证           |
| 有序性  | 保证（单线程内） | 保证           |

### CAS原子操作

如果说volatile是轻量级的「读」同步，那CAS就是轻量级的「写」同步。

#### 什么是CAS？

CAS（Compare-And-Swap，比较并交换）是CPU提供的硬件级别的原子指令。它的核心思想是：先比较当前值是否与预期值一致，如果一致则交换，否则重试。

以更新余额为例：假设账户当前余额是100元，我要加50元。CAS会先检查余额是否还是100，如果是则更新为150；如果余额已经被其他线程改成200了，那就重新读取再尝试。这个过程会不断循环，直到成功为止。

整个过程是硬件级别的原子操作，不需要锁就能实现并发安全。

#### CAS的三大问题

| 问题          | 描述                   | 解决方案                          |
| ----------- | -------------------- | ----------------------------- |
| **ABA问题**   | 值从A变成B再变回A，CAS会认为没变过 | 使用版本号（AtomicStampedReference） |
| **自旋开销**    | 高竞争时重试次数多，消耗CPU      | 设置最大重试次数/退避策略                 |
| **只能保证单变量** | 复杂逻辑无法原子化            | 配合锁或其他机制                      |

#### CAS vs synchronized

| 对比   | CAS（乐观锁）      | synchronized（悲观锁） |
| ---- | ------------- | ----------------- |
| 核心假设 | 假设没有冲突，先操作后检查 | 假设总有冲突，先加锁后操作     |
| 线程状态 | 自旋重试，不挂起      | 阻塞挂起，等待唤醒         |
| 适用场景 | 低竞争，读多写少      | 高竞争，写多读少          |
| 优点   | 无锁开销          | 简单，不会有死锁          |
| 缺点   | 自旋消耗CPU       | 线程阻塞/唤醒开销大        |

:::warning
CAS不是万能的。在高竞争场景下，自旋会导致CPU空转，性能反而不如synchronized。选择哪种方式，要根据实际的竞争程度来决定。
:::

## 第二层：框架层——AQS

如果说第一层是「砖头」，那第二层就是「预制板」——把常用的并发模式封装起来，让你可以像搭积木一样构建各种同步器。

### 什么是AQS？

AQS（AbstractQueuedSynchronizer，抽象队列同步器）是JUC的核心框架，JUC中几乎所有的锁和同步器都是基于它实现的。

AQS的核心思想是：**把锁的共性逻辑抽出来封装好，开发者只需要实现几个简单的钩子方法**。

打个比方：AQS就像一套乐高基础积木——凸起、凹槽、连接件。它不告诉你能拼出什么，但把最底层的东西都准备好了。你只需要按照规则，把积木拼起来，就能造出汽车、城堡、飞船。

### AQS的核心结构

AQS的核心由三部分组成：

| 组成部分        | 说明                                        |
| ----------- | ----------------------------------------- |
| **state变量** | 用volatile修饰的int类型，表示同步状态（如锁的持有次数、信号量的许可数） |
| **等待队列**    | 双向链表（CLH队列），管理等待获取同步状态的线程                 |
| **底层依赖**    | CAS原子修改state，用LockSupport阻塞/唤醒线程          |

### AQS能构建什么？

基于AQS，JUC提供了两大类同步工具：

#### 1. 锁类

| 锁类型                    | 说明                    | 典型场景          |
| ---------------------- | --------------------- | ------------- |
| ReentrantLock          | 可重入锁，比synchronized更灵活 | 需要tryLock、公平锁 |
| ReentrantReadWriteLock | 读写锁，读读不互斥             | 读多写少场景        |
| StampedLock            | 乐观读锁，性能更好             | 高并发读          |

#### 2. 同步器类

| 同步器            | 说明        | 典型场景         |
| -------------- | --------- | ------------ |
| CountDownLatch | 倒计时门闩     | 主线程等待多个子任务完成 |
| Semaphore      | 信号量，限制并发数 | 限流、连接池       |
| CyclicBarrier  | 循环栅栏      | 多线程汇合点       |

```java
// CountDownLatch示例：等待多个任务完成
public class TaskRunner {
    public static void main(String[] args) throws InterruptedException {
        int taskCount = 3;
        CountDownLatch latch = new CountDownLatch(taskCount);

        for (int i = 0; i < taskCount; i++) {
            final int taskId = i;
            new Thread(() -> {
                System.out.println("任务" + taskId + "开始执行");
                try {
                    Thread.sleep((long) (Math.random() * 1000));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                System.out.println("任务" + taskId + "执行完成");
                latch.countDown();
            }).start();
        }

        latch.await();
        System.out.println("所有任务完成，主线程继续执行");
    }
}
```

:::note
CountDownLatch是一次性的，计数归零后不能重置；CyclicBarrier是可循环使用的，所有线程都到达后会自动重置。
:::

## 第三层：工具箱——开箱即用的实用工具

有了AQS作为地基，JUC提供了大量开箱即用的并发工具。这一层是开发者日常使用最多的。

### 并发集合

#### 为什么需要并发集合？

Java原生的集合（ArrayList、HashMap等）都是**非线程安全**的。用`synchronizedList`包装后性能会下降很多。

JUC提供了专门的并发集合，它们内部采用**细粒度锁**或**无锁算法**，在保证线程安全的同时大幅提升性能。

| 集合                    | 底层结构               | 适用场景    | 特点            |
| --------------------- | ------------------ | ------- | ------------- |
| ConcurrentHashMap     | CAS + synchronized | 高并发Map  | 分段锁，JDK8后用红黑树 |
| CopyOnWriteArrayList  | 数组 + ReentrantLock | 读多写少    | 写时复制，读不加锁     |
| ConcurrentLinkedQueue | 链表 + CAS           | 高并发队列   | 无界，非阻塞        |
| BlockingQueue         | 链表/数组 + Lock       | 生产者-消费者 | 支持阻塞操作        |

#### BlockingQueue：生产者-消费者模式

BlockingQueue是实现生产者-消费者模式的利器。它提供阻塞式的入队和出队操作：当队列满时，入队操作会阻塞；当队列空时，出队操作会阻塞。

这使得生产者和消费者可以优雅地协作，无需额外的同步逻辑。

### 执行器框架（线程池）

#### 为什么需要线程池？

每次创建和销毁线程都有开销。在高并发场景下，如果为每个请求都创建新线程，系统会被拖垮。

线程池的解决方案是：**预先创建线程，复用线程执行任务**。

```
传统方式：                          线程池方式：
每次任务都要创建/销毁线程              线程复用，无额外开销
```

#### ThreadPoolExecutor的核心参数

| 参数                       | 说明        | 建议值                          |
| ------------------------ | --------- | ---------------------------- |
| corePoolSize             | 核心线程数（常驻） | CPU密集型：CPU核数；IO密集型：CPU核数 × 2 |
| maximumPoolSize          | 最大线程数     | corePoolSize × 2             |
| keepAliveTime            | 空闲线程存活时间  | 通常60秒                        |
| workQueue                | 任务队列      | 建议用有界队列，防止OOM                |
| RejectedExecutionHandler | 拒绝策略      | CallerRunsPolicy（调用者执行）      |

#### Executors工具类的陷阱

JDK提供了几种常用的线程池创建方式：

```java
// 固定线程数线程池
ExecutorService fixedPool = Executors.newFixedThreadPool(10);

// 缓存线程池
ExecutorService cachedPool = Executors.newCachedThreadPool();

// 单线程池
ExecutorService singlePool = Executors.newSingleThreadExecutor();
```

:::caution
Executors.newFixedThreadPool和newSingleThreadExecutor使用的是**无界队列**（LinkedBlockingQueue），如果任务提交速度大于处理速度，会导致队列无限增长，最终OOM。生产环境建议手动创建ThreadPoolExecutor，显式设置队列大小。
:::

#### 线程池的拒绝策略

| 策略                  | 说明                           | 适用场景           |
| ------------------- | ---------------------------- | -------------- |
| AbortPolicy         | 抛出RejectedExecutionException | 默认，需要明确知道任务被拒绝 |
| CallerRunsPolicy    | 由调用者线程执行                     | 需要限流又不希望丢任务    |
| DiscardPolicy       | 直接丢弃任务                       | 允许丢任务          |
| DiscardOldestPolicy | 丢弃队列中最老的任务                   | 优先处理新任务        |

## 第四层：架构师视角——融会贯通

学完前三层，最后要站在架构师的高度，把知识串联起来。

### JUC知识金字塔回顾

```
┌─────────────────────────────────────────────────────────────┐
│                         金字塔                             │
├─────────────────────────────────────────────────────────────┤
│  第四层（架构师）  │  技术选型 · 性能调优 · 架构设计         │
├─────────────────────────────────────────────────────────────┤
│  第三层（工具箱）  │  并发集合 · 线程池 · 同步工具            │
├─────────────────────────────────────────────────────────────┤
│  第二层（框架）    │  AQS · ReentrantLock · CountDownLatch  │
├─────────────────────────────────────────────────────────────┤
│  第一层（地基）    │  JMM · volatile · CAS                   │
└─────────────────────────────────────────────────────────────┘
```

每一层都依赖下一层：第四层依赖第三层，第三层依赖第二层，第二层依赖第一层，第一层依赖CPU硬件和JVM规范。

## 总结

JUC的设计哲学是**分层抽象**：从最底层的硬件内存规则（JMM、CAS），到通用的同步框架（AQS），再到开箱即用的工具（并发集合、线程池），每一层都解决特定的问题，同时为上层提供简洁的接口。

作为Java开发者，我们不仅要会用这些工具，更要理解它们的底层原理：

- 理解JMM，才能知道并发问题的根源
- 理解CAS，才能掌握无锁编程的精髓
- 理解AQS，才能看透所有JUC工具的共性
- 理解线程池，才能在高性能场景下做出正确配置

:::tip
学习JUC的路径建议：**先用起来解决实际问题 → 踩坑反思 → 回头理解底层原理 → 用得更稳**。不要一开始死磕理论，但也不能永远停留在API调用层面。
:::

***

*2026年5月的JUC学习结束了。从JMM到AQS，从CAS到线程池，我终于看清了Java并发大厦的全貌。更重要的是，我明白了地基的重要性——越底层的东西，越值得花时间去理解。*
