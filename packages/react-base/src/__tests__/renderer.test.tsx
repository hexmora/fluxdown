import type { ReactRenderMatchParams, ReactRenderParams } from '@fluxdown/react-base-presets/base';
import type { Element } from 'hast';

import { BaseReactRenderPlugin } from '@fluxdown/react-base-presets/base';
import { PluginPriority } from '@fluxdown/types';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';

import type { BaseFluxdownRef } from '../types';

import { BaseFluxdown, ReactRenderer } from '..';

class FirstRenderer extends ReactRenderer {
  protected getProps(node?: Element) {
    return { 'data-mapped': `first:${node?.tagName ?? 'text'}` };
  }
}

class SecondRenderer extends ReactRenderer {
  protected getProps(node?: Element) {
    return { 'data-mapped': `second:${node?.tagName ?? 'text'}` };
  }
}

class InspectRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'inspect-render-props';

  readonly config = { priority: PluginPriority.Highest };

  match({ node }: ReactRenderMatchParams) {
    return node.type === 'element' || node.type === 'text';
  }

  render({ node, getProps, renderChildren }: ReactRenderParams) {
    if (node.type === 'text') {
      return <span {...getProps()}>{node.value}</span>;
    }

    return <div {...getProps()}>{renderChildren()}</div>;
  }
}

const plugins = [{ renders: [InspectRenderPlugin] }];

describe('renderer dependency', () => {
  test('keeps platform mappings isolated through nested rendering and text updates', () => {
    const ref = createRef<BaseFluxdownRef>();

    const view = render(
      <>
        <BaseFluxdown Renderer={FirstRenderer} ref={ref} text="**first**" plugins={plugins} />
        <BaseFluxdown Renderer={SecondRenderer} text="**second**" plugins={plugins} />
      </>,
    );

    const core = ref.current;

    expect(screen.getByText('first')).toHaveAttribute('data-mapped', 'first:text');

    expect(screen.getByText('first').parentElement).toHaveAttribute('data-mapped', 'first:strong');

    expect(screen.getByText('second')).toHaveAttribute('data-mapped', 'second:text');

    view.rerender(
      <>
        <BaseFluxdown Renderer={FirstRenderer} ref={ref} text="**updated**" plugins={plugins} />
        <BaseFluxdown Renderer={SecondRenderer} text="**second**" plugins={plugins} />
      </>,
    );

    expect(ref.current).toBe(core);

    expect(screen.getByText('updated')).toHaveAttribute('data-mapped', 'first:text');

    expect(screen.getByText('second').parentElement).toHaveAttribute(
      'data-mapped',
      'second:strong',
    );
  });

  test('provides an empty mapping when no platform renderer is supplied', () => {
    render(<BaseFluxdown text="default" plugins={plugins} />);

    expect(screen.getByText('default')).not.toHaveAttribute('data-mapped');
  });
});
