# 项目规则与 CLAUDE.md 重构计划

## 1. 目标概述

将现有的 5 个 `project_rules*.md` 文件重构为 3 个见名知意的英文主题文件，并同步精简 `CLAUDE.md`，消除内容重复，使规则文件成为文章创作规范的唯一权威来源。

---

## 2. 当前状态分析

### 2.1 现有规则文件问题

| 文件 | 现状 | 问题 |
|------|------|------|
| `project_rules1.md` | 内容风格、frontmatter、文章结构、主题配置、代码风格 | 主题混杂，frontmatter 与命名规范散落 |
| `project_rules2.md` | 生成流程 + 「## 3. 文章内容规范」 | 章节编号错位（出现"3."但文件是 2.） |
| `project_rules3.md` | 时间认定、存放位置、命名规范 | 标题"## 3. 文章规范"但属于独立文件 |
| `project_rules4.md` | 独立项目系列规范 | OK，但与 rules1 部分内容边界模糊 |
| `project_rules5.md` | 推送规范 | 缺失 `# MDM-blog 项目规则` 标题 |

### 2.2 CLAUDE.md 与规则文件重复清单

| 主题 | 规则文件 | CLAUDE.md | 决策 |
|------|----------|-----------|------|
| Frontmatter 规范 | rules1 §1.2 | ✅ Conventions | 移到 `article-constraints.md`，CLAUDE.md 删除 |
| 文章命名规范 | rules3 §3.3 | ✅ Conventions | 移到 `article-constraints.md`，CLAUDE.md 删除 |
| 文章分类 | rules2 §2.2 | ✅ Conventions | 移到 `article-constraints.md`，CLAUDE.md 删除 |
| Git 提交规范 | rules5 | ✅ Conventions | 移到 `article-constraints.md`，CLAUDE.md 删除 |
| 路径别名/TS strict | rules1 §1.5 | ✅ Code Style | 保留在 CLAUDE.md（项目级代码规范） |
| 项目规则路径 | rules1-5 | ✅ Important Paths | 更新为新命名 |

---

## 3. 重构方案

### 3.1 目标文件结构

```
.trae/rules/
├── article-style.md          # 文章创作风格（如何写好文章）
├── article-constraints.md    # 文章约束条件（硬性规范）
└── article-workflow.md       # 文章工作流（确认-创作-校验流程）

CLAUDE.md                     # 项目信息 + 引用规则文件
```

### 3.2 文件 1：`article-style.md`（文章创作风格）

聚焦"**如何写好文章**"——风格、表达、结构模板。

| 章节 | 内容来源 | 说明 |
|------|----------|------|
| 内容风格 | rules1 §1.1 | 语言、语气、排版、标题 |
| 文章结构模板 | rules1 §1.3 | 5 种 admonition + Markdown 模板 |
| 独立项目系列文章风格 | rules4 §4.1 | 生动比喻、架构图示、代码示例、概念详解、表格对照 |
| ASCII 流程图示例 | rules4 §4.1 内嵌 | 复用现有示例 |
| 独立项目内容结构 | rules4 §4.2 | 项目背景/技术架构/业务模块/踩坑实录 |

### 3.3 文件 2：`article-constraints.md`（文章约束条件）

聚焦"**必须遵守的硬性规范**"——不可违反的格式、命名、流程。

| 章节 | 内容来源 | 说明 |
|------|----------|------|
| frontmatter 规范 | rules1 §1.2 + rules5 frontmatter 检查 | 7 个必填字段、YAML 格式 |
| 文件命名规范 | rules3 §3.3 | 「分类：[标题].md」（最高优先级） |
| 文章存放位置 | rules3 §3.2 | `src/content/posts/` |
| 文章分类 | rules2 §2.2 | 5 类固定分类 |
| 标签数量 | rules2 §2.2 | 至少 2 个，至多 5 个 |
| 文章内容规范 | rules2 §3.1 | 禁止互动类内容 |
| 日期语义规范 | rules2 §3.2 | published 字段语义 |
| 二次开发参考规则 | rules3 §3.1 | 需参考独立项目系列 |
| 推送前校验 | rules5 | frontmatter 格式 + `pnpm check` |
| 推送流程 | rules5 | git status → check → format → add → commit → push |
| Commit 信息格式 | rules5 | Conventional Commits |

### 3.4 文件 3：`article-workflow.md`（文章工作流）

聚焦"**与用户协作的工作流规范**"——阶段划分、确认机制。

| 阶段 | 关键规则 |
|------|----------|
| 主题与要求确认 | 联网查证 + 明确用户附加要求（来自 rules2 §2.1） |
| 大纲生成与优化 | **在用户未明确发出确认大纲的指令之前，发送的所有内容都是为了优化大纲**；仅做大纲优化和完整大纲呈现 |
| 文章创作 | **用户明确发出确认大纲的命令之后，才开始创作文章** |
| 文章校验 | **只有用户确认文章内容无误后，才进行文章校验**（pnpm check / format） |
| 输出格式 | 文章概要表格（来自 rules2 §2.3） |
| 参考资料使用 | 参考 3 篇以上同分类/相近日期文章；杜绝幻觉与编造（来自 rules1 §1.2 末段） |

### 3.5 CLAUDE.md 简化

**保留**（项目级信息，与文章创作无关）：

- Project Overview
- Tech Stack
- Code Style（命名约定 + TypeScript/缩进/双引号等**项目级**代码规范）
- Build & Run
- Project Structure
- Key Entry Points
- Additional Notes（CI/CD、依赖、部署、Pagefind、代码高亮）

**移除**（已迁到 `article-constraints.md`）：

- 文章命名规范
- 文章 Frontmatter 规范
- 文章分类
- Git 提交规范

**更新**（指向新规则文件）：

- Important Paths：`项目规则` 路径更新为 `article-style.md / article-constraints.md / article-workflow.md`

**新增**（在 Important Paths 区域或 Conventions 区域引用规则文件）：

```markdown
## 内容创作规范

文章创作风格、约束条件、工作流程的统一规范存放于：

- [文章创作风格](file:///absolute/path/to/.trae/rules/article-style.md)
- [文章约束条件](file:///absolute/path/to/.trae/rules/article-constraints.md)
- [文章工作流](file:///absolute/path/to/.trae/rules/article-workflow.md)

> 修改规则后需同步检查 CLAUDE.md 是否有重复内容。
```

---

## 4. 详细操作清单

### 4.1 新增文件

| 顺序 | 操作 | 文件 |
|------|------|------|
| 1 | 写入 | `.trae/rules/article-style.md` |
| 2 | 写入 | `.trae/rules/article-constraints.md` |
| 3 | 写入 | `.trae/rules/article-workflow.md` |

### 4.2 修改文件

| 顺序 | 操作 | 文件 | 变更 |
|------|------|------|------|
| 4 | 编辑 | `CLAUDE.md` | 删除「文章命名规范」「文章 Frontmatter 规范」「文章分类」「Git 提交规范」四节；在 Important Paths 或新章节引用 3 个新规则文件；更新 Important Paths 中"项目规则"路径 |

### 4.3 删除文件

| 顺序 | 操作 | 文件 |
|------|------|------|
| 5 | 删除 | `.trae/rules/project_rules1.md` |
| 6 | 删除 | `.trae/rules/project_rules2.md` |
| 7 | 删除 | `.trae/rules/project_rules3.md` |
| 8 | 删除 | `.trae/rules/project_rules4.md` |
| 9 | 删除 | `.trae/rules/project_rules5.md` |

---

## 5. 内容映射详细对照

### 5.1 article-style.md 章节结构

```markdown
# 文章创作风格

## 1. 内容风格
[原 rules1 §1.1 表格]

## 2. 文章结构模板
[原 rules1 §1.3 admonition 表格 + Markdown 模板]

## 3. 独立项目系列文章风格
### 3.1 风格要素
[原 rules4 §4.1 表格]

### 3.2 ASCII 流程图示例
[原 rules4 内嵌 ASCII 示例]

### 3.3 内容结构
[原 rules4 §4.2 模板]

## 4. 禁止事项
[原 rules4 §4.3 表格]
```

### 5.2 article-constraints.md 章节结构

```markdown
# 文章约束条件

## 1. frontmatter 规范
[原 rules1 §1.2 + rules5 推送前校验 frontmatter 部分]

## 2. 文件命名规范（最高优先级）
[原 rules3 §3.3]

## 3. 文章存放位置
[原 rules3 §3.2]

## 4. 文章分类与标签
### 4.1 五类固定分类
[原 rules2 §2.2 第 4 条]
### 4.2 标签数量
[原 rules2 §2.2 第 5 条]

## 5. 文章内容规范
### 5.1 禁止互动类内容
[原 rules2 §3.1]
### 5.2 日期语义规范
[原 rules2 §3.2]

## 6. 二次开发参考规则
[原 rules3 §3.1]

## 7. 推送与提交规范（最高优先级）
### 7.1 推送前校验
[原 rules5 推送前校验]
### 7.2 推送流程
[原 rules5 推送流程]
### 7.3 Commit 信息格式
[原 rules5 commit 信息格式]
```

### 5.3 article-workflow.md 章节结构

```markdown
# 文章工作流

## 1. 主题与要求确认
[原 rules2 §2.1]

## 2. 大纲生成与优化
**在用户未明确发出确认大纲的指令之前，发送的所有内容都是为了优化大纲。**
你只需要根据用户发送的内容进行大纲优化和完整大纲的呈现，不创作正文。

## 3. 文章创作
**只有用户明确发出确认大纲的命令之后，才开始创作文章。**
创作期间应：
- 参考 3 篇以上同分类、日期相近的文章
- 杜绝幻觉与编造
- 联动其他有内容相关性的文章（自然呼应，不重复）
- 调用 article-writing 技能

## 4. 文章校验
**只有用户确认文章内容无误后，才进行文章校验。**
校验内容：
- frontmatter 7 个字段完整性
- `pnpm check` 类型检查
- `pnpm format` 代码格式化

## 5. 输出格式
[原 rules2 §2.3 文章概要表格]
```

### 5.4 CLAUDE.md 修改前后对比

**删除章节**（Conventions 下）：

```diff
- ### Git 提交规范
- ### 文章命名规范（最高优先级）
- ### 文章 Frontmatter 规范
- ### 文章分类
```

**修改章节**（Important Paths）：

```diff
- - **项目规则**：`.trae/rules/project_rules*.md`（5 个规则文件）
+ - **项目规则**：`.trae/rules/article-*.md`（3 个文件：style / constraints / workflow）
```

**新增章节**（建议放在 Conventions 之后、Key Entry Points 之前）：

```markdown
## 内容创作规范

文章创作风格、约束条件、工作流程的统一规范存放于：

- [文章创作风格](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-style.md)
- [文章约束条件](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-constraints.md)
- [文章工作流](file:///e:/A_One_Year_Learning/Project/Secondary_Dev_Road/MDM-blog/.trae/rules/article-workflow.md)
```

---

## 6. 假设与决策记录

| 决策 | 选择 | 理由 |
|------|------|------|
| 命名风格 | 纯英文主题命名无编号 | 用户明确选择 |
| 文件粒度 | 3 个文件 | 用户明确选择（style / constraints / workflow） |
| 重复内容 | CLAUDE.md 删除重复，规则文件为唯一来源 | 用户明确选择 |
| 章节编号风格 | 保留 `## 1. xxx` 中文编号 | 维持可读性，与原风格一致 |
| 文件总标题 | 每个规则文件首行 `# 文章xxx` | 见名知意 |
| 代码风格（项目级） | 保留在 CLAUDE.md | 属于项目级代码规范，与文章创作无关 |
| ASCII 流程图示例 | 保留在 article-style.md | 是风格示例，非约束 |

---

## 7. 验证步骤

执行完毕后按以下顺序验证：

1. **文件结构验证**：
   - 确认 `.trae/rules/` 目录下仅存在 3 个 `article-*.md` 文件
   - 确认旧的 `project_rules*.md` 5 个文件已删除

2. **内容完整性验证**：
   - 通读 3 个新规则文件，确认原 5 个文件的所有规则点都已迁移
   - 检查是否有章节遗漏（如原 rules2 末尾的"## 3. 文章内容规范"已并入 article-constraints.md）

3. **CLAUDE.md 验证**：
   - 搜索 `frontmatter`、`文章命名`、`文章分类`、`Git 提交` 关键字，确认已无重复
   - 确认 Important Paths 路径已更新
   - 确认已新增「内容创作规范」章节引用 3 个规则文件

4. **交叉引用验证**：
   - 检查新规则文件之间的引用链接（如 article-style.md 引用 1.3 admonition 不再依赖跨文件编号）
   - 章节编号在每个文件内独立递增，不跨文件连续

5. **运行检查**（如适用）：
   - `pnpm check` 确认未引入错误

---

## 8. 风险与回滚

| 风险 | 影响 | 缓解 |
|------|------|------|
| 章节内容遗漏 | 中 | 按 §5 内容映射表逐项核查 |
| 旧文件删除后丢失内容 | 高 | 删除前确认新文件已写入并通过 §7 验证 |
| 跨文件链接断裂 | 低 | 新规则文件内部独立编号，跨文件用文件名引用 |
| CLAUDE.md 引用失效 | 中 | 更新 Important Paths + 新增引用章节 |

**回滚方案**：所有变更均为纯文件操作，未提交 git 时可通过文件系统回收站或 `git checkout` 恢复；已提交则 `git revert` 即可。
