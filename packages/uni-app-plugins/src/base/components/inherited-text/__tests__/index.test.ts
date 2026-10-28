import { mount } from '@vue/test-utils';
import { h } from 'vue';

import InheritedText from '../index.uvue';

test('exposes inherited text styles as a plain scoped-slot value', () => {
  const wrapper = mount(InheritedText, {
    props: { style: { color: '#123456', fontSize: '24px', lineHeight: '36px' } },
    slots: {
      default: ({ textStyle }) => {
        expect(Array.isArray(textStyle)).toBe(false);

        return h('text', { style: textStyle }, 'inherited');
      },
    },
  });

  expect(wrapper.get('text').attributes('style')).toContain('font-size: 24px');

  expect(wrapper.get('text').attributes('style')).toContain('line-height: 36px');
});
