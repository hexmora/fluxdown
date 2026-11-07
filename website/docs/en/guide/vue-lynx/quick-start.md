---
title: Quick start - Fluxdown Vue Lynx
description: Add Fluxdown to a Vue Lynx project, render Markdown with native Lynx elements, and connect streaming text.
---

# Quick start - Fluxdown Vue Lynx {#quick-start}

Fluxdown for Vue Lynx renders Markdown as Lynx `text`, `view` and other elements. It uses the same Core pipeline and native styles as React Lynx, with Vue components, reactive props and replaceable slots.

## Install

Add the package to an existing [Vue Lynx](https://vue.lynxjs.org/) project:

```sh
pnpm add @fluxdown/vue-lynx vue-lynx@0.5.1
```

Full code highlighting on Android requires Lynx 3.8 or later with background-thread WebAssembly support. See [code highlighting](./plugins/matrix.mdx#code-highlighting) for its asynchronous initialization and bundled WASM behavior.

Use Vue Lynx 0.5's supported Rsbuild 1 toolchain (`@lynx-js/rspeedy` 0.13.x and `@rsbuild/plugin-vue` 1.x), as provided by the Vue Lynx starter. Add these options to your existing `lynx.config.ts`:

```ts
import type { Rspack } from '@lynx-js/rspeedy';

import { defineConfig } from '@lynx-js/rspeedy';
import { createRequire } from 'node:module';
import { pluginVueLynx } from 'vue-lynx/plugin';

const require = createRequire(import.meta.url);

const runtime = require.resolve('vue-lynx');

type Loader = {
  loader: string;

  options?: Record<string, unknown>;
};

const getLoaders = (rule: Rspack.RuleSetRule): Loader[] => {
  const uses = Array.isArray(rule.use) ? rule.use : [rule.use];

  return uses.filter(
    (use): use is Loader => Boolean(use) && typeof use === 'object',
  );
};

const normalizeTargets = (
  rules: NonNullable<Rspack.RuleSetRule['rules']>,
): void => {
  for (const rule of rules) {
    if (!rule) continue;

    for (const use of getLoaders(rule)) {
      if (!use.loader.includes('swc-loader')) continue;

      const options = use.options as
        | { env?: unknown; jsc?: { target?: string } }
        | undefined;

      if (options?.env) {
        if (options.jsc) delete options.jsc.target;
      } else if (options?.jsc) {
        options.jsc.target = 'es2017';
      }
    }

    normalizeTargets(rule.oneOf ?? []);

    normalizeTargets(rule.rules ?? []);
  }
};

export default defineConfig({
  resolve: {
    alias: {
      vue$: runtime,
      'vue-lynx$': runtime,
    },
  },
  plugins: [
    pluginVueLynx({
      autoPixelUnit: false,
      enableCSSInheritance: false,
      enableCSSInlineVariables: false,
      includeWorkletPackages: [
        '@fluxdown/vue-lynx',
        '@fluxdown/vue-lynx-plugins',
      ],
    }),
  ],
  tools: {
    rspack(config) {
      normalizeTargets(
        (config.module?.rules ?? []).filter(
          (rule): rule is Rspack.RuleSetRule =>
            Boolean(rule) && typeof rule === 'object',
        ),
      );
    },
  },
});
```

Both aliases keep components and animations on the same Vue Lynx runtime.

The package allowlist lets the app compiler extract animation worklets from installed Fluxdown packages. `autoPixelUnit: false` preserves native dimensions; both CSS options stay `false` to match React Lynx, including when your starter enabled them. Component imports include the required styles.

The Rspack callback preserves Rspeedy's host transforms instead of Vue Lynx's conflicting target. This includes lowering Unicode property escapes for Android QuickJS. Older toolchains without `env` use ES2017. Keep this adjustment in `tools.rspack` so it runs after Vue Lynx has configured its loaders.

## Render your first message

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/vue-lynx';

const markdown = `# Hello, Fluxdown

Keep content **easy to read**, even while it is arriving.`;
</script>

<template>
  <scroll-view scroll-orientation="vertical" style="height: 100%">
    <Fluxdown :style="{ padding: '20px' }" :text="markdown" />
  </scroll-view>
</template>
```

The component lays out the content; the surrounding page handles scrolling. Native link navigation, image taps and code copying connect through [slot plugins](./plugins/slot.md).

## Connect streaming text

```vue
<Fluxdown :streaming="isStreaming" :text="text" />
```

Pass the complete text received so far as `text`. Set `streaming` to `false` when the request ends.

## Next steps

- [Streaming content](./streaming.md): smoothing and all four effects.
- [Configuration](./configuration.md): differences from the Vue renderer.
- [Styling](./customization.md): native colors, typography and spacing.
- [Plugin matrix](./plugins/matrix.mdx): Full, Lite and Raw entry points.
- [Side-by-side demo](../common/features/renderers.mdx): compare React Lynx and Vue Lynx with the other renderers.
