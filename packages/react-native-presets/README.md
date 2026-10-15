# @fluxdown/react-native-presets

React Native slots for `@fluxdown/react-native`.

- `/base`: native slot prop types, native property conversion, public URL handling, and native themes.
- `/slot`: native component slots and `PRESET_SLOT_PLUGINS`.

Shared render plugins, reactive hooks, and slot composition live in `@fluxdown/react-base-presets`. Import render plugins from `@fluxdown/react-base-presets/render`; there is no platform `/render` or root entry.

```tsx
import { BaseSlotPlugin } from "@fluxdown/react-base-presets/base";
import { Fluxdown } from "@fluxdown/react-native";
import type { StrongProps } from "@fluxdown/react-native-presets/base";
import { Text } from "react-native";

class Strong extends BaseSlotPlugin<"Strong"> {
  static readonly key = "app-strong";

  readonly type = "Strong";

  readonly Component = ({ children }: StrongProps) => (
    <Text style={{ fontWeight: "800" }}>{children}</Text>
  );
}

const plugins = [{ slots: [Strong] }];

export const Message = () => <Fluxdown text="Hello **native**" plugins={plugins} />;
```

Keep plugin packs stable between renders when possible. Inline slots and patches must return `Text`-compatible content; block slots may use `View`. Native `style` values are not CSS. Code uses shared Shiki tokenization with native text colors. Math uses the shared MathJax SVG converter and `react-native-svg`; both slots remain replaceable. The package contains no DOM, WebView, or clipboard dependency.

See [`@fluxdown/react-native`](../react-native/README.md) for the component API and development commands.

Native slots map HAST metadata from `current`. A custom slot that replaces `Raw` can call `getReactNativeProps(current)` from `/base`, then apply its own native props. Shared render plugins do not expose a platform `getProps` callback.
