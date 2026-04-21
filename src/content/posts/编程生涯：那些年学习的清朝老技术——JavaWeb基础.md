---
title: 编程生涯：那些年学习的清朝老技术——JavaWeb基础
published: 2023-09-09
description: 回顾2023年9月学习JavaWeb基础的时光，从Servlet到JSP，从Session/Cookie到Filter/Listener，从JDBC到Tomcat配置，记录那段充满"繁琐"与"困惑"的历程，以及站在Spring Boot时代回望的感慨。
tags: [JavaWeb, 编程生涯]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
回想起2023年9月那段学习 JavaWeb 的日子——Servlet、JSP、Session、Cookie、Filter、JDBC……每一个技术都像是在穿着厚厚的棉袄跳舞。

我戏称它们为「清朝老技术」。
:::

## 故事要从一个"登录"说起

2023年9月，大二开学没多久，老师布置了一个 Web 大作业——实现一个简单的用户登录系统。

听起来很简单对吧？一个表单，一个验证，一个跳转。

但当你用的是上述那些技术时，事情就开始变得……有趣了。

### 那个年代的"Hello World"

```java
// Servlet：处理登录请求
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        // 第一步：获取表单参数
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // 第二步：验证用户名密码（硬编码，简单粗暴）
        if ("admin".equals(username) && "123456".equals(password)) {
            // 第三步：登录成功，创建Session
            HttpSession session = request.getSession();
            session.setAttribute("user", username);

            // 第四步：重定向到成功页面
            response.sendRedirect("success.jsp");
        } else {
            // 第五步：登录失败，跳转回登录页
            request.setAttribute("error", "用户名或密码错误");
            request.getRequestDispatcher("login.jsp").forward(request, response);
        }
    }
}
```

然后你还需要在 `web.xml` 里配置这个 Servlet：

```xml
<!-- web.xml 配置 -->
<web-app>
    <servlet>
        <servlet-name>LoginServlet</servlet-name>
        <servlet-class>com.example.servlet.LoginServlet</servlet-class>
    </servlet>

    <servlet-mapping>
        <servlet-name>LoginServlet</servlet-name>
        <url-pattern>/login</url-pattern>
    </servlet-mapping>
</web-app>
```

这就是一个完整的"登录功能"。

:::note
现在你告诉我，这段代码写完了吗？

**没有。**

你还需要写：
- login.jsp（登录页面）
- success.jsp（成功页面）
- 处理注销的 LogoutServlet
- 也许还有一个 UserServlet 来管理用户

每一个 Servlet 都得像上面那样配置，每一个 JSP 都要处理一堆前端的东西。

现在回看，这简直是……信息密度极低的"仪式感"。
:::

## Servlet：JavaWeb 的"控制器"

### 什么是 Servlet？

Servlet 是 JavaWeb 的核心——一个被容器管理的、运行在服务器上的 Java 程序。

| 对比维度 | 现代框架（Spring Boot） | 纯 Servlet |
|----------|------------------------|------------|
| 请求映射 | 注解 `@GetMapping` | `web.xml` 配置 |
| 参数获取 | 自动映射到对象 | `request.getParameter()` |
| 返回视图 | 返回数据（JSON）或视图 | `RequestDispatcher.forward()` |
| JSON 响应 | 自动序列化 | 手动设置 `response.getWriter()` |
| 统一异常处理 | `@RestControllerAdvice` | 每个 Servlet 单独处理 |
| 拦截器 | Spring Interceptor | Filter |

### 一个 Servlet 的生命周期

```java
public class LifeCycleServlet extends HttpServlet {

    // 1. 初始化（容器调用，只调用一次）
    @Override
    public void init() throws ServletException {
        System.out.println("Servlet 被创建了！");
    }

    // 2. 处理请求（每次请求都会调用）
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        System.out.println("收到请求：" + request.getRequestURI());
        // 根据请求方法分发到 doGet 或 doPost
        super.service(request, response);
    }

    // 3. doGet 处理
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.getWriter().write("Hello, GET!");
    }

    // 4. 销毁（容器关闭时调用）
    @Override
    public void destroy() {
        System.out.println("Servlet 要被销毁了！");
    }
}
```

```
生命周期图：
┌──────────────────────────────────────────────┐
│                                              │
│    init()      service()       destroy()    │
│       │            │              │          │
│       ▼            ▼              ▼          │
│   ┌──────┐    ┌────────┐    ┌────────┐     │
│   │ 创建  │───>│ 处理请求 │───>│  销毁   │     │
│   └──────┘    └────────┘    └────────┘     │
│                                              │
│    一次          多次           一次         │
└──────────────────────────────────────────────┘
```

### 为什么说它"重"？

1. **每个请求都创建一个线程**——听起来不重，但管理线程池、避免线程安全问题，都是开发者的事。

2. **所有配置都在 XML 里**——一个项目 20 个 Servlet，XML 配置就有 200 行。

3. **没有自动注入**——`request.getParameter("xxx")` 要写到手酸。

:::warning
当时的 IDE（比如 Eclipse）还没有现在这么智能，你得手动在 `web.xml` 里敲配置，敲错了还不好排查。
:::

## JSP：模板引擎的"远古版本"

### JSP 是什么？

JSP（JavaServer Pages）是"在 HTML 里写 Java"，或者说是"让 HTML 看起来像 Java"。

```jsp
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="java.util.List" %>
<!DOCTYPE html>
<html>
<head>
    <title>用户列表</title>
</head>
<body>
    <h1>用户列表</h1>

    <%
        // Java 代码块
        List<User> users = (List<User>) request.getAttribute("users");
        for (User user : users) {
    %>

        <!-- HTML 和 Java 混在一起 -->
        <div class="user-item">
            <span>用户名：<%= user.getUsername() %></span>
            <span>邮箱：<%= user.getEmail() %></span>
        </div>

    <%
        }
    %>

    <!-- 表达式的写法 -->
    <p>当前时间：<%= new java.util.Date() %></p>
</body>
</html>
```

| JSP 元素 | 说明 | 示例 |
|----------|------|------|
| `<%@ page %>` | 指令 | 设置编码、导入包 |
| `<%! %>` | 声明 | 定义变量、方法（不常用） |
| `<% %>` | 代码块 | 写 Java 逻辑 |
| `<%= %>` | 表达式 | 输出变量值 |
| `<jsp:include>` | 动作 | 包含其他页面 |

### JSP 的"坑"

1. **Java 和 HTML 混在一起**——一个 500 行的 JSP，前端看到 Java 代码会懵，后端看到 HTML 也会懵。

2. **隐式对象太多**——`request`、`response`、`session`、`application`、`out`、`pageContext`……新手根本分不清该用哪个。

3. **难以测试**——JSP 需要服务器环境，没法像普通 Java 类那样写单元测试。

:::note
后来出了 JSTL（JSP Standard Tag Library），可以少写点 `<% %>`，但本质上还是换汤不换药。

再后来出现了 EL（Expression Language），`${user.username}` 这种写法优雅了一些。

但现代开发中，JSP 几乎不再使用——**前后端分离**成了主流，后端只返回 JSON，前端用 Vue/React/Angular 构建。

| 对比 | 清朝（JSP） | 现代（前后端分离） |
|------|-------------|------------------|
| 后端职责 | 处理请求 + 渲染视图 | 只返回 JSON 数据 |
| 前端职责 | 接收 HTML 渲染 | 构建整个 UI、处理路由、状态管理 |
| 数据格式 | HTML 模板 + 后端数据 | JSON + 前端渲染 |
| 职责分离 | 模糊，后端什么都干 | 清晰，前后端各司其职 |

JSP 就像是在用算盘做财务报表——能用，但太折磨人了。
:::

## Session 和 Cookie：状态管理的"手工时代"

### HTTP 是无状态的

这是 Web 开发的核心矛盾之一：HTTP 请求是独立的，服务器不记得"你"是谁。

```
第一次请求：你好，我是张三
第二次请求：你好，我是张三（但服务器不记得张三是谁）
```

于是有了 Session 和 Cookie 来解决这个问题。

### Cookie：存在浏览器的"小纸条"

```java
// 服务器端：创建 Cookie
Cookie cookie = new Cookie("username", "张三");
cookie.setMaxAge(7 * 24 * 60 * 60);  // 7天过期
cookie.setPath("/");                   // 整站可用
response.addCookie(cookie);

// 服务器端：读取 Cookie
Cookie[] cookies = request.getCookies();
if (cookies != null) {
    for (Cookie c : cookies) {
        if ("username".equals(c.getName())) {
            String username = c.getValue();  // "张三"
        }
    }
}
```

Cookie 的特点：
- **存在浏览器**——关闭浏览器再打开，只要没过期，Cookie 还在
- **随请求发送**——每个请求都会带着 Cookie 去服务器
- **大小有限**——一般 4KB 左右

```
Cookie 传递流程：
┌──────────┐         ┌──────────┐
│  浏览器   │         │  服务器   │
└─────┬────┘         └────┬─────┘
      │                   │
      │  第一次请求        │
      │───────────────────>│
      │   服务器创建Session │
      │   返回 Response   │
      │   (Set-Cookie)    │
      │<───────────────────│
      │                   │
      │  Cookie: JSESSIONID│
      │  第二次请求        │
      │───────────────────>│
      │  (带着 Cookie)     │
      │<───────────────────│
```

### Session：服务器端的"大仓库"

Session 是在服务器端存储用户数据的技术。每个 Session 有一个唯一的 ID，这个 ID 存在 Cookie 里。

```java
// 存储数据到 Session
HttpSession session = request.getSession();
session.setAttribute("user", userObject);       // 存对象
session.setAttribute("loginTime", new Date()); // 存日期

// 从 Session 读取数据
HttpSession session = request.getSession();
User user = (User) session.getAttribute("user");

// 删除 Session 数据
session.removeAttribute("user");

// 销毁整个 Session（登出）
session.invalidate();
```

| 对比 | Cookie | Session |
|------|--------|----------|
| 存储位置 | 浏览器 | 服务器 |
| 存储大小 | 4KB 左右 | 理论上无限制（看内存） |
| 安全性 | 低（用户可见可修改） | 高（用户看不到） |
| 适合存 | 用户偏好、非敏感标记 | 用户信息、敏感数据 |

### 现代方案：JWT——无状态的令牌

现代前后端分离项目中，Session 几乎不用了，取而代之的是 **JWT（JSON Web Token）**。

| 对比 | 清朝（Session/Cookie） | 现代（JWT） |
|------|------------------------|-------------|
| 存储位置 | Session 在服务器，Cookie 在浏览器 | 令牌存储在客户端（通常 localStorage） |
| 状态管理 | 有状态，服务器存储 Session | 无状态，服务器不存储任何用户数据 |
| 扩展性 | 难扩展，多服务器需要 Session 共享 | 容易扩展，任何服务器都能验证令牌 |
| 跨域支持 | 需要特殊配置 | 原生支持跨域 |
| 安全性 | HttpOnly Cookie 较安全 | 需注意 XSS 防护 |

```java
// JWT 登录示例
@PostMapping("/login")
public Result<String> login(@RequestParam String username,
                            @RequestParam String password) {
    User user = userService.login(username, password);

    // 生成 JWT 令牌
    Map<String, Object> claims = new HashMap<>();
    claims.put("userId", user.getId());
    claims.put("username", user.getUsername());

    String token = JwtUtil.createToken(claims);

    return Result.success(token);  // 返回给前端，前端存储在 localStorage
}
```

前端后续请求带上令牌：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

服务器验证令牌即可，**不需要存储 Session**，也不需要 Cookie。

### 登录验证的完整流程

```java
// 登录 Servlet
protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    String username = request.getParameter("username");
    String password = request.getParameter("password");

    // 假设这是验证逻辑
    if (validateUser(username, password)) {
        // 验证成功，创建 Session
        HttpSession session = request.getSession();
        session.setAttribute("loginUser", username);
        session.setMaxInactiveInterval(30 * 60);  // 30分钟无活动过期

        response.sendRedirect(request.getContextPath() + "/index.jsp");
    } else {
        // 验证失败
        request.setAttribute("errorMsg", "用户名或密码错误");
        request.getRequestDispatcher("/login.jsp").forward(request, response);
    }
}
```

```java
// 需要登录才能访问的 Servlet
protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    // 检查是否登录
    HttpSession session = request.getSession(false);
    if (session == null || session.getAttribute("loginUser") == null) {
        // 没登录，跳转到登录页
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }

    // 已登录，正常处理
    String username = (String) session.getAttribute("loginUser");
    response.getWriter().write("欢迎，" + username);
}
```

:::note
每次都要写这个「检查登录」的逻辑，是不是很烦？

后来有了 Filter（过滤器），可以统一处理这个逻辑——但那是另一个「配置地狱」的故事了。
:::

## Filter 和 Listener：JavaWeb 的"中间件"

### Filter：请求的"安检门"

Filter 可以在请求到达 Servlet 之前拦截它，做一些预处理。

```java
// 编码过滤器
public class EncodingFilter implements Filter {

    private String encoding = "UTF-8";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        String encodingParam = filterConfig.getInitParameter("encoding");
        if (encodingParam != null) {
            encoding = encodingParam;
        }
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
            FilterChain chain) throws IOException, ServletException {

        // 预处理：设置编码
        request.setCharacterEncoding(encoding);
        response.setCharacterEncoding(encoding);

        // 放行，让请求继续流向下一个 Filter 或 Servlet
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // 清理工作
    }
}
```

然后在 `web.xml` 配置：

```xml
<filter>
    <filter-name>EncodingFilter</filter-name>
    <filter-class>com.example.filter.EncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
</filter>

<filter-mapping>
    <filter-name>EncodingFilter</filter-name>
    <url-pattern>/*</url-pattern>  <!-- 拦截所有请求 -->
</filter-mapping>
```

### 常用 Filter 场景

| Filter 用途 | 说明 |
|-------------|------|
| 编码 Filter | 统一设置请求/响应编码 |
| 登录验证 Filter | 检查 Session 是否有用户信息 |
| 日志 Filter | 记录请求日志 |
| 权限 Filter | 检查用户权限 |
| 图片水印 Filter | 对图片进行处理 |

### Listener：事件的"监听器"

Listener 用于监听 Web 应用的事件，比如 Session 创建、销毁，或者 application 上下文初始化。

```java
// 监听 Session 创建和销毁
public class SessionListener implements HttpSessionListener {

    // 访问计数
    private int visitorCount = 0;

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        visitorCount++;
        System.out.println("Session 创建，当前访客数：" + visitorCount);
        se.getSession().getServletContext()
            .setAttribute("visitorCount", visitorCount);
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        visitorCount--;
        System.out.println("Session 销毁，当前访客数：" + visitorCount);
        se.getSession().getServletContext()
            .setAttribute("visitorCount", visitorCount);
    }
}
```

```xml
<!-- web.xml 配置 -->
<listener>
    <listener-class>com.example.listener.SessionListener</listener-class>
</listener>
```

### 常用 Listener 类型

| Listener 接口 | 监听事件 |
|---------------|----------|
| `ServletContextListener` | 应用启动/关闭 |
| `ServletContextAttributeListener` | application 属性变化 |
| `HttpSessionListener` | Session 创建/销毁 |
| `HttpSessionAttributeListener` | Session 属性变化 |
| `ServletRequestListener` | 请求开始/结束 |
| `ServletRequestAttributeListener` | 请求属性变化 |

:::warning
Filter 和 Listener 的问题在于——**配置太多**。

一个中型的 JavaWeb 项目，可能有 10 个 Filter，每个 Filter 要配置 `filter` 和 `filter-mapping`，再加上 `servlet` 和 `servlet-mapping`，`web.xml` 文件轻轻松松就是 300 行起步。

而这些配置，在 Spring Boot 里，一个 `@WebFilter` 或 `@Component` 注解就搞定了。
:::

## JDBC：数据库操作的"手工时代"

### JDBC 是什么？

JDBC（Java Database Connectivity）是 Java 连接数据库的标准 API。

```java
// JDBC 增删改查的"六步曲"

// 1. 加载驱动
Class.forName("com.mysql.cj.jdbc.Driver");

// 2. 获取连接
String url = "jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC";
Connection conn = DriverManager.getConnection(url, "root", "123456");

// 3. 创建语句执行者
Statement stmt = conn.createStatement();

// 4. 执行 SQL
String sql = "SELECT * FROM user WHERE username = '张三'";
ResultSet rs = stmt.executeQuery(sql);

// 5. 处理结果
while (rs.next()) {
    int id = rs.getInt("id");
    String name = rs.getString("username");
    String email = rs.getString("email");
    System.out.println(id + ": " + name + " - " + email);
}

// 6. 关闭资源（后开先关）
rs.close();
stmt.close();
conn.close();
```

### 完整封装：一个 JDBC 工具类

当时为了少写重复代码，我封装了一个 JDBC 工具类：

```java
public class JDBCTemplate {

    // 查询单条记录
    public static <T> T queryOne(String sql, RowMapper<T> mapper, Object... params) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            conn = getConnection();
            pstmt = conn.prepareStatement(sql);
            setParameters(pstmt, params);
            rs = pstmt.executeQuery();
            if (rs.next()) {
                return mapper.mapRow(rs);
            }
            return null;
        } catch (Exception e) {
            throw new RuntimeException("查询失败", e);
        } finally {
            close(conn, pstmt, rs);
        }
    }

    // 查询多条记录
    public static <T> List<T> queryList(String sql, RowMapper<T> mapper, Object... params) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        List<T> list = new ArrayList<>();
        try {
            conn = getConnection();
            pstmt = conn.prepareStatement(sql);
            setParameters(pstmt, params);
            rs = pstmt.executeQuery();
            while (rs.next()) {
                list.add(mapper.mapRow(rs));
            }
            return list;
        } catch (Exception e) {
            throw new RuntimeException("查询失败", e);
        } finally {
            close(conn, pstmt, rs);
        }
    }

    // 更新操作（增删改）
    public static int update(String sql, Object... params) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        try {
            conn = getConnection();
            pstmt = conn.prepareStatement(sql);
            setParameters(pstmt, params);
            return pstmt.executeUpdate();
        } catch (Exception e) {
            throw new RuntimeException("更新失败", e);
        } finally {
            close(conn, pstmt, null);
        }
    }

    // 设置参数
    private static void setParameters(PreparedStatement pstmt, Object... params)
            throws SQLException {
        if (params != null && params.length > 0) {
            for (int i = 0; i < params.length; i++) {
                pstmt.setObject(i + 1, params[i]);
            }
        }
    }

    // 关闭资源
    private static void close(Connection conn, Statement stmt, ResultSet rs) {
        if (rs != null) try { rs.close(); } catch (Exception e) {}
        if (stmt != null) try { stmt.close(); } catch (Exception e) {}
        if (conn != null) try { conn.close(); } catch (Exception e) {}
    }

    // RowMapper 接口
    public interface RowMapper<T> {
        T mapRow(ResultSet rs) throws SQLException;
    }
}
```

使用起来是这样的：

```java
// 查询一个用户
String sql = "SELECT * FROM user WHERE id = ?";
User user = JDBCTemplate.queryOne(sql, rs -> {
    User u = new User();
    u.setId(rs.getInt("id"));
    u.setUsername(rs.getString("username"));
    u.setEmail(rs.getString("email"));
    return u;
}, 1);

// 插入一个用户
String insertSql = "INSERT INTO user (username, password, email) VALUES (?, ?, ?)";
JDBCTemplate.update(insertSql, "李四", "pass123", "lisi@example.com");
```

:::note
当时我觉得这个 `JDBCTemplate` 封装得很优雅了，甚至有点小骄傲。

直到后来我知道了 MyBatis——它连 SQL 都不用写了，直接 `select * from user where id = #{id}` 就完事了。

再后来知道了 Spring Data JPA——连 SQL 都不用写了，定义个接口就行。

那一刻，我理解了什么叫「山外有山」。
:::

## 数据库连接池：性能优化的"手工时代"

### 什么是数据库连接池？

每次 SQL 操作都要创建和销毁数据库连接，这很耗时。连接池就是预先创建好一堆连接，用完了放回去，而不是每次都创建新的。

### 手写一个简单连接池

```java
public class SimpleConnectionPool {

    // 存放连接的容器
    private LinkedList<Connection> pool = new LinkedList<>();

    // 初始化连接池
    public SimpleConnectionPool(int initialSize) {
        for (int i = 0; i < initialSize; i++) {
            pool.add(createConnection());
        }
    }

    // 从池中获取连接
    public Connection getConnection() {
        synchronized (pool) {
            // 如果池空了，等待
            while (pool.isEmpty()) {
                try {
                    pool.wait();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            return pool.removeFirst();
        }
    }

    // 归还连接
    public void returnConnection(Connection conn) {
        synchronized (pool) {
            pool.addLast(conn);
            pool.notify();  // 唤醒等待的线程
        }
    }

    // 创建新连接
    private Connection createConnection() {
        try {
            return DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/mydb", "root", "123456");
        } catch (SQLException e) {
            throw new RuntimeException("创建数据库连接失败", e);
        }
    }
}
```

使用方式：

```java
// 创建连接池
SimpleConnectionPool pool = new SimpleConnectionPool(10);

// 获取连接
Connection conn = pool.getConnection();
try {
    // 使用连接...
    Statement stmt = conn.createStatement();
    ResultSet rs = stmt.executeQuery("SELECT * FROM user");
    // 处理结果...
} finally {
    // 归还连接（不是关闭！）
    pool.returnConnection(conn);
}
```

### 常用连接池对比

| 连接池 | 特点 | 性能 |
|--------|------|------|
| DBCP | Apache 老的连接池 | 一般 |
| C3P0 | 自动化资源管理 | 较差 |
| Druid | 阿里巴巴出品，功能强大 | 高，监控强 |
| HikariCP | 性能之王 | 最高 |

:::warning
当时课程要求用的是 C3P0，配置那叫一个复杂——`c3p0-config.xml` 各种属性，看得人头皮发麻。

后来换到 Druid，发现还有监控页面，可以实时看 SQL 执行情况、连接状态。

再后来用 Spring Boot，连接池？什么连接池？默认就给你配好了 HikariCP，开箱即用。

这就是「清朝」和「现代」的差距。
:::

## Tomcat：Web 容器的"安装与配置"

### Tomcat 目录结构

```
tomcat/
├── bin/              # 启动脚本（startup.bat/startup.sh）
├── conf/             # 配置文件
│   ├── server.xml    # 服务器配置（端口、虚拟主机）
│   └── web.xml       # Web 应用配置（欢迎页、Servlet 映射）
├── lib/              # 核心库
├── logs/             # 日志文件
├── webapps/          # Web 应用部署目录
│   ├── docs/         # Tomcat 文档
│   ├── examples/     # 示例应用
│   └── myapp/        # 自己的应用
└── work/             # 临时文件（JSP 编译后的 Java 文件）
```

### 修改端口号

打开 `conf/server.xml`：

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />
```

把 `8080` 改成 `80`：

```xml
<Connector port="80" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443" />
```

### 部署 Web 应用

部署方式一：直接把 WAR 包扔到 `webapps/` 目录

```
webapps/
├── myapp.war          # Tomcat 会自动解压
└── myapp/
    ├── WEB-INF/
    │   ├── classes/   # 编译后的 class 文件
    │   ├── lib/       # 依赖 jar 包
    │   └── web.xml    # 应用配置
    ├── index.jsp
    └── static/
```

部署方式二：配置虚拟主机（在 `server.xml` 中）

```xml
<Host name="www.myapp.com"  appBase="webapps/myapp"
      unpackWARs="true" autoDeploy="true">
</Host>
```

### IDEA 集成 Tomcat

在 IDEA 中配置 Tomcat 需要：
1. 下载 Tomcat
2. 在 IDEA 中添加 Server
3. 配置 Artifacts（WAR 包）
4. 部署并启动

每一步都可能出问题——端口被占用、Artifacts 配置错误、热部署失效……

:::note
现在用 Spring Boot，内置 Tomcat（也可以换成 Undertow 或 Jetty），直接 `java -jar xxx.jar` 就启动了。

什么端口配置、什么 WAR 部署、什么虚拟主机……通通不需要。

「清朝人」需要进京赶考，要准备干粮、绑腿、草鞋。

「现代人」呢？打开手机，买张机票。
:::

## 回望：那些"清朝老技术"教会我的

### 理解底层原理

学习 JavaWeb 基础，虽然繁琐，但让我理解了 Web 应用是怎么跑起来的：

- HTTP 请求是怎么被 Tomcat 接收的
- Servlet 容器是怎么管理 Servlet 生命周期的
- Session 和 Cookie 是怎么配合实现状态管理的
- Filter 链是怎么工作的
- JDBC 是怎么与数据库交互的

这些"底层知识"，在我后来用 Spring Boot 时，让我更能理解框架背后的原理。

### 配置即文档

虽然 XML 配置繁琐，但它有一个好处——**所有配置都集中在一个地方**。

现在用注解配置，虽然简洁，但配置分散在各个类里，有时候反而不好找。

:::note
没有一种技术是完美的。「繁琐」的配置有时候反而是「清晰」的表现。
:::

### 踩坑的意义

| 踩过的坑 | 学到的道理 |
|----------|------------|
| Servlet 线程安全问题 | 成员变量不能随意用，要考虑并发 |
| Session 超时 | 服务器资源是有限的，要及时清理 |
| 数据库连接泄漏 | 资源一定要关闭，放在 finally 块里 |
| Filter 顺序错误 | 链式处理是有顺序的，配置要注意 |
| JSP 乱码 | 编码问题要从源头抓起，统一 UTF-8 |

### 为什么称之为"清朝老技术"？

不是说这些技术本身不好，它们在那个年代是主流，是工业标准。

而是说，相比于现在的技术：

| 对比 | 清朝老技术（JavaWeb） | 现代技术（Spring Boot） |
|------|----------------------|------------------------|
| 配置方式 | XML（手写，易错） | 注解+自动配置 |
| 依赖管理 | 手动下载 jar | Maven/Gradle 自动管理 |
| 数据库操作 | JDBC 模板 | JPA/MyBatis-Plus |
| Web 框架 | 原生 Servlet | Spring MVC |
| 模板引擎 | JSP（Java 混写） | Thymeleaf（纯 HTML） |
| 部署方式 | WAR + Tomcat | JAR（内置容器） |
| 开发体验 | 配置半天，启动测试 | 写完代码，运行即用 |

**「清朝老技术」不是贬义，是「时代印记」的代名词。**

学习它们，不是为了回到那个时代，而是为了理解 Web 技术是怎么一步步走到今天的。

---

## 站在 Spring Boot 的肩膀上

写这篇文章的时候，我已经用 Spring Boot 开发了很久。

```java
// Spring Boot：一个登录功能
@RestController
public class LoginController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<String> login(@RequestParam String username,
                                 @RequestParam String password) {
        User user = userService.login(username, password);
        return Result.success(user.getUsername());
    }
}
```

没有 `web.xml`，没有 `HttpServlet`，没有 `doPost`/`doGet`，没有 `request.getParameter()`。

一行注解搞定一切。

但我知道，这一切的背后，是无数「清朝老技术」的沉淀：

- `@RestController` 底层还是 Servlet
- `@Autowired` 依赖注入的原理是反射
- Spring MVC 的请求处理链是基于 Filter 设计的
- 内置 Tomcat 还是那个 Tomcat

:::note
站在巨人的肩膀上，不是要忘记巨人。

感谢那些「清朝老技术」，让我在 Spring Boot 的时代，依然能理解脚下的每一块砖是怎么垒起来的。
:::

---

*2023年9月的 JavaWeb 基础学习结束了。那段「繁琐」的日子，铸就了现在「简洁」的理解。*
