import { mount } from '@vue/test-utils';

import { FormulaImage } from '..';

test('changes opacity without rebuilding the formula or retrying a failed image', async () => {
  const render = vi.fn(() => ({ src: 'data:image/svg+xml,test', width: 32, height: 24 }));

  const wrapper = mount(FormulaImage, {
    props: { tex: 'x^2', fontSize: 16, color: '#202123', render },
    attrs: { style: { opacity: 0.25 } },
    slots: { default: 'original source' },
  });

  expect(render).toHaveBeenCalledTimes(1);

  expect(wrapper.get<HTMLElement>('image').element.style.opacity).toBe('0.25');

  await wrapper.setProps({ style: { opacity: 0.75 } });

  expect(render).toHaveBeenCalledTimes(1);

  expect(wrapper.get<HTMLElement>('image').element.style.opacity).toBe('0.75');

  await wrapper.get('image').trigger('error');

  expect(wrapper.text()).toBe('original source');

  await wrapper.setProps({ style: { opacity: 1 } });

  expect(render).toHaveBeenCalledTimes(1);

  expect(wrapper.find('image').exists()).toBe(false);

  await wrapper.setProps({ tex: 'x^3' });

  expect(render).toHaveBeenCalledTimes(2);

  expect(wrapper.find('image').exists()).toBe(true);
});
