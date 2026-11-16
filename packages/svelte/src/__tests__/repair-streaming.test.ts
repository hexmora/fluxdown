/* eslint-disable no-await-in-loop -- Inspect each committed prefix before appending the next character. */
import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, test } from 'vitest';

import {
  checkStreamingRepairFrame,
  getStreamingRepairSnapshot,
  getStreamingRepairText,
  STREAMING_REPAIR_CASES,
} from '../../../../scripts/testing/streaming-repair-cases';
import { Fluxdown } from '../packs/full';

afterEach(cleanup);

describe('character-by-character syntax repair', () => {
  test('does not expose TeX in the first formula render', () => {
    const fixture = STREAMING_REPAIR_CASES.find((item) => item.math)!;

    const view = render(Fluxdown, {
      text: fixture.source,
      build: { tex: true },
      streaming: { smooth: false, effect: false },
    });

    checkStreamingRepairFrame(view.container, fixture.source, fixture, []);
  });

  test.each(STREAMING_REPAIR_CASES)('$name', async (fixture) => {
    const view = render(Fluxdown, {
      text: '',
      build: { tex: true },
      streaming: { smooth: false, effect: false },
    });

    let text = '';

    let math: string[] = [];

    for (const character of fixture.source) {
      text += character;

      await view.rerender({ text });

      await new Promise((resolve) => setTimeout(resolve, 0));

      math = checkStreamingRepairFrame(view.container, text, fixture, math);
    }

    await view.rerender({ streaming: false });

    const complete = render(Fluxdown, { text, build: { tex: true } });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(getStreamingRepairSnapshot(view.container)).toEqual(
      getStreamingRepairSnapshot(complete.container),
    );

    for (const expected of fixture.completedText) {
      expect(getStreamingRepairText(view.container)).toContain(expected);
    }

    for (const selector of fixture.completedSelectors) {
      expect(view.container.querySelector(selector)).not.toBeNull();
    }
  });
});
