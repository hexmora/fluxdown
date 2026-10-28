import type { IPluggableConfig } from '@fluxdown/types';

import { assert } from '@fluxdown/utils';
import { createMemo } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot, isElementWithTag } from '../../../../base';

const Table = /*#__PURE__*/ createTypeOfSlot('Table');

declare global {
  interface SolidRenderConfigs {
    'render-table': IPluggableConfig<void>;
  }
}

export class TableRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-table';

  match({ node }: SolidRenderMatchParams) {
    return isElementWithTag(node, 'table');
  }

  render(props: SolidRenderParams) {
    const node = createMemo(() => {
      assert(isElementWithTag(props.node, 'table'));

      return props.node;
    });

    return <Table {...props.getProps(node())}>{props.renderChildren()}</Table>;
  }
}
