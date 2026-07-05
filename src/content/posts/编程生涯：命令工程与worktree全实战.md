---
title: 编程生涯：命令工程与worktree全实战
published: 2026-07-06
description: 一场由B站mattpocock-skills保姆级教程点燃的认知之旅。从自建技能工作流，到整合superpowers的核心skill，再到「命令工程」概念的正式提出——本文用联网考证的最新内容讲透「最低程度的约束、最大限度的引导」这条AI编程新原则。
tags: [AI编程, 命令工程, superpowers, worktree, 工作流]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
《超火Al编程工作流mattpocock-skills，保姆级教程详细讲解》，感兴趣的朋友直接b站搜索就行，这篇文章就是由该视频启发而来。
:::

## 梦开始的地方：B 站视频与 mattpocock-skills

看完视频，我立刻打开 GitHub。让我意外的不是 stars 数，而是 README 里的一句核心立场：

> **"GSD, BMAD and Spec-Kit own your process — these don't."**

翻译成中文就是：「GSD、BMAD、Spec-Kit 这些项目要'拥有'你的开发流程，但这套技能不会。」

这句话精准击中了我。

我之前接触过 GSD、BMAD、Spec-Kit 这些所谓的「过程驱动」框架。说实话，它们都设计得很精巧，但用起来有一种说不出的「被控制」感。AI 必须按照预设的 7 阶段或 5 步走完每一步，每一步都有人工检查点。对于复杂的项目，这套流程确实能保证质量，但那种按部就班的感觉，让我自己的思维都被固化了，更别说AI了。

Pocock 的态度很明确：他不是要做另一个 GSD，而是要做「不试图拥有你流程的」技能库。

### 四类失败模式：Pocock 的"AI 编码病理诊断书"

Pocock 把 AI 编码的典型失败归纳为 4 类，每类对应一组 skill。这套分类法让我眼前一亮——它不是从"我应该怎么做"出发，而是从"我哪里做错了"出发。

```text
1. 意图对齐失败（agent 没做你想要的事）
   ↓ 对应：grill-me / grill-with-docs
2. 缺乏领域语言（表达啰嗦无重点）
   ↓ 对应：ubiquitous-language / CONTEXT.md
3. 没有反馈回路（代码不工作）
   ↓ 对应：tdd / diagnose
4. 架构腐化加速（越改越烂）
   ↓ 对应：to-prd / zoom-out / improve-codebase-architecture
```

说实话，看到这 4 类失败时我笑了——这不就是我过去两年踩过的坑吗？我在[《从古法编程到 SDD》](../编程生涯从古法编程到sdd/)里写过 vibe coding 的局限，但当时只是停留在"AI 写代码很爽但容易跑偏"的感性认知上。Pocock 的 4 类失败模式，相当于给这种感性认知做了一次系统化的"病理分类"。

:::note
关键洞察：mattpock 反对的不是「AI 编程」，而是「氛围式 AI 编程」（vibe coding）。这个区分至关重要——AI 编程是工具，氛围式 AI 编程是放弃思考。两者的边界，由你划定。
:::

### 我意识到自己之前自建的技能工作流与 Pocock 的设计哲学非常相似

兴奋地装上 mattpocock 全部 12 个活跃 skill 后，我打开了自己的技能目录一查——

**45+ 个。**

里面至少有 30 个是过去一年陆续攒下来的：brainstorming、tdd、code-review、debugging、dispatching、using-superpowers、using-git-worktrees、to-prd、to-issues、triage、improve-codebase-architecture、domain-modeling、receiving-code-review、verification-before-completion、writing-plans、executing-plans、finishing-a-development-branch、finding-skills、skill-creator、prototype……再加上 mattpocock 的 12 个，已经快 60 个了。

但当我真的要做一个新功能时，我真正调用的技能不超过 5 个。剩下 55 个，要么是重复的（`tdd` 和 `test-driven-development` 干的是同一件事），要么是场景太窄（一辈子用不上一次的 `grill-with-docs`），要么是过时的（早期 AI 模型没有工具调用时设计的 `debugging`，现在的 `diagnose` 已经更完善）。

**技能不是越多越好，而是越精越好。**

## 整合精简：结合 superpowers 之后的二次瘦身

知道问题后，我开始动手整理。最激进的一步是删掉所有重复技能。

### 第一轮：清掉所有"长得像但干同件事"的技能

我对照着 pocock 的 4 类失败模式，把自己的 45+ 个技能按"解决的问题"重新归类。结果发现：

- `tdd` 和 `test-driven-development` → 留一个
- `debugging` 和 `diagnosing-bugs` → 留一个
- `grill-with-docs` 和 `brainstorming` → 留一个
- `using-git-worktrees`、`creating-worktrees`、`worktree-setup` → 留一个

这一轮清除后。瞬间感觉清爽了不少。

### 第二轮：吸收 superpowers 的精华

在mattpocock-skills之前，我就有尝试过使用superpowers了。

superpowers 有 14 个核心 skill，分 3 类：

| 类别         | 核心 skill                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **开发流程**   | `brainstorming` / `writing-plans` / `executing-plans` / `subagent-driven-development` / `using-git-worktrees` / `finishing-a-development-branch` |
| **质量保证**   | `test-driven-development` / `requesting-code-review` / `receiving-code-review` / `verification-before-completion`                                |
| **调试与元技能** | `systematic-debugging` / `writing-skills` / `using-superpowers` / `dispatching-parallel-agents`                                                  |

superpowers 有完整的 7 阶段工作流：

```text
Brainstorming（脑暴）
    ↓
Git Worktree 隔离（独立工作区）
    ↓
Writing Plans（写计划）
    ↓
Executing Plans / SDD（执行计划）
    ↓
TDD（测试驱动）
    ↓
Code Review（代码审查）
    ↓
Finishing a Development Branch（收尾）
```

那问题来了，这和 GSD、BMAD 有什么本质区别？

**区别在于：它的 14 个 skill 是独立的，组合方式由你定。**

GSD 是"必须按 7 步走完"，superpowers 是"14 个零件随便拼"。我可以选择完整跑 7 阶段，也可以只挑 brainstorming + TDD + Review 这 3 个关键节点跑。这个灵活性，是 GSD 给不了的。

### mattpocock vs superpowers：取与舍

| 维度         | mattpocock             | superpowers          |
| ---------- | ---------------------- | -------------------- |
| 哲学         | 小而美、可适配                | 流程纪律、必须执行            |
| 当前 skill 数 | 22 个 SKILL.md / 12 个活跃 | 14 个核心               |
| 触发方式       | 主动调用                   | 自动触发（hook 注入）        |
| 适合场景       | 个人项目、按需取用              | 团队项目、流程标准化           |
| 风险         | 太轻，可能漏步骤               | 太重，子 Agent hook 仍有问题 |
| 评测数据       | —                      | 提速 2x、token 减 50%    |

我的最终方案是：两个都装，但各有侧重。

- **mattpocock 用于"轻场景"**：临时小工具、一次性脚本、不需要流程纪律的小修小补
- **superpowers 用于"重场景"**：新功能开发、Bug 修复、涉及多文件的中等规模改动

这个分类方式让我在 daily work 中能根据任务复杂度快速选型，不会一上来就跑 7 阶段。

## 灵光一闪：设计模式如何启发命令抽取

整合完技能后，我盯着自己的命令目录思考了 5 分钟。

45 个技能，按场景归类后，呈现出几个明显的"使用聚类"：

```text
【TDD 实施场景】
  brainstorming → tdd → requesting-code-review → verification-before-completion

【Bug 修复场景】
  systematic-debugging → receiving-code-review → tdd（写回归测试）

【PRD 生成场景】
  to-prd → brainstorming → writing-plans

【UI 设计场景】
  frontend-design → design-taste-frontend → prototype

【代码审查场景】
  requesting-code-review → receiving-code-review
```

我看到这种聚类，第一个想到的是设计模式——更具体地说，是**面向接口设计**。

### 面向接口设计的迁移

我在[《大话设计模式》](../编程生涯大话设计模式面向对象设计的23种经典套路/)里学过：设计模式的核心是"封装变化"，把可能变化的部分独立出来，对外暴露稳定的接口。

如果把设计模式的原则套到 AI 编程工作流上：

| 设计模式概念            | 迁移到 AI 编程              |
| ----------------- | ---------------------- |
| **类（class）**      | 技能（skill）              |
| **接口（interface）** | 命令（command）            |
| **接口规范**          | 命令的 frontmatter + 简洁指引 |
| **实现细节**          | 内部链式调用的多个 skill        |

这就是我灵光一闪的那个瞬间：**命令 = "工作流的接口"，内部实现可以随时换。**

为什么这很重要？

**因为我作为用户，要面对的不是"30 个技能菜单"，而是"6 个有明确意图的命令"。**

当我跟 AI 说"我要 build"时：

- 我不需要关心它内部是用了 `tdd` 还是 `test-driven-development`
- 我不需要关心它是用 `using-git-worktrees` 还是手工建分支
- 我只需要关心："它能不能按 TDD 高质量实现这个功能？"

**接口的好处，是屏蔽实现细节。**

同样的道理，命令的好处，是屏蔽 skill 编排细节。

### 一个不恰当但很说明问题的类比

你想叫外卖，你不需要知道：

- 美团用了什么数据库
- 骑手调度算法是什么
- 支付是走的微信还是支付宝

你只需要打开 App，点个按钮，等外卖送到。

**命令 = AI 编程的"外卖 App"。**

我之前之所以"45+ 个技能用不顺"，是因为我把自己当成了"美团后端工程师"——每个细节都要自己组装。但如果我把自己当成"用户"，我应该只关心"我点什么"。

这个视角的转换，是命令工程最核心的认知转变。

## 命令工程：核心三原则与我的正式定义

:::important
"命令工程"（Command Engineering）这个词是我个人提的，不是什么业界标准。但它精准概括了我过去一个月对 AI 编程工作流的全部思考。
:::

### 正式定义

> **命令工程（Command Engineering）**：将一组有内在逻辑关联的 AI 技能（Skill）抽取为带明确意图的「命令」进行统一管理的设计方法论。其本质是把分散的 skill 统一为面向用户意图的接口。

我尽量把定义写得严谨一点，避免变成"自嗨概念"。

**关键词拆解**：

- "有内在逻辑关联" — 不是把任意 skill 堆在一起，而是按"使用场景"分组
- "带明确意图" — 命令名要能直接表达用户想做什么
- "面向用户意图" — 用户的视角，不是 AI 的视角

### 核心三原则

| 原则          | 含义                          | 反例            |
| ----------- | --------------------------- | ------------- |
| **简洁**      | 命令本身要短小，名字表意图               | 一个命令写 200 行说明 |
| **最大限度的引导** | 告诉 AI "为什么"和"做什么"，但不限定"怎么做" | 列 10 条规则强约束   |
| **最低程度的约束** | 只在关键节点设置检查点                 | 强制每步都问用户      |

这三条原则是相互制衡的：

- **太简洁 → 缺乏引导**：命令名一目了然，但 AI 不知道"为什么"和"做什么"
- **太详细 → 失去灵活**：所有步骤都写死，AI 没有发挥空间
- **约束太多 → 违背 AI 时代精神**：AI 已经足够强，过度约束反而限制它的能力

我在[《邪修法则之结果导向法则》](../编程生涯邪修法则之结果导向法则/)里写过"以用为纲"——结果比过程重要。命令工程的核心三原则，本质上是"以用为纲"在 AI 编程领域的具体化：

- 简洁 → 让用户上手快（结果导向的"效率"维度）
- 引导 → 让 AI 知道方向（结果导向的"目标"维度）
- 低约束 → 让 AI 自主发挥（结果导向的"灵活"维度）

### 命令工程 vs 其他流派

为了避免"自嗨概念"的嫌疑，我必须把命令工程和其他已有的工作流流派做一次对比：

| 流派             | 典型项目                  | 哲学      | 与命令工程的关系           |
| -------------- | --------------------- | ------- | ------------------ |
| **重型流程**       | GSD / BMAD / Spec-Kit | 过程拥有者   | 命令工程反对这种"控制欲"      |
| **技能池**        | mattpocock/skills     | 小而美，可组合 | 命令工程是"技能池的接口层"     |
| **强制纪律**       | superpowers           | 7 阶段必须走 | 命令工程吸收其精华，去掉强约束    |
| **Harness 工程** | 北大论文                  | 提升遵从率   | 命令工程是 Harness 的简化版 |
| **Loop 工程**    | autonomous-loops      | 持续循环    | 命令工程是 Loop 的"用户入口" |

**总结一句**：命令工程不是要"发明新东西"，而是要"把已有的东西整合得更好用"。它不是 GSD 的对手，而是"在你已经装了 30 个 skill 之后，怎么优雅地组织它们"的方法论。

### 我的核心观点：所有概念都会消散

> **随着 AI 越来越强大，所有的概念（skill、rule、工作流、harness 工程、loop 工程）都会随之消散。**

这不是危言耸听。我从 2022 年开始学编程，经历了：

- 2022 年：手敲代码
- 2023 年：CV 工程师
- 2024 年：Vibe Coding
- 2025 年：SDD
- 2026 年：各种engineering
- 2026 年 7 月：**命令工程**（整合所有，提炼我的版本）

每一年都有一个"新概念"出现，每个概念都号称是"终极方案"。但每个概念都在短时间内被下一个概念取代。

我不敢说命令工程能存在多久。也许明年 model 升级到 GPT-7，AI 已经能自主判断"现在该 brainstorm，下一步该 TDD"，那命令工程也会变成"过时的概念"。

但这种"承认自己会被取代"的态度，本身就是命令工程哲学的一部分。**不强求永垂不朽，只求在当下提供价值。**

## 命令实战：6 个自定义命令 + 两层架构 + 一次完整协作链

### 命令总览

| 命令          | 来源     | 意图            | 调用技能 / 机制                                                                | 达成目标                                            |
| ----------- | ------ | ------------- | ------------------------------------------------------------------------ | ----------------------------------------------- |
| `/build`    | 自定义    | 按 TDD 高质量实现功能 | using-git-worktrees + tdd + code-review + verification-before-completion | 经过测试覆盖、审查通过、验证完成的实现                             |
| `/fix`      | 自定义    | 系统性诊断并修复 bug  | diagnosing-bugs + receiving-code-review                                  | 根因明确的修复 + 回归测试覆盖                                |
| `/idea`     | 自定义    | 把模糊想法变成清晰设计   | brainstorming + domain-modeling                                          | 可被后续命令消费的设计稿                                    |
| `/prd`      | 自定义    | 对话上下文转完整 PRD  | to-prd + brainstorming                                                   | 含 problem/solution/user stories/decisions 的 PRD |
| `/review`   | 自定义    | 双轴审查代码变更      | code-review + receiving-code-review                                      | standards 违规清单 + spec 偏离清单                      |
| `/ui`       | 自定义    | 设计与实现高质量前端    | frontend-design + design-taste-frontend + prototype                      | 生产级别、有美学方向、不落模板                                 |
| **`/plan`** | **内置** | 把方案固化为可执行规划文档 | **** **`/plan`** **触发**                                                  | 用户确认后的分步执行计划                                    |

注意最后一行的 `/plan`——它不是自定义命令，而是**IDE 自带**的命令。命令工程的一个关键洞察是：你不需要什么都自己造。IDE 厂商已经提供的能力，能复用就复用。

### 命令源码展示

完整展示 6 个自定义命令的 `.md` 文件内容（含 YAML frontmatter）：

```markdown
---
name: build
description: 按 TDD 高质量实现功能。
---

- **调用技能**: `using-git-worktrees` + `tdd` + `code-review` + `verification-before-completion`
- **达成目标**: 经过测试覆盖、审查通过、验证完成的实现
```

```markdown
---
name: fix
description: 系统性诊断并修复 bug。
---

- **调用技能**: `diagnosing-bugs` + `receiving-code-review`
- **达成目标**: 根因明确的修复 + 回归测试覆盖
```

```markdown
---
name: idea
description: 把模糊想法变成清晰设计。
---

- **调用技能**: `brainstorming` + `domain-modeling`
- **达成目标**: 可被后续命令消费的设计稿
```

```markdown
---
name: prd
description: 对话上下文转完整 PRD。
---

- **调用技能**: `to-prd` + `brainstorming`
- **达成目标**: 含 problem/solution/user stories/decisions 的 PRD
```

```markdown
---
name: review
description: 双轴审查代码变更。
---

- **调用技能**: `code-review` + `receiving-code-review`
- **达成目标**: standards 违规清单 + spec 偏离清单
```

```markdown
---
name: ui
description: 设计与实现高质量前端。
---

- **调用技能**: `frontend-design` + `design-taste-frontend` + `prototype`
- **达成目标**: 生产级别、有美学方向、不落模板
```

**全部加起来，每个命令的核心内容只有 2-3 行**。这就是"简洁"原则的极致体现。

### 命令编排逻辑深度剖析

这 6 个自定义命令不是孤立的，它们形成了一个完整的协作链：

```text
命令工程的两层架构：
├─ 第一层：IDE 内置能力（Trae / Cursor / Claude Code 提供）
│  ├─ /plan    一次性规划、批量执行
│  ├─ /spec    大型项目三件套
│  └─ /review  智能体驱动的代码审查
│
└─ 第二层：自定义命令（个人 / 团队基于 Skill 编排）
   ├─ /build   把 Skill 链装进一个名字
   ├─ /fix     把诊断流程装进一个名字
   └─ /ui      把前端质量观装进一个名字
```

每个命令内部都是"先 A 后 B 再 C"的 skill 链：

- **`/build`** **链**：worktree 隔离 → TDD 红绿重构 → 同行审查 → 验证完成
- **`/fix`** **链**：复现 → 根因 → 修复 → 回归测试
- **`/idea`** **链**：脑暴 → 领域建模（共享语言）
- **`/prd`** **链**：上下文抽取 → 用户故事 → 决策记录
- **`/review`** **链**：standards 轴 + spec 轴 → 聚合报告
- **`/ui`** **链**：通用 production → 反模板化 → 原型验证

**跨层协作链（重要）**：`/ui`（定方向）→ `/plan`（固化为可执行文档）→ `/build`（按 TDD 实施）→ `/review`（双轴审查）→ `/fix`（修复 review 发现）。

这条链不是命令工程发明的，是实际做出来才总结出来的。

### 实战案例：UI 升级

完整复盘我最近用命令工程做的一次 UI 升级改造：

```text
[ 用户输入 ] UI 升级方向模糊
       │
       ▼
[ /ui（自定义）] 定方向
  - 调 frontend-design + design-taste-frontend
  - 输出：色彩 / 排版 / 交互 三大维度原则
       │
       ▼
[ /plan（Trae 内置）] 固化规划
  - 在 .trae/documents/ 下生成 ui-upgrade-refactor-plan.md
  - 内容：3 Sprint / 17 commits / 9.5 人天 / 18 个 commit 计划
  - 用户审阅 + 手动微调 + 确认执行
       │
       ▼
[ /build（自定义）] 按 TDD 实施 Sprint 1
  - worktree 隔离：.worktrees/ui-upgrade-sprint1
  - TDD 7 个 commit：
      6676f1d  1.1 设计 token 化
      34dc617  1.2 hue 安全范围
      38e5fab  1.3 A11y 三件套
      08403ad  1.4 导航当前页
      7e43cf0  1.5 阅读进度条
      a806d06  1.6 体积基线
       │
       ▼
[ /review（自定义）] 双轴审查
  - 派发 2 个并行子代理（standards / spec）
  - 发现 3 个 minor 问题：
      1. Layout.astro body 属性行缩进不一致
      2. main.css 末尾丢失换行
      3. focus-visible 全局规则破坏胶囊形焦点环
       │
       ▼
[ /fix（自定义）] 修复并补 commit
  - commit b1823bb（1.7 审查修复）
  - 三件套验证：pnpm check 0 错 / format 无改 / build Complete
       │
       ▼
[ 结果 ] 全程零返工、零偏离 PRD
```

#### 跨层协作链的核心洞察

> **`/ui`** **给方向、`/plan`** **锁边界、`/build`** **保质量、`/review`** **找偏差、`/fix`** **闭环**——这五步链不是命令工程发明的，是实际做出来才总结出来的。

我可以拆解一下每一步的必要性：

- **没有** **`/plan`** **这一环**：`/ui` 输出的方向太散（5 个维度、12+ 任务），无法直接喂给 `/build`
- **没有** **`/build`** **这一环**：`/plan` 输出的 17 个 commit 谁来保证 TDD 与 worktree 隔离？
- **没有** **`/review`** **这一环**：3 个 minor 视觉问题会一直留在代码里直到 prod
- **没有** **`/fix`** **这一环**：review 报告变成僵尸文档

每一步都不可省略。这条链的精妙之处在于：**每个命令都"知道自己不知道什么"，所以才需要下一步命令来补全。**

### 命令工程的两层架构

:::important
命令工程不只是管理「自定义命令」。我实战下来才意识到：真正好用的工作流，是**把 IDE 内置能力 + 自定义命令统一编排**。
:::

#### 第一层：IDE 内置能力

| 平台              | 内置能力                          | 哲学               |
| --------------- | ----------------------------- | ---------------- |
| **Trae**        | `/plan` / `/spec` / `/review` | 字节跳动出品，开箱即用，中文优化 |
| **Cursor**      | Plan Mode / Agent Mode        | 编辑器深度集成          |
| **Claude Code** | Skills / Commands             | 通用模型原生支持         |

**优点**：无需自己组装，IDE 厂商已经做好了最佳实践。
**缺点**：跨 IDE 不通用，且不一定契合你的工作流。

#### 第二层：自定义命令

- **优点**：完全自定义，可以编排自己的 Skill 链
- **缺点**：写出来是"个人资产"，不通用，当然开源出去就通用了，互联网精神永存。

#### 跨层编排的实战心法

- **能用 IDE 内置就别自己造**：`/plan` 这种通用能力，自己实现反而不如 Trae 原生
- **IDE 没覆盖的再用自定义**：`/ui` 这种带"个人审美观"的能力，IDE 没提供
- **自定义命令里也可以调 IDE 能力**：例如 `/build` 内可以自动启用 `/plan`
- **避免重复造轮子**：先看 IDE 提供了什么，再决定写什么命令

#### 我目前的命令全景

```text

├─ 自定义工作流命令（6 个）
│  ├─ build.md    TDD 实施
│  ├─ fix.md      系统性修复
│  ├─ idea.md     概念阶段
│  ├─ prd.md      PRD 生成
│  ├─ review.md   双轴审查
│  └─ ui.md       UI 方向
│
└─ 自定义报告命令（2 个）
   ├─ BOOK.md     深度书评
   └─ report.md   HTML 日报
```

8 个命令，不多不少。这就是 2026 年 7 月的我的 AI 编程工作流全部。

## worktree 引入：被低估的 Git 利器

聊到命令工程就绕不开 worktree——superpowers 的 7 阶段里，第 2 步就是它；mattpocock 的 git-guardrails 也间接用到它。但 worktree 的真正威力，是在我亲自踩过坑之后才彻底理解的。

### worktree 是什么

我在[《最强版本控制工具——git》](../编程生涯最强版本控制工具git/)里讲过：git 的核心是"记录文件的变更"，而不是"保存文件的副本"。

**worktree 顺着这个思路往前再走一步：既然分支只是指向 commit 的指针，那为什么不可以在多个工作区里同时看到不同的指针指向？**

```text
传统 git 工作流：
项目根目录/
├── .git/                 ← 唯一的 .git 目录
├── src/                  ← 你正在编辑的文件
└── ...

git worktree 之后：
项目根目录/                ← 主 worktree，绑定 main 分支
├── .git/                 ← 共享的 .git 目录
└── src/

.worktrees/
└── feature-a/            ← 第二个 worktree，绑定 feature/a 分支
    ├── .git              ← 不是真的 .git，是个指向 ../.git 的指针文件
    └── src/
```

每个 worktree 都绑定一个分支，多个 worktree 之间共享同一个 `.git` 目录（也就是共享对象数据库）。这样你就可以在多个工作区里同时开发不同的功能，不用频繁 `git stash` / `git checkout`。

### 为什么需要 worktree

- **同时进行多个独立开发**：你正在做 feature/a，老板突然让你紧急修一个 hotfix，可以在 worktree 里开一个 fix 分支，主分支的工作不被打断
- **主分支永远保持干净（可发布状态）**：所有实验性改动都在 worktree 里，主分支随时可以部署
- **命令工程链中** **`/build`** **的第一步**：`/build` 命令的第一步永远是 "git worktree add .worktrees/feature-x -b feature/x"

### superpowers v6.0+ 的 worktree 策略变化

一个重要的事实是：superpowers 从 v6.0 起，**worktree 目录从全局** **`~/.config/superpowers/worktrees/`** **改为项目本地** **`.worktrees/`**。

这个改动的含义是：worktree 不再是"机器级的隔离"，而是"项目级的隔离"。这意味着：

```text
v5.x 时代：~/.config/superpowers/worktrees/  ← 跨项目共享
v6.0+ 时代：项目根目录/.worktrees/          ← 项目内隔离
```

后者的好处是显而易见的：每个项目的工作区是独立的，跨项目不会互相污染；`.worktrees/` 目录还可以加进 `.gitignore`（虽然 git worktree 本身会自动管理）。

### 核心命令速查

| 命令                                    | 作用                      | 常用场景           |
| ------------------------------------- | ----------------------- | -------------- |
| `git worktree add <path> -b <branch>` | 新建 worktree + 新分支       | 开始一个新功能        |
| `git worktree list`                   | 列出所有 worktree           | 查看当前状态         |
| `git worktree remove <path>`          | 删除指定 worktree           | 功能完成或回退        |
| `git worktree prune`                  | 清理 .git 内部的 worktree 引用 | 删除失败后的补救       |
| `git worktree lock <path>`            | 锁定 worktree（防止误删）       | 长期保留的 worktree |

最常用的 4 个命令：`add` / `list` / `remove` / `prune`。记住这 4 个就够用了。

## worktree 实战：一次 6 步回退的完整教学

:::important
worktree 的威力，是在我亲手用 worktree 做完一次 UI 升级后、决定回退时彻底领悟的。这一节，我把那次 6 步交互式回退完整复盘给你。
:::

### 实战背景

这次回退涉及 4 个核心动作：

```text
步骤 0: 备份待保留的文档
步骤 1: git worktree remove --force 强制删除 worktree
步骤 2: git branch -D 删除关联分支
步骤 3: git reset --hard <commit> 回退主分支
步骤 4: git worktree prune 清理数据库记录
步骤 5: git clean -fd 清理 untracked 文件
```

让我逐步讲解每个动作的目的和坑点。

### 步骤 0：备份

虽然我决定丢掉 UI 升级的所有 commit，但 `ui-upgrade-refactor-plan.md` 和 `ui-upgrade-review-report.md` 这两份文档我留了一份作为复盘材料。这一步不是 git 操作，是"动 reset --hard 之前的最后一道保险"。

:::caution
`git reset --hard` 是**硬回退**，会丢弃目标 commit 之后的所有改动，**包括未提交的修改**。如果你工作区里有任何想保留的内容，必须先备份。
:::

### 步骤 1：删除 worktree

```bash
git worktree remove --force .worktrees/ui-upgrade-sprint1
```

这里加了 `--force` 是因为 worktree 里有一个未提交的代码修改（Sprint 1.7 之后的 ReadingProgress.astro 微调）。`--force` 会让 git **连未提交改动一起删掉**。

如果你想保留未提交改动，先把文件复制到主仓库外再删。

### Windows 上特有的坑

**坑 1**：`worktree remove` 报 "Directory not empty"

我执行 `git worktree remove` 时，第一次失败了：

```
fatal: cannot remove '.worktrees/ui-upgrade-sprint1': Directory not empty
```

原因很常见：Windows 上 dev server（`astro dev`）在运行时会持有 worktree 里的文件句柄。git 试图删除目录，但 Windows 不允许删除有进程持有句柄的文件。

**解法**：杀掉对应进程。

我当时开了两个 dev server：

- 主仓库里的 `astro dev`（在 4321 端口）
- worktree 里的 `astro dev`（worktree 启动的临时服务）

杀掉 worktree 那个进程后，删除就成功了。

**坑 2**：`cmd /c rmdir /s /q` 也失败

有人会想："既然 PowerShell `Remove-Item` 失败，那我用 `cmd /c rmdir /s /q` 绕过 PowerShell 的回收站机制总行了吧？"

不行。Windows 文件锁是系统级的，跟你用什么命令无关。**node 进程只要持有文件句柄，无论是 PowerShell、cmd、Python 脚本，都删不掉。**

**解法**：找到并杀掉持有句柄的进程。

我当时的做法是用 PowerShell 的 `Get-Process node` 列出所有 node 进程，然后通过命令行参数识别哪个是 worktree 里的 astro dev（路径里包含 `.worktrees/ui-upgrade-sprint1`），再 `Stop-Process -Id <pid>`。

**坑 3**：`git clean -fd` 多报 2 个空目录

执行 `git clean -fd` 清理 untracked 文件时，git 报了 3 个东西要删：

```text
Would remove .trae/documents/ui-upgrade-review-report.md
Would remove src/components/tech/star-map/        ← 诶？这是什么？
Would remove src/stores/                          ← 还有这个？
```

最后两个是空目录。我用 `Get-ChildItem -Recurse` 进去看了一下，里面确实啥都没有。

> **教学点**：git 不跟踪空目录——你 `git add` 一个空目录什么都不会发生。但 git 在 clean 时会把"无内容的空目录"也算作需要清理的对象。

如果你不想删空目录，可以单独用 `git clean -f`（不带 `-d`），只清文件不清目录。

### 步骤 2：删除关联分支

```bash
git branch -D refactor/ui-upgrade-sprint1
```

这里必须用 `-D`（强删），不能用 `-d`（安全删）。

原因：`git branch -d` 会检查分支是否已合并到上游。`refactor/ui-upgrade-sprint1` 还没合并到 main（main 之后会被 reset 回退），所以 `-d` 会拒绝执行。

**教学点**：`-D` 是"我知道这个分支的 commit 不会被任何分支引用了，但我就是要删"的意思。被删分支的 commit 会变成 dangling commit，git 会在 30 天后通过 `gc` 自动清理。

### 步骤 3：回退主分支

```bash
git reset --hard xxxxxxx
```

`reset --hard` 是三种 reset 模式中最"暴力"的一种：

| 模式            | 工作区 | 暂存区 | 提交历史 | 适用场景                  |
| ------------- | --- | --- | ---- | --------------------- |
| `--soft`      | 保留  | 保留  | 改写   | 想重新组织 commit          |
| `--mixed`（默认） | 保留  | 回退  | 改写   | 撤回已 add 但未 commit 的内容 |
| `--hard`      | 回退  | 回退  | 改写   | **彻底回退**到某个旧 commit   |

`--hard` 的副作用是：丢弃目标 commit 之后的所有 commit，**包括它们引入的所有文件改动**。所以这一步之前必须确认已经备份了想保留的东西。

### 步骤 4：清理 worktree 数据库记录

```bash
git worktree prune
```

`prune` 用来清理 .git 内部那些"已经 prunable 状态或物理路径已经不存在的 worktree 记录"。

**它本身是安全的**——只清理那些"已经无法访问"的引用，不会动到还在用的 worktree。

### 步骤 5：清理 untracked 文件

```bash
git clean -fd
```

`-f` 是 force（强制），`-d` 是 directories（连目录一起）。

`reset --hard` 只重置**已跟踪**的文件，对 **untracked** 文件无能为力。所以这一步专门用来清理那些"git 从来没管过"的文件。

**教学点**：

- `git clean -n` 是 dry-run，只看不删
- `git clean -fd` 是真删
- 一定要先 `-n` 预览，确认无误后再真删

### 后悔药机制：git reflog

执行完 `reset --hard` 之后，理论上 `cdf0741` 之后的 2 个 commit 已经"消失"了。但它们并没有真的消失——git 内部还留了引用，这就是 **reflog**。

```bash
git reflog
```

会显示 HEAD 的所有移动历史：

```text
cdf0741 HEAD@{0}: reset: moving to cdf07410b44e8f9c6b4d73f5c7dda9b050da3f99
7e92609 HEAD@{1}: commit: chore: ignore .worktrees directory
7314706 HEAD@{2}: commit: docs 新增ui重构计划
cdf0741 HEAD@{3}: commit: docs 新增架构通史
```

如果你后悔了想恢复 `7e92609`，可以这样：

```bash
git reset --hard 7e92609
```

git reflog 默认保留 90 天（部分版本是 30 天）。这 90 天就是你的"后悔窗口"。

:::tip
reflog 是 git 给你的最强后悔药。即使你执行了 `--hard` reset，commit 也不会真的消失，只是变成了"没人引用的悬空 commit"。只要 reflog 还在，就能找回。
:::

## 命令工程的边界与不适用场景

:::caution
命令工程不是银弹。它有一些明确的边界和不适用的场景，老实说清楚比硬吹更好。
:::

### 不适用场景

| 场景                       | 不适合的原因                      |
| ------------------------ | --------------------------- |
| **单步操作**（如 `git status`） | 不值得抽象为命令——你直接告诉 AI 做什么就行    |
| **一次性需求**                | 抽象为命令的"建立-维护-使用"成本大于一次性的便利  |
| **强合规场景**（金融、医疗）         | 流程必须 100% 固定，命令的"灵活发挥"反而是风险 |
| **个人小脚本**                | 杀鸡用牛刀——你写个 5 行的 bash 就够了    |

### 常见反模式

我在整合过程中踩过几个坑，提出来让你避雷：

- ❌ **把所有动作都抽成命令** → 命令膨胀
- ❌ **命令内写 200 行详细步骤** → 违反"简洁"原则
- ❌ **强制每步都要用户确认** → 违反"最低约束"原则
- ❌ **命令之间相互嵌套**（`/build` 内调 `/review`）→ 调用链混乱

### 什么时候该停止抽象

经验法则：

- **命令超过 20 个时**，考虑合并相似命令
- **一个命令超过 10 行说明时**，考虑拆分或删除
- **用户开始问"这个命令是干嘛的"时**，名字取错了或场景太窄

:::warning
命令工程的"简洁"原则不是口号——它是有约束的。如果你发现自己在写第 11 个命令、或者某个命令的解释开始超过 10 行，那就该停下来重新评估了。
:::

## 写在最后：给未来自己的一封信

### AI 时代的"邪修"

[《邪修法则》](../编程生涯邪修法则之结果导向法则/)的精神是"以用为纲"——结果比过程重要。命令工程就是这个精神的 AI 编程版本：

- **结果** — 我要让 AI 帮我做出能上线的软件
- **过程** — 怎么实现、用哪个 skill、跑不跑 superpowers 7 阶段，都不重要

命令工程本身就是邪修精神——**结果导向、灵活组合、不被任何流程绑架**。但比邪修更优雅：留有结构、留有接口、留有升级空间。

### 致读者

- 如果你刚开始接触 AI 编程 → 先看 mattpocock 的 `grill-me` 和 `tdd`
- 如果你想标准化团队流程 → 装 superpowers
- 如果你和我一样有自己的实践 → 试试命令工程
- 如果你觉得命令工程太重 → 直接用 skill，不用勉强

### 最后一句话

> **AI 越来越强，工作流概念越来越轻。也许有一天，连"命令"都不需要——你只需要对 AI 说"做这个"，它就懂了。但在那一天到来之前，命令工程是我能想到的、最简洁的过渡形态。**

在那一天到来之前，让我们继续做"最简洁的过渡形态"的实践者。

***

*这篇文章是我对 2026 年 7 月 AI 编程工作流的一次完整复盘。*

*如果你也在探索自己的工作流，欢迎分享交流。*
