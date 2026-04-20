### 推送规范（最高优先级）

只有当用户发出明确推送指令时才进行推送。

#### 推送前校验

**frontmatter 格式检查**（每次生成文章后第一时间检查）：

- 包裹符号必须为 `---`（三个连字符），不能使用 `----` 或其他符号
- 7 个必填字段：title、published、description、tags、category、draft、lang
- tags 为数组形式 `[]`，category 为字符串
- 所有字段值使用双引号或无引号，避免单引号

**代码校验**：新生成文章后运行 `pnpm check` 检查类型错误。

#### 推送流程（严格遵守 PowerShell 语法）

1. `git status` — 检查当前变更状态
2. 若有变更未提交：
   - `pnpm check` — 类型检查
   - `pnpm format` — 代码格式化
   - `git add .` — 暂存全量变更
   - `git commit -m "<提交信息>"` — 提交变更
3. `git push` — 推送到远程

#### commit 信息格式

```
<类型>: <简短描述>

可选的详细说明
```

类型参考：`feat`、`fix`、`docs`、`refactor`、`chore`

示例：

```
refactor: 统一生涯补全系列文章标题格式
```

