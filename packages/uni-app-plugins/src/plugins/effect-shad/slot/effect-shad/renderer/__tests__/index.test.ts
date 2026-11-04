import { mount } from '@vue/test-utils';
import { h } from 'vue';

import { ShadRenderer } from '..';
import { InheritedText } from '../../../../../../base/components/inherited-text';

// Text inside the renderer inherits its opacity, as rendered children do.
const fade = () => h(InheritedText, { text: 'fade' });

test('resumes a fade from its own start time and settles once it has finished', async () => {
  const now = vi.spyOn(performance, 'now').mockReturnValue(1100);

  const wrapper = mount(ShadRenderer, {
    props: { start: 1000, duration: 400 },
    slots: { default: fade },
  });

  const opacity = () => Number(wrapper.find<HTMLElement>('text').element.style.opacity);

  // Linear, unlike chunk's ease-out.
  expect(opacity()).toBeCloseTo(0.25);

  now.mockReturnValue(1500);

  await wrapper.setProps({ start: 1000, duration: 401 });

  expect(opacity()).toBe(1);
});

test('does not animate content that was already settled', () => {
  const wrapper = mount(ShadRenderer, {
    props: { start: -1, duration: 400 },
    slots: { default: fade },
  });

  expect(Number(wrapper.find<HTMLElement>('text').element.style.opacity)).toBe(1);
});
