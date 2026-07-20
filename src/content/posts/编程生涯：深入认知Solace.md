---
title: 编程生涯：深入认知Solace
published: 2026-07-20
description: 从Event Portal设计治理、Insights运维可观测到Java四套API深度解析与Agent Mesh事件驱动AI编排，本文带你从「会用Solace做消息收发」迈向「能设计Solace事件驱动平台」。
tags: [Solace, 事件驱动架构, Java API, Event Portal, Solace Agent Mesh]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
如果说上篇 [《企业级消息中间件Solace》](../编程生涯企业级消息中间件solace/) 回答的是「Solace 是什么、能做什么」，那这篇回答的就是「**Solace 的平台能力到底有多深、作为 Java 开发者怎么用好它**」。
:::

## 一、前情回顾：Solace 解决了什么

| 认知维度                     | 核心内容                                                 |
| ------------------------ | ---------------------------------------------------- |
| **Solace 定位**            | 多协议事件代理，金融硬件起家，企业级「隐形冠军」                             |
| **与竞品关系**                | Kafka=仓库（存储优先），RabbitMQ=分拣中心（协议优先），Solace=物流网络（路由优先） |
| **Event Broker**         | 核心是路由引擎而非存储，Direct 模式 127μs 延迟                       |
| **Message VPN**          | 多租户逻辑隔离，Standard 版仅 1 个 VPN，Enterprise 版可创建多个        |
| **层级化 Topic**            | `/` 分层 + `*`（单层匹配）+ `>`（多层末尾匹配），无需反序列化消息体即可路由        |
| **Direct vs Guaranteed** | 直连=高性能可丢，保证=持久化可靠，选型本质是速度与安全的取舍                      |
| **多协议互通**                | 内部统一 SMF 格式，JMS/AMQP/MQTT/REST/WebSocket 等协议一键互转     |
| **Event Mesh + DMR**     | 订阅感知的智能路由，只转发有人订阅的消息，跨云跨地域自动分发                       |
| **高可用与安全**               | 主备/集群模式，TLS/OAuth2/LDAP/ACL/审计日志全栈覆盖                 |

:::note
上篇文章的完整展开见 [编程生涯：企业级消息中间件Solace](../编程生涯企业级消息中间件solace/)。本文所有内容均以上述认知为前提，不再复述基础概念。
:::

## 二、Solace 平台全景速览——9 大模块一览

在深入各模块之前，先对整个 Solace Platform 的功能版图有个全局印象。Solace 以**实时事件流**为核心，平台能力分为 9 大模块，逻辑上按三层组织：

```text
┌─────────────────────────────────────────────────────┐
│                  应用服务层 (Application Services)    │
│   微集成 (Micro-Integrations)  │  Agent Mesh 代理网格  │
├─────────────────────────────────────────────────────┤
│                  事件网格层 (Event Mesh)              │
│   事件代理 (Brokers) │ 智能主题架构 │ DMR 动态消息路由   │
├─────────────────────────────────────────────────────┤
│                  平台服务层 (Platform Services)       │
│  Event Portal │ Insights │ Schema Registry │ 开发者工具│
└─────────────────────────────────────────────────────┘
```

| 模块                           | 核心定位                      | 所属层次  |
| ---------------------------- | ------------------------- | ----- |
| **Event Brokers**            | 消息传输核心中间件，三种交付形态（云/软件/硬件） | 事件网格层 |
| **Smart Topic Architecture** | 基于主题元数据实现智能路由，无需解码消息体     | 事件网格层 |
| **Micro-Integrations**       | 轻量级集成组件，将遗留系统接入事件分发层      | 应用服务层 |
| **Solace Event Portal**      | EDA 设计与治理中心，覆盖架构全生命周期     | 平台服务层 |
| **Solace Insights**          | 集中式监控服务，统一呈现可用性与运行指标      | 平台服务层 |
| **Solace Agent Mesh**        | 事件驱动的 AI 代理编排框架           | 应用服务层 |
| **Solace Cloud Console**     | 统一管理入口，「单一界面」管控平台         | 平台服务层 |
| **Developer Tools**          | 多语言/多协议/多平台的开发工具集         | 平台服务层 |
| **Schema Registry**          | 数据结构解耦与版本管理               | 平台服务层 |

这 9 个模块中，Event Brokers、Topic 架构、DMR 在上篇已有详细展开，本篇将深入余下模块——**从设计（Event Portal）到运维（Insights），从 AI 编排（Agent Mesh）到开发落地（Java API）**。

***

## 三、Event Portal——EDA 的设计与治理中枢

理解完平台全景后，第一个要深入的是 Event Portal。为什么把它放在最前面？因为**企业级项目中，架构设计阶段的决策直接决定了后续开发、运维的复杂度**。Event Portal 就是做这件事的工具。

### 3.1 Event Portal 是什么

**Event Portal（事件门户）** 是 Solace 基于云的事件管理工具，是事件驱动架构（EDA）的设计、治理、管控核心入口。你可以把它理解为 **EDA 的「蓝图编辑器 + 资产目录 + 运行时管控台」** 三合一。

它的核心价值在于降低 EDA 开发部署门槛、提升跨团队协作效率、强化架构治理能力。

:::tip
如果说 Event Broker 是 EDA 的「高速公路」，那 Event Portal 就是「城市规划局」——修路之前先做好规划，避免日后到处挖路补路。
:::

### 3.2 六大核心功能模块

Event Portal 包含 6 个功能模块，覆盖 EDA 从设计到运行的全生命周期：

| 模块                           | 定位    | 干了什么                                        |
| ---------------------------- | ----- | ------------------------------------------- |
| **Overview 概述**              | 认知入口  | 全局介绍 Event Portal 能力，帮助理解如何支撑 EDA 的设计与资产发现  |
| **Designer 设计师**             | 设计核心  | 可视化创建/更新架构设计所需的所有对象，完成 EDA 的可视化设计           |
| **Catalog 目录**               | 资产仓库  | 组织级事件资产库，可检索企业内所有应用、事件及其他 EDA 对象            |
| **Runtime Event Manager**    | 运行时管控 | 基于 Designer 设计对象 + 代理运行时数据，完成线上 EDA 架构建模与管控 |
| **KPI Dashboard**            | 量化度量  | 呈现事件使用指标与运行数据，量化 EDA 的运行状态与业务价值             |
| **Event Broker Connections** | 连接管理  | 建立 Event Portal 与生产环境代理的连接，实现配置下发与运行时数据同步   |

这 6 个模块的协作流程可以抽象为：

```text
设计阶段（Designer） → 发布到目录（Catalog） → 部署配置（Broker Connections）
                                                      ↓
运行时管控（Runtime Event Manager） → 监控度量（KPI Dashboard）
```

一个典型的工作流是这样：

1. **架构师**在 Designer 中定义事件主题结构、应用边界、事件模式
2. 设计完成后发布到 **Catalog**，供全团队检索和复用
3. 通过 **Broker Connections** 将配置下发到生产环境的事件代理
4. **Runtime Event Manager** 持续同步运行时数据，呈现线上真实的 EDA 架构
5. **KPI Dashboard** 量化运行指标，验证设计是否达到预期

***

## 四、Solace Insights——运维可观测体系

Event Portal 帮我们把架构设计清楚了，但设计再好，线上跑起来之后的监控也不能少。**Solace Insights** 就是 Solace 给出的统一监控答案。

### 4.1 Insights 是什么

**Insights（洞察）** 是 Solace 的一站式集中监控服务，用于保障事件代理与事件网格基础设施的业务可用性。它底层基于 Datadog 实现指标与日志存储，向上提供可视化的仪表盘和告警能力。

:::caution
Insights 不是要替换企业现有的监控系统（如 Prometheus + Grafana、ELK 等），而是作为**补充**——它开箱即用地提供了 Solace 专属的最佳实践监控项，企业现有的监控体系不需要做任何改动就可以并行使用。
:::

### 4.2 七大监控维度

Insights 可集中呈现以下全维度运行状态：

1. **资源使用情况**：CPU、内存、磁盘 I/O
2. **事件网格整体健康度**：所有代理节点的连通性与状态
3. **消息流流转状态**：消息生产/消费速率、积压情况
4. **高可用（HA）状态**：主备节点同步状态、切换记录
5. **队列、主题端点、RDP、桥接的健康状态**：各端点的运行健康度
6. **消息假脱机（Spool）利用率**：持久化存储的使用情况
7. **容量利用率**：连接数、主题数、队列数等容量指标

### 4.3 三层仪表盘架构

Insights 的监控数据流如下：

```text
事件代理 → 产生指标/监控项/日志数据
                ↓
中央监控服务（基于 Datadog）→ 统一收集与存储
                ↓
    ┌───────────┼───────────┐
    ↓           ↓           ↓
 账户级仪表盘  服务级仪表盘  高级监控自定义仪表盘
                            （支持自定义指标与看板）
```

| 仪表盘层级   | 覆盖范围      | 适用角色       |
| ------- | --------- | ---------- |
| **账户级** | 账户下所有代理服务 | 平台管理员      |
| **服务级** | 单个代理服务实例  | 运维工程师      |
| **自定义** | 按需组合任意指标  | SRE / 高级运维 |

### 4.4 告警与集成

- **邮件通知告警**：支持配置事件触发的邮件通知，及时感知环境异常
- **日志与指标访问**：可直接访问事件代理服务日志与全量监控指标
- **Datadog 集成**：预置基于最佳实践的 Datadog 监控项，企业可在 Datadog 中扩展自定义仪表盘

> 如果你已经在用 [ELK 做日志集中管理](../编程生涯elk技术栈日志处理的瑞士军刀/)，可以把 Solace 的 SYSLOG 直接转发到 Logstash，实现统一的可观测性体系。

### 4.5 Event Portal vs Insights——设计态与运行态回顾

在 Event Portal 章节中我们详细了解了它的六大模块，这里再做一个对比总结，厘清两者的分工：

| 维度       | Event Portal         | Insights       |
| -------- | -------------------- | -------------- |
| **关注阶段** | 设计态（Design Time）     | 运行态（Runtime）   |
| **核心职能** | 架构设计、资产治理、生命周期管理     | 监控指标、故障告警、可观测性 |
| **用户角色** | 架构师、开发负责人            | 运维工程师、SRE      |
| **输出物**  | 事件 Schema、主题架构、应用依赖图 | 仪表盘、告警通知、日志指标  |

:::important
Event Portal 和 Insights 不是替代关系，而是**设计时与运行时的互补**。一个帮你「画好图纸」，一个帮你「监控施工质量」。在实际企业落地中，通常是架构师先通过 Event Portal 完成设计，运维团队再通过 Insights 保障运行。
:::

***

## 五、消费者扩容三大模式

在 Solace 中，消费者从队列消费消息时，有三种扩容模式，分别对应不同的业务场景。

理解这三类模式非常关键——**因为它直接决定了你写 API 消费代码时怎么配置消费者**。

### 5.1 模式一：竞争消费（非独占队列）

**原理**：队列设置为非独占访问（`NON-EXCLUSIVE`），多个消费者绑定同一队列，消息轮询分发。

```text
        ┌─────────────┐
        │   队列 Queue │  ← 消息按轮询分发
        └──────┬──────┘
        ┌──────┼──────┐
        ↓      ↓      ↓
     消费者A  消费者B  消费者C  ← 各收一部分，负载均衡
```

**特点**：

- 水平扩展消费能力，吞吐量随消费者数量线性提升
- **消息无严格顺序**（因为轮询分发到不同消费者）
- 单个消费者宕机不影响整体消费

**适用场景**：日志处理、通用任务、无顺序要求的高并发消息。

### 5.2 模式二：HA 独占消费

**原理**：队列设置为独占访问（`EXCLUSIVE`），仅 **1 个活跃消费者** 接收全部消息，其余待机；活跃实例断开后，代理自动选举新的活跃消费者接管。

```text
        ┌─────────────┐
        │   队列 Queue │  ← 全部消息给活跃消费者
        └──────┬──────┘
        ┌──────┤
        ↓      └──── 消费者B（待机）
     消费者A        消费者C（待机）
    （活跃）
```

**特点**：

- 严格保证消息顺序
- 单实例故障自动切换，业务不中断
- 同一时间只有 1 个消费者在干活

**适用场景**：订单流程、财务事务、必须严格有序的核心业务。

### 5.3 模式三：分区队列

**原理**：队列划分为多个分区，消息按**分区键**（如门店 ID、用户 ID）固定路由到对应分区，同一分区的消息由同一消费者处理。

```text
        ┌──────────────────┐
        │   分区队列        │
        ├────┬────┬────┬───┤
        │ P0 │ P1 │ P2 │ P3│  ← 按分区键路由
        └─┬──┴─┬──┴─┬──┴─┬─┘
          ↓    ↓    ↓    ↓
    消费者A 消费者B 消费者C 消费者D
    (门店1) (门店2) (门店3) (门店4)
```

**特点**：

- 分区内严格有序，分区间并行处理
- 兼顾顺序性与扩展性
- 分区键设计是关键（选不好会导致数据倾斜）

**适用场景**：分库分表、用户维度分片、按业务维度有序的并行处理。

### 5.4 三模式选型速查

| 模式    | 消息顺序  | 扩展性  | 故障切换        | 推荐场景    |
| ----- | ----- | ---- | ----------- | ------- |
| 竞争消费  | 无序    | 线性扩展 | 自动（剩余消费者接管） | 日志、通用任务 |
| HA 独占 | 严格有序  | 单活   | 自动选举        | 订单、财务   |
| 分区队列  | 分区内有序 | 分片并行 | 分区级容错       | 用户维度的业务 |

:::warning
**最容易犯的错误**是以为独占队列（EXCLUSIVE）多个消费者能分摊消息——事实是它们全部待机，只有 1 个在工作。如果需要分摊，应该用非独占队列（NON-EXCLUSIVE）或分区队列。
:::

***

## 六、Solace Agent Mesh——事件驱动的 AI 代理编排

### 6.1 Agent Mesh 是什么

**Solace Agent Mesh** 是一个事件驱动的开源 AI 代理编排框架。它让多个专门化的 AI 代理（每个代理各有专长和工具）通过标准的异步事件通信协同工作。

```text
用户界面层
  [REST API] [Slack Bot] [Web UI] [Teams Bot]
        ↓（通过 Gateway 接入）
┌──────────────────────────────────────────┐
│          Solace Agent Mesh               │
│                                          │
│  Orchestrator（编排器）←→ Agent A（SQL 查询）│
│       ↕                  ↕              │
│  Event Broker（事件代理）←→ Agent B（文档分析）│
│       ↕                  ↕              │
│  Gateway（网关）←→ Agent C（多模态生成）    │
│                                          │
│  支持：A2A 协议 / MCP 协议 / LLM 无关       │
└──────────────────────────────────────────┘
           ↕（通过 Event Broker）
企业系统层
  [数据库] [ERP] [CRM] [SaaS 应用] [IoT 设备]
```

### 6.2 核心架构

Agent Mesh 的架构由四个核心组件构成：

| 组件                    | 职责                       | 类比           |
| --------------------- | ------------------------ | ------------ |
| **Agents（代理）**        | 专门化的 AI 执行单元，各有专属技能和工具   | 精通不同领域的「专家」  |
| **Gateways（网关）**      | 外部系统的受控接入点，处理认证与授权       | AI 世界的「大门保安」 |
| **Orchestrator（编排器）** | 智能分解任务、分派给合适的 Agent、协调执行 | 项目「总指挥」      |
| **Tools & Plugins**   | Agent 可调用的内置或第三方工具       | 专家的「工具箱」     |

### 6.3 标准化协议——A2A + MCP

Agent Mesh 原生支持两大主流开放协议：

- **A2A（Agent-to-Agent）协议**：Google 推动的代理间通信标准，让不同厂商、不同语言实现的 Agent 之间能互相发现和通信
- **MCP（Model Context Protocol）**：Anthropic 推动的模型上下文协议，标准化 AI 模型与外部工具/数据源的连接方式

:::tip
这意味着你可以在 Agent Mesh 中混搭不同生态的 Agent——比如一个用 LangGraph 构建的分析 Agent 和一个基于自定义 Python 脚本的数据抓取 Agent，通过 A2A 协议在同一个 Mesh 内协作。
:::

### 6.4 ADLC——AI 代理的完整生命周期

Solace Agent Mesh 提出了 **ADLC（Agent Development Lifecycle）** 概念，覆盖 AI 代理从定义到持续优化的六个阶段：

1. **Hire（招聘）**：定义 Agent 的角色、技能边界、可用工具
2. **Onboard（入职）**：接入企业系统与数据源，建立连接
3. **Coach（训练）**：通过结构化评估提升 Agent 的响应质量
4. **Supervise（监督）**：配置人工审核节点，关键决策留给人
5. **Teamwork（协作）**：多 Agent 协同工作，编排复杂业务流程
6. **Improve（优化）**：基于运行数据持续改进 Agent 表现

***

## 七、Solace 官方最佳实践体系

Solace 官方提供了一套非常系统的最佳实践文档，按场景分为四大类 12 项。这些最佳实践同时包含**原理指导**与**可落地的配置示例**，动手能力强的开发者可以直接照着做。

### 7.1 架构设计类

| 实践                | 说明                        | 谁该关注   |
| ----------------- | ------------------------- | ------ |
| **主题架构最佳实践**      | 事件主题架构的规范指导，是 EDA 的基础设计依据 | 架构师    |
| **带 DMR 的事件网格设计** | 使用 DMR 设计/配置事件网格的示例与规范    | 架构师、运维 |

### 7.2 部署扩展类

| 实践           | 说明                     | 谁该关注 |
| ------------ | ---------------------- | ---- |
| **多站点连接**    | 通过 DMR 连接三个不同站点应用的完整示例 | 运维   |
| **水平缩放**     | 通过 DMR 在单数据中心内扩容事件网格容量 | 运维   |
| **磁盘阵列工程指南** | 硬件一体机的磁盘阵列选型规范         | 硬件运维 |
| **复制最佳实践**   | 灾备场景的代理复制方案            | 运维   |

### 7.3 运维管理类

| 实践             | 说明                     | 谁该关注   |
| -------------- | ---------------------- | ------ |
| **消息重放示例**     | 通过 CLI 命令配置/触发消息重放     | 运维、开发  |
| **VPN 桥接设置示例** | 多种类型 Message VPN 桥接的配置 | 运维     |
| **最低推荐监控事件**   | 管理类应用必须监控的最小事件集合       | 运维、SRE |
| **版本管理与升级规范**  | 事件代理版本发布、升级的管理规范       | 平台管理员  |

### 7.4 开发集成类

| 实践           | 说明                         | 谁该关注       |
| ------------ | -------------------------- | ---------- |
| **微网关应用场景**  | HTTP 负载均衡、REST API 网关等场景示例 | 开发         |
| **API 最佳实践** | 基于 Solace 消息 API 开发应用的规范指导 | **全栈开发** ⭐ |

:::important
对于开发者来说，**API 最佳实践** 是最直接相关的——它涵盖了连接管理、消息构造、错误处理、性能调优等日常开发的核心关注点。
:::

***

## 八、Schema Registry、微集成与其他模块

### 8.1 Schema Registry——数据结构解耦

**Solace Schema Registry（模式注册表）** 用于解耦数据结构与应用程序，实现事件模式的共享、统一管理与版本控制。

```text
无 Schema Registry：
  应用A（定义订单格式） → 口头约定 → 应用B（按约定解析）
  ❌ 格式变了双方都要改，容易踩空

有 Schema Registry：
  应用A（发布 Schema） → Schema Registry（版本管理）→ 应用B（订阅 Schema）
  ✅ 格式变更时自动感知，消费者按需升级
```

### 8.2 Micro-Integrations——轻量集成

**Micro-Integrations（微集成）** 是 Solace 平台中的轻量级集成组件，用于将非事件驱动原生的系统接入事件网格。它支持的集成对象包括：

- 遗留系统（Legacy Systems）
- SaaS 应用（Salesforce、SAP 等）
- 数据库（JDBC 数据源）
- 文件系统
- AI 代理

### 8.3 开发者工具

Solace Developer Portal 提供了一套完整的开发者工具链：

- **Codelabs**：分步式手把手教程，快速上手
- **API 参考文档**：各语言 SDK 的完整 API 文档
- **示例代码库**：GitHub 上的 `solace-samples` 系列仓库
- **Try-Me CLI（stm）**：轻量级命令行调试工具

***

## 九、学习进阶路线

到这里，我们已经从平台设计到运维监控、从消费者模式到 Agent Mesh，把 Solace 的各个模块都走了一遍。最后整理一条学习路径，把碎片知识串起来：

| 阶段        | 目标          | 核心动作                                      |
| --------- | ----------- | ----------------------------------------- |
| **1. 入门** | 理解 EDA 核心概念 | 通读主题架构最佳实践，理解 Solace 消息路由核心逻辑             |
| **2. 基础** | 掌握消息收发开发    | 通过 Codelabs 完成 Java API 消息收发入门，上手 stm CLI |
| **3. 进阶** | 学会事件架构设计    | 在 Event Portal Designer 中完成一套业务主题架构设计     |
| **4. 实战** | 搭建生产可用环境    | 配置 DMR 实现双站点互通，结合 Insights 监控运行状态         |
| **5. 深化** | 研究高阶企业方案    | 学习复制、水平扩展、Agent Mesh 等企业级部署方案             |

> 这条路径对比上篇文章中的学习路线，补充了 **Event Portal 设计** 和 **Agent Mesh 编排** 两个进阶环节——当你不再只是「用 Solace 发消息」，而是开始「设计 Solace 事件驱动平台」时，这两个模块的价值会越来越明显。

***

## 十、Java 生态四套 API 深度解析

前九章我们搭建了完整的 Solace 平台认知——从 Event Portal 设计到 Insights 监控，从消费者扩容到 Agent Mesh 编排。但回到日常开发，**最常打交道的还是那一行行收发消息的代码**。

Solace 在 Java 生态中提供了 **4 套定位各异** 的官方 API。搞懂它们的差异，直接决定了你项目的开发效率、运行性能和长期可维护性。

### 10.1 JCSMP API——原生全功能客户端

**定位**：Solace 经典原生 Java 客户端，功能最完整，深度暴露 Solace 全部高级特性。

#### Maven 依赖

```xml
<dependency>
    <groupId>com.solace</groupId>
    <artifactId>sol-jcsmp</artifactId>
    <version>10.29.0</version>
</dependency>
```

:::caution
10.29+ 版本依赖 Netty 4.2+，与 Spring Boot 3.x 存在已知兼容性问题。Spring Boot 3 项目建议使用 10.28 及更早版本。
:::

#### 消息发布者（Publisher）

```java
import com.solacesystems.jcsmp.*;

public class JcsmpPublisher {
    // 连接配置：地址、VPN、认证信息
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/jcsmp/new";

    public static void main(String[] args) throws JCSMPException {
        // 1. 配置连接属性——JCSMP 使用 Properties 风格配置
        JCSMPProperties properties = new JCSMPProperties();
        properties.setProperty(JCSMPProperties.HOST, HOST);
        properties.setProperty(JCSMPProperties.VPN_NAME, VPN_NAME);
        properties.setProperty(JCSMPProperties.USERNAME, USERNAME);
        properties.setProperty(JCSMPProperties.PASSWORD, PASSWORD);

        // 2. 创建会话并连接——JCSMPFactory 是全局单例
        JCSMPSession session = JCSMPFactory.onlyInstance().createSession(properties);
        session.connect();
        System.out.println("JCSMP 会话连接成功");

        // 3. 创建消息生产者——需传入发布事件回调
        XMLMessageProducer producer = session.getMessageProducer(
            new JCSMPStreamingPublishEventHandler() {
                @Override
                public void responseReceived(String messageID) {
                    // 消息被代理确认接收后回调
                    System.out.println("消息发送确认: " + messageID);
                }

                @Override
                public void handleError(String messageID,
                        JCSMPException e, long timestamp) {
                    // 消息发送失败时回调
                    System.err.printf("消息发送失败: %s - %s%n",
                        messageID, e.getMessage());
                }
            });

        // 4. 构建消息——JCSMP 使用 BytesXMLMessage 泛化消息类型
        Topic topic = JCSMPFactory.onlyInstance().createTopic(TOPIC);
        BytesXMLMessage message = JCSMPFactory.onlyInstance()
            .createMessage(BytesXMLMessage.class);
        // 写入消息体（字节数组），支持二进制/文本/JSON 等格式
        message.writeBytes(
            "{\"orderId\": \"ORD-20260720-001\", \"status\": \"new\"}"
                .getBytes());
        // DIRECT = 直连模式（高性能可丢）；PERSISTENT = 保证模式（可靠不丢）
        message.setDeliveryMode(DeliveryMode.DIRECT);

        // 5. 发送消息到指定主题
        producer.send(message, topic);
        System.out.println("消息已发送到主题: " + TOPIC);

        // 6. 清理资源——按顺序关闭
        producer.close();
        session.closeSession();
    }
}
```

#### 消息订阅者（Subscriber）

```java
import com.solacesystems.jcsmp.*;
import java.util.concurrent.CountDownLatch;

public class JcsmpSubscriber {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/jcsmp/new";

    public static void main(String[] args)
            throws JCSMPException, InterruptedException {

        // 1. 连接配置（与发布者一致）
        JCSMPProperties properties = new JCSMPProperties();
        properties.setProperty(JCSMPProperties.HOST, HOST);
        properties.setProperty(JCSMPProperties.VPN_NAME, VPN_NAME);
        properties.setProperty(JCSMPProperties.USERNAME, USERNAME);
        properties.setProperty(JCSMPProperties.PASSWORD, PASSWORD);

        // 2. 创建会话
        JCSMPSession session = JCSMPFactory.onlyInstance()
            .createSession(properties);
        session.connect();
        System.out.println("JCSMP 会话连接成功，等待消息...");

        // CountDownLatch 用于阻塞主线程，收到一条消息后退出
        CountDownLatch latch = new CountDownLatch(1);

        // 3. 创建消息消费者——通过 XMLMessageListener 异步接收
        XMLMessageConsumer consumer = session.getMessageConsumer(
            new XMLMessageListener() {
                @Override
                public void onReceive(BytesXMLMessage message) {
                    // 从消息中读取字节数组载荷
                    byte[] payload = new byte[message.getContentLength()];
                    message.readBytes(payload);
                    System.out.println("收到消息: " + new String(payload));
                    latch.countDown(); // 计数减一，允许主线程退出
                }

                @Override
                public void onException(JCSMPException e) {
                    System.err.println("消费异常: " + e.getMessage());
                }
            });

        // 4. 订阅主题并启动消费者——必须先订阅再 start
        Topic topic = JCSMPFactory.onlyInstance().createTopic(TOPIC);
        session.addSubscription(topic);
        consumer.start();

        // 等待接收一条消息
        latch.await();

        // 5. 清理资源
        consumer.close();
        session.closeSession();
    }
}
```

**关键特性**：

- 完整支持 Solace 所有专属能力：持久消息、事务、消息选择器、流控、消息重放
- 提供同步/异步两种消费模式
- 性能优异，是企业级核心系统的主流选型
- API 偏底层，灵活度高但代码量偏大

***

### 10.2 Solace Java API——新一代通用 Java API

**定位**：Solace 新一代 Java 客户端，API 设计现代简洁，抽象层级更高，主打**易用性与开发效率**。

如果说 JCSMP 是「万能工具箱」，那 Java API 就是「电动螺丝刀」——日常 80% 的场景用起来更快更顺手。

#### Maven 依赖

```xml
<dependency>
    <groupId>com.solace</groupId>
    <artifactId>solace-messaging-client</artifactId>
    <version>1.10.0</version>
</dependency>
```

#### 消息发布者（Publisher）

```java
import com.solace.messaging.MessagingService;
import com.solace.messaging.publisher.DirectMessagePublisher;
import com.solace.messaging.resources.Topic;
import java.util.Properties;

public class NewJavaApiPublisher {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/javaapi/new";

    public static void main(String[] args) {
        // 1. 使用 Builder 模式构建消息服务——代码简洁，语义清晰
        MessagingService messagingService = MessagingService.builder()
            .fromProperties(Properties.of(
                "solace.messaging.host", HOST,
                "solace.messaging.vpnName", VPN_NAME,
                "solace.messaging.username", USERNAME,
                "solace.messaging.password", PASSWORD
            ))
            .build();
        // 连接消息代理
        messagingService.connect();
        System.out.println("Java API 服务连接成功");

        // 2. 创建直接消息发布者——链式调用，开箱即用
        DirectMessagePublisher publisher = messagingService
            .createDirectMessagePublisherBuilder()
            .onBackPressureWait(1000) // 背压策略：队列满时等待 1 秒
            .build()
            .start();

        // 3. 发布消息——直接传字符串，无需手动创建消息对象
        String payload = "{\"orderId\": \"ORD-20260720-002\", \"status\": \"new\"}";
        publisher.publish(payload, Topic.of(TOPIC));
        System.out.println("消息已发送到主题: " + TOPIC);

        // 4. 关闭资源
        publisher.terminate(1000);
        messagingService.disconnect();
    }
}
```

#### 消息订阅者（Subscriber）

```java
import com.solace.messaging.MessagingService;
import com.solace.messaging.receiver.DirectMessageReceiver;
import com.solace.messaging.resources.TopicSubscription;
import java.util.Properties;
import java.util.concurrent.CountDownLatch;

public class NewJavaApiSubscriber {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/javaapi/new";

    public static void main(String[] args) throws InterruptedException {
        // 1. 构建并连接（与发布者一致）
        MessagingService messagingService = MessagingService.builder()
            .fromProperties(Properties.of(
                "solace.messaging.host", HOST,
                "solace.messaging.vpnName", VPN_NAME,
                "solace.messaging.username", USERNAME,
                "solace.messaging.password", PASSWORD
            ))
            .build();
        messagingService.connect();
        System.out.println("Java API 服务连接成功，等待消息...");

        CountDownLatch latch = new CountDownLatch(1);

        // 2. 创建直接消息接收器——订阅与接收一步到位
        DirectMessageReceiver receiver = messagingService
            .createDirectMessageReceiverBuilder()
            .withSubscriptions(TopicSubscription.of(TOPIC))
            .build()
            .start();

        // 3. 异步接收消息——Lambda 表达式，代码简洁
        receiver.receiveAsync(message -> {
            // 直接获取字符串载荷，无需手动字节操作
            String payload = message.getPayloadAsString();
            System.out.println("收到消息: " + payload);
            latch.countDown();
        });

        latch.await();

        // 4. 关闭资源
        receiver.terminate(1000);
        messagingService.disconnect();
    }
}
```

**与 JCSMP 的关键差异**：

| 维度        | JCSMP                                    | Java API                  |
| --------- | ---------------------------------------- | ------------------------- |
| API 风格    | Properties + Factory                     | Builder 链式调用              |
| 消息对象      | BytesXMLMessage（需手动读写字节）                 | 直接传 String/byte\[]        |
| 背压控制      | 需手动配置 Producer Flow Control              | `onBackPressureWait()` 内置 |
| Lambda 支持 | 匿名内部类（Java 8 前风格）                        | 原生 Lambda 支持              |
| 学习成本      | 中高（概念多，需理解 Session/Producer/Consumer 三层） | 低（Builder 一条链搞定）          |

:::tip
**新项目首选 Java API**。这是 Solace 官方的推荐，也是我个人的建议。除非你有下面这几种特殊情况（10.3 或 10.4），否则新项目都应该从 Java API 开始。
:::

***

### 10.3 Java RTO API——极致低延迟运行时优化版

**定位**：面向极致低延迟、高吞吐场景的专用 API。它基于 **JNI 封装 C 语言核心库**，最小化对象创建与 GC 开销。

RTO 的全称是 **Runtime Optimized**。它不是给普通业务微服务用的，而是给**金融交易、实时风控、高频数据采集**这类每微秒都算钱的场景准备的。

#### Maven 依赖

```xml
<dependency>
    <groupId>com.solacesystems</groupId>
    <artifactId>solclientj</artifactId>
    <version>10.9.0</version>
    <type>pom</type>
</dependency>
```

> 该 POM 依赖会拉取 `solclientj-common` 与对应平台的 native 原生库，运行时自动加载系统的动态链接库。

#### 消息发布者（Publisher）

```java
import com.solacesystems.solclientj.core.Solclient;
import com.solacesystems.solclientj.core.SolclientException;
import com.solacesystems.solclientj.core.handle.SessionHandle;
import com.solacesystems.solclientj.core.handle.MessageHandle;
import com.solacesystems.solclientj.core.resource.Topic;

public class JavaRtoPublisher {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/rto/new";

    public static void main(String[] args) throws SolclientException {
        // 1. 初始化 Solclient 全局实例——整个进程生命周期仅需一次
        Solclient.init(new String[0]);
        System.out.println("Solclient RTO 初始化完成");

        // 2. 创建会话——使用 Handle 模式操作资源
        // Handle 是 RTO API 的核心抽象，类似 C 语言中的指针
        SessionHandle sessionHandle = Solclient.Allocator.newSessionHandle();
        String[] sessionProps = {
            SessionHandle.PROPERTIES.HOST, HOST,
            SessionHandle.PROPERTIES.VPN_NAME, VPN_NAME,
            SessionHandle.PROPERTIES.USERNAME, USERNAME,
            SessionHandle.PROPERTIES.PASSWORD, PASSWORD
        };
        // createSessionForHandle：将属性绑定到 Handle 上
        Solclient.createSessionForHandle(sessionHandle, sessionProps, null);
        sessionHandle.connect();
        System.out.println("RTO 会话连接成功");

        // 3. 构建消息——同样使用 Handle
        MessageHandle messageHandle = Solclient.Allocator.newMessageHandle();
        Solclient.createMessageForHandle(messageHandle);
        messageHandle.setDestination(new Topic(TOPIC));
        messageHandle.setBinaryAttachment(
            "{\"orderId\":\"ORD-RTO-001\"}".getBytes());
        messageHandle.setDeliveryMode(
            MessageHandle.DELIVERY_MODE.DIRECT);

        // 4. 发送消息
        sessionHandle.send(messageHandle);
        System.out.println("消息已发送到主题: " + TOPIC);

        // 5. 销毁资源——Handle 需要显式释放
        messageHandle.destroy();
        sessionHandle.disconnect();
        sessionHandle.destroy();
    }
}
```

#### 消息订阅者（Subscriber）

```java
import com.solacesystems.solclientj.core.Solclient;
import com.solacesystems.solclientj.core.SolclientException;
import com.solacesystems.solclientj.core.handle.SessionHandle;
import com.solacesystems.solclientj.core.handle.MessageHandle;
import com.solacesystems.solclientj.core.event.SessionEventCallback;
import com.solacesystems.solclientj.core.event.MessageCallback;
import com.solacesystems.solclientj.core.resource.TopicSubscription;
import java.util.concurrent.CountDownLatch;

public class JavaRtoSubscriber {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/rto/new";

    public static void main(String[] args)
            throws SolclientException, InterruptedException {

        CountDownLatch latch = new CountDownLatch(1);

        // 1. 全局初始化
        Solclient.init(new String[0]);
        System.out.println("Solclient RTO 初始化完成，等待消息...");

        // 2. 消息回调——收到消息后直接处理二进制载荷
        MessageCallback messageCallback = (session, message) -> {
            byte[] payload = message.getBinaryAttachment();
            System.out.println("收到消息: " + new String(payload));
            latch.countDown();
        };

        // 3. 会话事件回调——监控连接状态变化
        SessionEventCallback eventCallback = (session, event) -> {
            System.out.println("会话事件: " + event.getSessionEventCode());
        };

        // 4. 创建并连接会话——同时绑定消息回调和事件回调
        SessionHandle sessionHandle = Solclient.Allocator.newSessionHandle();
        String[] sessionProps = {
            SessionHandle.PROPERTIES.HOST, HOST,
            SessionHandle.PROPERTIES.VPN_NAME, VPN_NAME,
            SessionHandle.PROPERTIES.USERNAME, USERNAME,
            SessionHandle.PROPERTIES.PASSWORD, PASSWORD
        };
        Solclient.createSessionForHandle(sessionHandle, sessionProps,
            messageCallback, eventCallback);
        sessionHandle.connect();

        // 5. 订阅主题——WAIT 标志表示等待订阅确认
        sessionHandle.subscribe(
            new TopicSubscription(TOPIC),
            SessionHandle.SUBSCRIBE_FLAGS.WAIT);

        latch.await();

        // 6. 清理资源
        sessionHandle.unsubscribe(
            new TopicSubscription(TOPIC),
            SessionHandle.SUBSCRIBE_FLAGS.WAIT);
        sessionHandle.disconnect();
        sessionHandle.destroy();
    }
}
```

:::warning
RTO API 的「Handle 模式」开发体验与常规 Java 库差异很大。你需要自己管理 Handle 的分配和释放，忘记 `destroy()` 会导致内存泄漏。核心建议：**除非你的场景对延迟有硬性要求（纳秒/微秒级），否则不要碰 RTO API。**
:::

**性能数据**（Solace 官方公布，Direct 模式）：

| 指标     | JCSMP   | Java API | Java RTO |
| ------ | ------- | -------- | -------- |
| 平均延迟   | \~200μs | \~250μs  | **微秒级**  |
| GC 影响  | 中等      | 低        | 极低       |
| CPU 占用 | 正常      | 正常       | 更低       |

***

### 10.4 JMS API——标准 JMS 兼容 API

**定位**：严格兼容 **JMS 2.0** 规范的标准 API。它存在的最大意义不是「更好用」，而是「**零成本迁移**」——如果你的项目已经在用 ActiveMQ、IBM MQ 等 JMS Provider，切换到 Solace 只需要换一个 ConnectionFactory。

#### Maven 依赖

```xml
<dependency>
    <groupId>com.solacesystems</groupId>
    <artifactId>sol-jms</artifactId>
    <version>10.30.0</version>
</dependency>
```

#### 消息发布者（Publisher）

```java
import javax.jms.*;
import com.solacesystems.jms.SolConnectionFactory;
import com.solacesystems.jms.SolJmsUtility;

public class JmsPublisher {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/jms/new";

    public static void main(String[] args) throws JMSException {
        Connection connection = null;
        Session session = null;
        MessageProducer producer = null;

        try {
            // 1. 创建 JMS ConnectionFactory——使用 Solace 专有实现
            // SolJmsUtility 是 Solace 提供的 JMS 工具类
            SolConnectionFactory connectionFactory =
                SolJmsUtility.createConnectionFactory();
            connectionFactory.setHost(HOST);
            connectionFactory.setVPN(VPN_NAME);
            connectionFactory.setUsername(USERNAME);
            connectionFactory.setPassword(PASSWORD);

            // 2. 创建 JMS Connection + Session——标准 JMS 三步曲
            connection = connectionFactory.createConnection();
            // 参数：是否事务，确认模式（AUTO_ACKNOWLEDGE = 自动确认）
            session = connection.createSession(
                false, Session.AUTO_ACKNOWLEDGE);

            // 3. 创建 Topic 与 Producer——标准的 JMS API
            Topic topic = session.createTopic(TOPIC);
            producer = session.createProducer(topic);
            // NON_PERSISTENT = 直连模式，PERSISTENT = 保证模式
            producer.setDeliveryMode(DeliveryMode.NON_PERSISTENT);

            // 4. 构建并发送 TextMessage
            TextMessage message = session.createTextMessage(
                "{\"orderId\": \"ORD-JMS-001\", \"status\": \"new\"}");
            producer.send(message);
            System.out.println("消息已发送到主题: " + TOPIC);

        } finally {
            // 5. 按 JMS 规范顺序关闭资源（反向创建顺序）
            if (producer != null) producer.close();
            if (session != null) session.close();
            if (connection != null) connection.close();
        }
    }
}
```

#### 消息订阅者（Subscriber）

```java
import javax.jms.*;
import com.solacesystems.jms.SolConnectionFactory;
import com.solacesystems.jms.SolJmsUtility;
import java.util.concurrent.CountDownLatch;

public class JmsSubscriber {
    private static final String HOST = "tcp://localhost:55555";
    private static final String VPN_NAME = "default";
    private static final String USERNAME = "default";
    private static final String PASSWORD = "default";
    private static final String TOPIC = "order/jms/new";

    public static void main(String[] args)
            throws JMSException, InterruptedException {

        Connection connection = null;
        Session session = null;
        MessageConsumer consumer = null;

        try {
            // 1. 创建 ConnectionFactory（与发布者一致）
            SolConnectionFactory connectionFactory =
                SolJmsUtility.createConnectionFactory();
            connectionFactory.setHost(HOST);
            connectionFactory.setVPN(VPN_NAME);
            connectionFactory.setUsername(USERNAME);
            connectionFactory.setPassword(PASSWORD);

            // 2. 创建 Connection + Session
            connection = connectionFactory.createConnection();
            session = connection.createSession(
                false, Session.AUTO_ACKNOWLEDGE);

            // 3. 创建 Topic 与 Consumer
            Topic topic = session.createTopic(TOPIC);
            consumer = session.createConsumer(topic);

            CountDownLatch latch = new CountDownLatch(1);

            // 4. 设置消息监听器——JMS 标准的异步消费方式
            consumer.setMessageListener(message -> {
                try {
                    if (message instanceof TextMessage) {
                        String payload = ((TextMessage) message).getText();
                        System.out.println("收到消息: " + payload);
                        latch.countDown();
                    }
                } catch (JMSException e) {
                    e.printStackTrace();
                }
            });

            // 5. 启动连接——JMS 的 connection.start() 必须显式调用
            connection.start();
            System.out.println("JMS 订阅启动，等待消息...");

            latch.await();

        } finally {
            if (consumer != null) consumer.close();
            if (session != null) session.close();
            if (connection != null) connection.close();
        }
    }
}
```

:::note
JMS API 的代码看起来和 ActiveMQ、IBM MQ 的 JMS 代码几乎一样。这正是它的设计目标——**你的业务代码不需要改，只需要把 ConnectionFactory 换成 Solace 的实现，其余一切照旧。**
:::

**JMS API 的局限性**：

| 功能            | JCSMP / Java API | JMS API      |
| ------------- | ---------------- | ------------ |
| Solace 专属高级特性 | 完整支持             | ❌ 不支持        |
| 消息选择器         | 原生支持             | 仅支持 JMS 标准语法 |
| 事务支持          | 完整事务 + XA        | 标准 JMS 事务    |
| 消息重放          | 原生支持             | ❌ 不支持        |
| Spring JMS 集成 | 需手动适配            | ✅ 开箱即用       |

***

### 10.5 四选一决策树

说了这么多理论，最后给一张**实战决策树**：

```text
你的项目需要什么？
│
├─ 必须用标准 JMS API（存量系统迁移/Java EE 标准）？
│   └─→ JMS API
│
├─ 延迟要求微秒级（金融交易/高频风控/实时定价）？
│   └─→ Java RTO API  ⚠️ 做好 Handle 管理
│
├─ 需要 Solace 全部高级特性（事务/消息重放/自定义流控）？
│   └─→ JCSMP API
│
└─ 其他所有情况（新项目/业务微服务/通用开发）？
    └─→ Java API ✅ 官方推荐
```

| 场景                    | 选型            | 核心理由                           |
| --------------------- | ------------- | ------------------------------ |
| 新业务微服务                | **Java API**  | 开发效率最高，Builder 式 API 易维护       |
| 金融交易系统                | **Java RTO**  | 延迟敏感，GC 抖动不可接受                 |
| 存量 ActiveMQ/IBM MQ 迁移 | **JMS API**   | 零代码改造成本，换 ConnectionFactory 即可 |
| 中间件平台开发               | **JCSMP API** | 需要 Solace 全部高级特性深度定制           |
| Spring Boot 常规项目      | **Java API**  | 与 Spring Boot 兼容性好，开发体验最佳      |

```text
                  选型心法一句话总结
    ┌──────────────────────────────────────────┐
    │  能用 Java API 的场合就优先用 Java API      │
    │  除非你有非用另外三套不可的硬性理由            │
    └──────────────────────────────────────────┘
```

***

_回顾这一路：从 Event Portal 的设计蓝图到 Insights 的运维监控，从消费者扩容模式的选型到 Agent Mesh 的 AI 编排，最终全部落地到 Java 开发者手边最实在的四套 API 代码。Solace 不只是一个消息中间件，它是一个完整的事件驱动平台——而真正用好一个平台，既需要理解它的设计哲学，也需要熟悉它的一行行代码。_
