---
name: "init"
description: "使用对应技能分析项目代码库并生成 CLAUDE.md 文档。适用于首次使用或生成项目说明。"
---

# 初始化命令

为当前项目生成 CLAUDE.md 代码库文档。

## 何时使用

- 首次在项目中开始使用 Trae
- 加入新团队或克隆新仓库
- 项目结构或技术栈发生变化
- 需要生成或更新项目说明文档

## 执行流程

### 阶段 1：环境侦察

并行执行以下检测：

**1. 包管理器检测**

```
package.json          → pnpm/npm/yarn
go.mod               → Go
Cargo.toml           → Rust
pyproject.toml       → Python
pom.xml/build.gradle → Java
Gemfile              → Ruby
composer.json        → PHP
pubspec.yaml         → Flutter/Dart
```

**2. 框架指纹识别**

```
next.config.*        → Next.js
nuxt.config.*        → Nuxt
angular.json         → Angular
vite.config.*        → Vite
django settings      → Django
flask app factory    → Flask
fastapi main         → FastAPI
rails config         → Rails
spring config        → Spring Boot
```

**3. 入口点识别**

```
main.*, index.*, app.*, server.*
cmd/, src/main/, src/index.tsx
pages/, app/, src/routes/
```

**4. 目录结构快照**
获取项目顶层目录结构（排除 node\_modules, vendor, .git, dist, build, __pycache__, .next）

**5. 配置和工具检测**

```
.eslintrc*, .prettierrc*, tsconfig.json
Makefile, Dockerfile, docker-compose*
.github/workflows/, .env.example
CI 配置, lint-staged, husky
```

**6. 测试结构检测**

```
tests/, test/, __tests__/
*.spec.ts, *.test.js, *_test.go
pytest.ini, jest.config.*, vitest.config.*
```

### 阶段 2：架构映射

从侦察数据中识别：

**技术栈**

- 语言及版本约束
- 框架及主要库
- 数据库及 ORM
- 构建工具和打包器
- CI/CD 平台

**架构模式**

- 单体仓库、微仓库还是微服务
- 前端/后端分离还是全栈
- API 风格：REST、GraphQL、gRPC、tRPC

**关键目录**
映射顶层目录到其用途：

```
src/components/  → UI 组件
src/api/         → API 路由处理
src/lib/         → 共享工具
src/db/          → 数据库模型和迁移
tests/           → 测试套件
scripts/         → 构建和部署脚本
```

**数据流**
追踪一个请求从入口到响应的完整路径：

- 请求在哪里进入？（路由、处理器、控制器）
- 如何验证？（中间件、schema、守卫）
- 业务逻辑在哪里？（服务、模型、用例）
- 如何到达数据库？（ORM、原始查询、仓储）

### 阶段 3：约定检测

识别代码库已遵循的模式：

**命名约定**

- 文件命名：kebab-case、camelCase、PascalCase、snake\_case
- 组件/类命名模式
- 测试文件命名：`*.test.ts`、`*.spec.ts`、`*_test.go`

**代码模式**

- 错误处理风格：try/catch、Result 类型、错误码
- 依赖注入或直接导入
- 状态管理方式
- 异步模式：回调、Promise、async/await、channels

**Git 约定**

- 从近期分支获取分支命名
- 从近期提交获取提交信息风格
- PR 工作流程（squash、merge、rebase）
- 若仓库无提交历史或历史过浅（`git clone --depth 1`），跳过此部分并标注"Git 历史不可用"

### 阶段 4：生成文档

#### 若 CLAUDE.md 已存在

1. 读取现有 CLAUDE.md
2. 分析新增内容与现有内容的差异
3. 增强而非替换，保留项目原有指令
4. 明确标注新增或修改的内容

#### 若无 CLAUDE.md

在项目根目录创建新文件：

```markdown
# Project Instructions

## Tech Stack
[检测到的技术栈摘要]

## Code Style
- [检测到的命名约定]
- [检测到的应遵循的模式]

## Testing
- 运行测试：[检测到的测试命令]
- 测试模式：[检测到的测试文件约定]
- 覆盖率：[如果配置了覆盖率命令]

## Build & Run
- Dev：[检测到的开发命令]
- Build：[检测到的构建命令]
- Lint：[检测到的 lint 命令]

## Project Structure
[关键目录 → 用途映射]

## Conventions
- [提交风格（如果可检测）]
- [PR 工作流程（如果可检测）]
- [错误处理模式]
```

## 输出要求

### 必要输出

1. **项目概述**：2-3 句话说明项目用途和目标用户
2. **技术栈表格**：主要技术及版本
3. **关键入口点**：路由、main 文件、配置文件位置
4. **目录结构映射**：顶层目录与用途对应
5. **常用命令**：开发、测试、构建、提交命令
6. **约定说明**：命名、代码、Git 相关约定

### 可选输出（如果可检测）

- 请求生命周期追踪
- 架构图或数据流图
- 常见任务示例

## 注意事项

1. **不要通读所有文件** — 侦察阶段使用 Glob 和 Grep，不对每个文件使用 Read
2. **验证而非猜测** — 如果框架在配置中检测到但实际代码使用不同方案，以代码为准
3. **尊重现有 CLAUDE.md** — 如果已存在，增强而非替换，标注新增 vs 现有内容
4. **保持简洁** — 文档应能在 2 分钟内浏览完毕，详细说明属于代码而非指南
5. **标注未知项** — 如果无法确定某个约定，明确说明而非猜测

## 反模式

- 生成超过 100 行的 CLAUDE.md
- 列出所有依赖 — 仅突出影响编码方式的依赖
- 描述显而易见的目录名 — `src/` 不需要解释
- 复制 README — 文档应提供 README 缺乏的结构化洞察

## 执行示例

```
用户: /init

系统:
1. 检测到 Vue 3 + TypeScript + Vite 项目
2. 检测到 Element Plus UI 库
3. 检测到 Pinia 状态管理
4. 检测到 Vue Router (Hash 模式)
5. 检测到 ESLint + Prettier + Stylelint
6. 检测到 Husky + lint-staged
7. 生成 CLAUDE.md 文件

输出: 在项目根目录创建/更新 CLAUDE.md
```

