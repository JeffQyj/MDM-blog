---
title: 生涯补全：C 语言的基础学习
published: 2022-10-28
description: 记录我系统学习 C 语言基础的那段日子，翁恺老师的课程让我真正入门，而指针的坑让我明白：编程没有捷径，只有踩过才能真正理解。
image: ''
tags: [C语言, 翁恺, 编程基础, 成长记录]
category: 成长碎记
draft: false
lang: zh_CN
---

:::tip
此刻是 2026 年，我坐在电脑前敲下这些文字。回想起 2022 年的那个秋天，那段在 Dev-C++ 和 VS Code 之间切换的日子，那是我的编程生涯的起点。
:::

## 起点：一切从 Hello World 开始

2022 年 9 月，我敲下了人生中第一行代码。

```c
#include <stdio.h>

int main() {
    printf("Hello World!");
    return 0;
}
```

那时候的我，天真地以为这就叫「会编程」——毕竟照着敲谁不会呢？

但很快，现实的巴掌就拍了过来，老师布置的作业越来越难，不再是照着抄就能完成的。我开始意识到：**会抄和会写，是两码事。**

## 翁恺老师：我的编程引路人

学校没有从头讲起的课程，老师直接甩给我们一个链接——中国大学慕课，浙江大学，翁恺老师的 C 语言课程。

说实话，一开始我并没有抱太大期望。但当我真的点进去听了第一节课，我就知道——**这次，不一样。**

翁恺老师的声音不疾不徐，每一个概念都从「为什么」讲起。他讲变量的时候，会问：「计算机为什么要给数据分类？」他讲循环的时候，会问：「如果让你做 100 遍同样的事，你会怎么做？」

每一次提问，都像是一把钥匙，轻轻一转，「咔哒」一声，某个知识点就在我脑子里对上了。

:::note
有时候我在想，如果当时没有遇到翁恺老师，我可能早就放弃编程了。他是我编程路上的引路人，是我第一次感受到「原来知识可以这样被传递」的人。
:::

我记得第一次听懂「递归」这个概念的时候，翁恺老师说：「递归就像照镜子，照镜子的人手里还拿着一面镜子。」就这么一句话，我好像突然就懂了。

**我永远感激翁恺老师。**

## 从零开始：C 语言学习之路

跟着翁恺老师的课程，我把 C 语言的基础知识从头梳理了一遍。这段学习历程，大致可以分为几个阶段。

### 第一步：变量和数据类型

最开始接触的是变量。变量就像一个盒子，盒子有个名字，里面可以装东西。

```c
int age = 18;           // 整数
float score = 95.5f;   // 单精度浮点数
double pi = 3.14159;   // 双精度浮点数
char grade = 'A';       // 字符
```

为什么要分类？因为不同的「盒子」大小不一样，能装的东西也不一样。`int` 占 4 个字节，`char` 只占 1 个字节。计算机的内存是有限的，所以要用合适的「盒子」装合适的东西。

### 第二步：运算符和表达式

光有变量还不够，还得会运算。

```c
int a = 10;
int b = 3;

printf("%d\n", a + b);   // 加法：13
printf("%d\n", a - b);   // 减法：7
printf("%d\n", a * b);   // 乘法：30
printf("%d\n", a / b);   // 整数除法：3
printf("%d\n", a % b);   // 取余：1
```

这里有个坑我踩过：整数除法 `a / b` 的结果还是整数，会截断小数部分。`10 / 3 = 3`，而不是 `3.333...`。

### 第三步：控制语句——让程序做选择

有了变量和运算，程序就能做判断了。

```c
if (score >= 60) {
    printf("及格\n");
} else {
    printf("不及格\n");
}
```

但 `if` 只能做一次判断。如果要让程序做重复的事情，就需要循环。

### 第四步：循环——重复的艺术

```c
// 计算 1+2+3+...+100
int sum = 0;
for (int i = 1; i <= 100; i++) {
    sum += i;
}
printf("%d\n", sum);
```

`for` 循环有三个部分：初始化 `int i = 1`、条件判断 `i <= 100`、更新 `i++`。

一开始我总是搞混这三个部分的顺序，后来记住了：**先初始化，再判断，符合条件就执行，然后更新，再判断**。

### 第五步：函数——代码的复用

学到函数的时候，我突然觉得编程变得优雅起来了。

```c
// 定义一个函数
int max(int a, int b) {
    if (a > b) {
        return a;
    } else {
        return b;
    }
}

// 调用函数
int result = max(10, 20);
printf("%d\n", result);  // 输出：20
```

函数的好处是：写一次，可以调用无数次。如果不用函数，同样的代码要写好多遍，烦死了。

### 第六步：数组——批量数据的好帮手

如果我要存 100 个学生的成绩怎么办？总不能写 100 个变量吧？

数组就是来解决这个问题的。

```c
int scores[5] = {90, 85, 78, 92, 88};

// 遍历数组
for (int i = 0; i < 5; i++) {
    printf("第%d个学生的成绩是：%d\n", i+1, scores[i]);
}
```

`scores[0]` 是第一个元素，`scores[4]` 是最后一个。注意索引是从 0 开始的，不是从 1 开始——这个坑我也踩过。

### 第七步：指针——C 语言的灵魂

学到指针的时候，我的表情是这样的：`(○｀ 3′○)`

指针是什么？先说说「地址」的概念。

```c
int a = 10;
printf("a的值是：%d\n", a);      // 输出：10
printf("a的地址是：%p\n", &a);   // 输出：0x...（一个十六进制地址）
```

`&a` 就是变量 `a` 在内存中的地址。

而指针，就是用来存放地址的变量。

```c
int a = 10;
int *p = &a;  // p 是一个指针，指向 a

printf("%d\n", *p);   // 通过指针获取值：10
```

`p` 里面存的是 `a` 的地址，`*p` 就是「顺着地址找到对应的值」。

### 第八步：结构体——自定义数据类型

学到结构体的时候，我第一次感受到 C 语言的「封装」能力。

如果我要描述一个学生，有姓名、学号、成绩……这些数据放在一起会比较方便管理。结构体就是用来做这件事的。

```c
// 定义一个学生结构体
struct Student {
    char name[20];   // 姓名
    int id;          // 学号
    float score;     // 成绩
};

// 创建结构体变量
struct Student stu1;
strcpy(stu1.name, "张三");
stu1.id = 2022001;
stu1.score = 95.5f;

// 或者直接初始化
struct Student stu2 = {"李四", 2022002, 88.0f};

printf("学生姓名：%s\n", stu1.name);
printf("学生成绩：%.1f\n", stu1.score);
```

:::note
结构体就像是把多个「盒子」打包成一个「礼盒」。虽然里面还是那些变量，但现在它们是一个整体了。
:::

### 第九步：文件操作——让数据持久化

学到文件操作的时候，我激动坏了。

之前写的程序，数据都是「用完就丢」——程序结束，数据就没了。但如果能把数据存到文件里，下次打开程序还在，那该多好啊！

文件操作就是干这个的。

```c
#include <stdlib.h>

// 写入文件
FILE *fp = fopen("student.txt", "w");  // "w" 是写入模式
if (fp == NULL) {
    printf("文件打开失败！\n");
    exit(1);
}

fprintf(fp, "张三 2022001 95.5\n");
fprintf(fp, "李四 2022002 88.0\n");

fclose(fp);  // 关闭文件

// 读取文件
FILE *fp2 = fopen("student.txt", "r");  // "r" 是读取模式
if (fp2 == NULL) {
    printf("文件打开失败！\n");
    exit(1);
}

char name[20];
int id;
float score;

while (fscanf(fp2, "%s %d %f", name, &id, &score) != EOF) {
    printf("姓名：%s, 学号：%d, 成绩：%.1f\n", name, id, score);
}

fclose(fp2);
```

`fopen`、`fprintf`、`fscanf`、`fclose`——这几个函数让我第一次体验到什么叫「数据持久化」。

:::note
文件操作的三步曲：**打开文件** → **读写文件** → **关闭文件**。就像开门 → 拿东西 → 关门一样。
:::

## 两道让我记忆至今的题

学习过程中，有两道题让我对知识点有了真正的理解。

### 九九乘法表

这是每个初学者都会遇到的经典题目，也是我独立完成的第一个「作品」。

两层嵌套 for 循环，外层控制行，内层控制列。说起来简单，但第一次做的时候，我对着屏幕坐了整整一个小时。

一开始，我连外层循环和内层循环的关系都没想清楚。输出的格式也是乱七八糟的，对不齐，有些行还挤在了一起。

```c
#include <stdio.h>

int main() {
    for (int i = 1; i <= 9; i++) {
        for (int j = 1; j <= i; j++) {
            printf("%d*%d=%2d\t", j, i, i*j);
        }
        printf("\n");
    }
    return 0;
}
```

输出：

```
1*1= 1
1*2= 2	2*2= 4
1*3= 3	2*3= 6	3*3= 9
1*4= 4	2*4= 8	3*4=12	4*4=16
...
```

`%2d` 是为了对齐——如果乘积是 1 位数，就前面补一个空格；如果是 2 位数，就正常显示。这样列就能对齐了。`\t` 是制表符，用来分隔每一列。

当我终于调出正确的输出时，我盯着屏幕看了好久。

**这是我写的。是我自己想出来的逻辑，是我自己敲出来的代码。**

那种感觉，比考试考 100 分还要爽。因为那是我自己动脑筋解决的问题，不是背出来的答案。

### 杨辉三角

比九九乘法表复杂一些，需要用到二维数组。

这道题花了我两天时间。不是因为它有多难，而是我一开始根本没思路。

后来看了别人的解法，又自己琢磨了好久，终于才把逻辑理清楚：

- 第一列和对角线上的元素都是 1
- 其他位置的元素，是它「肩上」两个元素的和

```c
#include <stdio.h>

int main() {
    int n = 10;
    int a[10][10] = {0};

    for (int i = 0; i < n; i++) {
        for (int j = 0; j <= i; j++) {
            if (j == 0 || j == i) {
                a[i][j] = 1;
            } else {
                a[i][j] = a[i-1][j-1] + a[i-1][j];
            }
            printf("%d\t", a[i][j]);
        }
        printf("\n");
    }
    return 0;
}
```

输出：

```
1
1	1
1	2	1
1	3	3	1
1	4	6	4	1
1	5	10	10	5	1
...
```

完成这道题的那一刻，我记得很清楚——是晚上十点多，室友都已经躺床上了。我坐在下面，对着那个黑窗口，看着上面一个个数字，突然就笑了出来。

**二维数组，原来就是这么用的啊。**

「数组的数组」，每一行也是一个数组。第一行的数组有 1 个元素，第二行有 2 个元素……这不就是杨辉三角的形状吗？

那种「终于想通了」的感觉，现在想起来都觉得痛快。

## 指针的坑：我踩过的那些雷

指针是 C 语言最难的部分，也是它最有魅力的部分。而我，踩过不少坑。

### 坑一：数组名和指针

```c
int arr[5] = {1, 2, 3, 4, 5};
int *p = arr;

printf("%d\n", arr[0]);   // 1
printf("%d\n", p[0]);     // 1
printf("%d\n", *arr);      // 1
```

一开始我以为数组名就是指针，它们确实很像。但后来才知道：`arr` 是数组名，地址是固定的；`p` 是指针变量，可以指向任何地方。

### 坑二：指针越界

```c
int arr[3] = {1, 2, 3};
int *p = arr;

for (int i = 0; i <= 3; i++) {
    printf("%d\n", *(p + i));  // i=3 越界了！
}
```

这个坑让我的程序崩溃了好几次。`i=3` 时，访问的是数组以外的内存，后果难料。

### 坑三：野指针

```c
int *p;
*p = 10;  // 危险！p 没有初始化
```

未初始化的指针叫「野指针」，就像一颗雷，随时可能爆炸。

:::warning
指针的坑告诉我：C 语言给程序员的自由，是要用责任来换的。
:::

## 综合实践：学生管理系统

学完结构体和文件操作之后，老师布置了一个大作业——**学生管理系统**。

这是第一次让我感受到「写一个真正的程序」是什么体验。

这个系统需要实现以下功能：

1. 添加学生信息
2. 显示所有学生
3. 按学号查找学生
4. 删除学生
5. 按成绩排序
6. 保存数据到文件
7. 从文件读取数据

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX 100

// 学生结构体
struct Student {
    char name[20];
    int id;
    float score;
};

// 全局变量
struct Student students[MAX];
int count = 0;  // 当前学生数量

// 函数声明
void menu();
void addStudent();
void showAll();
void searchById();
void deleteStudent();
void sortByScore();
void saveToFile();
void loadFromFile();

// 主函数
int main() {
    loadFromFile();  // 程序启动时加载数据
    int choice;

    while (1) {
        menu();
        printf("请选择：");
        scanf("%d", &choice);

        switch (choice) {
            case 1: addStudent(); break;
            case 2: showAll(); break;
            case 3: searchById(); break;
            case 4: deleteStudent(); break;
            case 5: sortByScore(); break;
            case 6: saveToFile(); break;
            case 0: printf("再见！\n"); saveToFile(); return 0;
            default: printf("无效选择！\n");
        }
    }
    return 0;
}

void menu() {
    printf("\n===== 学生管理系统 =====\n");
    printf("1. 添加学生\n");
    printf("2. 显示所有学生\n");
    printf("3. 按学号查找\n");
    printf("4. 删除学生\n");
    printf("5. 按成绩排序\n");
    printf("6. 保存数据\n");
    printf("0. 退出\n");
    printf("========================\n");
}

void addStudent() {
    if (count >= MAX) {
        printf("学生已满！\n");
        return;
    }

    printf("请输入姓名：");
    scanf("%s", students[count].name);
    printf("请输入学号：");
    scanf("%d", &students[count].id);
    printf("请输入成绩：");
    scanf("%f", &students[count].score);

    count++;
    printf("添加成功！\n");
}

void showAll() {
    if (count == 0) {
        printf("暂无学生信息！\n");
        return;
    }

    printf("\n%-10s %-10s %-10s\n", "姓名", "学号", "成绩");
    printf("----------------------------------------\n");
    for (int i = 0; i < count; i++) {
        printf("%-10s %-10d %-10.1f\n",
            students[i].name,
            students[i].id,
            students[i].score);
    }
}

void searchById() {
    int id;
    printf("请输入要查找的学号：");
    scanf("%d", &id);

    for (int i = 0; i < count; i++) {
        if (students[i].id == id) {
            printf("姓名：%s, 学号：%d, 成绩：%.1f\n",
                students[i].name,
                students[i].id,
                students[i].score);
            return;
        }
    }
    printf("未找到该学生！\n");
}

void deleteStudent() {
    int id;
    printf("请输入要删除的学号：");
    scanf("%d", &id);

    for (int i = 0; i < count; i++) {
        if (students[i].id == id) {
            for (int j = i; j < count - 1; j++) {
                students[j] = students[j + 1];
            }
            count--;
            printf("删除成功！\n");
            return;
        }
    }
    printf("未找到该学生！\n");
}

void sortByScore() {
    for (int i = 0; i < count - 1; i++) {
        for (int j = 0; j < count - 1 - i; j++) {
            if (students[j].score < students[j + 1].score) {
                struct Student temp = students[j];
                students[j] = students[j + 1];
                students[j + 1] = temp;
            }
        }
    }
    printf("排序完成！\n");
    showAll();
}

void saveToFile() {
    FILE *fp = fopen("students.dat", "wb");
    if (fp == NULL) {
        printf("文件保存失败！\n");
        return;
    }

    fwrite(&count, sizeof(int), 1, fp);
    fwrite(students, sizeof(struct Student), count, fp);
    fclose(fp);

    printf("数据已保存！\n");
}

void loadFromFile() {
    FILE *fp = fopen("students.dat", "rb");
    if (fp == NULL) {
        return;  // 文件不存在，直接返回
    }

    fread(&count, sizeof(int), 1, fp);
    fread(students, sizeof(struct Student), count, fp);
    fclose(fp);
}
```

写完这个程序的那一刻，我记得我对着屏幕发了很久的呆。

**我居然写了一个能跑的管理系统。**

虽然界面很丑，虽然功能很简单，虽然代码写得乱七八糟——但它能跑。它有菜单，能添加，能删除，能查找，能排序，能保存，能读取。

这就是我第一次体验什么叫「自己的程序」。

:::note
那个学生管理系统，是我 C 语言学习的集大成者。变量、数组、函数、结构体、指针、文件操作——所有的知识点都用上了。
:::

## C 语言和 JavaScript：对照学习

学 C 语言的同时，我还在学前端，用的是 VS Code 写 JavaScript。

有时候写完一段 C 代码，我会忍不住打开 VS Code，看看 JavaScript 是怎么实现同样功能的。

| C 语言                      | JavaScript                | 我的感受              |
| ------------------------- | ------------------------- | ----------------- |
| `int a = 10;`             | `let a = 10;`             | JS 不用写类型          |
| `for (int i=0; i<5; i++)` | `for (let i=0; i<5; i++)` | 几乎一样              |
| `printf("%d", a);`        | `console.log(a);`         | 输出语句不同            |
| `int arr[5];`             | `let arr = [];`           | JS 数组不用定义长度       |
| `int* p = &a;`            | 没有直接对应的                   | 指针是 C 独有的         |
| `struct Student`          | `class Student` 或对象字面量    | C 需要先定义结构体，JS 直接写 |

这种对照让我产生了一个强烈的感受：**编程语言的核心是相通的，差的只是语法。**

C 语言像是一个严肃的老教授，说话一板一眼。JavaScript 像是一个随性的年轻人，说话随意但意思你能懂。TypeScript 则像是给那个年轻人戴上了一副眼镜。

## 站在今天，回望那段时光

2022 年的那段日子，回头看看，其实挺普通的。

没有悬梁刺股的刻苦，也没有破釜沉舟的决心。就是每天上课、写作业、敲代码。

困了就趴桌上睡一会儿，醒了继续敲。

那是一种很正常的学习状态。不算努力，但也没完全摆烂。

**回头看的时候，倒是挺怀念的。**

怀念那种「今天又搞懂了一个知识点」的简单满足感。怀念和 JavaScript 对照时的恍然大悟。怀念指针越界时的崩溃，以及终于调通时的释然。

怀念第一次写出九九乘法表时的兴奋。怀念终于理解杨辉三角时的痛快。怀念写出那个丑丑的学生管理系统时的成就感。

可能这就是成长吧——当时不觉得怎么样，过几年回头看，才发现那是一段挺珍贵的时光。

## 写在最后

2022 年 10 月 28 日，我完成了 C 语言基础课程的最后一道题。

那天晚上，我对着 Dev-C++ 的界面发了一会儿呆。

想起 9 月 19 日第一次敲下 Hello World，想起翁恺老师的「递归就像照镜子」，想起九九乘法表跑通时的兴奋，想起指针越界时的崩溃，想起那个丑丑的学生管理系统。

**那是一段很长的路，但每一步都算数。**

如果有人问我，C 语言难吗？我会说：难。但正因为难，所以每一个知识点都刻骨铭心。

如果有人问我，翁恺老师的课怎么样？我会说：他是我编程路上的引路人。

**如果有人问我，那段日子值得吗？我会说：值得。**

***

*更多内容可查看博客归档。*
