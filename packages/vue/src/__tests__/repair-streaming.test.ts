/* eslint-disable no-await-in-loop -- Inspect each committed prefix before appending the next character. */
import { flushPromises, mount } from '@vue/test-utils';

import {
  checkStreamingRepairFrame,
  getStreamingRepairSnapshot,
  getStreamingRepairText,
  STREAMING_REPAIR_CASES,
} from '../../../../scripts/testing/streaming-repair-cases';
import { Fluxdown } from '../packs/full';

describe('character-by-character syntax repair', () => {
  test('does not expose TeX in the first formula render', () => {
    const fixture = STREAMING_REPAIR_CASES.find((item) => item.math)!;

    const wrapper = mount(Fluxdown, {
      props: {
        text: fixture.source,
        build: { tex: true },
        streaming: { smooth: false, effect: false },
      },
    });

    checkStreamingRepairFrame(wrapper.element, fixture.source, fixture, []);
  });

  test.each(STREAMING_REPAIR_CASES)('$name', async (fixture) => {
    const wrapper = mount(Fluxdown, {
      props: {
        text: '',
        build: { tex: true },
        streaming: { smooth: false, effect: false },
      },
    });

    let source = '';

    let math: string[] = [];

    for (const character of fixture.source) {
      source += character;

      await wrapper.setProps({ text: source });

      await flushPromises();

      math = checkStreamingRepairFrame(wrapper.element, source, fixture, math);
    }

    await wrapper.setProps({ streaming: false });

    await flushPromises();

    const complete = mount(Fluxdown, { props: { text: source, build: { tex: true } } });

    await flushPromises();

    expect(getStreamingRepairSnapshot(wrapper.element)).toEqual(
      getStreamingRepairSnapshot(complete.element),
    );

    for (const text of fixture.completedText) {
      expect(getStreamingRepairText(wrapper.element)).toContain(text);
    }

    for (const selector of fixture.completedSelectors) {
      expect(wrapper.element.querySelector(selector)).not.toBeNull();
    }
  });
});
