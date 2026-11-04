---
title: Uni App Markdown Renderer
description: Add Fluxdown to a Uni App x Vapor project. Render Markdown in a .uvue component, connect streaming text, and customize the output with themes and plugins.
---

# Uni App Markdown renderer quick start {#quick-start}

`@fluxdown/uni-app` provides Markdown components for Uni App x Vapor projects. Fluxdown Core handles parsing, syntax repair, and smooth output; `.uvue` components provide the interface.

## Prepare the project

Create a Uni App x project with HBuilderX 5.33 or later and enable Vapor in `manifest.json`:

```json
{
  "uni-app-x": {
    "vapor": true,
    "styleIsolationVersion": "2",
    "vapor-default-script-lang": "ts"
  }
}
```

App uses Vapor rendering. Web uses the official Uni App x Vue rendering path. See [AppVapor](https://doc.dcloud.net.cn/uni-app-x/app-vapor.html) for runtime and platform requirements.

When using pnpm on Linux, add this to `pnpm-workspace.yaml` before installing so the Uni App compiler's GNU native dependency is installed:

```yaml title="pnpm-workspace.yaml"
supportedArchitectures:
  libc:
    - current
    - gnu
```

Install the component and build dependencies in your project:

```bash
pnpm add @fluxdown/uni-app
pnpm add -D @babel/core@^7.29.7 @babel/plugin-transform-unicode-property-regex@^7.29.7 @rollup/plugin-commonjs
```

### Build configuration

Add `vite.config.js` at the project root. `commonjs` handles CommonJS parser dependencies in App builds, while H5 uses the Uni App compiler's existing transform; the Unicode regex transform makes those dependencies work with the App JavaScript engine.

`inlineDynamicImports` bundles lazy modules into one file for App builds, with the incompatible `manualChunks` option disabled. If you already have a configuration, merge these steps into its `plugins` array.

```js title="vite.config.js"
import { transformSync } from '@babel/core';
import unicodeProperty from '@babel/plugin-transform-unicode-property-regex';
import uni from '@dcloudio/vite-plugin-uni';
import commonjs from '@rollup/plugin-commonjs';

const staticRegExp = ({ types }) => ({
  visitor: {
    NewExpression(path) {
      if (
        !path.get('callee').isIdentifier({ name: 'RegExp' }) ||
        path.scope.getBinding('RegExp')
      ) {
        return;
      }

      const [pattern, flags] = path
        .get('arguments')
        .map((argument) => argument.evaluate());

      if (!pattern?.confident || !flags?.confident) {
        return;
      }

      if (
        typeof pattern.value === 'string' &&
        typeof flags.value === 'string' &&
        /\\[pP]\{/.test(pattern.value)
      ) {
        path.replaceWith(types.regExpLiteral(pattern.value, flags.value));
      }
    },
  },
});

export default {
  plugins: [
    {
      name: 'inline-dynamic-imports',
      outputOptions(options) {
        return {
          ...options,
          manualChunks: undefined,
          inlineDynamicImports: true,
        };
      },
    },
    uni.default(),
    ...(process.env.UNI_PLATFORM === 'h5' ? [] : [commonjs()]),
    {
      name: 'unicode-properties',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.js') || !/\\[pP]\{/.test(code)) {
          return null;
        }

        return transformSync(code, {
          configFile: false,
          babelrc: false,
          plugins: [staticRegExp, unicodeProperty],
          sourceMaps: true,
          filename: id,
        });
      },
    },
  ],
};
```

> `@dcloudio/vite-plugin-uni` is supplied by the Uni App toolchain. Its version must match the project's Uni App compiler.

## Display Markdown

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

const text = '# Hello Fluxdown\n\nMarkdown for **Uni App**.';
</script>

<template>
  <Fluxdown :text="text" />
</template>
```

Styles compile with the `.uvue` components. Use `theme` to adjust colors, typography, and spacing; see the [styling guide](./customization.md).

## Receive streaming content

Pass all text received so far as `text`. Enable `streaming` during generation, then set it to `false` when the request finishes, is cancelled, or fails:

```vue
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

type MessageProps = {
  text: string;
  pending: boolean;
};

const props = defineProps<MessageProps>();
</script>

<template>
  <Fluxdown :text="props.text" :streaming="props.pending" />
</template>
```

`streaming` enables trailing syntax repair, smooth output, and the `scale` effect. Use `{ smooth: false, effect: 'chunk' }` to preserve network chunk boundaries. See [streaming content](./streaming.md) for more examples.

## Choose a component

| Component      | Import                                          | Default capabilities                                                     |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| `Fluxdown`     | `@fluxdown/uni-app` or `@fluxdown/uni-app/full` | Basic Markdown, highlighting, math, diagrams, CJK, and emoji shortcodes. |
| `FluxdownLite` | `@fluxdown/uni-app/lite`                        | Basic Markdown and streaming effects, with plain code blocks.            |
| `FluxdownRaw`  | `@fluxdown/uni-app/raw`                         | Requires `plugins`; assemble the rendering capabilities yourself.        |

See the [plugin matrix](./plugins/matrix.mdx) for the complete list and [configuration](./configuration.md) for every prop.

Use the [side-by-side demo](../common/features/renderers.mdx) to compare static and streaming output across renderers, or choose Uni App in the [Playground](/playground) to try your own content.
