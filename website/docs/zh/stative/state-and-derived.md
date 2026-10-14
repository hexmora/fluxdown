# 状态与派生

把需要主动修改的数据放进状态，把可以算出来的数据留给派生计算。这样每个值都有清晰的来源。

## 更新状态

用 `MutableState.of()` 设置初始值，用 `next()` 写入新值，用 `value` 读取当前值：

```ts
import { MutableState } from 'stative';

const profile = MutableState.of({ name: 'Lin', online: false });

profile.next({ ...profile.value, online: true });
console.log(profile.value.online); // true

profile.destroy();
```

默认使用 `Object.is` 判断新旧值是否相同。更新对象或数组时，创建新值，再交给 `next()`；直接修改原对象不会产生更新通知。

## 从多个输入派生结果

一个计算可以依赖多个状态。任意输入变化，结果都会跟着更新：

```ts
import { MutableState, render, S } from 'stative';

type NameInputs = {
  first: string;
  last: string;
};

const FullName = ({ first, last }: NameInputs) => `${first} ${last}`;

const first = MutableState.of('Ada');
const last = MutableState.of('Lovelace');
const name = render(S([FullName, { first, last }]));

console.log(name.value.value); // "Ada Lovelace"

first.next('Augusta Ada');
console.log(name.value.value); // "Augusta Ada Lovelace"

name.destroy();
first.destroy();
last.destroy();
```

保持这类函数纯粹：根据输入计算并返回结果。定时器、事件监听等需要清理的资源，放到[状态闭包的生命周期](./lifecycle)中管理。

## 一次发布多个更新

当几个变化属于同一个操作，用 `batch` 把它们合在一起：

```ts
import { batch, MutableState, render, S } from 'stative';

type NameInputs = {
  first: string;
  last: string;
};

const FullName = ({ first, last }: NameInputs) => `${first} ${last}`;

const first = MutableState.of('Ada');
const last = MutableState.of('Lovelace');
const name = render(S([FullName, { first, last }]));
const subscription = name.value.subscribe((value) => console.log(value));

batch(() => {
  first.next('Grace');
  last.next('Hopper');
}); // 这次操作只发布 "Grace Hopper"

subscription.unsubscribe();
name.destroy();
first.destroy();
last.destroy();
```

订阅者不会收到名字改到一半的中间结果。`batch` 只覆盖同步执行的更新；异步操作完成后，可以再用一次 `batch` 提交它的结果。

## 避免重复计算

当计算成本较高，或者同样的输入会重复到达时，可以用 `memo` 包装计算函数：

```ts
import { memo } from 'stative';

type TextInputs = {
  text: string;
};

const WordCount = memo(({ text }: TextInputs) => {
  const trimmed = text.trim();

  return trimmed ? trimmed.split(/\s+/).length : 0;
});
```

`memo` 默认浅比较输入，等价时跳过计算；它还会用 `Object.is` 比较结果，避免重复发布相同结果。缓存属于每个创建出来的闭包，不同实例之间互不影响。

如果返回对象，可以通过第三个参数定义结果比较方式：

```ts
const TextSummary = memo(
  ({ text }: TextInputs) => ({ length: text.length }),
  undefined,
  (previous, next) => previous.length === next.length,
);
```

比较函数返回 `true` 表示相同。只在确实需要时加入自定义比较；多数简单计算直接使用普通函数就够了。
