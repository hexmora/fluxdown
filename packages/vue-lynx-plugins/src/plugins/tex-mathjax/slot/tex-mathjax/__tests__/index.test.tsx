import type { Element } from 'hast';

import { SlotProvider } from '@fluxdown/vue-base-plugins/base';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

import { TexMathJaxSlotPlugin } from '..';
import { createTypeOfSlot, resolveTheme, ThemeProvider } from '../../../../../base';
import { TexSlotPlugin } from '../../../../tex';

const Tex = /*#__PURE__*/ createTypeOfSlot('Tex');

const node: Element = { type: 'element', tagName: 'span', properties: {}, children: [] };

interface HarnessProps {
  tex: string;

  mode: 'inline' | 'display';

  dark: boolean;
}

const Harness = /*#__PURE__*/ defineComponent(
  (props: HarnessProps) => {
    return () => (
      <ThemeProvider value={resolveTheme(props.dark ? 'dark' : 'light')}>
        <SlotProvider plugins={[TexSlotPlugin, TexMathJaxSlotPlugin]}>
          <Tex current={node} parents={[]} render={() => null} tex={props.tex} mode={props.mode} />
        </SlotProvider>
      </ThemeProvider>
    );
  },
  { props: ['tex', 'mode', 'dark'] },
);

test('renders native SVG and updates its layout and theme', async () => {
  const view = mount(Harness, {
    props: { tex: String.raw`\frac{1}{2}`, mode: 'inline', dark: false },
  });

  expect(view.get('svg').attributes('content')).toContain('<path');

  expect(view.get('svg').attributes('accessibility-label')).toBe(String.raw`\frac{1}{2}`);

  expect(view.find('scroll-view').exists()).toBe(false);

  const previous = view.get('svg').attributes('content');

  await view.setProps({ tex: String.raw`\sqrt{x}`, mode: 'display', dark: true });

  expect(view.find('scroll-view').exists()).toBe(true);

  expect(view.get('svg').attributes('content')).not.toBe(previous);

  expect(view.get('svg').attributes('content')).toContain('color="#ececf1"');

  expect(view.find('span, div, mjx-container').exists()).toBe(false);
});

test('falls back to source and recovers as a streamed formula becomes valid', async () => {
  const view = mount(Harness, {
    props: { tex: String.raw`\frac{1`, mode: 'inline', dark: false },
  });

  expect(view.find('svg').exists()).toBe(false);

  expect(view.text()).toBe(String.raw`\frac{1`);

  await view.setProps({ tex: String.raw`\frac{1}{2}` });

  expect(view.get('svg').attributes('content')).toContain('<path');
});
