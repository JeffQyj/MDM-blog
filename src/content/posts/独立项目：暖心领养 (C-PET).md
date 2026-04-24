---
title: 独立项目：暖心领养 (C-PET)
published: 2025-07-16
description: 基于 React + 腾讯云 CloudBase 开发的宠物在线领养平台，从蝶梦的单后台到双端完整系统的技术升级之路，包含用户端和管理端的完整实现。
tags: [React, CloudBase]
category: 独立项目
draft: false
lang: zh_CN
---

:::tip
2025 年 7 月，我完成了「暖心领养（C-PET）」项目的开发。时隔一年，从蝶梦的单后台管理系统，到这次双端完整系统的实现，技术栈、架构思路、开发模式都发生了质的转变。这不是一次简单的功能补充，而是一次从「借助脚手架」到「纯粹独立开发」的全链路进化。
:::

## 项目背景

### 蝶梦的遗憾

在[蝶梦后台管理系统](file:///e:\A_One_Year_Learning\Project\Secondary_Dev_Road\MDM-blog\src\content\posts\二次开发：蝶梦后台管理系统.md)中，我详细记录了第一次完全独立完成毕设项目的全过程。拿到优秀的那一刻确实激动，但冷静下来，蝶梦有一个致命的遗憾：

**只有管理后台，没有用户前台。**

这意味着：

- 用户无法自主浏览宠物
- 用户无法自主提交领养申请
- 所有操作都需要管理员代为完成
- 整个领养流程是一个「半成品」

这个问题在蝶梦的文章结尾也被列为首要改进方向。

### C-PET 的定位

「暖心领养（C-PET）」定位为**面向普通用户的宠物在线领养平台**，核心解决：

| 用户角色  | 核心诉求             | C-PET 支撑    |
| ----- | ---------------- | ----------- |
| 普通用户  | 自主浏览宠物、提交申请、追踪进度 | C-PET 用户端 ✅ |
| 平台管理员 | 宠物管理、申请审核、数据统计   | C-PET 管理端 ✅ |

与蝶梦的区别：

| 维度   | 蝶梦                   | C-PET                         |
| ---- | -------------------- | ----------------------------- |
| 用户端  | ❌ 无                  | ✅ 完整用户端                       |
| 管理端  | ✅ 基础功能               | ✅ 功能完善 + RBAC                 |
| 架构   | 传统 MVC（Java + MySQL） | Serverless（React + CloudBase） |
| 开发模式 | 借助 RuoYi 脚手架         | 完全独立开发                        |

:::note
蝶梦让我学会了「如何用框架搭系统」，C-PET 让我学会了「如何从零设计系统」。这是本质的区别。
:::

***

## 技术架构

### 为什么选择 Serverless

蝶梦采用的是传统的 Spring Boot + MySQL 架构，这套方案成熟稳定，但有几个痛点：

| 痛点    | 蝶梦的实际情况                |
| ----- | ---------------------- |
| 服务器运维 | 需要自己购买云服务器、配置环境、部署     |
| 扩缩容   | 大促活动时可能扛不住，平时又浪费       |
| 开发效率  | 很多基础设施代码（CRUD、权限）需要重复写 |

C-PET 选型时，我认真对比了三个方案：

| 方案             | 代表技术                  | 优势                | 劣势               |
| -------------- | --------------------- | ----------------- | ---------------- |
| 传统 MVC         | Spring Boot + MySQL   | 生态成熟，资料多          | 运维成本高            |
| 私有部署           | Nuxt.js + MySQL       | SEO 友好            | 仍需服务器            |
| **Serverless** | **React + CloudBase** | **免运维、自动扩缩容、一站式** | **生态较新，需要适应新模式** |

**最终选择 Serverless**，原因是：

1. **免运维**：不需要买服务器，不需要配环境变量
2. **成本低**：按调用次数计费，初期几乎零成本
3. **一站式**：数据库、云函数、认证、部署全部搞定

### 技术栈一览表

| 维度    | 技术选型                  | 通俗比喻           |
| ----- | --------------------- | -------------- |
| 前端框架  | React 18 + TypeScript | 现代装修队 + 精确施工图  |
| 构建工具  | Vite                  | 快速装修引擎         |
| UI 框架 | Ant Design 5 / Pro    | 宜家家具城          |
| 后端服务  | 腾讯云 CloudBase         | 物业一体化服务中心      |
| 数据库   | 云数据库（文档型）             | 灵活储物柜（想放什么放什么） |
| 云函数   | CloudBase 云函数         | 按需召唤的服务员       |
| 认证服务  | CloudBase 认证          | 智能门禁系统         |
| 状态管理  | Zustand（管理端）          | 记事本            |

### 架构图（数据流）

```
                    ┌─────────────────────────────────────────────────┐
                    │                 CloudBase 云服务                │
                    │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
┌──────────┐        │  │  数据库集合   │  │  云函数     │  │  认证服务  │  │
│ React SPA │ ──────▶ │  │  pets       │  │  getStats   │  │  微信登录  │  │
│  用户端    │        │  │  users      │  │  batchOpt   │  │  手机登录  │  │
└──────────┘        │  │  applications│  │  sendNotify │  │           │  │
                    │  └─────────────┘  └─────────────┘  └───────────┘  │
┌──────────┐        │         │                │                │      │
│ React SPA │ ──────▶ │         └────────────────┴────────────────┘      │
│  管理端    │        │                      │                          │
└──────────┘        │                      ▼                          │
                    │            ┌─────────────────┐                   │
                    │            │   静态网站托管    │                   │
                    │            │   + CDN 加速     │                   │
                    │            └─────────────────┘                   │
                    └─────────────────────────────────────────────────┘
```

:::tip
**Serverless 的核心思想**：把「运维服务器」这件事交给云厂商，开发者只关心业务逻辑。就像住酒店，不需要自己盖楼、打扫卫生、缴物业费，只需要「入住」和「退房」。
:::

***

## 核心组件详解

### 1. 云函数：按需召唤的服务员

#### 为什么需要云函数？

传统架构中，后端逻辑写在 Tomcat/Java 应用里，24 小时运行。但在 Serverless 模式下，前端不能直接操作数据库（安全风险），需要一个「按需调用」的后端逻辑层。

**通俗类比**：

| 概念   | 传统模式     | Serverless 模式 |
| ---- | -------- | ------------- |
| 后端逻辑 | 店里的长驻服务员 | 按需召唤的临时工      |
| 运行状态 | 24 小时待命  | 有人点餐才来        |
| 费用   | 固定工资     | 按次计费          |

#### 云函数核心代码

```javascript
/**
 * 获取统计数据云函数
 *
 * 核心功能：
 * 1. 聚合查询宠物总数、申请待审核数等
 * 2. 返回格式化的统计数据
 * 3. 支持时间范围筛选
 *
 * 触发方式：前端通过 SDK 调用
 */
const cloud = require('cloudbase');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  
  // 获取查询参数（支持时间范围筛选）
  const { startDate, endDate } = event;
  
  try {
    // 1. 统计宠物总数
    const petCountResult = await db.collection('pets').count();
    
    // 2. 统计待审核申请数
    const pendingCountResult = await db.collection('applications')
      .where({ status: 'pending' })
      .count();
    
    // 3. 统计本月新增宠物（按时间筛选）
    const thisMonthPets = await db.collection('pets')
      .where({
        createTime: _.gte(startDate).and(_.lte(endDate))
      })
      .count();
    
    // 4. 返回统计数据
    return {
      success: true,
      data: {
        totalPets: petCountResult.total,
        pendingApplications: pendingCountResult.total,
        newPetsThisMonth: thisMonthPets.total
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

#### 云函数调用方式

```typescript
// 前端调用云函数
import cloud from '@/utils/cloud';

// 获取统计数据
const getStatistics = async () => {
  try {
    const res = await cloud.callFunction({
      name: 'getStats',  // 云函数名称
      data: {
        startDate: '2025-07-01',
        endDate: '2025-07-31'
      }
    });
    
    if (res.success) {
      return res.data;
    }
  } catch (error) {
    console.error('获取统计数据失败', error);
  }
};
```

### 2. 数据库：灵活储物柜

#### 文档型数据库 vs 关系型数据库

蝶梦用的是 MySQL 关系型数据库，C-PET 用的是云数据库文档型。两者区别：

| 维度   | MySQL（蝶梦） | 云数据库（C-PET） |
| ---- | --------- | ----------- |
| 数据结构 | 固定表结构     | 灵活 JSON 文档  |
| 关联查询 | JOIN 语句   | 嵌套查询或多次查询   |
| 扩展性  | 需改表结构     | 直接加字段       |
| 适用场景 | 强关联、结构固定  | 业务多变、迭代快速   |

#### 集合设计

```javascript
// pets 集合（宠物信息）
{
  _id: "pet_001",
  name: "橘子",
  type: "cat",           // 宠物类型
  breed: "橘猫",
  age: "2岁",
  gender: "male",
  size: "medium",        //体型：small/medium/large
  images: [              // 图片数组（支持多图）
    "cloud://xxx/pet1.jpg",
    "cloud://xxx/pet2.jpg"
  ],
  description: "性格温顺，喜欢粘人...",
  status: "available",   // available/adopting/adopted
  health: "已绝育、已驱虫",
  createTime: "2025-07-01",
  updateTime: "2025-07-15"
}

// users 集合（用户信息）
{
  _id: "user_001",
  nickname: "爱猫人士",
  avatar: "cloud://xxx/avatar.jpg",
  phone: "138****8888",
  role: "user",          // user/admin
  petsCollected: ["pet_001", "pet_002"],  // 已领养宠物
  createTime: "2025-06-01"
}

// applications 集合（领养申请）
{
  _id: "app_001",
  petId: "pet_001",
  userId: "user_001",
  reason: "我很喜欢小动物，有稳定的居住环境...",
  experience: "养过3只猫，有经验",
  status: "pending",     // pending/approved/rejected
  auditRemark: "",
  auditTime: null,
  createTime: "2025-07-10",
  updateTime: "2025-07-10"
}
```

:::note
**文档型数据库的优势**：宠物图片是多张，就用数组；用户收藏夹是动态列表，就用数组。不需要像 MySQL 那样建关联表。
:::

### 3. 认证服务：智能门禁系统

#### 为什么选择 CloudBase 认证？

C-PET 支持两种登录方式：

| 登录方式  | 适用场景  | 实现难度         |
| ----- | ----- | ------------ |
| 微信登录  | 网页端用户 | ⭐⭐⭐⭐⭐（需微信认证） |
| 手机号登录 | 所有用户  | ⭐⭐⭐（云开箱即用）   |

#### 认证流程

```typescript
// 用户端认证服务
import cloud from '@/utils/cloud';

/**
 * 手机号登录
 *
 * 流程：
 * 1. 用户输入手机号
 * 2. 调用云函数发送验证码
 * 3. 用户输入验证码
 * 4. 云函数验证并返回登录态
 */
export const loginWithPhone = async (phone: string, code: string) => {
  try {
    const res = await cloud.callFunction({
      name: 'loginWithPhone',
      data: { phone, code }
    });

    if (res.success) {
      // 保存登录态到本地
      localStorage.setItem('userInfo', JSON.stringify(res.data.userInfo));
      localStorage.setItem('token', res.data.token);
    }

    return res;
  } catch (error) {
    console.error('登录失败', error);
  }
};

/**
 * 微信登录（网页端）
 */
export const loginWithWechat = async () => {
  try {
    // 调用云函数进行微信授权登录
    const result = await cloud.callFunction({
      name: 'loginWithWechat',
      data: {}
    });
    return result;
  } catch (error) {
    console.error('微信登录失败', error);
  }
};
```

了解了核心组件的工作原理，接下来进入业务模块实战，看看这些组件是如何协同工作的。

***

## 业务模块实战

### 模块一：宠物浏览与筛选

#### 业务场景

用户打开网页，首先看到的是宠物列表页。核心需求：

| 功能    | 说明                      |
| ----- | ----------------------- |
| 多维度筛选 | 按类型（猫/狗）、体型（小/中/大）、性别筛选 |
| 关键词搜索 | 按宠物名称模糊搜索               |
| 视图切换  | 列表视图 ↔ 网格视图             |
| 分页加载  | 一次加载 10 条，下拉加载更多        |

#### 核心代码

```typescript
// hooks/usePets.ts
import { useState, useEffect } from 'react';
import cloud from '@/utils/cloud';

interface PetFilters {
  type?: 'cat' | 'dog' | 'other';
  size?: 'small' | 'medium' | 'large';
  gender?: 'male' | 'female';
  keyword?: string;
  page?: number;
  pageSize?: number;
}

interface Pet {
  _id: string;
  name: string;
  type: string;
  images: string[];
  status: string;
}

/**
 * 宠物列表 Hook
 *
 * 核心功能：
 * 1. 支持多维度筛选
 * 2. 自动分页加载
 * 3. 加载状态管理
 */
export const usePets = (initialFilters: PetFilters = {}) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<PetFilters>(initialFilters);

  // 加载宠物列表
  const loadPets = async (append = false) => {
    setLoading(true);
    
    try {
      const res = await cloud.callFunction({
        name: 'getPets',
        data: {
          ...filters,
          // 分页参数
          offset: append ? pets.length : 0,
          limit: filters.pageSize || 10
        }
      });
      
      if (res.success) {
        const newPets = res.data.pets;
        
        // 追加模式 vs 替换模式
        setPets(prev => append ? [...prev, ...newPets] : newPets);
        // 判断是否还有更多
        setHasMore(newPets.length === (filters.pageSize || 10));
      }
    } catch (error) {
      console.error('加载宠物列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 筛选条件变更时，重新加载
  const updateFilters = (newFilters: Partial<PetFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    loadPets(false);  // 筛选变更时使用替换模式
  };

  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      loadPets(true);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadPets(false);
  }, [filters]);

  return {
    pets,
    loading,
    hasMore,
    filters,
    updateFilters,
    loadMore,
    refresh: () => loadPets(false)
  };
};
```

#### 筛选组件

```tsx
// components/PetFilters.tsx
import { Select } from 'antd';

const { Option } = Select;

interface PetFiltersProps {
  value: {
    type?: string;
    size?: string;
    gender?: string;
  };
  onChange: (filters: any) => void;
}

const PetFilters: React.FC<PetFiltersProps> = ({ value, onChange }) => {
  return (
    <div className="pet-filters">
      {/* 宠物类型 */}
      <Select
        placeholder="宠物类型"
        allowClear
        value={value.type}
        onChange={(v) => onChange({ ...value, type: v })}
        style={{ width: 100 }}
      >
        <Option value="cat">🐱 猫咪</Option>
        <Option value="dog">🐶 狗狗</Option>
        <Option value="other">🐰 其他</Option>
      </Select>

      {/* 体型 */}
      <Select
        placeholder="体型"
        allowClear
        value={value.size}
        onChange={(v) => onChange({ ...value, size: v })}
        style={{ width: 100 }}
      >
        <Option value="small">小型</Option>
        <Option value="medium">中型</Option>
        <Option value="large">大型</Option>
      </Select>

      {/* 性别 */}
      <Select
        placeholder="性别"
        allowClear
        value={value.gender}
        onChange={(v) => onChange({ ...value, gender: v })}
        style={{ width: 100 }}
      >
        <Option value="male">♂ 公</Option>
        <Option value="female">♀ 母</Option>
      </Select>
    </div>
  );
};
```

### 模块二：收藏功能

#### 业务场景

用户可以收藏心仪的宠物，方便以后再次查看。收藏列表支持查看和取消收藏。

#### 核心代码

```typescript
// hooks/useCollect.ts
import { useState } from 'react';
import cloud from '@/utils/cloud';

/**
 * 收藏 Hook
 *
 * 核心功能：
 * 1. 收藏/取消收藏宠物
 * 2. 获取用户收藏列表
 * 3. 判断当前宠物是否已收藏
 */
export const useCollect = () => {
  const [loading, setLoading] = useState(false);

  /**
   * 切换收藏状态
   */
  const toggleCollect = async (petId: string): Promise<boolean> => {
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo._id) {
        throw new Error('请先登录');
      }

      const res = await cloud.callFunction({
        name: 'toggleCollect',
        data: {
          userId: userInfo._id,
          petId
        }
      });

      return res.success;
    } catch (error) {
      console.error('收藏操作失败', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 获取收藏列表
   */
  const getCollectList = async (userId: string) => {
    try {
      const res = await cloud.callFunction({
        name: 'getCollectList',
        data: { userId }
      });

      if (res.success) {
        return res.data.pets;
      }
      return [];
    } catch (error) {
      console.error('获取收藏列表失败', error);
      return [];
    }
  };

  return {
    loading,
    toggleCollect,
    getCollectList
  };
};
```

```tsx
// components/PetCard.tsx
import { Card, Image, Tag, Button } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useCollect } from '@/hooks/useCollect';

/**
 * 宠物卡片组件
 *
 * 核心功能：
 * 1. 展示宠物基本信息（图片、名字、品种）
 * 2. 展示宠物状态标签
 * 3. 收藏按钮交互
 */
interface PetCardProps {
  pet: {
    _id: string;
    name: string;
    images: string[];
    breed: string;
    status: string;
  };
  isCollected?: boolean;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, isCollected = false, onClick }) => {
  const { loading, toggleCollect } = useCollect();

  const handleCollect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleCollect(pet._id);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available': return <Tag color="green">可领养</Tag>;
      case 'adopting': return <Tag color="orange">领养中</Tag>;
      case 'adopted': return <Tag color="gray">已领养</Tag>;
      default: return null;
    }
  };

  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <div style={{ position: 'relative' }}>
          <Image src={pet.images[0]} alt={pet.name} style={{ height: 200, objectFit: 'cover' }} />
          <Button
            type="text"
            icon={isCollected ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
            onClick={handleCollect}
            loading={loading}
            style={{ position: 'absolute', top: 8, right: 8 }}
          />
        </div>
      }
    >
      <Card.Meta
        title={pet.name}
        description={
          <>
            {pet.breed}
            {getStatusTag(pet.status)}
          </>
        }
      />
    </Card>
  );
};
```

### 模块三：宠物详情与领养申请

#### 业务场景

用户点击宠物卡片进入详情页，可以查看宠物完整信息并提交领养申请。

```tsx
// pages/PetDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Detail, Tag, Button, Card, message } from 'antd';
import { useEffect, useState } from 'react';
import cloud from '@/utils/cloud';

/**
 * 宠物详情页
 *
 * 核心功能：
 * 1. 宠物图片画廊展示
 * 2. 详细信息展示（品种、年龄、性别、健康状况）
 * 3. 领养按钮交互
 */
const PetDetail: React.FC = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadPetDetail = async () => {
      try {
        const res = await cloud.callFunction({
          name: 'getPetDetail',
          data: { petId }
        });

        if (res.success) {
          setPet(res.data.pet);
        }
      } catch (error) {
        messageApi.error('加载宠物详情失败');
      }
    };

    if (petId) {
      loadPetDetail();
    }
  }, [petId]);

  const handleAdopt = () => {
    // 已登录 → 跳转申请页
    navigate(`/apply/${petId}`);
  };

  if (!pet) return null;

  return (
    <div className="pet-detail-page">
      {contextHolder}

      {/* 图片画廊 */}
      <div className="pet-gallery">
        <Image.PreviewGroup>
          {pet.images.map((img: string, idx: number) => (
            <Image key={idx} src={img} width={200} />
          ))}
        </Image.PreviewGroup>
      </div>

      {/* 基本信息 */}
      <Card title="基本信息">
        <Detail>
          <Detail.Row>
            <span>名字：{pet.name}</span>
            <Tag color={pet.gender === 'male' ? 'blue' : 'pink'}>
              {pet.gender === 'male' ? '♂ 公' : '♀ 母'}
            </Tag>
          </Detail.Row>
          <Detail.Row>品种：{pet.breed}</Detail.Row>
          <Detail.Row>年龄：{pet.age}</Detail.Row>
          <Detail.Row>体型：{pet.size}</Detail.Row>
          <Detail.Row>健康状况：{pet.health}</Detail.Row>
        </Detail>
      </Card>

      {/* 描述 */}
      <Card title="宠物故事" style={{ marginTop: 16 }}>
        <p>{pet.description}</p>
      </Card>

      {/* 领养按钮 */}
      <div className="adopt-action" style={{ marginTop: 16, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          disabled={pet.status !== 'available'}
          onClick={handleAdopt}
        >
          {pet.status === 'available' ? '申请领养' : '暂不可领养'}
        </Button>
      </div>
    </div>
  );
};
```

### 模块四：领养申请流程

#### 业务场景

用户找到心仪的宠物后，可以提交领养申请。完整流程：

```
浏览宠物 → 查看详情 → 填写申请 → 提交审核 → 等待结果 → 审核通知
```

#### 申请表单

```tsx
// pages/ApplyPage.tsx
import { Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import cloud from '@/utils/cloud';
import { useNavigate, useParams } from 'react-router-dom';

const { TextArea } = Input;

interface ApplyFormData {
  reason: string;       // 领养理由
  experience: string;   // 养宠经验
  residence: string;    // 居住情况
  agreement: boolean;   // 领养协议同意
}

/**
 * 领养申请页面
 *
 * 表单字段：
 * 1. 领养理由（必填，详细说明为什么想领养）
 * 2. 养宠经验（必填，描述过往养宠经历）
 * 3. 居住情况（必填，说明居住环境是否适合养宠）
 * 4. 领养协议（必选，需同意《领养协议》
 */
const ApplyPage: React.FC = () => {
  const [form] = Form.useForm<ApplyFormData>();
  const [submitting, setSubmitting] = useState(false);
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values: ApplyFormData) => {
    if (!petId) {
      messageApi.error('宠物信息不存在');
      return;
    }

    setSubmitting(true);

    try {
      // 1. 获取当前用户
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

      // 2. 调用云函数提交申请
      const res = await cloud.callFunction({
        name: 'submitApplication',
        data: {
          petId,
          userId: userInfo._id,
          reason: values.reason,
          experience: values.experience,
          residence: values.residence
        }
      });

      if (res.success) {
        messageApi.success('申请提交成功，请等待审核');
        // 跳转到申请列表页
        navigate('/my/applications');
      } else {
        messageApi.error(res.error || '提交失败');
      }
    } catch (error) {
      messageApi.error('网络错误，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="apply-page">
      {contextHolder}
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Form.Header>领养申请</Form.Header>

        <Form.Item
          name="reason"
          label="领养理由"
          rules={[{ required: true, message: '请填写领养理由' }]}
        >
          <TextArea
            rows={4}
            placeholder="请详细说明为什么想领养这只宠物..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="experience"
          label="养宠经验"
          rules={[{ required: true, message: '请填写养宠经验' }]}
        >
          <TextArea
            rows={3}
            placeholder="请描述您的养宠经历，如养过什么宠物..."
            maxLength={300}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="residence"
          label="居住情况"
          rules={[{ required: true, message: '请填写居住情况' }]}
        >
          <TextArea
            rows={2}
            placeholder="请说明您的居住环境（自有/租房、面积、是否允许养宠等）"
            maxLength={200}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject('请同意领养协议')
            }
          ]}
        >
          <Checkbox>
            我已阅读并同意《领养协议》，承诺为宠物提供稳定的生活环境和负责任的照顾
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={submitting}
            block
          >
            提交申请
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
```

#### 申请状态追踪

```tsx
// pages/MyApplications.tsx
import { Tabs, Empty, Tag, Card } from 'antd';

/**
 * 我的申请列表页
 *
 * 三个状态 tab：
 * 1. 待审核 - 等待管理员审核
 * 2. 已通过 - 审核通过，可联系领养
 * 3. 已拒绝 - 审核未通过，可查看原因
 */
const MyApplications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载申请列表
  const loadApplications = async () => {
    setLoading(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

      const res = await cloud.callFunction({
        name: 'getMyApplications',
        data: {
          userId: userInfo._id,
          status: activeTab
        }
      });

      if (res.success) {
        setApplications(res.data.applications);
      }
    } catch (error) {
      console.error('加载申请列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const renderApplicationItem = (app: any) => (
    <Card key={app._id} className="application-card" style={{ marginBottom: 12 }}>
      <div className="pet-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src={app.petImage} alt={app.petName} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <h4>{app.petName}</h4>
          <p>{app.petBreed}</p>
        </div>
        <Tag color={getStatusBadge(app.status)}>{getStatusText(app.status)}</Tag>
      </div>

      {app.status === 'rejected' && app.auditRemark && (
        <div className="reject-reason" style={{ marginTop: 12, color: '#ff4d4f' }}>
          <span>拒绝原因：</span>{app.auditRemark}
        </div>
      )}

      <div className="apply-time" style={{ marginTop: 12, color: '#999' }}>
        申请时间：{formatDate(app.createTime)}
      </div>
    </Card>
  );

  return (
    <div className="my-applications-page">
      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key as any)}>
        <Tabs.Tab title="待审核" key="pending">
          {applications.length === 0 ? (
            <Empty description="暂无待审核申请" />
          ) : (
            applications.map(renderApplicationItem)
          )}
        </Tabs.Tab>
        <Tabs.Tab title="已通过" key="approved">
          {applications.length === 0 ? (
            <Empty description="暂无已通过申请" />
          ) : (
            applications.map(renderApplicationItem)
          )}
        </Tabs.Tab>
        <Tabs.Tab title="已拒绝" key="rejected">
          {applications.length === 0 ? (
            <Empty description="暂无已拒绝申请" />
          ) : (
            applications.map(renderApplicationItem)
          )}
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};
```

### 模块五：管理端审核流程

#### 业务场景

管理员在后台审核用户提交的领养申请。核心功能：

| 功能   | 说明               |
| ---- | ---------------- |
| 申请列表 | 按状态筛选，查看申请详情     |
| 审核操作 | 批准或拒绝申请，填写备注     |
| 通知用户 | 审核结果通过云调用/短信通知用户 |

#### 审核管理核心代码

```typescript
// 云函数：审核申请
exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;
  
  const { action, applicationId, remark } = event;
  // action: 'approve' | 'reject'
  
  try {
    // 1. 查询申请信息
    const appRes = await db.collection('applications').doc(applicationId).get();
    const application = appRes.data;
    
    if (!application) {
      return { success: false, error: '申请不存在' };
    }
    
    // 2. 校验申请状态（必须是待审核）
    if (application.status !== 'pending') {
      return { success: false, error: '该申请已处理' };
    }
    
    // 3. 开启事务（批量更新）
    const transaction = await db.startTransaction();
    
    try {
      if (action === 'approve') {
        // 审核通过
        await transaction.collection('applications').doc(applicationId).update({
          status: 'approved',
          auditRemark: remark || '',
          auditTime: new Date(),
          updateTime: new Date()
        });
        
        // 更新宠物状态为「领养中」
        await transaction.collection('pets').doc(application.petId).update({
          status: 'adopting',
          updateTime: new Date()
        });
        
      } else if (action === 'reject') {
        // 审核拒绝
        await transaction.collection('applications').doc(applicationId).update({
          status: 'rejected',
          auditRemark: remark || '',
          auditTime: new Date(),
          updateTime: new Date()
        });
      }
      
      // 提交事务
      await transaction.commit();
      
      // 4. 发送通知（异步，不影响主流程）
      sendNotification(application.userId, action, remark);
      
      return { success: true };
      
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * 发送通知（异步）
 */
const sendNotification = async (userId: string, action: string, remark?: string) => {
  try {
    await cloud.callFunction({
      name: 'sendNotify',
      data: {
        userId,
        type: action === 'approve' ? 'adoption_approved' : 'adoption_rejected',
        message: action === 'approve' 
          ? '恭喜！您的领养申请已通过审核' 
          : `抱歉，您的领养申请未通过：${remark}`
      }
    });
  } catch (error) {
    // 通知失败不影响主流程，只记录日志
    console.error('发送通知失败', error);
  }
};
```

### 模块六：管理端仪表盘

#### 业务场景

管理后台首页展示平台核心数据统计，帮助管理员快速了解运营状况。

```tsx
// pages/Dashboard.tsx
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import * as echarts from 'echarts';
import cloud from '@/utils/cloud';

/**
 * 管理端仪表盘
 *
 * 核心功能：
 * 1. 核心数据统计卡片（宠物总数、待审核申请、用户总数等）
 * 2. 申请趋势图表
 * 3. 最近申请列表
 */
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPets: 0,
    pendingApplications: 0,
    totalUsers: 0,
    adoptedCount: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [trendChart, setTrendChart] = useState<echarts.ECharts | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await cloud.callFunction({
        name: 'getDashboardStats',
        data: {}
      });

      if (res.success) {
        setStats(res.data.stats);
        setRecentApps(res.data.recentApplications);
      }
    } catch (error) {
      console.error('加载仪表盘数据失败', error);
    }
  };

  const columns = [
    { title: '申请人', dataIndex: 'userName', key: 'userName' },
    { title: '宠物', dataIndex: 'petName', key: 'petName' },
    { title: '申请时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待审核' },
          approved: { color: 'green', text: '已通过' },
          rejected: { color: 'red', text: '已拒绝' }
        };
        const { color, text } = map[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      }
    }
  ];

  return (
    <div className="dashboard-page">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="宠物总数"
              value={stats.totalPets}
              suffix="只"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核申请"
              value={stats.pendingApplications}
              suffix="条"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="注册用户"
              value={stats.totalUsers}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成领养"
              value={stats.adoptedCount}
              suffix="只"
            />
          </Card>
        </Col>
      </Row>

      {/* 最近申请 */}
      <Card title="最近申请" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={recentApps}
          rowKey="_id"
          pagination={false}
        />
      </Card>
    </div>
  );
};
```

### 模块七：管理端用户管理

#### 业务场景

管理员可以查看所有注册用户列表，对违规用户进行禁用操作。

```tsx
// pages/UserManagement.tsx
import { Table, Tag, Button, Input, Card } from 'antd';
import { useEffect, useState } from 'react';
import cloud from '@/utils/cloud';
import { useNavigate } from 'react-router-dom';

/**
 * 用户管理页面
 *
 * 核心功能：
 * 1. 用户列表展示（支持分页）
 * 2. 关键词搜索
 * 3. 查看用户详情
 * 4. 禁用/启用用户
 */
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadUsers();
  }, [pagination.current, searchKeyword]);

  const loadUsers = async () => {
    setLoading(true);

    try {
      const res = await cloud.callFunction({
        name: 'getUserList',
        data: {
          offset: (pagination.current - 1) * pagination.pageSize,
          limit: pagination.pageSize,
          keyword: searchKeyword
        }
      });

      if (res.success) {
        setUsers(res.data.users);
        setPagination(prev => ({ ...prev, total: res.data.total }));
      }
    } catch (error) {
      console.error('加载用户列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';

    try {
      const res = await cloud.callFunction({
        name: 'toggleUserStatus',
        data: { userId, status: newStatus }
      });

      if (res.success) {
        loadUsers();
      }
    } catch (error) {
      console.error('切换用户状态失败', error);
    }
  };

  const columns = [
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已禁用'}
        </Tag>
      )
    },
    { title: '注册时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => handleToggleStatus(record._id, record.status)}
        >
          {record.status === 'active' ? '禁用' : '启用'}
        </Button>
      )
    }
  ];

  return (
    <div className="user-management-page">
      <Card
        title="用户管理"
        extra={
          <Input.Search
            placeholder="搜索用户昵称或手机号"
            onSearch={(value) => setSearchKeyword(value)}
            style={{ width: 240 }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, current: page }))
          }}
        />
      </Card>
    </div>
  );
};
```

***

## 项目亮点与踩坑实录

### 亮点一：从「借船出海」到「自主航行」

蝶梦项目虽然是我独立完成，但核心技术依赖是**RuoYi 脚手架**。很多基础设施（权限系统、CRUD 模板）都是框架提供的，我更像是在「搭积木」。

C-PET 的不同在于：

| 维度   | 蝶梦                              | C-PET                       |
| ---- | ------------------------------- | --------------------------- |
| 前端架构 | Vue3 + Element Plus（借助 RuoYi）   | React 18 + Ant Design（自主设计） |
| 后端架构 | Spring Boot + MyBatis（借助 RuoYi） | 云函数 + 云数据库（自主设计）            |
| 权限系统 | RuoYi 内置 RBAC                   | 自主设计的角色权限模型                 |
| 文件存储 | 阿里云 OSS                         | CloudBase 文件存储              |
| 部署方式 | 手动部署到服务器                        | 一键部署到云端                     |

**这次是真正的「从零设计」，不是「从框架改」。**

### 亮点二：完整的业务闭环

蝶梦只实现了「管理员操作」的单向流程，C-PET 实现了完整的**双向闭环**：

```
用户端：浏览 → 收藏 → 申请 → 等待 → 收到通知
管理端：发布宠物 → 审核申请 → 通知用户 → 更新状态
```

这个闭环的意义：

| 环节   | 用户端价值      | 管理端价值     |
| ---- | ---------- | --------- |
| 宠物发布 | 有宠物可浏览     | 数字化管理宠物档案 |
| 领养申请 | 自主操作，无需代提交 | 申请有据可查    |
| 审核管理 | 审核结果主动通知   | 审核流程规范化   |
| 状态更新 | 实时查看进度     | 数据一致性保障   |

### 踩坑实录：Serverless 的「冷启动」延迟

#### 问题现象

C-PET 内测期间，我的朋友反馈「点击按钮后要等好几秒才有响应」。

#### 根因分析

Serverless 云函数的特性：**冷启动**。当云函数被首次调用或长时间未调用时，平台需要「唤醒」函数实例，这个过程会产生额外延迟。

```
传统服务器：24 小时运行，always ready
云函数：有人调用才启动，有「起床时间」
```

#### 解决方案

**方案一：保持活跃（定期调用）**

```typescript
// 使用定时触发器，每 5 分钟调用一次关键云函数
// 避免进入「冷」状态
exports.main = async (event, context) => {
  // 触发云函数预热
  return { success: true, warmed: true };
};
```

**方案二：前端「预加载」**

```tsx
// App.tsx - 应用启动时预热
useEffect(() => {
  // 预热获取统计数据
  cloud.callFunction({ name: 'getStats', data: {} });
  
  // 预热获取宠物列表（加载第一页）
  cloud.callFunction({ name: 'getPets', data: { page: 1 } });
}, []);
```

**方案三：交互反馈优化**

```tsx
// 对于耗时操作，提供明确的加载状态
const handleSubmit = async () => {
  setSubmitting(true);
  messageApi.loading('正在提交...');

  try {
    await cloud.callFunction({ name: 'submitApplication', data });
    messageApi.success('提交成功');
  } finally {
    setSubmitting(false);
  }
};
```

#### 经验总结

| 经验点             | 说明                   |
| --------------- | -------------------- |
| Serverless 不是银弹 | 有冷启动延迟，适合不追求毫秒级响应的场景 |
| 预热策略很重要         | 定时触发器可以保持函数「热」状态     |
| 前端体验要跟上         | 加载状态、骨架屏可以缓解等待焦虑     |

***

### 踩坑实录：文档数据库的「关联查询」困境

#### 问题现象

在实现「查询用户申请记录并展示宠物信息」时，遇到了一个经典问题：applications 集合只存了 `petId`，不存宠物详情。但前端需要展示宠物图片、名字等信息。

#### 蝶梦的解决方案（MySQL JOIN）

```sql
-- MySQL 中一条 SQL 搞定
SELECT a.*, p.name AS pet_name, p.images AS pet_images
FROM adoption_applications a
LEFT JOIN pet_info p ON a.pet_id = p.pet_id
WHERE a.user_id = 'xxx';
```

#### C-PET 的解决方案（多次查询 + 数据聚合）

```typescript
/**
 * 获取用户申请列表（包含宠物详情）
 *
 * 文档数据库没有 JOIN，需要分步查询 + 数据聚合
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  
  const { userId } = event;
  
  // 1. 查询用户的申请记录
  const appRes = await db.collection('applications')
    .where({ userId })
    .orderBy('createTime', 'desc')
    .get();
  
  const applications = appRes.data;
  
  // 2. 提取所有 petId
  const petIds = applications.map(app => app.petId);
  
  // 3. 批量查询宠物信息
  const petsRes = await db.collection('pets')
    .where({
      _id: db.command.in(petIds)
    })
    .get();
  
  // 4. 构建 petId -> petInfo 的映射
  const petMap = {};
  petsRes.data.forEach(pet => {
    petMap[pet._id] = pet;
  });
  
  // 5. 聚合数据
  const result = applications.map(app => ({
    ...app,
    petInfo: petMap[app.petId] || null
  }));
  
  return { success: true, data: { applications: result } };
};
```

#### 经验总结

| 经验点            | 说明               |
| -------------- | ---------------- |
| 文档数据库 ≠ 不用关心性能 | 多次查询需要考虑性能影响     |
| 数据冗余是常态        | 可以适当在应用层冗余存储热门数据 |
| 根据场景选择数据库      | 强关联场景 MySQL 更合适  |

***

## 与蝶梦的成长对比

### 技术能力提升

| 技术维度 | 蝶梦（2024.07）    | C-PET（2025.07） | 提升           |
| ---- | -------------- | -------------- | ------------ |
| 前端框架 | Vue3（借助 RuoYi） | React 18（自主设计） | 从「用」到「选」     |
| 架构设计 | 依赖脚手架          | 从零设计           | 从「搭积木」到「画图纸」 |
| 云服务  | 不了解            | CloudBase 全家桶  | 从 0 到 1      |
| 数据库  | MySQL（会 CRUD）  | MySQL + 文档数据库  | 多元化          |
| 问题解决 | 查文档 + 问社区      | 查文档 + 推理分析     | 独立调试能力       |

### 思维方式转变

**蝶梦阶段**：拿到需求，先想「这个 RuoYi 怎么实现」

**C-PET 阶段**：拿到需求，先想「这个业务怎么建模，需要什么技术」

这个转变很关键：**技术是手段，不是限制**。

### 项目完整度对比

| 维度    | 蝶梦     | C-PET         |
| ----- | ------ | ------------- |
| 用户端   | ❌      | ✅ 完整实现        |
| 管理端   | ✅ 基础功能 | ✅ 功能完善 + RBAC |
| 业务闭环  | ❌ 半成品  | ✅ 完整闭环        |
| 部署上线  | 手动部署   | 一键部署          |
| 文档完整性 | 一般     | 完整            |

***

## 项目总结

### C-PET 的核心价值

1. **技术升级**：从传统 MVC 到 Serverless，完成云原生转型的完整实践
2. **业务闭环**：从蝶梦的单后台到用户端+管理端的双端完整系统
3. **独立开发**：从「借助脚手架」到「完全自主设计」的能力跃迁

### 未来改进方向

| 方向    | 说明                      |
| ----- | ----------------------- |
| 微信小程序 | 目前只有web端，小程序可以提供更好的用户体验 |
| 领养后跟踪 | 定期让用户上传宠物近况，形成领养闭环      |
| 社区功能  | 用户分享养宠日常，增加平台粘性         |
| 积分激励  | 参考项目文档中的用户激励系统设计        |

*C-PET 完成于 2025 年 7 月，是对蝶梦遗憾的一次完整回应。虽然只是内测验证，但双端系统的完整实现，证明了我的技术能力已经从「借助脚手架」进化到「纯粹独立开发」。*

*这一年，值得。*

*技术会演进，框架会更新，但独立解决问题的能力，才是最核心的竞争力。*
