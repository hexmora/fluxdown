# stative

可组合的响应式状态，独立于 UI 框架。

[文档](../../../website/docs/zh/stative/index.md) · [English](../README.md)

Stative 将不断变化的输入连接到可复用的计算。每个计算都提供当前结果，并在结果变化时通知订阅者。你可以将它们组合成更大的状态流，统一管理生命周期。

适用于表单派生值、编辑器内容分析和流式处理。Stative 为 [Fluxdown Core](../../core) 提供响应式基础，可在浏览器和 Node.js 中运行。

## 安装

```sh
pnpm add stative
```

## 创建状态流

```ts
import { MutableState, render, S } from "stative";

type TotalInputs = {
  price: number;
  quantity: number;
};

const Total = ({ price, quantity }: TotalInputs) => price * quantity;

const quantity = MutableState.of(2);
const total = render(S([Total, { price: 20, quantity }]));
const subscription = total.value.subscribe((amount) => console.log(amount));
// 立即输出 40。

quantity.next(3); // 输出 60。
console.log(total.value.value); // 60

// 不再需要这个状态流时，释放资源。
subscription.unsubscribe();
total.destroy();
quantity.destroy();
```

`MutableState` 保存输入。`S` 描述计算及其输入，`render` 创建运行计算并管理子计算的**状态闭包**。计算在首次访问输出时初始化。`total.value` 是可订阅的结果状态，`total.value.value` 是它的当前值。

无论输入来自常量还是变化的状态，`Total` 收到的都是普通数字。销毁闭包会释放它管理的子计算和内部订阅。`quantity` 在闭包外创建，需要单独清理。

## 组合更复杂的状态流

按计算的需要选择声明方式，三种方式都可以使用 `S` 和 `render`：

| 形式                  | 用途                                                     |
| --------------------- | -------------------------------------------------------- |
| 普通函数              | 根据输入的当前值计算结果。                               |
| `once`                | 连接子计算和资源，只构建一次，再由返回的状态流处理更新。 |
| `BaseStateClosure` 类 | 使用实例方法和局部状态组织状态流。                       |

也可以通过 Stative 自身的 JSX 运行时描述相同的组合，无需 React，也不生成 DOM。

## 文档

- [快速上手](../../../website/docs/zh/stative/getting-started.md) — 创建、更新和订阅状态。
- [状态与派生值](../../../website/docs/zh/stative/state-and-derived.md) — 组合输入、批量更新和缓存计算结果。
- [组合计算](../../../website/docs/zh/stative/composition.md) — 连接函数、`once` 闭包和类。
- [切换与列表](../../../website/docs/zh/stative/collections.md) — 跟随变化的数据源，管理列表项的生命周期。
- [生命周期](../../../website/docs/zh/stative/lifecycle.md) — 清理订阅、定时器和其他资源。
- [JSX](../../../website/docs/zh/stative/jsx.md) — 用可选的 JSX 语法声明状态流。

## 参与贡献与许可证

贡献指南见 [CONTRIBUTING.md](../../../CONTRIBUTING.md)。本项目采用 [MIT](../../../LICENSE) 许可证。
