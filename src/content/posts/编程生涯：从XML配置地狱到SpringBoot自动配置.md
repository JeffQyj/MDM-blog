---
title: 编程生涯：从 XML 配置地狱到 Spring Boot 自动配置
published: 2024-01-19
description: 2024年1月，跟着黑马的步伐终于走进了现代 Java 技术栈。从 SSM 时代的 XML 配置地狱，到 Spring Boot 的自动配置，再到 MyBatis-Plus 的 CURD 简化——那些繁琐的冗余配置，全都没了。
tags: [Spring Boot, MyBatis-Plus]
category: 编程生涯
draft: false
lang: zh_CN
---

:::tip
这篇文章诞生于 2024年1月19日，是一个 Java 后端初学者对"技术进化"最真实的感悟。如果你也曾被 XML 配置折磨过，这篇可能会引起强烈共鸣。
:::

## 从「清朝老技术」说起

2022年9月，我揣着一台新电脑走进了编程的世界。老师丢给我们一套黑马的视频教程，说：「跟着走就行。」

于是我老老实实地跟着走，从 Java SE 到 Java Web，再到 SSM 框架（Spring + Spring MVC + MyBatis）。

那时候的我还不知道，我正在经历的是一套**上世纪的设计理念**。

Spring XML 配置写了几十行，MyBatis 映射文件又写了几十行，数据库连接信息写在 `db.properties` 里，还要手动管理事务——每个项目都是一套**八股文式的重复劳动**。

师兄们管这叫「经典」，但我只觉得：**怎么配这么多？**

:::note
「清朝老技术」这个词，是后来我跟同学互相调侃时诞生的。它指的不是某一项具体技术，而是一种"繁复、冗余、不必要的配置"的编程哲学。
:::

## 那些被 XML 支配的日子

说起 XML 配置，我到现在都记得那个下午。

我照着教程敲完了 `UserMapper.xml`，满心欢喜运行项目——报错。看了一眼控制台：

```
BindingException: Invalid bound statement (not found)
```

这句话我翻译了三遍，没看懂。后来发现，是 `namespace` 写错了一个字母。

但最让我崩溃的不是这个 bug，而是整个配置体验：

- `UserMapper.xml` 里 namespace 要和 Java 接口全限定名一致
- `resultType` 写的是 `User`，但包名不对就会找不到
- MyBatis 的报错信息从来不直接告诉你「哪里错了」，只告诉你「绑定失败」

每次出问题，我都要把 XML 和 Java 接口来回对照，眼睛找瞎。

更离谱的是，**每个新项目都要复制粘贴一套 XML 模板**——那些 `mapper` 标签、`resultMap` 标签、`select` 标签，内容大同小异，但就是不能没有。

我问师兄：「这东西能不能不写？」

师兄说：「这是 MyBatis 的规范，必须的。」

于是我沉默了，继续复制粘贴。

## 2024年1月：终于等来了「减负」

跟着黑马的教程一路狂奔，大概是学到 Spring Boot 那章的时候，我突然感觉——**天亮了**。

### Spring Boot 登场

```java
// 只需要一个启动类
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

没了？就这样？

对，**就这样**。

曾经需要：
- `applicationContext.xml` 配置 Bean
- `spring-mvc.xml` 配置视图解析器
- `web.xml` 配置 DispatcherServlet
- `db.properties` 写数据库连接

现在统统不要了。Spring Boot 秉承「**约定大于配置**」的理念，所有主流组件都有默认配置。你只需要关心那些**偏离默认的个性化配置**。

### Maven：依赖管理的革命

```xml
<!-- 曾经：手动下载 jar 包，手动导入项目，手动解决版本冲突 -->
<!-- 现在：一行 coordinates，版本管理交给 parent -->

<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.1</version>
</parent>

<dependencies>
    <!-- Web 场景启动器：内置 Tomcat，一行引入 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- MyBatis-Plus：增强 CRUD，告别 XML 映射文件 -->
    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
        <version>3.5.5</version>
    </dependency>
</dependencies>
```

曾经搭一个 SSM 项目，引入一个 Druid 连接池，就要找三个 jar 包、解决两个版本冲突、配四个配置文件。

现在？**一个依赖声明，三秒钟解决。**

| 场景 | SSM 时代 | Spring Boot 时代 |
|------|---------|----------------|
| 引入 Spring MVC | 手动引入 5 个 jar，手动管理版本 | 1 个 `spring-boot-starter-web` |
| 引入数据库连接池 | Druid 独立配置 + 4 个 jar 包 | 引入 starter 后自动配置 |
| 版本管理 | 每个依赖独立声明版本，容易冲突 | `spring-boot-starter-parent` 统一管理 |
| 内嵌服务器 | 手动部署到外置 Tomcat | 内置 Tomcat/Jetty，一键运行 |

### MyBatis-Plus：CRUD 从 20 行到 3 行

这是最让我震撼的部分。

曾经写一个「根据 ID 查询用户」：

**MyBatis 时代——**

```xml
<!-- UserMapper.xml -->
<mapper namespace="com.example.mapper.UserMapper">
    <select id="selectById" resultType="User">
        SELECT id, username, email, create_time 
        FROM sys_user 
        WHERE id = #{id}
    </select>
</mapper>
```

```java
// UserMapper.java
public interface UserMapper {
    User selectById(@Param("id") Long id);
}
```

```java
// UserService.java
public User getUserById(Long id) {
    return userMapper.selectById(id);
}
```

**MyBatis-Plus 时代——**

```java
// 继承 BaseMapper，自动获得所有 CRUD 方法
@Mapper
public interface UserMapper extends BaseMapper<User> {
}

// 调用？直接用
User user = userMapper.selectById(1L);
```

没有 XML，没有接口注解，没有任何额外代码。**一个继承 + 一行调用，质的飞跃。**

但如果遇到复杂查询怎么办？`BaseMapper` 也有天花板。比如多条件查询、模糊搜索、分页——这时候 `LambdaQueryWrapper` 就派上用场了：

```java
// 复杂查询示例：查询用户列表（年龄 > 18，姓名包含"张"，按创建时间倒序）
LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.gt(User::getAge, 18)
        .like(User::getUsername, "张")
        .orderByDesc(User::getCreateTime)
        .last("LIMIT 10");

List<User> users = userMapper.selectList(wrapper);
```

链式调用，语义化，**比写 XML 清晰多了**。当然，如果业务逻辑极其复杂（比如多表联查、动态 SQL 片段），`Mapper.xml` 依然有一战之力——但至少你不用再写那些千篇一律的基础 CRUD 了。

:::warning
`BaseMapper` + `LambdaQueryWrapper` 能覆盖日常 80% 的场景，但剩下的 20%（如联表查询、性能优化）仍需要根据实际情况选择方案。框架是工具，不是银弹。
:::

## 技术进化背后的思想

回过头来看这段经历，我最大的感悟不是「哪个框架更好」，而是：

> **技术进化的方向，始终是「让人更专注核心业务」。**

| 时代 | 核心理念 | 开发者精力消耗 |
|------|---------|--------------|
| SSM 时代 | XML 配置 + 手动管理 | 50% 配置 + 50% 业务 |
| Spring Boot 时代 | 自动配置 + starter | 20% 配置 + 80% 业务 |
| MyBatis-Plus 时代 | 语义化 API + 链式调用 | 10% 配置 + 90% 业务 |

那些消失的配置，并不是「被省略了」，而是**框架替你做了它能做的所有通用工作**。

这才是真正好的设计——**不是给开发者更多能力，而是帮开发者省下不必要的精力**。

## 小结

2024年1月19日这一天，我完成了从 SSM 到 Spring Boot + Maven + MyBatis-Plus 的跃迁。

黑马的教程依然是那个节奏——一步一步，稳扎稳打。但当我亲手敲出第一行 `@Mapper` 注解、第一次跑通 `selectList`、第一次发现配置文件少了一大半的时候——

那种感觉就像：

> 背了一路的包袱，终于放下了。

如果你也正在经历类似的「清朝老技术」阶段，别急。

某天你回头看自己当初写的第一个 SSM 项目，大概率会跟我一样——**连自己都看不懂当初的配置为什么要那么写**。这不丢人，说明你又进步了。

---

*更多踩坑实录和技术细节，可查看我的 GitHub 仓库。*
