# @fluxdown/lynx-plugins

Lynx render plugins and slots for Fluxdown. The default path and `/full` export `PRESET_FULL_PLUGINS`; `/lite` exports `PRESET_LITE_PLUGINS`. Use `@fluxdown/lynx` for the complete component, or pass a preset to `FluxdownRaw`.

Both presets cover Markdown blocks, tables, task lists and chunk/scale/shad/suffix effects. Full adds CJK/emoji normalization and Shiki highlighting for Bash, CSS, HTML, JavaScript, JSON, Python and TypeScript. Unknown languages remain plain text. TeX stays source text unless you supply a native math slot; browser-only diagram and math renderers are not bundled.

Navigation requires your application's native bridge. Register host slots after the preset so `Raw` preserves the default renderer:

```tsx
import { FluxdownRaw } from "@fluxdown/lynx/raw";
import { BaseSlotPlugin } from "@fluxdown/lynx-plugins/base";
import type { LinkProps } from "@fluxdown/lynx-plugins/base";
import { PRESET_LITE_PLUGINS } from "@fluxdown/lynx-plugins/lite";
import { openUrl } from "./native-bridge";

class HostLinkSlot extends BaseSlotPlugin<"Link"> {
  static readonly key = "host-link";

  readonly type = "Link";

  readonly Component = ({ Raw, ...props }: LinkProps) =>
    Raw ? <Raw {...props} onTap={({ href }) => openUrl(href)} /> : null;
}

const plugins = [...PRESET_LITE_PLUGINS, { slots: [HostLinkSlot] }];

<FluxdownRaw plugins={plugins} text={markdown} />;
```

Here `markdown` is your source string and `openUrl(href)` performs navigation. Clipboard controls appear when a CodeBlock slot supplies `CodeBlockProps.onCopy({ code })`, returning `void` or `Promise<void>` from your native bridge. Image slots accept `onTap({ src, event })`; loading uses the host's image service.

Individual packs are exported from `/plugins/*`, shared APIs from `/base`, and pack/theme types from `/typings`. Themes accept `light`, `dark`, partial tokens or `[preset, overrides]`. Text styles propagate explicitly without CSS inheritance; fonts and glyph metrics depend on the host. Native inline code supports `normal`/`nowrap`; `fontSmoothing` and `accentHover` remain compatibility/host-slot tokens.

Presets and standard packs handle the background-thread split internally. Custom render classes should assign a separate JSX function to `readonly render`; ReactLynx otherwise treats JSX `render()` methods as components. Custom parser modules importing Core need the [official background-only boundary](https://lynxjs.org/next/react/thinking-in-reactlynx): add `import "background-only"` inside the module and pass `plugins={__BACKGROUND__ ? customPlugins : []}` at the call site.
