# 自定义配置

本页列出 Solid 组件 `Fluxdown` 的公开属性。除 `text` 外，顶层属性均可省略；`FluxdownRaw` 还需要显式传入 `plugins`。Full、Lite 和 Raw 的其他字段一致。

> `BaseBuildConfig`、`StreamingConfig`、`SmoothConfig`、`EffectItem`、`Theme` 和 `FluxdownRef` 从 `@fluxdown/solid` 导入；`IPluginItem` 从 `@fluxdown/solid-plugins/typings` 导入。

在 JSX 中读取 `props.text` 或 `text()`，组件会跟随属性和 signal 更新。需要拆分或设置默认属性时，使用 Solid 的 `splitProps`、`mergeProps`，保留响应式访问。

## text <span className="field-tag">必选</span> {#text}

**类型：** `string`

当前完整的 Markdown。收到新片段时，传入累积后的内容；不要只传最后一个片段。

```tsx
<Fluxdown text="# 你好，Fluxdown" />
```

## streaming <span className="field-tag">可选</span> {#streaming}

**类型：** `boolean | StreamingConfig`

**默认值：** `false`

`true` 开启末尾语法修复、平滑输出和默认 `scale` 动画，`false` 关闭流式行为。传对象可以分别控制各项：

```tsx
<Fluxdown
  text={text()}
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: 'scale',
  }}
/>
```

连接数据源与结束流的完整过程见[流式内容](./streaming.md)。

### streaming.repairEnding <span className="field-tag">可选</span> {#streamingrepairending}

**类型：** `boolean`

**默认值：** `true`（`streaming` 为对象时）

修复仍在生成的末尾语法。设置为 `false` 时，只关闭末尾修复；`build.repair: false` 则关闭全部修复。

### streaming.smooth <span className="field-tag">可选</span> {#streamingsmooth}

**类型：** `boolean | SmoothConfig`

**默认值：** `true`（`streaming` 为对象时）

让新增内容逐步显示。`true` 使用内置弹簧插值，并自动选择可用的驱动；`false` 直接显示已收到的内容。传对象可以指定驱动和插值方式：

```tsx
<Fluxdown
  text={text()}
  streaming={{
    smooth: {
      enabled: true,
      driver: 'raf',
      interpolation: 'spring',
    },
  }}
/>
```

### smooth.enabled <span className="field-tag">可选</span> {#smoothenabled}

**类型：** `boolean`

**默认值：** `false`

使用 `smooth` 对象时，显式设为 `true` 开启平滑输出。关闭后会立即显示当前已收到的内容。

### smooth.driver <span className="field-tag">可选</span> {#smoothdriver}

**类型：** `'raf' | 'interval' | SmoothDriverClass`

**默认值：** 支持动画帧时为 `'raf'`，否则为 `'interval'`

选择驱动输出的时钟：`'raf'` 跟随动画帧，`'interval'` 使用定时器，也可以传自定义驱动类。

### smooth.interpolation <span className="field-tag">可选</span> {#smoothinterpolation}

**类型：** `'spring' | SmoothInterpolatorClass`

**默认值：** `'spring'`

把经过的时间换算成显示进度。`'spring'` 使用内置的弹簧精确解，也可以传自定义插值类。

> 通常直接使用 `smooth: true` 即可。`SmoothDriverClass` 和 `SmoothInterpolatorClass` 从 `@fluxdown/core-plugins/plugins/mapper/smooth` 导入。旧名称 `ticker` 和 `scheduler` 在下一个版本前仍可使用，但已弃用。

### streaming.effect <span className="field-tag">可选</span> {#streamingeffect}

**类型：** `boolean | EffectItem | EffectItem[]`

**默认值：** `'scale'`（启用流式输出时）

| 输入形式                                   | 含义                              |
| ------------------------------------------ | --------------------------------- |
| `false`                                    | 关闭视觉效果。                    |
| 省略或 `true`                              | 使用默认 `scale` 效果。           |
| `'scale'`、`'shad'`、`'chunk'`、`'suffix'` | 使用指定效果的默认配置。          |
| `[名称, 配置]`                             | 调整某个内置效果。                |
| `Mapper` 或 `[Mapper, 配置]`               | 使用自定义 mapper。               |
| `EffectItem[]`                             | 组合多个内置效果或自定义 mapper。 |

例如，同时使用逐字入场与末尾圆点：

```tsx
<Fluxdown
  text={text()}
  streaming={{ effect: ['scale', ['suffix', { type: 'dot' }]] }}
/>
```

以下字段位于 `[名称, 配置]` 的配置对象中，均可省略。通过 `streaming.effect` 指定效果时，`enabled` 默认开启；`disabled: true` 会排除该插件，`priority` 控制 mapper 执行顺序。

#### scale：逐字入场 {#effectscale}

| 字段       | 类型      | 默认值 | 含义                                  |
| ---------- | --------- | ------ | ------------------------------------- |
| `enabled`  | `boolean` | `true` | 启用逐字入场。                        |
| `duration` | `number`  | `200`  | 每个字符的入场时长，单位为毫秒。      |
| `from`     | `number`  | `0`    | 初始缩放比例，范围为 `0` 到 `1`。     |
| `blur`     | `number`  | `0.08` | 初始模糊半径，单位为相对字号的 `em`。 |

字符保留原有排版占位，逐渐放大、变清晰。`duration: 0` 立即显示，`blur: 0` 关闭模糊。

#### shad：末尾渐变 {#effectshad}

| 字段       | 类型      | 默认值 | 含义                                 |
| ---------- | --------- | ------ | ------------------------------------ |
| `enabled`  | `boolean` | `true` | 启用末尾渐变。                       |
| `length`   | `number`  | `10`   | 希望同时保持在淡入中的字符数。       |
| `duration` | `number`  | `400`  | 单个字符最长的淡入时长，单位为毫秒。 |

每个新出现的字符按各自的时钟淡入，与显示进度无关。同时淡入的字符超过 `length` 时，新字符的淡入会相应缩短。`length` 的小数部分会被舍去，`0` 关闭渐变，负数按 `0` 处理。

#### chunk：分块入场 {#effectchunk}

| 字段       | 类型      | 默认值 | 含义                               |
| ---------- | --------- | ------ | ---------------------------------- |
| `enabled`  | `boolean` | `true` | 启用分块入场。                     |
| `duration` | `number`  | `400`  | 每组新文字的淡入时长，单位为毫秒。 |

配合 `smooth: false`，保留收到的文本片段并逐段淡入。修改时长只影响之后的新内容，已有分组继续播放。

```tsx
<Fluxdown
  text={text()}
  streaming={{ smooth: false, effect: ['chunk', { duration: 300 }] }}
/>
```

#### suffix：末尾标记 {#effectsuffix}

| 字段      | 类型                                 | 默认值     | 含义                             |
| --------- | ------------------------------------ | ---------- | -------------------------------- |
| `enabled` | `boolean`                            | `true`     | 在可见内容末尾显示标记。         |
| `type`    | `'cursor' \| 'dot' \| (string & {})` | `'cursor'` | 方块光标、圆点或自定义标记类型。 |

默认插槽显示 `cursor` 和 `dot`。其他字符串交给自定义 render 或 slot 处理，默认不显示。响应结束后关闭 `streaming`，或单独将 `enabled` 改为 `false`。

> `ScaleConfig`、`ShadConfig`、`ChunkConfig` 和 `SuffixConfig` 分别从 `@fluxdown/core-plugins/plugins/mapper/scale`、`shad`、`chunk`、`suffix` 子路径导入。配置也接受 Core 的可读闭包；实时演示见[动画效果](../common/streaming-effects/animation/index.mdx)。

## build <span className="field-tag">可选</span> {#build}

**类型：** `BaseBuildConfig`

**默认值：** `{}`

选择 Markdown 编译能力。表格、任务列表、删除线、自动链接和普通换行默认可用，以下字段均可省略。

```tsx
<Fluxdown text={text()} build={{ tex: true, footnote: true }} />
```

Markdown 内的 HTML 会经过标签检查与清理，默认允许 `span`、`u`、`br`、`em` 和 `a`。调整方式见 [Rehype 插件](../core/plugins/rehype.mdx)。

### build.repair <span className="field-tag">可选</span> {#buildrepair}

**类型：** `boolean`

**默认值：** `true`

是否启用语法修复。`false` 关闭整组修复；仅控制流式末尾时，使用 `streaming.repairEnding`。

### build.footnote <span className="field-tag">可选</span> {#buildfootnote}

**类型：** `boolean`

**默认值：** `false`

是否解析脚注语法，并生成引用与回跳链接。

### build.tex <span className="field-tag">可选</span> {#buildtex}

**类型：** `boolean`

**默认值：** `false`

是否解析行内与块级公式语法。Full 内置公式渲染；Lite 提供基础公式插槽，可以按需添加公式插件。

### build.indentedCode <span className="field-tag">可选</span> {#buildindentedcode}

**类型：** `boolean`

**默认值：** `false`

是否解析缩进代码块语法。围栏代码块无需开启此项。

### build.setextHeading <span className="field-tag">可选</span> {#buildsetextheading}

**类型：** `boolean`

**默认值：** `false`

是否解析用 `===` 或 `---` 作下划线的标题语法。以 `#` 开头的标题不受影响。

### build.idPrefix <span className="field-tag">可选</span> {#buildidprefix}

**类型：** `string`

**默认值：** 自动生成

为脚注 ID 指定命名空间。通常无需设置；手动设置时，应为页面上的不同实例提供不同值，避免脚注链接指向其他内容。

## theme <span className="field-tag">可选</span> {#theme}

**类型：** `Theme`

**默认值：** `'light'`

支持三种形式：

- `'light'` 或 `'dark'`：使用内置主题。
- `PartialThemeConfig`：在浅色主题上覆盖需要的 token。
- `['light' | 'dark', PartialThemeConfig]`：在指定主题上覆盖 token。

```tsx
<Fluxdown
  text={text()}
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: 'Inter, sans-serif' },
      },
    },
  ]}
/>
```

`tokens` 的各组配置都支持局部覆盖：

| 分组                   | 可调整的内容                                 |
| ---------------------- | -------------------------------------------- |
| `colors`               | 文字、背景、边框、强调色和交互状态。         |
| `typography`           | 正文与等宽字体、字号、字重、行高和字体平滑。 |
| `heading`              | `h1` 至 `h6` 各自的字号、字重、行高与间距。  |
| `paragraph`、`code`    | 段落间距、代码块字号和行高。                 |
| `inlineCode`           | 行内代码的字体、边框、背景、内边距和换行。   |
| `divider`、`footnotes` | 分隔线和脚注区域的排版。                     |
| `syntax`               | 注释、关键字、字符串等代码高亮颜色。         |
| `radius`、`spacing`    | 共用圆角和间距。                             |

> `PartialThemeConfig` 和 `ThemeTokens` 从 `@fluxdown/solid` 导入。全部 token 字段与例子见[样式指南](./customization.md)。

## plugins <span className="field-tag">可选</span> {#plugins}

**类型：** `IPluginItem | IPluginItem[]`

**默认值：** `[]`（Full 和 Lite）

Full 和 Lite 合并预设与传入的插件。`FluxdownRaw` 的此参数必填，使用传入的完整列表。

| 字段      | 内容                                                        |
| --------- | ----------------------------------------------------------- |
| `slots`   | 渲染插槽的插件。                                            |
| `renders` | 将 HAST 渲染成插槽的插件。                                  |
| `remarks` | Markdown 语法解析插件。                                     |
| `rehypes` | HAST 二次处理插件。                                         |
| `repairs` | Markdown AST 二次处理与修复插件。                           |
| `mappers` | 响应式映射 HAST 的插件。                                    |
| `config`  | 按 `key` 配置当前对象中列出的插件，类型为 `PluginConfigs`。 |

各列表都可省略；列表项可以是插件本身，也可以是 `[插件, 选项]`。例如，关闭默认代码工具栏：

```tsx
import { Fluxdown } from '@fluxdown/solid';
import { CodeHeaderSlotPlugin } from '@fluxdown/solid-plugins/plugins/code';

type ArticleProps = {
  text: string;
};

export function Article(props: ArticleProps) {
  return (
    <Fluxdown
      text={props.text}
      plugins={{
        slots: [CodeHeaderSlotPlugin],
        config: {
          'slot-code-header': { disabled: true },
        },
      }}
    />
  );
}
```

> `IPluginItem` 和 `PluginConfigs` 从 `@fluxdown/solid-plugins/typings` 导入。`config` 只作用于同一个对象里明确列出的插件，其他预设继续保留。

`disabled: true` 停用插件；`priority` 数值越小越早执行。相同优先级下，后面的 render 先匹配，后面的 slot 通过 `Raw` 包裹前面的组件。声明与组合方式见[使用与编写插件](./plugins.md)。

## patches <span className="field-tag">可选</span> {#patches}

**类型：** `IPatchItem<JSX.Element>[]`

**默认值：** `[]`

用自己的 Solid 内容替换指定文本，或在某个位置插入内容。适合把提及、引用等文本变成可交互元素。

> `IPatchItem` 从 `@fluxdown/core` 导入，`JSX` 从 `solid-js` 导入。

```tsx
import type { IPatchItem } from '@fluxdown/core';
import type { JSX } from 'solid-js';

import { Fluxdown } from '@fluxdown/solid';

const patches: IPatchItem<JSX.Element>[] = [
  {
    key: 'person-ada',
    range: [3, 7],
    render: () => {
      return <a href="/people/ada">@Ada</a>;
    },
  },
];

export function Article() {
  return <Fluxdown text="欢迎，@Ada。" patches={patches} />;
}
```

在 `render` 中创建 JSX，让每个补丁实例拥有自己的组件与清理生命周期。

### patches[].key <span className="field-tag">可选</span> {#patcheskey}

**类型：** `string`

**默认值：** `undefined`

补丁的稳定标识。

### patches[].range <span className="field-tag">必选</span> {#patchesrange}

**类型：** `number | [number, number]`

单个数字表示在该位置插入内容；区间表示替换内容，包含起点、不包含终点。位置按原始字符串索引计算，区间需要落在同一个内容块内，避免跨段落或相互重叠。

### patches[].render <span className="field-tag">必选</span> {#patchesrender}

**类型：** `(text?: string) => JSX.Element`

返回插入或替换的内容，也可以通过 `text` 读取被替换的文本。

## class <span className="field-tag">可选</span> {#class}

**类型：** `string`

**默认值：** `undefined`

最外层容器的类名，会与组件自己的类名合并。

```tsx
<Fluxdown class="conversation-message" text={text()} />
```

## classList <span className="field-tag">可选</span> {#classlist}

**类型：** `{ [className: string]: boolean | undefined }`

**默认值：** `undefined`

使用 Solid 的条件类名绑定：

```tsx
<Fluxdown classList={{ compact: compact() }} text={text()} />
```

## style <span className="field-tag">可选</span> {#style}

**类型：** `JSX.CSSProperties | string`

**默认值：** `undefined`

最外层容器的内联样式，支持字符串或 Solid 样式对象。对象键使用 CSS 属性名：

```tsx
<Fluxdown
  style={{ 'max-width': '72ch', 'margin-inline': 'auto' }}
  text={text()}
/>
```

内容内部的排版优先使用 `theme`，组件与交互调整使用插件。`id`、`aria-*`、`data-*`、`onClick` 等其他 div 属性也会透传到最外层容器。

## ref <span className="field-tag">可选</span> {#ref}

**类型：** `(core: FluxdownRef) => void`

**默认值：** `undefined`

创建组件时调用回调，传入可读的 Core 句柄。它不是 DOM 元素；`FluxdownRef` 的类型为 `IReadableClosure<unknown[]>`，其中的数组是内部渲染块，不应当作 JSX 再次渲染。

```tsx
import type { FluxdownRef } from '@fluxdown/solid';

import { Fluxdown } from '@fluxdown/solid';
import { onMount } from 'solid-js';

type ArticleProps = {
  text: string;
};

export function Article(props: ArticleProps) {
  let content: FluxdownRef | undefined;

  onMount(() => {
    console.log(content?.value.value.length);
  });

  return (
    <Fluxdown
      text={props.text}
      ref={(core) => {
        content = core;
      }}
    />
  );
}
```

> `FluxdownRef` 从 `@fluxdown/solid` 导入；`IReadableClosure` 从 `stative` 导入。组件负责释放 Core，卸载后不要继续使用保存的句柄。回调不会在卸载时收到 `null`，普通展示无需使用 `ref`。
