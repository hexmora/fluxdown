import { mount } from '@vue/test-utils';

import { SvgImage } from '..';

test('keeps readable fallback content when conversion or image loading fails', async () => {
  const source = { src: 'data:image/svg+xml,test', width: 32, height: 24 };

  const wrapper = mount(SvgImage, { props: { source }, slots: { default: 'original source' } });

  expect(wrapper.get('image').attributes('src')).toBe(source.src);

  expect(wrapper.get('image').attributes('style')).toContain('width: 32px');

  await wrapper.get('image').trigger('error');

  expect(wrapper.text()).toBe('original source');

  await wrapper.setProps({ source: { ...source, src: 'data:image/svg+xml,next' } });

  expect(wrapper.find('image').exists()).toBe(true);

  await wrapper.setProps({ source: null });

  expect(wrapper.text()).toBe('original source');
});
