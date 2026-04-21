---
title: 编程生涯：SSM框架学习——整合的艺术
published: 2023-10-12
description: 回顾2023年10月学习SSM框架（Spring+Spring MVC+MyBatis）的经历，从框架整合到踩坑实录，记录那段充满“配置地狱”与“豁然开朗”的历程，以及站在更高视角回望的感慨。
tags: [SSM, 编程生涯]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
2023年10月，学习 SSM 框架的时候，我内心只有一个声音：「前面的清朝老技术，真是白学了。」

这不是夸张。当我第一次看到 Spring Boot 的自动配置时，我才知道什么叫「站在巨人的肩膀上」。

而巨人，正是 SSM。
:::

## 故事要从一个「整合」说起

2023年10月，大二上学期。
学了 JavaWeb 基础之后，老师说：「接下来，我们学习 SSM 框架。」

SSM？什么来的？

- **S**pring — 搞对象的
- **S**pring **M**VC — 处理请求的
- **M**y**B**atis — 操作数据库的

听起来是三个框架对吧？但当我第一次看到它们的整合配置时，我意识到——这不是三个框架，这是三个「需要互相配合」的系统。

而让它们配合起来的那个「胶水」，才是 SSM 的精髓。

### 学习资源

说实话，SSM 的学习资料比 JavaWeb 多多了。

JavaWeb 时代，我跟着黑马的视频，评论区全是「懂的都懂」的笔记。

到了 SSM，视频还是那个视频，但评论区的笔记质量明显高了一个档次——因为能学到 SSM 的人，都是认真学过 JavaWeb 的，他们知道哪些地方容易踩坑。

:::note
感谢互联网的开源精神。

后来我写博客，也是抱着同样的心态：「只要有人能从我的笔记里受益，那这篇博客就没白写。」
:::

## SSM 框架概述

### 三者关系图

```
┌─────────────────────────────────────────────────────────┐
│                     SSM 应用架构                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ┌─────────────┐      ┌─────────────┐                 │
│   │    View     │      │   Android   │   ← 视图层     │
│   │   (JSP/HTML)│      │    Client   │                 │
│   └──────┬──────┘      └──────┬──────┘                 │
│          │                     │                       │
│          └────────┬────────────┘                       │
│                   ▼                                     │
│   ┌─────────────────────────────────────┐                │
│   │         Spring MVC                  │   ← 控制层   │
│   │   (Controller / RequestMapping)     │                │
│   └──────────────────┬──────────────────┘                │
│                      │                                    │
│                      ▼                                    │
│   ┌─────────────────────────────────────┐                │
│   │           Spring                    │   ← 业务层   │
│   │     (IoC / AOP / Service)          │                │
│   └──────────────────┬──────────────────┘                │
│                      │                                    │
│                      ▼                                    │
│   ┌─────────────────────────────────────┐                │
│   │          MyBatis                    │   ← 持久层   │
│   │     (SQL / Mapper / Session)       │                │
│   └──────────────────┬──────────────────┘                │
│                      │                                    │
│                      ▼                                    │
│   ┌─────────────────────────────────────┐                │
│   │          MySQL                      │   ← 数据层   │
│   └─────────────────────────────────────┘                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| 框架 | 职责 | 类比 |
|------|------|------|
| Spring MVC | 接收请求、参数绑定、视图解析 | 公司的前台 + 业务部门 |
| Spring | 业务逻辑管理、依赖注入、事务控制 | 公司的管理层 |
| MyBatis | SQL 执行、结果映射、连接管理 | 公司的档案室 |

### 为什么需要整合？

| 对比 | 单独使用 | SSM 整合 |
|------|----------|----------|
| 对象创建 | `new` 关键字 | Spring IoC 容器管理 |
| 请求处理 | `HttpServlet` | Spring MVC 注解 |
| 数据库操作 | JDBC 模板 | MyBatis Mapper |
| 事务管理 | 手动 `commit`/`rollback` | Spring 声明式事务 |
| 层间调用 | 接口+实现类手动new | 依赖注入 |

单独使用，每一层都要自己管理。
SSM 整合后，Spring 成了「大哥」，统一管理所有对象的生命周期。

## Spring：IoC 和 AOP

### IoC：控制反转——「别找我了，我来找你」

JavaWeb 时代，我们是这样写代码的：

```java
public class UserServlet extends HttpServlet {

    // 手动创建对象
    private UserService userService = new UserServiceImpl();

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        // 使用服务
        User user = userService.findById(1);
    }
}
```

问题在哪？

- `UserServiceImpl` 换了，`UserServlet` 要改
- `UserServiceImpl` 里有依赖（比如 DAO），也要手动创建
- 测试的时候，没法替换成 Mock 对象

IoC 的思想是：**对象的创建权反转了——从程序员手里，反转给了 Spring 容器。**

```java
public class UserServlet extends HttpServlet {

    // 不自己创建，让 Spring 注入进来
    private UserService userService;

    // Spring 会通过这个 setter 注入
    public void setUserService(UserService userService) {
        this.userService = userService;
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) {
        // 一样用，但不用关心它怎么来的
        User user = userService.findById(1);
    }
}
```

```xml
<!-- applicationContext.xml -->
<bean id="userService" class="com.example.service.impl.UserServiceImpl">
    <!-- 注入依赖 -->
    <property name="userDao" ref="userDao"/>
</bean>

<bean id="userServlet" class="com.example.servlet.UserServlet">
    <property name="userService" ref="userService"/>
</bean>
```

:::note
Spring 会在容器启动时，创建这些 Bean，并自动完成依赖注入。

你只管用，不用管它从哪来。
:::

### 注解开发：少写 XML 的福音

XML 配置虽然清晰，但写多了真是要命。

```java
// DAO 层
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM user WHERE id = #{id}")
    User findById(int id);
}

// Service 层
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User findById(int id) {
        return userMapper.findById(id);
    }
}

// Controller 层
@Controller
public class UserController {

    @Autowired
    private UserService userService;

    @RequestMapping("/user/{id}")
    @ResponseBody
    public User getUser(@PathVariable int id) {
        return userService.findById(id);
    }
}
```

| 注解 | 位置 | 作用 |
|------|------|------|
| `@Mapper` | DAO 接口 | MyBatis 扫描，创建实现类 |
| `@Repository` | DAO 实现类 | Spring 扫描，注册 Bean |
| `@Service` | Service 实现类 | Spring 扫描，注册 Bean |
| `@Controller` | Controller 类 | Spring MVC 扫描 |
| `@Autowired` | 属性/Setter | 依赖注入 |
| `@RequestMapping` | 方法/类 | 请求路径映射 |

:::warning
@Autowired 是按类型注入的。如果有多个同类型的 Bean，需要配合 `@Qualifier` 指定名称。
:::

### AOP：面向切面编程——「公共逻辑，一次搞定」

想象一个场景：你有 10 个 Service，每个Service的每个方法都需要「记录日志」。

JavaWeb 时代，你要在每个方法里手动加：

```java
public class UserServiceImpl implements UserService {

    @Override
    public void addUser(User user) {
        log.info("开始添加用户：" + user.getUsername());
        long start = System.currentTimeMillis();

        // 真正的业务逻辑
        // ...

        long end = System.currentTimeMillis();
        log.info("添加用户完成，耗时：" + (end - start) + "ms");
    }
}
```

AOP 的思想是：**把「横切关注点」（日志、事务、安全）抽离出来，形成独立的「切面」，然后动态地织入到目标方法的前后。**

```java
// 切面类
@Aspect
@Component
public class LogAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object around(ProceedingJoinPoint point) throws Throwable {
        // 获取方法签名
        String methodName = point.getSignature().getName();

        log.info("开始执行：" + methodName);
        long start = System.currentTimeMillis();

        // 执行目标方法
        Object result = point.proceed();

        long end = System.currentTimeMillis();
        log.info("执行完成：" + methodName + "，耗时：" + (end - start) + "ms");

        return result;
    }
}
```

```
┌──────────────────────────────────────────────────┐
│                  AOP 执行流程                    │
├──────────────────────────────────────────────────┤
│                                                  │
│   目标方法      ┌────────────────────┐          │
│  ┌────────┐ ──▶│  @Before 前置通知  │          │
│  │        │    └────────────────────┘          │
│  │  核心   │         │                         │
│  │  业务   │    ┌─────┴─────┐                  │
│  │  逻辑   │───▶│ @Around   │ ← 环绕通知       │
│  │        │    │  包裹目标  │                  │
│  └────────┘    └─────┬─────┘                  │
│         ▲            │                         │
│         │      ┌─────┴─────┐                   │
│         └──────│ @After    │ ← 最终通知        │
│                └───────────┘                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

| 通知类型 | 注解 | 执行时机 |
|----------|------|----------|
| 前置通知 | `@Before` | 方法执行前 |
| 后置通知 | `@AfterReturning` | 方法成功返回后 |
| 异常通知 | `@AfterThrowing` | 方法抛出异常后 |
| 最终通知 | `@After` | 方法执行后（无论成功/异常） |
| 环绕通知 | `@Around` | 包裹整个方法 |

## Spring MVC：请求处理流水线

### 工作流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spring MVC 请求处理流程                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   浏览器                    DispatcherServlet                    │
│      │                              │                            │
│      │   1. 发送请求                 │                            │
│      │ ────────────────────────────▶│                            │
│      │                              │                            │
│      │                    2. HandlerMapping                     │
│      │                    查找对应的 Controller                   │
│      │                              │                            │
│      │                              ▼                            │
│      │                    3. HandlerAdapter                     │
│      │                    调用 Controller                         │
│      │                              │                            │
│      │                              ▼                            │
│      │                    4. Controller                         │
│      │                    返回 ModelAndView                      │
│      │                              │                            │
│      │                              ▼                            │
│      │                    5. ViewResolver                       │
│      │                    解析视图名 → View                      │
│      │                              │                            │
│      │                              ▼                            │
│      │                    6. View                               │
│      │                    渲染视图                              │
│      │                              │                            │
│      │   7. 返回响应                 │                            │
│      │ ◀────────────────────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 一个完整的请求处理示例

```java
@Controller
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    // GET /user/1
    @GetMapping("/{id}")
    public String getUser(@PathVariable Integer id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "userDetail";  // 视图名，ViewResolver 会找到 /WEB-INF/views/userDetail.jsp
    }

    // GET /user/list
    @GetMapping("/list")
    @ResponseBody  // 直接返回数据，不走视图解析
    public List<User> listUsers() {
        return userService.findAll();
    }

    // POST /user/add
    @PostMapping("/add")
    public String addUser(@ModelAttribute User user, RedirectAttributes redirectAttributes) {
        userService.addUser(user);
        redirectAttributes.addFlashAttribute("message", "添加成功！");
        return "redirect:/user/list";  // 重定向
    }
}
```

| 注解 | 作用 | 示例 |
|------|------|------|
| `@RequestMapping` | 请求映射（支持所有HTTP方法） | `/user` |
| `@GetMapping` | GET 请求映射 | `@GetMapping("/list")` |
| `@PostMapping` | POST 请求映射 | `@PostMapping("/add")` |
| `@PathVariable` | 路径变量 | `/{id}` → `id` |
| `@RequestParam` | 请求参数 | `?name=xxx` |
| `@ModelAttribute` | 表单参数绑定 | 表单提交 |
| `@ResponseBody` | 直接返回 JSON/XML | 不走视图解析 |
| `@SessionAttributes` | Model 数据存入 Session | Model 数据共享 |

## MyBatis：让 SQL 成为「一等公民」

### 为什么需要 MyBatis？

JDBC 的问题：
- SQL 写在 Java 代码里，修改要重新编译
- 手动映射 ResultSet 到对象
- 重复的样板代码（获取连接、关闭资源）

MyBatis 的解决方案：
- SQL 写在 XML 文件（或注解）里，随时改随时用
- 自动映射结果集到对象
- 模板代码封装好了，只需写业务 SQL

### 快速上手

**1. 编写 Mapper 接口**

```java
public interface UserMapper {

    User findById(int id);

    List<User> findAll();

    void insert(User user);

    void update(User user);

    void delete(int id);
}
```

**2. 编写 Mapper XML**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.example.mapper.UserMapper">

    <select id="findById" resultType="User">
        SELECT * FROM user WHERE id = #{id}
    </select>

    <select id="findAll" resultType="User">
        SELECT * FROM user
    </select>

    <insert id="insert" parameterType="User">
        INSERT INTO user (username, password, email)
        VALUES (#{username}, #{password}, #{email})
    </insert>

    <update id="update" parameterType="User">
        UPDATE user
        SET username = #{username},
            password = #{password},
            email = #{email}
        WHERE id = #{id}
    </update>

    <delete id="delete" parameterType="int">
        DELETE FROM user WHERE id = #{id}
    </delete>

</mapper>
```

**3. 使用**

```java
public class UserServiceImpl implements UserService {

    private SqlSessionFactory sqlSessionFactory;

    @Override
    public User findById(int id) {
        // 每次操作都从 SqlSessionFactory 获取 SqlSession
        try (SqlSession session = sqlSessionFactory.openSession()) {
            UserMapper mapper = session.getMapper(UserMapper.class);
            return mapper.findById(id);
        }
    }
}
```

### 动态 SQL：让 SQL 真正「活」起来

动态 SQL 是 MyBatis 的杀手锏。

```xml
<select id="findByCondition" resultType="User">
    SELECT * FROM user
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="email != null and email != ''">
            AND email = #{email}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
    ORDER BY create_time DESC
</select>
```

| 动态 SQL 标签 | 作用 |
|---------------|------|
| `<if>` | 条件判断 |
| `<where>` | 智能 WHERE 块（自动去掉多余 AND） |
| `<set>` | 智能 SET 块（自动去掉多余逗号） |
| `<foreach>` | 循环遍历（批量操作） |
| `<choose>` | 多条件选择 |
| `<trim>` | 自定义前后缀处理 |

### 关联查询：一对多和多对一

```xml
<!-- 一对多：一个用户有多个订单 -->
<resultMap id="UserWithOrdersMap" type="User">
    <id property="id" column="user_id"/>
    <result property="username" column="username"/>
    <collection property="orders" ofType="Order">
        <id property="id" column="order_id"/>
        <result property="total" column="total"/>
    </collection>
</resultMap>

<select id="findUserWithOrders" resultMap="UserWithOrdersMap">
    SELECT u.id as user_id, u.username, o.id as order_id, o.total
    FROM user u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = #{id}
</select>
```

## SSM 整合：重头戏

### 整合思路

SSM 整合的核心，是让 **Spring 作为「大哥」**，统一管理所有组件：

| 层次 | 组件 | 管理框架 |
|------|------|----------|
| Web 层 | Controller | Spring MVC（其实是 Spring 的一部分） |
| Service 层 | ServiceImpl | Spring IoC |
| Dao 层 | Mapper | MyBatis |
| 数据库 | DataSource | Spring 事务 |

### 整合配置

**1. Spring 配置文件（applicationContext.xml）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:tx="http://www.springframework.org/schema/tx"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/tx
           http://www.springframework.org/schema/tx/spring-tx.xsd
           http://www.springframework.org/schema/aop
           http://www.springframework.org/schema/aop/spring-aop.xsd">

    <!-- 1. 加载数据库配置文件 -->
    <context:property-placeholder location="classpath:db.properties"/>

    <!-- 2. 配置数据源 -->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="${jdbc.driver}"/>
        <property name="url" value="${jdbc.url}"/>
        <property name="username" value="${jdbc.username}"/>
        <property name="password" value="${jdbc.password}"/>
    </bean>

    <!-- 3. 配置 SqlSessionFactory（Spring 整合 MyBatis） -->
    <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
        <property name="dataSource" ref="dataSource"/>
        <property name="mapperLocations" value="classpath:mapper/*.xml"/>
        <property name="typeAliasesPackage" value="com.example.entity"/>
    </bean>

    <!-- 4. 配置 Mapper 扫描（自动创建实现类） -->
    <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
        <property name="basePackage" value="com.example.mapper"/>
    </bean>

    <!-- 5. 配置 Spring 事务管理器 -->
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>

    <!-- 6. 开启事务注解 -->
    <tx:annotation-driven transaction-manager="transactionManager"/>

    <!-- 7. 开启组件扫描 -->
    <context:component-scan base-package="com.example.service"/>

</beans>
```

**2. Spring MVC 配置文件（spring-mvc.xml）**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xsi:schemaLocation="
           http://www.springframework.org/schema/beans
           http://www.springframework.org/schema/beans/spring-beans.xsd
           http://www.springframework.org/schema/context
           http://www.springframework.org/schema/context/spring-context.xsd
           http://www.springframework.org/schema/mvc
           http://www.springframework.org/schema/mvc/spring-mvc.xsd">

    <!-- 1. 组件扫描（Controller 层） -->
    <context:component-scan base-package="com.example.controller"/>

    <!-- 2. 开启 Spring MVC 注解 -->
    <mvc:annotation-driven/>

    <!-- 3. 配置视图解析器 -->
    <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
        <property name="prefix" value="/WEB-INF/views/"/>
        <property name="suffix" value=".jsp"/>
    </bean>

    <!-- 4. 静态资源放行 -->
    <mvc:resources mapping="/static/**" location="/static/"/>

    <!-- 5. 配置拦截器 -->
    <mvc:interceptors>
        <mvc:interceptor>
            <mvc:mapping path="/**"/>
            <mvc:exclude-mapping path="/login"/>
            <bean class="com.example.interceptor.LoginInterceptor"/>
        </mvc:interceptor>
    </mvc:interceptors>

</beans>
```

**3. web.xml 配置**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
                             http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
         version="4.0">

    <!-- 1. 配置 Spring 容器加载 -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:applicationContext.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- 2. 配置 DispatcherServlet（Spring MVC 前端控制器） -->
    <servlet>
        <servlet-name>dispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>dispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>

    <!-- 3. 字符编码过滤器 -->
    <filter>
        <filter-name>characterEncodingFilter</filter-name>
        <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
        <init-param>
            <param-name>encoding</param-name>
            <param-value>UTF-8</param-value>
        </init-param>
    </filter>
    <filter-mapping>
        <filter-name>characterEncodingFilter</filter-name>
        <url-pattern>/*</url-pattern>
    </filter-mapping>

</web-app>
```

**4. 数据库配置文件（db.properties）**

```properties
jdbc.driver=com.mysql.cj.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/ssm_demo?useSSL=false&serverTimezone=UTC
jdbc.username=root
jdbc.password=123456
```

### 整合后的项目结构

```
ssm_demo/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/
│       │       ├── controller/
│       │       │   └── UserController.java
│       │       ├── service/
│       │       │   ├── UserService.java
│       │       │   └── impl/
│       │       │       └── UserServiceImpl.java
│       │       ├── mapper/
│       │       │   └── UserMapper.java
│       │       ├── entity/
│       │       │   └── User.java
│       │       └── interceptor/
│       │           └── LoginInterceptor.java
│       ├── resources/
│       │   ├── applicationContext.xml
│       │   ├── spring-mvc.xml
│       │   ├── db.properties
│       │   └── mapper/
│       │       └── UserMapper.xml
│       └── webapp/
│           ├── WEB-INF/
│           │   └── views/
│           │       ├── login.jsp
│           │       └── userList.jsp
│           └── web.xml
└── pom.xml
```

:::note
这就是 SSM 整合的「标准姿势」。

相比 JavaWeb 时代，所有配置都集中管理了：
- 数据源、事务由 Spring 管理
- Controller 由 Spring MVC 管理
- Mapper 由 MyBatis 管理

三层之间，通过 Spring IoC 实现「解耦」——Service 不需要知道它注入的 Mapper 是谁创建的，Controller 也不需要知道它注入的 Service 是怎么实现的。
:::

## SSM 学习踩坑实录

### 坑一：MyBatis 找不到 Mapper

**问题现象**：

```
org.apache.ibatis.binding.BindingException: Invalid bound statement (not found)
```

**原因分析**：
- Mapper 接口和 XML 文件不在同一个包下
- Spring 没有扫描到 Mapper

**解决方案**：

1. 确保 XML 文件在 `resources/mapper/` 目录
2. SqlSessionFactory 配置 `mapperLocations` 指向正确路径
3. MapperScannerConfigurer 配置 `basePackage` 正确

```xml
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource"/>
    <property name="mapperLocations" value="classpath:mapper/*.xml"/>
</bean>

<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
    <property name="basePackage" value="com.example.mapper"/>
</bean>
```

### 坑二：事务不生效

**问题现象**：

数据库更新了，但没生效，数据没有持久化。

**原因分析**：
- Service 方法没有加 `@Transactional` 注解
- Spring 事务默认只对 RuntimeException 生效

**解决方案**：

```java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)  // 指定回滚异常
    public void updateUser(User user) {
        userMapper.update(user);
        // int i = 1 / 0;  // 测试事务回滚
    }
}
```

### 坑三：JSON 返回乱码

**问题现象**：

```java
@ResponseBody
@RequestMapping("/user")
public User getUser() {
    return userService.findById(1);
}
```

返回的 JSON 中文乱码：`{"username":"\u674E\u56DB"}`

**原因分析**：
- Spring MVC 没有配置消息转换器

**解决方案**：

```xml
<mvc:annotation-driven>
    <mvc:message-converters>
        <bean class="org.springframework.http.converter.StringHttpMessageConverter">
            <property name="supportedMediaTypes">
                <list>
                    <value>text/html;charset=UTF-8</value>
                    <value>application/json;charset=UTF-8</value>
                </list>
            </property>
        </bean>
    </mvc:message-converters>
</mvc:annotation-driven>
```

### 经验总结

| 阶段 | 学到的道理 |
|------|------------|
| 整合配置 | XML 配置虽然多，但每一步都有意义 |
| Mapper 编写 | SQL 是核心，映射是灵魂 |
| 事务管理 | 事务声明式，一行搞定 |
| 异常处理 | 统一异常处理，让代码更优雅 |
| 性能优化 | SQL 日志要开启，方便排查慢查询 |

## 回望 SSM

### SSM vs JavaWeb

| 对比维度 | JavaWeb（清朝） | SSM（近代） | Spring Boot（现代） |
|----------|----------------|-------------|---------------------|
| 配置方式 | `web.xml` + Servlet | XML 配置 + 注解 | 自动配置 + 注解 |
| 对象管理 | `new` 手动创建 | Spring IoC 容器 | Spring Boot 自动注入 |
| 数据库操作 | JDBC 模板 | MyBatis Mapper | JPA / MyBatis-Plus |
| 请求处理 | `HttpServlet` | Spring MVC 注解 | `@RestController` |
| 事务管理 | 手动 `commit` | `@Transactional` | 默认开启 |
| 部署方式 | WAR + Tomcat | WAR + Tomcat | JAR，内置容器 |

### SSM 的历史地位

SSM 是 JavaWeb 时代的「集大成者」。

它解决了 JavaWeb 的三大痛点：
1. **对象管理混乱** → Spring IoC 统一管理
2. **SQL 写在代码里** → MyBatis SQL 分离
3. **请求处理繁琐** → Spring MVC 注解驱动

:::note
后来出现的 Spring Boot，其实是 SSM 的「自动配置版」。

Spring Boot 会自动读取 `application.yml`，自动配置数据源、自动配置 Spring MVC、自动配置事务……

你需要写的，只是几个注解 + 业务代码。

这就是「站在 SSM 肩膀上」的 Spring Boot。
:::

---

## 站在 Spring Boot 的肩膀上

写这篇文章的时候，我已经用 Spring Boot 开发了很久。

一个完整的 SSM 项目，XML 配置可能有 200 行。

换成 Spring Boot：

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/demo
    username: root
    password: 123456
  mvc:
    view:
      prefix: /WEB-INF/views/
      suffix: .jsp
```

没有了 `applicationContext.xml`，没有了 `spring-mvc.xml`，没有了 `web.xml`。

甚至部署都不用手动配置 Tomcat 了——`java -jar xxx.jar` 启动一切。

但我知道，Spring Boot 的「自动配置」背后，是无数 SSM 时代的沉淀：

- `SqlSessionFactory` 的配置，Spring Boot 自动读取 DataSource
- `MapperScannerConfigurer`，Spring Boot 自动扫描 `@Mapper`
- `DispatcherServlet`，Spring Boot 自动注册
- 事务管理器，Spring Boot 自动开启

:::note
没有 SSM 的「手动配置」经历，就不会理解 Spring Boot 的「自动配置」有多爽。

这就是「清朝老技术」存在的意义——

不是为了让你回去用，而是为了让你明白，你现在用的工具，是怎么一步步演化过来的。

感谢 SSM，让我理解了「框架整合」的艺术。

感谢互联网的开源，让我站在前人的肩膀上，写出了自己的博客。
:::

---

*2023年10月的 SSM 学习结束了。那段「配置地狱」的日子，铸就了现在「理解 Spring Boot」的基础。*
