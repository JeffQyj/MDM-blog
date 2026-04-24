---

title: 独立项目：DM点餐系统
published: 2025-08-28
description: 基于 uni-app + Next.js + Supabase 的餐厅扫码点餐系统实战，涵盖小程序端扫码点餐、后台订单处理、菜品管理、实时状态推送等核心模块，融合鬼灭之刃水墨风格设计，记录全栈技术落地与业务闭环构建的完整过程。
tags: [uni-app, Next.js]
category: 独立项目
draft: false
lang: zh_CN
---

:::tip
2025 年 8 月，我完成了 DM点餐系统的开发。这是一款面向中小型餐厅的堂食扫码点餐系统，顾客微信扫码即可点餐，服务员在后厨实时接收订单。不同于外卖平台需要骑手配送，堂食点餐的核心是「效率」——减少顾客等待时间，让服务员专注于出餐而非记录。

技术栈上，我选用了 uni-app 开发小程序端（跨平台兼容）、Next.js 构建后台管理系统、Supabase 作为后端数据库（PostgreSQL + Realtime）。设计风格则融入了「鬼灭之刃」水墨美学——墨迹晕染、水波流动、火焰强调色，让点餐体验多了一层视觉惊喜。
:::

## 项目背景

### 业务场景与核心痛点

传统餐厅点餐流程存在明显的效率瓶颈：

| 环节 | 传统方式存在的问题  | 数字化后的改进        |
| -- | ---------- | -------------- |
| 点餐 | 服务员手记，容易出错 | 顾客自助扫码，订单直达后厨  |
| 传菜 | 手写字条或口头传达  | 实时推送，状态同步      |
| 结账 | 需要服务员核实账单  | 自助结账，支持多种支付方式  |
| 翻台 | 桌椅管理靠人工记忆  | 桌台状态可视化，提升翻台效率 |

DM点餐系统要解决的核心问题：**让顾客自己点餐，让服务员专注出餐**。

### 双端架构设计

系统由两个终端组成，共用同一套后端 API：

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                                │
├─────────────────────────────┬─────────────────────────────────┤
│      小程序端 (uni-app)       │      后台管理 (Next.js)           │
│  顾客扫码 → 选择菜品 → 提交订单    │  店长/收银员 → 管理菜品/订单/桌台    │
└─────────────────────────────┴─────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                       │
│                    统一后端服务 + 业务逻辑                     │
└─────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (PostgreSQL)                     │
│                    数据库 + Realtime 实时推送                  │
└─────────────────────────────────────────────────────────────┘
```

| 端    | 使用角色   | 核心功能                     |
| ---- | ------ | ------------------------ |
| 小程序端 | 顾客     | 扫码入口、菜单浏览、规格选择、购物车、订单管理  |
| 后台管理 | 店长/收银员 | 订单处理、菜品管理、桌台管理、员工管理、数据统计 |

:::note
这套架构和苍穹外卖有相似之处——都是「管理端 + 用户端」双端设计。但核心差异在于：苍穹外卖是「外卖」场景，涉及骑手配送、地址管理；DM点餐是「堂食」场景，核心是桌台管理和出餐效率。业务场景不同，技术实现重心也不同。
:::

### 核心功能模块一览

| 模块类型 | 主要功能             | 技术价值           |
| ---- | ---------------- | -------------- |
| 扫码入口 | 桌号识别、人数选择、订单入口   | 二维码 + 参数解析     |
| 菜单浏览 | 分类展示、搜索、售罄标识     | 分类缓存 + 实时库存    |
| 规格选择 | 规格（大中小）、辣度、数量选择  | 弹窗交互 + 状态管理    |
| 购物车  | 增删改、本地缓存         | Pinia 状态持久化    |
| 订单管理 | 提交、详情、取消、历史订单    | 状态机 + 事务控制     |
| 微信授权 | 静默登录、头像昵称获取      | 微信 openid 认证   |
| 订单处理 | 接单、完成、取消（后台）     | 状态流转 + 实时推送    |
| 数据统计 | 营业额趋势、热销菜品 Top10 | 聚合查询 + ECharts |

***

## 技术架构

### 为什么选择这个技术栈？

在做技术选型时，我对比了三种方案：

| 方案  | 小程序端    | 后台管理      | 后端          | 数据库        | 我的选择  |
| --- | ------- | --------- | ----------- | ---------- | ----- |
| 方案A | 原生小程序   | React管理后台 | Node.js     | MySQL      | 工作量大  |
| 方案B | uni-app | Vue3管理后台  | Spring Boot | PostgreSQL | 熟悉但冗余 |
| 方案C | uni-app | Next.js   | Next.js API | Supabase   | 简洁高效  |

**最终选择方案C的理由**：

1. **uni-app**：一次开发，输出微信/支付宝/H5多端小程序，学习成本低
2. **Next.js**：前后台统一技术栈，减少上下文切换，API Routes 直接作为后端
3. **Supabase**：PostgreSQL 数据库 + Realtime 实时推送开箱即用，无需自己搭建 WebSocket 服务

:::tip
Supabase 是我第一次在实战项目中使用。它本质上是「Firebase 的开源替代品」——提供数据库、认证、存储、实时订阅等能力。对于独立开发者来说，用 Supabase 可以省去大量后端基础设施的搭建时间，把精力放在业务逻辑上。
:::

### 技术架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         微信小程序 (uni-app)                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 扫码入口  │  │ 菜单浏览  │  │ 规格选择  │  │ 购物车   │  │ 订单管理  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│       └────────────┴────────────┴────────────┴────────────┘         │
│                                 │                                    │
│                    Supabase Client SDK                              │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │ HTTPS + JSON
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 认证模块  │  │ 菜品模块  │  │ 订单模块  │  │ 桌台模块  │  │ 统计模块  │   │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│       └────────────┴────────────┴────────────┴────────────┘         │
│                                 │                                    │
│                         Supabase SDK                                 │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Supabase                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  PostgreSQL   │  │   Realtime    │  │    Auth      │              │
│  │   数据库存储    │  │   实时订阅     │  │   微信认证     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         后台管理 (Next.js)                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│  │ 订单管理  │  │ 菜品管理  │  │ 桌台管理  │  │ 员工管理  │  │ 数据统计  │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 后端技术栈一览

| 架构层级   | 核心技术选型                          | 通俗比喻            |
| ------ | ------------------------------- | --------------- |
| 小程序端   | uni-app + Vue3 + Pinia          | 点餐机的触摸屏（顾客操作界面） |
| 后台前端   | Next.js 14 App Router + Zustand | 店长的电脑工作台        |
| 后端 API | Next.js API Routes              | 店里的中央控制系统       |
| 数据库    | PostgreSQL 15 (Supabase)        | 中央档案室（所有数据存储）   |
| 认证     | 微信静默登录 + JWT（后台）                | 顾客刷会员卡 + 员工工牌   |
| 文件存储   | 阿里云 OSS（菜品图片）                   | 云端图片仓库          |
| 实时通信   | Supabase Realtime               | 对讲机（即时双向通知）     |

:::note
「鬼灭之刃水墨风」是 DM点餐系统区别于其他点餐系统的特色设计。传统点餐系统的 UI 往往是「黑底白字」或「白底蓝字」的工控风格，DM点餐用墨、水波、火焰等元素构建视觉语言——深海墨做主色、水波蓝做辅助、烈焰橙做强调。顾客扫码点餐时，感受到的不是「冰冷的机器」，而是「有温度的体验」。
:::

***

## 数据库设计分析

### 七张核心数据表

DM点餐系统的数据库设计了 7 张核心表，支撑从用户到订单的完整业务链路：

```
users (小程序顾客)
    │
    └── 1:N ──▶ orders (订单主表)
                     │
                     └── 1:N ──▶ order_items (订单明细)
                                        │
tables (桌台) ──────────────────────────┘
    │
categories (菜品分类) ──▶ 1:N ──▶ dishes (菜品)
                                   │
employees (后台员工) ─────────────────┘
```

| 表名           | 说明               | 核心字段                            |
| ------------ | ---------------- | ------------------------------- |
| users        | 小程序顾客（微信 openid） | openid, nickname, avatar        |
| employees    | 后台员工（店长/收银员）     | username, password, role        |
| categories   | 菜品分类             | name, sort, icon                |
| dishes       | 菜品（规格/辣度/库存）     | name, price, stock, category    |
| tables       | 桌台（8个固定座位）       | table\_no, qr\_code, status     |
| orders       | 订单主表（状态流管理）      | order\_no, status, total\_price |
| order\_items | 订单明细（菜品快照）       | dish\_snapshot, quantity        |

### 设计特点解析

**1. UUID 主键 vs 自增 ID**

```sql
-- 传统方式：自增 ID
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,  -- 1, 2, 3, 4...
);

-- DM点餐：UUID 防枚举
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- '550e8400-e29b-41d4-a716-446655440000'
);
```

**为什么用 UUID？**

| 对比维度 | 自增 ID            | UUID           |
| ---- | ---------------- | -------------- |
| 安全性  | 暴露业务规模（如订单量）     | 无法推测           |
| 合并数据 | 多系统合并可能冲突        | 全球唯一，合并无忧      |
| 存储空间 | 8 字节             | 16 字节（稍大但可接受）  |
| 性能   | 插入性能高，BTREE 索引高效 | 插入略慢，但查询性能差异不大 |

**2. timestamptz 时间戳**

```sql
-- 错误示例：使用 timestamp 无时区
create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- '2025-08-28 10:30:00'

-- DM点餐：使用 timestamptz 带时区
create_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP  -- '2025-08-28 10:30:00+08:00'
```

**为什么用 timestamptz？**

时区问题是数据库里「隐藏的坑」——同样的时间，不同时区的人看到不同的数字。`TIMESTAMPTZ` 会自动存储 UTC 时间，查询时转换为客户端时区，保证「无论谁看，时间都是对的」。

**3. 订单明细的快照设计**

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- 关联订单
    order_id UUID NOT NULL REFERENCES orders(id),

    -- 菜品快照（关键！）
    -- 下单时存储当时的菜品信息，防止菜品改名/调价后历史订单异常
    dish_id UUID NOT NULL,              -- 原始菜品 ID（用于关联查询）
    dish_name VARCHAR(100) NOT NULL,    -- 菜品名称（快照）
    dish_price DECIMAL(10,2) NOT NULL,  -- 菜品单价（快照）
    dish_image VARCHAR(500),            -- 菜品图片（快照）

    -- 规格信息（jsonb 存储半结构化数据）
    spec VARCHAR(50),                    -- 规格：大/中/小
    spice_level VARCHAR(50),             -- 辣度：无辣/微辣/中辣/特辣

    -- 数量
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL     -- 小计金额
);
```

**为什么存储快照？**

想象一个场景：顾客点了「宫保鸡丁」，下单时 28 元。两个月后店家把价格改成 32 元，顾客查看历史订单——如果存的是「菜品 ID 引用」，现在显示的就是 32 元，历史数据就错乱了。快照设计让历史订单「定格」在下单时的状态。

**4. JSONB 存储半结构化数据**

```sql
-- 菜品表：规格价格使用 jsonb
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id),

    -- jsonb 存储多种规格的价格
    -- 例如：{"大": 38, "中": 28, "小": 18}
    spec_prices JSONB DEFAULT '{}',

    -- jsonb 存储辣度选项
    -- 例如：["无辣", "微辣", "中辣", "特辣"]
    spice_levels JSONB DEFAULT '[]',

    price DECIMAL(10,2) NOT NULL,       -- 默认规格价格
    stock INT NOT NULL DEFAULT 0,       -- 库存
    image VARCHAR(500),                  -- 主图
    description TEXT,                   -- 描述
    status SMALLINT DEFAULT 1,          -- 状态：1=上架 0=下架

    create_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

**为什么用 JSONB 而不是拆表？**

| 方案      | 适用场景         | DM点餐的选择          |
| ------- | ------------ | ---------------- |
| 拆表（规格表） | 规格固定、需要关联查询  | 规格数量固定3种，不需关联查询  |
| JSONB   | 规格不固定、半结构化数据 | 规格/辣度用 JSONB 更灵活 |

如果未来需要支持「更多自定义规格」，JSONB 方案无需修改表结构，直接改代码即可。

### 关键业务规则实现

**1. 订单状态流转**

```
pending（待处理）──▶ preparing（准备中）──▶ completed（已完成）
        │                   │
        │                   │
        └─────── 取消 ───────┘
        │
        └─────── 超时自动取消（15分钟）──────┘
```

**状态说明**：

| 状态码       | 状态名称 | 说明            | 可触发角色     |
| --------- | ---- | ------------- | --------- |
| pending   | 待处理  | 顾客已提交，等待服务员接单 | 顾客/系统（超时） |
| preparing | 准备中  | 服务员已接单，正在准备   | 后台服务员     |
| completed | 已完成  | 餐品准备完成，顾客已取餐  | 后台服务员     |
| cancelled | 已取消  | 订单取消          | 顾客/后台服务员  |

**2. 库存流程**

```
┌─────────────┐      下单       ┌─────────────┐
│   库存充足    │ ───────────▶  │   库存预扣    │
└─────────────┘               └─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
             ┌──────────┐   ┌──────────┐   ┌──────────┐
             │  顾客取餐   │   │  取消订单   │   │  超时未取  │
             │ 完成订单   │   │ 取消订单   │   │ 取消订单   │
             └─────┬────┘   └─────┬────┘   └─────┬────┘
                   │              │              │
                   ▼              ▼              ▼
            ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
            │  库存正式扣减  │  │  库存恢复    │  │  库存恢复    │
            └─────────────┘  └─────────────┘  └─────────────┘
```

**核心代码：下单预扣库存**

```typescript
// Next.js API Route: /api/orders/create
// 下单时的库存扣减逻辑
export async function POST(request: Request) {
    const supabase = createClient();

    // 1. 获取请求体（桌号、菜品列表）
    const { table_id, items } = await request.json();

    // 2. 开启事务（Supabase 的 RPC 调用实现事务）
    const { data: order, error: orderError } = await supabase.rpc('create_order_with_stock', {
        p_table_id: table_id,
        p_items: items
    });

    if (orderError) {
        // 库存不足或其他业务错误
        return Response.json({
            code: 20001,  // 业务错误码
            message: orderError.message,
            data: null
        }, { status: 400 });
    }

    return Response.json({
        code: 200,
        message: '订单创建成功',
        data: { order_id: order.id, order_no: order.order_no }
    });
}
```

**数据库函数：create\_order\_with\_stock**

```sql
-- PostgreSQL 函数：创建订单并预扣库存（原子操作）
CREATE OR REPLACE FUNCTION create_order_with_stock(
    p_table_id UUID,
    p_items JSONB
)
RETURNS TABLE(id UUID, order_no VARCHAR(20)) AS $$
DECLARE
    v_order_id UUID;
    v_order_no VARCHAR(20);
    v_item JSONB;
    v_dish_id UUID;
    v_quantity INT;
    v_current_stock INT;
BEGIN
    -- 生成订单编号：DM + YYYYMMDD + 3位序号
    v_order_no := 'DM' || TO_CHAR(NOW(), 'YYYYMMDD') ||
                  LPAD(NEXTVAL('order_seq')::TEXT, 3, '0');

    -- 创建订单主表记录
    INSERT INTO orders (table_id, order_no, status, total_price)
    VALUES (p_table_id, v_order_no, 'pending', 0)
    RETURNING id INTO v_order_id;

    -- 遍历订单明细
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_dish_id := (v_item->>'dish_id')::UUID;
        v_quantity := (v_item->>'quantity')::INT;

        -- 行锁查询库存（FOR UPDATE 防止并发）
        SELECT stock INTO v_current_stock
        FROM dishes
        WHERE id = v_dish_id
        FOR UPDATE;

        -- 检查库存是否充足
        IF v_current_stock < v_quantity THEN
            RAISE EXCEPTION '库存不足：菜品 % 需要 %，剩余 %',
                v_dish_id, v_quantity, v_current_stock;
        END IF;

        -- 预扣库存（库存减少）
        UPDATE dishes
        SET stock = stock - v_quantity
        WHERE id = v_dish_id;

        -- 创建订单明细（快照菜品信息）
        INSERT INTO order_items (
            order_id, dish_id, dish_name, dish_price,
            spec, spice_level, quantity, subtotal
        ) VALUES (
            v_order_id,
            v_dish_id,
            v_item->>'dish_name',
            (v_item->>'dish_price')::DECIMAL,
            v_item->>'spec',
            v_item->>'spice_level',
            v_quantity,
            (v_item->>'dish_price')::DECIMAL * v_quantity
        );
    END LOOP;

    -- 计算订单总金额
    UPDATE orders
    SET total_price = (
        SELECT SUM(subtotal) FROM order_items WHERE order_id = v_order_id
    )
    WHERE id = v_order_id;

    RETURN QUERY SELECT v_order_id, v_order_no;
END;
$$ LANGUAGE plpgsql;
```

**为什么要用行锁（FOR UPDATE）？**

想象抢票场景：只剩最后一张票，100 个人同时下单。如果没有锁：

```
时间线：
T1: 顾客A 查询库存 = 1 ✓
T2: 顾客B 查询库存 = 1 ✓  （两个请求同时读到库存为1）
T3: 顾客A 扣减库存 = 0 ✓
T4: 顾客B 扣减库存 = -1 ✗  （超卖！库存变成负数）
```

有了 `FOR UPDATE` 行锁：

```
时间线：
T1: 顾客A 获取行锁，查询库存 = 1 ✓
T2: 顾客B 等待行锁...
T3: 顾客A 扣减库存 = 0，释放锁 ✓
T4: 顾客B 获取行锁，查询库存 = 0 ✗  （库存不足，直接拒绝）
```

**3. 超时自动取消订单**

```typescript
// Next.js API Route: /api/cron/cancel-timeout-orders
// 定时任务：检查并取消超时未处理的订单

export async function POST(request: Request) {
    const supabase = createClient();

    // 1. 查询超时的 pending 订单（15分钟未处理）
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: timeoutOrders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('status', 'pending')
        .lt('create_time', fifteenMinutesAgo);

    if (error) {
        return Response.json({ code: 500, message: '查询超时订单失败' });
    }

    // 2. 逐个取消订单，恢复库存
    for (const order of timeoutOrders) {
        await supabase.rpc('cancel_order_and_restore_stock', {
            p_order_id: order.id
        });
    }

    return Response.json({
        code: 200,
        message: `已取消 ${timeoutOrders.length} 个超时订单`
    });
}
```

```sql
-- PostgreSQL 函数：取消订单并恢复库存
CREATE OR REPLACE FUNCTION cancel_order_and_restore_stock(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 更新订单状态为取消
    UPDATE orders
    SET status = 'cancelled', update_time = NOW()
    WHERE id = p_order_id;

    -- 恢复库存
    UPDATE dishes d
    SET stock = stock + oi.quantity
    FROM order_items oi
    WHERE oi.order_id = p_order_id
      AND d.id = oi.dish_id;
END;
$$ LANGUAGE plpgsql;
```

:::note
Supabase 的 `rpc` 函数调用可以实现「类事务」能力——把所有操作放在一个数据库函数里，要么全部成功，要么全部回滚。这种「数据库层事务」比「应用层事务」更高效，因为减少了网络往返。
:::

***

## 核心功能模块实战

### 模块一：小程序端 — 扫码点餐流程

#### 扫码入口：解析桌号

顾客用微信扫描桌上的二维码，格式为：`https://dm.example.com/?table=xxx`

```typescript
// uni-app 页面：pages/index/index.vue
// 首页 onLoad 生命周期处理扫码参数

onLoad(options: { table?: string }) {
    // 1. 获取桌号参数
    const tableNo = options.table;

    if (!tableNo) {
        // 没有桌号参数，提示用户扫码
        uni.showModal({
            title: '提示',
            content: '请扫描桌上的二维码进行点餐',
            showCancel: false
        });
        return;
    }

    // 2. 验证桌号有效性
    this.verifyTable(tableNo);
},

async verifyTable(tableNo: string) {
    const supabase = createClient();

    // 查询桌台信息
    const { data: table, error } = await supabase
        .from('tables')
        .select('*, categories(name)')
        .eq('table_no', tableNo)
        .eq('status', 'available')  // 必须是可用状态
        .single();

    if (error || !table) {
        uni.showToast({
            title: '桌台不存在或不可用',
            icon: 'error'
        });
        return;
    }

    // 3. 保存桌号到全局状态
    const orderStore = useOrderStore();
    orderStore.setTable(table);

    // 4. 跳转到菜单页
    uni.navigateTo({
        url: `/pages/menu/index?table=${tableNo}`
    });
}
```

**二维码生成规则**（后台管理端）：

| 桌号  | 二维码内容                              |
| --- | ---------------------------------- |
| 01  | `https://dm.example.com/?table=01` |
| 02  | `https://dm.example.com/?table=02` |
| ... | ...                                |

商家可以在后台「桌台管理」页面下载每个桌台对应的二维码，打印后贴在桌上。

#### 菜单浏览：分类展示 + 实时库存

```typescript
// uni-app 页面：pages/menu/index.vue
// 菜单页：展示分类和菜品列表

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://xxx.supabase.co',
    'public-anon-key'
);

// 分类列表
const categories = ref<Category[]>([]);

// 当前选中的分类
const activeCategory = ref<string>('');

// 菜品列表
const dishes = ref<Dish[]>([]);

// 加载状态
const loading = ref(true);

// 计算当前分类的菜品
const filteredDishes = computed(() => {
    if (!activeCategory.value) return dishes.value;
    return dishes.value.filter(d => d.category_id === activeCategory.value);
});

onMounted(async () => {
    // 1. 加载分类（按 sort 排序）
    const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 1)
        .order('sort', { ascending: true });

    categories.value = cats || [];

    // 默认选中第一个分类
    if (cats && cats.length > 0) {
        activeCategory.value = cats[0].id;
    }

    // 2. 加载菜品
    const { data: ds } = await supabase
        .from('dishes')
        .select('*')
        .eq('status', 1)  // 上架状态
        .order('name');

    dishes.value = ds || [];
    loading.value = false;
});

// 选择分类
function selectCategory(catId: string) {
    activeCategory.value = catId;
}

// 添加到购物车
function addToCart(dish: Dish) {
    const orderStore = useOrderStore();
    orderStore.addItem({
        dish_id: dish.id,
        dish_name: dish.name,
        dish_price: dish.price,
        spec: null,
        spice_level: null,
        quantity: 1
    });

    uni.showToast({
        title: '已加入购物车',
        icon: 'success'
    });
}
</script>

<template>
    <view class="menu-container">
        <!-- 左侧分类栏 -->
        <scroll-view class="category-sidebar" scroll-y>
            <view
                v-for="cat in categories"
                :key="cat.id"
                :class="['category-item', { active: activeCategory === cat.id }]"
                @tap="selectCategory(cat.id)">
                {{ cat.name }}
            </view>
        </scroll-view>

        <!-- 右侧菜品列表 -->
        <scroll-view class="dish-list" scroll-y>
            <view
                v-for="dish in filteredDishes"
                :key="dish.id"
                class="dish-card">
                <image class="dish-image" :src="dish.image" mode="aspectFill" />
                <view class="dish-info">
                    <text class="dish-name">{{ dish.name }}</text>
                    <text class="dish-desc">{{ dish.description }}</text>
                    <view class="dish-footer">
                        <text class="dish-price">¥{{ dish.price }}</text>
                        <view v-if="dish.stock === 0" class="sold-out">售罄</view>
                        <view v-else class="add-btn" @tap="addToCart(dish)">+</view>
                    </view>
                </view>
            </view>
        </scroll-view>

        <!-- 购物车悬浮栏 -->
        <view class="cart-bar">
            <view class="cart-info">
                <text class="cart-count">共 {{ cartCount }} 件</text>
                <text class="cart-total">¥{{ cartTotal }}</text>
            </view>
            <view class="cart-btn" @tap="goToCart">去购物车</view>
        </view>
    </view>
</template>
```

#### 规格选择：弹窗交互

```typescript
// uni-app 组件：components/spec-selector/index.vue
// 规格选择弹窗

<script setup lang="ts">
import { ref, reactive } from 'vue';

const props = defineProps<{
    visible: boolean;
    dish: Dish | null;
}>();

const emit = defineEmits(['close', 'confirm']);

// 选择的规格
const selectedSpec = ref<string>('中');
const selectedSpice = ref<string>('无辣');
const quantity = ref(1);

// 可选规格
const specOptions = ['大', '中', '小'];
const spiceOptions = ['无辣', '微辣', '中辣', '特辣'];

// 规格价格映射
const specPrices = computed(() => {
    if (!props.dish?.spec_prices) return { '大': 0, '中': 0, '小': 0 };
    return props.dish.spec_prices as Record<string, number>;
});

// 计算当前价格
const currentPrice = computed(() => {
    const basePrice = props.dish?.price || 0;
    const specExtra = specPrices.value[selectedSpec.value] || 0;
    return (basePrice + specExtra) * quantity.value;
});

function increase() {
    quantity.value++;
}

function decrease() {
    if (quantity.value > 1) {
        quantity.value--;
    }
}

function confirm() {
    emit('confirm', {
        spec: selectedSpec.value,
        spice_level: selectedSpice.value,
        quantity: quantity.value,
        price: currentPrice.value
    });
}
</script>

<template>
    <uni-popup v-if="visible" :show="visible" type="center" @close="emit('close')">
        <view class="spec-popup">
            <view class="popup-header">
                <text class="dish-name">{{ dish?.name }}</text>
                <text class="close-btn" @tap="emit('close')">×</text>
            </view>

            <!-- 规格选择 -->
            <view class="spec-section">
                <text class="section-title">规格</text>
                <view class="spec-options">
                    <view
                        v-for="spec in specOptions"
                        :key="spec"
                        :class="['spec-btn', { active: selectedSpec === spec }]"
                        @tap="selectedSpec = spec">
                        {{ spec }}
                        <text v-if="specPrices[spec]" class="spec-price">
                            +¥{{ specPrices[spec] }}
                        </text>
                    </view>
                </view>
            </view>

            <!-- 辣度选择 -->
            <view class="spec-section">
                <text class="section-title">辣度</text>
                <view class="spec-options">
                    <view
                        v-for="spice in spiceOptions"
                        :key="spice"
                        :class="['spec-btn', { active: selectedSpice === spice }]"
                        @tap="selectedSpice = spice">
                        {{ spice }}
                    </view>
                </view>
            </view>

            <!-- 数量选择 -->
            <view class="quantity-section">
                <text class="section-title">数量</text>
                <view class="quantity-control">
                    <view class="qty-btn" @tap="decrease">-</view>
                    <text class="qty-num">{{ quantity }}</text>
                    <view class="qty-btn" @tap="increase">+</view>
                </view>
            </view>

            <!-- 确认按钮 -->
            <view class="confirm-btn" @tap="confirm">
                加入购物车 · ¥{{ currentPrice }}
            </view>
        </view>
    </uni-popup>
</template>
```

### 模块二：后台管理 — 订单实时处理

#### Supabase Realtime 实时订阅

后台管理端最核心的功能是「实时接收新订单」——顾客下单后，后台页面无需刷新，自动弹出新订单提醒。这依赖 Supabase 的 Realtime 能力：

```typescript
// Next.js 后台管理：app/admin/orders/page.tsx
// 订单列表页 - 使用 Realtime 订阅订单变化

'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [audio] = useState(() => new Audio('/notification.mp3')); // 提示音

    useEffect(() => {
        // 1. 初始加载：获取最近的订单
        async function loadOrders() {
            const { data } = await supabase
                .from('orders')
                .select('*, tables(table_no), order_items(*)')
                .order('create_time', { ascending: false })
                .limit(50);

            setOrders(data || []);
        }

        loadOrders();

        // 2. Realtime 订阅：监听新订单
        const subscription = supabase
            .channel('orders-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',  // 监听新增（INSERT）
                    schema: 'public',
                    table: 'orders',
                    filter: 'status=eq.pending'  // 只监听待处理订单
                },
                (payload) => {
                    // 3. 新订单来了！
                    const newOrder = payload.new as Order;

                    // 播放提示音
                    audio.play();

                    // 4. 在列表顶部插入新订单
                    setOrders(prev => [newOrder, ...prev]);

                    // 5. 浏览器通知
                    if (Notification.permission === 'granted') {
                        new Notification('新订单来了！', {
                            body: `桌号 ${newOrder.table_no} 有一笔新订单`,
                            icon: '/icon.png'
                        });
                    }

                    // 6. 页面标题闪烁提示
                    document.title = `🔔 新订单 - DM点餐`;
                    setTimeout(() => {
                        document.title = 'DM点餐 - 订单管理';
                    }, 5000);
                }
            )
            .subscribe();

        // 清理订阅
        return () => {
            subscription.unsubscribe();
        };
    }, [audio]);

    // 接单操作
    async function acceptOrder(orderId: string) {
        await supabase
            .from('orders')
            .update({ status: 'preparing' })
            .eq('id', orderId);

        // 更新本地状态
        setOrders(prev =>
            prev.map(o =>
                o.id === orderId ? { ...o, status: 'preparing' } : o
            )
        );
    }

    // 完成订单操作
    async function completeOrder(orderId: string) {
        await supabase
            .from('orders')
            .update({ status: 'completed' })
            .eq('id', orderId);

        setOrders(prev =>
            prev.map(o =>
                o.id === orderId ? { ...o, status: 'completed' } : o
            )
        );
    }

    return (
        <div className="orders-page">
            <h1>订单管理</h1>

            {/* 订单状态筛选 */}
            <div className="status-tabs">
                {['全部', '待处理', '准备中', '已完成'].map(status => (
                    <button key={status}>{status}</button>
                ))}
            </div>

            {/* 订单列表 */}
            <div className="orders-list">
                {orders.map(order => (
                    <div key={order.id} className={`order-card ${order.status}`}>
                        <div className="order-header">
                            <span className="table-no">桌号 {order.tables?.table_no}</span>
                            <span className={`status-badge ${order.status}`}>
                                {order.status === 'pending' ? '待处理' :
                                 order.status === 'preparing' ? '准备中' : '已完成'}
                            </span>
                        </div>

                        <div className="order-items">
                            {order.order_items?.map(item => (
                                <div key={item.id} className="item-row">
                                    <span>{item.dish_name}</span>
                                    <span>x{item.quantity}</span>
                                    <span>¥{item.subtotal}</span>
                                </div>
                            ))}
                        </div>

                        <div className="order-footer">
                            <span className="order-time">
                                {new Date(order.create_time).toLocaleString()}
                            </span>

                            {order.status === 'pending' && (
                                <button onClick={() => acceptOrder(order.id)}>
                                    接单
                                </button>
                            )}
                            {order.status === 'preparing' && (
                                <button onClick={() => completeOrder(order.id)}>
                                    完成
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

**Realtime 工作原理**：

```
┌──────────────┐         WebSocket          ┌──────────────┐
│   小程序端     │ ◀────── 实时推送 ────────▶ │   Supabase    │
│  提交订单      │                           │   Realtime    │
└──────────────┘                           └──────────────┘
                                                │
                                                │ postgres_changes
                                                ▼
                                        ┌──────────────┐
                                        │  PostgreSQL   │
                                        │   orders 表   │
                                        └──────────────┘
                                                │
                                                │ 监听 INSERT
                                                ▼
                                        ┌──────────────┐
                                        │ 后台管理页面   │
                                        │ 自动更新列表   │
                                        └──────────────┘
```

:::tip
Supabase Realtime 的原理是监听 PostgreSQL 的 WAL（Write-Ahead Logging）日志。当有新的 INSERT/UPDATE/DELETE 时，Supabase 通过 WebSocket 推送给所有订阅的客户端。这比传统轮询高效得多——有新订单才推送，没有新订单时不浪费带宽。
:::

***

## 项目亮点与踩坑实录

### 亮点一：鬼灭之刃水墨风 UI 设计

DM点餐系统最大的特色是「鬼灭之刃」主题风格设计。这不是简单的换皮肤，而是从品牌定位出发的整体视觉语言：

| 设计元素 | 应用场景      | 视觉呈现        |
| ---- | --------- | ----------- |
| 深海墨  | 主色调、背景色   | #1a1a2e 深邃感 |
| 水波蓝  | 辅助色、分类标签  | #4a90a4 流动感 |
| 烈焰橙  | 强调色、按钮、警示 | #ff6b35 热度感 |
| 宣纸白  | 文字、卡片背景   | #f5f0e8 质感  |
| 墨迹晕染 | 按钮悬停动效    | 渐变 + 模糊过渡   |
| 水波扩散 | 订单完成反馈    | 中心扩散动画      |

**实现示例：水波扩散动画**

```css
/* globals.css - 水波扩散动画 */
@keyframes water-ripple {
    0% {
        transform: scale(0);
        opacity: 0.6;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

.order-success .ripple {
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(74, 144, 164, 0.4) 0%, transparent 70%);
    animation: water-ripple 1s ease-out forwards;
}
```

```tsx
// uni-app 组件：components/order-success/index.vue
// 订单提交成功动效

export default defineComponent({
    setup() {
        const showRipple = ref(false);

        function onOrderSuccess() {
            // 触发水波扩散动画
            showRipple.value = true;

            setTimeout(() => {
                showRipple.value = false;
            }, 1000);
        }

        return { showRipple };
    }
});
```

```vue
<template>
    <view class="order-success">
        <view class="content">
            <text class="title">订单提交成功</text>
            <text class="subtitle">请等待服务员接单</text>
        </view>

        <!-- 水波扩散效果 -->
        <view v-if="showRipple" class="ripple-container">
            <view class="ripple"></view>
            <view class="ripple" style="animation-delay: 0.3s"></view>
            <view class="ripple" style="animation-delay: 0.6s"></view>
        </view>
    </view>
</template>
```

### 亮点二：数据库行锁解决并发超卖

这是技术上的核心亮点，在「数据库设计分析」章节已经详细讲解。核心思想是：

1. **下单预扣库存**：减少数据库库存，而不是等到支付成功
2. **FOR UPDATE 行锁**：并发时排队，而不是超卖
3. **事务保证原子性**：扣库存 + 创建订单要么都成功，要么都回滚

### 踩坑实录：Supabase Realtime 连接中断

#### 问题现象

在实际运营中发现一个问题：后台管理页面长时间打开后，新订单的实时推送会「断掉」——顾客下了新订单，但后台页面没有反应。

#### 根因分析

Supabase Realtime 基于 WebSocket 长连接，长时间不活动会被中间设备（路由器、Nginx、防火墙）断开：

```
时间线：
T0: 后台页面打开，建立 WebSocket 连接 ✓
T1: 正常使用中，连接保持 ✓
T2: 后台页面闲置（如去吃饭），连接可能断开 ✗
T3: 顾客下单，但后台页面没收到推送 ✗
T4: 后台人员发现订单「消失」了... ✗✗✗
```

#### 解决方案

**方案一：心跳保活（推荐）**

```typescript
useEffect(() => {
    const subscription = supabase
        .channel('orders-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
            handleNewOrder)
        .subscribe();

    // 心跳：每 30 秒发送一次 ping，保持连接活跃
    const heartbeat = setInterval(() => {
        subscription.send({
            type: 'broadcast',
            event: 'ping'
        });
    }, 30000);

    return () => {
        clearInterval(heartbeat);
        subscription.unsubscribe();
    };
}, []);
```

**方案二：降级轮询**

当 Realtime 断开时，自动切换到 HTTP 轮询：

```typescript
// 监听连接状态
supabase.channel('orders-channel').on('system', { event: ' disconnected' }, () => {
    console.warn('Realtime 连接断开，启用轮询降级');

    // 启动轮询：每 5 秒查询一次
    const polling = setInterval(async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('status', 'pending')
            .gt('create_time', lastFetchTime);

        if (data && data.length > 0) {
            data.forEach(handleNewOrder);
            lastFetchTime = new Date().toISOString();
        }
    }, 5000);

    // 监听重连
    supabase.channel('orders-channel').on('system', { event: 'connected' }, () => {
        console.log('Realtime 已恢复，停止轮询');
        clearInterval(polling);
    });
});
```

#### 经验总结

| 经验点   | 说明                            |
| ----- | ----------------------------- |
| 实时不可靠 | WebSocket 可能断开，不能 100% 依赖实时推送 |
| 降级方案  | 实时 + 轮询双保险，确保不丢单              |
| 心跳保活  | 定期发送心跳，防止中间设备断开连接             |
| 重连机制  | 监听系统事件，断开自动重连                 |

:::note
这个坑让我理解了一个重要的架构原则：**任何外部依赖都不可靠**。Realtime 再强大，也有可能断开。好的系统要能「优雅降级」——当实时不可用时，轮询作为保底方案继续工作。
:::

***

## 项目总结

### 技术成长

| 技术维度     | 掌握内容                                    | 深入程度  |
| -------- | --------------------------------------- | ----- |
| uni-app  | 跨平台小程序开发、组件封装、状态管理                      | ★★★★☆ |
| Next.js  | App Router、API Routes、Server Components | ★★★★☆ |
| Supabase | PostgreSQL、Realtime、Auth、Storage        | ★★★☆☆ |
| 微信开发     | openid 静默登录、二维码参数解析                     | ★★★☆☆ |
| 状态机设计    | 订单状态流转、超时取消逻辑                           | ★★★★☆ |
| 并发控制     | 数据库行锁、事务控制、防超卖方案                        | ★★★☆☆ |
| UI/UX 设计 | 水墨风设计语言、动效实现、品牌化思维                      | ★★★☆☆ |

### 与苍穹外卖的技术对比

| 对比维度 | 苍穹外卖（2024.05）   | DM点餐（2025.08）         |
| ---- | --------------- | --------------------- |
| 架构   | Spring Boot 单体  | Next.js 全栈            |
| 小程序端 | 微信原生开发          | uni-app 跨平台           |
| 数据库  | MySQL           | PostgreSQL (Supabase) |
| 实时通信 | WebSocket（自己实现） | Supabase Realtime     |
| 支付   | 微信支付（真实对接）      | 堂食暂不需要支付              |
| 状态机  | 订单状态 + 支付状态     | 订单状态（简化版）             |
| 设计风格 | 标准后台管理风格        | 鬼灭之刃水墨风               |

### 核心收获

1. **全栈思维的重要性**

   DM点餐是我第一个「真正全栈」的项目——从前端小程序到后端 API 再到数据库，都是自己完成的。这种「端到端」的开发经历让我理解了一个道理：**好的全栈工程师，不是每个层都会一点，而是能站在全局思考系统设计**。
2. **业务理解驱动技术选型**

   为什么用 Supabase 而不是自己搭后端？因为堂食点餐的核心是「快速落地」，不需要复杂的微服务架构。为什么用 uni-app？因为需要同时支持微信、支付宝多端。**技术选型应该由业务需求驱动，而不是相反**。
3. **设计语言是产品的灵魂**

   「鬼灭之刃水墨风」不是花架子，它是 DM点餐的差异化竞争力。同样是点餐系统，顾客为什么选 DM点？可能仅仅是因为「扫码点餐的时候，感觉很有意思」。**产品设计的本质是创造情感连接**。

:::note
DM点餐系统还有很多可以完善的地方：支付功能还未接入、员工权限管理还在规划中、还没有数据分析报表。但核心的点餐流程已经跑通，这是一个「MVP（最小可行产品）」该有的样子——先跑通核心链路，再逐步迭代。工程思维不是「一步到位」，而是「小步快跑」。
:::

***

*DM点餐系统完成于 2025 年 8 月，是首次独立完成「小程序 + 后台管理 + 数据库」的全栈项目。从苍穹外卖的 Spring Boot 单体，到 DM点餐的 Next.js 全栈，每一次技术选择都在拓宽对「软件工程」的理解。*

*技术是工具，产品是载体，而用户体验，才是最终的评判标准。*
