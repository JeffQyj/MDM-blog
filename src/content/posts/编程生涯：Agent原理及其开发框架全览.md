---
title: 编程生涯：Agent原理及其开发框架全览
published: 2026-06-12
description: 站在 2026 年 Agent 生态的「寒武纪大爆发」拐点，从原理到框架全景梳理：先讲清 Agent 是什么、ReAct 与 Plan-and-Execute 两种核心运行模式，再逐一点评 Spring AI、AgentScope、LangGraph、CrewAI、OpenAI Agents SDK、PydanticAI、LlamaIndex、Dify、微软 Agent Framework、谷歌 ADK 十大主流框架，最后给出一套四步选型决策树。
tags: [Agent, 框架对比, ReAct, Spring AI, MCP]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
2026 年的 AI 世界里，最显眼的趋势只有一个：Agent。Cursor 会自己改代码，Manus 会自己查资料做 PPT，Claude Code 在你终端里直接动 shell。它们的背后是同一类东西——Agent。这篇文章要做的，是把「Agent 是什么、怎么工作、有哪些框架能落地」一次性讲透。
:::

## 一、什么是 Agent：从"会说话"到"会做事"

如果你把时间拨回到 2023 年底，那时候的大模型给所有人的印象是「能说会道，但只会说」。

你问它"北京今天多少度"，它一本正经地编一个数字；你让它"算 123 × 456"，它会"猜"一个 56088 出来——猜对了是运气，猜错了是常态。这就是当时 Karpathy 描述的「大模型像个被关在玻璃房里的超级大脑」，看得见世界、想得出思路，但摸不到、动不了。

Agent 出现之后，这一切变了。

> **Agent 是什么？** 一句话定义：能让大模型"摸到世界"的封装。

技术上的标准定义是 LLM + 记忆 + 工具 + 规划 四件套的组合。但更直观的理解是：**给大模型装上眼睛、耳朵和手脚。** 大模型只负责"思考"，Agent 主程序负责把"思考"翻译成对外部世界的操作（查天气、改文件、调用 API），再把外部世界的结果（天气数据、命令返回值）送回给大模型继续"思考"。

如果你还记得「[编程生涯：AI大模型认知之旅](../编程生涯ai大模型认知之旅/)」里讲过的"工具调用"那段——它就是 Agent 的最小细胞。一个会调用工具的大模型，就已经是半个 Agent 了。

只是当"调用工具"这件事从单步变成多步、从不规划变成有规划、从不记忆变成有记忆，一个完整的 Agent 就成型了。

### 1.1 拆开看：Agent 的四个核心组件

任何 Agent 框架，甭管吹得多花哨，本质都在搭这四样东西：

| 组件         | 作用              | 通俗比喻        | 实现方式                        |
| ---------- | --------------- | ----------- | --------------------------- |
| **LLM 大脑** | 思考、推理、生成        | 玻璃房里的大脑     | GPT、Claude、Gemini 等         |
| **记忆**     | 记住历史对话、上下文      | 脑子的工作记忆     | 内存数组、Redis、数据库              |
| **工具**     | 与外部世界交互的"手脚"    | 眼睛耳朵和手指     | `@Tool` 注解、Function Calling |
| **规划/编排**  | 决定下一步做什么、按什么顺序做 | 脑子里的"工作计划表" | ReAct、Plan-and-Execute      |

:::important
这是理解一切 Agent 框架的"母公式"——任何花里胡哨的概念（Multi-Agent、Graph、Handoffs）都是在改这四样东西的搭配方式。后面讲十个框架时，请不断回到这张表来对照。
:::

### 1.2 完整流程：用户、Agent、大模型、工具四方协作

来看一张最经典的 ASCII 协作图，后面所有的框架设计都会在这张图的基础上"加料"：

```text
用户输入："北京今天多少度？"
    ↓
┌──────────────────── Agent 主程序 ────────────────────┐
│  1. 接收用户输入                                         │
│  2. 把"系统提示 + 历史消息 + 当前问题 + 工具清单"打包给大模型  │
│  3. 大模型返回：                                        │
│     - 可能是直接答案                                      │
│     - 也可能是"工具调用指令"：                              │
│       { "tool": "get_weather", "args": {"city": "北京"}}  │
│  4. Agent 识别到是工具调用 → 实际执行工具                    │
│  5. 工具返回真实结果："北京今天 25°C，晴"                    │
│  6. 把工具结果追加到消息历史，再次丢给大模型                    │
│  7. 大模型基于真实结果，生成最终答案                           │
│  8. 输出："北京今天 25°C，晴"                              │
└───────────────────────────────────────────────────────┘
```

看懂这张图，你就看懂了 Agent 框架 80% 的"魔法"。剩下的 20% 是**怎么调度"思考→行动→观察"的循环**——这正是下一节要讲的核心。

## 二、Agent 的两大核心运行模式

2026 年的 Agent 框架，无论吹什么概念，**底层都跑着两种循环模式之一**：ReAct 或 Plan-and-Execute。把它俩搞懂，剩下十个框架就只是"语法糖"。

### 2.1 ReAct：边思考，边行动

**ReAct** 是 **Re**asoning + **Act**ing 的缩写，是 2022 年提出的一套提示工程范式。它的核心理念特别朴素：**让大模型把"想"和"做"写在同一段输出里**。

#### 工作循环：四步一循环

```text
用户：今年澳网男子冠军的家乡是哪里？
    ↓
[第 1 轮]
Thought 1: 我需要先查澳网男子冠军是谁
Action 1:   web_search("2026 年澳网男子冠军")
Observation 1: 梅德韦杰夫夺冠

Thought 2: 现在需要查他的家乡
Action 2:   web_search("梅德韦杰夫 家乡")
Observation 2: 俄罗斯莫斯科

Thought 3: 够了，可以回答了
Final Answer: 2026 年澳网男子冠军是梅德韦杰夫，他的家乡是俄罗斯莫斯科
```

看懂了吗？**ReAct 不是某段代码，而是一种"输出格式约定"**——你要求大模型必须按 `Thought / Action / Observation / Final Answer` 这种格式回答，模型就会照着这个格式"自问自答+自行动"。

#### 最小可运行的 Python 实现

下面这段代码是所有 ReAct 框架的"母版"，你看懂这个，后面的 LangGraph、AgentScope 都是这套逻辑的封装：

```python
import re
from openai import OpenAI

client = OpenAI()

# 1. 工具注册表
def tool_get_weather(city: str) -> str:
    return f"{city}今天 25°C，晴"

def tool_calculate(expression: str) -> str:
    return str(eval(expression))   # 仅作演示，生产环境禁用 eval

TOOLS = {
    "get_weather": tool_get_weather,
    "calculate": tool_calculate,
}

# 2. ReAct 的核心提示词模板
REACT_PROMPT = """
你可以使用以下工具：
- get_weather(city): 查询城市天气
- calculate(expression): 计算数学表达式

请按以下格式回答：
Thought: 你在想什么
Action: 工具名(参数)
Observation: 工具返回的结果（由系统填入）
... (Thought/Action/Observation 可以重复多次)
Final Answer: 最终答案

问题：{question}
{history}
"""

# 3. 主循环
def react_agent(question: str, max_steps: int = 5):
    history = ""
    for step in range(max_steps):
        prompt = REACT_PROMPT.format(question=question, history=history)
        response = client.chat.completions.create(
            model="gpt-5.5",
            messages=[{"role": "user", "content": prompt}]
        ).choices[0].message.content

        # 检测是否输出最终答案
        if "Final Answer:" in response:
            return response.split("Final Answer:")[-1].strip()

        # 解析 Action
        action_match = re.search(r"Action:\s*(\w+)\((.*?)\)", response)
        if not action_match:
            return "模型未按格式输出：" + response

        tool_name, args_str = action_match.groups()
        args = eval(args_str)   # 演示用，生产环境应该用更安全的解析

        # 执行工具
        tool_result = TOOLS[tool_name](**args)
        history += f"\n{response}\nObservation: {tool_result}\n"

    return "达到最大步数限制，任务未完成"

# 调用
print(react_agent("北京今天多少度？"))
```

:::important
ReAct 是 2026 年所有 Agent 框架的"通用语"。你后面看到的 LangGraph 的 node、AgentScope 的 Plan Notebook、Claude Code 的内部循环——拆到底都是 ReAct 的变体。**把这套循环看透，再看框架就是降维打击。**
:::

#### ReAct 的优缺点

| 优点                   | 缺点                          |
| -------------------- | --------------------------- |
| 灵活：每步可以根据新信息调整策略     | 易绕路：模型可能陷入"我查查、我再查查"的无意义循环  |
| 通用：任何推理+工具场景都能用      | 慢：每一步都要再问一次大模型，Token 消耗大    |
| 实现简单：核心就是一个 while 循环 | 不稳定：模型有时不按格式输出，代码要做大量容错     |
| 适合开放式问题、探索式任务        | 缺乏"全局观"：模型看不到整个任务的全貌，每步只看眼前 |

### 2.2 Plan-and-Execute：先规划，再执行

ReAct 的"边走边想"虽然灵活，但有一个绕不开的问题：**它没有大局观**。模型只看到眼前一步，不知道全局几步后才能完成。

**Plan-and-Execute 模式**就是来解决这个问题的：先把整个任务拆成完整的执行计划，然后一步步执行；执行中如果发现计划有问题，**就重做计划（Replan）**。

#### 三角色协作

```text
用户：今年澳网男子冠军的家乡是哪里？
    ↓
┌──────────────── Planner 规划器 ────────────────┐
│ 一次性输出完整计划：                                       │
│  Step 1: 搜索"2026 年澳网男子冠军"                        │
│  Step 2: 搜索"冠军的家乡"                                 │
│  Step 3: 整理答案                                       │
└─────────────────────────────────────────────────┘
    ↓ 把计划交给执行器
┌──────────────── Executor 执行器 ────────────────┐
│  按顺序执行 Step 1 / 2 / 3                                │
│  （这一步内部通常就是一个 ReAct 循环）                          │
└─────────────────────────────────────────────────┘
    ↓
┌────────────── Re-Planner 再规划器 ───────────────┐
│  检视执行结果，决定：                                       │
│  - 计划 OK → 继续往下走                                    │
│  - 计划失效 → 重新生成整个计划（回到 Planner）                    │
└─────────────────────────────────────────────────────┘
```

:::note
**为什么生产环境 Plan-and-Execute 更常见？** 三个原因：

1. 更快——计划只生成一次，节省重复规划的开销
2. 更稳——LLM 一次看全计划，规划质量通常高于"边做边想"
3. 可观测——计划本身就是结构化数据，可以画流程图、可以做断点恢复、可以方便调试

但请记住：**Plan-and-Execute 内部的执行器，本质上还是一个 ReAct 循环。** 两种模式从来不是互斥的，而是"上层规划 + 下层 ReAct"的黄金组合。
:::

#### 最小可运行的 Plan-and-Execute

```python
import json
from openai import OpenAI

client = OpenAI()

# 1. Planner：一次性生成完整计划
def plan(question: str) -> list[str]:
    prompt = f"""
    把以下任务拆成 2-5 个可执行的子步骤，每步用一句话描述。
    只返回 JSON 数组，例如：["步骤1", "步骤2", "步骤3"]

    任务：{question}
    """
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content
    return json.loads(response)

# 2. Executor：用 ReAct 模式执行单个步骤
def execute_step(step: str, context: str) -> str:
    prompt = f"""
    你正在执行计划中的一步。
    当前步骤：{step}
    已知信息：{context}

    请直接给出这一步的结果，不要重复问题。
    """
    return client.chat.completions.create(
        model="gpt-5.5",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content

# 3. Re-Planner：执行完所有步骤后决定是否需要重新规划
def replan(question: str, plan_steps: list, results: list) -> list | None:
    prompt = f"""
    原始任务：{question}
    原计划：{plan_steps}
    执行结果：{results}

    请判断：
    - 如果原计划能完成任务，返回 null
    - 如果需要调整计划，返回新的 JSON 数组
    """
    response = client.chat.completions.create(
        model="gpt-5.5",
        messages=[{"role": "user", "content": prompt}]
    ).choices[0].message.content.strip()
    return None if response == "null" else json.loads(response)

# 4. 主循环
def plan_and_execute(question: str, max_replans: int = 2):
    plan_steps = plan(question)
    print(f"📋 计划：{plan_steps}")

    for round in range(max_replans + 1):
        results = []
        context = ""
        for step in plan_steps:
            result = execute_step(step, context)
            results.append(result)
            context += f"\n{step} → {result}"

        # 让 LLM 判断是否需要重新规划
        new_plan = replan(question, plan_steps, results)
        if new_plan is None:
            return "\n".join(results)
        plan_steps = new_plan
        print(f"🔄 第 {round+1} 轮重规划：{plan_steps}")

    return "\n".join(results)

print(plan_and_execute("今年澳网男子冠军的家乡是哪里？"))
```

### 2.3 模式选择速查表

| 场景信号          | 推荐模式                            | 理由                  |
| ------------- | ------------------------------- | ------------------- |
| 任务步骤可预测、流程固定  | **Plan-and-Execute**            | 一次规划、批量执行，省 Token、稳 |
| 任务路径未知、需探索    | **ReAct**                       | 边走边调，灵活             |
| 多步骤、需要中间检查    | **Plan-and-Execute**            | 计划本身就是检查点           |
| 工具调用结果会影响后续路径 | **ReAct**                       | 动态决策                |
| 简单单步工具调用      | **ReAct**（直接用）                  | 杀鸡用牛刀没必要            |
| 复杂多步业务流程      | **Plan-and-Execute + 内层 ReAct** | 取两者之长               |

**一句话口诀：「流程固定用 Plan，路径未知用 ReAct」。**

## 三、协议层：MCP 与 A2A，重塑 Agent 生态的两件大事

如果你只看框架不看协议，会错过 2025-2026 年 Agent 生态最重要的两个变化。**协议的出现，正在把 Agent 框架从"孤岛"变成"互联网络"**。

### 3.1 MCP：让工具"即插即用"

**MCP（Model Context Protocol）** 是 Anthropic 在 2024 年 11 月推出的开放协议，目标是统一"大模型 ↔ 工具/数据源"的通信方式。

打个比方：

> **MCP 之于 Agent 工具，就像 USB 之于外设。** 在 USB 之前，每个键盘、每个鼠标都要自己写驱动；USB 之后，所有设备即插即用。MCP 要解决的是同一个问题——以前每个 Agent 框架都要自己实现一遍"高德地图工具"、"天气工具"，现在大家按 MCP 协议做一次，所有支持 MCP 的 Agent 框架都能直接用。

#### MCP 架构

```text
┌──────────────── MCP Client (Agent 应用) ────────────────┐
│  LangGraph / Spring AI / Cursor / Claude Code 等等        │
└──────────────────────┬──────────────────────────────────┘
                       │ MCP 协议（stdio / SSE）
                       ↓
┌──────────────── MCP Server (工具服务) ─────────────────┐
│  - 高德地图 MCP Server                                    │
│  - 自定义天气 MCP Server                                  │
│  - GitHub MCP Server                                    │
│  - 企业内部业务系统 MCP Server                              │
└─────────────────────────────────────────────────────────┘
```

如果对 MCP 还比较陌生，我在「[独立项目：AI天机学堂+MCP协议+MyManus智能体](../独立项目ai天机学堂mcp协议mymanus智能体/)」里做过完整的 Spring AI MCP 实战——从原理到自定义 Server 部署，一行行代码都拆解过，可以作为这篇全览的"代码版"补充。

#### MCP 协议对框架选型的影响

| 时间点         | Agent 工具生态           | 框架差异                         |
| ----------- | -------------------- | ---------------------------- |
| **2024 年前** | 每个框架自带工具集            | 框架 A 的高德工具 ≠ 框架 B 的高德工具      |
| **MCP 出现后** | 工具按 MCP 协议开发一次，全框架通用 | 「支持多少工具」权重下降，「对 MCP 的支持」权重上升 |

:::tip
**选型速记**：2026 年选 Agent 框架，第一眼看「原生支持 MCP」，第二眼看「状态管理能力」，第三眼看「学习曲线」。「自带多少工具」这个曾经的关键指标，已经不重要了。
:::

### 3.2 A2A：让 Agent 互相"对话"

**A2A（Agent-to-Agent Protocol）** 是 Google 在 2025 年 4 月推出的开放协议，解决的是另一个问题：**不同框架、不同语言写的 Agent 怎么互相协作？**

> 如果 MCP 是 USB（让 Agent ↔ 工具标准化），那 A2A 就是 HTTP（让 Agent ↔ Agent 标准化）。

想象这样一个场景：你用 LangGraph 写了一个数据分析 Agent，公司另一个团队用 CrewAI 写了一个报告生成 Agent。以前它们没法直接对话——你得让 LangGraph 的 Agent 输出 JSON，存到文件，另一个 Agent 起来读文件。A2A 出现后，两个 Agent 能像人跟人发消息一样协作：发任务、传结果、报告状态。

#### A2A 核心概念

| 概念             | 含义                    | 类比   |
| -------------- | --------------------- | ---- |
| **Agent Card** | Agent 的"身份证"，声明自己会做什么 | 求职简历 |
| **Task**       | 一次协作任务                | 微信对话 |
| **Message**    | Agent 间传递的消息          | 微信消息 |
| **Artifact**   | 任务产出的工件（文件、数据）        | 邮件附件 |

#### 当前 A2A 的支持情况

截至 2026 年中：

- **原生支持**：Microsoft Agent Framework、Google ADK、AgentScope
- **适配中**：LangGraph、OpenAI Agents SDK
- **观望中**：部分老牌框架

:::caution
**生态判断**：A2A 还没到"MCP 那种不可不用"的程度，但如果你的项目需要多 Agent 协作（企业内多部门 Agent 联动），选框架时把 A2A 支持当作加分项，未来少返工。
:::

### 3.3 Context Engineering：超越 Prompt Engineering

2026 年，还有一个被反复提及的新词：**Context Engineering**（上下文工程）。

**它是什么？** 不再只关心"提示词写得多好"，而是关心"送进大模型上下文的信息质量与结构"。

**为什么重要？** 大模型的能力越来越强，但上下文窗口再大也有限。**怎么在有限窗口里塞进最相关、最有用的信息**，成了 Agent 工程化的核心难题。

Context Engineering 推动了一波创新：

| 创新方向       | 做法             | 代表框架特性                   |
| ---------- | -------------- | ------------------------ |
| **记忆压缩**   | 长期记忆自动摘要       | LangGraph 的 checkpointer |
| **上下文过滤**  | 只把相关工具/文档送进上下文 | LlamaIndex 的检索过滤         |
| **动态工具选择** | 工具太多时只暴露相关的几个  | PydanticAI 的工具集裁剪        |
| **多模态上下文** | 文本/图像/音频统一管理   | Google ADK 原生多模态         |

:::caution
如果你还在纠结"提示词怎么写"，**是时候把注意力升级到"上下文怎么管"了**。同一个模型，用 Context Engineering 思想的 Agent 比纯 Prompt 调优的 Agent，效果差距可以达到 30%-50%。
:::

## 四、十大主流开发框架全览

这一节是整篇文章的"重头菜"——按技术栈和范式，对 2026 年最值得关注的十个 Agent 框架做一次系统点评。

### 4.1 Java 生态：Spring 系 + AgentScope

#### Spring AI + Spring AI Alibaba

如果说 LangChain 是 Python 生态 Agent 框架的"事实标准"，那 Spring AI 就是 Java 生态的"官方答案"。

| 维度            | 内容                                          |
| ------------- | ------------------------------------------- |
| **出身**        | VMware / Spring 官方                          |
| **核心理念**      | 让 AI 能力成为 Spring 生态的"一等公民"                  |
| **核心组件**      | ChatClient（统一 API）、@Tool（工具调用）、Advisor（拦截器） |
| **Java 生态集成** | Spring Boot Starter 风格，零配置启动                |
| **阿里扩展**      | Spring AI Alibaba 提供 Graph 工作流（多步编排）        |
| **MCP 支持**    | 原生支持 MCP Client 和 MCP Server                |
| **一句话点评**     | **Java 后端转 AI 的第一站**                        |

**它最适合谁？** 已经在用 Spring Boot 写企业级后端、希望在不换技术栈的前提下引入 AI 能力的团队。**它最不擅长什么？** 复杂多 Agent 协同——虽然 Spring AI Alibaba 的 Graph 提供了一些工作流能力，但相比 LangGraph 这种专为图编排设计的框架，灵活度差一截。

如果你刚学完 Spring AI，可以直接看「[编程生涯：SpringAI与LangChain4J——Java开发者拥抱AI的双引擎](../编程生涯springai与langchain4jjava开发者拥抱ai的双引擎/)」，里面有一个完整的 Spring AI 入门路径，从依赖到代码跑通都有。

#### AgentScope（阿里通义实验室）

如果说 Spring AI 是"Java 程序员的官方 AI 工具箱"，那 **AgentScope** 就是阿里出品的"自主式多智能体协作平台"。

| 维度         | 内容                                                   |
| ---------- | ---------------------------------------------------- |
| **出身**     | 阿里通义实验室开源（多语言 SDK：Python、Java、JavaScript）            |
| **核心理念**   | 给大模型"自主权"——让它自己决定怎么做                                 |
| **三大独家特性** | ① Plan Notebook（结构化任务管理）② 响应式架构（Serverless 友好）③ 安全沙箱 |
| **配套工具**   | AgentScope Studio（可视化追踪和调试）                          |
| **A2A 支持** | 原生支持                                                 |
| **一句话点评**  | **国内多智能体项目最值得关注的新生代框架**                              |

**Plan Notebook 是什么？** 想象一下：你让 Agent 写一篇调研报告，Plan Notebook 会自动把"查资料→整理大纲→写初稿→修订"这几步画成结构化计划，每完成一步打个勾。这比 ReAct 那种"我下一步想想下一步做什么"清晰得多——计划是显式的、可追踪的、可中断可恢复的。

**安全沙箱又是什么？** 大模型生成的代码、SQL、shell 命令，在沙箱里跑——出问题了不会影响真实环境。这对生产环境特别关键。

### 4.2 Python 生态：五大范式

Python 生态的 Agent 框架数量爆炸，按"编排范式"分可以归为五大类。

#### 范式一：图状态机（Graph State Machine）

##### LangGraph

**LangGraph** 是 LangChain 团队 2024 年推出的"低抽象、高控制"框架。它的哲学很特别——**故意不做太多封装，把控制权完全交给开发者**。

| 维度         | 内容                                                   |
| ---------- | ---------------------------------------------------- |
| **核心理念**   | "少抽象，多控制"                                            |
| **三大积木**   | node（节点，执行一步）、edge（边，流转条件）、state（共享状态）               |
| **独门武器**   | checkpointer（断点恢复）、time-travel（时间回溯）、interrupt（人在环中） |
| **学习曲线**   | 中等（需要理解图的概念）                                         |
| **生产就绪度**  | 极高（金融、医疗的合规场景首选）                                     |
| **MCP 支持** | 原生                                                   |
| **一句话点评**  | **"Agent 框架里的 Linux"——强大但需要你懂**                      |

为什么说"像 Linux"？因为它给你的是**原语**，不是解决方案。你要自己用 node、edge 把业务逻辑画出来。但反过来，你想要什么行为都能实现，不受框架的"魔法"限制。

**典型应用场景**：

- 金融审批流程（合规检查 + 人在审批）
- 医疗诊断（多轮问诊 + 检查点回滚）
- 复杂状态机业务（订单流转、工单处理）

#### 范式二：角色驱动（Role-Driven）

##### CrewAI

如果说 LangGraph 是"给你原语让你画图"，**CrewAI** 就是反方向——**让你像组团队一样组 Agent**。

| 维度         | 内容                                           |
| ---------- | -------------------------------------------- |
| **核心理念**   | "像组建真实团队一样组建 Agent 团队"                       |
| **三大概念**   | Agent（角色，有 backstory）、Task（任务）、Process（协作流程） |
| **两种编排**   | Crews（自主协作）+ Flows（事件驱动）                     |
| **学习曲线**   | 极低（一天能上手）                                    |
| **MCP 支持** | 适配中                                          |
| **一句话点评**  | **"Agent 界的创业团队"——上手最快，5 分钟跑通多 Agent 演示**    |

**典型应用场景**：

- 内容创作（研究员 + 写手 + 编辑 + 审校）
- 市场调研（数据收集 + 分析 + 报告）
- 快速原型（验证 Agent 协同的可行性）

CrewAI 的优势是**开发体验好**，但生产环境的"重型任务"还是建议迁移到 LangGraph。

#### 范式三：事件驱动 / 数据连接

##### LlamaIndex

**LlamaIndex** 的出身是"让大模型能读懂你的私有数据"，所以它在"数据接入"这条赛道上做到了极致。

| 维度        | 内容                                 |
| --------- | ---------------------------------- |
| **核心优势**  | 300+ 数据连接器（PDF、数据库、Notion、Slack……） |
| **独门武器**  | LlamaParse（解析 130+ 文件格式，含表格、图表）    |
| **编排层**   | Workflows 1.0（事件驱动的工作流）            |
| **学习曲线**  | 中等                                 |
| **一句话点评** | **"Agent 的数据粮仓管理员"——要做 RAG 选它**    |

**典型应用场景**：

- 企业知识库问答（PDF、Word、Excel、PPT 全支持）
- 财务报告分析（LlamaParse 解析表格能力突出）
- 学术文献研究

注意：LlamaIndex **不是"纯 Agent 框架"**，它更准确的身份是"Agent 时代的数据基础设施"——你可以在它的数据层之上接 LangGraph、CrewAI 等。

#### 范式四：SDK 封装（Type-Safe SDK）

##### OpenAI Agents SDK

**OpenAI Agents SDK** 是 OpenAI 在 2025 年推出的官方 Agent 库，最大特点：**就三个概念，一目了然**。

| 概念            | 作用                  |
| ------------- | ------------------- |
| **Agent**     | 一个有指令、工具的大模型封装      |
| **Handoff**   | Agent 间转移控制权（像客服转接） |
| **Guardrail** | 输入/输出护栏（防止不安全内容）    |

**亮点**：

- 原生支持 **Realtime Voice Agents**（实时语音）
- 与 OpenAI 的其他产品（Assistants API、Realtime API）深度集成
- **Handoff 创新**：把"控制权转移"做成框架原语，多 Agent 协作写起来非常自然

**短板**：

- 缺乏持久化（生产环境的 session 管理要自己实现）
- 编排模式有限（不像 LangGraph 那么灵活）
- 对非 OpenAI 模型支持一般

**一句话点评**：**"OpenAI 官方出品的'开箱即用'工具包"**——如果你只用 OpenAI 模型，这是最省心的选择。

##### PydanticAI

**PydanticAI** 走的是另一条路：**把 FastAPI 的开发体验带给 Agent**。

| 维度        | 内容                                                  |
| --------- | --------------------------------------------------- |
| **核心理念**  | 类型安全、自动重试、模型无关                                      |
| **独门武器**  | **依赖注入**（测试时用 test\_model / FunctionModel 替换真实 LLM） |
| **支持模型**  | 25+ 模型提供商（OpenAI、Anthropic、Gemini、本地 Ollama……）      |
| **学习曲线**  | 中低（对 Pydantic 熟悉的开发者零成本）                            |
| **一句话点评** | **"Agent 界的 TypeScript"——类型即文档，确定性测试是杀手锏**          |

**为什么说"杀手锏"？** Agent 测试一直是个大难题——同一个问题，大模型可能给你略微不同的答案，没法写传统单元测试。PydanticAI 的解法：**测试时用一个"假模型"（FunctionModel）替换真模型，断言它的输入和输出**。这一招直接让 Agent 测试从"玄学"变成"工程"。

#### 范式五：低代码平台

##### Dify

**Dify** 不太一样——它**不是 Python 库，而是一个 Web 平台**。你登录网页，拖拽组件，就能搭一个 Agent 应用。

| 维度            | 内容                                  |
| ------------- | ----------------------------------- |
| **形态**        | Web 平台 + API                        |
| **核心能力**      | 拖拽式工作流编辑器、知识库管理、API 一键发布、监控观测       |
| **社区规模**      | 13.1K+ stars（GitHub）                |
| **2026 商业进展** | 3 月完成 3000 万美元 Pre-A 轮融资            |
| **一句话点评**     | **"AI 应用的 PowerPoint"——人人可搭 Agent** |

**典型应用场景**：

- 企业内部 AI 应用快速搭建
- 非技术人员也能用（产品、运营）
- 私有化部署

**局限**：灵活性受限于可视化编辑器——复杂业务逻辑可能要做定制开发。

### 4.3 大厂统一框架

#### Microsoft Agent Framework

**Microsoft Agent Framework**（简称 MAF）是 2025 年微软把 **AutoGen**（学术前沿）和 **Semantic Kernel**（企业级引擎）合并后的产物。

| 维度         | 内容                                                                   |
| ---------- | -------------------------------------------------------------------- |
| **出身**     | 微软（吞并了 AutoGen + Semantic Kernel）                                    |
| **三大独家优势** | ① 唯一同时原生支持 .NET 和 Python ② 原生支持 A2A / AGUI / MCP 三大协议 ③ 与 Azure 深度集成 |
| **状态**     | 2026 年 2 月达 RC，预计 Q1 末正式 GA                                          |
| **一句话点评**  | **"微软的全家桶"——.NET 企业的唯一选择**                                           |

**如果你是 .NET 团队？** 别犹豫，就它了。其他 Python 框架你用着别扭，MAF 是你唯一能"原生 .NET"的选项。

#### Google ADK

**Google ADK（Agent Development Kit）** 是 Google Cloud 的官方 Agent 框架。

| 维度        | 内容                                                              |
| --------- | --------------------------------------------------------------- |
| **支持语言**  | Python、TypeScript、Java、Go（多语言）                                  |
| **Agent** | LLM Agent、Sequential Agent、Parallel Agent、Loop Agent、Base Agent |
| **集成**    | Vertex AI / Google Cloud 深度集成                                   |
| **一句话点评** | **"Google 云的亲儿子"——GCP 企业的自然选择**                                 |

**五类 Agent 的设计哲学**：Google 不给你一个"通用 Agent"概念，而是给了五种"积木式" Agent——你用 Sequential 串行、用 Parallel 并行、用 Loop 循环、用 Base 自定义。**这是 Google 一贯的"小而精"哲学**。

### 4.4 横向对比表

| 框架                            | 范式       | 学习曲线   | 状态管理   | 工具生态       | 隐性成本             | 适用场景                |
| ----------------------------- | -------- | ------ | ------ | ---------- | ---------------- | ------------------- |
| **Spring AI**                 | 工作流      | 中      | 中      | 强（Java 生态） | 低                | Java 企业的 AI 集成      |
| **AgentScope（Java）**          | 多智能体     | 中      | 强      | 强          | 低                | 国内多 Agent 项目        |
| **LangGraph**                 | 图状态机     | 中      | **极强** | 极强         | 中                | 复杂业务流程、生产级          |
| **CrewAI**                    | 角色驱动     | **极低** | 中      | 强          | 低                | 快速原型、内容创作           |
| **LlamaIndex**                | 数据连接     | 中      | 中      | **极强**     | 中（LlamaParse 收费） | RAG、文档问答            |
| **OpenAI Agents SDK**         | SDK      | 低      | 弱      | 中          | 低                | 纯 OpenAI 生态         |
| **PydanticAI**                | 类型安全 SDK | 中低     | 中      | 强          | **极低**           | 类型敏感项目、需要可测试        |
| **Dify**                      | 低代码      | **极低** | 弱      | 强          | 中                | 快速搭建、非技术用户          |
| **Microsoft Agent Framework** | 大厂统一     | 中      | 强      | 强          | 中（Azure 绑定）      | .NET 团队、企业 Azure 用户 |
| **Google ADK**                | 大厂统一     | 中      | 强      | 强          | 中（GCP 绑定）        | Google Cloud 用户     |

## 五、四步选型决策树

面对十个框架，怎么选？我的方法是**四步决策**——按优先级逐层筛选。

### 5.1 第一步：看团队技术栈

这是**最硬性**的一票否决条件：

| 团队主要技术栈               | 首选                            | 备选                 |
| --------------------- | ----------------------------- | ------------------ |
| **纯 .NET**            | Microsoft Agent Framework     | （基本没别的选）           |
| **Java / Spring**     | Spring AI / Spring AI Alibaba | AgentScope（Java 版） |
| **TypeScript / Node** | OpenAI Agents SDK（JS 版）       | LangGraph.js       |
| **纯 Python**          | 全可选                           | 见第二步               |

### 5.2 第二步：看核心场景

| 核心场景              | 首选                                    | 理由                        |
| ----------------- | ------------------------------------- | ------------------------- |
| **数据密集型 RAG**     | LlamaIndex                            | 300+ 数据连接器、LlamaParse 解析强 |
| **角色化多 Agent 协同** | CrewAI                                | 团队隐喻，5 分钟上手               |
| **复杂有状态工作流**      | LangGraph                             | 状态机模型 + checkpointer      |
| **快速原型验证**        | CrewAI / OpenAI Agents SDK            | 学习曲线低                     |
| **企业级 / 生产环境**    | LangGraph / Microsoft Agent Framework | 状态管理、合规、可观测性              |
| **国内私有化部署**       | AgentScope / Dify                     | 中文支持、私有化友好                |
| **类型安全 + 可测试**    | PydanticAI                            | 杀手锏级测试能力                  |

### 5.3 第三步：看部署云

这一关经常被忽略，但**绑定云的隐性成本最高**：

| 部署环境             | 友好框架                      | 绑定警告           |
| ---------------- | ------------------------- | -------------- |
| **Azure**        | Microsoft Agent Framework | 深度集成 Azure AI  |
| **Google Cloud** | Google ADK                | Vertex AI 几乎必备 |
| **阿里云**          | AgentScope / Dify         | 通义千问原生支持       |
| **AWS / 自建**     | LangGraph / CrewAI        | 中立，不绑定         |

### 5.4 第四步：看大模型偏好

| 偏好                         | 友好框架                               |
| -------------------------- | ---------------------------------- |
| **深度绑定 OpenAI**            | OpenAI Agents SDK                  |
| **依赖 Gemini**              | Google ADK                         |
| **国产模型（通义、deepseek、Kimi）** | AgentScope / Dify                  |
| **多模型混用**                  | PydanticAI / LangGraph（都支持 25+ 模型） |

:::tip
**选型速记卡**：

- 想要**类型安全 + 可测试**？PydanticAI 走起
- 想要**生产级稳定性**？LangGraph 优先
- 想要**5 分钟跑通演示**？CrewAI 上手
- 想要**不做运维**？Dify 在线版
- 想要\*\*.NET 唯一选择\*\*？Microsoft Agent Framework
- 想要**国内私有化**？AgentScope + 通义千问
  :::

## 六、隐性成本与未来趋势

框架选完了，不代表真的"搞定"了。每个框架背后都有**容易忽略的隐性成本**。

### 6.1 容易被忽略的隐性成本

| 框架                            | 隐性成本                           | 真实代价                 |
| ----------------------------- | ------------------------------ | -------------------- |
| **LangGraph**                 | 几乎必须用 LangGraph Platform 做生产部署 | 多 $1000+/月           |
| **LlamaIndex**                | 高质量解析需付费 LlamaParse            | 按页计费                 |
| **Microsoft Agent Framework** | 深度绑定 Azure AI 服务               | Azure 订阅成本           |
| **Google ADK**                | Vertex AI 几乎必备                 | GCP 成本               |
| **OpenAI Agents SDK**         | 持久化、复杂编排要自己写                   | 2-3 周开发工时            |
| **CrewAI**                    | 大量 Agent 时 LLM 调用成本飙升          | 多 Agent 协同的 Token 费用 |
| **Spring AI**                 | 企业级特性（如完整的 RAG 流水线）需自己组合       | 集成工时                 |
| **AgentScope**                | 文档以中文为主，国际社区生态还在建设             | 国际化项目需谨慎             |

:::caution
**免费 ≠ 生产可用**。很多框架开源版和商业版能力差距巨大——选型时一定要看"商业版有哪些企业级特性"再决定，别被"开源"两个字冲昏头脑。
:::

### 6.2 未来趋势判断

站在 2026 年中的拐点，几个判断供参考：

| 趋势                          | 证据                                 |
| --------------------------- | ---------------------------------- |
| **LangGraph → 复杂工作流事实标准**   | checkpointer、time-travel 设计被多个框架借鉴 |
| **PydanticAI → 类型安全基础设施标准** | 依赖注入模式已成行业共识                       |
| **MCP → 工具调用统一标准**          | 8/10 主流框架已原生支持                     |
| **A2A → 多 Agent 协作标准**      | 微软、谷歌、阿里都在做                        |
| **AutoGen → 可能被边缘化**        | 已被微软合并到 MAF                        |
| **Dify 类低代码 → 持续增长**        | 商业化进展顺利，企业接受度提升                    |
| **国产框架崛起**                  | AgentScope、通义百炼、扣子（Coze）等          |

## 七、给三类开发者的起步建议

千人千面，给三类最常见的开发者画像分别开药方。

### 7.1 独立开发者 / 技术探索者

**目标**：快速验证想法、做出能跑的 Demo。

| 阶段          | 推荐框架                           | 理由                |
| ----------- | ------------------------------ | ----------------- |
| **入门**      | PydanticAI / OpenAI Agents SDK | 概念少、文档好、5 分钟跑通    |
| **复杂编排**    | LangGraph                      | 需要状态管理时再上         |
| **演示给非技术人** | Dify 在线版                       | 拖拽搭建，5 分钟出一个可交互应用 |

**避坑**：不要上来就上 LangGraph。它的"图状态机"概念学习曲线陡，先用 CrewAI 验证"多 Agent 协同是否真的有效"再决定。

### 7.2 初创公司技术团队

**目标**：快速验证 → 迁移生产。

| 阶段       | 推荐框架              | 理由                |
| -------- | ----------------- | ----------------- |
| **原型**   | CrewAI            | 上手快，团队"全栈工程师"都能贡献 |
| **MVP**  | OpenAI Agents SDK | 单代码库，易维护          |
| **生产**   | LangGraph         | 状态管理、可观测性、回溯能力    |
| **企业交付** | Dify（私有化版）        | 给非技术同事用           |

**路径**：CrewAI 快速验证 → OpenAI Agents SDK 做 MVP → LangGraph 改造生产。这是一个**渐进式迁移**策略，避免"原型直接上 LangGraph"导致项目延期。

### 7.3 大型企业技术委员会

**目标**：统一技术栈、规避供应商锁定、保障合规。

| 阶段       | 推荐框架                        | 理由           |
| -------- | --------------------------- | ------------ |
| **战略层**  | 先定云战略（Azure / GCP / 多云）     | 决定框架候选池      |
| **协议层**  | 优先选 MCP / A2A 支持好的框架        | 未来生态互操作的基础   |
| **大厂项目** | MAF（Azure）/ Google ADK（GCP） | 原厂支持、企业级 SLA |
| **多云项目** | LangGraph + PydanticAI      | 不绑定单一云厂商     |
| **国内项目** | AgentScope + Dify           | 中文支持、私有化部署   |

**避坑**：避免"每个项目选不同框架"。Agent 框架的"切换成本"远高于"切换大模型"——一旦选了 LangGraph，整个团队的知识栈、运维栈、可观测性都围绕它建。建议**企业内统一 1-2 个主力框架**，其他做实验性使用。

## 写在最后：从"框架战国"到"协议一统"

> **框架战国远未结束，协议一统刚刚开始。**
> 选框架不是选"最好的"，是选"最适合你此刻的"。

如果你不知道从哪里开始——**先跑通一个 ReAct 循环，再去选框架**。当你亲手写过 Thought / Action / Observation 那段循环，再看 LangGraph、AgentScope 这些框架时，会发现它们都只是"帮你少写代码"而已。

:::warning
**警惕"框架依赖症"**：今天 LangGraph 最强，明天可能就变了。把时间花在"理解 Agent 的本质"上，而不是"背诵某个框架的 API"上。本质不变，应万变。
:::

:::important
**技术浪潮里，唯一不变的是"变化本身"**。三年前我还在 PTA 上纯手敲代码，现在我已经在用 Agent 自动生成代码 + 自动写文章 + 自动做研究。但越是这个时代，越要守住"理解原理"这条底线——会跑通框架和能讲清原理，是两种完全不同的人。AI 时代，前者会被替代，后者不会。
:::

***

*更多 Agent 实战细节可查看「[独立项目：AI天机学堂+MCP协议+MyManus智能体](../独立项目ai天机学堂mcp协议mymanus智能体/)」中的 MCP 协议完整实战，以及「[编程生涯：SpringAI与LangChain4J](../编程生涯springai与langchain4jjava开发者拥抱ai的双引擎/)」中的 Java 生态入门。Agent 的故事还在继续，框架的故事才刚刚开始。*
