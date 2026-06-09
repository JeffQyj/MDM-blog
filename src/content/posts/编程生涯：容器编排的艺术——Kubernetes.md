---
title: 编程生涯：容器编排的艺术——Kubernetes
published: 2026-06-10
description: 2026年6月系统学习Kubernetes容器编排技术，从Docker单机的"快递箱"困境出发，深入解析Pod、Service、Deployment、StatefulSet等核心资源对象，剖析Master-Worker控制平面架构，并实战Minikube与K3s多节点集群搭建、YAML声明式配置、Service对外暴露、Portainer可视化等关键技术。
tags: [Kubernetes, 容器编排, Docker, 云原生, 微服务]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
如果说 Docker 是「标准化快递箱」，那 Kubernetes（K8s）就是「调度全城快递的物流公司」。2026年6月，我终于把这两年的容器学习拼成了一张完整的图——从单机的 `docker run` 到跨主机的「自愈式编排」，K8s 补齐了微服务落地的最后一块拼图。
:::

## 一、前情提要：从快递箱到物流公司

2023年12月，我写过一篇 [Docker与容器化](../编程生涯docker与容器化/) 的文章，里面给 Docker 容器打了个比方——**「更轻量的快递箱」**：

> 虚拟机的集装箱要在码头（物理服务器）上运货，而 Docker 的快递箱可以直接「飞到」任何地方。

写那篇文章时，我心里其实藏着一个没说出口的疑问：**快递箱多了怎么办？**

半年后，也就是 2024 年初，我学完 [从单体到微服务](../编程生涯从单体到微服务/) 之后，这个疑问变成了现实的痛。黑马商城拆成 8 个微服务，每个服务至少 2 个实例（用户、商品、订单、支付、搜索、推荐、网关、配置中心），再加 Redis、MySQL、Elasticsearch、Nacos、Sentinel 这些中间件——一个项目跑起来，**容器数量从个位数直接飙升到三四十个**。

那时候管理这些容器的方法很「土」：写一长串 `docker run` 的 shell 脚本，按顺序启动。这种方式在开发环境勉强能用，但有三个致命问题：

| 问题         | 现实场景                             |
| ---------- | -------------------------------- |
| **挂了没人管**  | 某个服务挂了，shell 脚本不会自动重启它           |
| **扩容靠人肉**  | 想临时加 10 个订单服务实例，得手动 ssh 到每台机器上启动 |
| **网络配置混乱** | 30 个容器互相调用的 IP 关系，画张图比代码还长       |

我开始明白：**Docker 解决了「单个容器怎么跑」的问题，但没有解决「成百上千个容器怎么协作」的问题。** 这就需要一个「总调度」——**容器编排引擎**。

而放眼整个云原生世界，这个「总调度」的名字只有一个：**Kubernetes**。

***

## 二、为什么需要容器编排？

### 2.1 容器多了之后的「三大灾难」

在深入 K8s 之前，我们先搞清楚：**没有编排工具时，大规模容器管理会出什么问题？**

**灾难一：发布是「拆炸弹」**

传统做法是登录到每台服务器，手动停掉旧容器、启动新容器。中间任何一台机器 ssh 不上去，整个发布流程就卡住——这在业内叫「**发布窗口期**」，一般是凌晨2点到6点，因为只有这个时间段用户少、能停机。

**灾难二：故障是「无底洞」**

某个服务因为内存泄漏挂了，监控系统发出告警，运维同学被叫起来，手动重启容器。问题是，**这个过程完全是手动的**——你得知道是哪个服务挂了、它跑在哪台机器上、它依赖哪些服务、重启会不会雪崩。

**灾难三：扩容是「等不起」**

业务高峰期来了，想加 10 个实例缓解压力。传统做法是评估资源、写脚本、执行、回滚预案——一通操作下来，**流量高峰已经过去了**。这就好比下雨了才想起来找伞，等你撑起伞，人已经被淋透了。传统架构遇到双11这种活动，要么提前一周疯狂堆机器（浪费资源），要么直接降级保核心功能（损失收入），**永远卡在「来不及」和「太浪费」之间**。

### 2.2 K8s 如何破解这三大灾难？

Kubernetes 提供的核心能力，可以用一个词概括——**「声明式」**。

| 传统方式（命令式）           | K8s 方式（声明式）                  |
| ------------------- | ---------------------------- |
| 告诉系统「怎么一步步做」        | 告诉系统「我要什么结果」                 |
| 例：登录机器A，停掉容器x，启动容器y | 例：副本数=3，K8s 自己保证有 3 个 Pod 在跑 |
| 人要管全过程              | 人只管目标，系统负责执行                 |
| 错了需要人修              | 错了 K8s 自动修（自愈能力）             |

具体来说，K8s 提供了五大能力：

1. **自动化部署**：写一份 YAML 文件，K8s 自动把容器部署到合适的机器上
2. **自动扩缩容**：CPU 使用率超过 80%？K8s 自动加机器
3. **自愈能力**：容器挂了？K8s 自动重启；机器宕机？K8s 自动把容器迁走
4. **服务发现**：不需要记 IP，Pod 之间通过「服务名」互相访问
5. **滚动更新**：发布新版本时，一批批替换，零停机

:::note
**声明式 vs 命令式** 是理解 K8s 哲学的钥匙。命令式系统是「管家模式」——你得告诉管家「先去市场、再去银行、最后回家」；声明式系统是「目标模式」——你只说「今晚要做饭」，管家自己规划路径。在分布式系统里，**目标模式远比管家模式鲁棒**，因为分布式环境的不确定性（网络抖动、机器故障）会让「管家」随时走错路。
:::

### 2.3 K8s 的江湖地位

2014 年，Google 开源了 Kubernetes 这个项目。

十余年过去，K8s 早已是容器编排领域的事实标准：

- **CNCF（Cloud Native Computing Foundation）: 云原生计算基金会旗舰项目**
- **三大云厂商全部支持**：GKE（Google）、AKS（微软）、EKS（亚马逊）都直接托管 K8s
- **招聘市场的硬通货**：后端工程师面试，K8s 几乎是必考点

一句话总结：**K8s 是云原生时代的「操作系统」**——Linux 管理单机资源，K8s 管理集群资源。

***

## 三、核心资源对象全景图

K8s 里有几十种「资源对象」（Resource），但真正常用到的就那么几个。理解这些核心对象，是入门 K8s 的关键。

### 3.1 Node：集群里的「工人」

**Node（节点）** 是 K8s 集群中的一台物理机或虚拟机，是真正「干活的机器」。

类比一下：如果你把 K8s 集群比作一家公司，那 Node 就是「员工」——每个员工都坐在自己的工位上，处理分配给自己的任务。

```text
K8s 集群
├── Master Node（管理层，不干活）
│   ├── API Server（前台接待）
│   ├── etcd（档案室）
│   ├── Scheduler（HR 分配任务）
│   └── Controller Manager（监工）
└── Worker Node（员工，真正干活）
    ├── 容器运行时（操作工具）
    ├── kubelet（员工手册）
    └── kube-proxy（内部通讯录）
```

### 3.2 Pod：K8s 的「最小作战单元」

**Pod 是 K8s 中最小的调度单元**，不是容器，而是一个或多个容器的「合租公寓」。

这个比喻很贴切：

| 公寓概念     | Pod 概念                 |
| -------- | ---------------------- |
| 公寓地址     | Pod 的 IP 地址            |
| 室友       | Pod 内的容器               |
| 共享客厅、厨房  | 共享网络、存储                |
| 室友可以随便串门 | 容器可以用 `localhost` 互相访问 |

**为什么需要 Pod，而不是直接调度容器？**

因为有些场景下，多个容器需要**强耦合**——它们必须部署在同一台机器上、共享网络和存储。比如经典的「边车模式（Sidecar）」：

```text
┌───────────────── Pod ─────────────────┐
│                                       │
│  ┌──────────────┐  ┌──────────────┐   │
│  │  应用容器      │  │ 日志收集容器   │   │
│  │  (Nginx)     │  │ (Filebeat)  │   │
│  └──────────────┘  └──────────────┘   │
│     共享网络、共享 /var/log 目录        │
└───────────────────────────────────────┘
```

日志收集容器「搭便车」在应用容器的同一个 Pod 里，共享文件系统，这样日志采集就和应用生命周期绑定——容器一启动，日志就被收集，**不用单独部署一套采集系统**。

:::caution
**最佳实践是「一个 Pod 一个容器」**。虽然技术上允许一个 Pod 跑多个容器，但只有当容器之间必须强耦合（比如共享数据卷、通过 localhost 通信）时才这么做。多个无关容器塞一个 Pod，会让你后续的扩缩容、滚动更新都变得复杂。
:::

### 3.3 Pod 的「致命缺陷」：IP 不稳定

Pod 看似完美，但有一个致命问题——**它的 IP 是临时的**。

Pod 是「一次性的」实体：挂了会自动重建，扩容会创建新的，缩容会删除旧的。每次重建，**IP 地址都会变**。

这就好比你开了一家奶茶店，顾客要记住你的店名——但你每隔几天就换一次门面，**顾客根本找不到你**。

实际场景里，应用之间要互相调用：

```
订单服务（Pod A） → "我得访问用户服务"
用户服务（Pod B）   → "但我的 IP 是 10.244.1.5，明天就可能是 10.244.3.8"
```

如果写死 IP，每次重启都得改配置，这显然不现实。**K8s 的解法是：抽出一层「不变的入口」——这就是 Service。**

### 3.4 Service：稳定不变的「前台总机」

**Service 是一组功能相同的 Pod 的「稳定访问入口」**。

类比一下：Pod 是「幕后干活的员工」，Service 就是「前台总机号码」。员工可以换（重建 Pod），但总机号码永远不变。

```text
                  Service: 10.96.0.100（前台总机）
                          ↓
            ┌─────────────┼─────────────┐
            ↓             ↓             ↓
       Pod A          Pod B          Pod C
    10.244.1.5     10.244.2.3     10.244.3.8
    (员工1)        (员工2)        (员工3)
    干同样的活      干同样的活       干同样的活
```

Service 的核心工作原理：

1. **标签选择器（Label Selector）**：通过 `app=nginx` 这样的标签，识别哪些 Pod 属于自己
2. **负载均衡**：把请求自动分发到后端健康的 Pod
3. **动态更新**：Pod 增减时，Service 自动感知并更新转发规则

**关键概念：标签（Label）和选择器（Selector）**

标签是 K8s 资源的「身份证」，格式是 `key=value`：

```yaml
metadata:
  labels:
    app: nginx
    env: production
```

Service 通过选择器找到带特定标签的 Pod：

```yaml
spec:
  selector:
    app: nginx  # 找所有 app=nginx 的 Pod
```

:::note
**标签是 K8s 解耦的基石**。Pod 不知道自己属于哪个 Service，Service 也不关心 Pod 的存在——它们通过「标签」这个中间层建立联系。这种「发布-订阅」式的设计，让 K8s 具备了极强的灵活性。同一个 Pod，可以同时被多个 Service 选中；同一个 Service，可以管理跨机器的 Pod。
:::

### 3.5 Deployment：无状态应用的「部门经理」

实际上，**我们几乎不直接创建 Pod**，而是用更高级的「控制器」来管理 Pod。其中最常用的就是 **Deployment**。

Deployment 是「**管理无状态应用**」的部门经理，负责三件事：

| 能力        | 类比       | 作用               |
| --------- | -------- | ---------------- |
| **副本控制**  | 部门有多少员工  | 始终保持 N 个 Pod 在运行 |
| **滚动更新**  | 部门换人不能停工 | 逐步替换 Pod，零停机发布   |
| **自动扩缩容** | 业务忙了多招人  | 根据负载动态调整 Pod 数量  |

Deployment 实际上是通过两层控制器实现这些能力：

```text
Deployment（部门经理）
    ↓ 管理
ReplicaSet（小组长）
    ↓ 管理
Pod × N（员工）
```

**为什么中间要加一个 ReplicaSet？**

这是 K8s 设计上的精妙之处。Deployment 管「版本」——哪个版本的 Pod 应该是多少个；ReplicaSet 管「数量」——保持当前版本的 Pod 数量。两者分离后，**滚动更新就变成了一件优雅的事**：

- 旧版本：ReplicaSet-v1 管 3 个 Pod
- 更新中：ReplicaSet-v1 管 2 个 Pod + ReplicaSet-v2 管 1 个 Pod（逐步替换，总数可能暂时超过 replicas）
- 更新完成：ReplicaSet-v1 管 0 个 + ReplicaSet-v2 管 3 个

如果更新出问题了，还能一键回滚到 ReplicaSet-v1。

### 3.6 StatefulSet：有状态应用的「档案管理员」

Deployment 适合 Web 服务、API 服务这类**无状态应用**——它们每个实例都一样，挂掉一个换一个新的，无所谓。

但**有状态应用**就不行了，比如 MySQL 集群：

- 每个数据库实例都有**独立的存储**（数据不能丢）
- 每个实例有**稳定的网络标识**（master-0、master-1、master-2）
- 实例之间有**主从关系**（不能随机启动）

**StatefulSet** 就是为了解决这些问题而生的：

| 能力     | Deployment | StatefulSet              |
| ------ | ---------- | ------------------------ |
| Pod 名称 | 随机字符串      | 固定序号（mysql-0、mysql-1...） |
| 存储     | 共享 Volume  | 每个 Pod 独立 Volume         |
| 启动顺序   | 并行         | 按序号 0→1→2 顺序             |
| 删除顺序   | 随机         | 倒序 2→1→0                 |
| 适用场景   | Web、API、网关 | 数据库、缓存、消息队列              |

:::caution
**实战中，数据库通常不直接跑在 K8s 里**。虽然 StatefulSet 提供了理论支持，但数据库的运维（备份、监控、主从切换、版本升级）非常复杂，**把数据库剥离到集群外单独部署，使用云厂商的托管数据库 RDS（Relational Database Service），往往是更稳妥的选择**。K8s 集群主要跑无状态的应用服务，数据交给专业的存储系统。
:::

### 3.7 ConfigMap 与 Secret：配置与代码的「解耦」

实际开发中，**配置信息**（数据库地址、端口、用户名）和**代码**应该分开管理——这叫「12-Factor App」原则（这个原则之后应该也会出文章），K8s 提供了两个资源对象来实现这一点：

| 资源对象          | 存储内容              | 编码方式   | 类比    |
| ------------- | ----------------- | ------ | ----- |
| **ConfigMap** | 非敏感配置（URL、端口、参数）  | 明文     | 公司手册  |
| **Secret**    | 敏感信息（密码、Token、证书） | Base64 | 公司保险柜 |

ConfigMap 示例：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # 明文配置，直接看就行
  database.host: "10.0.1.50"
  database.port: "3306"
  log.level: "INFO"
```

Secret 示例：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secret
type: Opaque
data:
  # Base64 编码后的值（不是加密！只是编码）
  # echo -n "root123" | base64
  database.password: "cm9vdDEyMw=="
```

:::warning
**Secret 的 Base64 编码不是加密**！Base64 是一种「编码方式」，任何人都可以反向解码。生产环境中，**Secret 应该结合 K8s 的 RBAC 权限控制 + etcd 加密存储 + 外部密钥管理服务（如 HashiCorp Vault）一起使用**，才能真正保证敏感信息的安全。仅仅把密码塞进 Secret，等于把保险柜钥匙插在锁上。
:::

### 3.8 Volume：数据的「保险柜」

容器是「无状态」的——容器一删，里面的数据也没了。但 MySQL 这种应用，数据必须持久化。

**Volume（存储卷）** 就是 K8s 解决数据持久化的方案：

```text
┌───────────────── Pod ─────────────────┐
│                                       │
│  ┌──────────────┐                     │
│  │  MySQL 容器   │  ──挂载──→  Volume │
│  └──────────────┘                     │
└───────────────────────────────────────┘
                                          ↓
                                    物理磁盘 / NFS / 云存储
                                    （Pod 删了数据还在）
```

K8s 支持多种 Volume 类型：

| 类型                                  | 来源         | 适用场景      |
| ----------------------------------- | ---------- | --------- |
| emptyDir                            | Pod 内的临时目录 | 容器间共享临时数据 |
| hostPath                            | 节点本地目录     | 单机测试      |
| NFS（Network File System）            | 网络文件系统     | 中小规模生产环境  |
| 云存储（EBS、阿里云盘）                       | 云厂商提供      | 生产环境（推荐）  |
| CSI （Container Storage Interface）插件 | 各种专业存储     | 企业级复杂场景   |

### 3.9 Ingress：集群的「统一门牌号」

Service 默认只能在集群内部访问，外部用户怎么访问集群里的服务呢？

最直接的方式是 **NodePort**（在每个节点上开一个端口），但生产环境通常通过 **Ingress** 来做——它就像集群的「门牌号+导航系统」：

```text
用户访问 https://api.example.com
            ↓
       Ingress Controller（门口的保安）
            ↓
  根据域名/路径路由
   ├─ /user  → user-service
   ├─ /order → order-service
   └─ /pay   → pay-service
```

Ingress 的核心功能：

- **基于域名的虚拟主机**：`api.example.com` 走 API，`admin.example.com` 走后台
- **基于路径的路由**：`/user` 走用户服务，`/order` 走订单服务
- **SSL/TLS 终止**：HTTPS 证书在 Ingress 层卸载，后端服务用 HTTP
- **负载均衡**：流量分发到后端多个 Pod

### 3.10 资源对象全景图

把上面的概念串起来，画一张完整的「K8s 资源对象协作图」：

```text
外部用户
    ↓
Ingress（统一入口 + HTTPS 终止）
    ↓
Service（稳定访问入口 + 负载均衡）
    ↓
Deployment（管理无状态应用）
    ↓
ReplicaSet（控制副本数量）
    ↓
Pod × N（实际运行容器）
    ↓
挂载 ConfigMap（配置） + Secret（密钥） + Volume（存储）
```

如果你看到这张图就开始头疼，别担心——**K8s 的核心思想就是「分层抽象」**，每一层只关注自己的职责。这种设计让系统既灵活又稳定，是工程美学的典范。

***

## 四、Master-Worker 架构：大脑与工人

理解了资源对象，我们再来看 K8s 集群的「组织架构」。

K8s 采用经典的 **Master-Worker（主从）架构**：

- **Master Node（控制平面）**：集群的「大脑」，负责决策和管理
- **Worker Node（工作节点）**：集群的「工人」，负责实际运行容器

这就像一家公司——管理层负责排兵布阵，员工负责执行任务。

### 4.1 控制平面（Control Plane）：集群的「大脑」

控制平面有 4 个核心组件（算上云厂商托管集群有 5 个）：

```text
                    ┌─────────────────────┐
                    │    API Server       │ ← 唯一入口
                    │  （前台接待员）       │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ↓                      ↓                      ↓
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Scheduler  │      │Controller Mgr│      │    etcd      │
│  （HR 分配）  │      │  （监工）     │      │  （档案室）   │
└──────────────┘      └──────────────┘      └──────────────┘
```

**① API Server：唯一入口**

API Server 是整个集群的**唯一入口**。所有的请求（kubectl 命令、Dashboard 操作、其他组件通信）都要经过它。

打个比方：API Server 就像公司的「前台接待员」——任何人想进公司办事，都得先到前台登记、验证身份、获得授权。K8s 集群里，**没有 API Server 就没有任何操作能完成**。

API Server 的核心职责：

- 提供 RESTful API 接口
- 身份认证、授权、准入控制
- 作为集群的「消息总线」，其他组件都通过它通信

**② etcd：集群的「记忆中枢」**

etcd 是一个**分布式键值数据库**，存储集群所有的状态信息——节点信息、Pod 状态、Service 配置、Secret 数据等。

类比一下：etcd 就像公司的「档案室」——所有重要文件都存在这里，谁都可以查，但必须经过前台（API Server）授权。

:::important
**etcd 是 K8s 集群最重要也最脆弱的组件**。一旦 etcd 损坏，整个集群就丢失了「记忆」，会陷入混乱。生产环境中，etcd 必须做高可用（至少 3 个节点），并定期备份。**删库跑路的最快方式就是** **`rm -rf /var/lib/etcd`**——别问我怎么知道的。
:::

**③ Scheduler：调度「军师」**

当用户创建一个新 Pod 时，Scheduler 负责决定这个 Pod 应该跑在哪台 Worker Node 上。

调度过程简单说分三步：

1. **过滤**：排除不满足条件的节点（资源不够、有污点）
2. **打分**：给剩余节点打分（资源空闲度、亲和性、负载均衡）
3. **绑定**：把 Pod 绑定到得分最高的节点

类比：Scheduler 是公司的「HR」——新人入职，HR 根据团队空缺、岗位要求把新人分配到合适部门。

**④ Controller Manager：状态「纠错员」**

Controller Manager 内部跑着几十种「控制器」，每种控制器负责维护一种资源对象的「期望状态」。

工作原理非常优雅——**控制循环（Reconcile Loop）**：

```text
循环开始
    ↓
读取期望状态（YAML 里写的）
    ↓
读取实际状态（etcd 里记录的）
    ↓
比较两者是否一致
    ↓
如果不一致 → 执行操作修复
    ↓
回到循环开始
```

举个 Deployment 的例子：用户写 YAML 说「我要 3 个副本」，Controller Manager 就一直盯着——发现只有 2 个？立刻创建一个新的。发现某个 Pod 挂了？立刻重启或重建。

**这就是 K8s「自愈能力」的来源**——不是哪里出错了去修，而是**持续监控、持续纠错，让实际状态永远逼近期望状态**。

**⑤ Cloud Controller Manager（云厂商专用）**

如果你用的是云厂商托管的 K8s（GKE、AKS、EKS），会有一个额外的组件——Cloud Controller Manager，负责与云平台的 API 交互：

- 自动创建云负载均衡器
- 挂载云存储卷
- 管理云服务器节点

这相当于公司里的「外部对接专员」——专门负责和外部合作方（云厂商）打交道。

### 4.2 工作节点（Worker Node）：真正干活的「工人」

每个 Worker Node 上跑着 3 个核心组件：

```text
┌────────────────── Worker Node ──────────────────┐
│                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │   kubelet    │  │  kube-proxy  │  │ 容器运行时│ │
│  │  （管家）      │  │  （通讯录）    │  │（操作工具）│ │
│  └──────────────┘  └──────────────┘  └─────────┘ │
│         ↓                                        │
│  ┌──────────────────────┐                        │
│  │   Pod 1 / Pod 2      │  ← 实际跑的应用         │
│  └──────────────────────┘                        │
└──────────────────────────────────────────────────┘
```

**① kubelet：节点「管家」**

kubelet 是每个 Worker Node 上的「管家」，负责管理本节点上的所有 Pod。

管家的工作清单：

- 从 API Server 领取分配到本节点的 Pod 任务
- 调用容器运行时，启动/停止/重启容器
- 监控 Pod 健康状态，定期汇报给 API Server

**② kube-proxy：网络「通讯录」**

kube-proxy 维护节点上的网络规则，实现 Service 的负载均衡功能。

工作原理：

1. 监听 API Server 中 Service 和 Endpoint 的变化
2. 在节点上维护 iptables 或 ipvs 规则
3. 当流量打到 Service 上时，按规则转发到后端 Pod

简单说：kube-proxy 是公司的「内部通讯录」——告诉你「找财务部的张三，请打内线 1001」，这样你不用记住每个人的手机号。

**③ 容器运行时：实际干活的「工人」**

容器运行时（Container Runtime）是真正负责**运行容器的软件**。

K8s 通过 **CRI（Container Runtime Interface，容器运行时接口）** 与运行时交互，这意味着 K8s 不绑定某个具体实现——Docker、containerd、CRI-O 都可以：

| 容器运行时                      | 特点                 | 现状                        |
| -------------------------- | ------------------ | ------------------------- |
| Docker Engine              | 最经典                | K8s 1.24+ 移除内置 dockershim |
| containerd                 | Docker 底层核心组件，轻量稳定 | 目前最主流                     |
| CRI-O                      | 专为 K8s 设计的轻量级运行时   | 红帽/OpenShift 默认           |
| Mirantis Container Runtime | 原 Docker 企业版       | 适合企业级场景                   |

:::caution
**K8s 1.24 版本起，不再内置 dockershim**。这意味着你直接在 K8s 节点上装 Docker，K8s 也「看」不到容器了。新版本推荐用 **containerd** 作为运行时——它本来就是 Docker 的核心组件，只是去掉了 Docker CLI、镜像构建等周边功能，更轻量、更稳定。Docker 本身仍然可以用，只是 K8s 不直接和它对接，而是和它底层的 containerd 对接。
:::

### 4.3 完整请求流程

以「创建一个 Deployment」为例，看 K8s 各组件是如何协作的：

```text
用户执行 kubectl create deployment nginx --image=nginx
    ↓
① kubectl 把命令转成 HTTP 请求，发送到 API Server
    ↓
② API Server 验证请求合法性（RBAC 权限）
    ↓
③ API Server 把 Deployment 信息写入 etcd
    ↓
④ Deployment Controller 监听到新 Deployment
    ↓
⑤ 创建对应的 ReplicaSet
    ↓
⑥ ReplicaSet Controller 监听到新 ReplicaSet
    ↓
⑦ 创建 3 个 Pod（spec.replicas=3）
    ↓
⑧ Scheduler 监听到 3 个未调度的 Pod
    ↓
⑨ 根据调度策略，给每个 Pod 选一个最合适的 Node
    ↓
⑩ 对应 Node 的 kubelet 监听到分配过来的 Pod
    ↓
⑪ kubelet 调用容器运行时，启动容器
    ↓
⑫ kube-proxy 更新网络规则，Service 可以访问这些 Pod
    ↓
⑬ 整个集群持续监控状态，确保实际与期望一致
```

这张流程图信息量很大，建议反复看几遍。**K8s 的所有高级特性（HPA 自动扩缩容、滚动更新、自愈）都是这套机制的延伸**。

***

## 五、本地环境搭建：四套主流方案

理论聊完了，**得动手把 K8s 跑起来**。本地搭建 K8s 集群有 4 种主流方案，各有适用场景。

### 5.1 方案对比

| 工具           | 节点数 | 资源占用 | 安装难度   | 适用场景              |
| ------------ | --- | ---- | ------ | ----------------- |
| **minikube** | 单节点 | 中等   | ⭐ 简单   | 学习、入门、单机测试        |
| **k3s**      | 多节点 | 极低   | ⭐⭐ 较简单 | 边缘设备、IoT、资源有限的服务器 |
| **k3d**      | 多节点 | 低    | ⭐ 简单   | CI/CD 流水线、快速测试    |
| **kind**     | 多节点 | 低    | ⭐ 简单   | K8s 本身的开发和测试      |

:::warning
**以上所有方案都只适合本地开发和学习，绝对不能用于生产环境**。生产环境需要多 Master 节点高可用，至少 3 个 etcd 副本，建议用 kubeadm 部署或直接用云厂商的托管 K8s 服务（GKE、AKS、EKS）。
:::

### 5.2 方案一：minikube（最简单）

minikube 是 **K8s 官方推荐的本地开发工具**，可以在本地启动一个单节点的 K8s 集群。

**安装步骤（以 Mac 为例）**：

```bash
# 1. 安装 minikube（会自动安装 kubectl）
brew install minikube

# 2. 启动集群（首次启动会下载镜像，可能较慢）
minikube start --driver=docker

# 3. 国内网络环境可以使用镜像加速
minikube start --image-mirror-country=cn

# 4. 查看集群状态
minikube status
kubectl get nodes
```

**验证集群是否就绪**：

```bash
$ kubectl get nodes
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.28.0
```

看到 `Ready` 就说明集群跑起来了。

### 5.3 方案二：Multipass + K3s（多节点）

minikube 是单节点，但生产环境都是多节点的。**想体验真实的 K8s 多节点调度，得用 K3s**。

K3s 是 Rancher 开发的**轻量级 K8s 发行版**：

- 二进制文件小于 100MB
- 一条命令就能安装
- 集成了 containerd、Flannel 网络插件、local storage

搭配 **Multipass**（Canonical 开发的轻量级虚拟机工具），我们就能在本地搭出 1 主 2 从的集群：

```bash
# 1. 安装 Multipass 后，创建 3 个 Ubuntu 虚拟机
multipass launch --name k3s-master --cpus 2 --mem 4G --disk 20G
multipass launch --name k3s-worker1 --cpus 2 --mem 4G --disk 20G
multipass launch --name k3s-worker2 --cpus 2 --mem 4G --disk 20G

# 2. 在 master 节点安装 K3s
multipass exec k3s-master -- bash -c "curl -sfL https://get.k3s.io | sh -"

# 3. 获取节点加入 token
multipass exec k3s-master -- sudo cat /var/lib/rancher/k3s/server/node-token

# 4. 在 worker 节点加入集群（替换 <MASTER_IP> 和 <TOKEN>）
multipass exec k3s-worker1 -- bash -c "curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 K3S_TOKEN=<TOKEN> sh -"
multipass exec k3s-worker2 -- bash -c "curl -sfL https://get.k3s.io | K3S_URL=https://<MASTER_IP>:6443 K3S_TOKEN=<TOKEN> sh -"

# 5. 验证集群（ssh 到 master 节点后执行）
kubectl get nodes
```

**预期输出**：

```bash
$ kubectl get nodes
NAME          STATUS   ROLES                  AGE   VERSION
k3s-master    Ready    control-plane,master   5m    v1.28.0+k3s1
k3s-worker1   Ready    <none>                 2m    v1.28.0+k3s1
k3s-worker2   Ready    <none>                 2m    v1.28.0+k3s1
```

:::note
**关于 SSH 免密登录**：默认 Multipass 创建的虚拟机不允许 SSH 远程登录。如果你觉得每次都要 `multipass shell xxx` 麻烦，可以配置 SSH 免密登录。配置完成后，还能用 `alias k3s='ssh ubuntu@<IP>'` 设置命令别名，一个字母登录到 K8s master 节点——K8s 学习效率直接翻倍。
:::

### 5.4 方案三：在线实验平台

如果连本地环境都懒得搭，还有两个**免安装的在线实验平台**：

| 平台                   | 网址                               | 特点                  |
| -------------------- | -------------------------------- | ------------------- |
| KillerCoda           | <https://killercoda.com>         | 课程丰富，无需注册即可使用基础功能   |
| Play with Kubernetes | <https://labs.play-with-k8s.com> | Docker 官方维护，免费 4 小时 |

这些平台对**临时验证某个命令或概念**非常方便，缺点是**有时间限制、网络可能卡顿**，不适合系统性学习。

### 5.5 方案选择建议

- **第一次学 K8s**：用 minikube，最简单
- **想体验多节点调度**：用 Multipass + K3s
- **CI/CD 流水线**：用 k3d（容器启动极快）
- **临时验证**：用 KillerCoda

个人推荐学习路径：**minikube 入门 → K3s 多节点 → 云厂商托管集群**。

***

## 六、kubectl 速成：指挥官的命令行

环境搭好了，下一步就是学**怎么和 K8s 集群交互**。答案是 **kubectl**——K8s 官方命令行工具。

### 6.1 kubectl 是什么？

kubectl 是用户和 K8s 集群交互的\*\*「对讲机」\*\*——你按按钮（输入命令），集群那边就有人（API Server）响应。

它支持的功能非常全面：

- 创建、查看、修改、删除各种资源对象
- 查看日志、进入容器执行命令
- 端口转发、本地调试

### 6.2 与集群交互的三种方式

| 方式         | 工具                    | 适用场景         |
| ---------- | --------------------- | ------------ |
| **命令行**    | kubectl               | 日常操作、功能最强大   |
| **Web UI** | Dashboard / Portainer | 直观展示、新手友好    |
| **API 接口** | 程序化调用                 | 自动化、CI/CD 集成 |

**99% 的场景都是用 kubectl**。

### 6.3 kubectl 常用命令速查

**资源查看**：

```bash
# 查看所有节点
kubectl get nodes

# 查看所有 Pod
kubectl get pods

# 查看所有 Deployment
kubectl get deployments

# 查看所有 Service
kubectl get services

# 一键查看所有资源（方便快速浏览）
kubectl get all

# 查看详细信息（事件、状态、IP 等）
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>
```

**资源操作**：

```bash
# 命令式创建（适合临时测试）
kubectl run nginx --image=nginx

# 声明式创建（生产环境推荐）
kubectl apply -f nginx-deployment.yaml

# 在线编辑资源
kubectl edit deployment nginx-deployment

# 删除资源
kubectl delete deployment nginx-deployment
kubectl delete -f nginx-deployment.yaml
```

**调试排错**：

```bash
# 查看 Pod 日志
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # -f 实时跟踪

# 进入 Pod 内部执行命令
kubectl exec -it <pod-name> -- /bin/bash

# 端口转发（本地调试神器）
kubectl port-forward pod/<pod-name> 8080:80
# 然后访问 http://localhost:8080 就能看到 Pod 里的服务
```

### 6.4 kubectl create vs kubectl apply

这两个命令的区别，是新手最容易搞混的：

| 命令               | 工作方式    | 适用场景                  |
| ---------------- | ------- | --------------------- |
| `kubectl create` | **命令式** | 资源不存在则创建，存在则报错        |
| `kubectl apply`  | **声明式** | 资源不存在则创建，存在则按 YAML 更新 |

举个实际场景：

```bash
# 用 create 部署
kubectl create -f nginx.yaml     # 成功，资源被创建
kubectl create -f nginx.yaml     # 报错：资源已存在

# 用 apply 部署
kubectl apply -f nginx.yaml      # 成功，资源被创建
# 修改 nginx.yaml 副本数为 5
kubectl apply -f nginx.yaml      # 成功，副本数变成 5
```

:::important
**生产环境永远用** **`kubectl apply`**。声明式的好处是「**幂等性**」——你反复执行同一个命令，集群状态都和 YAML 描述一致。这在 CI/CD 流水线、GitOps 场景下至关重要——你不希望每次发布都要担心「这是第几次执行」。
:::

### 6.5 kubectl 的工作流程

kubectl 命令背后发生了什么？简单说 5 步：

```text
用户输入 kubectl get pods
    ↓
① kubectl 把命令转成 HTTP 请求
    ↓
② 发送到 API Server（默认 https://<master-ip>:6443）
    ↓
③ API Server 验证身份，从 etcd 查询数据
    ↓
④ API Server 把数据返回给 kubectl
    ↓
⑤ kubectl 格式化输出，展示在终端上
```

理解这个流程对**排查 K8s 故障**非常重要——当你执行命令没反应时，至少知道问题可能出在 kubectl → API Server → etcd 这条链路的某个环节。

***

## 七、YAML 声明式配置：把愿望写在文档里

生产环境管理 K8s 资源，**几乎不用命令行**，而是用 **YAML 配置文件**。

### 7.1 YAML 文件四段式结构

K8s 的 YAML 看起来吓人，其实结构非常固定——**四段式**：

```yaml
apiVersion: v1          # ① 用哪个版本的 API
kind: Pod               # ② 什么类型的资源
metadata:               # ③ 元数据（名字、标签等）
  name: my-pod
  labels:
    app: nginx
spec:                   # ④ 期望状态（详细配置）
  containers:
  - name: nginx
    image: nginx:1.25
    ports:
    - containerPort: 80
```

**字段解释**：

| 字段           | 作用             | 常见值                                    |
| ------------ | -------------- | -------------------------------------- |
| `apiVersion` | API 版本，定义了字段规范 | `v1`、`apps/v1`、`networking.k8s.io/v1`  |
| `kind`       | 资源类型           | `Pod`、`Deployment`、`Service`、`Ingress` |
| `metadata`   | 资源元数据          | name、labels、namespace、annotations      |
| `spec`       | 期望状态           | 各种资源类型有不同的 spec 字段                     |

### 7.2 Deployment YAML 完整示例

```yaml
apiVersion: apps/v1
# 资源类型：Deployment（属于 apps 组）
kind: Deployment

metadata:
  # Deployment 的名字
  name: nginx-deployment
  # 标签：方便其他资源通过标签选择器找到它
  labels:
    app: nginx
    env: production

spec:
  # 副本数量：始终保持 3 个 Pod 在运行
  replicas: 3
  # 标签选择器：管理哪些 Pod
  selector:
    matchLabels:
      app: nginx
  # Pod 模板：定义要创建的 Pod 长什么样
  template:
    metadata:
      # Pod 的标签（必须和上面 selector.matchLabels 一致）
      labels:
        app: nginx
    spec:
      # Pod 内的容器列表
      containers:
        - name: nginx
          # 使用的镜像
          image: nginx:1.25
          # 容器暴露的端口
          ports:
            - containerPort: 80
          # 资源限制（推荐设置，防止 Pod 占用过多资源）
          resources:
            requests:
              memory: "64Mi"
              cpu: "250m"
            limits:
              memory: "128Mi"
              cpu: "500m"
```

**关键字段解读**：

- `replicas: 3`：告诉 K8s「我要 3 个副本」，K8s 会自动保证
- `selector.matchLabels`：Deployment 通过这个标签找到它要管理的 Pod
- `template.metadata.labels`：Pod 的标签，**必须包含所有 selector.matchLabels**，否则 Deployment 会认为自己不拥有这些 Pod 而报错
- `containers`：Pod 内运行的容器列表（大多数情况下只有一个容器）

### 7.3 Service YAML 完整示例

光有 Deployment 还不够——外部怎么访问这些 Pod？需要 Service：

```yaml
apiVersion: v1
# 资源类型：Service（属于核心 v1 组）
kind: Service

metadata:
  # Service 的名字
  name: nginx-service
  labels:
    app: nginx

spec:
  # Service 类型：ClusterIP（默认，集群内部访问）
  type: ClusterIP
  # 标签选择器：找哪些 Pod 属于这个 Service
  selector:
    app: nginx
  # 端口映射
  ports:
    - name: http
      protocol: TCP
      # Service 对外暴露的端口（集群内访问用这个）
      port: 80
      # 后端 Pod 监听的端口
      targetPort: 80
```

部署完 Deployment + Service 后，集群内部就可以通过 `nginx-service:80` 访问到 3 个 Pod 中的任意一个了——Service 自动负载均衡。

### 7.4 自愈能力的原理

为什么 K8s 有「自愈能力」？秘密藏在 **控制循环** 里。

```text
      期望状态（YAML 文件）
              ↓
      ┌───────────────┐
      │   持续比对      │ ← 控制器不断循环
      │  期望 vs 实际   │
      └───────┬───────┘
              ↓ 不一致
      ┌───────────────┐
      │  执行修复操作    │ ← 创建/删除/重启
      └───────┬───────┘
              ↓
      实际状态（集群现状）
              ↓
            回到循环
```

举个具体例子：

- 你写了 `replicas: 3`
- 实际集群有 3 个 Pod → 一致，啥也不做
- 某个 Pod 挂了，实际剩 2 个 → 不一致，**自动创建第 3 个**
- 你修改 YAML 把 `replicas` 改成 5 → 不一致，**自动创建 2 个新的**

**这就是 K8s 的精髓——你只描述「想要什么」，K8s 负责「变成现实」**。所有的高级特性（自动扩缩容、滚动更新、故障自愈）都是这套机制的延伸。

:::tip
**一个常见的思维误区**：很多新手以为 K8s 会「按你的命令执行」——其实 K8s 是「按你的目标持续调整」。理解这个区别，你就理解了为什么 K8s 修改配置后不需要重启服务（控制循环会自己发现差异并应用新配置）。
:::

***

## 八、Service 五大类型：把服务搬上互联网

前面我们用了 `ClusterIP` 类型的 Service，它是**只能在集群内部访问**的。但业务最终要面向用户——怎么让外部用户访问到 K8s 集群里的服务？

K8s 提供了 **5 种 Service 类型**，对应不同的访问场景。

### 8.1 类型对比

| 类型               | 特点                     | 适用场景     | 外部访问方式           |
| ---------------- | ---------------------- | -------- | ---------------- |
| **ClusterIP**    | 默认类型，集群内部 IP           | 集群内部服务通信 | ❌ 集群外无法访问        |
| **NodePort**     | 在每个节点开固定端口             | 开发测试环境   | ✅ 节点 IP:NodePort |
| **LoadBalancer** | 云厂商负载均衡器               | 生产环境（云上） | ✅ 负载均衡器域名        |
| **ExternalName** | CNAME 映射到外部域名          | 访问集群外服务  | ❌ 集群内部代理         |
| **Headless**     | 无 ClusterIP，DNS 直连 Pod | 有状态应用    | 视场景而定            |

### 8.2 ClusterIP：默认的「内部服务」

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP        # 默认值，可省略
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080
```

适用场景：

- 数据库服务（MySQL、Redis）只允许内部访问
- 微服务之间互相调用
- 任何不需要外部直接访问的「幕后服务」

### 8.3 NodePort：开发测试的「临时工」

NodePort 在每个 Worker Node 上开放一个**固定端口**（范围 30000-32767），外部可以通过 `节点IP:NodePort` 访问：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: NodePort
  selector:
    app: web
  ports:
  - port: 80              # Service 内部端口
    targetPort: 8080      # Pod 监听端口
    nodePort: 30080       # 节点上对外的端口
```

访问方式：

```bash
# 任意节点的 IP + 30080 端口
http://<任意节点IP>:30080
```

:::caution
**NodePort 只适合开发测试**。生产环境用 NodePort 的问题：

- 端口范围有限（30000-32767），服务多了不够用
- 端口需要手动管理，运维成本高
- 没有自动负载均衡（需要外部再加一层 LB）
- HTTPS 证书管理麻烦

**生产环境请用 LoadBalancer 或 Ingress**。
:::

### 8.4 LoadBalancer：生产环境的「正式员工」

如果你的 K8s 跑在云厂商（GKE、AKS、AWS EKS、阿里云 ACK、腾讯云 TKE），可以直接创建 LoadBalancer 类型的 Service——云厂商会自动创建一个**云负载均衡器**：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 8080
```

云厂商自动创建的负载均衡器会：

- 分配一个公网 IP
- 自动转发到所有 Worker Node 的对应端口
- 提供健康检查、自动剔除故障节点

这是云上 K8s 部署最简单的方式，**缺点是每个 Service 都要一个负载均衡器，成本较高**。

### 8.5 Ingress：性价比最高的「门牌号」

如果你的服务非常多（几十个），用 LoadBalancer 成本太高。这时候就需要 **Ingress**——一个集群共用一个公网入口：

```text
                  https://api.example.com
                            ↓
                  ┌──────────────────────┐
                  │  Ingress Controller  │ ← 一个集群共用一个 LB
                  └──────────┬───────────┘
                             ↓
                ┌────────────┼────────────┐
                ↓            ↓            ↓
         /user 服务     /order 服务    /pay 服务
```

Ingress 通过「域名 + 路径」实现路由分发，一个 Ingress 可以管理几十个 Service，对外只需要一个负载均衡器。

Ingress + TLS 终止示例（最常见的生产配置）：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web-ingress
  annotations:
    # 使用 cert-manager 自动管理证书
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.example.com
    secretName: api-tls-secret  # 自动生成的证书
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /user
        pathType: Prefix
        backend:
          service:
            name: user-service
            port:
              number: 80
      - path: /order
        pathType: Prefix
        backend:
          service:
            name: order-service
            port:
              number: 80
```

### 8.6 类型选择决策树

```text
服务需要被外部访问吗？
    ├─ 否 → ClusterIP（默认）
    │
    └─ 是
        ├─ 在云上 → LoadBalancer 或 Ingress
        ├─ 自建机房 → Ingress + NodePort
        └─ 只是开发测试 → NodePort
```

***

## 九、实战：用 Portainer 可视化管理 K8s

命令行虽然强大，但**对新手不够友好**。这时候就可以用 **Portainer**——一个轻量级的容器管理平台，支持 Docker、Swarm、K8s。

类比一下：**kubectl 是手动挡，Portainer 是自动挡**——前者灵活但累，后者简单但够用。

### 9.1 命名空间（Namespace）：资源隔离的「文件夹」

部署 Portainer 之前，我们先理解 **Namespace** 的概念。

Namespace 是 K8s 的**资源隔离机制**——把资源分成不同的「文件夹」，不同 Namespace 里的资源互不干扰：

```text
default 命名空间      portainer 命名空间
├── web-service       ├── portainer-deployment
├── mysql-service     ├── portainer-service
└── redis-service     └── portainer-pvc
```

不指定 Namespace 时，资源默认在 `default` 命名空间。K8s 自带 4 个系统命名空间：

| 命名空间              | 用途                          |
| ----------------- | --------------------------- |
| `default`         | 默认命名空间，自定义资源放这里             |
| `kube-system`     | K8s 系统组件（API Server、etcd 等） |
| `kube-public`     | 公共信息（所有用户可读）                |
| `kube-node-lease` | 节点心跳信息                      |

### 9.2 Portainer 部署流程

Portainer 的部署非常优雅——一个 YAML 文件搞定：

```yaml
# portainer.yaml
---
# 1. 创建命名空间
apiVersion: v1
kind: Namespace
metadata:
  name: portainer

---
# 2. 创建 ServiceAccount（Portainer 操作 K8s 的身份）
apiVersion: v1
kind: ServiceAccount
metadata:
  name: portainer-sa-clusteradmin
  namespace: portainer

---
# 3. 绑定集群管理员权限
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: portainer-crb-clusteradmin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: portainer-sa-clusteradmin
    namespace: portainer

---
# 4. 部署 Portainer
apiVersion: apps/v1
kind: Deployment
metadata:
  name: portainer
  namespace: portainer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: portainer
  template:
    metadata:
      labels:
        app: portainer
    spec:
      serviceAccountName: portainer-sa-clusteradmin
      containers:
        - name: portainer
          image: portainer/portainer-ce:2.19.0
          args:
            - --tunnel-host=0.0.0.0
            - --tunnel-port=30776
          ports:
            - containerPort: 9000
              name: http
            - containerPort: 30776
              name: tunnel
          volumeMounts:
            - name: data
              mountPath: /data
      volumes:
        - name: data
          emptyDir: {}  # 仅用于演示，Pod 重建后数据会丢失；生产环境请替换为 PersistentVolumeClaim

---
# 5. 暴露服务（NodePort 方式，方便开发测试访问）
apiVersion: v1
kind: Service
metadata:
  name: portainer-service
  namespace: portainer
spec:
  type: NodePort
  selector:
    app: portainer
  ports:
    - name: http
      port: 9000
      targetPort: 9000
      nodePort: 30777
```

**执行部署**：

```bash
# 一条命令部署所有资源
kubectl apply -n portainer -f portainer.yaml

# 查看部署状态
kubectl get all -n portainer
```

**预期输出**：

```bash
$ kubectl get all -n portainer
NAME                            READY   STATUS    RESTARTS   AGE
pod/portainer-7d4f8c9b8d-x2k4m  1/1     Running   0          30s

NAME                       TYPE       CLUSTER-IP    EXTERNAL-IP   PORT(S)         AGE
service/portainer-service  NodePort   10.96.45.123  <none>        9000:30777/TCP  30s

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/portainer  1/1     1            1           30s
```

### 9.3 访问 Portainer

部署完成后，在浏览器输入 `http://<任意节点IP>:30777`：

1. 第一次访问会要求创建管理员账号（密码至少 12 位）
2. 选择「Get Started」连接到本地集群
3. 进入管理界面后，可以可视化操作：
   - 查看/创建/删除各种资源
   - 查看 Pod 日志
   - 进入 Pod 内部执行命令
   - 使用 Helm Chart 一键部署应用
   - 管理命名空间、用户、权限

:::tip
**Portainer 的优势** 是把 K8s 的复杂操作图形化了——对于不熟悉 kubectl 的同学，Web 界面更友好。但生产环境**还是建议用 kubectl + YAML**，因为：

- 配置文件可以纳入 Git 版本管理（GitOps）
- 自动化流水线友好
- 命令行操作可以远程脚本化
- Web 界面在权限管理、审计追溯上较弱

**最佳实践是两者结合**：日常管理用 Portainer，CI/CD 和复杂操作用 kubectl。
:::

***

## 十、总结与展望

### 10.1 一句话总结

如果说 Docker 是「标准化的快递箱」，那 K8s 就是「调度全城快递的智能物流公司」——它让成千上万的容器像一支训练有素的军队，统一指挥、自我修复、按需扩缩。

### 10.2 学习路径建议

K8s 的知识体系庞大，本文只是入门级科普。要深入掌握，建议按这个路径走：

```text
入门（本文已覆盖）
  ├─ 核心资源对象（Pod/Service/Deployment）
  ├─ 基础架构（Master-Worker）
  ├─ 命令行工具（kubectl）
  └─ YAML 声明式配置

进阶
  ├─ Helm 包管理（K8s 的「应用商店」）
  ├─ ConfigMap / Secret / Volume 深入
  ├─ Ingress + cert-manager（HTTPS 自动化）
  ├─ StatefulSet + PersistentVolume（有状态应用）
  └─ HPA（自动扩缩容）

高级
  ├─ Operator 模式（自定义资源）
  ├─ Service Mesh（Istio 服务网格）
  ├─ GitOps（Argo CD / Flux）
  └─ 可观测性（Prometheus + Grafana）
```

### 10.3 与已有体系的关联

我写过一篇 [主流项目监控技术栈解析](../编程生涯主流项目监控技术栈解析/)，讲了 Prometheus + Grafana + LGTM 栈的可观测性体系。

**两篇文章的关联是这样的**：

- K8s 解决的是**应用部署和调度**的问题
- 可观测性解决的是**应用运行状态的感知**问题

它们是云原生体系里**互补的两块拼图**——K8s 负责「让应用跑起来」，可观测性负责「让应用跑得清楚」。生产环境里，两者缺一不可。

再往回看，**我这两年的技术成长路径其实是一条清晰的「云原生学习链」**：

```text
2023.12  Docker 容器化        → 解决「单个应用怎么跑」
2024.01  微服务架构           → 解决「复杂业务怎么拆」
2026.06  Kubernetes 编排      → 解决「成百上千容器怎么管」
2026.06  可观测性体系         → 解决「容器多了怎么知道状态」
```

下一步，我准备继续深入 **Helm 包管理 + Operator 模式**——把 K8s 的能力真正用起来，而不只是停留在「会用 kubectl 跑命令」的层面。

### 10.4 写在最后

K8s 的学习曲线是陡峭的——核心概念就有几十个，YAML 字段动辄上百个，集群故障排查需要懂网络、懂存储、懂 Linux。

但请记住：**K8s 的核心思想其实很简单——「声明式」+「控制循环」**。

你看那些眼花缭乱的资源对象、各种控制器、调度策略，本质上都是「**你描述目标，系统持续监控并逼近目标**」这一思想的展开。理解了这个思想，再看任何 K8s 特性，都不会觉得神秘。

学习 K8s 没有捷径，**最好的方法就是动手**——搭一个 minikube，跑一个 Nginx Deployment，看它怎么自动重启、怎么滚动更新、怎么自愈。

写完这篇，我的 K8s 学习算是迈出了第一步。后续会有更多实战文章（Helm 打包、Ingress 配置、生产集群部署等），敬请期待。

***

*更多 K8s 资料可查看* *[Kubernetes 官方文档](https://kubernetes.io/zh-cn/docs/)；有问题可在 GitHub Issue 提问。*
