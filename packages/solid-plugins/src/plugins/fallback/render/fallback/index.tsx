import type { IPluggableConfig } from '@fluxdown/types';

import { Match, Switch } from 'solid-js';

import type { SolidRenderMatchParams, SolidRenderParams } from '../../../../base';

import { BaseSolidRenderPlugin, createTypeOfSlot } from '../../../../base';
import { Text } from './components/text';

const Element = /*#__PURE__*/ createTypeOfSlot('Element');

declare global {
  interface SolidRenderConfigs {
    'render-fallback': IPluggableConfig<void>;
  }
}

export class FallbackRenderPlugin extends BaseSolidRenderPlugin {
  static readonly key = 'render-fallback';

  readonly config = { priority: Infinity };

  match(_params: SolidRenderMatchParams) {
    return true;
  }

  render(props: SolidRenderParams) {
    return (
      <Switch>
        <Match when={props.node.type === 'text'}>
          <Text value={props.node.type === 'text' ? props.node.value : ''} />
        </Match>
        <Match when={props.node.type === 'element'}>
          <Element
            {...props.getProps(props.node.type === 'element' ? props.node : undefined)}
            tagName={props.node.type === 'element' ? props.node.tagName : 'span'}
          >
            {props.renderChildren()}
          </Element>
        </Match>
      </Switch>
    );
  }
}
