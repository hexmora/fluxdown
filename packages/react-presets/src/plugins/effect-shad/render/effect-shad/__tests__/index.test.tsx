import type { IRenderPatchItem } from '@fluxdown/core';
import type { Element } from 'hast';
import type { ReactNode } from 'react';

import { SHAD_DATA_ATTR, SHAD_HOST_VALUE } from '@fluxdown/core-presets/mapper';
import { cleanup, render } from '@testing-library/react';
import { MutableState } from 'stative';

import { EffectShadRenderPlugin } from '..';
import styles from '../renderer/index.module.scss';

afterEach(cleanup);

describe('EffectShadRenderPlugin', () => {
  test.each([
    { maskWidth: undefined, expected: 15 },
    { maskWidth: '24.5', expected: 24.5 },
    { maskWidth: 'invalid', expected: 15 },
    { maskWidth: Infinity, expected: 15 },
    { maskWidth: -10, expected: 0 },
    { maskWidth: 0, expected: 0 },
  ])('renders HAST maskWidth=$maskWidth without root styles', ({ maskWidth, expected }) => {
    const plugin = new EffectShadRenderPlugin();

    const patches = MutableState.of<IRenderPatchItem<ReactNode>[]>([]);

    const node: Element = {
      type: 'element',
      tagName: 'span',
      properties: { [SHAD_DATA_ATTR]: SHAD_HOST_VALUE, dataShadMaskWidth: maskWidth },
      children: [
        {
          type: 'element',
          tagName: 'span',
          properties: {},
          children: [{ type: 'text', value: 'leading' }],
        },
        {
          type: 'element',
          tagName: 'span',
          properties: {},
          children: [{ type: 'text', value: 'active' }],
        },
      ],
    };

    const view = render(
      plugin.render({
        node,
        parents: [],
        getProps: () => ({}),
        patches,
        render: () => null,
        renderChildren: (parent) =>
          parent?.children.map((child) => (child.type === 'text' ? child.value : '')).join(''),
      }),
    );

    expect(view.container.textContent).toBe('leadingactive');

    expect(view.container.querySelector(`.${styles.mask}`)).toHaveStyle({
      width: `${expected}px`,
      marginLeft: `${-expected}px`,
    });

    expect(view.container.firstElementChild).not.toHaveAttribute('style');

    expect(view.container.innerHTML).not.toContain('--');

    patches.destroy();

    plugin.destroy();
  });
});
