# Configuration

Vue Lynx follows [Vue configuration](../vue/configuration.md) for `text`, `build`, `streaming`, `plugins`, `patches` and template refs. This page describes the differences for Lynx.

| Prop                                             | Vue Lynx behavior                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [`text`](../vue/configuration.md#text)           | Pass the complete current Markdown string.                                                 |
| [`streaming`](../vue/configuration.md#streaming) | The same repair, smoothing and effect options. All four effects render with Lynx elements. |
| [`build`](../vue/configuration.md#build)         | Shared parsing features; Full renders math as SVG when `tex` is enabled.                   |
| [`plugins`](../vue/configuration.md#plugins)     | Use `IPluginItem` from `@fluxdown/vue-base-plugins/typings` and Vue Lynx plugin packs.     |
| [`patches`](../vue/configuration.md#patches)     | Return Vue VNodes containing Lynx elements such as `text` and `view`.                      |
| [`ref`](../vue/configuration.md#ref)             | Import `FluxdownRef` from `@fluxdown/vue-lynx`; the handle exposes reactive render output. |

## class and style {#style}

The outer container is a Lynx `view`. Use Vue `class` and `style` bindings, with properties and values supported by Lynx CSS:

```vue
<Fluxdown
  class="conversation-message"
  :style="{ padding: '16px', maxWidth: '720px' }"
  :text="text"
/>
```

DOM-specific attributes, browser CSS units and DOM event handlers do not provide native behavior. Use [slots](./plugins/slot.md) to connect native interactions.

## theme {#theme}

Use `light`, `dark`, partial token overrides or `[preset, overrides]`. Import `Theme` and `ThemeTokens` from `@fluxdown/vue-lynx` or `@fluxdown/vue-lynx-plugins/base`.

Theme values are applied directly to native elements. Use dimensions with units, and fonts available in your host. See [Styling](./customization.md) for examples; browser CSS variables and DOM selectors are not required.
