import { act, cleanup, render } from '@lynx-js/react/testing-library';
import { afterEach, expect, rstest, test } from '@rstest/core';

import { FluxdownLite } from '../packs/lite';

const content = (text: string) => (
  <FluxdownLite text={text} streaming={{ effect: 'scale', smooth: false }} />
);

afterEach(async () => {
  cleanup();

  await act(async () => {});

  rstest.restoreAllMocks();
});

test('keeps an active scale word mounted when settled siblings collapse', () => {
  const now = rstest.spyOn(performance, 'now').mockReturnValue(1000);

  const view = render(content(''));

  view.rerender(content('old words'));

  now.mockReturnValue(1199);

  view.rerender(content('old words fresh'));

  const words = view.container.querySelectorAll('.fluxdown-scale-word');

  expect(words).toHaveLength(3);

  const fresh = words[2];

  expect(fresh?.textContent).toBe('fresh');

  const characters = Array.from(fresh!.querySelectorAll('.fluxdown-scale'));

  now.mockReturnValue(1200);

  view.rerender(content('old words fresh next'));

  expect(view.container.textContent).toBe('old words fresh next');

  expect(view.container.querySelector('.fluxdown-scale-word')).toBe(fresh);

  expect(Array.from(fresh!.querySelectorAll('.fluxdown-scale'))).toEqual(characters);
});
