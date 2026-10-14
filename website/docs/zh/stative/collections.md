# 切换与列表

有些依赖不是固定的：用户会切换正在查看的内容，列表会增加、删除或重新排序。Stative 可以随着这些变化调整子计算，并清理不再需要的部分。

## 跟随当前选中的状态

用 `useSwitchMap` 根据当前输入选择一段状态流。切换后，结果只跟随新的来源：

```ts
import type { IReadableClosure } from 'stative';

import { MutableState, once, render, S, useSwitchMap } from 'stative';

type Mode = 'brief' | 'full';

type DescriptionInputs = {
  mode: IReadableClosure<Mode>;
};

const brief = MutableState.of('简短说明');
const full = MutableState.of('完整说明');
const mode = MutableState.of<Mode>('brief');

const Description = once(({ mode }: DescriptionInputs) =>
  useSwitchMap(mode, (value) => (value === 'brief' ? brief : full)),
);

const description = render(S([Description, { mode }]));

console.log(description.value.value); // "简短说明"

mode.next('full');
full.next('更新后的完整说明');
console.log(description.value.value); // "更新后的完整说明"

description.destroy();
mode.destroy();
brief.destroy();
full.destroy();
```

回调也可以返回 `S(...)` 描述。Stative 会创建对应的子闭包，并在替换时释放旧的子闭包。像上例中预先创建的 `brief` 和 `full` 这样的外部状态，仍由调用方清理。

## 为列表项保留计算

用 `useMapKeyed` 为每个稳定的输入保留一个子计算。排序改变时，已有子计算会被复用：

```ts
import type { IReadableClosure } from 'stative';

import { MutableState, once, render, S, useMapKeyed } from 'stative';

type ItemInputs = {
  id: string;
};

type LabelsInputs = {
  ids: IReadableClosure<string[]>;
};

const ItemLabel = ({ id }: ItemInputs) => `文档 ${id.toUpperCase()}`;

const Labels = once(({ ids }: LabelsInputs) =>
  useMapKeyed(ids, (id) => S([ItemLabel, { id }])),
);

const ids = MutableState.of(['a', 'b']);
const labels = render(S([Labels, { ids }]));

console.log(labels.value.value); // ["文档 A", "文档 B"]

ids.next(['b', 'a', 'c']);
console.log(labels.value.value); // ["文档 B", "文档 A", "文档 C"]

labels.destroy();
ids.destroy();
```

这里的 key 就是输入项本身，采用 JavaScript `Map` 的相等规则。字符串 ID 很适合这种用法；如果输入项是对象，需要保持对象引用稳定。重复的输入项共享子计算，但仍会出现在结果的每个对应位置。

移除一项时，对应的子计算会被清理。销毁整个列表闭包，也会清理剩余的子计算。

## 按位置还是按身份

| 方式          | 适合的列表                                               |
| ------------- | -------------------------------------------------------- |
| `useMapEach`  | 位置本身有意义，希望每个位置的子计算接收该位置的最新输入 |
| `useMapKeyed` | 输入项有稳定身份，重新排序时希望保留对应的子计算         |

`useMapEach` 的回调接收可读的项闭包和位置：`(item, index) => S(...)`。`useMapKeyed` 的回调接收输入项本身：`(item) => S(...)`。

在类中使用对应的 `this.switchMap`、`this.mapEach` 和 `this.mapKeyed`，行为一致。
