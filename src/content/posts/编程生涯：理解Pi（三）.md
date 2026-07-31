---
title: 编程生涯：理解Pi（三）
published: 2026-08-01
description: 理解 Pi 桌面 Agent 源码课收官：从 Extension 事件驱动扩展讲起，走完五层集成选型、SDK 嵌入与 RPC 进程隔离、桌面应用状态设计，再沿完整源码调用链组装桌面 Agent，并以生产化安全边界、Faux Provider 测试金字塔与发布门禁收尾，附九份附录速查，从零到一造出可上线的桌面 Agent。
tags: [理解Pi, 桌面Agent, Extension, RPC, 生产化]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
系列前两篇，Agent 已经会说话、会干活、有记忆、有专业能力了。但一个「Demo 级」Agent 和一个「能上线」的桌面产品之间，还隔着三座大山：**扩展**（不加改核心代码就能加功能）、**嵌入**（把它真正搬进桌面进程）、**生产化**（让它在真实环境里可靠、安全、可回滚）。这一篇是收官之作，把这三座山一次翻过去。
:::

## 一、为什么 Pi 需要 Extension

桌面 Agent 已经能对话、调用 Tool，也能用 Skill 分析日志。现在出现一个新要求：**所有危险 Tool 执行前都要经过审批，但我不想修改 Pi 的 Agent Loop。**

如果把判断散落到每个 Tool，会重复；如果直接改 Agent Loop，后续升级又难以合并。Extension 就是 Pi 留出的**运行行为扩展层**。

### 1.1 先看没有 Extension 时会怎样

审批逻辑可以写进 Tool 的 `execute()`——但每个 Tool 都要重复，而且内置 Tool 或第三方 Tool 不一定由你实现。Extension 可以监听 `tool_call` 事件：

```text
模型 → Tool Call → Extension Runner(tool_call 事件) → 允许? → Tool.execute() → Tool Result
                                          └→ Block → 错误 Tool Result
```

它不是替代 Agent Loop，而是在 Core 明确发出的事件点**观察、修改或阻止流程**。

### 1.2 Skill、Tool 与 Extension 的定位

| 概念        | 核心形态                 | 谁决定使用          | 能否改变运行流程     |
| --------- | -------------------- | -------------- | ------------ |
| Skill     | Markdown 工作流         | 模型或显式调用方       | 只能通过指令间接影响   |
| Tool      | Schema + execute     | 模型产生 Tool Call | 执行一个具体能力     |
| Extension | TS/JS Factory + 注册结果 | 宿主在加载时启用       | 可监听、修改、阻止和注册 |

`error-log-analysis` Skill 告诉模型「怎样分析」；`read` Tool 负责读文件；审批 Extension 决定某次 Tool Call 是否允许执行。

### 1.3 为什么审批不能只写在 Skill 里

在 Skill 中写「删除文件前必须询问用户」是给模型的**软指令**——模型可能没读取 Skill，Skill 也可能在 Compaction 后只剩摘要。而 `tool_call` Handler 处于实际执行路径：

```typescript
pi.on("tool_call", async (event) => {
	if (event.toolName !== "bash") return;

	const command =
		typeof event.input.command === "string"
			? event.input.command
			: "";

	if (/(^|\s)rm\s+-rf(\s|$)/.test(command)) {
		return {
			block: true,
			reason: "Blocked by the desktop agent policy.",
		};
	}
});
```

### 1.4 为什么不直接修改 Agent Loop

直接改 Core 的成本包括：每次升级都要重新合并、Policy 与模型循环耦合、难以按项目启用、难以单独测试分发停用、多种需求不断增加分支。**Extension 让 Core 维护稳定事件点，让产品逻辑在外部组合**——这不是「Extension 一定安全」，而是把变化放到明确边界。

:::important
一个必须记住的安全事实：**`tool_call`** **Handler 返回 Block 后 Tool 不会执行**，但多个 Handler 共享同一**可变 Input**——后续 Extension 还能改动已审批参数，而且修改后不会再次 Schema Validation。因此 Extension Gate 只有在受控的 Extension Chain 中才能形成可靠拦截；真正的桌面安全边界应在宿主最终执行层检查最终参数。**不能只依赖 Prompt/Skill。**
:::

### 1.5 Factory 不是后台服务启动点

Extension 是默认导出 Factory 的 TS/JS Module：

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event) => {
		// 注册行为
	});
}
```

文档特别要求：**不要在 Factory 中启动长期 Process、Socket、Watcher 或 Timer**——Factory 可能在根本不会启动 Session 的调用中运行（例如只列模型）。正确模式：Factory 注册能力、可做有界的一次性初始化；`session_start` 启动 Session Scoped Resource；`session_shutdown` 幂等清理。

:::caution
Extension Module 在本机进程中运行，**拥有用户进程的全部权限**——可以读写文件、访问环境变量、发起网络请求、启动子进程、注册高权限 Tool。「Extension API 是受控接口」不等于 JavaScript Module 被沙箱隔离。API 限制的是它与 AgentSession 的正式耦合面，不限制 Module 自身的 Node 能力。
:::

## 二、Extension 的完整加载过程

把示例文件复制成 Extension `.ts` 并放进项目目录后，它为什么能在 Tool 执行前工作？从文件到运行行为，至少跨越四层。

### 2.1 四层链路

```text
资源解析（Settings、Package、CLI Path）→ 有序 Extension Paths
  ↓
Module 加载（Jiti 加载 TS/JS）→ Factory Function
  ↓
Factory 执行（Factory + API）→ Extension 注册容器
  ↓
Runtime 组装（Extensions + Shared Runtime）→ ExtensionRunner
  ↓
Core 绑定（Runner + AgentSession）→ 可执行 Actions、Events、Tools
```

### 2.2 发现路径与优先级

Loader 自动发现：项目 `.pi/extensions`、用户 `agentDir/extensions`、显式配置路径。扫描只看一层：直接 `.ts` / `.js` 文件、子目录中的 `index.ts`（优先于 `index.js`）、子目录 `package.json` 的 `pi.extensions`。**不递归无限扫描**，复杂目录必须通过 Manifest 声明入口。

最终优先级从高到低：

1. CLI / Additional Extension Source；
2. Project Settings；
3. Project Auto-discovered；
4. User Settings；
5. User Auto-discovered；
6. Package Resource；
7. Inline Factory 最后追加。

Tool/Flag 跨 Extension 是 **First Wins**（第一个名称胜出），因此这个顺序会决定 Winner。

### 2.3 缓存与失败语义

- `extensionCache` 缓存的是 **Factory 函数**（resolved path → ExtensionFactory），不是已经执行完成的 Extension Object；
- Jiti 自身配置 `moduleCache: false`，外层 Cache 决定是否复用 Factory；
- Factory Import 或执行抛错时返回 `{ extension: null, error: ... }`，**失败项不进入 Extensions Array，后续 Path 继续加载**——错误是收集式，不是第一个失败就终止全部。

### 2.4 同名冲突的不同语义

| 注册项           | 冲突行为                                                |
| ------------- | --------------------------------------------------- |
| Tool          | Runner 第一个 Name 胜出；Resource Loader 加 Conflict Error |
| Flag          | 第一个 Name 胜出；Resource Loader 加 Conflict Error        |
| Command       | 跨 Extension 全部保留；同名改为 `name:1`、`name:2`             |
| Event Handler | 全部保留，按 Extension/注册顺序运行                             |

:::note
同一个 Extension 内重复注册同名 Tool/Command/Flag，由各自 Map **后写覆盖前写**；Handler 则 Push 到 Array，同一事件可以有多个 Handler。Flag 有个细节：Definition 后写覆盖，但 Default Value 只在 Runtime 还没有这个 Name 时写入——所以重复 Flag 可能呈现「后一个 Definition + 第一个 Default」。
:::

### 2.5 Reload 的完整时序

`AgentSession.reload()`：保存 Flag Values → 发 `session_shutdown(reason=reload)` → Reload Settings → Reset Provider → Resource Loader 清 Cache 重新解析导入执行 Factory → 创建新 Runner 并绑定 → 恢复 Flag Values → 刷新全部 Extension Tool → 若宿主绑定存在发新 `session_start` → 再执行 `resources_discover`。**Extension 自己启动的 Watcher/Process 必须在 Shutdown 中清理，否则 Reload 会叠加资源。**

## 三、Extension API 与 Runtime 原理

上一章 Loader 调用 `await factory(api)`。为什么不直接写成 `await factory(agentSession)`？因为 Pi 希望 Extension 依赖一组**稳定能力**，而不是依赖 AgentSession 的全部内部字段。

### 3.1 三个对象，三个时机

| 对象                        | 谁拿到                  | 主要用途                           |
| ------------------------- | -------------------- | ------------------------------ |
| `ExtensionAPI`            | Factory 闭包           | 注册能力、发起 Runtime Action         |
| `ExtensionContext`        | Event Handler / Tool | 读取当前 Run 状态、Abort、Compact      |
| `ExtensionCommandContext` | Command Handler      | 等待 Idle、New/Fork/Switch/Reload |

### 3.2 注册与动作分离

`ExtensionAPI` 分成两半：

- **Registration Methods**（写当前 Extension 的 Map）：`on`、`registerTool`、`registerCommand`、`registerFlag`……；
- **Action Methods**（委托 Shared Runtime）：`sendMessage`、`appendEntry`、`setActiveTools`、`setModel`、`setThinkingLevel`、`registerProvider`……

为什么分离？Factory 阶段 AgentSession 可能尚未创建，但 Loader 已经需要知道有哪些 Tool、订阅哪些 Event。所以：**先声明，后连接**——「Factory：我提供什么」「Bindings：这些动作在当前宿主里怎样实现」「Runner：什么时候调用谁」。

:::important
加载前，大多数 Action 是 **Throwing Stub**——`createExtensionRuntime()` 先填入 `notInitialized` 函数，调用时直接抛「Extension runtime not initialized」。为什么不用 `undefined`？明确抛错能告诉 Extension 作者「时机不对」，而不是得到难以定位的 Null Error。
:::

### 3.3 Provider 为什么可以在 Factory 注册

Provider 是启动阶段需要的资源，所以 `registerProvider()` 有 Pre-bind Queue：Factory 注册 → 进入 `pendingProviderRegistrations` → Runner.bindCore → ModelRegistry.registerProvider → 清空 Queue。**Bind 完成后，Runtime 的 Provider Action 被替换为立即生效的实现，不再要求 Reload。** 这是一项有意设计的例外，不代表所有 Action 都能在 Factory 调用。

### 3.4 ExtensionContext 为什么每次创建

Runner 发 Event 时调用 `createContext()`，Context 的 Property 使用 **Getter**——它不会在 Extension 加载时把 Model 固定下来。切换 Model 后，下一次读取 `ctx.model` 得到当前值。同理：`ctx.signal` 指向当前 Run 的 Abort Signal、`ctx.isIdle()` 查询当前状态、`ctx.sessionManager` 是 Readonly View。

:::note
普通 Handler 在 TypeScript 能力面得到 `ReadonlySessionManager`，但**这不是运行时 Readonly Proxy**——Runner 实际返回同一个 SessionManager Instance，恶意代码仍可用 Cast/Reflection 触及写方法。这是类型化 Extension 的架构约束，不是安全隔离。需要持久化 Extension State 时，用 `pi.appendEntry(...)`。
:::

### 3.5 会话替换后的 Fresh Context

`newSession()`、`fork()`、`switchSession()` 接受 `withSession` 回调，`nextCtx` 绑定替换后的 Session。**Session Replacement 或 Reload 后不应继续使用捕获的旧** **`pi`/Command Context**——替换后的工作放进 `withSession()`。

:::warning
v0.82.0 基线有个实现缺口：Session Dispose/Replacement 会调用 `runner.invalidate()` 让旧句柄被 Guard 拒绝；但 `AgentSession.reload()` 当前直接重建 Runtime，**没有显式 Invalidate 旧 Runner**。不能依赖 Reload 自动拒绝旧句柄，Extension 仍必须遵守契约主动停止使用。
:::

## 四、事件系统与拦截链

Extension 真正强大的地方不是「能收到很多 Event」，而是**不同 Event 有不同的合并语义**：有的只能观察，有的可以替换数据，有的按 Middleware 链式传递，有的遇到 Block/Cancel 就短路。

### 4.1 事件分类

| 类型   | 例子                                             | 返回值是否影响流程      |
| ---- | ---------------------------------------------- | -------------- |
| 观察型  | `agent_start`、`turn_end`、Execution Events      | 否              |
| 变换型  | `input`、`context`、Provider Request、Message End | 是              |
| 拦截型  | `tool_call`、Session Before Events              | 可 Block/Cancel |
| 资源型  | `resources_discover`                           | 累积 Path        |
| 生命周期 | Session/Agent/Turn/Message                     | 多数观察           |
| 状态通知 | `model_select`、`thinking_level_select`         | 否              |

### 4.2 一次 Prompt 的主干

```text
input（可变换/处理）
  → before_agent_start（消息/Prompt）
  → agent_start → turn_start → message_start/end(user)
  → context（修改消息）→ before_provider_headers → before_provider_request
  → after_provider_response → message_start/update/end(assistant)
  → 有 Tool Call? → Tool Events → ToolResult → message_start/end
  → turn_end → 是否需要继续下一 Turn?
  → agent_end → agent_settled
```

:::important
`agent_end` 只表示一个底层 Run 结束。**自动 Retry、Compaction Retry 或 Queue Continuation 仍可能继续**——真正需要把 UI 状态置为稳定，应看 `agent_settled`。
:::

### 4.3 tool\_call：修改与阻止

`event.input` 可原地修改（后续 Handler 看见前一 Handler 的 Mutation），但**Mutation 后不会重新做 Schema Validation**——Handler 自己必须保持 Argument 符合 Tool Contract。Return Value 只用 `{ block, reason }`，第一个 `block: true` 立即停止链。

### 4.4 tool\_call 的错误是特殊边界

多数 Runner Emit 会捕获 Handler Error、报告给 Error Listener，再继续后续 Handler。**`emitToolCall()`** **不做这层 Catch**——AgentSession 的 Before Tool Hook 会把错误重新抛出，使该 Tool 不执行并形成失败结果。这是 **Fail Closed**：审批 Handler 崩溃 ≠ 默认放行。

| Event                                   | Handler 抛错                    |
| --------------------------------------- | ----------------------------- |
| 普通 Lifecycle / Context / Result / Input | 报 Extension Error，继续          |
| `project_trust`                         | 收集 Error，继续找 Decision         |
| `tool_call`                             | 传播到 Tool Hook，Tool 不执行        |
| Extension Factory                       | 记录 Load Error，该 Extension 不加载 |

### 4.5 tool\_result：链式 Patch 与 Redaction

执行结束后，Handler 可返回任意字段的 Partial Patch（content / details / isError / usage），每个 Handler 看见之前的最新值。Handler 抛错会被记录并隔离，后续 Handler 继续——**安全脱敏不能靠** **`tool_result`** **Throw 实现 Fail Closed**，要显式返回安全替代内容。

### 4.6 防止事件递归

Handler 可调用 `pi.sendUserMessage()`、`pi.sendMessage({ triggerTurn: true })` 或触发 Compaction，从而启动新的事件链。避免 `agent_end handler → sendUserMessage → agent_end → ...` 无限循环。用 Session Entry、内存 Guard、Message CustomType 或 Run ID 判断是否已处理——**Pi 不会自动推断业务递归。**

## 五、用 Extension 添加和包装工具

桌面 Agent 现在要增加数据库查询能力：模型可以执行只读 SQL；任何写操作必须进入审批；所有调用都要留下审计记录。这个需求会串起 Tool Definition、Wrapper、审批与审计的完整链路。

### 5.1 defineTool 与 registerTool 的区别

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { defineTool } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";

export default function databaseExtension(pi: ExtensionAPI) {
	pi.registerTool(
		defineTool({
			name: "query_database",
			label: "Query database",
			description: "Run SQL. Write operations require approval.",
			parameters: Type.Object({
				sql: Type.String({ minLength: 1 }),
			}),
			executionMode: "sequential",
			async execute(toolCallId, { sql }, signal, onUpdate) {
				// 消费一次性 Capability：只有审批 Gate 为同一 toolCallId + canonical sql 签发的才有效
				const capability = consumeQueryCapability(
					toolCallId,
					canonicalizeSql(sql),
				);
				assertAuthorizedSql(sql, capability);
				onUpdate?.({
					content: [{ type: "text", text: "Querying…" }],
					details: { phase: "query" },
				});
				return await runAuthorizedQuery(sql, signal);
			},
		}),
	);
}
```

**`defineTool()`** **主要保留 TypeBox Parameter 的 Type Inference，不会注册 Tool，也不增加运行时 Security**——真正注册仍是 `pi.registerTool()`。

### 5.2 参数从模型到 execute 的流动

```text
模型 Raw Arguments
  → prepareArguments（可选）
  → TypeBox Validation
  → beforeToolCall / tool_call（可原地修改，不再次校验）
  → execute(validatedArgs)
```

:::warning
一个重要边界：**`tool_call`** **Handler 可以在 Validation 后原地改 Input，Core 不再次校验。** 因此审批后若还有不可信 Handler，最终执行参数仍可能变化。桌面 Agent 的最后一道 Policy 应位于受控的最终执行层，检查真正交给 Backend 的参数。
:::

### 5.3 execute 的五个参数

`toolCallId`（关联 Event/UI/Audit）、`params`（Schema 验证后的参数，但可能已被 Hook 修改）、`signal`（当前 Run 的 Abort Signal）、`onUpdate`（发送 Partial Result）、`ctx`（当前 CWD、Model、Session Read View）。**Tool 应把 Signal 继续传给 Database Driver、Fetch 或 Child Process**——只接收 Signal 而不转发，用户中断仍无法停止底层工作。

### 5.4 审批 Gate 与一次性 Capability

```typescript
pi.on("tool_call", async (event, ctx) => {
	if (event.toolName !== "query_database") return;

	const sql =
		typeof event.input.sql === "string" ? event.input.sql : "";

	if (isReadOnlySql(sql)) return; // 只读 SQL 隐式放行
	if (!ctx.hasUI) {
		return { block: true, reason: "Write query requires interactive approval." };
	}

	const approved = await ctx.ui.confirm(
		"Database write",
		sql,
		{ signal: ctx.signal, timeout: 30_000 },
	);
	if (!approved) {
		return { block: true, reason: "Rejected by user." };
	}
	grantOneShotQueryCapability(event.toolCallId, canonicalizeSql(sql));
});
```

审批后，**最终 Database Backend 仍应验证 SQL/Capability**——UI Approval 是用户意图，不是 Parser 或 Authorization。Approval Record 至少保存：`toolCallId`、`toolName`、canonical arguments hash、decision、user/session、timestamp、policy version。

### 5.5 同名 Tool 的覆盖顺序

内部 Registry 先放 Built-in，再放 Extension Tool，最后放 SDK `customTools`，Map 后写覆盖：

```text
SDK customTools > Extension Tool > Built-in Tool
```

而多个 Extension 之间**先注册者胜出**。注册一个名为 `read` 的 Extension Tool 会替换 Built-in Read 的执行 Definition——但这是**替换**，不是自动调用原实现的 Decorator。想要「包装」Built-in，用 Event 包装（tool\_call 前置检查 → 原 Tool → tool\_result 后处理），而不是同名替换。

### 5.6 动态启用与禁用

`setActiveToolsByName()`：只保留 Registry 中存在的 Name（Unknown Name 静默忽略）、替换 Agent State Tools、按新 Tool Set 重建 Base System Prompt、从下一 Agent Turn 生效。

:::caution
**如果当前 Turn 已经把 Tool Schema 发给模型，动态禁用不能撤回已经生成并进入 Preflight 的 Call**——最终 Policy 仍要检查。`allowedToolNames` / `excludedToolNames` 是宿主 Registry 边界，Extension 的 `setActiveTools()` 只能在已被允许的 Registry 内选择。
:::

## 六、通过 Extension 改变 Agent 行为

这一章回答一个更实用的问题：**我想改 Agent 行为，应该选哪个扩展点？** 关键不是「哪个 Event 看起来最接近」，而是你想修改的数据处于哪一层。

### 6.1 按数据层选择扩展点

```text
要改什么？              → 扩展点
用户原始输入            → input
本次系统提示            → before_agent_start
每次模型消息            → context
HTTP Header            → before_provider_headers
序列化 Payload         → before_provider_request
工具许可               → tool_call
模型/Thinking          → Runtime Action（setModel / setThinkingLevel）
压缩                   → compact + session_before_compact
会话状态               → appendEntry
```

越靠后修改，越接近 Provider/Tool 的最终形态；越靠前，越能保持高层语义。

### 6.2 before\_agent\_start 与 context 怎么选

| 需求                      | 选择                              |
| ----------------------- | ------------------------------- |
| 根据用户这次 Prompt 增加规则      | before\_agent\_start            |
| 每一轮 Tool Loop 前都重新计算    | context                         |
| 修改 System Prompt        | before\_agent\_start            |
| 修改 Message Array        | context                         |
| 写入可持久化 Custom Message   | before\_agent\_start 返回 message |
| 仅影响 Provider 可见 Context | context                         |

一次 Agent Run 可有多个 LLM Turn，所以 `context` 可能比 `before_agent_start` **多次触发**。

### 6.3 修改 Provider Request 的边界

```typescript
// 加 Trace Header
pi.on("before_provider_headers", (event, ctx) => {
	event.headers["x-session-id"] = ctx.sessionManager.getSessionId();
});
```

注意：**Payload Shape 由 Provider/API 决定，不是统一稳定 Schema**。能在 System Prompt、Context 或 Provider Config 解决的问题，不要无谓地下沉到 Payload Rewrite。Provider 内部 HTTP Retry 复用已组装 Header，不会再次触发 Hook——不能用它实现「每次 Retry 都生成不同 Nonce」。

### 6.4 Read-only Mode 与 Plan Mode

Read-only Mode 需要三层组合，不只改 Prompt：

```typescript
const READ_ONLY_TOOLS = ["read", "grep", "find", "ls"];
let mode: "normal" | "readonly" = "normal";

pi.registerCommand("readonly", {
	description: "Enable read-only mode",
	handler: async (_args, ctx) => {
		await ctx.waitForIdle();
		mode = "readonly";
		pi.setActiveTools(READ_ONLY_TOOLS);
		pi.appendEntry("desktop-mode", { mode: "readonly" });
	},
});

// 最终 Gate：即使模型漏看了 Prompt，执行层也会拦截
pi.on("tool_call", (event) => {
	if (mode !== "readonly") return;
	if (!READ_ONLY_TOOLS.includes(event.toolName)) {
		return { block: true, reason: "Read-only mode blocks this tool." };
	}
});
```

:::important
**Plan Mode 不是一个通用** **`PlanMode=true`** **Core Flag**——它是由现有扩展点组合出的产品模式：System Prompt（只分析和规划）+ Active Tools（只保留读取/搜索）+ Final Policy（拒绝写入和执行）。只改 Prompt 不够；只改 Active Set 也不能撤回本 Turn 已生成的 Call；最终执行 Backend 还要做 Filesystem/Network Policy。
:::

### 6.5 任务完成通知用 agent\_settled，不是 agent\_end

发送通知、刷新文件索引应监听 `agent_settled`——`agent_end` 之后可能 Retry、Auto-compaction Retry 或处理 Follow-up。还要保证 **Idempotency**：Extension 触发的新 Run 可能再次 Settled，用 Run/Session Entry 或业务 Idempotency Key 去重。

## 七、高级扩展：Provider、资源与运行环境

Extension 的边界还可以再向外推：接入公司模型网关、动态发现模型、动态提供 Skill、把 Bash 放进容器或远程主机、让多个 Extension 协作、在 Session Branch 中恢复状态。

### 7.1 两种 Provider 注册形式

```typescript
// 形式一：完整 Provider Object
pi.registerProvider(
	createProvider({
		id: "company-ai",
		name: "Company AI",
		baseUrl: "https://ai.internal/v1",
		auth: { /* canonical auth */ },
		models: [],
		api: openAICompletionsApi(),
	}),
);

// 形式二：Name + ProviderConfig（兼容配置）
pi.registerProvider("company-ai", {
	baseUrl: "https://ai.internal/v1",
	apiKey: "$COMPANY_AI_KEY",
	api: "openai-completions",
	models: [/* definitions */],
});
```

### 7.2 三种动态模型刷新契约

| 形式                                | 刷新返回值                                  | Store 责任                           |
| --------------------------------- | -------------------------------------- | ---------------------------------- |
| Legacy ProviderConfig             | 返回 `ProviderModelConfig[]`             | 扩展自己缓存                             |
| 完整 Provider Object                | 返回 `Promise<void>`，通过 `getModels()` 发布 | 扩展自己维护                             |
| `createProvider({ fetchModels })` | 接收抓取回调                                 | `createProvider` 处理 ModelsStore 读写 |

**动态刷新必须尊重** **`allowNetwork=false`**——只允许离线/缓存刷新。Provider 注册时也会主动触发一次这种刷新，不能无条件请求网络。

:::note
`resources_discover` 当前只能贡献三类 Path：Skill Paths、Prompt Paths、Theme Paths。**不能**通过任意 `customResources` 字段发明新的 Core Resource Type，也不用于再次添加 Extension Path。若应用需要自己的索引、知识库或配置文件，应由 Extension 自己管理，再通过 Tool、before\_agent\_start 或 Context 暴露给 Agent。
:::

### 7.3 Spawn Hook 不是沙箱

```typescript
const bash = createBashTool(cwd, {
	spawnHook: ({ command, cwd, env }) => ({
		command: wrapInSandbox(command),
		cwd: mapWorkspace(cwd),
		env: { ...env, CI: "1" },
	}),
});
```

Spawn Hook 可以改 Command、CWD、Environment——**但它不是沙箱本身**；`wrapInSandbox()` 必须连接真实 OS Sandbox/Container/Remote Executor。若返回本地 Shell Command 但没有权限隔离，改个目录名称不会形成安全边界。

### 7.4 Extension Event Bus

`pi.events` 是 Node `EventEmitter` 的薄封装：Channel 是 String、Data 是 Unknown、Emit 是同步触发 Listener、**Wrapper 支持 Async Handler 但** **`emit()`** **不 Await**、Handler Error 被 Catch 后写 Console。

:::warning
不要把 Event Bus 当成可靠 Message Queue：**没有持久化、Ack、Replay 或 Backpressure。** 建议用 `<publisher>/<domain>/<event>@v<version>` 命名 Channel 防止碰撞；Payload 进入时 Runtime Validate。对强安全决策，Bus 只能传递状态通知，最终 Policy 应查询权威 Store 或 Host Binding。
:::

### 7.5 Branch-aware 状态选择

| 状态                       | 保存位置                | 生命周期                  |
| ------------------------ | ------------------- | --------------------- |
| 临时 Cache                 | Factory Closure     | 当前 Extension Instance |
| Branch-aware Tool State  | Tool Result Details | 当前 Session Branch     |
| 非模型 Branch State         | Custom Entry        | 当前 Session Branch     |
| 跨 Session Account/Config | External Store      | 由宿主管理                 |

假设 Todo Tool 每次 Result 保存完整 Items：Branch A 的 result 是 `[A]`，Branch B 是 `[A,B]`——切换 Branch 后从 `ctx.sessionManager.getBranch()` Replay，就能得到该 Branch 自己的状态。**如果只写一个全局 JSON 文件，Branch Navigation 不会自动回滚它。**

## 八、构建可靠的 Extension

一个 Extension 在 Demo 中工作，不等于能进入生产。它可能：Factory 启动失败、Handler 卡住整个事件链、Reload 后留下两个 Watcher、与另一个 Extension 抢同名 Tool、在 Agent End 中递归启动新 Run、把 Session A 的状态泄漏到 Session B。

### 8.1 Factory 初始化失败不是「事务回滚」

Factory Import 或执行抛错，Loader 返回 `{ extension: null, error }`，该 Extension 不进入列表，后续 Path 继续加载。但 **Factory 在抛错前对共享 Runtime 做过的预绑定注册仍可能残留**（排队等待绑定的 `registerProvider()` 可能随后被 Flush，`registerFlag()` 写入的默认值也可能保留）。

可靠的 Factory 应：先完成读取、远程请求、Schema 校验等可能失败的工作；把注册动作集中到最后一个尽量不失败的阶段；不把「Factory Throw」当成撤销此前副作用的机制。长期资源延迟到 `session_start` 或首次使用。

### 8.2 Handler Timeout 与取消

Runner 顺序 `await` Handler，**没有自动 Timeout**。远程初始化必须自行限时：

```typescript
export default async function (pi: ExtensionAPI) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 5_000);
	try {
		const config = await fetchConfig(controller.signal);
		registerFromConfig(pi, config);
	} finally {
		clearTimeout(timer);
	}
}
```

:::caution
对 Approval，**Timeout 应默认拒绝，而不是默认允许**。普通 `tool_result` Handler Throw 并不是 Fail Closed——Runner 会报告错误后继续使用已有结果。安全脱敏要返回安全替代结果，或在更早的 `tool_call`/宿主 Policy 边界拒绝执行。
:::

### 8.3 多会话并发与 Module Singleton

桌面应用可能同时维护多个 AgentSession。每个 Session 应拥有独立 Extension Runtime、独立 Closure State、独立 Abort/Queue、独立 Approval Request、独立 Session Store。风险来自 **Module-level Singleton**：

```typescript
const mutableState = new Map(); // 所有 Factory Instance 共享
```

如果必须共享 Connection Pool，Key 至少包含 Tenant/Workspace，并确保并发、权限与 Shutdown 引用计数正确。

### 8.4 性能预算

每个 Hook 都在关键路径：

| Event                        | 性能风险                 |
| ---------------------------- | -------------------- |
| input / before\_agent\_start | 增加首 Token 延迟         |
| context                      | 每个 LLM Turn 都执行      |
| message\_update              | 每个 Stream Update 都执行 |
| tool\_call                   | 阻塞 Tool 启动           |
| tool\_result                 | 阻塞模型看到结果             |

为 Handler 记录 Count、P50/P95/P99、Timeout/Error、Payload Size、External Dependency。**不要在每个 Token Update 序列化整个 Session。**

### 8.5 测试金字塔与版本兼容

```text
Unit（pure policy/schema）
  → Harness（events/tools，Faux Provider）
  → Session lifecycle（reload/switch）
  → End-to-end（desktop bridge）
  → Version compatibility
```

用 Inline Factory + Faux Provider 断言 Event Order、Block、Result Patch、Error Listener。版本兼容：**TypeScript 编译通过不代表行为兼容**——Event Order、Reload 行为和 Provider Payload 都可能在版本间改变，要跑 Contract Tests。

## 九、选择正确的集成层次

现在开始把 Pi 嵌入桌面 Agent。Pi 不是单一入口，而是一组由低到高的层。

### 9.1 五层对照

| 能力                     | pi-ai | agent-core | AgentHarness | Coding SDK | RPC              |
| ---------------------- | ----- | ---------- | ------------ | ---------- | ---------------- |
| Provider Stream        | ✓     | ✓          | ✓            | ✓          | ✓                |
| Tool Loop              | 自建    | ✓          | ✓            | ✓          | ✓                |
| Session/Branch         | 自建    | 自建         | ✓            | ✓          | ✓                |
| Generic Skill/Template | 自建    | 自建         | ✓            | ✓          | ✓                |
| coding-agent Resource  | —     | —          | —            | ✓          | ✓                |
| Extension/Pi Package   | —     | —          | —            | ✓          | ✓                |
| Project Trust          | —     | —          | —            | 宿主接线       | Built-in RPC 启动流 |
| 同进程类型调用                | ✓     | ✓          | ✓            | ✓          | —                |
| Process Isolation      | —     | —          | —            | —          | ✓                |

### 9.2 先问五个问题

1. 只要一次模型生成，还是需要 Tool Loop？
2. 是否需要 Session Tree、Compaction、Queue？
3. 是否需要 Skills、Extensions、Package/Trust？
4. Agent 能否与桌面 UI 同进程？
5. 谁负责 Crash Isolation 与 Protocol Version？

### 9.3 按产品复杂度选择

| 场景                                                  | 选择                                |
| --------------------------------------------------- | --------------------------------- |
| 单次 AI 功能                                            | pi-ai                             |
| 自有 Workflow/Storage 的 Tool Agent                    | pi-agent-core                     |
| 非 Coding Domain，但需要 Session/Compaction              | AgentHarness                      |
| 需要 Skills、Extensions、Session、Coding Tools 的桌面 Agent | Coding Agent SDK                  |
| 跨语言或需要 Worker Crash Isolation                       | RPC，或在 SDK 外自己建立 Process Protocol |

:::important
本书主线选择 **Coding Agent SDK**，理由：要完整讲 Skills；Extension 是核心特色；要 Session、Compaction、Queue；不使用 Pi TUI；桌面 UI 需要直接订阅 Event。但**最高层不一定总是最佳选择**——如果产品不需要 Filesystem/Coding Tool、已有稳定 Session Backend、Extension Package 不是需求、强制使用自己的 Resource/Policy，Coding SDK 可能过重。高层不是「更先进」，只是做了更多产品决策。
:::

### 9.4 RPC 不是完整沙箱

子进程默认仍可能继承用户权限、Environment、Filesystem、Network、Working Directory。**Process Separation 改善 Crash Isolation，不自动形成 Least Privilege**——需要 OS Sandbox、Container Profile 或 Brokered Tool 才能限制权限。

## 十、SDK 嵌入桌面与 RPC 隔离

### 10.1 最小同进程嵌入（SDK）

```typescript
import {
	createAgentSession,
	ModelRuntime,
	SessionManager,
} from "@earendil-works/pi-coding-agent";

const modelRuntime = await ModelRuntime.create();
const { session } = await createAgentSession({
	cwd: workspacePath,
	modelRuntime,
	sessionManager: SessionManager.inMemory(workspacePath),
});

const unsubscribe = session.subscribe(handleEvent);
await session.prompt("分析当前项目");
```

桌面架构原则：**View Components 不要直接持有 Session**——View → Desktop Store → Agent Controller → AgentSessionRuntime → AgentSession。Controller 负责 Prompt/Abort/Queue、Event Subscription、Runtime Replacement、Extension Binding、Error Mapping、Dispose。

### 10.2 Replacement 后必须重新绑定

`runtime.session` 指向的是**当前** AgentSession，Replacement 后会变化。必须：

```typescript
let unsubscribe = runtime.session.subscribe(handleEvent);

runtime.setBeforeSessionInvalidate(() => {
	unsubscribe();                    // 拆旧 Bridge
	detachOldDesktopBridgeSynchronously();
});

runtime.setRebindSession(async (nextSession) => {
	unsubscribe = nextSession.subscribe(handleEvent); // 先订阅
	try {
		await bindDesktopExtensions(nextSession);     // 后绑定
	} catch (error) {
		unsubscribe();
		throw error;
	}
});
```

先订阅、后 `bindExtensions()`，才能捕获 Extension 处理 `session_start` 与 `resources_discover` 期间产生的公开 Session Event。**不要只更新 Store 中的 Session ID。**

### 10.3 RPC：JSONL 协议

RPC 把 Coding Agent 放进独立子进程，通过 stdin/stdout 的 JSONL（一行一个 JSON Object，LF 分隔）通信：

```text
stdin:  Command（可带 id）
stdout: Response（回显 id，用于关联并发请求）
stdout: Event / Extension UI Request
stdin:  Extension UI Response
```

:::warning
**Prompt 成功只是「接受确认」，不是完成响应。** 发送 `prompt` 命令后，响应 `{ "id":"p1", "type":"response", "command":"prompt", "success":true }` 只表示 Prompt 被接受、排队或由 Extension 处理——之后的模型/Tool 失败通过 Event 与 Message Stream 报告。只有实际启动或加入 Agent Run 的 Prompt，桌面 UI 才以 `agent_settled` 判断这次 Run 稳定结束。
:::

### 10.4 RPC 的关键工程点

- **JSONL Framing**：只按 LF Split；不要使用会把 Unicode Separator 当换行的通用 Line Reader；
- **Command 没有全局串行顺序**：多个 Command 可并发执行，Response 可能乱序——必须用 ID 关联，有依赖的操作必须等待前一个 Response；
- **崩溃恢复**：Restart 后 Rehydrate UI（get\_state/get\_messages），Reject/Cancel/Clear 旧 Pending，把可能已执行但未确认的动作标为 Indeterminate——**不自动重放不确定是否已执行的 Tool**；
- **Exactly-once 并不存在**：RPC Command Response 丢失时，依赖业务 Idempotency Key、Audit Store 与 Backend Query，不是重新发送同一个 Prompt；
- **Version Handshake**：当前 `RpcCommand` 没有内置 Version/Capabilities Handshake——版本固定或兼容协商必须由宿主在外层实现，不要让桌面 App 自动连接任意系统 PATH 中不同版本的 `pi`。

:::note
v0.82.0 的内置 `RpcClient` 不能原样作为完整桌面 UI Bridge：`extension_ui_request` 被强转为普通 Event、没有公开的 `extension_ui_response` 发送 API、JSON Parse Error 被静默忽略、`stdin.write()` 不检查 `false`/`drain`（没有输入背压）。生产客户端需要扩展它，或复用 Framing 思路按 `rpc-types.ts` 建立完整对应类型。
:::

### 10.5 SDK 与 RPC 对照

| 维度                  | SDK 同进程     | RPC 子进程             |
| ------------------- | ----------- | ------------------- |
| 类型安全                | 直接 TS       | 协议 Schema           |
| 延迟                  | 较低          | 序列化/IPC             |
| Crash               | 可能影响 UI     | 可独立重启               |
| 权限                  | 同进程         | 可进一步限制              |
| 多语言                 | 困难          | 容易                  |
| Debug               | 直接 Stack    | 跨进程 Log             |
| Session Replacement | Runtime API | Command             |
| Extension UI        | Binding     | UI Request/Response |

## 十一、桌面 Agent 的应用状态设计

Pi 发出的是运行时 Event，桌面 UI 需要的是可渲染 State。`message_update` Event ≠ 一个聊天气泡组件；`tool_execution_start` ≠ 一个审批弹窗。

### 11.1 总体分层

```text
Pi AgentSession / RPC Events
  → Event Adapter
  → Pure Reducer
  → Desktop Store
  → React / Vue / SwiftUI
```

View 不调用 Pi Private API；Reducer 不执行 Tool/Network；Controller 不保存渲染细节。

### 11.2 Conversation 三分

建议区分：Persisted Session Entries（历史）、Current Agent Context Messages（当前模型上下文，可能已压缩）、Current Streaming Assistant Draft（正在流式生成）。`RPC get_messages` 返回的是 `session.messages` 即当前 Agent Context——**Compaction 后它不等于完整历史，也没有稳定 Entry ID**。可靠恢复、Branch 与去重应使用 `get_entries` 的 `entry.id`、`since` Cursor 和 `leafId`。

### 11.3 Run 状态机

```text
Idle → Starting → Streaming → Tooling → Settling → Idle
                        ↑           ↓
                      Aborting ←───┘
```

**`agent_end`** **不直接置 Idle；`agent_settled`** **才表示没有自动 Retry/Compaction/Queue Continuation。**

### 11.4 工具状态与审批状态

Tool 按 `toolCallId` Upsert（Start → Create，Update → Merge Progress，End → Finalize），Parallel Tool 的 Update/End 可交错，不能用「最后一个 Tool」单变量。

Approval 不是标准 AgentSession Event，而是来自宿主 Policy/Extension UI Bridge 的独立 Channel：

```typescript
interface ApprovalState {
	requestId: string;
	toolCallId: string;
	toolName: string;
	canonicalArgs: unknown;  // 审批必须绑定规范化参数
	risk: string;
	status: "pending" | "approved" | "rejected" | "expired" | "cancelled";
}
```

:::warning
标准 RPC `extension_ui_request` 的 Confirm 只有 `id/method/title/message/timeout`，**并不携带** **`toolCallId`、`toolName`、`canonicalArgs`** **或** **`risk`**。宿主必须在 Backend 保存 UI Request ID → Canonical Tool Call 的映射，或定义单独的受控 Approval Protocol；**不能从显示文本反解析最终执行参数。**
:::

### 11.5 Generation、Sequence 与 Snapshot Barrier

桌面 Bridge、Batch Render、Worker Restart 会引入 Duplicate、Late Event、Lost Delta、Old Generation、Snapshot 与 Live Event 交错。策略：Generation Token（拒绝旧 Event）、Monotonic Local Sequence、ToolCall ID、Final Message Reconcile、Snapshot Applied Barrier、Reducer Idempotency。

```text
Session Replacement：
  freeze old generation → unsubscribe → create/apply new runtime
  → increment generation → subscribe new events into buffer
  → get state/messages + get_entries
  → record get_entries response as snapshotBarrier
  → apply snapshot by stable entry id
  → discard/reconcile message events at or before barrier
  → replay only events after barrier by local sequence
  → open live gate
```

这些信封字段（`runtimeId`、`generation`、`localSequence`、`runId`、`windowOwner`）**不是 Pi Event 原生字段**，全部由 Adapter 生成。

### 11.6 Store 不应保存什么

API Key/OAuth Token、未脱敏完整 Environment、不受限的大 Tool Output Duplicate、Mutable AgentSession Object、UI Component Instance、无 Generation 的 Callback。**Store 保存可序列化 View State，敏感能力留在 Controller/Backend。**

## 十二、组装完整桌面 Agent

前 33 章分别解决了模型、工具、会话、Skills、Extensions 与桌面状态。第 34 章不再引入新的大概念，而是把它们装进同一个应用。

### 12.1 六层架构

```text
Desktop View
  → Serializable Store
  → Application Controller
  → Agent Runtime Adapter
  → Pi AgentSession
  → Model Runtime / Provider / Resources / Tools / Sandbox
```

| 层               | 负责                        | 不负责                 |
| --------------- | ------------------------- | ------------------- |
| View            | 渲染、收集用户意图                 | 直接持有 AgentSession   |
| Store           | 可序列化 UI 状态                | 执行网络或工具             |
| Controller      | Prompt、Abort、审批、切换会话      | 拼接 Provider Payload |
| Runtime Adapter | SDK/RPC 差异、订阅与 Generation | 业务 UI 组件            |
| AgentSession    | Agent Loop、资源、队列、压缩、持久化   | OS 权限隔离             |
| Sandbox/Broker  | 最终文件、进程、网络权限              | 决定对话如何展示            |

### 12.2 启动顺序：先建立可信环境

应用启动不是「马上创建一个 Agent」：

```text
读取应用配置并确定 Workspace/CWD
  → 创建未信任 Settings/ResourceLoader
  → 只加载 Global/CLI 等 Pre-trust Extensions
  → 由它们参与 project_trust 决策
  → 使用决策完整 Reload 项目资源
  → 建立最终 Model/Auth/Services
  → 检查关键 Extension 诊断
  → 创建 AgentSession
  → 订阅 Event
  → bindExtensions
  → 生成 UI Snapshot
```

:::important
**Project Trust 必须在加载项目级 Extension 前决定。** 简单 `createAgentSession()` 不替宿主自动完成整个 Trust Flow——通过 `createAgentSessionServices({ resourceLoaderReloadOptions: { resolveProjectTrust } })` 接线，或自行创建带 Resolver Reload 的 `DefaultResourceLoader` 再传入。
:::

### 12.3 一次完整运行时序

以「读取项目中的错误日志，使用故障排查 Skill 找出原因，修改配置文件，但写入前必须让我确认」为例：

```text
Desktop: send_prompt
  → AgentSession: 展开 Skill / before_agent_start
  → Agent Loop: 模型生成 read ToolCall
  → tool_call(read) → allow → execute → ToolResult
  → 下一 Turn: 模型生成 controlled_write ToolCall
  → tool_call(controlled_write) → Canonicalize → Risk Classify
  → Desktop Approval Request → 用户 approve
  → Final Host Policy Check → execute through sandbox
  → ToolResult → 下一 Turn → 最终回答
  → Session JSONL append entries → agent_settled
```

关键点：**Tool Result 会回到模型，模型才知道动作是否成功**——桌面应用不能在工具完成后直接假装整个任务完成。

### 12.4 Streaming、Thinking 与 Tool 卡片

Store 同时维护三个投影：`conversation.streaming.text`、`conversation.streaming.thinking`、`tools[toolCallId]`。Text/Thinking 按消息合并；Tool 按 `toolCallId` Upsert。**多个并行工具的事件可能交错，不能只保存一个** **`currentTool`。** `message_end` 使用最终 Message Reconcile 草稿；`agent_end` 进入 Settling；只有 `agent_settled` 才回到 Idle。

### 12.5 错误按边界处理

| 错误                      | 默认处理                           |
| ----------------------- | ------------------------------ |
| Provider 暂时失败           | 有预算的 Retry，保留可见状态              |
| Tool Validation 失败      | 生成 Error ToolResult，让模型可修正     |
| Approval Timeout        | 拒绝                             |
| Extension 加载失败          | 诊断；安全关键扩展缺失则阻止运行               |
| SDK Session Replacement | Generation 切换并重绑订阅             |
| RPC Worker Exit         | 中断草稿/工具，重启后 Snapshot Rehydrate |
| Session 写入失败            | 明确告警，不能假装已持久化                  |

:::caution
**Abort 是取消请求，不是副作用回滚。** 已经写入的文件仍要依靠 Transaction、Backup 或 Idempotency 处理。**审批通过也不代表一定安全**——审批只是决策，最终执行还要经过受控 Tool Backend 与 Sandbox。
:::

## 十三、完整源码调用链走读

这一章只追踪一件事：用户在桌面输入框发送「读取日志并修复配置」，这句话怎样穿过 Pi，最终变成回复、工具结果和 Session 记录？

### 13.1 14 步流水线

```text
1.  Desktop Intent（宿主代码）
2.  AgentSession.prompt()（core/agent-session.ts）
3.  Resource / Skill Context（core/resource-loader.ts）
4.  before_agent_start（core/extensions/runner.ts）
5.  Agent Loop（agent/src/agent-loop.ts）
6.  pi-ai Provider（ai/src/models.ts 与 Provider）
7.  Message Stream（agent/types.ts、ai/types.ts）
8.  ToolCall / Validation（agent-loop.ts 与 Tool Schema）
9.  Extension Gate（core/extensions/runner.ts）
10. Approval（Extension UI Binding / RPC）
11. Tool Execute（core/tools/*）
12. ToolResult / Continue（agent-loop.ts）
13. Session Persist / Compact（session-manager.ts、agent-session.ts）
14. Desktop Projection（宿主 Adapter/Reducer）
```

这不是 14 个彼此独立的模块，而是一次 Run 中**重复发生的流水线**——步骤 5–12 可能循环多次。

### 13.2 先分清四层生命周期

```text
Agent Run
  └── Turn 1
       ├── Assistant Message
       └── Tool Calls / Tool Results
  └── Turn 2
       └── Assistant Message
```

- Message：一条 User、Assistant 或 ToolResult 消息；
- Turn：一次模型调用，以及随后属于该 Assistant Message 的工具执行；
- Agent Run：从 Prompt 开始，直到没有自动延续；
- Session：可以包含许多 Agent Run、分支和压缩记录。

把这些层混在一起，是阅读事件源码时最常见的困难。

### 13.3 两条旁路

主链之外有两条容易误判的路径：

- **Extension Command / Handled Input**：输入在 Preflight 被处理，**不进入普通模型 Run**，也不会为该输入统一产生新的 `agent_settled`；
- **User Bash**：用户输入 `!`/`!!` 走 `user_bash` 与宿主执行路径，不是模型生成的 Bash ToolCall，也不自动获得模型 Bash Tool 的 `PI_*` Session Environment。

### 13.4 三种阅读源码的方法

- **先按事件读**：搜索 `agent_start`、`message_update`、`tool_execution_end`，适合理解 UI 时间线；
- **再按数据读**：跟踪 `AgentMessage`、`AssistantMessage`、`ToolResultMessage`、`SessionEntry`，适合理解状态；
- **最后按控制流读**：从 `prompt()` 进入 Agent Loop，再追 Provider 与 Tool，适合理解「为什么还会继续下一 Turn」。

:::tip
不要一开始从整个 Monorepo 的 `index.ts` 逐文件顺序阅读。三遍阅读法比「按文件名字母顺序读完整个仓库」高效得多。
:::

## 十四、生产化与测试

一个 Agent 能回答问题，只说明主路径可用。一个桌面 Agent 能进入生产，还必须证明：不该执行的动作确实不会执行；崩溃、取消和重试不会制造第二次副作用；Session 能恢复；Skills 与 Extensions 更新后仍兼容；模型行为变化能被评估；出错时能定位到层。

### 14.1 Threat Model 先于测试用例

先列资产与攻击面：

| 资产                | 主要风险                 | 最终防线                                        |
| ----------------- | -------------------- | ------------------------------------------- |
| Workspace 文件      | 越界读写、路径穿越            | Canonical Path + Broker + Sandbox           |
| Shell             | 命令注入、继承环境            | Structured Policy + Env Allowlist + Sandbox |
| API Key           | Prompt/ToolResult 泄漏 | Auth Store + Redaction + Process Boundary   |
| Session           | 篡改、跨租户读取             | File Permission + Tenant Binding            |
| Extension         | 任意本地代码               | 来源固定、审查、隔离、最小权限                             |
| Approval          | UI 欺骗、参数替换           | Canonical Args + One-shot Capability        |
| Provider Response | Prompt Injection     | Trust Boundary + Tool Final Policy          |

### 14.2 六层安全边界

```text
Prompt / Skill rules    ← 上层规则改善行为
  → Extension Gate      ← 受控执行链中检查/转换
  → Approval            ← 用户对具体 Canonical 动作做决定
  → Final Tool Broker   ← 服务端规则重新验证
  → OS / Container Sandbox ← 限制进程实际能力
  → Audit / Recovery    ← 证据与对账
```

任何一层都不能单独代替全部安全设计。**ExtensionAPI、Project Trust、TypeScript 类型与子进程都不等于 OS Sandbox。**

### 14.3 Timeout、Abort 与 Cleanup

三者含义不同：Timeout（宿主不愿再等）、Abort（请求底层停止）、Cleanup（释放已创建资源）。

```text
timeout → abort controller → driver observes signal
  → process/fetch stops → finally cleanup
  → return explicit interrupted result
```

:::warning
只用 `Promise.race()` 会停止等待，却**不一定停止底层工作**。Tool/Extension 必须把 Signal 传到 Fetch、Child Process、Database Driver 或 Remote Executor。Pi 的取消也不是一个总开关：`AgentSession.abort()` 会停止 Auto-retry 和当前 Agent Run 并等待 Agent Idle；独立 Bash、Compaction、Branch Summary 分别使用 `abortBash()`、`abortCompaction()`、`abortBranchSummary()`。
:::

### 14.4 两层模型 Retry Budget

| 层                        | 配置/行为                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Provider Transport Retry | `retry.provider`；处理可重试传输错误，可读取 `Retry-After`                                                       |
| AgentSession Auto-retry  | `retry.enabled/maxRetries/baseDelayMs`；最终 Assistant Error 后延迟并 `continue()`，发 `auto_retry_*` Event |

**Provider/Auto-retry 与 Tool 副作用重试要分开**——不要因为 Provider 暂时失败，自动重放一个可能已写入成功的 Tool。只有 Provider Transport Retry 能读取 Response Header 并尊重 `Retry-After`。

### 14.5 Idempotency 与 Indeterminate

最危险的状态不是「失败」，而是「后端可能已经成功，但桌面进程在收到确认前崩溃」。用业务 ID 连接：`runId + toolCallId + operationId`。恢复后先查询 Audit/Backend：已成功 → 恢复为 Completed；明确未执行 → 允许重新提交；无法判断 → 标为 **Indeterminate**，要求人工确认；可补偿 → 显示补偿动作，而不是静默回滚。

:::important
**Exactly-once 不能靠 RPC Command ID 或再次发送相同 Prompt 获得。** 崩溃恢复的核心原则：Replay 只重建应用状态，**绝不重新执行 Tool**——任何回放逻辑都必须保证 Side Effect 为零。
:::

### 14.6 测试金字塔

```text
Pure Unit（schema/policy/reducer）        ← 越快、越确定、越便宜
  → Faux Agent Loop（Extension/Skill Contract）
  → Session/Recovery
  → Desktop Bridge
  → Real Provider Smoke（仅少量）          ← 越靠下越慢、越贵
```

**真实 Provider 测试只保留少量 Smoke/Eval，不能把所有回归都建立在外部模型上。** Faux Provider 用预设响应确定性产生 text / tool call / parallel tool calls / provider error / thinking / stop。

### 14.7 Skill 与 Extension 测试要点

- **Skill 三层测试**：静态结构（Frontmatter/路径/Secret）→ 触发与读取（Faux 验证显式展开与自动路径）→ 安全回归（外部内容不能覆盖 Host Policy、缺文件可见失败）；
- **Extension 12 项测试**：Factory 成败、Pre-bind 副作用、Handler 顺序与错误语义、tool\_call Block/Transform/Throw、tool\_result Patch/Redaction、Abort 传递、Reload Cleanup、New/Resume/Fork 状态重建、EventBus Unsubscribe、多 Session、冲突、版本兼容。

:::caution
**ExtensionRunner 没有内置 Handler Timeout**——一个永不 Resolve 的 Handler 会一直阻塞。测试中要验证宿主 Timeout/进程终止策略。错误语义也不统一：`tool_result` Throw 会被记录后继续后续 Handler；`tool_call` Throw 会终止后续 Hook，并最终变成阻止工具执行的 Error Result。
:::

### 14.8 Evals：测「效果」，不是测代码分支

建立 Golden Task Dataset：task、workspace fixture、allowed tools、expected invariants、forbidden actions、quality rubric、cost/latency budget。评估维度：任务完成率、Tool 选择、权限违规率、不必要写入、引用证据正确性、Turn/Token/Cost、延迟、恢复成功率。**模型输出非确定，所以比较分布和不变量，不要只 Snapshot 一段自然语言。**

### 14.9 发布门禁

| 门禁   | 必须通过                            |
| ---- | ------------------------------- |
| 安全   | 越权/注入/审批替换测试                    |
| 确定性  | Unit、Faux、Replay                |
| 生命周期 | Abort、Reload、Dispose、Crash      |
| 并发   | Parallel Tool、多 Session、多窗口     |
| 质量   | Golden Evals 不低于基线              |
| 成本   | Token/Latency 在预算内              |
| 兼容   | Pi/Node/Worker/Extension Matrix |
| 运维   | Log、Diagnostic、Canary、Rollback  |

**安全关键失败不能用「已知问题」静默放行。** 每次升级 Pi：读 changelogs → type/build checks → skill static tests → extension contract tests → session fixture replay → SDK/RPC bridge tests → golden eval comparison → canary → rollback ready。

## 十五、附录速查（A–I）

收官之前，把九份附录浓缩成一张「问题 → 附录」的速查表：

| 你想找什么                                            | 去哪个附录           |
| ------------------------------------------------ | --------------- |
| 先看哪个包、每包负责什么、阅读顺序                                | A 源码地图          |
| Model/Message/Tool/Agent/Session 类型              | B 核心类型速查        |
| Agent/Turn/Message/Tool/Session 事件时序             | C 事件时序表         |
| Skill 目录、Frontmatter、触发、测试、分发                    | D Skills 速查     |
| Extension 注册、事件、错误语义、测试清单                        | E Extensions 速查 |
| JSONL、Header、Entry、Branch、Compaction             | F Session 格式速查  |
| Provider、认证、Project Trust、RPC Worker 配置          | G 配置与环境速查       |
| 模型没回答、Tool 没执行、审批不一致、Session 恢复异常                | H 故障排查手册        |
| Abort、Compaction、Faux Provider、Indeterminate 等术语 | I 术语表           |

几个高频排查入口（来自附录 H）：

- **UI 一直显示运行中**：是否只监听 `agent_end` 漏了 `agent_settled`？是否有 Retry/Compaction？Extension Command/Handled Input 是否被错误地等待 Settled？
- **Tool 执行了两次**：RPC Response 丢失后是否重发 Prompt？Retry 是否错误包住副作用？Extension 是否动态重复 `pi.on()`？多窗口是否都认为自己是 Owner？
- **审批显示的参数和实际执行不同**：是否审批 Raw Args 而不是 Canonical Args？Capability 是否绑定 argsHash/toolCallId/sessionId？是否存在 Edit/Bash 旁路？
- **Session 恢复后历史变少**：很可能把 `get_messages` 当成完整历史——Compaction 后它是当前 Agent Context，用 `get_entries`、稳定 Entry ID、`leafId` 和 Cursor 恢复完整 Branch/UI History。

:::tip
提交 Bug 时保留最小诊断包：Pi/Node/App 版本、OS/Architecture、CWD/Trust 状态（脱敏）、Provider/Model、Extension/Skill 来源与版本、Session/Run/Tool Correlation ID、Event Timeline、最小复现、是否可用 Faux/Fixture 复现。**不要附带 Token、完整 Environment 或用户文件正文。**
:::

> **金句：** 附录的价值不在「背下来」，而在「出问题时三分钟定位到层」。

## 十六、从「读懂一个 Agent」到「造出一个 Agent」

系列三篇到此收官。回顾整条学习路线：

```text
理解Pi（一）：模型调用 → 流式事件 → Thinking/Token/错误 → 模型切换
           → 工具 → Agent Loop → 工具进度 → 并行/取消/恢复 → 危险操作审批
理解Pi（二）：四种消息 → Session/Entry/JSONL → 会话树 → Compaction
           → Steering/Follow-up → 动态 System Prompt → Skill 全生命周期
理解Pi（三）：Extension 加载/API/事件/工具/行为/高级扩展/可靠性
           → 五层集成选型 → SDK/RPC 嵌入 → 桌面状态设计 → 组装
           → 源码调用链 → 生产化与测试 → 附录速查
```

从「让模型开口说话」到「造出一个可上线的桌面 Agent」，我们一共走过了 **36 章源码课 + 9 份附录**。这条路的本质，其实是一句很朴素的话：

> **框架会过时，原理不会。** 今天你读懂的是 Pi v0.82.0，但「模型与 Provider 分离」「Agent Loop 的循环本质」「上下文的有损管理」「事件驱动的扩展边界」「进程隔离不等于权限沙箱」这些认知，换到任何 Agent 框架都成立。

几个收官前的提醒：

1. **技术结论以源码为准**——本文所有内容基于 Pi v0.82.0 基线和 pi-study.com 课程资料，API 与事件语义会随版本演进，动手前先看对应版本的源码与文档；
2. **安全是分层不是单点**——Prompt、Extension Gate、Approval、Broker、Sandbox、Audit 六层缺一不可，任何一层都不能单独代替全部安全设计；
3. **测试要分确定性层与效果层**——Unit/Faux/Replay 测确定控制流，Golden Eval 测模型效果，别把所有回归都压在真实模型上；
4. **从最小可用链路开始**——不要一上来就复制整套 36 章的所有能力。先跑通「一句对话 → 一个工具 → 一次审批 → 一个 Session」，再逐步加 Skill、Extension、RPC 和测试门禁。

:::warning
本文的源码结论以 v0.82.0 为准——如果你读到的是更新版本，请以彼时源码为准。这恰恰是学源码驱动课程的意义：**你拥有的不是一份「标准答案」，而是一套「如何验证答案」的方法。**
:::

***

**延伸阅读：**

- [Pi 桌面 Agent 源码课](https://pi-study.com/) — 36 章源码课与 9 份附录的权威来源
- [理解Pi（一）](../编程生涯理解pi一/) — 从第一句回答到 Agent Loop 与安全循环
- [理解Pi（二）](../编程生涯理解pi二/) — 记忆、上下文工程与 Skill 技能体系
- [编程生涯：Loop Engineering](../编程生涯loop-engineering/) — 循环设计：从提示词到 loop 的范式转变
- [编程生涯：Claude Code](../编程生涯claude-code/) — 终端 Agent 的分层记忆、权限模式与高级拓展
- [编程生涯：Hermes Agent](../编程生涯hermes-agent/) — Skills 自进化、Hooks/Plugins 扩展机制与多 Agent 协作

