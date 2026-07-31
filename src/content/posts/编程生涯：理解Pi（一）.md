---
title: 编程生涯：理解Pi（一）
published: 2026-07-30
description: 从 Pi 桌面 Agent 源码课出发，先让 Agent「开口说话」再让它「动手干活」：拆解 pi-ai 统一模型 API 的 Provider、Model、Context 与消息结构，走进流式事件、Thinking 展示与模型切换，最后吃透 Agent Loop 的工具调用循环、并行取消、失败恢复与危险操作审批，建立桌面 Agent 的完整底层认知。
tags: [理解Pi, 桌面Agent, Agent框架, LLM, 工具调用]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
前面几篇，我分别拆过 Hermes Agent 的自进化技能体系、Claude Code 的终端 Agent、还有 Agent 框架的横向全览——但它们大多是在讲「怎么用一个 Agent」。今天换个视角：跟着一份免费的「源码驱动」课程，钻进一个叫 **Pi** 的桌面 Agent 框架里，从第一句回答开始，把它一层层拆开、再一层层装回去。这一篇是系列第一篇，目标只有一个：让 Agent 先「开口说话」，再「动手干活」。
:::

## 一、Pi 是什么：先给整个框架画一张地图

如果只用一句话回答「Pi 是什么」，可以这样说：

> **Pi 是一套把「大模型 + 工具 + 记忆 + 扩展」装进桌面应用的 TypeScript 框架**，源码以 Monorepo（多包仓库）形式组织，GitHub 上叫 `earendil-works/pi`，本文所有源码结论都基于 **Pi v0.82.0** 这一基线。

在动任何代码之前，先认识它仓库里最关键的三个包——这也是后面整条学习路线的「路标」：

| 包                | 职责                                                  | 一句话类比                                       |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `pi-ai`           | 统一模型 API：Provider、Model、Message、流式          | 「接线员」——把各家模型服务的话翻译成统一语言     |
| `pi-agent-core`   | Agent Loop：工具循环、事件、Hook                      | 「调度员」——让模型和工具循环协作                 |
| `pi-coding-agent` | 完整产品运行时：Session、Skills、Extensions、SDK、RPC | 「前台经理」——把上面的能力组装成能落地的桌面产品 |

:::important
三个包不是并列的「三选一」，而是**一层叠一层**：`pi-ai` 管「怎么调模型」，`pi-agent-core` 管「怎么循环」，`pi-coding-agent` 管「怎么变成完整产品」。
:::

更进一步，Pi 从低到高提供了**五层集成方案**，桌面开发者可以按需选择住在哪一层：

```text
pi-ai          模型与流          → 只要一次模型生成
  ↓
pi-agent-core  Agent Loop + Tool → 需要多轮工具循环
  ↓
AgentHarness   通用 Session      → 需要会话、压缩但不要 coding-agent 约定
  ↓
Coding SDK     完整 AgentSession → 需要 Skills、Extensions、Project Trust
  ↓
RPC Mode       进程协议          → 需要 Crash 隔离、跨语言
```

这一篇我们只用到最底层的两层（`pi-ai` 和 `pi-agent-core`），把「模型调用」和「Agent 循环」先吃透。

## 二、第一句回答：最小模型调用

任何框架的第一课，都是「把一句话交给模型，再把模型的话拿回来」。Pi 的特别之处在于：这小小一步，刚好能把最底层的四个概念串起来。

### 2.1 先看清边界：桌面 UI 和 pi-ai 各管什么

桌面应用负责输入框、发送按钮和消息列表；`pi-ai` **不碰任何界面**。它接收结构化的模型请求，把不同模型服务的响应整理成统一的数据结构。

```text
桌面应用（输入与显示）
    │  提交 Context
    ▼
Models（认证与路由）
    ▼
Provider（服务方运行时）
    ▼
API implementation（协议转换）
    ▼
模型服务
```

这个边界至关重要：`pi-ai` 是**统一模型 API**，不是完整 Agent。真正负责工具循环和状态管理的是 `pi-agent-core`。刻意分开，是为了让「模型调用」和「Agent 运行时」各司其职。

### 2.2 四个核心概念

| 概念         | 是什么                       | 通俗理解                                 |
| ------------ | ---------------------------- | ---------------------------------------- |
| **Provider** | 哪一家模型服务、怎么调用它   | 「运营商」——是移动还是联通，怎么拨号     |
| **Model**    | 这次具体选哪个模型           | 「套餐」——能力、价格、上下文大小都写在这 |
| **Context**  | 这次请求交给模型的完整上下文 | 「这次对话看到的世界」                   |
| **Message**  | 上下文中的一条条消息         | 「一句句话」——但它不是普通字符串         |

### 2.3 最小代码：让它开口

下面这段代码只注册 OpenAI Provider，完成一次非流式请求：

```typescript
import { type Context, createModels } from "@earendil-works/pi-ai";
import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";

// 1. 创建「模型集合」：一个装着 Provider 的运行时容器
const models = createModels();

// 2. 注册 OpenAI Provider：告诉容器「有这么一家运营商」
models.setProvider(openaiProvider());

// 3. 从 Provider 的模型目录里，找到具体模型
const model = models.getModel("openai", "gpt-4o-mini");
if (!model) {
  throw new Error("找不到指定模型");
}

async function ask(userInput: string) {
  // 4. 构造 Context：系统提示词 + 用户消息
  const context: Context = {
    systemPrompt: "你是桌面助手，请直接、简洁地回答。",
    messages: [
      {
        role: "user",
        content: userInput,
        timestamp: Date.now(),
      },
    ],
  };

  // 5. 发起请求，拿到完整的 AssistantMessage
  const response = await models.completeSimple(model, context);

  // 6. 检查终止原因：失败/取消直接抛错
  if (response.stopReason === "error" || response.stopReason === "aborted") {
    throw new Error(response.errorMessage ?? "模型调用失败");
  }

  // 7. 从内容块数组里挑出纯文本，拼成最终回答
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}

console.log(await ask("你好，请用一句话介绍自己。"));
```

这段代码的调用路径可以压缩成五步：**建集合 → 注册 Provider → 取 Model → 拼 Context → completeSimple**。后面接入桌面 UI 时，按钮事件只需要调用 `ask(inputValue)` 并显示返回的文字。

:::tip
注意 `models` 这个变量名——它**不是某一个大模型**，而是「模型集合」。源码注释写得很直白：Provider 知道「具体怎么调用」，Models 知道「这次该交给哪个 Provider，并在调用前补齐认证」。
:::

### 2.4 Provider 到底封装了什么

源码里 `Provider` 接口只关心四件事：自己的标识和名称、自己的认证方式、自己当前可用的模型列表、自己的流式请求行为。

而 `openaiProvider()` 这个 Factory 并没有把所有逻辑重新实现一遍，它只是把四类「零件」交给 `createProvider()` 组装：

```typescript
export function openaiProvider(): Provider<"openai-responses"> {
  return createProvider({
    id: "openai", // Provider 身份
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1", // 基础地址
    auth: {
      apiKey: envApiKeyAuth(
        // 认证规则：读哪个环境变量
        "OpenAI API key",
        ["OPENAI_API_KEY"],
      ),
    },
    models: Object.values(OPENAI_MODELS), // 模型目录
    api: openAIResponsesApi(), // API 实现
  });
}
```

有一个细节值得记住：**Pi 没有把所有模型 SDK 绑成一个大入口**。核心入口保持无副作用，Provider Factory 通过子路径单独导入，API 实现通过 lazy wrapper 在第一次请求时才加载。所以只用 OpenAI 的应用，不需要主动加载 Anthropic 的 SDK。

### 2.5 Model 是一次请求的「能力说明书」

`Model` 不只是模型 ID，它是一份元数据：`api`（用哪套协议）、`provider`（属于谁）、`baseUrl`（请求地址）、`reasoning`（是否支持推理）、`input`（支持文本还是图片）、`cost`（价格）、`contextWindow`（上下文窗口）、`maxTokens`（最大输出）……这些字段能直接驱动桌面 UI：是否允许上传图片、是否显示 Thinking 选项、怎么提示上下文限制、怎么统计成本。

### 2.6 Context 和 Message：结构化，不是字符串

`Context` 源码定义只有三个字段：

```typescript
export interface Context {
  systemPrompt?: string; // 这次对话的基础规则
  messages: Message[]; // 模型在本次调用中能看到的消息
  tools?: Tool[]; // 模型在本次调用中可以选择的工具
}
```

而 `Message` 是三个类型的联合：

```typescript
export type Message =
  | UserMessage // 用户消息：字符串，或文本+图片内容块
  | AssistantMessage // 助手消息：文字 + Thinking + ToolCall 都可能出现
  | ToolResultMessage; // 工具结果：与 ToolCall 通过 toolCallId 配对
```

这就是为什么不能直接 `console.log(response.content)`——助手消息的内容是**内容块数组**，可能同时包含普通文字、Thinking 和 ToolCall，必须按 `type` 逐个判断。

:::note
`Context` 本身只是一个可传输的数据结构，`completeSimple()` 不会替你永久保存它。要连续多轮对话，得自己把回答追加回 `context.messages`，或者用更高层的 Session——那是系列第二篇的内容。
:::

### 2.7 completeSimple 的「小秘密」

名字里的 `complete` 容易让人以为 Pi 另有一条独立的非流式请求路径。源码并不是这样：

```typescript
async completeSimple(model, context, options) {
	// 非流式请求 = 流式请求 + 等它结束
	return this.streamSimple(model, context, options).result();
}
```

`completeSimple()` 调用 `streamSimple()`，拿到事件流后再 `.result()` 等待结束。这项设计让流式和非流式共享同一条核心路径——下一章改成逐字显示时，不需要换 Provider 或 Context，只需要直接消费这条事件流。

## 三、让回答逐字显示：流式事件

`completeSimple()` 适合脚本，却不适合桌面聊天界面：模型可能几秒甚至更久才结束，用户会怀疑应用是不是卡住了。第二章只改变一件事：`completeSimple()` → `streamSimple()`。

### 3.1 最小流式版本

```typescript
const stream = models.streamSimple(model, context);

// 方式一：按到达顺序读取事件
for await (const event of stream) {
  if (event.type === "text_delta") {
    process.stdout.write(event.delta);
  }
}

// 方式二：等待并取得最终的 AssistantMessage
const finalMessage = await stream.result();
context.messages.push(finalMessage);
```

注意这不是两次模型请求，而是**同一个** **`AssistantMessageEventStream`** **的两个读取角度**：一边 `for await...of` 读事件，一边 `result()` 拿最终结果。

### 3.2 流里有哪些事件

`AssistantMessageEvent` 是一个联合类型，可以分成五组：

| 阶段     | 事件                                                 | 用途                         |
| -------- | ---------------------------------------------------- | ---------------------------- |
| 整体开始 | `start`                                              | 助手消息流开始               |
| 普通文本 | `text_start` / `text_delta` / `text_end`             | 创建、追加、结束文本块       |
| Thinking | `thinking_start` / `thinking_delta` / `thinking_end` | 创建、追加、结束 Thinking 块 |
| 工具调用 | `toolcall_start` / `toolcall_delta` / `toolcall_end` | 接收工具名称和参数           |
| 整体结束 | `done` / `error`                                     | 成功结束或失败结束           |

一段纯文本响应的实际事件记录可能是：

```text
start
text_start contentIndex=0
text_delta delta="你"
text_delta delta="好"
text_end content="你好"
done reason="stop"
```

:::warning
统一协议只保证 `start` 出现在增量事件之前，**不保证它表示 HTTP 连接已建立**。如果认证、Provider 定位或 lazy 模块加载失败，`lazyStream()` 可以直接产生 `error`，中间没有 `start`。
:::

### 3.3 contentIndex 为什么重要

不同内容块的事件**不保证连续**——文本、Thinking 和 ToolCall 可能交错出现。每个增量事件都携带 `contentIndex`，它对应的是最终 `AssistantMessage.content` 数组里的哪个位置，通常也决定显示顺序。所以界面同时展示 Thinking、文字和工具时，必须按 `contentIndex` 管理多个内容块，而不是直接累加 `event.delta`。

### 3.4 EventStream 内部长什么样

`AssistantMessageEventStream` 内部维护两个数组——`queue`（已产生未消费的事件）和 `waiting`（正在等待下一条事件的消费者）：

```text
Provider（生产者）
    │  push(event)
    ▼
有人正在等待吗？
    ├─ 有 → 直接交给 waiting 中的消费者
    └─ 没有 → 暂存进 queue
```

这个「生产者—消费者」通道有个关键特性：**它是单消费队列，不是广播**。两个 `for await...of` 同时读同一个流，会分走事件，而不是各自收到完整副本。桌面应用应该只启动一个消费循环，再把归约后的状态分发给多个界面组件。

### 3.5 lazyStream：为什么调用后立刻就能拿到流

模型调用前通常要做异步工作：解析认证、延迟加载 Provider 的 API 模块、创建网络请求。但 `models.streamSimple()` 本身**立即返回** `AssistantMessageEventStream`——这是 `lazyStream()` 的功劳：它先创建外层流，再在后台进行异步初始化，内层流产生事件后逐一把事件推到外层流。

这样桌面应用不需要等待认证和模块加载完成，就可以先进入「正在连接」的状态。

### 3.6 一个更完整的界面状态归约器

把事件处理从组件里拿出来，可以减少界面代码与 Pi 类型的耦合：

```typescript
type ReplyState = {
  status: "connecting" | "streaming" | "done" | "error";
  textBlocks: Record<number, string>; // 按 contentIndex 管理多个文本块
  error?: string;
};

function reduceReply(
  state: ReplyState,
  event: AssistantMessageEvent,
): ReplyState {
  switch (event.type) {
    case "start":
      return { ...state, status: "streaming" };

    case "text_start":
      // 新内容块：先给它占个位置
      return {
        ...state,
        textBlocks: { ...state.textBlocks, [event.contentIndex]: "" },
      };

    case "text_delta":
      // 增量追加到对应内容块
      return {
        ...state,
        textBlocks: {
          ...state.textBlocks,
          [event.contentIndex]:
            (state.textBlocks[event.contentIndex] ?? "") + event.delta,
        },
      };

    case "done":
      return { ...state, status: "done" };

    case "error":
      return {
        ...state,
        status: "error",
        error: event.error.errorMessage,
      };

    default:
      return state;
  }
}
```

:::tip
为什么 Pi 用事件而不是只返回字符串？因为字符串适合表示**结果**，事件适合表示**一个仍在发生的过程**——增量、异构内容（Text/Thinking/ToolCall）、生命周期、终止状态，四个信息一次给全。
:::

## 四、展示 Thinking、Token 与错误状态

真实桌面 Agent 还需要告诉用户：模型是否正在思考、请求为什么结束、花了多少 Token 和钱、是不是被用户取消了。好消息是——这些信息不需要额外查询，它们就在同一条事件流和最终 `AssistantMessage` 里。

### 4.1 扩展界面状态

```typescript
type ReplyState = {
  phase:
    | "idle"
    | "connecting"
    | "streaming"
    | "thinking"
    | "answering"
    | "done"
    | "error"
    | "aborted";
  thinking: string; // 思考内容单独保存，不与正文混在一起
  text: string;
  usage?: Usage; // Token 与费用
  stopReason?: StopReason;
  error?: string;
};
```

### 4.2 Thinking：不是所有模型都支持所有级别

`Model.reasoning` 表示模型是否支持推理，但 Pi 在类型上区分了两个概念：

```typescript
type ThinkingLevel = "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
type ModelThinkingLevel = "off" | ThinkingLevel;
```

`ThinkingLevel` 用于请求强度（不含 `"off"`），`ModelThinkingLevel` 描述模型可选状态（含 `"off"`）。桌面应用应使用 `getSupportedThinkingLevels(model)` 查询具体可选级别，而不是假设所有推理模型都支持全部级别。

Thinking 进入事件流的方式和文本完全平行——`thinking_start`、`thinking_delta`、`thinking_end`。但「平行」不等于「Thinking 一定全部结束后才开始文本」，**不同内容块的事件可能交错**，所以界面要按内容块保存状态，不能写死一条不可打断的时间线。

:::note
最终 `AssistantMessage.content` 里，Thinking 是独立的内容块（`ThinkingContent`），有一个 `thinkingSignature` 字段——它不是给用户看的文本，而是 Provider 需要在后续请求中继续传回的签名或加密数据。桌面应用可以显示 `thinking`，但不要把 `thinkingSignature` 当普通文本展示。
:::

### 4.3 Usage：Token 数据里的三个坑

最终消息中的 `usage` 结构包含输入、输出、缓存读、缓存写、推理、总 Token 和费用。三个容易误读的字段：

1. `reasoning` 是 `output` 的**子集**，不能再把它加到 `output` 上算总量；
2. `cacheRead` / `cacheWrite` 被单独记录，**不等于**普通输入 Token；
3. `totalTokens` 直接取 Provider 报告的总量，**不要**假设它永远等于分类字段的简单求和。

费用也不是桌面应用猜出来的：基础值由模型目录价格和 Provider Usage 计算，Provider 还可能做二次调整（比如 OpenAI 的 `flex` 半价、`priority` 加倍）。

### 4.4 五种停止原因

每个最终 `AssistantMessage` 都有 `stopReason`：

| 值        | 含义                 | 桌面界面建议                     |
| --------- | -------------------- | -------------------------------- |
| `stop`    | 正常结束             | 标记回答完成                     |
| `length`  | 达到输出长度限制     | 提示回答可能不完整               |
| `toolUse` | 模型请求调用工具     | 进入工具执行阶段                 |
| `error`   | 生成过程失败         | 显示失败状态和可重试操作         |
| `aborted` | AbortSignal 取消请求 | 显示「已停止」而不是「系统失败」 |

前三种通过 `done` 事件携带，后两种通过 `error` 事件表达。

### 4.5 错误为什么进 Stream 而不是抛异常

`StreamFunction` 的源码契约写明：**请求、模型和运行时失败应该编码到返回的 Stream 里**，实现不应把这些失败直接抛到 Stream 外。错误终止必须产生 `stopReason` 为 `error` 或 `aborted` 的 `AssistantMessage`。

这意味着：

- Provider 请求失败的主要协议是 **Stream error 事件**，不是外层 `try/catch`；
- 初始化失败（找不到 Provider、没配认证、lazy 模块加载失败）也走同一条错误路径——`lazyStream()` 捕获 setup 失败，创建一个空内容的 `AssistantMessage`，推送 `error` 事件；
- 用户点击「停止」时传入 `AbortSignal`，Provider 观察到取消后通常把最终消息的 `stopReason` 设为 `aborted`，并通过 `error` 事件结束。

```typescript
const controller = new AbortController();

const stream = models.streamSimple(model, context, {
  reasoning: "medium",
  signal: controller.signal, // 把取消信号传进去
});

stopButton.onclick = () => {
  controller.abort(); // 协作式取消
};
```

:::caution
`AbortSignal` 是**协作式取消**：只有当 Provider 适配器和底层 API 真的观察并响应 Signal 时，操作才会停止。被取消的最终消息仍可能包含取消前已经生成的内容和 Usage——界面要区分 `aborted` 和普通错误，别把「用户主动停止」显示成「系统故障」。
:::

## 五、自由切换模型：Provider、模型目录与认证

用户能在 OpenAI、Anthropic、Gemini 之间切换，且切换后继续当前对话。表面看只是加个下拉框，真正实现时要回答六个问题：模型从哪来？「目录里有」和「现在能调」是不是一回事？密钥谁管？能力怎么展示？切换后旧对话还能继续吗？不同 Provider 的消息格式为什么不会打架？

### 5.1 四个层次，别混为一谈

| 层次     | 例子                                     | 在 Pi 中负责什么                            |
| -------- | ---------------------------------------- | ------------------------------------------- |
| Provider | OpenAI、Anthropic、Google                | 认证、模型目录、请求分发                    |
| API      | `openai-responses`、`anthropic-messages` | 一套具体的请求与响应协议                    |
| Model    | `gpt-*`、`claude-*`、`gemini-*`          | 能力、价格、上下文窗口等元数据              |
| Models   | 一个运行时集合                           | 注册 Provider、解析认证、查找模型、发起请求 |

这里最重要的认识是：**桌面应用选择的是** **`Model`，真正接管认证和请求发送的是拥有它的** **`Provider`**。同一个 Provider 可以根据不同模型选择不同 API 适配器——「一个 Provider 必然只有一个 API」是常见的误解。

### 5.2 getModels() 和 getAvailable() 不是一回事

模型选择器最容易犯的错误，是把 `getModels()` 的结果全部显示为「可调用」。

```typescript
const knownModels = models.getModels(); // 同步读取：各 Provider 当前已知的目录
const availableModels = await models.getAvailable(); // 检查认证后：只有已配置 Provider 的模型
```

- `getModels()` 是同步读取目录；
- `getAvailable()` 会检查 Provider 是否具备完整认证；
- Provider 还可以实现 `filterModels()`，按当前凭据进一步过滤。

所以「目录中有 Claude」不等于「当前用户可以调用 Claude」。界面最好区分两种状态：`ready`（可调用）和 `needs-auth`（需登录）。

### 5.3 认证属于 Provider，不属于输入框

API Key 和 OAuth 都是 Provider 级问题——同一个 Provider 的多个模型共享认证，`Model` 本身不保存用户秘密。

`resolveProviderAuth()` 的优先级值得单独记住：

1. 请求显式传入的 `overrides.apiKey`（且 Provider 支持 API Key）；
2. Credential Store 中已有该 Provider 的凭据；
3. 都没有，才查询环境变量、配置文件等 ambient 来源。

:::warning
一个容易忽略的细节：**已存凭据一旦存在，就「拥有」这个 Provider**。如果它类型不匹配或 OAuth 刷新失败，Pi 不会静默退回环境变量——避免用户以为在用已登录账号，实际却悄悄换成了另一份环境凭据。
:::

桌面架构上，推荐把 `Models` 和 Credential Store 留在主进程，渲染进程只持有 provider/id/状态——这是「主进程持有秘密」的桌面安全建议（不是 Pi 自动建立的进程隔离，Pi 提供的是可注入的 `CredentialStore` 抽象）。

### 5.4 为什么旧消息可以交给新 Provider

跨 Provider 切换最怕历史消息格式不兼容。Pi 的解法是：Provider API 适配器在组装网络请求前调用 `transformMessages()`，判断历史 Assistant Message 是否来自同一模型，来自别的模型时按规则转换：

- 普通文本保留为普通文本；
- 非 redacted 的 Thinking 文本转成普通文本；
- **redacted Thinking 被丢弃**（它是不透明且只对原模型有效的内容）；
- 带签名的空 Thinking 只在同模型回放时保留。

这就是「切换模型后对话还能继续」的底层保障——`Context` 没有因为模型切换被清空，变化的是这次请求使用的 `Model`。

## 六、让 Agent 不只是聊天：从工具到 Agent Loop

用户问「我的下载目录里有哪些 PDF」，模型看不到本机目录。正确的做法不是把整个文件系统交给模型，而是给它一项边界清晰的能力：需要时可以请求调用 `list_download_files`。

### 6.1 第一个工具：ToolCall 与 ToolResult

`pi-ai` 的 `Tool` 只有四部分：`name`、`description`、`parameters`（TypeBox Schema）、可选的 `constrainedSampling`。它**没有**本地 `execute()`——这是非常重要的安全边界：

```text
Tool Definition（名字、描述、参数 Schema）
    ↓ 模型看到
ToolCall（我要调用什么、参数是什么）
    ↓ 应用收到
本地执行函数（真正干活）
    ↓ 返回
ToolResultMessage
```

**模型只能产生调用请求；真正执行文件系统操作的是应用程序。** 而 `pi-agent` 的 `AgentTool` 是在 `Tool` 之上增加本地执行契约（`execute`、`label`、`prepareArguments`、`executionMode`），它发送给模型时，Provider 仍只消费继承来的定义字段。

手工完成一次工具往返的流程是：把工具定义放进 `Context.tools` → 模型返回 `ToolCall` → 应用用 `validateToolArguments()` 验证参数 → 执行本地代码 → 把 `ToolResultMessage` 放回 Context → 再请求模型组织最终回答。

:::important
一个容易被忽略的源码细节：**模型以** **`length`（输出截断）结束时，即使出现了** **`toolcall_end`，也不能执行其中任何 Tool Call**。残缺 JSON 可能恰好能解析甚至通过验证，但参数仍可能被静默截断——Agent Loop 会把这批调用全部转成错误 Tool Result，请模型重新发出完整调用。
:::

### 6.2 为什么需要 Agent Loop

上一节的 `answerWithOneToolRound()` 只能处理一轮工具调用——如果模型还要读 PDF、再查目录，就得继续手写同一套判断。把它替换成 Pi 的 `Agent` 后，核心认识只有一句话：

> **Agent 不是一次模型调用，而是「模型判断—工具执行—结果反馈」的循环。**

```typescript
import { Agent } from "@earendil-works/pi-agent-core";

const agent = new Agent({
  initialState: {
    systemPrompt: [
      "你是一个桌面助手。",
      "需要本机信息时使用工具，不要猜测。",
    ].join("\n"),
    model,
    tools: [listDownloadFilesAgentTool], // AgentTool：带本地执行函数
  },
  streamFn: models.streamSimple.bind(models), // 模型层的接缝
});

agent.subscribe((event) => {
  if (
    event.type === "message_update" &&
    event.assistantMessageEvent.type === "text_delta"
  ) {
    appendAnswerText(event.assistantMessageEvent.delta);
  }
});

await agent.prompt("我的下载目录里有哪些 PDF？");
```

`streamFn` 是 Agent 与模型层的**接缝**：`Agent` 不直接依赖某个 Provider，也不自己创建 `Models`。构造时给它一个符合 `StreamFn` 形状的函数（`models.streamSimple.bind(models)` 正好符合），Agent Loop 就只关心「怎样获得一条统一 Assistant Message Stream」，而模型目录、认证和 Provider 协议仍由 `pi-ai` 的 Models 处理。

### 6.3 Turn：Agent Loop 的基本单位

Pi 对 Turn 的定义是：

> **一个 Turn = 一次 Assistant 响应 + 由该响应触发的全部 Tool Call 与 Tool Result。**

一次用户 Prompt 可以包含**多个** Turn——不要把「Turn」理解成一整次用户任务。事件序列大致是：

```text
agent_start
  turn_start
    message_start(user) → message_end(user)
    message_start(assistant) → 流式 update → message_end(assistant)
    tool_execution_start → execute → tool_execution_end
    message_start(toolResult) → message_end(toolResult)
  turn_end
  turn_start（如果模型还要继续）
    ...
  turn_end
agent_end
```

### 6.4 runLoop 为什么有两层循环

```text
while (true) {
	// 内层循环：模型生成 + 工具执行 + 结果反馈 + Steering 注入
	while (hasMoreToolCalls || pendingMessages.length > 0) {
		const message = await streamAssistantResponse(...);
		const toolResults = await executeToolCalls(...);
		pendingMessages = await getSteeringMessages();
	}

	// 外层循环：Agent 原本要结束时，再处理 Follow-up
	const followUps = await getFollowUpMessages();
	if (followUps.length > 0) {
		pendingMessages = followUps;
		continue;
	}
	break;
}
```

内层循环负责模型、工具和 Steering，外层循环负责 Follow-up。**双层循环不是「无限调用模型」，而是表达两种不同的「继续来源」**（Steering 与 Follow-up 的区别会在系列第二篇细讲）。

### 6.5 Agent Loop 什么时候退出

退出条件不止「模型返回普通文字」：

1. **模型错误或用户取消**：`stopReason` 为 `error` / `aborted` 时立即退出，不执行其中 Tool Call；
2. **当前没有继续工作的理由**：没有 Tool Call、没有 Steering、没有 Follow-up，双层循环自然结束；
3. **`shouldStopAfterTurn()`** **请求优雅停止**：完整 Turn 结束后返回 `true`，不中断当前模型或工具；
4. **整批工具都要求** **`terminate`**：只有这一批所有最终 Tool Result 都是 `terminate: true`，才跳过自动下一次模型调用；
5. **输出达到长度限制**：没有 Tool Call 则结束；有 Tool Call 则不执行截断调用，生成错误 Tool Result 继续一轮。

:::note
`agent_end` 表示「Loop 不会再产生新事件」，但**本次运行要等** **`agent_end`** **的所有异步监听器也完成后，`prompt()`** **和** **`waitForIdle()`** **才完成**，随后才把 `isStreaming` 设回 `false`。所以在一个耗时的 `agent_end` 监听器内部读取 `agent.state.isStreaming`，仍可能得到 `true`——这符合源码生命周期，不是状态更新遗漏。
:::

## 七、在界面中显示工具执行过程

Agent 能自动调用工具了，但用户只看到最终文字。真实桌面 Agent 还要回答：当前是模型在生成，还是工具在执行？调用了哪个工具？参数是什么？有没有进度？成功还是失败？多个工具同时运行时谁先完成？

Pi 不要求 UI 读 Agent Loop 内部变量，而是通过统一 `AgentEvent` 暴露运行过程。

### 7.1 Agent Event 的三条时间线

`AgentEvent` 可以按用途分成三组：

| 事件组                | 事件                                               | 核心含义                       |
| --------------------- | -------------------------------------------------- | ------------------------------ |
| Agent / Turn 生命周期 | `agent_start` / `agent_end`                        | 本次运行开始/结束              |
| <br />                | `turn_start` / `turn_end`                          | 新的 Assistant Turn 开始/完成  |
| 消息生命周期          | `message_start` / `message_update` / `message_end` | 消息开始、流式更新、完成       |
| 工具执行生命周期      | `tool_execution_start` / `update` / `end`          | 工具进入准备、上报进度、最终化 |

消息流和工具执行流有关联，但**不是同一条流**——`message_update` 不会承载工具执行进度。

### 7.2 一次工具调用的精确事件顺序

```text
AssistantMessage with ToolCall
  → message_end(assistant)
  → tool_execution_start（查找工具、预处理、验证、beforeToolCall 之前）
  → execute(...) → onUpdate(partial) → tool_execution_update
  → 最终结果 → afterToolCall
  → tool_execution_end
  → message_start(toolResult) → message_end(toolResult)
  → turn_end
```

三个关键边界：

1. Assistant `message_end` 先于工具准备；
2. `tool_execution_end` 在最终 ToolResult Message 之前；
3. `turn_end` 在本轮所有 Tool Result Message 之后。

:::warning
`tool_execution_start` **还不代表通过验证**。源码在查找工具、参数预处理和 Schema 验证之前就发出这个事件，事件里的 `args` 是模型产生的**原始参数**——没经过 `prepareArguments`、没经过 `validateToolArguments`、甚至可能对应不存在的工具。UI 可以把它作为受限预览，但绝不能当成已验证业务数据。更准确的 UI 状态是 `"preparing"`，不是「执行成功启动」。
:::

### 7.3 让工具主动上报进度

`AgentTool.execute()` 的第四个参数是 `onUpdate`——工具可以在执行中主动发送「当前部分结果」，每次回调形成 `tool_execution_update` 事件：

```typescript
async execute(_id, args, signal, onUpdate) {
	onUpdate?.({
		content: [{ type: "text", text: "正在扫描下载目录…" }],
		details: { phase: "scanning", scanned: 0 },
	});

	const files = await scanFiles(args, signal, (scanned) => {
		onUpdate?.({
			content: [{ type: "text", text: `已检查 ${scanned} 个文件` }],
			details: { phase: "scanning", scanned },
		});
	});

	return {
		content: [{ type: "text", text: JSON.stringify({ files }) }],
		details: { phase: "done", files },
	};
}
```

`partialResult` 是 `AgentToolResult`，不是字符串 delta——工具每次发一份完整的「当前部分结果」。`onUpdate` 只在当前 `execute()` Promise 尚未结束时有效，Promise resolve/reject 后，再调用旧回调会被忽略（防止工具保存旧回调后，在下一次任务中意外污染 UI）。

### 7.4 UI 必须按 toolCallId 管理，不能靠数组位置

默认 `toolExecution` 是 `"parallel"`（并行）。并行模式下：

- Tool Call 按 Assistant Message 源顺序做 start 和 preflight；
- 允许执行的工具**并发**运行；
- `tool_execution_end` 按实际完成顺序发出；
- ToolResult Message 和 `turn_end.toolResults` 最终**仍按源顺序**发出。

例如第二个工具先完成：

```text
start: tool-1
start: tool-2
end: tool-2     ← 完成顺序：2 先完
end: tool-1
ToolResultMessage: tool-1   ← 但消息顺序：仍按源顺序
ToolResultMessage: tool-2
```

所以 UI 必须使用 `toolCallId` 更新记录，**不能假设「第一个 start 对应第一个 end」**。

## 八、并行工具、取消与失败恢复

桌面 Agent 现在能展示工具进度。新的实际需求是：让 Agent 同时检查多个文件；随时可以停止；一个文件读取失败时其他结果仍然保留。这会带来四个新问题：顺序还是并行？怎么取消？工具抛错怎么办？执行前后能不能挂钩子？

### 8.1 默认不是顺序执行

`Agent` 的默认值是 `"parallel"`。如果一条 Assistant Message 同时请求读取三个文件，默认行为是并发执行。但并行不是「拿到 Tool Call 后立刻全部无序执行」——源码分成两个阶段：**先按源顺序逐个发出 start 并完成 preflight，再让所有通过 preflight 的调用并发执行**。

全局模式与单工具模式：

```typescript
// 全局策略：默认 parallel，也可以设成 sequential
const agent = new Agent({
	initialState: { model, tools },
	streamFn: models.streamSimple.bind(models),
	toolExecution: "parallel",
});

// 单个工具也可以声明自己的执行模式
const editFileTool: AgentTool<typeof EditFileParameters, EditDetails> = {
	name: "edit_file",
	label: "编辑文件",
	parameters: EditFileParameters,
	executionMode: "sequential", // 这个工具要求顺序执行
	async execute(...) { /* ... */ },
};
```

只要当前批次中**任意** Tool Call 对应的工具声明了 `"sequential"`，整批就顺序执行。适合强制顺序的工具：修改同一份文件、依赖共享事务、操作前后有业务含义、底层资源不支持并发访问。

### 8.2 Stop 按钮调用什么

`Agent` 为每次运行创建一个 `AbortController`。停止按钮调用 `agent.abort()`——它只做 `this.activeRun?.abortController.abort()`。同一个 Signal 会传给：`streamFn` 请求、Agent Event 订阅者、`transformContext`、`beforeToolCall`、`AgentTool.execute`、`afterToolCall`、`prepareNextTurn`。

:::caution
取消是**协作式**的。`AbortSignal` 不会强制杀死任意 JavaScript Promise——工具必须主动观察 `signal?.aborted`，并在底层 API 接受 Signal 时继续传下去（如 `await fetch(url, { signal })`）。如果工具忽略 Signal，Agent 不能凭空终止它。UI 也不应在点击停止时立刻把全部卡片标成「已取消」，更准确的状态是 `cancel-requested`，等每个 `tool_execution_end` 到达后再落定结果。
:::

### 8.3 单个工具抛错会发生什么

`executePreparedToolCall()` 捕获工具异常，转换成错误结果——单工具异常通常不会直接让 Agent Loop reject：

```text
tool.execute throws
    ↓
错误 AgentToolResult
    ↓
afterToolCall 可覆盖结果（content/details/usage/isError/terminate）
    ↓
tool_execution_end(isError: true)
    ↓
最终 ToolResultMessage(isError: true)
```

注意：`afterToolCall` 可以覆盖 `isError` 甚至把它改成 `false`，所以「工具抛错」只说明进入 Hook 前是 error outcome，最终状态不一定。错误消息默认来自 `error.message`——工具应先记录本地诊断，再抛出可安全发送给模型的简洁错误。

### 8.4 两种 Hook 与优雅停止

**`beforeToolCall`**：执行前拦截，运行在工具已找到、参数已通过 Schema 验证、execute 尚未开始的时候。返回 `{ block: true }` 会生成错误 Tool Result。

```typescript
agent.beforeToolCall = async ({ toolCall, args }, signal) => {
  if (signal?.aborted) {
    return { block: true, reason: "操作已取消" };
  }
  if (
    toolCall.name === "read_many_files" &&
    (args as { paths: string[] }).paths.length > 20
  ) {
    return { block: true, reason: "一次最多读取 20 个文件" };
  }
};
```

:::important
一个容易忽略的源码事实：**Hook 收到的是验证后的可变对象。如果 Hook 原地修改** **`args`，Loop 不会再次验证，修改后的值会直接进入 execute**。所以安全 Hook 应把参数当只读；如确需转换，优先用 `prepareArguments`，并确保返回值接受后续 Schema 验证。
:::

**`afterToolCall`**：对已执行工具的最终结果做后处理，是**逐字段替换，不是深度合并**。immediate outcome（工具不存在、验证失败、before 阻止、执行前取消）不会运行它。

**`shouldStopAfterTurn`**：在完整 Turn 结束后优雅停止——它不会取消当前 Provider Stream、不会中止正在运行的工具、不会修改 stopReason，适合「完成这一轮后暂停」，不是紧急停止按钮。

### 8.5 失败恢复的推荐分层

```text
发生失败 → 属于哪一层？
  ├─ Provider 请求 → Provider/SDK 有限 Retry，或显示模型错误
  ├─ 可识别瞬时工具错误 → 工具内部有限 Retry
  ├─ 参数/权限/业务错误 → 错误 Tool Result 给模型，模型决定修正/解释/退出
  └─ 用户停止 → 传播 AbortSignal
```

:::tip
只重试明确瞬时且**幂等**的操作；写入、支付、发送消息等有副作用的操作不能盲目重试；每次重试都观察 AbortSignal；对模型保留真实的成功/失败语义。
:::

## 九、给危险操作增加用户确认：权限与信任

读取文件可以直接执行；删除文件、修改敏感配置或运行高风险命令前，必须先问用户。Pi 对这个问题给出的最重要结论先放在前面：

> **Pi 默认没有「每次危险操作都弹窗」的权限系统。已注册的工具在参数验证通过后会执行，除非** **`beforeToolCall`** **Hook 或 coding-agent 的** **`tool_call`** **扩展事件明确阻止它。**

### 9.1 五层安全边界

| 层次            | 回答的问题             | Pi 默认行为                       |
| --------------- | ---------------------- | --------------------------------- |
| 工具注册        | Agent 有没有这项能力   | 只有注册到 `tools` 的工具可调用   |
| Schema          | 参数结构是否合法       | 执行前验证                        |
| Permission Gate | 这一次调用是否允许     | 默认允许；Hook 可阻止             |
| Project Trust   | 项目本地资源是否可加载 | 按信任决策加载或跳过              |
| 沙箱/容器       | 进程实际能访问什么     | Pi 没有内置沙箱，继承当前用户权限 |

这五层**不能互相替代**：Project Trust 不是文件权限，确认框也不是沙箱。

### 9.2 在 beforeToolCall 里接入桌面确认框

```typescript
agent.beforeToolCall = async ({ toolCall, args }, signal) => {
  // 第一步：把工具调用分成稳定、可测试的风险等级
  const decision = classifyToolCall(
    toolCall.name,
    args as Record<string, unknown>,
  );

  if (decision.level === "allow") return; // 只读操作，直接放行
  if (decision.level === "deny") {
    return { block: true, reason: decision.reason }; // 未知工具，默认拒绝
  }

  // confirm 级别：弹出桌面确认框，等待用户决定
  try {
    const answer = await approvalDialog.confirm({
      title: "允许 Agent 执行此操作吗？",
      description: decision.reason,
      toolName: toolCall.name,
      resource: decision.resource,
      signal,
    });
    if (answer === "allow-once") return;
    return { block: true, reason: "用户拒绝了此次操作" };
  } catch {
    // fail closed：审批界面不可用 → 阻止
    return { block: true, reason: "审批界面不可用，操作已阻止" };
  }
};
```

这里采用 **fail closed（故障即拒绝）**：用户拒绝、关闭窗口、超时、UI 通道断开、Agent 被取消——全部阻止。不要在确认框出现前启动工具，也不要先做一半再询问。

### 9.3 路径保护：别用 startsWith

`target.startsWith(root)` 是经典陷阱——`/workspace-copy` 也以 `/workspace` 开头。正确的做法是把路径规范化后再判断包含关系：

```typescript
import { isAbsolute, relative, resolve, sep } from "node:path";

function isInside(root: string, target: string): boolean {
  const relation = relative(root, target);
  return (
    relation === "" ||
    (relation !== ".." &&
      !relation.startsWith(`..${sep}`) &&
      !isAbsolute(relation))
  );
}

function resolveInputPath(cwd: string, inputPath: string): string {
  return resolve(cwd, inputPath);
}
```

对已存在的目标还应使用 `realpath` 解析符号链接；对将要创建的文件，先规范化其最近的已存在父目录再拼接剩余路径。

### 9.4 Project Trust 到底信任什么

Project Trust 解决的是另一个问题：进入一个仓库时，**是否允许这个仓库自动改变 Pi 的设置、能力和提示词**。它检查的是受保护项目资源——`.pi/settings.json`、`.pi/extensions`、`.pi/skills`、`.pi/prompts`、`.pi/SYSTEM.md`、`.pi/APPEND_SYSTEM.md` 等。只有空的 `.pi` 目录不触发信任要求。

:::warning
项目被标记为 `untrusted` **不会**限制工具执行权限——`AGENTS.md` / `CLAUDE.md` 这类 Context 文件默认仍会加载，已注册工具仍拥有进程本来的文件和系统权限。**Project Trust 防止仓库在批准前装载可执行扩展和受保护配置，但它不能消除 Prompt Injection，也不会自动限制 Shell。**
:::

### 9.5 Pi 的默认权限模型

`packages/coding-agent/docs/security.md` 对默认边界写得很直接：

- Pi 以启动它的用户账号权限运行；
- 内置 read、write、edit、bash 等工具使用 Pi 进程的权限；
- 扩展是同进程 TypeScript 模块，也拥有相同权限；
- Pi 没有内置沙箱；
- 「没有权限弹窗」是 coding-agent 的默认使用方式。

所以默认链路是：**模型请求 → 工具已注册 → 参数有效 → 没有 Hook 阻止 → 以 Pi 进程权限执行**。「当前工作目录」不是系统安全边界，「项目未信任」也不是文件系统隔离。

把权限 Hook 和沙箱的区别记牢：

| 机制                        | 优点                           | 局限                                     |
| --------------------------- | ------------------------------ | ---------------------------------------- |
| beforeToolCall / tool\_call | 能理解工具语义，适合审批与审计 | 错误策略、恶意扩展或未覆盖的工具可能绕过 |
| Protected Paths 策略        | 能限制具体资源                 | 必须正确处理路径、链接和所有写入通道     |
| Project Trust               | 阻止仓库静默加载受保护资源     | 不限制执行期工具权限                     |
| 容器 / VM / OS 沙箱         | 由系统强制文件、进程、网络边界 | 需要正确配置挂载、凭据和网络             |

**权限 Hook 是「应用决定」，沙箱是「系统强制」。**

## 十、从第一句回答到安全循环：这一篇的路线图

回顾这一路，我们从「让模型开口说话」走到了「让 Agent 安全地动手干活」：

```text
第 01-02 章：Provider / Model / Context / Message + 流式事件   → 开口说话
第 03 章：Thinking / Token / 错误状态                          → 看清内部
第 04 章：切换模型、认证、跨 Provider 兼容                     → 不被锁定
第 05-06 章：工具 + Agent Loop                                 → 动手干活
第 07-08 章：工具进度、并行、取消、失败恢复                    → 干得清楚
第 09 章：危险操作审批、Project Trust、沙箱边界                → 干得安全
```

几个值得带走的认知：

1. **`pi-ai`** **是统一模型 API，不是完整 Agent**——模型调用和 Agent 运行时被刻意分开；
2. **事件是过程，字符串是结果**——流式事件同时给出增量、异构内容、生命周期和终止状态；
3. **Agent 的本质是「模型判断—工具执行—结果反馈」的循环**，Turn 是它的基本单位；
4. **认证属于 Provider，模型切换是整条链的协同**——`getModels()` 不等于 `getAvailable()`；
5. **默认没有权限弹窗**——`beforeToolCall` 是 Permission Gate，fail closed 是底线，沙箱是最终防线。

这一篇只用了 Pi 最底层的两层。接下来，Agent 会说话、会干活了，但「它记得我吗？能变得更专业吗？」——多轮对话到底保存了什么、会话为什么是一棵树、对话太长怎么办、System Prompt 为什么不是一段固定文字、Skill 怎么让 Agent 拥有专业能力，都留给系列的下一篇。

:::caution
本文所有技术结论均以 **Pi v0.82.0** 源码基线（commit 518855d）和 pi-study.com 课程资料为依据。模型目录、API 名称会随版本演进变化——示例代码中的模型 ID 需要换成当前 Provider 模型目录中实际存在的模型。想验证源码细节，可直接去 `packages/ai/src/` 和 `packages/agent/src/` 里对照阅读。
:::

---

**延伸阅读：**

- [Pi 桌面 Agent 源码课](https://pi-study.com/) — 36 章源码课与 9 份附录的权威来源
- [理解Pi（二）](../编程生涯理解pi二/) — 记忆、上下文工程与 Skill 技能体系
- [理解Pi（三）](../编程生涯理解pi三/) — Extension、嵌入桌面与生产化
- [编程生涯：Loop Engineering](../编程生涯loop-engineering/) — 循环工程：当设计 loop 成为新的核心能力
- [编程生涯：Claude Code](../编程生涯claude-code/) — 终端原生 AI 编程 Agent 的 LLM Loop 与权限模式
- [编程生涯：Hermes Agent](../编程生涯hermes-agent/) — 开源 Agent 框架的 Skills 自进化与多 Agent 协作
