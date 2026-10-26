import { cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { ScaleRenderer } from '..';
import { TextStyleProvider } from '../../../../../../base';

afterEach(() => {
  cleanup();

  rstest.restoreAllMocks();
});

test('resumes both native animation layers from the same original arrival', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1100);

  const first = render(
    <ScaleRenderer start={1000} duration={200} from={0.2} blur={0.08}>
      A
    </ScaleRenderer>,
  );

  expect(first.container.querySelector('.fluxdown-scale-active')?.getAttribute('style')).toContain(
    'animation-delay: -100ms',
  );

  expect(first.container.querySelector('.fluxdown-scale-grow')?.getAttribute('style')).toContain(
    'animation-delay: -100ms',
  );

  expect(first.container.querySelector('.fluxdown-scale-glyph text')?.textContent).toBe('A');

  first.unmount();

  now.mockReturnValue(1150);

  const resumed = render(
    <ScaleRenderer start={1000} duration={200} from={0.2} blur={0.08}>
      A
    </ScaleRenderer>,
  );

  expect(
    resumed.container.querySelector('.fluxdown-scale-active')?.getAttribute('style'),
  ).toContain('animation-delay: -150ms');

  resumed.unmount();

  now.mockReturnValue(1250);

  const complete = render(
    <ScaleRenderer start={1000} duration={200} from={0.2} blur={0.08}>
      A
    </ScaleRenderer>,
  );

  expect(complete.container.querySelector('.fluxdown-scale-active')).toBeNull();

  expect(complete.container.querySelector('.fluxdown-scale-grow')).toBeNull();
});

test('carries heading typography into each inline view and its actual text', () => {
  const view = render(
    <TextStyleProvider
      value={{ fontSize: '32px', lineHeight: 1.25, fontWeight: '600', color: '#123456' }}
    >
      <ScaleRenderer start={-1} duration={200} from={0} blur={0.08}>
        A
      </ScaleRenderer>
    </TextStyleProvider>,
  );

  for (const element of view.container.querySelectorAll(
    '.fluxdown-scale, .fluxdown-scale-glyph, text',
  )) {
    expect(element.getAttribute('style')).toContain('font-size: 32px');
  }
});
