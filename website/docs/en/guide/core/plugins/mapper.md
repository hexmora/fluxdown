# Mapper plugins

Mappers receive reactive HAST content blocks and return another reactive block list. Unlike a one-time tree transform, a mapper can keep updating the output between incoming text chunks. Smooth output is one example.

## Declare a mapper

This mapper limits a preview to its first few blocks:

```ts
import type { MapperInputs, MapperPluggable } from '@fluxdown/core';

import { once, useMap } from 'stative';

type PreviewOptions = { count: number };
type PreviewInputs = MapperInputs<PreviewOptions>;

const Preview = once(function Preview({ source, count }: PreviewInputs) {
  return useMap(source, (blocks) => blocks.slice(0, count));
});

const mappers: MapperPluggable<PreviewOptions>[] = [[Preview, { count: 3 }]];
```

Add `mappers` to the Core inputs from the [quick start](../quick-start.md). The returned list follows source changes, and its blocks retain their individual content subscriptions. `count` is a plain constructor option for this mapper.

`once` builds the state flow once; `useMap` describes how it changes. A mapper may return a readable closure or a Stative descriptor.

> Do not destroy or mutate upstream blocks. If you create derived blocks or subscriptions, register them with Stative's lifecycle so they are released with the mapper.

## Configure smooth output

The preset `Smooth` accepts reactive options. Convert an external state to a readable closure before placing it inside the plugin options:

```ts
import type { MapperPluggable } from '@fluxdown/core';
import type { SmoothBaseInputs } from '@fluxdown/core-presets/mapper';

import { Smooth } from '@fluxdown/core-presets/mapper';
import { MutableState, toClosure } from 'stative';

const enabled = MutableState.of(true);
const active = toClosure(enabled);

const mappers: MapperPluggable<SmoothBaseInputs>[] = [
  [Smooth, { enabled: active }],
];
```

After passing `mappers` to Core, call `enabled.next(false)` to show the remaining content immediately. At the end of the content lifecycle, destroy Core, then `active` and `enabled`.

## Built-in plugins

Core includes these plugins by default; no registration is needed.

`PRESET_MAPPER_PLUGINS`, exported from `@fluxdown/core-presets/mapper`.

| Plugin   | Purpose                                                                       |
| -------- | ----------------------------------------------------------------------------- |
| `Smooth` | Releases new content over time so incoming bursts appear smoothly.            |
| `Shad`   | Marks newly visible trailing text for a fade effect supplied by the renderer. |

Both are disabled by default in Core. To enable them in your renderer, see [Enable smooth output](../streaming.md#enable-smooth-output).
