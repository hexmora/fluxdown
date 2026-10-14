# 使用 JSX

JSX 和 `S` 描述的是同一件事：把已有闭包接起来，组成一个新的状态流。它适合把组合关系写得像一棵树，尤其是输入里还包含计算或回调时。

下面从一个草稿预览开始，逐步加入内容处理、自定义渲染和列表。

> Stative 使用自己的 JSX 运行时，不依赖 React，也不生成 DOM。示例使用 `.tsx` 文件；配置见[本页末尾](#配置-typescript)。

## 从已有闭包开始

假设项目已有两个基础闭包：`Clean` 去掉文本两端的空白，`Label` 为文本加上前缀。把它们放在 `base.tsx` 中，后面的例子会一直复用。

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMap } from 'stative';

type CleanInputs = {
  text: string;
};

type LabelOptions = {
  prefix: string;
};

type LabelInputs = {
  text: IReadableClosure<string>;
  options: LabelOptions;
};

export const Clean = ({ text }: CleanInputs) => text.trim();

export const Label = once(({ text, options }: LabelInputs) =>
  useMap(text, (value) => `${options.prefix}${value}`),
);
```

先把草稿状态直接接到 `Label`。`text` 是响应式输入，`options` 是固定配置，用 `D()` 原样传入：

```tsx
import { D, MutableState, render } from 'stative';

import { Label } from './base';

const draft = MutableState.of('初稿');
const options = { prefix: '标题：' };
const preview = render(
  <Label
    text={draft}
    options={D(options)}
  />,
);

console.log(preview.value.value); // "标题：初稿"

draft.next('定稿');
console.log(preview.value.value); // "标题：定稿"

preview.destroy();
draft.destroy();
```

这里的 JSX 等价于 `S([Label, { text: draft, options: D(options) }])`。JSX 只创建描述，`render` 才创建可以读取、订阅和清理的闭包。

## 把一段组合变成新闭包

现在希望先清理空白，再显示前缀。把 `text={draft}` 换成 `text={<Clean text={draft} />}`，两个计算就连接起来了。

如果其他地方也需要相同处理，可以用 `once` 把这段组合命名为 `Preview`，保存为 `preview.tsx`：

```tsx
import type { IReadableClosure } from 'stative';

import { D, once } from 'stative';

import { Clean, Label } from './base';

type PreviewInputs = {
  text: IReadableClosure<string>;
  prefix: string;
};

export const Preview = once(({ text, prefix }: PreviewInputs) => (
  <Label
    text={<Clean text={text} />}
    options={D({ prefix })}
  />
));
```

调用方只需要知道 `Preview` 接收什么，不必关心内部有几个闭包：

```tsx
import { MutableState, render } from 'stative';

import { Preview } from './preview';

const draft = MutableState.of('  初稿  ');
const preview = render(
  <Preview
    text={draft}
    prefix="标题："
  />,
);

console.log(preview.value.value); // "标题：初稿"

draft.next('  定稿  ');
console.log(preview.value.value); // "标题：定稿"

preview.destroy();
draft.destroy();
```

`Preview` 管理它创建的 `Clean` 和 `Label`。销毁它会一起清理这些子闭包；外部传入的 `draft` 仍由调用方管理。

> 返回 JSX 来组合子闭包时，使用 `once` 或 class 的 `render()`。普通映射函数的返回值就是计算结果，不会再次解析其中的 JSX。

## 传入渲染回调

下一步，让预览容器决定如何展示结果，把“内容如何生成”留给调用方。声明一个返回 `IReadableClosure<string>` 的回调即可。这里用 `children` 作为输入名，保存为 `panel.tsx`：

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMap } from 'stative';

type PanelInputs = {
  title: string;
  children: () => IReadableClosure<string>;
};

export const Panel = once(({ title, children }: PanelInputs) => {
  const content = children();

  return useMap(content, (text) => `${title}\n${text}`);
});
```

在 `Panel` 内，`children()` 的结果始终是可读闭包。在调用方，回调可以直接返回 JSX，Stative 会负责把它变成子闭包：

```tsx
import { MutableState, render } from 'stative';

import { Panel } from './panel';
import { Preview } from './preview';

const draft = MutableState.of('  初稿  ');
const panel = render(
  <Panel title="发布预览">
    {() => (
      <Preview
        text={draft}
        prefix="标题："
      />
    )}
  </Panel>,
);

console.log(panel.value.value); // "发布预览\n标题：初稿"

draft.next('  定稿  ');
console.log(panel.value.value); // "发布预览\n标题：定稿"

panel.destroy();
draft.destroy();
```

不需要额外计算时，同一个回调也能返回现有状态，或直接返回一个固定值：

```tsx
import { MutableState, render } from 'stative';

import { Panel } from './panel';

const draft = MutableState.of('初稿');
const panels = render([
  <Panel
    title="原文"
    children={() => draft}
  />,
  <Panel
    title="说明"
    children={() => '内容会随草稿更新'}
  />,
]);

console.log(panels.value.value);
// ["原文\n初稿", "说明\n内容会随草稿更新"]

panels.destroy();
draft.destroy();
```

`children`、`renderItem`、`create` 都可以是你自己定义的输入名。回调由接收它的闭包调用；仅仅写下 JSX 并不会调用它。声明时使用 `() => IReadableClosure<T>`，或接收一个对象参数、返回 `IReadableClosure<T>` 的函数；这个对象参数也可以是可选的。生成的子闭包由接收回调的闭包管理，随它一起清理。

> 创建子闭包的回调直接传入；普通格式化或事件回调用 `D(callback)` 保留原函数。需要 hooks 时，把它们写在回调返回的 `once` 闭包里。

## 让列表决定何时创建，调用方决定如何展示

如果预览变成多段草稿，可以让 `DraftList` 管理列表，把每一项的计算交给 `renderItem`。保存为 `draft-list.tsx`：

```tsx
import type { IReadableClosure } from 'stative';

import { once, useMapEach } from 'stative';

type RenderItemInputs = {
  item: IReadableClosure<string>;
  index: number;
};

type DraftListInputs = {
  items: IReadableClosure<string[]>;
  renderItem: (inputs: RenderItemInputs) => IReadableClosure<string>;
};

export const DraftList = once(({ items, renderItem }: DraftListInputs) =>
  useMapEach(items, (item, index) => renderItem({ item, index })),
);
```

继续复用刚才的 `Preview`：

```tsx
import { MutableState, render } from 'stative';

import { DraftList } from './draft-list';
import { Preview } from './preview';

const drafts = MutableState.of(['  开场  ', '  结尾  ']);
const list = render(
  <DraftList
    items={drafts}
    renderItem={({ item, index }) => (
      <Preview
        text={item}
        prefix={`${index + 1}. `}
      />
    )}
  />,
);

console.log(list.value.value); // ["1. 开场", "2. 结尾"]

drafts.next(['  开场  ', '  正文  ', '  结尾  ']);
console.log(list.value.value); // ["1. 开场", "2. 正文", "3. 结尾"]

list.destroy();
drafts.destroy();
```

`useMapEach` 管理按位置对应的子计算，输入变化时，各项的状态随之更新。需要按业务 ID 保留条目时，使用 [useMapKeyed](./collections#按位置还是按身份)。

如果列表固定，只需要普通数组 `.map()`，把描述数组交给 `render` 即可：

```tsx
import { render } from 'stative';

import { Clean } from './base';

const sections = ['  开场  ', '  结尾  '];
const list = render(sections.map((text) => <Clean text={text} />));

console.log(list.value.value); // ["开场", "结尾"]

list.destroy();
```

## 输入可以有哪些形式

对于 `once` 或 class，**输入的声明决定它在闭包里是什么**。下面是上面这些写法的完整对应关系：

| 输入声明                                  | 调用方可传入                                            | 闭包里拿到什么                     |
| ----------------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| `IReadableClosure<T>`                     | `MutableState`、`ReactiveState`、RxJS `BehaviorSubject` | 跟随源更新的可读闭包               |
| `IReadableClosure<T>`                     | 已有可读闭包、JSX、`S(...)`、无参闭包类                 | 对应的可读闭包                     |
| `IReadableClosure<T>`                     | 与 `T` 对应的普通对象或数组                             | 固定输出的可读闭包，不解析内部内容 |
| `() => IReadableClosure<T>`               | 返回上述任一来源的函数，也可返回普通固定值              | 创建可读子闭包的函数               |
| `(inputs: Inputs) => IReadableClosure<T>` | 同上，`Inputs` 是单个对象参数的命名类型                 | 接收同一参数对象的子闭包工厂       |
| `string`、`number` 等基础值类型           | 原值或 `D(value)`                                       | 固定值                             |
| 对象、数组、普通函数等静态配置            | `D(value)`                                              | 原始对象、数组或函数               |

例如，`children={() => <Preview ... />}`、`children={() => state}` 和 `children={() => S(...)}` 都属于工厂回调；`children={() => '固定内容'}` 也成立。固定的字符串、数字等要作为直接的可读输入时，用 `ReactiveState.of(value)` 包装。

对于**普通映射函数**，输入会先被读成普通值；数组、对象中的状态或 JSX 也会递归解析。例如声明 `lines: string[]` 的函数，可以接收 `lines={[<Clean text={draft} />, '固定页脚']}`。用 `D(value)` 可以保留某个值及其内部内容。

多个输出可以组织成数组或对象，交给 `render`，或从 `once` / class 的 `render()` 返回。JSX 标签可以是普通函数、`once` 或 class；输入采用无参数或单个对象参数的形式。

> Stative 不支持 HTML 标签和 Fragment（`<>...</>`）。`key` 只是你声明的普通输入，不承担列表复用；动态列表请使用集合 hooks。

## 配置 TypeScript

在项目中启用 Stative JSX，并把文件扩展名改为 `.tsx`：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "stative"
  }
}
```

> 项目同时使用其他 JSX 运行时，或者不想修改全局配置时，可以在这些 `.tsx` 文件的最顶部添加 `/** @jsxImportSource stative */`。把状态流组合和界面代码放在各自文件中即可。
