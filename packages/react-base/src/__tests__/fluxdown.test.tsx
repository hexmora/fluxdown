/** @jest-environment node */

import type { ReactRenderParams } from '@fluxdown/react-base-plugins/base';
import type { GetPropsFunction } from '@fluxdown/react-base-plugins/typings';
import type { ComponentProps } from 'react';

import { BaseReactRenderPlugin } from '@fluxdown/react-base-plugins/base';
import { expectTypeOf } from 'expect-type';
import { renderToStaticMarkup } from 'react-dom/server';

import type { FluxdownBaseProps } from '../packs';

import { FluxdownBase } from '../packs';

class TextRenderPlugin extends BaseReactRenderPlugin {
  static readonly key = 'test-text';

  match() {
    return true;
  }

  render({ node, renderChildren }: ReactRenderParams) {
    return node.type === 'text' ? node.value : renderChildren();
  }
}

describe('FluxdownBase', () => {
  test('renders custom plugins without a host element or browser globals', () => {
    expect(globalThis).not.toHaveProperty('document');
    expect(globalThis).not.toHaveProperty('window');

    expect(
      renderToStaticMarkup(
        <FluxdownBase text="Hello **world**" plugins={{ renders: [TextRenderPlugin] }} />,
      ),
    ).toBe('Hello world');
  });

  test('requires explicit plugins and exposes no DOM container props', () => {
    type Props = ComponentProps<typeof FluxdownBase>;

    expectTypeOf<Props>().toMatchTypeOf<FluxdownBaseProps>();
    expectTypeOf<{ text: string }>().not.toMatchTypeOf<Props>();
    expectTypeOf<Props>().not.toHaveProperty('className');
    expectTypeOf<Props>().not.toHaveProperty('style');
    expectTypeOf<Props>().not.toHaveProperty('theme');
    expectTypeOf<Props['getProps']>().toEqualTypeOf<GetPropsFunction | undefined | null>();
  });

  test.each([
    {
      name: 'omitted',
      getProps: undefined,
      expected: { href: 'https://example.com' },
    },
    {
      name: 'disabled',
      getProps: null,
      expected: {},
    },
    {
      name: 'custom',
      getProps: () => ({ label: 'custom' }),
      expected: { label: 'custom' },
    },
  ])('uses $name syntax-tree property conversion', ({ getProps, expected }) => {
    const capture = jest.fn();

    class PropertyRenderPlugin extends TextRenderPlugin {
      render(params: ReactRenderParams) {
        if (params.node.type === 'element' && params.node.tagName === 'a') {
          capture(params.getProps());
        }

        return super.render(params);
      }
    }

    expect(
      renderToStaticMarkup(
        <FluxdownBase
          text="[content](https://example.com)"
          plugins={{ renders: [PropertyRenderPlugin] }}
          getProps={getProps}
        />,
      ),
    ).toBe('content');

    expect(capture).toHaveBeenCalledWith(expected);
  });
});
