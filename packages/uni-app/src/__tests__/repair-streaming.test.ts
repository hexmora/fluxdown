import { FormulaImage } from '@fluxdown/uni-app-plugins/base';
import { flushPromises, mount } from '@vue/test-utils';

import { STREAMING_REPAIR_CASES } from '../../../../scripts/testing/streaming-repair-cases';
import { Fluxdown } from '../packs/full';
import { getText } from './utils/text';

test('keeps the first Web math render free of raw TeX', async () => {
  const fixture = STREAMING_REPAIR_CASES.find((item) => item.math)!;
  const view = mount(Fluxdown, {
    props: {
      text: fixture.source,
      streaming: { smooth: false, effect: false },
      build: { tex: true },
    },
  });

  expect(getText(view.element)).not.toMatch(fixture.forbidden);

  await flushPromises();

  expect(getText(view.element)).not.toMatch(fixture.forbidden);
  expect(view.findAll('image').length).toBeGreaterThan(0);

  view.unmount();
});

test.each(STREAMING_REPAIR_CASES)('repairs each Web prefix: $name', async (fixture) => {
  const streaming = { smooth: false, effect: false } as const;
  const view = mount(Fluxdown, { props: { text: '', streaming, build: { tex: true } } });
  let prefix = '';
  let previousMath: string[] = [];

  for (const character of fixture.source) {
    prefix += character;

    await view.setProps({ text: prefix });
    await flushPromises();

    expect(getText(view.element)).not.toMatch(fixture.forbidden);

    const math = view.findAllComponents(FormulaImage).map((node) => node.props('tex'));

    for (const [index, previous] of previousMath.entries()) {
      expect(math[index]?.startsWith(previous)).toBe(true);
    }

    for (const tex of math) {
      expect(prefix).toContain(tex);
    }

    previousMath = math;
  }

  await view.setProps({ streaming: false });
  await flushPromises();

  const text = getText(view.element);
  const math = view.findAllComponents(FormulaImage).map((node) => node.props('tex'));

  if (fixture.math) {
    expect(math.length).toBeGreaterThan(0);
    expect(view.findAll('image').length).toBeGreaterThan(0);
  } else {
    for (const content of fixture.completedText) {
      expect(text).toContain(content);
    }
  }

  view.unmount();

  const fresh = mount(Fluxdown, {
    props: { text: fixture.source, streaming: false, build: { tex: true } },
  });

  await flushPromises();

  expect(getText(fresh.element)).toBe(text);
  expect(fresh.findAllComponents(FormulaImage).map((node) => node.props('tex'))).toEqual(math);

  fresh.unmount();
});
