---
title: 编程生涯：Spring AI 与 LangChain4J——Java 开发者拥抱 AI 的双引擎
published: 2026-01-25
description: 2026年1月25日，我正式踏入了 Java AI 应用开发的大门。从 Spring AI 到 LangChain4J，这篇文章记录我跟随黑马课程学习两大 Java AI 框架的完整历程，以及它们如何让我这个 Java 开发者终于能挺直腰板说「我们也能做 AI」。
tags: [Spring AI, LangChain4J]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这篇文章，记录我学习 Spring AI 和 LangChain4J 的完整历程，也是一篇面向 Java 开发者的 AI 框架入门指南。
:::

## 初识 AI 困境：Java 开发者的「生态孤岛」

第一次接触 AI 应用开发，是在 2025 年底。

那时候 ChatGPT 正火，各种 AI 应用层出不穷。我兴致勃勃地打开教程，准备跟着做点什么——然后就傻眼了。

**全是 Python。**

LangChain、LlamaIndex、AutoGPT……每一个都在告诉你：「欢迎来到 AI 时代！」，然后转头用 Python 跟你打招呼。

我当时的心情，大概是这样的：

```
我的技能树：
├── Java ✓
├── Spring Boot ✓
├── MySQL ✓
└── AI开发 ✗（需要 Python）

等等，这不是耍我吗？
```

作为一个主攻Java 的后端仔，我陷入了深深的自我怀疑——难道 AI 时代，Java 真的只能当配角？

后来我才明白，不是 Java 不行，是 **工具链还没到位**。

:::note
2025 年到 2026 年，是 Java AI 框架的爆发期。Spring AI、LangChain4J、Spring AI Alibaba 等框架的集体亮相，彻底填补了 Java 在 LLM 应用开发上的空白。
:::

## Spring AI：Spring 生态的 AI 一等公民

### 官方出手，意义非凡

2025 年底，Spring 官方放出了大招——**Spring AI 2.0 正式发布**。

这意味着什么？

| 变化前                       | 变化后                |
| ------------------------- | ------------------ |
| Java 接 AI：需要搭 Python 中间层  | Java 直接接 AI：一个依赖搞定 |
| 学习成本：Spring + Python 两套生态 | 学习成本：只需 Spring 生态  |
| 维护成本：两套服务、两套部署            | 维护成本：一套服务、一套部署     |

Spring AI 的核心理念很明确——**让 AI 能力成为 Spring 生态中的一等公民**。

### 五分钟上手：零门槛集成

跟着黑马课程，我第一次跑通了 Spring AI 项目。

**1. 添加依赖**

```xml
<!-- Spring Initializr 选择 Spring Web + Spring AI OpenAI -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
    <version>1.0.0</version>
</dependency>
```

**2. 配置文件**

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      base-url: https://api.openai.com/v1
```

**3. 编写代码**

```java
@RestController
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder) {
        // 注入 Builder，通过它创建 ChatClient 实例
        this.chatClient = builder.build();
    }

    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        // 使用 ChatClient 进行对话
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    }
}
```

**运行效果：**

```
POST http://localhost:8080/chat?message=你好
-> 返回："你好！有什么可以帮助你的吗？"
```

就这么简单。没有复杂的初始化，没有繁琐的模板代码，一切都是 Spring 开发者熟悉的味道。

:::note
Spring AI 采用了 Spring Boot 一贯的「约定优于配置」理念。引入 Starter 后，所有的 Bean 都会被自动扫描、自动配置，你可以直接 `@Autowired` 注入 `ChatClient` 来使用，就像你使用 `JdbcTemplate` 一样自然。
:::

### ChatClient：统一 API 的威力

Spring AI 2.0 引入了 `ChatClient` 作为统一 API，彻底取代了之前的 `AiClient`。

```java
// Spring AI 1.x（旧）
AiClient aiClient = ...;
String response = aiClient.generate(prompt);

// Spring AI 2.x（新）
ChatClient chatClient = ...;
String response = chatClient.prompt()
    .user(prompt)
    .call()
    .content();
```

这种 Builder 模式的 `ChatClient` 带来了更强的表达力：

```java
// 多轮对话
ChatClient chatClient = ...;
String response = chatClient.prompt()
    .system("你是一个有帮助的编程助手")
    .user("什么是依赖注入？")
    .call()
    .content();

// 流式响应（打字机效果）
Flux<String> stream = chatClient.prompt()
    .user("给我讲一个故事")
    .stream()
    .content();
```

### 核心技术特性

| 特性           | 说明                        | 代码示例                        |
| ------------ | ------------------------- | --------------------------- |
| **统一模型 API** | 一套代码切换 OpenAI/Claude/通义千问 | `ChatClient` 统一接口           |
| **结构化输出**    | 自动解析 JSON 到 Java 对象       | `.entity(User.class)`       |
| **工具调用**     | 让 AI 调用 Java 方法           | `@Tool` 注解                  |
| **RAG 支持**   | 检索增强生成                    | `VectorStore` + `Retriever` |
| **多模态**      | 支持图像、音频处理                 | `MultiModalClient`          |

```java
// 结构化输出示例：让 AI 返回 Java 对象
ChatClient chatClient = ...;

MovieRecommendation recommendation = chatClient.prompt()
    .system("你是一个电影推荐专家")
    .user("推荐一部科幻电影")
    .call()
    .entity(MovieRecommendation.class);

// 自动映射到 Java 类
public class MovieRecommendation {
    private String title;
    private String director;
    private int year;
    private double rating;
}
```

### 我的第一个 Spring AI 项目：智能客服

跟着黑马课程，我做了一个智能客服的 demo：

```java
@Service
public class CustomerService {

    private final ChatClient chatClient;

    public CustomerService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    public String answer(String question) {
        // 构建提示词
        String prompt = """
            你是一个专业的客服助手。
            请根据以下问题给出有帮助的回答。

            问题：%s

            要求：
            1. 回答专业、友好
            2. 如果不确定，请说「我需要查询一下」
            3. 回答控制在 100 字以内
            """.formatted(question);

        return chatClient.prompt()
            .system(prompt)
            .call()
            .content();
    }
}
```

**接口测试：**

```bash
POST http://localhost:8080/api/customer/answer
Content-Type: application/json

{
    "question": "你们的发货时间是几点？"
}

-> {
    "answer": "您好！我们的发货时间截止到每天下午4点。4点前的订单当天发货，4点后的订单次日发货。如有疑问可随时联系客服～"
}
```

那一刻，我真实地感受到了 AI 落地的快乐。

## LangChain4J：Java 生态最活跃的 AI 框架

### 不是移植，是重塑

如果说 Spring AI 是「Spring 生态的 AI 扩展」，那 LangChain4J 就是「专为 Java 重新设计的 LLM 应用框架」。

LangChain4J 并不是简单地把 Python 的 LangChain 翻译成 Java。它融合了 Haystack、LlamaIndex 等多个项目的优秀理念，打造了一套**专为 Java 开发者设计**的模块化工具集。

**最大的特点：框架无关。**

无论你用 Spring Boot、Quarkus、Micronaut，还是纯 Java SE，都可以无缝集成 LangChain4J。

### AI Services：声明式 AI 编程

LangChain4J 最让我惊艳的特性——**AI Services**。

它借鉴了 Spring Data JPA 的思想：定义接口，框架生成实现。

```java
// 定义接口
@AiService
interface Assistant {

    @UserMessage("请用{{language}}语言回答：{{content}}")
    String translate(@V("content") String content, @V("language") String language);

    @UserMessage("{{question}}")
    String answer(@V("question") String question);
}

// 创建实例（框架自动生成实现）
ChatLanguageModel model = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4-turbo")
    .build();

Assistant assistant = AiServices.create(Assistant.class, model);

// 使用
String translation = assistant.translate("Hello", "中文");
// -> "你好"

String answer = assistant.answer("什么是 Spring Boot？");
// -> "Spring Boot 是一个基于 Spring 框架的..."
```

**这意味着什么？**

你不需要写任何实现代码，只需要定义接口和注解，LangChain4J 会帮你处理：

- Prompt 组装
- 参数替换
- 结果解析
- 异常处理

### 核心组件一览

```
LangChain4J 架构
├── Model（模型层）
│   ├── ChatLanguageModel  - 聊天模型
│   ├── EmbeddingModel      - 向量模型
│   └── ImageModel          - 图像模型
├── Service（服务层）
│   ├── AiServices         - 声明式 AI 服务
│   ├── AiClazz           - AI 类（新版特性）
│   └── Agent              - 智能代理
├── Memory（记忆层）
│   ├── MessageWindowChatMemory  - 消息窗口
│   └── TokenWindowChatMemory   - Token 窗口
├── Tool（工具层）
│   └── @Tool              - 工具调用注解
├── RAG（检索层）
│   ├── EmbeddingStore     - 向量存储
│   ├── Retriever          - 检索器
│   └── ContentRetriever   - 内容检索
└── Chain（链式层）
    ├── LLMChain           - LLM 链
    └── ConversationalChain - 对话链
```

### 工具调用：让 AI 拥有「手脚」

这是 LangChain4J 最强大的能力之一——让 AI 调用 Java 方法。

```java
// 定义工具类
public class Calculator {

    @Tool("计算数学表达式，支持加减乘除")
    public double calculate(@P("数学表达式，如 1+2*3") String expression) {
        return evaluate(expression);
    }

    @Tool("获取当前天气")
    public String getWeather(@P("城市名称") String city) {
        // 实际项目中这里会调用天气 API
        return "25°C，晴";
    }
}

// 创建带工具的 Agent
Calculator calculator = new Calculator();

Assistant agent = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .tools(calculator)  // 注册工具
    .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
    .build();

// 提问
String answer = agent.chat(
    "北京现在多少度？帮我算一下 123 * 456 等于多少？"
);

// AI 会自动：
// 1. 识别需要调用的工具
// 2. 调用 getWeather("北京") 和 calculate("123*456")
// 3. 整合结果返回
```

**返回结果：**

```
北京当前天气：25°C，晴。
123 × 456 = 56,088。
```

### RAG 实战：企业知识库问答

黑马课程的重头戏——用 LangChain4J 实现 RAG（检索增强生成）。

```java
// 1. 文档加载
DocumentLoader loader = FileSystemDocumentLoader.fromDirectory(
    Paths.get("docs/"), "*.*"
);
List<Document> documents = loader.load();

// 2. 文档分块 & 向量化
DocumentSplitter splitter = DocumentSplitters.recursive(500, 0);
List<TextSegment> segments = splitter.splitAll(documents);

EmbeddingModel embeddingModel = new OpenAiEmbeddingModel("text-embedding-ada-002");
List<Embedding> embeddings = embeddingModel.embedAll(segments).content();

// 3. 存入向量数据库
EmbeddingStore<TextSegment> store = new InMemoryEmbeddingStore<>();
store.addAll(embeddings, segments);

// 4. 构建 RAG 问答
Retriever<TextSegment> retriever = new EmbeddingStoreRetriever<>(
    store, embeddingModel, 3
);
ContentRetriever contentRetriever = ContentRetrievers.of(retriever);

QuestionAnswering<String>qa = AiServices.builder(QuestionAnswering.class)
    .chatLanguageModel(model)
    .contentRetriever(contentRetriever)
    .build();

// 5. 问答
String answer = qa.answer("公司年假政策是什么？");
// AI 会先检索相关文档，再基于检索结果生成回答
```

:::note
RAG（Retrieval-Augmented Generation）是目前最主流的 AI 应用架构。它让 AI 能够「基于企业内部知识」回答问题，而不是「胡编乱造」。
:::

### 多模型支持：切换如丝般顺滑

LangChain4J 支持 20+ LLM 提供商，切换模型只需修改配置：

```java
// OpenAI GPT-4
ChatLanguageModel gpt4 = OpenAiChatModel.builder()
    .apiKey(System.getenv("OPENAI_API_KEY"))
    .modelName("gpt-4-turbo")
    .build();

// 阿里云通义千问
ChatLanguageModel qwen = QwenChatModel.builder()
    .apiKey(System.getenv("QWEN_API_KEY"))
    .modelName("qwen-max")
    .build();

// 本地 Ollama（Llama3）
ChatLanguageModel llama3 = OllamaChatModel.builder()
    .modelName("llama3:8b")
    .baseUrl("http://localhost:11434")
    .build();

// 切换模型：业务代码零改动
ChatLanguageModel model = isProd ? gpt4 : llama3;
Assistant assistant = AiServices.create(Assistant.class, model);
```

## Spring AI vs LangChain4J：该怎么选？

这是学习过程中我最常被问到的问题。

| 维度             | Spring AI          | LangChain4J    |
| -------------- | ------------------ | -------------- |
| **定位**         | Spring 生态的 AI 抽象层  | 功能全面的 LLM 应用框架 |
| **学习曲线**       | 低（Spring 开发者零成本上手） | 中等（需要学习新概念）    |
| **RAG 支持**     | 需自行集成向量库           | 内置完整 RAG 流水线   |
| **Agent/Tool** | 有限支持               | 原生完整支持         |
| **模型覆盖**       | 主要 OpenAI/Azure/通义 | 20+ 模型，30+ 向量库 |
| **框架绑定**       | 仅限 Spring          | 无限制            |
| **适用场景**       | 简单问答、Spring 项目     | 复杂 AI 应用、企业级   |

**我的建议：**

| 场景                     | 推荐框架        |
| ---------------------- | ----------- |
| Spring Boot 项目，快速集成 AI | Spring AI   |
| 复杂 AI 应用（RAG、Agent）    | LangChain4J |
| 需要多模型切换                | LangChain4J |
| 团队熟悉 Spring            | Spring AI   |
| 非 Spring 技术栈           | LangChain4J |

:::warning
两者不是互斥的。实际上，有些团队会同时使用——Spring AI 处理简单的 AI 集成，LangChain4J 处理复杂的 RAG 和 Agent 场景。
:::

## 学习路上的坑与经验

### 坑一：API Key 配置错误

**问题：** 配置了正确的 API Key，但一直报认证错误。

**原因：** 可能是 base-url 配置错误，或者使用了错误的 API Key 来源。

**解决：**

```yaml
# 错误示例
spring:
  ai:
    openai:
      api-key: sk-xxx  # 直接粘贴复制

# 正确示例
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}  # 使用环境变量
      base-url: https://api.openai.com/v1
```

### 坑二：上下文长度溢出

**问题：** 多轮对话进行几轮后，AI 开始「失忆」。

**原因：** 没有配置对话记忆，或者记忆窗口设置太小。

**解决：**

```java
// LangChain4J - 配置对话记忆
ChatMemory chatMemory = MessageWindowChatMemory.withMaxMessages(20);

Assistant agent = AiServices.builder(Assistant.class)
    .chatLanguageModel(model)
    .chatMemory(chatMemory)  // 添加记忆
    .build();
```

### 坑三：向量检索结果不准确

**问题：** RAG 返回的结果相关性很低。

**原因：** 可能是分块大小不合适、向量模型选择不当、或者检索参数没调好。

**解决：**

```java
// 1. 调整分块大小
DocumentSplitter splitter = DocumentSplitters.recursive(300, 50);
// 300: 每个块的目标 token 数
// 50: 块之间的重叠 token 数

// 2. 调整检索数量
Retriever<TextSegment> retriever = new EmbeddingStoreRetriever<>(
    store, embeddingModel, 5  // 从 3 个增加到 5 个
);

// 3. 优化 Prompt
@UserMessage("基于以下文档回答问题。如果文档中没有相关信息，请如实说明。\n\n文档：{{it}}\n\n问题：{{question}}")
```

<br />

### 经验一：优先用流式响应，提升用户体验

```java
// 普通响应：等 AI 完全生成后才返回
String answer = chatClient.prompt()
    .user("给我讲个故事")
    .call()
    .content();

// 流式响应：打字机效果，用户体验更好
Flux<String> stream = chatClient.prompt()
    .user("给我讲个故事")
    .stream()
    .content();

return stream;
```

### 经验二：做好异常处理

AI 调用可能失败，要做好兜底：

```java
public String chatSafely(String message) {
    try {
        return chatClient.prompt()
            .user(message)
            .call()
            .content();
    } catch (Exception e) {
        // 记录日志
        log.error("AI 调用失败", e);
        // 返回友好提示
        return "抱歉，我现在有点卡，稍后再试吧～";
    }
}
```

## 结语：站在 Java 的肩膀上拥抱 AI

回顾这段学习历程，我最大的感受是：

**Java 生态的 AI 工具链，正在飞速趋向成熟。**

Spring AI 让 Spring 开发者零成本接入 AI，LangChain4J 让复杂 AI 应用的开发成为可能。从 RAG 到 Agent，从工具调用到多模型编排，Java 开发者终于有了自己的武器库。

更重要的是，我们带来的不只是 AI 能力，还有 **Java 积累了几十年的企业级工程能力**——稳定性、可维护性、丰富的生态。

AI 时代，Java 不会缺席。

:::note
学完这两门课，我开始理解一个道理：**工具在变，但解决问题的思路不变**。无论用 Spring AI 还是 LangChain4J，核心都是理解 AI 的能力边界，然后把它集成到我们的业务中。这才是 AI 应用的本质。
:::

***

*更多技术细节可查看 Spring AI 官方文档与 LangChain4J 中文文档。*
