---
title: 编程生涯：命令工程之 RAG 项目实战
published: 2026-07-07
description: 命令工程系列的实战篇。以黑马 LangChain RAG 企业级电商知识库问答系统为载体，完整跑通 /idea → /plan → /build → /review → /fix → 压测验证的一条龙协作链。附 idea 命令提示词原文、plan 命令生成的完整项目计划文档、5 个真实 bug 的根因修复与回归测试三件套。
tags: [AI编程, 命令工程, RAG, LangChain, superpowers]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
承接《命令工程与 worktree 全实战》，本文用黑马 RAG 项目完整跑通 6+1 命令协作链——从 /idea 模糊想法到 100 并发压测验证，每一步都有真实提示词、真实计划文档、真实 bug 修复。
:::

## 一、缘起：为什么用黑马 RAG 项目当命令工程的「练兵场」

为什么选它当练兵场？我盘了一下，至少有四个理由：

| 特征           | 为什么适合当命令工程载体                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **链路完整**   | 课程覆盖「初版开发 → 单元测试 → BUG 调试 → 并发压测」全流程，每一环都有真实产物                                                |
| **模块清晰**   | 文档摄入、检索、生成三大管道，边界分明，能直接对应 /idea 设计稿的「数据流」字段                                                |
| **Bug 真实**   | 实际跑下来撞到 5 个非教学 Bug（API 端点错误、commit 缺失、会话串号、嵌入同步阻塞、阿里云业务空间端点），正是 /fix 命令的试金石 |
| **数据可量化** | 100 并发压测产出 23,514 个请求、14 个失败、<1% 失败率、2 秒平均延迟，刚好对照「结果导向」做复盘                                |

更重要的是，这条链路恰好是命令工程 6+1 协作链的标准演绎：

- **/idea** 解决「我想做 RAG」到「设计稿」的跨越
- **/plan** 解决「设计稿」到「可执行计划」的跨越
- **/build** 解决「计划」到「代码与测试」的跨越
- **/review** 解决「代码」到「发现偏离」的跨越
- **/fix** 解决「偏离」到「闭环修复」的跨越
- **压测**解决「闭环」到「生产可交付」的跨越

上篇讲「理论定义」，这篇讲「实战验证」。上篇讲「6 个命令」，这篇讲「6+1 协作链」。

## 二、/idea 命令：把「我想做 RAG」变成「可被消费的设计稿」

:::important
/idea 命令的精髓：把「我脑子里的想法」翻译成「下游命令能直接消费的字段」。脑暴、领域建模只是手段，**输出契约**才是目的。
:::

### 2.1 idea 命令的 frontmatter 与定位

承接上篇的定义，idea 命令的源码只有 2-3 行：

```markdown
---
name: idea
description: 把模糊想法变成清晰设计。
---

- **调用技能**: `brainstorming` + `domain-modeling`
- **达成目标**: 可被后续命令消费的设计稿
```

它的核心不是「让 AI 帮你想」，而是「**让 AI 帮你把想法结构化**」。前者叫闲聊，后者才是设计。

### 2.2 idea 命令的提示词原文

下面是我对 AI 说的原话，附带上下文参考——这正是 /idea 命令区别于「裸聊」的关键：**一定要给 AI 上下文**。

```text
我想做一个基于 LangChain 的 RAG 电商知识库问答系统。

# 上下文参考
请先读取以下资料：
LangChain RAG企业级电商知识库问答系统 整合学习笔记.md

# 目标
把「我想做 RAG」翻译成一份**可被 /plan 命令直接消费的设计稿**。

# 注意事项
- 不要写代码！只输出设计稿
- 不要堆砌技术名词，每个技术选型都要有通俗比喻
- 字段缺一不可，下游 /plan 命令会按这个契约消费你的输出
```

:::note
为什么把「输出契约」写进提示词？这是命令工程「最低程度的约束、最大限度的引导」原则的典型应用——我不限制 AI 怎么思考（这是引导），但我必须约束输出字段（这是契约），否则下游 /plan 命令没法消费。
:::

### 2.3 设计稿产出

AI 给我返回的设计稿长这样（截取核心）：

```text
# RAG 电商知识库问答系统 - 设计稿

## 1. 9 大核心模块
| 模块 | 职责（一句话） |
| --- | --- |
| 知识库管理 | 管理员上传/删除/重建文档索引 |
| 问答交互 | 普通用户提问 + 流式输出 + 引用来源 |
| 用户体系 | 注册/登录/修改密码 |
| 会话管理 | 每个用户独立会话空间 + 历史持久化 |
| 权限管控 | admin / user 角色隔离 |
| 文档摄入管道 | 文件加载 → 切分 → 向量化 → 入库 |
| 检索管道 | 问题向量化 → 相似度匹配 → Top-K |
| 生成管道 | LCEL 组装 → 大模型 → 流式响应 |
| 性能优化 | 流式输出 / 缓存 / 异步 / 索引调优 |

## 2. 三层架构（ASCII）
[浏览器]
    ↓ HTTP/SSE
[FastAPI] ← 鉴权 / 限流 / 日志
    ↓
[RAG 管道层] ← 摄入 / 检索 / 生成 三条独立链路
    ↓
[存储层] ← SQLite（元数据）+ ChromaDB（向量）+ 模型服务（本地 Ollama / 云端 DashScope）

## 3. 数据模型（4 张表）
- users（id / username / password_hash / role / is_active）
- conversations（id / user_id / title / is_active）
- messages（id / conversation_id / role / content / sources JSON）
- knowledge_documents（id / filename / status / uploaded_by）

向量库：collection 名 ecommerce_kb，每个 chunk 存 document + embedding + metadata

## 4. 关键架构决策
| 决策 | 选择 | 理由 | 替代方案 |
| --- | --- | --- | --- |
| RAG 框架 | LangChain LCEL | 声明式链式，适配直接 RAG | LangGraph（复杂度高，本项目无 Agent） |
| 流式协议 | SSE | 单向推送 + 浏览器原生支持 | WebSocket（全双工，冗余） |
| 关系库 | SQLite | 零配置，毕设友好 | PostgreSQL（需额外部署） |
| 向量库 | ChromaDB | Python 原生 + 零配置 | Milvus（重）/ Pinecone（云绑定） |
| 文本切分 | RecursiveCharacterTextSplitter + 中文分隔符 | 中文按句切分 | 默认分隔符（中文语义断裂） |
| 部署模式 | 双模式（本地 Ollama + 云端 DashScope） | 适配高/低配电脑 | 单模式（绑死硬件） |

## 5. 风险点
1. 中文文本切分：默认分隔符会导致语义断裂
2. 异步/同步混用：嵌入模型调用阻塞事件循环
3. 阿里云 SDK 更新：业务空间端点配置易遗漏
```

### 2.4 设计稿 → 后续命令的输入契约

设计稿产出的那一刻，/idea 命令就完成了它的使命。

下游的 /plan 命令会按这份设计稿的字段一一对照：9 大模块对应 9 个 commit 计划，4 张表对应 4 个数据模型 commit，5-6 个决策对应 5-6 个配置 commit，3 个风险点对应 3 个回归测试 commit。

**这就是「命令 = 接口」的威力——上游只关心输出契约，下游只关心输入契约，中间怎么实现是 AI 的事。**

## 三、/plan 命令：把设计稿固化为可执行的项目计划

:::important
/plan 命令的精髓：不是「把设计稿抄一遍」，而是「把设计稿翻译成可被 /build 一行行 commit 出去的清单」。
:::

### 3.1 复用 IDE 内置 /plan 的策略

上篇文章讲过：「能用 IDE 内置就别自己造」。/plan 就是典型——它不涉及个人审美、也不涉及 Skill 编排，纯粹是把「设计稿」翻译成「分步执行清单」。

### 3.2 RAG 项目计划文档

:::note
**重要前提**：黑马课程的实战节奏不是按 Sprint 分批的，而是「**初版开发 → 单元测试 → BUG 调试 → 并发压测**」一条龙。所以这份计划文档的章节结构是按「阶段」切，而不是按「Sprint」切。
:::

下面是生成的计划文档（截取核心）：

```markdown
# RAG 电商知识库问答系统 - 项目计划

## 一、技术栈总览

| 技术                       | 类比       | 用途                |
| -------------------------- | ---------- | ------------------- |
| LangChain                  | 流水线工厂 | 串联 RAG 的所有组件 |
| ChromaDB                   | 仓库货架   | 存向量数据          |
| FastAPI                    | 前台接待   | 接收请求 + 返回响应 |
| React                      | 顾客界面   | 用户聊天窗口        |
| Ollama / DashScope         | 大脑       | 本地 / 云端大模型   |
| bge-m3 / text-embedding-v2 | 翻译官     | 把文字变向量        |

## 二、分阶段计划

### 阶段 0：基础设施

- commit 0.1：项目目录结构 + 依赖管理
- commit 0.2：start.bat 启动脚本（双击一键起前后端）
- commit 0.3：环境变量与配置文件

### 阶段 1：初版开发（对应 /build）

- commit 1.1：FastAPI 骨架 + 路由分层
- commit 1.2：LangChain 集成 + ChromaDB 接入
- commit 1.3：文档 Loader 适配（PDF/DOCX/CSV/XLSX）
- commit 1.4：摄入管道（切分 → 向量化 → 入库）
- commit 1.5：检索管道（相似度匹配 → Top-K）
- commit 1.6：生成管道（LCEL 组装 + 提示词模板）
- commit 1.7：SSE 流式输出
- commit 1.8：React 前端聊天界面 + 引用来源卡片
- commit 1.9：JWT 鉴权 + 角色守卫

### 阶段 2：单元测试（对应 /build 的 TDD 部分）

- commit 2.1：迁移 unit test 技能
- commit 2.2：后端测试用例（35+ 个）
- commit 2.3：执行测试 + 生成报告

### 阶段 3：BUG 调试（对应 /review + /fix）

- commit 3.1：修复 API Base URL 错误
- commit 3.2：修复数据库 commit 缺失
- commit 3.3：修复会话存储用户隔离
- commit 3.4：修复嵌入调用同步阻塞
- commit 3.5：修复阿里云业务空间端点

### 阶段 4：并发压测（对应压测验证）

- commit 4.1：Locust 压测脚本
- commit 4.2：批量注册 100 个测试用户
- commit 4.3：阶梯加压（10→50→100）
- commit 4.4：报告解读 + 二次修复

## 三、命令链映射

| 阶段 | 主命令             | 辅助命令 | 预期产出                     |
| ---- | ------------------ | -------- | ---------------------------- |
| 0    | /build             | —        | 可运行项目骨架               |
| 1    | /build             | /fix     | 9 个 commit + 初版可演示     |
| 2    | /build（启用 TDD） | —        | 测试覆盖率 ≥ 80%             |
| 3    | /review            | /fix     | 5 个 fix commit + 全功能通过 |
| 4    | 压测脚本           | /fix     | 100 并发稳定通过             |
```

### 3.3 计划文档与 /build 的衔接关系

计划文档最关键的作用是**给 /build 命令提供可消费的 commit 清单**。

当我调用 /build 命令时，我只需要说：

```text
/build
# 任务
按计划文档实施 RAG 项目阶段 1（初版开发）
```

/build 命令会自动消费这份计划文档的「阶段 1」章节，并逐个 commit 出去。

### 3.4 计划文档与 /review 的衔接关系

计划文档的另一个隐藏价值是**给 /review 命令的 spec 轴提供对照表**。

/review 命令的 spec 轴会问：「这个 commit 是否偏离计划文档？」如果没有计划文档，spec 轴就无从对照——这正是「/plan 永远不能省」的根本原因。

## 四、/build 命令：TDD 实施核心代码

:::important
/build 命令的精髓：把「计划」变成「git log 上的一串 commit」。每个 commit 都要可独立回滚、可独立验证、可独立复盘。
:::

### 4.1 build 命令的 frontmatter 与工作流

```markdown
---
name: build
description: 按 TDD 高质量实现功能。
---

- **调用技能**: `using-git-worktrees` + `tdd` + `code-review` + `verification-before-completion`
- **达成目标**: 经过测试覆盖、审查通过、验证完成的实现
```

调用 /build 时，它会按以下流程自动执行：

```text
1. git worktree add .worktrees/rag-sprint -b feature/rag-xxx
2. cd 到 worktree
3. 写测试（红）
4. 写实现（绿）
5. 重构
6. 自我 code-review
7. verification-before-completion（pnpm check / pnpm format / pnpm build）
8. commit
9. 提示用户是否合并回主分支
```

### 4.2 黑马课程的「初版开发」阶段 → 对应 /build 的实施

黑马课程的初版开发一共产生了 9 个核心 commit。我把每个 commit 浓缩成「业务场景 + 核心代码 + 技术要点」三件套。

#### commit 1.1：FastAPI 骨架 + 路由分层

**业务场景**：用户打开浏览器，要能看到一个能登录、能跳转到聊天页的最小骨架。

**核心代码**：

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 初始化 FastAPI 应用
app = FastAPI(title="RAG 电商知识库", version="1.0.0")

# 配置 CORS（允许前端跨域调用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite 默认端口
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由注册
from app.api import auth, chat, kb, conversations
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(chat.router, prefix="/api/chat", tags=["问答"])
app.include_router(kb.router, prefix="/api/kb", tags=["知识库"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["会话"])
```

**技术要点**：路由分层是 FastAPI 项目的「楼层」——认证、问答、知识库、会话各占一层，后续加新功能只需要加一层，不用动主体。

#### commit 1.4：摄入管道（切分 → 向量化 → 入库）

**业务场景**：管理员上传一份 PDF 尺码推荐表，系统要能自动切成小块、向量化、入库。

**核心代码**：

```python
# backend/app/services/ingestion.py
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_community.vectorstores import Chroma

# 关键：自定义中文分隔符（避免从句子中间切断）
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=100,
    separators=["\n\n", "\n", "。", "；", "，", " "],  # 中文标点优先
)

async def ingest_document(file_path: str, file_type: str, metadata: dict):
    # 1. 根据文件类型选 loader
    loader = get_loader(file_path, file_type)

    # 2. 加载并切分
    docs = loader.load()
    chunks = text_splitter.split_documents(docs)

    # 3. 丰富元数据（来源、品类、chunk 序号、hash）
    for i, chunk in enumerate(chunks):
        chunk.metadata.update({
            "source": file_path,
            "chunk_index": i,
            "chunk_hash": hashlib.md5(chunk.page_content.encode()).hexdigest(),
            **metadata,
        })

    # 4. 去重（基于 hash）
    chunks = deduplicate_by_hash(chunks)

    # 5. 批量向量化 + 写入 ChromaDB
    embeddings = DashScopeEmbeddings(model="text-embedding-v2")
    vectorstore = Chroma(
        collection_name="ecommerce_kb",
        embedding_function=embeddings,
        persist_directory="./data/chroma",
    )
    vectorstore.add_documents(chunks)  # LangChain 内部已优化批量写入
```

**技术要点**：中文文本切分必须补充中文标点，否则会在「我在学编程」这种完整句子的中间切断（「我在学」+「编程」），严重影响检索准确率。

#### commit 1.6：生成管道（LCEL 组装 + 提示词模板）

**业务场景**：用户问「身高 172 体重 136 斤穿什么尺码？」，系统要能基于知识库给出答案 + 引用来源。

**核心代码**：

```python
# backend/app/services/rag.py
from langchain.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatTongyi
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain_core.output_parsers import StrOutputParser

# 1. 提示词模板（严格要求只基于参考资料回答）
prompt = ChatPromptTemplate.from_template("""
你是一个专业的电商产品助手。请严格基于以下参考资料回答用户问题，
不要使用参考资料以外的知识。如果参考资料无法回答问题，请直接说"无法回答"。

# 参考资料
{context}

# 对话历史
{chat_history}

# 用户问题
{question}
""")

# 2. 检索器（基于 ChromaDB 的相似度搜索）
retriever = vectorstore.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"k": 5, "score_threshold": 0.4},  # 相似度阈值 0.4
)

# 3. LCEL 链式组装（声明式！）
def format_docs(docs):
    return "\n\n".join([f"【来源{i+1}】{d.page_content}" for i, d in enumerate(docs)])

rag_chain = (
    RunnableParallel({
        "context": retriever | format_docs,  # 检索 + 格式化
        "question": RunnablePassthrough(),   # 透传问题
    })
    | prompt
    | ChatTongyi(model="qwen-plus", temperature=0.3, streaming=True)  # 大模型
    | StrOutputParser()
)

# 4. 调用
async def stream_answer(question: str, chat_history: list):
    async for chunk in rag_chain.astream(question):
        yield chunk
```

**技术要点**：LCEL（LangChain Expression Language）像一根「管道」——把「检索 → 格式化 → 提示词 → 大模型 → 输出解析」按顺序串起来，每一步都可以独立替换。这正是 LangChain 的精髓：**组合优于继承**。

### 4.3 与上篇「跨层协作链」的呼应

上篇文章讲过：「/build 是协作链的『实施者』」。

在 RAG 项目中，/build 消化的是 /plan 输出的 9 个 commit 清单，产出的是 9 个可独立回滚的代码单元。后续的 /review 和 /fix 才有东西可审、有东西可修。

## 五、/review 命令：双轴审查发现 5 个致命问题

:::important
/fix 命令的精髓：把「review 报告」变成「git log 上的修复 commit」。每个修复都要可复现、可回归、可追责。
:::

### 5.1 review 命令的 frontmatter 与双轴机制

```markdown
---
name: review
description: 双轴审查代码变更。
---

- **调用技能**: `code-review` + `receiving-code-review`
- **达成目标**: standards 违规清单 + spec 偏离清单
```

它会派发 2 个并行子代理：

- **standards 轴子代理**：对照 Biome 规则 + PEP 8 + 项目编码规范
- **spec 轴子代理**：对照 /plan 输出的计划文档 + 设计要求

### 5.2 standards 轴：发现 2 个规范问题

| 编号 | 问题                                             | 位置                          | 严重度 |
| ---- | ------------------------------------------------ | ----------------------------- | ------ |
| S1   | 异步端点中混用同步调用                           | `backend/app/services/rag.py` | minor  |
| S2   | 错误处理吞异常（try/except 后只 print 不 raise） | `backend/app/api/chat.py`     | minor  |

S1 的具体表现：嵌入模型调用是同步的（`embeddings.embed_query()`），但 FastAPI 端点是 `async def`，导致事件循环被同步调用阻塞。

S2 的具体表现：前端调用问答接口失败时，后端只 `print(e)`，不抛出，导致前端看到的是「生成失败」但看不到具体原因。

### 5.3 spec 轴：发现 3 个致命偏离

| 编号 | 问题                 | 偏离点                     | 严重度 |
| ---- | -------------------- | -------------------------- | ------ |
| P1   | API Base URL 错误    | 未使用阿里云百炼的正确端点 | 致命   |
| P2   | 数据库 commit 缺失   | 向量化后状态不更新         | 致命   |
| P3   | 会话存储未做用户隔离 | 前端 store 串号            | 致命   |

P1 的具体表现：阿里云 SDK 更新后需要指定业务空间端点，否则嵌入模型调用失败。

P2 的具体表现：上传文档后，UI 一直显示「处理中」，但实际向量已经入库。根因是向量化完成后，缺少 `await session.commit()`，导致 `knowledge_documents.status` 没更新。

P3 的具体表现：普通用户登录后，切换到 admin 账号，能看到 admin 的历史聊天记录。根因是前端 Zustand store 只按 `conversation_id` 索引，没按 `user_id` 过滤。

### 5.4 聚合报告

/review 命令最终输出 5 个问题，按严重度排序：

```text
[致命] P1: API Base URL 错误 → 阻塞整个问答链路
[致命] P2: 数据库 commit 缺失 → 阻塞知识库管理
[致命] P3: 会话存储串号 → 阻塞多用户场景
[minor] S1: 同步阻塞事件循环 → 100 并发必崩
[minor] S2: 错误处理吞异常 → 排查效率低
```

这 5 个问题 → 5 个 /fix commit，下一节展开。

## 六、/fix 命令：5 个问题的根因修复与回归测试

:::important
/fix 命令的精髓：把「review 报告」变成「git log 上的修复 commit」。每个修复都要可复现、可回归、可追责。
:::

### 5.1 fix 命令的 frontmatter 与 4 步法

```markdown
---
name: fix
description: 系统性诊断并修复 bug。
---

- **调用技能**: `diagnosing-bugs` + `receiving-code-review`
- **达成目标**: 根因明确的修复 + 回归测试覆盖
```

4 步法：复现 → 根因 → 修复 → 回归测试。下面 5 个问题都按这个结构展开。

### 6.1 问题 P1：API Base URL 错误

**现象**：问答失败，后端无报错日志。

**根因**：阿里云百炼 SDK 更新后，`ChatOpenAI` 的 OpenAI 兼容模式需要指定业务空间端点。原来的代码用全局端点 `https://dashscope.aliyuncs.com/compatible-mode/v1`，但实际需要从 API Key 文件中读取业务空间级别的端点。

**修复代码**：

```python
# backend/app/core/llm.py（修改前）
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",  # 全局端点（错误）
    api_key=settings.DASHSCOPE_API_KEY,
    model="qwen-plus",
)

# backend/app/core/llm.py（修改后）
from langchain_community.chat_models import ChatTongyi  # 改用阿里云原生集成

llm = ChatTongyi(
    model="qwen-plus",
    temperature=0.3,
    streaming=True,
    dashscope_api_key=settings.DASHSCOPE_API_KEY,
    # 业务空间端点从环境变量读取
    base_url=settings.DASHSCOPE_BASE_URL,
)
```

**回归测试**：

```python
# tests/test_llm_connection.py
async def test_llm_connection_with_business_endpoint():
    """验证使用业务空间端点后 LLM 能正常调用"""
    from app.core.llm import llm

    response = await llm.ainvoke("你是什么模型？")
    assert "通义千问" in response.content or "qwen" in response.content.lower()
```

### 6.2 问题 P2：数据库 commit 缺失

**现象**：上传文档后，UI 一直显示「处理中」，但实际查询能命中数据。

**根因**：向量化完成后，异步任务更新 `knowledge_documents.status = 'indexed'`，但没有 `await session.commit()`，导致事务没提交，状态没落库。

**修复代码**：

```python
# backend/app/services/ingestion.py（修改后）
async def update_document_status(doc_id: int, status: str, chunk_count: int):
    async with async_session() as session:
        doc = await session.get(KnowledgeDocument, doc_id)
        doc.status = status
        doc.chunk_count = chunk_count

        await session.commit()  # 关键：之前漏了这一行
```

**回归测试**：

```python
# tests/test_ingestion_status.py
async def test_document_status_updated_after_ingestion():
    """验证向量化后 status 字段正确更新"""
    doc = await create_test_document("test.pdf")
    await ingest_document(doc.path, "pdf", {"category": "test"})

    # 刷新会话，查最新状态
    refreshed = await get_document(doc.id)
    assert refreshed.status == "indexed"
    assert refreshed.chunk_count > 0
```

### 6.3 问题 P3：会话存储串号

**现象**：普通用户登录后，切换到 admin，能看到 admin 的历史聊天。

**根因**：前端 Zustand store 按 `conversation_id` 索引，没按 `user_id` 过滤。切换账号时，store 没清空。

**修复代码**：

```typescript
// frontend/src/stores/chatStore.ts（修改后）
import { create } from "zustand";

interface ChatState {
  conversations: Record<number, Conversation>; // key: conversation_id
  currentUserId: number | null;

  // 修复：增加 user_id 过滤
  getConversationsByUser: (userId: number) => Conversation[];

  // 修复：切换账号时清空 store
  clearOnUserSwitch: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: {},
  currentUserId: null,

  getConversationsByUser: (userId) => {
    return Object.values(get().conversations).filter(
      (c) => c.user_id === userId,
    );
  },

  clearOnUserSwitch: () => set({ conversations: {}, currentUserId: null }),

  // 在登录成功后调用
  setUser: (userId) => {
    get().clearOnUserSwitch();
    set({ currentUserId: userId });
  },
}));
```

**回归测试**：

```typescript
// tests/stores/chatStore.test.ts
describe("chatStore user isolation", () => {
  it("should not return admin conversations to regular user", () => {
    const store = useChatStore.getState();

    // admin 的会话
    store.addConversation({ id: 1, user_id: 1, title: "admin 聊天" });
    // 普通用户的会话
    store.addConversation({ id: 2, user_id: 2, title: "user 聊天" });

    // 普通用户只能看到自己的
    const userChats = store.getConversationsByUser(2);
    expect(userChats).toHaveLength(1);
    expect(userChats[0].title).toBe("user 聊天");
  });
});
```

### 6.4 问题 S1：嵌入调用同步阻塞

**现象**：100 并发时，系统响应时间从 2s 暴涨到 30s+，部分请求超时。

**根因**：嵌入模型调用是同步的（`embeddings.embed_query()`），但 FastAPI 端点是 `async def`。同步调用会阻塞事件循环，导致所有请求串行排队。

**修复代码**：

```python
# backend/app/services/retrieval.py（修改后）
from langchain_community.embeddings import DashScopeEmbeddings
import asyncio

class AsyncEmbeddings:
    """异步包装的嵌入模型，避免阻塞事件循环"""

    def __init__(self, model: str = "text-embedding-v2"):
        self.sync_embeddings = DashScopeEmbeddings(model=model)

    async def aembed_query(self, text: str) -> list[float]:
        # 把同步调用丢到线程池，避免阻塞
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self.sync_embeddings.embed_query,
            text,
        )

# 使用方式
embeddings = AsyncEmbeddings()
retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 5},
)
```

**回归测试**：

```python
# tests/test_async_embedding.py
import time

async def test_concurrent_embedding_not_blocking():
    """验证 10 个并发嵌入调用不会被串行阻塞"""
    embeddings = AsyncEmbeddings()
    queries = ["问题" + str(i) for i in range(10)]

    start = time.time()
    results = await asyncio.gather(*[embeddings.aembed_query(q) for q in queries])
    elapsed = time.time() - start

    assert len(results) == 10
    # 10 个并发调用应该在 5 秒内完成（如果串行会需要 10+ 秒）
    assert elapsed < 5.0, f"耗时 {elapsed}s 过长，可能被串行阻塞"
```

### 6.5 问题 S2：阿里云业务空间端点

**现象**：嵌入模型调用失败，提示「Invalid endpoint」。

**根因**：阿里云 API Key 文件中包含业务空间级别的端点（如 `https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`），但代码中没读取这个配置，用的是全局端点。

**修复代码**：

```python
# backend/app/core/config.py（修改后）
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DASHSCOPE_API_KEY: str
    # 新增：业务空间端点
    DASHSCOPE_BASE_URL: str = "https://dashscope.aliyuncs.com/api/v1"

    # 从 API Key 文件中读取的端点配置
    # 格式：endpoint = https://dashscope.aliyuncs.com/api/v1/services/aigc/...
    @property
    def dashscope_endpoint(self) -> str:
        return self.DASHSCOPE_BASE_URL
```

**回归测试**：

```python
# tests/test_dashscope_endpoint.py
def test_dashscope_endpoint_configured():
    """验证阿里云业务空间端点正确配置"""
    from app.core.config import settings

    assert settings.DASHSCOPE_BASE_URL is not None
    assert "dashscope.aliyuncs.com" in settings.DASHSCOPE_BASE_URL
```

### 6.6 5 个 fix commit 的 commit message

按 conventional commits 规范：

```text
3.1 fix(rag): correct DashScope API base URL
     - Switch from ChatOpenAI to ChatTongyi native integration
     - Add business workspace endpoint configuration
     - Add regression test for LLM connection

3.2 fix(kb): commit document status after ingestion
     - Add await session.commit() in update_document_status
     - Add regression test for status persistence

3.3 fix(chat): isolate conversations by user_id
     - Add user_id filter to chatStore
     - Clear store on user switch
     - Add regression test for user isolation

3.4 perf(rag): wrap embedding call in async executor
     - Create AsyncEmbeddings class to avoid blocking event loop
     - Add regression test for concurrent embedding

3.5 fix(config): load DashScope business endpoint from settings
     - Add DASHSCOPE_BASE_URL configuration
     - Add regression test for endpoint config
```

## 七、压测验证：从 10 并发到 100 并发的完整链路

:::important
压测是命令工程协作链的「验证关」——前面的 /idea /plan /build /review /fix 都做对了，但能不能扛住真实流量？压测说了算。
:::

### 7.1 压测方案设计

黑马课程的压测方案分两个场景：

| 场景         | 覆盖范围                     | Token 消耗 | 适用阶段     |
| ------------ | ---------------------------- | ---------- | ------------ |
| **轻量场景** | 登录、注册、会话 CRUD        | 无         | 验证基础架构 |
| **重型场景** | RAG 问答链路（含嵌入 + LLM） | 有         | 验证核心业务 |

**关键约束**：阿里云免费额度 100 万 token，100 并发压测时会快速消耗，所以采用「10 → 50 → 100」阶梯加压策略。

### 7.2 Locust 压测脚本

```python
# backend/tests/load/locustfile.py
from locust import HttpUser, task, between

class ChatUser(HttpUser):
    """模拟问答用户"""
    wait_time = between(1, 3)  # 用户思考时间

    def on_start(self):
        # 登录获取 token
        response = self.client.post("/api/auth/login", json={
            "username": "test_user",
            "password": "test123",
        })
        self.token = response.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    @task(3)  # 权重 3：问答最频繁
    def ask_question(self):
        self.client.post(
            "/api/chat/ask",
            json={"question": "身高 172 体重 136 斤穿什么尺码？", "stream": False},
            headers=self.headers,
        )

    @task(1)  # 权重 1：偶尔新建会话
    def create_conversation(self):
        self.client.post(
            "/api/conversations",
            json={"title": "压测会话"},
            headers=self.headers,
        )


class AuthUser(HttpUser):
    """模拟注册/登录用户"""
    wait_time = between(1, 2)

    @task
    def register(self):
        import random
        username = f"loadtest_{random.randint(1, 10000)}"
        self.client.post("/api/auth/register", json={
            "username": username,
            "password": "test123",
        })
```

### 7.3 压测执行与实时监控

通过 Locust Web UI（`http://localhost:8089`）执行阶梯加压：

```text
阶段 1：10 用户 → RPS 稳定在 2.38
阶段 2：50 用户 → RPS 提升到 7.48，失败率仍为 0
阶段 3：100 用户 → RPS 达到 8.82，偶尔出现失败
```

**关键观察**：

- 50 用户之前，RPS 线性增长，失败率 0
- 100 用户时，RPS 增长放缓，开始出现 0.02 次/秒 的失败
- 14 个失败请求均为网络超时（客户端主动断开），不是服务端崩溃

### 7.4 压测报告解读

通过 Locust 导出 HTML 报告后，再次调用 AI 解读（这也是 /review 命令的延伸用法）：

```text
# AI 解读压测报告

## 总体成绩
- 总请求数：23,514
- 失败数：14
- 失败率：0.06%（< 1%，优秀）
- 吞吐量：受限于阿里云 API QPS 限制

## 分场景分析
| 场景 | 端点 | 平均延迟 | 失败率 |
| --- | --- | --- | --- |
| 登录 | POST /api/auth/login | 1.2s | 0% |
| 注册 | POST /api/auth/register | 0.8s | 0% |
| 会话列表 | GET /api/conversations | 0.3s | 0% |
| 问答 | POST /api/chat/ask | 2.1s | 0.1% |
| 知识库搜索 | POST /api/kb/search | 0.9s | 0% |

## 关键结论
1. CRUD 表现极好：延迟低、失败率为 0
2. RAG 问答表现稳定：平均 2s，用户无感
3. 知识库搜索延迟较高：嵌入 API 调用开销
4. 14 个失败均为网络层面，非服务端问题
```

### 7.5 压测发现 + /fix 闭环

压测中暴露的最严重问题是**S1：嵌入调用同步阻塞**。

修复前 100 并发响应时间 30s+，修复后 100 并发响应时间 2s——这就是「压测 → /fix 闭环」的威力。

**完整链路**：

```text
/build（commit 1.4 摄入管道）
    ↓
/review（发现 S1 同步阻塞）
    ↓
/fix（commit 3.4 异步化重构）
    ↓
压测（100 并发 2s 稳定）
    ↓
/build（commit 4.4 压测二次修复）
    ↓
再次压测（100 并发稳定通过）
```

<br />

## 八、写在最后：从「理论定义」到「实战验证」

如果说上篇文章是「我提出了命令工程」，那这篇文章就是「我用命令工程做出了一个能跑的系统」。

**提出概念容易，验证概念难。**

希望这篇文章能让读者看到：命令工程不是 PPT 里的方法论，而是每天都能用的工作流。

---

_如果你也在用 AI 编程，欢迎分享你的命令协作链。_
