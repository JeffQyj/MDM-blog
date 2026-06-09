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
		relatedPosts: ["编程生涯简洁到令人发指的python", "编程生涯进击的python"],
		startedAt: "2024-01",
	},
	{
		id: "javascript",
		name: "JavaScript",
		category: "编程语言",
		note: "前端基石，从 ES5 一路学到 ES2024",
		relatedPosts: ["编程生涯js进阶", "编程生涯从ajax到axios"],
		startedAt: "2022-12",
	},
	{
		id: "typescript",
		name: "TypeScript",
		category: "编程语言",
		note: "JS 的超集，类型让代码更稳",
		relatedPosts: ["编程生涯ts的学习", "编程生涯tsjavapython三语言全栈框架认知"],
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
		id: "wechat-mp",
		name: "微信小程序",
		category: "前端框架",
		note: "国内独特的端形态，原生语法有一套",
		relatedPosts: ["编程生涯微信小程序原生语法学习"],
		startedAt: "2024-11",
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
		startedAt: "2024-09",
	},
	{
		id: "svelte",
		name: "Svelte",
		category: "前端框架",
		note: "编译时框架，本博客也用了它做交互组件",
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
		id: "mybatis",
		name: "MyBatis / MyBatis-Plus",
		category: "后端框架",
		note: "半自动 ORM，可控性与便捷性的平衡",
		startedAt: "2023-11",
	},
	{
		id: "nodejs",
		name: "Node.js",
		category: "后端框架",
		note: "前端通往后端的桥梁，事件驱动非阻塞",
		startedAt: "2024-05",
	},
	{
		id: "fastapi",
		name: "FastAPI",
		category: "后端框架",
		note: "Python 的现代异步 Web 框架，类型即文档",
		startedAt: "2025-09",
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
			"独立项目ai天机学堂mcp协议mymanus智能体",
			"编程生涯agent原理及其开发框架全览",
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
		id: "redis",
		name: "Redis",
		category: "数据库",
		note: "像超快的快递柜，存取毫秒级",
		relatedPosts: [
			"编程生涯nosql数据库理论入门redis与mongodb",
			"编程生涯从redis分布式锁到shell与lua脚本",
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
		id: "kafka",
		name: "Kafka",
		category: "中间件",
		note: "高速路上的 ETC 通道，日志与流处理标配",
		relatedPosts: ["编程生涯elk技术栈日志处理的瑞士军刀"],
		startedAt: "2025-01",
	},
	{
		id: "nginx",
		name: "Nginx",
		category: "中间件",
		note: "大楼门口的保安，帮你把请求转发到对应楼层",
		startedAt: "2024-03",
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
		relatedPosts: ["编程生涯docker与容器化"],
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
		startedAt: "2023-04",
	},
	{
		id: "vite",
		name: "Vite",
		category: "工程化与工具",
		note: "新一代前端构建工具，启动毫秒级",
		startedAt: "2024-09",
	},
	{
		id: "biome",
		name: "Biome",
		category: "工程化与工具",
		note: "一个工具取代 ESLint + Prettier，前端 lint 的新选择",
		startedAt: "2026-01",
	},
	{
		id: "pagefind",
		name: "Pagefind",
		category: "工程化与工具",
		note: "本博客用的静态搜索，零配置",
		startedAt: "2026-01",
	},
	{
		id: "swagger",
		name: "Swagger / OpenAPI",
		category: "工程化与工具",
		note: "REST API 的文档标准，前后端协作桥梁",
		startedAt: "2024-09",
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
	{
		id: "docker-compose",
		name: "Docker Compose",
		category: "系统与底层",
		note: "本地多容器编排，与 K8s 互补",
		relatedPosts: ["编程生涯docker与容器化"],
		startedAt: "2024-07",
	},
	{
		id: "minikube",
		name: "Minikube",
		category: "系统与底层",
		note: "本地的 K8s 集群，学习 K8s 必备",
		relatedPosts: ["编程生涯容器编排的艺术kubernetes"],
		startedAt: "2025-05",
	},
];

// ============================================
// 设计
// ============================================
const design: TechEntry[] = [
	{
		id: "photoshop",
		name: "Photoshop",
		category: "设计",
		note: "老牌图像处理王者，本博客 banner 也用它做",
		startedAt: "2020-06",
	},
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
