# 认识 Stative

**管理状态流的模块化组织，正如 React 对 DOM 做的事。**

Stative 是一个框架无关的响应式状态库。你描述输入和计算之间的关系，输入变化时，结果随之更新。

它适合把相互依赖的数据处理拆成小块，再组合成完整流程：从表单中的价格计算，到编辑器的内容分析，再到流式文本处理。Fluxdown 的 Core 就构建在 Stative 之上。

## 把计算当作可组合的单元

在 Stative 中，一个**状态闭包（state closure）**包含一段计算、它依赖的输入，以及它创建的子计算。它既能提供当前结果，也能持续通知变化。

```ts
import { MutableState, render, S } from 'stative';

type DoubleInputs = {
  value: number;
};

const Double = ({ value }: DoubleInputs) => value * 2;

const count = MutableState.of(2);
const doubled = render(S([Double, { value: count }]));

console.log(doubled.value.value); // 4

count.next(3);
console.log(doubled.value.value); // 6

doubled.destroy();
count.destroy();
```

`Double` 只关心如何计算。`S` 把计算和输入连接起来，`render` 创建对应的状态闭包。这里的 `render` 不渲染界面，也不需要浏览器。

## 三个核心概念

| 概念     | 负责什么                                 | 常用入口       |
| -------- | ---------------------------------------- | -------------- |
| 状态     | 保存当前值，通知后续变化                 | `MutableState` |
| 计算描述 | 声明计算及其输入，可以继续嵌套组合       | `S` 或 JSX     |
| 状态闭包 | 执行计算，提供结果，管理子计算的生命周期 | `render`       |

简单计算可以直接写成函数。需要连接多个计算、管理局部资源时，用 `once` 构建状态流，也可以使用类。它们可以互相组合。

## 按需要逐步使用

- [快速上手](./getting-started)：创建、订阅和更新你的第一段状态流。
- [状态与派生](./state-and-derived)：组合输入、批量更新和避免重复计算。
- [组合计算](./composition)：把计算封装成可复用的状态闭包。
- [生命周期](./lifecycle)：让订阅、定时器和子计算随功能一起结束。

Stative 不依赖 UI 框架。它的 [JSX 写法](./jsx)使用独立运行时，也不依赖 React。如果你只是想在页面中展示流式 Markdown，可以直接从 [Fluxdown React](../guide/react/quick-start) 开始。
