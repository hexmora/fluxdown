# Configuration

Use component props to configure content, streaming, styles, and plugins.

| Prop        | Type                           | Default and purpose                                          |
| ----------- | ------------------------------ | ------------------------------------------------------------ |
| `text`      | `string`                       | Required. The complete Markdown received so far.             |
| `streaming` | `boolean \| StreamingConfig`   | `false`. Ending repair, smoothing, and effects.              |
| `build`     | `BaseBuildConfig`              | `{}`. Parsing features such as math and footnotes.           |
| `theme`     | `Theme`                        | `'light'`. Native preset or partial overrides.               |
| `style`     | `StyleProp<ViewStyle>`         | Styles for the outer `View`, including arrays.               |
| `plugins`   | `IPluginItem \| IPluginItem[]` | Extend the preset. Required for Raw.                         |
| `patches`   | `IPatchItem<ReactNode>[]`      | Insert or replace text with native React content.            |
| `ref`       | `Ref<FluxdownRef>`             | Reactive render output, rather than a native View reference. |

> Import `BaseBuildConfig`, `StreamingConfig`, and `FluxdownRef` from `@fluxdown/react-native`, `Theme` from `@fluxdown/react-native-plugins/typings`, and `IPluginItem` from `@fluxdown/react-base-plugins/typings`.

## Build and streaming options

`build`, `streaming`, `patches`, and `ref` are shared across both platforms. See [React configuration](../react/configuration.md) for their fields, defaults, and examples, and the [plugin matrix](./plugins/matrix.mdx) for built-in features.

## Styling and interaction

Use `style` for layout and the [theme](./customization.md) for internal typography and spacing. Slots handle links, images, and task state.

Return native components from patches:

```tsx
import { Text } from 'react-native';

<Fluxdown
  patches={[
    {
      key: 'person-ada',
      range: [6, 10],
      render: () => <Text onPress={() => openProfile('ada')}>@Ada</Text>,
    },
  ]}
  text="Hello @Ada."
/>;
```
