import type { Element } from 'hast';

import { SHAD_DATA_ATTR, SHAD_FADE_VALUE } from '@fluxdown/core-presets/mapper';
import { cleanup, render } from '@testing-library/react';

import { EffectShadRenderPlugin } from '..';
import { ShadRenderer } from '../renderer';
import styles from '../renderer/index.module.scss';
import { getShadConfig, isShadNode } from '../utils';

const fade = (properties: Element['properties']): Element => ({
  type: 'element',
  tagName: 'span',
  properties: { [SHAD_DATA_ATTR]: SHAD_FADE_VALUE, ...properties },
  children: [{ type: 'text', value: 'fade' }],
});

afterEach(() => {
  cleanup();

  jest.restoreAllMocks();
});

describe('EffectShadRenderPlugin', () => {
  test('matches only fade spans', () => {
    const plugin = new EffectShadRenderPlugin();

    expect(plugin.match({ node: fade({}) } as never)).toBe(true);

    expect(isShadNode({ ...fade({}), tagName: 'div' })).toBe(false);

    expect(isShadNode(fade({ [SHAD_DATA_ATTR]: 'host' }))).toBe(false);
  });

  test.each([
    { properties: { dataShadStart: 120, dataShadDuration: 250 }, start: 120, duration: 250 },
    { properties: { dataShadStart: '120', dataShadDuration: '250' }, start: 120, duration: 250 },
    { properties: {}, start: -1, duration: 400 },
    { properties: { dataShadStart: -20, dataShadDuration: -5 }, start: -1, duration: 0 },
    { properties: { dataShadStart: 'x', dataShadDuration: Infinity }, start: -1, duration: 400 },
  ])('reads start and duration from $properties', ({ properties, start, duration }) => {
    expect(getShadConfig(fade(properties))).toEqual({ start, duration });
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
