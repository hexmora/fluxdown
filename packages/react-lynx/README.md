# Fluxdown for React Lynx

Streaming Markdown for React Lynx, built on `@fluxdown/core`.

```sh
pnpm add @fluxdown/react-lynx
```

```tsx
import { Fluxdown } from "@fluxdown/react-lynx";

type MessageProps = {
  text: string;
  streaming: boolean;
};

export function Message({ text, streaming }: MessageProps) {
  return <Fluxdown text={text} streaming={streaming} />;
}
```

Pass the complete message received so far as `text`, and set `streaming` to `false` when it ends. Use `@fluxdown/react-lynx/lite` for `FluxdownLite`, or `@fluxdown/react-lynx/raw` for `FluxdownRaw` with your own plugins.

The package ships JSX for the React Lynx compiler. Use the official `@lynx-js/react-rsbuild-plugin` in your app; styles are included through component imports.

Parsing and highlighting run on the background thread. The public components, presets and standard plugin packs handle this split internally. Custom plugins that import Core or parser libraries should follow the [plugin package's background-thread guidance](../react-lynx-plugins).

Renderers, slots and themes live in [`@fluxdown/react-lynx-plugins`](../react-lynx-plugins). Licensed under [MIT](../../LICENSE).
