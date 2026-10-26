import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, test } from '@rstest/core';

import { ShadRenderer } from '..';

afterEach(cleanup);

test('keeps both text runs inline without turning the active tail into an unbreakable view', () => {
  const view = render(
    <text>
      before{' '}
      <ShadRenderer leading="leading " active="tail with spaces" isActive={true} maskWidth={15} />
    </text>,
  );

  const active = view.container.querySelector('.fluxdown-shad-active');

  expect(active?.tagName.toLowerCase()).toBe('text');

  expect(active?.querySelector('view')).toBeNull();

  expect(view.container.textContent).toBe('before leading tail with spaces');

  expect(view.container.querySelector('.fluxdown-shad-mask')?.getAttribute('style')).toContain(
    'margin-left: -15px',
  );
});

test('keeps the tail marker in place after the shade finishes', () => {
  const view = render(
    <ShadRenderer leading="completed" active={null} isActive={false} maskWidth={6.5} />,
  );

  const mask = view.container.querySelector('.fluxdown-shad-mask');

  expect(mask?.getAttribute('style')).toContain('opacity: 0');

  expect(mask?.getAttribute('style')).toContain('width: 6.5px');

  expect(view.container.textContent).toBe('completed');
});
