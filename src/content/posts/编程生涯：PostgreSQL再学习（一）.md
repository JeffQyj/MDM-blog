---
title: 编程生涯：PostgreSQL再学习（一）
published: 2026-07-27
description: 从安装到建表，以 jeff 云盘为案例讲解数据库-模式-表三级结构、数据类型底层设计、约束机制，并深挖 DDL 与 DML 本质、TRUNCATE 跨库差异与表继承原理。
tags: [PostgreSQL, 数据库, DDL, 数据类型]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
2026 年 7 月中旬，我写完了 [数据库天花板——PostgreSQL](../编程生涯数据库天花板postgresql/)，把 PG 的索引体系、进程架构、WAL 机制梳理了个遍。但那篇文章是「纸上谈兵」——懂了原理，却没亲手敲过几条 PG 的 SQL。这一次，从安装开始，一行行建表，把「懂」变成「会用」。
:::

## 一、为什么再学一次 PostgreSQL

7 月中旬我写 [数据库天花板——PostgreSQL](../编程生涯数据库天花板postgresql/) 时，讲的是 B-link 树、GIN 倒排索引、多进程架构这些「内功」。内功有了，招式却没有——我连 `psql` 命令行都没真正用过几次。

于是我把接下来的学习目标定得很具体：**用 PostgreSQL 跑通建库、建表、增删改查的全流程。**

### 本文的目标读者

这篇文章适合已经对 PG 有概念认知（哪怕只读过《数据库天花板》）、但缺少实操经验的人。如果你连「关系型数据库是什么」都还不清楚，建议先读 [数据库学习之路](../编程生涯数据库学习之路/) 补基础。

:::tip
这是一个系列文章，是三部曲结构：这一篇讲「基础与建表」，下一篇讲「查询与建模」，第三篇讲「调优与扩展」。
:::

## 二、环境搭建：先把 PG 跑起来

理论学习再多，第一步永远是**把数据库装起来**。

### 路线一：Windows 图形化安装（新手友好）

去 [PostgreSQL 官网](https://www.postgresql.org/download/windows/) 下载 EDB 的交互式安装包，一路默认即可。有两个点需要注意：

1. **安装组件时勾选 pgAdmin 4**——这是官方图形化管理工具，后面看表结构很方便
2. **设置超级用户** **`postgres`** **的密码时务必牢记**——这是整个数据库的「root 权限」

装完之后，把 `PostgreSQL\bin` 目录加进系统环境变量 PATH，这样在任意终端都能直接用 `psql` 命令。**注意：改完环境变量要重开终端才生效。**

### 路线二：Docker 一键部署（开发神器）

Docker 安装最大的好处是**版本随意切换、不污染系统**。

```bash
# 启动一个 PostgreSQL 16 容器
docker run -d \
  --name pg \                               # 容器名
  -p 5432:5432 \                            # 映射端口：宿主机5432 → 容器5432
  -e POSTGRES_USER=jeff \                   # 超级用户名
  -e POSTGRES_PASSWORD=jeff_pass_2026 \     # 密码（生产环境务必用强密码）
  -e POSTGRES_DB=jeff_cloud \               # 默认创建的数据库
  -e TZ=Asia/Shanghai \                     # 时区：避免时间错乱
  -v pgdata:/var/lib/postgresql/data \      # 数据卷：容器删了数据还在
  postgres:16.2                             # 镜像版本
```

:::note
如果选择 Docker 方式，宿主机上就没有 `psql` 工具了。要么 `docker exec -it pg-jeff-cloud psql -U jeff -d jeff_cloud` 进容器操作，要么用 IDE 自带的数据库客户端（如 idea、VS Code 的 Database 插件）连接。
:::

### 连接数据库：psql 命令行

连接本地数据库的完整语法：

```bash
# -U 用户名  -d 数据库名
psql -U jeff -d jeff_cloud
# 回车后输入密码即可进入 PG 命令行环境
```

连接远程服务器（比如把 PG 部署在云服务器上）：

```bash
# -h 远程IP  -p 端口  -U 用户名  -d 数据库名
psql -h 192.168.80.166 -p 5432 -U jeff -d jeff_cloud
```

### 远程连接的两个配置文件（原理拆解）

```text
客户端发起连接
    ↓
第一阶段：网络层 —— postgresql.conf 中的 listen_addresses
    决定「服务器监听哪些网卡的连接」
    ↓
第二阶段：认证层 —— pg_hba.conf（host-based authentication）
    决定「哪些 IP 的客户端、用什么方式、连哪个库」
```

```bash
# 修改 postgresql.conf：监听所有网卡
# 找到 listen_addresses = 'localhost' 改成：
listen_addresses = '*'

# 修改 pg_hba.conf：放行所有 IP 的密码连接
# 找到 IPv4 那一行，把地址段改成 0.0.0.0/0
host    all             all             0.0.0.0/0            scram-sha-256

# 重启数据库使配置生效
systemctl restart postgresql
```

:::warning
放行 `0.0.0.0/0` 意味着**任何 IP 都能尝试连接你的数据库**，这是黑客攻击的首要目标。**测试环境可以放开，生产环境绝不要**。云服务器上的数据库，最好是只允许内网/本机访问。
:::

:::tip
顺便一提：如果你用的图形化客户端（如 DBeaver、DataGrip）连接时提示「找不到驱动」，别慌，那是客户端在首次连接时自动下载 JDBC 驱动，等它下载完重连即可。
:::

## 三、逻辑结构：数据库 → 模式 → 表

在 MySQL 里，数据的组织是「数据库 → 表」两级。而 PG 中间多了一层 **Schema（模式）**，变成三级。怎么理解这一层？

### 行政办公大楼的类比

> 把 PostgreSQL 实例想象成一栋行政办公大楼：
>
> - **数据库（Database）** = 大楼里的某一层楼，楼层之间物理隔离
> - **模式（Schema）** = 楼层里的各个部门房间，可以按业务分组
> - **表（Table）** = 房间里的文件柜，真正存放数据的地方
> - **行与列（Row & Column）** = 文件柜里的一份份档案

这个类比最关键的一点是：**不同数据库之间数据默认不通**——你没法在 `db_a` 里直接查 `db_b` 的表。而同一个数据库下的多个 Schema，则可以通过「模式名.表名」互相访问。

### Schema 的价值：逻辑分组与权限隔离

可以划分如下三个 Schema：

| Schema    | 用途      | 存放内容          |
| --------- | ------- | ------------- |
| `public`  | PG 默认模式 | 通用配置、辅助表      |
| `storage` | 文件存储域   | 文件表、标签表、存储节点表 |
| `auth`    | 用户认证域   | 用户表、会话表、角色表   |

这样做的好处有二：**一是逻辑清晰**——看一眼表名就知道属于哪个业务域；**二是权限可控**——可以只给某个开发者 `storage` 模式的权限，他碰不到 `auth` 的用户数据。

:::tip
Schema 还有一个高级玩法：**多租户系统**。给每个租户分配一个独立的 Schema，他们共享同一个数据库连接池，数据逻辑隔离，既安全又省资源。这是 MySQL 很难做到的设计。
:::

### 实际操作：创建库与模式

```sql
-- ===== 数据库操作 =====

-- 创建数据库
CREATE DATABASE jeff_cloud;

-- 查看所有数据库（psql 元命令，或者用 SQL）
\l
SELECT datname FROM pg_database;

-- 切换到另一个数据库
\c jeff_cloud;

-- 删除数据库（注意：需要先切到其他库，且不能有活动连接）
DROP DATABASE jeff_cloud;
-- 强制删除：断开所有连接后删除（慎用！）
DROP DATABASE jeff_cloud WITH (FORCE);


-- ===== 模式操作 =====

-- 创建模式：如果不存在就创建
CREATE SCHEMA IF NOT EXISTS storage;

-- 查看所有模式
\dn

-- 删除模式：只有模式为空时才能删
DROP SCHEMA IF EXISTS storage;

-- 【慎用】级联删除：连模式里的所有表、视图、函数一起删
DROP SCHEMA IF EXISTS storage CASCADE;
```

:::important
`DROP DATABASE ... WITH (FORCE)` 和 `DROP SCHEMA ... CASCADE` 都是「毁灭性」操作，会把所有关联数据一起清掉。**生产环境执行前，先确认这三件事：有没有备份？是不是在维护窗口？操作人有没有权限？**
:::

## 四、PG 数据类型全家桶

### 数值类型

| 类型                          | 字节  | 说明                    | 适用场景       |
| --------------------------- | --- | --------------------- | ---------- |
| `INTEGER` / `INT`           | 4   | 整数，范围约 ±21 亿          | 常规计数       |
| `BIGINT`                    | 8   | 大整数                   | 文件大小、大 ID  |
| `NUMERIC(p, s)` / `DECIMAL` | 变长  | 精确小数，`p` 总位数、`s` 小数位数 | **金额必须用它** |
| `SERIAL` / `BIGSERIAL`      | 4/8 | 自增整数（本质是封装了 SEQUENCE） | 自增主键       |

:::important
**金额字段永远不要用** **`FLOAT`** **/** **`DOUBLE`**——浮点数的二进制表示有精度误差，0.1 + 0.2 可能等于 0.30000000000000004。`NUMERIC` 是精确十进制运算，这才是钱该待的地方。
:::

### 字符类型

| 类型           | 说明                    |
| ------------ | --------------------- |
| `VARCHAR(n)` | 变长字符串，有长度上限           |
| `TEXT`       | 变长字符串，**无长度限制**       |
| `CHAR(n)`    | 定长字符串，不足补空格（**几乎不用**） |

**PG 社区的建议：无脑用** **`TEXT`**，除非有硬性业务长度约束（比如身份证号必须 18 位）。原因是 PG 里 `TEXT` 和 `VARCHAR` 的底层存储机制几乎一样，`VARCHAR(n)` 的长度限制反而会在业务演化时处处掣肘。

### 日期/时间类型

| 类型            | 说明                      | 建议         |
| ------------- | ----------------------- | ---------- |
| `TIMESTAMP`   | 日期 + 时间，**不带时区**        | 不推荐        |
| `TIMESTAMPTZ` | 日期 + 时间，**带时区**         | **生产环境推荐** |
| `DATE`        | 仅日期                     | 生日、账单日     |
| `INTERVAL`    | 时间间隔（如 `1 day 2 hours`） | 有效期计算      |
| `TSTZRANGE`   | 带时区时间范围 `[起, 止)`        | 有效期区间      |
| `DATERANGE`   | 日期范围                    | 排期区间       |

:::caution
**为什么** **`TIMESTAMPTZ`** **是生产环境首选？** `TIMESTAMPTZ` 存储的是 UTC 时间，读取时按客户端时区转换，**无论谁在哪看，看到的都是自己的本地时间**。
:::

### 特色/高级类型（PG 的杀手锏）

| 类型       | 说明                    | jeff 云盘中的应用       |
| -------- | --------------------- | ----------------- |
| `JSONB`  | 二进制存储的 JSON，支持索引，性能极佳 | 文件元数据（不同文件格式信息不同） |
| `UUID`   | 通用唯一识别码               | 对外暴露的文件 ID        |
| `TEXT[]` | 数组类型                  | 文件标签列表            |
| `INET`   | IP 地址类型               | 上传者的 IP           |
| `CIDR`   | 网段类型                  | 内网网段、白名单          |

**这里重点讲讲** **`JSONB`** **和** **`INET`，它们代表了 PG 对「非关系型数据」的态度。**

#### JSONB：为什么能平替 MongoDB

`JSONB`（JSON Binary）把 JSON 文本解析成二进制格式存储，去掉了空格、重复键等冗余。和纯文本的 `JSON` 类型相比，**读写更快、支持索引、查询能力更强**。

```sql
-- 每个文件可以有自己的元数据结构
'{"pages": 45, "author": "jeff"}'::jsonb       -- PDF
'{"dpi": 300, "color": "RGB"}'::jsonb          -- 图片
'{"resolution": {"width": 1920}}'::jsonb       -- 视频
```

:::note
我在 [NoSQL数据库理论入门——Redis与MongoDB](../编程生涯nosql数据库理论入门redis与mongodb/) 里写过 MongoDB 的 Schema-less 灵活性。PG 的 JSONB 在中小规模场景下完全可以替代 MongoDB——**区别在于 PG 是「关系型为主、JSON 为辅」，MongoDB 是「JSON 为主、关系靠手动」**。数据量大到需要水平分片时，MongoDB 的原生分片能力仍然是优势。
:::

#### INET：数据库层直接认识 IP

`INET` 类型让 PG 能「理解」 IP 地址，可以做子网归属判断：

```sql
CREATE TABLE file_upload_log (
    uploader_ip INET NOT NULL,   -- IP 类型，存不了非法的 IP
    file_name   TEXT NOT NULL
);

-- 判断某个 IP 是否属于内网网段
SELECT '192.168.1.5'::inet << '192.168.0.0/16'::inet;  -- 结果：true
```

### 综合案例

用一张表把上面的类型串起来：

```sql
-- 知识点：一张表把 PG 的特色类型全部用上
CREATE TABLE public.file_details (
    -- 1. 自增主键：数据库内部关联用，性能优于 UUID
    -- 知识点：BIGSERIAL 是 8 字节整数，上限约 922 亿亿次插入
    id BIGSERIAL PRIMARY KEY,

    -- 2. 对外暴露的唯一 ID：防止业务数据量泄露
    detail_id UUID UNIQUE DEFAULT gen_random_uuid(),

    -- 3. 文件有效期的起止时间（范围类型）
    -- 知识点：'[2026-01-01, 2027-01-01)' 表示「从元旦开始，一年内有效」
    valid_period TSTZRANGE NOT NULL DEFAULT tstzrange(now(), NULL, '[)'),

    -- 4. 上传者 IP（网络类型）
    uploader_ip INET NOT NULL,

    -- 5. 标签集合（数组类型）
    tags TEXT[] DEFAULT '{}',

    -- 6. 元数据（半结构化数据）
    metadata JSONB DEFAULT '{}',

    -- 基础字段
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入几条不同格式的文件记录
INSERT INTO public.file_details (uploader_ip, tags, metadata, file_name)
VALUES
    -- 文档：标准 JSON
    ('10.0.0.5', ARRAY['PDF', '文档'], '{"pages": 45, "author": "jeff"}', 'PostgreSQL手册.pdf'),
    -- 图片：数组用花括号语法也可以
    ('127.0.0.1', '{"素材", "封面"}', '{"dpi": 300, "color": "RGB"}', 'bilibili横屏封面.png'),
    -- 视频：嵌套 JSON 元数据
    ('192.168.50.20', ARRAY['视频'], '{"video": {"resolution": {"width": 1920}}}', 'demo.mp4');
```

:::tip
注意数组的两种写法：`ARRAY['a', 'b']` 和 `'{a, b}'` 是等价的。推荐用 `ARRAY[...]`，可读性更好，也不容易踩引号的坑。
:::

## 五、六大约束：数据质量的「最后防线」

约束（Constraint）是什么？用一句话说：**约束是数据库在替你守规矩。** 业务代码可以写得随意，但只要约束在，脏数据就进不了表。这体现了 PG「严谨」的基因。

| 约束            | 作用                              | 示例                                        |
| ------------- | ------------------------------- | ----------------------------------------- |
| `NOT NULL`    | 列不能为空                           | `file_name TEXT NOT NULL`                 |
| `UNIQUE`      | 列值不能重复                          | `email TEXT UNIQUE`                       |
| `PRIMARY KEY` | 主键：唯一标识一行（隐含 NOT NULL + UNIQUE） | `id BIGSERIAL PRIMARY KEY`                |
| `FOREIGN KEY` | 外键：表间关联，防止破坏关系                  | `user_id INT REFERENCES users(id)`        |
| `CHECK`       | 检查值满足条件                         | `file_size BIGINT CHECK (file_size >= 0)` |
| `DEFAULT`     | 未指定时用默认值                        | `created_at TIMESTAMPTZ DEFAULT NOW()`    |

### 约束的底层逻辑：完整性（Integrity）

数据库理论里把约束分为两类完整性：

- **实体完整性**：每行必须能被唯一识别 → 由主键、UNIQUE 保证
- **参照完整性**：表间引用必须有效 → 由外键保证

示例用户表和文件表：

```sql
-- 用户表（auth 模式）
CREATE TABLE auth.users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,  -- 自增主键
    username TEXT NOT NULL UNIQUE,                           -- 用户名不能重复
    email    TEXT NOT NULL UNIQUE,                           -- 邮箱不能重复
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文件表（storage 模式）
-- 注意：auth.users 和 storage.files 通过外键关联
CREATE TABLE storage.files (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES auth.users(id),      -- 外键：文件必须有主人
    file_name TEXT NOT NULL,
    file_size BIGINT CHECK (file_size >= 0),                 -- CHECK：大小不能为负
    is_public BOOLEAN DEFAULT false,                         -- 默认私有
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

:::caution
关于外键，**很多公司（尤其是大厂）会故意去掉物理外键，改用「逻辑外键」**（不加 FOREIGN KEY 约束，靠代码保证）。为什么？因为物理外键会带来锁表、阻碍 TRUNCATE、影响写入性能等问题。
:::

### 约束失败的一个隐蔽副作用

插入数据时，如果约束校验失败（比如 UNIQUE 冲突），**自增 ID 也会被消耗**：

```sql
-- 假设 users 表已有 username = 'jeff'
INSERT INTO auth.users (username, email) VALUES ('jeff', 'jeff2@example.com');
-- 报错：duplicate key value violates unique constraint "users_username_key"

-- 此时再去查下一个自增值，会发现序列已经 +1 了
-- 因为序列（SEQUENCE）的递增发生在约束校验之前
```

:::note
这意味着「主键 ID 不连续」是正常的。**不要依赖 ID 连续性做任何业务逻辑**，比如「通过 ID 差值推断用户量」——那是错的。
:::

## 六、DDL 建表实战：从 CREATE 到 DROP

DDL（Data Definition Language，数据定义语言）管的是「房子的结构」。这一节把 DDL 的完整生命周期走一遍。

### 创建表：完整语法

```sql
-- storage.files 表示在 storage 模式下创建 files 表
-- 如果要在 public 模式创建，直接写表名即可
CREATE TABLE IF NOT EXISTS storage.files (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,  -- 自增主键
    file_id UUID DEFAULT gen_random_uuid(),                  -- UUID
    file_name TEXT NOT NULL,                                 -- 文件名，不能为空
    file_size BIGINT CHECK (file_size >= 0),                 -- 大小非负
    is_public BOOLEAN DEFAULT false,                         -- 是否公开
    tags TEXT[],                                             -- 数组类型（PG 特色）
    created_at TIMESTAMPTZ DEFAULT NOW()                     -- 带时区时间
);
```

### 查看表结构：psql 元命令 vs SQL 查询

```sql
-- psql 中查看所有表
\dt

-- psql 中查看某张表的详细结构（列、类型、索引、约束）
\d storage.files

-- 更通用的方式：查系统目录（pgAdmin、DataGrip 也常用）
SELECT
    column_name  AS 字段名,
    data_type    AS 数据类型,
    is_nullable  AS 是否允许为空,
    column_default AS 默认值
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;   -- 按表中定义顺序排列
```

### 修改表：ALTER 的四种姿势

项目需求永远在变，ALTER 是 DDL 里最高频的操作：

```sql
-- 1. 添加字段
ALTER TABLE storage.files ADD COLUMN download_count INT DEFAULT 0;

-- 2. 修改字段类型
ALTER TABLE storage.files ALTER COLUMN file_name TYPE VARCHAR(255);

-- 3. 重命名字段
ALTER TABLE storage.files RENAME COLUMN is_public TO is_shared;

-- 4. 删除字段（注意：字段里的数据会一起没）
ALTER TABLE storage.files DROP COLUMN tags;
```

### 删除表与清空表：DROP 与 TRUNCATE

```sql
-- 删除表（数据全没了，不可恢复！）
DROP TABLE IF EXISTS storage.files;

-- 级联删除：被其他表外键引用时，连带删除关联关系
DROP TABLE storage.files CASCADE;

-- 清空表数据但保留表结构（比 DELETE 快几个数量级）
TRUNCATE TABLE storage.files;
-- 清空并重置自增 ID
TRUNCATE TABLE storage.files RESTART IDENTITY;
```

:::warning
`TRUNCATE` 和 `DROP` 都是 DDL，执行即生效。关于 TRUNCATE 在 PG 和其他数据库里的「潜规则差异」，以及它和 DELETE 的对比，我在文末会专门展开。
:::

### DDL 与 DML 的分界线

说到 DDL，必须先建立一个清晰的认知——DDL 和 DML 的本质区别贯穿所有 SQL 数据库：

| 维度   | DDL（数据定义语言）                      | DML（数据操作语言）                       |
| ---- | -------------------------------- | --------------------------------- |
| 操作对象 | 结构：库、表、索引、视图                     | 内容：表里的数据行                         |
| 核心命令 | CREATE / ALTER / DROP / TRUNCATE | SELECT / INSERT / UPDATE / DELETE |
| 事务控制 | **隐式提交**，不可回滚                    | **受事务控制**，可 COMMIT / ROLLBACK     |
| 执行速度 | 极快（改系统表）                         | 较慢（数据校验、索引更新、加锁）                  |
| 权限需求 | 通常需要 DBA 权限                      | 普通开发/用户权限即可                       |

:::important
**实际开发中，严禁在同一个事务里混用 DML 和 DDL。** 因为 DDL 的隐式提交会把当前事务强行提交——你前面辛苦攒的未提交 DML 全部永久落盘，想 ROLLBACK 也来不及了。
:::

## 七、DML 数据操作：让数据流动起来

结构搭好了，接下来让数据进来、出去、改变。DML（Data Manipulation Language，数据操作语言）管的是「房子里的家具」。

### 插入：INSERT

```sql
-- 插入单条（数组推荐用 ARRAY[...] 语法）
INSERT INTO storage.files (owner_id, file_name, file_size, is_public, tags)
VALUES (1, '课程大纲.pdf', 1024576, true, ARRAY['教育', 'PDF']);

-- 批量插入（PG 对批量插入的优化极好）
INSERT INTO storage.files (owner_id, file_name, file_size, tags)
VALUES
    (1, 'demo.mp4', 50000000, ARRAY['视频', '测试']),
    (1, 'config.yaml', 1024, ARRAY['配置']);

-- 插入并立刻回显：RETURNING 子句（PG 特色，超好用）
INSERT INTO storage.files (owner_id, file_name, file_size)
VALUES (1, 'jeff的私房课.zip', 999999)
RETURNING id, file_id, created_at;   -- 返回刚生成的 ID、UUID 和创建时间
```

:::tip
`RETURNING` 是 PG 非常贴心的特性——在 MySQL 里，插入后要再查一次才能拿到自增 ID；PG 里一条语句直接返回。配合代码里的「插入 → 拿到 ID → 继续关联操作」流程，省一次查询。
:::

### 查询：SELECT

```sql
-- 基础条件查询
SELECT file_name, file_size, created_at
FROM storage.files
WHERE is_public = true AND file_size > 1000000;

-- 模糊查询
SELECT * FROM storage.files WHERE file_name LIKE '%.pdf';

-- 数组查询（PG 特色）：查找标签中包含「视频」的文件
SELECT * FROM storage.files WHERE '视频' = ANY(tags);
```

### 更新：UPDATE

```sql
-- 模拟下载次数自增（原子操作，不用担心并发）
UPDATE storage.files
SET download_count = download_count + 1
WHERE file_name = 'demo.mp4';

-- 修改多个字段 + 数组追加
UPDATE storage.files
SET is_public = false,
    tags = array_append(tags, '私有')   -- 数组末尾追加元素
WHERE file_id = '某个查询到的 UUID';
```

### 删除：DELETE

```sql
-- 删除指定文件
DELETE FROM storage.files WHERE file_id = '某个 UUID';

-- 删除所有下载次数为 0 且带「测试」标签的文件
-- 注意 @> 是数组包含操作符（下一篇详解）
DELETE FROM storage.files
WHERE download_count = 0 AND tags @> ARRAY['测试'];
```

:::warning
`UPDATE` 和 `DELETE` 不带 WHERE 就是「删库跑路」级别的事故。
:::

### 表继承：INHERITS

PG 相比于其他数据库的一大特点就是支持**表继承**。

```sql
-- 父表：所有文件的公共字段
CREATE TABLE storage.content (
    title  TEXT,
    author TEXT
);

-- 子表：继承父表所有字段，再加自己的字段
CREATE TABLE storage.video (
    duration INT          -- 视频特有字段
) INHERITS (storage.content);

-- 查询父表时，会【自动包含】所有子表的数据！
SELECT * FROM storage.content;
```

:::note
这个特性在 MySQL 里是不存在的。它解决了「如何优雅地建模 is-a 关系」的问题，但也有很多限制（约束不继承、外键限制等）。
:::

## 附录：疑惑深挖

### 深挖① DDL 与 DML 的本质区别

前面给了对比表，但「为什么 DDL 不能回滚」才是真正值得思考的问题。

#### 隐式提交的机制

DDL（如 `DROP TABLE`）执行时，PG 会**强制提交当前事务**。原因是：DDL 修改的是数据库的**系统目录（System Catalog）**——也就是「关于数据的元数据」。这些结构变更如果放在事务里回滚，会导致系统的结构状态和事务日志脱节，实现复杂度极高。

```sql
-- 这个事务里的 DML 会被 DDL 强制提交！
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE username = 'jeff';  -- 未提交
ALTER TABLE accounts ADD COLUMN remark TEXT;   -- 执行 DDL → 强提交！
ROLLBACK;  -- 没用了！UPDATE 已经落盘了
```

:::warning
**实际开发铁律：把 DDL 和 DML 分开。** 迁移工具（如 Flyway、Liquibase）会把结构变更脚本和数据变更脚本分开执行，正是这个原因。如果你在事务里发现「前面的 DML 莫名其妙的提交了」，先检查是不是混入了 DDL。
:::

#### DELETE vs TRUNCATE：一字之差，天壤之别

| 对比维度       | DELETE（DML）   | TRUNCATE（DDL）                |
| ---------- | ------------- | ---------------------------- |
| 可回滚        | ✅ 可以          | **PG 可以**，MySQL 不行           |
| 加 WHERE 条件 | ✅ 可以筛部分       | ❌ 只能全表清空                     |
| 锁粒度        | 行级锁           | 表级锁                          |
| 日志量        | 逐行记录，日志巨大     | 只记录页释放，日志极小                  |
| 触发器        | 触发 DELETE 触发器 | **不触发**触发器                   |
| 自增 ID      | 不重置           | 默认不重置，`RESTART IDENTITY` 才重置 |
| 执行速度       | 慢（千万级可能数小时）   | 极快（毫秒级）                      |

### 深挖② TRUNCATE 的跨库「潜规则」

**同样是 TRUNCATE，在不同数据库里的行为完全不同**。

| 数据库            | 事务回滚              | 外键约束影响            | 自增序列重置                       |
| -------------- | ----------------- | ----------------- | ---------------------------- |
| MySQL (InnoDB) | ❌ 不可回滚            | 有外键引用时报错          | ✅ 重置为 1                      |
| **PostgreSQL** | ✅ **可回滚**（可包在事务里） | 可用 `CASCADE` 级联截断 | ❌ 默认不重置，需 `RESTART IDENTITY` |
| SQL Server     | ❌ 不可回滚            | 被外键引用时报错          | ✅ 重置为初始值                     |
| Oracle         | ❌ 不可回滚（DDL 隐式提交）  | 被外键引用时报错          | ❌ 不重置，需手动 ALTER SEQUENCE     |

**为什么 PG 的 TRUNCATE 可以回滚？** 因为 PG 的 TRUNCATE 本质上是对表的「重新标记」——它修改的是表的存储信息（重新分配一个新的 relfilenode），这个操作被完整记录在 WAL 日志里，自然可以回滚。而 MySQL 的 TRUNCATE 直接重建表文件并隐式提交，回滚无从谈起。

**生产环境铁律**：

1. 对生产核心表执行 TRUNCATE 前，先 `RENAME` 旧表备份，观察业务无异常后再删
2. MySQL 有外键时 TRUNCATE 直接报错，只能 DELETE 或临时禁用外键检查（用完必须恢复）
3. 如果只是清空数据但要保留删除日志，必须用 DELETE 配合批量循环，不能用 TRUNCATE

### 深挖③ INHERITS 表继承：带着镣铐跳舞

表继承是 PG 独有的特性，用「父子表」来建模 is-a 关系。前面看到的基础用法之外，有几个关键限制必须知道：

| 限制          | 说明                          | 影响            |
| ----------- | --------------------------- | ------------- |
| 约束不继承       | 父表的主键、唯一约束、外键**不会**自动继承     | 无法通过父表保证全局唯一性 |
| 子表不能做外键引用目标 | 继承的子表不能作为外键的 REFERENCES 目标  | 强一致性场景受限      |
| 分区表限制       | 到 PG 17 为止，继承了其他表的表不能再做分区主表 | 继承和声明式分区互斥    |
| INSERT 不路由  | `INSERT` 只插入指定表，不会自动分发到子表   | 数据需要自己控制落表    |

#### ONLY 关键字：精确控制查询范围

```sql
-- 默认：查父表会包含所有子表数据（多态查询）
SELECT * FROM storage.content WHERE elevation > 500;

-- 只想查父表自身，不包含子表：用 ONLY
SELECT * FROM ONLY storage.content WHERE elevation > 500;
```

#### 何时该用 INHERITS？

- **多租户数据隔离**：每个租户一个子表，父表做统一查询
- **日志按时间分表**：子表按月/年拆分，父表统一查询

**但它不是银弹**：现代 PG 更推荐用**声明式分区（Declarative Partitioning）**——它解决了原生继承的大部分限制（约束继承、外键支持），是更成熟的选择。用一句话总结：**INHERITS 用得好是利器，用不好是镣铐，前提是清楚它的边界。**

## 结语：从「懂」到「会用」

回顾这一篇，我完成了三件事：把 PG 跑起来了、理解了数据库 → 模式 → 表的三级结构、亲手建出了一堆表。

和写 [数据库天花板——PostgreSQL](../编程生涯数据库天花板postgresql/) 时相比，最大的不同是：**原理是「知道」，实操是「体会」。** 比如「PG 的 DDL 能放进事务」这句话，只有自己执行过 TRUNCATE 再 ROLLBACK 救回数据，才能真正理解 MVCC 和 WAL 的意义。

***

**延伸阅读：**

- [数据库天花板——PostgreSQL](../编程生涯数据库天花板postgresql/) — 深入解析 PG 的索引体系与架构设计
- [数据库大盘点](../编程生涯数据库大盘点/) — OLTP、OLAP 与 HTAP 全景选型认知地图
- [数据库学习之路](../编程生涯数据库学习之路/) — 从 MySQL CRUD 开始的数据库入门之路
- [NoSQL数据库理论入门——Redis与MongoDB](../编程生涯nosql数据库理论入门redis与mongodb/) — Redis 与 MongoDB 的设计理念与适用场景
- [PostgreSQL再学习（二）](../编程生涯postgresql再学习二/) — 查询艺术进阶：操作符、函数与多表关联
- [PostgreSQL再学习（三）](../编程生涯postgresql再学习三/) — 事务、索引调优与扩展生态

