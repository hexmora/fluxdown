import type { LynxRenderMatchParams, LynxRenderParams } from '@fluxdown/lynx-plugins/base';
import type { ComponentProps } from '@lynx-js/react';
import type { Root } from 'hast';

import { BaseRehypePlugin } from '@fluxdown/core-plugins/plugins/rehype/base';
import { BaseLynxRenderPlugin, isElementWithTag } from '@fluxdown/lynx-plugins/base';
import { PluginPriority } from '@fluxdown/types';
import { cleanup, render, waitFor } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';
import { expectTypeOf } from 'expect-type';

import { Fluxdown } from '../packs/full';
import { FluxdownLite } from '../packs/lite';
import { FluxdownRaw } from '../packs/raw';

class ElementPropsPlugin extends BaseRehypePlugin {
  static readonly key = 'test-element-props';

  // Exercise native property mapping independently of the HTML sanitizer.
  readonly config = { priority: PluginPriority.Lowest + 1 };

  readonly plugin = () => (tree: Root) => {
    const node = tree.children[0];

    if (!node || node.type !== 'element') return;

    node.properties = {
      id: 'message',
      className: ['note', 'active'],
      dataTracking: 'message-body',
      onClick: 'browserHandler()',
      style: 'position:fixed',
    };
  };
}

const renderParagraph = ({ getProps, node, renderChildren }: LynxRenderParams) => {
  if (!isElementWithTag(node, 'p')) return null;

  const props = getProps();

  const emphasis = node.children.find((child) => isElementWithTag(child, 'strong'));

  const emphasisProps = getProps(
    emphasis?.type === 'element'
      ? { ...emphasis, properties: { dataTracking: 'emphasis' } }
      : undefined,
  );

  return (
    <text {...props} data-child={String(emphasisProps['data-tracking'])}>
      {renderChildren()}
    </text>
  );
};

class ParagraphPlugin extends BaseLynxRenderPlugin {
  static readonly key = 'test-paragraph-props';

  match({ node }: LynxRenderMatchParams) {
    return isElementWithTag(node, 'p');
  }

  readonly render = renderParagraph;
}

afterEach(cleanup);

test('maps presentation attributes with the built-in renderer', async () => {
  const view = render(<FluxdownLite plugins={{ rehypes: [ElementPropsPlugin] }} text="Default" />);

  await waitFor(() => expect(view.container.textContent).toBe('Default'));

  const paragraph = view.container.querySelector('#message');

  expect(paragraph).toHaveClass('note', 'active');
  expect(paragraph).toHaveAttribute('data-tracking', 'message-body');
  expect(paragraph).not.toHaveAttribute('onclick');
  expect(paragraph?.getAttribute('style')).not.toContain('position: fixed');
});

test('keeps node property mapping available to custom render plugins', async () => {
  const view = render(
    <FluxdownLite
      plugins={{ rehypes: [ElementPropsPlugin], renders: [ParagraphPlugin] }}
      text="Custom **content**"
    />,
  );

  await waitFor(() => expect(view.container.textContent).toBe('Custom content'));

  const paragraph = view.container.querySelector('#message');

  expect(paragraph?.tagName).toBe('TEXT');
  expect(paragraph).toHaveClass('note', 'active');
  expect(paragraph).toHaveAttribute('data-tracking', 'message-body');
  expect(paragraph).toHaveAttribute('data-child', 'emphasis');
  expect(paragraph).not.toHaveAttribute('onclick');
  expect(paragraph).not.toHaveAttribute('style');
});

test('keeps the property mapper out of component props', () => {
  expectTypeOf<ComponentProps<typeof Fluxdown>>().not.toHaveProperty('getProps');
  expectTypeOf<ComponentProps<typeof FluxdownLite>>().not.toHaveProperty('getProps');
  expectTypeOf<ComponentProps<typeof FluxdownRaw>>().not.toHaveProperty('getProps');
});
