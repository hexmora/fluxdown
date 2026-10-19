# 组合计算

状态闭包（state closure）把输入、计算和子计算的生命周期放在一起。Stative 提供三种声明方式；它们都通过 `render(S([Declaration, inputs]))` 创建，也都能使用 JSX。

## 选择声明方式

| 方式          | 收到的输入                                  | 如何更新                              | 适合的场景                   |
| ------------- | ------------------------------------------- | ------------------------------------- | ---------------------------- |
| 纯函数式      | 输入的当前值                                | 输入变化时重新执行函数                | 格式化、过滤、数值计算       |
| `once` 函数式 | 可读闭包与静态配置                          | 构建一次，之后由连接好的状态流更新    | 组合子计算、管理局部资源     |
| class 式      | 可读闭包与静态配置，通过 `this.inputs` 访问 | `render()` 构建一次，之后由状态流更新 | 需要实例方法或局部状态的功能 |

从最简单的纯函数开始。需要组织一段状态流时选择 `once`，需要实例方法时选择 class。三种形式可以互相嵌套，不需要为整个项目只选一种。

## 纯函数式：计算当前结果

普通函数接收已经解析好的值。下面根据数量和单价计算价格标签：

```ts
type PriceInputs = {
  quantity: number;
  price: number;
};

const PriceLabel = ({ quantity, price }: PriceInputs) =>
  `¥${(quantity * price).toFixed(2)}`;
```

函数在第一次访问输出时运行，之后在依赖变化时重新运行。保持这类函数纯粹：根据输入返回结果，不在计算过程中启动定时器或建立外部连接。

## `once` 函数式：连接状态流

用 `once` 包装的函数在第一次访问输出时构建状态流。会变化的输入使用 `IReadableClosure<T>`，静态单价仍然是普通数字：

```ts
import type { IReadableClosure } from 'stative';

import { once, useMap, useSelect } from 'stative';

type PriceInputs = {
  quantity: IReadableClosure<number>;
  price: number;
};

const PriceLabel = once(({ quantity, price }: PriceInputs) => {
  const amount = useSelect(quantity, (value) => value * price);

  return useMap(amount, (value) => `¥${value.toFixed(2)}`);
});
```

数量变化时，`once` 的函数体不会重跑；`useSelect` 和 `useMap` 连接的计算会更新结果。

| 辅助函数                     | 适合做什么                                             |
| ---------------------------- | ------------------------------------------------------ |
| `useSelect(source, project)` | 选择字段或做纯计算；首次被观察前不订阅输入             |
| `useMap(source, map)`        | 连接派生计算；回调的第二个参数还可读取上次的输入与结果 |
| `useCreate(description)`     | 创建并管理一个可复用的子闭包                           |

`useMap` 和 `useSelect` 也支持来源数组，例如 `useMap([left, right], ([a, b]) => a + b)`。

这些辅助函数在 `once` 函数体内同步调用，属于 Stative 的运行环境，不是 React Hooks。

## 直接组合 hooks

使用 `renderHooks` 可以直接组合 hooks，无需声明可复用的状态组件：

```ts
import { MutableState, renderHooks, useFlatten } from 'stative';

const config = MutableState.of({ count: 1 });

const scope = renderHooks(() => useFlatten(config));

const fields = scope.value.value;

config.next({ count: 2 });

console.log(fields.count.value.value); // 2

scope.destroy();

config.destroy();
```

回调在首次访问结果时执行一次，支持与 `once` 相同的 hooks。返回值原样保留，包括其中的闭包和 descriptor。`scope.destroy()` 释放作用域管理的资源；`config` 等借用的数据源仍保留自己的生命周期。

## class 式：通过实例组织计算

继承 `BaseStateClosure`，在 `render()` 中连接输入与输出：

```ts
import type { IReadableClosure } from 'stative';

import { BaseStateClosure } from 'stative';

type PriceInputs = {
  quantity: IReadableClosure<number>;
  price: number;
};

class PriceLabel extends BaseStateClosure<string, PriceInputs> {
  protected render() {
    const { quantity, price } = this.inputs;
    const amount = this.select(quantity, (value) => value * price);

    return this.map(amount, (value) => `¥${value.toFixed(2)}`);
  }
}
```

`this.map`、`this.select` 和 `this.create` 对应 `once` 中的辅助函数。类可以再提供自己的实例方法；使用 `render(S([YourClass, inputs]))` 创建时，会保留具体的实例类型。

## 用同一种方式创建

选用上面任意一个 `PriceLabel` 声明，调用方式都一样：

```ts
import { MutableState, render, S } from 'stative';

const quantity = MutableState.of(2);
const label = render(S([PriceLabel, { quantity, price: 20 }]));

console.log(label.value.value); // "¥40.00"

quantity.next(3);
console.log(label.value.value); // "¥60.00"

label.destroy();
quantity.destroy();
```

纯函数式声明中的 `quantity` 是当前数值；`once` 和 class 中的 `quantity` 是可读闭包。这是三种方式最需要区分的地方。

## 嵌套计算

一个计算的输出可以作为另一个计算的输入。在输入中放入另一段 `S` 描述即可：

```ts
import { MutableState, render, S } from 'stative';

type SubtotalInputs = {
  price: number;
  quantity: number;
};

type FormatInputs = {
  amount: number;
};

const Subtotal = ({ price, quantity }: SubtotalInputs) => price * quantity;
const FormatPrice = ({ amount }: FormatInputs) => `¥${amount.toFixed(2)}`;

const quantity = MutableState.of(2);
const amount = S([Subtotal, { price: 20, quantity }]);
const label = render(S([FormatPrice, { amount }]));

console.log(label.value.value); // "¥40.00"

quantity.next(3);
console.log(label.value.value); // "¥60.00"

label.destroy();
quantity.destroy();
```

`label` 管理嵌套创建的子计算。销毁它时，这些子计算会一起清理。

## 传入普通配置

在 `once` 和 class 中，数字、字符串等常量保持原样。静态对象、数组和普通回调函数用 `D()` 包装，表示直接使用这个值：

```ts
import type { IReadableClosure } from 'stative';

import { D, MutableState, once, render, S, useMap } from 'stative';

type FormatOptions = {
  currency: string;
};

type FormatInputs = {
  amount: IReadableClosure<number>;
  options: FormatOptions;
};

const Format = once(({ amount, options }: FormatInputs) =>
  useMap(amount, (value) => `${options.currency}${value.toFixed(2)}`),
);

const amount = MutableState.of(42);
const options = D({ currency: '¥' });
const label = render(S([Format, { amount, options }]));

console.log(label.value.value); // "¥42.00"

label.destroy();
amount.destroy();
```

如果固定值也需要按响应式输入使用，可以用 `ReactiveState.of(value)` 包装。`D()` 保留原值，不会把对象变成响应式状态。创建子闭包的函数回调有专门的组合方式，见 [JSX 中的渲染回调](./jsx#传入渲染回调)。
