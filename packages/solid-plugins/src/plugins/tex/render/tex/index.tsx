import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';
import { getTex, getTexMode } from './utils';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

declare global {
  interface SolidRenderConfigs {
    'render-tex': IPluggableConfig<void>;
  }
}

export class TexRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-tex';

  match(params: SolidRenderMatchParams) {
    return getTexMode(params) !== null && getTex(params) !== null;
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'span'));

      return props.node;
    });

    const mode = () => getTexMode(props) ?? 'inline';

    const tex = () => getTex(props) ?? '';

    return (
      <Tex
        {...props.getProps(node())}
        current={node()}
        mode={mode()}
        parents={props.parents}
        render={props.render}
        tex={tex()}
      />
    );
  }
}
