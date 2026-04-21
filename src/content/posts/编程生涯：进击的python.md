---

title: 编程生涯：进击的python
published: 2023-05-29
description: 2023年5月29日，Python进阶之旅开启。从装饰器到生成器，从网络爬虫到自动化脚本，记录这段让「生产力」飞速提升的学习历程。
tags: [Python, 进阶]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
Python进阶课程，像是给我打开了一扇新世界的大门——原来Python不只是写脚本的语言，更是一种能让你「用更少的代码，做更多的事」的生产力工具。
:::

## 进阶，从不满足于基础开始

2023年3月30日，我第一次接触Python，被它的简洁深深震撼。

`print("Hello World")` 一行代码、没有分号、没有大括号、缩进即规则——那种「原来代码可以这样写」的冲击，至今记忆犹新。

但彼时学的，只是Python的皮毛。

当我学习Python进阶课程的那一刻，我就意识到：**真正的Python，远不止于此。**

如果说基础语法是「会用筷子」，那进阶内容就是「学会用刀叉」——不是替代，而是解锁更多场景。

## 装饰器：给函数穿上一层「外套」

学到装饰器时，我愣是看了三遍才理解。

### 什么是装饰器？

老师打了个形象的比喻：

> 装饰器就像咖啡店的「加料站」。
>
> 你拿着一杯基础咖啡（被装饰的函数）走过来。
> 装饰器问你：「要加奶泡吗？要加糖吗？」
> 你说：「都要。」
> 于是你拿到了一杯「加料咖啡」（装饰后的函数）。
>
> 但重点是——咖啡还是那杯咖啡，只是外面裹了一层新东西。

听起来很美好，但代码长什么样？

```python
# 定义一个装饰器
def my_decorator(func):
    def wrapper():
        print("装饰器生效前")
        func()
        print("装饰器生效后")
    return wrapper

# 使用装饰器
@my_decorator
def say_hello():
    print("Hello!")

say_hello()
```

输出：

```
装饰器生效前
Hello!
装饰器生效后
```

等等，这和直接写有什么区别？

```python
# 普通写法也能实现类似效果
def say_hello():
    print("装饰器生效前")
    print("Hello!")
    print("装饰器生效后")
```

表面看确实没区别。但装饰器的威力，在于「复用」——一个装饰器，可以同时装饰多个函数：

```python
@my_decorator
def say_goodbye():
    print("Goodbye!")

@my_decorator
def say_welcome():
    print("Welcome!")

@my_decorator
def say_thanks():
    print("Thanks!")
```

三个函数，都被自动加上了「装饰」。如果用普通写法，每个函数里都得复制粘贴那三行。

### 带参数的装饰器

但大多数函数是有参数的，装饰器怎么适配？

```python
def logging_decorator(func):
    def wrapper(*args, **kwargs):  # 接收任意参数
        print(f"调用函数: {func.__name__}")
        result = func(*args, **kwargs)  # 传递参数给原函数
        print(f"函数 {func.__name__} 执行完毕")
        return result
    return wrapper

@logging_decorator
def add(a, b):
    return a + b

@logging_decorator
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(add(1, 2))
print(greet("张三", greeting="Hi"))
```

输出：

```
调用函数: add
函数 add 执行完毕
3
调用函数: greet
函数 greet 执行完毕
Hi, 张四!
```

| 装饰器组成             | 作用            |
| ----------------- | ------------- |
| `func`            | 被装饰的原始函数      |
| `wrapper`         | 替代原函数的新函数（闭包） |
| `*args, **kwargs` | 传递任意参数        |
| `return result`   | 返回原函数的执行结果    |

:::note
装饰器是 Python「装饰器模式」的语法糖。它让我们在不修改原函数的前提下，给函数添加新功能。AOP（面向切面编程）的思想，就是从这里来的。
:::

### 装饰器叠加：多层buff

装饰器可以叠加使用，像叠buff一样：

```python
def debug(func):
    def wrapper(*args, **kwargs):
        print(f"DEBUG: 调用 {func.__name__}")
        result = func(*args, **kwargs)
        print(f"DEBUG: {func.__name__} 返回 {result}")
        return result
    return wrapper

def uppercase(func):
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        return result.upper()
    return wrapper

@debug
@uppercase
def say(text):
    return text

say("hello")
```

执行顺序是从下往上：`uppercase` 先装饰 `say`，然后 `debug` 再装饰结果。

## 生成器：懒人的福音

如果说装饰器是「外套」，那生成器就是「按需供给」。

### 为什么需要生成器？

学Java时，我见过这样的代码：

```java
// 返回一个超大的列表
public List<Integer> getNumbers() {
    List<Integer> numbers = new ArrayList<>();
    for (int i = 0; i < 1000000; i++) {
        numbers.add(i);  // 一百万个元素，全部加载到内存
    }
    return numbers;
}
```

问题来了：一百万个整数，每个占4字节，光这个列表就要占用约4MB内存。如果是一千万个呢？

但实际上，我可能只需要「用到前10个」。

Python的生成器，完美解决这个问题：

```python
# 普通函数，返回完整列表
def get_numbers_list():
    return [i for i in range(1000000)]

# 生成器函数，按需生成
def get_numbers_gen():
    for i in range(1000000):
        yield i  # yield 就是「产出」的意思
```

区别在哪里？

```python
# 普通列表：立刻生成全部，占用大量内存
numbers = get_numbers_list()
print(numbers[0])  # 0

# 生成器：只有调用时才生成，占用极少内存
numbers = get_numbers_gen()
print(next(numbers))  # 0
print(next(numbers))  # 1
```

| 对比   | 列表       | 生成器          |
| ---- | -------- | ------------ |
| 内存占用 | O(n)     | O(1)         |
| 创建时机 | 立即创建     | 惰性求值（调用时才生成） |
| 遍历次数 | 一次       | 一次（消耗完就没了）   |
| 适用场景 | 小数据、全量数据 | 大数据、按需使用     |

### 生成器表达式：简写版

如果逻辑简单，还可以用生成器表达式（语法类似列表推导式）：

```python
# 列表推导式
squares = [x * x for x in range(1000000)]  # 立刻生成一百万个

# 生成器表达式
squares_gen = (x * x for x in range(1000000))  # 一个生成器对象

print(next(squares_gen))  # 0
print(next(squares_gen))  # 1
```

区别就在括号：`[]` 是列表，`()` 是生成器。

:::warning
生成器只能用一次。遍历完就没了，想要再用只能重新创建。

```python
gen = (x for x in range(3))
print(list(gen))  # [0, 1, 2]
print(list(gen))  # []  — 空了！
```

:::

## 上下文管理器：自动化的好帮手

「用完资源要关闭」是编程的基本素养。但在Python里，我们可以用更优雅的方式。

### with语句的魔法

Java里关闭资源是这样写的：

```java
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("file.txt"));
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) {
        try {
            reader.close();  // 手动关闭，容易遗漏
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

Python里？

```python
with open("file.txt", "r") as f:
    line = f.readline()
    print(line)
# 自动关闭，无需手动处理
```

核心就是 `with ... as ...` 语法。它背后的原理，就是上下文管理器。

### 自定义上下文管理器

用 `@contextmanager` 装饰器，可以把任意生成器变成上下文管理器：

```python
from contextlib import contextmanager

@contextmanager
def my_open(filename, mode):
    f = open(filename, mode)
    try:
        yield f  # yield之前的代码相当于__enter__
    finally:
        f.close()  # finally里的代码相当于__exit__

# 使用
with my_open("test.txt", "w") as f:
    f.write("Hello, Context Manager!")
# 自动关闭
```

| 组成         | 作用                      |
| ---------- | ----------------------- |
| `yield` 之前 | 资源获取（相当于 `__enter__`）   |
| `yield`    | 资源使用（返回给 `with` 语句中的变量） |
| `finally`  | 资源释放（相当于 `__exit__`）    |

:::note
上下文管理器的本质是「自动资源清理」。它保证无论代码是否发生异常，资源都会被正确释放。这就是 Python「优雅哲学」的体现。
:::

### 实际应用：计时器

一个经典的用法——计时器：

```python
import time
from contextlib import contextmanager

@contextmanager
def timer():
    start = time.time()
    yield
    end = time.time()
    print(f"耗时: {end - start:.2f} 秒")

with timer():
    # 模拟耗时操作
    sum(i * i for i in range(1000000))
```

输出：

```
耗时: 0.12 秒
```

## 网络爬虫：数据的采集器

进阶课程里，最让我兴奋的内容——网络爬虫。

### 爬虫的基本原理

老师用了一个形象的比喻：

> 爬虫就像蜜蜂采蜜。
>
> - **蜜蜂**（爬虫程序）飞到花丛（网站）
> - **吸管**（HTTP请求）吸取花蜜（数据）
> - **带回蜂巢**（存储到本地）

Python的爬虫，核心用 `requests` 库：

```python
import requests

# 发送GET请求
response = requests.get("https://www.example.com")

# 查看响应状态
print(response.status_code)  # 200 表示成功

# 查看响应内容
print(response.text)  # 网页源码（HTML）

# 查看响应头
print(response.headers["Content-Type"])  # text/html; charset=utf-8
```

### 解析HTML：BeautifulSoup

拿到HTML源码后，需要解析提取数据。Python用 BeautifulSoup：

```python
from bs4 import BeautifulSoup

html = """
<html>
    <body>
        <div class="article">
            <h1>Python进阶</h1>
            <p class="summary">这是一篇关于Python进阶的文章</p>
            <ul>
                <li>装饰器</li>
                <li>生成器</li>
                <li>上下文管理器</li>
            </ul>
        </div>
    </body>
</html>
"""

soup = BeautifulSoup(html, "html.parser")

# 提取标题
title = soup.find("h1").text
print(f"标题: {title}")

# 提取摘要
summary = soup.find("p", class_="summary").text
print(f"摘要: {summary}")

# 提取所有列表项
items = soup.find_all("li")
for item in items:
    print(f"  - {item.text}")
```

输出：

```
标题: Python进阶
摘要: 这是一篇关于Python进阶的文章
  - 装饰器
  - 生成器
  - 上下文管理器
```

### 爬虫伦理：君子爱财，取之有道

老师特意强调：

> 爬虫是把双刃剑。用得好，是数据采集的利器；用得坏，是侵犯隐私的帮凶。

| 原则            | 说明           |
| ------------- | ------------ |
| 遵守 robots.txt | 网站声明的爬虫规则    |
| 控制请求频率        | 别像DDOS一样疯狂请求 |
| 不爬敏感信息        | 个人隐私、商业机密    |
| 注明数据来源        | 尊重原创，标明出处    |

:::warning
爬虫有风险，使用需谨慎。国内法律对爬虫行为有明确规定，非法爬取数据可能构成犯罪。
:::

## 自动化脚本：让电脑替你打工

进阶课程的另一大重点——自动化。

### 文件批量处理

最常见的场景：批量重命名文件。

Java怎么写？我能想到的是遍历 + `File` 操作，代码量大到怀疑人生。

Python？

```python
import os

# 假设当前目录有一堆 .txt 文件，需要加上 "processed_" 前缀
for filename in os.listdir("."):
    if filename.endswith(".txt"):
        new_name = f"processed_{filename}"
        os.rename(filename, new_name)
        print(f"{filename} -> {new_name}")
```

五行情代码，搞定。

### 批量发送邮件

更实用的场景——自动发邮件：

```python
import smtplib
from email.mime.text import MIMEText
from email.header import Header

def send_email(to_addr, subject, content):
    # 邮件服务器配置
    smtp_server = "smtp.example.com"
    smtp_port = 587
    sender = "your_email@example.com"
    password = "your_password"

    # 构建邮件
    message = MIMEText(content, "plain", "utf-8")
    message["From"] = Header(sender)
    message["To"] = Header(to_addr)
    message["Subject"] = Header(subject)

    # 发送
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()  # 开启TLS加密
        server.login(sender, password)
        server.send_message(message)

# 批量发送
for name, email in [("张三", "zhangsan@example.com"),
                    ("李四", "lisi@example.com")]:
    send_email(email, "Python自动化邮件", f"你好，{name}！这是一封自动发送的邮件。")
    print(f"已发送给: {name}")
```

### Excel数据处理

批量处理Excel数据？

```python
import openpyxl

# 读取Excel
wb = openpyxl.load_workbook("sales.xlsx")
sheet = wb.active

# 读取数据并计算总额
total = 0
for row in sheet.iter_rows(min_row=2, values_only=True):  # 跳过表头
    name, price, quantity = row
    total += price * quantity

print(f"销售总额: {total} 元")

# 写入新数据
sheet["D1"] = "总额"
sheet["D2"] = total
wb.save("sales_with_total.xlsx")
```

Java要用 Apache POI，配置复杂，API繁琐。Python？三行读取 + 三行写入。

## 对比表格：Java vs Python 进阶特性

| 特性      | Java实现              | Python实现         | Python优势       |
| ------- | ------------------- | ---------------- | -------------- |
| 函数增强    | 装饰器（需要手写复杂）         | `@decorator` 语法糖 | 更简洁            |
| 惰性求值    | Stream API（Java 8+） | 生成器 `yield`      | 语法更直观          |
| 资源管理    | try-finally         | `with` 语句        | 自动释放，无需finally |
| HTTP请求  | HttpClient/OkHttp   | `requests`       | 一行代码搞定         |
| HTML解析  | Jsoup               | BeautifulSoup    | 更Pythonic      |
| Excel处理 | Apache POI          | `openpyxl`       | API更简洁         |

## 站在今天，回望那个夏天

Python进阶课程，让我对Python的认知从「玩具语言」升级为「生产力工具」。

| 时间          | 认知                                      |
| ----------- | --------------------------------------- |
| 2023年3月（初识） | Python好简洁！但好像只能写点小脚本                    |
| 2023年5月（进阶） | Python好强大！装饰器、生成器、爬虫、自动化……              |
| 2026年（今天）   | Python是瑞士军刀，写脚本、爬数据、做分析、自动化、人工智能，都是一把好手 |

如果说Java教会我「严谨」，那Python教会我「效率」。

Java的严谨是优点，但在某些场景下，它让简单的事情变得复杂。

Python的简洁也是优点，它让复杂的事情变得简单。

两种哲学，各有适用场景。理解它们的差异，比学会语法本身更重要。

:::note
学完Python进阶后，我开始真正理解「人生苦短，我用Python」这句话。它不是在贬低其他语言，而是在说——有些场景下，Python就是最优解。选对了工具，事半功倍。
:::

***

*Python进阶之旅，开启了我对「生产力工具」的认知。*
