import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { SuffixRenderer } from '..';
import { TextStyleProvider } from '../../../../../../base';
import { getInlineSuffixGeometry, getSuffixGeometry } from '../utils';

afterEach(cleanup);

test('matches the React cursor width for paragraph and heading line heights', () => {
  expect(getSuffixGeometry({ fontSize: '16px', lineHeight: 1.65 })).toEqual({
    height: '26.4px',
    cursorWidth: '6.24px',
  });

  expect(getSuffixGeometry({ fontSize: '32px', lineHeight: 1.25 })).toEqual({
    height: '40px',
    cursorWidth: `${(40 * 0.39) / 1.65}px`,
  });

  expect(getSuffixGeometry({ fontSize: '16px', lineHeight: '24px' })).toEqual({
    height: '24px',
    cursorWidth: `${(24 * 0.39) / 1.65}px`,
  });
});

test('uses current foreground and line height without inserting a visible suffix character', () => {
  const view = render(
    <TextStyleProvider value={{ color: '#123456', fontSize: '32px', lineHeight: 1.25 }}>
      <text>
        text
        <SuffixRenderer type="cursor" />
      </text>
    </TextStyleProvider>,
  );

  expect(view.container.textContent).toBe('text');

  expect(view.container.querySelector('.fluxdown-suffix')?.getAttribute('style')).toContain(
    'height: 32px',
  );

  expect(view.container.querySelector('.fluxdown-suffix')?.getAttribute('style')).toContain(
    'margin: 4px',
  );

  expect(view.container.querySelector('.fluxdown-suffix view')).toBeNull();

  expect(view.container.querySelector('.fluxdown-suffix-cursor')?.getAttribute('style')).toContain(
    'background-color: rgb(18, 52, 86)',
  );
});

test('paints built-in native markers with Web geometry and a positive subpixel advance', () => {
  for (const type of ['cursor', 'dot'] as const) {
    const geometry = getInlineSuffixGeometry({ fontSize: '20px', lineHeight: 1.5 }, type);

    const advance =
      parseFloat(geometry.width) +
      parseFloat(geometry.marginLeft) +
      parseFloat(geometry.marginRight);

    expect(advance).toBeGreaterThan(0);

    expect(advance).toBeLessThan(0.002);

    expect(
      parseFloat(geometry.height) +
        parseFloat(geometry.marginTop) +
        parseFloat(geometry.marginBottom),
    ).toBeCloseTo(30);

    expect(parseFloat(geometry.width)).toBeCloseTo(type === 'cursor' ? (30 * 0.39) / 1.65 : 12.48);

    expect(geometry.height).toBe(type === 'cursor' ? '20px' : '12.48px');
  }
});

test('keeps custom content visible on one native text line', () => {
  const view = render(<SuffixRenderer type="custom">...</SuffixRenderer>);

  expect(view.container.querySelector('.fluxdown-suffix-custom text')?.textContent).toBe('...');

  expect(
    view.container.querySelector('.fluxdown-suffix-custom text')?.getAttribute('style'),
  ).toContain('white-space: nowrap');

  expect(view.container.querySelector('.fluxdown-suffix')?.getAttribute('style')).toContain(
    'margin-right: 0.0009765625px',
  );
});
