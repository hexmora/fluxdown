---
title: uni-app Markdown Renderer
description: Add Fluxdown to a uni-app x Vapor project. Render Markdown in a .uvue component, connect streaming text, and customize the output with themes and plugins.
---

# uni-app Markdown renderer quick start {#quick-start}

`@fluxdown/uni-app` provides Markdown components for uni-app x Vapor projects. Fluxdown Core handles parsing, syntax repair, and smooth output; `.uvue` components provide the interface.

## Prepare the project

Create a uni-app x project with HBuilderX 5.33 or later and enable Vapor in `manifest.json`:

```json
{
  "uni-app-x": {
    "vapor": true,
    "styleIsolationVersion": "2",
    "vapor-default-script-lang": "ts"
  }
}
```

App uses Vapor rendering. Web uses the official uni-app x Vue rendering path. See [AppVapor](https://doc.dcloud.net.cn/uni-app-x/app-vapor.html) for runtime and platform requirements.

Install the component and build dependencies in your project:

```bash
pnpm add @fluxdown/uni-app
pnpm add -D @babel/core@^7.29.7 @babel/plugin-transform-unicode-property-regex@^7.29.7 @rollup/plugin-commonjs
```

### Build configuration

Add `vite.config.js` at the project root. `commonjs` handles CommonJS parser dependencies in App builds, while H5 uses the uni-app compiler's existing transform; the Unicode regex transform makes those dependencies work with the App JavaScript engine. If you already have a configuration, merge both steps into its `plugins` array.

```js title="vite.config.js"
import { transformSync } from '@babel/core';
import unicodeProperty from '@babel/plugin-transform-unicode-property-regex';
import uni from '@dcloudio/vite-plugin-uni';
import commonjs from '@rollup/plugin-commonjs';

export default {
  plugins: [
    uni.default(),
    ...(process.env.UNI_PLATFORM === 'h5' ? [] : [commonjs()]),
    {
      name: 'unicode-properties',
      enforce: 'pre',
      transform(code, id) {
        if (!id.endsWith('.js') || !code.includes('\\p{')) {
          return null;
        }

        return transformSync(code, {
          configFile: false,
          babelrc: false,
          plugins: [unicodeProperty],
          sourceMaps: true,
          filename: id,
        });
      },
    },
  ],
};
```

> `@dcloudio/vite-plugin-uni` is supplied by the uni-app toolchain. Its version must match the project's uni-app compiler.

## Display Markdown

```vue title="pages/index/index.uvue"
<script setup lang="ts">
import { Fluxdown } from '@fluxdown/uni-app';

const text = '# Hello Fluxdown\n\nMarkdown for **uni-app**.';
</script>

<template>
  <Fluxdown :text="text" />
</template>
```

Styles compile with the `.uvue` components. Use `theme` to adjust colors, typography, and spacing; see the [styling guide](./customization.md).

## Receive streaming content

Pass all text received so far as `text`. Enable `streaming` during generation, then set it to `false` when the request finishes, is cancelled, or fails:

```vue title="components/message/main.uvue"
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

Export components by name from their directory entry, then import the directory:

```ts title="components/message/index.ts"
export { default as Message } from './main.uvue';
```

```ts
import { Message } from './components/message';
```

`streaming` enables trailing syntax repair, smooth output, and the `scale` effect. Use `{ smooth: false, effect: 'chunk' }` to preserve network chunk boundaries. See [streaming content](./streaming.md) for more examples.

## Choose a component

| Component      | Import                                          | Default capabilities                                                             |
| -------------- | ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `Fluxdown`     | `@fluxdown/uni-app` or `@fluxdown/uni-app/full` | Basic Markdown, Prism highlighting, MathJax formulas, CJK, and emoji shortcodes. |
| `FluxdownLite` | `@fluxdown/uni-app/lite`                        | Basic Markdown and streaming effects, with plain code blocks.                    |
| `FluxdownRaw`  | `@fluxdown/uni-app/raw`                         | Requires `plugins`; assemble the rendering capabilities yourself.                |

See the [plugin matrix](./plugins/matrix.mdx) for the complete list and [configuration](./configuration.md) for every prop.

Use the [side-by-side demo](../common/features/renderers.mdx) to compare static and streaming output across renderers, or choose uni-app in the [Playground](/playground) to try your own content.
