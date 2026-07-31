---
title: 编程生涯：PostgreSQL再学习（二）
published: 2026-07-28
description: PostgreSQL 查询艺术进阶，详解 LIKE/ILIKE、数组与 JSONB 高级操作符、多重含义的 <<、常用函数，再到 ERD 建模、一对一/一对多/多对多关联，深挖模糊匹配、操作符与逻辑外键的底层原理。
tags: [PostgreSQL, 数据库, 查询, 多表关联]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
今天的学习主题是「查询与建模」：如何在海量帖子里快速检索？如何用 SQL 表达复杂的社交关系？这些问题的答案，就藏在 PG 那些「看着眼熟、用着陌生」的操作符里。
:::

## 一、模糊匹配：LIKE 与 ILIKE

### LIKE：区分大小写的「严格模式」

`LIKE` 是 SQL 标准的一部分，用 `%`（匹配任意长度，含空串）和 `_`（匹配单个字符）两个通配符：

```sql
-- 查找标题以「PostgreSQL」开头的帖子
SELECT * FROM posts WHERE title LIKE 'PostgreSQL%';

-- 查找标题是「X学习笔记」这种 5 个字结构的（_ 占一位）
SELECT * FROM posts WHERE title LIKE '___学习笔记';
```

**关键认知：PG 里的** **`LIKE`** **默认严格区分大小写。** `'PostgreSQL'` 匹配不到 `'postgresql'`：

```sql
-- 表里有数据：'PostgreSQL 教程', 'postgresql 实战', 'POSTGRES 概览'

-- LIKE：严格区分大小写，小写开头的那条查不到
SELECT * FROM posts WHERE title LIKE 'postgres%';
-- 结果：'postgresql 实战'（只有它）

-- ILIKE：不区分大小写，全部命中
SELECT * FROM posts WHERE title ILIKE 'postgres%';
-- 结果：三条全出
```

### ILIKE：PG 独家的「宽松模式」

`ILIKE`（case-Insensitive LIKE）是 PG 的非标准扩展，本质就一件事：**忽略大小写**。这对用户搜索场景极其重要——用户可不会在意你数据库里存的是大写还是小写。

:::note
在 MySQL 和 SQL Server 里，`LIKE` 是否区分大小写取决于表的**字符集和排序规则（Collation）**。但在 PG 里，`LIKE` 永远严格区分大小写，所以 PG 才专门发明了 `ILIKE` 来解决这个问题。
:::

### 通配符速查

| 通配符 | 含义              | 示例                     |
| --- | --------------- | ---------------------- |
| `%` | 匹配任意长度的字符串（含空串） | `'张%'` 匹配「张三」「张三四五」    |
| `_` | 匹配单个任意字符        | `'张_'` 匹配「张三」，不匹配「张三四」 |

### 特殊字符转义：ESCAPE

如果搜索内容本身包含 `%` 或 `_`（比如用户搜索「10% 的折扣」），需要转义：

```sql
-- 查询标题包含「10%」的帖子（% 被转义为字面量）
SELECT * FROM posts WHERE title LIKE '10\%%' ESCAPE '\';
```

### 性能：前缀匹配才能走索引

这是开发中最容易翻车的地方：

- **`LIKE '常量%'`（前缀匹配）**：可以走 B-Tree 索引，极快
- **`LIKE '%常量'`** **/** **`LIKE '%常量%'`（后缀/包含匹配）**：**无法走普通 B-Tree 索引**，必然全表扫描

:::warning
如果数据量巨大、又必须做包含匹配（`%关键词%`），就需要 `pg_trgm` 扩展 + GIN 索引救场——具体原理在文末「附录：疑惑深挖」里展开，那是查询性能优化的必学内容。
:::

## 二、数组操作符：让「标签」活起来

### ANY：元素是否存在

```sql
-- 查找标签中包含「教程」的帖子（'教程' 在 tags 数组的任意位置）
SELECT title, tags FROM posts WHERE '教程' = ANY(tags);
```

### @> ：是否包含（左包含右）

```sql
-- 查找同时包含「PostgreSQL」和「教程」两个标签的帖子
-- 注意：顺序无所谓，只要左边的数组包含右边的所有元素即可
SELECT title, tags FROM posts WHERE tags @> ARRAY['PostgreSQL', '教程'];
```

### &&：是否有重叠（交集）

```sql
-- 查找标签包含「PostgreSQL」或「实战」任意一个的帖子（类似 OR）
SELECT title, tags FROM posts WHERE tags && ARRAY['PostgreSQL', '实战'];
```

三个操作符的关系可以用集合图理解：

```text
@>  左 ⊇ 右     ——「全都有」
&&  左 ∩ 右 ≠ ∅ ——「至少有一个」
ANY           ——「等于其中的任意一个」
```

:::tip
这些操作符背后的数据结构是**倒排索引**（和 ES 同款原理，我在 [ELK技术栈](../编程生涯elk技术栈/) 里拆解过），所以它们能配 GIN 索引走加速——**前提是你真的建了 GIN 索引**，否则照样全表扫描。
:::

## 三、JSONB 操作符：半结构化数据的「瑞士军刀」

第一篇文章里，我们用 JSONB 存了文件的元数据。查询的时候，JSONB 的操作符才是真正的核心。

### -> 与 ->>：提取值，但类型不同

这是最基础、也最容易混淆的一对操作符：

```sql
-- 提取 author 字段：-> 返回 jsonb 对象（带引号）
SELECT metadata -> 'author' FROM posts;
-- 结果："jeff"（带双引号，还是 jsonb 类型）

-- 提取 author 字段：->> 返回 text 纯文本（不带引号）
SELECT metadata ->> 'author' FROM posts;
-- 结果：jeff（纯文本）
```

**一句话记忆：`->>`** **多一个** **`>`，取出来的是「Text（纯文本）」**。

如果取出来的字段本身还是 JSON（嵌套结构），就必须用 `->`：

```sql
-- metadata 是嵌套结构：{"video": {"resolution": {"width": 1920}}}
-- 取嵌套字段：一层层用 ->，最后要文本值再用 ->>
SELECT metadata -> 'video' -> 'resolution' ->> 'width' FROM posts;
```

### ?：键是否存在

```sql
-- 查找所有定义了「color」属性的帖子
SELECT * FROM posts WHERE metadata ? 'color';
```

### @>：JSONB 结构包含

```sql
-- 查找 metadata 中包含 {"author": "jeff"} 这个结构的帖子
SELECT * FROM posts WHERE metadata @> '{"author": "jeff"}';
```

:::caution
**`->>`** **返回的是 text，和数字比较时必须用** **`::`** **转类型**，否则会按字母顺序比大小——`"2" > "10"` 竟然为 true！这是 JSONB 查询里最经典的隐蔽 Bug：

```sql
-- 错误：按字符串比较，'10' < '2'（字母序）
SELECT * FROM posts WHERE metadata ->> 'dpi' > '10';

-- 正确：先转成 int 再比较
SELECT * FROM posts WHERE (metadata ->> 'dpi')::int > 10;
```

:::

## 四、类型转换与多重含义的 `<<`

### 类型转换 `::`：PG 的强制转换语法

`::` 是 PG 的标准类型转换（Cast）语法，前面已经见过多次：

```sql
SELECT '123'::int;          -- 字符串转整数：123
SELECT '2026-07-27'::date;  -- 字符串转日期
SELECT 3.14::int;           -- 浮点转整数：3（截断小数）
```

:::important
`->>` 返回文本，如果拿它和数字比大小必须加 `::int`；同样，**查询条件里的隐式类型转换会废掉索引**（比如数字列传字符串），这是索引失效的常见原因。
:::

### `<<`：一符三义，最容易踩坑

`<<` 在 PG 里至少有三种完全不同的含义，**具体是什么含义取决于操作数的数据类型**：

| 使用场景 | 数据类型                      | 含义              | 示例                                                     |
| ---- | ------------------------- | --------------- | ------------------------------------------------------ |
| 位运算  | `bit` / `int`             | 按位左移            | `SELECT 1 << 2;` → 4（二进制 001 左移两位变 100）                |
| 范围类型 | `int4range` / `daterange` | 严格左于（完全在左边且无重叠） | `'[1,5]'::int4range << '[6,10]'::int4range` → true     |
| 网络地址 | `inet`                    | 包含于（IP 属于某个网段）  | `'192.168.1.1'::inet << '192.168.0.0/16'::inet` → true |

要封禁某些网段的恶意发帖者，用网络地址语义最顺手：

```sql
-- 查找所有来自 172.16.0.0/16 网段的发帖记录
SELECT title, ip_address
FROM posts
WHERE ip_address << '172.16.0.0/16';
```

## 五、常用函数：SQL 层的「内置小工具」

函数是数据库的「内置小工具」，能直接在 SQL 层把原始数据加工成想要的格式。jeff 社区的运营要统计各种数据，这些函数就是主角。

### 字符串处理

```sql
-- 拼接：CONCAT 或 ||
SELECT CONCAT('PostgreSQL', ' 再学习') AS title;
SELECT 'PostgreSQL' || ' 再学习' AS title;

-- 大小写转换
SELECT UPPER('jeff'), LOWER('JEFF');

-- 截取：从第 1 位开始取 3 位
SELECT SUBSTR('PostgreSQL', 1, 3);   -- 结果：Pos

-- 替换
SELECT REPLACE('jeff的社区', 'jeff', 'Jeff');

-- COALESCE：超级常用！NULL 时给默认值
SELECT COALESCE(metadata ->> 'author', '匿名') FROM posts;
```

### 数值计算

```sql
SELECT ROUND(3.14159, 2);   -- 四舍五入：3.14
SELECT CEIL(3.1), FLOOR(3.9);  -- 向上取整 4，向下取整 3
SELECT ABS(-5);             -- 绝对值 5
```

### 日期时间：时间管理的灵魂

```sql
-- 当前时间与日期
SELECT NOW();            -- 完整时间（带时区）
SELECT CURRENT_DATE;     -- 仅日期

-- AGE：计算时间差（这个帖子发布了多久）
SET TIME ZONE 'Asia/Shanghai';
SELECT title, AGE(created_at) AS published_age FROM posts;

-- EXTRACT：提取年、月、日、小时
-- 统计每个小时的新帖量
SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*)
FROM posts
GROUP BY hour;

-- TO_CHAR：格式化为字符串
SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') FROM posts;
```

### 流程控制：CASE WHEN（SQL 里的 if-else）

```sql
-- 给帖子按热度分等级
SELECT title,
    CASE
        WHEN view_count > 10000 THEN '爆款'
        WHEN view_count > 1000  THEN '热门'
        ELSE '普通'
    END AS heat_level
FROM posts;
```

### STRING\_AGG：PG 特色，多行合并成一行

```sql
-- 按作者分组，把标签列表合并成逗号分隔的字符串
SELECT uploader_ip,
       STRING_AGG(tags::text, ' | ') AS all_tags
FROM posts
GROUP BY uploader_ip;
```

## 六、ERD 实体关系图：写 SQL 前的「工程图纸」

函数和操作符再多，也架不住**表关系设计错了**。在动手建多表之前，先聊聊建模工具——ERD。

### ERD 是什么？

**ERD（Entity-Relationship Diagram，实体关系图）** 是数据库世界的「工程图纸」：如果 DDL 是盖好的房子、EXPLAIN 是验房报告，那 ERD 就是动工前的设计蓝图。它用图形把「有哪些表、表里有什么字段、表之间怎么关联」画得一清二楚。

### 三要素与 Crow's Foot 记号

一张标准 ERD 由三种图形构成：**矩形**（实体/表）、**椭圆**（属性/字段，实际建模时常省略）、**菱形**（关系）。

最值钱的信息在连线两端——最常见的是 **Crow's Foot（乌鸦脚）** 记号法：

| 符号         | 中文含义        | 示例          |
| ---------- | ----------- | ----------- |
| 一条竖线 `\|`  | 「必须有一个」（强制） | 订单必须属于一个用户  |
| 小圆圈 `○`    | 「可以有零个」（可选） | 用户可以有零个订单   |
| 分叉的乌鸦脚 `<` | 「多个」        | 一个用户可以有多个订单 |

组合起来就是业务规则：

```text
○----<  一对多（可选）：一个用户可以有零个或多个帖子
|----<  一对多（强制）：一个用户必须对应至少一个帖子（少见）
```

### 为什么学查询必须懂 ERD？

因为**绝大多数慢查询，根源都在 ERD 设计**：多对多关系没建中间表、把不该放的字段塞进一张表导致行宽过大……如果你画的 ERD 是一团乱麻，SQL 写得再花哨也白搭。用一句话总结：**ERD 决定了 80% 的性能天花板，索引只是在补救剩下 20%。**

:::tip
画 ERD 的工具：正向设计用 Draw\.io、PDManer；已有表反向出图用 Navicat 的「模型」功能、DataGrip 的 Diagrams。
:::

## 七、多表关系：一对一到多对多

真实业务里，表几乎都是有关联的。

### 一对一（1:1）：核心数据与扩展数据分离

&#x20;`users` 存核心账号（用户名、密码），`user_profiles` 存扩展信息（头像、简介）——把高频核心数据和低频扩展数据分开，查询更高效：

```sql
-- 主表：核心账号
CREATE TABLE users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
);

-- 扩展表：详细资料
-- 关键：外键字段同时设为 PRIMARY KEY，保证一个用户只有一条资料
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY,        -- 既是主键，也是外键
    avatar_url TEXT,
    bio TEXT,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE               -- 用户删了，资料一起删
);
```

### 一对多（1:N）：jeff 与他的帖子

这是最普遍的关系——一个作者有多个帖子：

```sql
-- 「一」的一方：作者
CREATE TABLE authors (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL
);

-- 「多」的一方：帖子（存作者的 ID）
CREATE TABLE posts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    author_id BIGINT NOT NULL,                 -- 外键：帖子属于哪个作者
    title TEXT NOT NULL,
    CONSTRAINT fk_author
        FOREIGN KEY (author_id) REFERENCES authors(id)
        ON DELETE CASCADE
);

-- 正向联查：从作者查帖子
SELECT a.name, p.title
FROM authors a
JOIN posts p ON a.id = p.author_id;

-- 反向联查：从帖子查作者（LEFT JOIN 保留无帖子的作者）
SELECT p.title, a.name
FROM posts p
LEFT JOIN authors a ON a.id = p.author_id;
```

### 多对多（M:N）：帖子与标签

一个帖子有多个标签，一个标签属于多个帖子——这种关系**必须建中间表**：

```sql
-- 帖子表
CREATE TABLE posts2 (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL
);

-- 标签表
CREATE TABLE tags (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    tag_name TEXT NOT NULL UNIQUE
);

-- 中间表：记录「哪个帖子有哪个标签」
CREATE TABLE post_tags (
    post_id BIGINT REFERENCES posts2(id) ON DELETE CASCADE,
    tag_id  BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)     -- 联合主键：防止重复关联
);

-- 查询「PostgreSQL」标签下有哪些帖子：需要跨三张表 JOIN 两次
SELECT t.tag_name, p.title
FROM tags t
JOIN post_tags pt ON t.id = pt.tag_id
JOIN posts2 p ON pt.post_id = p.id
WHERE t.tag_name = 'PostgreSQL';
```

### ON DELETE 的四种姿势

外键定义里 `ON DELETE` 决定「主表删除时，从表怎么办」：

| 选项             | 效果                    | 适用场景           |
| -------------- | --------------------- | -------------- |
| `CASCADE`      | 连坐：子表关联数据一起删          | 用户删了，其资料/帖子无意义 |
| `RESTRICT`（默认） | 有子记录就不准删              | 保护重要数据         |
| `SET NULL`     | 子表外键置 NULL            | 用户注销但保留其评论痕迹   |
| `NO ACTION`    | 类似 RESTRICT，但事务结束时才检查 | 复杂事务场景         |

## 八、CTE 与视图：告别「缩进到太平洋」

### CTE：SQL 里的「局部变量」

嵌套子查询是 SQL 的可读性杀手——三层嵌套下来，代码已经「缩进到太平洋」了：

```sql
-- 可怕的嵌套写法
SELECT * FROM (
    SELECT * FROM (
        SELECT ...   -- 缩进到太平洋
    ) AS inner_data
) AS outer_data;
```

**CTE（Common Table Expression，公共表表达式）** 用 `WITH` 把子查询抽出来起名字，让逻辑像写小说一样自上而下：

```sql
-- 查询「发帖总字数超过 1 万字的作者」
WITH author_word_stats AS (          -- 第一步：先算每个作者的累计字数
    SELECT
        a.name,
        SUM(p.word_count) AS total_words,
        COUNT(p.id)       AS post_count
    FROM authors a
    LEFT JOIN posts p ON a.id = p.author_id
    GROUP BY a.name
)
-- 第二步：像查表一样查这个「变量」
SELECT * FROM author_word_stats
WHERE total_words > 10000;
```

### 视图：SQL 里的「全局公共函数」

视图是一张「虚拟表」——不存数据，只存一条查询语句。查询视图时，它会在背后跑一遍 SQL。

```sql
-- 创建视图：把常用的三表 JOIN 封装一次
CREATE VIEW v_post_detail AS
SELECT
    p.id,
    p.title,
    a.name AS author_name,
    COUNT(pt.tag_id) AS tag_count
FROM posts p
JOIN authors a ON p.author_id = a.id
LEFT JOIN post_tags pt ON p.id = pt.post_id
GROUP BY p.id, p.title, a.name;

-- 以后查询像查单表一样爽
SELECT * FROM v_post_detail WHERE author_name = 'jeff';
```

### CTE vs 视图：怎么选

| 特性   | CTE（WITH）     | 视图（View）              |
| ---- | ------------- | --------------------- |
| 生命周期 | 只在当前这条 SQL 有效 | **永久保存在数据库里**         |
| 类比   | 局部变量          | 全局公共函数                |
| 适用场景 | 让一条复杂查询变好看    | 经常复用的查询、报表统计          |
| 权限控制 | 无             | **强大**：可以只给用户看视图，不给原表 |

:::note
视图最容易被忽略的价值是**安全**：你可以给数据分析师开一个视图（只暴露脱敏字段），他永远碰不到原始表的敏感列。这在权限体系里是「最小权限原则」的落地手段之一。
:::

## 附录：疑惑深挖

### 深挖① LIKE 与 ILIKE 的索引原理

#### 为什么 ILIKE 默认不走 B-Tree？

B-Tree 索引依赖**有序性**——它按字节序排好序，才能二分查找。`LIKE 'post%'` 能走索引，是因为「以 post 开头」的字符串在排序后是连续的一段，树可以快速定位。

但 `ILIKE` 做了大小写转换——转换后的值和存储时的顺序不一致，B-Tree 的有序性被破坏了，于是只能全表扫描。

**优化方案**：装 `pg_trgm` 扩展，建 GIN 索引，让 `ILIKE` 也能走索引：

```sql
-- 1. 开启扩展（PG 支持度最好的模糊搜索加速器）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. 建 GIN 索引（支持任意位置的模糊匹配）
CREATE INDEX idx_posts_title_gin ON posts USING gin (title gin_trgm_ops);

-- 现在这条 ILIKE 能走索引了
SELECT * FROM posts WHERE title ILIKE '%sql%';
```

#### 五种匹配方式的性能排序

| 操作符           | 区分大小写 | 能否走 B-Tree        | 性能 |
| ------------- | ----- | ----------------- | -- |
| `=`           | 是     | ✅                 | 最快 |
| `LIKE '前缀%'`  | 是     | ✅                 | 快  |
| `ILIKE '前缀%'` | 否     | ❌（需 pg\_trgm GIN） | 中  |
| `LIKE '%后缀%'` | 是     | ❌（需 pg\_trgm GIN） | 慢  |
| `~` 正则        | 是     | ❌（需 pg\_trgm GIN） | 最慢 |

:::warning
**处理含** **`%`、`_`** **的搜索词必须转义**（`ESCAPE`）；另外，**隐式类型转换也会废掉索引**——比如 varchar 列传了数字。这两点是最常见的「建了索引却不生效」的元凶。
:::

### 深挖② 高级操作符为什么必须配 GIN 索引

数组（`@>`、`&&`）和 JSONB（`?`、`@>`）查询，本质都是\*\*「判断元素是否存在/包含」**——这正是**倒排索引\*\*的用武之地。

- B-Tree 适合：等值、范围
- GIN（Generalized Inverted Index，通用倒排索引）适合：**元素包含、全文搜索、JSON 查询**

```sql
-- 数组索引
CREATE INDEX idx_posts_tags ON posts USING gin (tags);

-- JSONB 索引（jsonb_path_ops 是更紧凑的变体，查询更快）
CREATE INDEX idx_posts_meta ON posts USING gin (metadata jsonb_path_ops);
```

**两个容易踩的坑**：

1. **`->>`** **提取成文本后比较，走不了索引**——即使建了 GIN 索引。因为 `->>` 返回 text，GIN 索引存的是 JSONB 结构。想走索引，要么用 `@>`，要么建**表达式索引**：
   ```sql
   CREATE INDEX idx_posts_author ON posts ((metadata ->> 'author'));
   ```
2. **数据量小的时候，优化器可能放弃索引**——统计信息告诉它全表扫描更快。

### 深挖③ 物理外键 vs 逻辑外键：一场权衡之争

**物理外键** = 用 `FOREIGN KEY` 约束，数据库替你维护一致性；**逻辑外键** = 字段上没有任何约束，只是业务上存在关联，一致性靠代码保证。

| 维度       | 物理外键                           | 逻辑外键            |
| -------- | ------------------------------ | --------------- |
| 数据库声明    | 有 `CONSTRAINT ... FOREIGN KEY` | 无约束，就是一个普通字段    |
| 一致性      | 强一致（插子表会检查父表）                  | 弱一致（全靠应用代码）     |
| 级联操作     | 支持 `ON DELETE CASCADE`         | 不支持，手写删除逻辑      |
| 对 DDL 影响 | 锁表、阻塞 TRUNCATE、阻碍 ALTER        | 无阻碍，TRUNCATE 随意 |
| 写入性能     | 额外检查父表，有开销                     | 更快              |

#### 为什么大厂偏爱逻辑外键？

四个典型场景，我在 [PostgreSQL再学习（一）](../编程生涯postgresql再学习一/) 附录里提过的 TRUNCATE、INHERITS 都与之相关：

1. **为了能用 TRUNCATE**：物理外键存在时 TRUNCATE 父表会报错，逻辑外键随意
2. **配合 INHERITS**：子表不继承父表外键约束，物理外键在继承场景形同虚设
3. **分库分表/微服务**：`user` 在 A 库、`order` 在 B 库，跨库无法建物理外键
4. **历史脏数据**：旧系统已有孤儿数据，强行加物理外键会报错

#### 逻辑外键的「致命缺陷」

把完整性职责交给代码，意味着三件事只要做错一个就出事故：

- **孤儿数据**：删了父表忘删子表 → 左连接出现大量 NULL，报表算错
- **重复插入**：并发 Bug 就能插入不存在的父 ID
- **级联噩梦**：嵌套三层以上的手动递归删除，极易漏删

#### 折中方案：核心表物理、日志表逻辑

```text
users / orders 等核心资产  → 物理外键（保命要紧）
audit_logs 等日志表         → 逻辑外键（丢几条也无伤大雅）
```

**实战定论**：单体应用、百万级数据，**无脑上物理外键**——数据一致性 > 那点性能损耗。微服务、分布式、频繁 TRUNCATE 的大表，用逻辑外键，但必须配套：每晚跑孤儿数据扫描脚本报警、应用层先软删再异步物理删。

## 结语：查询是手段，建模是根本

这一篇，从 LIKE 讲到多表 JOIN，从数组操作符讲到物理/逻辑外键——表面上是在学 SQL 语法，实质上是在学**如何用关系模型表达现实世界的复杂关系**。

下一篇《PostgreSQL再学习（三）》，将面对真正的硬仗：用 EXPLAIN ANALYZE 读懂执行计划、用索引调优、用事务和锁保证并发安全，以及把 PG 扩展成全文搜索和向量数据库。

***

**延伸阅读：**

- [PostgreSQL再学习（一）](../编程生涯postgresql再学习一/) — 从安装到建表，重拾 PG 基础
- [数据库学习之路](../编程生涯数据库学习之路/) — MySQL 的 CRUD、索引与事务入门
- [ELK技术栈——日志处理的瑞士军刀](../编程生涯elk技术栈/) — 倒排索引原理，GIN 索引的同门
- [NoSQL数据库理论入门——Redis与MongoDB](../编程生涯nosql数据库理论入门redis与mongodb/) — JSON 文档模型与聚合管道
- [PostgreSQL再学习（三）](../编程生涯postgresql再学习三/) — 事务、索引调优与扩展生态

