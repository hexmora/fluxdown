# 自定义配置

`CoreInputs<R, C>` 描述 Core 的公开输入。`R` 是渲染器的输出类型，`C` 是渲染器为渲染插件提供的额外上下文。所有字段集中在这一页，可通过右侧目录直接跳转。

下方类型表示 Core 内部接收的输入。使用 `S` 时，响应式输入可以传 Stative 状态或可读闭包；配置对象与数组也可以直接传入。渲染器类用 `D` 包装，完整写法见[快速开始](./quick-start.md)。

> `remarks`、`rehypes`、`repairs` 和 `mappers` 可以省略，省略时保留预设；传空插件列表也会保留预设。

## Renderer <span className="field-tag">必选</span> {#renderer}

**类型：** `RendererClass<HastRoot, ElementContent, Parent, R, C>`

将 HAST 内容块转换为目标输出的渲染器类。继承 `BaseRenderer` 并实现 `renderItem`，使用时传入 `Renderer: D(BlocksRenderer)`。

渲染器会接收响应式的 `source`、`plugins` 和 `patches`，并负责应用渲染规则与替换内容。Core 不提供默认 UI。

## text <span className="field-tag">必选</span> {#text}

**类型：** `IReadableClosure<string>`

当前已收到的完整 Markdown。固定内容使用 `toClosure('你好')`；持续变化的内容使用状态：

```ts
import { MutableState } from 'stative';

const text = MutableState.of('你好');

text.next(text.value + '，Fluxdown');
```

## build <span className="field-tag">必选</span> {#build}

**类型：** `IReadableClosure<BlockCompilerConfig>`

控制解析与修复功能。需要填写每个布尔字段，只有 `idPrefix` 可以省略：

```ts
import type { BlockCompilerConfig } from '@fluxdown/core';

import { MutableState } from 'stative';

const build = MutableState.of<BlockCompilerConfig>({
  repair: true,
  repairEnding: true,
  footnote: false,
  tex: false,
  indentedCode: false,
  setextHeading: false,
});

build.next({ ...build.value, repairEnding: false });
```

## build.repair <span className="field-tag">必选</span> {#buildrepair}

**类型：** `boolean`

是否启用 repair 插件组。设为 `false` 时，不再执行这组 AST 修复。

## build.repairEnding <span className="field-tag">必选</span> {#buildrepairending}

**类型：** `boolean`

是否修复流式末尾的未完成语法，需要同时开启 `repair`。接收完最终文本后设为 `false`。

## build.footnote <span className="field-tag">必选</span> {#buildfootnote}

**类型：** `boolean`

是否解析脚注语法，例如 `正文[^note]` 配合 `[^note]: 说明。`。开启末尾修复时，也会隐藏尚未解析的尾部脚注引用。

## build.idPrefix <span className="field-tag">可选</span> {#buildidprefix}

**类型：** `string | undefined`

**默认值：** `undefined`

脚注 ID 的稳定命名空间。同一页面展示多份内容时，为每份内容指定不同的值；服务端渲染与 hydration 应使用相同的值。不需要隔离时可省略。

## build.tex <span className="field-tag">必选</span> {#buildtex}

**类型：** `boolean`

是否解析行内公式与块级公式语法，例如 `$x^2$` 和 `$$x^2$$`。生成的公式节点如何显示，由渲染器决定。

## build.indentedCode <span className="field-tag">必选</span> {#buildindentedcode}

**类型：** `boolean`

是否解析缩进代码块语法。如果希望行首空格继续作为普通段落内容，设为 `false`。

## build.setextHeading <span className="field-tag">必选</span> {#buildsetextheading}

**类型：** `boolean`

是否解析通过 `===` 或 `---` 下划线表示的 Setext 标题语法。如果不希望内容在收到下划线时变成标题，设为 `false`。

## patches <span className="field-tag">必选</span> {#patches}

**类型：** `IReadableClosure<IPatchItem<R>[]>`

把原文中的指定范围替换为渲染器定义的内容，不需要时传 `[]`。渲染器需处理 patch 标记，并调用对应的替换函数。

以输出字符串的渲染器为例：

```ts
import type { IPatchItem } from '@fluxdown/core';

const patches: IPatchItem<string>[] = [
  {
    key: 'reference',
    range: [0, 4],
    render: (text) => `[${text ?? ''}]`,
  },
];
```

## patches[].key <span className="field-tag">可选</span> {#patcheskey}

**类型：** `string | undefined`

**默认值：** `undefined`

可选的稳定标识。patch 会被重排或插入时，建议指定唯一的 `key`；省略时，Core 按顺序生成。

## patches[].range <span className="field-tag">必选</span> {#patchesrange}

**类型：** `number | [number, number]`

数字表示在该位置插入内容；二元组表示替换左闭右开的 `[start, end)` 范围。偏移量使用 JavaScript 字符串索引。

> 范围需在原文之内、互不重叠，并且完全位于同一个内容块中。无效或冲突的范围会被忽略。

## patches[].render <span className="field-tag">必选</span> {#patchesrender}

**类型：** `IRenderPatchRender<R>` — `(text?: string) => R`

生成替换内容。渲染器可以把被替换的原文传入回调，返回值需符合渲染器的输出类型 `R`。

## renders <span className="field-tag">必选</span> {#renders}

**类型：** `IReadableClosure<PluginSet<RenderPlugin<R, C>, RenderConfigs>>`

供渲染器使用的节点级规则。下面的具名类型使用公开的渲染插件契约：

```ts
import type { IRenderPluggable } from '@fluxdown/core';
import type { ElementContent, Parent } from 'hast';

type RenderPlugin<R, C = {}> = IRenderPluggable<
  ElementContent,
  Parent,
  R,
  C,
  unknown
>;
```

每个插件匹配 HAST 节点并生成输出值。直接处理完整内容块的渲染器可以传 `[]`。Core 没有内置的渲染插件列表。

## remarks <span className="field-tag">可选</span> {#remarks}

**类型：** `IReadableClosure<PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>> | undefined`

**默认值：** `undefined`

语法解析插件与预设配置。编写方式见 [remark](./plugins/remark.md)。

```ts
type RemarkOptions = [[], RemarkConfigs];

const remarks: RemarkOptions = [
  [],
  { 'remark-syntax-soft-endline': { disabled: true } },
];
```

## rehypes <span className="field-tag">可选</span> {#rehypes}

**类型：** `IReadableClosure<PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>> | undefined`

**默认值：** `undefined`

HAST 二次处理插件与预设配置。编写方式见 [rehype](./plugins/rehype.md)。

```ts
type RehypeOptions = [[], RehypeConfigs];

const rehypes: RehypeOptions = [
  [],
  { 'rehype-sanitizer': { allowedTags: ['mark'] } },
];
```

> 对于嵌入的 HTML，还需要在[语法过滤阶段](./plugins/rehype.md#允许额外-html-标签)允许该标签。

## repairs <span className="field-tag">可选</span> {#repairs}

**类型：** `IReadableClosure<PluginSet<IPluggable<IRepairPlugin, unknown>, RepairConfigs>> | undefined`

**默认值：** `undefined`

Markdown AST 二次处理插件与预设配置。整组需要开启 `build.repair`，末尾修复还需要开启 `build.repairEnding`。编写方式见 [repair](./plugins/repair.md)。

```ts
type RepairOptions = [[], RepairConfigs];

const repairs: RepairOptions = [
  [],
  { 'repair-incomplete-image': { strategy: 'discard' } },
];
```

## mappers <span className="field-tag">可选</span> {#mappers}

**类型：** `IReadableClosure<PluginSet<MapperPluggable, MapperConfigs>> | undefined`

**默认值：** `undefined`

响应式映射 HAST。默认包含 `Smooth`、`Shad` 和 `Scale`，但需要配置后才会启用。声明与响应式选项见 [mapper](./plugins/mapper.md)。

```ts
import { toClosure } from 'stative';

type MapperOptions = [[], MapperConfigs];

const mappers: MapperOptions = [[], { smooth: { enabled: toClosure(true) } }];
```

嵌套的 mapper 选项直接传给 mapper。内置的响应式选项接收可读闭包，`toClosure` 可以把静态值或外部状态转为这种输入。

## 插件输入形式

`PluginSet<T, C>` — `T[] | C | [T[], C]`

五个插件输入都支持列表、按名称配置的对象，或者两者的组合。列表中的类插件可以写为 `PluginClass` 或 `[PluginClass, options]`；mapper 可以写为函数或 `[Mapper, options]`。

按名称配置的对象也可以作为响应式输入：

```ts
import { MutableState } from 'stative';

const repairs = MutableState.of<RepairConfigs>({
  'repair-incomplete-image': { strategy: 'discard' },
});

repairs.next({
  'repair-incomplete-image': { strategy: 'placeholder' },
});
```

在 `S` 中使用静态配置对象时，也可以通过 `toClosure(config)` 转为可读输入，见[允许额外 HTML 标签](./plugins/rehype.md#允许额外-html-标签)。按名称配置只调整已有插件；注册新的插件需使用列表。

## 插件选项.disabled <span className="field-tag">可选</span> {#插件选项disabled}

**类型：** `boolean | undefined`

**默认值：** `false`

不创建这个插件，并将其从当前插件组中排除。省略或传 `false` 时保留插件，例如 `{ disabled: true }` 可以禁用一个预设。

## 插件选项.priority <span className="field-tag">可选</span> {#插件选项priority}

**类型：** `PluginPriority | number | undefined`

**默认值：** 插件自身的优先级

控制同类插件的执行顺序，数值越小越早执行。相同优先级保持列表顺序；省略时使用插件自身的优先级。枚举提供 `Highest`、`High`、`Default`、`Low` 和 `Lowest`。

> 类型导入：编译器与渲染器类型来自 `@fluxdown/core`，插件契约与 `PluginSet` 来自 `@fluxdown/types`，`IReadableClosure` 来自 `stative`。各内置插件随对应的[插件类型](./plugins.md)介绍。
