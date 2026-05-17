---
title: 编程生涯：从Redis分布式锁到Shell与Lua脚本
published: 2026-05-10
description: 记录我从Redis分布式锁实战出发，深入学习Lua脚本，再到Shell脚本的学习历程，探讨两门「胶水语言」的设计哲学与实用场景。
tags: [Shell, Lua]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
学习天机学堂项目时，里面有个优惠券领取功能，需要保证原子性扣库存和防止超卖。进而引入了Redis分布式锁以及Lua脚本的相关知识。
:::

## 一、缘起：一个分布式锁引发的「连锁反应」

### 学习Lua的契机

学习Redis分布式锁时，天机学堂项目里有个优惠券领取功能，需要保证原子性扣库存和防止超卖。

分布式场景下的「查询-判断-操作」三连，是经典的竞态条件（Race Condition）问题。我意识到，单靠Redis的基础命令根本无法解决这个问题。

那怎么解决呢？讲解项目的老师提到：**用Lua脚本把这三步打包成一个原子操作**。

这个结论让我产生了更多疑问：

- 什么是Lua脚本？
- 它是怎么嵌入Redis的？
- `KEYS[1]`、`ARGV[1]`、`redis.call()` 这些语法是什么意思？
- Java代码怎么调用这个脚本？

带着这些问题，我开始认真学Lua。一学才发现，Lua语法还挺简洁的，但Redis专用的那些API才是重点。

学着学着，又发现Shell脚本也在很多地方冒了出来——项目里的部署脚本、环境变量配置、CI/CD流水线……它们长得有点像，但又不完全一样。

于是，就有了这篇文章。

## 二、Lua脚本：Redis原子操作的秘密武器

### 2.1 为什么Redis要用Lua脚本？

在深入语法之前，我们先搞明白一个问题：**Redis为什么选择Lua作为脚本语言？**

答案藏在这三个特性里：

| 特性      | 说明                              |
| ------- | ------------------------------- |
| **轻量级** | Lua解释器只有几万行代码，编译后不到200KB        |
| **嵌入式** | Lua可以嵌入到其他程序中运行，不需要独立进程         |
| **原子性** | Redis在执行Lua脚本时，会阻塞其他命令，直到脚本执行完成 |

:::important
Redis选择Lua的核心原因：**Lua脚本在执行期间不会被其他命令打断**。这意味着，你可以把多个Redis命令打包成一个「原子操作」，要么全部成功，要么全部失败，不存在中间状态被其他请求看到的可能。
:::

用生活例子来理解：你去银行转账，转账操作包含「扣钱」和「加钱」两步。如果这两步之间突然停电了怎么办？银行的做法是把这两步做成一个「事务」，要么一起成功，要么一起回滚。Redis Lua脚本就是这个「事务」机制。

### 2.2 Lua核心语法（Redis开发者视角）

如果你的目标只是写Redis Lua脚本，其实不需要学完整本Lua教程。**你只需要掌握大约30%的核心语法**，加上Redis提供的几个专属API就够了。

#### 2.2.1 变量与作用域

```lua
-- ✅ 正确：所有变量都用local声明
local count = 10
local name = "抢券活动"

-- ❌ 错误：不要使用全局变量
-- 全局变量会污染Redis脚本环境，导致难以排查的bug
bad_var = 100
```

:::caution
Redis脚本中，**强烈建议所有变量都用`local`声明**。全局变量不仅会有性能问题，还会在不同脚本调用之间互相影响。
:::

#### 2.2.2 数据类型

Redis Lua环境中只有5种常用数据类型：

| 类型        | 说明           | 示例                    |
| --------- | ------------ | --------------------- |
| `nil`     | 空值，表示不存在     | `local x = nil`       |
| `boolean` | 布尔值          | `true` / `false`      |
| `number`  | 数字（双精度浮点数）   | `10` / `3.14`         |
| `string`  | 字符串          | `"hello"` / `'world'` |
| `table`   | 表（唯一的复杂数据结构） | `{1, 2, 3}`           |

:::note
Lua的布尔规则很特别：**只有`nil`和`false`是假值，`0`、空字符串、空表在Lua中都是真值**。这和Java、Python都不一样，千万别搞混。
:::

```lua
-- 0在Lua中是真值！
if 0 then
    print("0是真值，会打印这句话")
end

-- Lua没有三目运算符，用 and-or 实现
local result = (count > 10) and "yes" or "no"
```

#### 2.2.3 Table：Lua唯一的数据结构

这是Lua最独特的地方——**没有数组、没有字典、没有对象，所有复杂数据结构都用Table实现**。Table既是数组，也是字典。

```lua
-- 数组形式（索引从1开始，不是0！）
local arr = {10, 20, 30, 40}

print(arr[1])  -- 输出10（不是arr[0]！）
print(arr[4])  -- 输出40

-- 字典形式
local dict = {
    name = "张三",
    age = 25,
    ["special-key"] = "value"  -- 特殊键名用方括号
}

print(dict.name)         -- "张三"（点语法）
print(dict["age"])       -- 25（方括号语法）
```

:::warning
Lua数组索引从1开始，这是最容易踩的坑！在Java、Python里习惯了从0开始，在Lua里`KEYS[0]`是`nil`，第一个参数是`KEYS[1]`。
:::

#### 2.2.4 函数与多返回值

Lua的函数可以返回多个值，这是它的特色功能：

```lua
-- 定义一个函数
local function add(a, b)
    return a + b
end

-- 多返回值函数
local function getUser()
    return "张三", 25, "男"
end

-- 接收多返回值
local name, age, gender = getUser()
print(name)   -- 张三
print(age)    -- 25
```

### 2.3 Redis Lua脚本专属API

#### 2.3.1 redis.call() vs redis.pcall()

```lua
-- redis.call()：执行Redis命令，出错时抛出异常
local value = redis.call("get", "mykey")
redis.call("set", "mykey", "newvalue")

-- redis.pcall()（推荐）：执行Redis命令，出错时返回错误表，不会终止脚本
local result, err = redis.pcall("get", "mykey")
if err then
    return redis.error_reply("获取key失败: " .. err)
end
```

:::caution
生产环境推荐使用`redis.pcall()`，它能优雅处理错误，避免脚本意外终止导致部分命令已执行、部分命令未执行的不一致状态。
:::

#### 2.3.2 KEYS和ARGV参数传递

Redis脚本通过两个全局表接收参数：

```lua
-- 示例：脚本接收2个键和2个参数
-- 调用方式：EVAL "脚本内容" 2 key1 key2 arg1 arg2

local key1 = KEYS[1]    -- 第一个键参数
local key2 = KEYS[2]    -- 第二个键参数
local arg1 = ARGV[1]    -- 第一个普通参数
local arg2 = ARGV[2]    -- 第二个普通参数
```

:::important
**强制规范**：所有Redis键必须放在KEYS数组中，普通参数放在ARGV数组中。这是Redis Cluster正常工作的前提——Redis Cluster会根据KEYS来分配请求到不同的节点。
:::

#### 2.3.3 脚本缓存：SCRIPT LOAD + EVALSHA

直接用EVAL命令有个问题：每次都要把完整脚本传输到Redis，太浪费带宽。

更优的做法是：

```bash
# 第一步：用SCRIPT LOAD加载脚本，得到SHA1值（只需传输一次）
SCRIPT LOAD "return redis.call('incr', KEYS[1])"
# 返回："a42059b356c875f0717db19a51f6aaca968fe1d8"

# 第二步：用EVALSHA通过SHA1值调用脚本（每次只传40字节）
EVALSHA "a42059b356c875f0717db19a51f6aaca968fe1d8" 1 mycounter
```

性能差距有多大？

| 对比项      | EVAL          | EVALSHA     |
| -------- | ------------- | ----------- |
| 每次传输量    | 完整脚本（几百到几千字节） | 40字节（SHA1值） |
| Redis端处理 | 每次都要编译        | 直接执行预编译字节码  |
| 10000次调用 | 传输约10MB       | 传输约400KB    |

### 2.4 实战：Redis分布式锁的Lua实现

#### 2.4.1 加锁脚本

```lua
-- 加锁脚本
-- KEYS[1]: 锁键
-- ARGV[1]: 锁值（唯一标识，用于安全释放锁）
-- ARGV[2]: 过期时间（毫秒）
local key = KEYS[1]
local value = ARGV[1]
local expire = ARGV[2]

-- set key value NX PX milliseconds
-- NX: 仅当键不存在时设置
-- PX: 设置过期时间（毫秒）
local ok = redis.call("set", key, value, "NX", "PX", expire)
if ok then
    return 1  -- 加锁成功
else
    return 0  -- 加锁失败（锁已被占用）
end
```

#### 2.4.2 解锁脚本

```lua
-- 解锁脚本（为什么用Lua？保证原子性！）
-- KEYS[1]: 锁键
-- ARGV[1]: 锁值（只有持有锁的人才能释放）
local key = KEYS[1]
local value = ARGV[1]

-- 先比较值，再删除——这两个操作必须原子！
local current = redis.call("get", key)
if current == value then
    redis.call("del", key)
    return 1
else
    return 0
end
```

:::important
解锁脚本用Lua的核心原因：**get和del必须原子执行**。如果先get再del，在两步之间锁可能过期、被另一个请求获取，然后你把别人的锁删了——这就乱套了。
:::

#### 2.4.3 Java调用示例

```java
// Redisson已经封装好了，但理解原理很重要
RLock lock = redissonClient.getLock("order:123");
// 加锁（内部会执行上面的Lua脚本）
lock.lock();
// 业务逻辑...
lock.unlock();  // 解锁（内部也会执行解锁Lua脚本）
```

## 三、Shell脚本：Unix世界的瑞士军刀

### 3.1 Shell是什么：命令解释器还是编程语言？

Shell这个词的原意是「外壳」。在操作系统架构中，它位于**用户和内核之间**：

```
用户 → Shell → 系统调用 → 内核 → 硬件
```

但Shell实际上有**双重身份**：

| 身份    | 说明                 | 示例             |
| ----- | ------------------ | -------------- |
| 命令解释器 | 接收用户输入的命令，翻译给内核执行  | 在终端输入`ls -la`  |
| 脚本语言  | 将多个命令组合成脚本文件，实现自动化 | 写一个`.sh`文件批量处理 |

:::note
Shell最初只是用来交互式执行命令的。但程序员们发现，把一堆命令写进文件里，就能自动化执行重复任务——于是Shell脚本诞生了。它是「第一个被用成脚本语言的命令解释器」。
:::

### 3.2 Shell大家族

Shell不是只有一种，而是一个大家族：

| Shell             | 诞生年份 | 特点                 |
| ----------------- | ---- | ------------------ |
| Bourne Shell (sh) | 1977 | 第一个Unix Shell，兼容性好 |
| C Shell (csh)     | 1978 | 语法类似C，适合交互         |
| Korn Shell (ksh)  | 1983 | 结合sh和csh的优点        |
| **Bash (bash)**   | 1989 | Linux默认，功能强大       |
| Z Shell (zsh)     | 1990 | 高度可定制，插件丰富         |
| Fish (fish)       | 2005 | 语法友好，自动补全出色        |

:::tip
大多数Linux系统默认是Bash。如果你在写跨平台脚本，优先用Bash语法，它在大多数Unix系统上都兼容。
:::

### 3.3 核心语法速览

#### 3.3.1 变量与环境变量

```bash
#!/bin/bash

# 定义变量（等号两边不能有空格！）
name="张三"
age=25

# 使用变量（$符号）
echo $name
echo ${name}  # 推荐写法，防止歧义

# 局部变量 vs 环境变量
# 局部变量：只在当前脚本有效
local_var="局部"

# 环境变量：当前进程及其子进程都有效
export GLOBAL_VAR="全局变量"
```

#### 3.3.2 条件判断

Shell有三种条件测试表达式，新手最容易搞混：

| 表达式     | 名称     | 特点          | 推荐场景   |
| ------- | ------ | ----------- | ------ |
| `[ ]`   | 基本测试命令 | 兼容所有Shell   | 跨平台脚本  |
| `[[ ]]` | 扩展测试命令 | Bash特有，支持正则 | Bash脚本 |
| `(( ))` | 算术表达式  | C风格语法       | 数字比较   |

```bash
# 基本测试 [ ]
if [ $age -eq 25 ]; then
    echo "年龄是25"
fi

# 扩展测试 [[ ]]（推荐）
if [[ $name == 张* ]]; then
    echo "姓张的"
fi

# 正则匹配
email="test@example.com"
if [[ $email =~ ^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$ ]]; then
    echo "邮箱格式正确"
fi

# 算术表达式 (())
if (( score >= 60 && score < 80 )); then
    echo "及格"
fi
```

:::caution
**空格陷阱**：`[ ]`内部的条件判断，**变量和括号之间必须有空格**！`[$age -eq 25]`是错的，必须写成`[ $age -eq 25 ]`。
:::

#### 3.3.3 循环

```bash
# for循环：遍历列表
for fruit in 苹果 香蕉 橘子; do
    echo "我喜欢吃: $fruit"
done

# for循环：数值范围
for i in {1..5}; do
    echo "第 $i 次"
done

# while循环
count=1
while [ $count -le 5 ]; do
    echo "计数: $count"
    count=$((count + 1))  # 注意：算术运算用(())
done

# 读取文件每一行
cat filename.txt | while read line; do
    echo "行内容: $line"
done
```

#### 3.3.4 函数

```bash
#!/bin/bash

# 定义函数
function greet() {
    local name=$1  # local声明局部变量
    echo "你好，$name！"
}

# 调用函数
greet "张三"
greet "李四"
```

### 3.4 实战场景：我的自动化脚本清单

#### 3.4.1 日志分析脚本

```bash
#!/bin/bash
# 分析Nginx访问日志，统计Top 10 IP

LOG_FILE=${1:-"/var/log/nginx/access.log"}

echo "========== 访问统计 =========="
echo "总请求数: $(wc -l < $LOG_FILE)"
echo "Top 10 访问IP:"

# 统计IP出现次数，降序排列，取前10
awk '{print $1}' $LOG_FILE | sort | uniq -c | sort -rn | head -10
```

#### 3.4.2 一键部署脚本

```bash
#!/bin/bash
# 简化版一键部署脚本

# 配置
APP_NAME="myapp"
DEPLOY_PATH="/opt/$APP_NAME"
BACKUP_PATH="/opt/${APP_NAME}_backup"

# 拉取代码
echo ">>> 拉取最新代码..."
git pull origin main

# 打包
echo ">>> 打包项目..."
mvn clean package -DskipTests

# 备份旧版本
echo ">>> 备份旧版本..."
[ -d "$DEPLOY_PATH" ] && mv $DEPLOY_PATH $BACKUP_PATH

# 部署新版本
echo ">>> 部署新版本..."
mkdir -p $DEPLOY_PATH
cp target/*.jar $DEPLOY_PATH/

# 重启服务
echo ">>> 重启服务..."
systemctl restart $APP_NAME

echo "========== 部署完成 =========="
```

## 四、两种语言的灵魂对比

### 4.1 设计哲学对比

| 维度       | Shell             | Lua                 |
| -------- | ----------------- | ------------------- |
| **设计目标** | 系统管理与自动化          | 嵌入式与轻量脚本            |
| **运行方式** | 独立进程，调用系统命令       | 嵌入宿主程序执行            |
| **宿主依赖** | 需要Shell解释器        | 无独立进程，嵌入Redis等程序    |
| **学习曲线** | 陡（需要熟悉Linux命令+语法） | 平缓（核心语法少）           |
| **社区生态** | Linux标配，工具丰富      | 小众但专精（游戏、Redis、嵌入式） |

:::note
两种语言的定位完全不同：Shell是「全能型」，什么都能干；Lua是「专精型」，在一个领域做到极致。
:::

### 4.2 应用场景对照

| 场景        | Shell  | Lua                      |
| --------- | ------ | ------------------------ |
| 服务器运维     | ✅ 主要工具 | ❌ 不适用                    |
| CI/CD流水线  | ✅ 主要工具 | ❌ 不适用                    |
| 文件批量处理    | ✅ 非常适合 | ⚠️ 可以但没必要                |
| Redis原子操作 | ❌ 做不到  | ✅ 核心场景                   |
| 游戏脚本      | ❌ 不适用  | ✅ 主流选择（Unity、Warcraft引擎） |
| Nginx模块   | ❌ 不适用  | ✅ OpenResty核心            |
| 嵌入式开发     | ⚠️ 可以  | ✅ 32KB RAM就能跑            |

### 4.3 性能与资源对比

| 指标         | Shell       | Lua           |
| ---------- | ----------- | ------------- |
| **启动开销**   | 每次启动新进程，较大  | 无进程概念，嵌入执行，极小 |
| **执行速度**   | 调用外部命令，较慢   | 编译后执行，接近C的速度  |
| **内存占用**   | 每个命令fork新进程 | 共享宿主进程内存      |
| **典型执行时间** | 毫秒\~秒级      | 微秒\~毫秒级       |

:::important
如果你在Redis里执行脚本，**必须用Lua，不能用Shell**——Shell需要启动独立进程，而Redis是单线程的，它不可能去fork一个Shell进程来执行脚本。Lua是唯一选择。
:::

## 五、学习路径建议

### 5.1 Lua：从Redis脚本开始

我的建议是**直接动手写**，不要先看完一本Lua教程。

```
学习顺序：
1. 理解KEYS和ARGV的含义（这是Redis脚本特有的）
2. 学会redis.call()的基本用法
3. 写一个简单的计数器脚本
4. 理解为什么需要原子性
5. 再去看Table、函数等高级特性
```

推荐学习资料顺序：

1. 先看Redis官方文档的Lua脚本部分（很短）
2. 再看参考资料里的Lua基础语法
3. 最后根据需要补充Table、元表等进阶内容

### 5.2 Shell：从命令行开始

Shell的难点在于**命令本身**，而不是语法。

```
学习顺序：
1. 先熟练Linux常用命令：ls、cd、cat、grep、awk、sed、管道
2. 理解Shell语法：变量、条件、循环
3. 学会写简单脚本
4. 学习函数和参数传递
5. 进阶：正则表达式、三剑客（grep、awk、sed）
```

:::tip
Shell脚本的80%价值在于**管道和命令组合**。真正的Shell高手，不是因为语法写得溜，而是因为对Linux命令足够熟悉。
:::

## 六、踩坑实录

### 6.1 Lua：数组索引从0还是从1？

这是Lua最著名的坑，没有之一。

```lua
local arr = {10, 20, 30}

-- ❌ 错误：数组从1开始，不是0
print(arr[0])  -- nil

-- ✅ 正确：第一个元素是arr[1]
print(arr[1])  -- 10
```

在Redis Lua脚本里也一样：

```lua
local key1 = KEYS[1]  -- 第一个键
local key2 = KEYS[2]  -- 第二个键
-- KEYS[0] 是 nil！
```

### 6.2 Lua：#运算符的局限性

`#`运算符用于获取数组长度，但它**只对连续的数字索引有效**：

```lua
-- 连续数组：✅ 正确
local arr = {10, 20, 30}
print(#arr)  -- 3

-- 不连续的数组：❌ 结果不可预期
local broken = {[1] = 10, [3] = 30}
print(#broken)  -- 可能返回1，不是2！
```

:::caution
如果你的数组可能出现「空洞」（被删除过元素），不要依赖`#`运算符的长度计算。用`table.maxn()`或者手动遍历更安全。
:::

### 6.3 Shell：空格导致的语法错误

Shell对空格的要求比大多数语言严格：

```bash
# ❌ 错误写法
name = "张三"        # =两边不能有空格
if[$age -eq 25];  # [ 前后需要有空格

# ✅ 正确写法
name="张三"        # =两边不能有空格
if [ $age -eq 25 ]; then  # [ ] 内部外边都要有空格
```

:::warning
Shell里，`=`用于赋值，`==`用于比较，两者不能混用！而且比较时，**变量最好用引号包起来**，防止空值导致语法错误：`[ "$name" == "张三" ]`。
:::

## 写在最后

从Redis分布式锁开始，到Lua脚本，再到Shell脚本，这条学习路径让我对「脚本语言」这件事有了新的理解。

**Shell**是Unix世界的瑞士军刀，它解决的是「如何更好地与操作系统交互、如何自动化重复任务」的问题。

**Lua**是轻量级的嵌入式精灵，它解决的是「如何让宿主程序获得脚本能力、如何实现原子操作」的问题。

两者的定位不同，但都遵循同一个原则：**用最简洁的语法，表达最直接的逻辑**。

学习它们的过程中，我最大的收获是：**不要只会用框架封装好的API，理解底层原理，才能在出问题的时候快速定位、在需要的时候灵活扩展。**

***

*更多内容可查看博客归档。*
