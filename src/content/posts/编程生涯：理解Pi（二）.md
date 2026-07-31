---
title: 编程生涯：理解Pi（二）
published: 2026-07-31
description: 继续理解 Pi 桌面 Agent 源码课，聚焦「记忆」与「专业能力」：拆开多轮对话里四种消息类型，走进 Session 会话树、JSONL 持久化、Compaction 上下文压缩与 Steering 运行转向，理解动态 System Prompt 的构建链，最后完整掌握 Skill 技能从创建、发现、触发到测试分发的全生命周期。
tags: [理解Pi, 桌面Agent, 上下文工程, Skill, 会话记忆]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
上一篇我们让 Agent 开口说话、动手干活，还给它装上了审批闸门——但一个只会「单轮干活」的 Agent，跟一个能「记住你、越用越专业」的 Agent，差距是全方位的。这一篇解决两件事：**记忆**（多轮对话、会话树、上下文压缩）和**专业能力**（动态 System Prompt 与 Skill 技能体系）。先把这两块吃透，下一篇才谈得上扩展与上线。
:::

## 一、多轮对话到底保存了什么

先看一个场景：桌面 Agent 已经能安全地调用工具，用户连续提问：

```
用户：读取 src/config.ts，告诉我默认端口。
Agent：默认端口是 3000。
用户：把它改成 8080。
```

第二句话里的「它」指什么？模型若只收到最后一句，就不知道「它」是 `src/config.ts` 中的端口。桌面应用必须把前面的对话带入下一次请求。

但「保存对话」不是把界面里的所有文字拼成一个字符串。Pi 至少涉及**四种不同概念**：

### 1.1 四种消息，不共用一个类型

| 集合               | 用途                                         | 是否直接发送模型 |
| ---------------- | ------------------------------------------ | -------- |
| `ChatItem[]`     | 桌面界面渲染（折叠、动画、头像、进度）                        | 否        |
| `AgentMessage[]` | Agent 运行时 Transcript（含自定义消息）               | 转换后才发送   |
| `Message[]`      | Provider 请求协议（User/Assistant/ToolResult）   | 是        |
| `Context`        | 一次模型请求看到的 System Prompt + Messages + Tools | 是        |

:::warning
如果直接把 UI 状态塞进 User Message，模型会看到「折叠」「复制成功」「窗口失焦」等无关文字。反过来，如果只保存 UI 展示文本，Tool Call 的结构化信息又会丢失。**模型要正确完成下一步，必须知道的事实**和**只是界面状态的字段**，是两回事。
:::

### 1.2 AgentMessage 与 Message 的区别

`Message` 是 `pi-ai` 和 Provider 能理解的协议消息；`AgentMessage` 在此基础上，允许应用通过 TypeScript declaration merging 增加**自定义消息**：

```typescript
type ApprovalNotice = {
	role: "approvalNotice";
	toolCallId: string;
	decision: "allowed" | "denied";
	timestamp: number;
};

declare module "@earendil-works/pi-agent-core" {
	interface CustomAgentMessages {
		approvalNotice: ApprovalNotice;
	}
}
```

这就是为什么 Agent Loop 全程使用 `AgentMessage[]`，只在真正调用模型前才转换成 `Message[]`。

### 1.3 真正发送模型前的两道转换

`streamAssistantResponse()` 按顺序执行：

```typescript
let messages = context.messages;

// 第一道：transformContext —— AgentMessage[] → AgentMessage[]
if (config.transformContext) {
	messages = await config.transformContext(messages, signal);
}

// 第二道：convertToLlm —— AgentMessage[] → Message[]
const llmMessages = await config.convertToLlm(messages);
```

两者职责不同：

- **transformContext**：输入输出都是 `AgentMessage[]`，适合压缩旧历史、裁剪不相关消息、注入外部上下文——在 Agent Message 层调整请求视图；
- **convertToLlm**：把 `AgentMessage[]` 变成 Provider 能理解的 `Message[]`，适合把自定义消息转成 User Message、过滤只供 UI 使用的消息。

顺序固定为：`AgentMessage[] → transformContext → AgentMessage[] → convertToLlm → Message[] → pi-ai Context`。

:::important
`transformContext()` 返回的新数组只改变**本次请求视图**，并不会自动替换 `agent.state.messages`。而且 Context 快照只复制顶层数组，里面的消息对象仍与 Agent State **浅共享**——转换器应按纯函数方式工作：返回新数组、不原地改写、不修改消息对象。否则会污染 `agent.state.messages`，也会影响当前 Run 后续 Turn 的上下文。
:::

### 1.4 display 不等于模型可见性

coding-agent 的 `CustomMessage` 有一个 `display` 字段，但当前 `convertToLlm()` 转换 Custom Message 时**没有检查它**。所以：

- `display: false` **不代表**「不会发送给模型」；
- 一条消息可以：UI 不显示但进入模型 Context；UI 显示但被自定义 `convertToLlm` 过滤；两边都看到；两边都不保留。

桌面应用必须分别定义 `visibleInUI` 和 `includeInModelContext`，**不要用一个布尔值承担两个安全含义**。

### 1.5 完整走一遍「把它改成 8080」

```text
UserMessage("读取 config.ts，告诉我默认端口")
AssistantMessage(toolCall: read_file)
ToolResultMessage(文件内容)
AssistantMessage("默认端口是 3000")
UserMessage("把它改成 8080")     ← 第二次 prompt 追加
    ↓ 下次模型调用前：
    transformContext → convertToLlm → Context(System Prompt + Messages + Tools)
    ↓
模型从历史 Tool Call、Tool Result 和回答中理解「它」
    ↓
模型生成 edit_file Tool Call → Permission Gate → Tool Result
```

## 二、保存与恢复会话：从内存到磁盘

内存里的 `agent.state.messages` 会在应用退出后消失。昨天让 Agent 读了 `src/config.ts`，今天打开应用，它应该继续理解「把那个端口改成 8080」——这需要把可重建会话的事实写入持久层。

### 2.1 不要只保存 messages.json

最小的错误实现是 `writeFile("messages.json", JSON.stringify(agent.state.messages))`。它至少遗漏：Session ID 和创建时间、工作目录、当前模型、Thinking Level、当前启用的工具、分支之间的父子关系、Context Compaction、扩展的持久状态、当前位于哪个分支 Leaf。

Pi 把会话存成**一系列 Entry**：

```text
Session Metadata / Header
  └── Message Entry
  └── Message Entry
  └── Model Change Entry
  └── Compaction Entry
  └── ...
```

消息只是 Entry 的一种。每个 Entry 都有共同的骨架：

```typescript
interface SessionTreeEntryBase {
	type: string;         // message / model_change / compaction / custom ...
	id: string;           // 稳定 ID
	parentId: string | null; // 指向父 Entry，构成树
	timestamp: string;
}
```

模型变化不是修改旧 Header，而是**追加新 Entry**——append-only 设计保留了发生顺序，也为下一章的会话树打下基础。

### 2.2 三层抽象：Repo、Storage、Session

| 层                | 负责什么                                               | 桌面应用对应操作        |
| ---------------- | -------------------------------------------------- | --------------- |
| `SessionRepo`    | 管理一组会话：create / open / list / delete / fork        | 新建、最近会话、删除、复制会话 |
| `SessionStorage` | 一个会话的底层 Entry：appendEntry / getEntries / setLeafId | 读写会话文件          |
| `Session`        | 领域 API：appendMessage / buildContext / moveTo       | 业务代码主要用它        |

业务代码主要使用 Repo 和 Session，**不需要知道 Entry 实际存成一行 JSON 还是一张数据库表**。

### 2.3 JSONL Session 是什么

JSONL 是「一行一个 JSON 对象」：

```jsonl
{"type":"session","version":3,"id":"session-1","timestamp":"2026-07-27T08:00:00.000Z","cwd":"/work/app"}
{"type":"message","id":"e1","parentId":null,"timestamp":"2026-07-27T08:00:01.000Z","message":{"role":"user","content":"读取 config.ts","timestamp":1785139201000}}
{"type":"model_change","id":"e2","parentId":"e1","timestamp":"2026-07-27T08:00:02.000Z","provider":"openai","modelId":"gpt-example"}
```

第一行是 Header（描述格式版本、Session ID、cwd 等），后面每行是 Entry。

优点：新 Entry 追加到文件末尾、人可直接查看、单个 Entry 容易导出调试、文件损坏可定位到具体行、不需要数据库服务。代价：打开需解析、大量会话搜索不如数据库、多进程并发写需额外设计。

:::tip
`JsonlSessionRepo` 会规范化 Session 根目录，把 cwd 编码为子目录，创建带时间和 Session ID 的 `.jsonl` 文件。**不要把 API Key 放进** **`metadata`**——JSONL 是普通本地文件，不会自动加密。
:::

### 2.4 三个后端的选型

| 后端       | 重启恢复 | 适合                |
| -------- | ---- | ----------------- |
| InMemory | 否    | 测试、临时会话、界面预览      |
| JSONL    | 是    | 本地优先、易调试、会话文件导入导出 |
| SQLite   | 是    | 桌面产品、大量会话、事务与查询   |

第一版桌面 Agent 可以从 JSONL 开始。业务层应依赖 Repo，不要为每个后端复制一套 Agent 逻辑。

### 2.5 从 Entry 重建 Context

打开 Session 后调用 `session.buildContext()`，它**不是返回所有物理 Entry**，而是：从当前 Leaf 沿 `parentId` 找到活动路径 → 处理最新 Compaction → 把 Message Entry 转回 Agent Message → 从路径恢复最近的 Model、Thinking Level 和 Active Tools。

关键区分：

- `getEntries()`：物理保存的**全部** Entry（用于历史、审计、树视图）；
- `getBranch()`：当前 Leaf 到物理根或 Compaction Checkpoint 的**活动路径**；
- `buildContext()`：对活动路径应用 Compaction 和投影后，得到 Agent 继续运行所需的 Context。

### 2.6 为什么用 Entry 重建，而不是保存 Agent 实例

JavaScript 对象不能可靠跨版本、跨进程恢复：函数和闭包不能 JSON 化、Provider Client 不能安全持久化、AbortController 已失效、Event Listener 属于当前窗口、工具实现可能升级、模型目录可能变化。**Entry 保存的是稳定事实**——用户说了什么、模型回答了什么、工具返回了什么、何时切换设置、当前分支在哪。新进程用新代码和新依赖重建运行对象。

## 三、会话为什么是一棵树

桌面 Agent 恢复了昨天的会话。用户翻到一条旧问题「请用方案 A 重构登录流程」，Agent 已经沿着方案 A 走了很多步。现在用户希望改成「请用方案 B」——产品要求是：重新从这里开始、保留方案 A 的全部历史、随时切回任一方案、当前模型只看到正在使用的那条路径。

如果 Session 只是一条数组，通常只能截断后半段。Pi 用 `id + parentId + leaf` 让同一 Session 同时保存多条分支。

### 3.1 parentId 怎样形成树

```text
e1(parent=null)
  └─ e2(parent=e1)
       └─ e3(parent=e2)     ← 线性历史
```

把当前 Leaf 移回 `e1`，再追加 `e4`：

```text
e1
  ├─ e2
  │    └─ e3（旧分支）
  └─ e4（新分支）             ← 树形历史
```

树不是额外复制出来的数据结构，它已经编码在每条 Entry 的 `parentId` 中。

### 3.2 Leaf 是「当前所在位置」

`leafId` 表示当前 Context 从哪个 Entry 沿父链回溯。`e2 → e3` 仍在物理 Session 中，但不属于当前活动路径。用 `session.moveTo(targetId)` 移动 Leaf，下一条消息自然成为其新孩子——**`moveTo()`** **不删除方案 A**。

:::note
JSONL 在 `setLeafId()` 时追加一个控制 Entry（`type: "leaf"`）来持久化「活动 Leaf 改为哪个 Entry」。重新打开文件时按顺序扫描：普通 Entry 让 Leaf 前进到它，Leaf Entry 让 Leaf 跳到 `targetId`。所以「当前在哪里」也能从 append-only 日志恢复。
:::

### 3.3 修改旧 User Message：先回到它的父节点

如果用户选择旧的 `User：请用方案 A`，把 Leaf 放在这条消息本身再追加「请用方案 B」，模型会看到两条相邻的 User Message——这不是改写旧问题，而是追加补充。真正重新编辑时，应把 Leaf 移到旧 User Message 的**父节点**：

```text
... → parent
      ├─ User：方案 A
      └─ User：方案 B
```

`AgentHarness.navigateTree()` 已经区分这两种情况：选择 User Message 时新 Leaf 是该 Entry 的 `parentId`，并返回原文字供编辑；选择 Assistant/ToolResult/Compaction 时新 Leaf 是目标 Entry 本身，编辑器留空。

:::warning
`navigateTree()` 只能在 **idle** 时调用——Agent 正在流式生成或执行工具时移动 Leaf，会让「本轮从哪条 Context 开始」和「结果写到哪条分支」产生竞争。桌面 UI 应在运行中禁用树导航，或先请求 Abort 再等待 Harness settle。
:::

### 3.4 Branch 与 Fork 不是一回事

| <br /> | Branch            | Fork              |
| ------ | ----------------- | ----------------- |
| 存储     | 同一 Session 内新增孩子  | 创建新的 Session 文件   |
| 历史     | 旧分支和新分支共享 Entry 树 | 复制选定路径或完整 Entry 集 |
| 适合     | 一个任务内探索多个方案       | 把某条路径变成独立任务       |

Fork 的 `position` 也有讲究：`"at"` 包含目标 Entry，从 target 继续；`"before"`（默认）要求目标是 User Message，复制到它的父节点，适合「把旧问题放回编辑器修改后重新提交」。

### 3.5 Branch Summary：离开时带走关键信息

用户切回公共祖先后，方案 A 不在新活动路径，模型看不到它发现的坑和结论。`navigateTree(targetId, { summarize: true })` 可以先总结离开的分支，生成的 Summary Entry 位于新分支起点之后，会转成 `BranchSummaryMessage` 进入 Context。

:::caution
Branch Summary 是**有损摘要**，原始 Entry 仍靠 Session 树保留。而且摘要失败时**不能静默切换**——Harness 的默认路径中，用户请求 Summary 后如果模型失败，`navigateTree()` 会抛出 Branch Summary Error 并恢复 idle，UI 应明确显示「导航未完成」，不要只移动界面选中项。
:::

### 3.6 「时间旅行」只是一个比喻

树导航看起来像回到过去，但源码没有修改过去：移动 Leaf → 从目标沿父链重建 Context → 后续 Entry 作为新孩子追加。旧 Entry 不被重写、不被删除、ID 不改变。更准确的说法是：**选择一个历史节点作为新的继续点**。

## 四、对话太长了怎么办：Compaction

桌面 Agent 连续工作几个小时，读取了很多文件，调用了几十次工具，每次请求都重新携带越来越长的历史，最终会撞上模型的 Context Window。Pi 的 Compaction 不是删除 Session，而是把较老的活动路径变成摘要，同时保留近期消息。

### 4.1 三份数据先分清

| 数据               | 作用        | 压缩后              |
| ---------------- | --------- | ---------------- |
| Session 物理 Entry | 历史、树、审计   | **原始 Entry 仍保留** |
| Compaction Entry | 记录摘要和保留边界 | 新增               |
| Model Context    | 下一次模型请求   | 使用摘要 + 近期消息      |

Compaction 是 **Context 视图的有损替换，不是删掉旧 JSONL 行**。

### 4.2 触发条件与参数

```typescript
interface CompactionSettings {
	enabled: boolean;
	reserveTokens: number;    // 触发压缩时为请求和输出预留的空间
	keepRecentTokens: number; // 压缩后希望保留的近期历史量
}

// 默认值
const DEFAULT_COMPACTION_SETTINGS = {
	enabled: true,
	reserveTokens: 16_384,
	keepRecentTokens: 20_000,
};
```

触发条件：`contextTokens > contextWindow - reserveTokens`（注意是严格大于）。Token 数怎么算？优先使用最近一次有效 Assistant Message 的 Provider Usage，再估算其后的新增消息（文字约 4 字符一 Token、图片按 4800 字符估算）。

:::note
源码会跳过 `stopReason: "aborted"` / `"error"` / Token 总数为 0 的 Usage，完整 coding-agent 自动压缩还会防止使用**最新 Compaction 之前**的旧 Usage——否则刚压缩完就可能被旧的大数再次触发。
:::

### 4.3 Cut Point：切点有讲究

`findCutPoint()` 从后往前累加 Message Token，直到达到 `keepRecentTokens`，再选择**合法切点**。合法切点包括 User Message、Assistant Message、Bash Execution Message、Custom Message、Branch Summary——**Tool Result 不是合法切点**，因为不能让结果脱离对应 Tool Call 单独出现在保留历史开头。

如果单个 Turn 自己就超过 `keepRecentTokens`，切点会落在 Turn 中间（`isSplitTurn: true`），此时生成两份摘要：更早完整历史的 History Summary + 当前大 Turn 前缀的 Turn Prefix Summary，合并后交给模型，近期后缀仍保留原始 Message。

### 4.4 Summary 生成与迭代

`compact()` 调用模型生成结构化 Summary：Goal、Constraints & Preferences、Progress、Key Decisions、Next Steps、Critical Context。正常的迭代压缩路径会把第一次已经总结的长期信息带入下一次摘要——**Previous Summary + 新增旧消息 → Updated Summary**。

:::caution
Split Turn 时有个源码边界：如果 `turnPrefixMessages` 非空而 `messagesToSummarize` 为空，两套实现都会把 History Summary 直接设为 `"No prior history."`，**旧的 Previous Summary 不会进入最后的合并输入**。宿主若把摘要视为关键长期记忆，应为这个边界编写回归测试或通过 Hook 自行保留，不能只依赖提示词。
:::

### 4.5 压缩后模型看到什么

```text
模型 Context：
[Compaction Summary]
[Retained Tail]          ← 有 retainedTail 时作为 Checkpoint
[Compaction 之后的新消息]
```

物理 Session 的旧 Entry 仍存在。用户仍可在 Session 树中查看原始 Entry——**压缩不是删除聊天记录**。

### 4.6 自动压缩的三种 Overflow 信号

| 信号            | 判定                                                            | 压缩后重试   |
| ------------- | ------------------------------------------------------------- | ------- |
| Provider 明确报错 | `stopReason === "error"` 且错误文字匹配已知模式                          | 是       |
| 成功响应但输入超窗     | `stopReason === "stop"` 且 `input + cacheRead > contextWindow` | 否，回答已完成 |
| 服务端截断且无输出     | `stopReason === "length"`、`output === 0`、输入达窗口 99%            | 是       |

:::warning
当前「一次压缩并重试」的保护对连续 `error` Overflow 有明确保障，但每当收到非 `error` Assistant Message 时 `_overflowRecoveryAttempted` 会被重置——**不能把同样的保证无条件套到连续** **`length`** **截断上**。桌面宿主仍应设置自己的总重试上限。
:::

### 4.7 通用 Harness 与 coding-agent 的差异

- 通用 `AgentHarness` 提供显式 `compact()`，**不会**仅因为导出了 `shouldCompact()` 就自动调用——桌面宿主要自己调度；
- coding-agent 的 `AgentSession` 支持 Threshold 和 Overflow 两种自动流程，`_checkCompaction()` 在 Agent 结束后和提交新 Prompt 前检查。

## 五、运行中改变 Agent 的方向：Steering 与 Follow-up

桌面 Agent 正在扫描整个项目，用户突然补充：「不用分析全部文件，只看最近修改的。」另一个用户可能输入：「当前任务完成后，再帮我生成一份总结。」两句话都发生在 Agent 运行中，但语义不同——前者应尽快影响下一步工作，后者应等当前任务自然结束。

### 5.1 为什么运行中不能再次 prompt

基础 `Agent.prompt()` 检查：如果已有 active run 就直接抛错。因为一个 Agent Run 正在维护当前 Context、模型流、Tool Call 批次、AbortSignal、Event 顺序、本轮新消息——再次启动独立 `prompt()` 会产生两个并发 Run，状态和 Session 写入无法保持清晰顺序。**运行中输入必须进入队列。**

### 5.2 Steering 与 Follow-up 的区别

| <br /> | Steering                             | Follow-up                                |
| ------ | ------------------------------------ | ---------------------------------------- |
| 生效时机   | 当前 Assistant Turn 完成、工具执行完后，下一次模型调用前 | 当前 Agent 没有 Tool Call、没有 Steering，本来要结束时 |
| 语义     | 尽快影响下一步工作                            | 当前任务结束后追加任务                              |
| 接口     | `agent.steer(message)`               | `agent.followUp(message)`                |

:::warning
**Steering 不是打断当前 Tool。** 如果 `read_many_files` 正在读取 100 个文件，用户发送「只看最近修改」，Steering Message 会入队，但不会撤销已经开始的工具。若必须尽快停止当前工具，应请求 Abort 并等待当前 Run settle，再提交新 Prompt。
:::

### 5.3 Turn 边界的真实顺序

一轮 Assistant 和工具结束后，Loop 依次：发出 `turn_end` → 调用 `prepareNextTurn` → 调用 `shouldStopAfterTurn` → 抽取 Steering Queue → 仍有 Tool Call 或 Steering 则进入下一 Turn → 当前工作本来要结束时再抽取 Follow-up Queue → 都为空才 `agent_end`。

### 5.4 QueueMode：一次取几条

```text
one-at-a-time：每次 Drain 只取最早一条   [A, B, C] → 本次取 [A] → 剩余 [B, C]
all：一次取出当前全部                  [A, B, C] → 本次取 [A, B, C]
```

选择建议：用户连续修正同一指令用 `all`（减少额外 Turn）；每条 Follow-up 都应得到独立回答用 `one-at-a-time`；消息之间可能互相冲突时保留顺序逐条处理更清晰。

### 5.5 Agent.continue() 是什么

`await agent.continue()` 表示从已有 Transcript 继续，不追加新的显式 Prompt。如果最后一条是 Assistant，源码会先尝试处理队列：先 Drain Steering，没有则 Drain Follow-up，有消息则以这些消息启动新 Prompt Run，两个队列都空才抛错。**不要把 Continue 当成「重试刚才按钮」。**

### 5.6 三层取消语义不要混用

| 层                           | Abort 是否清队列                      |
| --------------------------- | -------------------------------- |
| 基础 `Agent`                  | 否                                |
| 通用 `AgentHarness`           | 清 Steering/Follow-up，保留 nextTurn |
| coding-agent `AgentSession` | 否；`clearQueue()` 是独立操作           |

:::important
如果产品中的「取消」意味着同时取消 Steering/Follow-up 待办，应先处理 `session.clearQueue()`，再 `session.abort()`；不要假设 Abort 自动清空。入队消息在交付并发出 Message Lifecycle 之前**只在内存队列中**，应用崩溃可能丢失尚未交付的队列消息——若产品要求队列跨重启恢复，需要单独持久化。
:::

## 六、System Prompt 不是一段固定文字

同一个 Agent 进入不同项目时，怎样自动遵守各自的规则？支付项目里模型可能必须先跑安全检查，文档项目里只能修改 Markdown，某位用户又希望回答简洁。如果把这些规则写死成一个字符串，配置、工具和项目一变化，Prompt 就会过时。

Pi 的做法是：**先加载资源，再根据当前工具和目录动态构建 Base System Prompt；每次 Agent Run 开始前，Extension 还有一次临时改写机会。**

### 6.1 最终流水线

```text
默认提示词或 SYSTEM.md
    ↓
Append System Prompt（APPEND_SYSTEM.md）
    ↓
AGENTS.md / CLAUDE.md（项目上下文）
    ↓
当前启用工具的说明与规则（默认主体）
    ↓
已发现 Skill 的目录
    ↓
当前工作目录
    ↓
Base System Prompt
    ↓ before_agent_start Extensions
本次 Run 的 System Prompt
```

至少有三个时间点：`ResourceLoader.reload()` 发现并读取资源；`_rebuildSystemPrompt()` 收集当前状态并调用 Builder；`before_agent_start` 在某一次 Run 前顺序处理 Extension 的修改。

### 6.2 Context File 的发现规则

每个目录最多选择一个上下文文件，候选顺序：`AGENTS.md` → `AGENTS.MD` → `CLAUDE.md` → `CLAUDE.MD`。找到第一个存在且可读的文件就停止——**同一目录不会同时加入** **`AGENTS.md`** **和** **`CLAUDE.md`**。

加载顺序：先用户级 Agent 目录，然后从当前工作目录向文件系统根逐级查找项目文件，结果按「祖先到当前目录」排列：

```text
用户级：<agentDir>/AGENTS.md
项目级：/AGENTS.md
项目级：/workspace/AGENTS.md
项目级：/workspace/app/AGENTS.md
项目级：/workspace/app/src/AGENTS.md
```

:::warning
一个容易被忽略的安全边界：`loadProjectContextFiles()` 本身**不检查项目 Trust**——`cwd` 和祖先目录里的 `AGENTS.md` / `CLAUDE.md` 会被加载。Trust 检查约束的是 `.pi/SYSTEM.md`、`.pi/APPEND_SYSTEM.md` 等自动发现路径，不能把它泛化到所有 Context File。
:::

### 6.3 SYSTEM.md、APPEND\_SYSTEM.md 与 AGENTS.md

| 文件                 | 行为                             | 选择建议                |
| ------------------ | ------------------------------ | ------------------- |
| `SYSTEM.md`        | **替换**默认主体                     | 想完全控制角色和默认规则        |
| `APPEND_SYSTEM.md` | **追加**在主体之后、Project Context 之前 | 只想增加少量约束而保留 Pi 默认说明 |
| `AGENTS.md`        | 作为项目上下文（带路径包装）进入 Prompt        | 声明项目开发规范            |

注意：`SYSTEM.md` 替换内置主体后，以下内容仍会继续追加：Append System Prompt、Context Files、Skills 目录、Current Working Directory。所以「自定义 System Prompt」也不等于「最终 Prompt 就只有这个文件」。

### 6.4 工具、Prompt 与 Skill 的三层职责

| 机制            | 解决的问题                 | 是否直接执行                  |
| ------------- | --------------------- | ----------------------- |
| System Prompt | 长期角色、环境、规则和资源导航       | 否                       |
| Tool          | 提供结构化的外部动作            | 是                       |
| Skill         | 告诉 Agent 某类任务应按什么流程完成 | Skill 本身不执行，通常指导使用 Tool |

还要区分三个概念：

- **Tool Definition**：机器可调用的 name、description、parameters；
- **Prompt Snippet**：System Prompt 中给模型看的简短目录；
- **Prompt Guideline**：与该工具配套的行为规则。

:::important
Prompt 可以说「使用 read 查看文件」，但**没有注册 read Tool，模型无法产生可执行的真实调用**。反过来，已注册 Tool 即使没有 Snippet，仍有结构化描述可供 Provider 使用。工具的真实能力不由 System Prompt 创造。
:::

### 6.5 Skill 为什么只放目录

Builder 调用 `formatSkillsForPrompt(skills)` 时，放入的是模型可见 Skill 的**名称、描述和文件位置**，而不是把每份 `SKILL.md` 全文都塞进 System Prompt。好处：Prompt 不会随 Skill 数量快速膨胀；模型先依据描述选择相关 Skill；需要时再用 `read` 打开完整指令。

如果当前工具集合没有 `read`，Builder **不附加 Skills Section**——因为模型知道路径却无法读取内容没有意义。

### 6.6 Extension 如何参与

- **`resources_discover`**：返回额外的 Skill Paths / Prompt Template Paths / Theme Paths——扩展的是**资源来源**，不直接返回一段 System Prompt；
- **`before_agent_start`**：每次普通 Prompt 运行前，多个 Extension 按加载顺序**串行改写**本次 Prompt（不是并行投票），后一个 Handler 看到前一个已修改的 `currentSystemPrompt`。

:::note
Override 只属于一次 Run：本次 Agent Run 结束时 `finally` 只清除 `_systemPromptOverride` 标记，并没有立即把 `agent.state.systemPrompt` 写回 Base。所以 idle 期间读取 `session.systemPrompt` 仍可能看到上一轮的临时文本；下一次普通 Prompt 若 Extension 不再修改，preflight 分支才恢复 Base。**Override 不会自动带入下一次正常 Run，但「Run 一结束 getter 就立刻恢复」并不成立。**
:::

## 七、为什么 Agent 需要 Skill

桌面 Agent 已经拥有 `read`、`bash`、`edit` 等工具。现在希望它学会「代码审查」：每次审查都先理解变更目标，再检查正确性、安全、测试和兼容性，最后按严重度给出带源码位置的结论。

工具能让 Agent 读取和修改代码，却不会自动教会它怎样做一次高质量审查。把完整流程塞进 System Prompt 又会让所有请求长期携带一大段无关规则。**Skill 用来填补这个空白：把某类任务的方法、流程和专业知识包装成可按需加载的能力包。**

### 7.1 Skill、Tool、System Prompt、Extension 四者区分

| 概念            | 核心形态                   | 谁决定使用          | 能否改变运行流程     |
| ------------- | ---------------------- | -------------- | ------------ |
| System Prompt | 动态构建的长期规则              | —              | 影响模型行为       |
| Skill         | Markdown 工作流（SKILL.md） | 模型或显式调用方       | 只能通过指令间接影响   |
| Tool          | Schema + execute       | 模型产生 Tool Call | 执行一个具体能力     |
| Extension     | TS/JS Factory + 注册结果   | 宿主在加载时启用       | 可监听、修改、阻止和注册 |

放在同一个例子「安全代码审查」里：

| 机制            | 职责                       |
| ------------- | ------------------------ |
| System Prompt | 遵守项目规则，不泄露密钥，高风险操作先确认    |
| Tool          | 读文件、搜索引用、执行测试            |
| Skill         | 安全审查步骤、威胁清单、报告格式         |
| Extension     | 在工具调用前做审批，注册内部扫描器，记录审计事件 |

### 7.2 渐进式披露：两阶段上下文

Pi 启动时不会把所有 `SKILL.md` 正文都放进 System Prompt。Resource Loader 先加载元数据；只有 `read` 是 Active Tool 且 Skill 没有设置 `disable-model-invocation` 时，这份元数据才会进入模型可见的 System Prompt 目录：

```text
<available_skills>
  <skill>
    <name>code-review</name>
    <description>审查代码变更……</description>
    <location>/.../code-review/SKILL.md</location>
  </skill>
</available_skills>
```

任务匹配后，Agent 才用 `read` 读取完整文件。假设有 20 个 Skill、每个正文 1500 Token：全部常驻约 30,000 Token；只放元数据远小于完整正文；实际任务再加载匹配的正文。

### 7.3 Description 是模型的路由信息

自动匹配主要依据 Description。较差：`Helps with reviews.`；较好：

```
Reviews code changes for correctness, security, regressions,
and missing tests. Use when asked to review a diff, pull
request, patch, or implementation.
```

后者同时说明「做什么」和「什么时候用」。但**自动选择不是确定性路由**——模型看到元数据后是否真的调用 `read`，仍是模型行为。所以宿主需要区分：自动建议（模型依据 Description 判断）、显式调用（`/skill:name`）、产品强制（宿主直接把 Skill 内容加入输入或用 Extension 约束）。

### 7.4 disable-model-invocation 只是隐藏，不是权限

`disable-model-invocation: true` 会让 `formatSkillsForPrompt()` 过滤该 Skill，模型不会在可用目录中看到它；但用户仍可通过 `/skill:name` 显式调用。它只是隐藏自动发现，**不是安全沙箱**——Skill 仍可能指导模型执行高风险 Tool。

## 八、创建第一个 Skill：错误日志分析

这一章不再只讲概念，我们给桌面 Agent 添加一项能实际使用的能力：读取应用错误日志，聚合重复信号，重建时间线，给出有证据的下一步排查建议。

### 8.1 先定义能力边界

「帮我分析日志」过于宽泛。第一版 Skill 明确只做：接受一个或多个本地日志路径；识别严重级别和常见错误签名；围绕时间、请求 ID、服务名建立关联；区分观察、假设和下一步验证；输出结构化报告。**明确不做**：删除或轮转日志、自动修复生产系统、从出现次数直接断言根因、在没有日志时编造内容。

### 8.2 最小目录结构

```text
error-log-analysis/
├── SKILL.md                ← 核心入口（唯一必需）
├── scripts/
│   └── summarize-log.mjs   ← 辅助脚本（由 Tool 调用）
├── references/
│   └── report-format.md    ← 长参考资料（按需读取）
└── assets/
    └── sample.log          ← 输入材料
```

Pi 只规定入口文件和发现方式，并不强制这些子目录命名——它们是便于作者和 Agent 理解的约定。

### 8.3 SKILL.md 的两部分

```markdown
---
name: error-log-analysis
description: Analyzes application error logs, groups repeated
  signatures, reconstructs timelines, and proposes evidence-backed
  next checks. Use when the user provides a log file or asks to
  diagnose runtime errors from logs.
---

# Error Log Analysis

Use this workflow...
```

`---` 之间是 YAML Frontmatter，下面是正文。`parseFrontmatter()` 解析元数据，没有有效 Frontmatter 时 Body 仍可能存在，但**缺少 Description 的 Skill 最终不会被加载**。

`name` 的校验规则：最长 64 字符、只使用小写字母数字和连字符、不能以连字符开头或结尾、不能出现连续两个连字符。省略时用 `SKILL.md` 父目录名作为回退。

### 8.4 校验失败不是同一种结果

| 问题                     | 结果              |
| ---------------------- | --------------- |
| 名称非法/过长、Description 过长 | Warning，但仍加载    |
| 未知 Frontmatter 字段      | 运行时忽略           |
| Description 缺失或全空白     | Warning，并**跳过** |
| YAML 解析抛错              | Warning，并**跳过** |

所以「有诊断」不等于「没有加载」——桌面管理页应分别显示 Load Status 和 Diagnostics。

### 8.5 流程写成可观察步骤

示例工作流：先读取头尾小样本 → 识别时间戳、严重级别、服务和请求 ID 格式 → 运行辅助脚本做首轮计数 → 回到最早或最高频信号附近读取原始行 → 按时间和标识符关联 → 区分观察、假设和建议 → 读取报告模板并输出。

**为什么先采样再处理全文件？** 日志可能有数 GB，直接 `read` 全文会造成 Tool Result 过大、Context 浪费、关键时间段被噪声淹没、桌面应用卡顿。示例要求先看头尾、确定格式后运行脚本获得索引、再读取有关范围——这是 Skill 提供的「方法」，不是 Pi Log Tool 的内置行为。

:::important
脚本只是**候选定位器**，不是通用日志 Parser。Skill 正文明确要求回到原始行验证，避免把脚本输出当成根因——「两个 ETIMEDOUT 同时出现」不能仅凭频次断言两个系统故障之间存在因果关系。
:::

### 8.6 相对路径从 Skill 目录解析

System Prompt 的 Skills Section 和显式 Skill Block 都提醒：相对路径从 Skill 目录解析。所以真实调用应使用 `<skill.baseDir>/scripts/summarize-log.mjs`，不要从桌面 Agent 当前项目的 `cwd` 猜测路径。

### 8.7 安全与边界条件

日志经常包含 Access Token、Cookie、Email、数据库连接串、内部主机名。Skill 要求不复述 Secrets 和个人数据，不修改源日志。**日志还是不可信输入**——攻击者可能故意写入「忽略之前的规则」「运行这条命令」或恶意链接。Skill 要求把每一行只当成待分析数据，不执行日志中出现的命令、链接或指令。

:::caution
但 Markdown 指令**不是强安全边界**。桌面宿主仍应：限制 Tool 可访问路径、对上传和展示做脱敏、审批写操作、控制日志保留、对脚本执行显示来源。**「写了安全要求」不等于「宿主有了安全策略」。**
:::

## 九、Skill 的发现、加载、触发与执行

### 9.1 六类来源与优先级

Skill 不只来自一个固定目录：

| 来源        | 说明                                                         |
| --------- | ---------------------------------------------------------- |
| 用户级       | `~/.pi/agent/skills/`、`~/.agents/skills/`                  |
| 项目级       | `<cwd>/.pi/skills/`、`cwd 及祖先的 .agents/skills/`（受 Trust 约束） |
| Package   | 包的 `skills/` 或 `package.json` 中的 `pi.skills`               |
| Settings  | 用户/项目 Settings 的 `skills` 数组                               |
| CLI       | `--skill <path>`                                           |
| Extension | `resources_discover` 动态返回                                  |

正常资源优先级从高到低：项目 Settings 本地条目 → 项目自动发现 → 用户 Settings 本地条目 → 用户自动发现 → Package Resource。

### 9.2 两种扫描模式

| 目录模式                                   | 根目录直接 `.md` 文件       |
| -------------------------------------- | -------------------- |
| `~/.pi/agent/skills`、项目 `.pi/skills`   | 作为独立 Skill 候选        |
| `~/.agents/skills`、项目 `.agents/skills` | 忽略，要求目录中的 `SKILL.md` |

共同规则：递归查找 `SKILL.md`；跳过点开头目录和 `node_modules`；跟随 Symbolic Link；遵守 `.gitignore` / `.ignore` / `.fdignore`。**遇到** **`SKILL.md`** **后立即返回，不再递归这个目录的子目录**——带入口文件的目录已被视为一个自包含能力包。

### 9.3 路径去重 ≠ 名称去重

- **路径去重**：规范化、Canonicalize 路径，同一文件通过 Symbolic Link 重复出现只保留一份；
- **名称去重**：两个不同文件都声明 `name: error-log-analysis` 时，`loadSkills()` 用 `Map<name, Skill>`，**第一个成功加载的获胜**，后一个产生 Collision Diagnostic。

所以只显示「加载了 12 个 Skill」会隐藏第 13 个为什么消失——桌面管理页应展示来源和冲突双方（Winner/Loser Path）。

### 9.4 Skill 没有独立执行器

两层 `Skill` 都没有 `execute` 字段。所谓「执行 Skill」，实际是模型读懂工作流后，在普通 Agent Loop 中**选择 Tool 并继续多轮推理**：

```text
Skill 指令
  → Agent Loop
  → read 正文/参考资料
  → 调用已有 Tool
  → Tool Result
  → 最终回答
```

### 9.5 自动匹配的五个前提

1. Resource Loader 已加载 Skill；
2. Skill 没有 `disable-model-invocation: true`；
3. `read` 是 Active Tool；
4. Base System Prompt 已在资源变化后重建；
5. `before_agent_start` 后的最终有效 System Prompt 仍保留这份目录。

:::note
Pi Core **没有**额外的关键词打分器、Embedding Retriever 或确定性 Skill Router——决定来自模型本身。「目录已加载」不等于「工作流一定执行」。更准确的状态链是：`Skill available → Skill selected → SKILL.md loaded → workflow followed`，每一步都需要单独观察。
:::

### 9.6 显式调用的两套接法

| 行为                     | 通用 `AgentHarness.skill()`        | coding-agent `/skill:name`      |
| ---------------------- | -------------------------------- | ------------------------------- |
| 正文来源                   | 加载阶段保存在 `Skill.content`          | 调用时 `readFileSync(filePath)`    |
| 调用形式                   | Method + Additional Instructions | User Text Command               |
| 未知名称                   | 抛 `invalid_argument`             | 原文本继续                           |
| 文件调用前被删除               | 仍用内存快照                           | 发 `skill_expansion` Error，原文本继续 |
| disableModelInvocation | 仍可显式调用                           | 仍可显式调用                          |

显式 Skill Block 的真实形状：

```text
<skill name="error-log-analysis" location="/absolute/path/SKILL.md">
References are relative to /absolute/path.

...去掉 Frontmatter 后的正文...
</skill>

分析 server.log
```

### 9.7 大文件需要分页读取

coding-agent 内置 Read Tool 默认最多返回 **2000 行或 50KB**（先触发者为准）。小 Skill 通常一次得到完整正文；更大的文件会附带下一次 `offset`，模型必须继续分页读取——**不能把一次 Read Tool Call 等同于无条件获得完整 Skill**。

## 十、设计高质量 Skill

能被 Pi 加载，只说明文件结构合法；高质量还要求它：容易在正确场景触发、不容易误触发、步骤可观察可验证、缺少条件时知道停下、有清楚的安全边界、能与 Tool 和其他 Skill 配合。

### 10.1 Description 同时提高触发率、降低误触发

```markdown
description: Analyzes existing application error logs, groups
  repeated signatures, reconstructs timelines, and proposes
  evidence-backed next checks. Use when the user provides log
  files or asks to diagnose runtime failures from logs. Do not
  use for configuring log collection or deleting logs.
```

| 用户请求                   | 是否匹配 |
| ---------------------- | ---- |
| 「分析这份 server.log 的超时」  | 是    |
| 「聚合相同 Error Signature」 | 是    |
| 「帮我设计日志采集架构」           | 否    |
| 「清理七天前的日志」             | 否    |

### 10.2 可验证步骤

较差：`Thoroughly inspect the logs.` 较好：

```markdown
1. Read no more than a small head/tail sample.
2. State the detected timestamp and severity formats.
3. Produce a first-pass signature count.
4. Read raw ranges around the earliest and most frequent signals.
5. Cite file path plus timestamp or line for each conclusion.
```

可验证步骤通常具有：明确输入、可观察 Tool Call、可检查输出、完成条件、失败分支。

### 10.3 多阶段工作流

```text
Phase 1: Preflight   → 确认路径、时间范围、权限；声明不修改源日志
Phase 2: Collect     → 小范围采样、确定格式、有界首轮统计
Phase 3: Analyze     → 建时间线、按标识符关联、形成多个候选假设
Phase 4: Verify      → 回到原始行、寻找冲突证据、给假设标置信度
Phase 5: Report      → 使用模板、区分事实/推断/未知、给出最小下一步
```

阶段结束条件比一长串模糊建议更稳定。

### 10.4 确认要绑定具体动作，且不是强制审批

Skill 可以写「准备在 production-eu 的日志索引执行 15 分钟范围的只读查询，预计扫描 1.8 GB，不写入数据。是否执行这个精确查询？」——如果目标、参数或副作用变化，应重新确认。

:::warning
**这是给模型的工作流约束，不是不可绕过的强制 Approval Gate。** 真正必须执行的审批应放在：Tool 实现、Extension `tool_call` Hook、桌面宿主 Policy、服务端权限。Skill 负责「何时应询问和怎样解释」，执行层负责「未经批准不能做」。
:::

### 10.5 组合 Skill 是模型编排，不是函数调用

Pi **没有** `invokeSkill(name)` Runtime API；Skill 正文中的 `/skill:other` 不会被递归命令展开。模型需要从 System Prompt 的目录找到另一 Skill Location，再用 `read` 加载。组合编排要有回退：依赖缺失时说明、停止或降级，而不是假装执行。

### 10.6 版本管理：Frontmatter version 不生效

当前 Pi 的运行时 `Skill` Metadata **没有标准** **`version`** **字段**。即使在 Frontmatter 写 `version: 2.1.0`，Loader 也只把它当未知字段。版本应由不同载体承担：本地 Skill 用 Git Commit/Tag；Pi npm Package 用精确 Source（`npm:@scope/pkg@1.2.3`）；Pi Git Package 用明确 Ref/Tag/Commit；配合 Changelog 和 Test Fixture。

## 十一、Skill 的测试、分发与治理

Skill 准备交给团队使用，真正的问题不再是「我的电脑上能不能跑」，而是：修改 Description 后会不会不再触发？模型是否按顺序执行？脚本报错或用户中断时会不会继续做危险操作？团队成员拿到的是不是同一个版本？

### 11.1 测试四层，不要一个端到端用例包办

| 层级       | 要验证什么                          | 是否需要真实模型           |
| -------- | ------------------------------ | ------------------ |
| 加载       | Frontmatter、路径、冲突、可见性          | 否                  |
| 显式展开     | `/skill:name` 生成的 User Message | 否                  |
| Agent 流程 | Tool Call、Tool Result、错误、中断    | 否，Faux Provider 即可 |
| 自动匹配质量   | 真实模型是否读了正确 Skill               | 是，属于模型评测           |

### 11.2 Faux Provider：无网络确定性测试

Faux Provider 是「按脚本返回预定响应的模型替身」——它不会联网，不消耗 Token，但真正的 Agent Loop、Message、Tool 执行和 Event 仍然运行：

```typescript
harness.setResponses([
	fauxAssistantMessage(
		fauxToolCall("read", { path: skillPath }),
		{ stopReason: "toolUse" },
	),
	fauxAssistantMessage(
		fauxToolCall("analyze_log", { path: logPath }),
		{ stopReason: "toolUse" },
	),
	fauxAssistantMessage("发现 timeout 签名重复出现 12 次。"),
]);

await harness.session.prompt("分析这份日志");
```

:::important
Faux 能验证目录、Tool 和错误布线，**不能证明语义触发准确率**——「当模型选择这个 Skill 时 Pi 能正确执行后续流程」和「真实模型看到这句话一定会选择这个 Skill」是两回事。后者要进入 Golden Eval 或少量 Real-provider Test。
:::

### 11.3 测试 Tool 调用顺序

订阅 `tool_execution_start`，断言调用的工具序列：

```typescript
const started: string[] = [];

harness.session.subscribe((event) => {
	if (event.type === "tool_execution_start") {
		started.push(event.toolName);
	}
});

await harness.session.prompt("分析日志");

expect(started).toEqual(["read", "read", "bash", "read"]);
```

不只检查 Tool Name，还要检查 Argument 是否是预期绝对路径、Script 是否使用固定入口、Tool Result 是否被下一次模型请求看到。

### 11.4 测试脚本失败与用户中断

- 脚本失败：让 Bash 以非零状态退出，断言 `tool_execution_end` 标记错误、Error Tool Result 进入后续 Context、后续没有执行会修改文件的 Tool、最终回答明确告诉用户失败；
- 用户中断：构造等待 `AbortSignal` 的慢 Tool，收到 `tool_execution_start` 后调用中断能力，断言慢 Tool 收到 Abort、Agent Run 结束、后续危险 Tool 没有启动。

:::caution
如果自定义 Tool 只是成功返回一个带 `error` 字段的普通对象，Core 仍把它当成功 Result——那是在测试「错误数据」，不是 `isError=true` 的 Tool Error。要形成 Tool Error，需要执行抛错、参数校验/Tool 查找失败，或由相应 Hook 明确改写错误状态。
:::

### 11.5 分发：三种 Package 来源

```
npm:@team/pi-log-skills@1.2.3     ← 精确版本，被 Pin
git:github.com/team/pi-log-skills@v1.2.0  ← 固定 Ref
./local/pi-log-skills            ← 本地路径，不复制文件
```

想让团队复现，优先使用精确 npm 版本或 Git Commit/Tag。项目级 Skill 适合与仓库代码、日志格式和团队流程绑定，随代码审查、在 CI 中测试；用户级 Skill 适合个人工作习惯、跨项目通用能力。

### 11.6 不可信 Skill 的真实风险

Skill 是 Markdown，但不代表它只是文档。它可以指示模型：读取私密文件、把内容发送到外部服务、执行随包携带的脚本、修改删除项目文件、忽略宿主安全规则。审查时沿引用链继续检查：`SKILL.md → scripts/* → references/* → assets/* → package.json dependencies → 外部 URL`。

:::warning
**「SKILL.md 看起来安全」不能推出它引用的脚本和依赖安全。** 桌面 Agent 的 Runtime 还应提供：最小 Tool 集、文件系统 Allowlist、网络 Domain Allowlist、敏感 Tool 逐次审批、Timeout 与 Abort、Output Size 限制、Tool Call 审计日志、Secret Redaction、临时工作目录。Skill 自己写「请先询问用户」只是软约束。
:::

## 十二、记忆 + 方法：这一篇的路线图

回顾这一篇，我们从「对话怎么存」走到了「能力怎么给」：

```text
第 10 章：四种消息类型 + 两道转换             → 多轮对话到底存了什么
第 11 章：Session / Entry / JSONL / Repo     → 保存与恢复
第 12 章：parentId + Leaf + Branch / Fork    → 会话为什么是一棵树
第 13 章：Compaction 切点 / 摘要 / Overflow   → 对话太长怎么办
第 14 章：Steering / Follow-up / 队列         → 运行中改变方向
第 15 章：动态 System Prompt 构建链           → 上下文工程
第 16-17 章：Skill 定位 / 创建第一个 Skill    → 专业能力载体
第 18-19 章：发现、加载、触发、执行            → 能力如何生效
第 20-21 章：设计高质量 Skill / 测试分发治理   → 能力如何可靠
```

几个值得带走的认知：

1. **记忆是「在正确时机重建上下文」**——持久化可重放的事实，不持久化内存快照；
2. **会话是树不是数组**——Branch 移动 Leaf，Fork 建新 Session，旧历史永远保留；
3. **Compaction 是有损的 Context 管理**——摘要给模型继续工作，物理 Session 才是完整记录；
4. **System Prompt 是构建链的产物**——来源、顺序和改写时机决定模型看到什么；
5. **Skill 解决「怎样做」，不直接赋予系统权限**——强制审批必须落在 Tool/Extension/宿主。

这一篇的 Agent 已经「记得住、更专业」了。但它还缺三样东西：**怎么在不改 Agent Loop 的前提下扩展行为（Extension）、怎么把它真正嵌进桌面进程（SDK/RPC）、怎么通过生产化测试放心上线**——这些是系列收官篇的内容。

:::caution
本文所有技术结论均以 **Pi v0.82.0** 源码基线（commit 518855d）和 pi-study.com 课程资料为依据。Skill Frontmatter 的 `version`、`allowed-tools` 等字段当前不被 Loader 当作运行时配置，别被「YAML 能解析」误导成「Pi Runtime 一定实现了该行为」。通用 Harness 与 coding-agent 的 Session/Skill API 不完全等价，混用前先确认自己用的是哪一层。
:::

***

**延伸阅读：**

- [Pi 桌面 Agent 源码课](https://pi-study.com/) — 36 章源码课与 9 份附录的权威来源
- [理解Pi（一）](../编程生涯理解pi一/) — 从第一句回答到 Agent Loop 与安全循环
- [理解Pi（三）](../编程生涯理解pi三/) — Extension、嵌入桌面与生产化
- [编程生涯：Loop Engineering](../编程生涯loop-engineering/) — 循环设计：状态记忆与反馈闭环的元思维
- [编程生涯：Claude Code](../编程生涯claude-code/) — 分层记忆与五级压缩的上下文工程实践
- [编程生涯：Hermes Agent](../编程生涯hermes-agent/) — Skills 自进化、Curator 技能维护与上下文压缩

