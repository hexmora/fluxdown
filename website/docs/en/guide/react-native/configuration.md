# Configuration

This page lists the public native `Fluxdown` props. Only `text` is required. Import `BaseBuildConfig`, `StreamingConfig`, `Theme`, `MarkdownStyles`, `IPluginItem`, and `FluxdownRef` from `@fluxdown/react-native` when you need their types.

Markdown compilation and plugin configuration are shared with React. The native wrapper adds its root `View`, native theme, styles, and text selection.

## text <span className="field-tag">Required</span> {#text}

**Type:** `string`

The complete Markdown received so far. Append incoming chunks in your app and pass the accumulated string.

```tsx
<Fluxdown text="# Hello, Fluxdown" />
```

## streaming <span className="field-tag">Optional</span> {#streaming}

**Type:** `boolean | StreamingConfig`

**Default:** `false`

`true` enables trailing syntax repair, smooth output, and the default `scale` effect. `false` ends those effects and reveals all received content. Pass an object to control them separately; omitted repair and smoothing fields remain enabled, and an omitted effect uses `scale`.

```tsx
<Fluxdown
  streaming={{
    repairEnding: true,
    smooth: true,
    effect: ['scale', ['suffix', { type: 'dot' }]],
  }}
  text={text}
/>
```

| Field          | Type                      | Behavior                                                             |
| -------------- | ------------------------- | -------------------------------------------------------------------- |
| `repairEnding` | `boolean`                 | Repair unfinished syntax at the streaming tail.                      |
| `smooth`       | `boolean \| SmoothConfig` | Reveal new content gradually using the shared ticker and scheduler.  |
| `effect`       | `StreamingEffect`         | Choose, configure, or combine visual effects. `false` disables them. |

The effect contract matches React: `shad`, `scale`, `chunk`, `suffix`, named configuration tuples, custom mapper classes, and combinations. See [native streaming and the live comparison](./streaming.mdx) for examples and platform behavior, and [shared smooth options](../react/configuration.md#streamingsmooth) for `enabled`, `ticker`, and `scheduler`.

Set `streaming` to `false` when the request finishes, even if the final chunk has already arrived.

## build <span className="field-tag">Optional</span> {#build}

**Type:** `BaseBuildConfig`

**Default:** `{}`

The syntax options and defaults match [React's build configuration](../react/configuration.md#build). Tables, task lists, strikethrough, autolinks, and plain line breaks work by default. Formula, footnote, indented code, and setext heading syntax are opt-in.

```tsx
<Fluxdown build={{ tex: true, footnote: true }} text={text} />
```

With `tex: true`, Full renders formulas through MathJax and native SVG; Lite shows LaTeX source. See [Reduce bundle size](./bundle-size.md) for selecting a preset. They keep readable source text while loading or if conversion fails. SVG formulas do not support native text selection.

HTML still passes through Core's tag filtering and sanitization before supported nodes become native views or text. HTML `class` and CSS styles do not style those views. Enabling footnotes creates their content and IDs; fragment navigation needs a custom native Link slot.

## theme <span className="field-tag">Optional</span> {#theme}

**Type:** `Theme`

**Default:** `'light'`

- `'light'` or `'dark'`: use a built-in theme.
- `PartialThemeConfig`: override selected fields in the light theme.
- `['light' | 'dark', PartialThemeConfig]`: extend the selected preset.

Native theme fields are `colors`, `syntax`, and optional `styles`:

```tsx
<Fluxdown
  theme={[
    'dark',
    { colors: { link: '#82d8cf' }, syntax: { keyword: '#c4a7ff' } },
  ]}
  text={text}
/>
```

See the [styling guide](./customization.md) for fields and merge behavior. The component does not automatically follow the system theme.

## styles <span className="field-tag">Optional</span> {#styles}

**Type:** `MarkdownStyles`

**Default:** `undefined`

Native styles for Markdown elements, such as `text`, `paragraph`, `heading1`, `link`, and `codeBlock`. Each entry takes precedence over the same entry in `theme.styles`. The built-in renderer's base styles remain in place.

```tsx
<Fluxdown
  styles={{ paragraph: { lineHeight: 28 }, codeBlock: { borderRadius: 8 } }}
  text={text}
/>
```

## selectable <span className="field-tag">Optional</span> {#selectable}

**Type:** `boolean`

**Default:** `false`

Enable selection on the built-in selectable text elements. Selection follows native text behavior; it is not one continuous selectable document, and SVG equations are not selectable text.

## plugins <span className="field-tag">Optional</span> {#plugins}

**Type:** `IPluginItem | IPluginItem[]`

**Default:** `[]` for Full and Lite; required for Raw.

Add a plugin pack or combine packs in an array. The shared lists are `slots`, `renders`, `remarks`, `rehypes`, `repairs`, and `mappers`; `config` configures plugins in the same pack. See [Using and writing plugins](./plugins.md) for native slot types and import paths.

## patches <span className="field-tag">Optional</span> {#patches}

**Type:** `IPatchItem<ReactNode>[]`

**Default:** `[]`

Replace source ranges or insert content at a source position, using the same [patch contract as React](../react/configuration.md#patches). Inline replacements must be valid inside native `Text`:

```tsx
import { Fluxdown } from '@fluxdown/react-native';
import { Text } from 'react-native';

export function Mention() {
  return (
    <Fluxdown
      patches={[
        {
          key: 'person-ada',
          range: [7, 11],
          render: () => <Text style={{ color: '#567153' }}>@Ada</Text>,
        },
      ]}
      text="Hello, @Ada."
    />
  );
}
```

Indices refer to the original source string. A tuple replaces its start-inclusive, end-exclusive range; a number inserts at that position. Keep ranges within one content block and avoid overlaps. Do not return DOM tags or a block `View` from an inline patch.

## style and View props <span className="field-tag">Optional</span> {#style}

**Type:** React Native `ViewProps`, excluding `children`

`style`, `testID`, `nativeID`, accessibility props, `onLayout`, and other View props go to the root `View`. Its background comes from the theme; explicit `style` values take precedence.

```tsx
<Fluxdown
  accessibilityLabel="Assistant message"
  style={{ padding: 16 }}
  testID="assistant-message"
  text={text}
/>
```

Use `styles` for Markdown typography. Content comes from `text`, not `children`. The component does not create a vertical scroll container or expose a Web `className` prop.

## ref <span className="field-tag">Optional</span> {#ref}

**Type:** `Ref<FluxdownRef>`

**Default:** `undefined`

The same reactive rendered-output handle as React: `IReadableClosure<ReactNode[]>`. It is not a native `View` or `ScrollView` ref. Keep a ref on your app's scroll container when you need to scroll.

Ordinary rendering does not need a `ref`. Fluxdown manages the handle's lifetime; unsubscribe from subscriptions you create.
