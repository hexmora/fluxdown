# @fluxdown/react-native

Native React Native rendering for the same incremental Markdown core used by `fluxdown`.

```sh
npm install @fluxdown/react-native react-native-svg
```

```tsx
import { Fluxdown } from "@fluxdown/react-native";
import { ScrollView } from "react-native";

export function Message({
  text,
  pending,
}: {
  text: string;

  pending: boolean;
}) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Fluxdown text={text} streaming={pending} selectable />
    </ScrollView>
  );
}
```

The component renders `View`, `Text`, `Image`, and horizontal `ScrollView` primitives. It does not require a WebView, DOM, CSS, or Expo. Math uses `react-native-svg`; Expo Go includes its native implementation, and bare React Native apps should complete the usual native dependency installation, including CocoaPods on iOS. Expo is used only by the package-local Storybook. React Native owns layout and text selection; the component does not create a vertical scroll container.

## Props

| Prop         | Default       | Description                                                                                                                                                                                                                            |
| ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`       | required      | Current complete Markdown string, including any appended content.                                                                                                                                                                      |
| `build`      | same as React | Core compiler options. GFM tables, tasks, and strikethrough are available; enable `tex` or `footnote` explicitly.                                                                                                                      |
| `streaming`  | `false`       | `true` enables ending repair, smooth reveal, and trailing fade. An object configures `repairEnding`, `smooth`, and `shad` independently.                                                                                               |
| `patches`    | `[]`          | Same `{ key?, range, render }` source-range patches as React. Inline replacements must be valid inside native `Text`.                                                                                                                  |
| `plugins`    | `[]`          | Same `config`, `remarks`, `rehypes`, `repairs`, `mappers`, `renders`, and `slots` pack structure. Shared render plugins come from `@fluxdown/react-base-presets/render`; native slots come from `@fluxdown/react-native-presets/slot`. |
| `theme`      | `'light'`     | `'light'`, `'dark'`, native color/syntax/style overrides, or `[preset, overrides]`.                                                                                                                                                    |
| `style`      | —             | `StyleProp<ViewStyle>` for the root. Registered styles and style arrays work.                                                                                                                                                          |
| `styles`     | —             | Typed `MarkdownStyles` overrides for text, headings, links, code, lists, tables, and other elements.                                                                                                                                   |
| `selectable` | `false`       | Enables native text selection.                                                                                                                                                                                                         |
| `ref`        | —             | Same readable core closure as React (`value`, subscription, lifecycle).                                                                                                                                                                |

Other `ViewProps`, including `testID`, accessibility properties, and layout events, pass through to the root. `children` is excluded: Markdown is supplied through `text`.

```tsx
<Fluxdown
  text={text}
  theme="dark"
  style={{ padding: 12, borderRadius: 8 }}
  styles={{ text: { fontSize: 17, lineHeight: 26 }, link: { color: "#60a5fa" } }}
  streaming={{ repairEnding: true, smooth: false, shad: false }}
/>
```

## Architecture and native differences

`@fluxdown/core` owns chunking, HAST compilation, repairs, patches, and mappers. `@fluxdown/react-base` supplies the shared `BaseFluxdown`, Core lifecycle, plugin configuration, and incremental React reconciliation. `@fluxdown/react-base-presets` supplies platform-independent render plugins and slot composition. The native wrapper adds its root `View`, theme, and native slots from `@fluxdown/react-native-presets`. The DOM wrapper uses the same React foundation with DOM slots.

`BaseFluxdown` renders a fragment and requires slots for the elements it encounters. Applications building another React platform renderer can supply those slots through `plugins={[{ slots: [...] }]}`; a missing required slot raises an explicit error.

Native styles use numeric dimensions and native font names. There is no `className`, stylesheet import, CSS variable theme, or CSS trailing mask (`maskWidth`). Trailing fade uses native Animated.Text opacity; `smooth` retains the core ticker and reveal behavior. Code blocks use the same Shiki JavaScript highlighter as Web, with native token colors. Math uses the shared MathJax SVG conversion and native SVG rendering. Both load on demand and retain readable source text while loading or when conversion is unavailable. SVG equations do not support native text selection. The `CodeHighlighter` and `Tex` slots remain replaceable. Clipboard integration uses an explicit code-slot callback supplied by the app, without imposing another native dependency.

Raw HTML is compiled through the existing core sanitization, then mapped to supported native primitives. Browser attributes, CSS, DOM events, and arbitrary HTML layout are not reproduced. Links use React Native `Linking` for HTTP(S), mail, and telephone URLs; relative links require a custom Link slot. Remote images use HTTP(S) URLs and their natural dimensions, constrained to the available width while preserving their aspect ratio. A temporary 240 × 160 size is used while dimensions load or if they cannot be read. Explicit Image slot dimensions and `styles.image` overrides take priority. Tables scroll horizontally when their columns exceed the available width. Task list checkboxes display read-only state.

## Development

From the repository root, with the pinned Node/pnpm versions:

```sh
pnpm install
pnpm exec moon run react-native:build
pnpm --filter @fluxdown/react-native test
pnpm exec moon run react-native:typecheck react-native-presets:typecheck
pnpm --filter @fluxdown/react-native storybook
pnpm --filter @fluxdown/react-native build:storybook
```

The library uses [React Native Builder Bob](https://oss.callstack.com/react-native-builder-bob/build) for separate ESM/CommonJS JavaScript and declarations. Published conditional exports point to built files, including a `react-native` condition; consumers do not compile repository TypeScript. The package-local `.storybook` app uses Expo/Metro and [on-device Storybook](https://storybookjs.github.io/react-native/docs/intro/getting-started/). Scan the Expo QR code or select an installed simulator.

The tested development stack is Expo 57, React Native 0.86.3, and React 19.2.3. The peer range allows React 18/19 and React Native 0.76+, but those older combinations are not all independently tested.
