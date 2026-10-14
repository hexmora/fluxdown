# 快速上手

用一个随数量变化的订单金额，了解 Stative 最常用的几个操作。

## 安装

```sh
pnpm add stative
```

Stative 自带 TypeScript 类型，可以在浏览器和 Node.js 中使用，不需要 UI 框架。

## 创建输入与计算

`MutableState` 保存可更新的输入。计算函数接收普通值，返回你需要的结果：

```ts
import { MutableState, render, S } from 'stative';

type TotalInputs = {
  price: number;
  quantity: number;
};

const Total = ({ price, quantity }: TotalInputs) => price * quantity;

const quantity = MutableState.of(2);
const total = render(S([Total, { price: 20, quantity }]));

console.log(total.value.value); // 40
```

`price` 是常量，`quantity` 是会变化的状态。传给 `Total` 时，它们都会被解析为当前值。

`S([Total, inputs])` 描述这段计算，`render` 根据描述创建闭包。计算在第一次访问输出时初始化。

## 订阅变化

接着上面的示例，订阅结果并更新数量：

```ts
const subscription = total.value.subscribe((amount) => {
  console.log(amount);
}); // 立即输出 40

quantity.next(3); // 输出 60
quantity.next(4); // 输出 80

console.log(total.value.value); // 80
```

正在运行的状态会在订阅时提供当前值，之后继续推送更新。不需要自己把变化从一个计算传递到另一个计算。

两个 `value` 分别表示不同层次：`total.value` 是可订阅的状态，`total.value.value` 是它此刻的值。

## 使用结束后清理

```ts
subscription.unsubscribe();
total.destroy();
quantity.destroy();
```

`unsubscribe()` 停止这次订阅。`total.destroy()` 释放闭包管理的子计算和内部订阅。外部创建的 `quantity` 仍由你管理，需要单独销毁。

在应用中，把这段清理放到页面离开、组件卸载或业务功能结束的位置。完整的资源管理方式见[生命周期](./lifecycle)。

## 下一步

阅读[状态与派生](./state-and-derived)，把多个输入组合起来；或阅读[组合计算](./composition)，把一段状态流封装成可复用的功能。
