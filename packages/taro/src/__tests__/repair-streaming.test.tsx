import { act, cleanup, render } from '@testing-library/react';

import {
  checkStreamingRepairFrame,
  getStreamingRepairSnapshot,
  STREAMING_REPAIR_CASES,
} from '../../../../scripts/testing/streaming-repair-cases';
import { Fluxdown } from '../packs/full';

const getRenderedContent = (container: HTMLElement): Element => {
  const clone = container.cloneNode(true) as HTMLElement;

  for (const richText of clone.querySelectorAll('taro-rich-text-core')) {
    richText.innerHTML = richText.getAttribute('nodes') ?? '';
  }

  return clone;
};

afterEach(cleanup);

test('keeps the first Web math render free of raw TeX', () => {
  const fixture = STREAMING_REPAIR_CASES.find((item) => item.math)!;
  const view = render(
    <Fluxdown
      text={fixture.source}
      streaming={{ smooth: false, effect: false }}
      build={{ tex: true }}
    />,
  );

  checkStreamingRepairFrame(getRenderedContent(view.container), fixture.source, fixture, []);
});

test.each(STREAMING_REPAIR_CASES)('repairs each Web prefix: $name', async (fixture) => {
  const streaming = { smooth: false, effect: false } as const;
  const view = render(<Fluxdown text="" streaming={streaming} build={{ tex: true }} />);
  let prefix = '';
  let previousMath: string[] = [];

  for (const character of fixture.source) {
    prefix += character;

    await act(async () => {
      view.rerender(<Fluxdown text={prefix} streaming={streaming} build={{ tex: true }} />);
    });

    previousMath = checkStreamingRepairFrame(
      getRenderedContent(view.container),
      prefix,
      fixture,
      previousMath,
    );
  }

  await act(async () => {
    view.rerender(<Fluxdown text={fixture.source} streaming={false} build={{ tex: true }} />);
  });

  const completed = getStreamingRepairSnapshot(getRenderedContent(view.container));

  view.unmount();

  const fresh = render(<Fluxdown text={fixture.source} streaming={false} build={{ tex: true }} />);

  await act(async () => {});

  expect(getStreamingRepairSnapshot(getRenderedContent(fresh.container))).toEqual(completed);

  for (const text of fixture.completedText) {
    expect(completed.text).toContain(text);
  }
});
