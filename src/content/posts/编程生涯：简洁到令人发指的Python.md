---
title: 编程生涯：简洁到令人发指的Python
published: 2023-03-30
description: 2023年3月30日，当我翻开Python课本的那一刻，才真正理解了「人生苦短，我用Python」的含义。
tags: [Python, 编程语言]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
此刻是 2026 年，我坐在电脑前敲下这些文字。回想起 2023 年 3 月 30 日，那个让我第一次感受到「原来代码可以这样写」的下午。
:::

## 一个平凡的下午

2023 年 3 月 30 日，一个再普通不过的下午。

彼时 Java 学习已经进入第三周，那些 `public static void main(String[] args)`、那些分号、大括号、类型声明……我已经逐渐习惯了 Java 的「繁琐」。

虽然偶尔还是会想念 C 语言和 JavaScript 的轻便，但想着「这是高级语言的必经之路」，也就忍了。

直到那天——

我打开了 Python 的课本。

## 第一个 Hello World

```python
print("Hello World")
```

就这？

没有 `public class`，没有 `public static void main`，没有分号，没有大括号。

一行代码，完事了。

我盯着屏幕愣了几秒，然后又往后翻了几页，确认这不是某个「快速入门」的特殊写法。

是真的。Python 就是这样写的。

## Java 写一个数组排序

当时 Java 刚学到集合框架，我记得书本上有一个数组排序的例子，大约是这样的：

```java
import java.util.Arrays;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        Integer[] arr = {3, 1, 4, 1, 5, 9, 2, 6};

        // 按降序排列，需要用 Collections.reverseOrder()
        Arrays.sort(arr, Collections.reverseOrder());

        System.out.println(Arrays.toString(arr));
    }
}
```

七八行代码，还要 import 两个包，还要记住 `Collections.reverseOrder()` 这个方法。

那 Python 怎么写？

```python
arr = [3, 1, 4, 1, 5, 9, 2, 6]
arr.sort(reverse=True)
print(arr)
```

三行。

不是七八行减到五六行，而是直接三行。没有 import，没有 `Integer` 类型声明，没有 `Arrays.toString()`。

**同样的功能，两种语言，两种体验。**

## 字符串格式化：没有对比就没有伤害

Java 的字符串拼接，我写过无数次：

```java
String name = "张三";
int age = 18;

// 方式一：拼接
System.out.println("我叫" + name + "，今年" + age + "岁");

// 方式二：format
System.out.println(String.format("我叫%s，今年%d岁", name, age));

// 方式三：MessageFormat
MessageFormat.format("我叫{0}，今年{1}岁", name, age);
```

三种方式，各有各的繁琐。记不住 ` %s` 和 `%d` 的区别，分不清 `{0}` 和 `{1}` 的位置。

Python 呢？

```python
name = "张三"
age = 18

# f-string - 直观到爆炸
print(f"我叫{name}，今年{age}岁")
```

在字符串前面加个 `f`，然后直接在 `{}` 里写变量名。

**所见即所得。**

当时我的感觉是：之前 Java 那些弯弯绕绕是在干嘛？

:::note
f-string 是 Python 3.6+ 引入的特性，在此之前 Python 也有 `%` 格式化（类似 C 的 printf）和 `.format()` 方法。但即便是 `.format()`，也比 Java 的 `String.format()` 简洁得多。
:::

## 列表推导式：一行代码的魔法

学到 Python 的列表推导式时，我彻底被震住了。

Java 创建一个「所有偶数的平方」列表：

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> result = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                result.add(i * i);
            }
        }
        System.out.println(result);
    }
}
```

六行代码。

Python：

```python
result = [x * x for x in range(1, 11) if x % 2 == 0]
print(result)
```

一行。

`[表达式 for 变量 in 可迭代对象 if 条件]`——读起来就像在读一句完整的英语句子。

当时我盯着这行代码看了很久，忍不住在心里感叹：**原来代码可以这样写。**

## 对比表格：Java vs Python

| 操作 | Java | Python | 差距 |
|------|------|--------|------|
| Hello World | 6行 | 1行 | 6倍 |
| 数组排序降序 | 7行 | 3行 | 2.3倍 |
| 字符串格式化 | 多种繁琐方式 | f-string一行 | 碾压 |
| 过滤+转换 | for循环+if+ArrayList | 一行列表推导式 | 降维打击 |

## 缩进即规则

Python 有个让我又爱又怕的特性：**缩进即代码块**。

```python
def greet(name):
    if name == "admin":
        print("欢迎管理员")
    else:
        print(f"你好，{name}")

greet("admin")
```

没有大括号，没有分号，缩进决定了一切。

刚开始我有点不习惯，甚至有点怕——万一缩进乱了怎么办？

但后来我发现，这种设计强迫你写出格式美观的代码。因为**代码即缩进**，缩进乱了代码就运行不了。

某种程度上，Python 把「代码格式化」变成了语言的一部分，而不是依赖 IDE 或者 eslint 之类的外部工具。

:::warning
缩进风格必须统一。Python 使用 4 个空格作为标准缩进，混用 Tab 和空格会导致难以发现的 bug。
:::

## 字典：键值对的艺术

Java 的 HashMap：

```java
import java.util.HashMap;

HashMap<String, Integer> scores = new HashMap<>();
scores.put("语文", 90);
scores.put("数学", 95);
scores.put("英语", 88);

System.out.println(scores.get("数学"));
```

Python 的字典：

```python
scores = {"语文": 90, "数学": 95, "英语": 88}
print(scores["数学"])
```

一样是键值对，Python 就是更直观。

而且 Python 字典还有各种简洁的操作：

```python
# 获取默认值
score = scores.get("物理", 0)  # 不存在返回0

# 遍历
for subject, score in scores.items():
    print(f"{subject}: {score}")
```

Java 里要写好几行的操作，Python 就是这么自然。

## 「人生苦短，我用Python」

那段时间，这句话开始被我挂在嘴边。

虽然当时还没有真正用它做过什么大项目，但 Python 给我带来的冲击是前所未有的。

它让我意识到：**编程语言的设计理念可以如此不同。**

| 语言 | 设计哲学 |
|------|----------|
| Java | 一切皆对象，类型安全，编译时检查 |
| C | 贴近硬件，信任程序员，极致性能 |
| JavaScript | 灵活多变，快速原型，互联网语言 |
| Python | 简洁即力量，代码可读性优先 |

Java 教会我「严谨」——类型要声明，边界要校验，代码要规范。

Python 教会我「简洁」——能用一行解决的问题，绝不写三行；代码是写给人看的，顺便让机器执行。

这两种哲学没有对错，只有适用场景的不同。

但对于一个刚学编程不到一年的新手来说，Python 让我第一次感受到了「编程的乐趣」。

## 那个下午的意义

2023 年 3 月 30 日的那个下午，我只学了 Python 的基础语法，没有做任何实战项目。

但那一个小时，比我想象中重要得多。

它打破了我对「编程语言必须是这样」的任何偏见。

原来 `public static void main` 不是理所当然，原来分号和大括号不是非写不可，原来「类型声明」也可以交给解释器自行推断。

**每一种语言都有自己的设计哲学，理解这些哲学，比学会语法本身更重要。**

:::note
后来我才知道，Python 之父 Guido van Rossum 设计 Python 时，最核心的追求就是「简洁」和「可读性」。他曾说：Code is read much more often than it is written.（代码阅读的次数远超编写的次数。）
:::

## 后记

2026 年的今天，Python 成了我最常用的语言之一。

用它写脚本、爬数据、做数据分析、甚至快速验证算法思路。它就像一把瑞士军刀——不是最锋利的，但在很多场景下都是最趁手的。

而每次敲下 `print()` 这一行代码的时候，我都会想起 2023 年 3 月 30 日那个下午。

那个让我惊叹「原来代码可以这样写」的瞬间。

---

*更多内容可查看博客归档。*
