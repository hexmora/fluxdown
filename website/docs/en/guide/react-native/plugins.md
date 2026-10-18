# Using and writing plugins

Plugins use the same packs and ordering as React. Use slots to change native components and interactions, render plugins to choose slots for HAST nodes, and Core plugins to adjust parsing and streaming transformations.

## Declare and use a slot plugin

This example hides the code toolbar and adjusts the container while keeping native highlighting, scrolling, and theme styles:

```tsx
import type { CodeBlockProps } from '@fluxdown/react-native-presets/base';

import { BaseSlotPlugin } from '@fluxdown/react-base-presets/base';
import { Fluxdown } from '@fluxdown/react-native';

function CompactCodeBlock({ Raw, style, ...props }: CodeBlockProps) {
  return Raw ? (
    <Raw {...props} showHeader={false} style={[style, { borderRadius: 8 }]} />
  ) : null;
}

class CompactCodeBlockPlugin extends BaseSlotPlugin<'CodeBlock'> {
  static readonly key = 'compact-code-block';

  readonly type = 'CodeBlock';

  readonly Component = CompactCodeBlock;
}

const plugins = { slots: [CompactCodeBlockPlugin] };

export function Message({ text }: { text: string }) {
  return <Fluxdown plugins={plugins} text={text} />;
}
```

> This example requires `pnpm add @fluxdown/react-base-presets @fluxdown/react-native-presets`.

`Raw` is the previous component for that slot and can be `null`. Calling it keeps the native defaults and other plugins already in the chain. Later slot plugins wrap earlier ones. Return your own native components when replacing a slot entirely.

Keep reusable plugin classes and packs outside render functions when possible. See the [shared plugin guide](../react/plugins.md) for combining packs and applying `config`.

## Choose the right entry point

| Import                                | Contents                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `@fluxdown/react-base-presets/base`   | Shared `BaseSlotPlugin`, `BaseReactRenderPlugin`, `createTypeOfSlot`, and render parameter types. |
| `@fluxdown/react-base-presets/render` | Shared render plugins and `PRESET_RENDER_PLUGINS`.                                                |
| `@fluxdown/react-native-presets/base` | Native slot prop types, theme types, and `useNativeTheme`.                                        |
| `@fluxdown/react-native-presets/slot` | Native slot plugins and `PRESET_SLOT_PLUGINS`.                                                    |
| `@fluxdown/core-presets/*`            | Core syntax, repair, mapper, and other processing plugins.                                        |

Use native prop types such as `LinkProps`, `CodeBlockProps`, or `StrongProps` from the native presets package. DOM slot components and Web prop types are not interchangeable with them.

## Render plugins and getProps

The [render plugin guide](../react/plugins/render.md) describes matching HAST nodes, priorities, and recursive rendering. The same shared render plugins work with native slots.

When passing a HAST element to a slot, include its mapped properties. For example, this plugin routes paragraphs beginning with “Note:” to the blockquote slot:

```tsx
import type {
  ReactRenderMatchParams,
  ReactRenderParams,
} from '@fluxdown/react-base-presets/base';

import {
  BaseReactRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/react-base-presets/base';

const Blockquote = createTypeOfSlot('Blockquote');

const Paragraph = createTypeOfSlot('Paragraph');

export class NoteRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-note';

  readonly config = { priority: -1 };

  match({ node }: ReactRenderMatchParams) {
    if (!isElementWithTag(node, 'p')) {
      return false;
    }

    const first = node.children[0];

    return first?.type === 'text' && first.value.startsWith('Note:');
  }

  render({
    getProps,
    node,
    parents,
    render,
    renderChildren,
  }: ReactRenderParams) {
    if (!isElementWithTag(node, 'p')) {
      return null;
    }

    return (
      <Blockquote
        {...getProps(node)}
        current={node}
        parents={parents}
        render={render}
      >
        <Paragraph current={node} parents={parents} render={render}>
          {renderChildren(node)}
        </Paragraph>
      </Blockquote>
    );
  }
}
```

Add this class through `plugins={{ renders: [NoteRenderPlugin] }}`. The `Paragraph` slot keeps inline text in a native text container inside the blockquote's view. Pass mapped metadata only to the outer slot to avoid duplicating native IDs.

`getProps()` maps the current element; `getProps(element)` maps an explicit element. The native mapper converts `id` to `nativeID`, `ariaLabel` / `aria-label` to `accessibilityLabel`, and valid image dimensions to numeric `width` and `height`. It returns an empty object for non-element nodes and does not forward HTML classes, CSS, or DOM events.

`renderChildren` and `render` retain the mapping for nested nodes. Ordinary slots receive the mapped props; the fallback `Node` slot also receives `getProps` for its own node rendering.

## Native components and interactions

- **Inline content:** return native `Text` or content valid inside it. This applies to inline slots, render replacements, and patches. Block slots can use `View`; do not return DOM tags.
- **Links:** the default slot opens HTTP(S), `mailto:`, and `tel:` URLs with React Native `Linking`. Resolve relative URLs to an allowed absolute URL before passing them to `Raw`, or provide a native component for app routes and fragment navigation. Adding `onPress` to `Raw` alone does not activate an unsupported URL.
- **Copying code:** pass `onCopy` through a CodeBlock or CodeHeader slot to its `Raw`. It receives `{ code, language, meta }`; the app supplies its clipboard integration. The default toolbar shows a Copy action only when that callback exists.
- **HTML:** Core filters and sanitizes HTML, then native slots handle supported nodes. Allowing a tag does not supply browser layout, CSS, or DOM event behavior.
- **Themes:** use `Raw` to keep built-in theme handling. A fully custom component can read `colors`, `syntax`, `styles`, and `selectable` with `useNativeTheme`.

Core plugin contracts remain unchanged; continue with [Core plugins](../core/plugins.md) for syntax and content processing.
