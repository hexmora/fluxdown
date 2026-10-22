# Configuration

`CoreInputs<R, C>` describes Core's public inputs. `R` is the output produced by your renderer; `C` is any additional context it gives render plugins. All fields are collected on this page so you can jump to them from the table of contents.

The types below describe the inputs Core receives. In `S`, reactive inputs accept Stative states or readable closures; configuration objects and arrays can also be passed directly. Wrap the renderer class in `D`, as in the [quick start](./quick-start.md).

> `remarks`, `rehypes`, `repairs`, and `mappers` are optional; leaving them out keeps their presets. An empty plugin list also keeps presets.

## Renderer <span className="field-tag">Required</span> {#renderer}

**Type:** `RendererClass<HastRoot, ElementContent, Parent, R, C>`

The renderer class turns HAST blocks into your chosen output. Extend `BaseRenderer` and implement `renderItem`. Pass the class as `Renderer: D(BlocksRenderer)`.

The renderer receives reactive `source`, `plugins`, and `patches` inputs. It is responsible for applying render plugins and replacement content; Core does not supply a default UI.

## text <span className="field-tag">Required</span> {#text}

**Type:** `IReadableClosure<string>`

The full Markdown received so far. Use `toClosure('Hello')` for fixed content, or a state for live updates:

```ts
import { MutableState } from 'stative';

const text = MutableState.of('Hello');

text.next(text.value + ', Fluxdown');
```

## build <span className="field-tag">Required</span> {#build}

**Type:** `IReadableClosure<BlockCompilerConfig>`

Controls parsing and repair features. Supply every boolean field; only `idPrefix` is optional:

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

## build.repair <span className="field-tag">Required</span> {#buildrepair}

**Type:** `boolean`

Whether to enable the repair plugin group. Set it to `false` to parse without those AST repairs.

## build.repairEnding <span className="field-tag">Required</span> {#buildrepairending}

**Type:** `boolean`

Whether to repair unfinished syntax at the end of a stream. It takes effect when `repair` is also enabled. Set it to `false` after receiving the final text.

## build.footnote <span className="field-tag">Required</span> {#buildfootnote}

**Type:** `boolean`

Whether to parse footnote syntax, such as `Text[^note]` with `[^note]: Details.`. Ending repair also hides unresolved trailing references when enabled.

## build.idPrefix <span className="field-tag">Optional</span> {#buildidprefix}

**Type:** `string | undefined`

**Default:** `undefined`

A stable namespace for generated footnote IDs. Give each document its own value when several documents share a page. Use the same value during server rendering and hydration. Omit it when no document-specific namespace is needed.

## build.tex <span className="field-tag">Required</span> {#buildtex}

**Type:** `boolean`

Whether to parse inline and block math syntax, such as `$x^2$` and `$$x^2$$`. Your renderer decides how the resulting math nodes appear.

## build.indentedCode <span className="field-tag">Required</span> {#buildindentedcode}

**Type:** `boolean`

Whether to parse indented code block syntax. Set it to `false` when leading spaces should remain ordinary paragraph content.

## build.setextHeading <span className="field-tag">Required</span> {#buildsetextheading}

**Type:** `boolean`

Whether to parse Setext headings underlined with `===` or `---`. Set it to `false` if your incoming text should not change into a heading when an underline arrives.

## patches <span className="field-tag">Required</span> {#patches}

**Type:** `IReadableClosure<IPatchItem<R>[]>`

Replaces source ranges with renderer-defined output. Pass `[]` when unused. The renderer must handle patch markers and invoke the corresponding replacement function.

For a renderer that returns strings:

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

## patches[].key <span className="field-tag">Optional</span> {#patcheskey}

**Type:** `string | undefined`

**Default:** `undefined`

An optional stable identifier. Provide a unique key when patches can be reordered or inserted; otherwise Core generates one from their order.

## patches[].range <span className="field-tag">Required</span> {#patchesrange}

**Type:** `number | [number, number]`

A number inserts output at that source offset. A pair replaces the half-open range `[start, end)`. Offsets use JavaScript string indexes.

> Ranges must be within the source, non-overlapping, and contained in a single content block. Invalid or conflicting ranges are ignored.

## patches[].render <span className="field-tag">Required</span> {#patchesrender}

**Type:** `IRenderPatchRender<R>` — `(text?: string) => R`

Produces the replacement output. A renderer can pass the replaced source text to the callback. The return value must match its output type `R`.

## renders <span className="field-tag">Required</span> {#renders}

**Type:** `IReadableClosure<PluginSet<RenderPlugin<R, C>, RenderConfigs>>`

Node-level rules for your renderer. The named type below uses the public render-plugin contract:

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

Each plugin matches HAST nodes and produces an output value. Use `[]` for a renderer that consumes whole blocks directly. Core has no built-in render-plugin list.

## remarks <span className="field-tag">Optional</span> {#remarks}

**Type:** `IReadableClosure<PluginSet<IPluggable<IRemarkPlugin, unknown>, RemarkConfigs>> | undefined`

**Default:** `undefined`

Syntax parsing plugins and preset options. See [remark](./plugins/remark.mdx).

```ts
type RemarkOptions = [[], RemarkConfigs];

const remarks: RemarkOptions = [
  [],
  { 'remark-syntax-soft-endline': { disabled: true } },
];
```

## rehypes <span className="field-tag">Optional</span> {#rehypes}

**Type:** `IReadableClosure<PluginSet<IPluggable<IRehypePlugin, unknown>, RehypeConfigs>> | undefined`

**Default:** `undefined`

HAST post-processing plugins and preset options. See [rehype](./plugins/rehype.mdx).

```ts
type RehypeOptions = [[], RehypeConfigs];

const rehypes: RehypeOptions = [
  [],
  { 'rehype-sanitizer': { allowedTags: ['mark'] } },
];
```

> For embedded HTML, also allow the tag during [syntax filtering](./plugins/rehype.mdx#allow-additional-html-tags).

## repairs <span className="field-tag">Optional</span> {#repairs}

**Type:** `IReadableClosure<PluginSet<IPluggable<IRepairPlugin, unknown>, RepairConfigs>> | undefined`

**Default:** `undefined`

Markdown AST post-processing plugins and preset options. The group requires `build.repair`; individual ending repairs also require `build.repairEnding`. See [repair](./plugins/repair.mdx).

```ts
type RepairOptions = [[], RepairConfigs];

const repairs: RepairOptions = [
  [],
  { 'repair-incomplete-image': { strategy: 'discard' } },
];
```

## mappers <span className="field-tag">Optional</span> {#mappers}

**Type:** `IReadableClosure<PluginSet<MapperPluggable, MapperConfigs>> | undefined`

**Default:** `undefined`

Reactive HAST mapping. `Smooth`, `Shad`, and `Scale` are included but disabled until configured. See [mapper](./plugins/mapper.mdx) for declaration and reactive options.

```ts
import { toClosure } from 'stative';

type MapperOptions = [[], MapperConfigs];

const mappers: MapperOptions = [[], { smooth: { enabled: toClosure(true) } }];
```

Nested mapper options are passed to the mapper directly. Built-in reactive options accept readable closures; `toClosure` converts a static value or an external state into one.

## Plugin input forms

`PluginSet<T, C>` — `T[] | C | [T[], C]`

All five plugin inputs accept a list, a keyed configuration object, or both. Within a list, a class plugin can be `PluginClass` or `[PluginClass, options]`; a mapper can be a mapper function or `[Mapper, options]`.

A keyed configuration object is useful as a reactive input:

```ts
import { MutableState } from 'stative';

const repairs = MutableState.of<RepairConfigs>({
  'repair-incomplete-image': { strategy: 'discard' },
});

repairs.next({
  'repair-incomplete-image': { strategy: 'placeholder' },
});
```

You can also pass a static keyed object to `S` as a readable input with `toClosure(config)`. See [Allow additional HTML tags](./plugins/rehype.mdx#allow-additional-html-tags). A configuration by key only adjusts plugins that are already present; use a list to register a new plugin.

## Plugin options.disabled <span className="field-tag">Optional</span> {#plugin-optionsdisabled}

**Type:** `boolean | undefined`

**Default:** `false`

Excludes a plugin without constructing it. Omitted or `false` keeps it enabled. For example, `{ disabled: true }` removes a preset from its configured group.

## Plugin options.priority <span className="field-tag">Optional</span> {#plugin-optionspriority}

**Type:** `PluginPriority | number | undefined`

**Default:** the plugin's own priority

Sets order within a plugin group. Lower numbers run earlier. Equal priorities preserve list order; omitting it keeps the plugin's priority. The enum provides `Highest`, `High`, `Default`, `Low`, and `Lowest`.

> Imports: compiler and renderer types come from `@fluxdown/core`; plugin contracts and `PluginSet` come from `@fluxdown/types`; `IReadableClosure` comes from `stative`. Supported plugins and their preset membership are listed in the respective [plugin guides](./plugins.md).
