# Slot 插件

Slot 插件负责渲染插槽。代码块、链接、标题等内容已经准备好，你只需要决定它们的组件和交互。

## 声明与使用

下面隐藏代码块工具栏，保留默认高亮和代码样式。先写一个普通 Svelte 组件：

```svelte title="compact-code-block/main.svelte"
<script lang="ts">
  import type { CodeBlockProps } from '@fluxdown/svelte-plugins/base';

  let { Raw, ...props }: CodeBlockProps = $props();
</script>

{#if Raw}
  {@render Raw({ ...props, showHeader: false })}
{/if}
```

通过目录入口导出组件，再将它注册为 `CodeBlock` 插槽的插件：

```ts title="compact-code-block/index.ts"
export { default as CompactCodeBlock } from './main.svelte';
```

```ts title="plugins.ts"
import { BaseSlotPlugin } from '@fluxdown/svelte-plugins/base';

import { CompactCodeBlock } from './compact-code-block';

export class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}
```

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';

  import { CompactCodeBlockPlugin } from './plugins';

  type MessageProps = {
    text: string;
  };

  let { text }: MessageProps = $props();
</script>

<Fluxdown plugins={{ slots: [CompactCodeBlockPlugin] }} {text} />
```

`key` 标识插件，`type` 选择插槽，`Component` 指向 Svelte 组件。Fluxdown 管理插件的创建和清理。

> 插件基类和属性类型从 `@fluxdown/svelte-plugins/base` 导入。先安装 `@fluxdown/svelte-plugins`。

## 保留默认功能

`Raw` 是前一个插件提供的渲染 snippet。通过 `{@render Raw(props)}` 保留已有的高亮或排版，修改传入属性即可调整其中一部分。

相同优先级下，同一插槽后面的插件通过 `Raw` 包裹前面的组件。完全替换时，直接编写自己的 Svelte 模板；有子内容的插槽通过 `{@render children?.()}` 渲染它。

> `Raw` 可能为 `null`，调用前需要检查。`Raw` 和 `children` 都是 Svelte 的 snippet。

## 添加交互

例如记录链接点击，同时保留之前的点击回调：

```svelte title="tracked-link/main.svelte"
<script lang="ts">
  import type { LinkProps } from '@fluxdown/svelte-plugins/base';

  import { trackLink } from '../analytics';

  let { Raw, ...props }: LinkProps = $props();

  const handleClick: NonNullable<LinkProps['onclick']> = (event) => {
    trackLink(props.href);

    props.onclick?.(event);
  };
</script>

{#if Raw}
  {@render Raw({ ...props, onclick: handleClick })}
{/if}
```

```ts title="tracked-link/index.ts"
export { default as TrackedLink } from './main.svelte';
```

将 `TrackedLink` 赋给一个 `BaseSlotPlugin<'Link'>` 子类的 `Component`，再加入 `plugins.slots`。这里的 `trackLink` 由应用提供。
