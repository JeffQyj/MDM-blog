---
title: 编程生涯：Python数据分析三剑客
published: 2026-01-08
description: 2026年1月8日，跟着黑马课程系统学习了NumPy、Pandas、Matplotlib数据分析三剑客。从数组运算到表格处理，从数据清洗到可视化绑定，记录这段从「会写Python」到「会用Python做数据分析」的成长历程。
tags: [Python, 数据分析]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
此刻是2026年4月底，我坐在电脑前整理笔记。回想起1月8日那天，跟着黑马课程打开数据分析大门的时刻——原来Python不只是脚本语言，更是数据处理的瑞士军刀。
:::

## 从「会写」到「会用」

彼时Python基础已经学完有一段时间了——装饰器、生成器、上下文管理器这些进阶特性也都折腾过。但说实话，用Python做的事，无非就是「写个小脚本」「跑个简单爬虫」之类的。

距离真正做数据分析，还隔着十万八千里。

那天打开黑马的数据分析课程时，老师的开场白让我印象深刻：

> 「你们之前学的Python，是『玩具Python』。今天开始，我们学的是『生产力Python』。」

数据分析三剑客——NumPy、Pandas、Matplotlib——就是那把打开生产力大门的钥匙。

## NumPy：数值计算的底层基石

### 为什么需要NumPy？

课程开场没有直接讲语法，而是先回答了一个根本问题：**为什么不用Python自带的列表做数值计算？**

老师的比喻很形象：

> Python列表就像「排排坐的大爷」，每个位置放什么数据类型都行，但计算时要一个个遍历，速度慢得像蜗牛。
>
> NumPy数组就像「整齐列队的士兵」，同一时间接受指令、同时动作——这就是向量化运算的魅力。

| 对比维度 | Python列表 | NumPy数组   |
| ---- | -------- | --------- |
| 数据类型 | 任意混合     | 必须统一      |
| 计算方式 | 逐个遍历     | 向量化并行     |
| 内存占用 | 分散、冗余    | 连续、高效     |
| 速度   | 慢        | 快10\~100倍 |

### 创建数组：四种方式

```python
import numpy as np

# 方式一：从Python列表转换
arr1 = np.array([1, 2, 3, 4])
print(arr1)  # [1 2 3 4]

# 方式二：arange连续数字（类似range）
arr2 = np.arange(0, 10, 2)  # 0到10，步长2
print(arr2)  # [0 2 4 6 8]

# 方式三：全0或全1数组
zeros = np.zeros((3, 3))  # 3x3全0矩阵
ones = np.ones((2, 4))   # 2x4全1矩阵
print(zeros)
print(ones)

# 方式四：随机数数组
random_arr = np.random.randn(5)  # 5个标准正态分布随机数
print(random_arr)
```

### 数组属性：一眼看穿数据

```python
arr = np.array([[1, 2, 3], [4, 5, 6]])

print(arr.shape)   # (2, 3)  — 形状：2行3列
print(arr.ndim)    # 2       — 维度：2维
print(arr.dtype)   # int64   — 数据类型
print(arr.size)    # 6       — 元素总数
```

### 索引切片：精准取数

```python
arr = np.arange(1, 10)  # [1 2 3 4 5 6 7 8 9]

print(arr[0])      # 1  — 第1个元素（从0开始）
print(arr[1:5])    # [2 3 4 5]  — 左闭右开
print(arr[arr > 5]) # [6 7 8 9] — 条件筛选
```

:::note
新手常犯的错误：**索引从0开始**，切片是**左闭右开**。`arr[1:5]` 取的是第2到第5个元素，不是第1到第5个。
:::

### 向量化运算：NumPy的灵魂

如果说前面都是语法，那向量化运算就是NumPy的「内功」。

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

# 元素级加法：对应位置相加
print(a + b)   # [5 7 9]

# 标量乘法：每个元素乘2
print(a * 2)   # [2 4 6]

# 矩阵乘法：注意@和*的区别
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
print(A @ B)   # [[19 22] [43 50]]  — 矩阵乘法
print(A * B)   # [[5 12] [21 32]]  — 元素级乘法
```

### 广播机制：不同形状也能运算

NumPy最神奇的特性之一——不同形状的数组可以自动扩展：

```python
A = np.array([[1, 2, 3],
              [4, 5, 6]])  # 2x3矩阵

b = np.array([10, 20, 30])  # 1维数组，长度3

print(A + b)
# [[11 22 33]
#  [14 25 36]]
```

`b` 自动「广播」到每一行，相当于：

```python
# 等价于
[[10, 20, 30],
 [10, 20, 30]] + [[1, 2, 3],
                   [4, 5, 6]]
```

### 常用统计函数

```python
arr = np.array([1, 2, 3, 4, 5])

print(np.sum(arr))      # 15  — 求和
print(np.mean(arr))     # 3.0 — 均值
print(np.max(arr))      # 5   — 最大值
print(np.argmax(arr))   # 4   — 最大值索引
print(np.std(arr))      # 1.4 — 标准差
```

## Pandas：数据分析的核心引擎

### 为什么Pandas是核心？

如果说NumPy是「数值计算的底层」，那Pandas就是「数据处理的顶层」。

老师的比喻让我记忆犹新：

> NumPy像是「原材料加工厂」——它处理的是整齐划一的数字矩阵。
>
> Pandas像是「数据分析师的办公桌」——它处理的是带标签的表格、混合类型的数据，甚至还有日期、文本等「非数字」列。

市场现状是：金融、电商、运营、科研、机器学习等场景，90%以上的数据任务依赖Pandas。

### 两大核心数据结构

```python
import pandas as pd

# Series：一维，带索引
s = pd.Series([10, 20, 30, 40], index=['a', 'b', 'c', 'd'])
print(s)
# a    10
# b    20
# c    30
# d    40
# dtype: int64

print(s['b'])    # 20  — 通过标签索引
print(s[1])      # 20  — 通过位置索引
print(s.mean())  # 25.0 — 自带统计方法

# DataFrame：二维，表格（核心中的核心）
data = {
    '姓名': ['张三', '李四', '王五'],
    '年龄': [22, 25, 30],
    '薪资': [5000, 7000, 10000]
}
df = pd.DataFrame(data)
print(df)
```

输出：

```
   姓名  年龄     薪资
0  张三  22   5000
1  李四  25   7000
2  王五  30  10000
```

### 文件读写：数据进出的通道

```python
# 读取CSV
df = pd.read_csv('data.csv')

# 读取Excel
df = pd.read_excel('data.xlsx')

# 导出CSV（index=False不导出索引列）
df.to_csv('output.csv', index=False)

# 导出Excel
df.to_excel('output.xlsx', index=False)
```

:::note
读取时若出现编码问题，可尝试 `encoding='utf-8'` 或 `encoding='gbk'`。
:::

### 数据快速探查：先「看懂」数据

```python
df.head()        # 看前5行
df.info()        # 看数据类型、缺失值
df.describe()    # 看统计指标（均值、标准差、最值）
df.shape         # 看行列数 (3, 3)
df.columns       # 看列名
df.dtypes        # 看每列类型
```

### 数据选择：精准定位

```python
# 选单列
df['姓名']

# 选多列
df[['姓名', '薪资']]

# 按标签选（loc）
df.loc[0]              # 选第0行
df.loc[0, '姓名']      # 选第0行第'姓名'列
df.loc[0:1, ['姓名', '薪资']]  # 选多行多列

# 按位置选（iloc）
df.iloc[0]             # 选第0行
df.iloc[0, 0]          # 选第0行第0列

# 条件筛选
df[df['年龄'] > 25]                    # 年龄大于25
df[(df['薪资'] > 6000) & (df['年龄'] < 30)]  # 且关系
```

:::warning
`loc` 和 `iloc` 的区别：`loc` 按标签，`iloc` 按位置。`df.loc[0:1]` 取的是索引0和1两行，但 `df.iloc[0:1]` 只取第0行。
:::

## 数据清洗：80%的工作量

数据分析师有句话：「数据清洗做好了，分析就完成了一半。」

### 缺失值处理

```python
# 查看缺失值
df.isnull().sum()  # 每列缺失值数量

# 删除缺失行
df = df.dropna()

# 填充固定值
df['薪资'] = df['薪资'].fillna(0)

# 填充均值（更合理）
df['薪资'] = df['薪资'].fillna(df['薪资'].mean())
```

### 重复值处理

```python
# 查看重复数量
df.duplicated().sum()

# 删除重复行
df = df.drop_duplicates()
```

### 数据类型转换

```python
# 转整数
df['年龄'] = df['年龄'].astype('int')

# 转日期
df['日期'] = pd.to_datetime(df['日期'])
```

## 分组聚合：数据分析的灵魂

如果说数据清洗是基本功，那分组聚合就是分析的核心。

```python
# 简单分组统计
df.groupby('部门')['薪资'].mean()

# 多指标统计
df.groupby('部门').agg({
    '薪资': ['mean', 'max', 'count'],
    '年龄': 'max'
})

# 按城市统计平均薪资
city_stats = df.groupby('城市')['薪资'].agg(['mean', 'max', 'count'])
print(city_stats.sort_values(by='mean', ascending=False))
```

### 数据透视表：更灵活的分组

```python
pd.pivot_table(
    df,
    values='薪资',        # 要统计的值
    index='部门',          # 行索引
    columns='学历',        # 列展开
    aggfunc='mean'         # 聚合方式
)
```

## Matplotlib：数据可视化

### 为什么需要可视化？

老师给了一张美国飓风死亡人数的表格，然后问：「这张表让你感受到了什么？」

没人能回答。

然后老师展示了同一组数据的可视化图表——一条急剧上升的曲线——所有人瞬间明白了问题的严重性。

**数据可视化，是让数据「讲故事」的艺术。**

### 固定绘图模板

```python
import matplotlib.pyplot as plt

# 设置中文字体（避免乱码）
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 绘图
plt.figure(figsize=(10, 6))  # 画布大小
plt.plot(x, y)              # 绑制折线图
plt.title('标题')            # 标题
plt.xlabel('X轴')            # X轴标签
plt.ylabel('Y轴')            # Y轴标签
plt.grid(True)              # 显示网格
plt.show()                  # 显示
```

### 五种入门必绘图表

```python
import numpy as np

x = np.array([1, 2, 3, 4, 5])

# 折线图：展示趋势
plt.plot(x, x ** 2)
plt.title('折线图')
plt.show()

# 柱状图：分类对比
categories = ['Python', 'Java', 'JavaScript']
values = [80, 65, 72]
plt.bar(categories, values)
plt.title('柱状图')
plt.show()

# 直方图：数据分布
data = np.random.randn(1000)
plt.hist(data, bins=30)
plt.title('直方图')
plt.show()

# 散点图：变量关系
x = np.random.randn(50)
y = np.random.randn(50)
plt.scatter(x, y)
plt.title('散点图')
plt.show()

# 饼图：占比分析
sizes = [30, 25, 20, 15, 10]
labels = ['Python', 'Java', 'C++', 'JavaScript', '其他']
plt.pie(sizes, labels=labels, autopct='%1.1f%%')
plt.title('饼图')
plt.show()
```

### Pandas集成：快速绘图

Pandas自带绘图功能，对新手非常友好：

```python
# 折线图
df.plot(x='日期', y='销售额')

# 柱状图
df['城市'].value_counts().plot(kind='bar')

# 饼图
df['部门'].value_counts().plot(kind='pie')
```

## 综合实战：电商销售数据分析

课程最后有一个实战项目——分析电商销售数据。

### 完整流程

```python
import pandas as pd
import matplotlib.pyplot as plt

# 1. 读取数据
df = pd.read_csv('sales.csv')

# 2. 探查数据
df.info()
df.describe()

# 3. 数据清洗
df = df.dropna()  # 删除缺失值
df = df.drop_duplicates()  # 删除重复
df['日期'] = pd.to_datetime(df['日期'])  # 转换日期

# 4. 数据分析
# 按月统计销售额
df['月份'] = df['日期'].dt.month
monthly_sales = df.groupby('月份')['销售额'].sum()

# 按产品统计
product_sales = df.groupby('产品')['销售额'].sum().sort_values(ascending=False)

# 5. 可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# 月度趋势
monthly_sales.plot(ax=axes[0], kind='line', marker='o')
axes[0].set_title('月度销售额趋势')

# 产品排名
product_sales.head(10).plot(ax=axes[1], kind='bar')
axes[1].set_title('产品销售额TOP10')

plt.tight_layout()
plt.show()
```

这个流程跑下来，我第一次感受到了「用Python做数据分析」的真实体验。

## 三剑客对比一览

| 库名         | 定位     | 核心能力         | 类比       |
| ---------- | ------ | ------------ | -------- |
| NumPy      | 数值计算底层 | 数组、矩阵、向量化运算  | 原材料加工厂   |
| Pandas     | 数据处理核心 | 表格数据、清洗、分组聚合 | 数据分析师办公桌 |
| Matplotlib | 数据可视化  | 折线、柱状、散点、饼图  | 数据讲故事的工具 |

| 学习权重       | 建议               |
| ---------- | ---------------- |
| NumPy      | 20% — 理解数组和向量化即可 |
| Pandas     | 60% — 重点中的重点     |
| Matplotlib | 20% — 会画会用即可     |

## 站在今天

2026年1月8日那天，我以为只是在学「几个Python库」。

后来才发现，NumPy告诉我什么叫「向量化思维」，Pandas教会我什么是「数据清洗的艺术」，Matplotlib让我理解了什么叫「让数据说话」。

如果说之前学的Python语法是「识字」，那数据分析就是「阅读理解」——不是为了学而学，而是真正用数据去发现问题、解决问题。

:::note
学完三剑客后，数据分析之路才刚刚开始。后面的SQL查询、统计基础、机器学习，才是真正的星辰大海。但无论如何，三剑客是所有后续学习的基石。
:::

***

*更多内容可查看博客归档。*
