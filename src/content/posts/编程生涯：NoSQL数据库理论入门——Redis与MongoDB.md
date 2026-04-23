---
title: 编程生涯：NoSQL数据库理论入门——Redis与MongoDB
published: 2024-01-03
description: 回顾2024年1月跟随黑马教程学习Redis与MongoDB理论知识的经历，记录两种主流NoSQL数据库的设计理念、核心概念和使用场景。
tags: [数据库, NoSQL]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
2024年1月，刚结束SSM框架学习的我，迎来了新的挑战——NoSQL数据库。彼时的我还不知道，Redis和MongoDB会成为日后项目中不可或缺的组成部分。那段时间，我跟着黑马的教程，一行行记笔记，一个个概念地啃，虽然还没机会在项目中实战，但理论体系的搭建为后来的实践打下了坚实的基础。
:::

## NoSQL前夜：为什么要学NoSQL？

在正式学习Redis和MongoDB之前，我首先要回答一个问题：**有了MySQL，为什么还要学NoSQL？**

这个问题困扰了我很久。后来黑马的老师给了几个场景，让我恍然大悟：

| 场景 | MySQL的局限 | NoSQL的优势 |
|------|-------------|-------------|
| **海量数据** | 分库分表方案复杂，维护成本高 | 天然支持水平扩展 |
| **高并发写入** | 行锁机制导致写入性能瓶颈 | 无事务负担，写入速度极快 |
| **灵活数据结构** | 需要预定义表结构 | Schema-less，存啥都行 |
| **高可用** | 主从复制+哨兵模式，配置繁琐 | 自动化故障转移，集群自愈 |
| **缓存场景** | 查询虽快，但无法替代专业缓存 | 内存级访问速度 |

老师打了个比方：

> MySQL就像瑞士军刀，什么都能干，但每样都不是最精通的；Redis就像一把专业的手术刀，在缓存这个场景下无人能敌；MongoDB就像一个万能工具箱，没有它干不了的事。

### 一个困扰新手的问题：NoSQL是什么意思？

刚开始学的时候，我一直纠结「NoSQL」这个名字——既然是「No SQL」，那是不是就不能用SQL了？

后来才明白，NoSQL 是「Not Only SQL」的缩写，意思是「不仅仅是SQL」。它并不是要取代关系型数据库，而是对传统SQL数据库的一种补充。大多数NoSQL数据库都不支持SQL语法（或者支持得很弱），但它们在特定场景下有无可比拟的优势。

这个误解其实也反映了当时我学习的一个心态：**面对新事物，总喜欢用旧概念去套**。套对了还好，套错了就会自己把自己绕进去，所以一定要避免先入为主。

## Redis：那个快到令人发指的缓存高手

### 初识Redis：内存数据库的震撼

第一次听到「内存数据库」这个概念时，我是懵的——数据库不是应该存在硬盘上吗？存在内存里，断电不就全没了？

后来才知道，Redis就是这么一个「快到不讲道理」的存在。

```
访问速度对比（大致数量级）：
Redis：微秒级（μs）—— 百万分之一秒
MySQL：毫秒级（ms）  —— 千分之一秒
磁盘IO：毫秒级起步   —— 取决于磁盘类型
```

Redis之所以快，是因为它把数据存在内存里，省去了磁盘IO的等待时间。当然，Redis也支持持久化到磁盘，但那更多是数据安全的保障，而非追求速度的手段。

### 五大数据类型：一图看懂Redis能存什么

黑马教程里把Redis的数据类型讲得很透彻，我整理成了一张表：

| 数据类型 | 命令前缀 | 通俗理解 | 典型场景 |
|---------|---------|---------|---------|
| **String** | SET/GET | 字符串/数字/序列化对象 | 验证码、token、session |
| **Hash** | HSET/HGET | 对象，类似Map | 用户信息、商品详情 |
| **List** | LPUSH/RPOP | 有序列表，先进先出/后进先出 | 消息队列、最新评论 |
| **Set** | SADD/SMEMBERS | 无序去重集合 | 标签系统、好友关系 |
| **Zset** | ZADD/ZRANGE | 带分数的排序集合 | 排行榜、权重队列 |

```redis
-- String类型：最简单的key-value
SET user:1001 "张三"
GET user:1001

-- Hash类型：存用户对象
HSET user:1001 name "张三" age "25"
HGET user:1001 name

-- List类型：消息队列
LPUSH msg:queue "消息1"
LPUSH msg:queue "消息2"
RPOP msg:queue  -- 弹出"消息1"

-- Set类型：标签系统
SADD article:1001:tags "Redis" "NoSQL"
SMEMBERS article:1001:tags

-- Zset类型：排行榜
ZADD scoreboard 100 "张三"
ZADD scoreboard 95 "李四"
ZREVRANGE scoreboard 0 9  -- 获取前10名
```

### 持久化机制：速度与安全的博弈

Redis快是快了，但数据存在内存里，万一断电怎么办？

黑马教程介绍了Redis的两种持久化方式，各有优劣：

| 机制 | 全称 | 原理 | 优点 | 缺点 |
|------|------|------|------|------|
| **RDB（快照）** | Redis Database | 定时将内存数据dump到磁盘 | 恢复快、文件紧凑 | 可能丢失最后一次快照后的数据 |
| **AOF（日志）** | Append Only File | 记录每个写命令到日志文件 | 数据安全性高，最多丢1秒 | 文件较大，恢复慢 |

老师给了一个比喻：

> RDB就像是你每隔几个小时拍一张照片存档，宕机了最多丢几个小时的修改；AOF就像是把你的每一个动作都录下来，出了问题可以回放，但录像文件会很大。

实际使用中，小型项目用RDB就够了，对数据敏感的场景用AOF，或者两者结合使用。

### 主从复制与哨兵：高可用架构入门

学完数据类型和持久化，我又迎来了新的概念——集群。

```
主从复制架构：
        [主节点 Master]
           ↙  ↘
    [从节点]   [从节点]
     读副本     读副本
```

原理很简单：主节点负责写，从节点负责读，主节点的数据会自动同步到从节点。一旦主节点挂了，哨兵（Sentinel）会自动选举新的主节点，实现故障转移。

:::note
当时理解这个概念花了不少时间，但后来在实际项目中配置Redis集群时，才发现理论学扎实了，实践就是按部就班的事情。
:::

### 进阶特性：发布订阅与事务

除了基础的数据存储，Redis还有一些高级特性当时没太注意，后来才发现用处很大。

#### 发布订阅：消息传递的另一种方式

Redis的发布订阅（Pub/Sub）是一种简单的消息通信模式：发布者往指定频道发送消息，订阅该频道的订阅者会收到消息。

```redis
-- 订阅者：订阅news频道
SUBSCRIBE news

-- 发布者：向news频道发布消息
PUBLISH news "Redis 7.0发布了！"
```

这个模式常用于：
- 实时消息推送（如聊天系统）
- 系统监控告警
- 异步任务通知

#### 事务与Lua脚本：原子性的保障

Redis的事务不像MySQL那样严格，它只是把命令打包执行，中间不会插入其他命令。但如果想要更复杂的原子性操作，就需要用Lua脚本。

```redis
-- Redis事务示例：先减库存，再创建订单，要么全成功，要么全失败
MULTI
DECR stock:1001
HSET order:1001 user_id 1001 product_id 1001 status "pending"
EXEC

-- Lua脚本示例：更复杂的原子操作
EVAL "
  local stock = redis.call('GET', KEYS[1])
  if tonumber(stock) >= tonumber(ARGV[1]) then
    redis.call('DECRBY', KEYS[1], ARGV[1])
    return 1
  else
    return 0
  end
" 1 stock:1001 1
```

Lua脚本的好处是可以实现复杂的原子操作，而且Redis保证脚本执行的原子性，中间不会有其他命令插入。

### Redis Cluster：真正的分布式集群

当单机Redis无法满足需求时，就需要Redis Cluster了。它通过哈希槽（Hash Slot）将数据分散到多个节点，每个节点负责一部分槽位。

```
Redis Cluster 架构（6个节点，3主3从）：
    [主1:5000]  ───同步───>  [从1:5001]
    [主2:5002]  ───同步───>  [从2:5003]
    [主3:5004]  ───同步───>  [从3:5005]

槽位分配：
  槽0-5460    →  主1
  槽5461-10922 →  主2
  槽10923-16383 → 主3
```

客户端会根据key的哈希值自动路由到对应的节点，不需要手动指定。

## MongoDB：那个灵活到没有朋友文档数据库

### MongoDB是什么：打破表的概念

如果说Redis是一把手术刀，那MongoDB就是一个大型工具箱。

MySQL里，数据存在表（Table）里，每一行（Row）是固定的字段；MongoDB里，数据存在集合（Collection）里，每一个文档（Document）可以是完全不同的结构。

```json
// MySQL思维：users表
{
  "id": 1,
  "name": "张三",
  "age": 25
}

// MongoDB思维：users集合，一个集合里可以有完全不同的文档
{
  "_id": ObjectId("..."),
  "name": "张三",
  "age": 25,
  "hobbies": ["篮球", "音乐"]
}

{
  "_id": ObjectId("..."),
  "name": "李四",
  "skills": {"Python": 80, "Go": 60}
}
```

这两个文档，一个有`hobbies`数组，一个有`skills`对象，结构完全不同。在MySQL里，这种设计是不可想象的。

### 增删改查：MongoDB的基本操作

MongoDB的语法和MySQL有相似之处，但也有明显区别：

| MySQL | MongoDB | 说明 |
|-------|---------|------|
| `INSERT INTO users VALUES(...)` | `db.users.insertOne({...})` | 插入数据 |
| `SELECT * FROM users` | `db.users.find()` | 查询所有 |
| `SELECT * FROM users WHERE id=1` | `db.users.find({_id: 1})` | 条件查询 |
| `UPDATE users SET age=26 WHERE id=1` | `db.users.updateOne({_id:1}, {$set:{age:26}})` | 更新数据 |
| `DELETE FROM users WHERE id=1` | `db.users.deleteOne({_id:1})` | 删除数据 |

```javascript
// 插入文档
db.users.insertOne({
  name: "张三",
  age: 25,
  email: "zhangsan@example.com",
  createTime: new Date()
})

// 批量插入
db.users.insertMany([
  { name: "李四", age: 26 },
  { name: "王五", age: 24 }
])

// 条件查询
db.users.find({ age: { $gte: 25 } })  // age >= 25
db.users.find({ name: /^张/, age: { $gt: 20 } })  // 正则+多条件

// 更新操作
db.users.updateOne(
  { name: "张三" },
  { $set: { age: 26, email: "new@example.com" } }
)

// 删除操作
db.users.deleteOne({ name: "李四" })
```

### 索引与聚合：MongoDB的高级操作

和MySQL一样，MongoDB也支持索引来加速查询：

```javascript
// 创建索引
db.users.createIndex({ email: 1 })  // 1表示升序
db.users.createIndex({ name: 1, age: -1 })  // 联合索引

// 查看查询计划
db.users.find({ email: "test@example.com" }).explain()

// 删除索引
db.users.dropIndex("email_1")
```

但真正让我眼前一亮的是**聚合管道（Aggregation Pipeline）**——这个概念让我第一次意识到，数据处理可以像流水线一样优雅。

```javascript
// 聚合管道示例：统计每个年龄的用户数量
db.users.aggregate([
  { $group: { _id: "$age", count: { $sum: 1 } } },  // 按age分组计数
  { $sort: { count: -1 } },  // 按数量降序
  { $limit: 5 }  // 取前5
])
```

这就好比一条流水线：原始数据 → 分组统计 → 排序 → 截取，每一步都是一个独立的「加工站」，可以自由组合。

### 聚合管道详解：更多操作符

当时黑马教程讲完基础的 `$group`、`$sort`、`$match` 之后，我意犹未尽，自己查了一些更强大的管道操作符：

| 操作符 | 作用 | 示例 |
|--------|------|------|
| `$match` | 过滤文档 | `{ $match: { age: { $gte: 18 } } }` |
| `$group` | 分组统计 | `{ $group: { _id: "$city", total: { $sum: "$score" } } }` |
| `$project` | 字段投影 | `{ $project: { name: 1, age: 1, _id: 0 } }` |
| `$sort` | 排序 | `{ $sort: { age: -1 } }` |
| `$limit` | 限制数量 | `{ $limit: 10 }` |
| `$skip` | 跳过文档 | `{ $skip: 20 }` |
| `$unwind` | 展开数组 | `{ $unwind: "$tags" }` |
| `$lookup` | 左连接 | `{ $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "userOrders" } }` |

```javascript
// 复杂聚合示例：统计每个城市的用户消费总额，并展示用户详情
db.orders.aggregate([
  { $match: { status: "completed" } },  // 只统计已完成的订单
  { $group: {
      _id: "$userId",
      totalAmount: { $sum: "$amount" },
      orderCount: { $sum: 1 }
  }},  // 按用户分组
  { $lookup: {  // 左连接用户表获取用户信息
      from: "users",
      localField: "_id",
      foreignField: "_id",
      as: "userInfo"
  }},
  { $unwind: "$userInfo" },  // 展开用户信息
  { $project: {  // 只展示需要的字段
      userName: "$userInfo.name",
      totalAmount: 1,
      orderCount: 1,
      _id: 0
  }},
  { $sort: { totalAmount: -1 } },  // 按消费总额降序
  { $limit: 10 }  // 取前10名
])
```

:::note
当时学 `$lookup` 的时候特别兴奋，因为终于可以在MongoDB里实现类似SQL的表关联查询了。虽然 `$lookup` 的性能不如MySQL的JOIN，但在MongoDB的文档模型下，这已经是很实用的功能了。
:::

### MongoDB集群：副本集与分片

和Redis一样，MongoDB也有完整的集群方案。

#### 副本集（Replica Set）：高可用保障

MongoDB的副本集原理和Redis的主从复制类似，但更自动化：

```
副本集架构：
      [主节点 Primary]
      ↙    ↓    ↘
  [从节点]  [从节点]  [仲裁节点 Arbiter]
   同步       同步       不存数据，只投票
```

副本集的特点：
- 主节点处理所有写操作
- 从节点异步同步主节点数据
- 仲裁节点不存储数据，只参与选举投票
- 主节点挂了会自动选举新主节点

#### 分片集群（Sharding）：水平扩展的终极方案

当单节点无法承载数据时，就需要分片了：

```
分片集群架构：
  [查询路由 mongos]
         ↓
  ┌──────┴──────┐
  ↓             ↓
[分片1]      [分片2]
(用户数据)    (订单数据)
  ↓             ↓
[副本集]      [副本集]
```

分片键的选择很重要，决定了数据如何分布。常见的分片策略：
- 哈希分片：数据均匀分布，但范围查询效率低
- 范围分片：范围查询效率高，但容易数据倾斜

## 三大数据库同台竞技：同一个需求，不同实现

学了MySQL、Redis、MongoDB之后，我产生了一个有趣的想法：**同一个需求，三种数据库分别怎么实现？**

以「用户登录系统」为例：

| 功能模块 | MySQL实现 | Redis实现 | MongoDB实现 |
|---------|-----------|-----------|-------------|
| **用户表/集合** | `users` 表，包含 id, name, email, password_hash | 缓存热门用户信息 `user:{id}` Hash | `users` 集合，文档存储用户完整资料 |
| **登录状态** | session表，存储session_id | `session:{session_id}` String，存用户id | 不推荐，Redis更适合 |
| **登录失败次数** | login_attempts 表 | `login:fail:{ip}` String，计数器 | 不推荐，Redis更适合 |

### 一个完整场景：用Redis做缓存层

让我用一个完整的「缓存读取 → 缓存写入 → 缓存失效」流程，展示Redis在实际场景中的应用：

```java
// 模拟Java代码：用户信息缓存
public class UserService {
    private RedisTemplate<String, Object> redisTemplate;

    // 1. 读取用户信息：先查Redis缓存，缓存不存在再查数据库
    public User getUserById(Long userId) {
        String cacheKey = "user:" + userId;

        // 尝试从缓存获取
        User cachedUser = (User) redisTemplate.opsForValue().get(cacheKey);
        if (cachedUser != null) {
            return cachedUser;  // 缓存命中，直接返回
        }

        // 缓存未命中，查数据库
        User user = userMapper.selectById(userId);
        if (user != null) {
            // 写入缓存，设置过期时间30分钟
            redisTemplate.opsForValue().set(cacheKey, user, 30, TimeUnit.MINUTES);
        }
        return user;
    }

    // 2. 更新用户信息：先更新数据库，再删除缓存
    public void updateUser(User user) {
        // 更新数据库
        userMapper.updateById(user);

        // 删除缓存，而不是更新缓存（避免并发问题）
        String cacheKey = "user:" + user.getId();
        redisTemplate.delete(cacheKey);
    }

    // 3. 删除用户：删除数据库记录，同时删除缓存
    public void deleteUser(Long userId) {
        userMapper.deleteById(userId);
        String cacheKey = "user:" + userId;
        redisTemplate.delete(cacheKey);
    }
}
```

:::note
为什么更新时「删除缓存」而不是「更新缓存」？因为如果采用「先更新数据库，再更新缓存」的策略，在并发场景下可能出现「数据库是新值、缓存是旧值」的数据不一致问题。采用「先更新数据库，再删除缓存」的策略，下一次读取会重新写入缓存，最终一致性得到保障。
:::

## Redis vs MongoDB：选型决策指南

学了这两个之后，我最大的收获是：它们不是竞争关系，而是互补关系。

| 维度 | Redis | MongoDB |
|------|-------|---------|
| **定位** | 缓存/高速存取 | 主数据库/文档存储 |
| **数据量级** | KB~MB级别（内存有限） | GB~TB级别（磁盘存储） |
| **数据结构** | 五种基本类型 | 灵活的BSON文档 |
| **事务支持** | 弱事务（Lua脚本） | 强事务（ACID） |
| **适用场景** | 缓存、排行榜、session | 内容管理、日志、实时分析 |

老师的总结很到位：

> Redis是「快」字当头，适合做缓存层；MongoDB是「灵活」为本，适合做数据主库。它们在架构中往往并存，而不是取代关系。

### 选型决策表：什么时候用什么

| 需求场景 | 推荐方案 | 原因 |
|---------|---------|------|
| 需要毫秒级响应 | Redis | 内存访问，微秒级延迟 |
| 存储海量文档 | MongoDB | 水平扩展，文档模型 |
| 排行榜/计数器 | Redis Zset/String | 原子递增，有序集合 |
| 用户行为日志 | MongoDB | 灵活Schema，聚合分析 |
| 实时消息推送 | Redis Pub/Sub | 发布订阅原生支持 |
| 商品详情/内容CMS | MongoDB | 文档模型，无需关联查询 |
| 热点数据缓存 | Redis | 内存级访问速度 |
| 社交关系（好友/粉丝） | Redis Set | 集合运算，交集并集 |
| 复杂查询/报表 | MongoDB Aggregation | 管道式数据处理 |

## 学习NoSQL时的「坑」：这些教训要记住

回头看这段学习经历，有些坑是当时踩过才记住的。

### Redis的内存陷阱

Redis的内存是有限的，如果不小心存了大对象或者没设置过期时间，很容易爆内存。

```redis
-- 坑1：没设置过期时间，数据永驻内存
SET huge_data "这里是超大的数据..."  -- 永不过期
TTL huge_data  -- 返回-1，表示永不过期

-- 坑2：KEY模式匹配删除，但生产环境慎用
KEYS user:*  -- 先查看有哪些key
DEL $(KEYS user:*)  -- 批量删除，但可能阻塞Redis

-- 正确做法：用SCAN代替KEYS，设置合理的过期时间
SET user:1001 "张三" EX 3600  -- 设置1小时过期
```

:::warning
生产环境绝对不要用 `KEYS *` 或 `FLUSHDB`，这些命令会阻塞Redis甚至导致服务不可用。正确做法是用 SCAN 游标式迭代，或者在从节点执行。
:::

### MongoDB的文档膨胀

MongoDB的文档可以嵌套、可以随意扩展，但如果不注意，很容易出现性能问题。

```javascript
// 坑1：文档嵌套太深，查询性能差
db.users.insertOne({
  name: "张三",
  // 嵌套层级太深，不推荐
  profile: {
    education: {
      university: {
        name: "某大学",
        major: {
          name: "计算机",
          courses: [...]
        }
      }
    }
  }
})

// 正确做法：使用引用或展开层级
db.users.updateOne(
  { _id: 1 },
  { $set: { university: "某大学", major: "计算机" } }
)

// 坑2：数组无限增长，没有限制
db.users.updateOne(
  { _id: 1 },
  { $push: { logs: "新的日志内容" } }  // logs数组会无限增长
)

// 正确做法：限制数组大小，或使用时间序列集合
db.users.updateOne(
  { _id: 1 },
  { $push: { logs: { $each: ["新日志"], $slice: -100 } } }  // 只保留最近100条
)
```

## 学习资源：这些资料帮助了我

当时跟黑马教程入了门之后，我又找了一些资源继续深入：

| 资源 | 类型 | 适用阶段 |
|------|------|---------|
| 黑马Redis教程 | 视频 | 入门打基础 |
| 黑马MongoDB教程 | 视频 | 入门打基础 |
| Redis命令参考 | 官方文档 | 查阅具体命令用法 |
| MongoDB Manual | 官方文档 | 最权威的参考资料 |

:::tip
视频入门 + 官方文档深入，这两条路走完，Redis和MongoDB就算真正掌握了。
:::

## 理论学习的「无用之用」

2024年1月的这段时间，我跟着黑马教程，把Redis和MongoDB的理论知识过了一遍。

说实话，没有实际项目的加持，学起来总有种「纸上得来终觉浅」的感觉。当时记的笔记，现在回看有些已经记不清当时的理解是否正确了。

但回过头看，正是这段时间的理论积累，让我在后来真正用Redis做缓存、用MongoDB存文档时，少走了很多弯路。

> 理论学习的意义，或许就在于：你学的时候不知道有什么用，但当机会来临的时候，你会发现所有的积累都在等着被调用。

### 从MySQL到NoSQL：学习心态的变化

对比学MySQL和学NoSQL的过程，我发现自己心态上有了一些变化：

| 维度 | 学MySQL时（2023年4月） | 学NoSQL时（2024年1月） |
|------|----------------------|---------------------|
| **心态** | 战战兢兢，怕踩坑 | 平静接受，先理解再动手 |
| **学习方法** | 死记命令，强行记忆 | 理解原理，举一反三 |
| **期待** | 期望学了就能用 | 知道理论只是第一步 |
| **笔记** | 抄命令为主 | 画架构图，理解本质 |

这大概就是「越学越从容」吧。

---

*2024年1月的这段NoSQL学习经历，为我后来理解分布式系统、高并发架构打下了基础。有些知识，当时觉得懂了，后来才发现只是「知道」而已。但正是这些「知道」，让后来的「理解」成为可能。后来在十次方项目中真正实战Redis缓存和MongoDB存储时，我无比庆幸当初打下了这些理论基础。*
