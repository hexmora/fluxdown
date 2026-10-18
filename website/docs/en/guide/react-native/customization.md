# Styling guide

Use a theme for colors and highlighting, `styles` for Markdown typography and spacing, and `style` for the outer container. For components and interactions, use [slot plugins](./plugins.md).

## Follow your app's theme

```tsx
import { Fluxdown } from '@fluxdown/react-native';

type ArticleProps = {
  text: string;

  dark: boolean;
};

export function Article({ text, dark }: ArticleProps) {
  return <Fluxdown text={text} theme={dark ? 'dark' : 'light'} />;
}
```

> The default theme is `light`. Fluxdown does not automatically follow the system theme; pass in your app's existing theme state.

## Adjust typography and color

Start from a preset and override only the fields you need:

```tsx
import type { MarkdownStyles, Theme } from '@fluxdown/react-native';

import { Fluxdown } from '@fluxdown/react-native';
import { StyleSheet } from 'react-native';

const theme: Theme = [
  'light',
  { colors: { link: '#567153' }, syntax: { keyword: '#8855aa' } },
];

const styles = StyleSheet.create({
  text: { fontSize: 17, lineHeight: 28 },
  heading1: { fontSize: 30, lineHeight: 38 },
  paragraph: { marginBottom: 18 },
}) satisfies MarkdownStyles;

export function Article({ text }: { text: string }) {
  return (
    <Fluxdown
      style={{ padding: 16 }}
      styles={styles}
      text={text}
      theme={theme}
    />
  );
}
```

Theme objects contain `colors`, `syntax`, and optional `styles`. A plain object extends `light`; use `['dark', overrides]` to extend the dark preset. Native themes do not use the Web `tokens` shape.

Use React Native style values: numeric dimensions, supported color values, and fonts available in your app. Each `MarkdownStyles` field accepts a style object, a `StyleSheet` entry, or an array of styles.

## Style fields

Import `MarkdownStyles` from `@fluxdown/react-native` for the complete type.

| Fields                                        | Native style type | What you can adjust                                |
| --------------------------------------------- | ----------------- | -------------------------------------------------- |
| `text`                                        | `TextStyle`       | Common text styles used by the built-in renderers. |
| `paragraph`, `heading1`–`heading6`            | `TextStyle`       | Paragraph and heading typography and spacing.      |
| `strong`, `emphasis`, `link`                  | `TextStyle`       | Inline emphasis and link appearance.               |
| `listMarker`, `code`, `inlineCode`, `tex`     | `TextStyle`       | List markers, code, and formula presentation.      |
| `image`                                       | `ImageStyle`      | Image dimensions and appearance.                   |
| `list`, `listItem`, `blockquote`, `breakLine` | `ViewStyle`       | Block layout, spacing, and dividers.               |
| `table`, `tableRow`, `tableCell`              | `ViewStyle`       | Table containers, rows, and cells.                 |
| `codeBlock`, `codeHeader`                     | `ViewStyle`       | Code container and toolbar layout.                 |

`styles.text` is applied by built-in text renderers; it is not a CSS inheritance rule for every descendant. Use the element-specific fields where needed. SVG formulas use `theme.colors.text` for their color and have their own measured dimensions; replace the `Tex` slot for a different formula layout.

## Theme fields

All color and syntax fields accept partial overrides. Unspecified fields inherit from the selected preset.

| Group    | Fields                                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `colors` | `text`, `muted`, `background`, `border`, `borderEmphasis`, `surfaceMuted`, `link`, `codeBackground`, `quoteBackground` |
| `syntax` | `comment`, `keyword`, `string`, `number`, `function`, `variable`, `punctuation`, `inserted`, `deleted`                 |
| `styles` | The same fields as the `styles` prop.                                                                                  |

The `styles` prop takes precedence over `theme.styles` for each named field. For example, passing `styles.paragraph` replaces the theme's `paragraph` override, while the renderer's built-in paragraph styles still apply. Use a style array to combine overrides deliberately.

## Container layout

The `style` prop applies to the root `View`, after the theme's background color. Use it for width, padding, or spacing relative to the parent. Put text styles in `styles` or a slot plugin.

The app controls vertical scrolling. Wide tables and code blocks use horizontal scroll containers. Native text wrapping, fonts, and inline backgrounds follow the platform's layout behavior.

See [Configuration](./configuration.md) for text selection, syntax options, and the remaining props.
