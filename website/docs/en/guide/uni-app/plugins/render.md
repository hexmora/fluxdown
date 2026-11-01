# Render plugins

Render plugins convert HAST nodes into uni-app render descriptions. Each description contains a slot name, props, and children for the `.uvue` components to display. Prefer [Slot plugins](./slot.md) when only the presentation needs to change.

## Match and render

This example sends blockquote nodes to the `Blockquote` slot:

```ts title="plugins/quote/render/index.ts"
import type {
  UniRenderMatchParams,
  UniRenderParams,
} from '@fluxdown/uni-app-plugins/base';

import {
  BaseUniRenderPlugin,
  createTypeOfSlot,
  isElementWithTag,
} from '@fluxdown/uni-app-plugins/base';

const Blockquote = /*#__PURE__*/ createTypeOfSlot('Blockquote');

export class QuoteRenderPlugin extends BaseUniRenderPlugin {
  static readonly key = 'render-custom-quote';

  match({ node }: UniRenderMatchParams) {
    return isElementWithTag(node, 'blockquote');
  }

  render({ node, getProps, renderChildren }: UniRenderParams) {
    if (!isElementWithTag(node, 'blockquote')) {
      return null;
    }

    return Blockquote(getProps(node), renderChildren(node));
  }
}
```

> Import `BaseUniRenderPlugin`, `createTypeOfSlot`, node helpers, and render parameter types from `@fluxdown/uni-app-plugins/base`.

`match` decides whether to handle a node. `renderChildren` continues rendering its children, and `getProps` preserves node properties. `createTypeOfSlot` returns a callable description builder; it does not instantiate a component.

## Register the plugin

```ts
import type { IPluginItem } from '@fluxdown/uni-app-plugins/typings';

import { QuoteRenderPlugin } from './render';

export const QuotePlugin: IPluginItem = {
  renders: [QuoteRenderPlugin],
};
```

Pass `QuotePlugin` through the component's `plugins` prop. Full and Lite already include a `Blockquote` slot; Raw requires its slot plugins explicitly.

## Return values

`render` can return text, numbers, `null`, arrays of those values, or slot descriptions. To display your own `.uvue` component directly, return `{ component, props, key? }`:

```ts
import { Citation } from './components/citation';

return {
  component: Citation,
  props: { label: 'Reference' },
};
```

> `Citation` is your application's component, implemented in `components/citation/main.uvue` and exported by name from that directory's `index.ts`. Import the return type, `UniRenderNode`, from `@fluxdown/uni-app-plugins/typings`.

At equal priority, later render plugins match first. A lower `priority` runs earlier. See [Composite plugins](./aggregate.md) to combine related render, slot, and parser plugins.
