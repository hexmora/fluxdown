# Using and writing plugins

Plugins extend one stage of Core's content pipeline. Choose the stage that owns the behavior you want to change:

| Type     | Responsibility                                              | Guide                                         |
| -------- | ----------------------------------------------------------- | --------------------------------------------- |
| `remark` | Parse Markdown syntax.                                      | [Syntax parsing](./plugins/remark.mdx)        |
| `repair` | Post-process the Markdown AST, including incomplete syntax. | [AST processing](./plugins/repair.mdx)        |
| `rehype` | Post-process HAST, the HTML syntax tree.                    | [HAST processing](./plugins/rehype.mdx)       |
| `mapper` | Reactively map HAST content blocks.                         | [Reactive HAST mapping](./plugins/mapper.mdx) |

Core includes common Markdown syntax, repair, HTML handling, and streaming features. Each guide lists supported plugins and marks those included by default. Start by configuring one; write a plugin when you need another behavior.

## Configure a preset

Plugin inputs accept three forms: a plugin list, a configuration object keyed by plugin name, or `[pluginList, configObject]`. In `S`, use the tuple form for a static configuration object:

```ts
type RepairOptions = [[], RepairConfigs];

const repairs: RepairOptions = [
  [],
  { 'repair-incomplete-image': { strategy: 'discard' } },
];
```

Pass `repairs` alongside `text` and `build` when [creating Core](./quick-start.md). This hides unfinished images while keeping the other presets.

You can also configure a plugin by class:

```sh
pnpm add @fluxdown/core-plugins
```

```ts
import type { IPluggable, IRepairPlugin } from '@fluxdown/types';

import { IncompleteImageRepairPlugin } from '@fluxdown/core-plugins/plugins/repair/incomplete-image';

type RepairPlugin = IPluggable<IRepairPlugin, unknown>;

const repairs: RepairPlugin[] = [
  [IncompleteImageRepairPlugin, { strategy: 'discard' }],
];
```

Existing preset classes keep their place in the list and receive the new options. New plugin classes are added. A keyed configuration overrides options from a class tuple when both are present.

> `RemarkConfigs`, `RehypeConfigs`, `RepairConfigs`, and `MapperConfigs` are provided by the preset type declarations loaded with Core. You do not need to import these names separately.

## Disable or reorder a plugin

All four categories accept `disabled` and `priority`:

```ts
type RemarkOptions = [[], RemarkConfigs];

const remarks: RemarkOptions = [
  [],
  { 'remark-syntax-soft-endline': { disabled: true } },
];
```

This keeps ordinary Markdown newlines instead of turning them into hard line breaks. Smaller priority numbers run first within a category; equal values keep declaration order.

## Write a plugin

Remark and rehype plugins adapt unified plugins. Repair plugins visit and update Markdown AST nodes. Mappers use Stative to produce a changing sequence of HAST blocks.

Each guide includes a declaration and shows how to register it:

- [Remark plugins](./plugins/remark.mdx)
- [Repair plugins](./plugins/repair.mdx)
- [Rehype plugins](./plugins/rehype.mdx)
- [Mapper plugins](./plugins/mapper.mdx)

Pass plugin classes or mapper functions; Core manages their lifecycle. Keep per-run data inside the transform or state flow so one declaration can serve multiple documents.

> Import individual plugins from `@fluxdown/core-plugins/plugins/[type]/[subpath]` and preset arrays from `@fluxdown/core-plugins/presets/[type]`. Replace `[type]` with `remark`, `rehype`, `repair`, or `mapper`; each guide lists its plugin subpaths. The package has no root or plugin-category entry point.
