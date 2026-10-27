# 自定义配置

基本用法与 [React](../react/configuration.md) 相同。表中链接指向共用参数的完整说明，下方补充 Svelte 的样式、补丁与组件引用用法。

| 属性                                               | 类型                           | 默认值与用途                                                      |
| -------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | 必填，当前完整 Markdown。                                         |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`，控制末尾修复、平滑输出和效果。                           |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`，选择公式、脚注等解析能力。                                  |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`，主题预设或局部覆盖，见[样式指南](./customization.md)。 |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`，扩展 Svelte 预设；Raw 入口必填。                            |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<SvelteNode>[]`     | `[]`，用 Svelte 内容替换或插入指定文本。                          |
| [`class`](#class)                                  | `string`                       | `undefined`，最外层元素的类名。                                   |
| [`style`](#style)                                  | `string`                       | `undefined`，最外层元素的 CSS 样式字符串。                        |
| [`getProps`](#getprops)                            | `GetPropsFunction \| null`     | `undefined`，默认转换语法树上的元素属性。                         |
| [`bind:this`](#bindthis)                           | 组件实例                       | `undefined`，挂载后通过 `getCore()` 读取响应式渲染结果。          |

<details>
<summary>导入方式</summary>

`BaseBuildConfig`、`StreamingConfig` 和 `Theme` 从 `@fluxdown/svelte` 导入；`IPluginItem` 和 `GetPropsFunction` 从 `@fluxdown/svelte-plugins/typings` 导入；`SvelteNode` 从 `@fluxdown/svelte-plugins/base` 导入；`IPatchItem` 从 `@fluxdown/core` 导入。

</details>

## patches <span className="field-tag">可选</span> {#patches}

**类型：** `IPatchItem<SvelteNode>[]`

**默认值：** `[]`

补丁的 `render` 返回 `SvelteNode`。使用 `createElement` 把自己的 Svelte 组件放到文本中：

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
  import { createElement } from '@fluxdown/svelte-plugins/base';

  import { UserMention } from './user-mention';

  const patches = [
    {
      key: 'person-ada',
      range: [3, 7] as [number, number],
      render: () => createElement(UserMention, { name: 'Ada' }),
    },
  ];
</script>

<Fluxdown {patches} text="欢迎，@Ada。" />
```

> `createElement` 从 `@fluxdown/svelte-plugins/base` 导入。`UserMention` 是应用从 `user-mention` 目录导出的组件，通过 `name` 属性接收用户名。

位置按原始字符串索引计算；区间包含起点、不包含终点，并且应位于同一个内容块内。

## class <span className="field-tag">可选</span> {#class}

**类型：** `string`

**默认值：** `undefined`

最外层元素的类名，用于接入应用样式。Svelte 的组件样式默认有作用域，通过类名设置容器样式时需使用 `:global`，见[样式指南](./customization.md#页面布局)。

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

不传 `getProps` 时，组件会转换语法树上的属性。传入函数可以替换这个过程；传 `null` 则不从语法树转发元素属性。字体、间距与交互优先通过[主题](./customization.md)和 [Slot 插件](./plugins/slot.md)调整。

```svelte
<Fluxdown getProps={null} {text} />
```

## bind:this <span className="field-tag">可选</span> {#bindthis}

**类型：** `ReturnType<typeof Fluxdown> | undefined`

**默认值：** `undefined`

通过 `bind:this` 获取组件，再调用 `getCore()` 读取响应式渲染结果。通常展示内容无需使用它；自己建立的订阅需要取消。

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
