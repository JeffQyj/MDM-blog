---
title: 独立项目：AI+若依=帝可得
published: 2024-06-07
description: 基于 RuoYi-Vue3 前后端分离框架的智能售货机后台管理系统实战，涵盖代码生成器二次开发、RBAC 权限体系扩展、数据权限业务适配等核心知识点，记录从框架学习到业务落地的完整过程。
tags: [若依, 二次开发]
category: 独立项目
draft: false
lang: zh_CN
---

:::tip
2024 年 6 月，我完成了黑马程序员「AI+若依框架项目开发新方案」的学习。这是第一次系统接触国产开源快速开发平台，也是首次体验 AI 辅助编程在企业级项目中的实际应用。帝可得智能售货机管理系统是一个典型的「站在巨人肩膀上」的项目——基于 RuoYi-Vue3 框架，通过代码生成器 + 业务改造，在短时间内完成了一个完整的企业级后台系统开发。
:::

## 项目背景

### 项目定位与业务场景

帝可得智能售货机后台管理系统，定位是**售货机运营商的全链路数字化运营平台**。与传统的「卖设备」模式不同，帝可得解决的是「卖服务」的核心痛点：

- **设备管理难**：售货机分布广泛，状态不透明，运维成本高
- **补货不及时**：货道库存靠人工巡检，错失销售机会
- **运维效率低**：故障响应慢，工单流转不透明
- **数据不透明**：运营数据分散，无法支撑决策

系统的核心价值在于实现从 **C 端购买 → B 端运营**的全链路闭环：

```
用户扫码购买 ──▶ 订单生成支付 ──▶ 库存自动扣减 ──▶ 库存不足预警
      │
      ▼
补货工单自动派发 ──▶ 运维人员上门 ──▶ 工单核销 ──▶ 数据统计分析
```

### 核心角色与权限体系

帝可得系统涉及四类核心角色，每种角色对应不同的业务操作权限：

| 角色    | 主要职责               | 可操作范围        |
| ----- | ------------------ | ------------ |
| 系统管理员 | 基础数据管理、工单指派、人员权限分配 | 全部功能         |
| 运维人员  | 设备投放、设备维修、设备撤机     | 本区域设备 + 运维工单 |
| 运营人员  | 商品补货、货道调整、库存盘点     | 本区域设备 + 补货工单 |
| 合作商   | 查看所属点位设备运营数据、收益数据  | 所属合作商数据      |

### 核心功能模块一览

| 模块类型 | 主要功能              | 技术价值       |
| ---- | ----------------- | ---------- |
| 点位管理 | 区域划分、点位配置、合作商管理   | 空间数据权限隔离   |
| 设备管理 | 设备档案、状态监控、货道管理    | 设备与货道三级关联  |
| 商品管理 | 商品分类、SKU 管理、货道绑定  | 多对多关联设计    |
| 人员管理 | 运维/运营人员、区域绑定、绩效考核 | 数据权限扩展     |
| 策略管理 | 价格策略、促销配置、设备绑定    | 差异化定价能力    |
| 工单管理 | 补货/运维工单、自动派发、流程管控 | 状态机 + 消息通知 |
| 订单管理 | 订单同步、支付对接、库存联动    | 幂等性 + 乐观锁  |

:::note
相比之前做的青橙商城（电商平台）、苍穹外卖（外卖平台），帝可得项目的业务复杂度不算最高，但它解决了一个更实际的问题：**如何在成熟框架基础上快速构建业务系统**。这不是「从 0 开始造轮子」，而是「站在巨人肩膀上」的工程思维训练。
:::

***

## 技术架构

### 若依框架核心定位

RuoYi-Vue3 是国产开源企业级 Java 快速开发平台，采用 **MIT 开源协议**，核心设计理念是「**功能解耦、开箱即用、高效开发**」。如果说 Spring Boot 是 Java 后端的「自动挡汽车」，那 RuoYi 就是「带倒车影像、自动泊车的新手友好型汽车」——把企业级开发中的常见场景（权限、代码生成、定时任务、数据权限）都封装好了，开发者只需专注于业务逻辑。

**为什么选择若依？**

| 对比维度 | 从 0 开发               | 使用若依         |
| ---- | -------------------- | ------------ |
| 开发周期 | 2-3 个月（含权限系统）        | 2-4 周（纯业务开发） |
| 代码质量 | 取决于团队水平              | 经过大量项目验证     |
| 维护成本 | 高，需要自己造轮子            | 低，社区活跃、文档完善  |
| 学习成本 | 熟悉 Spring Security 等 | 熟悉若依封装即可     |

### 后端技术架构

项目采用 **Maven 多模块分层设计**，遵循「高内聚、低耦合」原则：

```
com.ruoyi（父工程）
├── ruoyi-common        // 通用工具层（基础支撑）
├── ruoyi-framework     // 框架核心层（核心控制）
├── ruoyi-system        // 系统业务层（内置业务）
├── ruoyi-admin         // 应用入口层（服务启动）
├── ruoyi-generator     // 代码生成层（可插拔扩展）
├── ruoyi-quartz        // 定时任务层（可插拔扩展）
└── ruoyi-ui            // 前端工程（Vue3）
```

| 模块名称            | 核心职责               | 通俗比喻             |
| --------------- | ------------------ | ---------------- |
| ruoyi-common    | 工具类、常量、异常、统一返回     | 建筑的地基 + 通用工具箱    |
| ruoyi-framework | 安全认证、拦截器、AOP、异步管理器 | 建筑的框架结构 + 物业管理系统 |
| ruoyi-system    | 用户、角色、菜单、部门等核心业务   | 建筑的精装样板间         |
| ruoyi-admin     | 启动入口、Controller 层  | 建筑的入户大堂          |
| ruoyi-generator | 可视化代码生成器           | 建筑的「复制粘贴」神器      |
| ruoyi-quartz    | 分布式定时任务            | 建筑的闹钟系统          |

### 前端技术架构

前端基于 **Vue3 + Vite + Element Plus + Pinia** 构建：

```
ruoyi-ui
├── src
│   ├── api          // 后端 API 接口封装
│   ├── assets       // 静态资源
│   ├── components   // 公共组件（分页、表格、上传）
│   ├── directive    // 自定义指令（权限、复制、防抖）
│   ├── layout       // 全局布局（侧边栏、顶栏、标签栏）
│   ├── router       // 静态路由 + 动态路由
│   ├── store        // Pinia 状态管理
│   ├── utils        // 工具类（请求封装、token）
│   └── views        // 业务页面
```

### 后端技术栈一览

| 架构层级 | 核心技术选型                       | 通俗比喻        |
| ---- | ---------------------------- | ----------- |
| 基础框架 | Spring Boot 2.7 + Spring MVC | 建筑骨架 + 门窗墙体 |
| 安全认证 | Spring Security + JWT        | 门禁系统 + 电子工牌 |
| 持久层  | MyBatis + PageHelper         | 仓库管理员 + 流水线 |
| 数据库  | MySQL 8                      | 中央档案室       |
| 缓存   | Redis 5                      | 快递柜         |
| 定时任务 | Quartz                       | 闹钟系统        |
| 代码生成 | 可视化逆向工程                      | 建筑的「复印机」    |
| 构建工具 | Maven 3.6                    | 建筑图纸管理      |

:::tip
若依的「开箱即用」体现在：登录认证、权限校验、代码生成、定时任务、数据权限、接口限流、跨域处理等企业级开发常见能力，都已经封装好了。这不是「框架」，更像是一套「成熟的脚手架」——帮你把地基、框架都搭好，你只需要「装修」。
:::

***

## 若依框架核心组件详解

### 组件一：ruoyi-common 通用工具层

#### 为什么需要它？

想象建筑施工时，每个工地都需要基础的「工具箱」——锤子、螺丝刀、扳手。如果每个施工队都自己造工具箱，浪费且不标准。`ruoyi-common` 就是若依的「标准工具箱」，把全项目通用的基础能力统一封装，避免重复造轮子。

#### 它是什么？

`ruoyi-common` 是整个项目的底层依赖，不依赖任何业务模块，提供全项目通用的基础能力。其核心子包包括：

| 子包         | 核心内容  | 作用                  |
| ---------- | ----- | ------------------- |
| annotation | 自定义注解 | 数据权限、日志记录、Excel 导出等 |
| constant   | 全局常量  | 用户状态、权限标识、异常编码      |
| core       | 核心控制类 | 分页处理、响应体封装、基类实体     |
| exception  | 异常体系  | 业务异常、工具异常、认证异常      |
| utils      | 通用工具类 | 字符串、日期、脱敏、Spring 容器 |

#### 核心组件代码示例

**统一响应体封装**：

```java
/**
 * 统一响应结果封装
 *
 * 为什么需要统一响应体？
 * - 前后端约定统一的响应格式，减少沟通成本
 * - 业务状态码与 HTTP 状态码分离，1=成功，0=失败
 * - 方便前端做统一处理，如 token 失效自动跳转登录页
 *
 * @param <T> 响应数据的泛型
 */
public class AjaxResult extends HashMap<String, Object> {

    private static final long serialVersionUID = 1L;

    /** 状态码（200=成功，500=系统异常） */
    public static final String CODE_TAG = "code";

    /** 返回内容 */
    public static final String MSG_TAG = "msg";

    /** 数据对象 */
    public static final String DATA_TAG = "data";

    /**
     * 初始化一个空的 AjaxResult
     */
    public AjaxResult() {
    }

    /**
     * 成功响应（无数据）
     */
    public static AjaxResult success() {
        return new AjaxResult().put(CODE_TAG, 200).put(MSG_TAG, "操作成功");
    }

    /**
     * 成功响应（带数据）
     *
     * @param data 响应数据
     */
    public static AjaxResult success(Object data) {
        return new AjaxResult().put(CODE_TAG, 200)
                .put(MSG_TAG, "操作成功")
                .put(DATA_TAG, data);
    }

    /**
     * 成功响应（自定义消息）
     *
     * @param msg 响应消息
     */
    public static AjaxResult success(String msg) {
        return new AjaxResult().put(CODE_TAG, 200).put(MSG_TAG, msg);
    }

    /**
     * 失败响应（系统异常）
     *
     * @param msg 错误消息
     */
    public static AjaxResult error(String msg) {
        return new AjaxResult().put(CODE_TAG, 500).put(MSG_TAG, msg);
    }

    /**
     * 失败响应（业务异常）
     *
     * @param code 业务状态码
     * @param msg  错误消息
     */
    public static AjaxResult error(int code, String msg) {
        return new AjaxResult().put(CODE_TAG, code).put(MSG_TAG, msg);
    }
}
```

**分页工具类**：

```java
/**
 * 分页工具类
 *
 * 为什么需要分页工具？
 * - 数据库查询如果返回全部数据，数据量大会导致内存溢出
 * - 前端展示也需要分页，一次性加载太慢
 * - 分页还能减少数据库连接占用时间
 *
 * 使用方式：在 Mapper 接口方法上加 @Param("pageNum") 和 @ @Param("pageSize")
 */
public class PageDomain {
    /** 当前页码（从 1 开始） */
    private Integer pageNum;

    /** 每页大小 */
    private Integer pageSize;

    /** 排序字段 */
    private String orderByColumn;

    /** 排序方向（asc/desc） */
    private String isAsc = "asc";

    /** 最大每页大小（防止一次性查询太多） */
    private static final Integer MAX_PAGE_SIZE = 100;

    public Integer getPageNum() {
        return pageNum != null ? pageNum : 1;
    }

    public Integer getPageSize() {
        if (pageSize == null || pageSize < 1) {
            return 10;  // 默认每页 10 条
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);  // 不超过最大限制
    }
}
```

#### 注意事项

- `ruoyi-common` 不能依赖 `ruoyi-system` 等业务模块，否则会造成循环依赖
- 工具类尽量使用静态方法，避免频繁创建对象
- 统一响应体的 `code` 是业务状态码，与 HTTP 状态码是两回事

***

### 组件二：ruoyi-framework 框架核心层

#### 为什么需要它？

如果说 `ruoyi-common` 是「工具箱」，那 `ruoyi-framework` 就是「楼宇的框架结构」——承重墙、梁柱、水电管网。它是所有业务模块的依赖基础，封装了 Spring Security 安全认证、拦截器体系、AOP 切面等核心能力。

#### 它是什么？

`ruoyi-framework` 是若依的「架构灵魂」，核心能力包括：

| 核心能力   | 说明                    | 苍穹外卖对标实现               |
| ------ | --------------------- | ---------------------- |
| 安全认证   | Spring Security + JWT |  JWT 拦截器               |
| 拦截器体系  | 重复提交、数据源切换、数据权限、接口限流  | JWT 拦截器                |
| AOP 切面 | 操作日志、数据权限、缓存过期        |  AutoFillAspect        |
| 异步处理   | 线程池管理器                | Spring Task            |
| Web 配置 | Jackson、跨域、静态资源、异常处理  | GlobalExceptionHandler |

#### 核心配置代码示例

**Spring Security 配置**：

```java
/**
 * Spring Security 配置
 *
 * 为什么需要 Security？
 * - 控制谁能访问哪些接口
 * - 防止未登录用户访问受保护资源
 * - 实现权限细粒度控制（按钮级别）
 *
 * 核心组件：
 * - SecurityMetadataSource：加载接口的权限配置
 * - AccessDecisionManager：判断当前用户是否有权限访问
 * - AuthenticationEntryPoint：认证失败时的处理
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    /**
     * 匿名访问配置
     * 定义哪些接口可以匿名访问（不需要登录）
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF（前后端分离项目通常不需要）
            .csrf().disable()

            // 基于 Token，不需要 session
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()

            // 请求权限配置
            .authorizeRequests()
                // 静态资源放行
                .antMatchers("/**/*.html", "/**/*.css", "/**/*.js").permitAll()
                // 登录接口放行
                .antMatchers("/login", "/register").permitAll()
                // 验证码接口放行
                .antMatchers("/captcha").permitAll()
                // 所有请求都需要认证
                .anyRequest().authenticated()
            .and()

            // 禁用缓存
            .headers()
                .frameOptions().disable()
                .cacheControl().disable();

        // 添加 JWT 过滤器（在 UsernamePasswordAuthenticationFilter 之前）
        http.addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        // 添加权限不足处理器
        http.exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler);
    }
}
```

**JWT 认证过滤器**：

```java
/**
 * JWT 认证过滤器
 *
 * 工作原理（想象快递站的分拣系统）：
 * 1. 快递员送来一个包裹（请求）
 * 2. 分拣员检查包裹上的工牌号（Token）
 * 3. 查询系统确认工牌有效且有权限送这片区域（权限校验）
 * 4. 有效则放行，无效则退回（继续过滤链）
 *
 * @Component 自动注册到 Spring Security 过滤链
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    /**
     * 核心过滤方法
     * EveryPerRequestFilter 保证每个请求只执行一次
     *
     * @param request     HTTP 请求
     * @param response    HTTP 响应
     * @param filterChain 过滤链（类似管道，向后传递）
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. 获取 Token（从 Header 中提取）
        String token = getToken(request);
        if (StringUtils.hasText(token)) {
            // 2. 解析 Token 获取用户信息
            LoginUser loginUser = tokenService.parseToken(token);

            if (loginUser != null) {
                // 3. 验证 Token 是否过期
                if (tokenService.verifyToken(loginUser)) {
                    // 4. 将用户信息存入 SecurityContext（类似请求级别的上下文）
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    loginUser,
                                    null,
                                    loginUser.getAuthorities()
                            );
                    authenticationToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 5. 将认证信息存入 SecurityContextHolder
                    // SecurityContextHolder 使用 ThreadLocal，线程独享
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        }

        // 6. 继续向后传递请求
        filterChain.doFilter(request, response);
    }

    /**
     * 从请求头中提取 Token
     *
     * 若依约定：Token 放在 Header 中，格式为 "Bearer {token}"
     * 这样做的好处是：1. 明确标识 token 类型 2. 方便代理层识别处理
     */
    private String getToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
            return token.substring(7);  // 去掉 "Bearer " 前缀
        }
        return null;
    }
}
```

#### 注意事项

- JWT Token 存在 localStorage 有 XSS 风险，生产环境建议存 Cookie（HttpOnly）
- Token 过期时间要合理：太短用户体验差，太长安全性降低（若依默认 12 小时）
- Security 配置的顺序很重要，antMatchers 要从具体到宽泛排列

***

### 组件三：ruoyi-system 系统业务层

#### 为什么需要它？

`ruoyi-system` 是若依内置的「精装样板间」——用户管理、角色管理、菜单管理、部门管理等所有企业系统的标配功能都给你做好了。不仅可以直接用，还可以作为「二次开发的参考范本」。

#### 它是什么？

内置系统管理的核心业务实现，涵盖：

| 业务模块 | 核心功能            | 技术实现             |
| ---- | --------------- | ---------------- |
| 用户管理 | 账号创建、密码加密、状态管理  | BCrypt 密码加密      |
| 角色管理 | 角色创建、权限分配、数据范围  | @PreAuthorize 注解 |
| 菜单管理 | 菜单路由、图标、排序、组件路径 | 树形结构设计           |
| 部门管理 | 部门层级、负责人、状态管理   | 树形结构设计           |
| 岗位管理 | 岗位设置、岗位用户关联     | 一对多关联            |
| 数据字典 | 枚举值管理、类型分组      | 缓存 + 动态加载        |
| 参数配置 | 系统参数、参数类型、是否敏感  | @Value 注解        |
| 操作日志 | 记录操作人、时间、内容、方法  | AOP 切面           |
| 登录日志 | 登录IP、时间、结果      | 异步记录             |

#### 核心代码示例

**用户注册密码加密**：

```java
/**
 * 用户注册（密码加密存储）
 *
 * 为什么需要加密？
 * - 数据库泄露时，攻击者拿不到明文密码
 * - 同一密码每次加密结果不同（加盐），防止彩虹表攻击
 *
 * BCrypt 工作原理：
 * - 内部维护盐值生成器，每次加密自动生成随机盐
 * - 盐值存在加密结果中，验证时自动提取
 * - 加密是 CPU 密集型（可配置强度），抗暴力破解
 *
 * @param registerBody 注册信息
 * @return 注册结果
 */
@PostMapping("/register")
public AjaxResult register(@RequestBody RegisterBody registerBody) {
    // 1. 参数校验
    if (StringUtils.isEmpty(registerBody.getUsername())
            || StringUtils.isEmpty(registerBody.getPassword())) {
        return AjaxResult.error("用户名或密码不能为空");
    }

    // 2. 检查用户名是否已存在
    if (userService.checkUsernameExists(registerBody.getUsername())) {
        return AjaxResult.error("用户名已存在");
    }

    // 3. 创建用户
    SysUser user = new SysUser();
    user.setUsername(registerBody.getUsername());
    user.setNickName(registerBody.getUsername());

    // 4. BCrypt 密码加密（关键！）
    // encryptPassword() 方法内部：
    // - 生成随机盐（16 字节）
    // - 使用 BCrypt 强哈希算法加密
    // - 返回格式：$2a$10$xxxxxx（$2a$版本，$10$强度，22位盐，31位哈希）
    String encryptedPassword = passwordService.encryptPassword(registerBody.getPassword());
    user.setPassword(encryptedPassword);

    // 5. 设置默认状态（正常）
    user.setStatus("0");

    // 6. 保存用户
    return success(userService.insertUser(user));
}

/**
 * BCrypt 密码加密工具
 */
@Service
public class PasswordService {

    /**
     * BCrypt 强度因子（4-31），越高越慢越安全
         * 默认 10，线上建议 12-13
     */
    private final int strength = 10;

    /**
     * BCrypt 盐值生成器（线程安全）
     */
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(strength);

    /**
     * 加密密码
     *
     * @param rawPassword 明文密码
     * @return 加密后的密码
     */
    public String encryptPassword(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     *
     * @param rawPassword     明文密码（用户输入）
     * @param encryptedPassword 加密密码（数据库存储）
     * @return 是否匹配
     */
    public boolean verifyPassword(String rawPassword, String encryptedPassword) {
        // matches() 方法会：
        // 1. 从加密密码中提取盐值
        // 2. 用同样的盐值加密明文密码
        // 3. 比较加密结果
        return encoder.matches(rawPassword, encryptedPassword);
    }
}
```

**角色权限分配**：

```java
/**
 * 分配菜单权限
 *
 * @param roleId      角色ID
 * @param menuIds     菜单ID数组（树形结构的节点）
 * @return 分配结果
 *
 * 核心思路：
 * - 角色和菜单是多对多关系，通过 sys_role_menu 表关联
 * - 分配权限就是维护这张关联表
 * - 前端通常用树形组件选择，返回选中的叶子节点 ID
 */
@PostMapping("/authRole/insertRoleAuth")
public AjaxResult insertRoleAuth(Long roleId, Long[] menuIds) {
    // 1. 先删除该角色的所有菜单权限
    roleMenuService.deleteRoleMenuByRoleId(roleId);

    // 2. 批量插入新的菜单权限
    if (menuIds != null && menuIds.length > 0) {
        List<SysRoleMenu> roleMenus = Arrays.stream(menuIds)
                .map(menuId -> {
                    SysRoleMenu roleMenu = new SysRoleMenu();
                    roleMenu.setRoleId(roleId);
                    roleMenu.setMenuId(menuId);
                    return roleMenu;
                })
                .collect(Collectors.toList());
        roleMenuService.batchInsertRoleMenu(roleMenus);
    }

    // 3. 清除该角色的菜单缓存（用户下次登录会重新加载）
    // 这里用 Redis 的 Set 类型存储，key = "menu:role:{roleId}"
    redisTemplate.delete("menu:role:" + roleId);

    return success();
}
```

#### 注意事项

- 用户密码必须 BCrypt 加密存储，绝不能明文
- 删除用户时通常采用「逻辑删除」（status 标记），而非物理删除
- 角色权限变更是「即时生效」还是「下次登录生效」需要设计好

***

### 组件四：代码生成器

#### 为什么需要它？

想象你要复制一篇文章，「从 0 开始打字」和「用复印机一键复印」哪个快？代码生成器就是若依的「复印机」——把数据库表「复印」成完整的 CRUD 代码，开发效率直接起飞。

#### 它是什么？

可视化代码生成器，支持 **数据库表逆向解析**，一键生成：

| 生成内容             | 说明                |
| ---------------- | ----------------- |
| Java 实体类（Entity） | 对应数据库表的 ORM 映射    |
| Mapper 接口        | 数据访问接口，定义 CRUD 方法 |
| Mapper XML       | MyBatis SQL 映射文件  |
| Service 层        | 业务接口 + 实现类        |
| Controller 层     | HTTP 接口定义         |
| Vue 前端页面         | 列表页 + 编辑弹窗        |

#### 代码生成器核心逻辑

**表结构逆向解析**：

```java
/**
 * 表结构信息（代码生成器的核心数据模型）
 *
 * 记录一张数据库表的结构信息，用于生成代码
 */
public class TableInfo {
    /** 表名称 */
    private String tableName;

    /** 表注释 */
    private String tableComment;

    /** 表前缀（用于生成类名，如 "tb_user" -> "User"） */
    private String tablePrefix;

    /** 类名称（首字母大写，如 "User"） */
    private String className;

    /** 类描述（从表注释提取） */
    private String classComment;

    /** 作者 */
    private String author;

    /** 包名（如 com.ruoyi.dkd） */
    private String packageName;

    /** 模块名（如 base、machine） */
    private String moduleName;

    /** 业务名（如 machine） */
    private String businessName;

    /** 生成路径 */
    private String genPath;

    /** 主键信息 */
    private TableField pkColumn;

    /** 字段列表 */
    private List<TableField> columns = new ArrayList<>();
}

/**
 * 字段信息（代码生成器的辅助数据模型）
 */
public class TableField {
    /** 字段名称（如 machine_code） */
    private String columnName;

    /** 字段注释（数据库 COMMENT） */
    private String columnComment;

    /** Java 类型（如 String、Long） */
    private String javaType;

    /** Java 字段名（驼峰命名，如 machineCode） */
    private String javaField;

    /** 是否主键 */
    private boolean isPk;

    /** 是否必填 */
    private boolean isRequired;

    /** 是否为文本类型（String） */
    private boolean isString;

    /** 查询方式（EQ=等于、LIKE=模糊、GT=大于） */
    private String queryType;
}
```

**代码生成策略**：

```java
/**
 * 代码生成器核心服务
 *
 * 核心方法：generateCode(TableInfo tableInfo)
 *
 * 生成流程：
 * 1. 准备模板引擎（Velocity/Beetl/FTL）
 * 2. 设置模板变量（表信息、作者、日期等）
 * 3. 渲染模板生成文件
 * 4. 打包成 zip 下载
 */
@Service
public class GenTableServiceImpl {

    @Autowired
    private GenTableMapper genTableMapper;

    @Autowired
    private VelocityEngine velocityEngine;

    /**
     * 生成代码文件
     *
     * @param tableInfo 表信息
     * @return 生成的代码文件列表
     */
    public byte[] generateCode(TableInfo tableInfo) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(outputStream);

        // 1. 生成 Java 代码
        generateEntity(tableInfo, zip);      // 实体类
        generateMapper(tableInfo, zip);      // Mapper
        generateService(tableInfo, zip);     // Service
        generateController(tableInfo, zip);  // Controller

        // 2. 生成 Vue 代码
        generateVue(tableInfo, zip);         // Vue 页面

        // 3. 生成菜单 SQL
        generateMenuSql(tableInfo, zip);

        zip.finish();
        return outputStream.toByteArray();
    }

    /**
     * 生成实体类
     *
     * 模板文件：entity.java.vm
     *
     * 核心逻辑：
     * 1. 读取模板
     * 2. 设置变量（类名、包名、字段列表）
     * 3. Velocity 渲染
     * 4. 写入 zip
     */
    private void generateEntity(TableInfo tableInfo, ZipOutputStream zip) {
        // 构造包名（com.ruoyi.{模块名}.domain）
        String packageName = tableInfo.getPackageName() + ".domain";
        String className = tableInfo.getClassName();

        // 创建模板上下文
        VelocityContext context = new VelocityContext();
        context.put("packageName", packageName);
        context.put("className", className);
        context.put("tableComment", tableInfo.getTableComment());
        context.put("columns", tableInfo.getColumns());
        context.put("author", tableInfo.getAuthor());
        context.put("date", new Date());

        // 渲染模板
        StringWriter writer = new StringWriter();
        velocityEngine.getTemplate("entity.java.vm", "UTF-8").merge(context, writer);

        // 写入 zip 文件
        String filePath = packageName.replace('.', '/') + "/" + className + ".java";
        zip.putNextEntry(new ZipEntry(filePath));
        zip.write(writer.toString().getBytes());
        zip.closeEntry();
    }
}
```

**实体类生成模板示例**（entity.java.vm）：

```vm
package ${packageName};

#if(${tableComment} != '')
    /**
     * ${tableComment}
     */
#end
public class ${className} {

#foreach ($column in $columns)
#if(${column.columnComment} != '')
    /** ${column.columnComment} */
#end
    private ${column.javaType} ${column.javaField};

#end

#foreach ($column in $columns)
#if(${column.javaField} == ${pkColumn.javaField})
    public ${column.javaType} get${column.javaField.substring(0,1).toUpperCase()}${column.javaField.substring(1)}() {
        return ${column.javaField};
    }

    public void set${column.javaField.substring(0,1).toUpperCase()}${column.javaField.substring(1)}(${column.javaType} ${column.javaField}) {
        this.${column.javaField} = ${column.javaField};
    }
#else
    public ${column.javaType} get${column.javaField.substring(0,1).toUpperCase()}${column.javaField.substring(1)}() {
        return ${column.javaField};
    }

    public void set${column.javaField.substring(0,1).toUpperCase()}${column.javaField.substring(1)}(${column.javaType} ${column.javaField}) {
        this.${column.javaField} = ${column.javaField};
    }
#end
#end
}
```

#### 注意事项

- 代码生成器生成的代码是「起点」而非「终点」，业务逻辑需要自己添加
- 生成前要合理设计数据库表结构，因为表结构决定了生成的代码质量
- 对于复杂业务（如多表关联、状态机），生成代码只能作为参考

***

## 若依框架高级特性

### 特性一：RBAC 权限体系

#### 为什么需要权限管理？

想象一栋办公楼：普通员工只能进自己部门楼层，部门经理能进更多楼层，高管能进所有楼层。没有权限管理，就像办公楼的门禁坏了——谁都能进任何地方，信息安全无从谈起。

#### 它是什么？

若依采用经典的 **用户-角色-菜单（按钮）** 三级 RBAC 权限模型：

```
用户 ──▶ 角色 ──▶ 菜单
 │        │        │
 │        │        ├── 页面权限（能看哪些菜单）
 │        │        └── 按钮权限（能做哪些操作）
 │
 └── 用户角色关联表（一对一）
         │
         └── 角色菜单关联表（多对多）
```

**通俗理解**：把权限系统想象成「酒店门禁」：

| 概念   | 酒店比喻       | 技术含义       |
| ---- | ---------- | ---------- |
| 用户   | 员工         | 系统的登录账号    |
| 角色   | 岗位（如前台、保洁） | 一组权限的集合    |
| 菜单   | 楼栋/区域      | 用户能访问的页面   |
| 按钮权限 | 房间钥匙卡      | 用户能执行的具体操作 |

#### 核心代码实现

**用户登录认证**：

```java
/**
 * 用户登录服务
 *
 * 核心流程：
 * 1. 验证用户名密码
 * 2. 生成 JWT Token
 * 3. 存入 Redis（缓存用户信息和权限）
 * 4. 返回 Token 给前端
 *
 * @param username 用户名
 * @param password 密码（明文，会 BCrypt 校验）
 * @return 登录结果
 */
public LoginUser login(String username, String password) {
    // 1. 参数校验
    if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password)) {
        throw new ServiceException("用户名或密码不能为空");
    }

    // 2. 验证码校验（如果开启了验证码）
    if (!captchaService.verify(request.getHeader("uuid"), request.getCode())) {
        throw new ServiceException("验证码错误");
    }

    // 3. 密码校验（BCrypt 比对）
    SysUser user = userMapper.selectByUsername(username);
    if (user == null) {
        throw new ServiceException("用户不存在");
    }

    if (!passwordService.verifyPassword(password, user.getPassword())) {
        // 记录登录失败日志
        loginLogService.recordLoginLog(username, "密码错误", getIp());
        throw new ServiceException("密码错误");
    }

    if ("1".equals(user.getStatus())) {
        throw new ServiceException("账号已被停用");
    }

    // 4. 构建用户权限信息（关键！）
    LoginUser loginUser = new LoginUser();
    loginUser.setUserId(user.getUserId());
    loginUser.setUsername(user.getUsername());
    loginUser.setDeptId(user.getDeptId());

    // 5. 查询用户角色列表
    List<SysRole> roles = roleMapper.selectRolesByUserId(user.getUserId());
    loginUser.setRoles(roles);
    loginUser.setRoleIds(roles.stream().map(SysRole::getRoleId).toArray(Long[]::new));

    // 6. 查询用户权限标识列表（用于 @PreAuthorize 校验）
    List<String> permissions = permissionMapper.selectPermsByUserId(user.getUserId());
    loginUser.setPermissions(permissions);

    // 7. 设置登录时间
    loginUser.setLoginTime(new Date());
    loginUser.setIpAddr(getIp());
    loginUser.setBrowser(getBrowser());
    loginUser.setOs(getOs());

    // 8. 存入 Redis（设置过期时间）
    // key 格式：login_tokens:{token}
    // value：LoginUser 对象的 JSON
    // 过期时间：默认 12 小时
    String token = JwtUtils.createToken(loginUser.getUserId());
    redisTemplate.opsForValue().set("login_tokens:" + token, loginUser,
            JwtUtils.EXPIRE_TIME, TimeUnit.MILLISECONDS);

    // 9. 记录登录成功日志
    loginLogService.recordLoginLog(username, "登录成功", getIp());

    return loginUser;
}
```

**接口权限校验**：

```java
/**
 * 权限校验注解
 *
 * 使用方式：
 * @PreAuthorize("@ss.hasPermi('system:user:list')")
 * public List<SysUser> list() { ... }
 *
 * @PreAuthorize("@ss.hasRole('admin')")
 * public void delete(Long userId) { ... }
 *
 * 工作原理：
 * 1. SpEL 表达式解析（如 @ss.hasPermi('system:user:list')）
 * 2. 获取当前登录用户的权限列表（从 SecurityContext 中获取）
 * 3. 判断是否包含 requiredPermission
 *
 * 为什么用注解而不是拦截器？
 * - 注解更灵活，可以精确控制每个方法的权限
 * - 注解的语义更明确，代码可读性更好
 */
@PreAuthorize("@ss.hasPermi('system:user:list')")
@GetMapping("/list")
public List<SysUser> list(SysUser user) {
    // 只有拥有 system:user:list 权限的用户才能访问此接口
    List<SysUser> list = userService.selectUserList(user);
    return success(list);
}

/**
 * Spring Security 权限校验工具
 *
 * 在 SpEL 表达式中通过 @ss 调用
 */
@Component
public class SecurityService {

    /**
     * 判断用户是否拥有指定权限
     *
     * @param permission 权限标识（如 system:user:list）
     */
    public boolean hasPermi(String permission) {
        // 1. 获取当前登录用户信息
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return false;
        }

        // 2. 获取用户权限列表
        List<String> permissions = loginUser.getPermissions();

        // 3. 超级管理员拥有所有权限
        if (isAdmin(loginUser)) {
            return true;
        }

        // 4. 检查是否包含目标权限
        // 支持权限通配符：system:* 表示所有 system: 开头的权限
        return permissions.stream()
                .anyMatch(p -> {
                    // 精确匹配
                    if (p.equals(permission)) {
                        return true;
                    }
                    // 通配符匹配（* 匹配任意字符）
                    if (p.endsWith(":*")) {
                        String prefix = p.substring(0, p.length() - 1);
                        return permission.startsWith(prefix);
                    }
                    return false;
                });
    }

    /**
     * 判断用户是否拥有指定角色
     *
     * @param role 角色标识
     */
    public boolean hasRole(String role) {
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return false;
        }

        // 超级管理员拥有所有角色
        if (isAdmin(loginUser)) {
            return true;
        }

        return loginUser.getRoles().stream()
                .anyMatch(r -> r.getRoleKey().equals(role));
    }
}
```

#### 登录认证全流程

```
1.前端发送用户名、密码到 /login 接口
         │
         ▼
2. 后端调用 AuthenticationManager 进行身份校验（BCrypt 比对）
         │
         ▼
3. 校验成功，通过 JWT 工具类生成 token
         │
         ▼
4. 将用户信息、权限列表、角色列表存入 Redis
         │
         ▼
5. 将 token 返回给前端，前端存入 localStorage
         │
         ▼
6.后续请求 Header 携带：Authorization: Bearer {token}
         │
         ▼
7. JWT 过滤器解析 token，从 Redis 校验有效性
         │
         ▼
8. 将权限信息注入 Spring Security 上下文
         │
         ▼
9. 通过 @PreAuthorize 注解完成接口访问控制
```

#### 注意事项

- 权限标识要统一规范，建议格式：`模块:业务:操作`（如 `system:user:add`）
- 超级管理员（role\_id=1）拥有所有权限，做任何权限校验前先判断
- 按钮级别的权限控制需要前端配合，使用 `v-hasPermi` 指令

***

### 特性二：数据权限

#### 为什么需要数据权限？

想象一个连锁药店：每个门店店员只能看到自己门店的库存，总部能看到所有门店。如果所有店员都能看到所有库存，信息泄露不说，还可能导致跨店调拨混乱。**数据权限**就是解决这个问题的——让不同角色「只看自己该看的数据」。

#### 它是什么？

数据权限是若依的**核心特色能力**，通过自定义注解 + AOP 切面实现，无需修改业务 SQL 即可完成不同角色的数据范围隔离。

**核心注解** **`@DataScope`**：

```java
/**
 * 数据权限注解
 *
 * 为什么需要这个注解？
 * - 如果每个方法都手动拼接 WHERE 条件，代码冗余且容易遗漏
 * - 如果修改权限规则，需要改所有相关方法
 * - 用注解声明式处理，业务代码与权限逻辑完全解耦
 *
 * 使用示例：
 * @DataScope(deptAlias = "d", userAlias = "u")
 * public List<VendingMachine> list(VendingMachine machine) { ... }
 *
 * @param deptAlias  部门表别名（必须指定，用于 SQL 拼接）
 * @param userAlias  用户表别名（可选，用于「仅本人」权限）
 */
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataScope {
    /**
     * 部门表的别名
     * 会自动拼接：AND dept_id IN (子部门ID列表)
     * 例如：deptAlias = "d" -> AND d.dept_id IN (...)
     */
    String deptAlias() default "";

    /**
     * 用户表的别名
     * 用于「仅本人」数据权限
     * 例如：userAlias = "u" -> OR u.user_id = #{currentUserId}
     */
    String userAlias() default "";
}
```

**AOP 切面实现**：

```java
/**
 * 数据权限切面
 *
 * 工作原理：
 * 1. 拦截带有 @DataScope 注解的方法
 * 2. 获取当前用户的数据权限范围（从 Redis/Session 中获取）
 * 3. 根据权限类型，拼接对应的 SQL 条件
 * 4. 将 SQL 条件存入 ThreadLocal，供 Mapper 读取
 *
 * 通俗理解：就像医院的「分诊台」
 * - 护士（切面）先问你是看什么科（获取权限）
 * - 根据你的科室挂号单（权限类型），分配到对应诊室（拼接 WHERE）
 * - 你直接进诊室就行，不需要知道怎么挂号（业务代码无感知）
 */
@Aspect
@Component
public class DataScopeAspect {

    /**
     * 切点表达式
     * 匹配所有带 @DataScope 注解的方法
     *
     * 格式解读：
     * @annotation(com.ruoyi.common.annotation.DataScope)
     * ↑ 匹配带此注解的方法
     */
    @Pointcut("@annotation(com.ruoyi.common.annotation.DataScope)")
    public void dataScopePoint() {
    }

    /**
     * 前置通知：执行 SQL 拼接
     */
    @Before("dataScopePoint()")
    public void before(JoinPoint joinPoint) {
        // 1. 获取当前登录用户
        LoginUser loginUser = getLoginUser();
        if (loginUser == null) {
            return;
        }

        // 2. 获取方法上的注解
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        DataScope dataScope = signature.getMethod().getAnnotation(DataScope.class);

        // 3. 获取数据权限范围（从用户信息中获取）
        Long userId = loginUser.getUserId();
        List<Long> deptIds = loginUser.getDeptIds();  // 用户可访问的部门列表

        // 4. 拼接 SQL 条件
        StringBuilder sqlString = new StringBuilder();

        if (!isAdmin(loginUser)) {
            // 非超级管理员，拼接数据权限条件

            if (deptIds != null && !deptIds.isEmpty()) {
                // 「本部门及以下」权限
                // 格式：AND dept_id IN (1,2,3,4,5)
                sqlString.append(StringUtils.format(
                        " AND {} IN ({})",
                        dataScope.deptAlias(),
                        StringUtils.join(deptIds, ",")
                ));
            }

            if (StringUtils.isNotEmpty(dataScope.userAlias())) {
                // 「仅本人」权限
                // 格式：OR user_id = 123
                sqlString.append(StringUtils.format(
                        " OR {} = {}",
                        dataScope.userAlias(),
                        userId
                ));
            }
        }

        // 5. 存入 ThreadLocal，供 Mapper 读取
        // 注意：Mapper XML 中需要使用 ${dataScope} 获取此值
        DataScopeContextHolder.setDataScope(sqlString.toString());
    }
}
```

**Mapper XML 中使用数据权限**：

```xml
<!-- Mapper XML 中的使用方式 -->
<select id="selectMachineList" resultMap="VendingMachineResult">
    SELECT m.*,
           n.node_name,
           r.region_name,
           p.partner_name
    FROM tb_vending_machine m
    LEFT JOIN tb_node n ON m.node_id = n.node_id
    LEFT JOIN tb_region r ON m.region_id = r.region_id
    LEFT JOIN tb_partner p ON m.partner_id = p.partner_id
    <!-- 方式一：通过 ${dataScope} 获取切面拼接的条件 -->
    <where>
        ${dataScope}  <!-- 这里会被 AOP 替换为 "AND m.dept_id IN (1,2,3)" -->
    </where>

    <!-- 方式二：使用 DataScopeColumn 工具类 -->
    <!-- DataScopeColumn.getDeptColumn('m.dept_id') 会根据权限类型返回对应条件 -->
</select>
```

**数据权限类型对照表**：

| 权限类型   | 适用角色    | SQL 拼接                 | 通俗比喻             |
| ------ | ------- | ---------------------- | ---------------- |
| 全部数据   | 超级管理员   | 不拼接条件                  | 院长：能看所有病历        |
| 本部门及以下 | 区域总监    | `dept_id IN (子部门ID列表)` | 科室主任：能看到本科室及下属科室 |
| 本部门    | 部门主管    | `dept_id = 当前部门ID`     | 组组长：只能看本组        |
| 仅本人    | 运维/运营人员 | `create_by = 当前用户ID`   | 药剂师：只能看自己录入的     |

#### 注意事项

- 数据权限基于部门表设计，如果业务表的 `dept_id` 关联的不是系统部门表，需要业务改造
- 复杂关联查询时，`@DataScope` 可能无法满足，需要手动处理
- 数据权限变更后，用户需要重新登录才能生效（因为权限信息缓存在 Redis）

***

### 特性三：动态路由与菜单加载

#### 为什么需要动态路由？

想象一家餐厅的智能叫号系统：VIP 客户一进来，系统自动识别身份，分配专属等候区，送上专属菜单。**动态路由**就是这样的「智能门禁」——不同用户登录，看到的菜单不一样，能访问的页面也不一样。

#### 它是什么？

若依的动态路由实现了「**不同用户登录后看到不同的菜单**」，核心流程：

```
用户登录成功
         │
         ▼
前端调用 getRouters 接口获取菜单列表
         │
         ▼
后端根据用户ID → 角色 → 菜单，查询权限菜单树
         │
         ▼
返回菜单数据（包含路由路径、组件路径、权限标识）
         │
         ▼
前端通过 Pinia 存储菜单，动态生成 Vue Router
         │
         ▼
根据菜单的 visible 属性，动态渲染左侧菜单栏
```

#### 核心代码实现

**后端菜单查询**：

```java
/**
 * 获取用户的路由菜单
 *
 * @return 菜单树
 *
 * 核心思路：
 * 1. 根据用户ID查询关联的角色
 * 2. 根据角色查询关联的菜单（只查目录和菜单，跳过按钮）
 * 3. 按父子关系组装成树形结构
 * 4. 返回给前端
 */
@GetMapping("/getRouters")
public List<RouterVO> getRouters() {
    // 1. 获取当前用户ID
    Long userId = getCurrentUserId();

    // 2. 查询用户关联的菜单列表
    // 注意：只查目录（type=0）和菜单（type=1），不查按钮（type=2）
    List<SysMenu> menus = menuMapper.selectMenusByUserId(userId);

    // 3. 组装成树形结构
    List<SysMenu> menuTree = buildMenuTree(menus);

    // 4. 转换为路由 VO
    return buildRoutes(menuTree);
}

/**
 * 组装菜单树（递归构建父子关系）
 */
private List<SysMenu> buildMenuTree(List<SysMenu> menus) {
    List<SysMenu> result = new ArrayList<>();

    for (SysMenu menu : menus) {
        // 顶级菜单（parentId = 0）
        if (menu.getParentId() == 0) {
            // 递归构建子菜单
            menu.setChildren(getChildren(menu, menus));
            result.add(menu);
        }
    }

    return result;
}

/**
 * 获取子菜单（递归）
 */
private List<SysMenu> getChildren(SysMenu parent, List<SysMenu> allMenus) {
    List<SysMenu> children = new ArrayList<>();

    for (SysMenu menu : allMenus) {
        if (menu.getParentId().equals(parent.getMenuId())) {
            menu.setChildren(getChildren(menu, allMenus));
            children.add(menu);
        }
    }

    return children;
}

/**
 * 构建路由 VO
 *
 * Vue Router 需要的字段：
 * - path：路由路径
 * - component：组件路径
 * - name：路由名称
 * - meta：元信息（标题、图标、权限标识等）
 */
private List<RouterVO> buildRoutes(List<SysMenu> menus) {
    List<RouterVO> routes = new ArrayList<>();

    for (SysMenu menu : menus) {
        RouterVO route = new RouterVO();
        route.setPath(menu.getPath());
        route.setName(menu.getRouterName());
        route.setComponent(menu.getComponent());
        route.setMeta(new RouterMeta());
        route.getMeta().setTitle(menu.getMenuName());
        route.getMeta().setIcon(menu.getIcon());
        route.getMeta().setPerms(menu.getPerms());

        // 如果有子菜单，递归构建
        if (menu.getChildren() != null && !menu.getChildren().isEmpty()) {
            route.setChildren(buildRoutes(menu.getChildren()));
        }

        routes.add(route);
    }

    return routes;
}
```

**前端动态路由注册**：

```javascript
// store/modules/user.js - Pinia 用户状态管理

/**
 * 获取路由菜单
 *
 * 核心流程：
 * 1. 调用后端接口获取菜单树
 * 2. 遍历菜单，转换为 Vue Router 格式
 * 3. 动态添加到路由表中
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token'),
    menuList: [],  // 菜单列表
    permissions: [],  // 权限标识列表
  }),

  actions: {
    /**
     * 获取路由菜单
     */
    async GetMenuList() {
      const res = await getRouters()
      this.menuList = res.data
      // 返回菜单树，用于动态添加路由
      return res.data
    },

    /**
     * 生成可访问的路由表
     *
     * @param menuList 菜单树
     */
    generateRoutes(menuList) {
      const routes = []

      menuList.forEach(menu => {
        // 创建路由配置
        const route = {
          path: menu.path,
          component: loadView(menu.component),
          name: menu.name,
          meta: {
            title: menu.meta.title,
            icon: menu.meta.icon,
            permissions: menu.meta.perms,
          }
        }

        // 如果是外部链接
        if (menu.path.startsWith('http')) {
          route.meta.url = menu.path
        }

        // 如果有子菜单，递归处理
        if (menu.children && menu.children.length > 0) {
          route.children = generateRoutes(menu.children)
        }

        routes.push(route)
      })

      return routes
    }
  }
})

/**
 * 加载视图组件
 *
 * @param viewPath 组件路径（如 /layout/LayoutNav）
 */
const loadView = (viewPath) => {
  if (!viewPath) {
    return () => import('@/layout/LayoutNav')
  }
  return () => import(`@/views${viewPath}`)
}
```

#### 注意事项

- 动态路由只支持前端文件路径，后端只返回路由配置
- 如果组件路径不存在，刷新页面会 404
- 菜单类型：`0`=目录，`1`=菜单，`2`=按钮

***

## 帝可得业务模块实战

### 模块一：基于代码生成器的开发流程

帝可得项目的所有业务模块（区域、点位、设备、货道、商品、工单、订单）均基于若依代码生成器开发，遵循「**数据库表设计 → 代码生成 → 业务改造**」的标准化流程。

#### Step 1：数据库表设计

以「设备表」为例，完整设计如下：

```sql
-- 设备信息表
-- 设计思路：一台设备属于一个点位，一个点位属于一个区域，一个区域可能有一个合作商
CREATE TABLE tb_vending_machine (
    -- 主键（自增）
    machine_id     BIGINT(20)      NOT NULL AUTO_INCREMENT  COMMENT '设备ID',

    -- 设备基本信息
    machine_code   VARCHAR(50)     NOT NULL                 COMMENT '设备编号（唯一）',
    machine_type   VARCHAR(20)     DEFAULT '饮料机'           COMMENT '设备类型：饮料机/零食机/综合机',

    -- 关联字段（核心外键）
    node_id        BIGINT(20)      NOT NULL                 COMMENT '所属点位ID',
    region_id      BIGINT(20)      NOT NULL                 COMMENT '所属区域ID',
    partner_id     BIGINT(20)      DEFAULT NULL              COMMENT '合作商ID',

    -- 设备状态（状态机核心）
    -- 0=未投放（仓库中）、1=运营中、2=撤机（退场）、3=故障
    status         TINYINT(1)      DEFAULT 0                 COMMENT '设备状态',

    -- 设备详情
    machine_model  VARCHAR(50)     DEFAULT NULL              COMMENT '设备型号',
    machine_spec   VARCHAR(200)    DEFAULT NULL              COMMENT '设备规格',
    buy_date       DATE            DEFAULT NULL              COMMENT '采购日期',
    投放时间         DATETIME        DEFAULT NULL              COMMENT '投放时间',

    -- 合作商分成比例（百分比）
    share_ratio    DECIMAL(5,2)    DEFAULT 30.00             COMMENT '合作商分成比例',

    -- 若依框架通用字段（自动填充）
    create_by      VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
    create_time    DATETIME        DEFAULT NULL              COMMENT '创建时间',
    update_by      VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
    update_time    DATETIME        DEFAULT NULL              COMMENT '更新时间',

    -- 主键和索引
    PRIMARY KEY (machine_id),
    UNIQUE KEY uk_machine_code (machine_code),  -- 设备编号不能重复
    KEY idx_region_id (region_id),               -- 区域查询加速
    KEY idx_node_id (node_id),                   -- 点位查询加速
    KEY idx_partner_id (partner_id)              -- 合作商查询加速
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设备信息表';
```

**表设计要点解析**：

| 设计要点 | 说明                   | 为什么重要            |
| ---- | -------------------- | ---------------- |
| 主键命名 | `machine_id` 而非 `id` | 避免多表关联时字段歧义      |
| 业务编码 | `machine_code` 唯一索引  | 设备编号必须全局唯一       |
| 状态设计 | `status` TINYINT     | 用数字而非字符串，便于状态机处理 |
| 关联字段 | 清晰的 `xxx_id` 命名      | 一看就知道关联到哪张表      |
| 通用字段 | `create_by/time` 等   | 若依自动填充的基础        |
| 索引设计 | 按查询场景建索引             | 提升查询性能           |

#### Step 2：一键生成代码

在若依的代码生成器中：

1. 点击「导入」，选择 `tb_vending_machine` 表
2. 填写生成信息：
   - 模块名：`dkd`（帝可得模块）
   - 业务名：`machine`（设备管理）
   - 包名：`com.ruoyi.dkd.base`（帝可得基础模块）
   - 作者：`ruoyi`
3. 选择生成模板：**单表**（设备是标准 CRUD）
4. 点击「生成代码」，下载 zip 包

**生成配置详解**：

| 配置项  | 值                   | 说明        |
| ---- | ------------------- | --------- |
| 生成方式 | zip 下载              | 一次性获取全部代码 |
| 前端模板 | Vue3 + Element Plus | 与若依前端配套   |
| 是否覆盖 | 否                   | 防止覆盖已有代码  |
| 是否压缩 | 是                   | 减少传输体积    |

#### Step 3：导入项目并业务改造

```bash
# 解压后的目录结构（严格遵循若依规范）
com.ruoyi.dkd.base
├── domain
│   ├── VendingMachine.java       # 设备实体类
│   └── VendingMachineVO.java      # 视图对象（列表展示用）
├── mapper
│   ├── VendingMachineMapper.java  # Mapper 接口
│   └── VendingMachineMapper.xml   # Mapper XML
├── service
│   ├── IVendingMachineService.java     # Service 接口
│   └── impl
│       └── VendingMachineServiceImpl.java  # Service 实现
├── controller
│   └── VendingMachineController.java    # Controller
└── vue
    ├── index.vue                  # 列表页
    └── form.vue                   # 编辑弹窗
```

#### Step 4：业务改造示例

**业务场景**：设备列表需要显示「点位名称」「区域名称」「合作商名称」

**问题分析**：

- 设备表只存储了 `node_id`、`region_id`、`partner_id`
- 列表页需要显示关联表的名称
- 需要 LEFT JOIN 查询

**Mapper XML 改造**：

```xml
<!-- VendingMachineMapper.xml -->
<!-- 完整列表查询，包含关联表字段 -->
<select id="selectMachineList" resultMap="VendingMachineResult">
    SELECT
        m.machine_id,
        m.machine_code,
        m.machine_type,
        m.node_id,
        m.region_id,
        m.partner_id,
        m.status,
        m.machine_model,
        m.share_ratio,
        m.create_time,
        -- 关联查询字段（核心改造点）
        n.node_name   AS "nodeName",      -- 点位名称
        r.region_name AS "regionName",    -- 区域名称
        p.partner_name AS "partnerName"   -- 合作商名称
    FROM tb_vending_machine m
    -- LEFT JOIN 保证设备信息不丢失（即使关联数据为空）
    LEFT JOIN tb_node n ON m.node_id = n.node_id
    LEFT JOIN tb_region r ON m.region_id = r.region_id
    LEFT JOIN tb_partner p ON m.partner_id = p.partner_id

    <!-- 若依数据权限自动拼接位置 -->
    <where>
        <!-- 关键词搜索（模糊匹配） -->
        <if test="machineCode != null and machineCode != ''">
            AND m.machine_code LIKE CONCAT('%', #{machineCode}, '%')
        </if>

        <!-- 状态筛选 -->
        <if test="status != null">
            AND m.status = #{status}
        </if>

        <!-- 区域筛选（数据权限相关） -->
        <if test="regionId != null">
            AND m.region_id = #{regionId}
        </if>

        <!-- 时间范围查询 -->
        <if test="params.beginTime != null and params.beginTime != ''">
            AND DATE_FORMAT(m.create_time,'%Y-%m-%d') &gt;= #{params.beginTime}
        </if>
        <if test="params.endTime != null and params.endTime != ''">
            AND DATE_FORMAT(m.create_time,'%Y-%m-%d') &lt;= #{params.endTime}
        </if>
    </where>

    <!-- 排序（默认按创建时间倒序） -->
    ORDER BY m.create_time DESC
</select>

<!-- ResultMap 定义（字段映射） -->
<resultMap id="VendingMachineResult" type="com.ruoyi.dkd.base.domain.VendingMachineVO">
    <!-- 主键映射 -->
    <id property="machineId" column="machine_id"/>

    <!-- 基本字段映射 -->
    <result property="machineCode" column="machine_code"/>
    <result property="machineType" column="machine_type"/>
    <result property="status" column="status"/>

    <!-- 关联字段映射（核心！） -->
    <result property="nodeName" column="nodeName"/>
    <result property="regionName" column="regionName"/>
    <result property="partnerName" column="partnerName"/>
</resultMap>
```

:::note
**LEFT JOIN vs INNER JOIN**：设备表用 LEFT JOIN 关联表，即使点位/区域/合作商被删除了，设备信息仍然能显示（只是关联名称为空）。如果用 INNER JOIN，关联数据不存在时设备会「消失」。
:::

***

### 模块二：设备-货道-商品三级关联

这是帝可得项目的**核心业务改造**，实现了「设备-货道-商品」的三级关联管理。

#### 为什么需要三级关联？

想象一个**智能快递柜**：

- **设备** = 快递柜整体（一排柜子）
- **货道** = 快递柜的每个格子（有不同的容量）
- **商品** = 格子里的具体商品（可能有多个同类商品在同一个格子）

没有三级关联的系统，只能管理「设备」，不能精细化管理「每个格子卖什么、有多少货」。

#### 业务场景分析

**场景描述**：一台饮料售货机有 40 个货道（每个货道卖一种商品），每个货道最多能放 50 瓶饮料。

- 当某瓶饮料被购买，系统需要知道：是哪台设备的哪个货道的库存减少了
- 当货道库存低于 10 瓶时，系统需要自动生成「补货工单」，派给运营人员
- 不同点位可能有不同的售价策略（商圈比社区贵）

#### 三级关联数据模型

```
设备表 (tb_vending_machine)          货道表 (tb_channel)              商品表 (tb_sku)
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ machine_id (PK)     │ ──1:N──▶ │ channel_id (PK)     │ ──N:1──▶ │ sku_id (PK)        │
│ machine_code        │          │ machine_id (FK)     │          │ sku_name            │
│ machine_type        │          │ channel_code        │          │ sku_price (原价)    │
│ node_id (FK)        │          │ max_capacity        │          │ sku_class_id (FK)   │
│ region_id (FK)      │          │ current_stock       │          └─────────────────────┘
│ partner_id (FK)     │          │ warning_stock        │
│ status              │          │ sku_id (FK)         │
└─────────────────────┘          │ channel_status      │
                                  └─────────────────────┘

关系解读：
- 一台设备 → 多个货道（1:N）
- 一个货道 → 绑定一种商品（N:1）
- 商品可以绑定到多个货道（同一商品放在不同设备的货道里）
```

**货道表核心字段详解**：

| 字段              | 类型      | 说明              | 设计考量            |
| --------------- | ------- | --------------- | --------------- |
| channel\_code   | VARCHAR | 货道编号（如 A01、A02） | 物理位置标识，方便运营人员定位 |
| max\_capacity   | INT     | 最大容量            | 控制货道最大库存，避免超装   |
| current\_stock  | INT     | 当前库存            | 实时库存，下单时扣减      |
| warning\_stock  | INT     | 预警库存            | 低于此值触发补货工单      |
| sku\_id         | BIGINT  | 绑定的商品ID         | 为 null 表示货道空闲   |
| channel\_status | TINYINT | 货道状态            | 0=正常、1=故障、2=待补货 |

#### 核心业务逻辑实现

**订单支付成功后，扣减货道库存**：

```java
/**
 * 订单支付成功回调处理
 *
 * 核心流程：
 * 1. 查询订单包含的商品明细
 * 2. 逐个扣减对应货道的库存
 * 3. 检查是否触发补货工单
 *
 * 为什么用事务？
 * - 扣库存和检查补货是原子操作
 * - 任何一步失败都需要回滚
 *
 * @param orderId 订单ID（支付回调时微信/支付宝会携带）
 */
@Override
@Transactional(rollbackFor = Exception.class)
public void handleOrderPaid(Long orderId) {
    // 1. 查询订单明细
    List<OrderItem> items = orderItemMapper.selectByOrderId(orderId);
    if (items == null || items.isEmpty()) {
        log.warn("订单 {} 无商品明细，可能数据异常", orderId);
        return;
    }

    // 2. 逐个处理商品扣减
    for (OrderItem item : items) {
        // 2.1 校验货道信息
        Channel channel = channelMapper.selectById(item.getChannelId());
        if (channel == null) {
            log.error("订单 {} 中的货道 {} 不存在", orderId, item.getChannelId());
            throw new BusinessException("货道信息不存在，订单处理失败");
        }

        // 2.2 检查库存是否充足（乐观锁校验）
        // 为什么要校验？防止并发超卖
        if (channel.getCurrentStock() < item.getQuantity()) {
            log.warn("货道 {} 库存不足：当前 {}，需要 {}",
                    channel.getChannelId(), channel.getCurrentStock(), item.getQuantity());
            throw new BusinessException("库存不足，商品：" + channel.getSkuName());
        }

        // 2.3 乐观锁扣减库存
        // 核心思路：通过 version 字段防止并发更新
        int updated = channelMapper.updateStockWithOptimisticLock(
                channel.getChannelId(),           // 货道ID
                channel.getCurrentStock(),         // 期望的当前库存（数据库中的值）
                channel.getCurrentStock() - item.getQuantity()  // 新的库存
        );

        if (updated == 0) {
            // 乐观锁冲突！说明有其他线程同时更新了这条记录
            log.warn("货道 {} 乐观锁冲突，可能存在并发更新", channel.getChannelId());
            throw new BusinessException("库存更新失败，请重试");
        }

        // 2.4 更新商品销量（用于统计分析）
        skuMapper.incrementSales(channel.getSkuId(), item.getQuantity());

        // 2.5 检查是否触发补货工单（库存低于预警值）
        int newStock = channel.getCurrentStock() - item.getQuantity();
        if (newStock <= channel.getWarningStock()) {
            log.info("货道 {} 库存 {} 低于预警值 {}，触发补货工单",
                    channel.getChannelId(), newStock, channel.getWarningStock());

            // 异步生成补货工单（不影响主流程）
            // 使用 @Async 注解或消息队列实现异步
            workOrderService.asyncGenerateReplenishOrder(channel);
        }
    }

    // 3. 更新订单状态为「已支付待发货」
    orderMapper.updateStatus(orderId, OrderStatus.PAID);

    log.info("订单 {} 支付成功，库存扣减完成，共 {} 个商品", orderId, items.size());
}

/**
 * 货道 Mapper（乐观锁更新）
 *
 * @param channelId     货道ID
 * @param expectedStock 期望的当前库存（用于乐观锁）
 * @param newStock      新的库存值
 * @return 更新行数（0 表示乐观锁冲突）
 */
int updateStockWithOptimisticLock(@Param("channelId") Long channelId,
                                  @Param("expectedStock") Integer expectedStock,
                                  @Param("newStock") Integer newStock);
```

```xml
<!-- Mapper XML 中的乐观锁实现 -->
<update id="updateStockWithOptimisticLock">
    UPDATE tb_channel
    SET current_stock = #{newStock}
    WHERE channel_id = #{channelId}
      AND current_stock = #{expectedStock}
    <!-- 关键：同时满足 channel_id 和 current_stock 才更新 -->
    <!-- 如果其他线程已经更新了 current_stock，这个条件就不满足了 -->
</update>
```

**货道配置前端改造**：

```vue
<!-- 货道配置弹窗（Vue3 + Element Plus） -->
<template>
    <el-dialog
        v-model="channelDialogVisible"
        title="货道配置"
        width="600px"
        :close-on-click-modal="false">

        <el-form
            ref="channelFormRef"
            :model="channelForm"
            :rules="channelRules"
            label-width="100px">

            <!-- 基本信息 -->
            <el-form-item label="货道编号" prop="channelCode">
                <el-input
                    v-model="channelForm.channelCode"
                    placeholder="如：A01"
                    maxlength="10"
                    :disabled="isEdit"/>
            </el-form-item>

            <!-- 商品绑定（核心交互） -->
            <el-form-item label="绑定商品" prop="skuId">
                <el-select
                    v-model="channelForm.skuId"
                    placeholder="请选择商品"
                    filterable
                    clearable
                    @change="handleSkuChange">
                    <el-option
                        v-for="sku in availableSkus"
                        :key="sku.skuId"
                        :label="`${sku.skuName} (库存:${sku.stock} | 售价:${sku.skuPrice})`"
                        :value="sku.skuId">
                        <div class="sku-option">
                            <span class="sku-name">{{ sku.skuName }}</span>
                            <span class="sku-info">库存: {{ sku.stock }} | 售价: ¥{{ sku.skuPrice }}</span>
                        </div>
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- 容量配置 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="最大容量" prop="maxCapacity">
                        <el-input-number
                            v-model="channelForm.maxCapacity"
                            :min="1"
                            :max="100"
                            :step="1"
                            controls-position="right"/>
                        <div class="form-tip">单个货道最大存放数量</div>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="预警库存" prop="warningStock">
                        <el-input-number
                            v-model="channelForm.warningStock"
                            :min="0"
                            :max="channelForm.maxCapacity"
                            :step="1"
                            controls-position="right"/>
                        <div class="form-tip">低于此值触发补货提醒</div>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 货道状态 -->
            <el-form-item label="货道状态" prop="channelStatus">
                <el-radio-group v-model="channelForm.channelStatus">
                    <el-radio :label="0">正常</el-radio>
                    <el-radio :label="1">故障</el-radio>
                    <el-radio :label="2">待补货</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>

        <!-- 弹窗底部按钮 -->
        <template #footer>
            <el-button @click="channelDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitChannelForm">确定</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
/**
 * 货道配置逻辑
 */
import { ref, reactive, computed } from 'vue'

// 货道弹窗是否显示
const channelDialogVisible = ref(false)

// 当前编辑的货道
const channelForm = reactive({
    channelId: null,
    channelCode: '',
    skuId: null,
    maxCapacity: 50,
    warningStock: 10,
    channelStatus: 0
})

// 商品列表（从后端加载）
const availableSkus = ref([])

// 校验规则
const channelRules = {
    channelCode: [
        { required: true, message: '请输入货道编号', trigger: 'blur' },
        { pattern: /^[A-Z]\d{2}$/, message: '格式应为字母+2位数字，如：A01', trigger: 'blur' }
    ],
    skuId: [
        { required: true, message: '请选择商品', trigger: 'change' }
    ],
    maxCapacity: [
        { required: true, message: '请输入最大容量', trigger: 'blur' }
    ],
    warningStock: [
        { validator: (rule, value, callback) => {
            if (value < 0) {
                callback(new Error('预警库存不能为负数'))
            } else if (value >= channelForm.maxCapacity) {
                callback(new Error('预警库存必须小于最大容量'))
            } else {
                callback()
            }
        }, trigger: 'blur' }
    ]
}

/**
 * 商品选择变化
 * 当选择商品时，自动填充建议的预警库存值
 */
const handleSkuChange = (skuId) => {
    if (skuId) {
        const sku = availableSkus.value.find(s => s.skuId === skuId)
        if (sku) {
            // 预警库存默认为最大容量的 20%
            channelForm.warningStock = Math.floor(channelForm.maxCapacity * 0.2)
        }
    }
}
</script>

<style scoped>
.sku-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sku-name {
    font-weight: 500;
}

.sku-info {
    font-size: 12px;
    color: #999;
}

.form-tip {
    font-size: 12px;
    color: #999;
    line-height: 1.4;
}
</style>
```

#### 技术要点总结

| 技术点  | 说明                                  | 苍穹外卖/传智健康对标  |
| ---- | ----------------------------------- | ------------ |
| 乐观锁  | `WHERE current_stock = #{expected}` | 苍穹外卖订单库存扣减   |
| 异步工单 | @Async 或 MQ                         | 无            |
| 多表关联 | LEFT JOIN                           | 青橙商城 SPU/SKU |
| 状态机  | 货道状态流转                              | 苍穹外卖订单状态     |

***

### 模块三：工单状态机与自动派发

工单管理是帝可得项目的**核心运营流程**，实现了设备运维与商品补货的流程化管控。

#### 为什么需要工单系统？

想象外卖平台没有「骑手接单」机制：用户下单后，骑手不知道该谁送、商家不知道谁来取。**工单系统**就是售货机运营的「调度中心」——系统自动派发工单，运维/运营人员接单执行，实现线上管理和线下执行的闭环。

#### 业务场景分析

**核心痛点**：

1. **货道库存不足**：用户买不到商品，错失销售机会
2. **设备故障未知**：设备坏了没人知道，直到用户投诉
3. **工单指派不清**：工单派给谁、执行到哪步，全靠电话沟通

**解决方案**：

```
库存低于预警 ──▶ 系统自动生成补货工单 ──▶ 派给对应区域运营人员
                                              │
                                              ▼
                                        运营人员接单
                                              │
                                              ▼
                                        上门补货 + 拍照上传
                                              │
                                              ▼
                                        运营人员核销工单
                                              │
                                              ▼
                                        货道库存已更新
```

#### 工单状态流转

```
待派发 ──▶ 待接单 ──▶ 执行中 ──▶ 待核销 ──▶ 已完成
                      │
                      └────────── 取消 ──────┘
```

**状态说明**：

| 状态  | 值 | 说明           | 可执行操作     |
| --- | - | ------------ | --------- |
| 待派发 | 0 | 工单已创建，等待系统派发 | 自动派发/手动指派 |
| 待接单 | 1 | 工单已指派，等待人员接单 | 接单/取消     |
| 执行中 | 2 | 人员已接单，正在执行   | 完成/取消     |
| 待核销 | 3 | 执行完成，等待确认    | 核销/驳回     |
| 已完成 | 4 | 工单结束，数据归档    | 无         |
| 已取消 | 5 | 工单取消，数据归档    | 无         |

#### 工单类型对照表

| 类型   | 触发条件        | 处理流程                 | 处理人  |
| ---- | ----------- | -------------------- | ---- |
| 补货工单 | 货道库存低于预警值   | 运营人员上门补货 → 拍照上传 → 核销 | 运营人员 |
| 运维工单 | 设备故障上报/自动检测 | 运维人员上门维修 → 故障记录 → 核销 | 运维人员 |
| 投放工单 | 新设备安装需求     | 运维人员安装调试 → 设备上线 → 核销 | 运维人员 |
| 撤机工单 | 设备退场需求      | 运维人员撤除设备 → 设备下架 → 核销 | 运维人员 |

#### 核心业务逻辑实现

**自动工单派发服务**：

```java
/**
 * 自动生成补货工单
 *
 * 触发场景：
 * 1. 订单扣减库存后，库存低于预警值
 * 2. 定时任务扫描发现库存不足
 *
 * 派发策略：
 * 1. 优先派给设备所属区域的负责人
 * 2. 如果没有负责人，派给默认处理人池
 * 3. 紧急工单（库存为0）提升优先级
 *
 * @param channel 货道信息
 */
@Override
public void generateReplenishOrder(Channel channel) {
    // 1. 获取货道对应的设备信息（检查设备状态）
    VendingMachine machine = machineMapper.selectById(channel.getMachineId());
    if (machine == null) {
        log.warn("货道 {} 对应的设备不存在，跳过工单生成", channel.getChannelId());
        return;
    }

    // 只对「运营中」的设备生成工单
    if (machine.getStatus() != MachineStatus.RUNNING) {
        log.info("设备 {} 状态为 {}，不生成补货工单",
                machine.getMachineId(), machine.getStatus());
        return;
    }

    // 2. 查询该区域的处理人（数据权限保证只看本区域）
    Long handlerId = userMapper.selectRegionManager(machine.getRegionId());

    // 3. 如果没有负责人，使用默认处理人
    if (handlerId == null) {
        log.warn("区域 {} 没有负责人，使用默认处理人", machine.getRegionId());
        handlerId = getDefaultHandler();
    }

    // 4. 生成工单编号（格式：GD + 年月日 + 6位序号）
    String workOrderNo = generateWorkOrderNo();

    // 5. 判断紧急程度
    // 库存为 0 是紧急补货，优先级更高
    int urgentLevel = (channel.getCurrentStock() <= 0) ? 1 : 0;

    // 6. 构建工单对象
    WorkOrder workOrder = WorkOrder.builder()
            .workOrderNo(workOrderNo)              // 工单编号
            .workOrderType(WorkOrderType.REPLENISH)  // 补货工单
            .machineId(machine.getMachineId())    // 关联设备
            .machineCode(machine.getMachineCode())
            .nodeId(machine.getNodeId())
            .regionId(machine.getRegionId())
            .channelId(channel.getChannelId())    // 关联货道
            .skuId(channel.getSkuId())            // 关联商品
            .skuName(channel.getSkuName())        // 商品名称（冗余存储，方便显示）
            .currentStock(channel.getCurrentStock())  // 当前库存
            .maxCapacity(channel.getMaxCapacity())    // 最大容量
            .needStock(channel.getMaxCapacity() - channel.getCurrentStock())  // 需要补货数量
            .handlerId(handlerId)                  // 处理人
            .status(WorkOrderStatus.PENDING)       // 待派发
            .urgentLevel(urgentLevel)              // 紧急程度
            .remark("库存预警自动生成")             // 备注
            .build();

    // 7. 保存工单
    workOrderMapper.insert(workOrder);

    // 8. 发送消息通知（异步，不阻塞主流程）
    // 方式一：RabbitMQ 消息队列
    // amqpTemplate.convertAndSend("workorder.exchange",
    //         "workorder.create", workOrder);

    // 方式二：WebSocket 推送（实时通知）
    webSocketServer.sendToUser(handlerId.toString(),
            JSON.toJSONString(Map.of("type", "workorder",
                    "action", "new", "data", workOrder)));

    // 9. 更新货道状态为「待补货」
    channelMapper.updateStatus(channel.getChannelId(), ChannelStatus.PENDING_REPLENISH);

    // 10. 更新工单状态为「待接单」（自动派发）
    workOrderMapper.updateStatus(workOrder.getId(), WorkOrderStatus.PENDING_RECEIVE);

    log.info("生成补货工单 {}，设备 {}，货道 {}，处理人 {}，紧急度 {}",
            workOrderNo, machine.getMachineCode(),
            channel.getChannelCode(), handlerId, urgentLevel);
}

/**
 * 工单编号生成
 * 格式：GD + 年月日（8位）+ 6位序号
 * 示例：GD20240607000001
 */
private synchronized String generateWorkOrderNo() {
    String date = new SimpleDateFormat("yyyyMMdd").format(new Date());
    String key = "workorder:no:" + date;

    // Redis INCR 保证序号原子性递增
    Long sequence = redisTemplate.opsForValue().increment(key);

    // 设置过期时间（防止数据膨胀）
    redisTemplate.expire(key, 2, TimeUnit.DAYS);

    return "GD" + date + String.format("%06d", sequence);
}
```

**工单接单服务**：

```java
/**
 * 工单接单
 *
 * 条件：
 * 1. 工单状态必须为「待接单」
 * 2. 接单人必须是工单的处理人（防止抢单）
 *
 * @param workOrderId 工单ID
 * @param handlerId   处理人ID（从当前登录用户获取）
 */
@Override
@Transactional
public void receiveWorkOrder(Long workOrderId, Long handlerId) {
    // 1. 查询工单
    WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
    if (workOrder == null) {
        throw new BusinessException("工单不存在");
    }

    // 2. 校验状态
    if (workOrder.getStatus() != WorkOrderStatus.PENDING_RECEIVE) {
        throw new BusinessException("工单状态不是待接单，无法接单");
    }

    // 3. 校验处理人（防止抢单）
    if (!workOrder.getHandlerId().equals(handlerId)) {
        throw new BusinessException("该工单已指派给其他人员，无法接单");
    }

    // 4. 更新状态为「执行中」
    workOrderMapper.updateStatus(workOrderId, WorkOrderStatus.EXECUTING);

    // 5. 记录接单时间和接单人
    workOrderMapper.updateReceiveInfo(workOrderId, handlerId, new Date());

    // 6. 发送消息通知（工单被接单）
    notifyWorkOrderChange(workOrder, "receive");

    log.info("工单 {} 被用户 {} 接单", workOrder.getWorkOrderNo(), handlerId);
}

/**
 * 工单核销（补货工单）
 *
 * 补货工单需要：
 * 1. 上传补货照片作为凭证
 * 2. 更新货道实际库存
 * 3. 计算补货数量是否正确
 *
 * @param workOrderId  工单ID
 * @param actualStock  实际补货后的库存
 * @param photos       补货照片URL列表
 * @param remark       备注
 */
@Override
@Transactional
public void completeReplenishOrder(Long workOrderId, Integer actualStock,
                                    List<String> photos, String remark) {
    // 1. 查询工单
    WorkOrder workOrder = workOrderMapper.selectById(workOrderId);
    if (workOrder == null) {
        throw new BusinessException("工单不存在");
    }

    // 2. 校验状态
    if (workOrder.getStatus() != WorkOrderStatus.EXECUTING) {
        throw new BusinessException("工单状态不是执行中，无法核销");
    }

    // 3. 校验实际库存
    if (actualStock == null || actualStock < 0) {
        throw new BusinessException("实际库存数据无效");
    }

    // 4. 更新货道库存
    Channel channel = channelMapper.selectById(workOrder.getChannelId());
    channel.setCurrentStock(actualStock);
    channel.setStatus(ChannelStatus.NORMAL);  // 恢复正常状态
    channelMapper.updateById(channel);

    // 5. 更新工单状态为「待核销」
    workOrderMapper.updateStatus(workOrderId, WorkOrderStatus.PENDING_VERIFY);

    // 6. 记录核销信息
    workOrderMapper.updateCompleteInfo(workOrderId, actualStock, photos, remark);
}
```

#### 技术要点总结

| 技术点  | 说明                 | 苍穹外卖对标         |
| ---- | ------------------ | -------------- |
| 状态机  | 工单状态流转             | 苍穹外卖订单状态       |
| 自动派发 | 库存预警触发             | 无              |
| 异步通知 | WebSocket/RabbitMQ | 苍穹外卖 WebSocket |
| 数据权限 | 区域数据隔离             | 无              |

:::note
**为什么用状态机而不是简单状态字段？** 状态机定义了「每种状态下能做什么、状态如何流转」，比简单 if-else 更清晰、更易维护。比如「待接单」状态只能做「接单」或「取消」，不能做「核销」——这些约束在状态机中天然体现。
:::

***

## 项目亮点与踩坑实录

### 亮点一：AI 辅助编程的深度应用

这个项目是黑马课程中首次深度融入 **AI 辅助编程** 的实战，我第一次体验了「用 AI 写代码」的真实感受。

#### AI 辅助场景对照表

| 场景        | 传统方式                | AI 辅助方式       | 效率提升  |
| --------- | ------------------- | ------------- | ----- |
| 业务 SQL 编写 | 手动拼接，容易出错           | AI 根据描述生成 SQL | \~50% |
| 前端页面定制    | 查文档、搜 StackOverflow | AI 直接生成代码     | \~70% |
| Bug 排查    | 打日志、一步步调试           | AI 分析异常信息定位问题 | \~60% |
| 代码优化      | 人工 Review           | AI 提出优化建议     | \~40% |
| 注释生成      | 复制粘贴改一改             | AI 自动生成规范注释   | \~80% |
| 代码解释      | 阅读理解                | AI 逐行解释       | \~90% |

#### 实际体验：通义灵码

**场景一：生成复杂 SQL**

```sql
-- 我告诉 AI：「查询每个区域的设备数量、订单总量、平均订单金额，按销售额降序排列」
-- AI 直接生成：

SELECT
    r.region_id,
    r.region_name,
    COUNT(DISTINCT vm.machine_id) AS machine_count,
    COUNT(o.order_id) AS order_count,
    IFNULL(SUM(o.pay_amount), 0) AS total_amount,
    IFNULL(AVG(o.pay_amount), 0) AS avg_amount
FROM tb_region r
LEFT JOIN tb_vending_machine vm ON r.region_id = vm.region_id AND vm.status = 1
LEFT JOIN tb_node n ON vm.node_id = n.node_id
LEFT JOIN tb_order o ON vm.machine_id = o.machine_id
    AND DATE_FORMAT(o.pay_time, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')
WHERE r.status = 1
GROUP BY r.region_id, r.region_name
ORDER BY total_amount DESC;
```

**场景二：Bug 定位**

```
我遇到的问题：订单支付成功后，库存扣减了两次

传统方式：
1. 检查扣库存代码有没有问题
2. 检查订单回调有没有重复调用
3. 检查数据库事务有没有问题
...花了2小时

AI 方式：
把异常日志和代码丢给 AI，AI 5分钟内定位到「订单回调被调用了两次」
解决方案：增加订单号去重检查
```

**场景三：代码优化建议**

```java
// 我的原始代码：批量插入订单明细
for (OrderItem item : items) {
    orderItemMapper.insert(item);
}

// AI 建议：使用批量插入，减少数据库交互次数
batchInsertOrderItems(items);  // 一次 SQL 插入所有数据

// AI 还指出：循环内的数据库操作是高并发瓶颈
// 如果有 100 个商品，就是 100 次数据库交互
// 批量插入只需要 1 次数据库交互
```

#### AI 的局限性

但 AI 不是万能的——**业务逻辑的判断、复杂场景的设计，仍然需要人来思考**：

| AI 擅长     | AI 不擅长      |
| --------- | ----------- |
| 套路化代码生成   | 理解业务背景和约束   |
| 语法错误修复    | 设计数据模型和业务架构 |
| 简单 bug 定位 | 分布式系统的复杂问题  |
| 解释现有代码    | 判断「该不该这么做」  |

**正确姿势**：AI 是「超级助手」，能帮你做重复性工作，但决策还得自己来做。

***

### 亮点二：订单幂等性与并发库存扣减

#### 问题痛点

售货机场景下的高并发问题：

1. **重复支付回调**：用户支付成功，微信回调由于网络问题发送了两次
2. **并发抢购**：多个用户同时抢购最后一个商品
3. **超卖风险**：库存 1 件，100 个人同时下单

#### 解决方案：分布式锁 + 乐观锁双保险

**分布式锁（防止重复提交）**：

```java
/**
 * 订单创建（幂等性保证）
 *
 * 三层防护：
 * 1. 幂等性检查（Redis）：防止重复提交
 * 2. 分布式锁（Redis SETNX）：防止并发重复下单
 * 3. 乐观锁（数据库）：防止库存超卖
 *
 * @param orderDTO 订单信息
 * @return 订单结果
 */
@Override
public OrderResult createOrder(OrderDTO orderDTO) {
    String orderNo = orderDTO.getOrderNo();

    // ─────────────────────────────────────────────
    // 第一层防护：幂等性检查（基于订单号）
    // ─────────────────────────────────────────────
    // 如果这个订单号已经处理过，直接返回成功（不重复处理）
    String idempotentKey = "order:idempotent:" + orderNo;
    if (redisTemplate.hasKey(idempotentKey)) {
        log.info("订单 {} 已存在，幂等性检查跳过", orderNo);
        return OrderResult.success("订单已处理");
    }

    // ─────────────────────────────────────────────
    // 第二层防护：分布式锁（防止并发重复下单）
    // ─────────────────────────────────────────────
    // SETNX = SET if Not eXists
    // 只有 key 不存在时才能设置成功，保证同一时刻只有一个请求能获取锁
    String lockKey = "order:lock:" + orderNo;
    Boolean lockAcquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "1", 10, TimeUnit.SECONDS);

    if (!lockAcquired) {
        // 没拿到锁，说明有其他请求正在处理这个订单
        log.warn("订单 {} 正在被处理，获取锁失败", orderNo);
        throw new BusinessException("订单处理中，请稍后重试");
    }

    try {
        // ─────────────────────────────────────────────
        // 第三层防护：业务处理 + 乐观锁库存扣减
        // ─────────────────────────────────────────────

        // 1. 创建订单
        Order order = buildOrder(orderDTO);
        orderMapper.insert(order);

        // 2. 扣减库存（乐观锁，内部已处理并发问题）
        try {
            stockService.deductStockWithOptimisticLock(order);
        } catch (StockInsufficientException e) {
            // 库存不足，订单自动取消
            orderMapper.updateStatus(order.getId(), OrderStatus.CANCELLED);
            throw e;
        }

        // 3. 标记订单已处理（用于幂等性检查）
        // 设置 24 小时过期，防止内存膨胀
        redisTemplate.opsForValue().set(idempotentKey, order.getId().toString(),
                24, TimeUnit.HOURS);

        log.info("订单 {} 创建成功", orderNo);
        return OrderResult.success(order);

    } finally {
        // ─────────────────────────────────────────────
        // 释放分布式锁（finally 中执行，保证一定释放）
        // ─────────────────────────────────────────────
        redisTemplate.delete(lockKey);
    }
}
```

**乐观锁扣减库存（防止超卖）**：

```java
/**
 * 扣减库存（乐观锁版本）
 *
 * 乐观锁原理：
 * - 读取数据时，记录当前版本号
 * - 更新数据时，检查版本号是否变化
 * - 如果版本号变了，说明有其他线程修改了数据，更新失败
 *
 * 适用场景：
 * - 读多写少的场景
 * - 并发冲突概率较低的场景
 *
 * @param order 订单信息
 */
@Override
public void deductStockWithOptimisticLock(Order order) {
    List<OrderItem> items = orderItemMapper.selectByOrderId(order.getId());

    for (OrderItem item : items) {
        // 1. 查询货道当前库存
        Channel channel = channelMapper.selectById(item.getChannelId());
        if (channel == null) {
            throw new BusinessException("货道不存在：" + item.getChannelId());
        }

        // 2. 检查库存是否充足
        if (channel.getCurrentStock() < item.getQuantity()) {
            throw new StockInsufficientException(
                    "商品【" + channel.getSkuName() + "】库存不足",
                    channel.getCurrentStock(),
                    item.getQuantity()
            );
        }

        // 3. 乐观锁更新库存
        // UPDATE tb_channel
        // SET current_stock = current_stock - #{quantity}
        // WHERE channel_id = #{channelId}
        //   AND current_stock >= #{quantity}
        int updated = channelMapper.decreaseStock(
                item.getChannelId(),
                item.getQuantity()
        );

        // 4. 如果更新行数为 0，说明库存已经被其他请求扣减了
        if (updated == 0) {
            // 乐观锁冲突！
            // 可能原因：
            // - 多个请求同时读取了相同的库存值
            // - 其中一个请求已经扣减了库存
            // - 其他请求的 UPDATE 条件不满足
            log.warn("货道 {} 库存扣减失败，乐观锁冲突", item.getChannelId());
            throw new BusinessException("库存已被其他订单占用，请重新下单");
        }

        log.debug("货道 {} 库存扣减成功：{} -> {}",
                item.getChannelId(),
                channel.getCurrentStock(),
                channel.getCurrentStock() - item.getQuantity());
    }
}
```

```xml
<!-- Mapper XML：乐观锁扣减库存 -->
<update id="decreaseStock">
    UPDATE tb_channel
    SET current_stock = current_stock - #{quantity}
    WHERE channel_id = #{channelId}
      AND current_stock >= #{quantity}
    <!-- 关键：同时满足货道ID和库存足够两个条件 -->
    <!-- 如果其他请求已经扣减了库存，这个 UPDATE 的影响行数就是 0 -->
</update>
```

#### 技术方案对比

| 方案   | 原理                | 优点        | 缺点         | 适用场景   |
| ---- | ----------------- | --------- | ---------- | ------ |
| 悲观锁  | SELECT FOR UPDATE | 保证数据一致性   | 性能差，容易死锁   | 并发量低   |
| 乐观锁  | 版本号/CAS           | 性能好，无死锁   | 冲突多时重试开销大  | 读多写少   |
| 分布式锁 | Redis SETNX       | 实现简单，可跨进程 | 有网络开销，可能死锁 | 防止重复提交 |
| 消息队列 | 异步处理              | 削峰填谷      | 延迟，不能实时返回  | 高并发下单  |

**帝可得的选择**：分布式锁（防重复）+ 乐观锁（防超卖）

:::note
**为什么不用悲观锁？** 悲观锁使用 `SELECT FOR UPDATE` 会锁定整行数据，在高并发场景下会导致大量线程等待，性能极差。乐观锁通过「先更新，再检查」的方式，让冲突的请求直接失败并重试，比排队等待更高效。
:::

***

### 踩坑实录：数据权限与关联查询的冲突

#### 问题现象

在设备列表页面，使用「区域总监」账号登录后，能看到**所有设备**的数据，而不是「只看自己及下级区域的数据」。

#### 根因分析

**数据权限注解** **`@DataScope`** 的 SQL 拼接机制：

```java
// 注解配置
@DataScope(deptAlias = "m.dept_id", userAlias = "m.create_by")
@GetMapping("/list")
public List<VendingMachine> list(VendingMachine machine) {
    return machineService.selectMachineList(machine);
}
```

**问题分析**：

```
┌──────────────────────────────────────────────────────────────────────┐
│  原始 SQL                                                            │
│  SELECT * FROM tb_vending_machine m                                  │
│  LEFT JOIN tb_region r ON m.region_id = r.region_id                  │
│  WHERE ...                                                           │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AOP 拼接后的 SQL                                                     │
│  SELECT * FROM tb_vending_machine m                                  │
│  LEFT JOIN tb_region r ON m.region_id = r.region_id                  │
│  WHERE ...                                                           │
│    AND m.dept_id IN (1, 2, 3, 4, 5)  ← 数据权限条件                   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  问题所在！                                                           │
│                                                                       │
│  设备表的 dept_id 字段关联的是「设备所属的区域」                         │
│  但数据权限想要过滤的是「操作用户所属的区域」                              │
│                                                                       │
│  如果设备 A 属于区域 1，但操作用户属于区域 2                            │
│  设备 A 也会被过滤掉（因为 1 不在用户可访问的 [2, 3, 4] 中）            │
│                                                                       │
│  相反，如果设备 B 属于区域 3，但用户只负责区域 1                         │
│  设备 B 也会被显示出来（因为 3 在可访问列表中）                          │
└──────────────────────────────────────────────────────────────────────┘
```

**核心问题**：数据权限拼接的 `dept_id` 是「设备所属区域」，但实际上应该根据「设备的归属关系」来判断，而不是简单根据 `dept_id`。

#### 解决方案

**方案一：通过数据权限关联查询**

```java
/**
 * 方案一：修改数据权限范围
 *
 * 思路：让数据权限条件关联到「点位表」或「区域表」，
 * 而不是直接用设备表的 dept_id
 *
 * 但这需要修改 @DataScope 注解的逻辑，或者使用子查询
 */
@DataScope(deptAlias = "r.dept_id", userAlias = "m.create_by")
// r 是区域表的别名，需要在 XML 中定义 JOIN
@GetMapping("/list")
public List<VendingMachineVO> list(VendingMachine machine) {
    return machineService.selectMachineVOList(machine);
}
```

**方案二：Service 层手动处理（推荐）**

```java
/**
 * 方案二：Service 层手动处理数据权限
 *
 * 适用场景：
 * 1. 复杂的多表关联查询
 * 2. 数据权限逻辑复杂，无法用 @DataScope 实现
 * 3. 需要根据业务灵活调整权限范围
 *
 * 优点：逻辑清晰，可精细控制
 * 缺点：代码量稍多
 */
@Override
public List<VendingMachineVO> selectMachineVOList(VendingMachine machine) {
    // 1. 获取当前用户信息
    LoginUser loginUser = getLoginUser();
    Long userId = loginUser.getUserId();
    boolean isAdmin = isAdmin(loginUser);

    // 2. 超级管理员不受数据权限限制
    if (isAdmin) {
        return baseMapper.selectMachineVOList(machine);
    }

    // 3. 获取用户的数据权限范围（部门ID列表）
    List<Long> allowedDeptIds = getDataScopeDeptIds(loginUser);

    // 4. 将权限范围注入查询条件
    if (allowedDeptIds != null && !allowedDeptIds.isEmpty()) {
        // 方式一：精确匹配
        machine.setAllowedDeptIds(allowedDeptIds);

        // 方式二：如果需要包含下级部门
        // List<Long> allDeptIds = getAllSubDeptIds(allowedDeptIds);
        // machine.setAllowedDeptIds(allDeptIds);
    } else {
        // 5. 非管理员但没有任何数据权限，只能看自己创建的
        machine.setCreateBy(loginUser.getUsername());
    }

    return baseMapper.selectMachineVOList(machine);
}
```

```xml
<!-- Mapper XML 中处理手动注入的数据权限 -->
<select id="selectMachineVOList" resultMap="VendingMachineVOResult">
    SELECT m.*,
           n.node_name,
           r.region_name,
           p.partner_name
    FROM tb_vending_machine m
    LEFT JOIN tb_node n ON m.node_id = n.node_id
    LEFT JOIN tb_region r ON m.region_id = r.region_id
    LEFT JOIN tb_partner p ON m.partner_id = p.partner_id

    <where>
        <!-- 关键词搜索 -->
        <if test="machineCode != null and machineCode != ''">
            AND m.machine_code LIKE CONCAT('%', #{machineCode}, '%')
        </if>

        <!-- 手动处理的数据权限 -->
        <if test="allowedDeptIds != null and allowedDeptIds.size() > 0">
            AND m.region_id IN
            <foreach collection="allowedDeptIds" item="deptId" open="(" separator="," close=")">
                #{deptId}
            </foreach>
        </if>

        <!-- 只看自己创建的数据（兜底） -->
        <if test="createBy != null and createBy != ''">
            AND m.create_by = #{createBy}
        </if>
    </where>
</select>
```

#### 经验总结

| 经验点            | 说明                                   |
| -------------- | ------------------------------------ |
| **声明式 vs 编程式** | `@DataScope` 是声明式，适合简单场景；复杂场景用编程式更灵活 |
| **权限字段要对应**    | 数据权限的 `dept_id` 要和业务表的主关联字段对应        |
| **做好兜底**       | 即使有数据权限，也要做好「只看自己创建」的兜底逻辑            |
| **测试要充分**      | 数据权限是安全红线，每个角色都要测试到位                 |

***

## 项目总结

### 技术成长

| 技术维度            | 掌握内容                      | 深入程度  |
| --------------- | ------------------------- | ----- |
| RuoYi 框架        | 代码生成器、数据权限、动态路由、定时任务      | ★★★★☆ |
| Spring Security | JWT 认证、权限注解、接口鉴权          | ★★★★☆ |
| 业务建模            | 设备-货道-商品三级关联、工单状态机        | ★★★★☆ |
| AI 辅助编程         | 通义灵码在需求分析、代码生成、Bug 排查中的应用 | ★★★☆☆ |
| 分布式锁            | Redis 分布式锁实现订单幂等性         | ★★★☆☆ |
| 乐观锁             | 库存扣减防超卖                   | ★★★☆☆ |

### 设计思想收获

1. **「站在巨人肩膀上」的工程思维**

   若依框架把企业级开发的「公共部分」都封装好了——登录认证、权限管理、代码生成、定时任务、数据权限。这不是「能力退化」，而是「**社会分工**」的体现：
   - 让专业的人做专业的事：若依团队维护框架，你专注业务
   - 不要重复造轮子：CRUD 能用代码生成器，就别自己写
   - 理解底层原理更重要：会用框架和理解框架是两回事
2. **代码生成器是起点，不是终点**

   生成的代码是标准化模板，实际业务需要在模板基础上改造：
   - 生成的 SQL 是基础 JOIN，实际业务需要更复杂的查询条件
   - 生成的前端页面是标准列表，实际业务需要更多交互
   - **理解模板的设计思路，比直接用更重要**
3. **AI 是助手，不是替代者**

   AI 能提升效率，但无法替代：
   - 业务理解：AI 不懂你的业务场景
   - 系统设计：AI 能写代码，但设计不了架构
   - 质量把控：AI 生成的代码需要人审查

### 与苍穹外卖的技术演进

| 对比维度  | 苍穹外卖（2024.05） | 帝可得（2024.06）           |
| ----- | ------------- | ---------------------- |
| 框架    | 纯 Spring Boot | RuoYi-Vue3（前后端分离）      |
| 权限    | JWT + 拦截器     | Spring Security + RBAC |
| 代码生成  | 手动编写（约2天/模块）  | 可视化代码生成器（约10分钟/模块）     |
| 数据权限  | 无             | @DataScope 注解实现        |
| 前端权限  | 无             | v-hasPermi 指令          |
| AI 辅助 | 无             | 通义灵码全程辅助               |
| 状态机   | 订单状态流转        | 工单状态流转                 |
| 并发控制  | 乐观锁           | 分布式锁 + 乐观锁             |

**从苍穹外卖到帝可得**：两个项目代表了不同的开发模式——苍穹外卖是「从 0 开始」，需要自己搭框架、写权限；帝可得是「站在巨人肩膀上」，基于成熟框架做业务开发。

两种模式都很重要：

- **从 0 开始**：帮助你理解底层原理，知道框架是怎么工作的
- **框架开发**：帮助你提升工程效率，把精力放在真正的业务价值上

:::note
帝可得项目让我第一次感受到了「**框架二次开发**」的魅力。若依不是银弹，但它提供了一套「可扩展的脚手架」——你可以使用它的默认实现，也可以替换掉任何你不满意的组件。这种「**封装与扩展的平衡**」，才是优秀框架的核心设计。
:::

***

*帝可得项目完成于 2024 年 6 月，是第一次完整体验「AI + 快速开发框架」的开发模式。从青橙商城的 SOA 分布式，到苍穹外卖的单体架构，再到帝可得的框架二次开发，每一次都在拓宽对「软件工程」的理解。*

*技术是工具，框架是脚手架，而工程思维，才是真正的核心能力。*
