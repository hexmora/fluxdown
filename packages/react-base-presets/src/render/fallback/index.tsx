import type { IPluggableConfig } from '@fluxdown/types';

import type { ReactRenderMatchParams, ReactRenderParams } from '../../base';

import { BaseReactRenderPlugin, createTypeOfSlot } from '../../base';

const Node = /*#__PURE__*/ createTypeOfSlot('Node');

declare global {
  interface RenderConfigs {
    'render-fallback'?: IPluggableConfig<void>;
  }
}

export class FallbackRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: ReactRenderMatchParams) {
    return true;
  }

  render({ getProps, node, parents, render, renderChildren }: ReactRenderParams) {
    return (
      <Node
        current={node}
        getProps={getProps}
        parents={parents}
        render={render}
        renderChildren={renderChildren}
      />
    );
  }
}
