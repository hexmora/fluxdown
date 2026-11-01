import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

import { InheritedText } from '..';
import { provideInlineFlow } from '../../inline-flow/context';

interface InlineTextProps {
  text: string;
}

const InlineText = /*#__PURE__*/ defineComponent(
  (props: InlineTextProps) => {
    provideInlineFlow();

    return () =>
      h(InheritedText, {
        text: props.text,
        style: { color: '#123456', fontSize: '24px', fontWeight: '700' },
      });
  },
  { props: ['text'] },
);

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

test('keeps mature prefix words in normal flow when another word is appended', async () => {
  const wrapper = mount(InlineText, { props: { text: 'Streaming text ' } });

  const previous = wrapper.findAll('text').map((node) => node.element);

  await wrapper.setProps({ text: 'Streaming text stays ' });

  const words = wrapper.findAll('text');

  expect(words.map((node) => node.element.textContent)).toEqual([
    'Streaming\u00a0',
    'text\u00a0',
    'stays\u00a0',
  ]);

  expect(words[0].element).toBe(previous[0]);

  expect(words[1].element).toBe(previous[1]);

  for (const word of words) {
    const style = word.element.style;

    expect(style.position).toBe('relative');

    expect(style.left).toBe('0px');

    expect(style.top).toBe('0px');

    expect(style.fontSize).toBe('24px');

    expect(style.fontWeight).toBe('700');
  }
});

test('preserves explicitly configured native text positioning', () => {
  const wrapper = mount(InheritedText, {
    props: { text: 'offset', style: { position: 'absolute', left: '2px', top: '1px' } },
  });

  const style = wrapper.get('text').element.style;

  expect(style.position).toBe('absolute');

  expect(style.left).toBe('2px');

  expect(style.top).toBe('1px');
});

test('uses explicit zero tracking by default and respects a custom value', async () => {
  const wrapper = mount(InheritedText, { props: { text: 'tracking' } });

  expect(wrapper.get('text').element.style.letterSpacing).toBe('0px');

  await wrapper.setProps({ style: { letterSpacing: '1.25px' } });

  expect(wrapper.get('text').element.style.letterSpacing).toBe('1.25px');

  await wrapper.setProps({ style: {} });

  expect(wrapper.get('text').element.style.letterSpacing).toBe('0px');
});

test('omits the default font family and inherits an explicit parent font unchanged', () => {
  const defaults = mount(InheritedText, {
    slots: {
      default: ({ textStyle }) => {
        expect(textStyle).not.toHaveProperty('fontFamily');

        return h('text', { style: textStyle }, 'default');
      },
    },
  });

  expect(defaults.get('text').element.style.fontFamily).toBe('');

  const inherited = mount(InheritedText, {
    props: { style: { fontFamily: 'ExampleFont' } },
    slots: {
      default: () => h(InheritedText, { text: 'inherited' }),
    },
  });

  expect(inherited.get('text').element.style.fontFamily).toBe('ExampleFont');
});
