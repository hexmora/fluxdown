# 自定义配置

本页列出 `Fluxdown` 的公开属性。除 `text` 外，顶层属性均可省略；类型 `BaseBuildConfig`、`StreamingConfig`、`Theme`、`IPluginItem` 和 `FluxdownRef` 都可从 `fluxdown` 导入。

## text <span className="field-tag">必选</span> {#text}

**类型：** `string`

当前完整的 Markdown。收到新片段时，传入累积后的内容；不要只传最后一个片段。

```tsx
<Fluxdown text="# 你好，Fluxdown" />
```

## streaming <span className="field-tag">可选</span> {#streaming}

**类型：** `boolean | StreamingConfig`

**默认值：** `false`

`true` 开启末尾语法修复和平滑输出，`false` 关闭流式行为。传对象可以选择视觉特效并分别控制各项。`repairEnding` 和 `smooth` 默认为 `true`，`effect` 默认为 `false`。

```tsx
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: 'shad',
  }}
  text={text}
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

让新增内容逐步显示。`true` 使用内置弹簧调度，并自动选择可用的时钟；`false` 直接显示已收到的内容。传对象可以指定时钟和调度方式：

```tsx
<Fluxdown
  streaming={{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }}
  text={text}
/>
```

### smooth.enabled <span className="field-tag">可选</span> {#smoothenabled}

**类型：** `boolean`

**默认值：** `false`

使用 `smooth` 对象时，显式设为 `true` 开启平滑输出。关闭后会立即显示当前已收到的内容。

### smooth.ticker <span className="field-tag">必选</span> {#smoothticker}

**类型：** `'raf' | 'interval' | SmoothTickerClass`

选择输出节奏的时钟：`'raf'` 跟随动画帧，`'interval'` 使用定时器，也可以传自定义时钟类。

### smooth.scheduler <span className="field-tag">必选</span> {#smoothscheduler}

**类型：** `'spring' | SmoothSchedulerClass`

决定每次更新显示多少内容。`'spring'` 使用内置弹簧调度，也可以传自定义调度类。

> 通常直接使用 `smooth: true` 即可。`SmoothConfig` 从 `fluxdown` 导入；`SmoothTickerClass` 和 `SmoothSchedulerClass` 从 `@fluxdown/core-presets/mapper` 导入。

### streaming.effect <span className="field-tag">可选</span> {#streamingeffect}

**类型：** `boolean | EffectItem | EffectItem[]`

**默认值：** `false`

选择内置特效、直接传入 mapper 插件，或用数组组合多个特效：

| 值                                                          | 效果                                               |
| ----------------------------------------------------------- | -------------------------------------------------- |
| 不传或 `false`                                              | 不启用视觉特效。                                   |
| `true` 或 `'shad'`                                          | 使用默认配置，让新出现的末尾文字渐变显示。         |
| `['shad', ShadPluginConfig]`                                | 配置末尾渐变。                                     |
| `'scale'`                                                   | 新出现的字符逐字放大、淡入，并逐渐消除模糊。       |
| `['scale', ScalePluginConfig]`                              | 配置逐字入场效果。                                 |
| `Mapper`                                                    | 使用 mapper 的默认配置。                           |
| `[Mapper, options]`                                         | 使用与 `plugins.mappers` 相同的配置来设置 mapper。 |
| `['shad', ['scale', ScalePluginConfig], [Mapper, options]]` | 组合内置特效与自定义特效。                         |

自定义特效与 [mapper 插件](../core/plugins/mapper.md) 使用相同的配置。字段支持普通值或可读闭包；`priority` 控制顺序，`disabled` 排除某项特效。特效在平滑输出之后执行。`EffectItem` 从 `fluxdown` 导入，特效配置类型从 `@fluxdown/core-presets/mapper` 导入。

```tsx
<Fluxdown
  streaming={{
    effect: ['shad', { length: 3, maskWidth: 18 }],
  }}
  text={text}
/>
```

### shad.enabled <span className="field-tag">可选</span> {#shadenabled}

**类型：** `boolean`

**默认值：** `true`

是否开启末尾渐变。

### shad.length <span className="field-tag">可选</span> {#shadlength}

**类型：** `number`

**默认值：** `10`

参与渐变的末尾字符数。小数向下取整，负数和非有限值按 `0` 处理。

### shad.maskWidth <span className="field-tag">可选</span> {#shadmaskwidth}

**类型：** `number`

**默认值：** `15`

渐变遮罩宽度，单位为像素。`0` 隐藏遮罩，负数按 `0` 处理，非有限值使用默认宽度。

### shad.hideDelay <span className="field-tag">可选</span> {#shadhidedelay}

**类型：** `number`

**默认值：** `200`

可见内容停止增长后，末尾渐变继续保留的毫秒数。负数按 `0` 处理，非有限值使用默认时长。

### scale.enabled <span className="field-tag">可选</span> {#scaleenabled}

**类型：** `boolean`

**默认值：** `true`

在 `effect: ['scale', config]` 中开启逐字入场效果。已有内容保持静止。动画遵循 `prefers-reduced-motion`，代码、公式和替换内容沿用原有渲染。

### scale.duration <span className="field-tag">可选</span> {#scaleduration}

**类型：** `number`

**默认值：** `200`

入场时长，单位为毫秒。`0` 立即显示字符。负数按 `0` 处理，非有限值使用默认时长。

### scale.from <span className="field-tag">可选</span> {#scalefrom}

**类型：** `number`

**默认值：** `0`

字符的初始缩放比例，范围为 `0` 到 `1`。字符以底部中心为原点放大到完整尺寸，保留原有排版占位。超出范围的值会被限制在范围内，非有限值使用 `0`。

### scale.blur <span className="field-tag">可选</span> {#scaleblur}

**类型：** `number`

**默认值：** `0.08`

初始模糊半径，单位为随字号变化的 `em`。例如字号为 20 像素时，`0.08` 对应 1.6 像素。模糊会在入场过程中逐渐消退，设为 `0` 可以关闭。负数按 `0` 处理，非有限值使用默认半径。

## build <span className="field-tag">可选</span> {#build}

**类型：** `BaseBuildConfig`

**默认值：** `{}`

选择 Markdown 编译能力。表格、任务列表、删除线、自动链接和普通换行默认可用，以下字段均可省略。

```tsx
<Fluxdown
  build={{
    tex: true,
    footnote: true,
  }}
  text={text}
/>
```

Markdown 内的 HTML 会经过标签检查与清理，默认允许 `span`、`u`、`br`、`em` 和 `a`。调整方式见 [Rehype 插件](../core/plugins/rehype.md)。

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

是否解析行内与块级公式语法。开启后，内置渲染器会加载公式渲染能力。

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

为脚注 ID 指定命名空间。

> 通常无需设置 `idPrefix`。手动设置时，应为页面上的不同实例提供不同值，避免脚注链接指向其他内容。

## theme <span className="field-tag">可选</span> {#theme}

**类型：** `Theme`

**默认值：** `'light'`

支持三种形式：

- `'light'` 或 `'dark'`：使用内置主题。
- `PartialThemeConfig`：在浅色主题上覆盖需要的 token。
- `['light' | 'dark', PartialThemeConfig]`：在指定主题上覆盖 token。

```tsx
<Fluxdown
  theme={[
    'dark',
    {
      tokens: {
        colors: { accent: '#82d8cf' },
        typography: { fontSans: 'Inter, sans-serif' },
      },
    },
  ]}
  text={text}
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

完整 token 类型为 `ThemeTokens`，同样从 `fluxdown` 导入。搭配产品主题的例子见[样式指南](./customization.md)。

## plugins <span className="field-tag">可选</span> {#plugins}

**类型：** `IPluginItem | IPluginItem[]`

**默认值：** `[]`

一个对象表示一个插件包；数组组合多个插件包。每个包可以提供以下列表：

| 字段      | 内容                                                          |
| --------- | ------------------------------------------------------------- |
| `slots`   | 渲染插槽的插件。                                              |
| `renders` | 将 HAST 渲染成插槽的插件。                                    |
| `remarks` | Markdown 语法解析插件。                                       |
| `rehypes` | HAST 二次处理插件。                                           |
| `repairs` | Markdown AST 二次处理与修复插件。                             |
| `mappers` | 响应式映射 HAST 的插件。                                      |
| `config`  | 按 `key` 配置当前插件包中列出的插件，类型为 `PluginConfigs`。 |

列表项可以是插件本身，也可以是 `[插件, 选项]`。使用 `config` 时，不需要把选项重复写进各个列表项：

```tsx
import { CodeHeaderSlotPlugin } from '@fluxdown/react-presets/slot';
import { Fluxdown } from 'fluxdown';

<Fluxdown
  plugins={{
    slots: [CodeHeaderSlotPlugin],
    config: {
      'slot-code-header': { disabled: true },
    },
  }}
  text={text}
/>;
```

这个例子关闭默认代码工具栏。插件选项中的 `disabled: true` 可停用插件；`priority` 设置执行顺序，数值越小越早执行。

> `config` 属于插件包，作用于同一个包里明确列出的插件。其他预设会继续保留。

声明、组合和配置示例见[使用与编写插件](./plugins.md)。

## patches <span className="field-tag">可选</span> {#patches}

**类型：** `IPatchItem<ReactNode>[]`

**默认值：** `[]`

用自己的 React 内容替换指定文本，或在某个位置插入内容。适合把提及、引用等文本变成可交互元素。

```tsx
<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => <a href="/people/ada">@Ada</a>,
    },
  ]}
  text="欢迎，@Ada。"
/>
```

### patches[].key <span className="field-tag">可选</span> {#patcheskey}

**类型：** `string`

**默认值：** `undefined`

补丁的稳定标识。

### patches[].range <span className="field-tag">必选</span> {#patchesrange}

**类型：** `number | [number, number]`

单个数字表示在该位置插入内容；区间表示替换内容，包含起点、不包含终点。

> 位置按原始字符串索引计算。区间需要落在同一个内容块内，避免跨段落或相互重叠。

### patches[].render <span className="field-tag">必选</span> {#patchesrender}

**类型：** `(text?: string) => ReactNode`

返回插入或替换的内容，也可以通过 `text` 读取被替换的文本。

## className <span className="field-tag">可选</span> {#classname}

**类型：** `string`

**默认值：** `undefined`

添加到最外层容器的类名，用于接入应用样式。

```tsx
<Fluxdown className="conversation-message" text={text} />
```

## style <span className="field-tag">可选</span> {#style}

**类型：** `CSSProperties`

**默认值：** `undefined`

最外层容器的 React 内联样式。常用于宽度、布局和与父容器的间距：

```tsx
<Fluxdown
  style={{
    maxWidth: '72ch',
    marginInline: 'auto',
  }}
  text={text}
/>
```

内容内部的排版优先使用 `theme`，组件与交互调整使用插件。

## ref <span className="field-tag">可选</span> {#ref}

**类型：** `Ref<FluxdownRef>`

**默认值：** `undefined`

读取渲染结果的响应式句柄。`FluxdownRef` 是 `IReadableClosure<ReactNode[]>`；其 `value` 提供当前内容与订阅能力，不是 DOM 元素。

```tsx
import type { FluxdownRef } from 'fluxdown';

import { Fluxdown } from 'fluxdown';
import { useRef } from 'react';

type MessageProps = {
  text: string;
};

export function Message({ text }: MessageProps) {
  const content = useRef<FluxdownRef>(null);

  return <Fluxdown ref={content} text={text} />;
}
```

> 普通展示无需使用 `ref`。Fluxdown 会管理句柄的生命周期；自己建立的订阅需要取消。
