# 自定义配置

本页列出 Svelte 组件 `Fluxdown` 的公开属性。除 `text` 外，顶层属性均可省略；`FluxdownRaw` 还需要显式传入 `plugins`。Full、Lite 和 Raw 的其他字段一致。

> `BaseBuildConfig`、`StreamingConfig` 和 `Theme` 从 `@fluxdown/svelte` 导入；`IPluginItem` 从 `@fluxdown/svelte-plugins/typings` 导入。

## text <span className="field-tag">必选</span> {#text}

**类型：** `string`

当前完整的 Markdown。收到新片段时，传入累积后的内容；不要只传最后一个片段。

```svelte
<Fluxdown text="# 你好，Fluxdown" />
```

## streaming <span className="field-tag">可选</span> {#streaming}

**类型：** `boolean | StreamingConfig`

**默认值：** `false`

`true` 开启末尾语法修复、平滑输出和默认 `scale` 动画，`false` 关闭流式行为。传对象可以选择视觉特效并分别控制各项。`repairEnding` 和 `smooth` 默认为 `true`，`effect` 默认为 `'scale'`。

```svelte
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: 'scale',
  }}
  {text}
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

```svelte
<Fluxdown
  streaming={{
    smooth: {
      enabled: true,
      ticker: 'raf',
      scheduler: 'spring',
    },
  }}
  {text}
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

> 通常直接使用 `smooth: true` 即可。`SmoothConfig` 从 `@fluxdown/svelte` 导入；`SmoothTickerClass` 和 `SmoothSchedulerClass` 从 `@fluxdown/core-plugins/plugins/mapper/smooth` 导入。

### streaming.effect <span className="field-tag">可选</span> {#streamingeffect}

**类型：** `boolean | EffectItem | EffectItem[]`

**默认值：** `'scale'`（启用流式输出时）

选择动画效果，也可以组合多个效果。支持的输入形式、内置效果、实时演示与配置字段见[动画效果](../common/streaming-effects/animation/index.mdx)。

> `EffectItem` 从 `@fluxdown/svelte` 导入。效果配置类型从对应插件入口导入，例如 `ScaleConfig` 来自 `@fluxdown/core-plugins/plugins/mapper/scale`。完整子路径见 [Mapper 插件](../core/plugins/mapper.mdx#支持的插件)。

## build <span className="field-tag">可选</span> {#build}

**类型：** `BaseBuildConfig`

**默认值：** `{}`

选择 Markdown 编译能力。表格、任务列表、删除线、自动链接和普通换行默认可用，以下字段均可省略。

```svelte
<Fluxdown
  build={{
    tex: true,
    footnote: true,
  }}
  {text}
/>
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

```svelte
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
  {text}
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

> `PartialThemeConfig` 和完整 token 类型 `ThemeTokens` 同样从 `@fluxdown/svelte` 导入。搭配产品主题的例子见[样式指南](./customization.md)。

## plugins <span className="field-tag">可选</span> {#plugins}

**类型：** `IPluginItem | IPluginItem[]`

**默认值：** `[]`

> `IPluginItem` 从 `@fluxdown/svelte-plugins/typings` 导出。Lite 和 Full 会合并预设与传入的插件，传入的优先级更高。`FluxdownRaw` 的此参数必填，入口区别见[插件矩阵](./plugins/matrix.mdx)。

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

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
  import { CodeHeaderSlotPlugin } from '@fluxdown/svelte-plugins/plugins/code';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<Fluxdown
  plugins={{
    slots: [CodeHeaderSlotPlugin],
    config: {
      'slot-code-header': { disabled: true },
    },
  }}
  {text}
/>
```

这个例子关闭默认代码工具栏。`disabled: true` 可停用插件；`priority` 数值越小越早执行。相同优先级下，后面的 render 先匹配，后面的 slot 通过 `Raw` snippet 包裹前面的组件。

> `PluginConfigs` 从 `@fluxdown/svelte-plugins/typings` 导入。`config` 属于插件包，作用于同一个包里明确列出的插件。其他预设会继续保留。

声明、组合和配置示例见[使用与编写插件](./plugins.md)。

## patches <span className="field-tag">可选</span> {#patches}

**类型：** `IPatchItem<SvelteNode>[]`

**默认值：** `[]`

用自己的 Svelte 内容替换指定文本，或在某个位置插入内容。适合把提及、引用等文本变成可交互元素。

> `IPatchItem` 从 `@fluxdown/core` 导入；`SvelteNode` 和 `createElement` 从 `@fluxdown/svelte-plugins/base` 导入。

```svelte
<script lang="ts">
  import type { IPatchItem } from '@fluxdown/core';
  import type { SvelteNode } from '@fluxdown/svelte-plugins/base';

  import { Fluxdown } from '@fluxdown/svelte';
  import { createElement } from '@fluxdown/svelte-plugins/base';

  const patches: IPatchItem<SvelteNode>[] = [
    {
      key: 'person-ada',
      range: [3, 7],
      render: () => createElement('a', { href: '/people/ada' }, '@Ada'),
    },
  ];
</script>

<Fluxdown {patches} text="欢迎，@Ada。" />
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

**类型：** `(text?: string) => SvelteNode`

返回插入或替换的内容，也可以通过 `text` 读取被替换的文本。

## class <span className="field-tag">可选</span> {#class}

**类型：** `string`

**默认值：** `undefined`

最外层元素的类名，用于接入应用样式。Svelte 的组件样式默认有作用域，通过类名设置容器样式时需使用 `:global`，见[样式指南](./customization.md#页面布局)。

```svelte
<Fluxdown class="conversation-message" {text} />
```

## style <span className="field-tag">可选</span> {#style}

**类型：** `string`

**默认值：** `undefined`

最外层元素的 CSS 样式字符串，常用于宽度、布局和与父容器的间距：

```svelte
<Fluxdown
  class="conversation-message"
  style="padding: 16px; max-width: 720px"
  {text}
/>
```

内容内部的颜色与排版见[样式指南](./customization.md)，组件与交互调整使用 [Slot 插件](./plugins/slot.md)。

## getProps <span className="field-tag">可选</span> {#getprops}

**类型：** `GetPropsFunction | null`

**默认值：** `undefined`

> `GetPropsFunction` 从 `@fluxdown/svelte-plugins/typings` 导入，签名为 `(node?: Element) => Record<string, unknown>`；`Element` 来自 `hast`。

不传 `getProps` 时，组件会转换语法树上的属性。传入函数可以替换这个过程；传 `null` 则不从语法树转发元素属性。字体、间距与交互优先通过[主题](./customization.md)和 [Slot 插件](./plugins/slot.md)调整。

```svelte
<Fluxdown getProps={null} {text} />
```

## bind:this <span className="field-tag">可选</span> {#bindthis}

**类型：** `ReturnType<typeof Fluxdown> | undefined`

**默认值：** `undefined`

通过 `bind:this` 获取组件，再调用 `getCore()` 读取响应式渲染结果。返回值 `FluxdownCore` 是 `IReadableClosure<SvelteNode[]>`，提供当前内容与订阅能力。

> `FluxdownCore` 从 `@fluxdown/svelte` 导入。通常展示内容无需使用组件引用；自己建立的订阅需要取消。

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();

  let content = $state<ReturnType<typeof Fluxdown>>();

  function inspect() {
    console.log(content?.getCore());
  }
</script>

<Fluxdown bind:this={content} {text} />
<button onclick={inspect}>查看渲染结果</button>
```

`bind:this` 的值在组件挂载后可用，应在事件回调或 effect 中读取。
