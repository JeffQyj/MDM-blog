import type { TechEntry } from "@/types/tech";

/**
 * 技术神经图谱数据源
 *
 * 维护建议：
 * - 新增技术时 id 必须唯一（kebab-case）
 * - relatedTo 中的 ID 必须存在
 * - 相关文章 slug 留空表示暂未写文章
 *
 * 取消了三态分级（手写/认知/了解），所有节点统一以「金色胶囊」呈现。
 *
 * 数据约束：
 * - 仅收录「编程生涯 / 二次开发 / 独立项目」分类文章中**作为技术名词被实际提及**过的项
 * - 仅供本博客自身使用的工具（Biome、Pagefind）不收录
 * - 单纯的开发辅助工具（Minikube）不收录，因为它本身不是技术
 * - 一些开源中间件（如 Prometheus、ELK、XXL-JOB）也算
 */

// ============================================
// 编程语言
// ============================================
const languages: TechEntry[] = [
	{
		id: "java",
		name: "Java",
		category: "编程语言",
		note: "主力语言，伴随我从 C 语言过渡到企业级开发",
		relatedPosts: [
			"编程生涯java特性全解",
			"编程生涯java的进阶之路",
			"编程生涯全栈的起点java学习",
		],
		startedAt: "2023-03",
	},
	{
		id: "python",
		name: "Python",
		category: "编程语言",
		note: "AI 时代绕不开的胶水语言",
		relatedPosts: ["编程生涯进击的python", "编程生涯简洁到令人发指的python"],
		startedAt: "2024-01",
	},
	{
		id: "javascript",
		name: "JavaScript",
		category: "编程语言",
		note: "前端基石，从 ES5 一路学到 ES2024",
		relatedPosts: ["编程生涯从ajax到axios", "编程生涯js进阶"],
		startedAt: "2022-12",
	},
	{
		id: "html",
		name: "HTML",
		category: "编程语言",
		note: "网页的骨架，前端三件套之首",
		relatedPosts: ["编程生涯前端三件套的学习"],
		startedAt: "2022-09",
	},
	{
		id: "css",
		name: "CSS",
		category: "编程语言",
		note: "网页的颜值担当，从 Flexbox 到 Grid 让布局变优雅",
		relatedPosts: ["编程生涯前端三件套的学习"],
		startedAt: "2022-09",
	},
	{
		id: "typescript",
		name: "TypeScript",
		category: "编程语言",
		note: "JS 的超集，类型让代码更稳",
		relatedPosts: [
			"编程生涯tsjavapython三语言全栈框架认知",
			"编程生涯ts的学习",
		],
		startedAt: "2024-04",
	},
	{
		id: "c-lang",
		name: "C",
		category: "编程语言",
		note: "大学第一门语言，开启了编程世界的大门",
		relatedPosts: ["编程生涯c语言的基础学习", "成长碎记期末c语言编程分班考"],
		startedAt: "2022-09",
	},
	{
		id: "sql",
		name: "SQL",
		category: "编程语言",
		note: "数据操作通用语，MySQL/PG/Oracle 都用同一套语法",
		relatedPosts: ["编程生涯数据库学习之路"],
		startedAt: "2023-06",
	},
	{
		id: "bash",
		name: "Bash / Shell",
		category: "编程语言",
		note: "服务器和自动化的必备语言",
		relatedPosts: ["编程生涯从redis分布式锁到shell与lua脚本"],
		startedAt: "2024-06",
	},
];

// ============================================
// 前端框架
// ============================================
const frontend: TechEntry[] = [
	{
		id: "vue",
		name: "Vue",
		category: "前端框架",
		note: "国内主流前端框架，进阶必学",
		relatedPosts: ["编程生涯vue2与vue3"],
		startedAt: "2023-05",
	},
	{
		id: "react",
		name: "React",
		category: "前端框架",
		note: "前端框架还得是 React",
		relatedPosts: ["编程生涯前端框架还得是react"],
		startedAt: "2024-08",
	},
	{
		id: "nextjs",
		name: "Next.js",
		category: "前端框架",
		note: "React 的服务端渲染框架，Vercel 出品",
		relatedPosts: ["编程生涯nextjs与nuxtjs同门师兄弟的巅峰对决"],
		startedAt: "2025-03",
	},
	{
		id: "nuxtjs",
		name: "Nuxt.js",
		category: "前端框架",
		note: "Vue 的服务端渲染框架，Next.js 的同门师弟",
		relatedPosts: ["编程生涯nextjs与nuxtjs同门师兄弟的巅峰对决"],
		startedAt: "2025-03",
	},
	{
		id: "uni-app",
		name: "uni-app",
		category: "前端框架",
		note: "DCloud 出品的跨端框架，一次编码覆盖多端小程序",
		relatedPosts: ["独立项目dm点餐系统"],
		startedAt: "2024-10",
	},
	{
		id: "axios",
		name: "Axios",
		category: "前端框架",
		note: "前端 HTTP 客户端的事实标准",
		relatedPosts: ["编程生涯从ajax到axios"],
		startedAt: "2023-08",
	},
	{
		id: "tailwind",
		name: "Tailwind CSS",
		category: "前端框架",
		note: "实用优先的 CSS 框架，类名即样式",
		relatedPosts: ["二次开发博客诞生日志"],
		startedAt: "2024-09",
	},
	{
		id: "svelte",
		name: "Svelte",
		category: "前端框架",
		note: "编译时框架，本博客也用了它做交互组件",
		relatedPosts: ["二次开发博客诞生日志"],
		startedAt: "2026-01",
	},
	{
		id: "astro",
		name: "Astro",
		category: "前端框架",
		note: "本博客的底层框架，内容优先，岛屿架构很优雅",
		relatedPosts: ["二次开发博客诞生日志"],
		startedAt: "2026-01",
	},
	{
		id: "element-plus",
		name: "Element Plus",
		category: "前端框架",
		note: "Vue 3 官方推荐的桌面端组件库",
		relatedPosts: ["独立项目ai若依帝可得"],
		startedAt: "2024-06",
	},
	{
		id: "echarts",
		name: "ECharts",
		category: "前端框架",
		note: "百度开源的数据可视化图表库",
		relatedPosts: ["独立项目ai若依帝可得"],
		startedAt: "2024-06",
	},
	{
		id: "refine",
		name: "Refine",
		category: "前端框架",
		note: "React 后台管理框架，胶水编程的「后台管理」成熟能力",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "taro",
		name: "Taro",
		category: "前端框架",
		note: "京东出品的跨端框架，与 uni-app 齐名",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "react-native",
		name: "React Native",
		category: "前端框架",
		note: "用 React 写原生移动端，跨 iOS/Android",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "kmp",
		name: "Kotlin Multiplatform",
		category: "前端框架",
		note: "JetBrains 出品，跨端共享 Kotlin 代码的优雅方案",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "electron",
		name: "Electron",
		category: "前端框架",
		note: "Web 技术栈开发桌面端的事实标准",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "tauri",
		name: "Tauri",
		category: "前端框架",
		note: "Rust 内核的轻量级桌面端框架，Electron 的瘦身替代",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "qt",
		name: "Qt",
		category: "前端框架",
		note: "C++ 桌面端开发的老牌强者",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// 后端框架
// ============================================
const backend: TechEntry[] = [
	{
		id: "spring-boot",
		name: "Spring Boot",
		category: "后端框架",
		note: "Java 后端的绝对主力，约定大于配置",
		relatedPosts: [
			"编程生涯从xml配置地狱到springboot自动配置",
			"编程生涯ssm框架学习整合的艺术",
		],
		startedAt: "2023-09",
	},
	{
		id: "spring-cloud",
		name: "Spring Cloud",
		category: "后端框架",
		note: "微服务全家桶，从单体到微服务的桥梁",
		relatedPosts: ["编程生涯从单体到微服务"],
		startedAt: "2024-10",
	},
	{
		id: "spring-cloud-alibaba",
		name: "Spring Cloud Alibaba",
		category: "后端框架",
		note: "国产微服务全家桶，Nacos/Sentinel/Seata 一站式",
		relatedPosts: ["独立项目天机学堂一次全面的微服务复习"],
		startedAt: "2026-05",
	},
	{
		id: "mybatis",
		name: "MyBatis / MyBatis-Plus",
		category: "后端框架",
		note: "半自动 ORM，可控性与便捷性的平衡",
		relatedPosts: ["编程生涯浙江索思java实习第一个月"],
		startedAt: "2023-11",
	},
	{
		id: "dubbo",
		name: "Dubbo",
		category: "后端框架",
		note: "阿里出品的 RPC 服务治理框架",
		relatedPosts: ["独立项目青橙商城分布式电商实战"],
		startedAt: "2024-02",
	},
	{
		id: "fastapi",
		name: "FastAPI",
		category: "后端框架",
		note: "Python 的现代异步 Web 框架，类型即文档",
		startedAt: "2025-09",
	},
	{
		id: "graphql",
		name: "GraphQL",
		category: "后端框架",
		note: "API 查询语言，前端按需取数告别接口泛滥",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// AI 与 Agent
// ============================================
const ai: TechEntry[] = [
	{
		id: "spring-ai",
		name: "Spring AI",
		category: "AI 与 Agent",
		note: "Java 生态 AI 集成的第一站",
		relatedPosts: ["编程生涯springai与langchain4jjava开发者拥抱ai的双引擎"],
		startedAt: "2025-12",
	},
	{
		id: "langchain4j",
		name: "LangChain4J",
		category: "AI 与 Agent",
		note: "LangChain 的 Java 版本，与 Spring AI 并称双引擎",
		relatedPosts: ["编程生涯springai与langchain4jjava开发者拥抱ai的双引擎"],
		startedAt: "2025-12",
	},
	{
		id: "langgraph",
		name: "LangGraph",
		category: "AI 与 Agent",
		note: "Agent 框架里的 Linux，强大但陡峭",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "crewai",
		name: "CrewAI",
		category: "AI 与 Agent",
		note: "5 分钟跑通多 Agent 演示",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "openai-agents",
		name: "OpenAI Agents SDK",
		category: "AI 与 Agent",
		note: "OpenAI 官方出品，三个概念一目了然",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "pydanticai",
		name: "PydanticAI",
		category: "AI 与 Agent",
		note: "类型安全 + 可测试，Agent 界的 TypeScript",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "llamaindex",
		name: "LlamaIndex",
		category: "AI 与 Agent",
		note: "Agent 的数据粮仓管理员，做 RAG 选它",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "dify",
		name: "Dify",
		category: "AI 与 Agent",
		note: "AI 应用的 PowerPoint，人人可搭 Agent",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "agentscope",
		name: "AgentScope",
		category: "AI 与 Agent",
		note: "阿里通义出品，国内多 Agent 项目值得关注",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "ms-agent-fw",
		name: "Microsoft Agent Framework",
		category: "AI 与 Agent",
		note: "微软吞并 AutoGen + Semantic Kernel 的产物",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "google-adk",
		name: "Google ADK",
		category: "AI 与 Agent",
		note: "Google Cloud 官方 Agent 框架",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
	{
		id: "mcp",
		name: "MCP 协议",
		category: "AI 与 Agent",
		note: "Anthropic 推出，让 Agent 工具即插即用",
		relatedPosts: [
			"编程生涯agent原理及其开发框架全览",
			"独立项目ai天机学堂mcp协议mymanus智能体",
		],
		startedAt: "2026-02",
	},
	{
		id: "a2a",
		name: "A2A 协议",
		category: "AI 与 Agent",
		note: "Google 推出，让 Agent 互相对话",
		relatedPosts: ["编程生涯agent原理及其开发框架全览"],
		startedAt: "2026-05",
	},
];

// ============================================
// 数据库
// ============================================
const db: TechEntry[] = [
	{
		id: "mysql",
		name: "MySQL",
		category: "数据库",
		note: "关系型数据库之王，互联网项目标配",
		relatedPosts: ["编程生涯数据库学习之路"],
		startedAt: "2023-07",
	},
	{
		id: "postgresql",
		name: "PostgreSQL",
		category: "数据库",
		note: "学院派关系型数据库，AI 时代异军突起",
		relatedPosts: ["独立项目ai天机学堂mcp协议mymanus智能体"],
		startedAt: "2026-05",
	},
	{
		id: "redis",
		name: "Redis",
		category: "数据库",
		note: "像超快的快递柜，存取毫秒级",
		relatedPosts: [
			"编程生涯从redis分布式锁到shell与lua脚本",
			"编程生涯nosql数据库理论入门redis与mongodb",
		],
		startedAt: "2024-02",
	},
	{
		id: "mongodb",
		name: "MongoDB",
		category: "数据库",
		note: "文档型 NoSQL 的代表，灵活但要谨慎",
		relatedPosts: ["编程生涯nosql数据库理论入门redis与mongodb"],
		startedAt: "2024-08",
	},
	{
		id: "elasticsearch",
		name: "Elasticsearch",
		category: "数据库",
		note: "全文检索与日志分析利器，ELK 中的 E",
		relatedPosts: ["编程生涯elk技术栈日志处理的瑞士军刀"],
		startedAt: "2024-12",
	},
];

// ============================================
// 中间件
// ============================================
const middleware: TechEntry[] = [
	{
		id: "rabbitmq",
		name: "RabbitMQ",
		category: "中间件",
		note: "AMQP 协议的消息队列，企业级首选",
		relatedPosts: ["编程生涯消息队列之rabbitmq"],
		startedAt: "2024-04",
	},
	{
		id: "nginx",
		name: "Nginx",
		category: "中间件",
		note: "大楼门口的保安，帮你把请求转发到对应楼层",
		relatedPosts: ["编程生涯elk技术栈日志处理的瑞士军刀"],
		startedAt: "2024-03",
	},
	{
		id: "websocket",
		name: "WebSocket",
		category: "中间件",
		note: "全双工长连接协议，实时推送首选",
		relatedPosts: ["独立项目黑马苍穹外卖"],
		startedAt: "2024-05",
	},
	{
		id: "xxl-job",
		name: "XXL-JOB",
		category: "中间件",
		note: "分布式任务调度平台，国内中小厂标配",
		relatedPosts: ["独立项目天机学堂一次全面的微服务复习"],
		startedAt: "2026-05",
	},
	{
		id: "odoo",
		name: "Odoo",
		category: "中间件",
		note: "开源ERP，其中间件对接方案是胶水编程的灵感来源",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "meilisearch",
		name: "Meilisearch",
		category: "中间件",
		note: "轻量级全文搜索引擎，比ES更易上手",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "supabase",
		name: "Supabase",
		category: "中间件",
		note: "开源Firebase替代品，Auth/DB/Realtime 一站式",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "minio",
		name: "MinIO",
		category: "中间件",
		note: "兼容S3协议的对象存储，自托管友好",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "pocketbase",
		name: "PocketBase",
		category: "中间件",
		note: "单文件BaaS，实时通信与轻量后端利器",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "auth0",
		name: "Auth0",
		category: "中间件",
		note: "认证即服务，胶水编程的成熟能力代表",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "imgproxy",
		name: "Imgproxy",
		category: "中间件",
		note: "图像处理代理，搭配 MinIO 做胶水文件服务",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// 云原生
// ============================================
const cloud: TechEntry[] = [
	{
		id: "docker",
		name: "Docker",
		category: "云原生",
		note: "标准化的集装箱，让应用无论换哪艘船都能跑",
		relatedPosts: ["编程生涯容器编排的艺术kubernetes"],
		startedAt: "2024-07",
	},
	{
		id: "kubernetes",
		name: "Kubernetes",
		category: "云原生",
		note: "容器编排的艺术，集群调度的事实标准",
		relatedPosts: ["编程生涯容器编排的艺术kubernetes"],
		startedAt: "2025-05",
	},
	{
		id: "coolify",
		name: "Coolify",
		category: "云原生",
		note: "自托管的 Heroku 替代品，开源 PaaS 让胶水部署更轻松",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// 监控与可观测性
// ============================================
const observability: TechEntry[] = [
	{
		id: "prometheus",
		name: "Prometheus",
		category: "监控与可观测性",
		note: "云原生时代的事实标准指标采集系统",
		relatedPosts: ["编程生涯主流项目监控技术栈解析"],
		startedAt: "2026-06",
	},
	{
		id: "grafana",
		name: "Grafana",
		category: "监控与可观测性",
		note: "颜值与实力并存的可视化面板",
		relatedPosts: ["编程生涯主流项目监控技术栈解析"],
		startedAt: "2026-06",
	},
	{
		id: "elk",
		name: "ELK",
		category: "监控与可观测性",
		note: "Elasticsearch + Logstash + Kibana，日志瑞士军刀",
		relatedPosts: ["编程生涯elk技术栈日志处理的瑞士军刀"],
		startedAt: "2024-02",
	},
	{
		id: "uptime-kuma",
		name: "Uptime Kuma",
		category: "监控与可观测性",
		note: "颜值与实力并存的自托管监控告警工具",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// 工程化与工具
// ============================================
const tooling: TechEntry[] = [
	{
		id: "git",
		name: "Git",
		category: "工程化与工具",
		note: "最强版本控制工具，程序员必备",
		relatedPosts: ["编程生涯最强版本控制工具git"],
		startedAt: "2022-11",
	},
	{
		id: "maven",
		name: "Maven",
		category: "工程化与工具",
		note: "Java 项目的事实构建工具",
		relatedPosts: ["编程生涯从xml配置地狱到springboot自动配置"],
		startedAt: "2023-04",
	},
	{
		id: "vite",
		name: "Vite",
		category: "工程化与工具",
		note: "新一代前端构建工具，启动毫秒级",
		relatedPosts: ["独立项目ai若依帝可得"],
		startedAt: "2024-09",
	},
	{
		id: "swagger",
		name: "Swagger / OpenAPI",
		category: "工程化与工具",
		note: "REST API 的文档标准，前后端协作桥梁",
		relatedPosts: ["编程生涯浙江索思java实习第一个月"],
		startedAt: "2024-09",
	},
	{
		id: "bun",
		name: "Bun",
		category: "工程化与工具",
		note: "新一代 JS 运行时/包管理器/构建工具，速度飞快",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "nodejs",
		name: "Node.js",
		category: "工程化与工具",
		note: "JavaScript 服务端运行时，全栈开发的基础设施",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "oclif",
		name: "oclif",
		category: "工程化与工具",
		note: "Heroku 开源的 Node.js CLI 框架",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "github-actions",
		name: "GitHub Actions",
		category: "工程化与工具",
		note: "GitHub 原生 CI/CD，胶水编程的自动化质量门禁",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "mypy",
		name: "MyPy",
		category: "工程化与工具",
		note: "Python 静态类型检查器，胶水代码的契约守护者",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "json-schema",
		name: "JSON Schema",
		category: "工程化与工具",
		note: "JSON 数据结构校验标准，跨语言通用的接口契约",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "zod",
		name: "Zod",
		category: "工程化与工具",
		note: "TypeScript 优先的运行时 schema 验证库",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "pytest",
		name: "pytest",
		category: "工程化与工具",
		note: "Python 测试的事实标准框架",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
	{
		id: "junit",
		name: "JUnit",
		category: "工程化与工具",
		note: "Java 单元测试的祖师爷",
		relatedPosts: ["编程生涯胶水编程道法术器全维度"],
		startedAt: "2026-05",
	},
];

// ============================================
// 数据科学与 AI
// ============================================
const dataScience: TechEntry[] = [
	{
		id: "pandas",
		name: "Pandas",
		category: "数据科学与 AI",
		note: "数据分析三剑客之一，DataFrame 是核心",
		relatedPosts: ["编程生涯python数据分析三剑客"],
		startedAt: "2025-06",
	},
	{
		id: "numpy",
		name: "NumPy",
		category: "数据科学与 AI",
		note: "Python 科学计算的基石，数组运算极致优化",
		relatedPosts: ["编程生涯python数据分析三剑客"],
		startedAt: "2025-06",
	},
	{
		id: "matplotlib",
		name: "Matplotlib",
		category: "数据科学与 AI",
		note: "Python 最经典的绘图库，论文配图常用",
		relatedPosts: ["编程生涯python数据分析三剑客"],
		startedAt: "2025-06",
	},
	{
		id: "pytorch",
		name: "PyTorch",
		category: "数据科学与 AI",
		note: "深度学习框架两大主力之一，学术界首选",
		relatedPosts: ["编程生涯恩师吴恩达机器学习入门"],
		startedAt: "2025-08",
	},
	{
		id: "sklearn",
		name: "Scikit-learn",
		category: "数据科学与 AI",
		note: "传统机器学习的瑞士军刀，API 极其友好",
		relatedPosts: ["编程生涯恩师吴恩达机器学习入门"],
		startedAt: "2025-08",
	},
];

// ============================================
// 系统与底层
// ============================================
const system: TechEntry[] = [
	{
		id: "linux",
		name: "Linux",
		category: "系统与底层",
		note: "服务器领域的绝对王者，后端必备",
		relatedPosts: ["编程生涯操作系统"],
		startedAt: "2023-12",
	},
	{
		id: "jvm",
		name: "JVM",
		category: "系统与底层",
		note: "Java 虚拟机，调优和故障排查必懂",
		relatedPosts: ["编程生涯java底层jvm"],
		startedAt: "2024-11",
	},
	{
		id: "juc",
		name: "JUC 并发编程",
		category: "系统与底层",
		note: "Java 并发包，高性能编程的内功",
		relatedPosts: ["编程生涯juc并发编程之旅"],
		startedAt: "2024-10",
	},
];

// ============================================
// 设计
// ============================================
const design: TechEntry[] = [
	{
		id: "figma",
		name: "Figma",
		category: "设计",
		note: "协作设计的新标杆，二次开发原型都用它",
		relatedPosts: ["二次开发由art-design-pro展开的二开哲学"],
		startedAt: "2024-09",
	},
];

// ============================================
// 合并导出
// ============================================
export const techStack: TechEntry[] = [
	...languages,
	...frontend,
	...backend,
	...ai,
	...db,
	...middleware,
	...cloud,
	...observability,
	...tooling,
	...dataScience,
	...system,
	...design,
];

/**
 * 按分类统计
 */
export function countByCategory(entries: TechEntry[]) {
	return entries.reduce(
		(acc, t) => {
			acc[t.category] = (acc[t.category] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);
}
