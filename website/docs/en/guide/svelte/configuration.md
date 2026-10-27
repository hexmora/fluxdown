# Configuration

Basic usage follows [React](../react/configuration.md). The table links to the full reference for shared props; Svelte-specific styles, patches and component references are covered below.

| Prop                                               | Type                           | Default and purpose                                                                    |
| -------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| [`text`](../react/configuration.md#text)           | `string`                       | Required. The complete current Markdown.                                               |
| [`streaming`](../react/configuration.md#streaming) | `boolean \| StreamingConfig`   | `false`. Ending repair, smoothing, and effects.                                        |
| [`build`](../react/configuration.md#build)         | `BaseBuildConfig`              | `{}`. Parsing features such as math and footnotes.                                     |
| [`theme`](../react/configuration.md#theme)         | `Theme`                        | `'light'`. A preset or partial overrides; see the [styling guide](./customization.md). |
| [`plugins`](../react/configuration.md#plugins)     | `IPluginItem \| IPluginItem[]` | `[]`. Extends the Svelte preset; required for Raw.                                     |
| [`patches`](../react/configuration.md#patches)     | `IPatchItem<SvelteNode>[]`     | `[]`. Inserts or replaces text with Svelte content.                                    |
| [`class`](#class)                                  | `string`                       | `undefined`. Class name on the outer element.                                          |
| [`style`](#style)                                  | `string`                       | `undefined`. CSS style string on the outer element.                                    |
| [`getProps`](#getprops)                            | `GetPropsFunction \| null`     | `undefined`. Converts syntax-tree element properties by default.                       |
| [`bind:this`](#bindthis)                           | Component instance             | `undefined`. Call `getCore()` after mounting to read the reactive render output.       |

<details>
<summary>Imports</summary>

Import `BaseBuildConfig`, `StreamingConfig` and `Theme` from `@fluxdown/svelte`; `IPluginItem` and `GetPropsFunction` from `@fluxdown/svelte-plugins/typings`; `SvelteNode` from `@fluxdown/svelte-plugins/base`; and `IPatchItem` from `@fluxdown/core`.

</details>

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<SvelteNode>[]`

**Default:** `[]`

A patch's `render` returns a `SvelteNode`. Use `createElement` to place your own Svelte component in the text:

```svelte
<script lang="ts">
  import { Fluxdown } from '@fluxdown/svelte';
  import { createElement } from '@fluxdown/svelte-plugins/base';

  import { UserMention } from './user-mention';

  const patches = [
    {
      key: 'person-ada',
      range: [6, 10] as [number, number],
      render: () => createElement(UserMention, { name: 'Ada' }),
    },
  ];
</script>

<Fluxdown {patches} text="Hello @Ada." />
```

> Import `createElement` from `@fluxdown/svelte-plugins/base`. `UserMention` is the component exported by your app's `user-mention` directory, receiving the user name through its `name` prop.

Positions use indices into the original string. A range includes its start, excludes its end and should stay within one content block.

## class <span className="field-tag">Optional</span> {#class}

**Type:** `string`

**Default:** `undefined`

A class name on the outer element for applying styles from your app. Svelte scopes component styles by default; use `:global` when styling this container through its class. See [page layout](./customization.md#page-layout).

## style <span className="field-tag">Optional</span> {#style}

**Type:** `string`

**Default:** `undefined`

A CSS style string on the outer element, commonly used for width, layout and spacing from its parent:

```svelte
<Fluxdown
  class="conversation-message"
  style="padding: 16px; max-width: 720px"
  {text}
/>
```

See the [styling guide](./customization.md) for colors and typography within the content, and [slot plugins](./plugins/slot.md) to change components or interactions.

## getProps <span className="field-tag">Optional</span> {#getprops}

**Type:** `GetPropsFunction | null`

**Default:** `undefined`

By default, the component converts properties from the syntax tree. Pass a `getProps` function to replace that conversion, or `null` to forward no properties. Prefer [themes](./customization.md) and [slot plugins](./plugins/slot.md) for typography, spacing and interactions.

```svelte
<Fluxdown getProps={null} {text} />
```

## bind:this <span className="field-tag">Optional</span> {#bindthis}

**Type:** `ReturnType<typeof Fluxdown> | undefined`

**Default:** `undefined`

Obtain the component through `bind:this`, then call `getCore()` for its reactive rendered result. Normal rendering does not require this. Cancel any subscriptions you create yourself.

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
<button onclick={inspect}>Inspect rendered result</button>
```

The `bind:this` value is available after mounting. Read it in an event handler or effect.
