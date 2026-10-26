# Fluxdown for Lynx

Streaming Markdown for ReactLynx, built on `@fluxdown/core`.

```sh
pnpm add @fluxdown/lynx
```

```tsx
import { Fluxdown } from "@fluxdown/lynx";

type MessageProps = {
  text: string;
  streaming: boolean;
};

export function Message({ text, streaming }: MessageProps) {
  return <Fluxdown text={text} streaming={streaming} />;
}
```

Pass the complete message received so far as `text`, and set `streaming` to `false` when it ends. Use `@fluxdown/lynx/lite` for `FluxdownLite`, or `@fluxdown/lynx/raw` for `FluxdownRaw` with your own plugins.

The package ships JSX for the ReactLynx compiler. Use the official `@lynx-js/react-rsbuild-plugin` in your app; styles are included through component imports.

Parsing and highlighting run on the background thread. The public components, presets and standard plugin packs handle this split internally. Custom plugins that import Core or parser libraries should follow the [plugin package's background-thread guidance](../lynx-plugins).

Renderers, slots and themes live in [`@fluxdown/lynx-plugins`](../lynx-plugins). Licensed under [MIT](../../LICENSE).
