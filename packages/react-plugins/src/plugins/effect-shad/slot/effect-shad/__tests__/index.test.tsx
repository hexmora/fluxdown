import type { IRenderPatchItem } from '@fluxdown/core';
import type { Element } from 'hast';
import type { ReactNode } from 'react';

import { SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '@fluxdown/core-plugins/plugins/mapper/shad';
import { EffectShadRenderPlugin } from '@fluxdown/react-base-plugins/plugins/effect-shad';
import { cleanup, render } from '@testing-library/react';
import { MutableState } from 'stative';

import { EffectShadSlotPlugin, ShadRenderer } from '..';
import { SlotProvider } from '../../../../../base';
import styles from '../renderer/index.module.scss';

const fade = (properties: Element['properties']): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { [SHAD_DATA_ATTR]: SHAD_FADE_VALUE, ...properties },
  children: [{ type: 'text', value: 'fade' }],
});

const renderNode = (node: Element) => {
  const plugin = new EffectShadRenderPlugin();

  const patches = MutableState.of<IRenderPatchItem<ReactNode>[]>([]);

  const view = render(
    <SlotProvider plugins={[EffectShadSlotPlugin]}>
      {plugin.render({
        node,
        parents: [],
        getProps: () => ({}),
        patches,
        render: () => null,
        renderChildren: (parent) =>
          parent?.children.map((child) => (child.type === 'text' ? child.value : '')).join(''),
      })}
    </SlotProvider>,
  );

  patches.destroy();

  plugin.destroy();

  return view;
};

afterEach(() => {
  cleanup();

  jest.restoreAllMocks();
});

describe('EffectShadRenderPlugin', () => {
  test('matches only fade spans', () => {
    const plugin = new EffectShadRenderPlugin();

    expect(plugin.match({ node: fade({}) } as never)).toBe(true);

    expect(plugin.match({ node: { ...fade({}), tagName: 'div' } } as never)).toBe(false);

    expect(plugin.match({ node: fade({ [SHAD_DATA_ATTR]: 'host' }) } as never)).toBe(false);

    plugin.destroy();
  });

  test.each([
    { properties: { dataShadStart: 120, dataShadDuration: 250 }, active: true, duration: '250ms' },
    {
      properties: { dataShadStart: '120', dataShadDuration: '250' },
      active: true,
      duration: '250ms',
    },
    { properties: {}, active: false, duration: '400ms' },
    { properties: { dataShadStart: -20, dataShadDuration: -5 }, active: false, duration: '0ms' },
    {
      properties: { dataShadStart: 'x', dataShadDuration: Infinity },
      active: false,
      duration: '400ms',
    },
  ])('reads start and duration from $properties', ({ properties, active, duration }) => {
    jest.spyOn(performance, 'now').mockReturnValue(200);

    const { getByText } = renderNode(fade(properties));

    expect(getByText('fade').classList.contains(styles.active!)).toBe(active);

    expect(getByText('fade').style.getPropertyValue('--fluxdown-shad-duration')).toBe(duration);
  });
});

describe('ShadRenderer', () => {
  test('resumes a fade from its own start time and settles once it has finished', () => {
    const now = jest.spyOn(performance, 'now').mockReturnValue(1100);

    const running = render(
      <ShadRenderer duration={400} start={1000}>
        fade
      </ShadRenderer>,
    );

    expect(running.getByText('fade')).toHaveClass(styles.active!);

    expect(running.getByText('fade')).toHaveStyle({
      animationDelay: '-100ms',
      '--fluxdown-shad-duration': '400ms',
    });

    running.unmount();

    now.mockReturnValue(1500);

    const settled = render(
      <ShadRenderer duration={400} start={1000}>
        fade
      </ShadRenderer>,
    );

    expect(settled.getByText('fade')).not.toHaveClass(styles.active!);
  });

  test('does not animate content that was already settled', () => {
    const { getByText } = render(
      <ShadRenderer duration={400} start={-1}>
        fade
      </ShadRenderer>,
    );

    expect(getByText('fade')).not.toHaveClass(styles.active!);
  });
});
