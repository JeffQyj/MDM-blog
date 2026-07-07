---
title: 编程生涯：Hermes Agent
published: 2026-07-08
description: 深入拆解 Nous Research 开源的 Hermes Agent 框架：自进化能力、多平台 Gateway、Skills 技能体系、Curator 自维护、Hooks 与 Plugins 扩展机制、Kanban 多 Agent 协作，并以「AI 驱动技术博客自动发布系统」完整实战串联 25+ 功能模块。
tags: [Hermes Agent, AI Agent, MCP协议, 自进化, 多Agent协作]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
上个月我在「[编程生涯：Agent原理及其开发框架全览](../编程生涯agent原理及其开发框架全览/)」里把 2026 年 Agent 生态的「十大框架」扒了一遍，但那一篇讲的是「通用能力的横向对比」。今天这篇不一样——我们要钻进一个具体的框架里，把它从入门到实战的整条链路走通。它就是 Hermes Agent。
:::

## 一、为什么又来聊 Agent

把时间拨回到 2026 年初，整个 AI 圈子最显眼的趋势只有一个：Agent。

Cursor 会自己改代码，Manus 会自己查资料做 PPT，Claude Code 在你终端里直接动 shell，连各种微信公众号都开始接 Agent 自动出文。一夜之间，Agent 成了所有产品经理嘴里的「必选项」。

但热闹归热闹，真要把一个 Agent 用到生产环境，你会发现「通用能力」和「真实业务」之间隔着一道巨大的鸿沟：

- **模型锁定**——你把 Agent 跑在 OpenAI 上，发现 OpenAI 涨价了，或者你想换成本更低的国产模型，对不起，整个 Agent 框架要重写；
- **平台单一**——你在终端里用得很爽，但老板说「这个能力必须支持飞书消息群」，又得从头开发一套适配层；
- **知识丢失**——今天 Agent 帮用户完成了一件很复杂的事，沉淀了什么？没有。一切推倒重来；
- **能力不成长**——你用了一年的 Agent 跟刚装上的 Agent 一样，因为它不记得你之前踩过的坑、解决过的问题；
- **多 Agent 难协作**——想搞「一个负责研究、一个负责写作、一个负责审核」的分工？绝大多数框架要么不支持，要么拼起来一团乱麻。

带着这些痛点去找答案，你会发现市面上能打的框架其实不多，那究竟选择哪个呢？

**Hermes Agent** ——一个由 Nous Research 在 2023 年发起、目前 GitHub 上 210K+ Stars 的开源 Agent 框架。它的五大差异化亮点（自进化、多平台、模型无锁定、Profile 隔离、Curator 自维护）几乎正好戳中上面每一个痛点。

接下来，我就把它从「是什么」到「怎么用」一次性讲透。

## 二、Hermes Agent 是什么：来自 Nous Research 的开源答案

讲任何框架之前，我们先搞清楚它「从哪儿来、是谁做的、想解决什么问题」。

### 2.1 开发方背景：Nous Research

**Nous Research** 是一家 2023 年成立于美国纽约州的 AI 研究实验室，最初由 Jeffrey Quesnelle（CEO）、Karan Malhotra、Teknium、Shivani Mitra 四人在 Discord 上的开源 AI 研究社区中结识并组成团队。2025 年 4 月，公司完成 Paradigm 领投的 5000 万美元 A 轮融资，估值达到 10 亿美元。它名字里的 **"Nous"** 源自古希腊哲学概念 νοῦς（nous），意为「直觉/心智」——这个名字精准传达了团队的使命：创造真正理解人类意图、服务于个体自由的智能。

官方的宣言很直接：

> "超级智能应当服务于最大化的个体自主性和精神自由。它的发展不能只掌握在少数公司和寡头手中。"

基于这个使命，Nous Research 提出了自己的三大核心理念：

| 核心理念                    | 含义                                                                | 行业对标                       |
| ----------------------- | ----------------------------------------------------------------- | -------------------------- |
| **开源（Open Source）**     | 所有模型、代码、数据集完全公开，社区可自由使用、修改、分发                                     | 区别于 OpenAI、Anthropic 的闭源路线 |
| **无限制（Unrestricted）**   | 在 Nous 自研的 RefusalBench 基准上，Hermes 4 405B 拒绝率仅约 43%（即 57.1% 的回答率） | 区别于被「过度安全」束缚的商业模型          |
| **人类对齐（Human-Aligned）** | 核心理念是让模型忠实执行用户意图，而非通过「拒绝回答」来逃避决策                                  | 区别于「安全对齐」的伪善做法             |

:::note
很多人会混淆「无限制」和「无底线」。Nous Research 的「无限制」是相对商业模型「过度拒绝」而言的——它追求的是「忠实执行用户合理意图」，而不是鼓励模型输出有害内容。理解这一点很关键，否则容易对它的产品理念产生误读。
:::

Hermes Agent 正是 Nous Research 在「开源 Agent」方向上的旗舰项目。

### 2.2 核心量化指标

用数字说话，最能体现一个框架的「分量」。下面是 Hermes Agent 截至 2026 年 7 月的核心数据：

| 指标               | 数值       | 说明                                                                        |
| ---------------- | -------- | ------------------------------------------------------------------------- |
| **GitHub Stars** | 210K+    | 社区热度与行业认可度。2026-02-25 v0.1 发布，4 月 28 日突破 100K，最新 star-history 数据显示已破 210K |
| **消息平台**         | 25+      | 官方 Messaging Gateway 文档明确列出的适配器数                                          |
| **模型提供商**        | 20+      | 主流商用 + 开源 + 本地部署全覆盖                                                       |
| **可用模型**         | 400+     | Nous Portal 现已提供 400+ 模型                                                  |
| **内置工具**         | 60+      | 覆盖搜索、浏览器、文件、终端、多模态、Agent 编排、记忆等                                           |
| **终端后端**         | 6 个      | local / Docker / SSH / Daytona / Singularity / Modal                      |
| **开源许可证**        | MIT      | 完全开源、可商用、无 Copyleft 传染                                                    |
| **首轮公开融资**       | $50M A 轮 | 2025-04 关闭，Paradigm 领投，估值 10 亿美元                                          |

这组数据意味着：如果你在选型时考虑「社区活跃度」「避免厂商锁定」「跨平台覆盖」「协议宽松」这四个维度，Hermes Agent 几乎都站在第一梯队。

### 2.3 五大核心差异化亮点

光有数据不够，我们来看看它具体「牛在哪」。

**1. 技能自进化**

> 普通 Agent 解决完一个复杂问题，沉淀了什么？——零。Hermes Agent 解决完一个复杂问题，会把可复用的流程自动保存为「Skill 文件」。Skill 采用透明、人类可读可编辑的 Markdown 格式，越用越丰富。

这相当于给 Agent 装了一个「程序记忆」——它每次解决一个独特问题，下次遇到类似场景就能直接调用上次的解法。

**2. 跨会话持久记忆**

普通 Agent 是「金鱼脑」——每次对话从零开始。Hermes Agent 内置跨会话记忆机制，可以建立用户画像、记住历史偏好、保留关键业务信息，实现「用得越多越贴合用户」。

**3. 多平台 Gateway**

同一个 Agent 实例，可以通过 Gateway 能力同时跑在 **25+ 消息平台**上（终端、桌面应用、Telegram、Discord、Slack、微信、飞书、企业微信、钉钉、QQ、Microsoft Teams、LINE、WhatsApp、Signal、iMessage、Google Chat、Mattermost、Matrix、Email、SMS……），且所有平台共享完整的工具访问权限。

**4. Profile 多实例**

支持运行多个互相隔离的 Hermes 实例，每个实例拥有独立的配置、会话、技能和记忆。这相当于在「一台服务器上开多个专属 Agent」——一个负责编程、一个负责生活、一个负责运维，互不干扰。

**5. 自维护 Curator**

Agent 自动沉淀的技能如果不管控，会越积越多、越来越乱。Hermes 内置 Curator 机制，后台自动审查、合并重复技能、归档过时内容，防止技能库无限膨胀、污染上下文。

:::important
这五大亮点是 Hermes Agent 区别于普通 Agent 框架的核心价值。后面讲到的所有功能模块——Skills、Curator、Hooks、Plugins、Cron、Kanban——都是围绕这五个核心亮点展开的工程实现。理解了这五点，你就抓住了 Hermes Agent 的「魂」。
:::

### 2.4 与同类 Agent 框架对比

横向对比一下，能让我们看清 Hermes Agent 的相对位置。以同样主打「开源 + 自部署」的 OpenClaw（龙虾）为例：

| 对比维度             | Hermes Agent             | OpenClaw（龙虾） |
| ---------------- | ------------------------ | ------------ |
| **技能存储**         | 透明、人类可读的 SKILL.md 文件     | 不透明格式        |
| **自我改进**         | 内置 Curator 自动维护技能库       | 无            |
| **Provider 灵活性** | 20+ 提供商，400+ 模型          | 较少           |
| **Windows 支持**   | v0.14+ 原生支持              | 有限           |
| **桌面应用**         | v0.16+ 官方 Hermes Desktop | 无            |
| **开源许可证**        | MIT 协议                   | —            |

可以看出，Hermes Agent 在「开放性」「生态完善度」「跨平台支持」「自维护能力」四个维度上都明显占优。这也是为什么这篇专栏把它选作「深入拆解」的样本。

## 三、入门篇：配置目录与基础架构

认识了它是谁之后，我们钻进它内部看看到底是怎么组织的。

### 3.1 \~/.hermes/ 目录结构

Hermes Agent 的所有配置、数据、日志都集中存放在用户目录下的 `~/.hermes/` 文件夹里。结构清晰分层，便于手动修改、调试与备份。

```text
~/.hermes/
├── config.yaml          # 主配置文件：管理模型、终端、TTS、压缩等核心参数
├── .env                 # 环境变量文件：存放 API 密钥等机密敏感信息
├── auth.json            # OAuth 凭证文件：存储 Nous Portal 等第三方授权凭证
├── SOUL.md              # 主 Agent 身份/人格文件，内容会拼入系统提示词开头
├── memories/            # 持久化记忆目录：存放 MEMORY.md、USER.md 等记忆文件
├── skills/              # 技能目录：存放系统内置与 Agent 自动生成的所有 Skill 文件
├── cron/                # 定时任务目录：存放 Cron 定时任务配置
├── sessions/            # 会话目录：存放历史会话数据
└── logs/                # 日志目录：包含 errors.log、gateway.log，密钥会自动脱敏
```

:::caution
`.env` 文件包含敏感 API 密钥，请勿公开分享、提交到公开代码仓库。`SOUL.md` 是定义 Agent 人格、身份、核心行为准则的核心文件，修改后会直接影响 Agent 的回复风格与行为逻辑。日志文件默认自动脱敏处理，不会泄露 API 密钥等敏感信息——但你自己手动添加的自定义日志内容不在保护范围内。
:::

这种「全量集中在一个目录」的设计哲学很务实：迁移机器、备份恢复、调试排查，都只需要复制一个文件夹。这比某些「配置散落在 /etc/、/var/、\~/.config/、\~/.cache/、系统服务」的设计要友好得多。

### 3.2 Provider 体系：20+ 提供商 400+ 模型一键切换

如果你还记得「[编程生涯：AI大模型认知之旅](../编程生涯ai大模型认知之旅/)」里讲过的大模型生态——GPT、Claude、Gemini、DeepSeek、文心、通义、星火……每家厂商都有自己的 API、自己的计费、自己的 SDK。每次换一家都要重写一遍调用代码，是工程上的灾难。

Hermes Agent 的 Provider 体系就是为了终结这个灾难：它把「怎么调模型」这件事封装成统一的接口，背后对接 20+ 提供商、400+ 模型，**你要做的只是改一行配置**。

```yaml
# ~/.hermes/config.yaml 的 Provider 片段
providers:
  openai:
    type: openai
    api_key: ${OPENAI_API_KEY} # 从 .env 注入密钥
    default_model: gpt-4o

  anthropic:
    type: anthropic
    api_key: ${ANTHROPIC_API_KEY}
    default_model: claude-3-5-sonnet

  deepseek:
    type: openai # 兼容 OpenAI 协议
    base_url: https://api.deepseek.com
    api_key: ${DEEPSEEK_API_KEY}
    default_model: deepseek-chat

  ollama:
    type: ollama # 本地大模型
    base_url: http://localhost:11434
    default_model: llama3.2
```

:::tip
你看懂上面这段 YAML 的妙处了吗？`deepseek` 和 `ollama` 都不是「Hermes 原生支持的厂商」，而是通过协议兼容的方式接入。DeepSeek 走 OpenAI 兼容协议，Ollama 也提供了 OpenAI 兼容端点——所以你不用改任何框架代码，只改 `base_url` 就能完成切换。这就是「不被模型锁定」的工程级实现。
:::

更关键的是，所有这些切换对上层 Agent 代码完全透明。今天你想用 DeepSeek 跑大规模数据标注，明天想用 Claude 跑长文写作，后天想用本地 Ollama 处理敏感数据——**改完配置，重启即生效**。这就是「Provider 体系」的核心价值。

## 四、能力篇：会话、工具集与 MCP

讲完「它是谁、怎么组织」，接下来看「它能干什么」。这一篇聚焦 Hermes Agent 的三大基础能力：会话管理、内置工具集、MCP 协议。

### 4.1 Session 会话管理

Hermes Agent 会自动把每一次对话保存为一个独立的 session，原生支持对话恢复、跨 session 全文搜索、完整的对话历史管理。无论你是从 CLI 发的，还是从 Telegram、Discord、Slack、飞书、微信等 23+ 消息平台发的，所有对话都以「完整消息历史」的形式持久化到同一个地方。

存储介质是 **SQLite 数据库**，文件路径是 `~/.hermes/state.db`，内置 FTS5 全文检索引擎：

```text
┌────────────────────── state.db (SQLite) ──────────────────────┐
│                                                               │
│  sessions 表                                                  │
│  ├── id                主键                                    │
│  ├── source_platform   来源平台（cli/telegram/discord/...）      │
│  ├── user_id           用户标识                                 │
│  ├── title             人类可读的会话标题                         │
│  ├── model             当前使用的模型                            │
│  ├── system_prompt     系统提示词快照                            │
│  ├── started_at        会话开始时间                              │
│  ├── ended_at          会话结束时间                              │
│  └── parent_session_id 父会话 ID（压缩触发的会话分割时使用）         │
│                                                                │
│  messages 表                                                   │
│  ├── id                主键                                     │
│  ├── session_id        关联 sessions.id                         │
│  ├── role              角色（user / assistant / tool）           │
│  ├── content           消息内容                                  │
│  ├── tool_calls        工具调用指令（JSON）                       │
│  ├── tool_results      工具返回结果（JSON）                       │
│  └── token_count       Token 消耗                               │
│                                                                │
│  FTS5 全文索引（自动维护）                                        │
│  └── 跨 session 毫秒级搜索任何历史消息                             │
└────────────────────────────────────────────────────────────────┘
```

:::important
父 session ID 机制是生产环境的关键设计。当一个会话太长触发上下文压缩时，Hermes 会把当前会话「分割」成新的子会话，但通过 `parent_session_id` 关联到原始会话。这样即使你一个月后想找回某次对话的完整链路，也能从父会话开始往下一层层追溯。**这是「可追溯性」的工程级保障。**
:::

### 4.2 九大类内置工具集

光有会话管理还不够。Agent 真正区别于普通聊天模型的核心是「工具调用」——它能「摸到」外部世界。Hermes Agent 内置了 **60+ 工具**，按职责划分为九大类，覆盖从信息获取到任务编排的全场景：

| 分类           | 工具示例                                                                                | 功能描述                                                      |
| ------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Web**      | `web_search`、`web_extract`                                                          | 搜索网页并提取页面内容，实现联网信息获取                                      |
| **X 搜索**     | `x_search`                                                                          | 通过 xAI 内置的 x\_search Responses 工具搜索 X 帖子和话题；需 xAI 凭据，默认关闭 |
| **终端与文件**    | `terminal`、`process`、`read_file`、`patch`                                            | 执行系统命令、操作本地文件，实现本地环境自动化                                   |
| **浏览器**      | `browser_navigate`、`browser_snapshot`、`browser_vision`                              | 支持文本和视觉的交互式浏览器自动化                                         |
| **多模态**      | `vision_analyze`、`image_generate`、`video_generate`、`video_analyze`、`text_to_speech` | 多模态分析与生成；视频功能需手动启用                                        |
| **Agent 编排** | `todo`、`clarify`、`execute_code`、`delegate_task`                                     | 任务规划、需求澄清、代码执行、子 Agent 任务委派                               |
| **记忆与召回**    | `memory`、`session_search`                                                           | 持久化记忆读写、跨会话历史搜索                                           |
| **自动化与投递**   | `cronjob`、`send_message`                                                            | 定时任务全生命周期管理、出站消息主动投递                                      |
| **集成**       | `ha_*`、MCP server 工具                                                                | 对接 Home Assistant 智能家居、MCP 协议第三方服务                        |

:::caution
部分工具（如 X 搜索、视频生成）默认关闭，需要通过 `hermes tools` 命令或启动参数 `--toolsets` 显式启用。这是因为这些工具会消耗额外 Token、依赖第三方 API、或者需要特殊权限。**生产环境部署时，记得按需启用，避免无意义的安全暴露。**
:::

工具调用是 Agent 的「最小细胞」——一个会调用工具的大模型，就已经是半个 Agent 了。Hermes Agent 把这「半个」做得很扎实：八大类工具覆盖了从信息获取（Web）、本地操作（终端）、多模态（图像/视频/语音）到任务编排（todo/delegate\_task）的全部场景。

### 4.3 MCP 协议集成

如果光靠内置工具，Agent 的能力边界就受限于框架作者自己塞进去的那些。要让 Agent 能对接「整个互联网的工具生态」，就要靠 **MCP（Model Context Protocol）**。

**MCP 之于 Agent 工具，就像 USB 之于外设**。在 USB 之前，每个键盘、每个鼠标都要自己写驱动；USB 之后，所有设备即插即用。MCP 要解决的是同一个问题——以前每个 Agent 框架都要自己实现一遍「高德地图工具」「天气工具」，现在大家按 MCP 协议做一次，所有支持 MCP 的 Agent 框架都能直接用。

Hermes Agent 完整支持 MCP 协议，提供两种接入模式：

| 模式        | 配置方式               | 工作方式                                            | 适用场景                    |
| --------- | ------------------ | ----------------------------------------------- | ----------------------- |
| **stdio** | `command` + `args` | Hermes 在本机启动 MCP server 进程，通过 stdin/stdout 与其通信 | 本地文件系统、CLI 工具、开发环境的本地集成 |
| **HTTP**  | `url`              | Hermes 连接一个已经运行的远程 MCP server                   | 公司内部服务、远程 API、共享的工具服务器  |

一个典型配置示例：

```yaml
# ~/.hermes/config.yaml 中配置 MCP servers
mcp_servers:
  # stdio 模式：本地启动 GitHub MCP
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PERSONAL_ACCESS_TOKEN}
    enabled: true
    timeout: 30

  # HTTP 模式：连接公司内网的远程 MCP
  internal-api:
    url: https://mcp.internal.company.com/api
    headers:
      Authorization: "Bearer ${INTERNAL_API_TOKEN}"
    enabled: true
    connect_timeout: 10
```

:::tip
`auth: oauth` 配置（仅 HTTP 模式）通常需要一次浏览器交互式授权；授权完成后，Hermes 会缓存授权结果，后续调用直接复用已授权的 token，不会有「每次都要重新登录」的烦恼。如果你想快速上手现成的 MCP 服务，可以去**魔搭广场**（<https://www.modelscope.cn/mcp）逛逛，那里有大量社区贡献的> MCP server，开箱即用。
:::

到这一节为止，Hermes Agent 的「基础能力」就讲完了。看起来已经够强了对吧？接下来才是它真正区别于普通 Agent 的部分——**自进化能力**。

## 五、进化篇：自进化的完整链路

这一节是 Hermes Agent 真正的「护城河」。

我把它叫做「自进化的完整链路」，因为它不是某一个单点能力，而是「**技能沉淀 → 自动维护 → 钩子扩展 → 插件扩展 → 定时触发**」的端到端闭环。Agent 用得越久，越贴合你的业务需求；用得越久，越「懂你」。

### 5.1 Skills 技能系统

Skills 是 Hermes Agent 自进化的核心载体。它本质上是一种「可被 Agent 复用、可被人类审计、可用 Markdown 编辑」的「程序记忆」单元。

**基础加载规则**：

- **本地优先**：本地版本的技能会覆盖外部同名技能——这样你可以「fork 一个社区技能、本地改一改、就用了」
- **完整集成**：所有技能统一出现在技能索引、`skills_list`、`skill_view` 和斜杠命令中
- **路径可选**：配置中不存在的外部技能目录会被静默跳过，不会报错

**Skill Bundles（v0.15+ 新增）**：

技能包功能允许用一个斜杠命令同时加载多个技能（果然，好的想法和概念（命令工程），大厂早就做出来了）：

```bash
# 把 blogwatcher、markdown-style、seo-check 三个技能打包成一个组合
hermes skills bundle create writing-day --skills blogwatcher,markdown-style,seo-check

# 使用时直接一条命令加载全部
/writing-day
```

这种「场景化打包」对固定工作流非常友好——写文章就用 `/writing-day`，做数据周报就用 `/weekly-report`，一键加载所有相关技能。

**Skills Hub 与 agentskills.io**：

Hermes Skills 兼容 `agentskills.io` 开放标准，构建了完整的社区技能生态：

- 从 Skills Hub（<https://agentskills.io）浏览和安装社区共享的现成技能>
- 把自定义技能发布到 Hub，共享给全球社区
- 通过 URL 直接安装指定技能

> v0.16 精简了内置技能集，将 NVIDIA/skills 添加为内置可信 Skills Hub tap，社区生态更丰富。

**Agent-Managed Skills（skill\_manage）**：

这是「自进化」的最直接体现。Hermes 通过 `skill_manage` 工具自主创建、修改、删除技能——相当于 Agent 的「程序记忆」。当它解决了一个有复用价值的复杂问题，就会自动把流程沉淀为 Skill。

触发规则（由提示词驱动）：

- **创建新 Skill**：复杂任务成功、克服错误、用户纠正后方法有效、发现可复用流程、用户明确要求记住流程
- **修补现有 Skill**：发现 Skill 过时、缺步骤、命令错误、系统相关失败或新坑点时，优先使用 `patch` 小范围更新，而非 `edit` 全量重写

常用操作动作：

| 动作            | 用途说明                                     |
| ------------- | ---------------------------------------- |
| `create`      | 从零创建一个全新技能                               |
| `patch`       | 对现有技能做小范围修改（优先推荐）                        |
| `edit`        | 整体重写技能的全部内容                              |
| `delete`      | 删除指定技能                                   |
| `write_file`  | 添加或更新 `references/`、`scripts/` 等技能附属支持文件 |
| `remove_file` | 删除技能的附属支持文件                              |

:::important
「小修改用 patch，重大重构才用 edit」是 Skill 系统的核心最佳实践。`patch` 保留技能的历史演化痕迹，方便 Curator 后续分析；`edit` 则会让历史丢失。在生产环境的 Agent 维护中，**养成「patch 优先」的习惯**能让你一年后还能看懂每个 Skill 是怎么一步步变成现在这样的。
:::

### 5.2 Curator 技能维护

Agent 不断自创技能，如果不管控，会在 `~/.hermes/skills/` 中形成大量范围狭窄的重复项——既污染技能目录，又会浪费大量上下文 Token。**Curator 就是解决这个问题的后台维护流程。**

**运行逻辑**：

Curator 会跟踪每个技能被查看、使用和修补的频率，将长期未使用的技能按 `active → stale → archived` 三级状态流转：

```text
技能创建
    ↓
active（活跃：最近被使用）
    ↓ 长时间未使用
stale（陈旧：候补归档）
    ↓ 达到 archive_after_days 配置
archived（已归档：移动到 .archive/ 目录）
```

同时，Curator 会定期启动轻量辅助模型审查，主动提出技能合并、内容修补的建议。

**配置与安全规则**：

| 配置项                         | 行为                                                |
| --------------------------- | ------------------------------------------------- |
| `prune_builtins: true`（默认）  | 达到 `archive_after_days` 后，内置捆绑技能和 Agent 自创技能都会被归档 |
| `prune_builtins: false`     | 恢复为「仅处理 Agent 自创技能」模式，内置捆绑技能不被触碰                  |
| 从 agentskills.io 安装的 Hub 技能 | 始终不受 Curator 处理                                   |
| Pinned 标记的技能                | 不会被自动归档                                           |

:::warning
**安全底线**：Curator 绝不会自动删除技能。最坏结果是归档到 `~/.hermes/skills/.archive/` 目录，所有技能随时可恢复。所以即使 Curator 误判了某个常用技能为「过时」，你也可以一键从归档目录里捞回来——**这是 Hermes Agent「自进化但不失控」的关键设计。**
:::

### 5.3 Hooks 钩子系统

钩子系统支持在 Agent 生命周期的关键节点执行自定义逻辑，**全部采用非阻塞设计**——钩子执行错误只会记录日志，不会中断主流程。

**三类钩子对比**：

| 对比维度     | Shell Hooks                            | Plugin Hooks           | Gateway Hooks                      |
| -------- | -------------------------------------- | ---------------------- | ---------------------------------- |
| **支持语言** | 任意（Bash、Python、Go 等）                   | 仅 Python               | 仅 Python                           |
| **运行环境** | CLI + Gateway                          | CLI + Gateway          | 仅 Gateway                          |
| **事件命名** | Agent 内部事件名                            | Agent 内部事件名            | 带冒号的 Gateway 事件名                   |
| **注册位置** | `~/.hermes/config.yaml` 的 `hooks:` 配置项 | 插件 `register(ctx)` 中注册 | `~/.hermes/hooks/<name>/HOOK.yaml` |
| **典型用例** | 阻止危险命令、自动格式化、注入 git 状态                 | 工具拦截、指标采集、防护措施、记忆召回    | 日志记录、告警通知、Webhook 回调               |

**常见钩子事件**：

| 钩子事件                                          | 适用系统           | 触发时机                    | 常见用途                  | 是否能影响主流程            |
| --------------------------------------------- | -------------- | ----------------------- | --------------------- | ------------------- |
| `pre_tool_call`                               | Shell / Plugin | 工具执行前                   | 阻止危险命令、检查参数、审计调用      | 可以返回 `block` 阻止执行   |
| `post_tool_call`                              | Shell / Plugin | 工具返回后                   | 记录结果、采集指标、跟踪生成文件      | 观察型，不影响流程           |
| `pre_llm_call`                                | Shell / Plugin | 每轮 LLM 调用前              | 注入 git 状态、外部上下文、策略提示  | 可以返回 `context` 注入内容 |
| `post_llm_call`                               | Shell / Plugin | 每轮 LLM 调用结束后            | 记录响应、同步记忆、采集 token 指标 | 观察型，不影响流程           |
| `on_session_start`                            | Shell / Plugin | 新会话开始时                  | 初始化会话状态、打开外部连接        | 观察型，不影响流程           |
| `on_session_end`                              | Shell / Plugin | 会话结束、重置或退出时             | 清理资源、flush 缓存、发送通知    | 观察型，不影响流程           |
| `gateway:startup`                             | Gateway        | Gateway 进程启动时           | 启动检查、告警、注册 Webhook    | 观察型，不影响流程           |
| `session:start / session:end / session:reset` | Gateway        | Gateway 会话创建、结束或重置时     | 记录消息平台会话、审计用户行为       | 观察型，不影响流程           |
| `agent:start / agent:step / agent:end`        | Gateway        | Gateway 中 Agent 处理消息的过程 | 监控长任务、记录工具循环、统计耗时     | 观察型，不影响流程           |
| `command:*`                                   | Gateway        | Gateway 里执行任意斜杠命令时      | 命令审计、权限统计、外部通知        | 观察型，不影响流程           |

:::note
所有钩子均为非阻塞设计，钩子执行异常会被捕获并写入日志，不会导致 Agent 崩溃或中断正常对话。这意味着你可以放心大胆地写「实验性钩子」——出问题也不会把整个 Agent 拖死。生产环境部署时，建议先在 `pre_tool_call` 上做安全拦截（阻止 `rm -rf`、`mkfs`、`shutdown` 等危险命令），这是性价比最高的安全投资。
:::

### 5.4 Plugins 插件系统

如果说 Hooks 是「Agent 生命周期的监听器」，那 Plugins 就是「Agent 能力边界的扩展器」。

插件通过 `register(ctx)` 函数接入 Hermes 系统，`ctx` 对象上的所有公开 API 均可在插件代码中直接调用。可以扩展的能力类型有：

| 扩展类型           | 功能说明                                                  |
| -------------- | ----------------------------------------------------- |
| **工具**         | 给模型增加可调用能力，例如对接外部 API、本地服务或自定义业务逻辑                    |
| **钩子**         | 在工具调用、LLM 调用、会话开始/结束等生命周期节点执行自定义代码                    |
| **命令**         | 新增 `/name` 斜杠命令，或新增 `hermes <plugin> ...` 形式的 CLI 子命令 |
| **会话注入**       | 把外部事件、消息或数据主动注入到当前会话中                                 |
| **Skill / 数据** | 随插件附带 Skill、模板、配置、静态数据等资源                             |
| **Gateway 平台** | 接入新的消息平台，或自定义平台适配器                                    |
| **后端提供商**      | 接入新的记忆、上下文压缩、图像生成、视频生成或 LLM 提供商                       |

**版本特性**：

- v0.14+：插件可以通过 `ctx.llm` 直接在插件代码中调用当前活跃的模型提供商
- v0.13+：第三方提供商可通过 `ProviderProfile` ABC（抽象基类）实现自定义 LLM 提供商插件

> 换句话说，Plugins 是 Hermes 最灵活的高阶扩展能力——不需要修改框架核心代码，就能扩展工具、钩子、命令、消息平台甚至底层 LLM 提供商。**这是「不被任何东西锁定」的工程级保证。**

### 5.5 Cron 定时任务

光有技能沉淀和钩子扩展还不够。如果所有能力都只能「等用户触发」，那它还是个「被动响应」的工具。Cron 定时任务让 Agent 拥有「主动运行」的能力。

**执行机制**：

- 调度主体：通过 Gateway daemon（守护进程）执行
- 调度频率：Gateway 每 60 秒 tick 一次，检查并触发到期任务
- 执行逻辑：为每个到期任务启动一个全新的独立 Agent 会话，执行预设的任务 prompt，完成后投递最终结果
- 防循环保护：Cron 任务运行时会自动禁用 cron 管理工具，避免递归创建更多定时任务造成调度死循环

**三种创建方式**：

```bash
# 方式一：会话内斜杠命令
/cron add 30m "提醒我检查构建结果"
/cron add "every 2h" "检查服务器状态"
/cron add "every 1h" "总结新动态" --skill blogwatcher

# 方式二：CLI 命令行
hermes cron create "every 2h" "检查服务器状态"
hermes cron create "every 1h" "总结新动态" --skill blogwatcher

# 方式三：自然语言创建
# 直接在对话里说：每天早上 9 点检查 Hacker News 上的 AI 新闻，
# 然后发一份摘要到 Telegram。
# Agent 会自动解析生成对应定时任务
```

:::important
Cron 任务在独立会话中运行，**不继承当前会话的上下文**。这是关键设计——避免任务之间相互污染，但也意味着你必须在任务 prompt 中明确所有依赖信息（比如「读 MEMORY.md 第 X 行」而不是「读上一条记录」）。这个细节在「实战篇」会重点演示。
:::

到这里，「进化篇」的五大能力就讲完了。它们共同构成了「**越用越聪明**」的完整链路：

```text
用户使用
    ↓
Agent 解决复杂问题
    ↓
skill_manage 自动沉淀 Skill
    ↓
Curator 自动维护技能库
    ↓
Hooks / Plugins 扩展能力边界
    ↓
Cron 触发自动化主动执行
    ↓
（循环）越用越贴合业务
```

但一个 Agent 再强，也只是「单兵作战」。真正复杂的业务需要「多兵种协同」——这就是「协作篇」要解决的问题。

## 六、协作篇：从单终端到多 Agent 协同

Hermes Agent 的协作能力遵循一条清晰的递进路径：

```text
CLI 单终端
    ↓ 接入消息平台
Gateway 多平台接入
    ↓ 区分业务场景
Profile 多实例隔离
    ↓ 拆分子任务
Delegate Task 轻量子任务
    ↓ 持久化多角色协作
Kanban 多 Agent 协作
```

理解这条递进路径，你就能根据业务复杂度选对方案。

### 6.1 Gateway 消息网关

**Gateway** 是 Hermes 的消息平台接入层，可以作为前台进程或后台服务长期运行。核心职责是：

- 对接 Telegram、Discord、Slack、微信、飞书、企业微信、钉钉、QQ、LINE 等各类消息平台
- 接收用户消息，维护每个聊天对应的独立会话
- 将消息转发给 Hermes Agent 处理，再把回复原路返回原平台

**与 CLI 模式的异同**：

| 维度       | CLI 模式                       | Gateway 模式                 |
| -------- | ---------------------------- | -------------------------- |
| **运行方式** | 终端里的单次交互入口，随用随启              | 长期运行的消息平台适配进程，7×24 小时待命    |
| **会话结束** | 会话结束进程退出                     | 进程持续运行，会话独立管理              |
| **额外能力** | 仅手动交互                        | 同时运行 Cron 调度循环，负责触发到期的计划任务 |
| **共享数据** | 配置、会话、记忆、技能、工具与 Gateway 完全一致 | 同左                         |

**支持平台与能力对比**（✅表示支持）：

| 平台        | 语音 | 图片 | 文件 | 线程 | 表情反应 | 输入提示 | 流式输出 |
| --------- | -- | -- | -- | -- | ---- | ---- | ---- |
| Telegram  | ✅  | ✅  | ✅  | ✅  | -    | ✅    | ✅    |
| Discord   | ✅  | ✅  | ✅  | ✅  | ✅    | ✅    | ✅    |
| Slack     | ✅  | ✅  | ✅  | ✅  | ✅    | ✅    | ✅    |
| 飞书 / Lark | ✅  | ✅  | ✅  | ✅  | ✅    | ✅    | ✅    |
| 微信        | ✅  | ✅  | ✅  | -  | -    | ✅    | ✅    |
| 企业微信      | ✅  | ✅  | ✅  | -  | -    | -    | -    |
| 钉钉        | -  | ✅  | ✅  | -  | ✅    | -    | ✅    |
| QQ        | -  | ✅  | ✅  | -  | -    | ✅    | -    |

> 补充：Gateway 同时支持完整的语音交互能力，包括 CLI 麦克风模式、消息中的语音回复、Discord 频道语音对话等。

### 6.2 Profile 多实例

**Profile** 本质是一个**独立的 Hermes home 目录**，每个 Profile 包含各自独立的全套数据：

- 配置文件：`config.yaml`、`.env`
- 人格定义：`SOUL.md`
- 业务数据：记忆库、会话历史、技能库、Cron 任务、状态数据库、Gateway 状态

核心作用是运行多个不同用途的 Agent，彼此状态完全隔离，不会互相干扰。例如可以分别创建「编程助手」「生活助理」「运维巡检」三个独立的 Agent 实例。

**命令别名机制**也很贴心：创建 Profile 后，Hermes 会自动生成同名的命令别名：

```bash
# 创建名为 coder 的 Profile
hermes profile create coder --description "编程助手"

# 之后可以直接执行
coder chat
coder setup
coder gateway start

# 本质等价于
hermes -p coder ...
```

### 6.3 Delegation 任务委派

`delegate_task` 工具让 Hermes 在单会话内创建子 Agent 来处理独立任务，每个子 Agent 拥有独立的对话和终端环境，父子任务互不干扰。

**单任务委派**：

```python
# 传入任务目标、背景信息、可用工具集
delegate_task(
    goal="Debug why tests fail",
    context="Error: assertion in test_foo.py line 42",
    toolsets=["terminal", "file"],
)
```

**并行批量委派**（默认最多 3 并发）：

```python
delegate_task(tasks=[
    {"goal": "Research topic A", "toolsets": ["web"]},
    {"goal": "Research topic B", "toolsets": ["web"]},
    {"goal": "Fix the build", "toolsets": ["terminal", "file"]},
])
```

**子 Agent 上下文规则**（极重要）：

1. **上下文隔离**：子 Agent 启动时是全新对话，完全不知道父会话之前的任何内容，唯一的上下文来自 `goal` 和 `context` 两个字段
2. **结果轻量化**：子 Agent 完成后，只有结构化摘要会传回父会话，详细对话过程不保留

:::caution
**新手最容易踩的坑**：以为子 Agent 会自动「继承」父会话的上下文。**完全不会**。所有必要信息必须显式写入 `context` 字段，否则子 Agent 缺少背景信息，要么反复问、要么瞎做。这也是为什么「实战篇」里你会看到每个委派任务的 context 都写得很详细——这是踩过坑才总结出来的最佳实践。
:::

### 6.4 Kanban 多 Agent 协作

`delegate_task` 适合**短周期、自包含的子任务**，但它覆盖不了以下场景：

1. 研究分流与综合：多个专家型 Agent 并行产出，审查者选择合并
2. 定时循环工作流：日报、周报、收件箱分流等跨运行积累知识的场景
3. 数字分身 / 持久助手：具名、长期存在的 Agent 身份，跨数周数月积累记忆
4. 端到端工程流水线：任务拆解、并行实现、审查、迭代、提交的完整链路

**Kanban** 就是为了补齐以上能力。它提供**跨运行持久状态、工作全链路可见性、不同技能 Agent 之间的交接、人类或对等 Agent 随时介入**。

**核心概念**：

- **Board（任务板）**：独立的任务队列，拥有自己的 SQLite 数据库、workspaces 工作目录和调度循环
  - 默认路径：`~/.hermes/kanban.db`
  - 自定义路径：`~/.hermes/kanban/boards/<slug>/`
- **Task（任务）**：Kanban 的基本工作单元，一个 task 只能有一个 `assignee`（执行人），通常是 Hermes profile 名称

**9 种任务状态**：

| 状态          | 说明                    |
| ----------- | --------------------- |
| `triage`    | 待分流 / 待明确，任务入口状态      |
| `todo`      | 已创建但尚未满足运行条件          |
| `scheduled` | 已暂缓调度，等待恢复            |
| `ready`     | 就绪，可被 dispatcher 认领执行 |
| `running`   | worker 正在执行中          |
| `blocked`   | 阻塞，需要人工输入或等待外部条件      |
| `review`    | 等待审查                  |
| `done`      | 已完成                   |
| `archived`  | 已归档                   |

**状态流转规则**：

```text
外部创建
    ↓
triage（入口）
    ↓ decompose 拆解
todo 1 / todo 2 / todo 3（root task 保留为 triage）
    ↓ dispatcher 自动检查依赖
ready
    ↓ 原子 CAS
running
    ↓ 完成
done（成功）/ blocked（需人工介入）
    ↓ unblock
ready（重新进入调度）
    ↓ 异常
stale recovery（dispatcher 自动回收）
```

**6 种协作模式**：

| 模式                              | 说明                                   | 典型场景                  |
| ------------------------------- | ------------------------------------ | --------------------- |
| **Fan-out（扇出）**                 | 一个目标拆成多个同级 task，并行执行                 | 多角度研究、并行功能实现          |
| **Pipeline（流水线）**               | 上游完成 → 下游启动，阶段式传递结果                  | 研究员 → 分析师 → 撰稿人 → 审核员 |
| **Fan-in（扇入）**                  | 多个 task 汇总到一个聚合 task 统一处理            | 研究结果综合、多方案评审          |
| **Long-running journal（长运行日志）** | 同一 profile 通过定时任务在共享 workspace 反复处理  | 日报、周报、监控巡检            |
| **Human-in-the-loop（人在回路）**     | worker 阻塞 → 人工评论 → unblock → 重新启动    | 不确定决策、需要审批的环节         |
| **Fleet farming（集群管理）**         | 一个 profile 管理 N 个对象，每个对象独立 workspace | 多账号管理、多服务器批量巡检        |

:::tip
入门 Kanban 实践，建议从 **Fan-out**（并行调研）和 **Pipeline**（简单流水线）两种模式入手。它们是其他四种模式的基础——搞懂了 Fan-out 和 Pipeline，Fan-in、Long-running journal、Human-in-the-loop、Fleet farming 都只是在这两种基础上的组合。**记住一句话：「先会拆，再学合，最后才是人机协作」。**
:::

到这里，Hermes Agent 的五大模块（入门 / 能力 / 进化 / 协作）就讲完了。**理论部分结束了，接下来是硬核实战。**

## 七、实战篇：AI 驱动的技术博客自动发布系统

这一节是整篇文章的「重头戏」——用一个完整的真实业务案例，把前 6 节所有学过的能力串起来跑一遍。

### 7.1 案例概述

**业务场景**：模拟一个两人技术团队维护的技术博客，每周要发布 2\~3 篇 AI / 前端领域的技术文章，要求经过调研、撰写、审核三环节，最终发布到 GitHub Pages 博客仓库。团队负责人通过**微信**随时随地跟进和审批，系统自主学习团队的写作风格和偏好。

这个案例的目标是：

- 串联 Hermes Agent 的 **25+ 项功能**，展示它们在真实场景中的配合方式
- 提供可参考、可复用的 Agent 工作流设计模式
- 直观展示多 Profile、多 Agent 协作的落地实践方式

**功能覆盖清单**：

| 序号 | 功能                  | 所属模块 | 使用场景                                          |
| -- | ------------------- | ---- | --------------------------------------------- |
| 1  | **Profile**         | 协作篇  | 创建 researcher、writer、reviewer、publisher 四个角色  |
| 2  | **Provider**        | 入门篇  | researcher 用 DeepSeek（便宜），writer 用 Claude（质量） |
| 3  | **Skills**          | 进化篇  | 安装 blogwatcher；writer 加载写作风格 skill            |
| 4  | **skill\_manage**   | 进化篇  | writer Agent 自动沉淀「技术博文写作规范」skill              |
| 5  | **Curator**         | 进化篇  | 维护自动生成的写作 skill，合并重复模板                        |
| 6  | **Memory**          | 能力篇  | 记住博客 Markdown 风格偏好、发布平台 API 配置                |
| 7  | **session\_search** | 能力篇  | 回查历史会话中讨论过的选题                                 |
| 8  | **Cron**            | 进化篇  | 每天早上收集 HN/知乎 AI 新闻；每周汇总热点                     |
| 9  | **context\_from**   | 进化篇  | 新闻收集 → 选题筛选 → 文章撰写三阶段流水线                      |
| 10 | **Delegation**      | 协作篇  | 父 Agent 并行委派「调研技术背景」和「查竞品文章」                  |
| 11 | **Kanban**          | 协作篇  | 管理完整工作流看板                                     |
| 12 | **Kanban Swarm**    | 协作篇  | 一键创建 researcher + writer + reviewer 协作拓扑      |
| 13 | **Orchestrator**    | 协作篇  | 拆解「写一篇关于 X 的深度文章」为子任务                         |
| 14 | **Gateway**         | 协作篇  | 通过微信接收选题指令、审核草稿                               |
| 15 | **MCP**             | 能力篇  | 接入 GitHub MCP Server 自动提交文章                   |
| 16 | **Toolsets**        | 能力篇  | web\_search 调研、browser 预览、terminal 构建         |
| 17 | **Hooks**           | 进化篇  | post\_tool\_call hook 记录 token 消耗             |
| 18 | **Plugins**         | 进化篇  | 自定义插件检查文章 SEO 元数据                             |
| 19 | **Dashboard**       | 能力篇  | Web 面板监控 Kanban 任务进度                          |
| 20 | **TUI**             | 协作篇  | 在 TUI 中观察 Agent 工作过程                          |
| 21 | **API Server**      | 协作篇  | 外部 CMS 通过 API 触发紧急发布                          |
| 22 | **@ 上下文引用**         | 能力篇  | `@file` 引用已有文章草稿作为风格参考                        |
| 23 | **No-Agent Cron**   | 进化篇  | 纯脚本监控博客站点健康状态                                 |
| 24 | **SOUL.md**         | 能力篇  | 为每个 Profile 定制人格                              |
| 25 | **上下文压缩**           | 能力篇  | 长会话中自动压缩历史                                    |

> 看到这张表，你应该能感受到为什么选 Hermes Agent 作为「深入拆解」的样本——它不是「只有一个亮点」的框架，而是把 Agent 工程化的几乎所有关键能力都内置好了，而且彼此衔接得很顺。

**整体架构**：

```text
┌──────────────────────────────────────────────────────────────────┐
│                     AI 博客自动发布系统                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [微信] ←→ Gateway ←→ Hermes Agent                               │
│       │                       │                                  │
│       ▼                       ▼                                  │
│  人工指令/审批           ┌──────────┐                             │
│                         │Orchestrator│ ← Profile + SOUL.md       │
│                         └─────┬──────┘                            │
│                               │ decompose                        │
│                               ▼                                  │
│                    ┌──────────────────┐                          │
│                    │   Kanban Board   │ ← SQLite (持久化)         │
│                    └──┬───┬───┬───┬──┘                          │
│                       │   │   │   │                              │
│         ┌─────────────┘   │   │   └─────────────┐                │
│         ▼                 ▼   ▼                 ▼                │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐  ┌──────────┐   │
│   │researcher│    │researcher│    │  writer  │  │ reviewer │   │
│   │ (DeepSeek)│   │ (DeepSeek)│   │ (Claude) │  │ (Claude) │   │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘  └────┬─────┘   │
│        │               │              │              │          │
│        │  web_search   │  Delegation  │  @file       │  SEO     │
│        │  Delegation   │              │  session_    │  Plugin  │
│        │               │              │  search      │          │
│        ▼               ▼              ▼              ▼          │
│   ┌──────────────────────────────────────────────────────┐      │
│   │              共享 Memory + Skills + Curator            │      │
│   └──────────────────────────────────────────────────────┘      │
│        │                                                         │
│        ▼                                                         │
│   ┌──────────┐                                                   │
│   │ publisher│ → MCP (GitHub) → GitHub Pages                     │
│   └──────────┘                                                   │
│                                                                  │
│   辅助系统: Cron (选题) | Hooks (日志) | Dashboard (监控)         │
│            API Server (外部触发) | No-Agent Cron (健康检查)      │
└──────────────────────────────────────────────────────────────────┘
```

下面我们按 5 个阶段逐个拆解。

### 7.2 阶段一：环境搭建

> 核心思路：按角色拆分 4 个独立 Profile，分别配置模型、工具权限与人格；配置微信 Gateway 实现消息接入；通过持久记忆固化博客基础信息。

**第一步：创建四角色 Profile**

为四个角色创建独立的 Hermes Profile，每个 Profile 配置不同的模型、工具权限和人格设定：

```bash
# (1) researcher 调研员 - 负责查阅资料，使用低成本模型
hermes profile create researcher --clone \
  --description "负责查阅文档、源码和网络资料，产出结构化研究结论。使用低成本模型。"
researcher model set deepseek                   # 设置使用 DeepSeek
researcher tools disable browser code_execution video_analyze  # 限制工具

# 为 researcher 定制人格
cat > ~/.hermes/profiles/researcher/SOUL.md << 'EOF'
# Researcher Soul
你是一名技术研究员。你的输出必须结构化：
1. 核心发现（一句话总结）
2. 关键信息点（bullet points）
3. 信息来源（URL + 一句话描述）
4. 建议方向（可选）
保持客观、精确。不要添加主观评价。
EOF
```

```bash
# (2) writer 撰稿员 - 负责把研究材料写成文章，使用高质量模型
hermes profile create writer --clone \
  --description "负责把研究材料整理成清晰、连贯、有吸引力的技术文章。使用高质量模型。"
writer model set anthropic                     # 设置使用 Claude
writer skills install blogwatcher              # 安装写作相关技能

cat > ~/.hermes/profiles/writer/SOUL.md << 'EOF'
# Writer Soul
你是一名技术专栏作者。写作风格：
- 开头用引人入胜的问题或场景切入
- 代码示例必须完整可运行
- 每个技术点附带「为什么重要」的解释
- 中文为主，技术术语保留英文
- 文章长度 1500~3000 字
EOF
```

```bash
# (3) reviewer 审核员 - 负责审查文档或代码变更
hermes profile create reviewer --clone \
  --description "负责审查文档或代码变更，指出遗漏、错误和风险。"

cat > ~/.hermes/profiles/reviewer/SOUL.md << 'EOF'
# Reviewer Soul
你是一名技术编辑。审核关注点：
1. 技术准确性：代码是否正确、API 名称是否准确
2. 逻辑完整性：推理链条是否有跳跃
3. 信息时效性：引用的版本号、日期是否最新
4. 可读性：排版、代码高亮、段落长度
审核结果用 checklist 格式输出。
EOF
```

```bash
# (4) publisher 发布员 - 负责将审核通过的文章发布到 GitHub
hermes profile create publisher --clone \
  --description "负责将审核通过的文章发布到 GitHub Pages 博客仓库。"
publisher tools disable web browser            # 只保留 terminal 和 MCP
```

:::tip
**这里有个常被忽视的细节**：每个 Profile 的 `SOUL.md` 不只是「装饰」，它是 Hermes Agent 系统提示词的开头。修改 SOUL.md 后，Agent 的回复风格会立即变化。所以**每个角色一定要定制自己的 SOUL.md**，否则 4 个 Profile 干出来的事是一样的——那就失去了「多角色」的意义。
:::

**第二步：配置 Gateway 与推送**

```bash
# 配置微信 Gateway
hermes gateway setup              # 交互式配置微信接入凭证
hermes gateway start              # 启动 Gateway
```

在 `~/.hermes/.env` 中设置敏感凭证：

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx
WECHAT_ALLOWED_USERS=团队负责人微信账号
```

验证 MCP 连通性：

```bash
hermes mcp list                   # 确认 MCP 已配置
hermes mcp test github            # 测试连接
```

**第三步：配置持久记忆**

在首次对话中注入博客基础信息，写入持久记忆，后续所有会话自动复用：

```bash
hermes chat -q "记住以下信息：我们的博客使用 GitHub Pages + Hugo 静态站点，仓库地址 github.com/team/tech-blog，文章用 Markdown 格式，frontmatter 包含 title/date/tags/author 四个字段。发布流程是：新文章放在 content/posts/ 下，提交 PR，合并到 main 分支后自动部署。"
```

以上信息会写入 `MEMORY.md`，所有后续会话都能自动获取，无需重复说明。

### 7.3 阶段二：工作流设计

> 核心思路：基于 Kanban 搭建持久化任务看板，通过 Orchestrator 实现任务自动拆解，用三组 Cron 任务搭建自动化选题流水线，结果统一推送至微信。

**第一步：初始化 Kanban Board**

```bash
# 创建专用任务板
hermes kanban boards create blog --name "技术博客工作板" --switch
# 初始化（幂等操作）
hermes kanban init
```

**第二步：创建 Orchestrator 编排者 Profile**

```bash
hermes profile create orchestrator --clone \
  --description "Kanban 编排者。负责拆解文章选题、创建写作任务、指派 profile、建立依赖关系、汇总下游结果。"

# 限制为纯编排角色，不启用执行类工具
orchestrator tools disable terminal file web browser code_execution

# 开启自动拆解
hermes config set kanban.orchestrator_profile orchestrator
hermes config set kanban.auto_decompose true
```

**第三步：搭建 Cron 选题流水线**

三个 Cron 任务形成「新闻收集 → 选题筛选 → 大纲生成」的三级依赖流水线，所有结果统一投递到微信。

直接在对话中给 Agent 下达指令：

```text
请帮我创建一组 Cron 任务，用于技术博客选题流水线：
1. 每天早上 7:00，收集 Hacker News 和知乎上的 AI/前端热门内容，
   用 web_search 工具获取，输出包含标题、链接、简要说明
2. 每天早上 7:30，读取任务 1 的最新输出，筛选 3 个最适合我们博客的选题，
   评估标准：技术深度、读者兴趣度、与已有文章的差异化
3. 每天早上 8:00，读取任务 2 的筛选结果，为每个选题生成一份简报，
   包含：文章大纲、核心观点、推荐参考链接、预估字数
所有任务结果投递到微信。
```

Agent 会自动调用 `cronjob` 工具创建三个任务，并通过 `context_from` 建立上下游依赖链：

```text
# Job 1 新闻收集
cronjob(action="create", name="blog-news-collect",
        schedule="0 7 * * *",
        prompt="收集 Hacker News 和知乎 AI/前端热门内容，输出标题、链接、简要说明。",
        deliver="wechat", skills=["web_search"])

# Job 2 选题筛选
cronjob(action="create", name="blog-topic-select",
        schedule="30 7 * * *",
        context_from="<job1_id>",
        prompt="从上一步的新闻中筛选 3 个最适合我们博客的选题。评估标准：技术深度、读者兴趣度、与已有文章的差异化。",
        deliver="wechat")

# Job 3 大纲生成
cronjob(action="create", name="blog-brief-generate",
        schedule="0 8 * * *",
        context_from="<job2_id>",
        prompt="为每个选题生成简报：文章大纲、核心观点、推荐参考链接、预估字数。",
        deliver="wechat")
```

:::important
**`context_from`** **是这里的关键设计**。Job 2 不是简单「每天 7:30 运行」，而是「等待 Job 1 完成后运行，并把 Job 1 的输出作为 context」。同理 Job 3 等待 Job 2。这就形成了一条「上一节讲过的 Long-running journal（长运行日志）」流水线。**它把单点触发变成了流程触发**——这是企业级自动化和玩具级自动化的核心区别。
:::

### 7.4 阶段三：日常运行

> 核心思路：微信端发起任务 → Kanban 自动拆解 → 多 Agent 并行执行 → 人工微信审核 → 自动发布，完整流水线自动流转，人工仅在阻塞节点介入。

**第一步：微信端发起新文章任务**

团队负责人在微信上给 Hermes 发消息：

> "写一篇关于 Hermes Agent Kanban 多 Agent 协作（v0.13+ 引入，v0.15 强化为多 Agent 平台）的深度文章，面向 AI 开发者"

Gateway 收到消息后，Hermes 开始处理。可在终端通过 TUI 实时观察执行过程：

```bash
hermes --tui                     # 另开终端观察 Agent 工作流
```

为了让 Agent 不要自己闷头写文章，而是触发完整的 Swarm 流程，需要给它配置路由规则（写在某个 Profile 的 SOUL.md 或全局配置里）：

```text
当用户通过微信发送以下类型的请求时，不要自己回答内容，不要自己写文章，而是触发 Kanban 多 Agent 协作流程：

触发关键词：
- "写一篇关于...的文章/博客"
- "写一篇...深度文章"
- "写博客/写文章  主题"
- 任何明确的博客/文章创作请求

执行步骤：
1. 调用 hermes kanban --board blog create "文章主题" --assignee orchestrator
2. 回复用户："已创建博客写作任务，Orchestrator 正在拆解，稍后流程自动推进。"

常规对话：非博客创作类的咨询、问候、闲聊，正常回答即可。

注意：
- 不要自己调研、整理、撰写博客内容——那是 researcher / writer 的工作
- Kanban 的 Dispatcher（内嵌于 gateway）会自动 orchestrate 整个流程
- 流程: orchestrator 拆解 → researcher 调研 → writer 写 2000 字 → reviewer 审核 → publisher 发布到 GitHub
```

**第二步：Orchestrator 任务拆解**

Orchestrator 被调度启动后，自动完成以下操作：

1. 读取 triage 任务的标题和正文
2. 扫描可用 profile（researcher、writer、reviewer、publisher）
3. 调用 LLM 生成任务图（task graph JSON）
4. 创建子任务并在 Kanban board 上建立依赖关系

拆解后的任务拓扑：

```text
task: "研究 Hermes v0.15+ Kanban 多 Agent 协作架构与设计理念"
  assignee=researcher
  workspace=scratch
task: "调查社区对 Kanban 多 Agent 协作的反馈与使用案例"
  assignee=researcher
  workspace=scratch
task: "基于研究报告撰写深度文章"
  assignee=writer
  depends_on=[research_task_1, research_task_2]
task: "审核文章的技术准确性与可读性"
  assignee=reviewer
  depends_on=[write_task]
task: "发布文章到 GitHub Pages"
  assignee=publisher
  depends_on=[review_task]
```

**第三步：研究阶段：并行调研**

两个 researcher 任务进入 `ready` 状态后，被 dispatcher 并行启动。每个 researcher worker 执行流程：

1. 调用 `kanban_show()` 读取任务上下文
2. 使用 `web_search` 搜索相关资料
3. 可通过 `delegate_task` 进一步并行拆分搜索子方向
4. 完成时调用 `kanban_complete(summary="...")` 提交研究摘要

researcher 内部的并行委派示例：

```python
# researcher 内部，进一步并行拆分搜索方向
delegate_task(tasks=[
    {"goal": "搜索 Hermes Agent v0.13+ release notes 中 Kanban 多 Agent 协作相关内容",
     "toolsets": ["web"]},
    {"goal": "搜索 GitHub 上 Kanban Swarm 的 PR 和 issue 讨论",
     "toolsets": ["web"]},
    {"goal": "搜索社区（Reddit、Hacker News）的讨论和反馈",
     "toolsets": ["web"]},
])
```

**第四步：撰写阶段：自动写作与风格复用**

两个研究任务全部完成后，writer 任务自动进入 `ready` 状态。Writer worker 启动后执行：

```text
1. 读取两个研究子任务的 kanban_complete 摘要
2. 使用 session_search 回查历史文章风格
3. 通过 @file 注入历史文章作为风格参考
4. 调用 web_extract 提取关键参考页面完整内容
5. 用 browser_navigate 查看引用页面的渲染效果
6. 撰写完成，通过 patch 写入文章草稿文件
```

具体指令示例：

```text
session_search(query="技术文章 深度分析 写作风格")

@file:content/posts/2026-05-hermes-v0.15-deep-dive.md
参考这篇文章的结构和语言风格，写新文章。
```

**第五步：审核阶段：自动检查 + 微信人工审批**

Reviewer worker 启动后执行：

1. 读取 writer 生成的文章草稿
2. 调用 SEO 插件检查元数据质量
3. 自动检查 YAML frontmatter 格式
4. 发现问题通过 `kanban_comment()` 留下审核意见
5. 质量达标则 `kanban_complete(summary="审核通过，建议发布")`
6. 存在问题则 `kanban_block(reason="代码示例缺少错误处理")`

当任务被设为 `blocked` 时，负责人会在**微信**收到通知，可直接在微信中操作：

```text
/kanban comment t_abc123 "第 3 节的代码示例需要用 try/catch 包裹"
/kanban unblock t_abc123
```

Writer 重新启动后，会自动读取评论中的修改意见并修正。

**第六步：发布阶段：自动提交到 GitHub**

Publisher worker 启动后执行：

1. 读取最终草稿和审核意见
2. 进入工作区，通过 terminal 工具执行 git 操作提交代码
3. 也可直接使用 GitHub MCP 工具完成文件提交：

```text
mcp_github_create_or_update_file(
    owner="team",
    repo="tech-blog",
    path="content/posts/2026-07-hermes-kanban-multi-agent.md",
    content="<文章内容>",
    message="Add: Hermes Agent Kanban 多 Agent 协作深度分析"
)
```

完成后调用 `kanban_complete(result="已发布到 GitHub Pages")`。

### 7.5 阶段四：持续进化

> 核心思路：系统运行过程中自动沉淀技能、维护技能库、更新用户记忆，实现「越用越好用」的自进化闭环。

**Skill 自动沉淀**

当一次文章发布效果优秀时，后台 review agent 会自动检测到可复用模式，主动沉淀为技能：

```text
skill_manage(action="create", name="tech-deep-dive-writing",
    category="writing",
    description="写作 AI 技术深度分析文章的标准流程",
    content="..."
)
```

随着多次写作任务完成，writer Agent 还会自动触发 `skill_manage(action="patch", ...)` 修补和优化技能内容——**这就是「5.1 节讲的 Agent-Managed Skills」在生产中的实际表现**。

**Curator 自动维护**

Curator 后台定期运行，自动治理技能库：

- 发现重复技能自动合并（如将相似的写作模板合并为统一技能）
- 将长期未使用的技能标记为 stale，最终归档
- 避免技能库无限膨胀、冗余混乱

查看运行结果：

```bash
hermes curator status
cat ~/.hermes/logs/curator/20260616-030000/REPORT.md
```

**Memory 自动更新**

随着系统运行，Hermes 会在 Memory 中自动积累业务偏好信息：

```text
══════════════════════════════════════════════
MEMORY (your personal notes) [45%]
══════════════════════════════════════════════
Blog uses Hugo 0.120+ with PaperMod theme, deployed via GitHub Pages
§
writer profile uses Claude model for better prose quality
§
Articles perform best at 2000-2500 words with 3-5 code examples
§
GitHub repo: github.com/team/tech-blog, publish via merge to main
```

这些信息在后续所有会话中自动可用，无需每次重复说明。

### 7.6 阶段五：监控与维护

> 核心思路：通过 Dashboard 可视化监控、Hooks 埋点、插件扩展、API 对外接口、纯脚本健康检查，构建完整的运维体系。

**Dashboard 任务监控**

启动 Web 监控面板：

```bash
hermes dashboard --port 8080
```

在浏览器访问 `http://127.0.0.1:8080`，可实现：

- 查看 Kanban Board 的实时状态
- 检查各 Profile 的任务负载
- 观察 dispatcher 调度日志
- 管理 MCP 服务器连接状态

**No-Agent Cron 站点健康监控**

使用纯脚本实现站点健康检查，**不消耗 LLM Token**，异常自动推送微信：

```bash
# 创建监控脚本
cat > ~/.hermes/scripts/blog-health-check.sh << 'EOF'
#!/bin/bash
# 检查博客站点是否正常
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://team.github.io/tech-blog/)
if [ "$STATUS" != "200" ]; then
  echo "BLOG DOWN: HTTP $STATUS"
  exit 1
fi
# 检查最近文章是否正常渲染
LATEST=$(curl -s https://team.github.io/tech-blog/index.html | grep -c "2026-06")
if [ "$LATEST" -eq 0 ]; then
  echo "WARNING: No June 2026 articles found on homepage"
  exit 1
fi
echo "OK: Blog healthy, status=$STATUS"
EOF

chmod +x ~/.hermes/scripts/blog-health-check.sh
```

创建定时任务：

```bash
hermes cron create "every 30m" \
  --no-agent \
  --script blog-health-check.sh \
  --deliver wechat \
  --name "blog-health-check"
```

:::note
**No-Agent Cron** 是 Hermes 的一个隐藏彩蛋——它允许创建「不启动 LLM Agent」的纯脚本任务。这种任务执行时不会消耗任何 Token，只是简单跑一个 shell 脚本然后把输出投递出去。对于「网站健康检查、磁盘空间监控、定时备份」这类不需要「思考」的运维任务特别合适。**生产环境部署一定要用起来，能省大量 Token。**
:::

**Hooks 记录 Token 消耗**

通过 `post_tool_call` 钩子实现工具调用埋点，记录 token 使用情况：

```bash
mkdir -p ~/.hermes/agent-hooks
```

创建钩子脚本 `~/.hermes/agent-hooks/token-tracker.sh`：

```bash
#!/usr/bin/env bash
# post_tool_call hook：记录每次 web_search 的调用
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // "unknown"')
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
if [ "$TOOL_NAME" = "web_search" ]; then
  echo "[$TIMESTAMP] web_search called" >> ~/.hermes/logs/token-usage.log
fi
printf '{}\n'      # 必须输出空 JSON，让 hook 返回无附加信息
```

在配置文件中注册钩子：

```yaml
# ~/.hermes/config.yaml
hooks:
  post_tool_call:
    - command: "~/.hermes/agent-hooks/token-tracker.sh"
      timeout: 5
```

添加执行权限：

```bash
chmod +x ~/.hermes/agent-hooks/token-tracker.sh
```

**SEO 检查插件**

自定义插件扩展文章审核能力，自动检查 SEO 质量：

1. 创建插件配置 `~/.hermes/plugins/seo-checker/plugin.yaml`：

```yaml
name: seo-checker
version: "1.0"
description: Checks blog post SEO metadata quality.
```

1. 创建插件逻辑 `~/.hermes/plugins/seo-checker/__init__.py`：

```python
import json

def register(ctx):
    # 定义工具的 schema（参数说明）
    schema = {
        "name": "check_seo",
        "description": "Check SEO metadata for a blog post.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Article title"},
                "description": {"type": "string", "description": "Meta description"},
                "content": {"type": "string", "description": "First 500 chars of article body"},
            },
            "required": ["title", "description"],
        },
    }

    def handle_seo(params, **kwargs):
        # 取出参数
        title = params.get("title", "")
        desc = params.get("description", "")
        content = params.get("content", "")
        issues = []       # 收集所有发现的问题

        # 标题长度检查（SEO 行业经验值：20-70 字符）
        if len(title) < 20:
            issues.append("Title too short (< 20 chars)")
        elif len(title) > 70:
            issues.append("Title too long (> 70 chars), may be truncated in search results")

        # 描述长度检查（50-160 字符）
        if len(desc) < 50:
            issues.append("Meta description too short (< 50 chars)")
        elif len(desc) > 160:
            issues.append("Meta description too long (> 160 chars)")

        # 关键词密度检查（核心关键词应占 0.5% 以上）
        words = content.lower().split()
        if words:
            keyword = title.lower().split()[0]      # 简单取标题第一个词作为关键词
            density = words.count(keyword) / len(words) * 100
            if density < 0.5:
                issues.append(f"Keyword '{keyword}' density low ({density:.1f}%)")

        # 综合评分：每项问题扣 20 分，最低 0 分
        score = max(100 - len(issues) * 20, 0)
        return json.dumps({
            "score": score,
            "issues": issues,
            "ok": len(issues) == 0,
        })

    # 把工具注册到框架
    ctx.register_tool(
        name="check_seo",
        toolset="blog_tools",                       # 归属到 blog_tools 工具集
        schema=schema,
        handler=handle_seo,
        description="Check SEO metadata quality for a blog post.",
    )
```

1. 启用插件：

```bash
hermes plugins enable seo-checker
```

启用后，Reviewer worker 审核文章时会自动调用 `check_seo` 工具。

:::tip
这个 SEO 插件是「5.4 Plugins 插件系统」的最佳实践示例——**50 行 Python 代码就扩展出一个生产级工具**。Hermes Agent 插件的妙处在于：`ctx.register_tool()` 一个调用就完成了工具注册、schema 声明、handler 绑定三件事，框架层零侵入。这就是「不被任何东西锁定」在工程上的真实体现。
:::

**API Server 外部触发**

启动 API 服务，支持外部系统主动触发任务：

```bash
# 启动 API Server
hermes api start --port 8080
```

外部系统调用示例：

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Hermes-Session-Id: urgent-publish-$(date +%s)" \
  -d '{
    "messages": [
      {"role": "user", "content": "紧急发布：把 content/posts/breaking-news.md 立即提交到 GitHub Pages，跳过常规审核流程。完成后发送通知到微信。"}
    ]
  }'
```

> 这种「对外暴露 OpenAI 兼容 API」的设计很关键——所有支持 OpenAI API 调用的客户端（Cursor、Cherry Studio、Lobe Chat、ChatBox……）都能直接对接 Hermes，不用装任何插件。**这是 Hermes 真正进入「基础设施」行列的标志。**

## 八、写在最后：工程视角的总结

回到一个更宏观的问题：**Hermes Agent 到底值不值得用？**

答案是：**对大多数中小团队来说，值得；对个人开发者来说，性价比极高；对大型企业，要看具体场景。**

它的价值不在某一个「爆点功能」，而在**整套体系的一致性**。你不需要自己拼凑「LangChain + LangGraph + Celery + Redis + 自研插件系统 + 自研定时任务 + 自研多 Agent 协作」，Hermes 把这些都封装好了，而且彼此衔接得顺。你拿到手就能跑，跑起来就能用，用起来能扩展——这才是「工程级框架」该有的样子。

几个我个人特别欣赏的设计哲学：

**1. 自进化但不失控**

Skills 可以自创、Curator 可以归档、Pinned 可以保护。Agent 既能「越用越聪明」，又不会「聪明到把系统搞崩」。Curator「只归档不删除」是这条设计哲学的核心兜底。

**2. 微信作为统一交互入口**

把微信（飞书、Telegram、Slack 同样）变成 Agent 的「遥控器」——人在外面、出差、午休时，也能下达指令、审批决策、收到通知。**这是「Agent 从工具变服务」的关键一步。**

**3. 全链路可观测**

Hooks 记录每一次工具调用、Token 消耗、时间戳；Dashboard 实时展示 Kanban 状态；API Server 暴露 OpenAI 兼容接口；No-Agent Cron 用零 Token 跑纯脚本运维。**「用得明白」是「用得放心」的前提**。

**4. 不被任何东西锁定**

模型可以换、平台可以换、工具可以换、技能可以换、记忆可以迁移。**你的数据归你，框架只是工具**。

如果你也想搭一套类似的 Agent 工作流，我的建议是：

1. **入门阶段**先跑通单链路（比如「Cron 触发 → Agent 调研 → 写文件」），验证基础能力
2. **能力阶段**接入 Gateway 微信/Telegram，完成「人机协同闭环」
3. **进化阶段**让 Agent 沉淀 2\~3 个自己的 Skills，体验「自进化」的真实效果
4. **协作阶段**引入 Kanban + 多 Profile，把多 Agent 协作跑起来
5. **运维阶段**补充 Dashboard + 健康检查脚本 + Token 追踪，形成完整体系

不要一上来就「复制整套实战篇」的 25 个功能——那会让你迷失在配置海洋里。从最小可用链路开始，一步步加能力。

2026 年最值得投入的方向：不是学某一个模型怎么用、某一个框架怎么调，而是**理解 Agent 整个工程范式是怎么运转的**。一旦你抓住了这层「元认知」，再换任何框架、任何模型，都会觉得是「降维打击」。

***

_延伸阅读：_

- _官方文档：<https://hermes-agent.nousresearch.com/docs>_
- _GitHub 仓库：<https://github.com/NousResearch/hermes-agent>_
- _Skills Hub 社区：<https://agentskills.io>_
- _官方在线 Demo：<https://hermes.nousresearch.com>_

