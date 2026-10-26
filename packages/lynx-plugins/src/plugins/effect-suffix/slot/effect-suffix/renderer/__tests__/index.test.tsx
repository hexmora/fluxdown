import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { SuffixRenderer } from '..';
import { TextStyleProvider } from '../../../../../../base';
import { getSuffixGeometry } from '../utils';

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
    'height: 40px',
  );

  expect(view.container.querySelector('.fluxdown-suffix-cursor')?.getAttribute('style')).toContain(
    'background-color: rgb(18, 52, 86)',
  );
});

test('wraps custom content in a native text element', () => {
  const view = render(<SuffixRenderer type="custom">...</SuffixRenderer>);

  expect(view.container.querySelector('.fluxdown-suffix-custom text')?.textContent).toBe('...');
});
